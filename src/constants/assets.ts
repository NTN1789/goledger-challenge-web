export const DEFAULT_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? '/goledger-api'
export const DEFAULT_API_USERNAME = import.meta.env.VITE_API_USERNAME ?? ''
export const DEFAULT_API_PASSWORD = import.meta.env.VITE_API_PASSWORD ?? ''

export const DEFAULT_ASSET_TYPES = ['tvShows', 'seasons', 'episodes', 'watchlist']
export const STORAGE_KEY = 'goledger-challenge-settings'

export const ASSET_TYPE_ALIASES: Record<string, string> = {
  watchlists: 'watchlist',
}

export const PRETTY_LABELS: Record<string, string> = {
  tvShows: 'TV Shows',
  seasons: 'Seasons',
  episodes: 'Episodes',
  watchlist: 'Watchlists',
  watchlists: 'Watchlists',
}

export const RESERVED_FIELDS = new Set([
  '@assetType',
  '@key',
  '_key',
  '_id',
  '_rev',
  '_txId',
  '_isDelete',
  '_timestamp',
])
