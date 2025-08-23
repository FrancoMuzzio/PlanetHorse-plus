# 🚀 Plan de Migración a WXT Framework

## 🎯 Objetivo

Migrar el proyecto **PlanetHorse+ Chrome Extension** desde el build system manual (esbuild) a **WXT Framework**, manteniendo **100% de la funcionalidad actual** mientras se obtienen los beneficios de una herramienta de desarrollo moderna.

## 📊 Análisis de la Migración

### ✅ Lo que WXT REEMPLAZA (ya no será necesario):

- **`build.js`** → Auto-build integrado con Vite
- **`esbuild` dependency** → WXT usa Vite internamente (más potente)
- **Scripts de build personalizados** → CLI commands integrados
- **Manual asset copying** → Manejo automático de archivos
- **`manifest.json` manual** → Auto-generación basada en configuración

### ✅ Lo que se MANTIENE IGUAL:

- **Toda la lógica de negocio** (API, UI, State, Config)
- **Content scripts y background scripts** functionality
- **Chrome messaging API** y todas las características de la extensión
- **ZERO cambios** en el comportamiento de la extensión

### 🚀 Lo que MEJORA:

- **Hot Module Replacement (HMR)** para desarrollo ultra-rápido
- **Build system más robusto** (Vite es superior a esbuild)
- **TypeScript support opcional** sin configuración adicional
- **Mejor debugging** y developer experience
- **Cross-browser ready** para expansión futura
- **Automated publishing tools** integradas

## 📁 Estructura Actual vs WXT

### Estructura Actual:
```
planet-horse-extension/
├── manifest.json          # Manual
├── background.js           # Manual
├── build.js               # Custom esbuild
├── src/content/
│   ├── main.js            # Entry point
│   ├── api.js
│   ├── config.js
│   ├── ui.js
│   └── state.js
└── dist/                  # Build output
```

### Estructura WXT Target:
```
planet-horse-extension/
├── wxt.config.js          # WXT configuration
├── entrypoints/
│   ├── background.js      # Auto-detected
│   └── content.js         # Auto-detected
├── public/                # Static assets
│   └── icons/
├── src/content/           # Business logic (sin cambios)
│   ├── api.js
│   ├── config.js
│   ├── ui.js
│   └── state.js
└── .output/               # WXT build output
```

## 📋 Plan Paso a Paso (Tiempo estimado: ~2 horas)

### **Fase 1: Preparación (10 min)**

1. ✅ **Crear backup completo del proyecto actual**
   ```bash
   git add . && git commit -m "backup: antes de migración a WXT"
   ```

2. ✅ **Crear branch de migración**
   ```bash
   git checkout -b migrate-to-wxt
   ```

3. ✅ **Instalar WXT CLI globalmente**
   ```bash
   npm install -g wxt
   ```

### **Fase 2: Setup WXT Base (15 min)**

4. ✅ **Instalar WXT como dependency del proyecto**
   ```bash
   npm install --save-dev wxt
   ```

5. ✅ **Crear configuración base WXT (`wxt.config.js`)**
   - Configurar nombre, versión, permisos
   - Configurar estructura de archivos

6. ✅ **Crear directorios WXT**
   ```bash
   mkdir entrypoints
   mkdir public
   ```

### **Fase 3: Migración de Content Scripts (20 min)**

7. ✅ **Crear `entrypoints/content.js`**
   - Import de la lógica actual desde `src/content/main.js`
   - Configurar matches para `https://planethorse.io/game*`

8. ✅ **Verificar imports y paths**
   - Asegurar que todas las importaciones funcionen
   - Mantener la estructura modular actual

### **Fase 4: Migración Background Script (10 min)**

9. ✅ **Crear `entrypoints/background.js`**
   - Mover código actual de `background.js`
   - Adaptar para estructura WXT si es necesario

### **Fase 5: Configuración y Assets (20 min)**

10. ✅ **Mover assets a estructura WXT**
    ```bash
    mv icons public/icons
    ```

11. ✅ **Configurar manifest en `wxt.config.js`**
    - Host permissions: `https://exchange-rate.skymavis.com/*`
    - Content Security Policy
    - Icons y metadata

### **Fase 6: Package.json y Dependencies (10 min)**

12. ✅ **Actualizar scripts en `package.json`**
    ```json
    {
      "scripts": {
        "dev": "wxt",
        "build": "wxt build",
        "build:prod": "wxt build --mode production",
        "zip": "wxt zip"
      }
    }
    ```

13. ✅ **Limpiar dependencies**
    ```bash
    npm uninstall esbuild
    ```

### **Fase 7: Testing y Validation (20 min)**

14. ✅ **Build inicial con WXT**
    ```bash
    npm run build
    ```

15. ✅ **Testing completo de funcionalidades**
    - Cargar extensión en Chrome desde `.output/chrome-mv3`
    - Probar multi-currency conversion
    - Verificar API calls y sistema de caché
    - Probar dropdown selector y grid layout
    - Verificar DOM mutation observation
    - Confirmar comportamiento idéntico

16. ✅ **Comparar output vs versión anterior**
    - Verificar tamaños de bundle
    - Confirmar que no hay regresiones

### **Fase 8: Cleanup (10 min)**

17. ✅ **Remover archivos obsoletos**
    ```bash
    rm build.js
    rm manifest.json
    rm -rf dist/
    ```

18. ✅ **Actualizar documentación**
    - Actualizar `CLAUDE.md` con nueva estructura
    - Actualizar `.gitignore`

### **Fase 9: Development Workflow (5 min)**

19. ✅ **Probar development con HMR**
    ```bash
    npm run dev
    ```

20. ✅ **Documentar nuevos comandos**
    - Actualizar README con nueva información

## 🎮 Comandos Nuevos Post-Migración

```bash
# Development con HMR y auto-reload
npm run dev

# Build para producción
npm run build

# Build y crear ZIP para Chrome Web Store
npm run zip

# Build específico para diferentes browsers
npm run build -- --browser firefox
npm run build -- --browser edge
```

## ⚠️ Riesgos y Mitigaciones

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Pérdida de funcionalidad | **Baja** | Testing exhaustivo + backup completo |
| Problemas de compatibilidad | **Baja** | WXT diseñado para Manifest V3 |
| Curva de aprendizaje | **Media** | Documentación detallada + steps incrementales |
| Build issues | **Baja** | Rollback inmediato disponible |

## 🔄 Plan de Rollback

En caso de problemas críticos:
```bash
git checkout main
npm install
npm run build
```

## 📚 Recursos Adicionales

- **WXT Documentation**: https://wxt.dev/
- **WXT GitHub**: https://github.com/wxt-dev/wxt
- **Migration Guide**: https://wxt.dev/guide/migrate.html

## ✅ Criterios de Éxito

- [ ] La extensión funciona idénticamente a la versión anterior
- [ ] Todas las funcionalidades preservadas (API, UI, cache, etc.)
- [ ] Build time mejorado o igual
- [ ] Development experience mejorado con HMR
- [ ] Código más mantenible y futuro-proof
- [ ] Tests pasan sin regresiones

---

**Nota para el Developer**: Este plan está diseñado para ser ejecutado paso a paso. Cada fase debe completarse y validarse antes de proceder a la siguiente. El backup completo permite rollback inmediato en cualquier momento.