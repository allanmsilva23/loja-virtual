import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../AuthContext';
import { CartProvider } from '../CartContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </CartProvider>
    </AuthProvider>
  );
}
