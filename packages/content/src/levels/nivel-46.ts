import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

type Regla = [number, number];

/** Montículo de mínimos sencillo para generar las salidas esperadas. */
class MinHeap {
  private a: number[] = [];
  get size() {
    return this.a.length;
  }
  push(x: number) {
    const a = this.a;
    a.push(x);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p]! <= a[i]!) break;
      [a[p], a[i]] = [a[i]!, a[p]!];
      i = p;
    }
  }
  pop(): number {
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
        if (l < a.length && a[l]! < a[m]!) m = l;
        if (r < a.length && a[r]! < a[m]!) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i]!, a[m]!];
        i = m;
      }
    }
    return top;
  }
}

const campamento = (n: number, reglas: Regla[]): [string, string] => {
  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  const indeg = new Array<number>(n + 1).fill(0);
  for (const [a, b] of reglas) {
    adj[a]!.push(b);
    indeg[b]!++;
  }
  const h = new MinHeap();
  for (let i = 1; i <= n; i++) if (indeg[i] === 0) h.push(i);
  const orden: number[] = [];
  while (h.size) {
    const u = h.pop();
    orden.push(u);
    for (const v of adj[u]!) if (--indeg[v]! === 0) h.push(v);
  }
  const texto = reglas.length ? `\n${reglas.map(([a, b]) => `${a} ${b}`).join('\n')}` : '';
  return [`${n} ${reglas.length}${texto}`, orden.length === n ? orden.join(' ') : 'IMPOSIBLE'];
};

const r = rng(4646);
const barajar = <T>(a: T[]): T[] => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = r(0, i);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};
/** Reglas al azar que respetan un orden secreto: nunca hay ciclos. */
const dag = (n: number, m: number, cadena: boolean): { p: number[]; reglas: Regla[] } => {
  const p = barajar(Array.from({ length: n }, (_, i) => i + 1));
  const reglas: Regla[] = cadena ? p.slice(1).map((v, i): Regla => [p[i]!, v]) : [];
  while (reglas.length < m) {
    const i = r(0, n - 1);
    const j = r(0, n - 1);
    if (i < j) reglas.push([p[i]!, p[j]!]);
  }
  return { p, reglas: barajar(reglas) };
};
const N = 10000;
const alReves = barajar(Array.from({ length: N - 1 }, (_, i): Regla => [i + 2, i + 1]));
const libre = dag(N, 60000, false).reglas;
const conCiclo = (() => {
  const { p, reglas } = dag(N, 60000, true);
  // La última tarea del orden secreto exige a la primera: se cierra un ciclo enorme.
  reglas.push([p[N - 1]!, p[0]!]);
  return reglas;
})();

