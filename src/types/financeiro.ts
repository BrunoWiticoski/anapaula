
export interface Cliente {
  id: string
  nome: string
  telefone: string
  created_at: string
}

export interface Pagamento {
  id: string
  cliente_id: string
  valor: number
  forma_pagamento: 'dinheiro' | 'pix' | 'cartao'
  data_pagamento: string
  created_at: string
  clientes?: {
    nome: string
  }
}
