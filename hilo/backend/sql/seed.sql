-- ============================================================
--  Hilo Circular · datos de ejemplo
--  Todas las cuentas demo usan la contraseña: demo123
--  (el hash corresponde a bcrypt de "demo123")
-- ============================================================

INSERT INTO usuarios (id, nombre, email, clave_hash, ciudad, barrio, direccion, bio, intereses, rol, verificado, reputacion, intercambios, desde, estado) VALUES
('u1', 'Valentina Ríos',    'valentina@hilocircular.co', '$2a$10$Df6rR1v78hDGEGQXFqN34OvX9MiSQRHIb4o5tD3T/5jlrtHdfS2yi', 'Medellín', 'El Poblado',     'Cra. 35 #8A-12, apto 402', 'Curo mi clóset cada temporada. Amo las chaquetas de segunda mano.', ARRAY['Chaquetas','Vintage','Reparación'], 'usuario', true,  4.9, 27, '2024-02-11', 'activo'),
('u2', 'Mateo Cárdenas',    'mateo@hilocircular.co',     '$2a$10$Df6rR1v78hDGEGQXFqN34OvX9MiSQRHIb4o5tD3T/5jlrtHdfS2yi', 'Medellín', 'Laureles',       NULL, 'Denim, denim y más denim.', ARRAY['Pantalones','Vintage'], 'usuario', true,  4.7, 14, '2024-05-03', 'activo'),
('u3', 'Sara Betancur',     'sara@hilocircular.co',      '$2a$10$Df6rR1v78hDGEGQXFqN34OvX9MiSQRHIb4o5tD3T/5jlrtHdfS2yi', 'Medellín', 'Belén',          NULL, 'Compro poco, transformo mucho.', ARRAY['Vestidos','Accesorios'], 'usuario', false, 4.4,  6, '2025-01-20', 'activo'),
('u4', 'Julián Ospina',     'julian@hilocircular.co',    '$2a$10$Df6rR1v78hDGEGQXFqN34OvX9MiSQRHIb4o5tD3T/5jlrtHdfS2yi', 'Medellín', 'Robledo',        NULL, 'Zapatillas restauradas, listas para una segunda vuelta.', ARRAY['Calzado','Deportivo'], 'usuario', true,  4.8, 19, '2024-08-19', 'activo'),
('u5', 'Camila Duarte',     'camila@hilocircular.co',    '$2a$10$Df6rR1v78hDGEGQXFqN34OvX9MiSQRHIb4o5tD3T/5jlrtHdfS2yi', 'Medellín', 'La Candelaria',  NULL, 'Vestidos de lino, ideal para el calor.', ARRAY['Vestidos','Punto'], 'usuario', true,  5.0, 33, '2023-11-07', 'activo'),
('u6', 'Andrés Salazar',    'andres@hilocircular.co',    '$2a$10$Df6rR1v78hDGEGQXFqN34OvX9MiSQRHIb4o5tD3T/5jlrtHdfS2yi', 'Medellín', 'Manrique',       NULL, 'Nuevo en la comunidad.', ARRAY['Camisetas'], 'usuario', false, 3.8,  3, '2025-06-02', 'suspendido'),
('u7', 'Laura Piedrahíta',  'laura@hilocircular.co',     '$2a$10$Df6rR1v78hDGEGQXFqN34OvX9MiSQRHIb4o5tD3T/5jlrtHdfS2yi', 'Medellín', 'Buenos Aires',   NULL, 'Accesorios, sombreros y bolsos de fibras naturales.', ARRAY['Accesorios','Punto'], 'usuario', true,  4.6, 11, '2024-09-15', 'activo'),
('u8', 'Daniela Quintero',  'daniela@hilocircular.co',   '$2a$10$Df6rR1v78hDGEGQXFqN34OvX9MiSQRHIb4o5tD3T/5jlrtHdfS2yi', 'Medellín', 'Guayabal',       NULL, 'Tejidos y punto hechos a mano.', ARRAY['Punto','Reparación'], 'usuario', true,  4.9, 22, '2024-03-28', 'activo'),
('u9', 'Equipo Hilo Circular', 'admin@hilocircular.co',  '$2a$10$Df6rR1v78hDGEGQXFqN34OvX9MiSQRHIb4o5tD3T/5jlrtHdfS2yi', 'Medellín', 'La Candelaria',  NULL, 'Curaduría, moderación y soporte de la comunidad.', ARRAY[]::text[], 'admin', true, 5.0, 0, '2023-09-01', 'activo');

