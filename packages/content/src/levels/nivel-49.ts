import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

type Cable = [number, number, number];

const telefericos = (n: number, cables: Cable[]): [string, string] => {
  const padre = Array.from({ length: n + 1 }, (_, i) => i);
  const raiz = (x: number) => {
    while (padre[x] !== x) {
      padre[x] = padre[padre[x]!]!;
      x = padre[x]!;
    }
    return x;
  };
  const orden = cables.map((_, i) => i).sort((x, y) => cables[x]![2] - cables[y]![2]);
  let total = 0;
  let usados = 0;
  for (const i of orden) {
    const [a, b, c] = cables[i]!;
    const ra = raiz(a);
    const rb = raiz(b);
    if (ra !== rb) {
      padre[ra] = rb;
      total += c;
      usados++;
    }
  }
  const texto = cables.length ? `\n${cables.map(([a, b, c]) => `${a} ${b} ${c}`).join('\n')}` : '';
  return [`${n} ${cables.length}${texto}`, usados === n - 1 ? `${total}` : 'IMPOSIBLE'];
};

const r = rng(4949);
const barajar = <T>(a: T[]): T[] => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = r(0, i);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};
/** Árbol al azar más cables extra: todo queda conectado. */
const conectado = (n: number, m: number, lo: number, hi: number): Cable[] => {
  const res: Cable[] = [];
  for (let v = 2; v <= n; v++) res.push([r(1, v - 1), v, r(lo, hi)]);
  while (res.length < m) {
    const a = r(1, n);
    const b = r(1, n);
    if (a !== b) res.push([a, b, r(lo, hi)]);
  }
  return barajar(res);
};
const N = 100000;
const M = 150000;
const carisimo = barajar([
  ...Array.from({ length: N - 1 }, (_, i): Cable => [i + 1, i + 2, 1000000]),
  ...Array.from({ length: N / 2 }, (): Cable => {
    const a = r(1, N - 2);
    return [a, a + 2, 1000000];
  }),
]);
// Dos montañas separadas: por muchos cables que haya, nunca se unen.
const separadas = barajar([
  ...conectado(N / 2, M / 2, 1, 1000000),
  ...conectado(N / 2, M / 2, 1, 1000000).map(([a, b, c]): Cable => [a + N / 2, b + N / 2, c]),
]);

