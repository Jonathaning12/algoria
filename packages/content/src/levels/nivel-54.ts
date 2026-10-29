import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

type Item = [number, number]; // [peso, poder]

const mochila = (w: number, items: Item[]): [string, string] => {
  const dp = new Array<number>(w + 1).fill(0); // poderes ≤ 10¹¹: caben exactos en un double
  for (const [p, v] of items) {
    for (let c = w; c >= p; c--) if (dp[c - p]! + v > dp[c]!) dp[c] = dp[c - p]! + v;
  }
  return [`${items.length} ${w}\n${items.map(([p, v]) => `${p} ${v}`).join('\n')}`, `${dp[w]}`];
};

const azar = (n: number, seed: number, maxPeso: number, maxPoder: number): Item[] => {
  const r = rng(seed);
  return Array.from({ length: n }, () => [r(1, maxPeso), r(1, maxPoder)] as Item);
};
// Pesos parecidos y poder casi proporcional: el truco "el más valioso primero" falla.
const tramposos = (() => {
  const r = rng(4545);
  return Array.from({ length: 100 }, () => {
    const p = r(900, 1100);
    return [p, p * 1000 + r(0, 999)] as Item;
  });
})();

export const nivel54: Level = {
  number: 54,
  id: 'n54-mochila',
  title: 'Mochila 0/1',
  topic: 'Programación dinámica',
  npc: { id: 'baltasar', name: 'BALTASAR', title: 'Alquimista viajero', sprite: 'npc54', x: 6, y: 8 },
  greeting: 'Cada ingrediente pesa. La pregunta es cuál vale la pena llevar.',
  intro: [
    { speaker: 'BALTASAR', text: 'Ah, un visitante. Soy Baltasar, alquimista. Mañana salgo de viaje a buscar la piedra filosofal.' },
    { speaker: 'BALTASAR', text: 'Tengo cien ingredientes, cada uno con su peso y su poder, pero mi mochila solo aguanta cierto peso.' },
    { speaker: 'BALTASAR', text: 'Probé llevar primero los más poderosos, luego los más livianos... y ninguna receta sale siempre bien.' },
    { speaker: 'BALTASAR', text: 'Dicen que hay que preguntarse, para cada capacidad, qué es lo mejor que cabe. ¿Me ayudas a pensarlo?' },
  ],
  lesson: {
    concept: 'MOCHILA 0/1',
    goals: ['Definir dp[c] = el mejor poder con capacidad c', 'Decidir para cada objeto: llevarlo o no', 'Recorrer las capacidades de mayor a menor'],
    explanation:
      'Ningún truco goloso resuelve la mochila: hay que considerar cada objeto. ' +
      'Sea dp[c] el mayor poder que cabe en capacidad c usando los objetos vistos hasta ahora. ' +
      'Al llegar un objeto de peso p y poder v, para cada c ≥ p decides: no llevarlo (dp[c]) o llevarlo (dp[c - p] + v). ' +
      'Recorre c de mayor a menor: así dp[c - p] todavía no incluye este objeto y nunca lo usas dos veces. Son N·W pasos.',
    code: {
      python: code`
        n, w = map(int, input().split())
        dp = [0] * (w + 1)
        for _ in range(n):
            p, v = map(int, input().split())
            for c in range(w, p - 1, -1):
                if dp[c - p] + v > dp[c]:
                    dp[c] = dp[c - p] + v
        print(dp[w])
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            int n, w;
            cin >> n >> w;
            vector<long long> dp(w + 1, 0);
            for (int i = 0; i < n; i++) {
                int p;
                long long v;
                cin >> p >> v;
                for (int c = w; c >= p; c--) {
                    if (dp[c - p] + v > dp[c]) dp[c] = dp[c - p] + v;
                }
            }
            cout << dp[w] << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                int w = sc.nextInt();
                long[] dp = new long[w + 1];
                for (int i = 0; i < n; i++) {
                    int p = sc.nextInt();
                    long v = sc.nextLong();
                    for (int c = w; c >= p; c--) {
                        if (dp[c - p] + v > dp[c]) dp[c] = dp[c - p] + v;
                    }
                }
                System.out.println(dp[w]);
            }
        }
      `,
    },
    examples: [
      { input: '3 5\n2 3\n3 4\n4 5', output: '7' },
      { input: '2 3\n4 10\n5 20', output: '0' },
      { input: '3 6\n1 1\n2 2\n3 3', output: '6' },
    ],
    tips: {
      python: 'El for de capacidades va al revés: range(w, p - 1, -1). Si lo recorres hacia arriba, el mismo ingrediente se cuela varias veces.',
      cpp: 'for (int c = w; c >= p; c--): de mayor a menor. La suma de poderes puede pasar de 2·10⁹: usa long long.',
      java: 'for (int c = w; c >= p; c--): de mayor a menor. La suma de poderes puede pasar de 2·10⁹: usa long.',
    },
    quiz: {
      question: 'Un solo ingrediente (peso 2, poder 3) y capacidad 6, pero el bucle va de MENOR a mayor. ¿Qué imprime?',
      code: {
        python: code`
          w = 6
          p, v = 2, 3
          dp = [0] * (w + 1)
          for c in range(p, w + 1):
              if dp[c - p] + v > dp[c]:
                  dp[c] = dp[c - p] + v
          print(dp[w])
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              int w = 6, p = 2, v = 3;
              int dp[7] = {0};
              for (int c = p; c <= w; c++) {
                  if (dp[c - p] + v > dp[c]) dp[c] = dp[c - p] + v;
              }
              cout << dp[w] << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  int w = 6, p = 2, v = 3;
                  int[] dp = new int[w + 1];
                  for (int c = p; c <= w; c++) {
                      if (dp[c - p] + v > dp[c]) dp[c] = dp[c - p] + v;
                  }
                  System.out.println(dp[w]);
              }
          }
        `,
      },
      options: ['3', '9', '6'],
      answer: 1,
      explanation: 'Hacia arriba, dp[4] ya usó el ingrediente y dp[6] lo vuelve a usar: 3 + 3 + 3 = 9. Por eso en la mochila 0/1 se recorre de mayor a menor.',
      wrongHint: 'Sigue la tabla: dp[2] = 3, luego dp[4] mira dp[2], que ya incluye el ingrediente... ¿y dp[6]?',
    },
  },
  problem: {
    id: 'p54-mochila-de-baltasar',
    title: 'LA MOCHILA DE BALTASAR',
    statement:
      'Baltasar tiene N ingredientes; el i-ésimo pesa pᵢ y tiene un poder vᵢ. Su mochila aguanta un peso total de W como máximo. ' +
      'Puede llevar cada ingrediente una vez o dejarlo. ¿Cuál es el mayor poder total que puede llevar sin pasarse del peso?',
    inputSpec: 'Línea 1: N y W. Luego N líneas, cada una con pᵢ y vᵢ.',
    outputSpec: 'Un número: el mayor poder total posible.',
    constraints: '1 ≤ N ≤ 100 · 1 ≤ W ≤ 10⁴ · 1 ≤ pᵢ ≤ 10⁴ · 1 ≤ vᵢ ≤ 10⁹ · la respuesta puede pasar de 2·10⁹.',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      mochila(7, [[1, 1], [3, 4], [4, 5], [5, 7]]),
      mochila(50, [[10, 60], [20, 100], [30, 120]]),
      mochila(10000, azar(60, 5454, 400, 1000)),
      mochila(10000, azar(100, 4554, 10000, 1000000000)),
      mochila(10000, tramposos),
      mochila(5, [[6, 100], [7, 200], [10000, 300]]),
      mochila(10000, azar(100, 5544, 100, 1000000000)),
      mochila(1, [[1, 1000000000]]),
      mochila(9999, azar(100, 4455, 1000, 1000)),
    ]),
    starter: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        n, w = int(data[0]), int(data[1])
        dp = [0] * (w + 1)
        for i in range(n):
            p = int(data[2 + 2 * i])
            v = int(data[3 + 2 * i])
            # TODO: para c de w hasta p (bajando), dp[c] = max(dp[c], dp[c - p] + v)
        print(dp[w])
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, w;
            cin >> n >> w;
            vector<long long> dp(w + 1, 0);
            for (int i = 0; i < n; i++) {
                int p;
                long long v;
                cin >> p >> v;
                // TODO: para c de w hasta p (bajando), dp[c] = max(dp[c], dp[c - p] + v)
            }
            cout << dp[w] << "\n";
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
                in.nextToken();
                int w = (int) in.nval;
                long[] dp = new long[w + 1];
                for (int i = 0; i < n; i++) {
                    in.nextToken();
                    int p = (int) in.nval;
                    in.nextToken();
                    long v = (long) in.nval;
                    // TODO: para c de w hasta p (bajando), dp[c] = max(dp[c], dp[c - p] + v)
                }
                System.out.println(dp[w]);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        n, w = int(data[0]), int(data[1])
        dp = [0] * (w + 1)
        for i in range(n):
            p = int(data[2 + 2 * i])
            v = int(data[3 + 2 * i])
            for c in range(w, p - 1, -1):
                x = dp[c - p] + v
                if x > dp[c]:
                    dp[c] = x
        print(dp[w])
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, w;
            cin >> n >> w;
            vector<long long> dp(w + 1, 0);
            for (int i = 0; i < n; i++) {
                int p;
                long long v;
                cin >> p >> v;
                for (int c = w; c >= p; c--) {
                    if (dp[c - p] + v > dp[c]) dp[c] = dp[c - p] + v;
                }
            }
            cout << dp[w] << "\n";
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
                in.nextToken();
                int w = (int) in.nval;
                long[] dp = new long[w + 1];
                for (int i = 0; i < n; i++) {
                    in.nextToken();
                    int p = (int) in.nval;
                    in.nextToken();
                    long v = (long) in.nval;
                    for (int c = w; c >= p; c--) {
                        if (dp[c - p] + v > dp[c]) dp[c] = dp[c - p] + v;
                    }
                }
                System.out.println(dp[w]);
            }
        }
      `,
    },
    hints: [
      'Probar todos los subconjuntos son 2ᴺ casos: con N = 100, imposible. Y llevar siempre el más poderoso (o el más liviano) no siempre es lo mejor.',
      'Piensa en dp[c] = el mayor poder que cabe en capacidad c. Cuando llega un ingrediente (p, v), para cada c ≥ p puedes dejarlo (dp[c]) o llevarlo (dp[c - p] + v).',
      'dp empieza en ceros. Para cada ingrediente, recorre c de W bajando hasta p y haz dp[c] = max(dp[c], dp[c - p] + v). Bajando, cada ingrediente se usa a lo sumo una vez. La respuesta es dp[W].',
    ],
  },
  outro: [
    { speaker: 'BALTASAR', text: '¡Mi mochila nunca pesó tan poco ni valió tanto! Ningún ingrediente quedó sin considerar.' },
    { speaker: 'BALTASAR', text: 'Llevar o no llevar: cuando cada objeto es una decisión, la mochila es tu herramienta.' },
    { speaker: 'BALTASAR', text: 'Orfea, la tesorera, está en el piso de arriba. Paga todo con la menor cantidad de monedas posible.' },
  ],
  rewardTip: {
    title: 'Mochila 0/1',
    text: {
      python: 'for c in range(w, p - 1, -1): dp[c] = max(dp[c], dp[c - p] + v). De mayor a menor: cada objeto una sola vez. O(N·W).',
      cpp: 'for (c = w; c >= p; c--) dp[c] = max(dp[c], dp[c - p] + v). De mayor a menor: cada objeto una vez. long long.',
      java: 'for (c = w; c >= p; c--) dp[c] = Math.max(dp[c], dp[c - p] + v). De mayor a menor: cada objeto una vez. long.',
    },
  },
};
