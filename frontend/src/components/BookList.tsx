import { useEffect, useState } from 'react'
import type { Book, BooksResponse } from '../types'

const pageSizeOptions = [5, 10, 15]
const visiblePageButtonCount = 5

export function BookList() {
  const [books, setBooks] = useState<Book[]>([])
  const [pageSize, setPageSize] = useState(5)
  const [pageNum, setPageNum] = useState(1)
  const [sortBy, setSortBy] = useState('title')
  const [totalNumBooks, setTotalNumBooks] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
  }, [pageNum, pageSize, sortBy])

  const totalPages = Math.max(1, Math.ceil(totalNumBooks / pageSize))
  const startPage = Math.max(1, pageNum - Math.floor(visiblePageButtonCount / 2))
  const endPage = Math.min(totalPages, startPage + visiblePageButtonCount - 1)
  const pageButtons = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  )

  return (
    <section className="container pb-5">
      <div className="rounded-4 border-0 shadow-lg overflow-hidden">
        <div className="bg-dark text-light p-4 p-md-5">
          <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
            <div>
              <h2 className="h3 mb-2">Book inventory</h2>
              <p className="mb-0 text-light-emphasis">
                {totalNumBooks} total books in the catalog
              </p>
            </div>
            <div className="d-flex flex-column flex-sm-row gap-3">
              <label className="form-label mb-0">
                <span className="d-block small text-uppercase text-light-emphasis mb-1">
                  Results per page
                </span>
                <select
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
              </label>

              <label className="form-label mb-0">
                <span className="d-block small text-uppercase text-light-emphasis mb-1">
                  Sort by title
                </span>
                <select
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
              </label>
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
                        <td>{book.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
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
    </section>
  )
}
