import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useCart } from '../../CartContext';

export default function TabLayout() {
  const { totalItens } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#222222',
        tabBarInactiveTintColor: '#777777',
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Catálogo', tabBarIcon: () => <Text>🛍️</Text> }}
      />
      <Tabs.Screen
        name="carrinho"
        options={{
          title: 'Carrinho',
          tabBarBadge: totalItens > 0 ? totalItens : undefined,
          tabBarIcon: () => <Text>🛒</Text>,
        }}
      />
      <Tabs.Screen
        name="pedidos"
        options={{ title: 'Pedidos', tabBarIcon: () => <Text>📦</Text> }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Minha conta', tabBarIcon: () => <Text>👤</Text> }}
      />
      <Tabs.Screen
        name="gestao"
        options={{ href: null, title: 'Gestão' }}
      />
    </Tabs>
  );
}
