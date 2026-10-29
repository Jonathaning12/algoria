import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

/** Montículo genérico (solo para calcular respuestas). */
class Heap<T> {
  private h: T[] = [];
  constructor(private less: (a: T, b: T) => boolean) {}
  get size() {
    return this.h.length;
  }
  peek(): T {
    return this.h[0]!;
  }
  push(x: T) {
    const h = this.h;
    h.push(x);
    let i = h.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.less(h[i]!, h[p]!)) break;
      [h[p], h[i]] = [h[i]!, h[p]!];
      i = p;
    }
  }
  pop(): T {
    const h = this.h;
    const top = h[0]!;
    const last = h.pop()!;
    if (h.length > 0) {
      h[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, rr = l + 1;
        let m = i;
        if (l < h.length && this.less(h[l]!, h[m]!)) m = l;
        if (rr < h.length && this.less(h[rr]!, h[m]!)) m = rr;
        if (m === i) break;
        [h[m], h[i]] = [h[i]!, h[m]!];
        i = m;
      }
    }
    return top;
  }
}

/** barcos: [llegada, duración], con llegadas no decrecientes. */
const amarres = (m: number, barcos: [number, number][]): [string, string] => {
  const libres = new Heap<number>((a, b) => a < b);
  for (let i = 1; i <= m; i++) libres.push(i);
  const ocupados = new Heap<[number, number]>((a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]));
  const atendidos = new Array<number>(m + 1).fill(0);
  let espera = 0n;
  let fin = 0;
  for (const [t, d] of barcos) {
    while (ocupados.size > 0 && ocupados.peek()[0] <= t) libres.push(ocupados.pop()[1]);
    let inicio: number, muelle: number;
    if (libres.size > 0) {
      inicio = t;
      muelle = libres.pop();
    } else {
      [inicio, muelle] = ocupados.pop();
    }
    espera += BigInt(inicio - t);
    atendidos[muelle]!++;
    ocupados.push([inicio + d, muelle]);
    fin = Math.max(fin, inicio + d);
  }
  let mejor = 1;
  for (let i = 2; i <= m; i++) if (atendidos[i]! > atendidos[mejor]!) mejor = i;
  return [`${barcos.length} ${m}\n${barcos.map(([t, d]) => `${t} ${d}`).join('\n')}`, `${fin}\n${espera}\n${mejor}`];
};

const r = rng(3838);
const N = 200000;
/** N barcos con llegadas crecientes: separación entre 0 y `salto`, duración entre 1 y `dmax`. */
const flota = (n: number, salto: number, dmax: number): [number, number][] => {
  let t = r(0, 1000);
  return Array.from({ length: n }, () => {
    t += r(0, salto);
    return [t, r(1, dmax)] as [number, number];
  });
};
const todosJuntos: [number, number][] = Array.from({ length: N }, () => [0, r(1, 10000)]);

