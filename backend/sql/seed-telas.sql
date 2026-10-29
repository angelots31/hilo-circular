-- ============================================================
--  Semilla · wiki de telas de Hilo Circular (13 fichas)
--  Repetible: `ON CONFLICT (slug) DO UPDATE` actualiza sin duplicar.
--  Cada ficha cita al menos una fuente con enlace.
--  Pendiente del equipo: comprobar cada dato contra su fuente antes
--  de publicar el contenido.
-- ============================================================

INSERT INTO telas (slug, nombre, familia, resumen, impacto, ayuda, cuidado, reparar_reusar, fin_de_vida, fuentes, actualizado)
VALUES
(
  'algodon', 'Algodón', 'Natural',
  'Fibra natural que sale de la semilla de la planta de algodón. Es suave, transpirable y la base de la mayoría de camisetas y camisas.',
  'Cultivarlo ocupa mucha tierra y agua, y teñirlo consume energía y productos químicos. La mayor parte del impacto ocurre antes de que la prenda llegue a tu clóset.',
  'Reutilizar una prenda de algodón evita cultivar, teñir y transportar otra. Es el ahorro más directo que puedes hacer con tu ropa.',
  ARRAY['Lava en frío y con carga llena para gastar menos agua y energía.', 'Seca al aire; la secadora desgasta la fibra y encoge la prenda.', 'Plancha del revés para no brillar el tejido.'],
  ARRAY['Un hueco pequeño se remienda con puntada escondida.', 'Una camiseta manchada puede teñirse de nuevo.', 'Las prendas viejas sirven como trapos de limpieza antes de desecharse.'],
  'Si ya no se puede usar, llévala a un punto de recolección textil. Evita dejarla en la basura común.',
  '[{"titulo":"Ellen MacArthur Foundation · A New Textiles Economy","url":"https://www.ellenmacarthurfoundation.org/a-new-textiles-economy"},{"titulo":"CFDA Materials Hub","url":"https://cfda.com/resources/materials-hub"}]'::jsonb,
  DATE '2026-10-28'
),
(
  'mezclilla', 'Mezclilla (denim)', 'Natural',
  'Tejido de algodón con trama de sarga, resistente y pesado. Es el material de los jeans y las chaquetas de trabajo.',
  'El denim suele pasar por tinturas y acabados intensivos, a veces con lavados que gastan mucha agua. Cada prenda nueva repite ese proceso.',
  'Reutilizar mezclilla evita repetir la tintura y los acabados. Además, el denim envejece bien: dura años si se cuida.',
  ARRAY['Lava del revés y lo menos posible: el denim no necesita lavarse cada uso.', 'No uses secadora; cuelga al aire para conservar la forma.', 'Guarda los jeans doblados, no colgados, para no deformar la cintura.'],
  ARRAY['Un desgaste en la rodilla se refuerza con un parche por dentro.', 'Un dobladillo roto se cose a mano en minutos.', 'Los jeans viejos se convierten en shorts, bolsos o delantales.'],
  'El denim limpio y seco se puede donar o llevar a recolección textil. Si está roto, revisa si un taller lo puede transformar.',
  '[{"titulo":"Ellen MacArthur Foundation · A New Textiles Economy","url":"https://www.ellenmacarthurfoundation.org/a-new-textiles-economy"},{"titulo":"CFDA Materials Hub","url":"https://cfda.com/resources/materials-hub"}]'::jsonb,
  DATE '2026-10-28'
),
(
  'lino', 'Lino', 'Natural',
  'Fibra natural que sale del tallo de la planta de lino. Fresca, ligera y muy resistente; se arruga con facilidad y eso hace parte de su carácter.',
  'El cultivo y el procesamiento del lino tienen un impacto menor que el de las fibras sintéticas, pero sigue consumiendo agua, tierra y energía.',
  'Una prenda de lino bien cuidada dura muchos años. Reutilizarla es aprovechar una fibra que ya pasó por todo su proceso de producción.',
  ARRAY['Lava a mano o en ciclo delicado con agua fría.', 'No la escurras con fuerza: enrolla en una toalla y deja secar al aire.', 'Plancha ligeramente húmeda para alisar sin dañar la fibra.'],
  ARRAY['Un botón suelto se vuelve a coser en dos minutos.', 'Un dobladillo descosido se arregla con puntada simple.', 'Una camisa de lino gastada funciona muy bien como prenda de casa o de playa.'],
  'Si está en buen estado, es una de las prendas más fáciles de donar o intercambiar.',
  '[{"titulo":"CFDA Materials Hub","url":"https://cfda.com/resources/materials-hub"},{"titulo":"Textile Exchange","url":"https://textileexchange.org/"}]'::jsonb,
  DATE '2026-10-28'
),
(
  'lana', 'Lana', 'Natural',
  'Fibra natural que crece en el vellón de ovejas y otros animales. Abriga incluso mojada y regula la temperatura.',
  'La producción de lana ocupa grandes extensiones de pastoreo y tiene un impacto en el uso del suelo y en las emisiones del ganado.',
  'Reutilizar una prenda de lana abriga sin producir lana nueva ni acrílico. Es una de las prendas que mejor envejece.',
  ARRAY['Lava a mano con agua fría y jabón neutro.', 'No la retuerzas ni la cuelgues mojada: sécala extendida y con forma.', 'Guárdala doblada y con protección contra polillas.'],
  ARRAY['Las bolitas se quitan con una rasuradora de tejidos.', 'Un codo gastado se refuerza con un remiendo de punto.', 'La lana muy desgastada se puede fieltrar y convertir en otra pieza.'],
  'La lana limpia se puede donar o llevar a recolección textil. Evita la basura común.',
  '[{"titulo":"Textile Exchange","url":"https://textileexchange.org/"},{"titulo":"CFDA Materials Hub","url":"https://cfda.com/resources/materials-hub"}]'::jsonb,
  DATE '2026-10-28'
),
(
  'seda', 'Seda', 'Natural',
  'Fibra natural producida por el gusano de seda. Es ligera, brillante y muy resistente para su grosor.',
  'Producir seda requiere criar gusanos y procesar los capullos, con un consumo de agua y energía que se suma al de la confección.',
  'La seda es una fibra delicada que dura muchos años si se cuida. Reutilizarla conserva una prenda que costó mucho producir.',
  ARRAY['Lava a mano en agua fría con jabón suave.', 'No la exprimas; envuelve en una toalla y seca a la sombra.', 'Plancha a baja temperatura y del revés.'],
  ARRAY['Un hilo suelto se corta con cuidado, nunca se jala.', 'Una mancha localizada se trata con agua fría antes de lavar toda la prenda.', 'Un pañuelo de seda gastado funciona como forro o accesorio.'],
  'Si está en buen estado, se puede donar o intercambiar. Si está rota, un taller de costura puede aprovechar la tela.',
  '[{"titulo":"CFDA Materials Hub","url":"https://cfda.com/resources/materials-hub"},{"titulo":"Textile Exchange","url":"https://textileexchange.org/"}]'::jsonb,
  DATE '2026-10-28'
),
(
  'cuero', 'Cuero', 'Natural',
  'Piel animal curtida para convertirla en un material flexible y resistente. Se usa en chaquetas, zapatos y accesorios.',
  'La curtiduría es un proceso químico intensivo, y la producción de piel implica la ganadería. Es uno de los materiales con mayor impacto por kilo.',
  'Reutilizar una prenda de cuero evita curtir otra piel. Una chaqueta de cuero bien cuidada puede durar décadas.',
  ARRAY['Limpia con un paño húmedo y seca de inmediato.', 'Hidrata una o dos veces al año con un producto específico para cuero.', 'Cuélgala en un gancho ancho y evita el sol directo.'],
  ARRAY['Un raspón se disimula con crema para cuero del mismo tono.', 'Un forro roto se puede reemplazar en un taller.', 'Un bolso o cinturón viejo se puede cortar y reutilizar en otra pieza.'],
  'El cuero en buen estado se dona, se intercambia o se vende de segunda mano. Si está muy dañado, consulta un taller de marroquinería.',
  '[{"titulo":"CFDA Materials Hub","url":"https://cfda.com/resources/materials-hub"},{"titulo":"Ellen MacArthur Foundation · Fashion and the circular economy","url":"https://www.ellenmacarthurfoundation.org/topics/fashion/overview"}]'::jsonb,
  DATE '2026-10-28'
),
(
  'poliester', 'Poliéster', 'Sintética',
  'Fibra sintética hecha a partir de petróleo. Es barata, resistente y se seca rápido; por eso domina la ropa deportiva y la de moda rápida.',
  'Fabricarlo consume energía fósil y, al lavarlo, libera microplásticos que llegan al agua. Además, tarda mucho en degradarse.',
  'Reutilizar una prenda de poliéster evita fabricar más plástico textil y retrasa su llegada a la basura. Es de las decisiones con más efecto inmediato.',
  ARRAY['Lava con carga llena y en ciclo corto para reducir la fricción.', 'Usa una bolsa de lavado para retener microplásticos.', 'Evita la secadora: el calor y el roce desgastan la fibra.'],
  ARRAY['Un cierre roto se puede cambiar sin reemplazar la prenda.', 'Una costura abierta se cose en pocos minutos.', 'La ropa deportiva vieja sirve como ropa de trabajo o de jardín.'],
  'Casi no se recicla en ropa nueva. Si ya no se usa, dórala, intercámbiala o llévala a un punto de recolección textil.',
  '[{"titulo":"UICN · Primary microplastics in the oceans","url":"https://www.iucn.org/resources/issues-briefs/primary-microplastics"},{"titulo":"Ellen MacArthur Foundation · A New Textiles Economy","url":"https://www.ellenmacarthurfoundation.org/a-new-textiles-economy"},{"titulo":"UNEP · The environmental cost of fashion","url":"https://www.unep.org/news-and-stories/story/fashions-environmental-cost"}]'::jsonb,
  DATE '2026-10-28'
),
(
  'nailon', 'Nailon', 'Sintética',
  'Fibra sintética derivada del petróleo, resistente y elástica. Se usa en medias, chaquetas cortavientos y ropa deportiva.',
  'Su producción es intensiva en energía y, como el poliéster, libera microplásticos al lavarse. Persiste mucho tiempo en el ambiente.',
  'Reutilizar una prenda de nailon retrasa su paso a residuo y evita fabricar más fibra plástica. Es el mismo mensaje del poliéster.',
  ARRAY['Lava a mano o en ciclo delicado para no romper las fibras.', 'No uses suavizante: tapa la transpirabilidad.', 'Seca al aire, nunca en secadora caliente.'],
  ARRAY['Una media con carrera se puede zurcir o usar debajo de otra.', 'Un cierre dañado se reemplaza en un taller.', 'Un cortavientos roto sirve como capa impermeable para otras tareas.'],
  'No se recicla con facilidad. Si ya no se usa, se dona, se intercambia o se lleva a recolección textil.',
  '[{"titulo":"UICN · Primary microplastics in the oceans","url":"https://www.iucn.org/resources/issues-briefs/primary-microplastics"},{"titulo":"CFDA Materials Hub","url":"https://cfda.com/resources/materials-hub"}]'::jsonb,
  DATE '2026-10-28'
),
(
  'acrilico', 'Acrílico', 'Sintética',
  'Fibra sintética que imita la lana. Es económica y se usa mucho en suéteres y bufandas de bajo costo.',
  'Es una fibra plástica que casi no se recicla. Al lavarse libera microplásticos y con el uso forma bolitas con facilidad.',
  'Reutilizar una prenda acrílica evita producir más fibra plástica y alarga la vida de una prenda que de otro modo se desecha rápido.',
  ARRAY['Lava a mano en agua fría y sin frotar.', 'Seca extendida para conservar la forma.', 'Usa una rasuradora de tejidos para quitar las bolitas.'],
  ARRAY['Las bolitas se retiran sin dañar el tejido.', 'Un hilván suelto se remata con aguja.', 'La prenda vieja sirve como forro o relleno de cojines.'],
  'Casi no se recicla. Se recomienda donarla, intercambiarla o llevarla a un punto de recolección textil.',
  '[{"titulo":"UICN · Primary microplastics in the oceans","url":"https://www.iucn.org/resources/issues-briefs/primary-microplastics"},{"titulo":"Textile Exchange","url":"https://textileexchange.org/"}]'::jsonb,
  DATE '2026-10-28'
),
(
  'elastano', 'Elastano', 'Sintética',
  'Fibra sintética que estira y recupera su forma. Aparece en pequeñas proporciones en jeans, ropa interior y deportiva.',
  'Su presencia, aunque sea pequeña, complica el reciclaje de otras fibras porque no se separa con facilidad.',
  'Como el elastano complica el reciclaje, reutilizar la prenda completa es la mejor opción disponible.',
  ARRAY['Lava en frío: el calor del agua y de la secadora degrada el elastano.', 'No uses secadora ni plancha caliente.', 'Guarda la prenda doblada para no estirar las fibras.'],
  ARRAY['Un elástico vencido se puede reemplazar en ropa interior.', 'Un puño flojo se ajusta con una costura.', 'La prenda sin elástico sirve como tela para otras labores.'],
  'No se recicla de forma habitual. Dónala o llévala a recolección textil si aún puede usarse.',
  '[{"titulo":"Ellen MacArthur Foundation · A New Textiles Economy","url":"https://www.ellenmacarthurfoundation.org/a-new-textiles-economy"},{"titulo":"CFDA Materials Hub","url":"https://cfda.com/resources/materials-hub"}]'::jsonb,
  DATE '2026-10-28'
),
(
  'cuero-sintetico', 'Cuero sintético', 'Sintética',
  'Material que imita el cuero y se fabrica con poliuretano u otros plásticos sobre una base textil. Se usa en chaquetas, zapatos y bolsos.',
  'Es un derivado del plástico: su producción depende del petróleo y al desgastarse se descama y termina como residuo difícil de reciclar.',
  'Reutilizar una prenda de cuero sintético retrasa su paso a residuo plástico y evita fabricar otra capa de poliuretano.',
  ARRAY['Limpia con un paño húmedo, sin químicos fuertes.', 'No la planches: el calor derrite el recubrimiento.', 'Cuélgala en un gancho ancho para no marcarla.'],
  ARRAY['Un descosido se repara con costura normal.', 'Un raspón pequeño se disimula con pintura para cuero sintético.', 'La prenda vieja sirve como forro o para accesorios.'],
  'Casi no se recicla. Si ya no se usa, se dona o se lleva a un punto de recolección textil.',
  '[{"titulo":"CFDA Materials Hub","url":"https://cfda.com/resources/materials-hub"},{"titulo":"UNEP · The environmental cost of fashion","url":"https://www.unep.org/news-and-stories/story/fashions-environmental-cost"}]'::jsonb,
  DATE '2026-10-28'
),
(
  'viscosa', 'Viscosa (rayón)', 'Artificial',
  'Fibra artificial hecha a partir de celulosa, normalmente de madera. Se siente suave y cae como la seda.',
  'Su proceso químico es intensivo y requiere madera como materia prima. La trazabilidad de esa madera no siempre es clara.',
  'Reutilizar una prenda de viscosa evita un proceso químico intensivo y el uso de más madera. También alarga la vida de una fibra delicada.',
  ARRAY['Lava a mano o en ciclo delicado con agua fría.', 'No la escurras: enrolla en una toalla.', 'Plancha a baja temperatura y del revés.'],
  ARRAY['Un dobladillo suelto se cose a mano.', 'Una mancha se trata con agua fría antes de lavar.', 'La prenda gastada sirve como forro o tela de práctica.'],
  'Se puede donar si está en buen estado. Si está rota, un taller puede reutilizar la tela.',
  '[{"titulo":"CFDA Materials Hub","url":"https://cfda.com/resources/materials-hub"},{"titulo":"Textile Exchange","url":"https://textileexchange.org/"}]'::jsonb,
  DATE '2026-10-28'
),
(
  'mezclas', 'Mezclas', 'Mezcla',
  'Tejidos que combinan dos o más fibras, por ejemplo algodón con poliéster o lana con acrílico, para lograr suavidad, elasticidad o resistencia.',
  'Separar las fibras de una mezcla es difícil y costoso, así que casi no se pueden reciclar para hacer ropa nueva.',
  'Como las mezclas casi no se reciclan, reutilizar la prenda completa es lo más efectivo que puedes hacer con ella.',
  ARRAY['Revisa la etiqueta interior para saber qué fibras contiene.', 'Lava según la fibra más delicada de la mezcla.', 'Seca al aire para no deformar el tejido.'],
  ARRAY['Cualquier costura abierta se repara igual que en una prenda de una sola fibra.', 'Un remiendo visible puede volverse parte del diseño.', 'La prenda vieja sirve como tela para parches o forros.'],
  'No se recicla de forma habitual. Dónala, intercámbiala o llévala a recolección textil si aún puede usarse.',
  '[{"titulo":"Ellen MacArthur Foundation · A New Textiles Economy","url":"https://www.ellenmacarthurfoundation.org/a-new-textiles-economy"},{"titulo":"UNEP · The environmental cost of fashion","url":"https://www.unep.org/news-and-stories/story/fashions-environmental-cost"}]'::jsonb,
  DATE '2026-10-28'
)
ON CONFLICT (slug) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  familia = EXCLUDED.familia,
  resumen = EXCLUDED.resumen,
  impacto = EXCLUDED.impacto,
  ayuda = EXCLUDED.ayuda,
  cuidado = EXCLUDED.cuidado,
  reparar_reusar = EXCLUDED.reparar_reusar,
  fin_de_vida = EXCLUDED.fin_de_vida,
  fuentes = EXCLUDED.fuentes,
  actualizado = EXCLUDED.actualizado;
