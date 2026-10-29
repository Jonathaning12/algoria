import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const monedas = (x: number, cs: number[]): [string, string] => {
  const INF = 1e9;
  const dp = new Array<number>(x + 1).fill(INF);
  dp[0] = 0;
  for (const c of cs) {
    for (let s = c; s <= x; s++) if (dp[s - c]! + 1 < dp[s]!) dp[s] = dp[s - c]! + 1;
  }
  return [`${cs.length} ${x}\n${cs.join(' ')}`, `${dp[x]! >= INF ? -1 : dp[x]}`];
};

const X = 50000;
const azar = (n: number, seed: number, lo: number, hi: number) => {
  const r = rng(seed);
  const set = new Set<number>();
  while (set.size < n) set.add(r(lo, hi));
  return [...set];
};

export const nivel55: Level = {
  number: 55,
  id: 'n55-cambio-monedas',
  title: 'Cambio de monedas',
  topic: 'Programación dinámica',
  npc: { id: 'orfea', name: 'ORFEA', title: 'Tesorera de la torre', sprite: 'npc55', x: 2, y: 6 },
  greeting: 'Una bolsa liviana es una bolsa feliz. Pago con las menos monedas posibles.',
  intro: [
    { speaker: 'ORFEA', text: 'Buen día. Soy Orfea y llevo las cuentas de la torre. Pago a cada mago con monedas de oro.' },
    { speaker: 'ORFEA', text: 'Las monedas de la torre tienen valores raros: de 1, de 3, de 4... Cada mago inventó la suya.' },
    { speaker: 'ORFEA', text: 'Yo siempre tomaba la moneda más grande que cabía, pero el otro día pagué 6 con tres monedas cuando bastaban dos.' },
    { speaker: 'ORFEA', text: 'Necesito un método que nunca falle. ¿Lo buscamos juntos o vas directo al duelo?' },
  ],
  lesson: {
    concept: 'MÍNIMO NÚMERO DE MONEDAS',
    goals: ['Ver por qué el método goloso puede fallar', 'Definir dp[s] = mínimo de monedas para pagar s', 'Marcar los montos imposibles'],
    explanation:
      'Tomar siempre la moneda más grande funciona con algunas monedas, pero no con todas: con 1, 3 y 4, para pagar 6 el goloso da 4+1+1 y lo mejor es 3+3. ' +
      'Con DP, dp[s] es el mínimo de monedas para pagar exactamente s. La última moneda usada fue alguna c, así que dp[s] = min(dp[s - c] + 1). ' +
      'dp[0] = 0 y los demás empiezan en "infinito": si al final dp[s] sigue infinito, ese monto no se puede pagar.',
    code: {
      python: code`
        n, x = map(int, input().split())
        cs = list(map(int, input().split()))
        INF = float("inf")
        dp = [INF] * (x + 1)
        dp[0] = 0
        for s in range(1, x + 1):
            for c in cs:
                if c <= s and dp[s - c] + 1 < dp[s]:
                    dp[s] = dp[s - c] + 1
        print(dp[x] if dp[x] != INF else -1)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            int n, x;
            cin >> n >> x;
            vector<int> cs(n);
            for (int i = 0; i < n; i++) cin >> cs[i];
            const int INF = 1000000000;
            vector<int> dp(x + 1, INF);
            dp[0] = 0;
            for (int s = 1; s <= x; s++) {
                for (int c : cs) {
                    if (c <= s && dp[s - c] + 1 < dp[s]) dp[s] = dp[s - c] + 1;
                }
            }
            cout << (dp[x] == INF ? -1 : dp[x]) << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                int x = sc.nextInt();
                int[] cs = new int[n];
                for (int i = 0; i < n; i++) cs[i] = sc.nextInt();
                final int INF = 1000000000;
                int[] dp = new int[x + 1];
                java.util.Arrays.fill(dp, INF);
                dp[0] = 0;
                for (int s = 1; s <= x; s++) {
                    for (int c : cs) {
                        if (c <= s && dp[s - c] + 1 < dp[s]) dp[s] = dp[s - c] + 1;
                    }
                }
                System.out.println(dp[x] == INF ? -1 : dp[x]);
            }
        }
      `,
    },
    examples: [
      { input: '3 6\n1 3 4', output: '2' },
      { input: '2 7\n2 4', output: '-1' },
      { input: '3 11\n1 2 5', output: '3' },
    ],
    tips: {
      python: 'Pon el for de monedas afuera y el de montos adentro: for s in range(c, x + 1). Así el bucle interno es más simple y Python va más rápido.',
      cpp: 'Usa un INF grande pero sin riesgo de desborde: con 10⁹, INF + 1 todavía cabe en int.',
      java: 'Arrays.fill(dp, INF) inicializa todo de una vez. Con INF = 10⁹, INF + 1 no se desborda.',
    },
    quiz: {
      question: 'Este programa es goloso: toma siempre la moneda más grande que cabe. Monedas 1, 3 y 4; monto 6. ¿Qué imprime?',
      code: {
        python: code`
          monedas = [4, 3, 1]
          x = 6
          usadas = 0
          for c in monedas:
              while x >= c:
                  x -= c
                  usadas += 1
          print(usadas)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              int monedas[3] = {4, 3, 1};
              int x = 6, usadas = 0;
              for (int c : monedas) {
                  while (x >= c) {
                      x -= c;
                      usadas++;
                  }
              }
              cout << usadas << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  int[] monedas = {4, 3, 1};
                  int x = 6, usadas = 0;
                  for (int c : monedas) {
                      while (x >= c) {
                          x -= c;
                          usadas++;
                      }
                  }
                  System.out.println(usadas);
              }
          }
        `,
      },
      options: ['2', '3', '6'],
      answer: 1,
      explanation: 'El goloso paga 4 + 1 + 1: tres monedas. Pero 3 + 3 usa solo dos. Por eso aquí hace falta DP.',
      wrongHint: 'Sigue el programa: primero toma un 4 (quedan 2), el 3 ya no cabe, y luego toma unos.',
    },
  },
  problem: {
    id: 'p55-monedas-de-orfea',
    title: 'LAS MONEDAS DE ORFEA',
    statement:
      'Orfea tiene N tipos de monedas de valores c₁, ..., cₙ, y monedas ilimitadas de cada tipo. ' +
      'Debe pagar exactamente X de oro. ¿Cuál es la menor cantidad de monedas con la que puede hacerlo? ' +
      'Si es imposible pagar exactamente X, imprime -1.',
    inputSpec: 'Línea 1: N y X. Línea 2: los N valores de las monedas (distintos).',
    outputSpec: 'Un número: el mínimo de monedas, o -1 si no se puede.',
    constraints: '1 ≤ N ≤ 50 · 1 ≤ X ≤ 5·10⁴ · 1 ≤ cᵢ ≤ 5·10⁴.',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      monedas(6, [1, 3, 4]),
      monedas(3, [5, 10]),
      monedas(X, azar(50, 5555, 1, 2000)),
      monedas(X - 1, [7, 13]),
      monedas(X, [2, 4, 6, 8]),
      monedas(X - 1, [2, 4, 6, 8]),
      monedas(X, azar(50, 5005, 900, 5000)),
      monedas(X, [X]),
      monedas(49999, [1, 9998, 9999, 10000]),
      monedas(1, [2]),
    ]),
    starter: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        n, x = int(data[0]), int(data[1])
        cs = [int(v) for v in data[2:2 + n]]
        INF = 10 ** 9
        dp = [INF] * (x + 1)
        dp[0] = 0
        # TODO: para cada moneda c y cada monto s de c a x: dp[s] = min(dp[s], dp[s - c] + 1)
        print(dp[x] if dp[x] < INF else -1)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, x;
            cin >> n >> x;
            vector<int> cs(n);
            for (int i = 0; i < n; i++) cin >> cs[i];
            const int INF = 1000000000;
            vector<int> dp(x + 1, INF);
            dp[0] = 0;
            // TODO: para cada moneda c y cada monto s de c a x: dp[s] = min(dp[s], dp[s - c] + 1)
            cout << (dp[x] >= INF ? -1 : dp[x]) << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.io.StreamTokenizer;
        import java.util.Arrays;

        public class Main {
            public static void main(String[] args) throws Exception {
                StreamTokenizer in = new StreamTokenizer(new BufferedReader(new InputStreamReader(System.in)));
                in.nextToken();
                int n = (int) in.nval;
                in.nextToken();
                int x = (int) in.nval;
                int[] cs = new int[n];
                for (int i = 0; i < n; i++) {
                    in.nextToken();
                    cs[i] = (int) in.nval;
                }
                final int INF = 1000000000;
                int[] dp = new int[x + 1];
                Arrays.fill(dp, INF);
                dp[0] = 0;
                // TODO: para cada moneda c y cada monto s de c a x: dp[s] = min(dp[s], dp[s - c] + 1)
                System.out.println(dp[x] >= INF ? -1 : dp[x]);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        n, x = int(data[0]), int(data[1])
        cs = [int(v) for v in data[2:2 + n]]
        INF = 10 ** 9
        dp = [INF] * (x + 1)
        dp[0] = 0
        for c in cs:
            for s in range(c, x + 1):
                t = dp[s - c] + 1
                if t < dp[s]:
                    dp[s] = t
        print(dp[x] if dp[x] < INF else -1)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, x;
            cin >> n >> x;
            vector<int> cs(n);
            for (int i = 0; i < n; i++) cin >> cs[i];
            const int INF = 1000000000;
            vector<int> dp(x + 1, INF);
            dp[0] = 0;
            for (int c : cs) {
                for (int s = c; s <= x; s++) {
                    if (dp[s - c] + 1 < dp[s]) dp[s] = dp[s - c] + 1;
                }
            }
            cout << (dp[x] >= INF ? -1 : dp[x]) << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.io.StreamTokenizer;
        import java.util.Arrays;

        public class Main {
            public static void main(String[] args) throws Exception {
                StreamTokenizer in = new StreamTokenizer(new BufferedReader(new InputStreamReader(System.in)));
                in.nextToken();
                int n = (int) in.nval;
                in.nextToken();
                int x = (int) in.nval;
                int[] cs = new int[n];
                for (int i = 0; i < n; i++) {
                    in.nextToken();
                    cs[i] = (int) in.nval;
                }
                final int INF = 1000000000;
                int[] dp = new int[x + 1];
                Arrays.fill(dp, INF);
                dp[0] = 0;
                for (int c : cs) {
                    for (int s = c; s <= x; s++) {
                        if (dp[s - c] + 1 < dp[s]) dp[s] = dp[s - c] + 1;
                    }
                }
                System.out.println(dp[x] >= INF ? -1 : dp[x]);
            }
        }
      `,
    },
    hints: [
      'Tomar siempre la moneda más grande no funciona: con monedas 1, 3 y 4, para pagar 6 conviene 3 + 3.',
      'Calcula la respuesta para todos los montos de 0 a X. Para pagar s, la última moneda fue alguna c: quedan dp[s - c] monedas más esa.',
      'dp[0] = 0 y el resto INF. Para cada moneda c, para s de c a X: dp[s] = min(dp[s], dp[s - c] + 1). Si dp[X] sigue en INF, imprime -1.',
    ],
  },
  outro: [
    { speaker: 'ORFEA', text: 'Ni una moneda de más. Mis cuentas por fin cuadran.' },
    { speaker: 'ORFEA', text: 'Cuando el goloso falla, la DP prueba todas las últimas monedas y se queda con la mejor.' },
    { speaker: 'ORFEA', text: 'Selene, la astrónoma, está al otro lado de este piso. Busca una escalera de estrellas cada vez más brillantes.' },
  ],
  rewardTip: {
    title: 'Mínimo de monedas',
    text: {
      python: 'dp[0] = 0, resto INF. dp[s] = min(dp[s], dp[s - c] + 1). Si dp[X] queda en INF, es imposible: -1.',
      cpp: 'dp[0] = 0, resto INF = 1e9. dp[s] = min(dp[s], dp[s - c] + 1). El goloso no siempre sirve.',
      java: 'dp[0] = 0, resto INF = 1e9 (Arrays.fill). dp[s] = min(dp[s], dp[s - c] + 1). El goloso no siempre sirve.',
    },
  },
};
