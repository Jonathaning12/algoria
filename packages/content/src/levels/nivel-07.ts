import type { Level } from '@algoria/shared';
import { code, tests } from './_util';

const tabla = (n: bigint): [string, string] => [
  `${n}`,
  Array.from({ length: 10 }, (_, k) => `${n} x ${k + 1} = ${n * BigInt(k + 1)}`).join('\n'),
];

export const nivel07: Level = {
  number: 7,
  id: 'n07-bucle-for',
  title: 'Bucle for',
  topic: 'Bucle for',
  npc: { id: 'nora', name: 'NORA', title: 'Tejedora de vueltas', sprite: 'nora', x: 7, y: 6 },
  greeting: 'Diez puntadas, ni una más. Así se teje un for.',
  intro: [
    { speaker: 'NORA', text: 'Hola, soy Nora. Tejo bufandas para todo el pueblo.' },
    { speaker: 'NORA', text: 'Antes de empezar, siempre sé cuántas puntadas voy a dar.' },
    { speaker: 'NORA', text: 'Cuando sabes cuántas veces repetir algo, el bucle for es tu mejor aguja.' },
    { speaker: 'NORA', text: '¿Te muestro cómo se teje, o probamos tus manos en un duelo?' },
  ],
  lesson: {
    concept: 'BUCLE FOR',
    goals: ['Repetir un bloque un número fijo de veces', 'Usar el contador del bucle', 'Acumular un resultado'],
    explanation:
      'Un for repite un bloque mientras un contador recorre un rango de valores, por ejemplo de 1 a N. ' +
      'En cada vuelta puedes usar el contador como una variable más. ' +
      'Es como un while que ya trae el contador, la condición y el paso en una sola línea.',
    code: {
      python: code`
        n = int(input())
        total = 0
        for i in range(1, n + 1):
            total += i
        print(total)
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        int main() {
            int n;
            cin >> n;
            int total = 0;
            for (int i = 1; i <= n; i++) {
                total += i;
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
                int total = 0;
                for (int i = 1; i <= n; i++) {
                    total += i;
                }
                System.out.println(total);
            }
        }
      `,
    },
    examples: [
      { input: '4', output: '10' },
      { input: '1', output: '1' },
      { input: '10', output: '55' },
    ],
    tips: {
      python: 'range(a, b) llega hasta b - 1. Para incluir n escribe range(1, n + 1).',
      cpp: 'for (int i = 1; i <= n; i++): inicio, condición y paso, separados por punto y coma.',
      java: 'for (int i = 1; i <= n; i++): inicio, condición y paso, separados por punto y coma.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          for i in range(3):
              print(i)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              for (int i = 0; i < 3; i++) {
                  cout << i << "\n";
              }
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  for (int i = 0; i < 3; i++) {
                      System.out.println(i);
                  }
              }
          }
        `,
      },
      options: ['0\n1\n2', '1\n2\n3', '0\n1\n2\n3'],
      answer: 0,
      explanation: 'El contador empieza en 0 y se detiene antes de llegar a 3: son tres vueltas con 0, 1 y 2.',
      wrongHint: '¿En qué número empieza el contador? ¿El último valor del rango se incluye o no?',
    },
  },
  problem: {
    id: 'p07-tabla-de-nora',
    title: 'LA TABLA DE NORA',
    statement:
      'Nora borda tablas de multiplicar en sus bufandas. Dado un entero N, imprime su tabla del 1 al 10, ' +
      'una línea por cada multiplicación, con el formato "N x i = resultado".',
    inputSpec: 'Una línea con el entero N.',
    outputSpec: '10 líneas. La línea i (de 1 a 10) es: N x i = N·i, con un espacio a cada lado de "x" y de "=".',
    constraints: '-10⁹ ≤ N ≤ 10⁹ · Los resultados pueden llegar a 10¹⁰.',
    difficulty: 'facil',
    xp: 100,
    timeLimitMs: 1000,
    tests: tests([
      tabla(3n),
      tabla(7n),
      tabla(0n),
      tabla(1n),
      tabla(-4n),
      tabla(12n),
      tabla(1000000000n),
      tabla(-1000000000n),
    ]),
    starter: {
      python: code`
        n = int(input())
        # TODO: para i de 1 a 10, imprime "n x i = resultado"
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        int main() {
            long long n;
            cin >> n;
            // TODO: para i de 1 a 10, imprime "n x i = resultado"
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                long n = sc.nextLong();
                // TODO: para i de 1 a 10, imprime "n x i = resultado"
            }
        }
      `,
    },
    solution: {
      python: code`
        n = int(input())
        for i in range(1, 11):
            print(n, "x", i, "=", n * i)
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        int main() {
            long long n;
            cin >> n;
            for (int i = 1; i <= 10; i++) {
                cout << n << " x " << i << " = " << n * i << "\n";
            }
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                long n = sc.nextLong();
                for (int i = 1; i <= 10; i++) {
                    System.out.println(n + " x " + i + " = " + (n * i));
                }
            }
        }
      `,
    },
    hints: [
      'Siempre son exactamente 10 líneas: el bucle da 10 vueltas.',
      'Usa el contador del for como el número por el que multiplicas, de 1 a 10.',
      'Cuida los espacios: "3 x 2 = 6". Con N = 10⁹ el resultado no cabe en int: usa long long / long.',
    ],
  },
  outro: [
    { speaker: 'NORA', text: '¡Diez puntadas perfectas! Esta bufanda va directo a mi vitrina.' },
    { speaker: 'NORA', text: 'Bruno, el del almacén, guarda montones de cosas en fila. Él te enseñará las listas.' },
  ],
  rewardTip: {
    title: 'For de 1 a N',
    text: {
      python: 'for i in range(1, n + 1): recorre 1, 2, ..., n.',
      cpp: 'for (int i = 1; i <= n; i++) { ... } recorre 1, 2, ..., n.',
      java: 'for (int i = 1; i <= n; i++) { ... } recorre 1, 2, ..., n.',
    },
  },
};
