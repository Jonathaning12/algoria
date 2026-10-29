import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

/** Cuántos valores de a (ordenado) son menores que x. */
const menores = (a: number[], x: number) => {
  let lo = 0;
  let hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid]! < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
};
const coleccion = (edades: number[], q: [number, number][]): [string, string] => {
  const a = [...edades].sort((x, y) => x - y);
  return [
    `${edades.length} ${q.length}\n${edades.join(' ')}\n${q.map(([l, r]) => `${l} ${r}`).join('\n')}`,
    q.map(([l, r]) => menores(a, r + 1) - menores(a, l)).join('\n'),
  ];
};

const N = 200000;
const Q = 8000;
const r = rng(2929);
const edades = Array.from({ length: N }, () => r(0, 1000000000));
const rango = (max: number): [number, number] => {
  const x = r(0, max), y = r(0, max);
  return [Math.min(x, y), Math.max(x, y)];
};
const amplias = Array.from({ length: Q }, () => rango(1000000000));
// Rangos estrechos: respuestas pequeñas, muchos 0.
const estrechas = Array.from({ length: Q }, (): [number, number] => {
  const l = r(0, 1000000000);
  return [l, l + r(0, 20000)];
});
const repetidas = Array.from({ length: N }, () => r(0, 50));
const puntuales = Array.from({ length: Q }, (): [number, number] => {
  const v = r(0, 52);
  return [v, v];
});

