import { Mail, MapPin, Phone, Instagram, Facebook, Twitter, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#17182B', color: '#9CA3AF', padding: '64px 24px 32px 24px', width: '100%' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '48px', justifyContent: 'space-between', borderBottom: '1px solid #374151', paddingBottom: '48px' }}>
        
        <div style={{ flex: '1 1 250px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#FFFFFF', marginBottom: '16px' }}>Nossa Coleção</h2>
          <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            A sua loja especializada em mochilas, estojos e garrafas térmicas. Aliamos design moderno, durabilidade e tecnologia para o seu dia a dia.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Instagram size={20} style={{ cursor: 'pointer', color: '#E5E7EB' }} />
            <Facebook size={20} style={{ cursor: 'pointer', color: '#E5E7EB' }} />
            <Twitter size={20} style={{ cursor: 'pointer', color: '#E5E7EB' }} />
          </div>
        </div>

        <div style={{ flex: '1 1 150px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '20px' }}>Institucional</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <li style={{ cursor: 'pointer' }}>Sobre a Empresa</li>
            <li style={{ cursor: 'pointer' }}>Política de Privacidade</li>
            <li style={{ cursor: 'pointer' }}>Termos de Uso</li>
            <li style={{ cursor: 'pointer' }}>Trocas e Devoluções</li>
          </ul>
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '20px' }}>Atendimento</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} color="#6D28D9" />
              <span>(11) 99999-0000</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} color="#6D28D9" />
              <span>contato@nossacolecao.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="#6D28D9" />
              <span>São Paulo, SP - Brasil</span>
            </div>
          </div>
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '20px' }}>Segurança</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#1F2937', padding: '16px', borderRadius: '12px' }}>
            <ShieldCheck size={32} color="#10B981" />
            <div>
              <p style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '14px', margin: '0 0 4px 0' }}>Site Seguro</p>
              <p style={{ margin: 0, fontSize: '12px' }}>Proteção de ponta a ponta</p>
            </div>
          </div>
        </div>

      </div>

      <div style={{ maxWidth: '1180px', margin: '32px auto 0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
        <p style={{ margin: 0 }}>&copy; 2026 Nossa Coleção. Todos os direitos reservados.</p>
        <p style={{ margin: 0 }}>Desenvolvido como projeto académico.</p>
      </div>
    </footer>
  );
}