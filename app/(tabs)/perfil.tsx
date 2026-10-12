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
    return <ActivityIndicator size="large" style={styles.centro} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.titulo}>{user ? 'Minha Conta' : cadastro ? 'Criar Conta' : 'Entrar'}</Text>
      {user ? (
        <View>
          <Text style={styles.rotulo}>Nome</Text>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome completo" />
          <Text style={styles.rotulo}>E-mail</Text>
          <TextInput style={[styles.input, styles.bloqueado]} value={user.email || email} editable={false} />
          <Text style={styles.rotulo}>Telefone</Text>
          <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" placeholder="Telefone" />
          <TouchableOpacity style={styles.botao} onPress={salvarPerfil} disabled={carregando || !cliente}>
            {carregando ? <ActivityIndicator color="#fff" /> : <Text style={styles.textoBotao}>Salvar dados</Text>}
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
              <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Seu nome" />
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
          />
          <Text style={styles.rotulo}>Senha</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            placeholder="Sua senha"
          />
          <TouchableOpacity style={styles.botao} disabled={carregando} onPress={autenticar}>
            {carregando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.textoBotao}>{cadastro ? 'Cadastrar' : 'Entrar'}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.alternar} onPress={() => setCadastro(!cadastro)}>
            <Text>{cadastro ? 'Já tenho conta' : 'Ainda não tenho conta'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 22, paddingBottom: 60, backgroundColor: '#fff', flexGrow: 1 },
  centro: { flex: 1 },
  titulo: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 22 },
  rotulo: { fontWeight: 'bold', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 7, padding: 12, marginBottom: 16 },
  bloqueado: { backgroundColor: '#eee', color: '#555' },
  botao: { backgroundColor: '#222', alignItems: 'center', padding: 15, borderRadius: 7, marginTop: 8 },
  botaoSecundario: { backgroundColor: '#555', alignItems: 'center', padding: 15, borderRadius: 7, marginTop: 15 },
  textoBotao: { color: '#fff', fontWeight: 'bold' },
  alternar: { alignItems: 'center', marginTop: 20 },
  sair: { alignItems: 'center', marginTop: 25 },
  textoSair: { color: '#b00020', fontWeight: 'bold' },
});
