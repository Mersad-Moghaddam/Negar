import { useMutation } from '@tanstack/react-query'

import { authStore } from '../../../contexts/authStore'
import { login, register } from '../api/auth-api'

type RegisterMutationResult =
  | {
      autoLoggedIn: true
      user: Awaited<ReturnType<typeof login>>['user']
      tokens: Awaited<ReturnType<typeof login>>['tokens']
    }
  | {
      autoLoggedIn: false
    }

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
    mutationFn: async (payload: Parameters<typeof register>[0]): Promise<RegisterMutationResult> => {
      await register(payload)
      try {
        const data = await login({ email: payload.email, password: payload.password })
        return { autoLoggedIn: true, user: data.user, tokens: data.tokens }
      } catch {
        return { autoLoggedIn: false }
      }
    },
    onSuccess: (data) => {
      if (!data.autoLoggedIn) return
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken)
    }
  })
}
