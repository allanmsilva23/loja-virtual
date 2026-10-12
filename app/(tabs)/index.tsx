import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../../supabase';
import { useCart } from '../../CartContext';

export default function CatalogoScreen() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProdutos() {
      const { data, error } = await supabase.from('produtos').select('*');
      if (error) {
        console.error('Erro ao buscar produtos:', error);
      } else {
        setProdutos(data || []);
      }
      setLoading(false);
    }
    fetchProdutos();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#333" style={styles.loader} />;
  }

  const renderProduto = ({ item }: { item: any }) => (
    <View style={styles.card}>
      {item.imagem_url ? (
        <Image source={{ uri: item.imagem_url }} style={styles.imagem} />
      ) : (
        <View style={styles.imagemPlaceholder} />
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.descricao} numberOfLines={2}>{item.descricao}</Text>
        <Text style={styles.preco}>R$ {Number(item.preco).toFixed(2)}</Text>
        <TouchableOpacity style={styles.botaoAdd} onPress={() => addToCart(item)}>
          <Text style={styles.botaoTexto}>Adicionar ao Carrinho</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Nossa Coleção</Text>
      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        renderItem={renderProduto}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loader: { flex: 1, justifyContent: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginVertical: 15 },
  list: { paddingHorizontal: 15, paddingBottom: 20 },
  card: { backgroundColor: '#FDFDFD', borderRadius: 10, marginBottom: 15, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  imagem: { width: '100%', height: 200, resizeMode: 'cover' },
  imagemPlaceholder: { width: '100%', height: 200, backgroundColor: '#E0E0E0' },
  infoContainer: { padding: 15 },
  nome: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  descricao: { fontSize: 14, color: '#666', marginVertical: 5 },
  preco: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  botaoAdd: { backgroundColor: '#333', padding: 12, borderRadius: 8, alignItems: 'center' },
  botaoTexto: { color: '#FFFFFF', fontWeight: 'bold' }
});