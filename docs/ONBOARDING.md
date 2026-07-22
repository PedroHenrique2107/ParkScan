# Onboarding técnico do ParkScan

Este é o documento técnico principal do projeto. Seu objetivo é permitir que uma pessoa desenvolvedora entenda o produto, prepare o ambiente, acompanhe os fluxos de dados e faça alterações com segurança sem depender de conhecimento informal.

## 1. Visão do produto

O ParkScan atende à operação diária de um estacionamento. Pisos contêm vagas; uma vaga pode referenciar um veículo estacionado; quando o veículo desce para entrega, a vaga é liberada e uma cópia dos dados operacionais é adicionada ao histórico.

A aplicação é uma SPA/PWA offline-first, mas não é multiusuário. Todos os dados operacionais existem apenas no `localStorage` do navegador e perfil que abriu o sistema.

### Funcionalidades

- Painel com ocupação, vagas livres e entregas do dia.
- Configuração visual de pisos e vagas.
- Mapa de um piso ou de todos os pisos.
- Registro, edição, busca, remoção e entrega de veículos.
- Validação de placas brasileiras antigas e Mercosul.
- Catálogo local de marcas e modelos com autocomplete.
- Histórico diário de entregas.
- Instalação como PWA e funcionamento offline após o primeiro carregamento.

## 2. Preparação do ambiente

Instale Node.js 20 ou superior. Depois, na raiz do repositório:

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`. Para testar em outro dispositivo na mesma rede, execute `npm run dev:lan` e use o IPv4 do computador na porta 5173.

Antes de começar uma alteração, execute:

```bash
npm run typecheck
npm run test
```

Isso registra a condição inicial do projeto e evita atribuir à alteração um problema que já existia.

### Ordem recomendada de leitura

1. `src/types/index.ts`: entidades do domínio.
2. `src/storage/localStorageRepository.ts`: fronteira de persistência.
3. `src/services/`: regras de negócio.
4. `src/App.tsx`: rotas e manutenção diária.
5. `src/pages/`: composição dos fluxos.
6. `src/components/`: formulários, modais e elementos reutilizáveis.
7. `src/data/carModels.ts`: catálogo de veículos.

## 3. Arquitetura

### 3.1 Camadas

```text
main.tsx
  └── App.tsx (rotas e manutenção diária)
      └── pages (estado e orquestração de cada tela)
          ├── components (interface reutilizável)
          └── services (regras de negócio)
              └── storage/localStorageRepository.ts
                  └── localStorage do navegador
