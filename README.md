# HR GYM

Sitio de demostración para una cadena de gimnasios: página de inicio, registro con pago simulado, portal del alumno y portal del empleado (administrador y normal).

## Estructura

```
index.html      Estructura de la página (inicio y contenedores de las demás vistas)
css/styles.css  Estilos
js/app.js       Datos de ejemplo, vistas y lógica (JavaScript sin dependencias propias)
```

## Cómo abrirlo

Abre `index.html` en el navegador, o sirve la carpeta con cualquier servidor estático:

```
python3 -m http.server 8000
```

y entra a http://localhost:8000.

## Dependencias externas

- Fuentes: Figtree, Lora y Syncopate desde Google Fonts.
- Códigos QR del spa: `qrcode-generator` 1.4.4 desde cdnjs. Si no carga, el resto del sitio funciona y el QR muestra un aviso.

Para tener la librería QR dentro del repo:

```
mkdir -p js/vendor
curl -L https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js -o js/vendor/qrcode.min.js
```

y cambia el `<script src>` de `index.html` a `js/vendor/qrcode.min.js`.

## Cuentas de muestra

| Tipo | Número | Contraseña |
| --- | --- | --- |
| Alumno Black | HR100231 | ana12345 |
| Alumno con acceso bloqueado | HR100312 | mariana1 |
| Alumno White | HR100418 | diego123 |
| Empleado administrador | ADM-001 | admin123 |
| Empleado | EMP-014 | empleado123 |

## Alcance de la demostración

- El pago y el correo con el número de socio son simulados: no se cobra nada ni se envían mensajes. Solo se conserva la terminación de la tarjeta.
- Los datos se guardan en el `localStorage` del navegador (clave `hrgym.demo.v2`), no en un servidor. Para borrarlos, limpia los datos del sitio.
- Las contraseñas de muestra viven en `js/app.js`. Para uso real hacen falta servidor, base de datos, autenticación segura, pasarela de pago y servicio de correo.

## Planes

| Plan | Precio mensual |
| --- | --- |
| White | $399 |
| Grey | $649 |
| Black | $999 |

Los precios, los horarios y las direcciones de las sedes son ejemplos. Se editan en las constantes `PLANS`, `SERVICIOS` y `SEDES` al inicio de `js/app.js`.
