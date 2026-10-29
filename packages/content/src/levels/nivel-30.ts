import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

/** Parejas (i < j) con diferencia <= d en un arreglo ordenado: dos punteros. */
const contar = (a: number[], d: number) => {
  let c = 0;
  let i = 0;
  for (let j = 0; j < a.length; j++) {
    while (a[j]! - a[i]! > d) i++;
    c += j - i;
  }
  return c;
};
const resonancia = (k: number, e: number[]): [string, string] => {
  const a = [...e].sort((x, y) => x - y);
  let lo = 0;
  let hi = a[a.length - 1]! - a[0]!;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (contar(a, mid) >= k) hi = mid;
    else lo = mid + 1;
  }
  return [`${e.length} ${k}\n${e.join(' ')}`, String(lo)];
};

const N = 100000;
const total = (N * (N - 1)) / 2;
const r = rng(3030);
const energias = Array.from({ length: N }, () => r(0, 1000000000));
const cercanas = Array.from({ length: N }, () => r(0, 1000));
const iguales = Array.from({ length: N }, () => 777);
const extremos = Array.from({ length: N }, (_, i) => (i % 2 === 0 ? 0 : 1000000000));

export const nivel30: Level = {
  number: 30,
  id: 'n30-gimnasio-cueva',
  title: 'Gimnasio Cueva',
  topic: 'Repaso: ordenar y buscar',
  gym: true,
  npc: { id: 'obsidiana', name: 'OBSIDIANA', title: 'Líder del Gimnasio Cueva', sprite: 'gym_cueva', x: 7, y: 11 },
  greeting: 'Ordena, busca y acerca. En el fondo de la cueva, todo resuena si sabes escuchar.',
  intro: [
    { speaker: 'OBSIDIANA', text: 'Has llegado al fondo de la cueva. Soy Obsidiana, líder del Gimnasio Cueva.' },
    { speaker: 'OBSIDIANA', text: 'Eco, Greta, Ámbar, Roque, Estela, Gema, Pico, Nico y Petra me contaron de ti.' },
    { speaker: 'OBSIDIANA', text: 'Mi reto junta lo mejor de esta cueva: ordenar, buscar la respuesta con búsqueda binaria y contar parejas con dos punteros.' },
    { speaker: 'OBSIDIANA', text: 'Mis cristales forman miles de millones de parejas. Si intentas mirarlas todas, la cueva se cerrará antes de que termines.' },
    { speaker: 'OBSIDIANA', text: '¿Un último repaso o entramos directo al duelo?' },
  ],
  lesson: {
    concept: 'REPASO: ORDENAR + BINARIA + PUNTEROS',
    goals: ['Ordenar para que las parejas cercanas queden juntas', 'Contar parejas con diferencia <= D usando dos punteros', 'Combinar ese conteo con una búsqueda binaria sobre D'],
    explanation:
      'Ordenar acerca los valores parecidos: después de ordenar, si a[j] - a[i] <= D, también lo cumplen todos los que están entre i y j. ' +
      'Por eso, para cada j basta mover i hacia la derecha mientras la diferencia sea demasiado grande; las parejas válidas que terminan en j son j - i. ' +
      'Ese conteo es O(n) y crece con D: es una condición monótona, perfecta para una búsqueda binaria sobre la respuesta como la de Pico.',
    code: {
      python: code`
        # cuántas parejas tienen diferencia <= d
        n, d = map(int, input().split())
        a = sorted(map(int, input().split()))
        i = 0
        c = 0
        for j in range(n):
            while a[j] - a[i] > d:
                i += 1
            c += j - i
        print(c)
      `,
      cpp: code`
        #include <algorithm>
        #include <iostream>
        #include <vector>
        using namespace std;

        // cuántas parejas tienen diferencia <= d
        int main() {
            int n;
            long long d;
            cin >> n >> d;
            vector<long long> a(n);
            for (auto& v : a) cin >> v;
            sort(a.begin(), a.end());
            long long c = 0;
            int i = 0;
            for (int j = 0; j < n; j++) {
                while (a[j] - a[i] > d) i++;
                c += j - i;
            }
            cout << c << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Arrays;
        import java.util.Scanner;

        // cuántas parejas tienen diferencia <= d
        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                long d = sc.nextLong();
                long[] a = new long[n];
                for (int k = 0; k < n; k++) a[k] = sc.nextLong();
                Arrays.sort(a);
                long c = 0;
                int i = 0;
                for (int j = 0; j < n; j++) {
                    while (a[j] - a[i] > d) i++;
                    c += j - i;
                }
                System.out.println(c);
            }
        }
      `,
    },
    examples: [
      { input: '5 2\n1 5 3 8 4', output: '4' },
      { input: '3 0\n7 7 7', output: '3' },
      { input: '2 0\n1 2', output: '0' },
    ],
    tips: {
      python: 'sorted() una sola vez al principio. Luego unas 30 pasadas de dos punteros: lee rápido con sys.stdin.buffer.',
      cpp: 'Las parejas pueden ser hasta 5·10⁹: K y el conteo van en long long. Ordena una sola vez, fuera de la búsqueda.',
      java: 'Las parejas pueden ser hasta 5·10⁹: K y el conteo van en long. Ordena una sola vez, fuera de la búsqueda.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          a = sorted([9, 1, 4])
          menor = a[1] - a[0]
          for i in range(1, len(a)):
              menor = min(menor, a[i] - a[i - 1])
          print(menor)
        `,
        cpp: code`
          #include <algorithm>
          #include <iostream>
          #include <vector>
          using namespace std;

          int main() {
              vector<int> a = {9, 1, 4};
              sort(a.begin(), a.end());
              int menor = a[1] - a[0];
              for (int i = 1; i < (int)a.size(); i++) menor = min(menor, a[i] - a[i - 1]);
              cout << menor << "\n";
              return 0;
          }
        `,
        java: code`
          import java.util.Arrays;

          public class Main {
              public static void main(String[] args) {
                  int[] a = {9, 1, 4};
                  Arrays.sort(a);
                  int menor = a[1] - a[0];
                  for (int i = 1; i < a.length; i++) menor = Math.min(menor, a[i] - a[i - 1]);
                  System.out.println(menor);
              }
          }
        `,
      },
      options: ['3', '5', '8'],
      answer: 0,
      explanation: 'Ordenado queda 1, 4, 9: las diferencias entre vecinos son 3 y 5. Tras ordenar, la menor diferencia siempre está entre dos vecinos.',
      wrongHint: 'Primero ordena el arreglo a mano. Después solo compara cada valor con el de al lado.',
    },
  },
  problem: {
    id: 'p30-resonancia-de-obsidiana',
    title: 'LA RESONANCIA DE OBSIDIANA',
    statement:
      'Obsidiana tiene N cristales con energías e₁, ..., eₙ, en desorden. Cada pareja de cristales distintos resuena con una fuerza igual a la diferencia de sus energías: |eᵢ - eⱼ|. ' +
      'Si escribieras las N·(N - 1)/2 fuerzas de todas las parejas y las ordenaras de menor a mayor, ¿cuál sería la K-ésima? ' +
      'Dicho de otro modo: busca la menor D tal que al menos K parejas tengan una diferencia <= D.',
    inputSpec: 'Línea 1: N y K. Línea 2: N enteros e₁ ... eₙ.',
    outputSpec: 'Un número: la K-ésima menor diferencia entre todas las parejas.',
    constraints: '2 ≤ N ≤ 10⁵ · 1 ≤ K ≤ N·(N - 1)/2 · 0 ≤ eᵢ ≤ 10⁹ · K puede pasar de 2·10⁹.',
    difficulty: 'dificil',
    xp: 250,
    timeLimitMs: 2000,
    tests: tests([
      resonancia(3, [1, 5, 3, 8, 4]),
      resonancia(1, [10, 3]),
      resonancia(6, [4, 4, 4, 9]),
      resonancia(10, [1, 5, 3, 8, 4]),
      resonancia(1, energias),
      resonancia(Math.floor(total / 2), energias),
      resonancia(total, energias),
      resonancia(123456789, cercanas),
      resonancia(total, iguales),
      resonancia(total / 2 - 7, extremos),
    ]),
    starter: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        n, k = int(data[0]), int(data[1])
        a = sorted(map(int, data[2:2 + n]))

        def contar(d):
            # TODO: cuántas parejas tienen diferencia <= d (dos punteros sobre a)
            return 0

        lo, hi = 0, a[-1] - a[0]
        # TODO: búsqueda binaria de la menor d con contar(d) >= k:
        # mid = (lo + hi) // 2; si contar(mid) >= k, hi = mid; si no, lo = mid + 1
        print(lo)
      `,
      cpp: code`
        #include <algorithm>
        #include <iostream>
        #include <vector>
        using namespace std;

        int n;
        vector<long long> a;

        long long contar(long long d) {
            // TODO: cuántas parejas tienen diferencia <= d (dos punteros sobre a)
            return 0;
        }

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            long long k;
            cin >> n >> k;
            a.resize(n);
            for (auto& v : a) cin >> v;
            sort(a.begin(), a.end());
            long long lo = 0, hi = a[n - 1] - a[0];
            // TODO: búsqueda binaria de la menor d con contar(d) >= k:
            // mid = (lo + hi) / 2; si contar(mid) >= k, hi = mid; si no, lo = mid + 1
            cout << lo << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.Arrays;
        import java.util.StringTokenizer;

        public class Main {
            static int n;
            static long[] a;

            static long contar(long d) {
                // TODO: cuántas parejas tienen diferencia <= d (dos punteros sobre a)
                return 0;
            }

            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                n = Integer.parseInt(st.nextToken());
                long k = Long.parseLong(st.nextToken());
                a = new long[n];
                st = new StringTokenizer(br.readLine());
                for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());
                Arrays.sort(a);
                long lo = 0, hi = a[n - 1] - a[0];
                // TODO: búsqueda binaria de la menor d con contar(d) >= k:
                // mid = (lo + hi) / 2; si contar(mid) >= k, hi = mid; si no, lo = mid + 1
                System.out.println(lo);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        n, k = int(data[0]), int(data[1])
        a = sorted(map(int, data[2:2 + n]))

        def contar(d):
            c = 0
            i = 0
            for j in range(n):
                aj = a[j]
                while aj - a[i] > d:
                    i += 1
                c += j - i
            return c

        lo, hi = 0, a[-1] - a[0]
        while lo < hi:
            mid = (lo + hi) // 2
            if contar(mid) >= k:
                hi = mid
            else:
                lo = mid + 1
        print(lo)
      `,
      cpp: code`
        #include <algorithm>
        #include <iostream>
        #include <vector>
        using namespace std;

        int n;
        vector<long long> a;

        long long contar(long long d) {
            long long c = 0;
            int i = 0;
            for (int j = 0; j < n; j++) {
                while (a[j] - a[i] > d) i++;
                c += j - i;
            }
            return c;
        }

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            long long k;
            cin >> n >> k;
            a.resize(n);
            for (auto& v : a) cin >> v;
            sort(a.begin(), a.end());
            long long lo = 0, hi = a[n - 1] - a[0];
            while (lo < hi) {
                long long mid = (lo + hi) / 2;
                if (contar(mid) >= k) hi = mid;
                else lo = mid + 1;
            }
            cout << lo << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.Arrays;
        import java.util.StringTokenizer;

        public class Main {
            static int n;
            static long[] a;

            static long contar(long d) {
                long c = 0;
                int i = 0;
                for (int j = 0; j < n; j++) {
                    while (a[j] - a[i] > d) i++;
                    c += j - i;
                }
                return c;
            }

            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                n = Integer.parseInt(st.nextToken());
                long k = Long.parseLong(st.nextToken());
                a = new long[n];
                st = new StringTokenizer(br.readLine());
                for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());
                Arrays.sort(a);
                long lo = 0, hi = a[n - 1] - a[0];
                while (lo < hi) {
                    long mid = (lo + hi) / 2;
                    if (contar(mid) >= k) hi = mid;
                    else lo = mid + 1;
                }
                System.out.println(lo);
            }
        }
      `,
    },
    hints: [
      'Hay hasta 5·10⁹ parejas: no se pueden escribir ni ordenar. En cambio, para una D dada sí puedes contar rápido cuántas parejas tienen diferencia <= D.',
      'Ordena las energías. Para cada j, el i más a la izquierda con a[j] - a[i] <= D solo avanza: dos punteros, O(N). Y si D crece, el conteo crece: búsqueda binaria sobre D.',
      'lo = 0, hi = max - min. Mientras lo < hi: mid = (lo + hi) / 2; si contar(mid) >= K, hi = mid; si no, lo = mid + 1. contar suma j - i para cada j. Todo en long.',
    ],
  },
  outro: [
    { speaker: 'OBSIDIANA', text: 'Miles de millones de parejas y ni una tuviste que mirar. Ordenaste, buscaste y acercaste: dominas la cueva.' },
    { speaker: 'OBSIDIANA', text: 'Toma la Insignia Espiral. Como la recursión, vuelve sobre sí misma... pero siempre encuentra la salida.' },
    { speaker: 'OBSIDIANA', text: 'La salida del sur ya está abierta. Más allá está el Puerto Estructura, donde los datos se guardan en pilas, colas y mapas.' },
  ],
  rewardTip: {
    title: 'K-ésima diferencia',
    text: {
      python: 'Ordena; contar(d) con dos punteros es O(n); búsqueda binaria de la menor d con contar(d) >= k. O(n log V).',
      cpp: 'sort + búsqueda binaria sobre d + dos punteros para contar: O(n log V). Conteos en long long.',
      java: 'Arrays.sort + búsqueda binaria sobre d + dos punteros para contar: O(n log V). Conteos en long.',
    },
  },
};
