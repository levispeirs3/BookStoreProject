import { useEffect, useState } from 'react'
import type { CartItem } from '../types'
import { cartStorageKey, readSessionStorage, writeSessionStorage } from '../api/storage'
import { formatCurrency } from '../api/format'

type CartPageProps = {
  onNavigate: (path: string) => void
}

export function CartPage({ onNavigate }: CartPageProps) {
  const [cart, setCart] = useState<CartItem[]>(
    readSessionStorage<CartItem[]>(cartStorageKey, []),
  )

  useEffect(() => {
    writeSessionStorage(cartStorageKey, cart)
  }, [cart])

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartSubtotal = cart.reduce((sum, item) => sum + item.book.price * item.quantity, 0)

  function updateQuantity(bookId: number, quantity: number) {
    if (quantity <= 0) {
      setCart((currentCart) => currentCart.filter((item) => item.book.bookId !== bookId))
      return
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.book.bookId === bookId ? { ...item, quantity } : item,
      ),
    )
  }

  function removeFromCart(bookId: number) {
    setCart((currentCart) => currentCart.filter((item) => item.book.bookId !== bookId))
  }

  return (
    <section className="container pb-5">
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
        <div className="bg-dark text-light p-4 p-md-5">
          <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
            <div>
              <h2 className="h3 mb-2">Your cart</h2>
              <p className="mb-0 text-light-emphasis">
                Review, update, or remove books before going back to the catalog.
              </p>
            </div>
            <span className="badge text-bg-warning rounded-pill px-3 py-2 fs-6 align-self-md-center">
              {totalCartItems} items | {formatCurrency(cartSubtotal)}
            </span>
          </div>
        </div>

        <div className="bg-white p-3 p-md-4">
          {cart.length === 0 ? (
            <div className="alert alert-secondary mb-0">
              Your cart is empty. Add a book from the catalog to get started.
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-striped align-middle mb-0">
                  <thead className="table-warning">
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.book.bookId}>
                        <td className="fw-semibold">{item.book.title}</td>
                        <td>{item.book.author}</td>
                        <td>{formatCurrency(item.book.price)}</td>
                        <td style={{ minWidth: '7rem' }}>
                          <input
                            className="form-control"
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.book.bookId, Number(e.target.value))
                            }
                          />
                        </td>
                        <td>{formatCurrency(item.book.price * item.quantity)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeFromCart(item.book.bookId)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-4">
                <span className="fw-semibold fs-5">Order total</span>
                <span className="fw-bold fs-5">{formatCurrency(cartSubtotal)}</span>
              </div>
            </>
          )}

          <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
            <button className="btn btn-outline-dark" onClick={() => onNavigate('/')}>
              Continue Shopping
            </button>
            <button className="btn btn-dark" onClick={() => onNavigate('/adminbooks')}>
              Manage Books
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
