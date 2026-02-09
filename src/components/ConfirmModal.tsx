// components/ConfirmModal.tsx
import { useEffect, useCallback } from 'react'

type Props = {
  aberto: boolean
  titulo: string
  mensagem: string
  onConfirmar: () => void
  onCancelar: () => void
}

export function ConfirmModal({
  aberto,
  titulo,
  mensagem,
  onConfirmar,
  onCancelar
}: Props) {
  // 👈 ESC fecha modal
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancelar()
    }
  }, [onCancelar])

  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = 'hidden' // 👈 previne scroll
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = ''
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [aberto, handleKeyDown])

  if (!aberto) return null

  return (
    <>
      {/* 👈 backdrop clicável fecha */}
      <div 
        style={overlay}
        onClick={onCancelar}
        aria-hidden="true"
      />
      
      <div 
        style={modalContainer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-message"
      >
        <div style={modalHeader}>
          <h3 id="modal-title" style={{ margin: 0, color: '#111' }}>
            {titulo}
          </h3>
        </div>

        <div style={modalBody}>
          <p id="modal-message" style={{ color: '#374151', fontSize: 15, lineHeight: 1.5 }}>
            {mensagem}
          </p>
        </div>

        <div style={modalFooter}>
          <button 
            style={btnCancelar}
            onClick={onCancelar}
            autoFocus // 👈 foco automático no cancelar
          >
            Cancelar
          </button>
          
          <button 
            style={btnConfirmar}
            onClick={onConfirmar}
          >
            Excluir
          </button>
        </div>
      </div>
    </>
  )
}

/* Estilos melhorados */
const overlay = {
  position: 'fixed' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  animation: 'fadeIn 0.2s ease-out'
} as const

const modalContainer = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: '#fff',
  borderRadius: 12,
  width: '90%',
  maxWidth: 400,
  maxHeight: '90vh',
  overflow: 'hidden',
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
  animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
} as const

const modalHeader = {
  padding: '20px 24px 0',
  borderBottom: '1px solid #e5e7eb'
} as const

const modalBody = {
  padding: '16px 24px',
  fontSize: 15
} as const

const modalFooter = {
  padding: '0 24px 20px',
  display: 'flex',
  gap: 12
} as const

const btnCancelar = {
  flex: 1,
  padding: '12px 16px',
  background: '#f9fafb',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  fontSize: 15,
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.15s'
} as const

const btnConfirmar = {
  flex: 1,
  padding: '12px 16px',
  background: '#dc2626',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.15s'
} as const
