import type { Level } from '@algoria/shared';
import { code, tests } from './_util';

const digitos = (n: string): [string, string] => [n, String([...n].reduce((s, d) => s + Number(d), 0))];

export const nivel06: Level = {
  number: 6,
  id: 'n06-bucle-while',
  title: 'Bucle while',
  topic: 'Bucle while',
  npc: { id: 'max', name: 'MAX', title: 'Corredor incansable', sprite: 'max', x: 3, y: 6 },
  greeting: '¡Otra vuelta! ¡Y otra! ¿Cuándo paro? Cuando la condición falle.',
  intro: [
    { speaker: 'MAX', text: '¡Hey! Soy Max. Corro vueltas alrededor del pueblo todo el día.' },
    { speaker: 'MAX', text: 'Mi regla es simple: mientras me queden fuerzas, doy otra vuelta.' },
    { speaker: 'MAX', text: 'Eso es un bucle while: repite un bloque mientras la condición sea verdadera.' },
    { speaker: 'MAX', text: '¿Calentamos con una lección o corremos directo al duelo?' },
  ],
  lesson: {
    concept: 'BUCLE WHILE',
    goals: ['Repetir mientras se cumpla una condición', 'Cambiar la variable dentro del bucle', 'Evitar bucles infinitos'],
    explanation:
      'while revisa una condición; si es verdadera, ejecuta el bloque y vuelve a revisar. ' +
      'Cuando la condición se vuelve falsa, el programa sigue después del bucle. ' +
      'Dentro del bloque algo debe cambiar para que algún día se detenga, o correrá para siempre.',
    code: {
      python: code`
        n = int(input())
        while n > 0:
            print(n)
            n = n - 1
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        int main() {
            int n;
            cin >> n;
            while (n > 0) {
                cout << n << "\n";
                n = n - 1;
            }
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                while (n > 0) {
                    System.out.println(n);
                    n = n - 1;
                }
            }
        }
      `,
    },
    examples: [
      { input: '3', output: '3\n2\n1' },
      { input: '1', output: '1' },
      { input: '0', output: '' },
    ],
    tips: {
      python: 'n -= 1 es lo mismo que n = n - 1, pero más corto.',
      cpp: 'n-- resta 1 a n. También existen n += 5, n /= 10, etc.',
      java: 'n-- resta 1 a n. También existen n += 5, n /= 10, etc.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          n = 10
          c = 0
          while n > 1:
              n = n // 2
              c = c + 1
          print(c)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              int n = 10;
              int c = 0;
              while (n > 1) {
                  n = n / 2;
                  c = c + 1;
              }
              cout << c << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  int n = 10;
                  int c = 0;
                  while (n > 1) {
                      n = n / 2;
                      c = c + 1;
                  }
                  System.out.println(c);
              }
          }
        `,
      },
      options: ['3', '4', '5'],
      answer: 0,
      explanation: 'n pasa por 10, 5, 2 y 1. Son tres divisiones; con n = 1 la condición falla y el bucle termina.',
      wrongHint: 'Anota en un papel el valor de n tras cada vuelta, recordando que la división es entera.',
    },
  },
  problem: {
    id: 'p06-suma-de-digitos',
    title: 'LOS PASOS DE MAX',
    statement:
      'Max apunta en su reloj los pasos que dio hoy: un número N. ' +
      'Para su diario solo quiere la suma de los dígitos de N. Por ejemplo, para 123 la suma es 1 + 2 + 3 = 6.',
    inputSpec: 'Una línea con el entero N.',
    outputSpec: 'Un entero: la suma de los dígitos de N.',
    constraints: '0 ≤ N ≤ 10¹⁸',
    difficulty: 'facil',
    xp: 100,
    timeLimitMs: 1000,
    tests: tests([
      digitos('123'),
      digitos('9'),
      digitos('0'),
      digitos('10'),
      digitos('987654321'),
      digitos('1000000000000000000'),
      digitos('999999999999999999'),
      digitos('5050'),
    ]),
    starter: {
      python: code`
        n = int(input())
        suma = 0
        # TODO: mientras n > 0, suma su último dígito y quítaselo
        print(suma)
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        int main() {
            long long n;
            cin >> n;
            long long suma = 0;
            // TODO: mientras n > 0, suma su último dígito y quítaselo
            cout << suma << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                long n = sc.nextLong();
                long suma = 0;
                // TODO: mientras n > 0, suma su último dígito y quítaselo
                System.out.println(suma);
            }
        }
      `,
    },
    solution: {
      python: code`
        n = int(input())
        suma = 0
        while n > 0:
            suma += n % 10
            n //= 10
        print(suma)
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        int main() {
            long long n;
            cin >> n;
            long long suma = 0;
            while (n > 0) {
                suma += n % 10;
                n /= 10;
            }
            cout << suma << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                long n = sc.nextLong();
                long suma = 0;
                while (n > 0) {
                    suma += n % 10;
                    n /= 10;
                }
                System.out.println(suma);
            }
        }
      `,
    },
    hints: [
      'Repite un mismo paso mientras al número le queden dígitos.',
      'n % 10 te da el último dígito y la división entera n / 10 se lo quita (123 → 12).',
      'while n > 0: suma += n % 10 y luego n = n // 10 (en C++/Java, n /= 10). N puede ser enorme: usa long long / long.',
    ],
  },
  outro: [
    { speaker: 'MAX', text: '¡Uf, qué ritmo! Ni una vuelta de más ni una de menos.' },
    { speaker: 'MAX', text: 'Si ya sabes cuántas vueltas dar, Nora tiene un bucle aún más cómodo: el for.' },
  ],
  rewardTip: {
    title: 'Recorrer dígitos',
    text: {
      python: 'while n > 0: d = n % 10; n //= 10. Así sacas los dígitos de derecha a izquierda.',
      cpp: 'while (n > 0) { d = n % 10; n /= 10; } Usa long long para números de hasta 10¹⁸.',
      java: 'while (n > 0) { d = n % 10; n /= 10; } Usa long para números de hasta 10¹⁸.',
    },
  },
};
