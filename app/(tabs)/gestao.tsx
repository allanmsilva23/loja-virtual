import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../AuthContext';
import { supabase } from '../../supabase';
import { Pedido, Produto, dataBrasil, dinheiro } from '../../tipos';
import { avisar } from '../../avisos';

const proximosStatus: Record<string, string[]> = {
  pendente: ['confirmado', 'cancelado'],
  confirmado: ['enviado', 'cancelado'],
  enviado: ['entregue'],
  entregue: [],
  cancelado: [],
};

export default function GestaoScreen() {
  const { user } = useAuth();
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [aba, setAba] = useState<'produtos' | 'pedidos'>('produtos');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<Record<string, string>>({});
  const [produtoId, setProdutoId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('0');
  const [imagemUrl, setImagemUrl] = useState('');
  const [ativo, setAtivo] = useState(true);

  const carregar = useCallback(async () => {
    if (!user) {
      setAdmin(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const verificacao = await supabase.rpc('usuario_e_admin');
      if (verificacao.error) throw verificacao.error;
      const podeGerenciar = Boolean(verificacao.data);
      setAdmin(podeGerenciar);
      if (!podeGerenciar) return;

      const [respostaProdutos, respostaPedidos] = await Promise.all([
        supabase
          .from('produtos')
          .select('id, nome, descricao, preco, estoque:quantidade_estoque, imagem_url, ativo')
          .order('nome'),
        supabase
          .from('pedidos')
          .select('id, numero_pedido, cliente_id, status, total, created_at')
          .order('created_at', { ascending: false })
          .limit(100),
      ]);

      if (respostaProdutos.error) throw respostaProdutos.error;
      if (respostaPedidos.error) throw respostaPedidos.error;

      const listaPedidos = (respostaPedidos.data || []) as Pedido[];
      setProdutos((respostaProdutos.data || []) as Produto[]);
      setPedidos(listaPedidos);

      const idsClientes = [...new Set(listaPedidos.map((pedido) => pedido.cliente_id).filter(Boolean))] as string[];
      if (idsClientes.length > 0) {
        const respostaClientes = await supabase
          .from('clientes')
          .select('id, nome, email')
          .in('id', idsClientes);
        if (respostaClientes.error) throw respostaClientes.error;
        const nomes: Record<string, string> = {};
        for (const cliente of respostaClientes.data || []) {
          nomes[cliente.id] = `${cliente.nome} (${cliente.email})`;
        }
        setClientes(nomes);
      } else {
        setClientes({});
      }
    } catch (error: any) {
      avisar('Erro na gestão', error?.message || 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const limparFormulario = () => {
    setProdutoId(null);
    setNome('');
    setDescricao('');
    setPreco('');
    setEstoque('0');
    setImagemUrl('');
    setAtivo(true);
  };

  const editarProduto = (produto: Produto) => {
    setProdutoId(produto.id);
    setNome(produto.nome);
    setDescricao(produto.descricao || '');
    setPreco(String(produto.preco));
    setEstoque(String(produto.estoque));
    setImagemUrl(produto.imagem_url || '');
    setAtivo(produto.ativo);
  };

  const salvarProduto = async () => {
    const precoNumero = Number(preco.trim().replace(',', '.'));
    const estoqueNumero = Number(estoque.trim());
    const url = imagemUrl.trim();

    if (!nome.trim() || !Number.isFinite(precoNumero) || precoNumero < 0
      || !Number.isInteger(estoqueNumero) || estoqueNumero < 0) {
      avisar('Dados inválidos', 'Informe nome, preço válido e estoque inteiro não negativo.');
      return;
    }

    if (url && !/^https:\/\//i.test(url)) {
      avisar('Imagem inválida', 'Informe uma URL HTTPS pública da imagem.');
      return;
    }

    const dados = {
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      preco: precoNumero,
      quantidade_estoque: estoqueNumero,
      imagem_url: url || null,
      ativo,
    };

    setSalvando(true);
    try {
      const resposta = produtoId
        ? await supabase.from('produtos').update(dados).eq('id', produtoId)
        : await supabase.from('produtos').insert(dados);
      if (resposta.error) throw resposta.error;
      limparFormulario();
      avisar('Produto', 'Produto salvo com sucesso.');
      await carregar();
    } catch (error: any) {
      avisar('Não foi possível salvar', error?.message || 'Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const alterarStatus = async (pedidoId: string, status: string) => {
    setSalvando(true);
    try {
      const { error } = await supabase.rpc('alterar_status_pedido', {
        p_pedido_id: pedidoId,
        p_status: status,
      });
      if (error) throw error;
      avisar('Pedido', 'Status atualizado com sucesso.');
      await carregar();
    } catch (error: any) {
      avisar('Erro ao alterar pedido', error?.message || 'Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centro} />;
  }

  if (!user || !admin) {
    return (
      <View style={styles.centro}>
        <Text>Área restrita aos administradores cadastrados no Supabase.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.titulo}>Gestão da Loja</Text>
      <View style={styles.abas}>
        <TouchableOpacity style={styles.aba} onPress={() => setAba('produtos')}>
          <Text style={styles.abaTexto}>Produtos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.aba} onPress={() => setAba('pedidos')}>
          <Text style={styles.abaTexto}>Pedidos</Text>
        </TouchableOpacity>
      </View>
      {aba === 'produtos' ? (
        <View>
          <Text style={styles.secao}>{produtoId ? 'Editar produto' : 'Novo produto'}</Text>
          <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
          <TextInput style={styles.input} placeholder="Descrição" multiline value={descricao} onChangeText={setDescricao} />
          <TextInput style={styles.input} placeholder="Preço: 79,90" keyboardType="decimal-pad" value={preco} onChangeText={setPreco} />
          <TextInput style={styles.input} placeholder="Estoque" keyboardType="number-pad" value={estoque} onChangeText={setEstoque} />
          <TextInput
            style={styles.input}
            placeholder="URL da imagem"
            value={imagemUrl}
            onChangeText={setImagemUrl}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setAtivo(!ativo)} style={styles.seletor}>
            <Text>Produto ativo: {ativo ? 'Sim' : 'Não'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botao} onPress={salvarProduto} disabled={salvando}>
            <Text style={styles.textoBotao}>{salvando ? 'Salvando...' : 'Salvar produto'}</Text>
          </TouchableOpacity>
          {produtoId && (
            <TouchableOpacity style={styles.seletor} onPress={limparFormulario}>
              <Text>Cancelar edição</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.secao}>Produtos cadastrados</Text>
          {produtos.map((produto) => (
            <View style={styles.card} key={produto.id}>
              <Text style={styles.destaque}>{produto.nome}</Text>
              <Text>{dinheiro(produto.preco)} | Estoque: {produto.estoque}</Text>
              <Text>{produto.ativo ? 'Ativo' : 'Inativo'}</Text>
              <TouchableOpacity style={styles.botaoPequeno} onPress={() => editarProduto(produto)}>
                <Text style={styles.textoBotao}>Editar produto</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <View>
          <Text style={styles.secao}>Últimos 100 pedidos</Text>
          {pedidos.length === 0 ? <Text>Nenhum pedido registrado.</Text> : null}
          {pedidos.map((pedido) => (
            <View key={pedido.id} style={styles.card}>
              <Text style={styles.destaque}>Pedido #{String(pedido.numero_pedido).padStart(6, '0')}</Text>
              <Text>Cliente: {pedido.cliente_id ? clientes[pedido.cliente_id] || pedido.cliente_id : 'Não informado'}</Text>
              <Text>Data: {dataBrasil(pedido.created_at)}</Text>
              <Text>Total: {dinheiro(pedido.total)}</Text>
              <Text>Status: {pedido.status}</Text>
              <View style={styles.acoes}>
                {(proximosStatus[pedido.status] || []).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={styles.botaoPequeno}
                    disabled={salvando}
                    onPress={() => alterarStatus(pedido.id, status)}
                  >
                    <Text style={styles.textoBotao}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
      <TouchableOpacity style={styles.seletor} onPress={carregar}>
        <Text>Atualizar dados</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 50, backgroundColor: '#fff', flexGrow: 1 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  abas: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  aba: { backgroundColor: '#eee', padding: 12, borderRadius: 6, flex: 1, alignItems: 'center' },
  abaTexto: { fontWeight: 'bold' },
  secao: { fontSize: 18, fontWeight: 'bold', marginVertical: 14 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 12, marginBottom: 10 },
  seletor: { alignItems: 'center', padding: 12, marginVertical: 5 },
  botao: { backgroundColor: '#222', padding: 14, alignItems: 'center', borderRadius: 6 },
  textoBotao: { color: '#fff', fontWeight: 'bold' },
  card: { padding: 12, backgroundColor: '#f3f3f3', borderRadius: 6, marginBottom: 12, gap: 5 },
  destaque: { fontWeight: 'bold', fontSize: 16 },
  botaoPequeno: { backgroundColor: '#444', alignSelf: 'flex-start', borderRadius: 5, padding: 9, marginTop: 5 },
  acoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 7 },
});
