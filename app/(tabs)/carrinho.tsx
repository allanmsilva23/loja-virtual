import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../../CartContext';
import { useAuth } from '../../AuthContext';
import { supabase } from '../../supabase';
import { dinheiro } from '../../tipos';
import { avisar } from '../../avisos';

export default function CarrinhoScreen() {
  const { cart, cartTotal, aumentar, diminuir, remover, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [finalizando, setFinalizando] = useState(false);

const finalizarPedido = async () => {
  if (finalizando || cart.length === 0) return;

  if (!user) {
    avisar('Login necessário', 'Entre na sua conta antes de finalizar a compra.');
    router.push('/(tabs)/perfil');
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
      avisar(
        'Pedido registrado',
        'Seu pedido foi criado com sucesso.'
      );
    } else {
      const numeroPedido = String(pedido.numero_pedido).padStart(6, '0');

      avisar(
        'Pedido registrado',
        `Pedido #${numeroPedido} criado com sucesso!`
      );
    }

    router.push('/(tabs)/pedidos');
  } catch (error: any) {
    avisar(
      'Não foi possível finalizar',
      error?.message || 'Tente novamente.'
    );
  } finally {
    setFinalizando(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Seu Carrinho</Text>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.produto.id}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<Text style={styles.vazio}>Seu carrinho está vazio.</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.nome}>{item.produto.nome}</Text>
            <Text>{dinheiro(item.produto.preco)} por unidade</Text>
            <Text style={styles.subtotal}>
              Subtotal: {dinheiro(Number(item.produto.preco) * item.quantidade)}
            </Text>
            <View style={styles.acoes}>
              <TouchableOpacity style={styles.botaoQuantidade} onPress={() => diminuir(item.produto.id)}>
                <Text style={styles.textoBotao}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantidade}>{item.quantidade}</Text>
              <TouchableOpacity
                style={[styles.botaoQuantidade, item.quantidade >= item.produto.estoque && styles.inativo]}
                disabled={item.quantidade >= item.produto.estoque}
                onPress={() => aumentar(item.produto.id)}
              >
                <Text style={styles.textoBotao}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => remover(item.produto.id)}>
                <Text style={styles.remover}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <View style={styles.footer}>
        <Text style={styles.total}>Total: {dinheiro(cartTotal)}</Text>
        <TouchableOpacity
          disabled={cart.length === 0 || finalizando}
          style={[styles.finalizar, (cart.length === 0 || finalizando) && styles.inativo]}
          onPress={finalizarPedido}
        >
          {finalizando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.textoBotao}>Finalizar pedido</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  titulo: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', margin: 16 },
  lista: { padding: 16, flexGrow: 1 },
  vazio: { textAlign: 'center', color: '#777', marginTop: 30 },
  item: { borderBottomWidth: 1, borderBottomColor: '#ddd', paddingVertical: 15 },
  nome: { fontSize: 17, fontWeight: 'bold', marginBottom: 5 },
  subtotal: { marginTop: 6, fontWeight: 'bold' },
  acoes: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  botaoQuantidade: { backgroundColor: '#222', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 5 },
  textoBotao: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  quantidade: { fontSize: 16, minWidth: 24, textAlign: 'center' },
  remover: { color: '#b00020', fontWeight: 'bold', marginLeft: 12 },
  footer: { padding: 18, borderTopWidth: 1, borderColor: '#ddd' },
  total: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  finalizar: { backgroundColor: '#222', padding: 15, alignItems: 'center', borderRadius: 7 },
  inativo: { backgroundColor: '#aaa' },
});
