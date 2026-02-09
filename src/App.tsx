import { useEffect, useState } from 'react'
import { supabase } from './services/supabase'
import React from 'react'

// --- COMPONENTES AUXILIARES ---

// Formata moeda (R$ 1.200,50)
const formatarMoeda = (valor: string) => {
  const apenasNumeros = valor.replace(/\D/g, "");
  if (!apenasNumeros) return "";
  const numero = parseFloat(apenasNumeros) / 100;
  return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Custom Select (Estilo iOS)
const CustomSelect = ({ value, onChange, options, placeholder }: any) => {
  const [aberto, setAberto] = React.useState(false);
  const selecionar = (valor: any) => { onChange({ target: { value: valor } }); setAberto(false); };
  const textoSelecionado = options.find((op: any) => op.value === value)?.label || placeholder;

  return (
    <div style={{ position: 'relative', marginBottom: '15px' }}>
      <div onClick={() => setAberto(!aberto)} style={{ padding: '12px 16px', backgroundColor: '#E5E5EA', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: value ? '600' : 'normal' }}>
        {textoSelecionado} <span style={{ color: '#8E8E93', fontSize: '12px' }}>▼</span>
      </div>
      {aberto && (
        <>
          <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 100, overflow: 'hidden', border: '1px solid #eee' }}>
            {options.map((opcao: any) => (
              <div key={opcao.value} onClick={() => selecionar(opcao.value)} style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', backgroundColor: value === opcao.value ? '#F2F2F7' : 'white', color: value === opcao.value ? '#007AFF' : 'black' }}>
                {opcao.label}
              </div>
            ))}
          </div>
          <div onClick={() => setAberto(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} />
        </>
      )}
    </div>
  );
};

