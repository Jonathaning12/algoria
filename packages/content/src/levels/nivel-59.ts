import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const aprendices = (c: number[][]): [string, string] => {
  const n = c.length;
  const INF = Number.MAX_SAFE_INTEGER;
  const dp = new Array<number>(1 << n).fill(INF);
  dp[0] = 0;
  for (let mask = 0; mask < 1 << n; mask++) {
    let i = 0;
    for (let x = mask; x; x &= x - 1) i++;
    if (i === n) continue;
    for (let j = 0; j < n; j++) {
      if (mask & (1 << j)) continue;
      const v = dp[mask]! + c[i]![j]!;
      if (v < dp[mask | (1 << j)]!) dp[mask | (1 << j)] = v;
    }
  }
  return [`${n}\n${c.map((row) => row.join(' ')).join('\n')}`, `${dp[(1 << n) - 1]}`];
};

const matriz = (n: number, seed: number, lo: number, hi: number) => {
  const r = rng(seed);
  return Array.from({ length: n }, () => Array.from({ length: n }, () => r(lo, hi)));
};
// Una asignación escondida muy barata (una permutación) entre costos altos.
const escondida = (() => {
  const n = 15;
  const r = rng(9595);
  const perm = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = r(0, i);
    [perm[i], perm[j]] = [perm[j]!, perm[i]!];
  }
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (perm[i] === j ? r(1, 9) : r(500000, 1000000))));
})();

