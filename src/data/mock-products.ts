import { Product, ProductFilters, ProductSort } from '@/types';

export const mockProducts: Product[] = [
  // SANITARIOS - INODOROS
  {
    id: 'prod-1',
    sku: 'EDC-INO-001',
    name: 'Inodoro Elongado Una Pieza Aura',
    slug: 'inodoro-elongado-una-pieza-aura',
    description: 'Inodoro elongado de una pieza con sistema de ahorro de agua WaterSense. Incluye asiento de cierre suave. Diseño moderno y elegante, ideal para baños residenciales. Sistema de descarga de 4.8 litros por descarga completa. Acabado vitrificado de alta calidad que facilita la limpieza.',
    shortDescription: 'Inodoro elongado de una pieza con sistema de ahorro de agua',
    price: 4850,
    compareAtPrice: 5500,
    stock: 15,
    categoryId: 'cat-1-1',
    brandId: 'brand-1',
    images: [
      { id: 'img-1-1', productId: 'prod-1', url: '/images/products/inodoro-aura-1.jpg', alt: 'Inodoro Aura vista frontal', order: 1 },
      { id: 'img-1-2', productId: 'prod-1', url: '/images/products/inodoro-aura-2.jpg', alt: 'Inodoro Aura vista lateral', order: 2 },
      { id: 'img-1-3', productId: 'prod-1', url: '/images/products/inodoro-aura-3.jpg', alt: 'Inodoro Aura detalle', order: 3 },
    ],
    specifications: [
      { id: 'spec-1-1', productId: 'prod-1', key: 'Material', value: 'Porcelana vitrificada', order: 1 },
      { id: 'spec-1-2', productId: 'prod-1', key: 'Color', value: 'Blanco', order: 2 },
      { id: 'spec-1-3', productId: 'prod-1', key: 'Consumo de agua', value: '4.8 litros', order: 3 },
      { id: 'spec-1-4', productId: 'prod-1', key: 'Dimensiones', value: '71 x 40 x 78 cm', order: 4 },
      { id: 'spec-1-5', productId: 'prod-1', key: 'Tipo de descarga', value: 'Botón dual', order: 5 },
      { id: 'spec-1-6', productId: 'prod-1', key: 'Incluye asiento', value: 'Sí, cierre suave', order: 6 },
    ],
    isActive: true,
    isFeatured: true,
    isNew: true,
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-15'),
  },
  {
    id: 'prod-2',
    sku: 'EDC-INO-002',
    name: 'Inodoro Redondo Dos Piezas Económico',
    slug: 'inodoro-redondo-dos-piezas-economico',
    description: 'Inodoro redondo de dos piezas, ideal para espacios reducidos. Sistema de descarga eficiente. Incluye tapa y asiento estándar. Excelente relación calidad-precio para proyectos residenciales.',
    shortDescription: 'Inodoro redondo de dos piezas económico',
    price: 2150,
    stock: 30,
    categoryId: 'cat-1-1',
    brandId: 'brand-1',
    images: [
      { id: 'img-2-1', productId: 'prod-2', url: '/images/products/inodoro-economico-1.jpg', alt: 'Inodoro económico', order: 1 },
      { id: 'img-2-2', productId: 'prod-2', url: '/images/products/inodoro-economico-2.jpg', alt: 'Inodoro económico vista lateral', order: 2 },
    ],
    specifications: [
      { id: 'spec-2-1', productId: 'prod-2', key: 'Material', value: 'Porcelana vitrificada', order: 1 },
      { id: 'spec-2-2', productId: 'prod-2', key: 'Color', value: 'Blanco', order: 2 },
      { id: 'spec-2-3', productId: 'prod-2', key: 'Consumo de agua', value: '6 litros', order: 3 },
      { id: 'spec-2-4', productId: 'prod-2', key: 'Dimensiones', value: '66 x 36 x 76 cm', order: 4 },
      { id: 'spec-2-5', productId: 'prod-2', key: 'Tipo de descarga', value: 'Palanca lateral', order: 5 },
    ],
    isActive: true,
    isFeatured: false,
    isNew: false,
    createdAt: new Date('2025-11-10'),
    updatedAt: new Date('2025-11-10'),
  },
  {
    id: 'prod-3',
    sku: 'BRG-INO-003',
    name: 'Inodoro Elongado Premium Silhouette',
    slug: 'inodoro-elongado-premium-silhouette',
    description: 'Inodoro elongado de lujo con diseño contemporáneo. Tecnología de descarga silenciosa y potente. Acabado EverClean que inhibe el crecimiento de bacterias. Asiento de cierre lento incluido.',
    shortDescription: 'Inodoro premium con tecnología antibacterial',
    price: 7850,
    compareAtPrice: 8900,
    stock: 8,
    categoryId: 'cat-1-1',
    brandId: 'brand-2',
    images: [
      { id: 'img-3-1', productId: 'prod-3', url: '/images/products/inodoro-silhouette-1.jpg', alt: 'Inodoro Silhouette', order: 1 },
      { id: 'img-3-2', productId: 'prod-3', url: '/images/products/inodoro-silhouette-2.jpg', alt: 'Inodoro Silhouette detalle', order: 2 },
    ],
    specifications: [
      { id: 'spec-3-1', productId: 'prod-3', key: 'Material', value: 'Porcelana vitrificada premium', order: 1 },
      { id: 'spec-3-2', productId: 'prod-3', key: 'Color', value: 'Blanco', order: 2 },
      { id: 'spec-3-3', productId: 'prod-3', key: 'Consumo de agua', value: '4.2 litros', order: 3 },
      { id: 'spec-3-4', productId: 'prod-3', key: 'Dimensiones', value: '72 x 41 x 79 cm', order: 4 },
      { id: 'spec-3-5', productId: 'prod-3', key: 'Tecnología', value: 'EverClean antibacterial', order: 5 },
    ],
    isActive: true,
    isFeatured: true,
    isNew: false,
    createdAt: new Date('2025-10-20'),
    updatedAt: new Date('2025-10-20'),
  },

  // MINGITORIOS
  {
    id: 'prod-4',
    sku: 'EDC-MIN-001',
    name: 'Mingitorio de Pared con Válvula Manual',
    slug: 'mingitorio-pared-valvula-manual',
    description: 'Mingitorio de pared para instalaciones comerciales. Incluye válvula de descarga manual. Diseño higiénico y fácil de limpiar. Ideal para baños públicos y oficinas.',
    shortDescription: 'Mingitorio comercial con válvula manual',
    price: 1850,
    stock: 20,
    categoryId: 'cat-1-2',
    brandId: 'brand-1',
    images: [
      { id: 'img-4-1', productId: 'prod-4', url: '/images/products/mingitorio-1.jpg', alt: 'Mingitorio', order: 1 },
    ],
    specifications: [
      { id: 'spec-4-1', productId: 'prod-4', key: 'Material', value: 'Porcelana vitrificada', order: 1 },
      { id: 'spec-4-2', productId: 'prod-4', key: 'Color', value: 'Blanco', order: 2 },
      { id: 'spec-4-3', productId: 'prod-4', key: 'Tipo', value: 'Pared', order: 3 },
      { id: 'spec-4-4', productId: 'prod-4', key: 'Dimensiones', value: '35 x 38 x 58 cm', order: 4 },
    ],
    isActive: true,
    isFeatured: false,
    isNew: false,
    createdAt: new Date('2025-09-05'),
    updatedAt: new Date('2025-09-05'),
  },

  // GRIFERÍAS PARA BAÑO
  {
    id: 'prod-5',
    sku: 'BRG-GRI-001',
    name: 'Llave Monomando para Lavabo Veneto',
    slug: 'llave-monomando-lavabo-veneto',
    description: 'Llave monomando de diseño contemporáneo para lavabo. Acabado cromado brillante. Cartucho cerámico de larga duración. Incluye conexiones flexibles y contratuerca de montaje.',
    shortDescription: 'Llave monomando cromada para lavabo',
    price: 1250,
    compareAtPrice: 1450,
    stock: 45,
    categoryId: 'cat-2-1',
    brandId: 'brand-2',
    images: [
      { id: 'img-5-1', productId: 'prod-5', url: '/images/products/llave-veneto-1.jpg', alt: 'Llave Veneto', order: 1 },
      { id: 'img-5-2', productId: 'prod-5', url: '/images/products/llave-veneto-2.jpg', alt: 'Llave Veneto instalada', order: 2 },
    ],
    specifications: [
      { id: 'spec-5-1', productId: 'prod-5', key: 'Material', value: 'Latón cromado', order: 1 },
      { id: 'spec-5-2', productId: 'prod-5', key: 'Acabado', value: 'Cromo brillante', order: 2 },
      { id: 'spec-5-3', productId: 'prod-5', key: 'Tipo de cartucho', value: 'Cerámico 35mm', order: 3 },
      { id: 'spec-5-4', productId: 'prod-5', key: 'Altura', value: '18 cm', order: 4 },
      { id: 'spec-5-5', productId: 'prod-5', key: 'Conexión', value: '1/2"', order: 5 },
    ],
    isActive: true,
    isFeatured: true,
    isNew: true,
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-01-20'),
  },
  {
    id: 'prod-6',
    sku: 'MOE-GRI-001',
    name: 'Llave Mezcladora Dos Manijas Clásica',
    slug: 'llave-mezcladora-dos-manijas-clasica',
    description: 'Llave mezcladora de dos manijas con diseño clásico. Acabado en níquel cepillado. Válvulas cerámicas de cuarto de vuelta. Perfecta para baños de estilo tradicional.',
    shortDescription: 'Mezcladora clásica níquel cepillado',
    price: 1680,
    stock: 25,
    categoryId: 'cat-2-1',
    brandId: 'brand-5',
    images: [
      { id: 'img-6-1', productId: 'prod-6', url: '/images/products/llave-clasica-1.jpg', alt: 'Llave clásica', order: 1 },
    ],
    specifications: [
      { id: 'spec-6-1', productId: 'prod-6', key: 'Material', value: 'Latón', order: 1 },
      { id: 'spec-6-2', productId: 'prod-6', key: 'Acabado', value: 'Níquel cepillado', order: 2 },
      { id: 'spec-6-3', productId: 'prod-6', key: 'Tipo de válvula', value: 'Cerámica 1/4 vuelta', order: 3 },
      { id: 'spec-6-4', productId: 'prod-6', key: 'Alcance', value: '12 cm', order: 4 },
    ],
    isActive: true,
    isFeatured: false,
    isNew: false,
    createdAt: new Date('2025-08-15'),
    updatedAt: new Date('2025-08-15'),
  },
  {
    id: 'prod-7',
    sku: 'HEL-GRI-001',
    name: 'Llave de Regadera Termostática Nova',
    slug: 'llave-regadera-termostatica-nova',
    description: 'Llave termostática para regadera con control de temperatura. Sistema anti-quemaduras. Cuerpo de latón sólido. Acabado cromado. Incluye desviador integrado para regadera de mano.',
    shortDescription: 'Mezcladora termostática para regadera',
    price: 3450,
    stock: 12,
    categoryId: 'cat-2-1',
    brandId: 'brand-4',
    images: [
      { id: 'img-7-1', productId: 'prod-7', url: '/images/products/llave-termostatica-1.jpg', alt: 'Llave termostática', order: 1 },
    ],
    specifications: [
      { id: 'spec-7-1', productId: 'prod-7', key: 'Material', value: 'Latón cromado', order: 1 },
      { id: 'spec-7-2', productId: 'prod-7', key: 'Tipo', value: 'Termostática', order: 2 },
      { id: 'spec-7-3', productId: 'prod-7', key: 'Temperatura máxima', value: '38°C (configurable)', order: 3 },
      { id: 'spec-7-4', productId: 'prod-7', key: 'Conexión', value: '1/2"', order: 4 },
    ],
    isActive: true,
    isFeatured: true,
    isNew: true,
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-01-10'),
  },

  // GRIFERÍAS PARA COCINA
  {
    id: 'prod-8',
    sku: 'MOE-COC-001',
    name: 'Llave Monomando para Cocina Extensible',
    slug: 'llave-monomando-cocina-extensible',
    description: 'Llave monomando para cocina con caño alto extensible. Rociador extraíble con dos modos de salida. Acabado cromado resistente. Rotación 360 grados. Sistema de instalación rápida.',
    shortDescription: 'Monomando cocina con rociador extraíble',
    price: 2850,
    compareAtPrice: 3200,
    stock: 18,
    categoryId: 'cat-2-2',
    brandId: 'brand-5',
    images: [
      { id: 'img-8-1', productId: 'prod-8', url: '/images/products/llave-cocina-ext-1.jpg', alt: 'Llave cocina extensible', order: 1 },
      { id: 'img-8-2', productId: 'prod-8', url: '/images/products/llave-cocina-ext-2.jpg', alt: 'Llave cocina en uso', order: 2 },
    ],
    specifications: [
      { id: 'spec-8-1', productId: 'prod-8', key: 'Material', value: 'Latón cromado', order: 1 },
      { id: 'spec-8-2', productId: 'prod-8', key: 'Altura', value: '42 cm', order: 2 },
      { id: 'spec-8-3', productId: 'prod-8', key: 'Alcance', value: '22 cm', order: 3 },
      { id: 'spec-8-4', productId: 'prod-8', key: 'Modos de salida', value: 'Chorro y spray', order: 4 },
      { id: 'spec-8-5', productId: 'prod-8', key: 'Rotación', value: '360°', order: 5 },
    ],
    isActive: true,
    isFeatured: true,
    isNew: false,
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2025-12-01'),
  },
  {
    id: 'prod-9',
    sku: 'BRG-COC-001',
    name: 'Llave para Cocina Profesional Alta',
    slug: 'llave-cocina-profesional-alta',
    description: 'Llave de cocina estilo profesional con caño alto tipo resorte. Acabado acero inoxidable. Rociador de alto flujo. Diseño moderno e industrial. Ideal para cocinas gourmet.',
    shortDescription: 'Llave profesional tipo resorte',
    price: 4250,
    stock: 10,
    categoryId: 'cat-2-2',
    brandId: 'brand-2',
    images: [
      { id: 'img-9-1', productId: 'prod-9', url: '/images/products/llave-profesional-1.jpg', alt: 'Llave profesional', order: 1 },
    ],
    specifications: [
      { id: 'spec-9-1', productId: 'prod-9', key: 'Material', value: 'Acero inoxidable', order: 1 },
      { id: 'spec-9-2', productId: 'prod-9', key: 'Acabado', value: 'Acero cepillado', order: 2 },
      { id: 'spec-9-3', productId: 'prod-9', key: 'Altura', value: '52 cm', order: 3 },
      { id: 'spec-9-4', productId: 'prod-9', key: 'Tipo', value: 'Resorte profesional', order: 4 },
    ],
    isActive: true,
    isFeatured: false,
    isNew: true,
    createdAt: new Date('2026-01-25'),
    updatedAt: new Date('2026-01-25'),
  },

  // LAVAMANOS
  {
    id: 'prod-10',
    sku: 'EDC-LAV-001',
    name: 'Lavabo de Sobreponer Redondo Blanco',
    slug: 'lavabo-sobreponer-redondo-blanco',
    description: 'Lavabo tipo vessel de porcelana vitrificada. Diseño redondo clásico. Sin orificio para llave (requiere mezcladora de pared o alta). Drenaje pop-up incluido.',
    shortDescription: 'Lavabo vessel redondo de porcelana',
    price: 1580,
    stock: 22,
    categoryId: 'cat-3-1',
    brandId: 'brand-1',
    images: [
      { id: 'img-10-1', productId: 'prod-10', url: '/images/products/lavabo-redondo-1.jpg', alt: 'Lavabo redondo', order: 1 },
      { id: 'img-10-2', productId: 'prod-10', url: '/images/products/lavabo-redondo-2.jpg', alt: 'Lavabo redondo instalado', order: 2 },
    ],
    specifications: [
      { id: 'spec-10-1', productId: 'prod-10', key: 'Material', value: 'Porcelana vitrificada', order: 1 },
      { id: 'spec-10-2', productId: 'prod-10', key: 'Color', value: 'Blanco', order: 2 },
      { id: 'spec-10-3', productId: 'prod-10', key: 'Diámetro', value: '42 cm', order: 3 },
      { id: 'spec-10-4', productId: 'prod-10', key: 'Altura', value: '15 cm', order: 4 },
      { id: 'spec-10-5', productId: 'prod-10', key: 'Tipo de instalación', value: 'Sobreponer', order: 5 },
    ],
    isActive: true,
    isFeatured: false,
    isNew: false,
    createdAt: new Date('2025-07-12'),
    updatedAt: new Date('2025-07-12'),
  },
  {
    id: 'prod-11',
    sku: 'KOH-LAV-001',
    name: 'Lavabo Rectangular de Sobreponer Negro Mate',
    slug: 'lavabo-rectangular-sobreponer-negro-mate',
    description: 'Lavabo vessel rectangular de porcelana con acabado negro mate. Diseño contemporáneo y sofisticado. Interior esmaltado blanco para fácil limpieza. Sin orificio para llave.',
    shortDescription: 'Lavabo vessel rectangular negro mate',
    price: 3250,
    stock: 8,
    categoryId: 'cat-3-1',
    brandId: 'brand-6',
    images: [
      { id: 'img-11-1', productId: 'prod-11', url: '/images/products/lavabo-negro-1.jpg', alt: 'Lavabo negro', order: 1 },
    ],
    specifications: [
      { id: 'spec-11-1', productId: 'prod-11', key: 'Material', value: 'Porcelana vitrificada', order: 1 },
      { id: 'spec-11-2', productId: 'prod-11', key: 'Color exterior', value: 'Negro mate', order: 2 },
      { id: 'spec-11-3', productId: 'prod-11', key: 'Color interior', value: 'Blanco esmaltado', order: 3 },
      { id: 'spec-11-4', productId: 'prod-11', key: 'Dimensiones', value: '50 x 35 x 13 cm', order: 4 },
    ],
    isActive: true,
    isFeatured: true,
    isNew: true,
    createdAt: new Date('2026-01-18'),
    updatedAt: new Date('2026-01-18'),
  },
  {
    id: 'prod-12',
    sku: 'EDC-LAV-002',
    name: 'Lavabo de Empotrar Oval Estándar',
    slug: 'lavabo-empotrar-oval-estandar',
    description: 'Lavabo de empotrar oval clásico. Porcelana vitrificada blanca. Con orificio para llave. Incluye rebosadero. Ideal para instalación bajo cubierta. Excelente para baños residenciales.',
    shortDescription: 'Lavabo empotrar oval con rebosadero',
    price: 980,
    stock: 35,
    categoryId: 'cat-3-2',
    brandId: 'brand-1',
    images: [
      { id: 'img-12-1', productId: 'prod-12', url: '/images/products/lavabo-empotrar-1.jpg', alt: 'Lavabo empotrar', order: 1 },
    ],
    specifications: [
      { id: 'spec-12-1', productId: 'prod-12', key: 'Material', value: 'Porcelana vitrificada', order: 1 },
      { id: 'spec-12-2', productId: 'prod-12', key: 'Color', value: 'Blanco', order: 2 },
      { id: 'spec-12-3', productId: 'prod-12', key: 'Dimensiones', value: '48 x 38 x 18 cm', order: 3 },
      { id: 'spec-12-4', productId: 'prod-12', key: 'Tipo de instalación', value: 'Bajo cubierta', order: 4 },
      { id: 'spec-12-5', productId: 'prod-12', key: 'Rebosadero', value: 'Sí', order: 5 },
    ],
    isActive: true,
    isFeatured: false,
    isNew: false,
    createdAt: new Date('2025-06-20'),
    updatedAt: new Date('2025-06-20'),
  },

  // REGADERAS
  {
    id: 'prod-13',
    sku: 'BRG-REG-001',
    name: 'Regadera de Mano Eco con 3 Modos',
    slug: 'regadera-mano-eco-3-modos',
    description: 'Regadera de mano con tecnología de ahorro de agua. 3 modos de salida: lluvia, masaje y combinado. Acabado cromado. Incluye manguera flexible de 1.5m y soporte de pared.',
    shortDescription: 'Regadera de mano 3 modos ahorradora',
    price: 450,
    stock: 50,
    categoryId: 'cat-4',
    brandId: 'brand-2',
    images: [
      { id: 'img-13-1', productId: 'prod-13', url: '/images/products/regadera-eco-1.jpg', alt: 'Regadera eco', order: 1 },
    ],
    specifications: [
      { id: 'spec-13-1', productId: 'prod-13', key: 'Material', value: 'ABS cromado', order: 1 },
      { id: 'spec-13-2', productId: 'prod-13', key: 'Modos', value: '3 (lluvia, masaje, combo)', order: 2 },
      { id: 'spec-13-3', productId: 'prod-13', key: 'Longitud manguera', value: '1.5 m', order: 3 },
      { id: 'spec-13-4', productId: 'prod-13', key: 'Conexión', value: '1/2"', order: 4 },
    ],
    isActive: true,
    isFeatured: false,
    isNew: false,
    createdAt: new Date('2025-05-10'),
    updatedAt: new Date('2025-05-10'),
  },
  {
    id: 'prod-14',
    sku: 'HEL-REG-001',
    name: 'Sistema de Ducha Completo Lluvia',
    slug: 'sistema-ducha-completo-lluvia',
    description: 'Sistema completo de ducha con regadera tipo lluvia de 25cm. Incluye regadera de mano, barra deslizable, mezcladora termostática y kit de instalación. Acabado cromado premium.',
    shortDescription: 'Sistema completo con regadera lluvia',
    price: 6850,
    compareAtPrice: 7500,
    stock: 6,
    categoryId: 'cat-4',
    brandId: 'brand-4',
    images: [
      { id: 'img-14-1', productId: 'prod-14', url: '/images/products/sistema-lluvia-1.jpg', alt: 'Sistema lluvia', order: 1 },
      { id: 'img-14-2', productId: 'prod-14', url: '/images/products/sistema-lluvia-2.jpg', alt: 'Sistema lluvia instalado', order: 2 },
    ],
    specifications: [
      { id: 'spec-14-1', productId: 'prod-14', key: 'Material', value: 'Latón cromado', order: 1 },
      { id: 'spec-14-2', productId: 'prod-14', key: 'Regadera principal', value: '25 cm cuadrada', order: 2 },
      { id: 'spec-14-3', productId: 'prod-14', key: 'Regadera de mano', value: 'Incluida', order: 3 },
      { id: 'spec-14-4', productId: 'prod-14', key: 'Mezcladora', value: 'Termostática', order: 4 },
    ],
    isActive: true,
    isFeatured: true,
    isNew: true,
    createdAt: new Date('2026-01-12'),
    updatedAt: new Date('2026-01-12'),
  },

  // ACCESORIOS
  {
    id: 'prod-15',
    sku: 'EDC-ACC-001',
    name: 'Juego de Accesorios 5 Piezas Cromado',
    slug: 'juego-accesorios-5-piezas-cromado',
    description: 'Juego completo de accesorios para baño. Incluye: toallero de 60cm, portapapel, gancho doble, jabonera y portacepillos. Acabado cromado brillante. Instalación con tornillos.',
    shortDescription: 'Set 5 accesorios cromados para baño',
    price: 1250,
    stock: 28,
    categoryId: 'cat-5',
    brandId: 'brand-1',
    images: [
      { id: 'img-15-1', productId: 'prod-15', url: '/images/products/accesorios-set-1.jpg', alt: 'Set accesorios', order: 1 },
    ],
    specifications: [
      { id: 'spec-15-1', productId: 'prod-15', key: 'Material', value: 'Zinc cromado', order: 1 },
      { id: 'spec-15-2', productId: 'prod-15', key: 'Acabado', value: 'Cromo brillante', order: 2 },
      { id: 'spec-15-3', productId: 'prod-15', key: 'Piezas', value: '5', order: 3 },
      { id: 'spec-15-4', productId: 'prod-15', key: 'Instalación', value: 'Tornillos (incluidos)', order: 4 },
    ],
    isActive: true,
    isFeatured: false,
    isNew: false,
    createdAt: new Date('2025-04-15'),
    updatedAt: new Date('2025-04-15'),
  },
  {
    id: 'prod-16',
    sku: 'MOE-ACC-001',
    name: 'Toallero Eléctrico Térmico',
    slug: 'toallero-electrico-termico',
    description: 'Toallero eléctrico con sistema de calefacción. Calienta y seca toallas. 8 barras horizontales. Acabado acero inoxidable cepillado. 100W de potencia. Incluye temporizador.',
    shortDescription: 'Toallero eléctrico con calefacción',
    price: 4850,
    stock: 5,
    categoryId: 'cat-5',
    brandId: 'brand-5',
    images: [
      { id: 'img-16-1', productId: 'prod-16', url: '/images/products/toallero-termico-1.jpg', alt: 'Toallero térmico', order: 1 },
    ],
    specifications: [
      { id: 'spec-16-1', productId: 'prod-16', key: 'Material', value: 'Acero inoxidable', order: 1 },
      { id: 'spec-16-2', productId: 'prod-16', key: 'Potencia', value: '100W', order: 2 },
      { id: 'spec-16-3', productId: 'prod-16', key: 'Dimensiones', value: '60 x 80 cm', order: 3 },
      { id: 'spec-16-4', productId: 'prod-16', key: 'Voltaje', value: '110V', order: 4 },
    ],
    isActive: true,
    isFeatured: true,
    isNew: true,
    createdAt: new Date('2026-01-22'),
    updatedAt: new Date('2026-01-22'),
  },

  // TINAS
  {
    id: 'prod-17',
    sku: 'KOH-TIN-001',
    name: 'Tina Independiente Moderna Blanca',
    slug: 'tina-independiente-moderna-blanca',
    description: 'Tina independiente de acrílico reforzado. Diseño oval contemporáneo. Capacidad 220 litros. Respaldo ergonómico. Incluye desagüe cromado. Acabado blanco brillante.',
    shortDescription: 'Tina freestanding acrílica moderna',
    price: 18500,
    compareAtPrice: 21000,
    stock: 3,
    categoryId: 'cat-6',
    brandId: 'brand-6',
    images: [
      { id: 'img-17-1', productId: 'prod-17', url: '/images/products/tina-moderna-1.jpg', alt: 'Tina moderna', order: 1 },
      { id: 'img-17-2', productId: 'prod-17', url: '/images/products/tina-moderna-2.jpg', alt: 'Tina moderna ambiente', order: 2 },
    ],
    specifications: [
      { id: 'spec-17-1', productId: 'prod-17', key: 'Material', value: 'Acrílico reforzado', order: 1 },
      { id: 'spec-17-2', productId: 'prod-17', key: 'Color', value: 'Blanco brillante', order: 2 },
      { id: 'spec-17-3', productId: 'prod-17', key: 'Capacidad', value: '220 litros', order: 3 },
      { id: 'spec-17-4', productId: 'prod-17', key: 'Dimensiones', value: '170 x 75 x 60 cm', order: 4 },
      { id: 'spec-17-5', productId: 'prod-17', key: 'Tipo', value: 'Independiente (freestanding)', order: 5 },
    ],
    isActive: true,
    isFeatured: true,
    isNew: false,
    createdAt: new Date('2025-11-25'),
    updatedAt: new Date('2025-11-25'),
  },

  // LLAVES DE PASO
  {
    id: 'prod-18',
    sku: 'EDC-LLP-001',
    name: 'Llave de Paso Esfera 1/2" Cromada',
    slug: 'llave-paso-esfera-12-cromada',
    description: 'Válvula de paso tipo esfera de 1/2 pulgada. Cuerpo de latón cromado. Manija tipo mariposa. Cierre hermético. Uso rudo para instalaciones hidráulicas.',
    shortDescription: 'Válvula de esfera 1/2" cromada',
    price: 185,
    stock: 100,
    categoryId: 'cat-7',
    brandId: 'brand-1',
    images: [
      { id: 'img-18-1', productId: 'prod-18', url: '/images/products/llave-paso-1.jpg', alt: 'Llave de paso', order: 1 },
    ],
    specifications: [
      { id: 'spec-18-1', productId: 'prod-18', key: 'Material', value: 'Latón cromado', order: 1 },
      { id: 'spec-18-2', productId: 'prod-18', key: 'Diámetro', value: '1/2"', order: 2 },
      { id: 'spec-18-3', productId: 'prod-18', key: 'Tipo', value: 'Esfera', order: 3 },
      { id: 'spec-18-4', productId: 'prod-18', key: 'Conexión', value: 'Roscada', order: 4 },
    ],
    isActive: true,
    isFeatured: false,
    isNew: false,
    createdAt: new Date('2025-03-10'),
    updatedAt: new Date('2025-03-10'),
  },
  {
    id: 'prod-19',
    sku: 'EDC-LLP-002',
    name: 'Llave de Paso Angular para Lavabo',
    slug: 'llave-paso-angular-lavabo',
    description: 'Llave de paso angular cromada para lavabo. Conexión de alimentación 1/2" y salida 3/8". Manija de fácil operación. Ideal para conexión de llaves de lavabo.',
    shortDescription: 'Llave angular 1/2" x 3/8" cromada',
    price: 145,
    stock: 80,
    categoryId: 'cat-7',
    brandId: 'brand-1',
    images: [
      { id: 'img-19-1', productId: 'prod-19', url: '/images/products/llave-angular-1.jpg', alt: 'Llave angular', order: 1 },
    ],
    specifications: [
      { id: 'spec-19-1', productId: 'prod-19', key: 'Material', value: 'Latón cromado', order: 1 },
      { id: 'spec-19-2', productId: 'prod-19', key: 'Entrada', value: '1/2"', order: 2 },
      { id: 'spec-19-3', productId: 'prod-19', key: 'Salida', value: '3/8"', order: 3 },
      { id: 'spec-19-4', productId: 'prod-19', key: 'Tipo', value: 'Angular', order: 4 },
    ],
    isActive: true,
    isFeatured: false,
    isNew: false,
    createdAt: new Date('2025-03-10'),
    updatedAt: new Date('2025-03-10'),
  },

  // FREGADEROS
  {
    id: 'prod-20',
    sku: 'EDC-FRE-001',
    name: 'Fregadero Doble Tarja Acero Inoxidable',
    slug: 'fregadero-doble-tarja-acero',
    description: 'Fregadero de doble tarja en acero inoxidable calibre 20. Medidas estándar 80x48cm. Incluye coladera y rebosadero. Instalación sobreponer. Acabado satinado.',
    shortDescription: 'Fregadero 2 tarjas acero inoxidable',
    price: 2850,
    stock: 15,
    categoryId: 'cat-8',
    brandId: 'brand-1',
    images: [
      { id: 'img-20-1', productId: 'prod-20', url: '/images/products/fregadero-doble-1.jpg', alt: 'Fregadero doble', order: 1 },
    ],
    specifications: [
      { id: 'spec-20-1', productId: 'prod-20', key: 'Material', value: 'Acero inoxidable', order: 1 },
      { id: 'spec-20-2', productId: 'prod-20', key: 'Calibre', value: '20', order: 2 },
      { id: 'spec-20-3', productId: 'prod-20', key: 'Dimensiones', value: '80 x 48 cm', order: 3 },
      { id: 'spec-20-4', productId: 'prod-20', key: 'Tarjas', value: '2', order: 4 },
      { id: 'spec-20-5', productId: 'prod-20', key: 'Acabado', value: 'Satinado', order: 5 },
    ],
    isActive: true,
    isFeatured: false,
    isNew: false,
    createdAt: new Date('2025-08-20'),
    updatedAt: new Date('2025-08-20'),
  },
];

