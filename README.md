# ConferePátio

Aplicativo mobile-first para controle operacional de veículos em estacionamento.  
Registre veículos por piso e vaga, localize rapidamente e marque quando um carro desceu para entrega.

## Tecnologias

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- React Router 6
- PWA (vite-plugin-pwa + Workbox)
- LocalStorage (sem backend)

## Instalação e uso

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Gerar build de produção
npm run build

# Pré-visualizar build
npm run preview
```

## Deploy na Vercel

1. Faça push do projeto para o GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. Framework: **Vite** (detectado automaticamente)
4. Build command: `npm run build`
5. Output directory: `dist`
6. Clique em **Deploy**

## Ícones PWA

O ícone SVG em `public/icons/icon.svg` funciona na maioria dos navegadores modernos.  
Para máxima compatibilidade Android/Chrome, gere os PNGs:

```bash
# Usando o pacote sharp (opcional)
npx sharp-cli resize 192 --input public/icons/icon.svg --output public/icons/icon-192.png
npx sharp-cli resize 512 --input public/icons/icon.svg --output public/icons/icon-512.png
```

Ou converta online em [svgtopng.com](https://svgtopng.com) e salve em `public/icons/`.

## Estrutura do projeto

```
src/
├── types/          # Tipos TypeScript (Floor, ParkingSpot, Vehicle, VehicleHistory)
├── storage/        # Camada de acesso ao LocalStorage (trocar por Supabase aqui)
├── services/       # Lógica de negócio (floorService, vehicleService, historyService)
├── data/           # Lista de modelos de carros para autocomplete
├── components/     # Componentes reutilizáveis
└── pages/          # Telas da aplicação
```

## Migrando para backend (Supabase)

Apenas substitua as funções em `src/storage/localStorageRepository.ts`  
pelos clientes Supabase correspondentes. Os services e componentes não precisam mudar.

## Funcionalidades

- **Início** — resumo do dia (veículos no pátio, vagas livres, entregas)
- **Pisos** — cadastro e gestão de pisos/andares com vagas geradas automaticamente
- **Mapa de vagas** — grade visual, clique para registrar ou ver detalhes
- **Busca** — pesquisa por placa, modelo, piso ou vaga em tempo real
- **Histórico** — registro de todas as entregas do dia com filtros
- **PWA** — instale na tela inicial do celular e use offline
