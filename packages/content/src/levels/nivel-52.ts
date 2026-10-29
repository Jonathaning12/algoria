import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const MOD = 1000000007;

const escalera = (n: number, saltos: number[], rotos: number[]): [string, string] => {
  const roto = new Uint8Array(n + 1);
  for (const x of rotos) roto[x] = 1;
  const dp = new Array<number>(n + 1).fill(0);
  dp[0] = 1;
  for (let i = 1; i <= n; i++) {
    if (roto[i]) continue;
    let s = 0;
    for (const k of saltos) if (k <= i) s = (s + dp[i - k]!) % MOD;
    dp[i] = s;
  }
  return [`${n} ${saltos.length} ${rotos.length}\n${saltos.join(' ')}\n${rotos.join(' ')}`, `${dp[n]}`];
};

const N = 100000;
const r = rng(5252);
const rotosAzar = (m: number) => {
  const set = new Set<number>();
  while (set.size < m) set.add(r(1, N - 1));
  return [...set].sort((a, b) => a - b);
};

export const nivel52: Level = {
  number: 52,
  id: 'n52-escalera',
  title: 'Contar formas',
  topic: 'Programación dinámica',
  npc: { id: 'tobias', name: 'TOBÍAS', title: 'Campanero de la torre', sprite: 'npc52', x: 14, y: 10 },
  greeting: 'Subo a tocar la campana cada día, y nunca de la misma forma.',
  intro: [
    { speaker: 'TOBÍAS', text: 'Hola. Soy Tobías, el campanero. Subo la escalera de la torre varias veces al día.' },
    { speaker: 'TOBÍAS', text: 'Me gusta variar: a veces subo de a un peldaño, a veces salto dos o tres. Algunos peldaños están rotos y esos no los piso.' },
    { speaker: 'TOBÍAS', text: 'Me pregunto de cuántas formas distintas puedo llegar arriba. Son tantas que se me acabaron los dedos.' },
    { speaker: 'TOBÍAS', text: 'Elda dice que no hace falta probarlas todas: basta con contar desde abajo. ¿Vemos cómo?' },
  ],
  lesson: {
    concept: 'CONTAR CON UNA TABLA',
    goals: ['Definir qué significa dp[i]', 'Escribir la transición desde los estados anteriores', 'Llenar la tabla de abajo hacia arriba'],
    explanation:
      'Para contar formas, define dp[i] = de cuántas maneras puedo llegar al peldaño i. ' +
      'Al peldaño i solo se llega con un último salto, así que dp[i] es la suma de dp[i - s] para cada salto s permitido. ' +
      'El caso base es dp[0] = 1: hay una forma de estar en el suelo, no moverse. ' +
      'Llenando i = 1, 2, 3... en orden, cada valor que necesitas ya está calculado.',
    code: {
      python: code`
        n = int(input())
        dp = [0] * (n + 1)
        dp[0] = 1
        for i in range(1, n + 1):
            dp[i] = dp[i - 1]
            if i >= 2:
                dp[i] += dp[i - 2]
        print(dp[n])
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            int n;
            cin >> n;
            vector<long long> dp(n + 1, 0);
            dp[0] = 1;
            for (int i = 1; i <= n; i++) {
                dp[i] = dp[i - 1];
                if (i >= 2) dp[i] += dp[i - 2];
            }
            cout << dp[n] << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                long[] dp = new long[n + 1];
                dp[0] = 1;
                for (int i = 1; i <= n; i++) {
                    dp[i] = dp[i - 1];
                    if (i >= 2) dp[i] += dp[i - 2];
                }
                System.out.println(dp[n]);
            }
        }
      `,
    },
    examples: [
      { input: '4', output: '5' },
      { input: '10', output: '89' },
      { input: '1', output: '1' },
    ],
    tips: {
      python: 'Los enteros de Python no se desbordan, pero sumar números gigantes es lento: aplica % MOD en cada paso.',
      cpp: 'Con % MOD en cada suma, los valores quedan bajo 10⁹+7 y caben en long long sin desbordarse.',
      java: 'Aplica % MOD en cada suma para que los valores quepan en long. Un boolean[] marca los peldaños rotos.',
    },
    quiz: {
      question: 'Saltos permitidos: 1 o 3 peldaños. ¿Qué imprime este programa?',
      code: {
        python: code`
          n = 5
          dp = [0] * (n + 1)
          dp[0] = 1
          for i in range(1, n + 1):
              dp[i] = dp[i - 1]
              if i >= 3:
                  dp[i] += dp[i - 3]
          print(dp[n])
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              int n = 5;
              int dp[6] = {0};
              dp[0] = 1;
              for (int i = 1; i <= n; i++) {
                  dp[i] = dp[i - 1];
                  if (i >= 3) dp[i] += dp[i - 3];
              }
              cout << dp[n] << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  int n = 5;
                  int[] dp = new int[n + 1];
                  dp[0] = 1;
                  for (int i = 1; i <= n; i++) {
                      dp[i] = dp[i - 1];
                      if (i >= 3) dp[i] += dp[i - 3];
                  }
                  System.out.println(dp[n]);
              }
          }
        `,
      },
      options: ['4', '5', '8'],
      answer: 0,
      explanation: 'La tabla queda 1, 1, 1, 2, 3, 4. Las formas son 1+1+1+1+1, 1+1+3, 1+3+1 y 3+1+1.',
      wrongHint: 'Escribe la tabla a mano: dp[0] = 1 y cada dp[i] suma el de un peldaño atrás y el de tres atrás (si existe).',
    },
  },
  problem: {
    id: 'p52-escalera-de-tobias',
    title: 'LA ESCALERA DE TOBÍAS',
    statement:
      'La escalera de la torre tiene N peldaños. Tobías empieza en el suelo (peldaño 0) y quiere llegar exactamente al peldaño N. ' +
      'En cada salto avanza una de las K distancias permitidas. Hay M peldaños rotos en los que no puede caer nunca. ' +
      'Dos subidas son distintas si la secuencia de saltos es distinta. ¿De cuántas formas puede subir? Imprime el resultado módulo 1 000 000 007.',
    inputSpec: 'Línea 1: N, K y M. Línea 2: las K distancias permitidas (distintas). Línea 3: los M peldaños rotos (vacía si M = 0).',
    outputSpec: 'Un número: la cantidad de formas de llegar al peldaño N, módulo 1 000 000 007.',
    constraints: '1 ≤ N ≤ 10⁵ · 1 ≤ K ≤ 10 · 1 ≤ distancia ≤ N · 0 ≤ M < N · los peldaños rotos son distintos y están entre 1 y N - 1.',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      escalera(4, [1, 2], []),
      escalera(6, [1, 2], [3]),
      escalera(90, [1, 2], []),
      escalera(N, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], []),
      escalera(N - 1, [2, 4], []),
      escalera(N, [1, 3, 7], rotosAzar(1000)),
      escalera(N, [1, 2, 3, 5, 8], rotosAzar(30000)),
      escalera(1, [1], []),
      escalera(10, [1, 2], [4, 5]),
    ]),
    starter: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        n, k, m = int(data[0]), int(data[1]), int(data[2])
        saltos = [int(x) for x in data[3:3 + k]]
        roto = [False] * (n + 1)
        for x in data[3 + k:3 + k + m]:
            roto[int(x)] = True
        MOD = 1000000007
        dp = [0] * (n + 1)
        dp[0] = 1
        # TODO: para i de 1 a n (si no está roto), dp[i] = suma de dp[i - s] para cada salto s <= i
        print(dp[n])
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            const long long MOD = 1000000007;
            int n, k, m;
            cin >> n >> k >> m;
            vector<int> saltos(k);
            for (int i = 0; i < k; i++) cin >> saltos[i];
            vector<bool> roto(n + 1, false);
            for (int i = 0; i < m; i++) {
                int x;
                cin >> x;
                roto[x] = true;
            }
            vector<long long> dp(n + 1, 0);
            dp[0] = 1;
            // TODO: para i de 1 a n (si no está roto), dp[i] = suma de dp[i - s] para cada salto s <= i
            cout << dp[n] << "\n";
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
                final long MOD = 1000000007L;
                in.nextToken();
                int n = (int) in.nval;
                in.nextToken();
                int k = (int) in.nval;
                in.nextToken();
                int m = (int) in.nval;
                int[] saltos = new int[k];
                for (int i = 0; i < k; i++) {
                    in.nextToken();
                    saltos[i] = (int) in.nval;
                }
                boolean[] roto = new boolean[n + 1];
                for (int i = 0; i < m; i++) {
                    in.nextToken();
                    roto[(int) in.nval] = true;
                }
                long[] dp = new long[n + 1];
                dp[0] = 1;
                // TODO: para i de 1 a n (si no está roto), dp[i] = suma de dp[i - s] para cada salto s <= i
                System.out.println(dp[n]);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        n, k, m = int(data[0]), int(data[1]), int(data[2])
        saltos = [int(x) for x in data[3:3 + k]]
        roto = [False] * (n + 1)
        for x in data[3 + k:3 + k + m]:
            roto[int(x)] = True
        MOD = 1000000007
        dp = [0] * (n + 1)
        dp[0] = 1
        for i in range(1, n + 1):
            if roto[i]:
                continue
            s = 0
            for d in saltos:
                if d <= i:
                    s += dp[i - d]
            dp[i] = s % MOD
        print(dp[n])
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            const long long MOD = 1000000007;
            int n, k, m;
            cin >> n >> k >> m;
            vector<int> saltos(k);
            for (int i = 0; i < k; i++) cin >> saltos[i];
            vector<bool> roto(n + 1, false);
            for (int i = 0; i < m; i++) {
                int x;
                cin >> x;
                roto[x] = true;
            }
            vector<long long> dp(n + 1, 0);
            dp[0] = 1;
            for (int i = 1; i <= n; i++) {
                if (roto[i]) continue;
                long long s = 0;
                for (int d : saltos) {
                    if (d <= i) s += dp[i - d];
                }
                dp[i] = s % MOD;
            }
            cout << dp[n] << "\n";
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
                final long MOD = 1000000007L;
                in.nextToken();
                int n = (int) in.nval;
                in.nextToken();
                int k = (int) in.nval;
                in.nextToken();
                int m = (int) in.nval;
                int[] saltos = new int[k];
                for (int i = 0; i < k; i++) {
                    in.nextToken();
                    saltos[i] = (int) in.nval;
                }
                boolean[] roto = new boolean[n + 1];
                for (int i = 0; i < m; i++) {
                    in.nextToken();
                    roto[(int) in.nval] = true;
                }
                long[] dp = new long[n + 1];
                dp[0] = 1;
                for (int i = 1; i <= n; i++) {
                    if (roto[i]) continue;
                    long s = 0;
                    for (int d : saltos) {
                        if (d <= i) s += dp[i - d];
                    }
                    dp[i] = s % MOD;
                }
                System.out.println(dp[n]);
            }
        }
      `,
    },
    hints: [
      'Probar todas las subidas una por una es imposible: con saltos de 1 y 2 y N = 90 ya hay más de 10¹⁸.',
      'Fíjate en el último salto. Si llegas al peldaño i con un salto de s, antes estabas en i - s. Las formas de llegar a i son la suma de las formas de llegar a cada i - s.',
      'dp[0] = 1. Para i de 1 a N: si i está roto, dp[i] = 0; si no, dp[i] = suma de dp[i - s] para cada salto s ≤ i, todo % MOD. La respuesta es dp[N].',
    ],
  },
  outro: [
    { speaker: 'TOBÍAS', text: '¡Tantas formas de subir! Y las contaste sin dar un solo paso.' },
    { speaker: 'TOBÍAS', text: 'dp[i] = cuántas formas hay de llegar aquí. Con eso basta para contar casi cualquier cosa.' },
    { speaker: 'TOBÍAS', text: 'Casiopea, la cartógrafa, está en el piso de arriba. Ella cuenta caminos, pero en dos dimensiones.' },
  ],
  rewardTip: {
    title: 'Contar formas',
    text: {
      python: 'dp[0] = 1; dp[i] = suma de dp[i - s] por cada salto s. Aplica % MOD en cada paso para no cargar números gigantes.',
      cpp: 'dp[0] = 1; dp[i] = suma de dp[i - s] por cada salto s, con % MOD. Piensa siempre en el último paso.',
      java: 'dp[0] = 1; dp[i] = suma de dp[i - s] por cada salto s, con % MOD. Piensa siempre en el último paso.',
    },
  },
};
