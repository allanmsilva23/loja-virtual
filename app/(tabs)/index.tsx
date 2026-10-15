import React, { useCallback, useState, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Platform,
  Animated
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../supabase';
import { useCart } from '../../CartContext';
import { Produto, dinheiro } from '../../tipos';
import { Feather } from '@expo/vector-icons';

export default function CatalogoScreen() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const { cart, addToCart } = useCart();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width >= 768;

  const numColunas = width >= 1024 ? 3 : width >= 600 ? 2 : 1;

  const [toastVisible, setToastVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const mostrarToast = () => {
    setToastVisible(true);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setToastVisible(false);
    });
  };

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
    return <ActivityIndicator size="large" color="#3B82F6" style={styles.centro} />;
  }

  return (
    <View style={styles.background}>
      <View style={[styles.container, isWeb && styles.containerWeb]}>
        <Text style={styles.titulo}>Nossa Coleção</Text>
        
        {erro ? <Text style={styles.erro}>Erro ao carregar: {erro}</Text> : null}
        
        <FlatList
          data={produtos}
          key={numColunas}
          numColumns={numColunas}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={carregarProdutos}
          contentContainerStyle={styles.lista}
          columnWrapperStyle={numColunas > 1 ? styles.row : null}
          ListEmptyComponent={<Text style={styles.vazio}>Nenhum produto disponível.</Text>}
          renderItem={({ item }) => {
            const noCarrinho = cart.find((linha) => linha.produto.id === item.id)?.quantidade || 0;
            const disponivel = item.estoque > noCarrinho;
            
            return (
              <View style={styles.card}>
                {item.imagem_url ? (
                  <View style={styles.containerImagem}>
                    <Image source={{ uri: item.imagem_url }} style={styles.imagem} resizeMode="contain" />
                  </View>
                ) : (
                  <View style={styles.semImagem}>
                    <Text style={{ color: '#94A3B8' }}>Sem imagem</Text>
                  </View>
                )}
                <View style={styles.informacoes}>
                  <Text style={styles.nome} numberOfLines={2}>{item.nome}</Text>
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
                      mostrarToast();
                    }}
                  >
                    <Text style={styles.botaoTexto}>
                      {item.estoque === 0 ? 'Sem estoque' : disponivel ? 'Adicionar' : 'Limite atingido'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      </View>

      {toastVisible && (
        <Animated.View 
          style={[
            styles.toastContainer, 
            { 
              opacity: fadeAnim, 
              transform: [{ 
                translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) 
              }] 
            }
          ]}
        >
          <View style={styles.toastContent}>
            <Feather name="check-circle" size={22} color="#34D399" />
            <Text style={styles.toastText}>Adicionado ao carrinho!</Text>
          </View>
        </Animated.View>
      )}
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
    maxWidth: 1180,
    marginVertical: 22,
    marginBottom: 120,
    borderRadius: 24,
    overflow: 'hidden',
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
    marginTop: 28,
    marginHorizontal: 24,
    marginBottom: 12,
    color: '#17182B',
    letterSpacing: -0.7,
  },
  lista: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 120,
  },
  row: {
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    gap: 18,
  },
  card: {
    flex: 1,
    minWidth: 0,
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EAECF5',
    overflow: 'hidden',
    shadowColor: '#211447',
    shadowOpacity: 0.045,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  containerImagem: {
    width: '100%',
    height: 220,
    backgroundColor: '#F8F7FC',
    padding: 18,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  imagem: {
    width: '100%',
    height: '100%',
  },
  semImagem: {
    height: 220,
    backgroundColor: '#F8F7FC',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  informacoes: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    flex: 1,
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#F0EFF7',
    gap: 4,
  },
  nome: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
    color: '#202239',
    marginBottom: 4,
    minHeight: 46,
  },
  descricao: {
    color: '#73788B',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  preco: {
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '800',
    color: '#6D28D9',
    marginTop: 4,
  },
  estoque: {
    color: '#83899D',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 8,
    fontWeight: '600',
  },
  botao: {
    backgroundColor: '#6D28D9',
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    marginTop: 4,
    shadowColor: '#6D28D9',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  desabilitado: {
    backgroundColor: '#D8DAE4',
    shadowOpacity: 0,
    elevation: 0,
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  vazio: {
    textAlign: 'center',
    marginTop: 44,
    color: '#73788B',
    fontSize: 15,
    lineHeight: 23,
  },
  erro: {
    textAlign: 'left',
    color: '#B42332',
    marginHorizontal: 24,
    marginBottom: 12,
    fontWeight: '600',
    fontSize: 14,
  },
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 28 : 54,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    paddingHorizontal: 20,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#211A37',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 6,
    gap: 10,
  },
  toastText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
