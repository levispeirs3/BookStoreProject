import './App.css'
import { BookList } from './components/BookList'

function App() {
  return (
    <main className="app-shell">
      <section className="hero-banner">
        <div>
          <p className="eyebrow">Mission 11 Bookstore</p>
          <h1 className="display-4 fw-semibold">Browse the catalog</h1>
          <p className="hero-copy">
            Explore the full bookstore inventory with server-side pagination,
            adjustable page sizes, and title sorting.
          </p>
        </div>
      </section>

      <BookList />
    </main>
  )
}

export default App
