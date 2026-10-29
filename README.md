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

Etapas jugables:

1. **Pueblo Semilla** (Nv 1–10): fundamentos del lenguaje.
2. **Bosque Iterador** (Nv 11–20): arreglos, strings, matrices, sumas acumuladas, ventana deslizante y frecuencias; primer contacto con la eficiencia (Big-O).
3. **Cueva Recursiva** (Nv 21–30): recursión, backtracking, ordenamiento, búsqueda binaria y dos punteros.
4. **Puerto Estructura** (Nv 31–40): pilas, colas, mapas, sets, colas de prioridad y deque.
5. **Montaña Grafo** (Nv 41–50): BFS, DFS, orden topológico, Dijkstra, Union-Find y Kruskal.
6. **Torre Dinámica** (Nv 51–60): programación dinámica.
7. **Coliseo**: torneo contrarreloj de 30 minutos con 5 problemas al azar; se abre al vencer el último gimnasio.

## Publicar

Ver [docs/DEPLOY.md](docs/DEPLOY.md): la web y la API en Vercel, y el código de los jugadores
ejecutándose aislado en Judge0. En local, sin `JUDGE0_URL`, el juez usa los compiladores de tu PC
(no expongas ese modo a internet).
