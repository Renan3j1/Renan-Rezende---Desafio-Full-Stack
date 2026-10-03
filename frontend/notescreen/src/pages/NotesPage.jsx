import { useEffect, useState } from 'react'
import './NotesPage.css'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

function formatDate(value) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export default function NotesPage() {
  const [notes, setNotes] = useState([])
  const [filters, setFilters] = useState({
    site: '',
    equipment: '',
    startDate: '',
    endDate: '',
  })
  const [appliedFilters, setAppliedFilters] = useState(filters)
  const [page, setPage] = useState(1)
  const [pageInput, setPageInput] = useState('1')
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadNotes() {
      setLoading(true)
      setError('')

      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      })
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value) params.set(key, value)
      })

      try {
        const response = await fetch(`/api/v1/notes?${params}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`A API respondeu com erro (${response.status}).`)
        }
        const data = await response.json()
        setNotes(data.items)
        setHasNext(data.has_next)
        setTotalPages(data.total_pages)
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || 'Não foi possível carregar as notas.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadNotes()
    return () => controller.abort()
  }, [appliedFilters, page, pageSize])

  function handleFilterChange(event) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [event.target.name]: event.target.value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setPage(1)
    setPageInput('1')
    setAppliedFilters(filters)
  }

  function handlePageSubmit(event) {
    event.preventDefault()
    const requestedPage = Number(pageInput)
    if (
      Number.isInteger(requestedPage) &&
      requestedPage >= 1 &&
      requestedPage <= totalPages
    ) {
      setPage(requestedPage)
    }
  }

  function changePage(nextPage) {
    setPage(nextPage)
    setPageInput(String(nextPage))
  }

  function handlePageSizeChange(event) {
    setPageSize(Number(event.target.value))
    changePage(1)
  }

  function goToLastPage() {
    changePage(totalPages)
  }

  return (
    <section className="notes-page">
      <h1>Notas</h1>

      <form className="notes-filters" onSubmit={handleSubmit}>
        <label>
          Site
          <input
            name="site"
            value={filters.site}
            onChange={handleFilterChange}
            placeholder="Filtrar por site"
          />
        </label>
        <label>
          Equipamento
          <input
            name="equipment"
            value={filters.equipment}
            onChange={handleFilterChange}
            placeholder="Filtrar por equipamento"
          />
        </label>
        <label>
          Data inicial
          <input
            name="startDate"
            type="date"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
        </label>
        <label>
          Data final
          <input
            name="endDate"
            type="date"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </label>
        <button type="submit" disabled={loading}>
          Filtrar
        </button>
      </form>

      {error && <p className="notes-message notes-error">{error}</p>}
      {loading && <p className="notes-message">Carregando notas...</p>}

      {!loading && !error && notes.length === 0 && (
        <p className="notes-message">Nenhuma nota encontrada.</p>
      )}

      {!error && notes.length > 0 && (
        <div className="notes-table-wrapper">
          <table className="notes-table">
            <thead>
              <tr>
                <th>Site</th>
                <th>Equipamento</th>
                <th>Monitoramento</th>
                <th>Data</th>
                <th>Autor</th>
                <th>Mensagem</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note) => (
                <tr key={note.id}>
                  <td>{note.site || '-'}</td>
                  <td>{note.equipment || '-'}</td>
                  <td>{note.variable || '-'}</td>
                  <td>{formatDate(note.timestamp)}</td>
                  <td>{note.author || '-'}</td>
                  <td>{note.message || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!error && (
        <nav className="notes-pagination" aria-label="Paginação das notas">
          <label>
            Linhas por página
            <select value={pageSize} onChange={handlePageSizeChange} disabled={loading}>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => changePage(1)}
            disabled={page === 1 || loading}
            aria-label="Ir para a primeira página"
          >
            <img className="notes-pagination-double-arrow notes-pagination-back" src="/double-arrow.svg" alt="" />
          </button>
          <button
            type="button"
            onClick={() => changePage(page - 1)}
            disabled={page === 1 || loading}
            aria-label="Página anterior"
          >
            <img className="notes-pagination-back" src="/chevron.svg" alt="" />
          </button>
          <form onSubmit={handlePageSubmit}>
            <label>
              Página
              <input
                type="number"
                min="1"
                max={totalPages}
                step="1"
                value={pageInput}
                onChange={(event) => setPageInput(event.target.value)}
                disabled={loading}
              />
            </label>
            <button type="submit" disabled={loading || Number(pageInput) > totalPages}>
              Ir
            </button>
          </form>
          <button
            type="button"
            onClick={() => changePage(page + 1)}
            disabled={!hasNext || loading}
            aria-label="Próxima página"
          >
            <img src="/chevron.svg" alt="" />
          </button>
          <button
            type="button"
            onClick={goToLastPage}
            disabled={page >= totalPages || loading}
            aria-label="Ir para a última página"
          >
            <img
              className="notes-pagination-double-arrow"
              src="/double-arrow.svg"
              alt=""
            />
          </button>
        </nav>
      )}
    </section>
  )
}
