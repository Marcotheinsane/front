![License](https://img.shields.io/badge/license-MIT-blue)

# Frontend – Vue 3

Este repositorio contiene el frontend de la aplicación, desarrollado como un proyecto
independiente y desacoplado del backend. La aplicación está construida con Vue 3 y Vite,
siguiendo principios de separación de responsabilidades y comunicación mediante API REST.

El objetivo de este repositorio es concentrar exclusivamente la lógica de presentación,
la experiencia de usuario y la interacción con servicios externos expuestos por el backend.

## Alcance del proyecto

Este frontend se encarga de:
- Renderizar la interfaz de usuario
- Gestionar el estado de la aplicación en el cliente
- Realizar peticiones HTTP hacia una API externa
- Manejar validaciones del lado del cliente
- Representar respuestas y errores provenientes del backend

Quedan fuera del alcance de este repositorio:
- Lógica de negocio
- Persistencia de datos
- Autenticación a nivel servidor
- Reglas de dominio

## Arquitectura

El proyecto sigue un enfoque de frontend desacoplado, donde la aplicación cliente
consume servicios expuestos por un backend independiente.

La comunicación se realiza a través de HTTP utilizando endpoints REST, permitiendo
un desarrollo, despliegue y versionado independiente entre frontend y backend.

Este enfoque facilita:
- Mantenibilidad del código
- Escalabilidad del sistema
- Reutilización del backend por otros clientes
- Independencia tecnológica entre capas

## Tecnologías utilizadas

- Vue 3
- Vite
- JavaScript (ES6+)
- HTML5
- CSS

Las dependencias y scripts se gestionan mediante npm.

## Estructura del proyecto

```txt
src/
 ├─ components/   Componentes reutilizables de la interfaz
 ├─ pages/        Vistas principales de la aplicación
 ├─ services/     Lógica de comunicación con la API
 ├─ hooks/        Lógica reutilizable del cliente
 ├─ styles/       Estilos globales
 └─ main.js       Punto de entrada de la aplicación
Configuración del entorno

Antes de ejecutar el proyecto, asegúrese de tener instalado:

Node.js (versión recomendada LTS)

npm

Las variables de entorno se gestionan mediante archivos .env, los cuales no se incluyen
en el repositorio por motivos de seguridad.

Instalación

Clonar el repositorio e instalar dependencias:

npm install
Ejecución en entorno de desarrollo

Para levantar el servidor de desarrollo con recarga en caliente:

npm run dev

La aplicación estará disponible en el puerto configurado por Vite.

Build de producción

Para generar los archivos optimizados para producción:

npm run build

El resultado se genera en el directorio dist/.

Integración con backend

Este frontend está diseñado para consumir un backend ubicado en un repositorio separado.
La URL base del backend se configura mediante variables de entorno.

Este diseño permite cambiar el backend sin modificar la lógica interna del frontend,
siempre que se mantenga el contrato de la API.

Estándares y buenas prácticas

Separación clara entre vistas, componentes y servicios

Código modular y reutilizable

Uso de convenciones consistentes de nombres

Evitar lógica de negocio en el cliente

Manejo explícito de errores provenientes de la API