export const nivel46: Level = {
  number: 46,
  id: 'n46-orden-topologico',
  title: 'Orden topológico',
  topic: 'Grafos: dependencias',
  npc: { id: 'herminia', name: 'HERMINIA', title: 'Jefa de expedición', sprite: 'npc46', x: 4, y: 8 },
  greeting: 'Primero las estacas, luego la carpa. Si lo haces al revés, se te vuela todo.',
  intro: [
    { speaker: 'HERMINIA', text: 'Buen día. Soy Herminia y dirijo las expediciones a la cumbre.' },
    { speaker: 'HERMINIA', text: 'Montar el campamento tiene miles de tareas, y muchas dependen de otras: no se enciende el fuego sin juntar leña.' },
    { speaker: 'HERMINIA', text: 'Necesito un orden que respete todas las reglas. Y si dos tareas están listas a la vez, primero la de menor número.' },
    { speaker: 'HERMINIA', text: '¿Repasamos cómo ordenar dependencias o vas directo al duelo?' },
  ],
  lesson: {
    concept: 'ORDEN TOPOLÓGICO · KAHN',
    goals: ['Modelar dependencias con aristas dirigidas a → b', 'Contar el grado de entrada de cada nodo', 'Sacar primero lo que ya no depende de nada'],
    explanation:
      'Si la tarea a debe ir antes que b, dibuja una flecha a → b. El grado de entrada de b es cuántas tareas la bloquean. ' +
      'El algoritmo de Kahn mete en una cola todas las tareas con grado 0, saca una, la anota y le resta 1 a cada tarea que bloqueaba; ' +
      'las que llegan a 0 entran a la cola. Si al final anotaste menos de N tareas, hay un ciclo y no existe orden. ' +
      'Si cambias la cola por una cola de prioridad, siempre sale la menor tarea disponible.',
    code: {
      python: code`
        import sys
        from collections import deque
        input = sys.stdin.readline

        n, m = map(int, input().split())
        adj = [[] for _ in range(n + 1)]
        indeg = [0] * (n + 1)
        for _ in range(m):
            a, b = map(int, input().split())
            adj[a].append(b)
            indeg[b] += 1
        cola = deque(i for i in range(1, n + 1) if indeg[i] == 0)
        orden = []
        while cola:
            u = cola.popleft()
            orden.append(u)
            for v in adj[u]:
                indeg[v] -= 1
                if indeg[v] == 0:
                    cola.append(v)
        print(*orden)
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
            vector<vector<int>> adj(n + 1);
            vector<int> indeg(n + 1, 0);
            for (int i = 0; i < m; i++) {
                int a, b;
                cin >> a >> b;
                adj[a].push_back(b);
                indeg[b]++;
            }
            queue<int> cola;
            for (int i = 1; i <= n; i++) if (indeg[i] == 0) cola.push(i);
            bool primero = true;
            while (!cola.empty()) {
                int u = cola.front();
                cola.pop();
                cout << (primero ? "" : " ") << u;
                primero = false;
                for (int v : adj[u]) {
                    if (--indeg[v] == 0) cola.push(v);
                }
            }
            cout << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayDeque;
        import java.util.ArrayList;
        import java.util.List;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int m = Integer.parseInt(st.nextToken());
                List<List<Integer>> adj = new ArrayList<>();
                for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
                int[] indeg = new int[n + 1];
                for (int i = 0; i < m; i++) {
                    st = new StringTokenizer(br.readLine());
                    int a = Integer.parseInt(st.nextToken());
                    int b = Integer.parseInt(st.nextToken());
                    adj.get(a).add(b);
                    indeg[b]++;
                }
                ArrayDeque<Integer> cola = new ArrayDeque<>();
                for (int i = 1; i <= n; i++) if (indeg[i] == 0) cola.add(i);
                StringBuilder sb = new StringBuilder();
                while (!cola.isEmpty()) {
                    int u = cola.poll();
                    sb.append(sb.length() > 0 ? " " : "").append(u);
                    for (int v : adj.get(u)) {
                        if (--indeg[v] == 0) cola.add(v);
                    }
                }
                System.out.println(sb);
            }
        }
      `,
    },
    examples: [
      { input: '3 2\n1 3\n2 3', output: '1 2 3' },
      { input: '4 3\n4 3\n3 2\n2 1', output: '4 3 2 1' },
      { input: '4 2\n3 1\n4 2', output: '3 4 1 2' },
    ],
    tips: {
      python: 'Para sacar siempre la menor tarea disponible usa heapq: heappush(h, v) y heappop(h). Es una cola de prioridad de mínimos.',
      cpp: 'priority_queue<int> saca el MAYOR. Para el menor: priority_queue<int, vector<int>, greater<int>>.',
      java: 'PriorityQueue<Integer> saca el menor primero: offer() para meter y poll() para sacar.',
    },
    quiz: {
      question: '¿Cuántas tareas pueden empezar de inmediato (grado de entrada 0)?',
      code: {
        python: code`
          n = 5
          reglas = [(1, 2), (1, 3), (3, 2), (4, 2)]
          indeg = [0] * (n + 1)
          for a, b in reglas:
              indeg[b] += 1
          libres = 0
          for i in range(1, n + 1):
              if indeg[i] == 0:
                  libres += 1
          print(libres)
        `,
        cpp: code`
          #include <iostream>
          #include <vector>
          using namespace std;

          int main() {
              int n = 5;
              int reglas[4][2] = {{1, 2}, {1, 3}, {3, 2}, {4, 2}};
              vector<int> indeg(n + 1, 0);
              for (auto& r : reglas) indeg[r[1]]++;
              int libres = 0;
              for (int i = 1; i <= n; i++) {
                  if (indeg[i] == 0) libres++;
              }
              cout << libres << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  int n = 5;
                  int[][] reglas = {{1, 2}, {1, 3}, {3, 2}, {4, 2}};
                  int[] indeg = new int[n + 1];
                  for (int[] r : reglas) indeg[r[1]]++;
                  int libres = 0;
                  for (int i = 1; i <= n; i++) {
                      if (indeg[i] == 0) libres++;
                  }
                  System.out.println(libres);
              }
          }
        `,
      },
      options: ['1', '2', '3'],
      answer: 2,
      explanation: 'Solo el 2 y el 3 reciben flechas. El 1, el 4 y el 5 no dependen de nada: pueden empezar ya.',
      wrongHint: 'No olvides a la tarea 5: no aparece en ninguna regla.',
    },
  },
  problem: {
    id: 'p46-campamento-de-herminia',
    title: 'EL CAMPAMENTO DE HERMINIA',
    statement:
      'Herminia tiene N tareas numeradas del 1 al N y M reglas. La regla "a b" dice que la tarea a debe hacerse antes que la b. ' +
      'Encuentra un orden para hacer todas las tareas que respete todas las reglas. Si en algún momento hay varias tareas disponibles, ' +
      'elige siempre la de menor número. Si las reglas forman un ciclo y no hay orden posible, imprime IMPOSIBLE.',
    inputSpec: 'Línea 1: N y M. Siguientes M líneas: dos enteros a y b (a antes que b).',
    outputSpec: 'Una línea con las N tareas en orden, separadas por espacios, o IMPOSIBLE.',
    constraints: '1 ≤ N ≤ 10⁴ · 0 ≤ M ≤ 10⁵ · a ≠ b · Puede haber reglas repetidas.',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      campamento(4, [[3, 1], [4, 2]]),
      campamento(3, [[1, 2], [2, 3], [3, 1]]),
      campamento(5, []),
      campamento(6, [[6, 1], [5, 1], [4, 2], [3, 2]]),
      campamento(4, [[2, 1], [2, 1], [3, 4]]),
      campamento(N, alReves),
      campamento(N, libre),
      campamento(N, conCiclo),
      campamento(2000, dag(2000, 30000, true).reglas),
    ]),
    starter: {
      python: code`
        import sys
        import heapq
        input = sys.stdin.readline

        n, m = map(int, input().split())
        adj = [[] for _ in range(n + 1)]
        indeg = [0] * (n + 1)
        for _ in range(m):
            a, b = map(int, input().split())
            adj[a].append(b)
            indeg[b] += 1
        h = [i for i in range(1, n + 1) if indeg[i] == 0]
        heapq.heapify(h)
        orden = []
        # TODO: saca la menor tarea con heappop, anótala y libera a las que bloqueaba
        if len(orden) == n:
            print(*orden)
        else:
            print("IMPOSIBLE")
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
            vector<vector<int>> adj(n + 1);
            vector<int> indeg(n + 1, 0);
            for (int i = 0; i < m; i++) {
                int a, b;
                cin >> a >> b;
                adj[a].push_back(b);
                indeg[b]++;
            }
            priority_queue<int, vector<int>, greater<int>> pq;
            for (int i = 1; i <= n; i++) if (indeg[i] == 0) pq.push(i);
            vector<int> orden;
            // TODO: saca la menor tarea, anótala y libera a las que bloqueaba
            if ((int)orden.size() == n) {
                for (int i = 0; i < n; i++) cout << orden[i] << (i + 1 == n ? "\n" : " ");
            } else {
                cout << "IMPOSIBLE\n";
            }
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayList;
        import java.util.List;
        import java.util.PriorityQueue;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int m = Integer.parseInt(st.nextToken());
                List<List<Integer>> adj = new ArrayList<>();
                for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
                int[] indeg = new int[n + 1];
                for (int i = 0; i < m; i++) {
                    st = new StringTokenizer(br.readLine());
                    int a = Integer.parseInt(st.nextToken());
                    int b = Integer.parseInt(st.nextToken());
                    adj.get(a).add(b);
                    indeg[b]++;
                }
                PriorityQueue<Integer> pq = new PriorityQueue<>();
                for (int i = 1; i <= n; i++) if (indeg[i] == 0) pq.offer(i);
                StringBuilder sb = new StringBuilder();
                int anotadas = 0;
                // TODO: saca la menor tarea, anótala y libera a las que bloqueaba
                System.out.println(anotadas == n ? sb.toString() : "IMPOSIBLE");
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
        indeg = [0] * (n + 1)
        for _ in range(m):
            a, b = map(int, input().split())
            adj[a].append(b)
            indeg[b] += 1
        h = [i for i in range(1, n + 1) if indeg[i] == 0]
        heapq.heapify(h)
        orden = []
        while h:
            u = heapq.heappop(h)
            orden.append(u)
            for v in adj[u]:
                indeg[v] -= 1
                if indeg[v] == 0:
                    heapq.heappush(h, v)
        if len(orden) == n:
            print(*orden)
        else:
            print("IMPOSIBLE")
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
            vector<vector<int>> adj(n + 1);
            vector<int> indeg(n + 1, 0);
            for (int i = 0; i < m; i++) {
                int a, b;
                cin >> a >> b;
                adj[a].push_back(b);
                indeg[b]++;
            }
            priority_queue<int, vector<int>, greater<int>> pq;
            for (int i = 1; i <= n; i++) if (indeg[i] == 0) pq.push(i);
            vector<int> orden;
            while (!pq.empty()) {
                int u = pq.top();
                pq.pop();
                orden.push_back(u);
                for (int v : adj[u]) {
                    if (--indeg[v] == 0) pq.push(v);
                }
            }
            if ((int)orden.size() == n) {
                for (int i = 0; i < n; i++) cout << orden[i] << (i + 1 == n ? "\n" : " ");
            } else {
                cout << "IMPOSIBLE\n";
            }
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayList;
        import java.util.List;
        import java.util.PriorityQueue;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int m = Integer.parseInt(st.nextToken());
                List<List<Integer>> adj = new ArrayList<>();
                for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
                int[] indeg = new int[n + 1];
                for (int i = 0; i < m; i++) {
                    st = new StringTokenizer(br.readLine());
                    int a = Integer.parseInt(st.nextToken());
                    int b = Integer.parseInt(st.nextToken());
                    adj.get(a).add(b);
                    indeg[b]++;
                }
                PriorityQueue<Integer> pq = new PriorityQueue<>();
                for (int i = 1; i <= n; i++) if (indeg[i] == 0) pq.offer(i);
                StringBuilder sb = new StringBuilder();
                int anotadas = 0;
                while (!pq.isEmpty()) {
                    int u = pq.poll();
                    sb.append(anotadas > 0 ? " " : "").append(u);
                    anotadas++;
                    for (int v : adj.get(u)) {
                        if (--indeg[v] == 0) pq.offer(v);
                    }
                }
                System.out.println(anotadas == n ? sb.toString() : "IMPOSIBLE");
            }
        }
      `,
    },
    hints: [
      'Una tarea se puede hacer cuando ya no la bloquea ninguna otra. Cuenta cuántas reglas apuntan a cada tarea: su grado de entrada.',
      'Es el algoritmo de Kahn, pero con una cola de prioridad en vez de una cola normal: así siempre sale la menor tarea disponible.',
      'Mete todas las tareas con grado 0 al montículo. Mientras no esté vacío: saca la menor u, anótala y resta 1 al grado de cada v en adj[u]; si llega a 0, métela. Si anotaste menos de N, imprime IMPOSIBLE.',
    ],
  },
  outro: [
    { speaker: 'HERMINIA', text: 'Diez mil tareas y ni una fuera de lugar. Este campamento no se lo lleva ni el viento.' },
    { speaker: 'HERMINIA', text: 'Y si las reglas se muerden la cola, ahora sé detectarlo: alguna tarea nunca llega a grado cero.' },
    { speaker: 'HERMINIA', text: 'Fausto, el cartero, está al otro lado del lago. Sus senderos tienen distinto largo, y eso cambia todo.' },
  ],
  rewardTip: {
    title: 'Orden topológico (Kahn)',
    text: {
      python: 'indeg[b] += 1 por cada a → b. heapq con las de grado 0; al sacar u, resta a sus vecinos. len(orden) < n: ciclo.',
      cpp: 'indeg + priority_queue<int, vector<int>, greater<int>>. Si anotas menos de n tareas, hay un ciclo.',
      java: 'indeg + PriorityQueue<Integer> (saca el menor). Si anotas menos de n tareas, hay un ciclo.',
    },
  },
};
