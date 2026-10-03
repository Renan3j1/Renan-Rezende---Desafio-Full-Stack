import Sidebar from './components/Sidebar.jsx'
import './components/Sidebar.css'
import './App.css'
import NotesPage from './pages/NotesPage.jsx'

function App() {
  const isNotesPage = window.location.pathname === '/notas'

  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        {isNotesPage ? <NotesPage /> : <h1>HOME</h1>}
      </main>
    </div>
  )
}

export default App