function App() {
  /* ======================= ESTILOS ======================= */
  const mainContainerStyle = { maxWidth: '500px', width: '100%', margin: '0 auto', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', backgroundColor: '#F2F2F7', color: '#000', position: 'relative' as const, overflowX: 'hidden' as const }
  const inputStyle = { width: '100%', padding: '12px 16px', marginBottom: '12px', fontSize: '17px', borderRadius: '10px', border: 'none', backgroundColor: '#E5E5EA', color: '#000', outline: 'none', boxSizing: 'border-box' as const }
  const selectStyle = { ...inputStyle, appearance: 'none' as const, WebkitAppearance: 'none' as any, cursor: 'pointer', backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '16px', paddingRight: '40px' }
  const buttonStyle = { width: '100%', padding: '14px', fontSize: '17px', fontWeight: '600', cursor: 'pointer', borderRadius: '12px', border: 'none', color: '#fff', backgroundColor: '#007AFF', transition: 'opacity 0.2s' }
  const tabsContainerStyle = { display: 'flex', background: '#E5E5EA', padding: '4px', borderRadius: '12px', marginBottom: '20px' }
  const tabStyle = (ativa: boolean) => ({ flex: 1, padding: '8px', cursor: 'pointer', background: ativa ? '#FFFFFF' : 'transparent', color: ativa ? '#000' : '#8E8E93', fontWeight: ativa ? '600' : '500', borderRadius: '8px', border: 'none', fontSize: '13px', boxShadow: ativa ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s ease' })

  const [verLista, setVerLista] = useState<'entradas' | 'saidas'>('entradas');


  /* ======================= ESTADOS GERAIS ======================= */
  const formatarTelefone = (valor: string) => { const apenasNumeros = valor.replace(/\D/g, ''); return apenasNumeros.replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d)(\d{4})$/, '$1-$2') }
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>, setFunction: (v: string) => void) => { setFunction(formatarTelefone(e.target.value)) }

  const [session, setSession] = useState<any>(null)
  const [abaAtiva, setAbaAtiva] = useState<'home' | 'clientes' | 'caixa' | 'resumo'>('home')

  /* ======================= ESTADOS DE AUTENTICAÇÃO ======================= */
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'cadastro' | 'recuperar'>('login');

  // Novos campos para cadastro
  const [nome, setNome] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [verConfirmaSenha, setVerConfirmaSenha] = useState(false);

  // Clientes
  const [clientes, setClientes] = useState<any[]>([]); const [nomeCliente, setNomeCliente] = useState(''); const [telefone, setTelefone] = useState('')
  const [editandoId, setEditandoId] = useState<string | null>(null); const [nomeEdit, setNomeEdit] = useState(''); const [telefoneEdit, setTelefoneEdit] = useState('')

  // DATAS E FILTROS (CORREÇÃO DE FUSO HORÁRIO)
  const pegarHoje = () => {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };
  const hoje = pegarHoje();

  const [dataSelecionada, setDataSelecionada] = useState(hoje)
  const [resumoInicio, setResumoInicio] = useState(hoje);
  const [resumoFim, setResumoFim] = useState(hoje);

  // Movimentações
  const [tipoMovimento, setTipoMovimento] = useState<'entrada' | 'saida'>('entrada');
  const [pagamentos, setPagamentos] = useState<any[]>([])
  const [pagamentosResumo, setPagamentosResumo] = useState<any[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState(''); const [valor, setValor] = useState(''); const [formaPagamento, setFormaPagamento] = useState('dinheiro')
  const [editandoPagamentoId, setEditandoPagamentoId] = useState<string | null>(null); const [valorEdit, setValorEdit] = useState(''); const [formaPagamentoEdit, setFormaPagamentoEdit] = useState('dinheiro')
  const [despesas, setDespesas] = useState<any[]>([]);
  const [despesasResumo, setDespesasResumo] = useState<any[]>([]);
  const [descricaoDespesa, setDescricaoDespesa] = useState('');
  const [valorDespesa, setValorDespesa] = useState('');
  const [categoriaDespesa, setCategoriaDespesa] = useState('material');

  // MODAL GENÉRICO DE CONFIRMAÇÃO
  const [modalConfirmacao, setModalConfirmacao] = useState<{ aberto: boolean; titulo: string; mensagem: string; acaoConfirmar: () => Promise<void>; }>({ aberto: false, titulo: '', mensagem: '', acaoConfirmar: async () => { } });

  // Histórico
  const [clienteHistorico, setClienteHistorico] = useState<any>(null);
  const [historicoPagamentos, setHistoricoPagamentos] = useState<any[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  /* ======================= EFEITOS ======================= */
  useEffect(() => { supabase.auth.getSession().then(({ data }) => setSession(data.session)); const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session)); return () => subscription.unsubscribe() }, [])
  useEffect(() => { if (session) { carregarClientes(); carregarMovimentacoesDia() } }, [session, dataSelecionada])
  useEffect(() => { if (session && abaAtiva === 'resumo') { carregarResumoCompleto() } }, [session, abaAtiva, resumoInicio, resumoFim])

  /* ======================= CÁLCULOS TOTAIS ======================= */
  const totalEntradas = pagamentosResumo.reduce((t, p) => t + Number(p.valor), 0);
  const totalSaidas = despesasResumo.reduce((t, d) => t + Number(d.valor), 0);
  const lucroLiquido = totalEntradas - totalSaidas;
  const totalDinheiroResumo = pagamentosResumo.filter(p => p.forma_pagamento === 'dinheiro').reduce((t, p) => t + Number(p.valor), 0);
  const totalPixResumo = pagamentosResumo.filter(p => p.forma_pagamento === 'pix').reduce((t, p) => t + Number(p.valor), 0);
  const totalCartaoResumo = pagamentosResumo.filter(p => p.forma_pagamento === 'cartao').reduce((t, p) => t + Number(p.valor), 0);
  const totalEntradasDia = pagamentos.reduce((t, p) => t + Number(p.valor), 0);
  const totalSaidasDia = despesas.reduce((t, d) => t + Number(d.valor), 0);

  /* ======================= FUNÇÕES DE BANCO ======================= */
  async function carregarClientes() { const { data } = await supabase.from('clientes').select('*').order('created_at', { ascending: false }); setClientes(data || []) }
  async function carregarMovimentacoesDia() { const inicioDia = `${dataSelecionada} 00:00:00`; const fimDia = `${dataSelecionada} 23:59:59`; const { data: dataPag } = await supabase.from('pagamentos').select('*, clientes(nome)').gte('created_at', inicioDia).lte('created_at', fimDia).order('created_at', { ascending: false }); setPagamentos(dataPag || []); const { data: dataDesp } = await supabase.from('despesas').select('*').eq('data_despesa', dataSelecionada).order('created_at', { ascending: false }); setDespesas(dataDesp || []); }
  async function carregarResumoCompleto() { const inicio = `${resumoInicio} 00:00:00`; const fim = `${resumoFim} 23:59:59`; const { data: dataPag } = await supabase.from('pagamentos').select('*').gte('created_at', inicio).lte('created_at', fim); setPagamentosResumo(dataPag || []); const { data: dataDesp } = await supabase.from('despesas').select('*').gte('data_despesa', resumoInicio).lte('data_despesa', resumoFim); setDespesasResumo(dataDesp || []); }
  async function abrirHistorico(cliente: any) { setClienteHistorico(cliente); setLoadingHistorico(true); const { data } = await supabase.from('pagamentos').select('*').eq('cliente_id', cliente.id).order('created_at', { ascending: false }); setHistoricoPagamentos(data || []); setLoadingHistorico(false); }

  // AUTENTICAÇÃO
  async function handleLogin() { setLoading(true); const { error } = await supabase.auth.signInWithPassword({ email, password: senha }); setLoading(false); if (error) alert("Erro ao entrar: " + error.message); }
  async function handleLogout() { await supabase.auth.signOut() }

  async function handleCadastro() {
    if (!nome.trim()) return alert("Por favor, digite seu nome.");
    if (senha !== confirmaSenha) return alert("As senhas não conferem!");
    if (senha.length < 6) return alert("A senha precisa ter pelo menos 6 caracteres.");
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password: senha, options: { data: { full_name: nome } } });
    setLoading(false);
    if (error) { alert("Erro ao cadastrar: " + error.message); }
    else { alert("Cadastro realizado! 🎉"); setAuthMode('login'); setSenha(''); setConfirmaSenha(''); }
  }

  async function handleRecuperar() {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) { alert("Erro: " + error.message); }
    else { alert("Se este e-mail existir, um link de recuperação foi enviado!"); setAuthMode('login'); }
  }

  // CRUD
  async function handleSalvarCliente() { if (!nomeCliente) return; await supabase.from('clientes').insert({ nome: nomeCliente, telefone }); setNomeCliente(''); setTelefone(''); carregarClientes() }
  async function handleSalvarPagamento() {
    if (!clienteSelecionado || !valor) return;
    const valorLimpo = Number(valor.replace(/[^0-9,]/g, '').replace(',', '.'));

    // TRUQUE DO FUSO HORÁRIO (Brasil -3h)
    const dataBrasil = new Date();
    dataBrasil.setHours(dataBrasil.getHours() - 3);

    await supabase.from('pagamentos').insert({
      cliente_id: clienteSelecionado,
      valor: valorLimpo,
      forma_pagamento: formaPagamento,
      created_at: dataBrasil // <--- Força a data/hora correta
    });

    setValor('');
    carregarMovimentacoesDia();
  }
  function solicitarExclusaoPagamento(id: string) { setModalConfirmacao({ aberto: true, titulo: 'Excluir Pagamento?', mensagem: 'Essa ação não poderá ser desfeita.', acaoConfirmar: async () => { await supabase.from('pagamentos').delete().eq('id', id); carregarMovimentacoesDia(); setModalConfirmacao(prev => ({ ...prev, aberto: false })); } }); }
  async function handleSalvarDespesa() {
    if (!descricaoDespesa || !valorDespesa) return;
    const valorLimpo = Number(valorDespesa.replace(/[^0-9,]/g, '').replace(',', '.'));

    // LÓGICA: Se for hoje, salva AGORA. Se for outra data, salva ao MEIO-DIA (para não virar o dia)
    let dataParaSalvar;
    if (dataSelecionada === hoje) {
      const agora = new Date();
      agora.setHours(agora.getHours() - 3);
      dataParaSalvar = agora;
    } else {
      // Adiciona hora fixa (12:00) para evitar que 00:00 UTC vire 21:00 do dia anterior
      dataParaSalvar = `${dataSelecionada} 12:00:00`;
    }

    await supabase.from('despesas').insert({
      descricao: descricaoDespesa,
      valor: valorLimpo,
      categoria: categoriaDespesa,
      data_despesa: dataParaSalvar // <--- Agora vai com hora segura
    });

    setDescricaoDespesa('');
    setValorDespesa('');
    carregarMovimentacoesDia();
  }
  function solicitarExclusaoDespesa(id: string) { setModalConfirmacao({ aberto: true, titulo: 'Excluir Despesa?', mensagem: 'Essa ação não poderá ser desfeita.', acaoConfirmar: async () => { await supabase.from('despesas').delete().eq('id', id); carregarMovimentacoesDia(); setModalConfirmacao(prev => ({ ...prev, aberto: false })); } }); }
  function iniciarEdicao(cliente: any) { setEditandoId(cliente.id); setNomeEdit(cliente.nome); setTelefoneEdit(cliente.telefone) }
  async function salvarEdicao() { if (!editandoId || !nomeEdit) return; await supabase.from('clientes').update({ nome: nomeEdit, telefone: telefoneEdit }).eq('id', editandoId); setEditandoId(null); carregarClientes() }
  function iniciarEdicaoPagamento(pagamento: any) { setEditandoPagamentoId(pagamento.id); setValorEdit(pagamento.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })); setFormaPagamentoEdit(pagamento.forma_pagamento) }
  async function salvarEdicaoPagamento() { if (!editandoPagamentoId || !valorEdit) return; const valorLimpo = Number(valorEdit.replace(/[^0-9,]/g, '').replace(',', '.')); await supabase.from('pagamentos').update({ valor: valorLimpo, forma_pagamento: formaPagamentoEdit }).eq('id', editandoPagamentoId); setEditandoPagamentoId(null); carregarMovimentacoesDia() }
  async function solicitarExclusaoCliente(cliente: { id: string, nome: string }) { const { data: pagamentos } = await supabase.from('pagamentos').select('id').eq('cliente_id', cliente.id); const temPagamentos = pagamentos && pagamentos.length > 0; setModalConfirmacao({ aberto: true, titulo: 'Excluir Cliente?', mensagem: temPagamentos ? `Atenção! O cliente "${cliente.nome}" possui pagamentos registrados. Se você excluir, todos os pagamentos dele também serão apagados.` : `Deseja realmente excluir o cliente "${cliente.nome}"?`, acaoConfirmar: async () => { await supabase.from('pagamentos').delete().eq('cliente_id', cliente.id); await supabase.from('clientes').delete().eq('id', cliente.id); carregarClientes(); carregarMovimentacoesDia(); setModalConfirmacao(prev => ({ ...prev, aberto: false })); } }); }

  /* ======================= RENDERIZAÇÃO LOGIN ======================= */
  if (!session) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fce7f3 0%, #f3e8ff 100%)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', padding: '20px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', padding: '40px 30px', borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.5)', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', margin: '0 auto 20px auto', boxShadow: '0 10px 25px rgba(236, 72, 153, 0.4)' }}>💅</div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '26px', color: '#1f2937', fontWeight: '800' }}> {authMode === 'login' && 'Bem-vinda!'} {authMode === 'cadastro' && 'Criar Conta'} {authMode === 'recuperar' && 'Recuperar Senha'} </h1>
          <p style={{ margin: '0 0 30px 0', color: '#6b7280', fontSize: '15px' }}> {authMode === 'login' && 'Entre para gerenciar seu studio'} {authMode === 'cadastro' && 'Preencha os dados abaixo'} {authMode === 'recuperar' && 'Digite seu e-mail para receber o link'} </p>
          <div style={{ textAlign: 'left' }}>
            {authMode === 'cadastro' && (<div style={{ position: 'relative', marginBottom: '16px' }}> <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', opacity: 0.5 }}>👤</span> <input style={{ ...inputStyle, paddingLeft: '48px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', transition: 'all 0.2s', marginBottom: 0 }} placeholder="Seu nome completo" value={nome} onChange={(e) => setNome(e.target.value)} /> </div>)}
            <div style={{ position: 'relative', marginBottom: '16px' }}> <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', opacity: 0.5 }}>✉️</span> <input style={{ ...inputStyle, paddingLeft: '48px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', transition: 'all 0.2s', marginBottom: 0 }} placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} /> </div>
            {authMode !== 'recuperar' && (<div style={{ position: 'relative', marginBottom: authMode === 'login' ? '10px' : '16px' }}> <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', opacity: 0.5 }}>🔒</span> <input style={{ ...inputStyle, paddingLeft: '48px', paddingRight: '40px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', marginBottom: 0 }} type={verSenha ? "text" : "password"} placeholder="Sua senha" value={senha} onChange={(e) => setSenha(e.target.value)} /> <span onClick={() => setVerSenha(!verSenha)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', opacity: 0.5, fontSize: '16px' }}> {verSenha ? '🙈' : '👁️'} </span> </div>)}
            {authMode === 'cadastro' && (<div style={{ position: 'relative', marginBottom: '10px' }}> <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', opacity: 0.5 }}>🔐</span> <input style={{ ...inputStyle, paddingLeft: '48px', paddingRight: '40px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', marginBottom: 0 }} type={verConfirmaSenha ? "text" : "password"} placeholder="Confirme a senha" value={confirmaSenha} onChange={(e) => setConfirmaSenha(e.target.value)} /> <span onClick={() => setVerConfirmaSenha(!verConfirmaSenha)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', opacity: 0.5, fontSize: '16px' }}> {verConfirmaSenha ? '🙈' : '👁️'} </span> </div>)}
            {authMode === 'login' && (<div style={{ textAlign: 'right', marginBottom: '24px' }}> <button onClick={() => setAuthMode('recuperar')} style={{ background: 'none', border: 'none', color: '#8b5cf6', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>Esqueceu a senha?</button> </div>)}
            {authMode !== 'login' && <div style={{ marginBottom: '24px' }}></div>}
            <button onClick={() => { if (authMode === 'login') handleLogin(); if (authMode === 'cadastro') handleCadastro(); if (authMode === 'recuperar') handleRecuperar(); }} disabled={loading} style={{ ...buttonStyle, background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', boxShadow: '0 10px 20px rgba(236, 72, 153, 0.3)', padding: '16px', fontSize: '16px', letterSpacing: '0.5px' }}> {loading ? 'Carregando...' : (authMode === 'login' ? 'Entrar no Sistema' : authMode === 'cadastro' ? 'Cadastrar Conta' : 'Enviar Link')} </button>
          </div>
          <div style={{ marginTop: '25px', fontSize: '14px', color: '#6b7280' }}> {authMode === 'login' ? (<>Não tem uma conta? <button onClick={() => setAuthMode('cadastro')} style={{ background: 'none', border: 'none', color: '#ec4899', fontWeight: 'bold', cursor: 'pointer' }}>Cadastre-se</button></>) : (<>Já tem conta? <button onClick={() => setAuthMode('login')} style={{ background: 'none', border: 'none', color: '#ec4899', fontWeight: 'bold', cursor: 'pointer' }}>Fazer Login</button></>)} </div>
        </div>
      </div>
    )
  }

  /* ======================= RENDERIZAÇÃO APP ======================= */
  return (
    <div style={mainContainerStyle}>
      <div style={{ padding: '20px 20px 10px 20px', background: '#F2F2F7', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}> <h1 style={{ margin: 0, fontSize: '34px', fontWeight: 'bold', color: '#000' }}>Studio 💅</h1> </div>
        <div style={tabsContainerStyle}>
          <button onClick={() => setAbaAtiva('home')} style={tabStyle(abaAtiva === 'home')}>Início</button>
          <button onClick={() => setAbaAtiva('clientes')} style={tabStyle(abaAtiva === 'clientes')}>Clientes</button>
          <button onClick={() => setAbaAtiva('caixa')} style={tabStyle(abaAtiva === 'caixa')}>Caixa</button>
          <button onClick={() => setAbaAtiva('resumo')} style={tabStyle(abaAtiva === 'resumo')}>Resumo</button>
        </div>
      </div>

      <div style={{ padding: '0 20px 100px 20px' }}>

        {/* DASHBOARD / HOME */}
        {abaAtiva === 'home' && (
          <div className="animate-fade-in">
            <div style={{ marginBottom: 20 }}>
              <span style={{ color: '#8E8E93', fontSize: 14, textTransform: 'uppercase', fontWeight: '600' }}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>

              {/* SAUDAÇÃO PERSONALIZADA AQUI 👇 */}
              <h2 style={{ margin: '5px 0 0', fontSize: 28 }}>
                Olá, {session.user.user_metadata.full_name?.split(' ')[0] || 'Ana'}! 👋
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div style={{ background: '#fff', padding: 16, borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: 12, color: '#8E8E93', marginBottom: 5 }}>Entradas Hoje</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#16a34a' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalEntradasDia)}</div>
              </div>
              <div style={{ background: '#fff', padding: 16, borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: 12, color: '#8E8E93', marginBottom: 5 }}>Lucro do Dia</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#007AFF' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalEntradasDia - totalSaidasDia)}</div>
              </div>
            </div>
            <h3 style={{ fontSize: 18, marginBottom: 10 }}>Acesso Rápido</h3>
            <div style={{ display: 'flex', gap: 10, marginBottom: 30 }}>
              <button onClick={() => { setAbaAtiva('caixa'); setTipoMovimento('entrada'); }} style={{ flex: 1, background: '#16a34a', color: 'white', border: 'none', padding: '15px', borderRadius: 12, fontSize: 15, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}> <span>💰</span> Nova Entrada </button>
              <button onClick={() => { setAbaAtiva('clientes'); }} style={{ flex: 1, background: '#007AFF', color: 'white', border: 'none', padding: '15px', borderRadius: 12, fontSize: 15, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}> <span>👤</span> Novo Cliente </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ fontSize: 18, margin: 0 }}>Últimas do Dia</h3>
              <button onClick={() => setAbaAtiva('caixa')} style={{ background: 'transparent', border: 'none', color: '#007AFF', fontSize: 14, cursor: 'pointer' }}>Ver tudo</button>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, padding: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              {pagamentos.length === 0 && despesas.length === 0 ? (<p style={{ textAlign: 'center', color: '#ccc', padding: 20 }}>Nada por enquanto...</p>) : (<ul style={{ padding: 0, margin: 0 }}> {pagamentos.slice(0, 3).map(p => (<li key={p.id} style={{ listStyle: 'none', padding: '12px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}> <div style={{ background: '#dcfce7', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💅</div> <div> <div style={{ fontWeight: '600', fontSize: 14 }}>{p.clientes?.nome}</div> <div style={{ fontSize: 11, color: '#888' }}>{p.forma_pagamento}</div> </div> </div> <strong style={{ color: '#16a34a', fontSize: 14 }}>+{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor)}</strong> </li>))} {despesas.slice(0, 2).map(d => (<li key={d.id} style={{ listStyle: 'none', padding: '12px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}> <div style={{ background: '#fee2e2', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💸</div> <div> <div style={{ fontWeight: '600', fontSize: 14 }}>{d.descricao}</div> <div style={{ fontSize: 11, color: '#888' }}>{d.categoria}</div> </div> </div> <strong style={{ color: '#ef4444', fontSize: 14 }}>-{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(d.valor)}</strong> </li>))} </ul>)}
            </div>
          </div>
        )}

        {/* CLIENTES */}
        {abaAtiva === 'clientes' && (
          <div className="animate-fade-in">
            {!editandoId && (<div style={{ background: '#fff', padding: '20px', borderRadius: '14px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}> <h3 style={{ marginTop: 0, fontSize: '20px' }}>Novo Cliente</h3> <input style={inputStyle} placeholder="Nome" value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} /> <input style={inputStyle} placeholder="(99) 99999-9999" value={telefone} maxLength={15} onChange={(e) => handleTelefoneChange(e, setTelefone)} /> <button style={buttonStyle} onClick={handleSalvarCliente}>Salvar Cliente</button> </div>)}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 10px 10px 10px' }}> <h3 style={{ margin: 0, color: '#666', fontSize: 14, textTransform: 'uppercase' }}>Lista de Clientes</h3> <span style={{ background: '#E5E5EA', color: '#666', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>{clientes.length}</span> </div>
            <ul style={{ padding: 0, background: '#fff', borderRadius: '12px', overflow: 'hidden' }}> {clientes.map((c, index) => { const isEditing = editandoId === c.id; return (<li key={c.id} style={{ listStyle: 'none', padding: '16px', background: 'white', borderBottom: index === clientes.length - 1 ? 'none' : '1px solid #E5E5EA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> {isEditing ? (<div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}> <strong style={{ color: '#007AFF' }}>Editando Cliente:</strong> <input style={{ ...inputStyle, marginBottom: 0, padding: 8 }} value={nomeEdit} onChange={e => setNomeEdit(e.target.value)} placeholder="Nome" /> <input style={{ ...inputStyle, marginBottom: 0, padding: 8 }} value={telefoneEdit} maxLength={15} onChange={e => handleTelefoneChange(e, setTelefoneEdit)} placeholder="(99) 99999-9999" /> <div style={{ display: 'flex', gap: 10, marginTop: 5 }}> <button onClick={salvarEdicao} style={{ flex: 1, background: '#34C759', color: 'white', border: 'none', padding: 10, borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>Salvar</button> <button onClick={() => setEditandoId(null)} style={{ flex: 1, background: '#E5E5EA', color: '#000', border: 'none', padding: 10, borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button> </div> </div>) : (<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}> <div><strong style={{ fontSize: 17 }}>{c.nome}</strong><br /><small style={{ color: '#8E8E93', fontSize: 14 }}>{formatarTelefone(c.telefone)}</small></div> <div style={{ display: 'flex', gap: 8 }}> <button onClick={() => abrirHistorico(c)} style={{ background: '#e0f2fe', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 16 }} title="Ver Histórico">📜</button> <button onClick={() => iniciarEdicao(c)} style={{ color: '#007AFF', background: '#F2F2F7', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: '500' }}>Editar</button> <button onClick={() => solicitarExclusaoCliente(c)} style={{ color: '#FF3B30', background: '#F2F2F7', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: '500' }}>Excluir</button> </div> </div>)} </li>) })} </ul>
          </div>
        )}

        {/* MOVIMENTAÇÕES (CAIXA) */}
        {abaAtiva === 'caixa' && (
          <div className="animate-fade-in">
            <div style={{ background: '#fff', padding: '15px', borderRadius: '14px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Data do Caixa:</label>
              <input
                type="date"
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #eee',
                  fontSize: '16px',
                  outline: 'none',
                  color: '#333',
                  background: '#f9f9f9',
                  WebkitAppearance: 'none'
                }}
              />
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', background: '#F2F2F7', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
                <button onClick={() => setTipoMovimento('entrada')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: tipoMovimento === 'entrada' ? '#fff' : 'transparent', color: tipoMovimento === 'entrada' ? '#16a34a' : '#8E8E93', fontWeight: 'bold', boxShadow: tipoMovimento === 'entrada' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none', transition: '0.2s' }}>Entrada (+)</button>
                <button onClick={() => setTipoMovimento('saida')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: tipoMovimento === 'saida' ? '#fff' : 'transparent', color: tipoMovimento === 'saida' ? '#ef4444' : '#8E8E93', fontWeight: 'bold', boxShadow: tipoMovimento === 'saida' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none', transition: '0.2s' }}>Saída (-)</button>
              </div>
              {tipoMovimento === 'entrada' ? (<> <h3 style={{ marginTop: 0, fontSize: '20px', color: '#16a34a' }}>Nova Entrada</h3> <CustomSelect value={clienteSelecionado} onChange={(e: any) => setClienteSelecionado(e.target.value)} placeholder="Selecione o Cliente" options={[{ value: "", label: "Selecione o Cliente" }, ...clientes.map(c => ({ value: c.id, label: c.nome }))]} /> <input style={inputStyle} placeholder="Valor (R$)" value={valor} onChange={(e) => setValor(formatarMoeda(e.target.value))} inputMode="numeric" /> <CustomSelect value={formaPagamento} onChange={(e: any) => setFormaPagamento(e.target.value)} placeholder="Selecione a Forma" options={[{ value: "dinheiro", label: "Dinheiro 💵" }, { value: "pix", label: "Pix 💠" }, { value: "cartao", label: "Cartão 💳" }]} /> <button style={{ ...buttonStyle, background: '#16a34a' }} onClick={handleSalvarPagamento}>Salvar Entrada</button> </>) : (<> <h3 style={{ marginTop: 0, fontSize: '20px', color: '#ef4444' }}>Nova Despesa</h3> <input style={inputStyle} placeholder="Descrição (Ex: Esmaltes, Luz)" value={descricaoDespesa} onChange={(e) => setDescricaoDespesa(e.target.value)} /> <input style={inputStyle} placeholder="Valor (R$)" value={valorDespesa} onChange={(e) => setValorDespesa(formatarMoeda(e.target.value))} inputMode="numeric" /> <CustomSelect value={categoriaDespesa} onChange={(e: any) => setCategoriaDespesa(e.target.value)} placeholder="Categoria" options={[{ value: "material", label: "Material 💅" }, { value: "fixo", label: "Custo Fixo 💡" }, { value: "pessoal", label: "Pessoal 🏠" }, { value: "outros", label: "Outros 📦" }]} /> <button style={{ ...buttonStyle, background: '#ef4444' }} onClick={handleSalvarDespesa}>Salvar Despesa</button> </>)}
            </div>
            <h3 style={{ marginBottom: '10px' }}>Movimentações do Dia</h3>
            <div style={{ display: 'flex', borderBottom: '1px solid #E5E5EA', marginBottom: '15px' }}>
              <div onClick={() => setVerLista('entradas')} style={{ flex: 1, textAlign: 'center', padding: '10px', cursor: 'pointer', borderBottom: verLista === 'entradas' ? '2px solid #16a34a' : 'none', color: verLista === 'entradas' ? '#16a34a' : '#8E8E93', fontWeight: '600' }}>Entradas ({pagamentos.length})</div>
              <div onClick={() => setVerLista('saidas')} style={{ flex: 1, textAlign: 'center', padding: '10px', cursor: 'pointer', borderBottom: verLista === 'saidas' ? '2px solid #ef4444' : 'none', color: verLista === 'saidas' ? '#ef4444' : '#8E8E93', fontWeight: '600' }}>Saídas ({despesas.length})</div>
            </div>
            {verLista === 'entradas' && (<ul style={{ padding: 0 }}> {pagamentos.map(p => { const isEditing = editandoPagamentoId === p.id; return (<li key={p.id} style={{ listStyle: 'none', padding: 15, borderBottom: '1px solid #eee', background: isEditing ? '#fff0f5' : 'white', marginBottom: 10, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}> {isEditing ? (<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}> <strong style={{ color: '#be185d' }}>Editando {p.clientes?.nome}:</strong> <div style={{ display: 'flex', gap: 10 }}> <input style={{ ...inputStyle, marginBottom: 0, flex: 1, height: 38, padding: '8px' }} value={valorEdit} onChange={e => setValorEdit(formatarMoeda(e.target.value))} placeholder="Valor" inputMode="numeric" /> <select style={{ ...selectStyle, marginBottom: 0, flex: 1, height: 38, padding: '0 30px 0 10px', fontSize: 14 }} value={formaPagamentoEdit} onChange={e => setFormaPagamentoEdit(e.target.value)} > <option value="dinheiro">Dinheiro 💵</option> <option value="pix">Pix 💠</option> <option value="cartao">Cartão 💳</option> </select> </div> <div style={{ display: 'flex', gap: 10 }}> <button onClick={salvarEdicaoPagamento} style={{ flex: 1, background: '#16a34a', color: 'white', border: 'none', padding: 10, borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}>Salvar</button> <button onClick={() => setEditandoPagamentoId(null)} style={{ flex: 1, background: '#ccc', color: 'black', border: 'none', padding: 10, borderRadius: 6, cursor: 'pointer' }}>Cancelar</button> </div> </div>) : (<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}> <div><strong style={{ fontSize: '16px' }}>{p.clientes?.nome}</strong><br /><span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', background: '#ecfccb', color: '#365314', textTransform: 'capitalize', display: 'inline-block', marginTop: '4px' }}>{p.forma_pagamento}</span></div> <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}> <strong style={{ color: '#16a34a', fontSize: '17px' }}>+ {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor)}</strong> <div style={{ display: 'flex', gap: '8px' }}> <button onClick={() => iniciarEdicaoPagamento(p)} style={{ color: '#007AFF', border: 'none', background: '#F2F2F7', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: '500' }}>Editar</button> <button onClick={() => solicitarExclusaoPagamento(p.id)} style={{ color: '#FF3B30', border: 'none', background: '#F2F2F7', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: '500' }}>Excluir</button> </div> </div> </div>)} </li>) })} {pagamentos.length === 0 && <p style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>Nenhuma entrada registrada hoje.</p>} </ul>)}
            {verLista === 'saidas' && (<ul style={{ padding: 0 }}> {despesas.map(d => (<li key={d.id} style={{ listStyle: 'none', padding: 15, borderBottom: '1px solid #eee', background: 'white', marginBottom: 10, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}> <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}> <div><strong style={{ fontSize: '16px' }}>{d.descricao}</strong><br /><span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', background: '#fee2e2', color: '#7f1d1d', textTransform: 'capitalize', display: 'inline-block', marginTop: '4px' }}>{d.categoria}</span></div> <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}> <strong style={{ color: '#ef4444', fontSize: '17px' }}>- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(d.valor)}</strong> <button onClick={() => solicitarExclusaoDespesa(d.id)} style={{ color: '#FF3B30', border: 'none', background: '#F2F2F7', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Excluir</button> </div> </div> </li>))} {despesas.length === 0 && <p style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>Nenhuma despesa registrada hoje.</p>} </ul>)}
          </div>
        )}

        {/* RESUMO */}
        {abaAtiva === 'resumo' && (
          <div className="animate-fade-in">
            <div style={{ background: '#fff', padding: '15px', borderRadius: '14px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#666' }}>Período do Relatório</h3>

              <div style={{ display: 'flex', gap: '10px' }}>

                {/* Campo DE */}
                <div style={{ flex: 1, minWidth: 0 }}> {/* minWidth: 0 é o segredo pro flex não estourar */}
                  <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>De:</label>
                  <input
                    type="date"
                    value={resumoInicio}
                    onChange={e => setResumoInicio(e.target.value)}
                    style={{
                      ...inputStyle,
                      width: '100%',
                      minWidth: '100%',     // Força bruta pra ocupar só o espaço dele
                      boxSizing: 'border-box',
                      marginBottom: 0,
                      padding: '8px',
                      fontSize: '13px',
                      WebkitAppearance: 'none' // Remove estilo nativo teimoso do iPhone
                    }}
                  />
                </div>

                {/* Campo ATÉ */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Até:</label>
                  <input
                    type="date"
                    value={resumoFim}
                    onChange={e => setResumoFim(e.target.value)}
                    style={{
                      ...inputStyle,
                      width: '100%',
                      minWidth: '100%',
                      boxSizing: 'border-box',
                      marginBottom: 0,
                      padding: '8px',
                      fontSize: '13px',
                      WebkitAppearance: 'none'
                    }}
                  />
                </div>

              </div>
            </div>
            <h4 style={{ margin: '0 0 10px', color: '#666' }}>Detalhamento Entradas</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: 20, width: '100%', boxSizing: 'border-box' }}> <div style={{ background: '#fff', padding: 10, borderRadius: 8, textAlign: 'center' }}><span style={{ fontSize: 24 }}>💵</span><div style={{ fontSize: 12, color: '#666' }}>Dinheiro</div><strong style={{ fontSize: 13 }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDinheiroResumo)}</strong></div> <div style={{ background: '#fff', padding: 10, borderRadius: 8, textAlign: 'center' }}><span style={{ fontSize: 24 }}>📱</span><div style={{ fontSize: 12, color: '#666' }}>Pix</div><strong style={{ fontSize: 13 }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPixResumo)}</strong></div> <div style={{ background: '#fff', padding: 10, borderRadius: 8, textAlign: 'center' }}><span style={{ fontSize: 24 }}>💳</span><div style={{ fontSize: 12, color: '#666' }}>Cartão</div><strong style={{ fontSize: 13 }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCartaoResumo)}</strong></div> </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 15 }}> <div style={{ background: '#dcfce7', padding: 20, borderRadius: 12, textAlign: 'center' }}> <div style={{ fontSize: 14, color: '#166534', marginBottom: 5 }}>Total Entradas</div> <strong style={{ fontSize: 18, color: '#15803d' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalEntradas)}</strong> </div> <div style={{ background: '#fee2e2', padding: 20, borderRadius: 12, textAlign: 'center' }}> <div style={{ fontSize: 14, color: '#991b1b', marginBottom: 5 }}>Total Saídas</div> <strong style={{ fontSize: 18, color: '#b91c1c' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSaidas)}</strong> </div> </div>
            <div style={{ background: '#3b82f6', padding: 25, borderRadius: 12, textAlign: 'center', marginBottom: 20, boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' }}> <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontWeight: 'normal', opacity: 0.9 }}>Lucro Líquido</h3> <h1 style={{ margin: 0, color: '#fff', fontSize: 36 }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lucroLiquido)}</h1> </div>
            <button style={{ ...buttonStyle, background: '#2563eb', padding: '15px' }} onClick={() => window.print()}>📄 Gerar Relatório</button>
          </div>
        )}
      </div>

      <button onClick={handleLogout} style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50px', width: '50px', height: '50px', fontSize: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', cursor: 'pointer', zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Sair">Sair</button>

      {/* MODAIS POPUP */}
      {modalConfirmacao.aberto && (<div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}> <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '24px 20px', borderRadius: '16px', maxWidth: '300px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center', animation: 'popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}> <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#000' }}>{modalConfirmacao.titulo}</h3> <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: '1.4' }}>{modalConfirmacao.mensagem}</p> <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}> <button onClick={modalConfirmacao.acaoConfirmar} style={{ width: '100%', padding: '14px', background: '#ff3b30', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', color: 'white', cursor: 'pointer' }}>Sim, excluir</button> <button onClick={() => setModalConfirmacao(prev => ({ ...prev, aberto: false }))} style={{ width: '100%', padding: '14px', background: '#f2f2f7', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', color: '#007aff', cursor: 'pointer' }}>Cancelar</button> </div> </div> </div>)}


      {clienteHistorico && (<div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}> <div style={{ background: '#F2F2F7', width: '100%', maxWidth: '400px', maxHeight: '80vh', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', animation: 'popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}> <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}> <div><h2 style={{ margin: 0, fontSize: '20px', color: '#000' }}>{clienteHistorico.nome}</h2><span style={{ color: '#666', fontSize: '14px' }}>Histórico Completo</span></div> <button onClick={() => setClienteHistorico(null)} style={{ background: '#E5E5EA', border: 'none', borderRadius: '50%', width: 32, height: 32, fontWeight: 'bold', color: '#8E8E93', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button> </div> <div style={{ background: '#fff', padding: 16, borderRadius: 16, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> <div><div style={{ fontSize: 13, color: '#8E8E93', marginBottom: 4 }}>Total Gasto</div><strong style={{ fontSize: 22, color: '#34C759', letterSpacing: '-0.5px' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(historicoPagamentos.reduce((acc, p) => acc + Number(p.valor), 0))}</strong></div> <div style={{ textAlign: 'right' }}><div style={{ fontSize: 13, color: '#8E8E93', marginBottom: 4 }}>Visitas</div><strong style={{ fontSize: 22, color: '#000' }}>{historicoPagamentos.length}</strong></div> </div> <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}> {loadingHistorico ? (<p style={{ textAlign: 'center', color: '#8E8E93', margin: '40px 0' }}>Carregando...</p>) : (<ul style={{ padding: 0, margin: 0 }}> {historicoPagamentos.map(p => (<li key={p.id} style={{ listStyle: 'none', background: '#fff', padding: '14px', borderRadius: 12, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(0,0,0,0.03)' }}> <div> <div style={{ fontWeight: '600', fontSize: 15, color: '#000' }}>{new Date(p.created_at).toLocaleDateString('pt-BR')}</div> <span style={{ fontSize: 12, background: '#F2F2F7', padding: '3px 8px', borderRadius: 6, color: '#666', textTransform: 'capitalize', fontWeight: '500', display: 'inline-block', marginTop: 4 }}>{p.forma_pagamento}</span> </div> <strong style={{ color: '#000', fontSize: 16 }}> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor)} </strong> </li>))} {historicoPagamentos.length === 0 && (<div style={{ textAlign: 'center', padding: '40px 20px', color: '#8E8E93' }}><span style={{ fontSize: 30, display: 'block', marginBottom: 10 }}>📭</span>Nenhum histórico encontrado.</div>)} </ul>)} </div> </div> <style>{`@keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style> </div>)}

      <style>
        {`
              @keyframes popIn { 
                from { opacity: 0; transform: scale(0.95); } 
                to { opacity: 1; transform: scale(1); } 
              }

              /* ADICIONE ISTO AQUI PARA O EFEITO DE CLIQUE EM TUDO */
              button {
                transition: transform 0.1s ease, opacity 0.1s ease;
              }
              
              button:active {
                transform: scale(0.95); /* Diminui 5% ao clicar */
                opacity: 0.8;           /* Fica levemente transparente */
              }
            `}
      </style>

    </div>

  )

}

export default App