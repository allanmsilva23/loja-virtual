import { SymbolView } from 'expo-symbols';
import { Link, Tabs } from 'expo-router';
import { Platform, Pressable } from 'react-native';

import { CartProvider } from '../../CartContext'; 

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <CartProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          // Disable the static render of the header on web
          // to prevent a hydration error in React Navigation v6.
          headerShown: useClientOnlyValue(false, true),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Catálogo',
            tabBarIcon: ({ color }) => (
              <SymbolView
                name={{
                  ios: 'chevron.left.forwardslash.chevron.right',
                  android: 'code',
                  web: 'code',
                }}
                tintColor={color}
                size={28}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="carrinho"
          options={{
            title: 'Carrinho',
            tabBarIcon: ({ color }) => (
              <SymbolView
                name={{
                  ios: 'chevron.left.forwardslash.chevron.right',
                  android: 'code',
                  web: 'code',
                }}
                tintColor={color}
                size={28}
              />
            ),
          }}
        />
      </Tabs>
    </CartProvider>
  );
}