export type GlossaryCategory = 'vela' | 'jarcia' | 'maniobra' | 'viento' | 'barco' | 'seguridad'

export interface GlossaryEntry {
  term: string
  definition: string
  definitionEn?: string
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

export function getDefinition(entry: GlossaryEntry, lang: 'es' | 'en'): string {
  if (lang === 'en' && entry.definitionEn) return entry.definitionEn
  return entry.definition
}

export const GLOSSARY: GlossaryEntry[] = [
  { term: 'proa', definition: 'Parte delantera del barco. Todo lo que está hacia delante está "a proa".', definitionEn: 'Front part of the boat. Everything forward is "ahead".', category: 'barco' },
  { term: 'popa', definition: 'Parte trasera del barco. Todo lo que está hacia atrás está "a popa".', definitionEn: 'Rear part of the boat. Everything aft is "astern".', category: 'barco' },
  { term: 'babor', definition: 'Lado izquierdo del barco mirando hacia proa. Se identifica con el color rojo en las luces de navegación.', definitionEn: 'Left side of the boat facing forward. Identified by the red navigation light.', category: 'barco' },
  { term: 'estribor', definition: 'Lado derecho del barco mirando hacia proa. Se identifica con el color verde en las luces de navegación.', definitionEn: 'Right side of the boat facing forward. Identified by the green navigation light.', category: 'barco' },
  { term: 'mástil', definition: 'Palo vertical que sostiene las velas y la jarcia. En un sloop hay uno; en un yawl o ketch hay dos.', definitionEn: 'Vertical spar that supports the sails and rigging. A sloop has one; a yawl or ketch has two.', category: 'barco' },
  { term: 'cabo', definition: 'Cuerda utilizada a bordo para amarrar, cazar velas o cualquier maniobra. En náutica no se dice cuerda, se dice cabo.', definitionEn: 'Rope used onboard for mooring, trimming sails, or any maneuver. In nautical terms, it is always called a line, not a rope.', category: 'jarcia', aliases: ['cabos'] },
  { term: 'cornamusa', definition: 'Pieza metálica o de madera con dos cuernos donde se amarran los cabos de forma segura y rápida.', definitionEn: 'Metal or wooden fitting with two horns where lines are secured quickly and safely.', category: 'jarcia', aliases: ['cornamusas'] },
  { term: 'bita', definition: 'Poste metálico robusto en cubierta o en el muelle donde se amarran los cabos más gruesos.', definitionEn: 'Sturdy metal post on deck or dock where thicker lines are made fast.', category: 'jarcia', aliases: ['bitas'] },
  { term: 'defensa', definition: 'Pieza de goma o plástico hinchable que se cuelga del costado para proteger el casco al atracar o al estar amarrado a un muelle.', definitionEn: 'Inflatable rubber or plastic fender hung over the side to protect the hull when docking or moored.', category: 'barco', aliases: ['defensas'] },
  { term: 'amarrar', definition: 'Fijar el barco al muelle o a una boya mediante cabos. También se dice atracar.', definitionEn: 'To secure the boat to a dock or buoy using lines. Also called mooring or tying up.', category: 'maniobra', aliases: ['amarras', 'amarre'] },
  { term: 'nudo', definition: 'Forma de atar un cabo sobre sí mismo o a otro punto. Los más comunes a bordo son el ballestrinque, el as de guía y el ocho.', definitionEn: 'Way of tying a line to itself or to a fitting. The most common ones onboard are the clove hitch, bowline, and figure-eight.', category: 'maniobra', aliases: ['nudos'] },
  { term: 'caña', definition: 'Barra con la que se gobierna el timón directamente. En barcos más grandes se sustituye por una rueda de timón.', definitionEn: 'Tiller used to steer the rudder directly. On larger boats it is replaced by a steering wheel.', category: 'barco' },
  { term: 'escota', definition: 'Cabo que sirve para cazar (tensar) una vela y controlar su ángulo respecto al viento.', definitionEn: 'Line used to trim (tighten) a sail and control its angle relative to the wind.', category: 'jarcia', aliases: ['escotas'] },
  { term: 'traveller', definition: 'Carro deslizante sobre un riel transversal que permite mover el punto de anclaje de la escota de mayor a barlovento o sotavento.', definitionEn: 'Sliding car on a transverse track that allows moving the mainsail sheet attachment point to windward or leeward.', category: 'jarcia' },
  { term: 'cunningham', definition: 'Cabo o aparejo que tensa el gratil de la vela mayor hacia abajo, eliminando arrugas y adelantando la bolsa.', definitionEn: 'Line or tackle that tensions the mainsail luff downward, removing wrinkles and moving the draft forward.', category: 'jarcia' },
  { term: 'pajarín', definition: 'Cabo en la botavara que tensa el pujamen de la vela mayor, controlando la profundidad de la bolsa en la parte baja. También llamado outhaul.', definitionEn: 'Line on the boom that tensions the mainsail foot, controlling draft depth in the lower section. Also called outhaul.', category: 'jarcia', aliases: ['outhaul'] },
  { term: 'backstay', definition: 'Cable o cabo que va desde el tope del mástil hasta la popa, controlando la flexión del mástil y la tensión del stay.', definitionEn: 'Wire or line running from the masthead to the stern, controlling mast bend and forestay tension.', category: 'jarcia' },
  { term: 'obenque', definition: 'Cable metálico que sujeta el mástil lateralmente desde los costados del barco.', definitionEn: 'Metal wire that supports the mast laterally from the sides of the boat. Also called shroud.', category: 'jarcia', aliases: ['obenques'] },
  { term: 'stay', definition: 'Cable que sujeta el mástil longitudinalmente. El stay de proa soporta el foque/genoa.', definitionEn: 'Wire that supports the mast fore-and-aft. The forestay supports the jib/genoa.', category: 'jarcia' },
  { term: 'carro de escota', definition: 'Riel con un carro móvil que permite ajustar la posición del punto de tracción de la escota del foque/genoa, modificando la tensión de la baluma.', definitionEn: 'Track with a movable car that adjusts the jib/genoa sheet lead position, changing leech tension. Also called fairlead.', category: 'jarcia' },
  { term: 'enrollador', definition: 'Mecanismo en el stay de proa que permite enrollar el foque/genoa para reducir su superficie sin necesidad de arriar la vela.', definitionEn: 'Mechanism on the forestay that rolls up the jib/genoa to reduce sail area without lowering the sail.', category: 'jarcia' },
  { term: 'amantillo', definition: 'Cabo o aparejo que sujeta la botavara por su extremo cuando la vela no está izada o se necesita soporte extra.', definitionEn: 'Line or tackle that supports the boom end when the sail is not hoisted or extra support is needed. Also called topping lift.', category: 'jarcia' },
  { term: 'driza', definition: 'Cabo utilizado para izar una vela o bandera por el mástil.', definitionEn: 'Line used to hoist a sail or flag up the mast.', category: 'jarcia', aliases: ['drizas'] },
  { term: 'burda', definition: 'Estay o cable de refuerzo que va desde la parte alta del mástil hacia popa, utilizado en navegación con condiciones duras.', definitionEn: 'Running backstay or reinforcement cable from the upper mast aft, used in heavy weather sailing.', category: 'jarcia' },
  { term: 'winch', definition: 'Cabrestante mecánico donde se dan vueltas a los cabos para multiplicar la fuerza al cazar las velas.', definitionEn: 'Mechanical winch where lines are wrapped to multiply pulling force when trimming sails.', category: 'jarcia' },
  { term: 'mordaza', definition: 'Dispositivo con mandíbulas dentadas que bloquea un cabo sin necesidad de hacer nudos, permitiendo soltarlo rápidamente.', definitionEn: 'Device with toothed jaws that locks a line without knots, allowing quick release. Also called jammer or clutch.', category: 'jarcia' },
  { term: 'mayor', definition: 'Vela principal del barco, izada en el mástil principal y unida a la botavara.', definitionEn: 'Main sail of the boat, hoisted on the main mast and attached to the boom.', category: 'vela', aliases: ['vela mayor'] },
  { term: 'foque', definition: 'Vela triangular que se iza en el stay de proa, por delante del mástil. Más pequeña que un genoa.', definitionEn: 'Triangular sail hoisted on the forestay, forward of the mast. Smaller than a genoa.', category: 'vela' },
  { term: 'genoa', definition: 'Foque grande que se solapa con la vela mayor, llegando su puño de escota más allá del mástil. Ofrece máxima superficie vélica.', definitionEn: 'Large jib that overlaps the mainsail, with its clew extending past the mast. Provides maximum sail area.', category: 'vela' },
  { term: 'spinnaker', definition: 'Vela de gran superficie, muy ligera y con forma globular, usada en rumbos portantes (popa) para maximizar el empuje.', definitionEn: 'Large, very lightweight balloon-shaped sail used on downwind courses to maximize drive.', category: 'vela' },
  { term: 'génaker', definition: 'Vela híbrida entre genoa y spinnaker, más fácil de manejar que el spinnaker y excelente para rumbos abiertos.', definitionEn: 'Hybrid sail between genoa and spinnaker, easier to handle than a spinnaker and excellent for reaching courses.', category: 'vela' },
  { term: 'baluma', definition: 'Borde de salida de una vela, la parte más a popa. Su tensión controla la salida del flujo de aire.', definitionEn: 'Trailing edge of a sail, the aftmost part. Its tension controls airflow exit.', category: 'vela' },
  { term: 'gratil', definition: 'Borde de ataque de una vela, la parte más a proa, por donde entra el viento.', definitionEn: 'Leading edge of a sail, the forwardmost part, where the wind enters.', category: 'vela' },
  { term: 'pujamen', definition: 'Borde inferior de una vela, el que va unido a la botavara en el caso de la mayor.', definitionEn: 'Bottom edge of a sail, attached to the boom in the case of the mainsail.', category: 'vela' },
  { term: 'puño de amura', definition: 'Esquina delantera inferior de una vela, donde se fija al barco o al stay.', definitionEn: 'Forward lower corner of a sail, where it attaches to the boat or stay. Also called tack.', category: 'vela' },
  { term: 'puño de escota', definition: 'Esquina trasera inferior de una vela, donde se sujeta la escota.', definitionEn: 'Aft lower corner of a sail, where the sheet is attached. Also called clew.', category: 'vela' },
  { term: 'rizos', definition: 'Puntos de reducción en una vela que permiten disminuir la superficie vélica cuando el viento arrecia. Se dice "tomar un rizo".', definitionEn: 'Reduction points on a sail that allow decreasing sail area when the wind picks up. Called "reefing".', category: 'vela', aliases: ['rizo'] },
  { term: 'sables', definition: 'Láminas rígidas insertadas en los bolsillos de la vela mayor para mantener su forma óptima.', definitionEn: 'Stiff battens inserted into mainsail pockets to maintain optimal shape.', category: 'vela' },
  { term: 'tangón', definition: 'Palo horizontal que se apoya en el mástil y sujeta el puño de amura del spinnaker a barlovento.', definitionEn: 'Horizontal pole supported by the mast that holds the spinnaker tack to windward. Also called spinnaker pole.', category: 'vela' },
  { term: 'catavientos', definition: 'Hilos de lana o cinta colocados en las velas que indican la dirección y comportamiento del flujo de aire sobre la vela.', definitionEn: 'Wool or tape threads placed on sails that indicate airflow direction and behavior over the sail. Also called telltales.', category: 'vela' },
  { term: 'bolsa', definition: 'Curvatura o profundidad de una vela. Una bolsa profunda da potencia; una bolsa plana quita potencia para vientos fuertes.', definitionEn: 'Curvature or depth of a sail. A deep draft gives power; a flat draft reduces power for strong winds.', category: 'vela', aliases: ['embolsamiento'] },
  { term: 'ceñida', definition: 'Rumbo lo más cerca posible del viento (aproximadamente 30-45°). Es la forma de navegar contra el viento.', definitionEn: 'Course as close to the wind as possible (approximately 30-45°). The way to sail upwind.', category: 'viento' },
  { term: 'través', definition: 'Rumbo en el que el viento entra perpendicular al barco (90°). El barco navega de costado al viento.', definitionEn: 'Course where the wind comes perpendicular to the boat (90°). The boat sails sideways to the wind. Also called beam reach.', category: 'viento' },
  { term: 'aleta', definition: 'Rumbo entre el través y la popa (aproximadamente 135° del viento). También es la zona trasera lateral del barco.', definitionEn: 'Course between beam reach and running (approximately 135° off the wind). Also the rear side area of the boat. Also called broad reach.', category: 'viento' },
  { term: 'empopada', definition: 'Rumbo en el que el viento entra directamente por la popa (180°). El barco navega con el viento a favor.', definitionEn: 'Course where the wind comes directly from astern (180°). The boat sails with the wind behind it. Also called running.', category: 'viento' },
  { term: 'descuartelar', definition: 'Navegar con viento por la aleta, entre el través y la popa abierta.', definitionEn: 'Sailing with the wind on the quarter, between a beam reach and a broad reach.', category: 'viento' },
  { term: 'escala Beaufort', definition: 'Escala que mide la intensidad del viento de 0 (calma) a 12 (huracán) basada en el estado del mar y la velocidad del viento.', definitionEn: 'Scale measuring wind intensity from 0 (calm) to 12 (hurricane) based on sea state and wind speed.', category: 'viento', aliases: ['Beaufort'] },
  { term: 'barlovento', definition: 'Lado del barco por donde entra el viento. Todo lo que está hacia ese lado está "a barlovento".', definitionEn: 'Side of the boat where the wind is coming from. Everything toward that side is "to windward".', category: 'viento' },
  { term: 'sotavento', definition: 'Lado del barco opuesto a la entrada del viento. Todo lo que está hacia ese lado está "a sotavento".', definitionEn: 'Side of the boat opposite to the wind. Everything toward that side is "to leeward".', category: 'viento' },
  { term: 'virada por avante', definition: 'Maniobra de cambio de rumbo pasando la proa por el viento. La vela mayor y el foque cambian de banda pasando el viento por proa.', definitionEn: 'Maneuver to change course by passing the bow through the wind. The mainsail and jib change sides as the wind crosses the bow. Also called tacking.', category: 'maniobra', aliases: ['virar', 'virada'] },
  { term: 'trasluchada', definition: 'Maniobra de cambio de rumbo pasando la popa por el viento. La botavara cruza violentamente al otro lado.', definitionEn: 'Maneuver to change course by passing the stern through the wind. The boom swings violently to the other side. Also called gybing.', category: 'maniobra', aliases: ['trasluchar'] },
  { term: 'orzar', definition: 'Aproximar la proa al viento, es decir, reducir el ángulo entre la proa y la dirección del viento.', definitionEn: 'To bring the bow closer to the wind, i.e., reduce the angle between the bow and wind direction. Also called heading up or luffing up.', category: 'maniobra' },
  { term: 'arribar', definition: 'Alejar la proa del viento, es decir, aumentar el ángulo entre la proa y la dirección del viento.', definitionEn: 'To steer the bow away from the wind, i.e., increase the angle between the bow and wind direction. Also called bearing away.', category: 'maniobra' },
  { term: 'cazar', definition: 'Tensar una vela tirando de su escota para reducir el ángulo respecto al viento y aumentar su eficiencia.', definitionEn: 'To tighten a sail by pulling its sheet to reduce the angle to the wind and increase efficiency. Also called trimming in or sheeting in.', category: 'maniobra' },
  { term: 'filar', definition: 'Soltar o aflojar la escota de una vela para aumentar su ángulo respecto al viento.', definitionEn: 'To ease or let out the sheet of a sail to increase its angle to the wind. Also called easing.', category: 'maniobra' },
  { term: 'borneo', definition: 'Cambio repentino y pasajero en la dirección del viento, típico de navegación cercana a costa o con obstáculos.', definitionEn: 'Sudden and temporary shift in wind direction, typical when sailing near the coast or obstacles. Also called header or lift depending on direction.', category: 'viento' },
  { term: 'escora', definition: 'Inclinación lateral del barco debido al viento sobre las velas. Se mide en grados respecto a la vertical.', definitionEn: 'Lateral heel of the boat due to wind on the sails. Measured in degrees from vertical.', category: 'barco' },
  { term: 'obra viva', definition: 'Parte sumergida del casco del barco. Su estado (limpia o sucia) afecta significativamente al rendimiento.', definitionEn: 'Submerged part of the hull. Its condition (clean or fouled) significantly affects performance.', category: 'barco', aliases: ['casco'] },
  { term: 'quilla', definition: 'Apéndice inferior del casco que proporciona contrapeso y evita la deriva lateral.', definitionEn: 'Lower appendage of the hull that provides counterweight and prevents sideways drift.', category: 'barco' },
  { term: 'timón', definition: 'Superficie móvil sumergida en popa que permite gobernar la dirección del barco.', definitionEn: 'Movable underwater surface at the stern that allows steering the boat.', category: 'barco' },
  { term: 'botavara', definition: 'Palo horizontal articulado al mástil que sujeta la vela mayor por su pujamen.', definitionEn: 'Horizontal spar hinged to the mast that holds the mainsail by its foot.', category: 'barco' },
  { term: 'MOB', definition: 'Man Over Board (Hombre al agua). Procedimiento de emergencia para rescatar a una persona que ha caído al mar.', definitionEn: 'Man Overboard. Emergency procedure to rescue a person who has fallen into the water.', category: 'seguridad' },
  { term: 'VHF', definition: 'Very High Frequency. Radio de comunicaciones marítimas usada para emergencias (canal 16) y comunicaciones barco-barco.', definitionEn: 'Very High Frequency maritime radio used for emergencies (channel 16) and ship-to-ship communications.', category: 'seguridad' },
  { term: 'arnés', definition: 'Equipo de seguridad personal que se engancha a puntos fijos del barco para evitar caídas al agua.', definitionEn: 'Personal safety harness that clips to fixed points on the boat to prevent falling overboard.', category: 'seguridad' },
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