```

`pages` pode chamar `services`; componentes de formulário podem chamar serviços quando são responsáveis por uma ação completa. `services` não deve depender de React. Somente a camada `storage` deve conhecer chaves e detalhes do `localStorage`.

Algumas páginas leem o repositório diretamente para construir mapas de veículos. Isso funciona, mas é uma exceção arquitetural que deve ser removida se a persistência migrar para um backend assíncrono.

### 3.2 Inicialização e rotas

`main.tsx` monta o React com `BrowserRouter`. `App.tsx` declara as rotas sob `Layout`, que fornece a região rolável, o gesto de pull-to-refresh e a navegação inferior.

| Rota | Página | Responsabilidade |
| --- | --- | --- |
| `/` | `HomePage` | Indicadores e atalhos |
| `/floor-map` | `AllFloorsMapPage` | Mapa consolidado |
| `/floors` | `FloorsPage` | Administração de pisos |
| `/floors/new` | `FloorConfigPage` | Novo piso e layout |
| `/floors/edit/:floorId` | `FloorConfigPage` | Edição do piso |
| `/floors/:floorId` | `FloorMapPage` | Operação de um piso |
| `/search` | `SearchPage` | Busca de veículos ativos |
| `/history` | `HistoryPage` | Entregas do dia |

Rotas desconhecidas retornam para `/`.

### 3.3 Atualização de estado

Não existe store global. Cada página carrega seus dados dos serviços e mantém uma cópia em estado local. `APP_REFRESH_EVENT` é um evento de janela usado para solicitar recarga das páginas montadas. O pull-to-refresh apenas dispara esse evento; ele não faz uma requisição de rede.

Depois de uma mutação, o componente responsável chama seu callback `onRefresh` ou `load`. Ao criar novas operações, garanta que a tela seja recarregada após a persistência.

### 3.4 PWA

`vite.config.ts` configura manifest, service worker com atualização automática e fallback para `index.html`. Os arquivos gerados em `dist` não são fonte e não devem ser editados manualmente. Alterações podem permanecer invisíveis em instalações antigas até o service worker atualizar; use as ferramentas do navegador para remover o service worker e limpar caches durante diagnósticos.

## 4. Domínio e persistência

### 4.1 Entidades

**Floor** representa um piso ou setor. `totalSpots` é um valor derivado do layout salvo; `columns` existe por compatibilidade com o layout original. Datas são strings ISO.

**ParkingSpot** representa uma vaga. `floorId` identifica o piso e `vehicleId`, quando presente, indica ocupação. `x` e `y` são posições percentuais no editor visual.

**Vehicle** é o registro operacional. `PARKED` significa ativo na vaga; `MOVED_DOWN` significa entregue. O modelo permanece como texto para preservar entrada manual e compatibilidade com dados antigos.

**VehicleHistory** é um snapshot da entrega. Nomes de piso e vaga são copiados para que o histórico continue legível mesmo após a configuração ser alterada.

### 4.2 Relacionamentos

```text
Floor 1 ─── N ParkingSpot
Floor 1 ─── N Vehicle
ParkingSpot 0..1 ─── 0..1 Vehicle ativo
Vehicle entregue 1 ─── 1 VehicleHistory
```

Não existe banco relacional impondo essas regras. A integridade depende dos serviços.

### 4.3 Chaves do localStorage

| Chave | Conteúdo |
| --- | --- |
| `cp:floors` | `Floor[]` |
| `cp:spots` | `ParkingSpot[]` |
| `cp:vehicles` | `Vehicle[]` |
| `cp:history` | `VehicleHistory[]` |
| `cp:lastDailyCleanup` | Identificador local do último dia processado |

`safeGet` tolera JSON inválido retornando o fallback, mas não valida o formato dos objetos. `safeSet` pode lançar erro por falta de espaço ou bloqueio do navegador.

### 4.4 Placas

`lib/plate.ts` remove caracteres inválidos, converte letras para maiúsculas, formata placa antiga como `ABC-1234` e aceita Mercosul como `ABC1D23`. O formulário alterna o teclado móvel entre texto e numérico conforme a próxima posição.

### 4.5 Manutenção diária

Ao montar `App`, a manutenção roda imediatamente, a cada minuto e em mudanças de visibilidade. Se houver veículos `PARKED` criados em outro dia, eles são removidos e suas vagas liberadas. Esta ação não cria histórico. Essa regra é destrutiva e deve ser confirmada com a operação antes de qualquer evolução do produto.

## 5. Fluxos funcionais

### 5.1 Configurar piso

`FloorConfigPage` cria ou edita o layout. `floorService` normaliza números duplicados, grava o piso e depois as vagas. Posições são manipuladas pela interface de drag-and-drop. Ao editar, IDs conhecidos são preservados; vagas novas recebem IDs locais.

Atenção: remover do layout uma vaga ocupada pode deixar um veículo apontando para uma vaga inexistente. Antes de evoluir essa tela, introduza validação que impeça a remoção ou uma política explícita de realocação.

### 5.2 Registrar veículo

1. O operador toca em uma vaga livre.
2. `VehicleForm` coleta placa, modelo e observação.
3. A placa é formatada e validada conforme o tipo escolhido.
4. O serviço impede uma segunda placa ativa igual.
5. `registerVehicle` grava o veículo.
6. O ID do veículo é atribuído à vaga.
7. A página recarrega o mapa.

O modelo sugerido vem do catálogo, mas texto livre continua aceito. Isso permite veículos ausentes ou grafias específicas sem bloquear a operação.

### 5.3 Editar ou remover

Editar altera placa, modelo e observação, mantendo piso e vaga. Remover apaga o veículo e libera a vaga sem criar histórico. Alterações de localização exigiriam uma operação específica e não devem ser simuladas mudando IDs manualmente.

### 5.4 Entregar veículo

`markMovedDown` muda o status para `MOVED_DOWN`, registra o horário, libera a vaga e cria um `VehicleHistory`. São várias gravações locais sequenciais e não atômicas.

### 5.5 Buscar

`searchVehicles` pesquisa somente veículos `PARKED`, comparando placa formatada e limpa, modelo, nome do piso e número da vaga. A busca percorre os registros em memória e é adequada ao volume atual.

### 5.6 Histórico

A tela mostra somente entregas cuja data local de `movedDownAt` corresponde ao dia atual. O filtro aceita placa, modelo e piso. Limpar o histórico do dia remove definitivamente esses registros.

### 5.7 Catálogo de modelos

`data/carModels.ts` mantém registros tipados por marca, modelo e aliases. A opção persistida usa `Marca Modelo`, evitando ambiguidades entre modelos com nomes semelhantes. A busca normaliza caixa e acentos e considera aliases, enquanto dados históricos continuam sendo strings válidas.

Para atualizar o catálogo:

1. Use fonte pública ou fabricante com licença compatível.
2. Adicione o modelo ao grupo correto, sem anos, versões de motor ou acabamento.
3. Use alias apenas para um nome realmente utilizado na busca.
4. Execute testes para detectar valores duplicados ou inválidos.
5. Atualize a data e a descrição da origem no comentário do catálogo quando aplicável.

## 6. Manutenção, testes, limitações e decisões

### 6.1 Estratégia de testes

Os testes automatizados cobrem inicialmente funções puras: normalização, relevância do autocomplete, aliases, unicidade do catálogo e regras de placa. Fluxos de UI e persistência devem ser adicionados gradualmente com ambiente DOM controlado.

Checklist manual mínimo:

- Criar e editar piso e vagas.
- Registrar placas antiga e Mercosul.
- Rejeitar placa ativa duplicada.
- Buscar por placa, modelo, piso e vaga.
- Editar e remover um veículo.
- Entregar e conferir vaga livre e histórico.
- Reabrir a aplicação e confirmar persistência.
- Instalar/atualizar a PWA em um celular.

### 6.2 Comandos de qualidade

```bash
npm run typecheck
npm run test
npm run build
```

Não publique com qualquer um desses comandos falhando.

### 6.3 Diagnóstico de dados

No DevTools, abra Application > Local Storage. Antes de investigar corrupção, exporte os valores das chaves `cp:*`. Não edite dados de produção diretamente sem um backup.

Se o app mostrar dados vazios, confirme o domínio, protocolo e perfil do navegador: cada origem possui seu próprio armazenamento. Limpar dados do site é destrutivo e não pode ser desfeito pelo aplicativo.

### 6.4 Limitações e riscos conhecidos

- Sem autenticação ou autorização.
- Sem sincronização, backup ou auditoria central.
- Escritas relacionadas não são transacionais.
- Conteúdo armazenado não possui validação de schema nem migrações.
- A manutenção diária remove registros ativos antigos sem histórico.
- A exclusão de piso remove veículos sem histórico.
- A edição do layout pode criar referências órfãs.
- IDs locais não têm garantia criptográfica forte.
- Algumas páginas atravessam a camada de serviços e acessam o repositório.
- Crescimento ilimitado do histórico pode alcançar a cota do navegador.

### 6.5 Decisões arquiteturais atuais

**LocalStorage:** escolhido pela simplicidade e operação offline em um dispositivo. Uma migração para backend exige tornar o repositório assíncrono; portanto, serviços e páginas também precisarão mudar. A simples troca mencionada em versões antigas do README não seria suficiente.

**Catálogo local:** escolhido porque sugestões precisam funcionar offline e não justificam um backend. O catálogo é dado de referência versionado, não o banco operacional de veículos.

**Modelo persistido como string:** preserva compatibilidade e entrada livre. Separar `brandId` e `modelId` exigirá migração e tratamento de registros antigos.

**Estado por página:** suficiente para o porte atual, com evento global simples para recarga. Se surgirem sincronização remota e estados concorrentes, avalie uma camada de consulta/cache apropriada.

### 6.6 Segurança e privacidade

Placas e observações podem ser dados pessoais ou operacionais sensíveis. Evite registrar esses valores no console, em analytics ou em mensagens de erro externas. Em um futuro backend, implemente autenticação, autorização por estabelecimento, criptografia em trânsito, política de retenção e trilha de auditoria.

### 6.7 Processo recomendado para alterações

1. Identifique entidade, serviço e telas afetados.
2. Registre as invariantes que não podem quebrar.
3. Escreva ou atualize testes das regras puras.
4. Faça a menor alteração completa possível.
5. Execute os três comandos de qualidade.
6. Percorra o checklist manual relevante.
7. Atualize este onboarding quando arquitetura ou comportamento mudar.

## 7. Deploy e recuperação

O build é gerado em `dist` e pode ser publicado na Vercel. `vercel.json` direciona rotas da SPA para `index.html`. Em incidentes, uma versão anterior do frontend pode ser republicada, mas isso não restaura dados apagados do navegador. Uma política real de recuperação depende da futura adoção de backend ou de exportação/importação local.

## 8. Definição de pronto

Uma mudança está pronta quando regras e tipos estão coerentes, testes e build passam, fluxos manuais afetados foram verificados, não há perda silenciosa de compatibilidade e a documentação continua representando o comportamento real.
