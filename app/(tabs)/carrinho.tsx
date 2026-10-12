import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../supabase';
import { useCart } from '../../CartContext';

export default function CarrinhoScreen() {
  const { cart, cartTotal, clearCart } = useCart();
  const [finalizando, setFinalizando] = useState(false);

  const finalizarPedido = async () => {
    if (cart.length === 0) {
      Alert.alert('Aviso', 'Seu carrinho está vazio!');
      return;
    }

    setFinalizando(true);

    try {
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([{ total: cartTotal, status: 'pendente' }]) 
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      const itensParaInserir = cart.map((item: any) => ({
        pedido_id: pedido.id,
        produto_id: item.id,
        quantidade: 1,
        preco_unitario: item.preco
      }));

      const { error: itensError } = await supabase
        .from('itens_pedido')
        .insert(itensParaInserir);

      if (itensError) throw itensError;

      Alert.alert('Sucesso!', 'Pedido registrado com sucesso na nuvem!');
      clearCart();
    } catch (error) {
      console.error('Erro ao finalizar:', error);
      Alert.alert('Erro', 'Ocorreu um problema ao registrar o pedido.');
    } finally {
      setFinalizando(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemCart}>
      <Text style={styles.itemNome}>{item.nome}</Text>
      <Text style={styles.itemPreco}>R\$ {Number(item.preco).toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Seu Carrinho</Text>
      
      {cart.length === 0 ? (
        <Text style={styles.vazio}>Nenhum item adicionado ainda.</Text>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.totalTexto}>Total: R\$ {cartTotal.toFixed(2)}</Text>
        <TouchableOpacity 
          style={[styles.botaoFinalizar, cart.length === 0 && styles.botaoDesabilitado]} 
          onPress={finalizarPedido}
          disabled={cart.length === 0 || finalizando}
        >
          {finalizando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.botaoTexto}>Finalizar Pedido</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginVertical: 15 },
  vazio: { textAlign: 'center', color: '#999', marginTop: 20 },
  list: { paddingHorizontal: 15 },
  itemCart: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  itemNome: { fontSize: 16, color: '#333' },
  itemPreco: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#EEE', backgroundColor: '#FAFAFA' },
  totalTexto: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15, textAlign: 'center' },
  botaoFinalizar: { backgroundColor: '#333', padding: 15, borderRadius: 8, alignItems: 'center' },
  botaoDesabilitado: { backgroundColor: '#CCC' },
  botaoTexto: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }
});