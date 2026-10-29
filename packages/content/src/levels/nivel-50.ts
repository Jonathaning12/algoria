import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

type Sendero = [number, number, number];
type Tunel = [number, number];

/** Montículo de pares [distancia, nodo] para generar las salidas esperadas. */
class MinHeap {
  private a: [number, number][] = [];
  get size() {
    return this.a.length;
  }
  push(x: [number, number]) {
    const a = this.a;
    a.push(x);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p]![0] <= a[i]![0]) break;
      [a[p], a[i]] = [a[i]!, a[p]!];
      i = p;
    }
  }
  pop(): [number, number] {
    const a = this.a;
    const top = a[0]!;
    const last = a.pop()!;
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l]![0] < a[m]![0]) m = l;
        if (r < a.length && a[r]![0] < a[m]![0]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i]!, a[m]!];
        i = m;
      }
    }
    return top;
  }
}

const rescate = (n: number, senderos: Sendero[], tuneles: Tunel[]): [string, string] => {
  const padre = Array.from({ length: n + 1 }, (_, i) => i);
  const raiz = (x: number) => {
    while (padre[x] !== x) {
      padre[x] = padre[padre[x]!]!;
      x = padre[x]!;
    }
    return x;
  };
  for (const [a, b] of tuneles) padre[raiz(a)] = raiz(b);
  let zonas = 0;
  for (let i = 1; i <= n; i++) if (raiz(i) === i) zonas++;
  const adj: [number, number][][] = Array.from({ length: n + 1 }, () => []);
  for (const [a, b, w] of senderos) {
    const ra = raiz(a);
    const rb = raiz(b);
    if (ra === rb) continue;
    adj[ra]!.push([rb, w]);
    adj[rb]!.push([ra, w]);
  }
  const s = raiz(1);
  const t = raiz(n);
  // BFS: menos senderos.
  const pasos = new Array<number>(n + 1).fill(-1);
  pasos[s] = 0;
  const cola = [s];
  for (let i = 0; i < cola.length; i++) {
    const u = cola[i]!;
    for (const [v] of adj[u]!) {
      if (pasos[v] === -1) {
        pasos[v] = pasos[u]! + 1;
        cola.push(v);
      }
    }
  }
  // Dijkstra: menos minutos (cabe exacto en number: < 2⁵³).
  const dist = new Array<number>(n + 1).fill(Infinity);
  dist[s] = 0;
  const h = new MinHeap();
  h.push([0, s]);
  while (h.size) {
    const [d, u] = h.pop();
    if (d > dist[u]!) continue;
    for (const [v, w] of adj[u]!) {
      if (d + w < dist[v]!) {
        dist[v] = d + w;
        h.push([d + w, v]);
      }
    }
  }
  const lineas = [
    `${n} ${senderos.length} ${tuneles.length}`,
    ...senderos.map(([a, b, w]) => `${a} ${b} ${w}`),
    ...tuneles.map(([a, b]) => `${a} ${b}`),
  ];
  return [lineas.join('\n'), `${zonas}\n${pasos[t]}\n${dist[t] === Infinity ? -1 : dist[t]}`];
};

const r = rng(5050);
const barajar = <T>(a: T[]): T[] => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = r(0, i);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};
const senderosAzar = (desde: number, hasta: number, m: number, lo: number, hi: number): Sendero[] => {
  const res: Sendero[] = [];
  while (res.length < m) {
    const a = r(desde, hasta);
    const b = r(desde, hasta);
    if (a !== b) res.push([a, b, r(lo, hi)]);
  }
  return res;
};
const tunelesAzar = (desde: number, hasta: number, k: number): Tunel[] => {
  const res: Tunel[] = [];
  while (res.length < k) {
    const a = r(desde, hasta);
    const b = r(desde, hasta);
    if (a !== b) res.push([a, b]);
  }
  return res;
};
const N = 100000;
const largo = barajar(Array.from({ length: N - 1 }, (_, i): Sendero => [i + 1, i + 2, 1000000000]));
const mitades = {
  s: barajar([...senderosAzar(1, N / 2, 75000, 1, 1000000000), ...senderosAzar(N / 2 + 1, N, 75000, 1, 1000000000)]),
  t: barajar([...tunelesAzar(1, N / 2, 20000), ...tunelesAzar(N / 2 + 1, N, 20000)]),
};

