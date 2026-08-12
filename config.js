// =========================================================
// Configuração da conexão com o Supabase.
//
// A chave abaixo é a PUBLICÁVEL (publishable). Ela é feita para
// ficar exposta no navegador — sozinha, não abre nada. Quem decide
// o que cada pessoa vê são as policies de RLS, depois do login.
//
// NUNCA coloque aqui a service_role key: ela ignora o RLS e
// abriria DP, crédito e financeiro para qualquer um que abrisse
// o código-fonte da página.
// =========================================================

export const SUPABASE_URL = 'https://dudouxbuhqjvkhhkdtas.supabase.co'
export const SUPABASE_KEY = 'sb_publishable_Ag89O5TYsMQKOJbGn32H3Q_85iOi65D'

// Skin padrão: 'sofisticado' | 'plataforma' | 'daylight'
export const SKIN_PADRAO = 'plataforma'
