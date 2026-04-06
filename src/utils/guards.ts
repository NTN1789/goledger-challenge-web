import type { AssetRecord, JsonValue } from '../types/assets'

export function isPlainObject(value: unknown) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function asObject(value: unknown) {
  return isPlainObject(value) ? (value as Record<string, JsonValue>) : null
}

export function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null
}

export function asAssetRecord(value: unknown) {
  return isPlainObject(value) ? (value as AssetRecord) : null
}
