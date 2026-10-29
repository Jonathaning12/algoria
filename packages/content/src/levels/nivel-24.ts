import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

type Minero = [nombre: string, gemas: number, minutos: number];

const ranking = (k: number, m: Minero[]): [string, string] => {
  const orden = [...m].sort((a, b) => b[1] - a[1] || a[2] - b[2] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  return [
    `${m.length} ${k}\n${m.map((x) => x.join(' ')).join('\n')}`,
    orden.slice(0, k).map((x) => x[0]).join('\n'),
  ];
};

const r = rng(2424);
const usados = new Set<string>();
const nombre = () => {
  for (;;) {
    const len = r(3, 10);
    let s = '';
    for (let i = 0; i < len; i++) s += String.fromCharCode(97 + r(0, 25));
    if (!usados.has(s)) {
      usados.add(s);
      return s;
    }
  }
};
const cuadrilla = (n: number, maxGemas: number, maxMin: number): Minero[] =>
  Array.from({ length: n }, () => [nombre(), r(0, maxGemas), r(1, maxMin)]);

const N = 100000;
const variada = cuadrilla(N, 1000000000, 1000000000);
// Muchísimos empates: decide el tiempo y, sobre todo, el nombre.
const empatada = cuadrilla(N, 3, 2);
const iguales: Minero[] = Array.from({ length: 2000 }, () => [nombre(), 7, 7]);

export const nivel24: Level = {
  number: 24,
  id: 'n24-ordenar-criterio',
  title: 'Ordenar con criterio',
  topic: 'Ordenar con varias claves',
  npc: { id: 'roque', name: 'ROQUE', title: 'Capataz de la mina', sprite: 'npc24', x: 14, y: 4 },
  greeting: 'Primero las gemas, luego el tiempo, luego el nombre. En mi ranking no hay empates sin resolver.',
  intro: [
    { speaker: 'ROQUE', text: '¡Casco puesto! Soy Roque, el capataz de la mina.' },
    { speaker: 'ROQUE', text: 'Cada semana publico el ranking de mineros. El que saca más gemas va primero. Si empatan, el más rápido.' },
    { speaker: 'ROQUE', text: 'Y si aún empatan, por orden alfabético. No hace falta escribir tu propio ordenamiento: basta con decirle a la librería qué comparar.' },
    { speaker: 'ROQUE', text: '¿Te explico cómo o bajas directo al duelo?' },
  ],
  lesson: {
    concept: 'ORDENAR CON CRITERIO',
    goals: ['Ordenar con la función de la librería', 'Definir un criterio con varias claves', 'Ordenar de mayor a menor en una clave y de menor a mayor en otra'],
    explanation:
      'Ordenar n elementos con la librería cuesta O(n log n): rapidísimo incluso con 10⁵ datos. ' +
      'Lo interesante es elegir el criterio: primero se compara la clave principal y, solo si empatan, la siguiente. ' +
      'En Python, una key que devuelve una tupla hace justo eso; para invertir un número basta con ponerle signo menos. ' +
      'En C++ y Java escribes un comparador que dice si a va antes que b.',
    code: {
      python: code`
        n = int(input())
        gente = []
        for _ in range(n):
            nombre, puntos = input().split()
            gente.append((nombre, int(puntos)))
        # más puntos primero; si empatan, nombre alfabético
        gente.sort(key=lambda p: (-p[1], p[0]))
        for nombre, puntos in gente:
            print(nombre, puntos)
      `,
      cpp: code`
        #include <algorithm>
        #include <iostream>
        #include <string>
        #include <vector>
        using namespace std;

        int main() {
            int n;
            cin >> n;
            vector<pair<string, int>> gente(n);
            for (auto& p : gente) cin >> p.first >> p.second;
            // más puntos primero; si empatan, nombre alfabético
            sort(gente.begin(), gente.end(), [](const pair<string, int>& a, const pair<string, int>& b) {
                if (a.second != b.second) return a.second > b.second;
                return a.first < b.first;
            });
            for (auto& p : gente) cout << p.first << " " << p.second << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Arrays;
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                String[] nombres = new String[n];
                int[] puntos = new int[n];
                Integer[] orden = new Integer[n];
                for (int i = 0; i < n; i++) {
                    nombres[i] = sc.next();
                    puntos[i] = sc.nextInt();
                    orden[i] = i;
                }
                // más puntos primero; si empatan, nombre alfabético
                Arrays.sort(orden, (a, b) -> {
                    if (puntos[a] != puntos[b]) return Integer.compare(puntos[b], puntos[a]);
                    return nombres[a].compareTo(nombres[b]);
                });
                for (int i : orden) System.out.println(nombres[i] + " " + puntos[i]);
            }
        }
      `,
    },
    examples: [
      { input: '3\nana 5\nbeto 9\ncata 5', output: 'beto 9\nana 5\ncata 5' },
      { input: '2\nzoe 1\nabel 1', output: 'abel 1\nzoe 1' },
      { input: '1\nroque 0', output: 'roque 0' },
    ],
    tips: {
      python: 'key=lambda m: (-gemas, minutos, nombre): la tupla compara clave por clave. El signo menos invierte solo esa clave.',
      cpp: 'El comparador debe responder "¿a va estrictamente antes que b?". Nunca devuelvas true si son iguales: rompe sort.',
      java: 'Arrays.sort con lambda necesita objetos (Integer[], no int[]). Integer.compare evita desbordes al restar.',
    },
    quiz: {
      question: '¿Qué palabra queda primero?',
      code: {
        python: code`
          rocas = ["roca", "sal", "gema", "oro"]
          rocas.sort(key=lambda p: (len(p), p))
          print(rocas[0])
        `,
        cpp: code`
          #include <algorithm>
          #include <iostream>
          #include <string>
          #include <vector>
          using namespace std;

          int main() {
              vector<string> rocas = {"roca", "sal", "gema", "oro"};
              sort(rocas.begin(), rocas.end(), [](const string& a, const string& b) {
                  if (a.size() != b.size()) return a.size() < b.size();
                  return a < b;
              });
              cout << rocas[0] << "\n";
              return 0;
          }
        `,
        java: code`
          import java.util.Arrays;

          public class Main {
              public static void main(String[] args) {
                  String[] rocas = {"roca", "sal", "gema", "oro"};
                  Arrays.sort(rocas, (a, b) -> {
                      if (a.length() != b.length()) return Integer.compare(a.length(), b.length());
                      return a.compareTo(b);
                  });
                  System.out.println(rocas[0]);
              }
          }
        `,
      },
      options: ['oro', 'sal', 'gema'],
      answer: 0,
      explanation: 'Primero se ordena por largo: oro y sal tienen 3 letras. Empatan, así que decide el orden alfabético: oro va antes que sal.',
      wrongHint: 'La primera clave es el largo de la palabra. ¿Qué palabras empatan en la más corta? Entre ellas, ¿cuál va primero en el diccionario?',
    },
  },
  problem: {
    id: 'p24-ranking-de-la-mina',
    title: 'EL RANKING DE LA MINA',
    statement:
      'Roque tiene la lista de los N mineros de la semana: su nombre, cuántas gemas sacaron y cuántos minutos tardaron. ' +
      'El ranking va así: primero quien tenga más gemas. Si empatan, quien haya tardado menos minutos. ' +
      'Si aún empatan, por orden alfabético del nombre. Imprime los nombres de los K primeros del ranking.',
    inputSpec: 'Línea 1: N y K. Luego N líneas, cada una con un nombre, las gemas y los minutos de un minero.',
    outputSpec: 'K líneas: los nombres de los K primeros del ranking, en orden.',
    constraints: '1 ≤ K ≤ N ≤ 10⁵ · K ≤ 1000 · Nombres distintos de 1 a 10 letras minúsculas · 0 ≤ gemas ≤ 10⁹ · 1 ≤ minutos ≤ 10⁹.',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      ranking(4, [['luis', 5, 30], ['ana', 8, 50], ['beto', 5, 20], ['carla', 5, 20]]),
      ranking(2, [['zeta', 1, 1], ['alfa', 1, 1], ['nube', 0, 1]]),
      ranking(1, [['solo', 0, 1]]),
      ranking(3, [['pico', 10, 5], ['pala', 10, 4], ['casco', 11, 100], ['mapa', 10, 4]]),
      ranking(1000, iguales),
      ranking(1000, variada),
      ranking(1000, empatada),
      ranking(1, variada),
      ranking(500, cuadrilla(1000, 50, 50)),
    ]),
    starter: {
      python: code`
        import sys

        data = sys.stdin.read().split()
        n, k = int(data[0]), int(data[1])
        mineros = []
        for i in range(n):
            nombre = data[2 + 3 * i]
            gemas = int(data[3 + 3 * i])
            minutos = int(data[4 + 3 * i])
            mineros.append((nombre, gemas, minutos))
        # TODO: ordena con key=lambda m: (...) para que queden más gemas primero,
        # luego menos minutos y luego el nombre alfabético
        print("\n".join(m[0] for m in mineros[:k]))
      `,
      cpp: code`
        #include <algorithm>
        #include <iostream>
        #include <string>
        #include <vector>
        using namespace std;

        struct Minero {
            string nombre;
            long long gemas, minutos;
        };

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, k;
            cin >> n >> k;
            vector<Minero> m(n);
            for (auto& x : m) cin >> x.nombre >> x.gemas >> x.minutos;
            // TODO: sort(m.begin(), m.end(), comparador) para que queden más gemas primero,
            // luego menos minutos y luego el nombre alfabético
            for (int i = 0; i < k; i++) cout << m[i].nombre << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.Arrays;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int k = Integer.parseInt(st.nextToken());
                String[] nombre = new String[n];
                long[] gemas = new long[n];
                long[] minutos = new long[n];
                Integer[] orden = new Integer[n];
                for (int i = 0; i < n; i++) {
                    st = new StringTokenizer(br.readLine());
                    nombre[i] = st.nextToken();
                    gemas[i] = Long.parseLong(st.nextToken());
                    minutos[i] = Long.parseLong(st.nextToken());
                    orden[i] = i;
                }
                // TODO: Arrays.sort(orden, (a, b) -> ...) para que queden más gemas primero,
                // luego menos minutos y luego el nombre alfabético
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < k; i++) sb.append(nombre[orden[i]]).append("\n");
                System.out.print(sb);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys

        data = sys.stdin.read().split()
        n, k = int(data[0]), int(data[1])
        mineros = []
        for i in range(n):
            nombre = data[2 + 3 * i]
            gemas = int(data[3 + 3 * i])
            minutos = int(data[4 + 3 * i])
            mineros.append((nombre, gemas, minutos))
        mineros.sort(key=lambda m: (-m[1], m[2], m[0]))
        print("\n".join(m[0] for m in mineros[:k]))
      `,
      cpp: code`
        #include <algorithm>
        #include <iostream>
        #include <string>
        #include <vector>
        using namespace std;

        struct Minero {
            string nombre;
            long long gemas, minutos;
        };

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, k;
            cin >> n >> k;
            vector<Minero> m(n);
            for (auto& x : m) cin >> x.nombre >> x.gemas >> x.minutos;
            sort(m.begin(), m.end(), [](const Minero& a, const Minero& b) {
                if (a.gemas != b.gemas) return a.gemas > b.gemas;
                if (a.minutos != b.minutos) return a.minutos < b.minutos;
                return a.nombre < b.nombre;
            });
            for (int i = 0; i < k; i++) cout << m[i].nombre << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.Arrays;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int k = Integer.parseInt(st.nextToken());
                String[] nombre = new String[n];
                long[] gemas = new long[n];
                long[] minutos = new long[n];
                Integer[] orden = new Integer[n];
                for (int i = 0; i < n; i++) {
                    st = new StringTokenizer(br.readLine());
                    nombre[i] = st.nextToken();
                    gemas[i] = Long.parseLong(st.nextToken());
                    minutos[i] = Long.parseLong(st.nextToken());
                    orden[i] = i;
                }
                Arrays.sort(orden, (a, b) -> {
                    if (gemas[a] != gemas[b]) return Long.compare(gemas[b], gemas[a]);
                    if (minutos[a] != minutos[b]) return Long.compare(minutos[a], minutos[b]);
                    return nombre[a].compareTo(nombre[b]);
                });
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < k; i++) sb.append(nombre[orden[i]]).append("\n");
                System.out.print(sb);
            }
        }
      `,
    },
    hints: [
      'No hace falta inventar un ordenamiento: usa el de la librería (sort) y solo dile cómo comparar a dos mineros.',
      'Compara clave por clave: si las gemas son distintas, gana quien tenga más. Si no, si los minutos son distintos, gana quien tenga menos. Si no, el nombre menor.',
      'Python: mineros.sort(key=lambda m: (-m[1], m[2], m[0])). C++/Java: un comparador con tres if, en ese orden. Luego imprime los K primeros.',
    ],
  },
  outro: [
    { speaker: 'ROQUE', text: '¡Ranking publicado y sin una sola queja! Cada empate se resolvió como debía.' },
    { speaker: 'ROQUE', text: 'Ordenar es el primer paso de muchísimos trucos. Lo vas a usar en casi todo lo que viene.' },
    { speaker: 'ROQUE', text: 'Estela cuida las estalactitas un poco más al oeste. Dice que están muy desordenadas... y quiere saber cuánto.' },
  ],
  rewardTip: {
    title: 'Ordenar con criterio',
    text: {
      python: 'lista.sort(key=lambda x: (-x.a, x.b, x.c)): mayor a primero, luego menor b, luego menor c. O(n log n).',
      cpp: 'sort(v.begin(), v.end(), [](auto& a, auto& b) { if (a.x != b.x) return a.x > b.x; return a.y < b.y; });',
      java: 'Arrays.sort(orden, (a, b) -> a.x != b.x ? Long.compare(b.x, a.x) : Long.compare(a.y, b.y)); con Integer[].',
    },
  },
};
