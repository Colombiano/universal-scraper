import { Link, useLocation } from 'react-router-dom'
import { Globe, Menu, X, Zap, BookOpen, BarChart3, Home } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/scraper', label: 'Scraper', icon: Zap },
  { path: '/analysis', label: 'Analise', icon: BarChart3 },
  { path: '/docs', label: 'Documentacao', icon: BookOpen },
]

export default function Header() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Universal Scraper
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl animate-fade-in">
          <nav className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
