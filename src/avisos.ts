type Listener = (titulo: string, mensagem: string) => void;
let alertaListener: Listener | null = null;

export const setAvisoListener = (listener: Listener | null) => {
  alertaListener = listener;
};

export function avisar(titulo: string, mensagem: string) {
  if (alertaListener) {
    alertaListener(titulo, mensagem);
  } else {
    window.alert(`${titulo}\n${mensagem}`);
  }
}