export const nivel49: Level = {
  number: 49,
  id: 'n49-kruskal',
  title: 'Árbol de expansión mínima',
  topic: 'Grafos: Kruskal',
  npc: { id: 'ignacio', name: 'IGNACIO', title: 'Constructor de teleféricos', sprite: 'npc49', x: 12, y: 10 },
  greeting: 'Cada metro de cable cuesta. Quiero unir toda la montaña sin gastar de más.',
  intro: [
    { speaker: 'IGNACIO', text: 'Buenas. Soy Ignacio y construyo teleféricos entre las estaciones de la montaña.' },
    { speaker: 'IGNACIO', text: 'Tengo una lista de cables posibles, cada uno con su precio. Quiero que todas las estaciones queden conectadas.' },
    { speaker: 'IGNACIO', text: 'No necesito todos los cables: con los justos alcanza. El truco es elegir los más baratos sin cerrar círculos.' },
    { speaker: 'IGNACIO', text: 'Olga ya te enseñó Union-Find, ¿verdad? Lo vamos a necesitar. ¿Lección o duelo?' },
  ],
  lesson: {
    concept: 'KRUSKAL · ÁRBOL DE EXPANSIÓN MÍNIMA',
    goals: ['Ordenar las aristas de la más barata a la más cara', 'Tomar una arista solo si une dos grupos distintos', 'Usar Union-Find para detectar ciclos'],
    explanation:
      'Un árbol de expansión conecta los N nodos usando exactamente N - 1 aristas y sin ciclos. El mínimo es el que cuesta menos. ' +
      'Kruskal es un algoritmo goloso: ordena las aristas por costo y recórrelas; toma cada una solo si sus extremos están en grupos distintos ' +
      '(si ya estaban unidos, cerraría un ciclo). Union-Find responde eso al instante. ' +
      'Si al final tomaste menos de N - 1 aristas, el grafo no estaba conectado. Cuesta O(M log M) por el ordenamiento.',
    code: {
      python: code`
        import sys
        input = sys.stdin.readline

        def find(x):
            while padre[x] != x:
                padre[x] = padre[padre[x]]
                x = padre[x]
            return x

        n, m = map(int, input().split())
        cables = []
        for _ in range(m):
            a, b, c = map(int, input().split())
            cables.append((c, a, b))
        cables.sort()
        padre = list(range(n + 1))
        for c, a, b in cables:
            ra, rb = find(a), find(b)
            if ra != rb:
                padre[ra] = rb
                print(a, b, c)
      `,
      cpp: code`
        #include <algorithm>
        #include <iostream>
        #include <tuple>
        #include <vector>
        using namespace std;

        vector<int> padre;

        int find(int x) {
            if (padre[x] == x) return x;
            return padre[x] = find(padre[x]);
        }

        int main() {
            int n, m;
            cin >> n >> m;
            vector<tuple<int, int, int>> cables(m);
            for (auto& [c, a, b] : cables) cin >> a >> b >> c;
            sort(cables.begin(), cables.end());
            padre.resize(n + 1);
            for (int i = 0; i <= n; i++) padre[i] = i;
            for (auto& [c, a, b] : cables) {
                int ra = find(a), rb = find(b);
                if (ra != rb) {
                    padre[ra] = rb;
                    cout << a << " " << b << " " << c << "\n";
                }
            }
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.Arrays;
        import java.util.StringTokenizer;

        public class Main {
            static int[] padre;

            static int find(int x) {
                while (padre[x] != x) {
                    padre[x] = padre[padre[x]];
                    x = padre[x];
                }
                return x;
            }

            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int m = Integer.parseInt(st.nextToken());
                int[][] cables = new int[m][3];
                for (int i = 0; i < m; i++) {
                    st = new StringTokenizer(br.readLine());
                    for (int k = 0; k < 3; k++) cables[i][k] = Integer.parseInt(st.nextToken());
                }
                Arrays.sort(cables, (x, y) -> Integer.compare(x[2], y[2]));
                padre = new int[n + 1];
                for (int i = 0; i <= n; i++) padre[i] = i;
                StringBuilder sb = new StringBuilder();
                for (int[] e : cables) {
                    int ra = find(e[0]), rb = find(e[1]);
                    if (ra != rb) {
                        padre[ra] = rb;
                        sb.append(e[0]).append(" ").append(e[1]).append(" ").append(e[2]).append("\n");
                    }
                }
                System.out.print(sb);
            }
        }
      `,
    },
    examples: [
      { input: '4 5\n1 2 3\n2 3 1\n3 4 4\n1 4 2\n1 3 5', output: '2 3 1\n1 4 2\n1 2 3' },
      { input: '3 3\n1 2 5\n2 3 6\n1 3 7', output: '1 2 5\n2 3 6' },
      { input: '4 2\n1 2 9\n3 4 8', output: '3 4 8\n1 2 9' },
    ],
    tips: {
      python: 'Guarda cada cable como (c, a, b): así sort() ordena por costo sin pasarle key. Lee con sys.stdin.readline.',
      cpp: 'Un tuple<int, int, int> con el costo primero se ordena solo por costo. La suma total puede pasar de 2·10⁹: usa long long.',
      java: 'Arrays.sort con comparador Integer.compare(x[2], y[2]). La suma total puede pasar de 2·10⁹: guárdala en un long.',
    },
    quiz: {
      question: 'Kruskal recorre estos 8 cables de un grafo conectado de 5 nodos. ¿Cuántos toma?',
      code: {
        python: code`
          cables = [(1, 1, 2), (2, 2, 3), (3, 1, 3), (4, 3, 4), (5, 2, 4), (6, 4, 5), (7, 1, 5), (8, 3, 5)]
          padre = list(range(6))

          def find(x):
              while padre[x] != x:
                  x = padre[x]
              return x

          tomados = 0
          for c, a, b in cables:
              ra, rb = find(a), find(b)
              if ra != rb:
                  padre[ra] = rb
                  tomados += 1
          print(tomados)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int padre[6] = {0, 1, 2, 3, 4, 5};

          int find(int x) {
              while (padre[x] != x) x = padre[x];
              return x;
          }

          int main() {
              int cables[8][3] = {{1, 1, 2}, {2, 2, 3}, {3, 1, 3}, {4, 3, 4}, {5, 2, 4}, {6, 4, 5}, {7, 1, 5}, {8, 3, 5}};
              int tomados = 0;
              for (auto& e : cables) {
                  int ra = find(e[1]), rb = find(e[2]);
                  if (ra != rb) {
                      padre[ra] = rb;
                      tomados++;
                  }
              }
              cout << tomados << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              static int[] padre = {0, 1, 2, 3, 4, 5};

              static int find(int x) {
                  while (padre[x] != x) x = padre[x];
                  return x;
              }

              public static void main(String[] args) {
                  int[][] cables = {{1, 1, 2}, {2, 2, 3}, {3, 1, 3}, {4, 3, 4}, {5, 2, 4}, {6, 4, 5}, {7, 1, 5}, {8, 3, 5}};
                  int tomados = 0;
                  for (int[] e : cables) {
                      int ra = find(e[1]), rb = find(e[2]);
                      if (ra != rb) {
                          padre[ra] = rb;
                          tomados++;
                      }
                  }
                  System.out.println(tomados);
              }
          }
        `,
      },
      options: ['4', '5', '8'],
      answer: 0,
      explanation: 'Un árbol que une N nodos siempre tiene N - 1 aristas: con 5 nodos, 4 cables. Los demás cerrarían un ciclo.',
      wrongHint: 'Cada cable tomado une dos grupos en uno. Si empiezas con 5 grupos, ¿cuántas uniones hacen falta para quedar en 1?',
    },
  },
  problem: {
    id: 'p49-telefericos-de-ignacio',
    title: 'LOS TELEFÉRICOS DE IGNACIO',
    statement:
      'Hay N estaciones y M cables posibles. El cable entre a y b cuesta c monedas. ' +
      'Ignacio quiere elegir cables para que desde cualquier estación se pueda llegar a cualquier otra, gastando lo menos posible. ' +
      'Imprime el costo mínimo total, o IMPOSIBLE si ni con todos los cables se conectan todas las estaciones.',
    inputSpec: 'Línea 1: N y M. Siguientes M líneas: tres enteros a, b y c, un cable posible entre a y b que cuesta c.',
    outputSpec: 'Un entero: el costo mínimo para conectar todas las estaciones, o IMPOSIBLE.',
    constraints: '1 ≤ N ≤ 10⁵ · 0 ≤ M ≤ 2·10⁵ · 1 ≤ c ≤ 10⁶ · Puede haber cables repetidos entre las mismas estaciones. El total puede pasar de 2·10⁹.',
    difficulty: 'dificil',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      telefericos(4, [[1, 2, 3], [2, 3, 1], [3, 4, 4], [1, 4, 2], [1, 3, 5]]),
      telefericos(4, [[1, 2, 5], [3, 4, 1]]),
      telefericos(1, []),
      telefericos(3, [[1, 2, 5], [1, 2, 2], [2, 3, 4], [2, 3, 9], [3, 1, 3]]),
      telefericos(N, conectado(N, M, 1, 1000000)),
      telefericos(N, carisimo),
      telefericos(50000, conectado(50000, 100000, 7, 7)),
      telefericos(N, separadas),
      telefericos(2000, conectado(2000, 100000, 1, 1000000)),
    ]),
    starter: {
      python: code`
        import sys
        input = sys.stdin.readline

        def find(x):
            while padre[x] != x:
                padre[x] = padre[padre[x]]
                x = padre[x]
            return x

        n, m = map(int, input().split())
        cables = []
        for _ in range(m):
            a, b, c = map(int, input().split())
            cables.append((c, a, b))
        padre = list(range(n + 1))
        total = 0
        usados = 0
        # TODO: ordena por costo y toma cada cable que una dos grupos distintos
        print(total if usados == n - 1 else "IMPOSIBLE")
      `,
      cpp: code`
        #include <algorithm>
        #include <iostream>
        #include <tuple>
        #include <vector>
        using namespace std;

        vector<int> padre;

        int find(int x) {
            if (padre[x] == x) return x;
            return padre[x] = find(padre[x]);
        }

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, m;
            cin >> n >> m;
            vector<tuple<int, int, int>> cables(m);
            for (auto& [c, a, b] : cables) cin >> a >> b >> c;
            padre.resize(n + 1);
            for (int i = 0; i <= n; i++) padre[i] = i;
            long long total = 0;
            int usados = 0;
            // TODO: ordena por costo y toma cada cable que una dos grupos distintos
            if (usados == n - 1) cout << total << "\n";
            else cout << "IMPOSIBLE\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.Arrays;
        import java.util.StringTokenizer;

        public class Main {
            static int[] padre;

            static int find(int x) {
                while (padre[x] != x) {
                    padre[x] = padre[padre[x]];
                    x = padre[x];
                }
                return x;
            }

            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int m = Integer.parseInt(st.nextToken());
                int[][] cables = new int[m][3];
                for (int i = 0; i < m; i++) {
                    st = new StringTokenizer(br.readLine());
                    for (int k = 0; k < 3; k++) cables[i][k] = Integer.parseInt(st.nextToken());
                }
                padre = new int[n + 1];
                for (int i = 0; i <= n; i++) padre[i] = i;
                long total = 0;
                int usados = 0;
                // TODO: ordena por costo y toma cada cable que una dos grupos distintos
                System.out.println(usados == n - 1 ? String.valueOf(total) : "IMPOSIBLE");
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        input = sys.stdin.readline

        def find(x):
            while padre[x] != x:
                padre[x] = padre[padre[x]]
                x = padre[x]
            return x

        n, m = map(int, input().split())
        cables = []
        for _ in range(m):
            a, b, c = map(int, input().split())
            cables.append((c, a, b))
        cables.sort()
        padre = list(range(n + 1))
        total = 0
        usados = 0
        for c, a, b in cables:
            ra, rb = find(a), find(b)
            if ra != rb:
                padre[ra] = rb
                total += c
                usados += 1
                if usados == n - 1:
                    break
        print(total if usados == n - 1 else "IMPOSIBLE")
      `,
      cpp: code`
        #include <algorithm>
        #include <iostream>
        #include <tuple>
        #include <vector>
        using namespace std;

        vector<int> padre;

        int find(int x) {
            if (padre[x] == x) return x;
            return padre[x] = find(padre[x]);
        }

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, m;
            cin >> n >> m;
            vector<tuple<int, int, int>> cables(m);
            for (auto& [c, a, b] : cables) cin >> a >> b >> c;
            sort(cables.begin(), cables.end());
            padre.resize(n + 1);
            for (int i = 0; i <= n; i++) padre[i] = i;
            long long total = 0;
            int usados = 0;
            for (auto& [c, a, b] : cables) {
                int ra = find(a), rb = find(b);
                if (ra != rb) {
                    padre[ra] = rb;
                    total += c;
                    usados++;
                }
            }
            if (usados == n - 1) cout << total << "\n";
            else cout << "IMPOSIBLE\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.Arrays;
        import java.util.StringTokenizer;

        public class Main {
            static int[] padre;

            static int find(int x) {
                while (padre[x] != x) {
                    padre[x] = padre[padre[x]];
                    x = padre[x];
                }
                return x;
            }

            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int m = Integer.parseInt(st.nextToken());
                int[][] cables = new int[m][3];
                for (int i = 0; i < m; i++) {
                    st = new StringTokenizer(br.readLine());
                    for (int k = 0; k < 3; k++) cables[i][k] = Integer.parseInt(st.nextToken());
                }
                Arrays.sort(cables, (x, y) -> Integer.compare(x[2], y[2]));
                padre = new int[n + 1];
                for (int i = 0; i <= n; i++) padre[i] = i;
                long total = 0;
                int usados = 0;
                for (int[] e : cables) {
                    int ra = find(e[0]), rb = find(e[1]);
                    if (ra != rb) {
                        padre[ra] = rb;
                        total += e[2];
                        usados++;
                    }
                }
                System.out.println(usados == n - 1 ? String.valueOf(total) : "IMPOSIBLE");
            }
        }
      `,
    },
    hints: [
      'Piensa como un tacaño: empieza por el cable más barato. ¿Cuándo NO conviene tomar un cable barato?',
      'Un cable no sirve si sus dos estaciones ya estaban conectadas: cerraría un círculo. Union-Find te dice eso al instante.',
      'Ordena los cables por costo. Para cada uno: si find(a) != find(b), únelos, suma c al total y cuenta un cable más. Si al final usaste N - 1 cables, imprime el total; si no, IMPOSIBLE.',
    ],
  },
  outro: [
    { speaker: 'IGNACIO', text: 'Toda la montaña conectada y ni una moneda de más. Así da gusto construir.' },
    { speaker: 'IGNACIO', text: 'Ordenar y unir sin cerrar círculos: Kruskal es goloso, pero esta vez ser goloso es lo correcto.' },
    { speaker: 'IGNACIO', text: 'Ya estás listo para la Alpinista Kora, la líder del Gimnasio Montaña. Te espera frente a la puerta.' },
  ],
  rewardTip: {
    title: 'Kruskal',
    text: {
      python: 'cables.append((c, a, b)); cables.sort(). Toma el cable si find(a) != find(b). N - 1 cables = conectado.',
      cpp: 'sort de tuple<int,int,int> con el costo primero + Union-Find. Total en long long. N - 1 cables = conectado.',
      java: 'Arrays.sort por costo + Union-Find. Total en long. Si usaste menos de N - 1 cables: IMPOSIBLE.',
    },
  },
};
