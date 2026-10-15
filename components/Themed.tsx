import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, Image, useWindowDimensions, ActivityIndicator, Pressable } from 'react-native';
import { Text, View } from '@/components/Themed';
import { supabase } from '@/supabase';
import { useCart } from '@/CartContext';
import { formataPreco } from '@/tipos';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type Produto = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagem_url: string;
};

export default function CatalogoScreen() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const { adicionarAoCarrinho } = useCart();
  const { width } = useWindowDimensions();
  const theme = useColorScheme() ?? 'light';
  
  const numColumns = width >= 1024 ? 4 : width >= 768 ? 3 : width >= 480 ? 2 : 1;

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const { data, error } = await supabase
          .from('produtos')
          .select('id, nome, descricao, preco, estoque:quantidade_estoque, imagem_url, ativo')
          .eq('ativo', true);

        if (error) throw error;
        setProdutos(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    carregarProdutos();
  }, []);

  const renderItem = ({ item }: { item: Produto }) => (
    <View style={[styles.card, { backgroundColor: Colors[theme].surface, borderColor: Colors[theme].border }]}>
      <Image 
        source={{ uri: item.imagem_url }} 
        style={styles.image} 
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.nome} numberOfLines={2}>{item.nome}</Text>
        <Text style={styles.descricao} numberOfLines={2}>{item.descricao}</Text>
        <Text style={styles.preco}>{formataPreco(item.preco)}</Text>
        <Text style={styles.estoque}>{item.estoque} unidade(s) disponível(is)</Text>
        
        <Pressable 
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: item.estoque > 0 ? Colors[theme].buttonBackground : Colors[theme].border },
            pressed && { opacity: 0.8 }
          ]}
          disabled={item.estoque <= 0}
          onPress={() => adicionarAoCarrinho(item)}
        >
          <Text style={[styles.buttonText, { color: item.estoque > 0 ? Colors[theme].buttonText : Colors[theme].text }]}>
            {item.estoque > 0 ? 'Adicionar ao carrinho' : 'Esgotado'}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[theme].tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nossa Coleção</Text>
      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        key={`grid-${numColumns}`}
        numColumns={numColumns}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={numColumns > 1 ? styles.row : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 24,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'flex-start',
    gap: 16,
  },
  card: {
    flex: 1,
    minWidth: 280,
    maxWidth: 350,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 220,
    backgroundColor: '#F3F4F6',
  },
  cardContent: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  nome: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  descricao: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  preco: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  estoque: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});