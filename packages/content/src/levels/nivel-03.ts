import type { Level } from '@algoria/shared';
import { code, tests } from './_util';

const eco = (a: number, b: number): [string, string] => [`${a} ${b}`, `${b} ${a}`];

export const nivel03: Level = {
  number: 3,
  id: 'n03-leer-entrada',
  title: 'Leer la entrada',
  topic: 'Entrada',
  npc: { id: 'iris', name: 'IRIS', title: 'Escucha del pueblo', sprite: 'iris', x: 11, y: 4 },
  greeting: 'Shh... estoy escuchando lo que llega por la entrada.',
  intro: [
    { speaker: 'IRIS', text: 'Hola, soy Iris. Me paso el día escuchando lo que la gente me cuenta.' },
    { speaker: 'IRIS', text: 'En los duelos de código, los datos no están escritos en el programa: llegan por la entrada.' },
    { speaker: 'IRIS', text: 'Tu programa debe leerlos, guardarlos en variables y luego usarlos.' },
    { speaker: 'IRIS', text: '¿Quieres que te enseñe a escuchar, o prefieres demostrarlo en un duelo?' },
  ],
  lesson: {
    concept: 'LEER LA ENTRADA',
    goals: ['Leer datos desde la entrada estándar', 'Leer dos valores de una misma línea', 'Convertir texto en número'],
    explanation:
      'La entrada estándar es el texto que recibe tu programa al ejecutarse. ' +
      'Lo lees y lo guardas en variables, igual que hacía Sofi. ' +
      'Cuidado: lo que llega es texto; si quieres un número, hay que convertirlo o leerlo como número.',
    code: {
      python: code`
        nombre, edad = input().split()
        edad = int(edad)
        print(nombre)
        print(edad)
      `,
      cpp: code`
        #include <iostream>
        #include <string>
        using namespace std;

        int main() {
            string nombre;
            int edad;
            cin >> nombre >> edad;
            cout << nombre << "\n";
            cout << edad << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                String nombre = sc.next();
                int edad = sc.nextInt();
                System.out.println(nombre);
                System.out.println(edad);
            }
        }
      `,
    },
    examples: [
      { input: 'Iris 14', output: 'Iris\n14' },
      { input: 'Leo 9', output: 'Leo\n9' },
    ],
    tips: {
      python: 'input() lee una línea entera como texto. .split() la corta por los espacios.',
      cpp: 'cin >> salta espacios y saltos de línea solito: da igual si los datos vienen en una o varias líneas.',
      java: 'Scanner lee palabra por palabra: next() para texto, nextInt() para enteros.',
    },
    quiz: {
      question: 'a y b guardan texto, no números. ¿Qué imprime?',
      code: {
        python: code`
          a = "4"
          b = "9"
          print(a + b)
        `,
        cpp: code`
          #include <iostream>
          #include <string>
          using namespace std;

          int main() {
              string a = "4";
              string b = "9";
              cout << a + b << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  String a = "4";
                  String b = "9";
                  System.out.println(a + b);
              }
          }
        `,
      },
      options: ['13', '49', 'error'],
      answer: 1,
      explanation: 'Con texto, + pega uno detrás del otro: "4" y "9" forman "49". Por eso convertimos a número al leer.',
      wrongHint: 'Piensa en qué hace + cuando los dos lados son texto y no números.',
    },
  },
  problem: {
    id: 'p03-eco-de-iris',
    title: 'EL ECO DE IRIS',
    statement:
      'Iris vive junto a un eco muy raro: cuando le dices dos números, te los devuelve al revés. ' +
      'Lee dos enteros A y B e imprime B y luego A, separados por un espacio.',
    inputSpec: 'Una línea con dos enteros A y B separados por un espacio.',
    outputSpec: 'Una línea con B y A separados por un espacio.',
    constraints: '-10⁹ ≤ A, B ≤ 10⁹',
    difficulty: 'facil',
    xp: 100,
    timeLimitMs: 1000,
    tests: tests([
      eco(3, 7),
      eco(10, 20),
      eco(0, 0),
      eco(-5, 8),
      eco(1000000000, -1000000000),
      eco(42, 42),
      eco(-1, -2),
      eco(123456789, 987654321),
    ]),
    starter: {
      python: code`
        a, b = input().split()
        # TODO: imprime b y luego a, separados por un espacio
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        int main() {
            int a, b;
            cin >> a >> b;
            // TODO: imprime b y luego a, separados por un espacio
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
                // TODO: imprime b y luego a, separados por un espacio
            }
        }
      `,
    },
    solution: {
      python: code`
        a, b = input().split()
        print(b, a)
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        int main() {
            int a, b;
            cin >> a >> b;
            cout << b << " " << a << "\n";
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
                System.out.println(b + " " + a);
            }
        }
      `,
    },
    hints: [
      'Los dos números ya están guardados en a y b. Solo cambia el orden al imprimir.',
      'Entre los dos valores va exactamente un espacio, y nada más en la línea.',
      'Imprime b, un espacio y a, todo en la misma línea.',
    ],
  },
  outro: [
    { speaker: 'IRIS', text: '¡El eco te respondió perfecto! Ya sabes escuchar la entrada.' },
    { speaker: 'IRIS', text: 'Con los números en la mano, Tomás te enseñará a hacer cuentas con ellos.' },
  ],
  rewardTip: {
    title: 'Leer datos',
    text: {
      python: 'a, b = map(int, input().split()) lee dos enteros de una misma línea.',
      cpp: 'cin >> a >> b; lee dos valores, estén en la misma línea o en líneas distintas.',
      java: 'Scanner sc = new Scanner(System.in); int a = sc.nextInt(); (import java.util.Scanner).',
    },
  },
};
