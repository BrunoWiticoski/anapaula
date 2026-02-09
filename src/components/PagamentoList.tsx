// components/PagamentoList.tsx
import type { Pagamento } from '../types/financeiro'
import { cardStyle, buttonStyle } from '../styles/styles'

type Props = {
  pagamentos: Pagamento[]
  onExcluir: (id: string) => void
}

export function PagamentoList({ pagamentos, onExcluir }: Props) {
  if (pagamentos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
        Nenhum pagamento hoje
      </div>
    )
  }

  return (
    <>
      <h3>Pagamentos ({pagamentos.length})</h3>

      <div role="list" aria-label="Lista de pagamentos">
        {pagamentos.map(p => (
          <div 
            key={p.id} 
            role="listitem"
            style={{
              ...cardStyle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
                {p.clientes?.nome}
              </div>
              <strong style={{ fontSize: 20 }}>
                R$ {Number(p.valor).toLocaleString('pt-BR', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </strong>
              <div style={{ 
                fontSize: 13, 
                color: '#6b7280', 
                marginTop: 4,
                textTransform: 'capitalize'
              }}>
                {p.forma_pagamento.replace('_', ' ')}
              </div>
            </div>

            <button
              type="button"
              style={{
                ...buttonStyle,
                background: '#ef4444',
                color: '#fff',
                padding: '8px 16px',
                whiteSpace: 'nowrap'
              }}
              onClick={() => onExcluir(p.id)}
              aria-label={`Excluir pagamento de ${p.clientes?.nome}`}
            >
              Excluir
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
