import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

type Arista = [number, number];

const equipos = (n: number, aristas: Arista[]): [string, string] => {
  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  for (const [a, b] of aristas) {
    adj[a]!.push(b);
    adj[b]!.push(a);
  }
  const color = new Array<number>(n + 1).fill(-1);
  let a = 0;
  let ok = true;
  for (let s = 1; s <= n && ok; s++) {
    if (color[s] !== -1) continue;
    color[s] = 0;
    const cola = [s];
    for (let i = 0; i < cola.length && ok; i++) {
      const u = cola[i]!;
      if (color[u] === 0) a++;
      for (const v of adj[u]!) {
        if (color[v] === -1) {
          color[v] = 1 - color[u]!;
          cola.push(v);
        } else if (color[v] === color[u]) ok = false;
      }
    }
  }
  const texto = aristas.length ? `\n${aristas.map(([x, y]) => `${x} ${y}`).join('\n')}` : '';
  return [`${n} ${aristas.length}${texto}`, ok ? `SI\n${a}` : 'NO'];
};

const r = rng(4545);
const barajar = <T>(a: T[]): T[] => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = r(0, i);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};
const N = 100000;
const arbol = barajar(Array.from({ length: N - 1 }, (_, i): Arista => [r(1, i + 1), i + 2]));
/** Ciclo de largo n con los nodos mezclados (par: se puede; impar: no). */
const ciclo = (n: number): Arista[] => {
  const p = barajar(Array.from({ length: n }, (_, i) => i + 1));
  return barajar(p.map((v, i): Arista => [v, p[(i + 1) % n]!]));
};
// Bipartito escondido: cada nodo tiene un equipo secreto y todas las rivalidades cruzan de equipo.
const lado = Array.from({ length: N + 1 }, () => r(0, 1));
const cruzadas: Arista[] = [];
while (cruzadas.length < 120000) {
  const a = r(1, N);
  const b = r(1, N);
  if (lado[a] !== lado[b]) cruzadas.push([a, b]);
}
// La misma rivalidad gigante, pero al final se cuela una dentro del mismo equipo.
const traidora: Arista[] = [...cruzadas.slice(0, 119999)];
for (let a = 2; ; a++) {
  if (lado[a] === lado[1]) {
    traidora.push([1, a]);
    break;
  }
}
const parejas = barajar(Array.from({ length: N / 2 }, (_, i): Arista => (r(0, 1) ? [2 * i + 1, 2 * i + 2] : [2 * i + 2, 2 * i + 1])));

