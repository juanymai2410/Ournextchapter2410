# ournextchapter24.10

Invitación web para el casamiento de **Juan & Mai** — 24 de octubre de 2026, Los Cardales, Buenos Aires.

Sitio estático (HTML + CSS + JS, sin frameworks). Liviano, responsive y desplegable gratis en GitHub Pages o Netlify.

---

## Estructura de archivos

```
ournextchapter24.10/
├── index.html            Marcado de todas las secciones
├── css/
│   └── styles.css        Estilos + tokens de color/tipografía (variables CSS)
├── js/
│   └── main.js           Fade-in y (más adelante) copiar-al-portapapeles + lógica RSVP
├── assets/
│   ├── images/           TUS FOTOS van acá (ver assets/images/LEEME-fotos.txt)
│   └── icons/
│       └── olive-branch.svg
├── netlify.toml          Config Netlify (se ignora en GitHub Pages)
├── .nojekyll             Para GitHub Pages
└── README.md
```

## Paleta y tipografía (definidas en `css/styles.css`, sección "Tokens")

| Token            | Valor     | Uso                        |
|------------------|-----------|----------------------------|
| `--c-beige`      | `#F6F1E7` | Fondo principal            |
| `--c-beige-deep` | `#ECE3D2` | Fondo de secciones alternas|
| `--c-cream`      | `#FBF8F1` | Tarjetas / superficies     |
| `--c-green`      | `#3B4A3A` | Verde profundo — títulos   |
| `--c-green-soft` | `#5E6F58` | Verde medio — detalles     |
| `--c-olive`      | `#8A9A5B` | Olivo — acentos y hojas    |
| `--c-ink`        | `#20201D` | Texto principal            |

- **Nombres / portada:** `Parisienne` (manuscrita romántica)
- **Títulos de sección:** `Cormorant Garamond` (serif elegante)
- **Texto:** `Jost` (sans liviana)

Para cambiar un color, editá una sola línea en `:root` y se actualiza todo el sitio.

## Cómo reemplazar las fotos placeholder

1. Prepará las imágenes con los nombres exactos que figuran en
   [`assets/images/LEEME-fotos.txt`](assets/images/LEEME-fotos.txt).
2. Copiálas dentro de `assets/images/`.
3. Listo — el sitio ya las referencia por nombre. (La grilla de galería se
   arma en la próxima iteración; ahí quedan marcados los huecos.)

## Desarrollo local

No necesita build. Abrí `index.html` en el navegador, o levantá un server simple:

```bash
npx serve ournextchapter24.10
```

## Hosting (definido)

**Netlify + dominio propio.** Se usa Netlify Forms para el RSVP (aviso por email, sin backend).
El código queda igual preparado para GitHub Pages + Formspree por si hiciera falta cambiar.
Costo estimado: dominio ~USD 12-15/año; hosting gratis (plan Free). Contraseña para todo el
sitio = plan Pro de Netlify (~USD 19/mes), opcional.

## RSVP — a dónde llegan las confirmaciones

La configuración está arriba de todo en `js/main.js`:

```js
var RSVP_CONFIG = {
  provider: "netlify",              // "netlify" o "formspree"
  formspreeId: "TU_ID_DE_FORMSPREE"
};
```

Hay **dos formularios**: `rsvp` (confirmación de asistencia) y `cancion` (sugerir tema).
Los dos usan el mismo `RSVP_CONFIG`.

- **Netlify** (opción por defecto): no hay que hacer nada. Al desplegar, Netlify detecta
  los `<form data-netlify="true">` (`rsvp` y `cancion`) y guarda cada respuesta en el panel
  *Forms* del sitio, en listas separadas. Para que además llegue un **email**: Netlify →
  Site settings → Forms → Form notifications → agregar la casilla de Juan/Mai (para cada form).
- **GitHub Pages** (o cualquier hosting sin backend): crear una cuenta gratis en
  [formspree.io](https://formspree.io), crear un form, y pegar su ID en `formspreeId` y
  poner `provider: "formspree"`. Las respuestas llegan por email.
- Límites de los planes gratis: Netlify ~100 envíos/mes, Formspree ~50/mes. Si esperás más
  invitados, conviene el plan pago (barato) del que uses.

## Estado

- [x] Estructura + paleta multi-verde + crema + dorado
- [x] Portada: foto full-bleed con filtro verde + transición ondulada hacia la sección siguiente
- [x] Cuenta regresiva (círculo "Falta" con marco dorado doble + ramos)
- [x] Formato MODAL reutilizable (marco dorado + ramos + badge, inyectados por `main.js`)
- [x] Cuándo y dónde → tarjeta + modal "Cómo llegar" con Google Maps embebido
- [x] Código de vestimenta → tarjeta + modal
- [x] Música → tarjeta + modal para sugerir canciones (form `cancion`)
- [x] Galería → carrusel polaroid infinito (8 fotos, optimizadas)
- [x] Regalos → modal con datos bancarios y copiar-al-portapapeles
- [x] RSVP → tarjeta + modal con formulario progresivo (Netlify Forms / Formspree)
- [x] Parallax suave en los ramos al hacer scroll
- [ ] Extender las olas/transiciones al resto de los bordes de sección
- [ ] Deploy (elegir dominio, apuntarlo, publicar)

## Dónde van las fotos y la música

- Galería: `assets/images/couple-01.jpg` … `couple-09.jpg` (sin la 07).
- Portada: `assets/images/hero-bg.jpg` (horizontal).
- Música: `assets/audio/song.mp3` (MP3 — ver `assets/audio/LEEME.txt`).
- Mientras un archivo no esté, se ve un marcador; nada se rompe.
