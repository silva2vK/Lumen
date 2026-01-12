import { getStorage } from 'firebase/storage';
import { app } from './firebaseClient';

// Inicialização isolada do Storage para Code Splitting.
// Este arquivo só será baixado/executado quando um componente o importar.
export const storage = getStorage(app);
