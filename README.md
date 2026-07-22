# ParkScan

PWA mobile-first para controle operacional de veículos em estacionamentos. O aplicativo permite configurar pisos e vagas, registrar veículos, localizar carros estacionados e manter o histórico diário de entregas.

> Os dados são armazenados exclusivamente no `localStorage` do navegador. Atualmente não há servidor, autenticação, sincronização entre dispositivos ou backup automático.

## Stack

- React 18 e TypeScript
- Vite 5
- Tailwind CSS 3
- React Router 6
- vite-plugin-pwa e Workbox
- LocalStorage

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior (recomendado)

## Início rápido

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

Para testar em um celular conectado à mesma rede:

```bash
npm run dev:lan
```

Abra `http://IP-DO-COMPUTADOR:5173` no celular. No Windows, use `ipconfig` para localizar o endereço IPv4. Caso não conecte, confirme que o firewall permite conexões privadas para o Node.js.

## Scripts

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Servidor local de desenvolvimento |
| `npm run dev:lan` | Servidor acessível na rede local |
| `npm run typecheck` | Verificação estática do TypeScript |
| `npm run test` | Testes automatizados |
| `npm run build` | Typecheck seguido do build de produção |
| `npm run preview` | Pré-visualização do build |
| `npm run preview:lan` | Pré-visualização acessível na rede local |

## Estrutura resumida

```text
src/
├── components/  Componentes visuais reutilizáveis
├── data/        Catálogo versionado de marcas e modelos
├── lib/         Funções utilitárias sem regra de tela
├── pages/       Páginas associadas às rotas
├── services/    Regras de negócio
├── storage/     Persistência no navegador
└── types/       Entidades do domínio
```

## Documentação para desenvolvimento

Leia o [guia completo de onboarding](docs/ONBOARDING.md) antes de alterar o projeto. Ele explica a arquitetura, o modelo de dados, todos os fluxos de negócio, o catálogo de veículos, testes, deploy, limitações e procedimentos de manutenção.

## Validação antes de publicar

```bash
npm run typecheck
npm run test
npm run build
```

## Deploy na Vercel

Importe o repositório como um projeto Vite e utilize:

- Build command: `npm run build`
- Output directory: `dist`
- Node.js: 20 ou superior

O arquivo `vercel.json` mantém o fallback de navegação necessário para as rotas do SPA.
