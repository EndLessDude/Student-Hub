import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Settings, LogOut, Menu, X, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/assignments', label: 'Assignments' },
    { path: '/exams', label: 'Exams' },
    { path: '/reminders', label: 'Reminders' },
    { path: '/calendar', label: 'Calendar' },
  ]

  const active = (path: string) => location.pathname === path

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">SH</span>
              </div>
              <span className="hidden sm:inline font-bold text-base text-gray-900 tracking-tight">
                StudentHub
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active(item.path)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-1">
              <Link
                to="/settings"
                className={`p-2 rounded-lg transition-colors ${
                  active('/settings')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                }`}
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>

              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full">
                <User className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500 max-w-28 truncate">
                  {currentUser?.email?.split('@')[0]}
                </span>
              </div>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileOpen && (
            <div className="md:hidden pb-3 pt-1 space-y-0.5 border-t border-gray-100">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active(item.path)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

export default Layout