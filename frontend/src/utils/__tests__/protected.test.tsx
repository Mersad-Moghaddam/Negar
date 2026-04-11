import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { authStore } from '../../contexts/authStore'
import { Protected } from '../hooks'

describe('Protected route', () => {
  beforeEach(() => {
    authStore.setState({ user: null, accessToken: null, refreshToken: null, hydrated: true })
  })

  it('redirects anonymous users to login', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <Protected>
                <div>private-content</div>
              </Protected>
            }
          />
          <Route path="/login" element={<div>login-screen</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('login-screen')).toBeInTheDocument()
  })
})
