export type GlossaryCategory = 'vela' | 'jarcia' | 'maniobra' | 'viento' | 'barco' | 'seguridad'

export interface GlossaryEntry {
  term: string
  definition: string
  category: GlossaryCategory
  aliases?: string[]
}

export const CATEGORY_LABELS: Record<GlossaryCategory, string> = {
  vela: '⛵ Vela',
  jarcia: '🪢 Jarcia',
  maniobra: '🔄 Maniobra',
  viento: '💨 Viento',
  barco: '🚢 Barco',
  seguridad: '🦺 Seguridad',
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: 'proa',
    definition: 'Parte delantera del barco. Todo lo que está hacia delante está "a proa".',
    category: 'barco',
  },
  {
    term: 'popa',
    definition: 'Parte trasera del barco. Todo lo que está hacia atrás está "a popa".',
    category: 'barco',
  },
  {
    term: 'babor',
    definition: 'Lado izquierdo del barco mirando hacia proa. Se identifica con el color rojo en las luces de navegación.',
    category: 'barco',
  },
  {
    term: 'estribor',
    definition: 'Lado derecho del barco mirando hacia proa. Se identifica con el color verde en las luces de navegación.',
    category: 'barco',
  },
  {
    term: 'mástil',
    definition: 'Palo vertical que sostiene las velas y la jarcia. En un sloop hay uno; en un yawl o ketch hay dos.',
    category: 'barco',
  },
  {
    term: 'cabo',
    definition: 'Cuerda utilizada a bordo para amarrar, cazar velas o cualquier maniobra. En náutica no se dice cuerda, se dice cabo.',
    category: 'jarcia',
    aliases: ['cabos'],
  },
  {
    term: 'cornamusa',
    definition: 'Pieza metálica o de madera con dos cuernos donde se amarran los cabos de forma segura y rápida.',
    category: 'jarcia',
    aliases: ['cornamusas'],
  },
  {
    term: 'bita',
    definition: 'Poste metálico robusto en cubierta o en el muelle donde se amarran los cabos más gruesos.',
    category: 'jarcia',
    aliases: ['bitas'],
  },
  {
    term: 'defensa',
    definition: 'Pieza de goma o plástico hinchable que se cuelga del costado para proteger el casco al atracar o al estar amarrado a un muelle.',
    category: 'barco',
    aliases: ['defensas'],
  },
  {
    term: 'amarrar',
    definition: 'Fijar el barco al muelle o a una boya mediante cabos. También se dice atracar.',
    category: 'maniobra',
    aliases: ['amarras', 'amarre'],
  },
  {
    term: 'nudo',
    definition: 'Forma de atar un cabo sobre sí mismo o a otro punto. Los más comunes a bordo son el ballestrinque, el as de guía y el ocho.',
    category: 'maniobra',
    aliases: ['nudos'],
  },
  {
    term: 'caña',
    definition: 'Barra con la que se gobierna el timón directamente. En barcos más grandes se sustituye por una rueda de timón.',
    category: 'barco',
  },
  {
    term: 'escota',
    definition: 'Cabo que sirve para cazar (tensar) una vela y controlar su ángulo respecto al viento.',
    category: 'jarcia',
    aliases: ['escotas'],
  },
  {
    term: 'traveller',
    definition: 'Carro deslizante sobre un riel transversal que permite mover el punto de anclaje de la escota de mayor a barlovento o sotavento.',
    category: 'jarcia',
  },
  {
    term: 'cunningham',
    definition: 'Cabo o aparejo que tensa el gratil de la vela mayor hacia abajo, eliminando arrugas y adelantando la bolsa.',
    category: 'jarcia',
  },
  {
    term: 'pajarín',
    definition: 'Cabo en la botavara que tensa el pujamen de la vela mayor, controlando la profundidad de la bolsa en la parte baja. También llamado outhaul.',
    category: 'jarcia',
    aliases: ['outhaul'],
  },
  {
    term: 'backstay',
    definition: 'Cable o cabo que va desde el tope del mástil hasta la popa, controlando la flexión del mástil y la tensión del stay.',
    category: 'jarcia',
  },
  {
    term: 'obenque',
    definition: 'Cable metálico que sujeta el mástil lateralmente desde los costados del barco.',
    category: 'jarcia',
    aliases: ['obenques'],
  },
  {
    term: 'stay',
    definition: 'Cable que sujeta el mástil longitudinalmente. El stay de proa soporta el foque/genoa.',
    category: 'jarcia',
  },
  {
    term: 'carro de escota',
    definition: 'Riel con un carro móvil que permite ajustar la posición del punto de tracción de la escota del foque/genoa, modificando la tensión de la baluma.',
    category: 'jarcia',
  },
  {
    term: 'enrollador',
    definition: 'Mecanismo en el stay de proa que permite enrollar el foque/genoa para reducir su superficie sin necesidad de arriar la vela.',
    category: 'jarcia',
  },
  {
    term: 'amantillo',
    definition: 'Cabo o aparejo que sujeta la botavara por su extremo cuando la vela no está izada o se necesita soporte extra.',
    category: 'jarcia',
  },
  {
    term: 'driza',
    definition: 'Cabo utilizado para izar una vela o bandera por el mástil.',
    category: 'jarcia',
    aliases: ['drizas'],
  },
  {
    term: 'burda',
    definition: 'Estay o cable de refuerzo que va desde la parte alta del mástil hacia popa, utilizado en navegación con condiciones duras.',
    category: 'jarcia',
  },
  {
    term: 'winch',
    definition: 'Cabrestante mecánico donde se dan vueltas a los cabos para multiplicar la fuerza al cazar las velas.',
    category: 'jarcia',
  },
  {
    term: 'mordaza',
    definition: 'Dispositivo con mandíbulas dentadas que bloquea un cabo sin necesidad de hacer nudos, permitiendo soltarlo rápidamente.',
    category: 'jarcia',
  },
  {
    term: 'mayor',
    definition: 'Vela principal del barco, izada en el mástil principal y unida a la botavara.',
    category: 'vela',
    aliases: ['vela mayor'],
  },
  {
    term: 'foque',
    definition: 'Vela triangular que se iza en el stay de proa, por delante del mástil. Más pequeña que un genoa.',
    category: 'vela',
  },
  {
    term: 'genoa',
    definition: 'Foque grande que se solapa con la vela mayor, llegando su puño de escota más allá del mástil. Ofrece máxima superficie vélica.',
    category: 'vela',
  },
  {
    term: 'spinnaker',
    definition: 'Vela de gran superficie, muy ligera y con forma globular, usada en rumbos portantes (popa) para maximizar el empuje.',
    category: 'vela',
  },
  {
    term: 'génaker',
    definition: 'Vela híbrida entre genoa y spinnaker, más fácil de manejar que el spinnaker y excelente para rumbos abiertos.',
    category: 'vela',
  },
  {
    term: 'baluma',
    definition: 'Borde de salida de una vela, la parte más a popa. Su tensión controla la salida del flujo de aire.',
    category: 'vela',
  },
  {
    term: 'gratil',
    definition: 'Borde de ataque de una vela, la parte más a proa, por donde entra el viento.',
    category: 'vela',
  },
  {
    term: 'pujamen',
    definition: 'Borde inferior de una vela, el que va unido a la botavara en el caso de la mayor.',
    category: 'vela',
  },
  {
    term: 'puño de amura',
    definition: 'Esquina delantera inferior de una vela, donde se fija al barco o al stay.',
    category: 'vela',
  },
  {
    term: 'puño de escota',
    definition: 'Esquina trasera inferior de una vela, donde se sujeta la escota.',
    category: 'vela',
  },
  {
    term: 'rizos',
    definition: 'Puntos de reducción en una vela que permiten disminuir la superficie vélica cuando el viento arrecia. Se dice "tomar un rizo".',
    category: 'vela',
    aliases: ['rizo'],
  },
  {
    term: 'sables',
    definition: 'Láminas rígidas insertadas en los bolsillos de la vela mayor para mantener su forma óptima.',
    category: 'vela',
  },
  {
    term: 'tangón',
    definition: 'Palo horizontal que se apoya en el mástil y sujeta el puño de amura del spinnaker a barlovento.',
    category: 'vela',
  },
  {
    term: 'catavientos',
    definition: 'Hilos de lana o cinta colocados en las velas que indican la dirección y comportamiento del flujo de aire sobre la vela.',
    category: 'vela',
  },
  {
    term: 'bolsa',
    definition: 'Curvatura o profundidad de una vela. Una bolsa profunda da potencia; una bolsa plana quita potencia para vientos fuertes.',
    category: 'vela',
    aliases: ['embolsamiento'],
  },
  {
    term: 'ceñida',
    definition: 'Rumbo lo más cerca posible del viento (aproximadamente 30-45°). Es la forma de navegar contra el viento.',
    category: 'viento',
  },
  {
    term: 'través',
    definition: 'Rumbo en el que el viento entra perpendicular al barco (90°). El barco navega de costado al viento.',
    category: 'viento',
  },
  {
    term: 'aleta',
    definition: 'Rumbo entre el través y la popa (aproximadamente 135° del viento). También es la zona trasera lateral del barco.',
    category: 'viento',
  },
  {
    term: 'empopada',
    definition: 'Rumbo en el que el viento entra directamente por la popa (180°). El barco navega con el viento a favor.',
    category: 'viento',
  },
  {
    term: 'descuartelar',
    definition: 'Navegar con viento por la aleta, entre el través y la popa abierta.',
    category: 'viento',
  },
  {
    term: 'escala Beaufort',
    definition: 'Escala que mide la intensidad del viento de 0 (calma) a 12 (huracán) basada en el estado del mar y la velocidad del viento.',
    category: 'viento',
    aliases: ['Beaufort'],
  },
  {
    term: 'barlovento',
    definition: 'Lado del barco por donde entra el viento. Todo lo que está hacia ese lado está "a barlovento".',
    category: 'viento',
  },
  {
    term: 'sotavento',
    definition: 'Lado del barco opuesto a la entrada del viento. Todo lo que está hacia ese lado está "a sotavento".',
    category: 'viento',
  },
  {
    term: 'virada por avante',
    definition: 'Maniobra de cambio de rumbo pasando la proa por el viento. La vela mayor y el foque cambian de banda pasando el viento por proa.',
    category: 'maniobra',
    aliases: ['virar', 'virada'],
  },
  {
    term: 'trasluchada',
    definition: 'Maniobra de cambio de rumbo pasando la popa por el viento. La botavara cruza violentamente al otro lado.',
    category: 'maniobra',
    aliases: ['trasluchar'],
  },
  {
    term: 'orzar',
    definition: 'Aproximar la proa al viento, es decir, reducir el ángulo entre la proa y la dirección del viento.',
    category: 'maniobra',
  },
  {
    term: 'arribar',
    definition: 'Alejar la proa del viento, es decir, aumentar el ángulo entre la proa y la dirección del viento.',
    category: 'maniobra',
  },
  {
    term: 'cazar',
    definition: 'Tensar una vela tirando de su escota para reducir el ángulo respecto al viento y aumentar su eficiencia.',
    category: 'maniobra',
  },
  {
    term: 'filar',
    definition: 'Soltar o aflojar la escota de una vela para aumentar su ángulo respecto al viento.',
    category: 'maniobra',
  },
  {
    term: 'borneo',
    definition: 'Cambio repentino y pasajero en la dirección del viento, típico de navegación cercana a costa o con obstáculos.',
    category: 'viento',
  },
  {
    term: 'escora',
    definition: 'Inclinación lateral del barco debido al viento sobre las velas. Se mide en grados respecto a la vertical.',
    category: 'barco',
  },
  {
    term: 'obra viva',
    definition: 'Parte sumergida del casco del barco. Su estado (limpia o sucia) afecta significativamente al rendimiento.',
    category: 'barco',
    aliases: ['casco'],
  },
  {
    term: 'quilla',
    definition: 'Apéndice inferior del casco que proporciona contrapeso y evita la deriva lateral.',
    category: 'barco',
  },
  {
    term: 'timón',
    definition: 'Superficie móvil sumergida en popa que permite gobernar la dirección del barco.',
    category: 'barco',
  },
  {
    term: 'botavara',
    definition: 'Palo horizontal articulado al mástil que sujeta la vela mayor por su pujamen.',
    category: 'barco',
  },
  {
    term: 'MOB',
    definition: 'Man Over Board (Hombre al agua). Procedimiento de emergencia para rescatar a una persona que ha caído al mar.',
    category: 'seguridad',
  },
  {
    term: 'VHF',
    definition: 'Very High Frequency. Radio de comunicaciones marítimas usada para emergencias (canal 16) y comunicaciones barco-barco.',
    category: 'seguridad',
  },
  {
    term: 'arnés',
    definition: 'Equipo de seguridad personal que se engancha a puntos fijos del barco para evitar caídas al agua.',
    category: 'seguridad',
  },
]

export function getGlossaryMap(): Map<string, GlossaryEntry> {
  const map = new Map<string, GlossaryEntry>()
  for (const entry of GLOSSARY) {
    map.set(entry.term.toLowerCase(), entry)
    if (entry.aliases) {
      for (const alias of entry.aliases) {
        map.set(alias.toLowerCase(), entry)
      }
    }
  }
  return map
}