INSERT INTO prendas (id, titulo, tipo, categoria, talla, estado, color, marca, valor, descripcion, dueno_id, ciudad, barrio, disponible, destacada, vistas, likes, creada, fotos, paleta) VALUES
('p1',  'Chaqueta biker en cuero sintético', 'chaqueta',  'Chaquetas',  'M', 'Como nuevo',        'Negro',         'Mango',          78,  'Cuero sintético con cierre asimétrico y forro completo. Se usó tres veces, sin marcas ni desgastes. Ideal para media estación.', 'u1', 'Medellín', 'El Poblado',    true,  true,  412, 61, '2025-09-18', '{}', ARRAY['#3a3140','#5d4655']),
('p2',  'Jean recto de tiro alto',           'pantalon',  'Pantalones', '38','Buen estado',       'Azul índigo',   'Levi''s',        55,  'Denim rígido de algodón, recto y de tiro alto. Ligeras señales de uso en el ruedo, se nota muy poco.', 'u2', 'Medellín', 'Laureles',      true,  true,  288, 44, '2025-09-22', '{}', ARRAY['#4a5f8a','#6872aa']),
('p3',  'Vestido de lino con botones',       'vestido',   'Vestidos',   'S', 'Nuevo con etiqueta','Crudo',         'Zara',           92,  'Lino fresco, perfecto para clima cálido. Nunca se estrenó, con etiqueta original. Corte midi.', 'u5', 'Medellín', 'La Candelaria', true,  true,  501, 97, '2025-09-25', '{}', ARRAY['#d9c8b4','#e5c4c6']),
('p4',  'Abrigo largo de paño',              'abrigo',    'Abrigos',    'L', 'Como nuevo',        'Camel',         'Massimo Dutti', 130,  'Paño de lana mezcla con solapa cruzada y cinturón. Abriga muchísimo y está impecable.', 'u8', 'Medellín', 'Guayabal',      true,  false, 233, 38, '2025-09-11', '{}', ARRAY['#c8a179','#5d4655']),
('p5',  'Blazer oversize de cuadros',        'blazer',    'Chaquetas',  'M', 'Buen estado',       'Gris',          'H&M',            62,  'Blazer oversize con cuadros sutiles. Tiene forro nuevo puesto por una modista, quedó como salido de tienda.', 'u3', 'Medellín', 'Belén', true, false, 176, 25, '2025-09-27', '{}', ARRAY['#7e8598','#e2deea']),
('p6',  'Zapatillas retro en piel',          'zapatillas','Calzado',    '41','Con detalles',      'Blanco',        'Adidas',         48,  'Suela restaurada y cordones nuevos. La piel tiene desgaste natural en los laterales, se ve bien con limpieza.', 'u4', 'Medellín', 'Robledo', true, false, 321, 52, '2025-09-08', '{}', ARRAY['#f2f0f5','#6872aa']),
('p7',  'Suéter de punto trenzado',          'sueter',    'Punto',      'L', 'Como nuevo',        'Crema',         'Artesanal',      70,  'Tejido a mano en lana suave, sin pilling. Un básico de invierno con historia propia.', 'u8', 'Medellín', 'Guayabal', true, true, 264, 47, '2025-09-20', '{}', ARRAY['#efe7dc','#e5c4c6']),
('p8',  'Falda plisada midi',                'falda',     'Faldas',     'S', 'Buen estado',       'Verde salvia',  'Pull&Bear',      40,  'Plisado perfecto, cintura elástica. Movimiento precioso, casi no se usó.', 'u1', 'Medellín', 'El Poblado', true, false, 149, 22, '2025-09-14', '{}', ARRAY['#9aa98d','#6872aa']),
('p9',  'Bolso tejido de fibras naturales',  'bolso',     'Accesorios', 'Única','Como nuevo',      'Arena',         'Artesanal',      35,  'Tejido a mano por artesanas de La Boquilla. Forro interno de tela y correa ajustable.', 'u7', 'Medellín', 'Buenos Aires', true, false, 198, 34, '2025-09-29', '{}', ARRAY['#d8c19a','#c8894f']),
('p10', 'Camisa de lino manga larga',        'camiseta',  'Camisetas',  'M', 'Buen estado',       'Azul cielo',    'Zara',           42,  'Lino liviano con un bolsillo. Perfecta para oficina informal, sin manchas ni roturas.', 'u2', 'Medellín', 'Laureles', true, false, 121, 18, '2025-09-16', '{}', ARRAY['#a8c2e0','#6872aa']),
('p11', 'Chaqueta vaquera clásica',          'chaqueta',  'Chaquetas',  'M', 'Como nuevo',        'Azul claro',    'Levi''s',        88,  'Trucker jacket de denim, la de siempre. Bordado original intacto y botones completos.', 'u5', 'Medellín', 'La Candelaria', true, false, 277, 41, '2025-09-24', '{}', ARRAY['#7f9cc4','#6872aa']),
('p12', 'Pantalón palazzo de gasa',          'pantalon',  'Pantalones', 'M', 'Nuevo con etiqueta','Terracota',     'Studio',         58,  'Gasa fluida con cintura elástica. Sin estrenar, comprado y nunca usado.', 'u3', 'Medellín', 'Belén', false, false, 96, 15, '2025-09-30', '{}', ARRAY['#c98a6d','#e5c4c6']),
('p13', 'Gabardina impermeable',             'abrigo',    'Abrigos',    'L', 'Buen estado',       'Oliva',         'Uniqlo',         95,  'Impermeable con capucha desmontable y costuras selladas. Ideal para temporada de lluvia.', 'u4', 'Medellín', 'Robledo', true, false, 210, 29, '2025-09-05', '{}', ARRAY['#7b8264','#5d4655']),
('p14', 'Top de punto acanalado',            'camiseta',  'Punto',      'XS','Como nuevo',        'Lila',          'Bershka',        28,  'Punto acanalado con tirantes finos. Suave, sin bolas y con caída bonita.', 'u7', 'Medellín', 'Buenos Aires', true, false, 74, 12, '2025-10-02', '{}', ARRAY['#c9b9dd','#6872aa']);

