import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

const registro = (palabras: string[]): [string, string] => {
  const cuenta = new Map<string, number>();
  for (const p of palabras) cuenta.set(p, (cuenta.get(p) ?? 0) + 1);
  const orden = [...cuenta.entries()].sort((x, y) => y[1] - x[1] || cmp(x[0], y[0]));
  return [`${palabras.length}\n${palabras.join(' ')}`, [String(orden.length), ...orden.map(([p, c]) => `${p} ${c}`)].join('\n')];
};

const r = rng(3434);
const palabra = (min: number, max: number) => Array.from({ length: r(min, max) }, () => String.fromCharCode(97 + r(0, 25))).join('');
const vocabulario = (n: number, min: number, max: number) => {
  const set = new Set<string>();
  while (set.size < n) set.add(palabra(min, max));
  return [...set];
};

// 2·10⁵ mercancías de un catálogo de 1500 nombres.
const catalogo = vocabulario(1500, 1, 10);
const aleatoria = Array.from({ length: 200000 }, () => catalogo[r(0, catalogo.length - 1)]!);
// Pocas mercancías muy repetidas y muchas raras (frecuencias muy distintas).
const sesgada = Array.from({ length: 200000 }, () => {
  const x = r(0, 999);
  return x < 600 ? catalogo[r(0, 4)]! : x < 900 ? catalogo[r(5, 99)]! : catalogo[r(100, 1499)]!;
});
// Todas aparecen igual de veces: manda el orden alfabético.
const empatadas = vocabulario(2000, 1, 6).flatMap((p) => [p, p, p]);
// Prefijos: a, ab, abc... deben ordenarse bien.
const prefijos = ['abc', 'a', 'ab', 'abcd', 'b', 'ab', 'a', 'abc', 'abcd', 'b', 'ba', 'a'];
// Cada palabra aparece una sola vez.
const unicas = vocabulario(2000, 4, 10);

