import type { Level } from '@algoria/shared';
import { code, tests } from './_util';

const cuentas = (a: bigint, b: bigint): [string, string] => [
  `${a} ${b}`,
  [a + b, a - b, a * b, a / b, a % b].join('\n'),
];

export const nivel04: Level = {
  number: 4,
  id: 'n04-operadores',
  title: 'Operadores',
  topic: 'Operadores',
  npc: { id: 'tomas', name: 'TOMÁS', title: 'Maestro de las cuentas', sprite: 'tomas', x: 7, y: 4 },
  greeting: '¿Cuántas manzanas tocan por canasta? Yo lo sé.',
  intro: [
    { speaker: 'TOMÁS', text: '¡Buenas! Soy Tomás, el que reparte las cosechas del pueblo.' },
    { speaker: 'TOMÁS', text: 'Sumar, restar y multiplicar es fácil. Repartir es lo interesante.' },
    { speaker: 'TOMÁS', text: 'Al repartir enteros importan dos cosas: cuánto le toca a cada uno y cuánto sobra.' },
    { speaker: 'TOMÁS', text: '¿Te explico los operadores o hacemos las cuentas en un duelo?' },
  ],
  lesson: {
    concept: 'OPERADORES ARITMÉTICOS',
    goals: ['Usar + - * con enteros', 'Dividir sin decimales (división entera)', 'Obtener el resto con %'],
    explanation:
      'Con + - * haces las cuentas de siempre. ' +
      'La división entera da cuántas veces cabe un número en otro, sin decimales; el módulo % da lo que sobra. ' +
      'Si 17 manzanas van en canastas de 5: caben 3 canastas llenas y sobran 2.',
    code: {
      python: code`
        a, b = map(int, input().split())
        print(a // b)
        print(a % b)
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        int main() {
            int a, b;
            cin >> a >> b;
            cout << a / b << "\n";
            cout << a % b << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int a = sc.nextInt();
                int b = sc.nextInt();
                System.out.println(a / b);
                System.out.println(a % b);
            }
        }
      `,
    },
    examples: [
      { input: '17 5', output: '3\n2' },
      { input: '20 4', output: '5\n0' },
      { input: '3 10', output: '0\n3' },
    ],
    tips: {
      python: 'En Python / siempre da decimal (7 / 2 = 3.5). Para la división entera usa //.',
      cpp: 'Un int llega hasta unos 2·10⁹. Si una cuenta puede pasar de ahí, usa long long.',
      java: 'Un int llega hasta unos 2·10⁹. Si una cuenta puede pasar de ahí, usa long y nextLong().',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          print(7 // 2 + 7 % 2)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              cout << 7 / 2 + 7 % 2 << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  System.out.println(7 / 2 + 7 % 2);
              }
          }
        `,
      },
      options: ['3', '4', '4.5'],
      answer: 1,
      explanation: '7 entre 2 cabe 3 veces (división entera) y sobra 1 (módulo). 3 + 1 = 4.',
      wrongHint: 'Calcula por separado: ¿cuántas veces cabe 2 en 7, sin decimales? ¿Y cuánto sobra?',
    },
  },
  problem: {
    id: 'p04-cuentas-de-tomas',
    title: 'LAS CUENTAS DE TOMÁS',
    statement:
      'Tomás anota cada cosecha en su cuaderno. Dados dos enteros A y B, imprime en este orden: ' +
      'A + B, A - B, A × B, la división entera de A entre B y el resto de esa división.',
    inputSpec: 'Una línea con dos enteros A y B.',
    outputSpec: 'Cinco líneas: la suma, la resta, el producto, la división entera y el resto.',
    constraints: '0 ≤ A ≤ 10⁹ · 1 ≤ B ≤ 10⁹ · El producto puede llegar a 10¹⁸.',
    difficulty: 'facil',
    xp: 100,
    timeLimitMs: 1000,
    tests: tests([
      cuentas(17n, 5n),
      cuentas(20n, 4n),
      cuentas(0n, 7n),
      cuentas(3n, 10n),
      cuentas(1n, 1n),
      cuentas(1000000000n, 1000000000n),
      cuentas(999999999n, 2n),
      cuentas(123456789n, 1000n),
    ]),
    starter: {
      python: code`
        a, b = map(int, input().split())
        # TODO: imprime suma, resta, producto, división entera y resto (una por línea)
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        int main() {
            long long a, b;
            cin >> a >> b;
            // TODO: imprime suma, resta, producto, división entera y resto (una por línea)
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                long a = sc.nextLong();
                long b = sc.nextLong();
                // TODO: imprime suma, resta, producto, división entera y resto (una por línea)
            }
        }
      `,
    },
    solution: {
      python: code`
        a, b = map(int, input().split())
        print(a + b)
        print(a - b)
        print(a * b)
        print(a // b)
        print(a % b)
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        int main() {
            long long a, b;
            cin >> a >> b;
            cout << a + b << "\n";
            cout << a - b << "\n";
            cout << a * b << "\n";
            cout << a / b << "\n";
            cout << a % b << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                long a = sc.nextLong();
                long b = sc.nextLong();
                System.out.println(a + b);
                System.out.println(a - b);
                System.out.println(a * b);
                System.out.println(a / b);
                System.out.println(a % b);
            }
        }
      `,
    },
    hints: [
      'Son cinco cuentas, una por línea, en el orden del enunciado.',
      'La resta puede salir negativa, y eso está bien. El producto puede ser enorme.',
      'Usa división entera (// en Python, / entre enteros en C++ y Java) y % para el resto. En C++ y Java guarda los números en long long / long.',
    ],
  },
  outro: [
    { speaker: 'TOMÁS', text: '¡Cuentas exactas, hasta el último resto! Así da gusto repartir.' },
    { speaker: 'TOMÁS', text: 'Con el % en tu bolsillo, Lía te espera en la bifurcación para enseñarte a decidir.' },
  ],
  rewardTip: {
    title: 'División entera y resto',
    text: {
      python: 'a // b da la división entera y a % b el resto. a / b siempre da decimal.',
      cpp: 'Entre enteros, a / b ya es división entera y a % b el resto. Usa long long si los números crecen.',
      java: 'Entre enteros, a / b ya es división entera y a % b el resto. Usa long si los números crecen.',
    },
  },
};
