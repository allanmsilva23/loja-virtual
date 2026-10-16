import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { supabase } from './supabase';
import { dinheiro } from './tipos';
import { avisar } from './avisos';

export default function Carrinho() {
  const { cart, cartTotal, aumentar, diminuir, remover, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [finalizando, setFinalizando] = useState(false);

  const finalizarPedido = async () => {
    if (finalizando || cart.length === 0) return;

    if (!user) {
      avisar('Login necessário', 'Entre na sua conta antes de finalizar a compra.');
      navigate('/perfil');
      return;
    }

    setFinalizando(true);

    try {
      const { data, error } = await supabase.rpc('finalizar_pedido', {
        p_itens: cart.map(({ produto, quantidade }) => ({
          produto_id: produto.id,
          quantidade,
        })),
      });

      if (error) throw error;

      const pedidoId = String(data);
      const { data: pedido, error: consultaError } = await supabase
        .from('pedidos')
        .select('numero_pedido')
        .eq('id', pedidoId)
        .single();

      clearCart();

      if (consultaError || pedido?.numero_pedido == null) {
        avisar('Pedido registrado', 'Seu pedido foi criado com sucesso.');
      } else {
        const numeroPedido = String(pedido.numero_pedido).padStart(6, '0');
        avisar('Pedido registrado', `Pedido #${numeroPedido} criado com sucesso!`);
      }

      navigate('/pedidos');
    } catch (error: any) {
      avisar('Não foi possível finalizar', error?.message || 'Tente novamente.');
    } finally {
      setFinalizando(false);
    }
  };

  return (
    <main style={{ padding: '48px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#17182B', marginBottom: '32px' }}>
        Seu Carrinho
      </h1>

      {cart.length === 0 ? (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '80px 24px', textAlign: 'center', border: '1px solid #EAECF5', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <ShoppingCart size={64} color="#D1D5DB" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#17182B', margin: '0 0 8px 0' }}>O seu carrinho está vazio</h2>
          <p style={{ color: '#73788B', fontSize: '15px', marginBottom: '24px' }}>Explore o nosso catálogo e adicione produtos para continuar.</p>
          <button 
            onClick={() => navigate('/')}
            style={{ backgroundColor: '#6D28D9', color: '#FFF', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', border: 'none', cursor: 'pointer' }}
          >
            Voltar ao Catálogo
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'flex-start' }}>
          
          <div style={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '320px' }}>
            {cart.map((item) => (
              <div 
                key={item.produto.id} 
                style={{ 
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EAECF5', 
                  borderRadius: '20px', 
                  padding: '24px', 
                  display: 'flex', 
                  gap: '20px',
                  alignItems: 'center',
                  boxShadow: '0 4px 12px rgba(33,20,71,0.02)'
                }}
              >
                <div style={{ width: '100px', height: '100px', backgroundColor: '#F9FAFB', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {item.produto.imagem_url ? (
                    <img src={item.produto.imagem_url} alt={item.produto.nome} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Sem Foto</span>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#202239', margin: '0 0 4px 0' }}>
                    {item.produto.nome}
                  </h2>
                  <p style={{ fontSize: '14px', color: '#73788B', margin: 0 }}>
                    {dinheiro(item.produto.preco)} por unidade
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: '12px', padding: '4px' }}>
                      <button 
                        onClick={() => diminuir(item.produto.id)}
                        style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', color: '#17182B', borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                      >
                        <Minus size={16} strokeWidth={2.5} />
                      </button>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: '#202239', minWidth: '40px', textAlign: 'center' }}>
                        {item.quantidade}
                      </span>
                      <button 
                        disabled={item.quantidade >= item.produto.estoque}
                        onClick={() => aumentar(item.produto.id)}
                        style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: item.quantidade >= item.produto.estoque ? 'transparent' : '#FFF', color: item.quantidade >= item.produto.estoque ? '#9CA3AF' : '#17182B', borderRadius: '8px', border: 'none', cursor: item.quantidade >= item.produto.estoque ? 'not-allowed' : 'pointer', boxShadow: item.quantidade >= item.produto.estoque ? 'none' : '0 2px 4px rgba(0,0,0,0.05)' }}
                      >
                        <Plus size={16} strokeWidth={2.5} />
                      </button>
                    </div>

                    <p style={{ fontSize: '18px', fontWeight: '800', color: '#6D28D9', margin: 0 }}>
                      {dinheiro(Number(item.produto.preco) * item.quantidade)}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => remover(item.produto.id)}
                  style={{ width: '44px', height: '44px', backgroundColor: '#FEF2F2', color: '#EF4444', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', alignSelf: 'flex-start' }}
                  title="Remover produto"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ flex: '1 1 320px', maxWidth: '400px', backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '32px', border: '1px solid #EAECF5', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', position: 'sticky', top: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#17182B', margin: '0 0 24px 0' }}>
              Resumo do Pedido
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: '#73788B', fontSize: '15px' }}>
              <span>Produtos ({cart.length})</span>
              <span>{dinheiro(cartTotal)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', color: '#73788B', fontSize: '15px' }}>
              <span>Frete</span>
              <span style={{ color: '#10B981', fontWeight: '700' }}>Grátis</span>
            </div>

            <div style={{ borderTop: '1px solid #E5E7EB', margin: '24px 0' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#17182B' }}>Total</span>
              <span style={{ fontSize: '28px', fontWeight: '800', color: '#6D28D9' }}>{dinheiro(cartTotal)}</span>
            </div>
            
            <button 
              disabled={finalizando}
              onClick={finalizarPedido}
              style={{ 
                width: '100%', 
                minHeight: '56px', 
                backgroundColor: finalizando ? '#C9CADA' : '#6D28D9', 
                color: '#FFF', 
                fontWeight: '800', 
                fontSize: '16px', 
                borderRadius: '16px', 
                border: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: finalizando ? 'not-allowed' : 'pointer',
                boxShadow: finalizando ? 'none' : '0 8px 20px rgba(109,40,217,0.25)',
                transition: 'all 0.2s'
              }}
            >
              {finalizando ? <Loader2 className="animate-spin" size={24} /> : 'Finalizar Compra Segura'}
            </button>
          </div>

        </div>
      )}
    </main>
  );
}