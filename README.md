# Algoria · Code Quest

Aprende programación competitiva recorriendo un mundo pixel-art al estilo Game Boy.
Cada problema es un personaje: hablas con él, te enseña un concepto y te reta a un duelo de código.
Disponible en **Python**, **C++** y **Java**.

## Requisitos

- Node.js 20 o superior
- Python 3 (`python` en el PATH)
- g++ con soporte C++17 (en Windows, MSYS2 UCRT64)
- JDK 17 o superior (`javac` y `java` en el PATH)

Las rutas de los compiladores se pueden cambiar con las variables de entorno
`ALGORIA_PYTHON`, `ALGORIA_GXX`, `ALGORIA_JAVAC` y `ALGORIA_JAVA`.

## Puesta en marcha

```bash
npm install
npm run dev
```

- Juego: http://localhost:5180
- API del juez: http://localhost:8787 (`GET /api/health` muestra qué compiladores detecta)

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Levanta la API y la web a la vez |
| `npm run typecheck` | Comprueba tipos en todos los paquetes |
| `npm test` | Ejecuta todos los tests |
| `npm run verify:content` | Valida los niveles y comprueba que cada solución de referencia pasa sus tests en los 3 lenguajes |
| `npm run build` | Compila la web para producción |

## Estructura

Ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Los bocetos de diseño originales están en `design/`.

## Estado

MVP de la Etapa 1, **Pueblo Semilla** (niveles 1–10: fundamentos del lenguaje).

> El juez ejecuta el código directamente en la máquina: sirve para desarrollo local,
> pero **no debe exponerse a internet** sin aislarlo antes (ver docs/ARCHITECTURE.md).
