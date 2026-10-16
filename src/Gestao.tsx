import { useCallback, useState, useEffect } from 'react';
import { Loader2, RefreshCw, Edit, ShieldAlert, Package, ShoppingBag } from 'lucide-react';
import { useAuth } from './AuthContext';
import { supabase } from './supabase';
import { type Pedido, type Produto, dataBrasil, dinheiro } from './tipos';
import { avisar } from './avisos';

const proximosStatus: Record<string, string[]> = {
  pendente: ['confirmado', 'cancelado'],
  confirmado: ['enviado', 'cancelado'],
  enviado: ['entregue'],
  entregue: [],
  cancelado: [],
};

export default function Gestao() {
  const { user } = useAuth();
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [aba, setAba] = useState<'produtos' | 'pedidos'>('produtos');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<Record<string, string>>({});
  
  const [produtoId, setProdutoId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('0');
  const [imagemUrl, setImagemUrl] = useState('');
  const [ativo, setAtivo] = useState(true);

  const carregar = useCallback(async () => {
    if (!user) {
      setAdmin(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const verificacao = await supabase.rpc('usuario_e_admin');
      if (verificacao.error) throw verificacao.error;
      const podeGerenciar = Boolean(verificacao.data);
      setAdmin(podeGerenciar);
      if (!podeGerenciar) return;

      const [respostaProdutos, respostaPedidos] = await Promise.all([
        supabase
          .from('produtos')
          .select('id, nome, descricao, preco, estoque:quantidade_estoque, imagem_url, ativo')
          .order('nome'),
        supabase
          .from('pedidos')
          .select('id, numero_pedido, cliente_id, status, total, created_at')
          .order('created_at', { ascending: false })
          .limit(100),
      ]);

      if (respostaProdutos.error) throw respostaProdutos.error;
      if (respostaPedidos.error) throw respostaPedidos.error;

      const listaPedidos = (respostaPedidos.data || []) as Pedido[];
      setProdutos((respostaProdutos.data || []) as Produto[]);
      setPedidos(listaPedidos);

      const idsClientes = [...new Set(listaPedidos.map((pedido) => pedido.cliente_id).filter(Boolean))] as string[];
      if (idsClientes.length > 0) {
        const respostaClientes = await supabase
          .from('clientes')
          .select('id, nome, email')
          .in('id', idsClientes);
        if (respostaClientes.error) throw respostaClientes.error;
        const nomes: Record<string, string> = {};
        for (const cliente of respostaClientes.data || []) {
          nomes[cliente.id] = `${cliente.nome} (${cliente.email})`;
        }
        setClientes(nomes);
      } else {
        setClientes({});
      }
    } catch (error: any) {
      avisar('Erro na gestão', error?.message || 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const limparFormulario = () => {
    setProdutoId(null);
    setNome('');
    setDescricao('');
    setPreco('');
    setEstoque('0');
    setImagemUrl('');
    setAtivo(true);
  };

  const editarProduto = (produto: Produto) => {
    setProdutoId(produto.id);
    setNome(produto.nome);
    setDescricao(produto.descricao || '');
    setPreco(String(produto.preco));
    setEstoque(String(produto.estoque));
    setImagemUrl(produto.imagem_url || '');
    setAtivo(produto.ativo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const salvarProduto = async () => {
    const precoNumero = Number(preco.trim().replace(',', '.'));
    const estoqueNumero = Number(estoque.trim());
    const url = imagemUrl.trim();

    if (!nome.trim() || !Number.isFinite(precoNumero) || precoNumero < 0 || !Number.isInteger(estoqueNumero) || estoqueNumero < 0) {
      avisar('Dados inválidos', 'Informe nome, preço válido e estoque inteiro não negativo.');
      return;
    }

    if (url && !/^https:\/\//i.test(url)) {
      avisar('Imagem inválida', 'Informe uma URL HTTPS pública da imagem.');
      return;
    }

    const dados = {
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      preco: precoNumero,
      quantidade_estoque: estoqueNumero,
      imagem_url: url || null,
      ativo,
    };

    setSalvando(true);
    try {
      const resposta = produtoId
        ? await supabase.from('produtos').update(dados).eq('id', produtoId)
        : await supabase.from('produtos').insert(dados);
      if (resposta.error) throw resposta.error;
      limparFormulario();
      avisar('Produto', 'Produto salvo com sucesso.');
      await carregar();
    } catch (error: any) {
      avisar('Não foi possível salvar', error?.message || 'Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const alterarStatus = async (pedidoId: string, status: string) => {
    setSalvando(true);
    try {
      const { error } = await supabase.rpc('alterar_status_pedido', {
        p_pedido_id: pedidoId,
        p_status: status,
      });
      if (error) throw error;
      avisar('Pedido', 'Status atualizado com sucesso.');
      await carregar();
    } catch (error: any) {
      avisar('Erro ao alterar pedido', error?.message || 'Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const inputStyle = {
    width: '100%',
    minHeight: '48px',
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '10px',
    padding: '0 16px',
    fontSize: '14px',
    color: '#111827',
    marginBottom: '16px',
    boxSizing: 'border-box' as const,
    outline: 'none',
  };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.03)',
    border: '1px solid #EAECF5'
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={48} color="#6D28D9" className="animate-spin" />
      </div>
    );
  }

  if (!user || !admin) {
    return (
      <div style={{ display: 'flex', minHeight: '60vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
        <ShieldAlert size={64} color="#EF4444" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#17182B', margin: '0 0 8px 0' }}>Acesso Restrito</h2>
        <p style={{ color: '#73788B', fontSize: '15px' }}>Área restrita aos administradores cadastrados no Supabase.</p>
      </div>
    );
  }

  return (
    <main style={{ padding: '32px 24px 120px 24px', maxWidth: '1280px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#17182B', margin: 0 }}>Gestão da Loja</h1>
        <button
          onClick={carregar}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'transparent', border: 'none', color: '#6D28D9', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
        >
          <RefreshCw size={18} />
          Atualizar Dados
        </button>
      </div>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        <div style={{ width: '100%', maxWidth: '240px', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={() => setAba('produtos')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '16px',
              backgroundColor: aba === 'produtos' ? '#6D28D9' : '#FFFFFF',
              color: aba === 'produtos' ? '#FFFFFF' : '#4B5563',
              borderRadius: '16px', border: aba === 'produtos' ? 'none' : '1px solid #EAECF5',
              fontWeight: '700', fontSize: '15px', cursor: 'pointer', textAlign: 'left',
              boxShadow: aba === 'produtos' ? '0 4px 12px rgba(109,40,217,0.2)' : 'none'
            }}
          >
            <ShoppingBag size={20} /> Produtos
          </button>
          
          <button
            onClick={() => setAba('pedidos')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '16px',
              backgroundColor: aba === 'pedidos' ? '#6D28D9' : '#FFFFFF',
              color: aba === 'pedidos' ? '#FFFFFF' : '#4B5563',
              borderRadius: '16px', border: aba === 'pedidos' ? 'none' : '1px solid #EAECF5',
              fontWeight: '700', fontSize: '15px', cursor: 'pointer', textAlign: 'left',
              boxShadow: aba === 'pedidos' ? '0 4px 12px rgba(109,40,217,0.2)' : 'none'
            }}
          >
            <Package size={20} /> Pedidos
          </button>
        </div>

        <div style={{ flex: '1 1 0%', minWidth: '320px' }}>
          
          {aba === 'produtos' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'flex-start' }}>
              
              <div style={cardStyle}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#17182B', margin: '0 0 20px 0' }}>
                  {produtoId ? 'Editar produto' : 'Novo produto'}
                </h2>
                
                <input type="text" placeholder="Nome do produto" value={nome} onChange={(e) => setNome(e.target.value)} style={inputStyle} />
                
                <textarea 
                  placeholder="Descrição" 
                  rows={3} 
                  value={descricao} 
                  onChange={(e) => setDescricao(e.target.value)} 
                  style={{ ...inputStyle, minHeight: '80px', padding: '12px 16px', resize: 'vertical' }} 
                />
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="number" step="0.01" placeholder="Preço (ex: 79.90)" value={preco} onChange={(e) => setPreco(e.target.value)} style={inputStyle} />
                  <input type="number" placeholder="Estoque" value={estoque} onChange={(e) => setEstoque(e.target.value)} style={inputStyle} />
                </div>
                
                <input type="url" placeholder="URL da imagem (https://...)" value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)} style={inputStyle} />
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '24px' }}>
                  <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: '#6D28D9' }} />
                  <span style={{ fontWeight: '700', fontSize: '14px', color: '#34334B' }}>Produto ativo visível na loja</span>
                </label>

                <button
                  onClick={salvarProduto}
                  disabled={salvando}
                  style={{ width: '100%', minHeight: '52px', backgroundColor: '#6D28D9', color: '#FFF', fontWeight: '700', fontSize: '15px', borderRadius: '12px', border: 'none', cursor: salvando ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {salvando ? <Loader2 className="animate-spin" size={20} /> : 'Salvar produto'}
                </button>
                
                {produtoId && (
                  <button onClick={limparFormulario} style={{ width: '100%', backgroundColor: 'transparent', color: '#73788B', fontWeight: '700', border: 'none', marginTop: '16px', cursor: 'pointer' }}>
                    Cancelar edição
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#17182B', margin: '0 0 4px 0' }}>Cadastrados</h2>
                {produtos.map((produto) => (
                  <div key={produto.id} style={{ ...cardStyle, padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#202239', margin: '0 0 4px 0' }}>{produto.nome}</h3>
                      <p style={{ fontSize: '13px', color: '#73788B', margin: '0 0 8px 0' }}>
                        {dinheiro(produto.preco)} | Estoque: <span style={{ fontWeight: '700', color: '#17182B' }}>{produto.estoque}</span>
                      </p>
                      <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', backgroundColor: produto.ativo ? '#D1FAE5' : '#FEE2E2', color: produto.ativo ? '#065F46' : '#991B1B' }}>
                        {produto.ativo ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </div>
                    <button
                      onClick={() => editarProduto(produto)}
                      style={{ backgroundColor: '#F3F4F6', color: '#4B5563', padding: '10px 16px', borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                    >
                      <Edit size={16} /> Editar
                    </button>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {pedidos.length === 0 ? <p style={{ color: '#73788B' }}>Nenhum pedido registrado.</p> : null}
              {pedidos.map((pedido) => (
                <div key={pedido.id} style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ borderBottom: '1px solid #EAECF5', paddingBottom: '16px', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#17182B', margin: '0 0 8px 0' }}>
                      Pedido #{String(pedido.numero_pedido).padStart(6, '0')}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#687087', margin: '0 0 4px 0' }}>
                      Cliente: <span style={{ fontWeight: '600', color: '#17182B' }}>{pedido.cliente_id ? clientes[pedido.cliente_id] || pedido.cliente_id : 'Não informado'}</span>
                    </p>
                    <p style={{ fontSize: '13px', color: '#687087', margin: '0 0 8px 0' }}>
                      Data: <span style={{ fontWeight: '600', color: '#17182B' }}>{dataBrasil(pedido.created_at)}</span>
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '800', color: '#6D28D9' }}>{dinheiro(pedido.total)}</span>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#4B5563', backgroundColor: '#F3F4F6', padding: '4px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                        {pedido.status}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(proximosStatus[pedido.status] || []).map((status) => (
                      <button
                        key={status}
                        disabled={salvando}
                        onClick={() => alterarStatus(pedido.id, status)}
                        style={{ flex: 1, backgroundColor: '#17182B', color: '#FFF', padding: '10px 0', borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', cursor: salvando ? 'not-allowed' : 'pointer' }}
                      >
                        Mudar p/ {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}