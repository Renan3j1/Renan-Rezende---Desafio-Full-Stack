const items = [
  { label: 'HOME', icon: '/home.svg', path: '/' },
  { label: 'ANALISE', icon: '/analytics.svg', path: '/analise' },
  { label: 'NOTAS', icon: '/notes.svg', path: '/notas' },
  { label: 'HISTORICO', icon: '/history.svg', path: '/historico' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <img src="/logo.svg" alt="Logo" className="sidebar-logo" />
      <nav>
        {items.map((item) => (
          <a key={item.label} href={item.path} className="sidebar-item">
            <img src={item.icon} alt="" />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  )
}