export const nivel45: Level = {
  number: 45,
  id: 'n45-grafo-bipartito',
  title: 'Grafo bipartito',
  topic: 'Grafos: dos colores',
  npc: { id: 'bombo', name: 'BOMBO', title: 'Yeti amable', sprite: 'npc45', x: 4, y: 4 },
  greeting: '¡Grrr! Tranquilo, es mi forma de decir hola. ¿Juegas a las bolas de nieve?',
  intro: [
    { speaker: 'BOMBO', text: '¡Hola, hola! Soy Bombo. Sí, un yeti. No, no muerdo. Solo lanzo bolas de nieve.' },
    { speaker: 'BOMBO', text: 'Hoy hay guerra de nieve y tengo una lista de rivales: parejas que quieren estar en equipos distintos.' },
    { speaker: 'BOMBO', text: 'Necesito armar dos equipos que respeten a todos los rivales. A veces se puede... y a veces no.' },
    { speaker: 'BOMBO', text: '¿Te explico cómo pintar un grafo con dos colores o vamos directo al duelo?' },
  ],
  lesson: {
    concept: 'GRAFO BIPARTITO · DOS COLORES',
    goals: ['Pintar un grafo con dos colores alternados', 'Detectar un conflicto: dos vecinos del mismo color', 'Reconocer que un ciclo impar no se puede pintar'],
    explanation:
      'Un grafo es bipartito si puedes pintar sus nodos con dos colores de modo que cada arista una colores distintos. ' +
      'Para comprobarlo, haz un BFS: pinta el origen con 0 y a cada vecino nuevo con 1 - color[u]. ' +
      'Si encuentras un vecino ya pintado con tu mismo color, hay conflicto y el grafo no es bipartito. ' +
      'Repite desde cada nodo sin pintar para cubrir todas las componentes. Un ciclo de largo impar siempre da conflicto.',
    code: {
      python: code`
        import sys
        from collections import deque
        input = sys.stdin.readline

        n, m = map(int, input().split())
        adj = [[] for _ in range(n + 1)]
        for _ in range(m):
            a, b = map(int, input().split())
            adj[a].append(b)
            adj[b].append(a)
        color = [-1] * (n + 1)
        ok = True
        for s in range(1, n + 1):
            if color[s] != -1:
                continue
            color[s] = 0
            cola = deque([s])
            while cola:
                u = cola.popleft()
                for v in adj[u]:
                    if color[v] == -1:
                        color[v] = 1 - color[u]
                        cola.append(v)
                    elif color[v] == color[u]:
                        ok = False
        print("SI" if ok else "NO")
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
            for (int i = 0; i < m; i++) {
                int a, b;
                cin >> a >> b;
                adj[a].push_back(b);
                adj[b].push_back(a);
            }
            vector<int> color(n + 1, -1);
            bool ok = true;
            for (int s = 1; s <= n; s++) {
                if (color[s] != -1) continue;
                color[s] = 0;
                queue<int> cola;
                cola.push(s);
                while (!cola.empty()) {
                    int u = cola.front();
                    cola.pop();
                    for (int v : adj[u]) {
                        if (color[v] == -1) {
                            color[v] = 1 - color[u];
                            cola.push(v);
                        } else if (color[v] == color[u]) {
                            ok = false;
                        }
                    }
                }
            }
            cout << (ok ? "SI" : "NO") << "\n";
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
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int m = Integer.parseInt(st.nextToken());
                List<List<Integer>> adj = new ArrayList<>();
                for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
                for (int i = 0; i < m; i++) {
                    st = new StringTokenizer(br.readLine());
                    int a = Integer.parseInt(st.nextToken());
                    int b = Integer.parseInt(st.nextToken());
                    adj.get(a).add(b);
                    adj.get(b).add(a);
                }
                int[] color = new int[n + 1];
                Arrays.fill(color, -1);
                boolean ok = true;
                for (int s = 1; s <= n; s++) {
                    if (color[s] != -1) continue;
                    color[s] = 0;
                    ArrayDeque<Integer> cola = new ArrayDeque<>();
                    cola.add(s);
                    while (!cola.isEmpty()) {
                        int u = cola.poll();
                        for (int v : adj.get(u)) {
                            if (color[v] == -1) {
                                color[v] = 1 - color[u];
                                cola.add(v);
                            } else if (color[v] == color[u]) {
                                ok = false;
                            }
                        }
                    }
                }
                System.out.println(ok ? "SI" : "NO");
            }
        }
      `,
    },
    examples: [
      { input: '3 2\n1 2\n2 3', output: 'SI' },
      { input: '3 3\n1 2\n2 3\n3 1', output: 'NO' },
      { input: '4 4\n1 2\n2 3\n3 4\n4 1', output: 'SI' },
    ],
    tips: {
      python: 'color = [-1] * (n + 1): -1 es "sin pintar". El truco 1 - color[u] cambia 0 por 1 y 1 por 0.',
      cpp: 'vector<int> color(n + 1, -1) y 1 - color[u] para alternar. No olvides lanzar el BFS desde cada nodo sin pintar.',
      java: 'Arrays.fill(color, -1) y 1 - color[u] para alternar. Un grafo puede tener varias componentes: recórrelas todas.',
    },
    quiz: {
      question: 'Este programa intenta pintar un ciclo de 5 nodos con dos colores. ¿Qué imprime?',
      code: {
        python: code`
          n = 5
          color = [-1] * n
          color[0] = 0
          ok = True
          for i in range(n):
              j = (i + 1) % n
              if color[j] == -1:
                  color[j] = 1 - color[i]
              elif color[j] == color[i]:
                  ok = False
          print("SI" if ok else "NO")
        `,
        cpp: code`
          #include <iostream>
          #include <vector>
          using namespace std;

          int main() {
              int n = 5;
              vector<int> color(n, -1);
              color[0] = 0;
              bool ok = true;
              for (int i = 0; i < n; i++) {
                  int j = (i + 1) % n;
                  if (color[j] == -1) color[j] = 1 - color[i];
                  else if (color[j] == color[i]) ok = false;
              }
              cout << (ok ? "SI" : "NO") << "\n";
              return 0;
          }
        `,
        java: code`
          import java.util.Arrays;

          public class Main {
              public static void main(String[] args) {
                  int n = 5;
                  int[] color = new int[n];
                  Arrays.fill(color, -1);
                  color[0] = 0;
                  boolean ok = true;
                  for (int i = 0; i < n; i++) {
                      int j = (i + 1) % n;
                      if (color[j] == -1) color[j] = 1 - color[i];
                      else if (color[j] == color[i]) ok = false;
                  }
                  System.out.println(ok ? "SI" : "NO");
              }
          }
        `,
      },
      options: ['SI', 'NO', 'Depende del nodo inicial'],
      answer: 1,
      explanation: 'Los colores quedan 0 1 0 1 0, y el último nodo vuelve a tocar al primero: dos 0 juntos. Un ciclo impar nunca es bipartito.',
      wrongHint: 'Pinta tú los cinco nodos alternando 0 y 1, y mira qué pasa al cerrar el ciclo.',
    },
  },
  problem: {
    id: 'p45-guerra-de-nieve',
    title: 'LA GUERRA DE NIEVE',
    statement:
      'Hay N jugadores y M parejas de rivales. Bombo quiere repartirlos en dos equipos, A y B, de modo que cada pareja de rivales quede en equipos distintos. ' +
      'Si no se puede, imprime NO. Si se puede, imprime SI y el tamaño del equipo A, armado así: ' +
      'recorre los jugadores del 1 al N; cada jugador que aún no tenga equipo va al A, y a partir de él se reparte todo su grupo de rivales alternando equipos.',
    inputSpec: 'Línea 1: N y M. Siguientes M líneas: dos enteros a y b, rivales entre sí.',
    outputSpec: 'NO si no se puede. Si se puede, dos líneas: SI y el tamaño del equipo A.',
    constraints: '1 ≤ N ≤ 10⁵ · 0 ≤ M ≤ 2·10⁵ · a ≠ b',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      equipos(5, [[1, 2], [2, 3], [3, 4], [1, 5]]),
      equipos(3, [[1, 2], [2, 3], [3, 1]]),
      equipos(4, []),
      equipos(6, [[4, 5], [5, 6], [1, 6], [2, 3]]),
      equipos(N, arbol),
      equipos(N, barajar([...cruzadas])),
      equipos(N, traidora),
      equipos(99999, ciclo(99999)),
      equipos(N, ciclo(N)),
      equipos(N, parejas),
    ]),
    starter: {
      python: code`
        import sys
        from collections import deque
        input = sys.stdin.readline

        n, m = map(int, input().split())
        adj = [[] for _ in range(n + 1)]
        for _ in range(m):
            a, b = map(int, input().split())
            adj[a].append(b)
            adj[b].append(a)
        color = [-1] * (n + 1)
        ok = True
        equipo_a = 0
        # TODO: para cada jugador sin color, píntalo con 0 (equipo A) y haz BFS alternando colores
        if ok:
            print("SI")
            print(equipo_a)
        else:
            print("NO")
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
            for (int i = 0; i < m; i++) {
                int a, b;
                cin >> a >> b;
                adj[a].push_back(b);
                adj[b].push_back(a);
            }
            vector<int> color(n + 1, -1);
            bool ok = true;
            int equipoA = 0;
            // TODO: para cada jugador sin color, píntalo con 0 (equipo A) y haz BFS alternando colores
            if (ok) cout << "SI\n" << equipoA << "\n";
            else cout << "NO\n";
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
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int m = Integer.parseInt(st.nextToken());
                List<List<Integer>> adj = new ArrayList<>();
                for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
                for (int i = 0; i < m; i++) {
                    st = new StringTokenizer(br.readLine());
                    int a = Integer.parseInt(st.nextToken());
                    int b = Integer.parseInt(st.nextToken());
                    adj.get(a).add(b);
                    adj.get(b).add(a);
                }
                int[] color = new int[n + 1];
                Arrays.fill(color, -1);
                boolean ok = true;
                int equipoA = 0;
                // TODO: para cada jugador sin color, píntalo con 0 (equipo A) y haz BFS alternando colores
                if (ok) System.out.println("SI\n" + equipoA);
                else System.out.println("NO");
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        from collections import deque
        input = sys.stdin.readline

        n, m = map(int, input().split())
        adj = [[] for _ in range(n + 1)]
        for _ in range(m):
            a, b = map(int, input().split())
            adj[a].append(b)
            adj[b].append(a)
        color = [-1] * (n + 1)
        ok = True
        equipo_a = 0
        for s in range(1, n + 1):
            if color[s] != -1 or not ok:
                continue
            color[s] = 0
            cola = deque([s])
            while cola and ok:
                u = cola.popleft()
                if color[u] == 0:
                    equipo_a += 1
                for v in adj[u]:
                    if color[v] == -1:
                        color[v] = 1 - color[u]
                        cola.append(v)
                    elif color[v] == color[u]:
                        ok = False
                        break
        if ok:
            print("SI")
            print(equipo_a)
        else:
            print("NO")
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
            for (int i = 0; i < m; i++) {
                int a, b;
                cin >> a >> b;
                adj[a].push_back(b);
                adj[b].push_back(a);
            }
            vector<int> color(n + 1, -1);
            bool ok = true;
            int equipoA = 0;
            for (int s = 1; s <= n && ok; s++) {
                if (color[s] != -1) continue;
                color[s] = 0;
                queue<int> cola;
                cola.push(s);
                while (!cola.empty() && ok) {
                    int u = cola.front();
                    cola.pop();
                    if (color[u] == 0) equipoA++;
                    for (int v : adj[u]) {
                        if (color[v] == -1) {
                            color[v] = 1 - color[u];
                            cola.push(v);
                        } else if (color[v] == color[u]) {
                            ok = false;
                        }
                    }
                }
            }
            if (ok) cout << "SI\n" << equipoA << "\n";
            else cout << "NO\n";
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
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int m = Integer.parseInt(st.nextToken());
                List<List<Integer>> adj = new ArrayList<>();
                for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
                for (int i = 0; i < m; i++) {
                    st = new StringTokenizer(br.readLine());
                    int a = Integer.parseInt(st.nextToken());
                    int b = Integer.parseInt(st.nextToken());
                    adj.get(a).add(b);
                    adj.get(b).add(a);
                }
                int[] color = new int[n + 1];
                Arrays.fill(color, -1);
                boolean ok = true;
                int equipoA = 0;
                ArrayDeque<Integer> cola = new ArrayDeque<>();
                for (int s = 1; s <= n && ok; s++) {
                    if (color[s] != -1) continue;
                    color[s] = 0;
                    cola.clear();
                    cola.add(s);
                    while (!cola.isEmpty() && ok) {
                        int u = cola.poll();
                        if (color[u] == 0) equipoA++;
                        for (int v : adj.get(u)) {
                            if (color[v] == -1) {
                                color[v] = 1 - color[u];
                                cola.add(v);
                            } else if (color[v] == color[u]) {
                                ok = false;
                            }
                        }
                    }
                }
                if (ok) System.out.println("SI\n" + equipoA);
                else System.out.println("NO");
            }
        }
      `,
    },
    hints: [
      'Piensa en colores: equipo A = 0 y equipo B = 1. Cada rivalidad es una arista que debe unir colores distintos.',
      'Recorre los jugadores del 1 al N. Si uno no tiene color, píntalo con 0 y lanza un BFS que pinte a cada vecino nuevo con 1 - color[u].',
      'Si al revisar un vecino ya pintado tiene tu mismo color, la respuesta es NO. Si terminas sin conflictos, cuenta cuántos quedaron con color 0 e imprime SI y ese número.',
    ],
  },
  outro: [
    { speaker: 'BOMBO', text: '¡Grrr-acias! Dos equipos perfectos y ningún rival del mismo lado.' },
    { speaker: 'BOMBO', text: 'Y si hay un triángulo de rivales, ya sé que no tiene arreglo: los ciclos impares no se pueden pintar.' },
    { speaker: 'BOMBO', text: 'Herminia, la jefa de expedición, está junto al lago. Tiene una lista enorme de tareas y un orden que respetar.' },
  ],
  rewardTip: {
    title: 'Bipartito con BFS',
    text: {
      python: 'color = [-1] * (n + 1). Vecino nuevo: 1 - color[u]. Vecino con tu mismo color: no es bipartito.',
      cpp: 'vector<int> color(n + 1, -1); vecino nuevo = 1 - color[u]; mismo color = conflicto. Recorre todas las componentes.',
      java: 'int[] color con -1; vecino nuevo = 1 - color[u]; mismo color = conflicto. Recorre todas las componentes.',
    },
  },
};
