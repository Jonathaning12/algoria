import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

type Sendero = [number, number, number];

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

// Las distancias llegan a 10¹⁴: caben exactas en un number de JS (hasta 2⁵³).
const correo = (n: number, senderos: Sendero[]): [string, string] => {
  const adj: [number, number][][] = Array.from({ length: n + 1 }, () => []);
  for (const [a, b, w] of senderos) {
    adj[a]!.push([b, w]);
    adj[b]!.push([a, w]);
  }
  const dist = new Array<number>(n + 1).fill(Infinity);
  dist[1] = 0;
  const h = new MinHeap();
  h.push([0, 1]);
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
  const texto = senderos.length ? `\n${senderos.map(([a, b, w]) => `${a} ${b} ${w}`).join('\n')}` : '';
  return [`${n} ${senderos.length}${texto}`, dist[n] === Infinity ? '-1' : `${dist[n]}`];
};

const r = rng(4747);
const barajar = <T>(a: T[]): T[] => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = r(0, i);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};
/** Árbol al azar (todo conectado) más senderos extra, con pesos entre lo y hi. */
const conectado = (n: number, m: number, lo: number, hi: number): Sendero[] => {
  const res: Sendero[] = [];
  for (let v = 2; v <= n; v++) res.push([r(1, v - 1), v, r(lo, hi)]);
  while (res.length < m) {
    const a = r(1, n);
    const b = r(1, n);
    if (a !== b) res.push([a, b, r(lo, hi)]);
  }
  return barajar(res);
};
const N = 100000;
const M = 150000;
const largo = barajar(Array.from({ length: N - 1 }, (_, i): Sendero => [i + 1, i + 2, 1000000000]));
// Muchos tramos cortos contra un atajo directo carísimo: gana el camino largo en tramos.
const trampa = barajar([...conectado(N, M - 1, 1, 10), [1, N, 1000000000] as Sendero]);
// El refugio N queda en otra mitad de la montaña: no se puede llegar.
const partida = (() => {
  const res: Sendero[] = [];
  for (let v = 2; v <= N / 2; v++) res.push([r(1, v - 1), v, r(1, 1000)]);
  for (let v = N / 2 + 2; v <= N; v++) res.push([r(N / 2 + 1, v - 1), v, r(1, 1000)]);
  while (res.length < M) {
    const a = r(1, N / 2);
    const b = r(1, N / 2);
    if (a !== b) res.push([a, b, r(1, 1000)]);
  }
  return barajar(res);
})();

