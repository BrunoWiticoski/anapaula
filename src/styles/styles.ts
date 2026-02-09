export const containerStyle = {
  maxWidth: 420,
  margin: '0 auto',
  padding: 16,
  background: '#f9fafb',
  minHeight: '100vh',
}

export const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 15,
  borderRadius: 12,
  border: '1px solid #e5e7eb',
  marginBottom: 10,
  outline: 'none',
}

export const selectStyle = {
  ...inputStyle,
  backgroundColor: '#fff',
}

export const buttonStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: 14,
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
}

export const cardStyle = {
  background: '#fff',
  borderRadius: 16,
  padding: 14,
  boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
  marginBottom: 12,
}

export const resumoContainer = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 16
}