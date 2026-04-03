import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Book, BookFormData } from '../types'
import { apiUrl } from '../api/api'
import { formatCurrency } from '../api/format'

type AdminBooksPageProps = {
  onNavigate: (path: string) => void
}

const emptyBookForm: BookFormData = {
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  pageCount: 1,
  price: 0,
}

export function AdminBooksPage({ onNavigate }: AdminBooksPageProps) {
  const [books, setBooks] = useState<Book[]>([])
  const [formData, setFormData] = useState<BookFormData>(emptyBookForm)
  const [editingBookId, setEditingBookId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    void loadBooks()
  }, [])

  async function loadBooks() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(apiUrl('/books/all'))

      if (!response.ok) {
        throw new Error('The admin book list could not be loaded.')
      }

      const data: Book[] = await response.json()
      setBooks(data)
    } catch {
      setError('The admin book list could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  function updateForm<K extends keyof BookFormData>(field: K, value: BookFormData[K]) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function startEdit(book: Book) {
    setEditingBookId(book.bookId)
    setSuccessMessage('')
    setError('')
    setFormData({
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      isbn: book.isbn,
      classification: book.classification,
      category: book.category,
      pageCount: book.pageCount,
      price: book.price,
    })
  }

  function resetForm() {
    setEditingBookId(null)
    setFormData(emptyBookForm)
  }

  async function submitBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccessMessage('')

    const payload = {
      ...formData,
      pageCount: Number(formData.pageCount),
      price: Number(formData.price),
    }

    const url = editingBookId === null ? apiUrl('/books') : apiUrl(`/books/${editingBookId}`)
    const method = editingBookId === null ? 'POST' : 'PUT'

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'The book could not be saved.')
      }

      await loadBooks()
      resetForm()
      setSuccessMessage(
        editingBookId === null ? 'Book added successfully.' : 'Book updated successfully.',
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The book could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteBook(bookId: number) {
    setError('')
    setSuccessMessage('')

    try {
      const response = await fetch(apiUrl(`/books/${bookId}`), {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('The book could not be deleted.')
      }

      if (editingBookId === bookId) {
        resetForm()
      }

      await loadBooks()
      setSuccessMessage('Book deleted successfully.')
    } catch {
      setError('The book could not be deleted.')
    }
  }

  return (
    <section className="container pb-5">
      <div className="row g-4 align-items-start">
        <div className="col-xl-4">
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="card-header bg-dark text-white p-4 border-0">
              <h2 className="h4 mb-1">{editingBookId === null ? 'Add Book' : 'Edit Book'}</h2>
              <p className="mb-0 text-white-50">
                Create a new record or update an existing title in the database.
              </p>
            </div>

            <div className="card-body p-4">
              <form onSubmit={submitBook}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Title</label>
                  <input
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => updateForm('title', e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Author</label>
                  <input
                    className="form-control"
                    value={formData.author}
                    onChange={(e) => updateForm('author', e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Publisher</label>
                  <input
                    className="form-control"
                    value={formData.publisher}
                    onChange={(e) => updateForm('publisher', e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">ISBN</label>
                  <input
                    className="form-control"
                    value={formData.isbn}
                    onChange={(e) => updateForm('isbn', e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Classification</label>
                  <input
                    className="form-control"
                    value={formData.classification}
                    onChange={(e) => updateForm('classification', e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Category</label>
                  <input
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => updateForm('category', e.target.value)}
                    required
                  />
                </div>

                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="form-label fw-semibold">Page Count</label>
                    <input
                      className="form-control"
                      type="number"
                      min="1"
                      value={formData.pageCount}
                      onChange={(e) => updateForm('pageCount', Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label fw-semibold">Price</label>
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => updateForm('price', Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                {error ? <div className="alert alert-danger mt-3 mb-0">{error}</div> : null}
                {successMessage ? (
                  <div className="alert alert-success mt-3 mb-0">{successMessage}</div>
                ) : null}

                <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
                  <button className="btn btn-dark" type="submit" disabled={saving}>
                    {saving ? 'Saving...' : editingBookId === null ? 'Add Book' : 'Update Book'}
                  </button>
                  <button
                    className="btn btn-outline-dark"
                    type="button"
                    onClick={resetForm}
                  >
                    Clear Form
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-xl-8">
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="bg-dark text-light p-4 p-md-5">
              <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                <div>
                  <h2 className="h3 mb-2">Admin Books</h2>
                  <p className="mb-0 text-light-emphasis">
                    Add, edit, and delete books directly from the database.
                  </p>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-light" onClick={() => onNavigate('/')}>
                    Catalog
                  </button>
                  <button className="btn btn-warning" onClick={() => onNavigate('/cart')}>
                    Cart
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 p-md-4">
              {loading ? (
                <div className="alert alert-secondary mb-0">Loading books...</div>
              ) : error && books.length === 0 ? (
                <div className="alert alert-danger mb-0">{error}</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover align-middle mb-0">
                    <thead className="table-warning">
                      <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.map((book) => (
                        <tr key={book.bookId}>
                          <td className="fw-semibold">{book.title}</td>
                          <td>{book.author}</td>
                          <td>{book.category}</td>
                          <td>{formatCurrency(book.price)}</td>
                          <td>
                            <div className="d-flex flex-wrap gap-2">
                              <button
                                className="btn btn-sm btn-outline-dark"
                                onClick={() => startEdit(book)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => deleteBook(book.bookId)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
