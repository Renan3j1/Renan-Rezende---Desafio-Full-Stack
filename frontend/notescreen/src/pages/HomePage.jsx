import CreateNoteModal from '../components/CreateNoteModal.jsx'
import './HomePage.css'

const sections = [
  {
    title: 'Notas',
    description: 'Consulte e filtre as notas registradas por site, equipamento ou data.',
    icon: '/notes.svg',
    href: '/notas',
    action: 'Ver notas',
  },
  {
    title: 'Análise',
    description: 'Acompanhe o total de notas e sua evolução ao longo do tempo.',
    icon: '/analytics.svg',
    href: '/analise',
    action: 'Ver análise',
  },
  {
    title: 'Histórico',
    description: 'Revise, edite ou exclua notas já registradas no sistema.',
    icon: '/history.svg',
    href: '/historico',
    action: 'Abrir histórico',
  },
]

export default function HomePage() {
  return (
    <section className="home-page">
      <div className="home-intro">
        <p className="home-eyebrow">NOTESCREEN</p>
        <h1>Bem-vindo ao Notescreen</h1>
        <p>
          Um espaço para registrar e acompanhar notas sobre sites e equipamentos.
          Consulte os registros, acompanhe o histórico e visualize a evolução das
          ocorrências em um só lugar.
        </p>
        <CreateNoteModal buttonClassName="home-create-button" />
      </div>

      <div className="home-sections">
        {sections.map((section) => (
          <article className="home-section-card" key={section.title}>
            <img src={section.icon} alt="" />
            <h2>{section.title}</h2>
            <p>{section.description}</p>
            <a href={section.href}>{section.action}</a>
          </article>
        ))}
      </div>
    </section>
  )
}
