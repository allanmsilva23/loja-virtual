import { Alert, Platform } from 'react-native';

type Listener = (titulo: string, mensagem: string) => void;
let alertaListener: Listener | null = null;

export const setAvisoListener = (listener: Listener | null) => {
  alertaListener = listener;
};

export function avisar(titulo: string, mensagem: string) {
  if (alertaListener) {
    alertaListener(titulo, mensagem);
  } else {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(`${titulo}\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  }
}