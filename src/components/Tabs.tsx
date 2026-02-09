type Aba = 'clientes' | 'pagamentos' | 'resumo'

type Props = {
  abaAtiva: Aba
  onChange: (aba: Aba) => void
}

export function Tabs({ abaAtiva, onChange }: Props) {
  return (
    <div style={{ 
      display: 'flex', 
      width: '100%', 
      marginBottom: '20px', 
      background: '#eee', 
      padding: '5px', 
      borderRadius: '10px' 
    }}>
      <button 
        onClick={() => onChange('clientes')}
        style={{
          flex: 1,
          padding: '15px',
          background: abaAtiva === 'clientes' ? 'blue' : 'white', // AZUL se ativo
          color: abaAtiva === 'clientes' ? 'white' : 'black',
          border: '1px solid black',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        CLIENTES
      </button>

      <button 
        onClick={() => onChange('pagamentos')}
        style={{
          flex: 1,
          padding: '15px',
          background: abaAtiva === 'pagamentos' ? 'green' : 'white', // VERDE se ativo
          color: abaAtiva === 'pagamentos' ? 'white' : 'black',
          border: '1px solid black',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        PAGAMENTOS
      </button>

      <button 
        onClick={() => onChange('resumo')}
        style={{
          flex: 1,
          padding: '15px',
          background: abaAtiva === 'resumo' ? 'red' : 'white', // VERMELHO se ativo
          color: abaAtiva === 'resumo' ? 'white' : 'black',
          border: '1px solid black',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        RESUMO
      </button>
    </div>
  )
}
