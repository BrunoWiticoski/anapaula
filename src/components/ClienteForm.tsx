// components/ClienteForm.tsx
import { inputStyle, buttonStyle } from '../styles/styles'

type Props = {
  nome: string
  telefone: string
  onNomeChange: (v: string) => void
  onTelefoneChange: (v: string) => void
  onSalvar: () => void
}

export function ClienteForm({
  nome,
  telefone,
  onNomeChange,
  onTelefoneChange,
  onSalvar
}: Props) {
  const nomeValido = nome.trim().length > 0
  const telefoneValido = telefone.length >= 10

  const podeSalvar = nomeValido && telefoneValido

  return (
    <div role="form" aria-label="Novo Cliente">
      <h3>Novo Cliente</h3>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="nome-cliente" style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>
          Nome *
        </label>
        <input
          id="nome-cliente"
          style={{
            ...inputStyle,
            borderColor: nomeValido ? '#d1d5db' : '#ef4444'
          }}
          placeholder="Digite o nome completo"
          value={nome}
          onChange={(e) => onNomeChange(e.target.value)}
          aria-invalid={!nomeValido}
          aria-describedby={!nomeValido ? "nome-error" : undefined}
        />
        {!nomeValido && (
          <div id="nome-error" style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>
            Nome é obrigatório
          </div>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="telefone-cliente" style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>
          Telefone *
        </label>
        <input
          id="telefone-cliente"
          type="tel"
          style={{
            ...inputStyle,
            borderColor: telefoneValido ? '#d1d5db' : '#ef4444'
          }}
          placeholder="(11) 99999-9999"
          value={telefone}
          onChange={(e) => onTelefoneChange(e.target.value.replace(/\D/g, ''))} // 👈 só números
          maxLength={11}
          aria-invalid={!telefoneValido}
          aria-describedby={!telefoneValido ? "telefone-error" : undefined}
        />
        {!telefoneValido && (
          <div id="telefone-error" style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>
            Telefone deve ter pelo menos 10 dígitos
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={!podeSalvar}
        style={{
          ...buttonStyle,
          background: podeSalvar ? '#d946ef' : '#9ca3af',
          color: '#fff',
          border: 'none',
          cursor: podeSalvar ? 'pointer' : 'not-allowed'
        }}
        onClick={onSalvar}
        aria-label="Salvar novo cliente"
      >
        Salvar cliente
      </button>
    </div>
  )
}
