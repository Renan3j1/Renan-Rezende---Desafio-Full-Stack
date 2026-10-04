import './UserHeader.css'

function getUserEmail(accessToken) {
  try {
    const tokenPayload = accessToken.split('.')[1]
    const normalizedPayload = tokenPayload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    const payload = JSON.parse(atob(normalizedPayload))

    return typeof payload.email === 'string' && payload.email
      ? payload.email
      : 'E-mail não disponível'
  } catch {
    return 'E-mail não disponível'
  }
}

export default function UserHeader({ accessToken }) {
  function logout() {
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('username')
    window.location.assign('/')
  }

  return (
    <header className="user-header">
      <span className="user-header-email">{getUserEmail(accessToken)}</span>
      <button className="user-header-logout" type="button" onClick={logout}>
        Sair
      </button>
    </header>
  )
}
