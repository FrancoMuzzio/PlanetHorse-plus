@echo off
echo Creando ZIP para Chrome Web Store...
echo Excluyendo content.js.map...
"C:\Program Files\WinRAR\WinRAR.exe" a -afzip -r -ep1 -xcontent.js.map planethorse-extension.zip dist\*
echo.
echo ✅ ZIP creado: planethorse-extension.zip
echo Listo para subir a Chrome Web Store!
pause