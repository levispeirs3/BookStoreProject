import './App.css'
import { useEffect, useState } from 'react'
import { AdminBooksPage } from './components/AdminBooksPage'
import { BrowsePage } from './components/BrowsePage'
import { CartPage } from './components/CartPage'

function App() {
  const [path, setPath] = useState(() => window.location.pathname)

  function navButtonClass(targetPath: string, outlined = false) {
    const isActive = path === targetPath

    if (outlined) {
      return isActive ? 'btn btn-dark' : 'btn btn-outline-dark'
    }

    return isActive ? 'btn btn-dark' : 'btn btn-outline-dark'
  }

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)

    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function navigate(nextPath: string) {
    if (nextPath === path) {
      return
    }

    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pageContent = (() => {
    switch (path) {
      case '/cart':
        return {
          eyebrow: 'Mission 13 Bookstore',
          title: 'Review your cart',
          copy: 'Update quantities on a separate cart page, then return to the exact browsing state you left.',
          content: <CartPage onNavigate={navigate} />,
        }
      case '/adminbooks':
        return {
          eyebrow: 'Mission 13 Admin',
          title: 'Manage the catalog',
          copy: 'Add, update, and delete books in the database from a dedicated admin screen.',
          content: <AdminBooksPage onNavigate={navigate} />,
        }
      default:
        return {
          eyebrow: 'Mission 13 Bookstore',
          title: 'Browse the catalog',
          copy: 'Explore the inventory, filter by category, and manage your cart without losing your place.',
          content: <BrowsePage onNavigate={navigate} />,
        }
    }
  })()

  return (
    <main className="app-shell">
      <section className="hero-banner container">
        <div className="row">
          <div className="col-lg-8">
            <p className="eyebrow">{pageContent.eyebrow}</p>
            <h1 className="display-4 fw-semibold">{pageContent.title}</h1>
            <p className="hero-copy">{pageContent.copy}</p>
            <div className="d-flex flex-wrap gap-2 mt-3">
              <button className={navButtonClass('/')} onClick={() => navigate('/')}>
                Catalog
              </button>
              <button
                className={navButtonClass('/cart')}
                onClick={() => navigate('/cart')}
              >
                Cart
              </button>
              <button
                className={navButtonClass('/adminbooks')}
                onClick={() => navigate('/adminbooks')}
              >
                Admin Books
              </button>
            </div>
          </div>
        </div>
      </section>

      {pageContent.content}
    </main>
  )
}

export default App
