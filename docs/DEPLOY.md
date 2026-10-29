# Publicar Algoria (Vercel + Judge0)

La web y la API se publican juntas en **Vercel**. El código de los jugadores **no** se ejecuta en Vercel:
la API lo envía a **Judge0**, que ejecuta cada envío en un entorno aislado.

```
navegador ──► Vercel: web estática  (apps/web)
          └─► Vercel: /api/run, /api/health  (función serverless con apps/api)
                         └─► Judge0  (compila y ejecuta Python / C++ / Java)
```

Los tests ocultos de cada problema viven solo en la función de la API; el navegador nunca los recibe.

## 1. Conseguir acceso a Judge0

Tienes dos caminos; el código funciona con los dos y solo cambian las variables de entorno.

**A. Judge0 CE en RapidAPI (lo más rápido)**

1. Crea una cuenta en https://rapidapi.com y suscríbete a la API **Judge0 CE**.
2. Copia tu clave (`X-RapidAPI-Key`).
3. Variables:
   - `JUDGE0_URL` = `https://judge0-ce.p.rapidapi.com`
   - `JUDGE0_KEY` = tu clave

> **Ojo con la cuota.** Cada test de un problema cuenta como un envío a Judge0: un "ENVIAR" de un problema
> con 10 tests gasta 10 envíos, y "EJECUTAR" (solo ejemplos) gasta 2. Los planes gratuitos dan para probar
> con pocas personas; para una clase o un público amplio necesitarás un plan de pago o la opción B.
> Revisa la cuota del plan en la página de la API antes de compartir el enlace.

**B. Judge0 propio (sin límite de envíos, ~5–6 USD/mes)**

En un servidor Linux con Docker, sigue la guía oficial de instalación de Judge0 CE
(https://github.com/judge0/judge0) y define un `AUTHN_TOKEN` en su configuración. Luego:

- `JUDGE0_URL` = `https://tu-servidor-judge0`
- `JUDGE0_KEY` = el `AUTHN_TOKEN`

## 2. Publicar en Vercel

1. Entra en https://vercel.com con tu cuenta de GitHub.
2. **Add New → Project** e importa el repositorio `algoria`.
3. Deja **Root Directory** en la raíz del repositorio. El resto ya lo define `vercel.json`
   (instala con `npm install` y construye con `npm run build:vercel`).
4. En **Environment Variables** añade `JUDGE0_URL` y `JUDGE0_KEY` (paso 1).
5. **Deploy**.

Cada `git push` a `main` vuelve a publicar automáticamente.

## 3. Comprobar que funciona

1. Abre `https://<tu-proyecto>.vercel.app/api/health`. Debe responder `"ok": true` y, en `compilers`,
   las versiones de Judge0 para `python`, `cpp` y `java` con `"ok": true`.
2. Abre la web, elige compañero, habla con Leo y gana su duelo.

Si algo falla, en Vercel ve a **Project → Logs** para ver los errores de la función.

## Variables opcionales

| Variable | Para qué |
| --- | --- |
| `JUDGE0_AUTH` | `rapidapi` o `token` si la detección automática no acierta |
| `JUDGE0_LANG_PYTHON`, `JUDGE0_LANG_CPP`, `JUDGE0_LANG_JAVA` | Fijar el id de lenguaje de Judge0 (por defecto se elige la versión más moderna disponible) |

## Probar el paquete en local

```bash
npm run build:vercel
node scripts/smoke-vercel.mjs
```

Sin `JUDGE0_URL` la prueba usa los compiladores de tu PC; con ella, Judge0.

## Lo que guarda cada jugador

El progreso, los borradores de código, los ajustes de audio y el récord del Coliseo se guardan en el
navegador de cada jugador (`localStorage`). No hay cuentas ni base de datos: si alguien cambia de
navegador o borra los datos del sitio, empieza de cero.
