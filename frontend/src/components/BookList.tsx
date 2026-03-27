import { useEffect, useRef, useState } from 'react'
import type { Book, BooksResponse, CartItem } from '../types'

const pageSizeOptions = [5, 10, 15]
const visiblePageButtonCount = 5
const cartStorageKey = 'bookstore-cart'
const browseStateStorageKey = 'bookstore-browse-state'

type BrowseState = {
  category: string
  pageNum: number
  pageSize: number
  sortBy: string
}

function readSessionStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback
  }

  const savedValue = window.sessionStorage.getItem(key)

  if (!savedValue) {
    return fallback
  }

  try {
    return JSON.parse(savedValue) as T
  } catch {
    return fallback
  }
}

function formatCurrency(value: number) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}

export function BookList() {
  const initialBrowseState = readSessionStorage<BrowseState>(browseStateStorageKey, {
    category: 'All',
    pageNum: 1,
    pageSize: 5,
    sortBy: 'title',
  })

  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [pageSize, setPageSize] = useState(initialBrowseState.pageSize)
  const [pageNum, setPageNum] = useState(initialBrowseState.pageNum)
  const [sortBy, setSortBy] = useState(initialBrowseState.sortBy)
  const [selectedCategory, setSelectedCategory] = useState(initialBrowseState.category)
  const [totalNumBooks, setTotalNumBooks] = useState(0)
  const [cart, setCart] = useState<CartItem[]>(
    readSessionStorage<CartItem[]>(cartStorageKey, []),
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoryError, setCategoryError] = useState('')
  const inventoryRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadCategories() {
      setCategoryError('')

      try {
        const response = await fetch('/categories', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('The category list could not be loaded.')
        }

        const data: string[] = await response.json()
        setCategories(['All', ...data])
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }

        setCategoryError('The category list could not be loaded.')
      }
    }

    loadCategories()

    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadBooks() {
      setLoading(true)
      setError('')

      try {
        const params = new URLSearchParams({
          pageSize: pageSize.toString(),
          pageNum: pageNum.toString(),
          sortBy,
        })

        if (selectedCategory !== 'All') {
          params.set('category', selectedCategory)
        }

        const response = await fetch(`/books?${params.toString()}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('The bookstore data could not be loaded.')
        }

        const data: BooksResponse = await response.json()
        setBooks(data.books)
        setTotalNumBooks(data.totalNumBooks)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }

        setError('The bookstore data could not be loaded.')
      } finally {
        setLoading(false)
      }
    }

    loadBooks()

    return () => controller.abort()
  }, [pageNum, pageSize, selectedCategory, sortBy])

  useEffect(() => {
    window.sessionStorage.setItem(
      browseStateStorageKey,
      JSON.stringify({
        category: selectedCategory,
        pageNum,
        pageSize,
        sortBy,
      }),
    )
  }, [pageNum, pageSize, selectedCategory, sortBy])

  useEffect(() => {
    window.sessionStorage.setItem(cartStorageKey, JSON.stringify(cart))
  }, [cart])

  const totalPages = Math.max(1, Math.ceil(totalNumBooks / pageSize))
  const startPage = Math.max(1, pageNum - Math.floor(visiblePageButtonCount / 2))
  const endPage = Math.min(totalPages, startPage + visiblePageButtonCount - 1)
  const pageButtons = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  )

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartSubtotal = cart.reduce((sum, item) => sum + item.book.price * item.quantity, 0)

  function addToCart(book: Book) {
    const currentBrowseState = {
      category: selectedCategory,
      pageNum,
      pageSize,
      sortBy,
    }

    window.sessionStorage.setItem(
      browseStateStorageKey,
      JSON.stringify(currentBrowseState),
    )

    setCart((currentCart) => {
      const existingBook = currentCart.find((item) => item.book.bookId === book.bookId)

      if (existingBook) {
        return currentCart.map((item) =>
          item.book.bookId === book.bookId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [...currentCart, { book, quantity: 1 }]
    })
  }

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

  function continueShopping() {
    const savedState = readSessionStorage<BrowseState>(browseStateStorageKey, {
      category: 'All',
      pageNum: 1,
      pageSize: 5,
      sortBy: 'title',
    })

    setSelectedCategory(savedState.category)
    setPageNum(savedState.pageNum)
    setPageSize(savedState.pageSize)
    setSortBy(savedState.sortBy)

    inventoryRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <section className="container pb-5">
      <div className="row g-4 align-items-start">
        <div className="col-lg-4 col-xl-3">
          {/* Bootstrap feature: sticky-top keeps the sidebar visible while scrolling */}
          <aside className="sticky-top pt-lg-3">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4">
              <div className="card-header bg-dark text-white p-4 border-0">
                <h2 className="h4 mb-1">Browse Books</h2>
                <p className="mb-0 text-white-50">
                  Filter the catalog and update the page count automatically.
                </p>
              </div>
              <div className="card-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold" htmlFor="categoryFilter">
                    Category
                  </label>
                  <select
                    id="categoryFilter"
                    className="form-select"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value)
                      setPageNum(1)
                    }}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {categoryError ? (
                    <div className="text-danger small mt-2">{categoryError}</div>
                  ) : null}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold" htmlFor="pageSize">
                    Results per page
                  </label>
                  <select
                    id="pageSize"
                    className="form-select"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value))
                      setPageNum(1)
                    }}
                  >
                    {pageSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-0">
                  <label className="form-label fw-semibold" htmlFor="sortBy">
                    Sort by title
                  </label>
                  <select
                    id="sortBy"
                    className="form-select"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value)
                      setPageNum(1)
                    }}
                  >
                    <option value="title">Title A-Z</option>
                    <option value="title_desc">Title Z-A</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-header bg-warning-subtle p-4 border-0 d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="h5 mb-1">Cart Summary</h3>
                  <p className="mb-0 text-secondary">Saved for this session</p>
                </div>
                {/* Bootstrap feature: badge highlights the cart item count */}
                <span className="badge text-bg-dark rounded-pill px-3 py-2">
                  {totalCartItems} items
                </span>
              </div>
              <div className="card-body p-4">
                {cart.length === 0 ? (
                  <p className="text-secondary mb-0">
                    Your cart is empty. Add a book from the list to get started.
                  </p>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table align-middle mb-3">
                        <thead>
                          <tr>
                            <th>Book</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cart.map((item) => (
                            <tr key={item.book.bookId}>
                              <td className="fw-semibold">{item.book.title}</td>
                              <td style={{ minWidth: '6rem' }}>
                                <input
                                  className="form-control form-control-sm"
                                  type="number"
                                  min="0"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateQuantity(
                                      item.book.bookId,
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              </td>
                              <td>{formatCurrency(item.book.price)}</td>
                              <td>{formatCurrency(item.book.price * item.quantity)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="d-flex justify-content-between align-items-center border-top pt-3">
                      <span className="fw-semibold">Total</span>
                      <span className="fw-bold">{formatCurrency(cartSubtotal)}</span>
                    </div>

                    <button
                      className="btn btn-outline-dark w-100 mt-3"
                      onClick={continueShopping}
                    >
                      Continue Shopping
                    </button>
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>

        <div className="col-lg-8 col-xl-9">
          <div
            ref={inventoryRef}
            className="rounded-4 border-0 shadow-lg overflow-hidden"
          >
            <div className="bg-dark text-light p-4 p-md-5">
              <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                <div>
                  <h2 className="h3 mb-2">Book inventory</h2>
                  <p className="mb-0 text-light-emphasis">
                    {totalNumBooks} books in{' '}
                    {selectedCategory === 'All' ? 'the full catalog' : selectedCategory}
                  </p>
                </div>
                <div className="text-md-end">
                  <p className="mb-2 small text-uppercase text-light-emphasis">
                    Cart snapshot
                  </p>
                  {/* Bootstrap feature: badge highlights the current cart summary */}
                  <span className="badge text-bg-warning rounded-pill px-3 py-2 fs-6">
                    {totalCartItems} items | {formatCurrency(cartSubtotal)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 p-md-4">
              {loading ? (
                <div className="alert alert-secondary mb-0">Loading books...</div>
              ) : error ? (
                <div className="alert alert-danger mb-0">{error}</div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-striped table-hover align-middle mb-0">
                      <thead className="table-warning">
                        <tr>
                          <th>Title</th>
                          <th>Author</th>
                          <th>Publisher</th>
                          <th>ISBN</th>
                          <th>Classification</th>
                          <th>Category</th>
                          <th>Pages</th>
                          <th>Price</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {books.map((book) => (
                          <tr key={book.bookId}>
                            <td className="fw-semibold">{book.title}</td>
                            <td>{book.author}</td>
                            <td>{book.publisher}</td>
                            <td>{book.isbn}</td>
                            <td>{book.classification}</td>
                            <td>{book.category}</td>
                            <td>{book.pageCount}</td>
                            <td>{formatCurrency(book.price)}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-dark"
                                onClick={() => addToCart(book)}
                              >
                                Add to Cart
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mt-4">
                    <p className="mb-0 text-secondary">
                      Page {pageNum} of {totalPages}
                    </p>

                    <div className="d-flex flex-wrap gap-2">
                      <button
                        className="btn btn-outline-dark"
                        disabled={pageNum === 1}
                        onClick={() => setPageNum((currentPage) => currentPage - 1)}
                      >
                        Previous
                      </button>

                      {pageButtons.map((page) => (
                        <button
                          key={page}
                          className={`btn ${page === pageNum ? 'btn-dark' : 'btn-outline-dark'}`}
                          onClick={() => setPageNum(page)}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        className="btn btn-outline-dark"
                        disabled={pageNum === totalPages}
                        onClick={() => setPageNum((currentPage) => currentPage + 1)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
