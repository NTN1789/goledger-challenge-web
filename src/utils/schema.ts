import { DEFAULT_ASSET_TYPES, RESERVED_FIELDS } from '../constants/assets'
import type { AssetRecord, JsonValue, SchemaDefinition, SchemaField } from '../types/assets'
import { asObject, isPlainObject, readString } from './guards'
import { humanizeField } from './formatters'

export function deriveSchemaFields(
  schema: SchemaDefinition | null,
  records: AssetRecord[],
  assetType: string,
) {
  const fieldsFromSchema = extractFieldsFromSchema(schema)
  if (fieldsFromSchema.length > 0) return fieldsFromSchema

  const discovered = new Map<string, SchemaField>()
  for (const record of records) {
    for (const [key, value] of Object.entries(record)) {
      if (RESERVED_FIELDS.has(key)) continue
      discovered.set(key, {
        key,
        label: humanizeField(key),
        dataType: guessDataType(value),
        required: false,
        isKey: false,
        readOnly: false,
      })
    }
  }

  if (discovered.size > 0) return [...discovered.values()]

  return [
    { key: 'title', label: 'Title', dataType: 'string', required: false, isKey: true, readOnly: false },
    { key: 'description', label: 'Description', dataType: 'string', required: false, isKey: false, readOnly: false },
    {
      key: `${assetType}Code`,
      label: humanizeField(`${assetType}Code`),
      dataType: 'string',
      required: false,
      isKey: false,
      readOnly: false,
    },
  ]
}

export function extractFieldsFromSchema(schema: SchemaDefinition | null) {
  if (!schema) return []

  const candidates = [
    schema.props,
    schema.properties,
    schema.attributes,
    schema.fields,
    schema.assetProps,
  ]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      const fields = candidate
        .map<SchemaField | null>((item) => {
          const field = asObject(item)
          if (!field) return null

          const key =
            readString(field.tag) ??
            readString(field.name) ??
            readString(field.key) ??
            readString(field.label)

          if (!key || RESERVED_FIELDS.has(key)) return null

          return {
            key,
            label: readString(field.label) ?? humanizeField(key),
            dataType: readString(field.dataType) ?? 'string',
            required: Boolean(field.required),
            isKey: Boolean(field.isKey),
            readOnly: Boolean(field.readOnly),
          } satisfies SchemaField
        })
        .filter((field): field is SchemaField => field !== null)

      if (fields.length > 0) return fields
    }

    if (isPlainObject(candidate)) {
      const candidateObject = candidate as Record<string, unknown>
      const fields = Object.entries(candidateObject)
        .filter(([key]) => !RESERVED_FIELDS.has(key))
        .map(([key, value]) => {
          const field = asObject(value)
          return {
            key,
            label: readString(field?.label) ?? humanizeField(key),
            dataType: readString(field?.dataType) ?? guessDataType(value),
            required: Boolean(field?.required),
            isKey: Boolean(field?.isKey),
            readOnly: Boolean(field?.readOnly),
          } satisfies SchemaField
        })

      if (fields.length > 0) return fields
    }
  }

  return []
}

export function extractAssetTypes(data: unknown): string[] {
  const list: string[] = []

  if (Array.isArray(data)) {
    for (const item of data) {
      const objectItem = asObject(item)
      const tag =
        readString(objectItem?.tag) ??
        readString(objectItem?.name) ??
        readString(objectItem?.assetType)

      if (tag) list.push(tag)
    }
  }

  if (isPlainObject(data)) {
    const objectData = data as Record<string, unknown>
    const arrayCandidates = [
      objectData.assetTypes,
      objectData.types,
      objectData.assets,
      objectData.items,
    ]

    for (const candidate of arrayCandidates) {
      const nested = extractAssetTypes(candidate)
      if (nested.length > 0) return nested
    }

    const keyCandidates = Object.keys(objectData).filter(
      (key) => !key.startsWith('@') && isPlainObject(objectData[key]),
    )
    if (keyCandidates.length > 0) return keyCandidates
  }

  return Array.from(new Set(list.length ? list : DEFAULT_ASSET_TYPES))
}

export function extractRecords(data: unknown): AssetRecord[] {
  if (!data) return []

  if (Array.isArray(data)) {
    return data
      .map((item) => asObject(item))
      .filter((item): item is AssetRecord => Boolean(item))
  }

  const objectData = asObject(data)
  if (!objectData) return []

  const nestedCandidates = [
    objectData.docs,
    objectData.items,
    objectData.result,
    objectData.results,
    objectData.data,
    objectData.records,
    objectData.rows,
    objectData.assets,
  ]

  for (const candidate of nestedCandidates) {
    const nested = extractRecords(candidate)
    if (nested.length > 0) return nested
  }

  return objectData['@assetType'] ? [objectData] : []
}

export function buildFormData(record: AssetRecord) {
  return Object.entries(record).reduce<Record<string, string>>((acc, [key, value]) => {
    if (!RESERVED_FIELDS.has(key)) {
      acc[key] = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
    }
    return acc
  }, {})
}

export function parseFormData(formData: Record<string, string>) {
  const parsed: Record<string, JsonValue> = {}
  for (const [key, rawValue] of Object.entries(formData)) {
    const value = rawValue.trim()
    if (!value) continue
    parsed[key] = parseFieldValue(value)
  }
  return parsed
}

export function parseFieldValue(value: string): JsonValue {
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null
  if (!Number.isNaN(Number(value)) && value !== '') return Number(value)
  if (
    (value.startsWith('{') && value.endsWith('}')) ||
    (value.startsWith('[') && value.endsWith(']'))
  ) {
    try {
      return JSON.parse(value) as JsonValue
    } catch {
      return value
    }
  }
  return value
}

export function guessDataType(value: unknown) {
  if (Array.isArray(value)) return '[]@object'
  if (value === null) return 'null'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'object') return '@object'
  return 'string'
}
