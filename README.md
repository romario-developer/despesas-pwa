# Despesas PWA

PWA em React + TypeScript para controle de despesas consumindo a API existente.

## Requisitos
- Node 20+ recomendado

## Como rodar local
1. Instale dependências: `npm ci`
2. Copie variáveis: `cp .env.example .env` (ou crie `.env` manualmente)
3. Execute em modo dev: `npm run dev`
4. Acesse a URL indicada pelo Vite.

## Variáveis de ambiente
```
VITE_API_URL=https://chatbot-despesas.onrender.com
```
Use `import.meta.env.VITE_API_URL` no código (já configurado).

## Build / Produção (Render Static Site)
- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Environment: defina `VITE_API_URL`

## Funcionalidades (Parte A)
- Login com senha única e token salvo em `localStorage`
- Rotas protegidas com React Router e ProtectedRoute
- Layout com header, navegação e logout
- Botões de teste: `/api/summary` e `/api/entries`
- Tailwind configurado + PWA (manifest e ícones placeholder)
