import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

type Op = ['U' | 'P', number, number];

const cuerdas = (n: number, ops: Op[]): [string, string] => {
  const padre = Array.from({ length: n + 1 }, (_, i) => i);
  const raiz = (x: number) => {
    while (padre[x] !== x) {
      padre[x] = padre[padre[x]!]!;
      x = padre[x]!;
    }
    return x;
  };
  const res: string[] = [];
  for (const [t, a, b] of ops) {
    if (t === 'U') padre[raiz(a)] = raiz(b);
    else res.push(raiz(a) === raiz(b) ? 'SI' : 'NO');
  }
  return [`${n} ${ops.length}\n${ops.map(([t, a, b]) => `${t} ${a} ${b}`).join('\n')}`, res.join('\n')];
};

const r = rng(4848);
const barajar = <T>(a: T[]): T[] => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = r(0, i);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};
const N = 100000;
const Q = 200000;
const PREGUNTAS = 15000;
/** Cuerdas y preguntas al azar, mezcladas. */
const mezcla = (n: number, q: number, preguntas: number): Op[] => {
  const ops: Op[] = [];
  for (let i = 0; i < q; i++) ops.push([i < preguntas ? 'P' : 'U', r(1, n), r(1, n)]);
  return barajar(ops);
};
// Dos cordadas larguísimas (impares y pares, en orden mezclado) y luego muchas preguntas.
// Recorrer el grafo en cada pregunta obliga a visitar 5·10⁴ refugios cada vez.
const cordadas = (() => {
  const impares = barajar(Array.from({ length: N / 2 }, (_, i) => 2 * i + 1));
  const pares = barajar(Array.from({ length: N / 2 }, (_, i) => 2 * i + 2));
  const ops: Op[] = barajar([
    ...impares.slice(1).map((v, i): Op => ['U', impares[i]!, v]),
    ...pares.slice(1).map((v, i): Op => ['U', pares[i]!, v]),
  ]);
  for (let i = 0; i < PREGUNTAS; i++) {
    const a = r(1, N);
    const b = i % 10 === 0 ? (a % 2 === 0 ? 2 * r(1, N / 2) : 2 * r(1, N / 2) - 1) : a % 2 === 0 ? 2 * r(1, N / 2) - 1 : 2 * r(1, N / 2);
    ops.push(['P', a, b]);
  }
  return ops;
})();
// Una cadena que crece poco a poco, con una pregunta de punta a punta cada pocas cuerdas.
const creciente = (() => {
  const p = barajar(Array.from({ length: N }, (_, i) => i + 1));
  const ops: Op[] = [];
  for (let i = 1; i < N; i++) {
    ops.push(['U', p[i - 1]!, p[i]!]);
    if (i % 8 === 0) ops.push(['P', p[0]!, p[N - 1]!]);
  }
  ops.push(['P', p[N - 1]!, p[0]!]);
  return ops;
})();

