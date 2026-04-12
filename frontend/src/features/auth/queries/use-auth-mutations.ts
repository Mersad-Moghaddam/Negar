import { useMutation } from '@tanstack/react-query'

import { authStore } from '../../../contexts/authStore'
import { login, register } from '../api/auth-api'

export function useLoginMutation() {
  const setAuth = authStore((state) => state.setAuth)

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken)
    }
  })
}

export function useRegisterMutation() {
  const setAuth = authStore((state) => state.setAuth)

  return useMutation({
    mutationFn: async (payload: Parameters<typeof register>[0]) => {
      await register(payload)
      return login({ email: payload.email, password: payload.password })
    },
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken)
    }
  })
}
