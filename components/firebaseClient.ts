import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
// import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBngjjfMrWg7O9TABuQNI0rlq-ktce9U30",
  authDomain: "historiaacessivel-ii.firebaseapp.com",
  projectId: "historiaacessivel-ii",
  storageBucket: "historiaacessivel-ii.firebasestorage.app",
  messagingSenderId: "652479717072",
  appId: "1:652479717072:web:49b1824c113c67faed08d5"
};

// Inicializa o Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Inicializa o Firestore com cache persistente
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Inicialização do App Check
// DESATIVADO TEMPORARIAMENTE PARA MANUTENÇÃO/LIMPEZA
/*
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const appCheck = initializeAppCheck(app, {
    // Substitua 'CHAVE_PUBLICA_RECAPTCHA_AQUI' pela sua Site Key do Google reCAPTCHA v3
    // Se não tiver uma, o App Check ficará em modo "não-enforced" até você configurar.
    provider: new ReCaptchaV3Provider('6LeJpbEqAAAAADu7YQx-j7y9Kz8G-s5q9x0z1y2w'), 
    isTokenAutoRefreshEnabled: true
  });
}
*/