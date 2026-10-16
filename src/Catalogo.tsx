import { useCallback, useState, useEffect } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from './supabase';
import { useCart } from './CartContext';
import { type Produto, dinheiro } from './tipos';

export default function Catalogo() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const { cart, addToCart } = useCart();
  const [toastVisible, setToastVisible] = useState(false);

  const mostrarToast = () => {
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 2500);
  };

  const carregarProdutos = useCallback(async () => {
    setLoading(true);
    setErro('');

    const { data, error } = await supabase
      .from('produtos')
      .select('id, nome, descricao, preco, estoque:quantidade_estoque, imagem_url, ativo')
      .eq('ativo', true)
      .order('nome');

    if (error) {
      setErro(error.message);
    } else {
      setProdutos((data || []) as Produto[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  if (loading && produtos.length === 0) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EBECEF' }}>
        <Loader2 size={48} color="#6D28D9" className="animate-spin" />
      </div>
    );
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#EBECEF' }}>
      
      <div style={{ backgroundColor: '#17182B', padding: '48px 24px', textAlign: 'center', color: '#FFFFFF' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0' }}>
            Sistema de Loja Virtual
          </h1>
          <p style={{ fontSize: '16px', color: '#A5A6F6', margin: 0 }}>
            Módulo de Catálogo e Processamento de Pedidos
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '48px 24px 120px 24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#17182B', margin: 0 }}>Produtos Disponíveis</h2>
        </div>

        {erro && <p style={{ color: '#B42332', fontWeight: 'bold' }}>Erro ao carregar: {erro}</p>}

        {produtos.length === 0 && !loading ? (
          <p style={{ textAlign: 'center', color: '#73788B', padding: '48px 0' }}>Nenhum produto cadastrado no banco de dados.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {produtos.map((item) => {
              const noCarrinho = cart.find((linha) => linha.produto.id === item.id)?.quantidade || 0;
              const disponivel = item.estoque > noCarrinho;

              return (
                <article
                  key={item.id}
                  style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #EAECF5' }}
                >
                  <div style={{ height: '220px', backgroundColor: '#F9FAFB', padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {item.imagem_url ? (
                      <img src={item.imagem_url} alt={item.nome} style={{ height: '100%', width: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                    ) : (
                      <span style={{ color: '#9CA3AF', fontWeight: '600', fontSize: '14px' }}>Sem imagem</span>
                    )}
                  </div>

                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#17182B', marginBottom: '8px', minHeight: '44px', lineHeight: 1.3 }}>
                        {item.nome}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '22px', marginBottom: '20px' }}>
                        {item.descricao || 'Sem descrição.'}
                      </p>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <p style={{ fontSize: '24px', fontWeight: '800', color: '#6D28D9', margin: 0 }}>
                          {dinheiro(item.preco)}
                        </p>
                        <p style={{ fontSize: '12px', fontWeight: '700', color: item.estoque > 0 ? '#059669' : '#DC2626', margin: 0, backgroundColor: item.estoque > 0 ? '#D1FAE5' : '#FEE2E2', padding: '6px 12px', borderRadius: '8px' }}>
                          {item.estoque > 0 ? `Estoque: ${item.estoque}` : 'Esgotado'}
                        </p>
                      </div>

                      <button
                        disabled={!disponivel}
                        onClick={() => { addToCart(item); mostrarToast(); }}
                        style={{
                          width: '100%', minHeight: '48px', backgroundColor: disponivel ? '#6D28D9' : '#E5E7EB', color: disponivel ? '#FFFFFF' : '#9CA3AF', fontWeight: '700', fontSize: '14px', borderRadius: '12px', border: 'none', cursor: disponivel ? 'pointer' : 'not-allowed', transition: 'all 0.2s', boxShadow: disponivel ? '0 4px 10px rgba(109,40,217,0.15)' : 'none'
                        }}
                      >
                        {item.estoque === 0 ? 'Indisponível' : disponivel ? 'Adicionar ao Carrinho' : 'Limite Atingido'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast Animado */}
      <div style={{ position: 'fixed', top: '28px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 9999, opacity: toastVisible ? 1 : 0, transform: toastVisible ? 'translateY(0)' : 'translateY(-20px)', transition: 'all 0.3s ease', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#17182B', padding: '14px 24px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          <CheckCircle2 size={20} color="#10B981" />
          <span style={{ color: '#FFFFFF', fontWeight: '600', fontSize: '14px' }}>Item adicionado.</span>
        </div>
      </div>
    </main>
  );
}