import CreateNoteModal from '../components/CreateNoteModal.jsx'
import './HomeDashboardPage.css'

const pages = [
  {
    title: 'Notas',
    description: 'Consulte notas e filtre por site, equipamento ou período.',
    href: '/notas',
    icon: '/notes.svg',
  },
  {
    title: 'Análise',
    description: 'Visualize o total de notas e o histórico em uma linha temporal.',
    href: '/analise',
    icon: '/analytics.svg',
  },
  {
    title: 'Histórico',
    description: 'Revise, edite e exclua notas existentes.',
    href: '/historico',
    icon: '/history.svg',
  },
]

export default function HomeDashboardPage() {
  return (
    <section className="system-home">
      <header className="system-home-heading">
        <div>
          <p className="system-home-eyebrow">PAINEL DO SISTEMA</p>
          <h1>Bem-vindo ao Notescreen</h1>
          <p>Escolha uma área para começar ou registre uma nova nota.</p>
        </div>
        <CreateNoteModal buttonClassName="system-home-create" />
      </header>

      <div className="system-home-pages">
        {pages.map((page) => (
          <a className="system-home-card" href={page.href} key={page.title}>
            <img src={page.icon} alt="" />
            <h2>{page.title}</h2>
            <p>{page.description}</p>
            <span>Abrir área</span>
          </a>
        ))}
      </div>
    </section>
  )
}
