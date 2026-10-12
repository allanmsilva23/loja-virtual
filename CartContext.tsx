import React, { createContext, useContext, useMemo, useState } from 'react';
import { ItemCarrinho, Produto } from './tipos';

type CartContextValue = {
  cart: ItemCarrinho[];
  cartTotal: number;
  totalItens: number;
  addToCart: (produto: Produto) => void;
  aumentar: (id: string) => void;
  diminuir: (id: string) => void;
  remover: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<ItemCarrinho[]>([]);

  const addToCart = (produto: Produto) => {
    if (!produto.ativo || produto.estoque < 1) return;

    setCart((anterior) => {
      const existe = anterior.find((item) => item.produto.id === produto.id);
      if (!existe) return [...anterior, { produto, quantidade: 1 }];
      return anterior.map((item) =>
        item.produto.id === produto.id
          ? {
              produto,
              quantidade: Math.min(item.quantidade + 1, produto.estoque),
            }
          : item
      );
    });
  };

  const aumentar = (id: string) => {
    setCart((anterior) =>
      anterior.map((item) =>
        item.produto.id === id
          ? { ...item, quantidade: Math.min(item.quantidade + 1, item.produto.estoque) }
          : item
      )
    );
  };

  const diminuir = (id: string) => {
    setCart((anterior) =>
      anterior
        .map((item) =>
          item.produto.id === id ? { ...item, quantidade: item.quantidade - 1 } : item
        )
        .filter((item) => item.quantidade > 0)
    );
  };

  const remover = (id: string) => {
    setCart((anterior) => anterior.filter((item) => item.produto.id !== id));
  };

  const clearCart = () => setCart([]);

  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + Number(item.produto.preco) * item.quantidade, 0),
    [cart]
  );

  const totalItens = useMemo(
    () => cart.reduce((total, item) => total + item.quantidade, 0),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{ cart, cartTotal, totalItens, addToCart, aumentar, diminuir, remover, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const contexto = useContext(CartContext);
  if (!contexto) throw new Error('CartProvider não encontrado');
  return contexto;
}
