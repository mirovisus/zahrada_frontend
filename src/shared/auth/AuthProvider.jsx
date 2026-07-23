import { useCallback, useEffect, useMemo, useState } from 'react'
import { login as loginRequest, register as registerRequest } from '../api/auth'
import { getMyProfile } from '../api/profile'
import { AuthContext } from './AuthContext'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

function readStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(readStoredUser)
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(Boolean(token))

  const persistSession = useCallback(({ token: authToken, ...userData }) => {
    localStorage.setItem(TOKEN_KEY, authToken)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setToken(authToken)
    setUser(userData)
  }, [])

  const refreshProfile = useCallback(async () => {
    setProfileLoading(true)
    try {
      const data = await getMyProfile()
      setProfile(data)
      return data
    } catch (error) {
      setProfile(null)
      throw error
    } finally {
      setProfileLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!token) {
      setProfile(null)
      setProfileLoading(false)
      return
    }

    refreshProfile().catch(() => {})
  }, [token, refreshProfile])

  const login = useCallback(
    async (credentials) => {
      const response = await loginRequest(credentials)
      persistSession(response)
      return response
    },
    [persistSession],
  )

  const register = useCallback(
    async (data) => {
      const response = await registerRequest(data)
      persistSession(response)
      return response
    },
    [persistSession],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      profile,
      profileLoading,
      login,
      register,
      logout,
      refreshProfile,
      isAuthenticated: Boolean(token),
    }),
    [user, token, profile, profileLoading, login, register, logout, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
