import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

type Arista = [number, number];

const refugios = (n: number, aristas: Arista[]): [string, string] => {
  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  for (const [a, b] of aristas) {
    adj[a]!.push(b);
    adj[b]!.push(a);
  }
  let mejor = 1;
  for (let i = 2; i <= n; i++) if (adj[i]!.length > adj[mejor]!.length) mejor = i;
  const grados = adj.slice(1).map((v) => v.length).join(' ');
  const vecinos = [...adj[mejor]!].sort((x, y) => x - y).join(' ');
  return [`${n} ${aristas.length}\n${aristas.map(([a, b]) => `${a} ${b}`).join('\n')}`, `${grados}\n${mejor}\n${vecinos}`];
};

const r = rng(4141);
const barajar = <T>(a: T[]): T[] => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = r(0, i);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};
const girar = (a: Arista[]): Arista[] => a.map(([x, y]) => (r(0, 1) ? [x, y] : [y, x]));

/** Senderos al azar, sin repetidos ni lazos. */
const aleatorio = (n: number, m: number): Arista[] => {
  const vistas = new Set<number>();
  const res: Arista[] = [];
  while (res.length < m) {
    const a = r(1, n);
    const b = r(1, n);
    if (a === b) continue;
    const key = Math.min(a, b) * (n + 1) + Math.max(a, b);
    if (vistas.has(key)) continue;
    vistas.add(key);
    res.push([a, b]);
  }
  return res;
};
const estrella = (n: number, centro: number): Arista[] =>
  barajar(girar(Array.from({ length: n }, (_, i) => i + 1).filter((v) => v !== centro).map((v): Arista => [centro, v])));
const completo = (n: number): Arista[] => {
  const res: Arista[] = [];
  for (let a = 1; a <= n; a++) for (let b = a + 1; b <= n; b++) res.push([a, b]);
  return barajar(girar(res));
};

