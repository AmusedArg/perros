CREATE DATABASE  IF NOT EXISTS `perros` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_spanish_ci */;
USE `perros`;

CREATE TABLE `tipo_perro` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(50) COLLATE utf8_spanish_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

CREATE TABLE `perros` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8_spanish_ci DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `tel_contacto` varchar(20) COLLATE utf8_spanish_ci DEFAULT NULL,
  `foto` varchar(500) COLLATE utf8_spanish_ci DEFAULT NULL,
  `favorito` tinyint(1) NOT NULL DEFAULT '0',
  `lugar` varchar(100) COLLATE utf8_spanish_ci DEFAULT NULL,
  `raza` varchar(100) COLLATE utf8_spanish_ci DEFAULT NULL,
  `sexo` varchar(15) COLLATE utf8_spanish_ci DEFAULT NULL,
  `duenio` varchar(150) COLLATE utf8_spanish_ci DEFAULT NULL,
  `has_collar` tinyint(1) NOT NULL DEFAULT '0',
  `collar_detalle` varchar(50) COLLATE utf8_spanish_ci DEFAULT NULL,
  `collar_color` varchar(7) COLLATE utf8_spanish_ci DEFAULT NULL,
  `eliminado` tinyint(1) NOT NULL DEFAULT '0',
  `tags` varchar(256) COLLATE utf8_spanish_ci DEFAULT NULL,
  `link_sitio` text COLLATE utf8_spanish_ci,
  `tipo_perro_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_perros_tipo_perro_idx` (`tipo_perro_id`),
  CONSTRAINT `fk_perros_tipo_perro` FOREIGN KEY (`tipo_perro_id`) REFERENCES `tipo_perro` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

INSERT INTO `perros`.`tipo_perro` (`id`, `descripcion`) VALUES ('1', 'avistados'), ('2', 'encontrados'), ('3', 'perdidos');