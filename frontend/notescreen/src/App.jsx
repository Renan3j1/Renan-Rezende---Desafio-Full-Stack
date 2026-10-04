import Sidebar from './components/Sidebar.jsx'
import './components/Sidebar.css'
import './App.css'
import NotesPage from './pages/NotesPage.jsx'
import AnalysisPage from './pages/AnalysisPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import HomePage from './pages/HomePage.jsx'

function App() {
  const isNotesPage = window.location.pathname === '/notas'
  const isAnalysisPage = window.location.pathname === '/analise'
  const isHistoryPage = window.location.pathname === '/historico'

  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        {isNotesPage ? (
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
