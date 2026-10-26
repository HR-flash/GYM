# HR GYM

Sitio de demostración para una cadena de gimnasios: página de inicio, registro con pago simulado, portal del alumno y portal del empleado (administrador y normal).

## Estructura

```
index.html       Sitio principal: inicio, acceso, portal del alumno y portal del empleado
kiosko.html      Kiosko del gimnasio: Planes e Iniciar sesión del alumno
css/styles.css   Estilos compartidos
css/kiosko.css   Ajustes táctiles del kiosko
js/app.js        Datos de ejemplo, vistas y lógica del sitio principal
js/kiosko.js     Lógica del kiosko
js/chatbot.js    Asistente de dudas e inscripción (sitio principal)
css/chatbot.css  Estilos del asistente
```

## Asistente (chatbot)

El botón "¿Dudas?" de la esquina de `index.html` abre un asistente que:

- responde preguntas sobre planes, precios, sedes, horarios, servicios y preguntas frecuentes;
- guía la inscripción: pide plan, nombre, correo y teléfono, y abre el formulario de "Crear cuenta" con esos datos puestos (la sede, la contraseña y el pago se completan ahí);
- deja una duda para el equipo (se guarda en el navegador, clave `hrgym.demo.dudas`; no se envía ningún correo).

Es un asistente por reglas, no usa inteligencia artificial ni servidor. Lee los planes, servicios, sedes y preguntas frecuentes de la propia página, así que sus respuestas siguen lo que edites en `index.html` y `js/app.js`. Para respuestas libres con IA o para que las dudas lleguen de verdad al equipo hace falta un servidor.

## Kiosko

`kiosko.html` es la pantalla táctil de la sucursal. Tiene dos apartados:

- **Planes:** muestra White, Grey y Black, se elige uno, se registra el alumno, paga con tarjeta (simulado) y recibe su número de socio por correo (simulado).
- **Iniciar sesión:** pide solo número de socio y contraseña, y muestra tres cosas: invitados Black (solo si el plan es Black), método de pago (cambiar tarjeta) y cancelación de plan.

La pantalla vuelve al inicio tras 60 segundos sin actividad. La sede del kiosko se elige con la dirección, por ejemplo `kiosko.html?sede=Coyoacán` (por defecto, Polanco).

El kiosko y el sitio principal comparten los mismos datos de demostración, siempre que se abran desde el mismo sitio o servidor. Un socio inscrito en el kiosko puede entrar al portal web, y al revés. Los datos de ejemplo (`PLANS` y `seed`) están copiados en `js/kiosko.js`: si los cambias en `js/app.js`, cámbialos también allá.

## Cómo abrirlo

Abre `index.html` (o `kiosko.html`) en el navegador, o sirve la carpeta con cualquier servidor estático:

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
