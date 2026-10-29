import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const lis = (a: number[]): [string, string] => {
  const tails: number[] = [];
  for (const x of a) {
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid]! < x) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = x;
  }
  return [`${a.length}\n${a.join(' ')}`, `${tails.length}`];
};

const N = 200000;
const azar = (seed: number, hi: number) => {
  const r = rng(seed);
  return Array.from({ length: N }, () => r(1, hi));
};
const creciente = Array.from({ length: N }, (_, i) => (i + 1) * 5000);
const decreciente = Array.from({ length: N }, (_, i) => 1000000000 - i);
// Dientes de sierra: subidas cortas que se repiten, cada una un poco más alta.
const sierra = Array.from({ length: N }, (_, i) => Math.floor(i / 100) * 3 + (i % 100) * 7 + 1);

export const nivel56: Level = {
  number: 56,
  id: 'n56-lis',
  title: 'Subsecuencia creciente',
  topic: 'Programación dinámica',
  npc: { id: 'selene', name: 'SELENE', title: 'Astrónoma de la cúpula', sprite: 'npc56', x: 15, y: 6 },
  greeting: 'Una buena escalera de estrellas sube siempre, aunque se salte algunas.',
  intro: [
    { speaker: 'SELENE', text: 'Shh, estoy contando estrellas. Soy Selene y observo el cielo desde la cúpula de la torre.' },
    { speaker: 'SELENE', text: 'Anoté el brillo de doscientas mil estrellas, en el orden en que aparecieron esta noche.' },
    { speaker: 'SELENE', text: 'Busco la escalera más larga: estrellas que, en ese orden, brillen cada una más que la anterior. Puedo saltarme las que quiera.' },
    { speaker: 'SELENE', text: 'Mi método compara cada estrella con todas las anteriores... y amanece antes de terminar. ¿Vemos un truco mejor?' },
  ],
  lesson: {
    concept: 'LIS EN O(n log n)',
    goals: ['Entender la DP O(n²) de la subsecuencia creciente', 'Guardar el menor final posible para cada largo', 'Usar búsqueda binaria para llegar a O(n log n)'],
    explanation:
      'La DP directa dice: dp[i] = 1 + el mayor dp[j] con j < i y a[j] < a[i]. Funciona, pero son n² pasos: con 2·10⁵ estrellas, demasiado. ' +
      'Truco: guarda en colas[k] el menor final posible de una escalera de largo k + 1. Esa lista siempre está ordenada. ' +
      'Para cada x, busca con búsqueda binaria la primera cola ≥ x y reemplázala por x; si no hay ninguna, x alarga la escalera. ' +
      'El largo de colas es la respuesta. Cada paso cuesta log n.',
    code: {
      python: code`
        from bisect import bisect_left

        n = int(input())
        a = list(map(int, input().split()))
        colas = []
        for x in a:
            k = bisect_left(colas, x)
            if k == len(colas):
                colas.append(x)
            else:
                colas[k] = x
        print(len(colas))
      `,
      cpp: code`
        #include <algorithm>
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            int n;
            cin >> n;
            vector<int> colas;
            for (int i = 0; i < n; i++) {
                int x;
                cin >> x;
                auto it = lower_bound(colas.begin(), colas.end(), x);
                if (it == colas.end()) colas.push_back(x);
                else *it = x;
            }
            cout << colas.size() << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                int[] colas = new int[n];
                int largo = 0;
                for (int i = 0; i < n; i++) {
                    int x = sc.nextInt();
                    int lo = 0, hi = largo;
                    while (lo < hi) {
                        int mid = (lo + hi) / 2;
                        if (colas[mid] < x) lo = mid + 1;
                        else hi = mid;
                    }
                    colas[lo] = x;
                    if (lo == largo) largo++;
                }
                System.out.println(largo);
            }
        }
      `,
    },
    examples: [
      { input: '6\n5 1 6 2 3 4', output: '4' },
      { input: '4\n4 3 2 1', output: '1' },
      { input: '5\n2 2 3 3 4', output: '3' },
    ],
    tips: {
      python: 'bisect_left(colas, x) da la primera posición con colas[k] >= x. Con bisect_right permitirías repetidos (escalera no estricta).',
      cpp: 'lower_bound da la primera cola >= x (escalera estricta). upper_bound permitiría valores iguales.',
      java: 'Escribe tu propia búsqueda binaria sobre un int[] con un contador de largo: es corta y evita listas de objetos.',
    },
    quiz: {
      question: '¿Cómo queda la lista colas al final? (el programa la imprime)',
      code: {
        python: code`
          from bisect import bisect_left

          a = [3, 1, 4, 1, 5, 9, 2, 6]
          colas = []
          for x in a:
              k = bisect_left(colas, x)
              if k == len(colas):
                  colas.append(x)
              else:
                  colas[k] = x
          print(*colas)
        `,
        cpp: code`
          #include <algorithm>
          #include <iostream>
          #include <vector>
          using namespace std;

          int main() {
              vector<int> a = {3, 1, 4, 1, 5, 9, 2, 6};
              vector<int> colas;
              for (int x : a) {
                  auto it = lower_bound(colas.begin(), colas.end(), x);
                  if (it == colas.end()) colas.push_back(x);
                  else *it = x;
              }
              for (int i = 0; i < (int)colas.size(); i++) {
                  if (i > 0) cout << " ";
                  cout << colas[i];
              }
              cout << "\n";
              return 0;
          }
        `,
        java: code`
          import java.util.ArrayList;
          import java.util.Collections;
          import java.util.List;

          public class Main {
              public static void main(String[] args) {
                  int[] a = {3, 1, 4, 1, 5, 9, 2, 6};
                  List<Integer> colas = new ArrayList<>();
                  for (int x : a) {
                      int k = Collections.binarySearch(colas, x);
                      if (k < 0) k = -k - 1;
                      if (k == colas.size()) colas.add(x);
                      else colas.set(k, x);
                  }
                  StringBuilder sb = new StringBuilder();
                  for (int i = 0; i < colas.size(); i++) {
                      if (i > 0) sb.append(" ");
                      sb.append(colas.get(i));
                  }
                  System.out.println(sb);
              }
          }
        `,
      },
      options: ['1 4 5 9', '1 2 5 6', '3 4 5 9'],
      answer: 1,
      explanation: 'El 2 reemplaza al 4 y el 6 reemplaza al 9: colas guarda el menor final de cada largo, no una escalera real. El largo, 4, sí es la respuesta.',
      wrongHint: 'Cada número reemplaza a la primera cola que sea mayor o igual. Sigue el proceso hasta el final, también con el 2 y el 6.',
    },
  },
  problem: {
    id: 'p56-estrellas-de-selene',
    title: 'LAS ESTRELLAS DE SELENE',
    statement:
      'Selene anotó el brillo de N estrellas en el orden en que aparecieron: a₁, a₂, ..., aₙ. ' +
      'Una escalera es una selección de estrellas, respetando ese orden, en la que cada una brilla estrictamente más que la anterior. ' +
      '¿Cuántas estrellas tiene la escalera más larga? Cuidado: comparar cada estrella con todas las anteriores es demasiado lento.',
    inputSpec: 'Línea 1: N. Línea 2: N enteros a₁ ... aₙ.',
    outputSpec: 'Un número: el largo de la subsecuencia estrictamente creciente más larga.',
    constraints: '1 ≤ N ≤ 2·10⁵ · 1 ≤ aᵢ ≤ 10⁹.',
    difficulty: 'dificil',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      lis([10, 9, 2, 5, 3, 7, 101, 18]),
      lis([3, 3, 3, 3, 3]),
      lis(azar(5656, 1000000000)),
      lis(creciente),
      lis(decreciente),
      lis(azar(6565, 100)),
      lis(sierra),
      lis([42]),
      lis([1, 2, 1, 2, 1, 2, 3]),
    ]),
    starter: {
      python: code`
        import sys
        from bisect import bisect_left

        data = sys.stdin.buffer.read().split()
        n = int(data[0])
        a = [int(x) for x in data[1:1 + n]]
        colas = []
        for x in a:
            # TODO: busca con bisect_left la primera cola >= x;
            # si no hay ninguna, agrega x al final; si la hay, reemplázala por x
            pass
        print(len(colas))
      `,
      cpp: code`
        #include <algorithm>
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n;
            cin >> n;
            vector<int> colas;
            for (int i = 0; i < n; i++) {
                int x;
                cin >> x;
                // TODO: busca con lower_bound la primera cola >= x;
                // si no hay ninguna, agrega x al final; si la hay, reemplázala por x
            }
            cout << colas.size() << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.io.StreamTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                StreamTokenizer in = new StreamTokenizer(new BufferedReader(new InputStreamReader(System.in)));
                in.nextToken();
                int n = (int) in.nval;
                int[] colas = new int[n];
                int largo = 0;
                for (int i = 0; i < n; i++) {
                    in.nextToken();
                    int x = (int) in.nval;
                    // TODO: busca con búsqueda binaria la primera posición lo < largo con colas[lo] >= x;
                    // pon colas[lo] = x y, si lo == largo, la escalera crece (largo++)
                }
                System.out.println(largo);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        from bisect import bisect_left

        data = sys.stdin.buffer.read().split()
        n = int(data[0])
        a = [int(x) for x in data[1:1 + n]]
        colas = []
        for x in a:
            k = bisect_left(colas, x)
            if k == len(colas):
                colas.append(x)
            else:
                colas[k] = x
        print(len(colas))
      `,
      cpp: code`
        #include <algorithm>
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n;
            cin >> n;
            vector<int> colas;
            for (int i = 0; i < n; i++) {
                int x;
                cin >> x;
                auto it = lower_bound(colas.begin(), colas.end(), x);
                if (it == colas.end()) colas.push_back(x);
                else *it = x;
            }
            cout << colas.size() << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.io.StreamTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                StreamTokenizer in = new StreamTokenizer(new BufferedReader(new InputStreamReader(System.in)));
                in.nextToken();
                int n = (int) in.nval;
                int[] colas = new int[n];
                int largo = 0;
                for (int i = 0; i < n; i++) {
                    in.nextToken();
                    int x = (int) in.nval;
                    int lo = 0, hi = largo;
                    while (lo < hi) {
                        int mid = (lo + hi) / 2;
                        if (colas[mid] < x) lo = mid + 1;
                        else hi = mid;
                    }
                    colas[lo] = x;
                    if (lo == largo) largo++;
                }
                System.out.println(largo);
            }
        }
      `,
    },
    hints: [
      'La DP clásica (para cada i, mirar todos los j < i) son unos n²/2 = 2·10¹⁰ pasos con n = 2·10⁵. Hace falta algo mejor.',
      'Guarda, para cada largo posible, el menor brillo con el que puede terminar una escalera de ese largo. Esa lista siempre queda ordenada de menor a mayor.',
      'Para cada x: busca (con búsqueda binaria) la primera cola ≥ x. Si no existe, agrega x al final; si existe, reemplázala por x. Al terminar, el largo de la lista es la respuesta.',
    ],
  },
  outro: [
    { speaker: 'SELENE', text: '¡Doscientas mil estrellas antes del amanecer! Y la escalera más larga, sin dudar.' },
    { speaker: 'SELENE', text: 'Guardar el mejor final para cada largo, y buscarlo con binaria: de n² a n log n.' },
    { speaker: 'SELENE', text: 'Gaspar, el copista, trabaja en el piso de arriba. Compara manuscritos letra por letra.' },
  ],
  rewardTip: {
    title: 'LIS en O(n log n)',
    text: {
      python: 'colas[k] = menor final de una escalera de largo k + 1. k = bisect_left(colas, x): agrega o reemplaza. len(colas) es la respuesta.',
      cpp: 'colas[k] = menor final de largo k + 1. lower_bound para estricta, upper_bound para no estricta. colas.size() es la respuesta.',
      java: 'colas[k] = menor final de largo k + 1. Búsqueda binaria a mano sobre int[] con un contador de largo.',
    },
  },
};
