import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../supabase';
import { useCart } from '../../CartContext';
import { Produto, dinheiro } from '../../tipos';
import { avisar } from '../../avisos';

export default function CatalogoScreen() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const { cart, addToCart } = useCart();

  const carregarProdutos = useCallback(async () => {
    setLoading(true);
    setErro('');

    const { data, error } = await supabase
      .from('produtos')
      .select('id, nome, descricao, preco, estoque:quantidade_estoque, imagem_url, ativo')
      .eq('ativo', true)
      .order('nome');

    if (error) {
      setErro(error.message);
    } else {
      setProdutos((data || []) as Produto[]);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarProdutos();
    }, [carregarProdutos])
  );

  if (loading && produtos.length === 0) {
    return <ActivityIndicator size="large" style={styles.centro} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Nossa Coleção</Text>
      {erro ? <Text style={styles.erro}>Erro ao carregar: {erro}</Text> : null}
      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={carregarProdutos}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum produto disponível.</Text>}
        renderItem={({ item }) => {
          const noCarrinho = cart.find((linha) => linha.produto.id === item.id)?.quantidade || 0;
          const disponivel = item.estoque > noCarrinho;
          return (
          <View style={styles.card}>
            {item.imagem_url ? (
              <Image source={{ uri: item.imagem_url }} style={styles.imagem} />
            ) : (
              <View style={styles.semImagem}>
                <Text>Imagem não cadastrada</Text>
              </View>
            )}
            <View style={styles.informacoes}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.descricao}>{item.descricao || 'Sem descrição'}</Text>
              <Text style={styles.preco}>{dinheiro(item.preco)}</Text>
              <Text style={styles.estoque}>
                {item.estoque > 0 ? `${item.estoque} unidade(s) disponível(is)` : 'Esgotado'}
              </Text>
              <TouchableOpacity
                style={[styles.botao, !disponivel && styles.desabilitado]}
                disabled={!disponivel}
                onPress={() => {
                  addToCart(item);
                  avisar('Carrinho', 'Produto adicionado ao carrinho.');
                }}
              >
                <Text style={styles.botaoTexto}>
                  {item.estoque === 0 ? 'Sem estoque' : disponivel ? 'Adicionar ao carrinho' : 'Limite no carrinho'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centro: { flex: 1 },
  titulo: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', margin: 16 },
  lista: { padding: 15, paddingBottom: 35 },
  card: { backgroundColor: '#f6f6f6', borderRadius: 10, marginBottom: 16, overflow: 'hidden' },
  imagem: { width: '100%', height: 200, resizeMode: 'cover' },
  semImagem: { height: 120, backgroundColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
  informacoes: { padding: 15 },
  nome: { fontSize: 18, fontWeight: 'bold' },
  descricao: { color: '#555', marginVertical: 6 },
  preco: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  estoque: { color: '#555', marginVertical: 10 },
  botao: { backgroundColor: '#222', padding: 13, alignItems: 'center', borderRadius: 6 },
  desabilitado: { backgroundColor: '#999' },
  botaoTexto: { color: '#fff', fontWeight: 'bold' },
  vazio: { textAlign: 'center', marginTop: 40, color: '#666' },
  erro: { textAlign: 'center', color: '#b00020', marginHorizontal: 20 },
});
