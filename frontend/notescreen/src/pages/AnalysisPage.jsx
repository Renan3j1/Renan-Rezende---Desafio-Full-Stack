import { useEffect, useState } from 'react'
import './AnalysisPage.css'

const PAGE_SIZE = 100

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

export default function AnalysisPage() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadAllNotes() {
      setLoading(true)
      setError('')

      try {
        const allNotes = []
        let page = 1
        let hasNext = true

        while (hasNext) {
          const params = new URLSearchParams({
            page: String(page),
            page_size: String(PAGE_SIZE),
          })
          const response = await fetch(`/api/v1/notes?${params}`, {
            signal: controller.signal,
          })

          if (!response.ok) {
            throw new Error(`A API respondeu com erro (${response.status}).`)
          }

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

    loadAllNotes()
    return () => controller.abort()
  }, [])

  const notesByDate = notes.reduce((history, note) => {
    const date = note.timestamp?.slice(0, 10)
    if (date) history[date] = (history[date] || 0) + 1
    return history
  }, {})

  const history = Object.entries(notesByDate).sort(([dateA], [dateB]) =>
    dateA.localeCompare(dateB),
  )
  const chart = { width: 800, height: 280, left: 52, right: 20, top: 20, bottom: 48 }
  const chartWidth = chart.width - chart.left - chart.right
  const chartHeight = chart.height - chart.top - chart.bottom
  const maxNotesInDay = Math.max(...history.map(([, count]) => count), 1)
  const chartPoints = history.map(([date, count], index) => ({
    date,
    count,
    x: chart.left + (history.length === 1 ? chartWidth / 2 : (index / (history.length - 1)) * chartWidth),
    y: chart.top + chartHeight - (count / maxNotesInDay) * chartHeight,
  }))
  const linePoints = chartPoints.map(({ x, y }) => `${x},${y}`).join(' ')
  const yAxisTicks = [...new Set([
    0,
    Math.ceil(maxNotesInDay / 3),
    Math.ceil((maxNotesInDay * 2) / 3),
    maxNotesInDay,
  ])]
  const xAxisStep = Math.max(1, Math.ceil(history.length / 6))
  const xAxisLabels = chartPoints.filter(
    (_, index) => index % xAxisStep === 0 || index === chartPoints.length - 1,
  )

  return (
    <section className="analysis-page">
      <h1>Análise</h1>

      {error && <p className="analysis-message analysis-error">{error}</p>}
      {loading && <p className="analysis-message">Carregando notas...</p>}

      {!loading && !error && (
        <>
          <article className="analysis-total">
            <span>Total de notas</span>
            <strong>{notes.length}</strong>
          </article>

          <section className="analysis-history">
            <h2>Histórico de notas por data</h2>
            {history.length === 0 ? (
              <p className="analysis-message">Nenhuma nota encontrada.</p>
            ) : (
              <svg
                className="analysis-chart"
                viewBox={`0 0 ${chart.width} ${chart.height}`}
                role="img"
                aria-label="Gráfico de linha do total de notas por data"
              >
                {yAxisTicks.map((tick) => {
                  const y = chart.top + chartHeight - (tick / maxNotesInDay) * chartHeight
                  return (
                    <g key={tick}>
                      <line
                        className="analysis-chart-grid"
                        x1={chart.left}
                        y1={y}
                        x2={chart.width - chart.right}
                        y2={y}
                      />
                      <text className="analysis-chart-label" x={chart.left - 12} y={y + 4}>
                        {tick}
                      </text>
                    </g>
                  )
                })}
                {chartPoints.length > 1 && (
                  <polyline className="analysis-chart-line" points={linePoints} />
                )}
                {chartPoints.map(({ date, count, x, y }) => (
                  <circle className="analysis-chart-dot" cx={x} cy={y} r="4" key={date}>
                    <title>{`${formatDate(date)}: ${count} notas`}</title>
                  </circle>
                ))}
                {xAxisLabels.map(({ date, x }) => (
                  <text
                    className="analysis-chart-label"
                    textAnchor="middle"
                    x={x}
                    y={chart.height - 12}
                    key={date}
                  >
                    {formatDate(date)}
                  </text>
                ))}
              </svg>
            )}
          </section>
        </>
      )}
    </section>
  )
}
