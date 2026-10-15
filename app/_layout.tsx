import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../AuthContext';
import { CartProvider } from '../CartContext';
import { View, StyleSheet, Text, TouchableOpacity, Modal } from 'react-native';
import { setAvisoListener } from '../avisos';

export default function RootLayout() {
  const [alerta, setAlerta] = useState<{ titulo: string, mensagem: string } | null>(null);

  useEffect(() => {
    setAvisoListener((titulo, mensagem) => {
      setAlerta({ titulo, mensagem });
    });

    return () => setAvisoListener(null);
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <View style={styles.container}>
          <Stack screenOptions={{ 
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' }
          }} />

          <Modal
            transparent={true}
            visible={!!alerta}
            animationType="fade"
            onRequestClose={() => setAlerta(null)}
          >
            <View style={styles.overlay}>
              <View style={styles.card}>
                <Text style={styles.titulo}>{alerta?.titulo}</Text>
                <Text style={styles.mensagem}>{alerta?.mensagem}</Text>
                
                <TouchableOpacity 
                  style={styles.botao} 
                  onPress={() => setAlerta(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.botaoTexto}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </CartProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f3f4f6',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#222',
    padding: 24,
    borderRadius: 12,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  titulo: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mensagem: {
    color: '#ddd',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  botao: {
    backgroundColor: '#fff',
    alignSelf: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  botaoTexto: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
  }
});