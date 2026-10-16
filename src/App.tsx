import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';

import Navbar from './Navbar';
import Catalogo from './Catalogo';
import Carrinho from './Carrinho';
import Pedidos from './Pedidos';
import Perfil from './Perfil';
import Gestao from './Gestao';
import AvisoGlobal from './AvisoGlobal';
import Footer from './Footer';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#EBECEF', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
          <BrowserRouter>
            <AvisoGlobal />
            <div style={{ paddingBottom: '80px', flex: 1 }}>
              <Routes>
                <Route path="/" element={<Catalogo />} />
                <Route path="/carrinho" element={<Carrinho />} />
                <Route path="/pedidos" element={<Pedidos />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/gestao" element={<Gestao />} />
              </Routes>
            </div>
            <Footer />
            <Navbar />
          </BrowserRouter>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}