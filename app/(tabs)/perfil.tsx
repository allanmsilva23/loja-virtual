import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../supabase';
import { useAuth } from '../../AuthContext';
import { useCart } from '../../CartContext';
import { avisar } from '../../avisos';

type Cliente = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
};

export default function PerfilScreen() {
  const { user, loadingAuth } = useAuth();
  const { clearCart } = useCart();
  const router = useRouter();
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
    return () => { ativo = false; };
  }, [user?.id]);

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

        avisar(
          'Cadastro realizado',
          'Sua conta foi criada com sucesso!'
        );
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

  if (loadingAuth) {
    return <ActivityIndicator size="large" style={styles.centro} color="#6D28D9" />;
  }

  return (
    <ScrollView style={styles.pagina} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.titulo}>{user ? 'Minha Conta' : cadastro ? 'Criar Conta' : 'Entrar'}</Text>
      {user ? (
        <View>
          <Text style={styles.rotulo}>Nome</Text>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome completo" placeholderTextColor="#969AAF" />
          <Text style={styles.rotulo}>E-mail</Text>
          <TextInput style={[styles.input, styles.bloqueado]} value={user.email || email} editable={false} />
          <Text style={styles.rotulo}>Telefone</Text>
          <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" placeholder="Telefone" placeholderTextColor="#969AAF" />
          <TouchableOpacity style={styles.botao} onPress={salvarPerfil} disabled={carregando || !cliente}>
            {carregando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.textoBotao}>Salvar dados</Text>}
          </TouchableOpacity>
          {admin && (
            <TouchableOpacity style={styles.botaoSecundario} onPress={() => router.push('/(tabs)/gestao')}>
              <Text style={styles.textoBotao}>Gestão da loja</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.sair} onPress={sair} disabled={carregando}>
            <Text style={styles.textoSair}>Sair da conta</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {cadastro && (
            <>
              <Text style={styles.rotulo}>Nome completo</Text>
              <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Seu nome" placeholderTextColor="#969AAF" />
            </>
          )}
          <Text style={styles.rotulo}>E-mail</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            placeholderTextColor="#969AAF"
          />
          <Text style={styles.rotulo}>Senha</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            placeholder="Sua senha"
            placeholderTextColor="#969AAF"
          />
          <TouchableOpacity style={styles.botao} disabled={carregando} onPress={autenticar}>
            {carregando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.textoBotao}>{cadastro ? 'Cadastrar' : 'Entrar'}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.alternar} onPress={() => setCadastro(!cadastro)}>
            <Text style={styles.alternarTexto}>{cadastro ? 'Já tenho conta' : 'Ainda não tenho conta'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pagina: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  container: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 120,
    backgroundColor: '#F6F7FB',
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F7FB',
  },
  titulo: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '800',
    textAlign: 'left',
    color: '#17182B',
    marginBottom: 28,
    letterSpacing: -0.6,
  },
  rotulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34334B',
    marginBottom: 8,
    marginLeft: 2,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#E0E2ED',
    backgroundColor: '#FFFFFF',
    color: '#202239',
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 13,
    marginBottom: 18,
    fontSize: 15,
  },
  bloqueado: {
    backgroundColor: '#F0F1F6',
    color: '#73788B',
    borderColor: '#E5E6EE',
  },
  botao: {
    backgroundColor: '#6D28D9',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: '#6D28D9',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  botaoSecundario: {
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 14,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  alternar: {
    alignItems: 'center',
    marginTop: 22,
    paddingVertical: 10,
  },
  alternarTexto: {
    color: '#6D28D9',
    fontWeight: '700',
    fontSize: 14,
  },
  sair: {
    alignItems: 'center',
    marginTop: 25,
    paddingVertical: 10,
  },
  textoSair: {
    color: '#C2414B',
    fontWeight: '700',
    fontSize: 14,
  },
});
