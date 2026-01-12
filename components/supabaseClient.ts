
import { createClient } from '@supabase/supabase-js';

// Acesso seguro às variáveis de ambiente para evitar erros em tempo de execução
const env = (import.meta as any).env || {};

// URL do projeto Supabase fornecida
const supabaseUrl = env.VITE_SUPABASE_URL || "https://gsojfhvhkosqrlzecpnh.supabase.co";

// Chave Pública (Anon)
// Nota: Certifique-se de que esta chave (começando com 'sb_publishable') é a chave correta do Supabase (geralmente começa com 'eyJ').
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || "sb_publishable_-3wsQ3xAGGN5Bs6T5ZfGyg_bUOxh-a1";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ ALERTA: Credenciais do Supabase incompletas. Verifique o arquivo components/supabaseClient.ts");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public',
  },
});
