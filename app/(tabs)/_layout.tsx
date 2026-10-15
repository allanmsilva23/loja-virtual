import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../CartContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Feather } from '@expo/vector-icons'; 

export default function TabLayout() {
  const { totalItens } = useCart();
  const theme = useColorScheme() ?? 'light';
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLargeScreen = width >= 768;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6D28D9',
        tabBarInactiveTintColor: Colors[theme].tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors[theme].surface,
          borderTopWidth: 0,
          borderTopColor: 'transparent',
          height: Platform.OS === 'web' && isLargeScreen ? 78 : 66 + insets.bottom,
          paddingBottom: Platform.OS === 'web' && isLargeScreen ? 15 : 10 + insets.bottom,
          paddingTop: 8,
          width: isLargeScreen ? 768 : '100%',
          borderRadius: isLargeScreen ? 24 : 0,
          marginBottom: isLargeScreen ? 20 : 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.09,
          shadowRadius: 24,
          elevation: 10,
          position: isLargeScreen ? 'absolute' : 'relative',
          bottom: isLargeScreen ? 20 : 0,
          left: isLargeScreen ? '50%' : 0,
          transform: isLargeScreen ? [{ translateX: -384 }] : [],
        },
        tabBarLabelStyle: { 
          fontSize: 11,
          fontWeight: '700',
          marginTop: 4,
        },
        tabBarItemStyle: {
          padding: 3,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ 
          title: 'Catálogo', 
          tabBarIcon: ({ color }) => <Feather name="grid" size={24} color={color} /> 
        }}
      />
      <Tabs.Screen
        name="carrinho"
        options={{
          title: 'Carrinho',
          tabBarBadge: totalItens > 0 ? totalItens : undefined,
          tabBarIcon: ({ color }) => <Feather name="shopping-bag" size={24} color={color} />,
          tabBarBadgeStyle: { backgroundColor: '#E5484D', color: '#FFFFFF', fontWeight: '700' }
        }}
      />
      <Tabs.Screen
        name="pedidos"
        options={{ 
          title: 'Pedidos', 
          tabBarIcon: ({ color }) => <Feather name="package" size={24} color={color} /> 
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ 
          title: 'Minha conta', 
          tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} /> 
        }}
      />
      <Tabs.Screen
        name="gestao"
        options={{ href: null, title: 'Gestão' }}
      />
    </Tabs>
  );
}
