import { ASSET_TYPE_ALIASES, PRETTY_LABELS } from '../constants/assets'
import type { AssetRecord, JsonValue } from '../types/assets'
import { readString } from './guards'

export function humanizeAssetType(assetType: string) {
  return PRETTY_LABELS[assetType] ?? humanizeField(assetType)
}

export function normalizeAssetType(assetType: string) {
  return ASSET_TYPE_ALIASES[assetType] ?? assetType
}

export function humanizeField(value: string) {
  return value
    .replace(/^@/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function formatValue(value: JsonValue) {
  return typeof value === 'string' ? value : JSON.stringify(value)
}

export function formatError(error: unknown) {
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'
}

export function stringifyForDisplay(value: unknown) {
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function getRecordKey(record: AssetRecord) {
  return (
    readString(record['@key']) ??
    readString(record.key) ??
    readString(record.id) ??
    readString(record.code) ??
    ''
  )
}

export function getRecordTitle(record: AssetRecord, index: number) {
  return (
    readString(record.title) ??
    readString(record.name) ??
    readString(record.label) ??
    readString(record.code) ??
    `Record ${index + 1}`
  )
}
