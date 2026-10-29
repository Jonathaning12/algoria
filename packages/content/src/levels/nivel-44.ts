import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const glaciar = (g: string[]): [string, string] => {
  const R = g.length;
  const C = g[0]!.length;
  const dist = new Int32Array(R * C).fill(-1);
  let s = -1;
  let e = -1;
  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      if (g[i]![j] === 'S') s = i * C + j;
      if (g[i]![j] === 'E') e = i * C + j;
    }
  }
  dist[s] = 0;
  const cola = new Int32Array(R * C);
  let ini = 0;
  let fin = 0;
  cola[fin++] = s;
  while (ini < fin) {
    const u = cola[ini++]!;
    const i = Math.floor(u / C);
    const j = u % C;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const ni = i + di;
      const nj = j + dj;
      if (ni < 0 || nj < 0 || ni >= R || nj >= C || g[ni]![nj] === '#') continue;
      const v = ni * C + nj;
      if (dist[v] !== -1) continue;
      dist[v] = dist[u]! + 1;
      cola[fin++] = v;
    }
  }
  return [`${R} ${C}\n${g.join('\n')}`, `${dist[e]}`];
};

const r = rng(4444);
const poner = (g: string[][], i: number, j: number, c: string) => {
  g[i]![j] = c;
};
/** Hielo con grietas al azar; S y E en casillas distintas. */
const aleatorio = (R: number, C: number, pct: number, s: [number, number], e: [number, number]): string[] => {
  const g = Array.from({ length: R }, () => Array.from({ length: C }, () => (r(1, 100) <= pct ? '#' : '.')));
  poner(g, s[0], s[1], 'S');
  poner(g, e[0], e[1], 'E');
  return g.map((f) => f.join(''));
};
/** Zigzag: filas libres separadas por filas de grietas con un hueco alternado. */
const zigzag = (R: number, C: number): string[] => {
  const g = Array.from({ length: R }, (_, i) =>
    Array.from({ length: C }, (_, j) => (i % 2 === 0 ? '.' : (i % 4 === 1 ? j === C - 1 : j === 0) ? '.' : '#')),
  );
  poner(g, 0, 0, 'S');
  poner(g, R - 1, (R - 2) % 4 === 1 ? 0 : C - 1, 'E');
  return g.map((f) => f.join(''));
};
const abierto = (R: number, C: number): string[] => {
  const g = Array.from({ length: R }, () => Array.from({ length: C }, () => '.'));
  poner(g, 0, 0, 'S');
  poner(g, R - 1, C - 1, 'E');
  return g.map((f) => f.join(''));
};
/** La salida queda encerrada por grietas en medio de un campo abierto. */
const encerrado = (R: number, C: number): string[] => {
  const g = Array.from({ length: R }, () => Array.from({ length: C }, () => '.'));
  const ei = Math.floor(R / 2);
  const ej = Math.floor(C / 2);
  for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) poner(g, ei + di!, ej + dj!, '#');
  poner(g, 0, 0, 'S');
  poner(g, ei, ej, 'E');
  return g.map((f) => f.join(''));
};

