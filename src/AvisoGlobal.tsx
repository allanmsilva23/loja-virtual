import { useEffect, useState } from 'react';
import { setAvisoListener } from './avisos';
import { BellRing, X } from 'lucide-react';

export default function AvisoGlobal() {
  const [visivel, setVisivel] = useState(false);
  const [conteudo, setConteudo] = useState({ titulo: '', mensagem: '' });

  useEffect(() => {
    setAvisoListener((titulo, mensagem) => {
      setConteudo({ titulo, mensagem });
      setVisivel(true);
    });

    // Limpamos o ouvinte se o componente for desmontado
    return () => setAvisoListener(null);
  }, []);

  if (!visivel) return null;

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, left: 0, right: 0, bottom: 0, 
        zIndex: 99999, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        backdropFilter: 'blur(4px)' 
      }}
    >
      <div 
        style={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: '24px', 
          padding: '28px', 
          width: '90%', 
          maxWidth: '400px', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)', 
          position: 'relative',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        <button 
          onClick={() => setVisivel(false)} 
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
        >
          <X size={24} />
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ backgroundColor: '#F5F3FF', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BellRing size={28} color="#6D28D9" />
          </div>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#17182B' }}>
            {conteudo.titulo}
          </h3>
        </div>
        
        <p style={{ margin: 0, color: '#4B5563', fontSize: '15px', lineHeight: '1.6', fontWeight: '500' }}>
          {conteudo.mensagem}
        </p>
        
        <button 
          onClick={() => setVisivel(false)} 
          style={{ 
            width: '100%', 
            marginTop: '28px', 
            padding: '14px', 
            backgroundColor: '#6D28D9', 
            color: '#FFFFFF', 
            border: 'none', 
            borderRadius: '14px', 
            fontWeight: '700', 
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(109,40,217,0.2)'
          }}
        >
          Entendi
        </button>
      </div>
    </div>
  );
}