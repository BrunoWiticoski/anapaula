import { useState } from 'react'
import { Tabs } from '../components/Tabs'
import { ClienteForm } from '../components/ClienteForm'
import { ClienteList } from '../components/ClienteList'
import { PagamentoForm } from '../components/PagamentoForm'
import { PagamentoList } from '../components/PagamentoList'
import { ResumoDia } from '../components/ResumoDia'
import { ConfirmModal } from '../components/ConfirmModal'
import { inputStyle, buttonStyle, containerStyle } from '../styles/styles'

// Se quiser usar os types fortes, descomente abaixo:
// import { Cliente, Pagamento } from '../types/financeiro'

type Props = {
  clientes: any[]
  pagamentos: any[]
  nome: string
  telefone: string
  clienteSelecionado: string
  valor: string
  formaPagamento: 'dinheiro' | 'pix' | 'cartao'
  dataSelecionada: string
  totalDinheiro: number
  totalPix: number
  totalCartao: number
  totalDia: number
  onLogout: () => void
  onNomeChange: (v: string) => void
  onTelefoneChange: (v: string) => void
  onClienteChange: (v: string) => void
  onValorChange: (v: string) => void
  onFormaChange: (v: 'dinheiro' | 'pix' | 'cartao') => void
  onDataChange: (v: string) => void
  onSalvarCliente: () => void
  onExcluirCliente: (id: string) => void
  onEditarCliente: (id: string, nome: string, telefone: string) => void
  onSalvarPagamento: () => void
  onExcluirPagamento: (id: string) => void
}

export function Dashboard(props: Props) {
  // Estado que controla qual aba está visível
  const [abaAtiva, setAbaAtiva] = useState<'clientes' | 'pagamentos' | 'resumo'>('clientes')
  
  // Estado do modal de exclusão
  const [modalAberto, setModalAberto] = useState(false)
  const [clienteParaExcluir, setClienteParaExcluir] = useState<string | null>(null)

  // Lógica local para verificar exclusão (opcional mover para App.tsx, mas ok aqui)
  function solicitarExclusao(id: string) {
    // Verifica se cliente tem pagamentos (lógica simplificada: pergunta direto)
    // Se quiser verificação real, precisa vir via prop ou fazer query aqui.
    // Para simplificar, vamos abrir o modal sempre:
    setClienteParaExcluir(id)
    setModalAberto(true)
  }

  function confirmarExclusao() {
    if (clienteParaExcluir) {
      props.onExcluirCliente(clienteParaExcluir)
    }
    setModalAberto(false)
    setClienteParaExcluir(null)
  }

  return (
    <div style={containerStyle}>
      <header style={{ marginBottom: 20, textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#be185d' }}>Studio de Unhas 💅</h1>
        <button
          style={{ ...buttonStyle, background: '#4b5563', padding: '8px 16px', fontSize: 14 }}
          onClick={props.onLogout}
        >
          Sair do sistema
        </button>
      </header>

      {/* COMPONENTE DE ABAS */}
      <Tabs abaAtiva={abaAtiva} onChange={setAbaAtiva} />

      {/* CONTEÚDO DA ABA CLIENTES */}
      {abaAtiva === 'clientes' && (
        <div className="aba-clientes">
          <ClienteForm
            nome={props.nome}
            telefone={props.telefone}
            onNomeChange={props.onNomeChange}
            onTelefoneChange={props.onTelefoneChange}
            onSalvar={props.onSalvarCliente}
          />
          
          <hr style={{ margin: '24px 0', border: '0', borderTop: '1px solid #e5e7eb' }} />
          
          <ClienteList
            clientes={props.clientes}
            onExcluir={solicitarExclusao} // Usa a função local que abre modal
            onEditar={props.onEditarCliente}
          />
        </div>
      )}

      {/* CONTEÚDO DA ABA PAGAMENTOS */}
      {abaAtiva === 'pagamentos' && (
        <div className="aba-pagamentos">
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold', color: '#374151' }}>
              Data do movimento:
            </label>
            <input
              type="date"
              style={inputStyle}
              value={props.dataSelecionada}
              onChange={(e) => props.onDataChange(e.target.value)}
            />
          </div>

          <PagamentoForm
            clientes={props.clientes}
            clienteSelecionado={props.clienteSelecionado}
            valor={props.valor}
            formaPagamento={props.formaPagamento}
            onClienteChange={props.onClienteChange}
            onValorChange={props.onValorChange}
            onFormaChange={props.onFormaChange}
            onSalvar={props.onSalvarPagamento}
          />

          <hr style={{ margin: '24px 0', border: '0', borderTop: '1px solid #e5e7eb' }} />

          <PagamentoList
            pagamentos={props.pagamentos}
            onExcluir={props.onExcluirPagamento}
          />
        </div>
      )}

      {/* CONTEÚDO DA ABA RESUMO */}
      {abaAtiva === 'resumo' && (
        <div className="aba-resumo">
          <ResumoDia
            dinheiro={props.totalDinheiro}
            pix={props.totalPix}
            cartao={props.totalCartao}
            total={props.totalDia}
          />
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO (sempre presente, só aparece se aberto=true) */}
      <ConfirmModal
        aberto={modalAberto}
        titulo="Excluir Cliente?"
        mensagem="Tem certeza? Se o cliente tiver pagamentos, eles também serão excluídos."
        onCancelar={() => setModalAberto(false)}
        onConfirmar={confirmarExclusao}
      />
    </div>
  )
}