export const nivel34: Level = {
  number: 34,
  id: 'n34-diccionario',
  title: 'Diccionario',
  topic: 'Diccionarios (map)',
  npc: { id: 'salvador', name: 'SALVADOR', title: 'Escribano de la aduana', sprite: 'npc34', x: 14, y: 5 },
  greeting: 'Cada mercancía tiene su página en mi libro. Nunca busco: voy directo.',
  intro: [
    { speaker: 'SALVADOR', text: 'Adelante, adelante. Soy Salvador, escribano de la aduana del puerto.' },
    { speaker: 'SALVADOR', text: 'Por aquí pasan miles de mercancías al día y yo anoto cuántas veces llega cada una.' },
    { speaker: 'SALVADOR', text: 'Antes buscaba cada nombre en una lista larguísima. Ahora uso un diccionario: nombre → cantidad.' },
    { speaker: 'SALVADOR', text: '¿Te muestro cómo lo llevo o vamos al duelo?' },
  ],
  lesson: {
    concept: 'DICCIONARIO (MAP) · CLAVE → VALOR',
    goals: ['Asociar una clave (texto) con un valor (cantidad)', 'Contar apariciones en O(1) por palabra', 'Mostrar el resultado en un orden explícito'],
    explanation:
      'Un diccionario guarda pares clave → valor y encuentra una clave sin recorrer todo. ' +
      'Para contar: si la palabra ya está, súmale 1; si no, empieza en 1. ' +
      'Ojo: dict y HashMap no prometen un orden útil al recorrerlos. Si la salida debe ir ordenada, ordénala tú, o usa un mapa ordenado (map en C++, TreeMap en Java).',
    code: {
      python: code`
        n = int(input())
        cuenta = {}
        for p in input().split():
            cuenta[p] = cuenta.get(p, 0) + 1
        for p in sorted(cuenta):  # orden alfabético
            print(p, cuenta[p])
      `,
      cpp: code`
        #include <iostream>
        #include <map>
        #include <string>
        using namespace std;

        int main() {
            int n;
            cin >> n;
            map<string, int> cuenta;  // map mantiene las claves ordenadas
            for (int i = 0; i < n; i++) {
                string p;
                cin >> p;
                cuenta[p]++;  // si no existía, empieza en 0
            }
            for (auto& par : cuenta) cout << par.first << " " << par.second << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Map;
        import java.util.Scanner;
        import java.util.TreeMap;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                TreeMap<String, Integer> cuenta = new TreeMap<>();  // claves ordenadas
                for (int i = 0; i < n; i++) {
                    String p = sc.next();
                    cuenta.merge(p, 1, Integer::sum);
                }
                for (Map.Entry<String, Integer> e : cuenta.entrySet()) {
                    System.out.println(e.getKey() + " " + e.getValue());
                }
            }
        }
      `,
    },
    examples: [
      { input: '5\nsol mar sol luna mar', output: 'luna 1\nmar 2\nsol 2' },
      { input: '3\npez pez pez', output: 'pez 3' },
      { input: '4\nred ancla barco ancla', output: 'ancla 2\nbarco 1\nred 1' },
    ],
    tips: {
      python: 'cuenta.get(p, 0) + 1 evita el error de clave inexistente. collections.Counter hace lo mismo en una línea.',
      cpp: 'cuenta[p]++ crea la clave en 0 si no existe. map va ordenado (O(log n)); unordered_map es más rápido pero sin orden.',
      java: 'cuenta.merge(p, 1, Integer::sum) suma 1 o crea la clave. TreeMap va ordenado; HashMap es más rápido pero sin orden.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          cuenta = {}
          for c in "banana":
              cuenta[c] = cuenta.get(c, 0) + 1
          print(cuenta["a"])
        `,
        cpp: code`
          #include <iostream>
          #include <map>
          #include <string>
          using namespace std;

          int main() {
              map<char, int> cuenta;
              string s = "banana";
              for (char c : s) cuenta[c]++;
              cout << cuenta['a'] << "\n";
              return 0;
          }
        `,
        java: code`
          import java.util.HashMap;

          public class Main {
              public static void main(String[] args) {
                  HashMap<Character, Integer> cuenta = new HashMap<>();
                  for (char c : "banana".toCharArray()) cuenta.merge(c, 1, Integer::sum);
                  System.out.println(cuenta.get('a'));
              }
          }
        `,
      },
      options: ['2', '3', '6'],
      answer: 1,
      explanation: 'La clave "a" aparece en las posiciones 2, 4 y 6 de banana: su valor termina en 3.',
      wrongHint: 'Cada letra tiene su propio contador. Solo cuenta las veces que aparece la a.',
    },
  },
  problem: {
    id: 'p34-libro-de-aduana',
    title: 'EL LIBRO DE ADUANA',
    statement:
      'Hoy llegaron N mercancías y Salvador anotó el nombre de cada una. ' +
      'Quiere pasar a limpio su libro: cuántas mercancías distintas llegaron y cuántas veces llegó cada una. ' +
      'Ordénalas de la más repetida a la menos repetida; si dos llegaron las mismas veces, va primero la que está antes en orden alfabético.',
    inputSpec: 'Línea 1: N. Línea 2: N nombres separados por espacios.',
    outputSpec: 'Línea 1: D, la cantidad de nombres distintos. Luego D líneas con el nombre y su cantidad, en el orden pedido.',
    constraints: '1 ≤ N ≤ 2·10⁵ · cada nombre tiene de 1 a 10 letras minúsculas (a–z) · hay a lo sumo 2000 nombres distintos.',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      registro(['sal', 'pez', 'sal', 'red', 'pez', 'sal', 'ancla']),
      registro(['barco', 'barco', 'barco']),
      registro(['zeta']),
      registro(prefijos),
      registro(aleatoria),
      registro(sesgada),
      registro(empatadas),
      registro(unicas),
    ]),
    starter: {
      python: code`
        import sys

        datos = sys.stdin.read().split()
        n = int(datos[0])
        cuenta = {}
        for p in datos[1:n + 1]:
            cuenta[p] = cuenta.get(p, 0) + 1
        # TODO: ordena los nombres por cantidad (de mayor a menor) y, en empate,
        # alfabéticamente; luego imprime la cantidad de distintos y cada línea
      `,
      cpp: code`
        #include <iostream>
        #include <map>
        #include <string>
        #include <vector>
        #include <algorithm>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n;
            cin >> n;
            map<string, int> cuenta;
            for (int i = 0; i < n; i++) {
                string p;
                cin >> p;
                cuenta[p]++;
            }
            // TODO: pasa los pares a un vector, ordénalos por cantidad (de mayor a menor)
            // y, en empate, alfabéticamente; luego imprime la cantidad de distintos y cada línea
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayList;
        import java.util.HashMap;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                int n = Integer.parseInt(br.readLine().trim());
                StringTokenizer st = new StringTokenizer(br.readLine());
                HashMap<String, Integer> cuenta = new HashMap<>();
                for (int i = 0; i < n; i++) cuenta.merge(st.nextToken(), 1, Integer::sum);
                ArrayList<String> nombres = new ArrayList<>(cuenta.keySet());
                // TODO: ordena nombres por cantidad (de mayor a menor) y, en empate,
                // alfabéticamente; luego imprime la cantidad de distintos y cada línea
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys

        datos = sys.stdin.read().split()
        n = int(datos[0])
        cuenta = {}
        for p in datos[1:n + 1]:
            cuenta[p] = cuenta.get(p, 0) + 1
        orden = sorted(cuenta, key=lambda p: (-cuenta[p], p))
        out = [str(len(orden))]
        for p in orden:
            out.append(p + " " + str(cuenta[p]))
        print("\n".join(out))
      `,
      cpp: code`
        #include <iostream>
        #include <map>
        #include <string>
        #include <vector>
        #include <algorithm>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n;
            cin >> n;
            map<string, int> cuenta;
            for (int i = 0; i < n; i++) {
                string p;
                cin >> p;
                cuenta[p]++;
            }
            vector<pair<string, int>> v(cuenta.begin(), cuenta.end());
            sort(v.begin(), v.end(), [](const pair<string, int>& a, const pair<string, int>& b) {
                if (a.second != b.second) return a.second > b.second;
                return a.first < b.first;
            });
            cout << v.size() << "\n";
            for (auto& par : v) cout << par.first << " " << par.second << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayList;
        import java.util.HashMap;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                int n = Integer.parseInt(br.readLine().trim());
                StringTokenizer st = new StringTokenizer(br.readLine());
                HashMap<String, Integer> cuenta = new HashMap<>();
                for (int i = 0; i < n; i++) cuenta.merge(st.nextToken(), 1, Integer::sum);
                ArrayList<String> nombres = new ArrayList<>(cuenta.keySet());
                nombres.sort((a, b) -> {
                    int ca = cuenta.get(a), cb = cuenta.get(b);
                    if (ca != cb) return Integer.compare(cb, ca);
                    return a.compareTo(b);
                });
                StringBuilder sb = new StringBuilder();
                sb.append(nombres.size()).append("\n");
                for (String p : nombres) sb.append(p).append(" ").append(cuenta.get(p)).append("\n");
                System.out.print(sb);
            }
        }
      `,
    },
    hints: [
      'Primero cuenta: un diccionario (dict, map, HashMap) con nombre → cantidad. Así no recorres una lista por cada mercancía.',
      'El diccionario no te da el orden pedido. Pasa sus claves a una lista y ordénala con un criterio propio de dos partes.',
      'Criterio: primero la cantidad de mayor a menor; si empatan, el nombre de menor a mayor. En Python: sorted(cuenta, key=lambda p: (-cuenta[p], p)).',
    ],
  },
  outro: [
    { speaker: 'SALVADOR', text: 'Impecable. Ni un borrón en el libro y en el orden exacto.' },
    { speaker: 'SALVADOR', text: 'Recuerda: el diccionario cuenta rápido, pero el orden lo decides tú.' },
    { speaker: 'SALVADOR', text: 'Cruza el puente hacia la playa sur. Coral, la pescadora, quiere saber qué especies ya tiene anotadas.' },
  ],
  rewardTip: {
    title: 'Diccionario',
    text: {
      python: 'd[k] = d.get(k, 0) + 1 para contar. sorted(d, key=lambda k: (-d[k], k)) ordena por cantidad y luego alfabéticamente.',
      cpp: 'map<string,int> m; m[k]++. Para otro orden, copia a vector<pair> y usa sort con un lambda.',
      java: 'm.merge(k, 1, Integer::sum) para contar. Ordena una lista de claves con un comparador propio.',
    },
  },
};
