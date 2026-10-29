import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const MOD = 1000000007;

const baldosas = (g: string[]): [string, string] => {
  const c = g[0]!.length;
  const dp = new Array<number>(c).fill(0);
  dp[0] = 1; // fila virtual encima de la sala: solo entra por la esquina
  for (const row of g) {
    let left = 0;
    for (let j = 0; j < c; j++) {
      if (row[j] === '#') left = 0;
      else left = (left + dp[j]!) % MOD;
      dp[j] = left;
    }
  }
  return [`${g.length} ${c}\n${g.join('\n')}`, `${dp[c - 1]}`];
};

const sala = (rows: number, cols: number, seed: number, prob: number) => {
  const r = rng(seed);
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => ((i === 0 && j === 0) || (i === rows - 1 && j === cols - 1) || r(1, 1000) > prob ? '.' : '#')).join(''),
  );
};
const libre = (rows: number, cols: number) => Array.from({ length: rows }, () => '.'.repeat(cols));
// Un pasillo diagonal de ancho 3: muchos caminos, pero todos obligados a seguirlo.
const pasillo = Array.from({ length: 1000 }, (_, i) => Array.from({ length: 1000 }, (_, j) => (Math.abs(i - j) <= 1 ? '.' : '#')).join(''));
// Una fila entera de estanterías cierra el paso.
const cerrada = libre(1000, 1000).map((row, i) => (i === 500 ? '#'.repeat(1000) : row));

