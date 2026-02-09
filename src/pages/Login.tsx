import { inputStyle, buttonStyle } from '../styles/styles'

type Props = {
  email: string
  senha: string
  loading: boolean
  onEmailChange: (v: string) => void
  onSenhaChange: (v: string) => void
  onLogin: () => void
}

export function Login({
  email,
  senha,
  loading,
  onEmailChange,
  onSenhaChange,
  onLogin
}: Props) {
  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: 20 }}>
      <h1>Studio da Ana Paulaaaaaa 💅</h1>

      <input
        style={inputStyle}
        placeholder="Email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
      />

      <input
        style={inputStyle}
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => onSenhaChange(e.target.value)}
      />

      <button
        style={{ ...buttonStyle, background: '#d946ef', color: '#fff', border: 'none' }}
        onClick={onLogin}
        disabled={loading}
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </div>
  )
}
