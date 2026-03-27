export type Book = {
  bookId: number
  title: string
  author: string
  publisher: string
  isbn: string
  classification: string
  category: string
  pageCount: number
  price: number
}

export type BooksResponse = {
  books: Book[]
  totalNumBooks: number
}

export type CartItem = {
  book: Book
  quantity: number
}
