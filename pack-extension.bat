@echo off
echo Creando ZIP para Chrome Web Store...
cd dist
"C:\Program Files\WinRAR\WinRAR.exe" a -afzip -ep1 ..\planethorse-extension.zip *
cd ..
echo.
echo ✅ ZIP creado: planethorse-extension.zip
echo Listo para subir a Chrome Web Store!
pause