INSERT INTO resenas (id, autor_id, para_id, prenda_id, estrellas, texto, fecha, util, reportada, respuesta) VALUES
('r1', 'u2', 'u1', 'p1', 5, 'La chaqueta llegó tal cual las fotos y perfumada. Valentina respondió en minutos y coordinó el domicilio el mismo día. Repetiría sin pensarlo.', '2025-09-26', 12, false, '¡Gracias, Mateo! Que la disfrutes mucho. Nos vemos en el próximo trueque.'),
('r2', 'u5', 'u8', 'p7', 5, 'El suéter es una obra de arte, se nota el trabajo a mano. Empaque impecable y muy buena comunicación.', '2025-09-23', 9, false, ''),
('r3', 'u3', 'u2', 'p2', 4, 'El jean es lindísimo y la talla coincide. Solo tardó dos días más de lo previsto en llegar, pero avisó a tiempo.', '2025-09-21', 5, false, 'Gracias por la paciencia, Sara. Ajustamos la ruta para la próxima.'),
('r4', 'u8', 'u4', 'p6', 5, 'Julián restauró las zapatillas antes de enviarlas, quedaron mejores de lo que esperaba. Un intercambio excelente.', '2025-09-17', 8, false, ''),
('r5', 'u1', 'u6', 'p5', 2, 'La prenda tenía una mancha que no aparecía en las fotos y la descripción decía "como nuevo". Pedí apoyo al equipo y me ayudaron rápido.', '2025-08-30', 21, true, 'Lamentamos la experiencia. La cuenta queda en revisión por nuestro equipo de moderación.'),
('r6', 'u7', 'u5', 'p3', 5, 'El vestido llegó con la etiqueta puesta, tal como se describía. Camila es una persona muy organizada.', '2025-09-28', 6, false, '¡Mil gracias! Un placer intercambiar contigo.'),
('r7', 'u4', 'u3', 'p5', 4, 'Buena experiencia, la prenda venía limpia y bien empacada. La comunicación pudo ser más rápida, nada grave.', '2025-09-12', 4, false, ''),
('r8', 'u5', 'u7', 'p9', 5, 'El bolso es precioso y llegó con una nota escrita a mano. Se siente la cercanía con quien lo hizo.', '2025-10-01', 7, false, 'Gracias, Camila. Las artesanas se pusieron felices.');