export const nivel48: Level = {
  number: 48,
  id: 'n48-union-find',
  title: 'Union-Find',
  topic: 'Grafos: conjuntos disjuntos',
  npc: { id: 'olga', name: 'OLGA', title: 'Tendedora de cuerdas', sprite: 'npc48', x: 14, y: 8 },
  greeting: 'Una cuerda aquí, otra allá... ¿y ahora quién está unido con quién?',
  intro: [
    { speaker: 'OLGA', text: 'Hola, soy Olga. Tiendo cuerdas entre refugios para que nadie quede aislado.' },
    { speaker: 'OLGA', text: 'Todo el día pasa lo mismo: tiendo una cuerda nueva y alguien grita: "¿El refugio 5 ya está unido con el 900?"' },
    { speaker: 'OLGA', text: 'Si cada vez recorro todas las cuerdas para responder, no termino nunca.' },
    { speaker: 'OLGA', text: 'Hay una estructura perfecta para esto: Union-Find. ¿Te la explico o vamos al duelo?' },
  ],
  lesson: {
    concept: 'UNION-FIND (DSU)',
    goals: ['Representar grupos con un arreglo de padres', 'Unir dos grupos y preguntar si dos elementos están juntos', 'Hacerlo casi en O(1) con compresión de caminos'],
    explanation:
      'Union-Find guarda los grupos como árboles: padre[x] apunta hacia el jefe de su grupo, y el jefe se apunta a sí mismo. ' +
      'find(x) sube por los padres hasta el jefe. Dos elementos están unidos si tienen el mismo jefe. ' +
      'union(a, b) cuelga el jefe de un grupo del jefe del otro. Con dos trucos, colgar el grupo chico del grande ' +
      'y comprimir el camino (al subir, apuntar todo directo al jefe), cada operación cuesta casi O(1).',
    code: {
      python: code`
        import sys
        input = sys.stdin.readline

        def find(x):
            raiz = x
            while padre[raiz] != raiz:
                raiz = padre[raiz]
            while padre[x] != raiz:
                siguiente = padre[x]
                padre[x] = raiz
                x = siguiente
            return raiz

        n, m = map(int, input().split())
        padre = list(range(n + 1))
        tam = [1] * (n + 1)
        grupos = n
        for _ in range(m):
            a, b = map(int, input().split())
            ra, rb = find(a), find(b)
            if ra != rb:
                if tam[ra] < tam[rb]:
                    ra, rb = rb, ra
                padre[rb] = ra
                tam[ra] += tam[rb]
                grupos -= 1
        print(grupos)
      `,
      cpp: code`
        #include <iostream>
        #include <utility>
        #include <vector>
        using namespace std;

        vector<int> padre, tam;

        int find(int x) {
            if (padre[x] == x) return x;
            return padre[x] = find(padre[x]);
        }

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, m;
            cin >> n >> m;
            padre.resize(n + 1);
            tam.assign(n + 1, 1);
            for (int i = 0; i <= n; i++) padre[i] = i;
            int grupos = n;
            for (int i = 0; i < m; i++) {
                int a, b;
                cin >> a >> b;
                int ra = find(a), rb = find(b);
                if (ra != rb) {
                    if (tam[ra] < tam[rb]) swap(ra, rb);
                    padre[rb] = ra;
                    tam[ra] += tam[rb];
                    grupos--;
                }
            }
            cout << grupos << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.StringTokenizer;

        public class Main {
            static int[] padre, tam;

            static int find(int x) {
                int raiz = x;
                while (padre[raiz] != raiz) raiz = padre[raiz];
                while (padre[x] != raiz) {
                    int siguiente = padre[x];
                    padre[x] = raiz;
                    x = siguiente;
                }
                return raiz;
            }

            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int m = Integer.parseInt(st.nextToken());
                padre = new int[n + 1];
                tam = new int[n + 1];
                for (int i = 0; i <= n; i++) {
                    padre[i] = i;
                    tam[i] = 1;
                }
                int grupos = n;
                for (int i = 0; i < m; i++) {
                    st = new StringTokenizer(br.readLine());
                    int ra = find(Integer.parseInt(st.nextToken()));
                    int rb = find(Integer.parseInt(st.nextToken()));
                    if (ra != rb) {
                        if (tam[ra] < tam[rb]) {
                            int t = ra;
                            ra = rb;
                            rb = t;
                        }
                        padre[rb] = ra;
                        tam[ra] += tam[rb];
                        grupos--;
                    }
                }
                System.out.println(grupos);
            }
        }
      `,
    },
    examples: [
      { input: '5 3\n1 2\n3 4\n2 1', output: '3' },
      { input: '4 3\n1 2\n2 3\n3 4', output: '1' },
      { input: '3 0', output: '3' },
    ],
    tips: {
      python: 'Escribe find con un while, no con recursión: es más rápido en Python y no choca con el límite de 1000 llamadas.',
      cpp: 'return padre[x] = find(padre[x]); comprime el camino en una línea. Con unión por tamaño la recursión queda muy corta.',
      java: 'Haz find iterativo: primero sube hasta la raíz, luego vuelve a recorrer el camino apuntando todo a ella.',
    },
    quiz: {
      question: 'Con este arreglo de padres, ¿qué devuelve find(4)?',
      code: {
        python: code`
          padre = [0, 1, 1, 2, 3]

          def find(x):
              while padre[x] != x:
                  x = padre[x]
              return x

          print(find(4))
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int padre[] = {0, 1, 1, 2, 3};

          int find(int x) {
              while (padre[x] != x) x = padre[x];
              return x;
          }

          int main() {
              cout << find(4) << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              static int[] padre = {0, 1, 1, 2, 3};

              static int find(int x) {
                  while (padre[x] != x) x = padre[x];
                  return x;
              }

              public static void main(String[] args) {
                  System.out.println(find(4));
              }
          }
        `,
      },
      options: ['3', '2', '1'],
      answer: 2,
      explanation: '4 apunta a 3, 3 a 2, 2 a 1, y 1 se apunta a sí mismo: el 1 es el jefe del grupo.',
      wrongHint: 'find no se detiene en el primer padre: sube hasta encontrar un nodo que se apunte a sí mismo.',
    },
  },
  problem: {
    id: 'p48-cuerdas-de-olga',
    title: 'LAS CUERDAS DE OLGA',
    statement:
      'Hay N refugios, al principio sin ninguna cuerda. Llegan Q operaciones en orden. "U a b": Olga tiende una cuerda entre a y b. ' +
      '"P a b": alguien pregunta si a y b ya están unidos, directamente o pasando por otros refugios. ' +
      'Responde cada pregunta con SI o NO. Recorrer el grafo en cada pregunta es demasiado lento.',
    inputSpec: 'Línea 1: N y Q. Siguientes Q líneas: una letra (U o P) y dos enteros a y b.',
    outputSpec: 'Una línea por cada pregunta P, en orden: SI o NO.',
    constraints: '1 ≤ N ≤ 10⁵ · 1 ≤ Q ≤ 2·10⁵ · Hay entre 1 y 2·10⁴ preguntas P · 1 ≤ a, b ≤ N (a puede ser igual a b).',
    difficulty: 'dificil',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      cuerdas(5, [['P', 1, 2], ['U', 1, 2], ['P', 2, 1], ['U', 3, 4], ['U', 2, 3], ['P', 1, 4], ['P', 5, 1]]),
      cuerdas(3, [['U', 1, 2], ['P', 3, 3], ['P', 2, 3]]),
      cuerdas(2, [['U', 2, 2], ['P', 1, 2], ['U', 1, 2], ['P', 2, 1]]),
      cuerdas(50, mezcla(50, 300, 120)),
      cuerdas(N, mezcla(N, Q, PREGUNTAS)),
      cuerdas(N, cordadas),
      cuerdas(N, creciente),
      cuerdas(N, mezcla(N, PREGUNTAS, PREGUNTAS)),
    ]),
    starter: {
      python: code`
        import sys
        input = sys.stdin.readline

        n, q = map(int, input().split())
        padre = list(range(n + 1))
        tam = [1] * (n + 1)

        def find(x):
            # TODO: sube hasta la raíz y comprime el camino
            return x

        res = []
        for _ in range(q):
            t, a, b = input().split()
            a, b = int(a), int(b)
            if t == "U":
                pass  # TODO: une los grupos de a y b (el chico cuelga del grande)
            else:
                res.append("SI" if find(a) == find(b) else "NO")
        print("\n".join(res))
      `,
      cpp: code`
        #include <iostream>
        #include <string>
        #include <vector>
        using namespace std;

        vector<int> padre, tam;

        int find(int x) {
            // TODO: sube hasta la raíz y comprime el camino
            return x;
        }

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, q;
            cin >> n >> q;
            padre.resize(n + 1);
            tam.assign(n + 1, 1);
            for (int i = 0; i <= n; i++) padre[i] = i;
            string res;
            for (int i = 0; i < q; i++) {
                char t;
                int a, b;
                cin >> t >> a >> b;
                if (t == 'U') {
                    // TODO: une los grupos de a y b (el chico cuelga del grande)
                } else {
                    res += find(a) == find(b) ? "SI\n" : "NO\n";
                }
            }
            cout << res;
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.StringTokenizer;

        public class Main {
            static int[] padre, tam;

            static int find(int x) {
                // TODO: sube hasta la raíz y comprime el camino
                return x;
            }

            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int q = Integer.parseInt(st.nextToken());
                padre = new int[n + 1];
                tam = new int[n + 1];
                for (int i = 0; i <= n; i++) {
                    padre[i] = i;
                    tam[i] = 1;
                }
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < q; i++) {
                    st = new StringTokenizer(br.readLine());
                    String t = st.nextToken();
                    int a = Integer.parseInt(st.nextToken());
                    int b = Integer.parseInt(st.nextToken());
                    if (t.equals("U")) {
                        // TODO: une los grupos de a y b (el chico cuelga del grande)
                    } else {
                        sb.append(find(a) == find(b) ? "SI\n" : "NO\n");
                    }
                }
                System.out.print(sb);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        input = sys.stdin.readline

        n, q = map(int, input().split())
        padre = list(range(n + 1))
        tam = [1] * (n + 1)

        def find(x):
            raiz = x
            while padre[raiz] != raiz:
                raiz = padre[raiz]
            while padre[x] != raiz:
                siguiente = padre[x]
                padre[x] = raiz
                x = siguiente
            return raiz

        res = []
        for _ in range(q):
            t, a, b = input().split()
            ra, rb = find(int(a)), find(int(b))
            if t == "U":
                if ra != rb:
                    if tam[ra] < tam[rb]:
                        ra, rb = rb, ra
                    padre[rb] = ra
                    tam[ra] += tam[rb]
            else:
                res.append("SI" if ra == rb else "NO")
        print("\n".join(res))
      `,
      cpp: code`
        #include <iostream>
        #include <string>
        #include <utility>
        #include <vector>
        using namespace std;

        vector<int> padre, tam;

        int find(int x) {
            if (padre[x] == x) return x;
            return padre[x] = find(padre[x]);
        }

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, q;
            cin >> n >> q;
            padre.resize(n + 1);
            tam.assign(n + 1, 1);
            for (int i = 0; i <= n; i++) padre[i] = i;
            string res;
            for (int i = 0; i < q; i++) {
                char t;
                int a, b;
                cin >> t >> a >> b;
                int ra = find(a), rb = find(b);
                if (t == 'U') {
                    if (ra != rb) {
                        if (tam[ra] < tam[rb]) swap(ra, rb);
                        padre[rb] = ra;
                        tam[ra] += tam[rb];
                    }
                } else {
                    res += ra == rb ? "SI\n" : "NO\n";
                }
            }
            cout << res;
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.StringTokenizer;

        public class Main {
            static int[] padre, tam;

            static int find(int x) {
                int raiz = x;
                while (padre[raiz] != raiz) raiz = padre[raiz];
                while (padre[x] != raiz) {
                    int siguiente = padre[x];
                    padre[x] = raiz;
                    x = siguiente;
                }
                return raiz;
            }

            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int q = Integer.parseInt(st.nextToken());
                padre = new int[n + 1];
                tam = new int[n + 1];
                for (int i = 0; i <= n; i++) {
                    padre[i] = i;
                    tam[i] = 1;
                }
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < q; i++) {
                    st = new StringTokenizer(br.readLine());
                    String t = st.nextToken();
                    int ra = find(Integer.parseInt(st.nextToken()));
                    int rb = find(Integer.parseInt(st.nextToken()));
                    if (t.equals("U")) {
                        if (ra != rb) {
                            if (tam[ra] < tam[rb]) {
                                int tmp = ra;
                                ra = rb;
                                rb = tmp;
                            }
                            padre[rb] = ra;
                            tam[ra] += tam[rb];
                        }
                    } else {
                        sb.append(ra == rb ? "SI\n" : "NO\n");
                    }
                }
                System.out.print(sb);
            }
        }
      `,
    },
    hints: [
      'No hace falta saber el camino entre a y b, solo si están en el mismo grupo. Dale a cada grupo un jefe.',
      'Con un arreglo padre (cada uno se apunta a sí mismo al inicio), find(x) sube hasta el jefe. Están unidos si find(a) == find(b).',
      'Para U: ra = find(a), rb = find(b); si son distintos, cuelga el grupo chico del grande (padre[rb] = ra y suma tamaños). En find, apunta cada nodo del camino directo a la raíz.',
    ],
  },
  outro: [
    { speaker: 'OLGA', text: 'Quince mil preguntas y ni me despeiné. Cada respuesta, en un parpadeo.' },
    { speaker: 'OLGA', text: 'Un arreglo de padres, un find que comprime y una unión por tamaño. Pequeño, pero poderoso.' },
    { speaker: 'OLGA', text: 'Ignacio, el de los teleféricos, está bajando hacia el gimnasio. Quiere unir toda la montaña gastando lo mínimo.' },
  ],
  rewardTip: {
    title: 'Union-Find',
    text: {
      python: 'padre = list(range(n + 1)). find iterativo con compresión; une el grupo chico al grande. Casi O(1) por operación.',
      cpp: 'int find(int x) { return padre[x] == x ? x : padre[x] = find(padre[x]); } + unión por tamaño.',
      java: 'int[] padre; find iterativo que apunta todo el camino a la raíz; unión por tamaño. Casi O(1) por operación.',
    },
  },
};
