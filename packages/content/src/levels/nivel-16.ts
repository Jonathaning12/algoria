import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const huerto = (m: number[][]): [string, string] => {
  const r = m.length;
  const c = m[0]!.length;
  const filas = m.map((fila) => fila.reduce((s, x) => s + x, 0));
  const cols = Array.from({ length: c }, (_, j) => m.reduce((s, fila) => s + fila[j]!, 0));
  return [`${r} ${c}\n${m.map((fila) => fila.join(' ')).join('\n')}`, `${filas.join(' ')}\n${cols.join(' ')}`];
};

const matriz = (seed: number, r: number, c: number, max: number) => {
  const g = rng(seed);
  return Array.from({ length: r }, () => Array.from({ length: c }, () => g(0, max)));
};
const llena = Array.from({ length: 500 }, () => Array.from({ length: 500 }, () => 1000000));

export const nivel16: Level = {
  number: 16,
  id: 'n16-matrices',
  title: 'Matrices 2D',
  topic: 'Matrices',
  npc: { id: 'tito', name: 'TITO', title: 'Jardinero de parcelas', sprite: 'tito', x: 4, y: 8 },
  greeting: 'Fila por fila, columna por columna. Así crece un buen huerto.',
  intro: [
    { speaker: 'TITO', text: '¡Buenas! Soy Tito y cuido el huerto del bosque.' },
    { speaker: 'TITO', text: 'Mis parcelas no están en una sola fila: forman una cuadrícula, con filas y columnas.' },
    { speaker: 'TITO', text: 'En programación eso es una matriz: un arreglo de arreglos. Para llegar a una parcela necesitas dos números.' },
    { speaker: 'TITO', text: '¿Te enseño a moverte por el huerto o pasamos al duelo?' },
  ],
  lesson: {
    concept: 'MATRICES 2D',
    goals: ['Leer una matriz de R filas y C columnas', 'Acceder a m[i][j]: fila i, columna j', 'Recorrerla con dos bucles'],
    explanation:
      'Una matriz es una lista de filas, y cada fila es una lista. m[i][j] es el valor de la fila i y la columna j, ambas desde 0. ' +
      'Para recorrerla entera usas dos bucles: el de afuera va por las filas y el de adentro por las columnas. ' +
      'Si cambias el orden (columnas afuera), recorres el huerto de arriba abajo en vez de izquierda a derecha.',
    code: {
      python: code`
        import sys
        input = sys.stdin.readline

        r, c = map(int, input().split())
        m = []
        for i in range(r):
            m.append(list(map(int, input().split())))
        for i in range(r):
            suma = 0
            for j in range(c):
                suma += m[i][j]
            print(suma)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            int r, c;
            cin >> r >> c;
            vector<vector<int>> m(r, vector<int>(c));
            for (int i = 0; i < r; i++)
                for (int j = 0; j < c; j++) cin >> m[i][j];
            for (int i = 0; i < r; i++) {
                int suma = 0;
                for (int j = 0; j < c; j++) suma += m[i][j];
                cout << suma << "\n";
            }
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
                int[][] m = new int[r][c];
                for (int i = 0; i < r; i++) {
                    st = new StringTokenizer(br.readLine());
                    for (int j = 0; j < c; j++) m[i][j] = Integer.parseInt(st.nextToken());
                }
                for (int i = 0; i < r; i++) {
                    int suma = 0;
                    for (int j = 0; j < c; j++) suma += m[i][j];
                    System.out.println(suma);
                }
            }
        }
      `,
    },
    examples: [
      { input: '2 3\n1 2 3\n4 5 6', output: '6\n15' },
      { input: '1 1\n7', output: '7' },
      { input: '3 2\n1 1\n0 5\n2 2', output: '2\n5\n4' },
    ],
    tips: {
      python: 'Cada fila se lee con list(map(int, input().split())) y se agrega con m.append(fila).',
      cpp: 'vector<vector<long long>> m(r, vector<long long>(c)); crea una matriz de r × c llena de ceros.',
      java: 'long[][] m = new long[r][c]; crea la matriz. Para cada fila, un nuevo StringTokenizer con br.readLine().',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          m = [[1, 2, 3],
               [4, 5, 6]]
          print(m[1][0])
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              int m[2][3] = {{1, 2, 3},
                             {4, 5, 6}};
              cout << m[1][0] << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  int[][] m = {{1, 2, 3},
                               {4, 5, 6}};
                  System.out.println(m[1][0]);
              }
          }
        `,
      },
      options: ['2', '4', '5'],
      answer: 1,
      explanation: 'El primer índice es la fila: m[1] es la segunda fila, [4, 5, 6]. El segundo es la columna: posición 0, el 4.',
      wrongHint: 'Primero la fila, luego la columna, y ambos empiezan en 0. ¿Cuál es la fila 1?',
    },
  },
  problem: {
    id: 'p16-huerto-de-tito',
    title: 'EL HUERTO DE TITO',
    statement:
      'El huerto de Tito tiene R filas y C columnas de parcelas, y en cada una cosechó cierta cantidad de frutos. ' +
      'Para planear la próxima siembra quiere el total de cada fila y el total de cada columna.',
    inputSpec: 'Línea 1: R y C. Luego R líneas, cada una con C enteros: los frutos de esa fila.',
    outputSpec:
      'Dos líneas. La primera, los R totales de las filas (de arriba abajo). La segunda, los C totales de las columnas (de izquierda a derecha). Separados por espacios.',
    constraints: '1 ≤ R, C ≤ 500 · 0 ≤ frutos ≤ 10⁶',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      huerto([[1, 2, 3], [4, 5, 6]]),
      huerto([[4], [0], [9]]),
      huerto([[7]]),
      huerto([[1, 0, 2, 0, 3, 0, 4]]),
      huerto(matriz(1616, 4, 4, 9)),
      huerto(matriz(6161, 37, 200, 1000000)),
      huerto(matriz(1661, 500, 500, 1000000)),
      huerto(llena),
    ]),
    starter: {
      python: code`
        import sys
        input = sys.stdin.readline

        r, c = map(int, input().split())
        m = []
        for i in range(r):
            m.append(list(map(int, input().split())))
        filas = [0] * r
        cols = [0] * c
        # TODO: recorre la matriz y suma m[i][j] en filas[i] y en cols[j]
        print(*filas)
        print(*cols)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int r, c;
            cin >> r >> c;
            vector<vector<long long>> m(r, vector<long long>(c));
            for (int i = 0; i < r; i++)
                for (int j = 0; j < c; j++) cin >> m[i][j];
            vector<long long> filas(r, 0), cols(c, 0);
            // TODO: recorre la matriz y suma m[i][j] en filas[i] y en cols[j]
            for (int i = 0; i < r; i++) cout << filas[i] << (i + 1 < r ? " " : "\n");
            for (int j = 0; j < c; j++) cout << cols[j] << (j + 1 < c ? " " : "\n");
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
                long[][] m = new long[r][c];
                for (int i = 0; i < r; i++) {
                    st = new StringTokenizer(br.readLine());
                    for (int j = 0; j < c; j++) m[i][j] = Long.parseLong(st.nextToken());
                }
                long[] filas = new long[r];
                long[] cols = new long[c];
                // TODO: recorre la matriz y suma m[i][j] en filas[i] y en cols[j]
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < r; i++) sb.append(filas[i]).append(i + 1 < r ? " " : "\n");
                for (int j = 0; j < c; j++) sb.append(cols[j]).append(j + 1 < c ? " " : "\n");
                System.out.print(sb);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        input = sys.stdin.readline

        r, c = map(int, input().split())
        m = []
        for i in range(r):
            m.append(list(map(int, input().split())))
        filas = [0] * r
        cols = [0] * c
        for i in range(r):
            for j in range(c):
                filas[i] += m[i][j]
                cols[j] += m[i][j]
        print(*filas)
        print(*cols)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int r, c;
            cin >> r >> c;
            vector<vector<long long>> m(r, vector<long long>(c));
            for (int i = 0; i < r; i++)
                for (int j = 0; j < c; j++) cin >> m[i][j];
            vector<long long> filas(r, 0), cols(c, 0);
            for (int i = 0; i < r; i++) {
                for (int j = 0; j < c; j++) {
                    filas[i] += m[i][j];
                    cols[j] += m[i][j];
                }
            }
            for (int i = 0; i < r; i++) cout << filas[i] << (i + 1 < r ? " " : "\n");
            for (int j = 0; j < c; j++) cout << cols[j] << (j + 1 < c ? " " : "\n");
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
                long[][] m = new long[r][c];
                for (int i = 0; i < r; i++) {
                    st = new StringTokenizer(br.readLine());
                    for (int j = 0; j < c; j++) m[i][j] = Long.parseLong(st.nextToken());
                }
                long[] filas = new long[r];
                long[] cols = new long[c];
                for (int i = 0; i < r; i++) {
                    for (int j = 0; j < c; j++) {
                        filas[i] += m[i][j];
                        cols[j] += m[i][j];
                    }
                }
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < r; i++) sb.append(filas[i]).append(i + 1 < r ? " " : "\n");
                for (int j = 0; j < c; j++) sb.append(cols[j]).append(j + 1 < c ? " " : "\n");
                System.out.print(sb);
            }
        }
      `,
    },
    hints: [
      'Necesitas dos listas de totales: una con R casillas (filas) y otra con C casillas (columnas), todas empezando en 0.',
      'Cada parcela m[i][j] pertenece a la fila i y a la columna j a la vez: súmala en los dos totales.',
      'Con dos bucles (i por filas, j por columnas): filas[i] += m[i][j] y cols[j] += m[i][j]. Imprime cada lista en su propia línea.',
    ],
  },
  outro: [
    { speaker: 'TITO', text: '¡Cosecha contada! Te mueves por filas y columnas como un jardinero de verdad.' },
    { speaker: 'TITO', text: 'Zoe, la cartógrafa, está en este mismo camino. Ella responde preguntas sobre el sendero en un parpadeo.' },
  ],
  rewardTip: {
    title: 'Matrices',
    text: {
      python: 'm[i][j]: fila i, columna j. print(*lista) imprime los valores separados por espacios.',
      cpp: 'vector<vector<long long>> m(r, vector<long long>(c)); m[i][j] es fila i, columna j.',
      java: 'long[][] m = new long[r][c]; m[i][j] es fila i, columna j. StringBuilder acelera la salida.',
    },
  },
};