export const nivel38: Level = {
  number: 38,
  id: 'n38-simulacion-con-heap',
  title: 'Simulación con heap',
  topic: 'Colas de prioridad (heap)',
  npc: { id: 'dora', name: 'DORA', title: 'Controladora de amarres', sprite: 'npc38', x: 15, y: 9 },
  greeting: 'No me importa quién llegó a amarrar primero, sino qué muelle se libera antes.',
  intro: [
    { speaker: 'DORA', text: 'Hola, hola. Soy Dora y decido en qué muelle amarra cada barco que llega al puerto.' },
    { speaker: 'DORA', text: 'Los barcos llegan a su hora y esperan en orden si no hay lugar. Lo difícil es saber qué muelle se libera primero.' },
    { speaker: 'DORA', text: 'Con cien mil muelles no puedo revisarlos todos cada vez. Así que guardo los eventos en un heap ordenado por tiempo.' },
    { speaker: 'DORA', text: '¿Te muestro cómo simulo el puerto o vamos directo al duelo?' },
  ],
  lesson: {
    concept: 'SIMULACIÓN POR EVENTOS',
    goals: ['Guardar eventos futuros en un heap ordenado por tiempo', 'Procesar siempre el evento más próximo', 'Liberar recursos cuando su tiempo ya pasó'],
    explanation:
      'Para simular algo en el tiempo no hace falta avanzar segundo a segundo: basta con saltar de evento en evento. ' +
      'Guarda en un heap de mínimos cuándo termina cada tarea en curso. Al llegar una nueva en el tiempo t, saca del heap todas las que terminan en t o antes: esos recursos quedaron libres. ' +
      'El tamaño del heap te dice cuántos recursos están ocupados en cada momento.',
    code: {
      python: code`
        import heapq

        n = int(input())
        fines = []  # cuándo termina cada amarre en curso
        maximo = 0
        for _ in range(n):
            inicio, fin = map(int, input().split())
            while fines and fines[0] <= inicio:
                heapq.heappop(fines)  # ese muelle ya se liberó
            heapq.heappush(fines, fin)
            maximo = max(maximo, len(fines))
        print(maximo)
      `,
      cpp: code`
        #include <iostream>
        #include <queue>
        #include <vector>
        #include <algorithm>
        using namespace std;

        int main() {
            int n;
            cin >> n;
            priority_queue<long long, vector<long long>, greater<long long>> fines;
            int maximo = 0;
            for (int i = 0; i < n; i++) {
                long long inicio, fin;
                cin >> inicio >> fin;
                while (!fines.empty() && fines.top() <= inicio) fines.pop();  // muelle libre
                fines.push(fin);
                maximo = max(maximo, (int)fines.size());
            }
            cout << maximo << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.PriorityQueue;
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                PriorityQueue<Long> fines = new PriorityQueue<>();
                int maximo = 0;
                for (int i = 0; i < n; i++) {
                    long inicio = sc.nextLong();
                    long fin = sc.nextLong();
                    while (!fines.isEmpty() && fines.peek() <= inicio) fines.poll();  // muelle libre
                    fines.add(fin);
                    maximo = Math.max(maximo, fines.size());
                }
                System.out.println(maximo);
            }
        }
      `,
    },
    examples: [
      { input: '3\n0 5\n1 3\n4 6', output: '2' },
      { input: '2\n0 2\n2 4', output: '1' },
      { input: '3\n0 10\n0 10\n0 10', output: '3' },
    ],
    tips: {
      python: 'Las tuplas se comparan por partes: heappush(h, (fin, muelle)) ordena por fin y, en empate, por número de muelle.',
      cpp: 'Un priority_queue de pair<long long,int> con greater<> ordena por fin y luego por muelle. Usa long long para los tiempos.',
      java: 'Para pares usa long[] con un comparador: new PriorityQueue<long[]>((a, b) -> a[0] != b[0] ? Long.compare(a[0], b[0]) : Long.compare(a[1], b[1])).',
    },
    quiz: {
      question: '¿Qué imprime este programa? (heap de mínimos)',
      code: {
        python: code`
          import heapq

          h = [7, 2, 9, 4]
          heapq.heapify(h)
          t = heapq.heappop(h)
          heapq.heappush(h, t + 5)
          a = heapq.heappop(h)
          b = heapq.heappop(h)
          print(a, b)
        `,
        cpp: code`
          #include <iostream>
          #include <queue>
          #include <vector>
          using namespace std;

          int main() {
              priority_queue<int, vector<int>, greater<int>> h;
              int v[4] = {7, 2, 9, 4};
              for (int x : v) h.push(x);
              int t = h.top(); h.pop();
              h.push(t + 5);
              int a = h.top(); h.pop();
              int b = h.top(); h.pop();
              cout << a << " " << b << "\n";
              return 0;
          }
        `,
        java: code`
          import java.util.PriorityQueue;

          public class Main {
              public static void main(String[] args) {
                  PriorityQueue<Integer> h = new PriorityQueue<>();
                  int[] v = {7, 2, 9, 4};
                  for (int x : v) h.add(x);
                  int t = h.poll();
                  h.add(t + 5);
                  int a = h.poll();
                  int b = h.poll();
                  System.out.println(a + " " + b);
              }
          }
        `,
      },
      options: ['4 7', '7 7', '2 4'],
      answer: 0,
      explanation: 'Sale el 2 y vuelve como 7. Quedan 4, 7, 7 y 9: los dos menores son 4 y 7. Así se reprograma un evento.',
      wrongHint: 'El 2 ya salió y volvió a entrar con otro valor. ¿Cuáles son ahora los dos menores?',
    },
  },
  problem: {
    id: 'p38-amarres-de-dora',
    title: 'LOS AMARRES DE DORA',
    statement:
      'El puerto tiene M muelles numerados de 1 a M. Llegan N barcos; el barco i llega en el tiempo tᵢ y necesita dᵢ unidades de tiempo amarrado. ' +
      'Los barcos se atienden en el orden de la entrada. Si al llegar hay muelles libres, el barco amarra enseguida en el libre de menor número. ' +
      'Si no, espera y amarra en cuanto se libere un muelle; si se liberan varios a la vez, toma el de menor número. Un muelle que se libera en el tiempo t ya está libre para un barco que llega en t. ' +
      'Imprime cuándo termina el último amarre, la suma de las esperas de todos los barcos y el muelle que atendió más barcos (en empate, el de menor número).',
    inputSpec: 'Línea 1: N y M. Luego N líneas con tᵢ y dᵢ, con los tᵢ en orden no decreciente.',
    outputSpec: 'Tres líneas: el tiempo en que termina el último amarre, la espera total y el número del muelle que atendió más barcos.',
    constraints: '1 ≤ N ≤ 2·10⁵ · 1 ≤ M ≤ 10⁵ · 0 ≤ tᵢ ≤ 10⁹ · 1 ≤ dᵢ ≤ 10⁴ · La espera total puede pasar de 2·10⁹: usa enteros de 64 bits.',
    difficulty: 'dificil',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      amarres(2, [[0, 5], [1, 3], [2, 2], [4, 1], [6, 4]]),
      amarres(3, [[1, 2], [1, 2], [10, 1], [10, 1]]),
      amarres(1, [[0, 3], [0, 3], [0, 3]]),
      amarres(3, [[5, 1]]),
      amarres(2, [[0, 4], [0, 4], [4, 1], [4, 1], [4, 1]]),
      amarres(1, flota(N, 5, 10)),
      amarres(100000, flota(N, 0, 10000)),
      amarres(1000, todosJuntos),
      amarres(50, flota(N, 100, 10000)),
      amarres(70000, flota(N, 1, 9999)),
    ]),
    starter: {
      python: code`
        import sys
        import heapq

        datos = sys.stdin.buffer.read().split()
        n, m = int(datos[0]), int(datos[1])
        libres = list(range(1, m + 1))  # ya es un heap: está ordenada
        ocupados = []  # (tiempo en que se libera, muelle)
        atendidos = [0] * (m + 1)
        espera = 0
        fin = 0
        for i in range(n):
            t, d = int(datos[2 + 2 * i]), int(datos[3 + 2 * i])
            # TODO: pasa a libres los muelles que se liberan en t o antes;
            # si hay libre, amarra en el menor; si no, en el primero que se libere
        mejor = 1
        for j in range(2, m + 1):
            if atendidos[j] > atendidos[mejor]:
                mejor = j
        print(fin)
        print(espera)
        print(mejor)
      `,
      cpp: code`
        #include <iostream>
        #include <queue>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, m;
            cin >> n >> m;
            priority_queue<int, vector<int>, greater<int>> libres;
            for (int j = 1; j <= m; j++) libres.push(j);
            // (tiempo en que se libera, muelle)
            priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<pair<long long, int>>> ocupados;
            vector<int> atendidos(m + 1, 0);
            long long espera = 0, fin = 0;
            for (int i = 0; i < n; i++) {
                long long t, d;
                cin >> t >> d;
                // TODO: pasa a libres los muelles que se liberan en t o antes;
                // si hay libre, amarra en el menor; si no, en el primero que se libere
            }
            int mejor = 1;
            for (int j = 2; j <= m; j++) if (atendidos[j] > atendidos[mejor]) mejor = j;
            cout << fin << "\n" << espera << "\n" << mejor << "\n";
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
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int m = Integer.parseInt(st.nextToken());
                PriorityQueue<Integer> libres = new PriorityQueue<>();
                for (int j = 1; j <= m; j++) libres.add(j);
                // {tiempo en que se libera, muelle}
                PriorityQueue<long[]> ocupados = new PriorityQueue<>((a, b) -> a[0] != b[0] ? Long.compare(a[0], b[0]) : Long.compare(a[1], b[1]));
                int[] atendidos = new int[m + 1];
                long espera = 0, fin = 0;
                for (int i = 0; i < n; i++) {
                    st = new StringTokenizer(br.readLine());
                    long t = Long.parseLong(st.nextToken());
                    long d = Long.parseLong(st.nextToken());
                    // TODO: pasa a libres los muelles que se liberan en t o antes;
                    // si hay libre, amarra en el menor; si no, en el primero que se libere
                }
                int mejor = 1;
                for (int j = 2; j <= m; j++) if (atendidos[j] > atendidos[mejor]) mejor = j;
                System.out.println(fin);
                System.out.println(espera);
                System.out.println(mejor);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        import heapq

        datos = sys.stdin.buffer.read().split()
        n, m = int(datos[0]), int(datos[1])
        libres = list(range(1, m + 1))  # ya es un heap: está ordenada
        ocupados = []  # (tiempo en que se libera, muelle)
        atendidos = [0] * (m + 1)
        espera = 0
        fin = 0
        for i in range(n):
            t, d = int(datos[2 + 2 * i]), int(datos[3 + 2 * i])
            while ocupados and ocupados[0][0] <= t:
                heapq.heappush(libres, heapq.heappop(ocupados)[1])
            if libres:
                inicio = t
                muelle = heapq.heappop(libres)
            else:
                inicio, muelle = heapq.heappop(ocupados)
            espera += inicio - t
            atendidos[muelle] += 1
            heapq.heappush(ocupados, (inicio + d, muelle))
            if inicio + d > fin:
                fin = inicio + d
        mejor = 1
        for j in range(2, m + 1):
            if atendidos[j] > atendidos[mejor]:
                mejor = j
        print(fin)
        print(espera)
        print(mejor)
      `,
      cpp: code`
        #include <iostream>
        #include <queue>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, m;
            cin >> n >> m;
            priority_queue<int, vector<int>, greater<int>> libres;
            for (int j = 1; j <= m; j++) libres.push(j);
            // (tiempo en que se libera, muelle)
            priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<pair<long long, int>>> ocupados;
            vector<int> atendidos(m + 1, 0);
            long long espera = 0, fin = 0;
            for (int i = 0; i < n; i++) {
                long long t, d;
                cin >> t >> d;
                while (!ocupados.empty() && ocupados.top().first <= t) {
                    libres.push(ocupados.top().second);
                    ocupados.pop();
                }
                long long inicio;
                int muelle;
                if (!libres.empty()) {
                    inicio = t;
                    muelle = libres.top();
                    libres.pop();
                } else {
                    inicio = ocupados.top().first;
                    muelle = ocupados.top().second;
                    ocupados.pop();
                }
                espera += inicio - t;
                atendidos[muelle]++;
                ocupados.push({inicio + d, muelle});
                if (inicio + d > fin) fin = inicio + d;
            }
            int mejor = 1;
            for (int j = 2; j <= m; j++) if (atendidos[j] > atendidos[mejor]) mejor = j;
            cout << fin << "\n" << espera << "\n" << mejor << "\n";
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
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int m = Integer.parseInt(st.nextToken());
                PriorityQueue<Integer> libres = new PriorityQueue<>();
                for (int j = 1; j <= m; j++) libres.add(j);
                // {tiempo en que se libera, muelle}
                PriorityQueue<long[]> ocupados = new PriorityQueue<>((a, b) -> a[0] != b[0] ? Long.compare(a[0], b[0]) : Long.compare(a[1], b[1]));
                int[] atendidos = new int[m + 1];
                long espera = 0, fin = 0;
                for (int i = 0; i < n; i++) {
                    st = new StringTokenizer(br.readLine());
                    long t = Long.parseLong(st.nextToken());
                    long d = Long.parseLong(st.nextToken());
                    while (!ocupados.isEmpty() && ocupados.peek()[0] <= t) {
                        libres.add((int) ocupados.poll()[1]);
                    }
                    long inicio;
                    int muelle;
                    if (!libres.isEmpty()) {
                        inicio = t;
                        muelle = libres.poll();
                    } else {
                        long[] e = ocupados.poll();
                        inicio = e[0];
                        muelle = (int) e[1];
                    }
                    espera += inicio - t;
                    atendidos[muelle]++;
                    ocupados.add(new long[] {inicio + d, muelle});
                    if (inicio + d > fin) fin = inicio + d;
                }
                int mejor = 1;
                for (int j = 2; j <= m; j++) if (atendidos[j] > atendidos[mejor]) mejor = j;
                System.out.println(fin);
                System.out.println(espera);
                System.out.println(mejor);
            }
        }
      `,
    },
    hints: [
      'Revisar los M muelles por cada barco cuesta N·M pasos: con 2·10⁵ barcos y 10⁵ muelles es demasiado. Guarda los muelles en dos heaps.',
      'Un heap de muelles libres (por número) y otro de ocupados con (tiempo en que se liberan, número). Cuando llega un barco en t, pasa a libres todos los ocupados que se liberan en t o antes.',
      'Si hay libres, amarra en el menor y empieza en t. Si no, saca el primero de ocupados: empieza cuando ese muelle se libera, y la espera es esa hora menos t. Vuelve a meter el muelle en ocupados con inicio + d.',
    ],
  },
  outro: [
    { speaker: 'DORA', text: '¡Ni un barco perdido y ni un muelle ocioso! Eres un controlador nato.' },
    { speaker: 'DORA', text: 'Saltar de evento en evento con un heap ahorra muchísimo trabajo. No lo olvides.' },
    { speaker: 'DORA', text: 'Faustino, el gruista, está al sur, frente al agua. Su grúa vigila una ventana de contenedores.' },
  ],
  rewardTip: {
    title: 'Simulación por eventos',
    text: {
      python: 'heappush(h, (tiempo, id)) y saca mientras h[0][0] <= t. Las tuplas desempatan solas por el segundo campo.',
      cpp: 'priority_queue<pair<long long,int>, vector<...>, greater<...>>: saca mientras top().first <= t.',
      java: 'PriorityQueue<long[]> con comparador por [0] y luego [1]: saca mientras peek()[0] <= t.',
    },
  },
};