INSERT INTO pedidos (id, prenda_id, usuario_id, receptor_id, metodo, ciudad, estado, guia, fecha, costo, transportadora) VALUES
('e1', 'p3', 'u2', 'u5', 'Domicilio',          'Medellín', 'En camino',  'HC-4821-90', '2025-10-02', 12500, 'Servientrega'),
('e2', 'p1', 'u1', 'u2', 'Domicilio',          'Medellín', 'Entregado',  'HC-4710-33', '2025-09-26', 11900, 'Envía'),
('e3', 'p7', 'u8', 'u5', 'Domicilio',          'Medellín', 'Preparando', 'HC-4902-11', '2025-10-05', 14200, 'Coordinadora'),
('e4', 'p6', 'u4', 'u8', 'Punto de encuentro', 'Medellín', 'Entregado',  'HC-4655-08', '2025-09-17', 0,     'Punto aliado'),
('e5', 'p2', 'u2', 'u3', 'Domicilio',          'Medellín', 'Incidencia', 'HC-4788-52', '2025-09-21', 15800, 'Servientrega'),
('e6', 'p5', 'u3', 'u1', 'Domicilio',          'Medellín', 'Entregado',  'HC-4612-77', '2025-09-12', 10900, 'Envía');

INSERT INTO intercambios (id, prenda_id, ofrece_id, solicitante_id, receptor_id, estado, fecha, mensaje) VALUES
('x1', 'p4',  'p2',  'u2', 'u8', 'Pendiente',  '2025-10-04', 'Me encanta el abrigo. Te ofrezco el jean recto, está impecable y es tiro alto.'),
('x2', 'p9',  'p14', 'u7', 'u5', 'Aceptado',   '2025-10-01', 'El bolso es tan lindo que propongo un cambio justo.'),
('x3', 'p1',  'p7',  'u8', 'u1', 'Pendiente',  '2025-10-05', 'Cambio mi suéter de punto trenzado por la chaqueta biker.'),
('x4', 'p6',  'p13', 'u4', 'u3', 'Rechazado',  '2025-09-19', 'Te ofrezco la gabardina impermeable, casi nueva.'),
('x5', 'p11', 'p8',  'u1', 'u5', 'Completado', '2025-09-15', 'Busco denim claro, tengo la falda plisada disponible.'),
('x6', 'p13', 'p10', 'u2', 'u4', 'Completado', '2025-09-09', 'Necesito impermeable para Medellín. Te ofrezco la camisa de lino.'),
('x7', 'p7',  'p3',  'u5', 'u2', 'Pendiente',  '2025-10-06', 'Tengo un vestido de lino sin estrenar, ¿te interesa?');

INSERT INTO reportes (id, tipo, motivo, prenda_id, usuario_id, resena_id, pedido_id, estado, fecha) VALUES
('g1', 'Prenda', 'Descripción no coincide con el estado real', 'p5', 'u6', NULL, NULL, 'En revisión', '2025-08-31'),
('g2', 'Usuario', 'Canceló tres intercambios seguidos', NULL, 'u6', NULL, NULL, 'Resuelto',    '2025-09-04'),
('g3', 'Reseña', 'Lenguaje ofensivo en un comentario', NULL, NULL, 'r5', NULL, 'En revisión', '2025-09-30'),
('g4', 'Envío', 'Paquete sin movimiento durante cinco días', NULL, NULL, NULL, 'e5', 'En revisión', '2025-09-27');

INSERT INTO notificaciones (usuario_id, tipo, texto, fecha, destino) VALUES
('u1', 'solicitud', 'MATEO CARDENAS quiere intercambiar su jean por tu abrigo de paño.', 'Hace 20 min', '/intercambios'),
('u1', 'envio',     'Tu pedido HC-4821-90 salió a ruta en Medellín.', 'Hace 2 h', '/panel?seccion=envios'),
('u1', 'resena',    'Camila Duarte dejó una reseña de 5 estrellas en tu perfil.', 'Ayer', '/panel?seccion=resenas');