// Helper functions
export function getProductBySlug(slug: string): Product | undefined {
  return mockProducts.find((product) => product.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return mockProducts.find((product) => product.id === id);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return mockProducts.filter((product) => product.categoryId === categoryId && product.isActive);
}

export function getProductsByBrand(brandId: string): Product[] {
  return mockProducts.filter((product) => product.brandId === brandId && product.isActive);
}

export function getFeaturedProducts(limit?: number): Product[] {
  const featured = mockProducts.filter((product) => product.isFeatured && product.isActive);
  return limit ? featured.slice(0, limit) : featured;
}

export function getNewProducts(limit?: number): Product[] {
  const newProducts = mockProducts.filter((product) => product.isNew && product.isActive);
  return limit ? newProducts.slice(0, limit) : newProducts;
}

export function filterProducts(filters: ProductFilters): Product[] {
  let filtered = mockProducts.filter((product) => product.isActive);

  if (filters.categoryId) {
    filtered = filtered.filter((product) => product.categoryId === filters.categoryId);
  }

  if (filters.brandId) {
    filtered = filtered.filter((product) => product.brandId === filters.brandId);
  }

  if (filters.minPrice !== undefined) {
    filtered = filtered.filter((product) => product.price >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter((product) => product.price <= filters.maxPrice!);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower)
    );
  }

  if (filters.isNew !== undefined) {
    filtered = filtered.filter((product) => product.isNew === filters.isNew);
  }

  if (filters.isFeatured !== undefined) {
    filtered = filtered.filter((product) => product.isFeatured === filters.isFeatured);
  }

  return filtered;
}

export function sortProducts(products: Product[], sort: ProductSort): Product[] {
  const sorted = [...products];

  sorted.sort((a, b) => {
    const aVal = a[sort.field];
    const bVal = b[sort.field];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sort.order === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sort.order === 'asc' ? aVal - bVal : bVal - aVal;
    }

    if (aVal instanceof Date && bVal instanceof Date) {
      return sort.order === 'asc'
        ? aVal.getTime() - bVal.getTime()
        : bVal.getTime() - aVal.getTime();
    }

    return 0;
  });

  return sorted;
}

export function getRelatedProducts(productId: string, limit: number = 4): Product[] {
  const product = getProductById(productId);
  if (!product) return [];

  // Get products from same category, excluding current product
  const related = mockProducts.filter(
    (p) => p.categoryId === product.categoryId && p.id !== productId && p.isActive
  );

  // Shuffle and limit
  return related.sort(() => Math.random() - 0.5).slice(0, limit);
}
