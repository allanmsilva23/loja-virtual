export type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  estoque: number;
  imagem_url: string | null;
  ativo: boolean;
};

export type ItemCarrinho = {
  produto: Produto;
  quantidade: number;
};

export type Pedido = {
  id: string;
  numero_pedido: number;
  cliente_id: string;
  status: string;
  total: number;
  created_at: string;
};

export type ItemPedido = {
  id: string;
  pedido_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  nome_produto: string | null;
};

export const dinheiro = (valor: number | string) =>
  Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

export const dataBrasil = (valor: string) => new Date(valor).toLocaleString('pt-BR');
