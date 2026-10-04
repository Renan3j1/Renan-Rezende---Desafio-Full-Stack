import Sidebar from './components/Sidebar.jsx'
import './components/Sidebar.css'
import './App.css'
import NotesPage from './pages/NotesPage.jsx'
import AnalysisPage from './pages/AnalysisPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import HomePage from './pages/HomePage.jsx'
import HomeDashboardPage from './pages/HomeDashboardPage.jsx'
import UserHeader from './components/UserHeader.jsx'

function App() {
  const isLandingPage = window.location.pathname === '/'
  const isHomePage = window.location.pathname === '/home'
  const isNotesPage = window.location.pathname === '/notas'
  const isAnalysisPage = window.location.pathname === '/analise'
  const isHistoryPage = window.location.pathname === '/historico'

  if (isLandingPage) return <HomePage />

  const accessToken = sessionStorage.getItem('access_token')

  if (!accessToken) {
    window.location.replace('/')
    return null
  }

  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <UserHeader accessToken={accessToken} />
        {isHomePage ? (
          <HomeDashboardPage />
        ) : isNotesPage ? (
          <NotesPage />
        ) : isAnalysisPage ? (
          <AnalysisPage />
        ) : isHistoryPage ? (
          <HistoryPage />
        ) : (
          <HomePage />
        )}
      </main>
    </div>
  )
}

export default App
