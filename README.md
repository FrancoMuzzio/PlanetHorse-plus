# PlanetHorse+

Una extensión de Chrome no oficial que muestra el valor en USD de tus tokens PH en tiempo real.

## Descripción

**PlanetHorse+** es una extensión de navegador que se integra de forma no invasiva con [PlanetHorse](https://planethorse.io) para mostrar automáticamente el valor equivalente en dólares estadounidenses de tus tokens PH. La extensión detecta tu balance actual y añade una conversión en tiempo real usando los precios oficiales de la API de SkyMavis.

### Características principales

- **Conversión automática a USD**: Muestra el valor de tus tokens PH en dólares
- **Actualización en tiempo real**: Se actualiza automáticamente cuando cambia tu balance
- **Integración no invasiva**: Se añade discretamente sin interferir con la UI original
- **Compatibilidad SPA**: Funciona perfectamente con la navegación del juego
- **Sin configuración**: Funciona inmediatamente después de la instalación

## Instalación

### Para desarrollo

1. **Clona el repositorio**:
   ```bash
   git clone [url-del-repositorio]
   cd planet-horse-extension
   ```

2. **Carga la extensión en Chrome**:
   - Ve a `chrome://extensions/`
   - Activa el "Modo de desarrollador"
   - Haz clic en "Cargar extensión sin empaquetar"
   - Selecciona la carpeta del proyecto

### Para uso normal

La extensión estará disponible en Chrome Web Store próximamente.

## Uso

1. **Instala la extensión** siguiendo los pasos anteriores
2. **Ve a PlanetHorse**: Navega a `https://planethorse.io/game`
3. **¡Listo!**: Verás automáticamente el valor en USD junto a tu balance de tokens PH

La extensión funciona automáticamente en todas las secciones del juego donde se muestre tu balance.

## Arquitectura técnica

```
planet-horse-extension/
├── manifest.json           # Configuración de la extensión (Manifest V3)
├── background.js           # Service Worker para peticiones HTTP
├── contentScript.js        # Orquestación principal
├── src/
│   ├── config.js          # Configuración y debug
│   ├── api.js             # Comunicación con la API
│   └── ui.js              # Manipulación del DOM
├── icons/                 # Iconos de la extensión
└── tests/                 # Suite de pruebas
```

### Stack tecnológico

- **JavaScript ES6+**: Sin dependencias externas
- **Chrome Extension Manifest V3**: Última versión de la plataforma
- **MutationObserver**: Detección de cambios en el DOM
- **Fetch API**: Comunicación HTTP segura
- **SkyMavis API**: Precios oficiales de tokens

## Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes, abre primero un issue para discutir los cambios propuestos.

### Proceso de contribución

1. Haz fork del repositorio
2. Crea una rama para tu feature: `git checkout -b feat/nueva-funcionalidad`
3. Realiza tus cambios siguiendo las convenciones del proyecto
4. Asegúrate de que todo funcione correctamente
5. Envía un pull request con una descripción detallada

### Convenciones

- **Ramas**: Usar [Conventional Branch](https://conventional-branch.github.io/)
- **Commits**: Usar [Conventional Commits](https://www.conventionalcommits.org/) en español
- **Pull Requests**: Seguir convenciones de Conventional Commits en español
- **Código**: Nombres de funciones y variables en inglés, comentarios en español

## Soporte

Si encuentras algún problema o tienes sugerencias:

- **Issues**: Reporta bugs o solicita nuevas características en GitHub Issues
- **Discussions**: Para preguntas generales y discusiones de la comunidad

Al reportar un issue, incluye:
- Versión de Chrome
- Sistema operativo
- Pasos para reproducir el problema
- Capturas de pantalla si es relevante

## Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Aviso legal

**Esta es una extensión NO OFICIAL** desarrollada por y para la comunidad. No está afiliada, respaldada o conectada con Sky Mavis o PlanetHorse de ninguna manera.

- PlanetHorse™ es una marca registrada de Sky Mavis
- Esta extensión se proporciona "tal como está" sin garantías
- Los usuarios instalan y usan la extensión bajo su propio riesgo

## Reconocimientos

- **Sky Mavis**: Por crear PlanetHorse y proporcionar la API de precios
- **Comunidad**: Por el feedback y las solicitudes de características
- **Contribuidores**: Por mejorar PlanetHorse+

---

**¡Mejora tu experiencia en PlanetHorse con herramientas desarrolladas por la comunidad!** 🐴💰
