import type { Level } from '@algoria/shared';
import { code, tests } from './_util';

const parImpar = (n: number): [string, string] => [`${n}`, n % 2 === 0 ? 'PAR' : 'IMPAR'];

export const nivel05: Level = {
  number: 5,
  id: 'n05-condicionales',
  title: 'Condicionales',
  topic: 'Condicionales',
  npc: { id: 'lia', name: 'LÍA', title: 'Guardiana de las decisiones', sprite: 'lia', x: 3, y: 4 },
  greeting: 'Todo camino llega a una bifurcación. ¿Cuál eliges?',
  intro: [
    { speaker: 'LÍA', text: '¡Hola, viajero! Soy Lía. Por este camino todos llegan a una bifurcación.' },
    { speaker: 'LÍA', text: 'En programación pasa lo mismo: a veces tu código tiene que elegir qué hacer.' },
    { speaker: 'LÍA', text: 'Para eso existe if. Si algo es verdadero, haces una cosa. Si no (else), haces otra.' },
    { speaker: 'LÍA', text: 'Te propongo un trato: te lo enseño en 3 minutos y luego me ganas un duelo. ¿Hecho?' },
  ],
  lesson: {
    concept: 'IF / ELSE',
    goals: ['Comparar valores: >= == !=', 'Elegir un camino con if / else', 'Saber si un número es par con %'],
    explanation:
      'Piensa en if como una puerta: solo la cruzas si la condición es verdadera. ' +
      'Si es falsa y hay un else, el programa toma ese otro camino. ' +
      'Las condiciones se arman comparando valores: > < >= <= == (igual) y != (distinto).',
    code: {
      python: code`
        edad = int(input())

        if edad >= 18:
            print("Adulto")
        else:
            print("Menor")
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        int main() {
            int edad;
            cin >> edad;
            if (edad >= 18) {
                cout << "Adulto" << "\n";
            } else {
                cout << "Menor" << "\n";
            }
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int edad = sc.nextInt();
                if (edad >= 18) {
                    System.out.println("Adulto");
                } else {
                    System.out.println("Menor");
                }
            }
        }
      `,
    },
    examples: [
      { input: '20', output: 'Adulto' },
      { input: '15', output: 'Menor' },
      { input: '18', output: 'Adulto' },
    ],
    tips: {
      python: 'Los 4 espacios de sangría marcan qué está dentro del if. ¡No los olvides! Y no olvides los dos puntos.',
      cpp: 'Las llaves { } marcan el bloque. La condición siempre va entre paréntesis.',
      java: 'Las llaves { } marcan el bloque. Para comparar números usa ==; un solo = es asignar.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          x = 7
          if x % 2 == 0:
              print("par")
          else:
              print("impar")
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              int x = 7;
              if (x % 2 == 0) {
                  cout << "par" << "\n";
              } else {
                  cout << "impar" << "\n";
              }
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  int x = 7;
                  if (x % 2 == 0) {
                      System.out.println("par");
                  } else {
                      System.out.println("impar");
                  }
              }
          }
        `,
      },
      options: ['par', 'impar', 'error'],
      answer: 1,
      explanation: '7 % 2 da 1, no 0. La condición es falsa, así que se ejecuta el else.',
      wrongHint: 'Pista: % devuelve el resto de dividir. ¿Cuánto sobra al dividir 7 entre 2?',
    },
  },
  problem: {
    id: 'p05-par-o-impar',
    title: '¿PAR O IMPAR?',
    statement: 'Lía piensa en un número entero N. Si N es par, imprime PAR. Si no, imprime IMPAR.',
    inputSpec: 'Una línea con N.',
    outputSpec: 'PAR o IMPAR, en mayúsculas.',
    constraints: '0 ≤ N ≤ 10⁹',
    difficulty: 'facil',
    xp: 100,
    timeLimitMs: 1000,
    tests: tests([
      parImpar(4),
      parImpar(7),
      parImpar(0),
      parImpar(1),
      parImpar(2),
      parImpar(1000000000),
      parImpar(999999999),
      parImpar(123456789),
    ]),
    starter: {
      python: code`
        n = int(input())
        # TODO: si n es par imprime PAR; si no, IMPAR
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        int main() {
            long long n;
            cin >> n;
            // TODO: si n es par imprime PAR; si no, IMPAR
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                long n = sc.nextLong();
                // TODO: si n es par imprime PAR; si no, IMPAR
            }
        }
      `,
    },
    solution: {
      python: code`
        n = int(input())

        if n % 2 == 0:
            print("PAR")
        else:
            print("IMPAR")
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        int main() {
            long long n;
            cin >> n;
            if (n % 2 == 0) cout << "PAR" << "\n";
            else cout << "IMPAR" << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                long n = sc.nextLong();
                if (n % 2 == 0) {
                    System.out.println("PAR");
                } else {
                    System.out.println("IMPAR");
                }
            }
        }
      `,
    },
    hints: [
      'Un número es par si se puede repartir en dos grupos iguales sin que sobre nada.',
      'El operador % da el resto de una división. ¿Qué resto deja un número par al dividirlo entre 2?',
      'Si N % 2 es 0, N es par: usa if (N % 2 == 0) y un else para IMPAR. Ojo: 0 también es par.',
    ],
  },
  outro: [
    { speaker: 'LÍA', text: '¡Bien decidido! Tu código ya sabe elegir su camino.' },
    { speaker: 'LÍA', text: 'Max te espera más abajo. Él nunca se detiene... mientras haya algo que contar.' },
  ],
  rewardTip: {
    title: '¿Es par?',
    text: {
      python: 'if n % 2 == 0: es par. No olvides los dos puntos ni la sangría.',
      cpp: 'if (n % 2 == 0) es par. Con negativos, n % 2 puede dar -1: compara con 0, no con 1.',
      java: 'if (n % 2 == 0) es par. Con negativos, n % 2 puede dar -1: compara con 0, no con 1.',
    },
  },
};
