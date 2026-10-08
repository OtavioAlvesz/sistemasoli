# TechRequest (Expo + TypeScript + Supabase)
1. Crie um projeto no Supabase e rode `supabase/schema.sql` no SQL Editor.
2. (Opcional, p/ testes) Em Auth > Providers > Email, desative "Confirm email".
3. `cp .env.example .env` e preencha URL e chave anon.
4. `npm install && npx expo start` e abra no Expo Go (Android/iOS).

Segurança: o chat é protegido por RLS — só o comprador da solicitação e o vendedor da proposta leem/enviam mensagens.

Pendente (próximos passos): upload de imagens (expo-image-picker + Supabase Storage), push notifications (expo-notifications), avaliações de vendedor, catálogo de produtos da loja.
