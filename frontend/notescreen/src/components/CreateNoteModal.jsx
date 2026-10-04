import { useState } from 'react'
import './CreateNoteModal.css'

const EMPTY_NOTE = {
  site: '',
  equipment: '',
  variable: '',
  timestamp: '',
  author: '',
  message: '',
}

export default function CreateNoteModal({ onCreated, buttonClassName = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [note, setNote] = useState(EMPTY_NOTE)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(event) {
    setNote((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function createNote(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/v1/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      })
      const responseText = await response.text()
      let data
      try {
        data = JSON.parse(responseText)
      } catch {
        data = responseText
      }

      if (!response.ok) {
        throw new Error(
          data?.detail || `A API respondeu com erro (${response.status}).`,
        )
      }
      if (!data || typeof data !== 'object' || !data.id) {
        throw new Error(
          typeof data === 'string' ? data : 'A API não confirmou a criação da nota.',
        )
      }

      setNote(EMPTY_NOTE)
      setIsOpen(false)
      setSuccess('Nota criada com sucesso.')
      onCreated?.(data)
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível criar a nota.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        className={buttonClassName}
        type="button"
        onClick={() => {
          setError('')
          setSuccess('')
          setIsOpen(true)
        }}
      >
        Criar nota
      </button>
      {success && <p className="create-note-success" role="status">{success}</p>}

      {isOpen && (
        <div
          className="create-note-modal-backdrop"
          onClick={() => !saving && setIsOpen(false)}
        >
          <section
            className="create-note-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-note-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="create-note-title">Criar nota</h2>
            <form className="create-note-form" onSubmit={createNote}>
              <label>
                Site
                <input name="site" value={note.site} onChange={handleChange} required />
              </label>
              <label>
                Equipamento
                <input
                  name="equipment"
                  value={note.equipment}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Monitoramento
                <input
                  name="variable"
                  value={note.variable}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Data
                <input
                  name="timestamp"
                  type="date"
                  value={note.timestamp}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Autor
                <input name="author" value={note.author} onChange={handleChange} required />
              </label>
              <label>
                Mensagem
                <textarea
                  name="message"
                  value={note.message}
                  onChange={handleChange}
                  required
                />
              </label>
              {error && <p className="create-note-error" role="alert">{error}</p>}
              <div className="create-note-actions">
                <button type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar nota'}
                </button>
                <button
                  type="button"
                  className="create-note-cancel"
                  onClick={() => setIsOpen(false)}
                  disabled={saving}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  )
}
