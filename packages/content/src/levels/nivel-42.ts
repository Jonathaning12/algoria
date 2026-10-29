import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

type Arista = [number, number];

const zonas = (n: number, aristas: Arista[]): [string, string] => {
  const padre = Array.from({ length: n + 1 }, (_, i) => i);
  const raiz = (x: number) => {
    while (padre[x] !== x) {
      padre[x] = padre[padre[x]!]!;
      x = padre[x]!;
    }
    return x;
  };
  for (const [a, b] of aristas) padre[raiz(a)] = raiz(b);
  const tam = new Map<number, number>();
  for (let i = 1; i <= n; i++) tam.set(raiz(i), (tam.get(raiz(i)) ?? 0) + 1);
  let mayor = 0;
  for (const t of tam.values()) mayor = Math.max(mayor, t);
  const texto = aristas.length ? `\n${aristas.map(([a, b]) => `${a} ${b}`).join('\n')}` : '';
  return [`${n} ${aristas.length}${texto}`, `${tam.size}\n${mayor}`];
};

const r = rng(4242);
const barajar = <T>(a: T[]): T[] => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = r(0, i);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};
/** Senderos al azar (puede haber repetidos, nunca lazos). */
const aleatorio = (n: number, m: number): Arista[] => {
  const res: Arista[] = [];
  while (res.length < m) {
    const a = r(1, n);
    const b = r(1, n);
    if (a !== b) res.push([a, b]);
  }
  return res;
};
const N = 100000;
// Un camino larguísimo con los nodos mezclados: la recursión ingenua se queda sin pila.
const orden = barajar(Array.from({ length: N }, (_, i) => i + 1));
const camino = barajar(orden.slice(1).map((v, i): Arista => [orden[i]!, v]));
const parejas = barajar(Array.from({ length: N / 2 }, (_, i): Arista => [2 * i + 1, 2 * i + 2]));