export const nivel29: Level = {
  number: 29,
  id: 'n29-lower-upper-bound',
  title: 'Lower y upper bound',
  topic: 'Contar en un rango',
  npc: { id: 'petra', name: 'PETRA', title: 'Geóloga de fósiles', sprite: 'npc29', x: 14, y: 8 },
  greeting: '¿Cuántos fósiles hay entre dos edades? Dos búsquedas y una resta: así de fácil.',
  intro: [
    { speaker: 'PETRA', text: '¡Bienvenido a mi rincón! Soy Petra, geóloga. Fecho los fósiles que encuentran los mineros.' },
    { speaker: 'PETRA', text: 'Los investigadores me preguntan cuántos fósiles tengo con edades entre tal y tal año. Y preguntan muchísimo.' },
    { speaker: 'PETRA', text: 'Con la colección ordenada, busco dónde empieza el rango y dónde termina. La resta me da la respuesta.' },
    { speaker: 'PETRA', text: '¿Te enseño mis dos búsquedas o pasas al duelo?' },
  ],
  lesson: {
    concept: 'LOWER_BOUND / UPPER_BOUND',
    goals: ['Encontrar el primer valor >= x (lower bound)', 'Encontrar el primer valor > x (upper bound)', 'Contar los valores de un rango con una resta'],
    explanation:
      'En un arreglo ordenado, lower bound de x es la primera posición con un valor >= x; dicho de otro modo, cuántos valores son menores que x. ' +
      'Upper bound es la primera posición con un valor > x: cuántos valores son menores o iguales a x. ' +
      'Así, la cantidad de valores entre L y R es upper_bound(R) - lower_bound(L). ' +
      'Cada búsqueda es binaria, O(log n), y funciona aunque haya valores repetidos.',
    code: {
      python: code`
        from bisect import bisect_left, bisect_right

        n, x = map(int, input().split())
        a = list(map(int, input().split()))      # ya ordenado
        print(bisect_left(a, x), bisect_right(a, x))
      `,
      cpp: code`
        #include <algorithm>
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            int n;
            long long x;
            cin >> n >> x;
            vector<long long> a(n);                 // ya ordenado
            for (auto& v : a) cin >> v;
            int lb = lower_bound(a.begin(), a.end(), x) - a.begin();
            int ub = upper_bound(a.begin(), a.end(), x) - a.begin();
            cout << lb << " " << ub << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            // cuántos valores de a son menores que x
            static int menores(long[] a, long x) {
                int lo = 0, hi = a.length;
                while (lo < hi) {
                    int mid = (lo + hi) / 2;
                    if (a[mid] < x) lo = mid + 1;
                    else hi = mid;
                }
                return lo;
            }

            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                long x = sc.nextLong();
                long[] a = new long[n];                 // ya ordenado
                for (int i = 0; i < n; i++) a[i] = sc.nextLong();
                int lb = menores(a, x);                 // primer >= x
                int ub = menores(a, x + 1);             // primer > x
                System.out.println(lb + " " + ub);
            }
        }
      `,
    },
    examples: [
      { input: '6 3\n1 3 3 3 5 8', output: '1 4' },
      { input: '3 10\n1 2 3', output: '3 3' },
      { input: '3 0\n1 2 3', output: '0 0' },
    ],
    tips: {
      python: 'bisect_right(a, R) - bisect_left(a, L) cuenta los valores entre L y R. Ordena antes con a.sort().',
      cpp: 'upper_bound(.., R) - lower_bound(.., L) cuenta los valores entre L y R. Ambas devuelven iteradores.',
      java: 'Arrays.binarySearch no sirve con repetidos. Escribe tu menores(a, x): con enteros, upper bound de R es menores(a, R + 1).',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          from bisect import bisect_left, bisect_right

          a = [2, 4, 4, 4, 7, 9]
          print(bisect_right(a, 4) - bisect_left(a, 4))
        `,
        cpp: code`
          #include <algorithm>
          #include <iostream>
          #include <vector>
          using namespace std;

          int main() {
              vector<int> a = {2, 4, 4, 4, 7, 9};
              cout << upper_bound(a.begin(), a.end(), 4) - lower_bound(a.begin(), a.end(), 4) << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              static int menores(int[] a, int x) {
                  int lo = 0, hi = a.length;
                  while (lo < hi) {
                      int mid = (lo + hi) / 2;
                      if (a[mid] < x) lo = mid + 1;
                      else hi = mid;
                  }
                  return lo;
              }

              public static void main(String[] args) {
                  int[] a = {2, 4, 4, 4, 7, 9};
                  System.out.println(menores(a, 5) - menores(a, 4));
              }
          }
        `,
      },
      options: ['3', '4', '1'],
      answer: 0,
      explanation: 'El primer 4 está en la posición 1 y el primer valor mayor que 4 (el 7) en la 4. La resta, 4 - 1 = 3, es cuántas veces aparece el 4.',
      wrongHint: 'Una búsqueda dice dónde empieza el bloque de cuatros y la otra dónde termina. La resta es el largo del bloque.',
    },
  },
  problem: {
    id: 'p29-coleccion-de-petra',
    title: 'LA COLECCIÓN DE PETRA',
    statement:
      'Petra tiene N fósiles y conoce la edad de cada uno, pero los anotó en desorden. ' +
      'Recibe Q preguntas: cada una trae dos edades L y R, y quiere saber cuántos fósiles tienen una edad entre L y R, ambas incluidas. ' +
      'Responde todas las preguntas.',
    inputSpec: 'Línea 1: N y Q. Línea 2: las N edades. Luego Q líneas, cada una con L y R.',
    outputSpec: 'Q líneas: para cada pregunta, cuántos fósiles tienen edad entre L y R.',
    constraints: '1 ≤ N ≤ 2·10⁵ · 1 ≤ Q ≤ 8000 · 0 ≤ edades ≤ 10⁹ · 0 ≤ L ≤ R ≤ 2·10⁹.',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      coleccion([5, 1, 8, 3, 3], [[3, 5], [0, 2], [9, 20], [1, 8]]),
      coleccion([10, 10, 10], [[10, 10], [0, 9], [11, 11]]),
      coleccion([0], [[0, 0], [0, 2000000000], [1, 1]]),
      coleccion([7, 2, 9, 4, 4, 1, 6], [[4, 4], [2, 7], [5, 5], [0, 100], [8, 9]]),
      coleccion(edades, amplias),
      coleccion(edades, estrechas),
      coleccion(repetidas, puntuales),
      coleccion(edades, [[0, 1000000000], [0, 0], [1000000000, 2000000000]]),
    ]),
    starter: {
      python: code`
        import sys
        from bisect import bisect_left, bisect_right

        data = sys.stdin.buffer.read().split()
        n, q = int(data[0]), int(data[1])
        a = list(map(int, data[2:2 + n]))
        # TODO: ordena a
        res = []
        for k in range(q):
            l = int(data[2 + n + 2 * k])
            r = int(data[3 + n + 2 * k])
            # TODO: cuántos valores hay entre l y r: bisect_right(a, r) - bisect_left(a, l)
            res.append(0)
        print("\n".join(map(str, res)))
      `,
      cpp: code`
        #include <algorithm>
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, q;
            cin >> n >> q;
            vector<long long> a(n);
            for (auto& v : a) cin >> v;
            // TODO: ordena a
            while (q--) {
                long long l, r;
                cin >> l >> r;
                // TODO: cuántos valores hay entre l y r: upper_bound(.., r) - lower_bound(.., l)
                cout << 0 << "\n";
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
            // cuántos valores de a (ordenado) son menores que x
            static int menores(long[] a, long x) {
                int lo = 0, hi = a.length;
                while (lo < hi) {
                    int mid = (lo + hi) / 2;
                    if (a[mid] < x) lo = mid + 1;
                    else hi = mid;
                }
                return lo;
            }

            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int q = Integer.parseInt(st.nextToken());
                long[] a = new long[n];
                st = new StringTokenizer(br.readLine());
                for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());
                // TODO: ordena a con Arrays.sort
                StringBuilder sb = new StringBuilder();
                for (int k = 0; k < q; k++) {
                    st = new StringTokenizer(br.readLine());
                    long l = Long.parseLong(st.nextToken());
                    long r = Long.parseLong(st.nextToken());
                    // TODO: cuántos valores hay entre l y r: menores(a, r + 1) - menores(a, l)
                    sb.append(0).append("\n");
                }
                System.out.print(sb);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        from bisect import bisect_left, bisect_right

        data = sys.stdin.buffer.read().split()
        n, q = int(data[0]), int(data[1])
        a = list(map(int, data[2:2 + n]))
        a.sort()
        res = []
        for k in range(q):
            l = int(data[2 + n + 2 * k])
            r = int(data[3 + n + 2 * k])
            res.append(bisect_right(a, r) - bisect_left(a, l))
        print("\n".join(map(str, res)))
      `,
      cpp: code`
        #include <algorithm>
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, q;
            cin >> n >> q;
            vector<long long> a(n);
            for (auto& v : a) cin >> v;
            sort(a.begin(), a.end());
            while (q--) {
                long long l, r;
                cin >> l >> r;
                cout << upper_bound(a.begin(), a.end(), r) - lower_bound(a.begin(), a.end(), l) << "\n";
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
            static int menores(long[] a, long x) {
                int lo = 0, hi = a.length;
                while (lo < hi) {
                    int mid = (lo + hi) / 2;
                    if (a[mid] < x) lo = mid + 1;
                    else hi = mid;
                }
                return lo;
            }

            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int q = Integer.parseInt(st.nextToken());
                long[] a = new long[n];
                st = new StringTokenizer(br.readLine());
                for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());
                Arrays.sort(a);
                StringBuilder sb = new StringBuilder();
                for (int k = 0; k < q; k++) {
                    st = new StringTokenizer(br.readLine());
                    long l = Long.parseLong(st.nextToken());
                    long r = Long.parseLong(st.nextToken());
                    sb.append(menores(a, r + 1) - menores(a, l)).append("\n");
                }
                System.out.print(sb);
            }
        }
      `,
    },
    hints: [
      'Las edades vienen en desorden: ordénalas una sola vez al principio. Después, cada pregunta se responde con búsquedas binarias.',
      'Los fósiles con edad entre L y R son los que tienen edad <= R, menos los que tienen edad < L.',
      'Respuesta = upper_bound(R) - lower_bound(L). Python: bisect_right(a, R) - bisect_left(a, L). Java: menores(a, R + 1) - menores(a, L).',
    ],
  },
  outro: [
    { speaker: 'PETRA', text: '¡Colección consultada sin revolver ni un fósil! Dos búsquedas y una resta, siempre.' },
    { speaker: 'PETRA', text: 'Lower bound y upper bound aparecen en todas partes. Tenlos a mano como el martillo de un geólogo.' },
    { speaker: 'PETRA', text: 'Ya conoces a todos los de la cueva. Obsidiana te espera en el Gimnasio Cueva, al fondo, junto a la salida.' },
  ],
  rewardTip: {
    title: 'Contar en un rango',
    text: {
      python: 'a.sort(); bisect_right(a, R) - bisect_left(a, L) = cuántos valores hay en [L, R]. O(log n) por pregunta.',
      cpp: 'sort; upper_bound(a.begin(), a.end(), R) - lower_bound(a.begin(), a.end(), L) = cuántos hay en [L, R].',
      java: 'Arrays.sort(a); menores(a, R + 1) - menores(a, L) = cuántos hay en [L, R]. menores es una búsqueda binaria.',
    },
  },
};
