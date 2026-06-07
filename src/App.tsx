import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SettingsProvider } from './contexts/SettingsContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Assignments from './pages/Assignments'
import Exams from './pages/Exams'
import Reminders from './pages/Reminders'
import Calendar from './pages/Calendar'
import Classes from './pages/Classes'
import ClassDetail from './pages/ClassDetail'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <SettingsProvider>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/assignments" element={<Assignments />} />
                      <Route path="/exams" element={<Exams />} />
                      <Route path="/reminders" element={<Reminders />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/classes" element={<Classes />} />
                      <Route path="/classes/:classId" element={<ClassDetail />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </SettingsProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App