export const nivel59: Level = {
  number: 59,
  id: 'n59-mascaras-de-bits',
  title: 'DP con máscaras de bits',
  topic: 'Programación dinámica',
  npc: { id: 'melquiades', name: 'MELQUÍADES', title: 'Maestro de aprendices', sprite: 'npc59', x: 11, y: 2 },
  greeting: 'Quince aprendices, quince tareas, y un número para recordar quién ya trabaja.',
  intro: [
    { speaker: 'MELQUÍADES', text: 'Bienvenido al último piso de estudio. Soy Melquíades y reparto las tareas entre mis aprendices.' },
    { speaker: 'MELQUÍADES', text: 'Cada aprendiz tarda distinto en cada tarea, y cada tarea la hace exactamente uno.' },
    { speaker: 'MELQUÍADES', text: 'Probar todos los repartos son 15! formas: más de un billón. Ni con magia termino.' },
    { speaker: 'MELQUÍADES', text: 'Mi secreto: guardo en un solo número qué tareas ya están tomadas, un bit por tarea. ¿Te lo enseño?' },
  ],
  lesson: {
    concept: 'MÁSCARAS DE BITS',
    goals: ['Representar un subconjunto con un número', 'Revisar y encender bits con & y |', 'Hacer DP sobre los 2ⁿ subconjuntos'],
    explanation:
      'Con n ≤ 15 elementos, un subconjunto cabe en un número: el bit j vale 1 si el elemento j está dentro. ' +
      'mask & (1 << j) dice si j está, y mask | (1 << j) lo agrega. Recorrer mask de 0 a 2ⁿ - 1 visita todos los subconjuntos. ' +
      'Para repartir tareas: dp[mask] = menor costo si las tareas de mask ya están asignadas a los primeros aprendices (tantos como bits tenga mask). ' +
      'El siguiente aprendiz prueba cada tarea libre j: dp[mask | (1 << j)] = min(..., dp[mask] + costo). Son 2ⁿ·n pasos en vez de n!.',
    code: {
      python: code`
        n, l = map(int, input().split())
        w = list(map(int, input().split()))
        total = 0
        for mask in range(1 << n):
            s = 0
            for i in range(n):
                if mask & (1 << i):
                    s += w[i]
            if s == l:
                total += 1
        print(total)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            int n, l;
            cin >> n >> l;
            vector<int> w(n);
            for (int i = 0; i < n; i++) cin >> w[i];
            int total = 0;
            for (int mask = 0; mask < (1 << n); mask++) {
                int s = 0;
                for (int i = 0; i < n; i++) {
                    if (mask & (1 << i)) s += w[i];
                }
                if (s == l) total++;
            }
            cout << total << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                int l = sc.nextInt();
                int[] w = new int[n];
                for (int i = 0; i < n; i++) w[i] = sc.nextInt();
                int total = 0;
                for (int mask = 0; mask < (1 << n); mask++) {
                    int s = 0;
                    for (int i = 0; i < n; i++) {
                        if ((mask & (1 << i)) != 0) s += w[i];
                    }
                    if (s == l) total++;
                }
                System.out.println(total);
            }
        }
      `,
    },
    examples: [
      { input: '4 5\n1 2 3 4', output: '2' },
      { input: '3 0\n1 2 3', output: '1' },
      { input: '3 6\n1 2 3', output: '1' },
    ],
    tips: {
      python: 'bin(mask).count("1") cuenta los bits encendidos. En Python 3.10 o más nuevo también existe mask.bit_count().',
      cpp: '__builtin_popcount(mask) cuenta los bits encendidos en un solo paso. Ojo con los paréntesis: (mask & (1 << j)).',
      java: 'Integer.bitCount(mask) cuenta los bits. En Java, (mask & (1 << j)) != 0: un int no se usa directo como condición.',
    },
    quiz: {
      question: 'mask vale 13. ¿Qué posiciones tienen el bit encendido? (el programa las imprime)',
      code: {
        python: code`
          mask = 13
          bits = []
          for j in range(5):
              if mask & (1 << j):
                  bits.append(j)
          print(*bits)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              int mask = 13;
              bool primero = true;
              for (int j = 0; j < 5; j++) {
                  if (mask & (1 << j)) {
                      if (!primero) cout << " ";
                      cout << j;
                      primero = false;
                  }
              }
              cout << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  int mask = 13;
                  StringBuilder sb = new StringBuilder();
                  for (int j = 0; j < 5; j++) {
                      if ((mask & (1 << j)) != 0) {
                          if (sb.length() > 0) sb.append(" ");
                          sb.append(j);
                      }
                  }
                  System.out.println(sb);
              }
          }
        `,
      },
      options: ['0 2 3', '1 2 3', '0 1 3'],
      answer: 0,
      explanation: '13 en binario es 1101: 8 + 4 + 1. Los bits encendidos son el 0 (vale 1), el 2 (vale 4) y el 3 (vale 8).',
      wrongHint: 'Escribe 13 como suma de potencias de 2. El bit j vale 2 elevado a j, y se cuentan desde la derecha empezando en 0.',
    },
  },
  problem: {
    id: 'p59-aprendices-de-melquiades',
    title: 'LOS APRENDICES DE MELQUÍADES',
    statement:
      'Melquíades tiene N aprendices y N tareas. El aprendiz i tarda c[i][j] minutos en la tarea j. ' +
      'Cada aprendiz debe hacer exactamente una tarea y cada tarea la hace exactamente un aprendiz. ' +
      '¿Cuál es el menor tiempo total posible? Cuidado: probar todos los repartos (N!) es demasiado lento.',
    inputSpec: 'Línea 1: N. Luego N líneas con N enteros: la fila i tiene c[i][1] ... c[i][N].',
    outputSpec: 'Un número: el menor tiempo total.',
    constraints: '1 ≤ N ≤ 15 · 1 ≤ c[i][j] ≤ 10⁶.',
    difficulty: 'dificil',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      aprendices([[4, 2, 8], [4, 3, 7], [3, 1, 6]]),
      aprendices([[10, 1], [1, 10]]),
      aprendices(matriz(15, 5959, 1, 1000000)),
      aprendices(escondida),
      aprendices(matriz(15, 9559, 1, 10)),
      aprendices(Array.from({ length: 15 }, () => Array.from({ length: 15 }, () => 1000000))),
      aprendices(matriz(14, 5995, 1000, 2000)),
      aprendices([[7]]),
      aprendices(matriz(8, 9955, 1, 100)),
    ]),
    starter: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        n = int(data[0])
        c = [[int(data[1 + i * n + j]) for j in range(n)] for i in range(n)]
        INF = float("inf")
        dp = [INF] * (1 << n)
        dp[0] = 0
        for mask in range(1 << n):
            i = bin(mask).count("1")  # el aprendiz que toca asignar
            if i == n:
                continue
            # TODO: para cada tarea j libre (bit j apagado en mask):
            # dp[mask | (1 << j)] = min(dp[mask | (1 << j)], dp[mask] + c[i][j])
        print(dp[(1 << n) - 1])
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n;
            cin >> n;
            vector<vector<long long>> c(n, vector<long long>(n));
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++) cin >> c[i][j];
            const long long INF = 1e18;
            vector<long long> dp(1 << n, INF);
            dp[0] = 0;
            for (int mask = 0; mask < (1 << n); mask++) {
                int i = __builtin_popcount(mask);  // el aprendiz que toca asignar
                if (i == n) continue;
                // TODO: para cada tarea j libre (bit j apagado en mask):
                // dp[mask | (1 << j)] = min(dp[mask | (1 << j)], dp[mask] + c[i][j])
            }
            cout << dp[(1 << n) - 1] << "\n";
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
                long[][] c = new long[n][n];
                for (int i = 0; i < n; i++) {
                    for (int j = 0; j < n; j++) {
                        in.nextToken();
                        c[i][j] = (long) in.nval;
                    }
                }
                long[] dp = new long[1 << n];
                Arrays.fill(dp, Long.MAX_VALUE);
                dp[0] = 0;
                for (int mask = 0; mask < (1 << n); mask++) {
                    int i = Integer.bitCount(mask);  // el aprendiz que toca asignar
                    if (i == n) continue;
                    // TODO: para cada tarea j libre (bit j apagado en mask):
                    // dp[mask | (1 << j)] = min(dp[mask | (1 << j)], dp[mask] + c[i][j])
                }
                System.out.println(dp[(1 << n) - 1]);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        n = int(data[0])
        c = [[int(data[1 + i * n + j]) for j in range(n)] for i in range(n)]
        INF = float("inf")
        dp = [INF] * (1 << n)
        dp[0] = 0
        for mask in range(1 << n):
            i = bin(mask).count("1")
            if i == n:
                continue
            d = dp[mask]
            fila = c[i]
            for j in range(n):
                bit = 1 << j
                if not mask & bit:
                    v = d + fila[j]
                    if v < dp[mask | bit]:
                        dp[mask | bit] = v
        print(dp[(1 << n) - 1])
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n;
            cin >> n;
            vector<vector<long long>> c(n, vector<long long>(n));
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++) cin >> c[i][j];
            const long long INF = 1e18;
            vector<long long> dp(1 << n, INF);
            dp[0] = 0;
            for (int mask = 0; mask < (1 << n); mask++) {
                int i = __builtin_popcount(mask);
                if (i == n) continue;
                for (int j = 0; j < n; j++) {
                    if (mask & (1 << j)) continue;
                    int nm = mask | (1 << j);
                    if (dp[mask] + c[i][j] < dp[nm]) dp[nm] = dp[mask] + c[i][j];
                }
            }
            cout << dp[(1 << n) - 1] << "\n";
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
                long[][] c = new long[n][n];
                for (int i = 0; i < n; i++) {
                    for (int j = 0; j < n; j++) {
                        in.nextToken();
                        c[i][j] = (long) in.nval;
                    }
                }
                long[] dp = new long[1 << n];
                Arrays.fill(dp, Long.MAX_VALUE);
                dp[0] = 0;
                for (int mask = 0; mask < (1 << n); mask++) {
                    int i = Integer.bitCount(mask);
                    if (i == n) continue;
                    for (int j = 0; j < n; j++) {
                        if ((mask & (1 << j)) != 0) continue;
                        int nm = mask | (1 << j);
                        if (dp[mask] + c[i][j] < dp[nm]) dp[nm] = dp[mask] + c[i][j];
                    }
                }
                System.out.println(dp[(1 << n) - 1]);
            }
        }
      `,
    },
    hints: [
      'Probar las N! formas de repartir es imposible con N = 15. Pero fíjate: para seguir repartiendo, solo importa QUÉ tareas ya están tomadas, no quién tomó cada una.',
      'Guarda el conjunto de tareas tomadas en una máscara de bits. Si la máscara tiene k bits encendidos, ya repartiste a los aprendices 0 ... k-1 y le toca al aprendiz k.',
      'dp[0] = 0, el resto infinito. Para cada mask en orden, i = cantidad de bits de mask; para cada j con el bit apagado: dp[mask | (1 << j)] = min(..., dp[mask] + c[i][j]). La respuesta es dp[2ᴺ - 1].',
    ],
  },
  outro: [
    { speaker: 'MELQUÍADES', text: 'Treinta y dos mil máscaras en vez de un billón de repartos. Mis aprendices por fin descansan.' },
    { speaker: 'MELQUÍADES', text: 'Cuando n es pequeño y el estado es "qué elementos ya usé", piensa en bits.' },
    { speaker: 'MELQUÍADES', text: 'Solo te queda la Archimaga Isolda, frente a la puerta del Gimnasio Torre. Es la última líder de Algoria.' },
  ],
  rewardTip: {
    title: 'DP con máscaras',
    text: {
      python: 'mask & (1 << j) revisa, mask | (1 << j) agrega. dp[mask] sobre 2ⁿ estados; bin(mask).count("1") dice a quién le toca.',
      cpp: 'mask & (1 << j) revisa, mask | (1 << j) agrega. __builtin_popcount(mask) cuenta bits. 2ⁿ·n pasos en vez de n!.',
      java: '(mask & (1 << j)) != 0 revisa, mask | (1 << j) agrega. Integer.bitCount(mask) cuenta bits. 2ⁿ·n pasos en vez de n!.',
    },
  },
};
