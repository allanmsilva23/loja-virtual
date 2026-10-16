import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, PackageOpen } from 'lucide-react';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';
import { type ItemPedido, type Pedido, dataBrasil, dinheiro } from './tipos';

export default function Pedidos() {
  const { user, loadingAuth } = useAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setErro('');

    try {
      const cliente = await supabase.rpc('garantir_cliente');
      if (cliente.error) throw cliente.error;

      const respostaPedidos = await supabase
        .from('pedidos')
        .select('id, numero_pedido, cliente_id, status, total, created_at')
        .eq('cliente_id', cliente.data)
        .order('created_at', { ascending: false });

      if (respostaPedidos.error) throw respostaPedidos.error;
      const lista = (respostaPedidos.data || []) as Pedido[];
      setPedidos(lista);

      if (lista.length === 0) {
        setItens([]);
      } else {
        const respostaItens = await supabase
          .from('itens_pedido')
          .select('id, pedido_id, produto_id, quantidade, preco_unitario, nome_produto')
          .in(
            'pedido_id',
            lista.map((pedido) => pedido.id)
          );
        if (respostaItens.error) throw respostaItens.error;
        setItens((respostaItens.data || []) as ItemPedido[]);
      }
    } catch (error: any) {
      setErro(error?.message || 'Erro ao buscar pedidos.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      carregar();
    }
  }, [carregar, user]);

  if (loadingAuth) {
    return (
      <div style={{ display: 'flex', minHeight: '50vh', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} color="#6D28D9" className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', minHeight: '60vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center' }}>
        <PackageOpen size={64} color="#A0AEC0" style={{ marginBottom: '16px' }} />
        <p style={{ fontSize: '15px', color: '#73788B', marginBottom: '24px', lineHeight: 1.5 }}>
          Entre na sua conta para consultar seus pedidos.
        </p>
        <button
          onClick={() => navigate('/perfil')}
          style={{ minHeight: '48px', backgroundColor: '#6D28D9', color: '#FFF', padding: '0 24px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
        >
          Entrar ou cadastrar
        </button>
      </div>
    );
  }

  return (
    <main style={{ padding: '32px 24px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#17182B', marginBottom: '24px' }}>
        Meus Pedidos
      </h1>

      {erro && <p style={{ color: '#B42332', fontWeight: 'bold', marginBottom: '16px' }}>{erro}</p>}

      {loading && pedidos.length === 0 ? (
        <div style={{ display: 'flex', height: '128px', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={32} color="#6D28D9" className="animate-spin" />
        </div>
      ) : pedidos.length === 0 ? (
        <div style={{ marginTop: '48px', textAlign: 'center', fontSize: '15px', color: '#73788B' }}>
          Você ainda não realizou pedidos.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pedidos.map((item) => (
            <article
              key={item.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 4px 12px rgba(33,20,71,0.04)',
                border: '1px solid #EAECF5'
              }}
            >
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#28203F', margin: '0 0 4px 0' }}>
                Pedido #{String(item.numero_pedido).padStart(6, '0')}
              </h2>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#687087', margin: '0 0 4px 0' }}>
                Data: {dataBrasil(item.created_at)}
              </p>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#687087', margin: '0 0 8px 0' }}>
                Status: <span style={{ fontWeight: '600', color: '#17182B' }}>{item.status}</span>
              </p>
              <p style={{ fontSize: '16px', fontWeight: '800', color: '#6D28D9', margin: '0 0 12px 0' }}>
                Total: {dinheiro(item.total)}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {itens
                  .filter((produto) => produto.pedido_id === item.id)
                  .map((produto) => (
                    <p key={produto.id} style={{ fontSize: '13px', color: '#687087', margin: 0, lineHeight: '20px' }}>
                      {produto.quantidade}x {produto.nome_produto || produto.produto_id.slice(0, 8)} — {dinheiro(produto.preco_unitario)} cada
                    </p>
                  ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}