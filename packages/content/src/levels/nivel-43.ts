import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

type Arista = [number, number];

const ruta = (n: number, aristas: Arista[], s: number, t: number): [string, string] => {
  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  for (const [a, b] of aristas) {
    adj[a]!.push(b);
    adj[b]!.push(a);
  }
  const dist = new Array<number>(n + 1).fill(-1);
  dist[s] = 0;
  const cola = [s];
  for (let i = 0; i < cola.length; i++) {
    const u = cola[i]!;
    for (const v of adj[u]!) {
      if (dist[v] === -1) {
        dist[v] = dist[u]! + 1;
        cola.push(v);
      }
    }
  }
  return [`${n} ${aristas.length}\n${aristas.map(([a, b]) => `${a} ${b}\n`).join('')}${s} ${t}`, `${dist[t]}`];
};

const r = rng(4343);
const barajar = <T>(a: T[]): T[] => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = r(0, i);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};
const aleatorio = (desde: number, hasta: number, m: number): Arista[] => {
  const res: Arista[] = [];
  while (res.length < m) {
    const a = r(desde, hasta);
    const b = r(desde, hasta);
    if (a !== b) res.push([a, b]);
  }
  return res;
};
const N = 100000;
const camino = barajar(Array.from({ length: N - 1 }, (_, i): Arista => (r(0, 1) ? [i + 1, i + 2] : [i + 2, i + 1])));
// Un camino con algunos atajos largos: el camino más corto no es el obvio.
const atajos = barajar([
  ...Array.from({ length: N - 1 }, (_, i): Arista => [i + 1, i + 2]),
  ...Array.from({ length: 300 }, (): Arista => {
    const a = r(1, N - 1000);
    return [a, a + r(100, 1000)];
  }),
]);
const mitades = barajar([...aleatorio(1, N / 2, 60000), ...aleatorio(N / 2 + 1, N, 60000)]);

