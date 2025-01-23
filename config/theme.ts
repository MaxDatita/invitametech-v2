export const theme = {
 

  // Colores principales
  colors: {
    // Elementos de UI
    ui: {
      spinner: 'border-purple-600',
      dialog: {
        background: 'bg-white',
        border: 'border-purple-200',
      },
      input: {
        // border: 'border-purple-200',
        focus: 'focus:border-purple-600',
      },
    },
    // Gradientes para círculos de iniciales
    gradients: [
      'from-red-400 to-pink-600',
      'from-orange-400 to-red-600',
      'from-yellow-400 to-orange-600',
      'from-green-400 to-emerald-600',
      'from-teal-400 to-cyan-600',
      'from-blue-400 to-indigo-600',
      'from-indigo-400 to-purple-600',
      'from-purple-400 to-pink-600',
    ],
  },

  // Configuración de elementos específicos
  elements: {
    // Configuración del carrusel
    carousel: {
      transition: 'duration-500',
      borderRadius: 'rounded-lg',
    },
    // Configuración de modales
    modal: {
      maxWidth: 'max-w-md',
      padding: 'p-6',
      borderRadius: 'rounded-lg',
    },
    // Configuración de botones
    buttonSize: {
      small: 'px-4 py-2',
      medium: 'px-6 py-3',
      large: 'px-8 py-4',
    },
  },

  // Configuración de fechas importantes
  dates: {
    event: '2025-02-15T10:30:00', // Fecha del evento
    contentActivation: '2024-10-01T00:00:00', // Fecha de activación del contenido
    rsvpDeadline: '2025-11-29T00:00:00', // Fecha límite para venta de tickets
    liveEnd: '2024-12-30T23:59:59', // Fecha en que desaparece el indicador LIVE
  },

  // Enlaces y recursos
  resources: {
    contentLink: 'https://drive.google.com/drive/u/2/folders/1a1Nsde0Zyx9Ysk_rI7sjaGnSB93BeW1c',
    images: {
      carousel: ['/imgfest1.webp', '/imgfest2.webp', '/imgfest3.webp'],
      video: '/vidfest.mp4',
      title: '/eventest.webp'
    },
  },

  // Configuración de tickets
  tickets: {
    lotes: {
      enabled: true, // habilitar/deshabilitar sistema de lotes
      maxTicketsPerLot: 139, // 0 para ventas ilimitadas
      currentLot: 2, // número de lote actual
      soldOutMessage: "Lote agotado", // mensaje cuando se agota el lote actual
      nextLotMessage: "El 15/03 se habilitan 100 tickets", // mensaje informativo sobre próximo lote
    },
    types: [
      {
        id: 'vip',
        name: 'Vip',
        maxPerLot: 115, // 0 para sin límite específico para este tipo
      },
      {
        id: 'regular',
        name: 'Regular',
        maxPerLot: 25, // sin límite específico
      }
    ]
  },

  // // Configuración del título
  // title: {
  //   image: {
  //     width: '300px',
  //     height: 'auto',
      
  //   }
  // }
};