export const nivel42: Level = {
  number: 42,
  id: 'n42-dfs-componentes',
  title: 'DFS y componentes',
  topic: 'Grafos: recorrido en profundidad',
  npc: { id: 'eladio', name: 'ELADIO', title: 'Cartógrafo de la cordillera', sprite: 'npc42', x: 12, y: 2 },
  greeting: 'Un mapa sin zonas es solo un montón de rayas. Yo quiero ver las zonas.',
  intro: [
    { speaker: 'ELADIO', text: 'Hola, soy Eladio. Dibujo los mapas de esta cordillera desde hace cuarenta inviernos.' },
    { speaker: 'ELADIO', text: 'Las avalanchas cortaron muchos senderos. Ahora la montaña está partida en zonas que no se tocan.' },
    { speaker: 'ELADIO', text: 'Necesito saber cuántas zonas hay y cuál es la más grande. Para eso hay que explorar, y explorar bien.' },
    { speaker: 'ELADIO', text: '¿Te enseño a recorrer un grafo en profundidad o vas directo al duelo?' },
  ],
  lesson: {
    concept: 'DFS · COMPONENTES CONEXAS',
    goals: ['Recorrer un grafo con una pila (DFS)', 'Marcar los nodos visitados para no repetirlos', 'Contar las componentes conexas'],
    explanation:
      'DFS (búsqueda en profundidad) explora un camino hasta el fondo y luego retrocede. ' +
      'Se hace con una pila: sacas un nodo, y metes a sus vecinos que aún no estén marcados como visitados. ' +
      'Una componente conexa es un grupo de nodos que se alcanzan entre sí. Para contarlas, recorre los nodos del 1 al N ' +
      'y lanza un DFS desde cada uno que no esté visitado: cada lanzamiento es una zona nueva. Todo cuesta O(N + M).',
    code: {
      python: code`
        import sys
        input = sys.stdin.readline

        n, m = map(int, input().split())
        adj = [[] for _ in range(n + 1)]
        for _ in range(m):
            a, b = map(int, input().split())
            adj[a].append(b)
            adj[b].append(a)
        visto = [False] * (n + 1)
        visto[1] = True
        pila = [1]
        while pila:
            u = pila.pop()
            for v in adj[u]:
                if not visto[v]:
                    visto[v] = True
                    pila.append(v)
        print(*[i for i in range(1, n + 1) if visto[i]])
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, m;
            cin >> n >> m;
            vector<vector<int>> adj(n + 1);
            for (int i = 0; i < m; i++) {
                int a, b;
                cin >> a >> b;
                adj[a].push_back(b);
                adj[b].push_back(a);
            }
            vector<bool> visto(n + 1, false);
            vector<int> pila = {1};
            visto[1] = true;
            while (!pila.empty()) {
                int u = pila.back();
                pila.pop_back();
                for (int v : adj[u]) {
                    if (!visto[v]) {
                        visto[v] = true;
                        pila.push_back(v);
                    }
                }
            }
            bool primero = true;
            for (int i = 1; i <= n; i++) {
                if (visto[i]) {
                    cout << (primero ? "" : " ") << i;
                    primero = false;
                }
            }
            cout << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayDeque;
        import java.util.ArrayList;
        import java.util.List;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int m = Integer.parseInt(st.nextToken());
                List<List<Integer>> adj = new ArrayList<>();
                for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
                for (int i = 0; i < m; i++) {
                    st = new StringTokenizer(br.readLine());
                    int a = Integer.parseInt(st.nextToken());
                    int b = Integer.parseInt(st.nextToken());
                    adj.get(a).add(b);
                    adj.get(b).add(a);
                }
                boolean[] visto = new boolean[n + 1];
                ArrayDeque<Integer> pila = new ArrayDeque<>();
                visto[1] = true;
                pila.push(1);
                while (!pila.isEmpty()) {
                    int u = pila.pop();
                    for (int v : adj.get(u)) {
                        if (!visto[v]) {
                            visto[v] = true;
                            pila.push(v);
                        }
                    }
                }
                StringBuilder sb = new StringBuilder();
                for (int i = 1; i <= n; i++) {
                    if (visto[i]) sb.append(sb.length() > 0 ? " " : "").append(i);
                }
                System.out.println(sb);
            }
        }
      `,
    },
    examples: [
      { input: '5 3\n1 2\n2 3\n4 5', output: '1 2 3' },
      { input: '4 3\n4 3\n3 2\n2 1', output: '1 2 3 4' },
      { input: '4 0', output: '1' },
    ],
    tips: {
      python: 'Evita el DFS recursivo con grafos grandes: Python corta a las 1000 llamadas. Una lista como pila (append / pop) no tiene ese límite.',
      cpp: 'Un vector<int> como pila (push_back / pop_back) es rápido y no desborda la pila del sistema con caminos de 10⁵ nodos.',
      java: 'ArrayDeque con push / pop es una pila rápida. La recursión con 10⁵ niveles puede lanzar StackOverflowError.',
    },
    quiz: {
      question: '¿Cuántas zonas cuenta este programa?',
      code: {
        python: code`
          adj = [[], [2], [1], [], [5], [4]]
          visto = [False] * 6
          zonas = 0
          for s in range(1, 6):
              if not visto[s]:
                  zonas += 1
                  visto[s] = True
                  pila = [s]
                  while pila:
                      u = pila.pop()
                      for v in adj[u]:
                          if not visto[v]:
                              visto[v] = True
                              pila.append(v)
          print(zonas)
        `,
        cpp: code`
          #include <iostream>
          #include <vector>
          using namespace std;

          int main() {
              vector<vector<int>> adj = {{}, {2}, {1}, {}, {5}, {4}};
              vector<bool> visto(6, false);
              int zonas = 0;
              for (int s = 1; s <= 5; s++) {
                  if (!visto[s]) {
                      zonas++;
                      visto[s] = true;
                      vector<int> pila = {s};
                      while (!pila.empty()) {
                          int u = pila.back();
                          pila.pop_back();
                          for (int v : adj[u]) {
                              if (!visto[v]) {
                                  visto[v] = true;
                                  pila.push_back(v);
                              }
                          }
                      }
                  }
              }
              cout << zonas << "\n";
              return 0;
          }
        `,
        java: code`
          import java.util.ArrayDeque;

          public class Main {
              public static void main(String[] args) {
                  int[][] adj = {{}, {2}, {1}, {}, {5}, {4}};
                  boolean[] visto = new boolean[6];
                  int zonas = 0;
                  for (int s = 1; s <= 5; s++) {
                      if (!visto[s]) {
                          zonas++;
                          visto[s] = true;
                          ArrayDeque<Integer> pila = new ArrayDeque<>();
                          pila.push(s);
                          while (!pila.isEmpty()) {
                              int u = pila.pop();
                              for (int v : adj[u]) {
                                  if (!visto[v]) {
                                      visto[v] = true;
                                      pila.push(v);
                                  }
                              }
                          }
                      }
                  }
                  System.out.println(zonas);
              }
          }
        `,
      },
      options: ['2', '3', '5'],
      answer: 1,
      explanation: 'Las zonas son {1, 2}, {3} y {4, 5}. Un nodo sin vecinos también es una zona: la suya propia.',
      wrongHint: 'Fíjate en el nodo 3: su lista está vacía. ¿Cuenta como zona?',
    },
  },
  problem: {
    id: 'p42-zonas-de-eladio',
    title: 'LAS ZONAS DE ELADIO',
    statement:
      'La montaña tiene N refugios y M senderos de ida y vuelta (puede haber senderos repetidos). ' +
      'Una zona es un grupo de refugios conectados entre sí por senderos; un refugio aislado es una zona de un solo refugio. ' +
      'Ayuda a Eladio a contar cuántas zonas hay y cuántos refugios tiene la zona más grande.',
    inputSpec: 'Línea 1: N y M. Siguientes M líneas: dos enteros a y b, un sendero entre a y b.',
    outputSpec: 'Dos líneas: la cantidad de zonas y el tamaño de la zona más grande.',
    constraints: '1 ≤ N ≤ 10⁵ · 0 ≤ M ≤ 2·10⁵ · a ≠ b',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      zonas(6, [[1, 2], [2, 3], [4, 5], [3, 1]]),
      zonas(5, []),
      zonas(7, [[1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [7, 4]]),
      zonas(1, []),
      zonas(N, camino),
      zonas(N, aleatorio(N, 50000)),
      zonas(N, aleatorio(N, 120000)),
      zonas(N, parejas),
    ]),
    starter: {
      python: code`
        import sys
        input = sys.stdin.readline

        n, m = map(int, input().split())
        adj = [[] for _ in range(n + 1)]
        for _ in range(m):
            a, b = map(int, input().split())
            adj[a].append(b)
            adj[b].append(a)
        visto = [False] * (n + 1)
        zonas = 0
        mayor = 0
        for s in range(1, n + 1):
            if not visto[s]:
                # TODO: nueva zona: recorre con una pila desde s y cuenta sus refugios
                pass
        print(zonas)
        print(mayor)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, m;
            cin >> n >> m;
            vector<vector<int>> adj(n + 1);
            for (int i = 0; i < m; i++) {
                int a, b;
                cin >> a >> b;
                adj[a].push_back(b);
                adj[b].push_back(a);
            }
            vector<bool> visto(n + 1, false);
            int zonas = 0, mayor = 0;
            for (int s = 1; s <= n; s++) {
                if (!visto[s]) {
                    // TODO: nueva zona: recorre con una pila desde s y cuenta sus refugios
                }
            }
            cout << zonas << "\n" << mayor << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayDeque;
        import java.util.ArrayList;
        import java.util.List;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int m = Integer.parseInt(st.nextToken());
                List<List<Integer>> adj = new ArrayList<>();
                for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
                for (int i = 0; i < m; i++) {
                    st = new StringTokenizer(br.readLine());
                    int a = Integer.parseInt(st.nextToken());
                    int b = Integer.parseInt(st.nextToken());
                    adj.get(a).add(b);
                    adj.get(b).add(a);
                }
                boolean[] visto = new boolean[n + 1];
                int zonas = 0, mayor = 0;
                for (int s = 1; s <= n; s++) {
                    if (!visto[s]) {
                        // TODO: nueva zona: recorre con una pila desde s y cuenta sus refugios
                    }
                }
                System.out.println(zonas);
                System.out.println(mayor);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        input = sys.stdin.readline

        n, m = map(int, input().split())
        adj = [[] for _ in range(n + 1)]
        for _ in range(m):
            a, b = map(int, input().split())
            adj[a].append(b)
            adj[b].append(a)
        visto = [False] * (n + 1)
        zonas = 0
        mayor = 0
        for s in range(1, n + 1):
            if not visto[s]:
                zonas += 1
                visto[s] = True
                pila = [s]
                tam = 0
                while pila:
                    u = pila.pop()
                    tam += 1
                    for v in adj[u]:
                        if not visto[v]:
                            visto[v] = True
                            pila.append(v)
                mayor = max(mayor, tam)
        print(zonas)
        print(mayor)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, m;
            cin >> n >> m;
            vector<vector<int>> adj(n + 1);
            for (int i = 0; i < m; i++) {
                int a, b;
                cin >> a >> b;
                adj[a].push_back(b);
                adj[b].push_back(a);
            }
            vector<bool> visto(n + 1, false);
            int zonas = 0, mayor = 0;
            vector<int> pila;
            for (int s = 1; s <= n; s++) {
                if (!visto[s]) {
                    zonas++;
                    visto[s] = true;
                    pila.push_back(s);
                    int tam = 0;
                    while (!pila.empty()) {
                        int u = pila.back();
                        pila.pop_back();
                        tam++;
                        for (int v : adj[u]) {
                            if (!visto[v]) {
                                visto[v] = true;
                                pila.push_back(v);
                            }
                        }
                    }
                    if (tam > mayor) mayor = tam;
                }
            }
            cout << zonas << "\n" << mayor << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayDeque;
        import java.util.ArrayList;
        import java.util.List;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int m = Integer.parseInt(st.nextToken());
                List<List<Integer>> adj = new ArrayList<>();
                for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
                for (int i = 0; i < m; i++) {
                    st = new StringTokenizer(br.readLine());
                    int a = Integer.parseInt(st.nextToken());
                    int b = Integer.parseInt(st.nextToken());
                    adj.get(a).add(b);
                    adj.get(b).add(a);
                }
                boolean[] visto = new boolean[n + 1];
                int zonas = 0, mayor = 0;
                ArrayDeque<Integer> pila = new ArrayDeque<>();
                for (int s = 1; s <= n; s++) {
                    if (!visto[s]) {
                        zonas++;
                        visto[s] = true;
                        pila.push(s);
                        int tam = 0;
                        while (!pila.isEmpty()) {
                            int u = pila.pop();
                            tam++;
                            for (int v : adj.get(u)) {
                                if (!visto[v]) {
                                    visto[v] = true;
                                    pila.push(v);
                                }
                            }
                        }
                        mayor = Math.max(mayor, tam);
                    }
                }
                System.out.println(zonas);
                System.out.println(mayor);
            }
        }
      `,
    },
    hints: [
      'Cada vez que encuentras un refugio sin visitar, encontraste una zona nueva. Recórrela entera para marcar a todos sus refugios.',
      'Usa una pila en vez de recursión: hay caminos de 10⁵ refugios. Marca un refugio como visto al meterlo en la pila, no al sacarlo, para no meterlo dos veces.',
      'Para s de 1 a N: si no está visto, zonas += 1, márcalo y mételo en la pila. Mientras la pila no esté vacía, saca u, suma 1 al tamaño y mete a sus vecinos no vistos. Al terminar, actualiza el mayor.',
    ],
  },
  outro: [
    { speaker: 'ELADIO', text: '¡Por fin! Cada zona con su tamaño. Este mapa sí que se entiende.' },
    { speaker: 'ELADIO', text: 'Un recorrido con pila y un arreglo de visitados: con eso se explora cualquier montaña.' },
    { speaker: 'ELADIO', text: 'Nima, la guía, está bajando por el camino. Ella no busca zonas: busca el camino más corto.' },
  ],
  rewardTip: {
    title: 'DFS con pila',
    text: {
      python: 'pila = [s]; marca al meter. while pila: u = pila.pop(); mete vecinos no vistos. Sin recursión, sin límite de 1000.',
      cpp: 'vector<int> pila; marca al meter, saca con back() / pop_back(). Cada DFS desde un nodo nuevo = una componente.',
      java: 'ArrayDeque pila; push / pop. Marca al meter. Cada DFS desde un nodo no visitado es una componente nueva.',
    },
  },
};
