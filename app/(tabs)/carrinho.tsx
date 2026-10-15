import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Platform
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
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width >= 768;

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
    <View style={styles.background}>
      <View style={[styles.container, isWeb && styles.containerWeb]}>
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
        <View style={[styles.footer, isWeb && styles.footerWeb]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#F6F7FB',
  },
  containerWeb: {
    maxWidth: 900,
    marginTop: 24,
    marginBottom: 120,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAECF5',
    shadowColor: '#211447',
    shadowOpacity: 0.07,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  titulo: {
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '800',
    textAlign: 'left',
    color: '#17182B',
    marginTop: 28,
    marginHorizontal: 24,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  lista: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
    flexGrow: 1,
  },
  vazio: {
    textAlign: 'center',
    color: '#7B8194',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 48,
    paddingHorizontal: 20,
  },
  item: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAECF5',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    gap: 5,
    shadowColor: '#211447',
    shadowOpacity: 0.035,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  nome: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700',
    color: '#202239',
    marginBottom: 3,
  },
  subtotal: {
    marginTop: 5,
    fontWeight: '700',
    color: '#272341',
    fontSize: 15,
  },
  acoes: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  botaoQuantidade: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6D28D9',
    borderRadius: 12,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  quantidade: {
    fontSize: 16,
    minWidth: 28,
    textAlign: 'center',
    fontWeight: '700',
    color: '#202239',
  },
  remover: {
    color: '#C2414B',
    fontWeight: '700',
    marginLeft: 8,
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: '#EAECF5',
    backgroundColor: '#FFFFFF',
  },
  footerWeb: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  total: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '800',
    textAlign: 'left',
    color: '#17182B',
    marginBottom: 16,
  },
  finalizar: {
    backgroundColor: '#6D28D9',
    minHeight: 52,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    shadowColor: '#6D28D9',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  inativo: {
    backgroundColor: '#C9CADA',
    shadowOpacity: 0,
    elevation: 0,
  },
});