export const nivel50: Level = {
  number: 50,
  id: 'n50-gimnasio-montana',
  title: 'Gimnasio Montaña',
  topic: 'Repaso: BFS, Dijkstra y Union-Find',
  gym: true,
  npc: { id: 'kora', name: 'ALPINISTA KORA', title: 'Líder del Gimnasio Montaña', sprite: 'gym_montana', x: 7, y: 11 },
  greeting: 'La cumbre no se regala. Se gana paso a paso, y eligiendo bien cada paso.',
  intro: [
    { speaker: 'KORA', text: 'Bienvenido al Gimnasio Montaña. Soy Kora, y he subido cada pico de esta cordillera.' },
    { speaker: 'KORA', text: 'Rocío, Eladio, Nima, Neva, Bombo, Herminia, Fausto, Olga e Ignacio me hablaron de ti.' },
    { speaker: 'KORA', text: 'Mi reto es un rescate. Hay túneles de hielo que se cruzan gratis y senderos que cuestan minutos.' },
    { speaker: 'KORA', text: 'Vas a necesitar Union-Find para las zonas, BFS para contar senderos y Dijkstra para el tiempo.' },
    { speaker: 'KORA', text: '¿Un último repaso o subimos directo al duelo?' },
  ],
  lesson: {
    concept: 'REPASO: CONTRAER CON UNION-FIND',
    goals: ['Agrupar nodos unidos gratis en una sola zona', 'Construir el grafo de zonas', 'Correr BFS y Dijkstra sobre ese grafo más chico'],
    explanation:
      'Si algunos nodos están unidos por caminos gratis, puedes tratarlos como uno solo: eso es contraer. ' +
      'Une con Union-Find los extremos de cada túnel; el jefe de cada grupo representa a toda la zona. ' +
      'Luego cada sendero a b se vuelve un sendero entre find(a) y find(b), y los que quedan dentro de una misma zona desaparecen. ' +
      'Sobre ese grafo de zonas, BFS cuenta senderos y Dijkstra suma minutos, igual que antes.',
    code: {
      python: code`
        import sys
        input = sys.stdin.readline

        def find(x):
            while padre[x] != x:
                padre[x] = padre[padre[x]]
                x = padre[x]
            return x

        n, k = map(int, input().split())
        padre = list(range(n + 1))
        for _ in range(k):
            a, b = map(int, input().split())
            padre[find(a)] = find(b)
        etiqueta = [0] * (n + 1)
        siguiente = 0
        res = []
        for v in range(1, n + 1):
            jefe = find(v)
            if etiqueta[jefe] == 0:
                siguiente += 1
                etiqueta[jefe] = siguiente
            res.append(etiqueta[jefe])
        print(*res)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        vector<int> padre;

        int find(int x) {
            if (padre[x] == x) return x;
            return padre[x] = find(padre[x]);
        }

        int main() {
            int n, k;
            cin >> n >> k;
            padre.resize(n + 1);
            for (int i = 0; i <= n; i++) padre[i] = i;
            for (int i = 0; i < k; i++) {
                int a, b;
                cin >> a >> b;
                padre[find(a)] = find(b);
            }
            vector<int> etiqueta(n + 1, 0);
            int siguiente = 0;
            for (int v = 1; v <= n; v++) {
                int jefe = find(v);
                if (etiqueta[jefe] == 0) etiqueta[jefe] = ++siguiente;
                cout << etiqueta[jefe] << (v == n ? "\n" : " ");
            }
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
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
                int k = Integer.parseInt(st.nextToken());
                padre = new int[n + 1];
                for (int i = 0; i <= n; i++) padre[i] = i;
                for (int i = 0; i < k; i++) {
                    st = new StringTokenizer(br.readLine());
                    int a = Integer.parseInt(st.nextToken());
                    int b = Integer.parseInt(st.nextToken());
                    padre[find(a)] = find(b);
                }
                int[] etiqueta = new int[n + 1];
                int siguiente = 0;
                StringBuilder sb = new StringBuilder();
                for (int v = 1; v <= n; v++) {
                    int jefe = find(v);
                    if (etiqueta[jefe] == 0) etiqueta[jefe] = ++siguiente;
                    sb.append(v > 1 ? " " : "").append(etiqueta[jefe]);
                }
                System.out.println(sb);
            }
        }
      `,
    },
    examples: [
      { input: '5 2\n1 3\n4 5', output: '1 2 1 3 3' },
      { input: '4 3\n4 3\n3 2\n2 1', output: '1 1 1 1' },
      { input: '3 0', output: '1 2 3' },
    ],
    tips: {
      python: 'Reemplaza cada nodo por find(nodo) al armar la lista de adyacencia. Con muchos datos, lee con sys.stdin.readline.',
      cpp: 'Arma adj usando find(a) y find(b) como índices. Para Dijkstra, distancias en long long y greater<> en la cola.',
      java: 'Arma la adyacencia con find(a) y find(b). Para Dijkstra, PriorityQueue<long[]> y distancias en long.',
    },
    quiz: {
      question: 'Tras contraer las zonas, ¿cuántos senderos unen zonas distintas?',
      code: {
        python: code`
          zona = [0, 1, 1, 2, 2]
          senderos = [(1, 2), (2, 3), (3, 4), (1, 4)]
          cruzan = 0
          for a, b in senderos:
              if zona[a] != zona[b]:
                  cruzan += 1
          print(cruzan)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              int zona[] = {0, 1, 1, 2, 2};
              int senderos[4][2] = {{1, 2}, {2, 3}, {3, 4}, {1, 4}};
              int cruzan = 0;
              for (auto& s : senderos) {
                  if (zona[s[0]] != zona[s[1]]) cruzan++;
              }
              cout << cruzan << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  int[] zona = {0, 1, 1, 2, 2};
                  int[][] senderos = {{1, 2}, {2, 3}, {3, 4}, {1, 4}};
                  int cruzan = 0;
                  for (int[] s : senderos) {
                      if (zona[s[0]] != zona[s[1]]) cruzan++;
                  }
                  System.out.println(cruzan);
              }
          }
        `,
      },
      options: ['2', '4', '0'],
      answer: 0,
      explanation: 'Los senderos 1-2 y 3-4 quedan dentro de una misma zona y desaparecen. Solo 2-3 y 1-4 cruzan de zona.',
      wrongHint: 'Mira la zona de cada extremo: un sendero dentro de una zona no lleva a ningún lado nuevo.',
    },
  },
  problem: {
    id: 'p50-rescate-en-la-cumbre',
    title: 'RESCATE EN LA CUMBRE',
    statement:
      'La montaña tiene N refugios, M senderos y K túneles de hielo, todos de ida y vuelta. Recorrer un sendero toma w minutos; cruzar un túnel es gratis e instantáneo. ' +
      'Una zona es un grupo de refugios unidos solo por túneles (un refugio sin túneles es una zona propia). Kora necesita tres datos para un rescate del refugio 1 al N: ' +
      'cuántas zonas hay, cuántos senderos como mínimo hay que recorrer para ir de 1 a N (los túneles no cuentan) y cuántos minutos tarda, como mínimo, ese viaje. ' +
      'Si no se puede llegar, las dos últimas respuestas son -1.',
    inputSpec: 'Línea 1: N, M y K. Siguientes M líneas: a, b y w (un sendero de w minutos). Siguientes K líneas: a y b (un túnel).',
    outputSpec: 'Tres líneas: la cantidad de zonas; la menor cantidad de senderos de 1 a N (o -1); el menor tiempo de 1 a N (o -1).',
    constraints: '2 ≤ N ≤ 10⁵ · 0 ≤ M ≤ 2·10⁵ · 0 ≤ K ≤ 10⁵ · a ≠ b · 1 ≤ w ≤ 10⁹ · El tiempo puede pasar de 2·10⁹.',
    difficulty: 'dificil',
    xp: 250,
    timeLimitMs: 2000,
    tests: tests([
      rescate(6, [[1, 2, 4], [2, 3, 1], [3, 6, 10], [4, 5, 2], [5, 6, 3], [1, 6, 20]], [[1, 4], [2, 3]]),
      rescate(4, [[1, 2, 5]], [[3, 4]]),
      rescate(3, [[1, 2, 9]], [[1, 2], [2, 3]]),
      rescate(5, [[1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 5, 1], [1, 5, 50]], [[2, 4]]),
      rescate(N, senderosAzar(1, N, 150000, 1, 1000000000), tunelesAzar(1, N, 30000)),
      rescate(N, largo, []),
      rescate(N, senderosAzar(1, N, 100000, 1, 1000), tunelesAzar(1, N, 100000)),
      rescate(N, mitades.s, mitades.t),
      rescate(N, senderosAzar(1, N, 200000, 1, 1000), tunelesAzar(1, N, 50000)),
    ]),
    starter: {
      python: code`
        import sys
        import heapq
        from collections import deque
        input = sys.stdin.readline

        def find(x):
            while padre[x] != x:
                padre[x] = padre[padre[x]]
                x = padre[x]
            return x

        n, m, k = map(int, input().split())
        senderos = [tuple(map(int, input().split())) for _ in range(m)]
        padre = list(range(n + 1))
        for _ in range(k):
            a, b = map(int, input().split())
            padre[find(a)] = find(b)
        # TODO 1: cuenta las zonas (los nodos que son su propio jefe)
        # TODO 2: arma la adyacencia entre jefes, saltando los senderos dentro de una zona
        # TODO 3: BFS (senderos) y Dijkstra (minutos) desde find(1) hasta find(n)
      `,
      cpp: code`
        #include <functional>
        #include <iostream>
        #include <queue>
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
            int n, m, k;
            cin >> n >> m >> k;
            vector<int> sa(m), sb(m), sw(m);
            for (int i = 0; i < m; i++) cin >> sa[i] >> sb[i] >> sw[i];
            padre.resize(n + 1);
            for (int i = 0; i <= n; i++) padre[i] = i;
            for (int i = 0; i < k; i++) {
                int a, b;
                cin >> a >> b;
                padre[find(a)] = find(b);
            }
            // TODO 1: cuenta las zonas (los nodos que son su propio jefe)
            // TODO 2: arma la adyacencia entre jefes, saltando los senderos dentro de una zona
            // TODO 3: BFS (senderos) y Dijkstra (minutos) desde find(1) hasta find(n)
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayDeque;
        import java.util.ArrayList;
        import java.util.Arrays;
        import java.util.List;
        import java.util.PriorityQueue;
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
                int k = Integer.parseInt(st.nextToken());
                int[][] senderos = new int[m][3];
                for (int i = 0; i < m; i++) {
                    st = new StringTokenizer(br.readLine());
                    for (int j = 0; j < 3; j++) senderos[i][j] = Integer.parseInt(st.nextToken());
                }
                padre = new int[n + 1];
                for (int i = 0; i <= n; i++) padre[i] = i;
                for (int i = 0; i < k; i++) {
                    st = new StringTokenizer(br.readLine());
                    int a = Integer.parseInt(st.nextToken());
                    int b = Integer.parseInt(st.nextToken());
                    padre[find(a)] = find(b);
                }
                // TODO 1: cuenta las zonas (los nodos que son su propio jefe)
                // TODO 2: arma la adyacencia entre jefes, saltando los senderos dentro de una zona
                // TODO 3: BFS (senderos) y Dijkstra (minutos) desde find(1) hasta find(n)
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        import heapq
        from collections import deque
        input = sys.stdin.readline

        def find(x):
            while padre[x] != x:
                padre[x] = padre[padre[x]]
                x = padre[x]
            return x

        n, m, k = map(int, input().split())
        senderos = [tuple(map(int, input().split())) for _ in range(m)]
        padre = list(range(n + 1))
        for _ in range(k):
            a, b = map(int, input().split())
            padre[find(a)] = find(b)
        zonas = sum(1 for i in range(1, n + 1) if padre[i] == i)
        adj = [[] for _ in range(n + 1)]
        for a, b, w in senderos:
            ra, rb = find(a), find(b)
            if ra != rb:
                adj[ra].append((rb, w))
                adj[rb].append((ra, w))
        s, t = find(1), find(n)

        pasos = [-1] * (n + 1)
        pasos[s] = 0
        cola = deque([s])
        while cola:
            u = cola.popleft()
            for v, _ in adj[u]:
                if pasos[v] == -1:
                    pasos[v] = pasos[u] + 1
                    cola.append(v)

        INF = float("inf")
        dist = [INF] * (n + 1)
        dist[s] = 0
        h = [(0, s)]
        while h:
            d, u = heapq.heappop(h)
            if d > dist[u]:
                continue
            for v, w in adj[u]:
                nd = d + w
                if nd < dist[v]:
                    dist[v] = nd
                    heapq.heappush(h, (nd, v))

        print(zonas)
        print(pasos[t])
        print(dist[t] if dist[t] < INF else -1)
      `,
      cpp: code`
        #include <functional>
        #include <iostream>
        #include <queue>
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
            int n, m, k;
            cin >> n >> m >> k;
            vector<int> sa(m), sb(m), sw(m);
            for (int i = 0; i < m; i++) cin >> sa[i] >> sb[i] >> sw[i];
            padre.resize(n + 1);
            for (int i = 0; i <= n; i++) padre[i] = i;
            for (int i = 0; i < k; i++) {
                int a, b;
                cin >> a >> b;
                padre[find(a)] = find(b);
            }
            int zonas = 0;
            for (int i = 1; i <= n; i++) if (find(i) == i) zonas++;
            vector<vector<pair<int, int>>> adj(n + 1);
            for (int i = 0; i < m; i++) {
                int ra = find(sa[i]), rb = find(sb[i]);
                if (ra == rb) continue;
                adj[ra].push_back({rb, sw[i]});
                adj[rb].push_back({ra, sw[i]});
            }
            int s = find(1), t = find(n);

            vector<int> pasos(n + 1, -1);
            queue<int> cola;
            pasos[s] = 0;
            cola.push(s);
            while (!cola.empty()) {
                int u = cola.front();
                cola.pop();
                for (auto [v, w] : adj[u]) {
                    if (pasos[v] == -1) {
                        pasos[v] = pasos[u] + 1;
                        cola.push(v);
                    }
                }
            }

            const long long INF = 4e18;
            vector<long long> dist(n + 1, INF);
            priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;
            dist[s] = 0;
            pq.push({0, s});
            while (!pq.empty()) {
                auto [d, u] = pq.top();
                pq.pop();
                if (d > dist[u]) continue;
                for (auto [v, w] : adj[u]) {
                    if (d + w < dist[v]) {
                        dist[v] = d + w;
                        pq.push({dist[v], v});
                    }
                }
            }

            cout << zonas << "\n" << pasos[t] << "\n" << (dist[t] == INF ? -1 : dist[t]) << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayDeque;
        import java.util.ArrayList;
        import java.util.Arrays;
        import java.util.List;
        import java.util.PriorityQueue;
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
                int k = Integer.parseInt(st.nextToken());
                int[][] senderos = new int[m][3];
                for (int i = 0; i < m; i++) {
                    st = new StringTokenizer(br.readLine());
                    for (int j = 0; j < 3; j++) senderos[i][j] = Integer.parseInt(st.nextToken());
                }
                padre = new int[n + 1];
                for (int i = 0; i <= n; i++) padre[i] = i;
                for (int i = 0; i < k; i++) {
                    st = new StringTokenizer(br.readLine());
                    int a = Integer.parseInt(st.nextToken());
                    int b = Integer.parseInt(st.nextToken());
                    padre[find(a)] = find(b);
                }
                int zonas = 0;
                for (int i = 1; i <= n; i++) if (find(i) == i) zonas++;
                List<List<int[]>> adj = new ArrayList<>();
                for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
                for (int[] e : senderos) {
                    int ra = find(e[0]), rb = find(e[1]);
                    if (ra == rb) continue;
                    adj.get(ra).add(new int[] {rb, e[2]});
                    adj.get(rb).add(new int[] {ra, e[2]});
                }
                int s = find(1), t = find(n);

                int[] pasos = new int[n + 1];
                Arrays.fill(pasos, -1);
                ArrayDeque<Integer> cola = new ArrayDeque<>();
                pasos[s] = 0;
                cola.add(s);
                while (!cola.isEmpty()) {
                    int u = cola.poll();
                    for (int[] e : adj.get(u)) {
                        if (pasos[e[0]] == -1) {
                            pasos[e[0]] = pasos[u] + 1;
                            cola.add(e[0]);
                        }
                    }
                }

                long INF = Long.MAX_VALUE;
                long[] dist = new long[n + 1];
                Arrays.fill(dist, INF);
                PriorityQueue<long[]> pq = new PriorityQueue<>((x, y) -> Long.compare(x[0], y[0]));
                dist[s] = 0;
                pq.add(new long[] {0, s});
                while (!pq.isEmpty()) {
                    long[] p = pq.poll();
                    long d = p[0];
                    int u = (int) p[1];
                    if (d > dist[u]) continue;
                    for (int[] e : adj.get(u)) {
                        long nd = d + e[1];
                        if (nd < dist[e[0]]) {
                            dist[e[0]] = nd;
                            pq.add(new long[] {nd, e[0]});
                        }
                    }
                }

                System.out.println(zonas + "\n" + pasos[t] + "\n" + (dist[t] == INF ? -1 : dist[t]));
            }
        }
      `,
    },
    hints: [
      'Los túneles son gratis: todos los refugios de una misma zona son, en la práctica, un solo lugar. Empieza por agruparlos con Union-Find.',
      'Las zonas son los refugios que terminan siendo su propio jefe. Luego cada sendero a b conecta find(a) con find(b); si son el mismo jefe, ignóralo.',
      'Sobre ese grafo de jefes, haz un BFS desde find(1) para contar senderos y un Dijkstra con cola de prioridad para los minutos. Lee ambos valores en find(N).',
    ],
  },
  outro: [
    { speaker: 'KORA', text: 'Rescate completo: zonas, senderos y minutos, sin un paso de más. Eso es dominar la montaña.' },
    { speaker: 'KORA', text: 'Toma la Insignia Cumbre. Te la ganaste eligiendo la herramienta justa para cada parte del problema.' },
    { speaker: 'KORA', text: 'Más arriba se alza la Torre Dinámica. Allí los problemas se resuelven recordando lo que ya calculaste.' },
  ],
  rewardTip: {
    title: 'Contraer y recorrer',
    text: {
      python: 'Une los túneles con Union-Find y usa find(v) como nodo. Luego BFS (deque) y Dijkstra (heapq) sobre los jefes.',
      cpp: 'Contrae con Union-Find; adj[find(a)] ↔ adj[find(b)]. BFS con queue y Dijkstra con greater<>; tiempos en long long.',
      java: 'Contrae con Union-Find; arma adj con find(a) y find(b). BFS con ArrayDeque y Dijkstra con PriorityQueue<long[]>.',
    },
  },
};
