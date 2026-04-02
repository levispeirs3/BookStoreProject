import type { BrowseState } from '../types'

export const cartStorageKey = 'bookstore-cart'
export const browseStateStorageKey = 'bookstore-browse-state'

export const defaultBrowseState: BrowseState = {
  category: 'All',
  pageNum: 1,
  pageSize: 5,
  sortBy: 'title',
}

export function readSessionStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback
  }

  const savedValue = window.sessionStorage.getItem(key)

  if (!savedValue) {
    return fallback
  }

  try {
    return JSON.parse(savedValue) as T
  } catch {
    return fallback
  }
}

export function writeSessionStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(key, JSON.stringify(value))
}
