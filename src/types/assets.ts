export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export type AssetRecord = Record<string, JsonValue>
export type SchemaDefinition = Record<string, unknown>

export type SchemaField = {
  key: string
  label: string
  dataType: string
  required: boolean
  isKey?: boolean
  readOnly?: boolean
}

export type AppSettings = {
  apiBaseUrl: string
  username: string
  assetTypes: string[]
}

export type ToastTone = 'success' | 'error' | 'info'

export type ToastMessage = {
  id: number
  tone: ToastTone
  title: string
  description?: string
}

export type SelectOption = {
  label: string
  value: string
}
