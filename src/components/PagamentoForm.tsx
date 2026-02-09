// components/PagamentoForm.tsx
import type { Cliente } from '../types/financeiro'
import { inputStyle, buttonStyle, selectStyle } from '../styles/styles'

type Props = {
  clientes: Cliente[]
  clienteSelecionado: string
  valor: string
  formaPagamento: 'dinheiro' | 'pix' | 'cartao'
  onClienteChange: (v: string) => void
  onValorChange: (v: string) => void
  onFormaChange: (v: 'dinheiro' | 'pix' | 'cartao') => void
  onSalvar: () => void
}

export function PagamentoForm({
  clientes,
  clienteSelecionado,
  valor,
  formaPagamento,
  onClienteChange,
  onValorChange,
  onFormaChange,
  onSalvar
}: Props) {
  const valorNumerico = Number(valor.replace(/[^\d,]/g, '').replace(',', '.'))
  const clienteValido = clienteSelecionado !== ''
  const valorValido = valorNumerico > 0

  const podeSalvar = clienteValido && valorValido

  return (
    <div role="form" aria-label="Registrar Pagamento">
      <h3>Registrar Pagamento</h3>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="cliente-pagamento" style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>
          Cliente *
        </label>
        <select
          id="cliente-pagamento"
          style={{
            ...selectStyle,
            borderColor: clienteValido ? '#d1d5db' : '#ef4444'
          }}
          value={clienteSelecionado}
          onChange={(e) => onClienteChange(e.target.value)}
          aria-invalid={!clienteValido}
        >
          <option value="">Selecione um cliente</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        {!clienteValido && (
          <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>
            Selecione um cliente
          </div>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="valor-pagamento" style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>
          Valor *
        </label>
        <input
          id="valor-pagamento"
          type="text"
          style={{
            ...inputStyle,
            borderColor: valorValido ? '#d1d5db' : '#ef4444'
          }}
          placeholder="0,00"
          value={valor}
          onChange={(e) => {
            const valorLimpo = e.target.value.replace(/[^\d,]/g, '')
            onValorChange(valorLimpo)
          }}
          aria-invalid={!valorValido}
        />
        {!valorValido && valor !== '' && (
          <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>
            Valor deve ser maior que R$ 0,00
          </div>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="forma-pagamento" style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>
          Forma de Pagamento
        </label>
        <select
          id="forma-pagamento"
          style={selectStyle}
          value={formaPagamento}
          onChange={(e) => onFormaChange(e.target.value as 'dinheiro' | 'pix' | 'cartao')}
        >
          <option value="dinheiro">💵 Dinheiro</option>
          <option value="pix">📱 Pix</option>
          <option value="cartao">💳 Cartão</option>
        </select>
      </div>

      <button
        type="button"
        disabled={!podeSalvar}
        style={{
          ...buttonStyle,
          background: podeSalvar ? '#16a34a' : '#9ca3af',
          color: '#fff',
          border: 'none',
          cursor: podeSalvar ? 'pointer' : 'not-allowed'
        }}
        onClick={onSalvar}
        aria-label="Salvar pagamento"
      >
        Salvar pagamento
      </button>
    </div>
  )
}
