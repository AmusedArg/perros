/** 2017-04-09 - Mejora collares **/
ALTER TABLE `perros` ADD `has_collar` BOOLEAN NOT NULL DEFAULT FALSE AFTER `duenio`, ADD `collar_detalle` VARCHAR(50) NULL AFTER `has_collar`;
ALTER TABLE `perros` ADD `collar_color` VARCHAR(7) NULL DEFAULT NULL AFTER `collar_detalle`;