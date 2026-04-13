import type { User } from '../../shared/types/user'

// Return type matches ShellDemo's Page union (post-auth pages only)
type PostAuthPage =
  | { mode: 'sell'; view: 'listings' }
  | { mode: 'sell'; view: 'createListing' }
  | { mode: 'buy'; view: 'activation' }

export function postLoginRoute(user: User): PostAuthPage {
  if (user.role === 'seller') {
    return { mode: 'sell', view: 'createListing' }
  }
  if (user.role === 'principal' || user.role === 'broker') {
    return { mode: 'buy', view: 'activation' }
  }
  // Fallback
  return { mode: 'sell', view: 'listings' }
}

// NOTE — Returning user logic (for production, not prototype):
// buyer with active deals → buy mode
// seller with active listings → sell mode
// both → last visited mode, persisted in session
