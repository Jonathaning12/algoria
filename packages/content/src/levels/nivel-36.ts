import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const pesas = (k: number, a: number[]): [string, string] => {
  const cuenta = new Map<number, number>();
  let pares = 0;
  for (const x of a) {
    pares += cuenta.get(k - x) ?? 0;
    cuenta.set(x, (cuenta.get(x) ?? 0) + 1);
  }
  return [`${a.length} ${k}\n${a.join(' ')}`, String(pares)];
};

const N = 200000;
const r = rng(3636);
const lista = (n: number, lo: number, hi: number) => Array.from({ length: n }, () => r(lo, hi));
const iguales = Array.from({ length: N }, () => 5);
const amplia = lista(N, -1000000000, 1000000000);
const chicas = lista(N, 0, 1000);
const extremos = Array.from({ length: N }, () => (r(0, 1) === 0 ? 1000000000 : r(999999990, 1000000000)));
const soloPares = Array.from({ length: N }, () => 2 * r(-500000000, 500000000));

export const nivel36: Level = {
  number: 36,
  id: 'n36-pares-con-mapa',
  title: 'Pares con mapa',
  topic: 'Diccionarios (map)',
  npc: { id: 'cipriano', name: 'CIPRIANO', title: 'Mercader de balanzas', sprite: 'npc36', x: 13, y: 7 },
  greeting: 'Dos pesas que sumen justo lo pedido. Ni un gramo más, ni uno menos.',
  intro: [
    { speaker: 'CIPRIANO', text: 'Saludos, viajero. Soy Cipriano y en mi puesto equilibro balanzas para todo el puerto.' },
    { speaker: 'CIPRIANO', text: 'Los clientes me piden un peso exacto K y yo lo armo con dos pesas de mi colección.' },
    { speaker: 'CIPRIANO', text: 'Probar todas las parejas era eterno. Ahora, por cada pesa, me pregunto: ¿ya vi a su compañera?' },
    { speaker: 'CIPRIANO', text: '¿Te enseño ese truco del mapa o pasamos al duelo?' },
  ],
  lesson: {
    concept: 'MAPA DE COMPLEMENTOS · O(n)',
    goals: ['Buscar la pareja que falta (K - x) en un mapa', 'Recorrer una sola vez guardando lo visto', 'Pasar de O(n²) a O(n)'],
    explanation:
      'Para saber si dos números suman K, probar todas las parejas cuesta O(n²): con 2·10⁵ números son 2·10¹⁰ pruebas. ' +
      'Mejor: recorre una vez y, para cada x, pregunta si ya viste K - x. Un diccionario responde eso al instante. ' +
      'Si además guardas cuántas veces viste cada valor, puedes contar todas las parejas en O(n).',
    code: {
      python: code`
        n, k = map(int, input().split())
        a = list(map(int, input().split()))
        visto = {}  # valor → primera posición donde apareció
        res = "-1"
        for j in range(n):
            falta = k - a[j]
            if falta in visto:
                res = str(visto[falta] + 1) + " " + str(j + 1)
                break
            if a[j] not in visto:
                visto[a[j]] = j
        print(res)
      `,
      cpp: code`
        #include <iostream>
        #include <unordered_map>
        #include <vector>
        using namespace std;

        int main() {
            int n;
            long long k;
            cin >> n >> k;
            vector<long long> a(n);
            for (int i = 0; i < n; i++) cin >> a[i];
            unordered_map<long long, int> visto;  // valor → primera posición
            for (int j = 0; j < n; j++) {
                auto it = visto.find(k - a[j]);
                if (it != visto.end()) {
                    cout << it->second + 1 << " " << j + 1 << "\n";
                    return 0;
                }
                if (!visto.count(a[j])) visto[a[j]] = j;
            }
            cout << -1 << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.HashMap;
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                long k = sc.nextLong();
                long[] a = new long[n];
                for (int i = 0; i < n; i++) a[i] = sc.nextLong();
                HashMap<Long, Integer> visto = new HashMap<>();  // valor → primera posición
                for (int j = 0; j < n; j++) {
                    Integer i = visto.get(k - a[j]);
                    if (i != null) {
                        System.out.println((i + 1) + " " + (j + 1));
                        return;
                    }
                    visto.putIfAbsent(a[j], j);
                }
                System.out.println(-1);
            }
        }
      `,
    },
    examples: [
      { input: '4 9\n2 7 11 15', output: '1 2' },
      { input: '3 6\n3 2 4', output: '2 3' },
      { input: '2 5\n1 1', output: '-1' },
    ],
    tips: {
      python: 'k - x in visto es O(1). Para contar parejas guarda cantidades: cuenta[x] = cuenta.get(x, 0) + 1.',
      cpp: 'unordered_map con claves long long: K - x puede salirse de int. Llamar a reserve(n) al inicio lo acelera.',
      java: 'HashMap<Long, Integer>: K - x puede salirse de int, así que usa long. getOrDefault(clave, 0) ahorra un if.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          a = [1, 4, 2, 3]
          k = 5
          cuenta = {}
          pares = 0
          for x in a:
              pares += cuenta.get(k - x, 0)
              cuenta[x] = cuenta.get(x, 0) + 1
          print(pares)
        `,
        cpp: code`
          #include <iostream>
          #include <map>
          using namespace std;

          int main() {
              int a[4] = {1, 4, 2, 3};
              int k = 5, pares = 0;
              map<int, int> cuenta;
              for (int x : a) {
                  if (cuenta.count(k - x)) pares += cuenta[k - x];
                  cuenta[x]++;
              }
              cout << pares << "\n";
              return 0;
          }
        `,
        java: code`
          import java.util.HashMap;

          public class Main {
              public static void main(String[] args) {
                  int[] a = {1, 4, 2, 3};
                  int k = 5, pares = 0;
                  HashMap<Integer, Integer> cuenta = new HashMap<>();
                  for (int x : a) {
                      pares += cuenta.getOrDefault(k - x, 0);
                      cuenta.merge(x, 1, Integer::sum);
                  }
                  System.out.println(pares);
              }
          }
        `,
      },
      options: ['1', '2', '4'],
      answer: 1,
      explanation: 'Al llegar el 4 ya estaba el 1 (1 + 4 = 5); al llegar el 3 ya estaba el 2 (2 + 3 = 5). Cada pareja se cuenta una sola vez.',
      wrongHint: 'Cada número solo mira hacia atrás, a los que ya están en el mapa. Así ninguna pareja se cuenta dos veces.',
    },
  },
  problem: {
    id: 'p36-pesas-de-cipriano',
    title: 'LAS PESAS DE CIPRIANO',
    statement:
      'Cipriano tiene N pesas en fila, con pesos a₁, a₂, ..., aₙ (algunos pueden ser negativos: son globos que tiran hacia arriba). ' +
      'Un cliente pide un peso exacto K. ¿Cuántas parejas de pesas distintas suman exactamente K? ' +
      'Una pareja es un par de posiciones i < j con aᵢ + aⱼ = K. Cuidado: probar todas las parejas es demasiado lento.',
    inputSpec: 'Línea 1: N y K. Línea 2: N enteros a₁ ... aₙ.',
    outputSpec: 'Una línea con la cantidad de parejas.',
    constraints: '1 ≤ N ≤ 2·10⁵ · -10⁹ ≤ aᵢ ≤ 10⁹ · -2·10⁹ ≤ K ≤ 2·10⁹ · La respuesta puede llegar a 2·10¹⁰: usa enteros de 64 bits.',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      pesas(6, [1, 5, 3, 3, 2]),
      pesas(4, [2, 2, 2, 2]),
      pesas(2, [1]),
      pesas(0, [-3, 3, 0, 0, 6, -6]),
      pesas(10, iguales),
      pesas(123456789, amplia),
      pesas(1000, chicas),
      pesas(2000000000, extremos),
      pesas(7, soloPares),
    ]),
    starter: {
      python: code`
        import sys

        datos = sys.stdin.buffer.read().split()
        n, k = int(datos[0]), int(datos[1])
        a = list(map(int, datos[2:2 + n]))
        cuenta = {}
        pares = 0
        # TODO: para cada x, suma cuántas veces ya viste k - x;
        # después anota x en el diccionario
        print(pares)
      `,
      cpp: code`
        #include <iostream>
        #include <unordered_map>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n;
            long long k;
            cin >> n >> k;
            unordered_map<long long, int> cuenta;
            cuenta.reserve(2 * n);
            long long pares = 0;
            for (int i = 0; i < n; i++) {
                long long x;
                cin >> x;
                // TODO: suma cuántas veces ya viste k - x; después anota x
            }
            cout << pares << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.HashMap;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                long k = Long.parseLong(st.nextToken());
                st = new StringTokenizer(br.readLine());
                HashMap<Long, Integer> cuenta = new HashMap<>();
                long pares = 0;
                for (int i = 0; i < n; i++) {
                    long x = Long.parseLong(st.nextToken());
                    // TODO: suma cuántas veces ya viste k - x; después anota x
                }
                System.out.println(pares);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys

        datos = sys.stdin.buffer.read().split()
        n, k = int(datos[0]), int(datos[1])
        a = list(map(int, datos[2:2 + n]))
        cuenta = {}
        pares = 0
        for x in a:
            pares += cuenta.get(k - x, 0)
            cuenta[x] = cuenta.get(x, 0) + 1
        print(pares)
      `,
      cpp: code`
        #include <iostream>
        #include <unordered_map>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n;
            long long k;
            cin >> n >> k;
            unordered_map<long long, int> cuenta;
            cuenta.reserve(2 * n);
            long long pares = 0;
            for (int i = 0; i < n; i++) {
                long long x;
                cin >> x;
                auto it = cuenta.find(k - x);
                if (it != cuenta.end()) pares += it->second;
                cuenta[x]++;
            }
            cout << pares << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.HashMap;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                long k = Long.parseLong(st.nextToken());
                st = new StringTokenizer(br.readLine());
                HashMap<Long, Integer> cuenta = new HashMap<>();
                long pares = 0;
                for (int i = 0; i < n; i++) {
                    long x = Long.parseLong(st.nextToken());
                    pares += cuenta.getOrDefault(k - x, 0);
                    cuenta.merge(x, 1, Integer::sum);
                }
                System.out.println(pares);
            }
        }
      `,
    },
    hints: [
      'Probar todas las parejas son unas N²/2 sumas: con N = 2·10⁵, unas 2·10¹⁰. Necesitas recorrer una sola vez.',
      'Cuando llegas a la pesa x, su compañera ideal pesa K - x. Si ya pasaste por pesas con ese peso, cada una forma una pareja con x.',
      'Lleva un diccionario peso → cuántas veces lo viste. Para cada x: pares += cuenta[K - x] (0 si no está); después cuenta[x] += 1. En ese orden, para no emparejar una pesa consigo misma.',
    ],
  },
  outro: [
    { speaker: 'CIPRIANO', text: '¡Equilibrio perfecto! Contaste millones de parejas sin probar ni una a mano.' },
    { speaker: 'CIPRIANO', text: 'Cuando busques una pareja que cumpla algo, pregúntale al mapa qué te falta.' },
    { speaker: 'CIPRIANO', text: 'Anselmo, el cordelero, trabaja junto al muelle chico. Siempre empieza por lo más pequeño.' },
  ],
  rewardTip: {
    title: 'Mapa de complementos',
    text: {
      python: 'pares += cuenta.get(k - x, 0); cuenta[x] = cuenta.get(x, 0) + 1. O(n) en vez de O(n²).',
      cpp: 'unordered_map<long long,int> c; c.reserve(2 * n); buscar k - x antes de c[x]++. O(n).',
      java: 'HashMap<Long,Integer> c: pares += c.getOrDefault(k - x, 0); c.merge(x, 1, Integer::sum). O(n).',
    },
  },
};
