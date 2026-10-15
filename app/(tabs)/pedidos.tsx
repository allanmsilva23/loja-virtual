import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../supabase';
import { useAuth } from '../../AuthContext';
import { ItemPedido, Pedido, dataBrasil, dinheiro } from '../../tipos';

export default function PedidosScreen() {
  const { user, loadingAuth } = useAuth();
  const router = useRouter();
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
          .in('pedido_id', lista.map((pedido) => pedido.id));
        if (respostaItens.error) throw respostaItens.error;
        setItens((respostaItens.data || []) as ItemPedido[]);
      }
    } catch (error: any) {
      setErro(error?.message || 'Erro ao buscar pedidos.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  if (loadingAuth) return <ActivityIndicator size="large" style={styles.centro} />;

  if (!user) {
    return (
      <View style={styles.centro}>
        <Text style={styles.mensagem}>Entre na sua conta para consultar seus pedidos.</Text>
        <TouchableOpacity style={styles.botao} onPress={() => router.push('/(tabs)/perfil')}>
          <Text style={styles.botaoTexto}>Entrar ou cadastrar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Meus Pedidos</Text>
      <TouchableOpacity onPress={carregar} style={styles.atualizar}>
        <Text>Atualizar acompanhamento</Text>
      </TouchableOpacity>
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
      {loading && pedidos.length === 0 ? (
        <ActivityIndicator style={styles.centro} size="large" />
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(pedido) => pedido.id}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={<Text style={styles.mensagem}>Você ainda não realizou pedidos.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.identificador}>Pedido #{String(item.numero_pedido).padStart(6, '0')}</Text>
              <Text>Data: {dataBrasil(item.created_at)}</Text>
              <Text>Status: {item.status}</Text>
              <Text style={styles.total}>Total: {dinheiro(item.total)}</Text>
              {itens.filter((produto) => produto.pedido_id === item.id).map((produto) => (
                <Text key={produto.id} style={styles.linha}>
                  {produto.quantidade}x {produto.nome_produto || produto.produto_id.slice(0, 8)} — {dinheiro(produto.preco_unitario)} cada
                </Text>
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F6F7FB',
  },
  titulo: {
    textAlign: 'left',
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '800',
    color: '#17182B',
    marginTop: 6,
    marginBottom: 10,
    letterSpacing: -0.6,
  },
  atualizar: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 2,
    marginBottom: 8,
  },
  lista: {
    paddingTop: 12,
    paddingBottom: 120,
  },
  card: {
    padding: 20,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAECF5',
    marginBottom: 14,
    gap: 8,
    shadowColor: '#211447',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  identificador: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: '#28203F',
    marginBottom: 3,
  },
  total: {
    fontWeight: '800',
    fontSize: 16,
    color: '#6D28D9',
    marginVertical: 5,
  },
  linha: {
    color: '#687087',
    marginTop: 3,
    lineHeight: 20,
    fontSize: 13,
  },
  mensagem: {
    textAlign: 'center',
    color: '#73788B',
    marginBottom: 16,
    fontSize: 15,
    lineHeight: 23,
  },
  botao: {
    backgroundColor: '#6D28D9',
    borderRadius: 13,
    paddingVertical: 14,
    paddingHorizontal: 18,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  erro: {
    color: '#B42332',
    marginHorizontal: 2,
    marginBottom: 12,
    lineHeight: 20,
  },
});
