// components/ClienteList.tsx
import { useState } from 'react'
import type { Cliente } from '../types/financeiro'
import { cardStyle, buttonStyle, inputStyle } from '../styles/styles'

type Props = {
  clientes: Cliente[]
  onExcluir: (id: string) => void
  onEditar: (id: string, nome: string, telefone: string) => void
}

export function ClienteList({ clientes, onExcluir, onEditar }: Props) {
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [nomeEdit, setNomeEdit] = useState('')
  const [telefoneEdit, setTelefoneEdit] = useState('')

  function iniciarEdicao(cliente: Cliente) {
    setEditandoId(cliente.id)
    setNomeEdit(cliente.nome)
    setTelefoneEdit(cliente.telefone)
  }

  function salvarEdicao(id: string) {
    if (nomeEdit.trim().length === 0) return
    onEditar(id, nomeEdit.trim(), telefoneEdit.replace(/\D/g, ''))
    setEditandoId(null)
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setNomeEdit('')
    setTelefoneEdit('')
  }

  if (clientes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
        Nenhum cliente cadastrado
      </div>
    )
  }

  return (
    <>
      <h3>Clientes ({clientes.length})</h3>

      <div role="list" aria-label="Lista de clientes">
        {clientes.map(cliente => {
          const editando = editandoId === cliente.id

          return (
            <div
              key={cliente.id}
              role="listitem"
              style={{
                ...cardStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                marginBottom: 8
              }}
            >
              {/* ESQUERDA */}
              <div style={{ flex: 1 }}>
                {editando ? (
                  <>
                    <input
                      style={inputStyle}
                      value={nomeEdit}
                      onChange={e => setNomeEdit(e.target.value)}
                      placeholder="Nome"
                      aria-label="Editar nome"
                    />
                    <input
                      style={inputStyle}
                      value={telefoneEdit}
                      onChange={e => setTelefoneEdit(e.target.value.replace(/\D/g, ''))}
                      placeholder="Telefone"
                      aria-label="Editar telefone"
                    />
                  </>
                ) : (
                  <>
                    <strong>{cliente.nome}</strong>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>
                      {cliente.telefone}
                    </div>
                  </>
                )}
              </div>

              {/* DIREITA */}
              <div style={{ display: 'flex', gap: 6 }}>
                {editando ? (
                  <>
                    <button
                      style={{
                        ...buttonStyle,
                        background: '#22c55e',
                        color: '#fff',
                        padding: '8px 12px',
                      }}
                      onClick={() => salvarEdicao(cliente.id)}
                      aria-label="Salvar alterações"
                    >
                      Salvar
                    </button>
                    <button
                      style={{
                        ...buttonStyle,
                        background: '#6b7280',
                        color: '#fff',
                        padding: '8px 12px',
                      }}
                      onClick={cancelarEdicao}
                      aria-label="Cancelar edição"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    style={{
                      ...buttonStyle,
                      background: '#3b82f6',
                      color: '#fff',
                      padding: '8px 12px',
                    }}
                    onClick={() => iniciarEdicao(cliente)}
                    aria-label={`Editar cliente ${cliente.nome}`}
                  >
                    Editar
                  </button>
                )}

                <button
                  style={{
                    ...buttonStyle,
                    background: '#ef4444',
                    color: '#fff',
                    padding: '8px 12px',
                  }}
                  onClick={() => onExcluir(cliente.id)}
                  aria-label={`Excluir cliente ${cliente.nome}`}
                >
                  ✕
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
