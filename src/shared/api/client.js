const BASE_URL = import.meta.env.VITE_API_URL

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export class ApiError extends Error {
  constructor({ status, error, message, path, fieldErrors }) {
    super(message || error || 'Požadavek se nezdařil')
    this.name = 'ApiError'
    this.status = status
    this.error = error
    this.path = path
    this.fieldErrors = fieldErrors
  }
}

export function normalizeFieldErrors(fieldErrors) {
  if (!fieldErrors) return {}

  if (Array.isArray(fieldErrors)) {
    return fieldErrors.reduce((acc, item) => {
      if (item?.field) acc[item.field] = Array.isArray(item.message) ? item.message[0] : item.message
      return acc
    }, {})
  }

  return Object.fromEntries(
    Object.entries(fieldErrors).map(([field, message]) => [
      field,
      Array.isArray(message) ? message[0] : message,
    ]),
  )
}

function handleUnauthorized() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)

  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

export async function apiRequest(path, options = {}) {
  const { headers, ...rest } = options
  const token = localStorage.getItem(TOKEN_KEY)

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  if (response.status === 401) {
    handleUnauthorized()
    throw new ApiError({ status: 401, message: 'Neautorizováno' })
  }

  if (response.status === 204) {
    return null
  }

  if (!response.ok) {
    let body = null
    try {
      body = await response.json()
    } catch {
      body = null
    }

    throw new ApiError({
      status: response.status,
      error: body?.error,
      message: body?.message,
      path: body?.path,
      fieldErrors: body?.fieldErrors,
    })
  }

  return response.json()
}
