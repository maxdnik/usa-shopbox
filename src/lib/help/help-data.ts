// src/lib/help/help-data.ts

export type HelpLink =
  | { type: "internal"; href: string; label?: string }
  | { type: "article"; slug: string; label?: string };

export type HelpItemType = "faq" | "article";

export type HelpItem = {
  id: string;
  type: HelpItemType;
  title: string;
  snippet: string;
  body?: string; // opcional si querés renderizar sin markdown
  keywords: string[];
  categoryId: string;
  link?: HelpLink; // para "Leer más"
};

export type HelpCategory = {
  id: string;
  name: string;
  description?: string;
  icon?: string; // opcional, por si después querés iconos
};

export type HelpCenterData = {
  search: {
    title: string;
    placeholder: string;
    helperText: string;
    suggestedChips: string[];
    synonyms: Record<string, string[]>;
  };
  categories: HelpCategory[];
  items: HelpItem[];
};

export const HELP_CENTER_DATA: HelpCenterData = {
  search: {
    title: "¿En qué te podemos ayudar?",
    placeholder:
      "Buscá tu consulta (ej: precio final, aduana, tiempos, seguimiento, cuotas...)",
    helperText:
      "Total final + seguimiento por etapas. Si algo requiere acción, te avisamos.",
    suggestedChips: [
      "Precio final",
      "Cuotas",
      "Tiempos de entrega",
      "Seguimiento",
      "Aduana",
      "Cambios y devoluciones",
      "Producto restringido",
      "Problemas con mi pedido",
    ],
    synonyms: {
      "precio final": ["total", "final", "cargos", "extras", "sorpresa", "incluye", "importe final"],
      cuotas: ["financiación", "pagos en cuotas", "sin interés", "recargo"],
      tiempos: ["demora", "cuánto tarda", "entrega", "plazo", "días hábiles"],
      seguimiento: ["tracking", "rastreo", "estado", "dónde está", "mis pedidos"],
      aduana: ["impuestos", "retención", "trámite", "documentación"],
      cambios: ["devolución", "cancelación", "reembolso", "arrepentimiento", "garantía"],
      dañado: ["roto", "falla", "defecto", "producto distinto", "incompleto", "faltante"],
      restringido: ["prohibido", "no apto", "baterías", "aerosoles", "líquidos", "perfume"],
    },
  },

  categories: [
    { id: "pricing-payments", name: "Precios y Pagos" },
    { id: "shipping-times", name: "Envíos y Tiempos" },
    { id: "customs-taxes", name: "Aduana e Impuestos" },
    { id: "tracking-support", name: "Seguimiento y Soporte" },
    { id: "returns", name: "Cambios y Devoluciones" },
    { id: "products-availability", name: "Productos y Disponibilidad" },
    { id: "account-security", name: "Cuenta y Seguridad" },
    { id: "order-issues", name: "Problemas con mi pedido" },
  ],

  items: [
    // --- Precios y pagos
    {
      id: "final-price",
      type: "faq",
      categoryId: "pricing-payments",
      title: "¿El precio que veo es el final?",
      snippet:
        "Sí. El total incluye producto + impuestos/aduana + flete internacional + gestión/seguro + entrega local. Sin extras sorpresa.",
      keywords: ["precio final", "total", "incluye", "extras", "cargos", "final"],
      link: { type: "article", slug: "precio-final", label: "Leer más" },
    },
    {
      id: "how-pricing-works",
      type: "faq",
      categoryId: "pricing-payments",
      title: "¿Cómo se calcula el precio?",
      snippet:
        "Ves el total cerrado desde el inicio: producto en USA + impuestos + flete + gestión/seguro + logística nacional.",
      keywords: ["cómo se calcula", "precio", "impuestos", "flete", "gestión", "logística"],
      link: { type: "article", slug: "precio-final", label: "Leer más" },
    },
    {
      id: "payment-methods",
      type: "faq",
      categoryId: "pricing-payments",
      title: "¿Qué medios de pago aceptan?",
      snippet:
        "Pagás con Mercado Pago. En el checkout vas a ver las opciones vigentes (tarjeta, débito, transferencia).",
      keywords: ["Mercado Pago", "tarjeta", "débito", "transferencia", "pago", "checkout"],
    },
    {
      id: "installments",
      type: "faq",
      categoryId: "pricing-payments",
      title: "¿Puedo pagar en cuotas?",
      snippet:
        "Si Mercado Pago habilita cuotas para tu tarjeta, podés seleccionarlas al pagar. Depende del banco/emisor.",
      keywords: ["cuotas", "financiación", "sin interés", "recargo", "banco"],
    },

    // --- Envíos y tiempos
    {
      id: "delivery-time",
      type: "faq",
      categoryId: "shipping-times",
      title: "¿Cuánto tarda en llegar mi pedido?",
      snippet:
        "En general tarda X–Y días hábiles desde la confirmación. Te mostramos el avance por etapas.",
      keywords: ["tiempos", "entrega", "demora", "días hábiles", "cuándo llega"],
    },
    {
      id: "when-clock-starts",
      type: "faq",
      categoryId: "shipping-times",
      title: "¿Cuándo empieza a correr el plazo?",
      snippet:
        "Desde que el pedido está confirmado y pagado y el producto entra en proceso de compra/recepción en USA.",
      keywords: ["plazo", "confirmado", "pagado", "empieza", "proceso"],
    },
    {
      id: "ship-to-argentina",
      type: "faq",
      categoryId: "shipping-times",
      title: "¿Hacen envíos a todo el país?",
      snippet:
        "Sí, enviamos a todo Argentina. En algunas zonas el tramo final puede sumar tiempo.",
      keywords: ["envíos", "Argentina", "interior", "cobertura", "localidades"],
    },

    // --- Aduana e impuestos
    {
      id: "customs-procedures",
      type: "faq",
      categoryId: "customs-taxes",
      title: "Aduana: ¿tengo que hacer trámites?",
      snippet:
        "No. Nosotros gestionamos el proceso para que no tengas que ir a ningún lado. Si falta un dato, te lo pedimos por un canal oficial.",
      keywords: ["aduana", "trámites", "gestión", "documentación", "DNI"],
    },
    {
      id: "taxes-included",
      type: "faq",
      categoryId: "customs-taxes",
      title: "¿Qué impuestos incluye el total?",
      snippet:
        "Incluye los cargos aplicables al esquema de importación del servicio. Vos ves el total final sin sorpresas.",
      keywords: ["impuestos", "IVA importación", "aduana", "tasas", "incluye"],
    },
    {
      id: "customs-hold",
      type: "faq",
      categoryId: "customs-taxes",
      title: "¿Puede Aduana retener mi compra?",
      snippet:
        "Puede pasar si el producto es restringido o hay inconsistencia de datos. Si ocurre, te contactamos con opciones claras.",
      keywords: ["retenido", "aduana retiene", "restricción", "documentación", "solución"],
    },

    // --- Seguimiento y soporte
    {
      id: "tracking-steps",
      type: "faq",
      categoryId: "tracking-support",
      title: "¿Cómo hago el seguimiento de mi compra?",
      snippet:
        "Desde tu cuenta en “Mis pedidos”, con estados por etapas: Comprado → Depósito USA → En vuelo → Aduana → Distribución → Entregado.",
      keywords: ["tracking", "seguimiento", "estados", "mis pedidos", "etapas"],
      link: { type: "article", slug: "seguimiento-por-etapas", label: "Leer más" },
    },
    {
      id: "tracking-not-updating",
      type: "faq",
      categoryId: "tracking-support",
      title: "Mi tracking no se actualiza, ¿es normal?",
      snippet:
        "Sí. En algunos tramos puede haber menos escaneos. Si pasan más de 72 hs hábiles sin cambios, escribinos y lo revisamos.",
      keywords: ["tracking no actualiza", "sin movimiento", "72 horas", "demora"],
    },
    {
      id: "contact-support",
      type: "faq",
      categoryId: "tracking-support",
      title: "¿Cómo me contacto con soporte?",
      snippet:
        "Podés escribirnos por WhatsApp, email o desde el Centro de Ayuda. Priorizamos pedidos “en entrega”.",
      keywords: ["soporte", "WhatsApp", "email", "contacto", "reclamo"],
    },

    // --- Cambios y devoluciones
    {
      id: "returns-policy",
      type: "article",
      categoryId: "returns",
      title: "Cambios, cancelaciones y devoluciones",
      snippet:
        "Compras internacionales: no hay arrepentimiento. La compra se procesa de inmediato tras el pago. Casos y soluciones.",
      keywords: ["devolución", "cambio", "cancelación", "reembolso", "arrepentimiento", "política"],
      link: { type: "article", slug: "cambios-cancelaciones-devoluciones", label: "Leer más" },
    },
    {
      id: "damaged-or-defective",
      type: "article",
      categoryId: "returns",
      title: "Producto dañado o con falla: cómo reclamar",
      snippet:
        "Avisanos dentro de 48 hs con fotos/video. Activamos protocolo de resolución (reposición, reintegro o crédito según el caso).",
      keywords: ["dañado", "falla", "defecto", "reclamo", "48 horas", "garantía"],
      link: { type: "article", slug: "reclamos-danios-fallas", label: "Leer más" },
    },

    // --- Productos y disponibilidad
    {
      id: "restricted-products",
      type: "article",
      categoryId: "products-availability",
      title: "Productos restringidos o no aptos",
      snippet:
        "No todos los productos se pueden traer. Si algo no es apto, te lo indicamos antes de avanzar.",
      keywords: ["restringido", "prohibido", "baterías", "aerosoles", "líquidos", "perfumes"],
      link: { type: "article", slug: "productos-restringidos", label: "Leer más" },
    },
    {
      id: "sizes-colors",
      type: "faq",
      categoryId: "products-availability",
      title: "¿La ropa y zapatillas tienen talle y color?",
      snippet:
        "Sí. En productos con variantes, podés elegir talle/color antes de agregar al carrito y queda registrado en tu pedido.",
      keywords: ["talle", "tamaño", "color", "variantes", "ropa", "zapatillas"],
    },
    {
      id: "seller-cancelled",
      type: "faq",
      categoryId: "products-availability",
      title: "¿Qué pasa si el vendedor cancela o no hay stock?",
      snippet:
        "Si el vendedor no confirma stock o cancela, te ofrecemos alternativas similares o reintegro.",
      keywords: ["sin stock", "vendedor cancela", "reintegro", "alternativa"],
    },

    // --- Cuenta y seguridad
    {
      id: "required-data",
      type: "faq",
      categoryId: "account-security",
      title: "¿Qué datos necesito para comprar?",
      snippet:
        "Nombre completo, DNI, dirección de entrega y un contacto. Lo mínimo para asegurar gestión y entrega.",
      keywords: ["DNI", "dirección", "datos", "registro", "comprar"],
    },
    {
      id: "security",
      type: "faq",
      categoryId: "account-security",
      title: "Seguridad y privacidad",
      snippet:
        "Cuidamos tus datos y solo pedimos lo necesario para procesar y entregar tu compra.",
      keywords: ["seguridad", "privacidad", "datos personales", "protección"],
      link: { type: "internal", href: "/privacidad", label: "Ver Política de Privacidad" },
    },

    // --- Problemas con mi pedido
    {
      id: "not-at-home",
      type: "faq",
      categoryId: "order-issues",
      title: "¿Qué pasa si no estoy cuando llega el paquete?",
      snippet:
        "Se realiza un intento de entrega y puede reprogramarse. Si necesitás ajustar dirección/horario, avisanos apenas esté en distribución.",
      keywords: ["no estaba", "entrega", "reprogramar", "dirección", "horario"],
    },
    {
      id: "wrong-item-missing",
      type: "faq",
      categoryId: "order-issues",
      title: "Me llegó un producto distinto o faltan piezas",
      snippet:
        "Avisanos dentro de 48 hs con fotos/video y etiqueta del paquete. Lo resolvemos con vos.",
      keywords: ["producto distinto", "faltante", "incompleto", "reclamo", "48 horas"],
    },
  ],
};