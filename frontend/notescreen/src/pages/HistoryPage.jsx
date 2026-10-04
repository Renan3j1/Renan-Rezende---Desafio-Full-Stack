import { useEffect, useState } from 'react'
import './HistoryPage.css'

const PAGE_SIZE = 100
const EMPTY_FORM = {
  site: '',
  equipment: '',
  variable: '',
  timestamp: '',
  author: '',
  message: '',
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

async function getResponseError(response) {
  const text = await response.text()
  return text || `A API respondeu com erro (${response.status}).`
}

export default function HistoryPage() {
  const [notes, setNotes] = useState([])
  const [filters, setFilters] = useState({
    site: '',
    equipment: '',
    startDate: '',
    endDate: '',
    sort_order: 'desc',
  })
  const [appliedFilters, setAppliedFilters] = useState(filters)
  const [editingId, setEditingId] = useState(null)
  const [noteToDelete, setNoteToDelete] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadNotes() {
      setLoading(true)
      setError('')
      setNotes([])

      try {
        const allNotes = []
        let page = 1
        let hasNext = true

        while (hasNext) {
          const params = new URLSearchParams({
            page: String(page),
            page_size: String(PAGE_SIZE),
          })
          Object.entries(appliedFilters).forEach(([key, value]) => {
            if (value && key !== 'sort_order') params.set(key, value)
          })
          const response = await fetch(`/api/v1/notes?${params}`, {
            signal: controller.signal,
          })

          if (!response.ok) throw new Error(await getResponseError(response))

          const data = await response.json()
          allNotes.push(...data.items)
          hasNext = data.has_next
          page += 1
        }

        setNotes(allNotes)
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
  }, [appliedFilters, refresh])

  const sortedNotes = [...notes].sort((first, second) => {
    const firstTimestamp = new Date(first.timestamp).getTime()
    const secondTimestamp = new Date(second.timestamp).getTime()
    return appliedFilters.sort_order === 'desc'
      ? secondTimestamp - firstTimestamp
      : firstTimestamp - secondTimestamp
  })

  function handleFilterChange(event) {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function applyFilters(event) {
    event.preventDefault()
    setEditingId(null)
    setAppliedFilters(filters)
    setRefresh((current) => current + 1)
  }

  function startEditing(note) {
    setEditingId(note.id)
    setForm({
      site: note.site || '',
      equipment: note.equipment || '',
      variable: note.variable || '',
      timestamp: note.timestamp ? note.timestamp.slice(0, 10) : '',
      author: note.author || '',
      message: note.message || '',
    })
    setError('')
  }

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function saveNote(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/v1/notes/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) throw new Error(await getResponseError(response))

      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        throw new Error(await response.text())
      }

      const updatedNote = await response.json()
      setNotes((current) =>
        current.map((note) => (note.id === updatedNote.id ? updatedNote : note)),
      )
      setEditingId(null)
      setForm(EMPTY_FORM)
      setRefresh((current) => current + 1)
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível atualizar a nota.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteNote(note) {
    setDeletingId(note.id)
    setError('')
    try {
      const response = await fetch(`/api/v1/notes/${note.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error(await getResponseError(response))

      const result = await response.text()
      if (result !== 'NOTA DELETADA') throw new Error(result)
      setNotes((current) => current.filter((item) => item.id !== note.id))
      setNoteToDelete(null)
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível deletar a nota.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="history-page">
      <h1>Histórico</h1>

      <form className="history-filters" onSubmit={applyFilters}>
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
        <label>
          Ordenar por data
          <select
            name="sort_order"
            value={filters.sort_order}
            onChange={handleFilterChange}
          >
            <option value="desc">Mais recentes</option>
            <option value="asc">Mais antigas</option>
          </select>
        </label>
        <button type="submit" disabled={loading}>
          Filtrar
        </button>
      </form>

      {error && <p className="history-message history-error">{error}</p>}
      {loading && <p className="history-message">Carregando notas...</p>}
      {!loading && !error && notes.length === 0 && (
        <p className="history-message">Nenhuma nota encontrada.</p>
      )}

      <div className="history-cards">
        {sortedNotes.map((note) => (
          <article className="history-card" key={note.id}>
            <div className="history-card-heading">
              <strong>{note.site || '-'}</strong>
              <time>{formatDate(note.timestamp)}</time>
            </div>
            <p><b>Equipamento:</b> {note.equipment || '-'}</p>
            <p><b>Monitoramento:</b> {note.variable || '-'}</p>
            <p><b>Autor:</b> {note.author || '-'}</p>
            <p className="history-card-message">{note.message || '-'}</p>
            <div className="history-card-actions">
              <button type="button" onClick={() => startEditing(note)}>
                Editar
              </button>
              <button
                type="button"
                className="history-delete-button"
                onClick={() => setNoteToDelete(note)}
                disabled={deletingId === note.id}
              >
                Deletar
              </button>
            </div>
          </article>
        ))}
      </div>

      {editingId && (
        <div className="history-modal-backdrop" onClick={() => !saving && setEditingId(null)}>
          <section
            className="history-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-edit-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="history-edit-title">Editar nota</h2>
            <form className="history-edit-form" onSubmit={saveNote}>
              <label>
                Site
                <input name="site" value={form.site} onChange={handleChange} required />
              </label>
              <label>
                Equipamento
                <input name="equipment" value={form.equipment} onChange={handleChange} required />
              </label>
              <label>
                Monitoramento
                <input name="variable" value={form.variable} onChange={handleChange} required />
              </label>
              <label>
                Data
                <input
                  name="timestamp"
                  type="date"
                  value={form.timestamp}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Autor
                <input name="author" value={form.author} onChange={handleChange} required />
              </label>
              <label>
                Mensagem
                <textarea name="message" value={form.message} onChange={handleChange} required />
              </label>
              <div className="history-card-actions">
                <button type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  className="history-secondary-button"
                  onClick={() => setEditingId(null)}
                  disabled={saving}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {noteToDelete && (
        <div
          className="history-modal-backdrop"
          onClick={() => !deletingId && setNoteToDelete(null)}
        >
          <section
            className="history-modal history-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-delete-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="history-delete-title">Deletar nota?</h2>
            <p>Tem certeza de que deseja deletar esta nota? Esta ação não pode ser desfeita.</p>
            {error && <p className="history-message history-error">{error}</p>}
            <div className="history-card-actions">
              <button
                type="button"
                className="history-delete-button"
                onClick={() => deleteNote(noteToDelete)}
                disabled={deletingId === noteToDelete.id}
              >
                {deletingId === noteToDelete.id ? 'Deletando...' : 'Deletar'}
              </button>
              <button
                type="button"
                className="history-secondary-button"
                onClick={() => setNoteToDelete(null)}
                disabled={deletingId === noteToDelete.id}
              >
                Cancelar
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
