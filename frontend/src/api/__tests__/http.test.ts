import { describe, expect, it } from 'vitest'

import { parseApiError } from '../http'

describe('parseApiError', () => {
  it('classifies axios transport failures as network_error', () => {
    const error = {
      isAxiosError: true,
      request: {}
    }

    const parsed = parseApiError(error)
    expect(parsed.code).toBe('network_error')
  })

  it('does not classify HTTP responses with empty body as network errors', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 500
      }
    }

    const parsed = parseApiError(error)
    expect(parsed.code).toBe('http_error')
    expect(parsed.message).toContain('500')
  })
})