export const nivel43: Level = {
  number: 43,
  id: 'n43-bfs-distancia',
  title: 'BFS y distancia',
  topic: 'Grafos: recorrido en anchura',
  npc: { id: 'nima', name: 'NIMA', title: 'Guía de altura', sprite: 'npc43', x: 14, y: 4 },
  greeting: 'En la montaña, cada paso de más cuesta aire. Yo siempre busco la ruta con menos tramos.',
  intro: [
    { speaker: 'NIMA', text: 'Hola, soy Nima. Guío expediciones desde que tenía tu edad.' },
    { speaker: 'NIMA', text: 'Los escaladores siempre me preguntan lo mismo: ¿cuántos tramos faltan para llegar?' },
    { speaker: 'NIMA', text: 'Para responder, no exploro a lo loco: primero todo lo que está a un tramo, luego a dos, luego a tres...' },
    { speaker: 'NIMA', text: 'Eso se llama BFS. ¿Te lo explico o prefieres el duelo?' },
  ],
  lesson: {
    concept: 'BFS · DISTANCIA MÍNIMA',
    goals: ['Recorrer un grafo por capas con una cola', 'Calcular la distancia mínima en número de aristas', 'Detectar nodos inalcanzables'],
    explanation:
      'BFS (búsqueda en anchura) usa una cola: el primero que entra es el primero que sale. ' +
      'Empiezas con el origen a distancia 0. Al sacar un nodo u, cada vecino sin distancia recibe dist[u] + 1 y entra a la cola. ' +
      'Como los nodos salen en orden de distancia, la primera vez que llegas a un nodo es por el camino más corto. ' +
      'Si un nodo nunca recibe distancia, no se puede llegar: queda en -1. Cuesta O(N + M).',
    code: {
      python: code`
        import sys
        from collections import deque
        input = sys.stdin.readline

        n, m = map(int, input().split())
        adj = [[] for _ in range(n + 1)]
        for _ in range(m):
            a, b = map(int, input().split())
            adj[a].append(b)
            adj[b].append(a)
        dist = [-1] * (n + 1)
        dist[1] = 0
        cola = deque([1])
        while cola:
            u = cola.popleft()
            for v in adj[u]:
                if dist[v] == -1:
                    dist[v] = dist[u] + 1
                    cola.append(v)
        print(*dist[1:])
      `,
      cpp: code`
        #include <iostream>
        #include <queue>
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
            vector<int> dist(n + 1, -1);
            queue<int> cola;
            dist[1] = 0;
            cola.push(1);
            while (!cola.empty()) {
                int u = cola.front();
                cola.pop();
                for (int v : adj[u]) {
                    if (dist[v] == -1) {
                        dist[v] = dist[u] + 1;
                        cola.push(v);
                    }
                }
            }
            for (int i = 1; i <= n; i++) cout << dist[i] << (i == n ? "\n" : " ");
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayDeque;
        import java.util.ArrayList;
        import java.util.Arrays;
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
                int[] dist = new int[n + 1];
                Arrays.fill(dist, -1);
                ArrayDeque<Integer> cola = new ArrayDeque<>();
                dist[1] = 0;
                cola.add(1);
                while (!cola.isEmpty()) {
                    int u = cola.poll();
                    for (int v : adj.get(u)) {
                        if (dist[v] == -1) {
                            dist[v] = dist[u] + 1;
                            cola.add(v);
                        }
                    }
                }
                StringBuilder sb = new StringBuilder();
                for (int i = 1; i <= n; i++) sb.append(i > 1 ? " " : "").append(dist[i]);
                System.out.println(sb);
            }
        }
      `,
    },
    examples: [
      { input: '4 3\n1 2\n2 3\n1 4', output: '0 1 2 1' },
      { input: '5 5\n1 2\n2 3\n3 4\n4 5\n1 5', output: '0 1 2 2 1' },
      { input: '3 1\n2 3', output: '0 -1 -1' },
    ],
    tips: {
      python: 'Usa collections.deque: popleft() es O(1). Hacer lista.pop(0) mueve toda la lista en cada paso y es O(n).',
      cpp: 'queue<int> con front() y pop(). Marca la distancia al meter el nodo a la cola, no al sacarlo, para no repetirlo.',
      java: 'ArrayDeque con add() y poll() funciona como cola. Arrays.fill(dist, -1) marca todo como no visitado.',
    },
    quiz: {
      question: '¿En qué orden visita los nodos este BFS desde el 1?',
      code: {
        python: code`
          from collections import deque

          adj = [[], [2, 3], [4], [5], [], []]
          visto = [False] * 6
          visto[1] = True
          cola = deque([1])
          orden = []
          while cola:
              u = cola.popleft()
              orden.append(u)
              for v in adj[u]:
                  if not visto[v]:
                      visto[v] = True
                      cola.append(v)
          print(*orden)
        `,
        cpp: code`
          #include <iostream>
          #include <queue>
          #include <vector>
          using namespace std;

          int main() {
              vector<vector<int>> adj = {{}, {2, 3}, {4}, {5}, {}, {}};
              vector<bool> visto(6, false);
              queue<int> cola;
              visto[1] = true;
              cola.push(1);
              bool primero = true;
              while (!cola.empty()) {
                  int u = cola.front();
                  cola.pop();
                  cout << (primero ? "" : " ") << u;
                  primero = false;
                  for (int v : adj[u]) {
                      if (!visto[v]) {
                          visto[v] = true;
                          cola.push(v);
                      }
                  }
              }
              cout << "\n";
              return 0;
          }
        `,
        java: code`
          import java.util.ArrayDeque;

          public class Main {
              public static void main(String[] args) {
                  int[][] adj = {{}, {2, 3}, {4}, {5}, {}, {}};
                  boolean[] visto = new boolean[6];
                  ArrayDeque<Integer> cola = new ArrayDeque<>();
                  visto[1] = true;
                  cola.add(1);
                  StringBuilder sb = new StringBuilder();
                  while (!cola.isEmpty()) {
                      int u = cola.poll();
                      sb.append(sb.length() > 0 ? " " : "").append(u);
                      for (int v : adj[u]) {
                          if (!visto[v]) {
                              visto[v] = true;
                              cola.add(v);
                          }
                      }
                  }
                  System.out.println(sb);
              }
          }
        `,
      },
      options: ['1 2 4 3 5', '1 2 3 4 5', '1 3 5 2 4'],
      answer: 1,
      explanation: 'Primero el 1 (distancia 0), luego 2 y 3 (distancia 1), y al final 4 y 5 (distancia 2). BFS avanza por capas.',
      wrongHint: 'La cola atiende en orden de llegada: el 3 entró a la cola antes que el 4.',
    },
  },
  problem: {
    id: 'p43-ruta-de-nima',
    title: 'LA RUTA DE NIMA',
    statement:
      'La montaña tiene N refugios y M senderos de ida y vuelta. Cada sendero es un tramo. ' +
      'Nima está en el refugio S y quiere llegar al refugio T recorriendo la menor cantidad de tramos posible. ' +
      'Imprime esa cantidad, o -1 si no hay forma de llegar.',
    inputSpec: 'Línea 1: N y M. Siguientes M líneas: dos enteros a y b, un sendero entre a y b. Última línea: S y T.',
    outputSpec: 'Un entero: la menor cantidad de tramos de S a T, o -1 si no se puede llegar.',
    constraints: '1 ≤ N ≤ 10⁵ · 0 ≤ M ≤ 2·10⁵ · a ≠ b · 1 ≤ S, T ≤ N',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      ruta(6, [[1, 2], [2, 3], [3, 6], [1, 4], [4, 5], [5, 6], [2, 5]], 1, 6),
      ruta(4, [[1, 2], [3, 4]], 1, 4),
      ruta(3, [[1, 2], [2, 3]], 2, 2),
      ruta(5, [[5, 4], [4, 3], [3, 2], [2, 1], [1, 5]], 2, 4),
      ruta(N, camino, 1, N),
      ruta(N, atajos, 1, N),
      ruta(N, aleatorio(1, N, 120000), 777, 99999),
      ruta(N, mitades, 1, N),
      ruta(N, aleatorio(1, N, 110000), 1, N),
    ]),
    starter: {
      python: code`
        import sys
        from collections import deque
        input = sys.stdin.readline

        n, m = map(int, input().split())
        adj = [[] for _ in range(n + 1)]
        for _ in range(m):
            a, b = map(int, input().split())
            adj[a].append(b)
            adj[b].append(a)
        s, t = map(int, input().split())
        dist = [-1] * (n + 1)
        # TODO: BFS desde s con una deque; cada vecino nuevo recibe dist[u] + 1
        print(dist[t])
      `,
      cpp: code`
        #include <iostream>
        #include <queue>
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
            int s, t;
            cin >> s >> t;
            vector<int> dist(n + 1, -1);
            // TODO: BFS desde s con una queue; cada vecino nuevo recibe dist[u] + 1
            cout << dist[t] << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayDeque;
        import java.util.ArrayList;
        import java.util.Arrays;
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
                st = new StringTokenizer(br.readLine());
                int s = Integer.parseInt(st.nextToken());
                int t = Integer.parseInt(st.nextToken());
                int[] dist = new int[n + 1];
                Arrays.fill(dist, -1);
                // TODO: BFS desde s con una ArrayDeque; cada vecino nuevo recibe dist[u] + 1
                System.out.println(dist[t]);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        from collections import deque
        input = sys.stdin.readline

        n, m = map(int, input().split())
        adj = [[] for _ in range(n + 1)]
        for _ in range(m):
            a, b = map(int, input().split())
            adj[a].append(b)
            adj[b].append(a)
        s, t = map(int, input().split())
        dist = [-1] * (n + 1)
        dist[s] = 0
        cola = deque([s])
        while cola:
            u = cola.popleft()
            if u == t:
                break
            for v in adj[u]:
                if dist[v] == -1:
                    dist[v] = dist[u] + 1
                    cola.append(v)
        print(dist[t])
      `,
      cpp: code`
        #include <iostream>
        #include <queue>
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
            int s, t;
            cin >> s >> t;
            vector<int> dist(n + 1, -1);
            queue<int> cola;
            dist[s] = 0;
            cola.push(s);
            while (!cola.empty()) {
                int u = cola.front();
                cola.pop();
                for (int v : adj[u]) {
                    if (dist[v] == -1) {
                        dist[v] = dist[u] + 1;
                        cola.push(v);
                    }
                }
            }
            cout << dist[t] << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayDeque;
        import java.util.ArrayList;
        import java.util.Arrays;
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
                st = new StringTokenizer(br.readLine());
                int s = Integer.parseInt(st.nextToken());
                int t = Integer.parseInt(st.nextToken());
                int[] dist = new int[n + 1];
                Arrays.fill(dist, -1);
                ArrayDeque<Integer> cola = new ArrayDeque<>();
                dist[s] = 0;
                cola.add(s);
                while (!cola.isEmpty()) {
                    int u = cola.poll();
                    for (int v : adj.get(u)) {
                        if (dist[v] == -1) {
                            dist[v] = dist[u] + 1;
                            cola.add(v);
                        }
                    }
                }
                System.out.println(dist[t]);
            }
        }
      `,
    },
    hints: [
      'Busca por capas: primero todo lo que está a un tramo de S, luego a dos, luego a tres. La primera vez que tocas T, ya tienes la respuesta.',
      'Usa una cola y un arreglo dist lleno de -1. dist[S] = 0. Un -1 significa "todavía no llegué aquí".',
      'Mientras la cola no esté vacía: saca u; para cada vecino v con dist[v] == -1, haz dist[v] = dist[u] + 1 y mete v a la cola. Al final imprime dist[T].',
    ],
  },
  outro: [
    { speaker: 'NIMA', text: 'Capa por capa, sin pasos de más. Así se guía una expedición.' },
    { speaker: 'NIMA', text: 'Recuerda: la cola atiende en orden de llegada, y por eso BFS encuentra siempre el camino con menos tramos.' },
    { speaker: 'NIMA', text: 'Neva, la exploradora, está atrapada en el glaciar, aquí al lado. Ese mapa es una cuadrícula.' },
  ],
  rewardTip: {
    title: 'BFS: distancia mínima',
    text: {
      python: 'deque + dist = [-1] * (n + 1). Al meter v: dist[v] = dist[u] + 1. Nada de lista.pop(0): es O(n).',
      cpp: 'queue<int> + vector<int> dist(n + 1, -1). Marca la distancia al meter a la cola. O(N + M).',
      java: 'ArrayDeque con add / poll + int[] dist lleno de -1. Marca al meter a la cola. O(N + M).',
    },
  },
};