export const nivel47: Level = {
  number: 47,
  id: 'n47-dijkstra',
  title: 'Dijkstra',
  topic: 'Grafos: caminos con peso',
  npc: { id: 'fausto', name: 'FAUSTO', title: 'Cartero de montaña', sprite: 'npc47', x: 9, y: 8 },
  greeting: 'Una carta que llega tarde es una carta triste. Yo siempre tomo el camino más rápido.',
  intro: [
    { speaker: 'FAUSTO', text: '¡Correo! Ah, perdón, la costumbre. Soy Fausto y reparto cartas por toda la montaña.' },
    { speaker: 'FAUSTO', text: 'Nima cuenta tramos, pero a mí no me sirve: hay senderos de cinco minutos y otros de cinco horas.' },
    { speaker: 'FAUSTO', text: 'Necesito el camino que tarda menos, no el que tiene menos tramos. Y son cien mil refugios.' },
    { speaker: 'FAUSTO', text: 'Para eso hay un algoritmo famoso: Dijkstra. ¿Te lo explico o vamos al duelo?' },
  ],
  lesson: {
    concept: 'DIJKSTRA · COLA DE PRIORIDAD',
    goals: ['Calcular caminos mínimos con pesos no negativos', 'Usar una cola de prioridad para sacar el nodo más cercano', 'Ignorar entradas viejas de la cola'],
    explanation:
      'Con pesos, BFS ya no sirve. Dijkstra guarda dist[v], la mejor distancia conocida, y siempre procesa el nodo no terminado más cercano. ' +
      'Al procesar u, intenta mejorar a cada vecino: si dist[u] + w < dist[v], actualiza dist[v] y mete (dist[v], v) a una cola de prioridad. ' +
      'Un nodo puede quedar varias veces en la cola: si sacas un par con d > dist[u], es viejo y se ignora. ' +
      'Buscar el más cercano recorriendo todo cuesta O(V²); con la cola de prioridad baja a O((V + E) log V).',
    code: {
      python: code`
        import sys
        import heapq
        input = sys.stdin.readline

        n, m = map(int, input().split())
        adj = [[] for _ in range(n + 1)]
        for _ in range(m):
            a, b, w = map(int, input().split())
            adj[a].append((b, w))
            adj[b].append((a, w))
        INF = float("inf")
        dist = [INF] * (n + 1)
        dist[1] = 0
        h = [(0, 1)]
        while h:
            d, u = heapq.heappop(h)
            if d > dist[u]:
                continue
            for v, w in adj[u]:
                if d + w < dist[v]:
                    dist[v] = d + w
                    heapq.heappush(h, (dist[v], v))
        print(*[d if d < INF else -1 for d in dist[1:]])
      `,
      cpp: code`
        #include <functional>
        #include <iostream>
        #include <queue>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, m;
            cin >> n >> m;
            vector<vector<pair<int, int>>> adj(n + 1);
            for (int i = 0; i < m; i++) {
                int a, b, w;
                cin >> a >> b >> w;
                adj[a].push_back({b, w});
                adj[b].push_back({a, w});
            }
            const long long INF = 4e18;
            vector<long long> dist(n + 1, INF);
            priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;
            dist[1] = 0;
            pq.push({0, 1});
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
            for (int i = 1; i <= n; i++) cout << (dist[i] == INF ? -1 : dist[i]) << (i == n ? "\n" : " ");
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayList;
        import java.util.Arrays;
        import java.util.List;
        import java.util.PriorityQueue;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int m = Integer.parseInt(st.nextToken());
                List<List<int[]>> adj = new ArrayList<>();
                for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
                for (int i = 0; i < m; i++) {
                    st = new StringTokenizer(br.readLine());
                    int a = Integer.parseInt(st.nextToken());
                    int b = Integer.parseInt(st.nextToken());
                    int w = Integer.parseInt(st.nextToken());
                    adj.get(a).add(new int[] {b, w});
                    adj.get(b).add(new int[] {a, w});
                }
                long INF = Long.MAX_VALUE;
                long[] dist = new long[n + 1];
                Arrays.fill(dist, INF);
                PriorityQueue<long[]> pq = new PriorityQueue<>((x, y) -> Long.compare(x[0], y[0]));
                dist[1] = 0;
                pq.add(new long[] {0, 1});
                while (!pq.isEmpty()) {
                    long[] p = pq.poll();
                    long d = p[0];
                    int u = (int) p[1];
                    if (d > dist[u]) continue;
                    for (int[] e : adj.get(u)) {
                        if (d + e[1] < dist[e[0]]) {
                            dist[e[0]] = d + e[1];
                            pq.add(new long[] {dist[e[0]], e[0]});
                        }
                    }
                }
                StringBuilder sb = new StringBuilder();
                for (int i = 1; i <= n; i++) sb.append(i > 1 ? " " : "").append(dist[i] == INF ? -1 : dist[i]);
                System.out.println(sb);
            }
        }
      `,
    },
    examples: [
      { input: '4 4\n1 2 5\n1 3 1\n3 2 1\n2 4 2', output: '0 2 1 4' },
      { input: '3 1\n1 2 7', output: '0 7 -1' },
      { input: '3 3\n1 2 1\n2 3 1\n1 3 5', output: '0 1 2' },
    ],
    tips: {
      python: 'heapq ordena tuplas por su primer elemento: guarda (distancia, nodo). Lee rápido con sys.stdin.readline: son cientos de miles de líneas.',
      cpp: 'priority_queue con greater<> saca el par más chico. Usa long long: 10⁵ tramos de 10⁹ minutos no caben en int.',
      java: 'PriorityQueue<long[]> con comparador Long.compare(x[0], y[0]). Usa long para las distancias: pueden pasar de 2·10⁹.',
    },
    quiz: {
      question: 'Se meten 5, 1 y 3 en una cola de prioridad de mínimos. ¿En qué orden salen?',
      code: {
        python: code`
          import heapq

          h = []
          for x in [5, 1, 3]:
              heapq.heappush(h, x)
          orden = []
          while h:
              orden.append(heapq.heappop(h))
          print(*orden)
        `,
        cpp: code`
          #include <functional>
          #include <iostream>
          #include <queue>
          #include <vector>
          using namespace std;

          int main() {
              priority_queue<int, vector<int>, greater<int>> pq;
              for (int x : {5, 1, 3}) pq.push(x);
              bool primero = true;
              while (!pq.empty()) {
                  cout << (primero ? "" : " ") << pq.top();
                  primero = false;
                  pq.pop();
              }
              cout << "\n";
              return 0;
          }
        `,
        java: code`
          import java.util.PriorityQueue;

          public class Main {
              public static void main(String[] args) {
                  PriorityQueue<Integer> pq = new PriorityQueue<>();
                  for (int x : new int[] {5, 1, 3}) pq.add(x);
                  StringBuilder sb = new StringBuilder();
                  while (!pq.isEmpty()) sb.append(sb.length() > 0 ? " " : "").append(pq.poll());
                  System.out.println(sb);
              }
          }
        `,
      },
      options: ['5 1 3', '1 3 5', '5 3 1'],
      answer: 1,
      explanation: 'Una cola de prioridad de mínimos siempre entrega el menor que tenga dentro, sin importar el orden en que entraron.',
      wrongHint: 'No es una cola normal (orden de llegada) ni una pila. ¿Qué elemento sale primero en un montículo de mínimos?',
    },
  },
  problem: {
    id: 'p47-correo-de-fausto',
    title: 'EL CORREO DE FAUSTO',
    statement:
      'La montaña tiene N refugios y M senderos de ida y vuelta. Recorrer el sendero entre a y b toma w minutos. ' +
      'Fausto sale del refugio 1 con una carta para el refugio N. ¿Cuántos minutos tarda, como mínimo? Si no hay forma de llegar, imprime -1. ' +
      'Ojo: con 10⁵ refugios, buscar el más cercano recorriendo todos en cada paso es demasiado lento.',
    inputSpec: 'Línea 1: N y M. Siguientes M líneas: tres enteros a, b y w, un sendero entre a y b de w minutos.',
    outputSpec: 'Un entero: el tiempo mínimo del refugio 1 al N, o -1 si no se puede llegar.',
    constraints: '2 ≤ N ≤ 10⁵ · 1 ≤ M ≤ 2·10⁵ · a ≠ b · 1 ≤ w ≤ 10⁹ · La respuesta puede pasar de 2·10⁹.',
    difficulty: 'dificil',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      correo(5, [[1, 2, 7], [1, 3, 2], [3, 2, 3], [2, 5, 1], [3, 4, 8], [4, 5, 2]]),
      correo(3, [[1, 2, 4]]),
      correo(2, [[1, 2, 5], [2, 1, 3]]),
      correo(4, [[1, 4, 100], [1, 2, 1], [2, 3, 1], [3, 4, 1]]),
      correo(N, conectado(N, M, 1, 1000000000)),
      correo(N, largo),
      correo(N, trampa),
      correo(N, partida),
    ]),
    starter: {
      python: code`
        import sys
        import heapq
        input = sys.stdin.readline

        n, m = map(int, input().split())
        adj = [[] for _ in range(n + 1)]
        for _ in range(m):
            a, b, w = map(int, input().split())
            adj[a].append((b, w))
            adj[b].append((a, w))
        INF = float("inf")
        dist = [INF] * (n + 1)
        dist[1] = 0
        h = [(0, 1)]
        # TODO: Dijkstra: saca el par (d, u) más chico; si d > dist[u], ignóralo; si no, mejora a los vecinos
        print(dist[n] if dist[n] < INF else -1)
      `,
      cpp: code`
        #include <functional>
        #include <iostream>
        #include <queue>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, m;
            cin >> n >> m;
            vector<vector<pair<int, int>>> adj(n + 1);
            for (int i = 0; i < m; i++) {
                int a, b, w;
                cin >> a >> b >> w;
                adj[a].push_back({b, w});
                adj[b].push_back({a, w});
            }
            const long long INF = 4e18;
            vector<long long> dist(n + 1, INF);
            priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;
            dist[1] = 0;
            pq.push({0, 1});
            // TODO: Dijkstra: saca el par (d, u) más chico; si d > dist[u], ignóralo; si no, mejora a los vecinos
            cout << (dist[n] == INF ? -1 : dist[n]) << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayList;
        import java.util.Arrays;
        import java.util.List;
        import java.util.PriorityQueue;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int m = Integer.parseInt(st.nextToken());
                List<List<int[]>> adj = new ArrayList<>();
                for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
                for (int i = 0; i < m; i++) {
                    st = new StringTokenizer(br.readLine());
                    int a = Integer.parseInt(st.nextToken());
                    int b = Integer.parseInt(st.nextToken());
                    int w = Integer.parseInt(st.nextToken());
                    adj.get(a).add(new int[] {b, w});
                    adj.get(b).add(new int[] {a, w});
                }
                long INF = Long.MAX_VALUE;
                long[] dist = new long[n + 1];
                Arrays.fill(dist, INF);
                PriorityQueue<long[]> pq = new PriorityQueue<>((x, y) -> Long.compare(x[0], y[0]));
                dist[1] = 0;
                pq.add(new long[] {0, 1});
                // TODO: Dijkstra: saca el par (d, u) más chico; si d > dist[u], ignóralo; si no, mejora a los vecinos
                System.out.println(dist[n] == INF ? -1 : dist[n]);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        import heapq
        input = sys.stdin.readline

        n, m = map(int, input().split())
        adj = [[] for _ in range(n + 1)]
        for _ in range(m):
            a, b, w = map(int, input().split())
            adj[a].append((b, w))
            adj[b].append((a, w))
        INF = float("inf")
        dist = [INF] * (n + 1)
        dist[1] = 0
        h = [(0, 1)]
        while h:
            d, u = heapq.heappop(h)
            if d > dist[u]:
                continue
            if u == n:
                break
            for v, w in adj[u]:
                nd = d + w
                if nd < dist[v]:
                    dist[v] = nd
                    heapq.heappush(h, (nd, v))
        print(dist[n] if dist[n] < INF else -1)
      `,
      cpp: code`
        #include <functional>
        #include <iostream>
        #include <queue>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, m;
            cin >> n >> m;
            vector<vector<pair<int, int>>> adj(n + 1);
            for (int i = 0; i < m; i++) {
                int a, b, w;
                cin >> a >> b >> w;
                adj[a].push_back({b, w});
                adj[b].push_back({a, w});
            }
            const long long INF = 4e18;
            vector<long long> dist(n + 1, INF);
            priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;
            dist[1] = 0;
            pq.push({0, 1});
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
            cout << (dist[n] == INF ? -1 : dist[n]) << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayList;
        import java.util.Arrays;
        import java.util.List;
        import java.util.PriorityQueue;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int m = Integer.parseInt(st.nextToken());
                List<List<int[]>> adj = new ArrayList<>();
                for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
                for (int i = 0; i < m; i++) {
                    st = new StringTokenizer(br.readLine());
                    int a = Integer.parseInt(st.nextToken());
                    int b = Integer.parseInt(st.nextToken());
                    int w = Integer.parseInt(st.nextToken());
                    adj.get(a).add(new int[] {b, w});
                    adj.get(b).add(new int[] {a, w});
                }
                long INF = Long.MAX_VALUE;
                long[] dist = new long[n + 1];
                Arrays.fill(dist, INF);
                PriorityQueue<long[]> pq = new PriorityQueue<>((x, y) -> Long.compare(x[0], y[0]));
                dist[1] = 0;
                pq.add(new long[] {0, 1});
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
                System.out.println(dist[n] == INF ? -1 : dist[n]);
            }
        }
      `,
    },
    hints: [
      'BFS cuenta tramos, pero aquí importan los minutos. Siempre conviene avanzar desde el refugio no terminado que esté más cerca del 1.',
      'Buscar ese refugio recorriendo los N en cada paso son N² operaciones: 10¹⁰. Una cola de prioridad te lo da en O(log N).',
      'dist[1] = 0 y mete (0, 1). Mientras haya pares: saca (d, u); si d > dist[u], sigue. Para cada (v, w) vecino, si d + w < dist[v], actualiza dist[v] y mete (dist[v], v). Usa enteros de 64 bits.',
    ],
  },
  outro: [
    { speaker: 'FAUSTO', text: '¡Entregada antes de tiempo! Cien mil refugios y ni una carta tarde.' },
    { speaker: 'FAUSTO', text: 'El secreto es la cola de prioridad: siempre el más cercano primero, y los pares viejos a la basura.' },
    { speaker: 'FAUSTO', text: 'Olga, la de las cuerdas, está por aquí cerca. Le preguntan mil veces al día si dos refugios están unidos.' },
  ],
  rewardTip: {
    title: 'Dijkstra',
    text: {
      python: 'heapq con (dist, nodo). Al sacar: if d > dist[u]: continue. Al mejorar: heappush. O((V + E) log V).',
      cpp: 'priority_queue<pair<long long,int>, vector<...>, greater<>>. Salta los pares viejos (d > dist[u]). Usa long long.',
      java: 'PriorityQueue<long[]> ordenada por x[0]. Salta los pares viejos (d > dist[u]). Distancias en long.',
    },
  },
};
