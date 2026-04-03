const deployedApiBase =
  'https://bookstoreproject-speirs-backend-amfvarcmbfascsc9.francecentral-01.azurewebsites.net'

const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim()

export const apiBaseUrl =
  configuredApiBase && configuredApiBase.length > 0
    ? configuredApiBase.replace(/\/$/, '')
    : deployedApiBase

export function apiUrl(path: string) {
  if (import.meta.env.DEV) {
    return path
  }

  return `${apiBaseUrl}${path}`
}
