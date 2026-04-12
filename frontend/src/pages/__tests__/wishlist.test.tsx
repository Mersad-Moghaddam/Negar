import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Wishlist } from '../AppPages'

const {
  wishlistQueryMock,
  addWishlistItemMutationMock,
  addWishlistLinkMutationMock,
  deleteWishlistItemMutationMock,
  toastSuccessMock,
  toastErrorMock
} = vi.hoisted(() => ({
  wishlistQueryMock: vi.fn(),
  addWishlistItemMutationMock: vi.fn(),
  addWishlistLinkMutationMock: vi.fn(),
  deleteWishlistItemMutationMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn()
}))

vi.mock('../../features/wishlist/queries/use-wishlist', () => ({
  useWishlistQuery: () => wishlistQueryMock(),
  useAddWishlistItemMutation: () => addWishlistItemMutationMock(),
  useAddWishlistLinkMutation: () => addWishlistLinkMutationMock(),
  useDeleteWishlistItemMutation: () => deleteWishlistItemMutationMock()
}))

vi.mock('../../shared/toast/toast-provider', () => ({
  useToast: () => ({
    success: toastSuccessMock,
    error: toastErrorMock
  })
}))

vi.mock('../../shared/i18n/i18n-provider', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: 'en'
  })
}))

describe('Wishlist', () => {
  beforeEach(() => {
    toastSuccessMock.mockReset()
    toastErrorMock.mockReset()
    wishlistQueryMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          id: 'item-1',
          title: 'The Pragmatic Programmer',
          author: 'Andrew Hunt',
          expectedPrice: null,
          notes: null,
          purchaseLinks: [],
          createdAt: '',
          updatedAt: ''
        }
      ]
    })
    addWishlistItemMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false
    })
    addWishlistLinkMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false
    })
    deleteWishlistItemMutationMock.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false
    })
  })

  it('renders remove action and asks for confirmation', async () => {
    const user = userEvent.setup()
    render(<Wishlist />)

    await user.click(screen.getByRole('button', { name: 'wishlist.removeAction' }))

    expect(screen.getByText('wishlist.deleteConfirm')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'common.confirm' })).toBeInTheDocument()
  })

  it('removes wishlist item and shows success feedback', async () => {
    const mutateAsyncMock = vi.fn().mockResolvedValue(undefined)
    deleteWishlistItemMutationMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false
    })

    const user = userEvent.setup()
    render(<Wishlist />)

    await user.click(screen.getByRole('button', { name: 'wishlist.removeAction' }))
    await user.click(screen.getByRole('button', { name: 'common.confirm' }))

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith('item-1')
      expect(toastSuccessMock).toHaveBeenCalledWith('wishlist.deleteSuccess')
    })
  })

  it('shows error feedback when remove fails', async () => {
    const mutateAsyncMock = vi.fn().mockRejectedValue(new Error('delete failed'))
    deleteWishlistItemMutationMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false
    })

    const user = userEvent.setup()
    render(<Wishlist />)

    await user.click(screen.getByRole('button', { name: 'wishlist.removeAction' }))
    await user.click(screen.getByRole('button', { name: 'common.confirm' }))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('wishlist.deleteError')
    })
  })
})