export const nivel44: Level = {
  number: 44,
  id: 'n44-bfs-cuadricula',
  title: 'BFS en cuadrícula',
  topic: 'Grafos: laberintos',
  npc: { id: 'neva', name: 'NEVA', title: 'Exploradora del glaciar', sprite: 'npc44', x: 9, y: 4 },
  greeting: 'Hielo, grieta, hielo, grieta... Este glaciar es un tablero gigante.',
  intro: [
    { speaker: 'NEVA', text: '¡Hola! Soy Neva y exploro el glaciar. Bueno, intento salir de él.' },
    { speaker: 'NEVA', text: 'El hielo está lleno de grietas. Solo puedo moverme arriba, abajo, izquierda o derecha.' },
    { speaker: 'NEVA', text: 'Nima me dijo que esto también es un grafo: cada casilla es un nodo y sus vecinas son las de al lado.' },
    { speaker: 'NEVA', text: '¿Me ayudas a entender cómo recorrer una cuadrícula o saltamos al duelo?' },
  ],
  lesson: {
    concept: 'BFS EN CUADRÍCULA',
    goals: ['Ver una cuadrícula como un grafo implícito', 'Moverse en 4 direcciones con dos arreglos dr y dc', 'Revisar los bordes antes de mirar una casilla'],
    explanation:
      'En una cuadrícula no hace falta construir listas de adyacencia: los vecinos de (i, j) son (i+1, j), (i-1, j), (i, j+1) e (i, j-1). ' +
      'Guárdalos en dos arreglos, dr = [1, -1, 0, 0] y dc = [0, 0, 1, -1], y recórrelos con un bucle. ' +
      'Antes de mirar una vecina, comprueba que esté dentro del tablero y que no sea una pared. ' +
      'Con eso, el BFS de Nima funciona igual: una cola de casillas y un arreglo de distancias.',
    code: {
      python: code`
        import sys
        from collections import deque
        input = sys.stdin.readline

        r, c = map(int, input().split())
        g = [input().strip() for _ in range(r)]
        visto = [[False] * c for _ in range(r)]
        visto[0][0] = True
        cola = deque([(0, 0)])
        total = 0
        dr = [1, -1, 0, 0]
        dc = [0, 0, 1, -1]
        while cola:
            i, j = cola.popleft()
            total += 1
            for k in range(4):
                ni, nj = i + dr[k], j + dc[k]
                if 0 <= ni < r and 0 <= nj < c and g[ni][nj] != '#' and not visto[ni][nj]:
                    visto[ni][nj] = True
                    cola.append((ni, nj))
        print(total)
      `,
      cpp: code`
        #include <iostream>
        #include <queue>
        #include <string>
        #include <vector>
        using namespace std;

        int main() {
            int r, c;
            cin >> r >> c;
            vector<string> g(r);
            for (auto& fila : g) cin >> fila;
            vector<vector<bool>> visto(r, vector<bool>(c, false));
            queue<pair<int, int>> cola;
            visto[0][0] = true;
            cola.push({0, 0});
            int total = 0;
            int dr[] = {1, -1, 0, 0};
            int dc[] = {0, 0, 1, -1};
            while (!cola.empty()) {
                auto [i, j] = cola.front();
                cola.pop();
                total++;
                for (int k = 0; k < 4; k++) {
                    int ni = i + dr[k], nj = j + dc[k];
                    if (ni >= 0 && ni < r && nj >= 0 && nj < c && g[ni][nj] != '#' && !visto[ni][nj]) {
                        visto[ni][nj] = true;
                        cola.push({ni, nj});
                    }
                }
            }
            cout << total << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayDeque;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int r = Integer.parseInt(st.nextToken());
                int c = Integer.parseInt(st.nextToken());
                char[][] g = new char[r][];
                for (int i = 0; i < r; i++) g[i] = br.readLine().trim().toCharArray();
                boolean[][] visto = new boolean[r][c];
                ArrayDeque<int[]> cola = new ArrayDeque<>();
                visto[0][0] = true;
                cola.add(new int[] {0, 0});
                int total = 0;
                int[] dr = {1, -1, 0, 0};
                int[] dc = {0, 0, 1, -1};
                while (!cola.isEmpty()) {
                    int[] p = cola.poll();
                    total++;
                    for (int k = 0; k < 4; k++) {
                        int ni = p[0] + dr[k], nj = p[1] + dc[k];
                        if (ni >= 0 && ni < r && nj >= 0 && nj < c && g[ni][nj] != '#' && !visto[ni][nj]) {
                            visto[ni][nj] = true;
                            cola.add(new int[] {ni, nj});
                        }
                    }
                }
                System.out.println(total);
            }
        }
      `,
    },
    examples: [
      { input: '3 3\n..#\n.#.\n...', output: '7' },
      { input: '2 2\n.#\n#.', output: '1' },
      { input: '1 4\n....', output: '4' },
    ],
    tips: {
      python: 'Guarda cada casilla como una tupla (i, j) en la deque. Comprueba los bordes ANTES de leer g[ni][nj]: en Python g[-1] no falla, ¡lee la última fila!',
      cpp: 'Comprueba los bordes antes de acceder a g[ni][nj]: fuera del tablero el comportamiento es indefinido. Un queue<pair<int, int>> guarda las casillas.',
      java: 'Comprueba los bordes antes de acceder a g[ni][nj] o tendrás ArrayIndexOutOfBoundsException. Guarda casillas como int[] {i, j}.',
    },
    quiz: {
      question: '¿Cuántas vecinas válidas tiene la esquina (0, 0) de un tablero de 3 × 3?',
      code: {
        python: code`
          r, c = 3, 3
          dr = [1, -1, 0, 0]
          dc = [0, 0, 1, -1]
          i, j = 0, 0
          validas = 0
          for k in range(4):
              ni, nj = i + dr[k], j + dc[k]
              if 0 <= ni < r and 0 <= nj < c:
                  validas += 1
          print(validas)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              int r = 3, c = 3;
              int dr[] = {1, -1, 0, 0};
              int dc[] = {0, 0, 1, -1};
              int i = 0, j = 0, validas = 0;
              for (int k = 0; k < 4; k++) {
                  int ni = i + dr[k], nj = j + dc[k];
                  if (ni >= 0 && ni < r && nj >= 0 && nj < c) validas++;
              }
              cout << validas << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  int r = 3, c = 3;
                  int[] dr = {1, -1, 0, 0};
                  int[] dc = {0, 0, 1, -1};
                  int i = 0, j = 0, validas = 0;
                  for (int k = 0; k < 4; k++) {
                      int ni = i + dr[k], nj = j + dc[k];
                      if (ni >= 0 && ni < r && nj >= 0 && nj < c) validas++;
                  }
                  System.out.println(validas);
              }
          }
        `,
      },
      options: ['2', '3', '4'],
      answer: 0,
      explanation: 'Desde una esquina solo puedes ir abajo y a la derecha: arriba e izquierda se salen del tablero.',
      wrongHint: 'Prueba las cuatro direcciones a mano: ¿cuáles dan una fila o columna negativa?',
    },
  },
  problem: {
    id: 'p44-glaciar-de-neva',
    title: 'EL GLACIAR DE NEVA',
    statement:
      'El glaciar es una cuadrícula de R filas y C columnas. "." es hielo firme, "#" es una grieta, ' +
      '"S" es donde está Neva y "E" es la salida. Neva puede moverse a la casilla de arriba, abajo, izquierda o derecha, ' +
      'sin salir del glaciar y sin pisar grietas. ¿Cuántos pasos necesita, como mínimo, para llegar a la salida? Si no puede, imprime -1.',
    inputSpec: 'Línea 1: R y C. Siguientes R líneas: C caracteres cada una ("." "#" "S" "E"). Hay exactamente una S y una E.',
    outputSpec: 'Un entero: la menor cantidad de pasos de S a E, o -1 si no se puede llegar.',
    constraints: '1 ≤ R, C ≤ 400 · R·C ≥ 2',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      glaciar(['S..#', '.#..', '...E']),
      glaciar(['S#.', '##.', '..E']),
      glaciar(['SE']),
      glaciar(['E', '#', 'S', '.']),
      glaciar(aleatorio(400, 400, 30, [0, 0], [399, 399])),
      glaciar(zigzag(399, 400)),
      glaciar(abierto(400, 400)),
      glaciar(aleatorio(300, 400, 42, [150, 7], [20, 380])),
      glaciar(encerrado(400, 400)),
    ]),
    starter: {
      python: code`
        import sys
        from collections import deque
        input = sys.stdin.readline

        r, c = map(int, input().split())
        g = [input().strip() for _ in range(r)]
        for i in range(r):
            if 'S' in g[i]:
                si, sj = i, g[i].index('S')
            if 'E' in g[i]:
                ei, ej = i, g[i].index('E')
        dist = [[-1] * c for _ in range(r)]
        dist[si][sj] = 0
        cola = deque([(si, sj)])
        # TODO: BFS en 4 direcciones; no salgas del glaciar ni pises "#"
        print(dist[ei][ej])
      `,
      cpp: code`
        #include <iostream>
        #include <queue>
        #include <string>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int r, c;
            cin >> r >> c;
            vector<string> g(r);
            for (auto& fila : g) cin >> fila;
            int si = 0, sj = 0, ei = 0, ej = 0;
            for (int i = 0; i < r; i++) {
                for (int j = 0; j < c; j++) {
                    if (g[i][j] == 'S') si = i, sj = j;
                    if (g[i][j] == 'E') ei = i, ej = j;
                }
            }
            vector<vector<int>> dist(r, vector<int>(c, -1));
            queue<pair<int, int>> cola;
            dist[si][sj] = 0;
            cola.push({si, sj});
            // TODO: BFS en 4 direcciones; no salgas del glaciar ni pises '#'
            cout << dist[ei][ej] << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayDeque;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int r = Integer.parseInt(st.nextToken());
                int c = Integer.parseInt(st.nextToken());
                char[][] g = new char[r][];
                int si = 0, sj = 0, ei = 0, ej = 0;
                for (int i = 0; i < r; i++) {
                    g[i] = br.readLine().trim().toCharArray();
                    for (int j = 0; j < c; j++) {
                        if (g[i][j] == 'S') { si = i; sj = j; }
                        if (g[i][j] == 'E') { ei = i; ej = j; }
                    }
                }
                int[][] dist = new int[r][c];
                for (int[] fila : dist) java.util.Arrays.fill(fila, -1);
                ArrayDeque<int[]> cola = new ArrayDeque<>();
                dist[si][sj] = 0;
                cola.add(new int[] {si, sj});
                // TODO: BFS en 4 direcciones; no salgas del glaciar ni pises '#'
                System.out.println(dist[ei][ej]);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        from collections import deque
        input = sys.stdin.readline

        r, c = map(int, input().split())
        g = [input().strip() for _ in range(r)]
        for i in range(r):
            if 'S' in g[i]:
                si, sj = i, g[i].index('S')
            if 'E' in g[i]:
                ei, ej = i, g[i].index('E')
        dist = [[-1] * c for _ in range(r)]
        dist[si][sj] = 0
        cola = deque([(si, sj)])
        while cola:
            i, j = cola.popleft()
            if i == ei and j == ej:
                break
            d = dist[i][j] + 1
            for ni, nj in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
                if 0 <= ni < r and 0 <= nj < c and dist[ni][nj] == -1 and g[ni][nj] != '#':
                    dist[ni][nj] = d
                    cola.append((ni, nj))
        print(dist[ei][ej])
      `,
      cpp: code`
        #include <iostream>
        #include <queue>
        #include <string>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int r, c;
            cin >> r >> c;
            vector<string> g(r);
            for (auto& fila : g) cin >> fila;
            int si = 0, sj = 0, ei = 0, ej = 0;
            for (int i = 0; i < r; i++) {
                for (int j = 0; j < c; j++) {
                    if (g[i][j] == 'S') si = i, sj = j;
                    if (g[i][j] == 'E') ei = i, ej = j;
                }
            }
            vector<vector<int>> dist(r, vector<int>(c, -1));
            queue<pair<int, int>> cola;
            dist[si][sj] = 0;
            cola.push({si, sj});
            int dr[] = {1, -1, 0, 0};
            int dc[] = {0, 0, 1, -1};
            while (!cola.empty()) {
                auto [i, j] = cola.front();
                cola.pop();
                for (int k = 0; k < 4; k++) {
                    int ni = i + dr[k], nj = j + dc[k];
                    if (ni < 0 || ni >= r || nj < 0 || nj >= c) continue;
                    if (g[ni][nj] == '#' || dist[ni][nj] != -1) continue;
                    dist[ni][nj] = dist[i][j] + 1;
                    cola.push({ni, nj});
                }
            }
            cout << dist[ei][ej] << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayDeque;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int r = Integer.parseInt(st.nextToken());
                int c = Integer.parseInt(st.nextToken());
                char[][] g = new char[r][];
                int si = 0, sj = 0, ei = 0, ej = 0;
                for (int i = 0; i < r; i++) {
                    g[i] = br.readLine().trim().toCharArray();
                    for (int j = 0; j < c; j++) {
                        if (g[i][j] == 'S') { si = i; sj = j; }
                        if (g[i][j] == 'E') { ei = i; ej = j; }
                    }
                }
                int[][] dist = new int[r][c];
                for (int[] fila : dist) java.util.Arrays.fill(fila, -1);
                ArrayDeque<int[]> cola = new ArrayDeque<>();
                dist[si][sj] = 0;
                cola.add(new int[] {si, sj});
                int[] dr = {1, -1, 0, 0};
                int[] dc = {0, 0, 1, -1};
                while (!cola.isEmpty()) {
                    int[] p = cola.poll();
                    for (int k = 0; k < 4; k++) {
                        int ni = p[0] + dr[k], nj = p[1] + dc[k];
                        if (ni < 0 || ni >= r || nj < 0 || nj >= c) continue;
                        if (g[ni][nj] == '#' || dist[ni][nj] != -1) continue;
                        dist[ni][nj] = dist[p[0]][p[1]] + 1;
                        cola.add(new int[] {ni, nj});
                    }
                }
                System.out.println(dist[ei][ej]);
            }
        }
      `,
    },
    hints: [
      'Cada casilla es un nodo y sus vecinas son las cuatro de al lado. Es el mismo BFS de Nima, sin listas de adyacencia.',
      'Guarda dist como una matriz R × C llena de -1. Empieza en S con distancia 0 y recorre las vecinas con dr = [1, -1, 0, 0] y dc = [0, 0, 1, -1].',
      'Al sacar (i, j): para cada dirección, calcula (ni, nj); si está dentro, no es "#" y dist[ni][nj] == -1, pon dist[ni][nj] = dist[i][j] + 1 y métela en la cola. Imprime dist en E.',
    ],
  },
  outro: [
    { speaker: 'NEVA', text: '¡Fuera del glaciar! Y por el camino más corto. No me lo creo.' },
    { speaker: 'NEVA', text: 'Ahora lo veo: una cuadrícula es un grafo disfrazado. Cuatro vecinas y cuidado con los bordes.' },
    { speaker: 'NEVA', text: 'Bombo, el yeti, está organizando una guerra de bolas de nieve aquí al lado. Dice que necesita ayuda con los equipos.' },
  ],
  rewardTip: {
    title: 'BFS en cuadrícula',
    text: {
      python: 'Vecinas: (i±1, j) y (i, j±1). Comprueba 0 <= ni < r y 0 <= nj < c antes de leer g[ni][nj].',
      cpp: 'dr[] = {1,-1,0,0}, dc[] = {0,0,1,-1}. Revisa los bordes antes de g[ni][nj]. queue<pair<int,int>>.',
      java: 'int[] dr = {1,-1,0,0}, dc = {0,0,1,-1}. Revisa los bordes antes de g[ni][nj]. ArrayDeque<int[]>.',
    },
  },
};
