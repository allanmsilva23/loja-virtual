import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, ShoppingBag, Package, User } from 'lucide-react';
import { useCart } from './CartContext';

export default function Navbar() {
  const location = useLocation();
  const { cart } = useCart();
  const itensNoCarrinho = cart ? cart.length : 0;

  const rotas = [
    { path: '/', nome: 'Catálogo', icone: LayoutGrid },
    { path: '/carrinho', nome: 'Carrinho', icone: ShoppingBag, badge: itensNoCarrinho },
    { path: '/pedidos', nome: 'Pedidos', icone: Package },
    { path: '/perfil', nome: 'Minha conta', icone: User },
  ];

  return (
    <div 
      style={{ 
        position: 'fixed', 
        bottom: 24, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        zIndex: 9999, 
        width: '100%', 
        maxWidth: '768px', 
        padding: '0 16px' 
      }}
    >
      <nav 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          backgroundColor: '#EBECEF', 
          borderRadius: '18px', 
          padding: '6px', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
        }}
      >
        {rotas.map((rota) => {
          const ativo = location.pathname === rota.path;
          const Icone = rota.icone;

          return (
            <Link
              key={rota.path}
              to={rota.path}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                flex: 1,
                height: '54px',
                borderRadius: '14px',
                textDecoration: 'none',
                backgroundColor: ativo ? 'transparent' : 'transparent',
                border: ativo ? '2px solid #17182B' : '2px solid transparent',
              }}
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Icone size={20} color={ativo ? '#6D28D9' : '#83899D'} strokeWidth={ativo ? 2.5 : 2} />
                {rota.badge > 0 && (
                  <span 
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-8px',
                      backgroundColor: '#E5484D',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      borderRadius: '50%',
                      minWidth: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px'
                    }}
                  >
                    {rota.badge}
                  </span>
                )}
              </div>
              <span 
                style={{ 
                  fontSize: '12px', 
                  fontWeight: 'bold', 
                  color: ativo ? '#17182B' : '#83899D',
                  display: ativo ? 'block' : 'none' 
                }}
              >
                {rota.nome}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}