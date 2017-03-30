# Perros

## Creacion de la estructura de la base de datos
Ejecutar el script SQL del archivo: schema.sql

## Archivo config.properties
Copiar y reenombrar config.properties.dist -> config.properties

## Archivo index.html
Copiar y reenombrar public/index.html.dist -> public/index.html

## Pushing versions
npm run version:major -- -m "Some message to commit"
npm run version:minor -- -m "Some message to commit"
npm run version:patch -- -m "Some message to commit"