export const nivel41: Level = {
  number: 41,
  id: 'n41-lista-de-adyacencia',
  title: 'Lista de adyacencia',
  topic: 'Grafos: representación',
  npc: { id: 'rocio', name: 'ROCÍO', title: 'Pastora de los refugios', sprite: 'npc41', x: 4, y: 2 },
  greeting: 'Mis llamas conocen cada sendero. Yo los anoto todos, uno por uno.',
  intro: [
    { speaker: 'ROCÍO', text: '¡Bienvenido a la Montaña Grafo! Soy Rocío y llevo mis llamas de refugio en refugio.' },
    { speaker: 'ROCÍO', text: 'Aquí arriba todo son puntos unidos por senderos. A eso los programadores le llaman grafo.' },
    { speaker: 'ROCÍO', text: 'Los refugios son nodos y los senderos son aristas. Para no perderme, anoto los vecinos de cada refugio.' },
    { speaker: 'ROCÍO', text: '¿Te enseño a guardar un grafo en tu programa o vamos directo al duelo?' },
  ],
  lesson: {
    concept: 'LISTA DE ADYACENCIA · GRADOS',
    goals: ['Leer un grafo de N nodos y M aristas', 'Guardar los vecinos de cada nodo en una lista', 'Calcular el grado de cada nodo'],
    explanation:
      'Un grafo son nodos unidos por aristas. La forma más usada de guardarlo es la lista de adyacencia: ' +
      'una lista por nodo con sus vecinos. Si el sendero va en los dos sentidos, al leer "a b" agregas b a la lista de a y a a la lista de b. ' +
      'El grado de un nodo es cuántos vecinos tiene: el largo de su lista. Ocupa memoria O(N + M), justo lo que necesitas.',
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
        print(*[len(adj[i]) for i in range(1, n + 1)])
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
            for (int i = 1; i <= n; i++) {
                cout << adj[i].size() << (i == n ? "\n" : " ");
            }
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
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
                StringBuilder sb = new StringBuilder();
                for (int i = 1; i <= n; i++) {
                    if (i > 1) sb.append(" ");
                    sb.append(adj.get(i).size());
                }
                System.out.println(sb);
            }
        }
      `,
    },
    examples: [
      { input: '4 3\n1 2\n1 3\n3 4', output: '2 1 2 1' },
      { input: '3 3\n1 2\n2 3\n3 1', output: '2 2 2' },
      { input: '3 0', output: '0 0 0' },
    ],
    tips: {
      python: 'adj = [[] for _ in range(n + 1)] crea listas distintas. Ojo: [[]] * (n + 1) repite la MISMA lista n + 1 veces.',
      cpp: 'vector<vector<int>> adj(n + 1) y push_back en los dos extremos. Usa índices desde 1 para no restar a cada rato.',
      java: 'Un List<List<Integer>> con n + 1 listas vacías. Lee cada arista con StringTokenizer: es mucho más rápido que Scanner.',
    },
    quiz: {
      question: '¿Qué imprime el programa? (suma los grados de todos los nodos)',
      code: {
        python: code`
          aristas = [(1, 2), (2, 3), (2, 4), (4, 1)]
          adj = [[] for _ in range(5)]
          for a, b in aristas:
              adj[a].append(b)
              adj[b].append(a)
          total = 0
          for i in range(1, 5):
              total += len(adj[i])
          print(total)
        `,
        cpp: code`
          #include <iostream>
          #include <vector>
          using namespace std;

          int main() {
              int aristas[4][2] = {{1, 2}, {2, 3}, {2, 4}, {4, 1}};
              vector<vector<int>> adj(5);
              for (auto& e : aristas) {
                  adj[e[0]].push_back(e[1]);
                  adj[e[1]].push_back(e[0]);
              }
              int total = 0;
              for (int i = 1; i <= 4; i++) total += adj[i].size();
              cout << total << "\n";
              return 0;
          }
        `,
        java: code`
          import java.util.ArrayList;
          import java.util.List;

          public class Main {
              public static void main(String[] args) {
                  int[][] aristas = {{1, 2}, {2, 3}, {2, 4}, {4, 1}};
                  List<List<Integer>> adj = new ArrayList<>();
                  for (int i = 0; i < 5; i++) adj.add(new ArrayList<>());
                  for (int[] e : aristas) {
                      adj.get(e[0]).add(e[1]);
                      adj.get(e[1]).add(e[0]);
                  }
                  int total = 0;
                  for (int i = 1; i <= 4; i++) total += adj.get(i).size();
                  System.out.println(total);
              }
          }
        `,
      },
      options: ['4', '8', '5'],
      answer: 1,
      explanation: 'Cada arista aparece en dos listas, una por extremo. Por eso la suma de los grados siempre es 2·M.',
      wrongHint: 'Mira cuántas veces se hace append por cada arista del arreglo.',
    },
  },
  problem: {
    id: 'p41-refugios-de-rocio',
    title: 'LOS REFUGIOS DE ROCÍO',
    statement:
      'Rocío tiene N refugios numerados del 1 al N y M senderos de ida y vuelta entre ellos. ' +
      'Quiere tres cosas: el grado de cada refugio (cuántos senderos salen de él), ' +
      'el refugio con más senderos (si hay empate, el de menor número) y la lista de sus vecinos de menor a mayor.',
    inputSpec: 'Línea 1: N y M. Siguientes M líneas: dos enteros a y b, un sendero entre los refugios a y b.',
    outputSpec: 'Tres líneas: los N grados separados por espacios; el refugio con más senderos; sus vecinos en orden creciente, separados por espacios.',
    constraints: '2 ≤ N ≤ 5000 · 1 ≤ M ≤ 10⁵ · a ≠ b · No hay senderos repetidos.',
    difficulty: 'facil',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      refugios(5, [[1, 2], [1, 3], [2, 3], [3, 4], [4, 5]]),
      refugios(4, [[1, 2], [3, 4]]),
      refugios(6, [[4, 1], [2, 4], [4, 3], [6, 4], [4, 5]]),
      refugios(6, [[2, 5], [5, 6], [2, 3], [6, 1]]),
      refugios(2, [[2, 1]]),
      refugios(5000, aleatorio(5000, 100000)),
      refugios(5000, estrella(5000, 4321)),
      refugios(400, completo(400)),
      refugios(3000, aleatorio(3000, 6000)),
    ]),
    starter: {
      python: code`
        import sys
        input = sys.stdin.readline

        n, m = map(int, input().split())
        adj = [[] for _ in range(n + 1)]
        for _ in range(m):
            a, b = map(int, input().split())
            # TODO: guarda el sendero en la lista de a y en la de b
        # TODO: imprime los grados, el refugio con más senderos y sus vecinos ordenados
      `,
      cpp: code`
        #include <algorithm>
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
                // TODO: guarda el sendero en la lista de a y en la de b
            }
            // TODO: imprime los grados, el refugio con más senderos y sus vecinos ordenados
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayList;
        import java.util.Collections;
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
                    // TODO: guarda el sendero en la lista de a y en la de b
                }
                // TODO: imprime los grados, el refugio con más senderos y sus vecinos ordenados
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
        print(*[len(adj[i]) for i in range(1, n + 1)])
        mejor = 1
        for i in range(2, n + 1):
            if len(adj[i]) > len(adj[mejor]):
                mejor = i
        print(mejor)
        print(*sorted(adj[mejor]))
      `,
      cpp: code`
        #include <algorithm>
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
            for (int i = 1; i <= n; i++) {
                cout << adj[i].size() << (i == n ? "\n" : " ");
            }
            int mejor = 1;
            for (int i = 2; i <= n; i++) {
                if (adj[i].size() > adj[mejor].size()) mejor = i;
            }
            cout << mejor << "\n";
            vector<int> v = adj[mejor];
            sort(v.begin(), v.end());
            for (int i = 0; i < (int)v.size(); i++) {
                cout << v[i] << (i + 1 == (int)v.size() ? "\n" : " ");
            }
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayList;
        import java.util.Collections;
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
                StringBuilder sb = new StringBuilder();
                for (int i = 1; i <= n; i++) {
                    if (i > 1) sb.append(" ");
                    sb.append(adj.get(i).size());
                }
                sb.append("\n");
                int mejor = 1;
                for (int i = 2; i <= n; i++) {
                    if (adj.get(i).size() > adj.get(mejor).size()) mejor = i;
                }
                sb.append(mejor).append("\n");
                List<Integer> v = new ArrayList<>(adj.get(mejor));
                Collections.sort(v);
                for (int i = 0; i < v.size(); i++) {
                    if (i > 0) sb.append(" ");
                    sb.append(v.get(i));
                }
                System.out.println(sb);
            }
        }
      `,
    },
    hints: [
      'Primero guarda el grafo: una lista de vecinos por refugio. Todo lo demás sale de esas listas.',
      'El grado de un refugio es el largo de su lista. Para el empate, recorre del 1 al N y cambia de mejor solo si el grado es estrictamente mayor.',
      'Al leer "a b": adj[a].append(b) y adj[b].append(a). Luego imprime len(adj[i]) para cada i, busca el mejor y ordena una copia de adj[mejor].',
    ],
  },
  outro: [
    { speaker: 'ROCÍO', text: 'Cada refugio con su lista de vecinos. Así ya nunca se me pierde una llama.' },
    { speaker: 'ROCÍO', text: 'Recuérdalo: una arista de ida y vuelta se anota en las dos listas.' },
    { speaker: 'ROCÍO', text: 'Eladio, el cartógrafo, está más al este. Quiere saber cuántas zonas tiene la montaña.' },
  ],
  rewardTip: {
    title: 'Lista de adyacencia',
    text: {
      python: 'adj = [[] for _ in range(n + 1)]; al leer a b: adj[a].append(b) y adj[b].append(a). Grado = len(adj[v]).',
      cpp: 'vector<vector<int>> adj(n + 1); push_back en los dos extremos. Grado = adj[v].size(). Memoria O(N + M).',
      java: 'List<List<Integer>> con n + 1 listas; add en los dos extremos. Grado = adj.get(v).size(). Memoria O(N + M).',
    },
  },
};
