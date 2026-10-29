import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

/** Montículo de mínimos sencillo para calcular las respuestas. */
class MinHeap {
  private h: number[] = [];
  get size() {
    return this.h.length;
  }
  push(x: number) {
    const h = this.h;
    h.push(x);
    let i = h.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (h[p]! <= h[i]!) break;
      [h[p], h[i]] = [h[i]!, h[p]!];
      i = p;
    }
  }
  pop(): number {
    const h = this.h;
    const top = h[0]!;
    const last = h.pop()!;
    if (h.length > 0) {
      h[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, rr = l + 1;
        let m = i;
        if (l < h.length && h[l]! < h[m]!) m = l;
        if (rr < h.length && h[rr]! < h[m]!) m = rr;
        if (m === i) break;
        [h[m], h[i]] = [h[i]!, h[m]!];
        i = m;
      }
    }
    return top;
  }
}

const cuerdas = (a: number[]): [string, string] => {
  const heap = new MinHeap();
  for (const x of a) heap.push(x);
  // Todo cabe en un número exacto de JS: el costo total no pasa de unos 4·10¹⁵ < 2⁵³.
  let costo = 0;
  while (heap.size > 1) {
    const s = heap.pop() + heap.pop();
    costo += s;
    heap.push(s);
  }
  return [`${a.length}\n${a.join(' ')}`, String(costo)];
};

const N = 200000;
const r = rng(3737);
const aleatoria = Array.from({ length: N }, () => r(1, 1000000000));
const maximas = Array.from({ length: N }, () => 1000000000);
const crecientes = Array.from({ length: N }, (_, i) => i + 1);
const mixtas = Array.from({ length: N }, () => (r(0, 9) === 0 ? r(100000000, 1000000000) : r(1, 100)));

