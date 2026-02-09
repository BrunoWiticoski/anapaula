// components/ResumoDia.tsx
import { buttonStyle } from '../styles/styles'

type Props = {
  dinheiro: number
  pix: number
  cartao: number
  total: number
}

export function ResumoDia({ dinheiro, pix, cartao, total }: Props) {
  const formatarMoeda = (valor: number) => 
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2 
    }).format(valor)

  const gerarRelatorio = () => {
    window.print()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ margin: 0 }}>Resumo do Dia</h3>

      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: 12 
        }}
        role="region"
        aria-label="Resumo por forma de pagamento"
      >
        <ResumoItem 
          emoji="💵" 
          label="Dinheiro" 
          valor={dinheiro}
          cor="#16a34a"
        />
        <ResumoItem 
          emoji="📱" 
          label="Pix" 
          valor={pix}
          cor="#3b82f6"
        />
        <ResumoItem 
          emoji="💳" 
          label="Cartão" 
          valor={cartao}
          cor="#d97706"
        />
      </div>

      <div style={{ 
        background: '#f3f4f6', 
        padding: 20, 
        borderRadius: 16, 
        textAlign: 'center',
        marginBottom: 20
      }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>
          Total do dia
        </h2>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#059669' }}>
          {formatarMoeda(total)}
        </div>
      </div>

      <button
        style={{
          ...buttonStyle,
          background: '#2563eb',
          color: '#fff',
          fontSize: 16
        }}
        onClick={gerarRelatorio}
        aria-label="Gerar e imprimir relatório do dia"
      >
        📄 Gerar relatório do dia
      </button>
    </div>
  )
}

type ResumoItemProps = {
  emoji: string
  label: string
  valor: number
  cor: string
}

function ResumoItem({ emoji, label, valor }: ResumoItemProps) {
  return (
    <div style={{ 
      background: '#fff', 
      padding: 16, 
      borderRadius: 12, 
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      <div style={{ fontSize: 24, marginBottom: 4 }}>{emoji}</div>
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ 
        fontSize: 20, 
        fontWeight: 'bold', 
      }}>
        {new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        }).format(valor)}
      </div>
    </div>
  )
}


