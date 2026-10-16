import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, UserCircle2 } from 'lucide-react';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { avisar } from './avisos';

type Cliente = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
};

export default function Perfil() {
  const { user, loadingAuth } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  
  const [cadastro, setCadastro] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [admin, setAdmin] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!user) {
      setCliente(null);
      setAdmin(false);
      return;
    }

    let ativo = true;

    const carregar = async () => {
      setCarregando(true);
      try {
        const clienteCriado = await supabase.rpc('garantir_cliente');
        if (clienteCriado.error) throw clienteCriado.error;

        const [perfil, administrador] = await Promise.all([
          supabase.from('clientes').select('id, nome, email, telefone').eq('id', clienteCriado.data).single(),
          supabase.rpc('usuario_e_admin'),
        ]);

        if (perfil.error) throw perfil.error;
        if (administrador.error) throw administrador.error;

        if (ativo) {
          const registro = perfil.data as Cliente;
          setCliente(registro);
          setNome(registro.nome);
          setEmail(registro.email);
          setTelefone(registro.telefone || '');
          setAdmin(Boolean(administrador.data));
        }
      } catch (error: any) {
        if (ativo) avisar('Erro ao carregar perfil', error?.message || 'Tente novamente.');
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    carregar();
    return () => {
      ativo = false;
    };
  }, [user]);

  const autenticar = async () => {
    if (!email.trim() || !senha) {
      avisar('Atenção', 'Informe seu e-mail e senha.');
      return;
    }

    if (cadastro && (!nome.trim() || senha.length < 8)) {
      avisar('Atenção', 'Informe seu nome e uma senha com pelo menos 8 caracteres.');
      return;
    }

    setCarregando(true);
    try {
      if (cadastro) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password: senha,
          options: { data: { nome: nome.trim() } },
        });
        if (error) throw error;
        if (!data.session) {
          throw new Error('Conta criada, mas não foi possível iniciar a sessão.');
        }

        avisar('Cadastro realizado', 'Sua conta foi criada com sucesso!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: senha,
        });
        if (error) throw error;
        const resultado = await supabase.rpc('garantir_cliente');
        if (resultado.error) throw resultado.error;
        avisar('Bem-vindo', 'Login realizado com sucesso.');
      }
      setSenha('');
    } catch (error: any) {
      avisar('Não foi possível continuar', error?.message || 'Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const salvarPerfil = async () => {
    if (!user || !cliente || !nome.trim()) {
      avisar('Atenção', 'Informe seu nome.');
      return;
    }

    setCarregando(true);
    try {
      const { error } = await supabase
        .from('clientes')
        .update({ nome: nome.trim(), telefone: telefone.trim() || null })
        .eq('id', cliente.id);

      if (error) throw error;
      setCliente({ ...cliente, nome: nome.trim(), telefone: telefone.trim() || null });
      avisar('Perfil', 'Dados atualizados com sucesso.');
    } catch (error: any) {
      avisar('Erro ao salvar', error?.message || 'Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const sair = async () => {
    setCarregando(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      avisar('Erro ao sair', error.message);
    } else {
      clearCart();
      setNome('');
      setEmail('');
      setTelefone('');
      setSenha('');
    }
    setCarregando(false);
  };

  const inputStyle = {
    width: '100%',
    minHeight: '52px',
    backgroundColor: '#F9FAFB', 
    border: '1px solid #E5E7EB', 
    borderRadius: '12px',
    padding: '0 16px',
    fontSize: '15px',
    color: '#111827',
    marginBottom: '20px',
    boxSizing: 'border-box' as const,
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: '6px',
    marginLeft: '2px'
  };

  if (loadingAuth) {
    return (
      <div style={{ display: 'flex', minHeight: '50vh', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} color="#6D28D9" className="animate-spin" />
      </div>
    );
  }

  return (
    <main style={{ padding: '48px 24px', display: 'flex', justifyContent: 'center' }}>
      <div 
        style={{ 
          width: '100%',
          maxWidth: '540px', 
          backgroundColor: '#FFFFFF', 
          borderRadius: '24px', 
          padding: '48px 40px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
          border: '1px solid #EAECF5'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '36px' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: '#F5F3FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <UserCircle2 size={32} color="#6D28D9" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#17182B', margin: '0' }}>
            {user ? 'Sua Conta' : cadastro ? 'Criar Conta' : 'Acesse sua Conta'}
          </h1>
          <p style={{ color: '#73788B', marginTop: '8px', fontSize: '15px' }}>
            {user ? 'Gerencie seus dados pessoais' : 'Acompanhe seus pedidos e gerencie seu carrinho'}
          </p>
        </div>

        {user ? (
          <div>
            <label style={labelStyle}>Nome Completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              style={inputStyle}
            />

            <label style={labelStyle}>Endereço de E-mail</label>
            <input
              type="email"
              value={user.email || email}
              readOnly
              style={{ ...inputStyle, backgroundColor: '#F3F4F6', color: '#9CA3AF', cursor: 'not-allowed' }}
            />

            <label style={labelStyle}>Telemóvel / Telefone</label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
              style={inputStyle}
            />

            <button
              onClick={salvarPerfil}
              disabled={carregando || !cliente}
              style={{
                width: '100%',
                minHeight: '52px',
                backgroundColor: '#6D28D9',
                color: '#FFF',
                fontWeight: '700',
                fontSize: '16px',
                borderRadius: '14px',
                border: 'none',
                cursor: carregando || !cliente ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(109,40,217,0.2)',
                marginTop: '12px',
                transition: 'all 0.2s'
              }}
            >
              {carregando ? <Loader2 size={24} className="animate-spin" color="#FFF" /> : 'Salvar Alterações'}
            </button>

            {admin && (
              <button
                onClick={() => navigate('/gestao')}
                style={{
                  width: '100%',
                  minHeight: '52px',
                  backgroundColor: '#1E293B', 
                  color: '#FFF',
                  fontWeight: '700',
                  fontSize: '16px',
                  borderRadius: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '16px'
                }}
              >
                Gestão da Loja (Admin)
              </button>
            )}

            <button
              onClick={sair}
              disabled={carregando}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#EF4444',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '24px 0 8px 0'
              }}
            >
              Sair da conta
            </button>
          </div>
        ) : (
          <div>
            {cadastro && (
              <>
                <label style={labelStyle}>Nome completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  style={inputStyle}
                />
              </>
            )}

            <label style={labelStyle}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              style={inputStyle}
            />

            <label style={labelStyle}>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              style={inputStyle}
            />

            <button
              onClick={autenticar}
              disabled={carregando}
              style={{
                width: '100%',
                minHeight: '52px',
                backgroundColor: '#6D28D9',
                color: '#FFF',
                fontWeight: '700',
                fontSize: '16px',
                borderRadius: '14px',
                border: 'none',
                cursor: carregando ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(109,40,217,0.2)',
                marginTop: '12px'
              }}
            >
              {carregando ? <Loader2 size={24} className="animate-spin" color="#FFF" /> : cadastro ? 'Cadastrar' : 'Entrar na Conta'}
            </button>

            <button
              onClick={() => setCadastro(!cadastro)}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#6B7280',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '24px 0 8px 0'
              }}
            >
              {cadastro ? 'Já tenho uma conta' : 'Ainda não tem conta? Cadastre-se'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}