import { useState } from 'react'
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

const plans = [
  {
    name: 'Essencial',
    price: 'R$ 29',
    description: 'Para equipes que estão começando a organizar seus registros.',
    features: ['Notas operacionais', 'Filtros por site e equipamento', 'Histórico de registros'],
  },
  {
    name: 'Equipe',
    price: 'R$ 79',
    description: 'Para equipes que precisam acompanhar mais dados no dia a dia.',
    features: ['Tudo do Essencial', 'Análise temporal', 'Gestão de notas'],
    featured: true,
  },
  {
    name: 'Avançado',
    price: 'R$ 149',
    description: 'Para operações com maior volume e mais pessoas.',
    features: ['Tudo do Equipe', 'Mais capacidade de registros', 'Suporte prioritário'],
  },
]

export default function HomePage() {
  const [accessToken, setAccessToken] = useState(() =>
    sessionStorage.getItem('access_token'),
  )
  const [username, setUsername] = useState(() =>
    sessionStorage.getItem('username') || '',
  )
  const [authMode, setAuthMode] = useState('')
  const [authForm, setAuthForm] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
  })
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  function updateAuthForm(event) {
    setAuthForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  async function submitAuth(event) {
    event.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    setAuthMessage('')

    const isRegistering = authMode === 'register'
    const payload = isRegistering
      ? {
          username: authForm.username,
          password: authForm.password,
          email: authForm.email || undefined,
          first_name: authForm.first_name || undefined,
          last_name: authForm.last_name || undefined,
        }
      : {
          username: authForm.username,
          password: authForm.password,
        }

    try {
      const response = await fetch(
        isRegistering ? '/api/v1/auth/register' : '/api/v1/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )
      const responseText = await response.text()
      let data
      try {
        data = JSON.parse(responseText)
      } catch {
        data = { detail: responseText }
      }

      if (!response.ok) {
        throw new Error(
          data.detail || data.error_description || data.error || 'Não foi possível concluir a solicitação.',
        )
      }

      if (isRegistering) {
        setAuthMode('login')
        setAuthMessage('Conta criada. Entre com seu usuário e senha.')
        setAuthForm((current) => ({ ...current, password: '' }))
      } else {
        if (!data.access_token) {
          throw new Error('A resposta não contém um token de acesso.')
        }
        sessionStorage.setItem('access_token', data.access_token)
        sessionStorage.setItem('username', authForm.username)
        setAccessToken(data.access_token)
        setUsername(authForm.username)
        setAuthMode('')
        setAuthForm({
          username: '',
          password: '',
          email: '',
          first_name: '',
          last_name: '',
        })
      }
    } catch (error) {
      setAuthError(error.message || 'Não foi possível conectar à API.')
    } finally {
      setAuthLoading(false)
    }
  }

  function logout() {
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('username')
    setAccessToken('')
    setUsername('')
  }

  return (
    <main className="landing-page">
      <header className="landing-header">
        <a className="landing-brand" href="/" aria-label="Notescreen - início">
          <img src="/logo.svg" alt="" />
          <span>Notescreen</span>
        </a>
        <div className="landing-auth-actions">
          {accessToken ? (
            <>
              <span className="landing-auth-user">Olá, {username}</span>
              <button type="button" onClick={logout}>Sair</button>
              <a className="landing-header-link" href="/home">Acessar sistema</a>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setAuthError('')
                  setAuthMessage('')
                  setAuthMode('login')
                }}
              >
                Login
              </button>
              <button
                className="landing-register-button"
                type="button"
                onClick={() => {
                  setAuthError('')
                  setAuthMessage('')
                  setAuthMode('register')
                }}
              >
                Registrar
              </button>
            </>
          )}
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="home-eyebrow">CONTROLE OPERACIONAL SEM COMPLICAÇÃO</p>
          <h1>Transforme registros em uma operação mais organizada.</h1>
          <p>
            Centralize notas de sites e equipamentos, encontre informações com
            facilidade e acompanhe o que acontece na sua operação.
          </p>
          <div className="landing-actions">
            {!accessToken && (
              <button
                className="landing-primary-action"
                type="button"
                onClick={() => {
                  setAuthError('')
                  setAuthMessage('')
                  setAuthMode('register')
                }}
              >
                Começar agora
              </button>
            )}
            <a className="landing-secondary-action" href={accessToken ? '/home' : '#recursos'}>
              {accessToken ? 'Acessar sistema' : 'Conhecer recursos'}
            </a>
          </div>
        </div>
        <div className="landing-hero-mark" aria-hidden="true">
          <img src="/notes.svg" alt="" />
          <span className="landing-hero-note">Registro organizado</span>
          <div><span>Sites</span><strong>Notas</strong></div>
          <div><span>Equipamentos</span><strong>Histórico</strong></div>
          <div><span>Acompanhamento</span><strong>Análise</strong></div>
        </div>
      </section>

      <section className="landing-sections" id="recursos" aria-label="Recursos do sistema">
        <p className="home-eyebrow">SIMPLES E DIRETO AO PONTO</p>
        <h2>Tudo que sua equipe precisa para acompanhar as notas</h2>
        <div className="home-sections">
          {sections.map((section) => (
            <article className="home-section-card" key={section.title}>
              <img src={section.icon} alt="" />
              <h3>{section.title}</h3>
              <p>{section.description}</p>
              <a href={section.href}>{section.action}</a>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-pricing" id="planos">
        <div className="landing-pricing-heading">
          <p className="home-eyebrow">PLANOS</p>
          <h2>Comece no seu ritmo</h2>
          <p>Valores de demonstração, sujeitos a alteração.</p>
        </div>
        <div className="landing-plan-grid">
          {plans.map((plan) => (
            <article
              className={`landing-plan${plan.featured ? ' landing-plan-featured' : ''}`}
              key={plan.name}
            >
              {plan.featured && <span className="landing-plan-badge">Mais escolhido</span>}
              <h3>{plan.name}</h3>
              <p className="landing-plan-description">{plan.description}</p>
              <p className="landing-plan-price">
                <strong>{plan.price}</strong><span>/mês</span>
              </p>
              <ul>
                {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              {accessToken ? (
                <a href="/home">Acessar sistema</a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAuthError('')
                    setAuthMessage('')
                    setAuthMode('register')
                  }}
                >
                  Começar agora
                </button>
              )}
            </article>
          ))}
        </div>
        <p className="landing-demo-disclaimer">
          Os preços e recursos acima são apenas ilustrativos e não representam uma oferta comercial.
        </p>
      </section>

      <section className="landing-bottom-cta">
        <h2>Mais clareza para cuidar da sua operação.</h2>
        <p>Organize seus registros e encontre as informações quando precisar.</p>
        {accessToken ? (
          <a className="landing-primary-action" href="/home">Acessar sistema</a>
        ) : (
          <button
            className="landing-primary-action"
            type="button"
            onClick={() => {
              setAuthError('')
              setAuthMessage('')
              setAuthMode('register')
            }}
          >
            Criar uma conta
          </button>
        )}
      </section>

      <footer className="landing-footer">Notescreen · Gestão de notas operacionais</footer>

      {authMode && (
        <div
          className="landing-auth-backdrop"
          onClick={() => !authLoading && setAuthMode('')}
        >
          <section
            className="landing-auth-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="landing-auth-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="landing-auth-title">
              {authMode === 'register' ? 'Criar conta' : 'Entrar'}
            </h2>
            {authMessage && <p className="landing-auth-success">{authMessage}</p>}
            <form className="landing-auth-form" onSubmit={submitAuth}>
              <label>
                Usuário
                <input
                  name="username"
                  value={authForm.username}
                  onChange={updateAuthForm}
                  autoComplete="username"
                  required
                />
              </label>
              {authMode === 'register' && (
                <>
                  <label>
                    E-mail
                    <input
                      name="email"
                      type="email"
                      value={authForm.email}
                      onChange={updateAuthForm}
                      autoComplete="email"
                    />
                  </label>
                  <label>
                    Nome
                    <input
                      name="first_name"
                      value={authForm.first_name}
                      onChange={updateAuthForm}
                      autoComplete="given-name"
                    />
                  </label>
                  <label>
                    Sobrenome
                    <input
                      name="last_name"
                      value={authForm.last_name}
                      onChange={updateAuthForm}
                      autoComplete="family-name"
                    />
                  </label>
                </>
              )}
              <label>
                Senha
                <input
                  name="password"
                  type="password"
                  value={authForm.password}
                  onChange={updateAuthForm}
                  autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                  required
                />
              </label>
              {authError && <p className="landing-auth-error" role="alert">{authError}</p>}
              <div className="landing-auth-modal-actions">
                <button type="submit" disabled={authLoading}>
                  {authLoading
                    ? 'Aguarde...'
                    : authMode === 'register'
                      ? 'Criar conta'
                      : 'Entrar'}
                </button>
                <button
                  className="landing-auth-cancel"
                  type="button"
                  onClick={() => setAuthMode('')}
                  disabled={authLoading}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
