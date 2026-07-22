/** Registro canônico utilizado pelo autocomplete de veículos. */
export interface VehicleModelOption {
  brand: string
  model: string
  aliases?: readonly string[]
}

interface BrandModels {
  brand: string
  models: readonly (string | { name: string; aliases: readonly string[] })[]
}

/**
 * Catálogo offline voltado ao mercado brasileiro.
 *
 * Mantém somente marca/modelo: ano, motorização e acabamento não pertencem ao
 * fluxo operacional do estacionamento. A entrada manual continua permitida.
 */
const VEHICLE_CATALOG: readonly BrandModels[] = [
  { brand: 'Agrale', models: ['Marruá'] },
  { brand: 'Alfa Romeo', models: ['145', '147', '156', '159', 'Giulia', 'Stelvio'] },
  { brand: 'Audi', models: ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'R8', 'TT', 'e-tron'] },
  { brand: 'BMW', models: ['Série 1', 'Série 2', 'Série 3', 'Série 4', 'Série 5', 'Série 6', 'Série 7', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'B7', 'XM', 'Z4', 'i3', 'i4', 'i5', 'i7', 'iX', 'iX1', 'iX3'] },
  { brand: 'BYD', models: ['Dolphin', 'Dolphin Mini', 'Han', 'King', 'Seal', 'Song Plus', 'Song Pro', 'Tan', 'Yuan Plus', 'Yuan Pro'] },
  { brand: 'CAOA Chery', models: ['Arrizo 5', 'Arrizo 6', 'Celer', 'Cielo', 'Face', 'iCar', 'QQ', 'Tiggo 2', 'Tiggo 3X', 'Tiggo 5X', 'Tiggo 7', 'Tiggo 7 Pro', 'Tiggo 8', 'Tiggo 8 Pro'] },
  { brand: 'Chevrolet', models: ['Agile', 'Astra', 'Blazer', 'Bolt', 'Camaro', 'Captiva', 'Celta', 'Chevette', 'Classic', 'Cobalt', 'Corsa', 'Cruze', 'Equinox', 'Ipanema', 'Kadett', 'Malibu', 'Marajó', 'Meriva', 'Monza', 'Montana', 'Omega', 'Onix', 'Onix Plus', 'Opala', 'Prisma', 'S10', 'Silverado', 'Sonic', 'Spin', 'Tracker', 'Trailblazer', 'Vectra', 'Veraneio', 'Zafira'] },
  { brand: 'Chrysler', models: ['300C', 'Caravan', 'Neon', 'Pacifica', 'PT Cruiser', 'Sebring', 'Town & Country'] },
  { brand: 'Citroën', models: ['Aircross', 'AMI', 'Berlingo', 'C3', 'C3 Aircross', 'C4', 'C4 Cactus', 'C4 Lounge', 'C5', 'C5 Aircross', 'C6', 'C8', 'Jumper', 'Jumpy', 'Picasso', 'Xsara'] },
  { brand: 'Dodge', models: ['Challenger', 'Charger', 'Dakota', 'Durango', 'Journey', 'Ram'] },
  { brand: 'Effa', models: ['Hafei', 'M100', 'Picape', 'Towner', 'Van'] },
  { brand: 'Ferrari', models: ['296', '360', '458', '488', '812', 'California', 'F8', 'Portofino', 'Purosangue', 'Roma', 'SF90'] },
  { brand: 'Fiat', models: ['147', '500', 'Argo', 'Brava', 'Bravo', 'Cronos', 'Doblo', 'Ducato', 'Elba', 'Fastback', 'Fiorino', 'Freemont', 'Grand Siena', 'Idea', 'Linea', 'Marea', 'Mobi', 'Oggi', 'Palio', 'Premio', 'Pulse', 'Punto', 'Siena', 'Stilo', 'Strada', 'Tempra', 'Tipo', 'Toro', 'Uno'] },
  { brand: 'Ford', models: ['Belina', 'Bronco Sport', 'Corcel', 'Courier', 'Del Rey', 'EcoSport', 'Edge', 'Escort', 'Expedition', 'F-100', 'F-150', 'F-250', 'Fiesta', 'Focus', 'Fusion', 'Galaxy', 'Jeep', 'Ka', 'Ka Sedan', 'Maverick', 'Mondeo', 'Mustang', 'Pampa', 'Ranger', 'Royale', 'Territory', 'Transit', 'Verona', 'Versailles'] },
  { brand: 'GAC', models: ['Aion ES', 'Aion V', 'Aion Y', 'GS4', 'Hyptec HT'] },
  { brand: 'Geely', models: ['Coolray', 'Emgrand', 'EX2', 'GC2', 'GX3', 'Monjaro'] },
  { brand: 'GWM', models: [{ name: 'Haval H6', aliases: ['H6'] }, 'Haval H9', 'Ora 03', 'Tank 300'] },
  { brand: 'Honda', models: ['Accord', 'City', 'City Hatchback', 'Civic', 'CR-V', 'CR-Z', 'Fit', 'HR-V', 'Insight', 'Legend', 'Odyssey', 'Passport', 'Prelude', 'WR-V', 'ZR-V'] },
  { brand: 'Hyundai', models: ['Accent', 'Azera', 'Creta', 'Elantra', 'Equus', 'Excel', 'Galloper', 'Genesis', 'Grand Santa Fe', 'HB20', 'HB20S', 'HB20X', 'HR', 'i30', 'ix35', 'Kona', 'Palisade', 'Santa Cruz', 'Santa Fe', 'Sonata', 'Terracan', 'Tucson', 'Veloster', 'Veracruz'] },
  { brand: 'Iveco', models: ['Daily'] },
  { brand: 'JAC', models: ['E-JS1', 'E-JS4', 'iEV20', 'J2', 'J3', 'J5', 'J6', 'JS2', 'JS3', 'JS4', 'JS5', 'JS6', 'T40', 'T50', 'T60', 'T80'] },
  { brand: 'Jaguar', models: ['E-Pace', 'F-Pace', 'F-Type', 'I-Pace', 'S-Type', 'XE', 'XF', 'XJ', 'X-Type'] },
  { brand: 'Jeep', models: ['Cherokee', 'Commander', 'Compass', 'Gladiator', 'Grand Cherokee', 'Renegade', 'Wrangler'] },
  { brand: 'Jetour', models: ['Dashing', 'T1', 'T2', 'X70', 'X90'] },
  { brand: 'Kia', models: ['Besta', 'Bongo', 'Cadenza', 'Carnival', 'Carens', 'Cerato', 'Clarus', 'EV5', 'EV9', 'Magentis', 'Mohave', 'Niro', 'Opirus', 'Picanto', 'Rio', 'Sephia', 'Shuma', 'Sorento', 'Soul', 'Sportage', 'Stinger'] },
  { brand: 'Lamborghini', models: ['350 GT', '400 GT', 'Aventador', 'Centenario', 'Countach', 'Diablo', 'Espada', 'Gallardo', 'Huracán', 'Islero', 'Jalpa', 'Jarama', 'LM002', 'Miura', 'Murciélago', 'Reventón', 'Revuelto', 'Sesto Elemento', 'Silhouette', 'Temerario', 'Urraco', 'Urus', 'Veneno'] },
  { brand: 'Lada', models: ['Laika', 'Niva', 'Samara'] },
  { brand: 'Land Rover', models: ['Defender', 'Discovery', 'Discovery Sport', 'Freelander', 'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar'] },
  { brand: 'Lexus', models: ['CT', 'ES', 'GS', 'GX', 'IS', 'LC', 'LS', 'LX', 'NX', 'RC', 'RX', 'UX'] },
  { brand: 'Lifan', models: ['320', '530', '620', 'Foison', 'X50', 'X60', 'X80'] },
  { brand: 'Maserati', models: ['Ghibli', 'GranCabrio', 'GranTurismo', 'Grecale', 'Levante', 'MC20', 'Quattroporte'] },
  { brand: 'Mazda', models: ['2', '3', '323', '626', 'CX-3', 'CX-30', 'CX-5', 'CX-60', 'CX-9', 'MX-3', 'MX-5', 'Protegé', 'RX-7', 'RX-8'] },
  { brand: 'Mercedes-Benz', models: ['Classe A', 'Classe B', 'Classe C', 'Classe CLA', 'Classe CLS', 'Classe E', 'Classe G', 'Classe GL', 'Classe GLA', 'Classe GLB', 'Classe GLC', 'Classe GLE', 'Classe GLS', 'Classe S', 'Classe SL', 'Classe SLC', 'EQA', 'EQB', 'EQC', 'EQE', 'EQS', 'Sprinter', 'Vito'] },
  { brand: 'MINI', models: ['Cabrio', 'Clubman', 'Cooper', 'Countryman', 'Paceman'] },
  { brand: 'Mitsubishi', models: ['3000 GT', 'ASX', 'Colt', 'Eclipse', 'Eclipse Cross', 'Galant', 'Grandis', 'L200', 'Lancer', 'Outlander', 'Pajero', 'Pajero Sport', 'Pajero TR4'] },
  { brand: 'Nissan', models: ['350Z', '370Z', 'Altima', 'Frontier', 'Grand Livina', 'Kicks', 'Leaf', 'Livina', 'March', 'Maxima', 'Murano', 'Pathfinder', 'Quest', 'Sentra', 'Skyline', 'Tiida', 'Versa', 'X-Trail', 'Z'] },
  { brand: 'Peugeot', models: ['106', '2008', '205', '206', '207', '208', '3008', '306', '307', '308', '405', '406', '407', '408', '5008', '508', '605', '607', '806', 'Boxer', 'Expert', 'Hoggar', 'Partner', 'RCZ'] },
  { brand: 'Porsche', models: ['718 Boxster', '718 Cayman', '911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'] },
  { brand: 'RAM', models: ['1500', '2500', '3500', 'Classic', 'Rampage'] },
  { brand: 'Renault', models: ['19', '21', 'Captur', 'Clio', 'Duster', 'Duster Oroch', 'Fluence', 'Kangoo', 'Kardian', 'Koleos', 'Kwid', 'Laguna', 'Logan', 'Master', 'Megane', 'Oroch', 'Sandero', 'Scénic', 'Symbol', 'Trafic', 'Twingo', 'Zoe'] },
  { brand: 'Subaru', models: ['BRZ', 'Forester', 'Impreza', 'Legacy', 'Levorg', 'Outback', 'Tribeca', 'WRX', 'XV'] },
  { brand: 'Suzuki', models: ['Baleno', 'Grand Vitara', 'Ignis', 'Jimny', 'S-Cross', 'Samurai', 'Sidekick', 'Swift', 'SX4', 'Vitara', 'Wagon R'] },
  { brand: 'Tesla', models: ['Model 3', 'Model S', 'Model X', 'Model Y'] },
  { brand: 'Toyota', models: ['Avalon', 'Bandeirante', 'Camry', 'Celica', 'Corolla', 'Corolla Cross', 'Etios', 'Fielder', 'GR86', 'Hilux', 'Land Cruiser', 'Prius', 'RAV4', 'Sequoia', 'Supra', 'SW4', 'Yaris', 'Yaris Cross'] },
  { brand: 'Volkswagen', models: ['Amarok', 'Apollo', 'Bora', 'Brasília', 'CrossFox', 'Delivery', 'Eos', 'Eurovan', 'Fox', 'Fusca', 'Gol', 'Golf', 'ID.3', 'ID.4', 'Jetta', 'Karmann Ghia', 'Kombi', 'Logus', 'Nivus', 'Parati', 'Passat', 'Pointer', 'Polo', 'Quantum', 'Santana', 'Saveiro', 'SpaceFox', 'T-Cross', 'Taos', 'Tiguan', 'Touareg', 'Up!', 'Variant', 'Virtus', 'Voyage'] },
  { brand: 'Volvo', models: ['C30', 'C40', 'EX30', 'EX40', 'EX90', 'S40', 'S60', 'S80', 'S90', 'V40', 'V50', 'V60', 'V90', 'XC40', 'XC60', 'XC90'] },
]

export const VEHICLE_MODELS: readonly VehicleModelOption[] = VEHICLE_CATALOG.flatMap(
  ({ brand, models }) => models.map((entry) => (
    typeof entry === 'string'
      ? { brand, model: entry }
      : { brand, model: entry.name, aliases: entry.aliases }
  )),
)

/** Remove variações de caixa, acentos e espaços para comparação de busca. */
export function normalizeVehicleModelSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
    .replace(/\s+/g, ' ')
}

/** Converte o catálogo tipado em opções de apresentação e termos pesquisáveis. */
export const CAR_MODEL_OPTIONS = VEHICLE_MODELS.map(({ brand, model, aliases = [] }) => ({
  value: `${brand} ${model}`,
  searchText: normalizeVehicleModelSearch([brand, model, ...aliases].join(' ')),
}))