export const nivel53: Level = {
  number: 53,
  id: 'n53-caminos-cuadricula',
  title: 'Caminos en cuadrícula',
  topic: 'Programación dinámica',
  npc: { id: 'casiopea', name: 'CASIOPEA', title: 'Cartógrafa de baldosas', sprite: 'npc53', x: 12, y: 8 },
  greeting: 'Cada baldosa recuerda cuántos caminos pasaron por ella.',
  intro: [
    { speaker: 'CASIOPEA', text: 'Hola, viajero. Soy Casiopea y dibujo los mapas de cada sala de la torre.' },
    { speaker: 'CASIOPEA', text: 'Los aprendices cruzan las salas desde la esquina de arriba a la izquierda hasta la de abajo a la derecha.' },
    { speaker: 'CASIOPEA', text: 'Solo avanzan hacia la derecha o hacia abajo, y esquivan las estanterías caídas.' },
    { speaker: 'CASIOPEA', text: 'Quiero saber cuántos caminos distintos hay. Es la escalera de Tobías, pero en dos dimensiones. ¿Lo vemos?' },
  ],
  lesson: {
    concept: 'DP EN CUADRÍCULA',
    goals: ['Definir dp[i][j] sobre una cuadrícula', 'Sumar lo que llega desde arriba y desde la izquierda', 'Recorrer la tabla fila por fila'],
    explanation:
      'Si solo te mueves a la derecha o hacia abajo, a la casilla (i, j) se llega desde (i-1, j) o desde (i, j-1). ' +
      'Así que dp[i][j] = dp[i-1][j] + dp[i][j-1], con dp[0][0] = 1. ' +
      'Una casilla bloqueada tiene dp = 0: ningún camino pasa por ella. ' +
      'Recorre por filas, de izquierda a derecha, y cada valor que necesitas ya estará listo.',
    code: {
      python: code`
        r, c = map(int, input().split())
        dp = [[0] * c for _ in range(r)]
        for i in range(r):
            for j in range(c):
                if i == 0 and j == 0:
                    dp[i][j] = 1
                else:
                    arriba = dp[i - 1][j] if i > 0 else 0
                    izq = dp[i][j - 1] if j > 0 else 0
                    dp[i][j] = arriba + izq
        print(dp[r - 1][c - 1])
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            int r, c;
            cin >> r >> c;
            vector<vector<long long>> dp(r, vector<long long>(c, 0));
            for (int i = 0; i < r; i++) {
                for (int j = 0; j < c; j++) {
                    if (i == 0 && j == 0) {
                        dp[i][j] = 1;
                    } else {
                        long long arriba = i > 0 ? dp[i - 1][j] : 0;
                        long long izq = j > 0 ? dp[i][j - 1] : 0;
                        dp[i][j] = arriba + izq;
                    }
                }
            }
            cout << dp[r - 1][c - 1] << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int r = sc.nextInt();
                int c = sc.nextInt();
                long[][] dp = new long[r][c];
                for (int i = 0; i < r; i++) {
                    for (int j = 0; j < c; j++) {
                        if (i == 0 && j == 0) {
                            dp[i][j] = 1;
                        } else {
                            long arriba = i > 0 ? dp[i - 1][j] : 0;
                            long izq = j > 0 ? dp[i][j - 1] : 0;
                            dp[i][j] = arriba + izq;
                        }
                    }
                }
                System.out.println(dp[r - 1][c - 1]);
            }
        }
      `,
    },
    examples: [
      { input: '2 2', output: '2' },
      { input: '3 3', output: '6' },
      { input: '3 7', output: '28' },
    ],
    tips: {
      python: 'Lee la sala con sys.stdin.buffer: cada fila llega como bytes y row[j] es un número (35 es "#"). Con una sola lista dp por fila te ahorras memoria.',
      cpp: 'Basta con un vector de una fila: dp[j] ya guarda lo de arriba y dp[j - 1] lo de la izquierda. Suma con % MOD.',
      java: 'Lee cada fila con br.readLine() y usa charAt(j). Un solo long[] de largo C basta: dp[j] es lo de arriba, dp[j - 1] lo de la izquierda.',
    },
    quiz: {
      question: 'La sala es de 3×3 y la esquina de abajo a la izquierda está bloqueada. ¿Cuántos caminos hay?',
      code: {
        python: code`
          sala = ["...", "...", "#.."]
          dp = [[0] * 3 for _ in range(3)]
          for i in range(3):
              for j in range(3):
                  if sala[i][j] == "#":
                      dp[i][j] = 0
                  elif i == 0 and j == 0:
                      dp[i][j] = 1
                  else:
                      arriba = dp[i - 1][j] if i > 0 else 0
                      izq = dp[i][j - 1] if j > 0 else 0
                      dp[i][j] = arriba + izq
          print(dp[2][2])
        `,
        cpp: code`
          #include <iostream>
          #include <string>
          using namespace std;

          int main() {
              string sala[3] = {"...", "...", "#.."};
              int dp[3][3] = {};
              for (int i = 0; i < 3; i++) {
                  for (int j = 0; j < 3; j++) {
                      if (sala[i][j] == '#') dp[i][j] = 0;
                      else if (i == 0 && j == 0) dp[i][j] = 1;
                      else dp[i][j] = (i > 0 ? dp[i - 1][j] : 0) + (j > 0 ? dp[i][j - 1] : 0);
                  }
              }
              cout << dp[2][2] << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  String[] sala = {"...", "...", "#.."};
                  int[][] dp = new int[3][3];
                  for (int i = 0; i < 3; i++) {
                      for (int j = 0; j < 3; j++) {
                          if (sala[i].charAt(j) == '#') dp[i][j] = 0;
                          else if (i == 0 && j == 0) dp[i][j] = 1;
                          else dp[i][j] = (i > 0 ? dp[i - 1][j] : 0) + (j > 0 ? dp[i][j - 1] : 0);
                      }
                  }
                  System.out.println(dp[2][2]);
              }
          }
        `,
      },
      options: ['6', '5', '4'],
      answer: 1,
      explanation: 'Sin bloqueos serían 6 caminos. Solo uno pasa por la esquina bloqueada (abajo, abajo, derecha, derecha), así que quedan 5.',
      wrongHint: 'Llena la tabla de 3×3 a mano. La casilla bloqueada vale 0 y cada otra suma la de arriba y la de la izquierda.',
    },
  },
  problem: {
    id: 'p53-baldosas-de-casiopea',
    title: 'LAS BALDOSAS DE CASIOPEA',
    statement:
      'Una sala de la torre es una cuadrícula de R filas y C columnas. "." es una baldosa libre y "#" una estantería caída. ' +
      'Un aprendiz entra por la esquina de arriba a la izquierda y sale por la de abajo a la derecha, moviéndose solo hacia la derecha o hacia abajo y pisando solo baldosas libres. ' +
      '¿Cuántos caminos distintos hay? Imprime el resultado módulo 1 000 000 007 (0 si no hay ninguno).',
    inputSpec: 'Línea 1: R y C. Luego R líneas de C caracteres cada una ("." o "#").',
    outputSpec: 'Un número: la cantidad de caminos módulo 1 000 000 007.',
    constraints: '1 ≤ R, C ≤ 1000 · la entrada y la salida pueden estar bloqueadas (entonces la respuesta es 0).',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      baldosas(['...', '.#.', '...']),
      baldosas(['....', '.#..', '...#', '#...']),
      baldosas(['#..', '...']),
      baldosas(['.']),
      baldosas(libre(1, 1000)),
      baldosas(libre(1000, 1000)),
      baldosas(sala(1000, 1000, 5353, 100)),
      baldosas(pasillo),
      baldosas(cerrada),
      baldosas(sala(700, 1000, 3535, 30)),
    ]),
    starter: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        r, c = int(data[0]), int(data[1])
        sala = data[2:2 + r]
        MOD = 1000000007
        dp = [0] * c
        dp[0] = 1
        for fila in sala:
            # TODO: recorre j de 0 a c - 1. Si fila[j] es "#" (35), dp[j] = 0;
            # si no, dp[j] = (dp[j] + dp[j - 1]) % MOD (lo de arriba + lo de la izquierda)
            pass
        print(dp[c - 1])
      `,
      cpp: code`
        #include <iostream>
        #include <string>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            const long long MOD = 1000000007;
            int r, c;
            cin >> r >> c;
            vector<long long> dp(c, 0);
            dp[0] = 1;
            for (int i = 0; i < r; i++) {
                string fila;
                cin >> fila;
                // TODO: recorre j de 0 a c - 1. Si fila[j] es '#', dp[j] = 0;
                // si no, dp[j] = (dp[j] + dp[j - 1]) % MOD (lo de arriba + lo de la izquierda)
            }
            cout << dp[c - 1] << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int r = Integer.parseInt(st.nextToken());
                int c = Integer.parseInt(st.nextToken());
                final long MOD = 1000000007L;
                long[] dp = new long[c];
                dp[0] = 1;
                for (int i = 0; i < r; i++) {
                    String fila = br.readLine().trim();
                    // TODO: recorre j de 0 a c - 1. Si fila.charAt(j) es '#', dp[j] = 0;
                    // si no, dp[j] = (dp[j] + dp[j - 1]) % MOD (lo de arriba + lo de la izquierda)
                }
                System.out.println(dp[c - 1]);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        r, c = int(data[0]), int(data[1])
        sala = data[2:2 + r]
        MOD = 1000000007
        dp = [0] * c
        dp[0] = 1
        for fila in sala:
            izq = 0
            for j in range(c):
                if fila[j] == 35:
                    izq = 0
                else:
                    izq += dp[j]
                    if izq >= MOD:
                        izq -= MOD
                dp[j] = izq
        print(dp[c - 1])
      `,
      cpp: code`
        #include <iostream>
        #include <string>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            const long long MOD = 1000000007;
            int r, c;
            cin >> r >> c;
            vector<long long> dp(c, 0);
            dp[0] = 1;
            for (int i = 0; i < r; i++) {
                string fila;
                cin >> fila;
                for (int j = 0; j < c; j++) {
                    if (fila[j] == '#') dp[j] = 0;
                    else if (j > 0) dp[j] = (dp[j] + dp[j - 1]) % MOD;
                }
            }
            cout << dp[c - 1] << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int r = Integer.parseInt(st.nextToken());
                int c = Integer.parseInt(st.nextToken());
                final long MOD = 1000000007L;
                long[] dp = new long[c];
                dp[0] = 1;
                for (int i = 0; i < r; i++) {
                    String fila = br.readLine().trim();
                    for (int j = 0; j < c; j++) {
                        if (fila.charAt(j) == '#') dp[j] = 0;
                        else if (j > 0) dp[j] = (dp[j] + dp[j - 1]) % MOD;
                    }
                }
                System.out.println(dp[c - 1]);
            }
        }
      `,
    },
    hints: [
      'A la baldosa (i, j) solo se llega desde la de arriba o desde la de la izquierda. Los caminos que llegan a ella son la suma de los que llegan a esas dos.',
      'Una estantería tiene 0 caminos. La esquina de entrada tiene 1 (si está libre). Recorre fila por fila, de izquierda a derecha.',
      'Con una sola fila dp de largo C: empieza con dp[0] = 1. En cada fila, para j de 0 a C - 1: si es "#", dp[j] = 0; si no, dp[j] = (dp[j] + dp[j-1]) % MOD (con j > 0). La respuesta es dp[C-1].',
    ],
  },
  outro: [
    { speaker: 'CASIOPEA', text: 'Un millón de baldosas y cada una sabe cuántos caminos la cruzan. Mi mapa está completo.' },
    { speaker: 'CASIOPEA', text: 'Fíjate en que te bastó una sola fila de memoria: solo necesitabas la de arriba.' },
    { speaker: 'CASIOPEA', text: 'Baltasar, el alquimista, está a mi izquierda. Tiene más ingredientes que espacio en su mochila.' },
  ],
  rewardTip: {
    title: 'DP en cuadrícula',
    text: {
      python: 'dp[i][j] = arriba + izquierda; bloqueada = 0. Con una lista de largo C recorrida fila por fila basta.',
      cpp: 'dp[i][j] = dp[i-1][j] + dp[i][j-1]; bloqueada = 0. Un vector de una fila basta: dp[j] += dp[j-1].',
      java: 'dp[i][j] = dp[i-1][j] + dp[i][j-1]; bloqueada = 0. Un long[] de una fila basta: dp[j] += dp[j-1].',
    },
  },
};
