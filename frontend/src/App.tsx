import './App.css'
import { BookList } from './components/BookList'

function App() {
  return (
    <main className="app-shell">
      <section className="hero-banner container">
        <div className="row">
          <div className="col-lg-8">
            <p className="eyebrow">Mission 12 Bookstore</p>
            <h1 className="display-4 fw-semibold">Browse the catalog</h1>
            <p className="hero-copy">
              Explore the inventory, filter by category, and manage your cart without
              losing your place.
            </p>
          </div>
        </div>
      </section>

      <BookList />
    </main>
  )
}

export default App