export const nivel37: Level = {
  number: 37,
  id: 'n37-cola-de-prioridad',
  title: 'Cola de prioridad',
  topic: 'Colas de prioridad (heap)',
  npc: { id: 'anselmo', name: 'ANSELMO', title: 'Cordelero del puerto', sprite: 'npc37', x: 10, y: 9 },
  greeting: 'Siempre ato primero las dos cuerdas más cortas. El bolsillo lo agradece.',
  intro: [
    { speaker: 'ANSELMO', text: 'Hola, joven. Soy Anselmo y hago las cuerdas más largas del puerto atando otras más cortas.' },
    { speaker: 'ANSELMO', text: 'Cada nudo cuesta tanto como el largo de las dos cuerdas que uno. Y la cuerda nueva vuelve al montón.' },
    { speaker: 'ANSELMO', text: 'El secreto es siempre tomar las dos más cortas. Pero buscarlas en todo el montón cada vez es lentísimo.' },
    { speaker: 'ANSELMO', text: 'Hay una estructura que te da la más chica al instante. ¿La vemos o vamos al duelo?' },
  ],
  lesson: {
    concept: 'COLA DE PRIORIDAD (HEAP)',
    goals: ['Sacar siempre el menor (o el mayor) en O(log n)', 'Volver a meter elementos mientras trabajas', 'Quedarte con los K mayores usando un heap de tamaño K'],
    explanation:
      'Una cola de prioridad no atiende por orden de llegada sino por importancia: siempre sale el menor (o el mayor). ' +
      'Meter y sacar cuestan O(log n), y mirar el primero, O(1). ' +
      'Truco clásico: para quedarte con los K mayores, guarda un heap de mínimos con K elementos; si llega uno más grande que el mínimo, saca el mínimo y mete el nuevo.',
    code: {
      python: code`
        import heapq

        n, k = map(int, input().split())
        heap = []  # heap de mínimos con los k mayores vistos
        for x in map(int, input().split()):
            heapq.heappush(heap, x)
            if len(heap) > k:
                heapq.heappop(heap)  # sale el más chico
        print(*sorted(heap, reverse=True))
      `,
      cpp: code`
        #include <iostream>
        #include <queue>
        #include <vector>
        #include <algorithm>
        using namespace std;

        int main() {
            int n, k;
            cin >> n >> k;
            priority_queue<int, vector<int>, greater<int>> heap;  // de mínimos
            for (int i = 0; i < n; i++) {
                int x;
                cin >> x;
                heap.push(x);
                if ((int)heap.size() > k) heap.pop();  // sale el más chico
            }
            vector<int> res;
            while (!heap.empty()) {
                res.push_back(heap.top());
                heap.pop();
            }
            reverse(res.begin(), res.end());
            for (int i = 0; i < (int)res.size(); i++) cout << res[i] << (i + 1 < (int)res.size() ? " " : "\n");
            return 0;
        }
      `,
      java: code`
        import java.util.ArrayList;
        import java.util.Collections;
        import java.util.PriorityQueue;
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                int k = sc.nextInt();
                PriorityQueue<Integer> heap = new PriorityQueue<>();  // de mínimos
                for (int i = 0; i < n; i++) {
                    heap.add(sc.nextInt());
                    if (heap.size() > k) heap.poll();  // sale el más chico
                }
                ArrayList<Integer> res = new ArrayList<>();
                while (!heap.isEmpty()) res.add(heap.poll());
                Collections.reverse(res);
                StringBuilder sb = new StringBuilder();
                for (int x : res) {
                    if (sb.length() > 0) sb.append(" ");
                    sb.append(x);
                }
                System.out.println(sb);
            }
        }
      `,
    },
    examples: [
      { input: '6 3\n5 1 9 3 7 2', output: '9 7 5' },
      { input: '3 1\n4 4 2', output: '4' },
      { input: '4 4\n1 2 3 4', output: '4 3 2 1' },
    ],
    tips: {
      python: 'heapq es de mínimos: heappush y heappop. heap[0] es el menor. Para un heap de máximos, guarda los números con signo negativo.',
      cpp: 'priority_queue es de MÁXIMOS por defecto. Para mínimos: priority_queue<T, vector<T>, greater<T>>.',
      java: 'PriorityQueue es de mínimos: add, peek, poll. Para máximos: new PriorityQueue<>(Collections.reverseOrder()).',
    },
    quiz: {
      question: '¿Qué imprime este programa? (heap de mínimos)',
      code: {
        python: code`
          import heapq

          heap = []
          for x in [5, 1, 8, 3]:
              heapq.heappush(heap, x)
          heapq.heappop(heap)
          print(heapq.heappop(heap))
        `,
        cpp: code`
          #include <iostream>
          #include <queue>
          #include <vector>
          using namespace std;

          int main() {
              priority_queue<int, vector<int>, greater<int>> heap;
              int v[4] = {5, 1, 8, 3};
              for (int x : v) heap.push(x);
              heap.pop();
              cout << heap.top() << "\n";
              return 0;
          }
        `,
        java: code`
          import java.util.PriorityQueue;

          public class Main {
              public static void main(String[] args) {
                  PriorityQueue<Integer> heap = new PriorityQueue<>();
                  int[] v = {5, 1, 8, 3};
                  for (int x : v) heap.add(x);
                  heap.poll();
                  System.out.println(heap.poll());
              }
          }
        `,
      },
      options: ['3', '5', '1'],
      answer: 0,
      explanation: 'Un heap de mínimos siempre entrega el menor. Primero sale el 1 y luego el 3, sin importar el orden en que entraron.',
      wrongHint: 'No sale el que entró primero ni el último: sale el más chico que quede dentro.',
    },
  },
  problem: {
    id: 'p37-cuerdas-de-anselmo',
    title: 'LAS CUERDAS DE ANSELMO',
    statement:
      'Anselmo tiene N cuerdas de largos a₁, a₂, ..., aₙ y quiere unirlas todas en una sola. ' +
      'Cada nudo une dos cuerdas y cuesta la suma de sus largos; la cuerda resultante vuelve al montón. ' +
      '¿Cuál es el menor costo total para que quede una sola cuerda? Si ya hay una sola, el costo es 0.',
    inputSpec: 'Línea 1: N. Línea 2: N enteros a₁ ... aₙ.',
    outputSpec: 'Una línea con el costo mínimo total.',
    constraints: '1 ≤ N ≤ 2·10⁵ · 1 ≤ aᵢ ≤ 10⁹ · El costo puede llegar a unos 4·10¹⁵: usa enteros de 64 bits.',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      cuerdas([4, 3, 2, 6]),
      cuerdas([10]),
      cuerdas([1, 1, 1]),
      cuerdas([5, 5]),
      cuerdas([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
      cuerdas(aleatoria),
      cuerdas(maximas),
      cuerdas(crecientes),
      cuerdas(mixtas),
    ]),
    starter: {
      python: code`
        import sys
        import heapq

        datos = sys.stdin.buffer.read().split()
        n = int(datos[0])
        heap = list(map(int, datos[1:1 + n]))
        heapq.heapify(heap)
        costo = 0
        # TODO: mientras quede más de una cuerda, saca las dos más cortas,
        # súmalas al costo y mete la nueva cuerda en el heap
        print(costo)
      `,
      cpp: code`
        #include <iostream>
        #include <queue>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n;
            cin >> n;
            priority_queue<long long, vector<long long>, greater<long long>> heap;
            for (int i = 0; i < n; i++) {
                long long x;
                cin >> x;
                heap.push(x);
            }
            long long costo = 0;
            // TODO: mientras quede más de una cuerda, saca las dos más cortas,
            // súmalas al costo y mete la nueva cuerda en el heap
            cout << costo << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.PriorityQueue;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                int n = Integer.parseInt(br.readLine().trim());
                StringTokenizer st = new StringTokenizer(br.readLine());
                PriorityQueue<Long> heap = new PriorityQueue<>();
                for (int i = 0; i < n; i++) heap.add(Long.parseLong(st.nextToken()));
                long costo = 0;
                // TODO: mientras quede más de una cuerda, saca las dos más cortas,
                // súmalas al costo y mete la nueva cuerda en el heap
                System.out.println(costo);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        import heapq

        datos = sys.stdin.buffer.read().split()
        n = int(datos[0])
        heap = list(map(int, datos[1:1 + n]))
        heapq.heapify(heap)
        costo = 0
        while len(heap) > 1:
            a = heapq.heappop(heap)
            b = heapq.heappop(heap)
            costo += a + b
            heapq.heappush(heap, a + b)
        print(costo)
      `,
      cpp: code`
        #include <iostream>
        #include <queue>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n;
            cin >> n;
            priority_queue<long long, vector<long long>, greater<long long>> heap;
            for (int i = 0; i < n; i++) {
                long long x;
                cin >> x;
                heap.push(x);
            }
            long long costo = 0;
            while (heap.size() > 1) {
                long long a = heap.top();
                heap.pop();
                long long b = heap.top();
                heap.pop();
                costo += a + b;
                heap.push(a + b);
            }
            cout << costo << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.PriorityQueue;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                int n = Integer.parseInt(br.readLine().trim());
                StringTokenizer st = new StringTokenizer(br.readLine());
                PriorityQueue<Long> heap = new PriorityQueue<>();
                for (int i = 0; i < n; i++) heap.add(Long.parseLong(st.nextToken()));
                long costo = 0;
                while (heap.size() > 1) {
                    long a = heap.poll();
                    long b = heap.poll();
                    costo += a + b;
                    heap.add(a + b);
                }
                System.out.println(costo);
            }
        }
      `,
    },
    hints: [
      'Las cuerdas que se atan primero se pagan muchas veces (vuelven al montón y se atan otra vez). Conviene que esas sean las más cortas.',
      'En cada paso, toma las dos cuerdas más cortas del montón, átalas y devuelve la nueva. Ordenar todo de nuevo en cada paso sería O(n² log n).',
      'Usa una cola de prioridad de mínimos: saca dos, suma a + b al costo y mete a + b. Repite hasta que quede una sola. Usa enteros de 64 bits.',
    ],
  },
  outro: [
    { speaker: 'ANSELMO', text: 'Una sola cuerda, larguísima, y al menor precio posible. ¡Así se trabaja!' },
    { speaker: 'ANSELMO', text: 'Cuando necesites el más chico una y otra vez mientras el montón cambia, usa una cola de prioridad.' },
    { speaker: 'ANSELMO', text: 'Dora, la controladora de amarres, está a la derecha. Ella usa un heap para saber qué muelle se libera primero.' },
  ],
  rewardTip: {
    title: 'Cola de prioridad',
    text: {
      python: 'import heapq: heapify(l), heappush(h, x), heappop(h) → el menor. Para máximos, guarda -x.',
      cpp: 'priority_queue<T> es de máximos; con vector<T>, greater<T> es de mínimos. push, top, pop: O(log n).',
      java: 'PriorityQueue<T> es de mínimos: add, peek, poll en O(log n). Collections.reverseOrder() para máximos.',
    },
  },
};
