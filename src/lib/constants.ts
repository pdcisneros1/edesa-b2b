export const SITE_NAME = 'EDESA VENTAS';
export const SITE_DESCRIPTION = 'Especialistas en acabados de construcción - Sanitarios, Griferías, Lavamanos y más';

// Ecuador configuración
export const CURRENCY = 'USD';
export const CURRENCY_SYMBOL = '$';

export const SHIPPING_COST = 5; // Costo fijo de envío en USD
export const FREE_SHIPPING_THRESHOLD = 100; // Envío gratis sobre $100 USD

export const TAX_RATE = 0.15; // IVA 15% Ecuador

export const PRODUCTS_PER_PAGE = 12;

export const PRICE_RANGES = [
  { label: 'Menos de $20', min: 0, max: 20 },
  { label: '$20 - $50', min: 20, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $200', min: 100, max: 200 },
  { label: 'Más de $200', min: 200, max: Infinity },
];

export const SORT_OPTIONS = [
  { label: 'Más recientes', field: 'createdAt', order: 'desc' },
  { label: 'Precio: Menor a Mayor', field: 'price', order: 'asc' },
  { label: 'Precio: Mayor a Menor', field: 'price', order: 'desc' },
  { label: 'Nombre: A-Z', field: 'name', order: 'asc' },
  { label: 'Nombre: Z-A', field: 'name', order: 'desc' },
] as const;

// 24 Provincias de Ecuador
export const ECUADOR_PROVINCES = [
  'Azuay',
  'Bolívar',
  'Cañar',
  'Carchi',
  'Chimborazo',
  'Cotopaxi',
  'El Oro',
  'Esmeraldas',
  'Galápagos',
  'Guayas',
  'Imbabura',
  'Loja',
  'Los Ríos',
  'Manabí',
  'Morona Santiago',
  'Napo',
  'Orellana',
  'Pastaza',
  'Pichincha',
  'Santa Elena',
  'Santo Domingo de los Tsáchilas',
  'Sucumbíos',
  'Tungurahua',
  'Zamora Chinchipe',
];

// Ciudades principales de Ecuador
export const ECUADOR_CITIES = [
  'Quito',
  'Guayaquil',
  'Cuenca',
  'Santo Domingo',
  'Machala',
  'Durán',
  'Manta',
  'Portoviejo',
  'Loja',
  'Ambato',
  'Esmeraldas',
  'Quevedo',
  'Riobamba',
  'Milagro',
  'Ibarra',
];

export const SHIPPING_METHODS = [
  { id: 'standard', name: 'Envío Estándar', description: '5-7 días hábiles', price: SHIPPING_COST },
  { id: 'express', name: 'Envío Express', description: '2-3 días hábiles', price: SHIPPING_COST * 2 },
  { id: 'pickup', name: 'Recoger en Tienda', description: 'Disponible inmediatamente', price: 0 },
];

export const CONTACT_INFO = {
  phone: '+593 2 234-5678',
  email: 'contacto@edesaventas.ec',
  address: 'Av. 6 de Diciembre N34-451, Quito, Ecuador',
  whatsapp: '+593987654321',
};

export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/edesaventas',
  instagram: 'https://instagram.com/edesaventas',
  twitter: 'https://twitter.com/edesaventas',
};

// Transferencia bancaria — configurar en .env.local con prefijo NEXT_PUBLIC_
export const BANK_INFO = {
  bankName:       process.env.NEXT_PUBLIC_BANK_NAME       ?? 'Banco Pichincha',
  accountNumber:  process.env.NEXT_PUBLIC_BANK_ACCOUNT    ?? '2200-XXXXXXXXX',
  accountType:    process.env.NEXT_PUBLIC_BANK_ACCOUNT_TYPE ?? 'Cuenta Corriente',
  companyName:    process.env.NEXT_PUBLIC_COMPANY_NAME    ?? 'EDESA VENTAS S.A.',
  companyRuc:     process.env.NEXT_PUBLIC_COMPANY_RUC     ?? '1790XXXXXXXX001',
  transferNote:   'Indicar número de pedido como referencia.',
};
