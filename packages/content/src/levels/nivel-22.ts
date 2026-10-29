import type { Level } from '@algoria/shared';
import { code, tests } from './_util';

const grieta = (s: string): [string, string] => {
  const n = s.length;
  const formas = (p: number): number => {
    if (p === n) return 1;
    if (p > n) return 0;
    if (p > 0 && s[p - 1] === 'x') return 0;
    return formas(p + 1) + formas(p + 2) + formas(p + 3);
  };
  return [`${n}\n${s}`, String(formas(0))];
};

export const nivel22: Level = {
  number: 22,
  id: 'n22-recursion-ramas',
  title: 'Recursión con ramas',
  topic: 'Recursión con varias llamadas',
  npc: { id: 'greta', name: 'GRETA', title: 'Escaladora de grietas', sprite: 'npc22', x: 9, y: 2 },
  greeting: 'Uno, dos o tres salientes de golpe. Cada salto abre caminos nuevos.',
  intro: [
    { speaker: 'GRETA', text: '¡Hola desde abajo! Soy Greta. Bajo por las grietas de la cueva saltando de saliente en saliente.' },
    { speaker: 'GRETA', text: 'En cada saliente puedo saltar uno, dos o tres más abajo. Y quiero saber de cuántas maneras puedo llegar al fondo.' },
    { speaker: 'GRETA', text: 'Mi truco: desde cada saliente pruebo los tres saltos y sumo los caminos de cada uno. Una función que se llama tres veces.' },
    { speaker: 'GRETA', text: '¿Bajamos juntas por la lección o saltas directo al duelo?' },
  ],
  lesson: {
    concept: 'RECURSIÓN CON VARIAS RAMAS',
    goals: ['Llamar a la función más de una vez en cada paso', 'Sumar las respuestas de cada rama', 'Entender por qué las llamadas crecen tan rápido'],
    explanation:
      'A veces, para resolver un problema, hay que probar varias opciones y juntar sus respuestas. ' +
      'Para subir N escalones de 1 en 1 o de 2 en 2: las formas de subir N son las formas de subir N - 1 (si el último paso fue de 1) más las de N - 2 (si fue de 2). ' +
      'Cada llamada abre dos ramas, y cada rama otras dos: el número de llamadas crece casi al doble con cada escalón. ' +
      'Con N pequeño va de maravilla; con N = 60 no terminaría nunca. Más adelante, en la Torre Dinámica, aprenderás a recordar respuestas para evitarlo.',
    code: {
      python: code`
        def formas(n):
            if n == 0:          # llegué justo arriba: 1 forma
                return 1
            if n < 0:           # me pasé: 0 formas
                return 0
            return formas(n - 1) + formas(n - 2)

        n = int(input())
        print(formas(n))
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        long long formas(int n) {
            if (n == 0) return 1;   // llegué justo arriba: 1 forma
            if (n < 0) return 0;    // me pasé: 0 formas
            return formas(n - 1) + formas(n - 2);
        }

        int main() {
            int n;
            cin >> n;
            cout << formas(n) << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            static long formas(int n) {
                if (n == 0) return 1;   // llegué justo arriba: 1 forma
                if (n < 0) return 0;    // me pasé: 0 formas
                return formas(n - 1) + formas(n - 2);
            }

            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                System.out.println(formas(n));
            }
        }
      `,
    },
    examples: [
      { input: '3', output: '3' },
      { input: '5', output: '8' },
      { input: '1', output: '1' },
    ],
    tips: {
      python: 'Cuenta las llamadas con una variable global para ver cómo crecen. Con 25 escalones ya son casi 250 mil.',
      cpp: 'Usa long long para el resultado: las formas crecen muy rápido. Las llamadas también, así que mantén N pequeño.',
      java: 'Usa long para el resultado: las formas crecen muy rápido. Las llamadas también, así que mantén N pequeño.',
    },
    quiz: {
      question: '¿Cuántas veces se llama a f? (el programa lo imprime)',
      code: {
        python: code`
          llamadas = 0

          def f(n):
              global llamadas
              llamadas += 1
              if n <= 1:
                  return n
              return f(n - 1) + f(n - 2)

          f(5)
          print(llamadas)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int llamadas = 0;

          int f(int n) {
              llamadas++;
              if (n <= 1) return n;
              return f(n - 1) + f(n - 2);
          }

          int main() {
              f(5);
              cout << llamadas << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              static int llamadas = 0;

              static int f(int n) {
                  llamadas++;
                  if (n <= 1) return n;
                  return f(n - 1) + f(n - 2);
              }

              public static void main(String[] args) {
                  f(5);
                  System.out.println(llamadas);
              }
          }
        `,
      },
      options: ['5', '15', '8'],
      answer: 1,
      explanation: 'f(0) y f(1) hacen 1 llamada; f(2) hace 1 + 1 + 1 = 3; f(3) hace 1 + 3 + 1 = 5; f(4) hace 1 + 5 + 3 = 9; y f(5) hace 1 + 9 + 5 = 15.',
      wrongHint: 'Cada llamada cuenta 1 más todas las que hacen sus dos ramas. Empieza por f(1) y f(0), y sube de a uno.',
    },
  },
  problem: {
    id: 'p22-grieta-de-greta',
    title: 'LA GRIETA DE GRETA',
    statement:
      'Greta baja por una grieta con N salientes, numerados del 1 (el más alto) al N (el fondo). Empieza en la entrada, que es la posición 0. ' +
      'En cada salto baja 1, 2 o 3 salientes. Algunos salientes están flojos y no se pueden pisar. ' +
      'Tiene que terminar exactamente en el saliente N, que siempre es firme. ¿De cuántas maneras distintas puede bajar?',
    inputSpec: 'Línea 1: N. Línea 2: un texto de N caracteres; el carácter i es "." si el saliente i es firme o "x" si está flojo.',
    outputSpec: 'Un número: la cantidad de maneras de llegar al saliente N.',
    constraints: '1 ≤ N ≤ 20 · El último carácter siempre es ".".',
    difficulty: 'facil',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      grieta('....'),
      grieta('.x...'),
      grieta('.'),
      grieta('xx.'),
      grieta('..xxx.'),
      grieta('....................'),
      grieta('.x.x.x.x.x.x.x.x.x..'),
      grieta('..x...x...x...x...x.'),
      grieta('x..xx..x....x.xx...'),
    ]),
    starter: {
      python: code`
        n = int(input())
        s = input().strip()

        def formas(p):
            # TODO: casos base: si p == n, 1 forma; si p > n, 0 formas;
            # si p > 0 y el saliente p está flojo (s[p - 1] == "x"), 0 formas.
            # Si no, suma las formas de saltar 1, 2 y 3 salientes.
            return 0

        print(formas(0))
      `,
      cpp: code`
        #include <iostream>
        #include <string>
        using namespace std;

        int n;
        string s;

        long long formas(int p) {
            // TODO: casos base: si p == n, 1 forma; si p > n, 0 formas;
            // si p > 0 y el saliente p está flojo (s[p - 1] == 'x'), 0 formas.
            // Si no, suma las formas de saltar 1, 2 y 3 salientes.
            return 0;
        }

        int main() {
            cin >> n >> s;
            cout << formas(0) << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            static int n;
            static String s;

            static long formas(int p) {
                // TODO: casos base: si p == n, 1 forma; si p > n, 0 formas;
                // si p > 0 y el saliente p está flojo (s.charAt(p - 1) == 'x'), 0 formas.
                // Si no, suma las formas de saltar 1, 2 y 3 salientes.
                return 0;
            }

            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                n = sc.nextInt();
                s = sc.next();
                System.out.println(formas(0));
            }
        }
      `,
    },
    solution: {
      python: code`
        n = int(input())
        s = input().strip()

        def formas(p):
            if p == n:
                return 1
            if p > n:
                return 0
            if p > 0 and s[p - 1] == "x":
                return 0
            return formas(p + 1) + formas(p + 2) + formas(p + 3)

        print(formas(0))
      `,
      cpp: code`
        #include <iostream>
        #include <string>
        using namespace std;

        int n;
        string s;

        long long formas(int p) {
            if (p == n) return 1;
            if (p > n) return 0;
            if (p > 0 && s[p - 1] == 'x') return 0;
            return formas(p + 1) + formas(p + 2) + formas(p + 3);
        }

        int main() {
            cin >> n >> s;
            cout << formas(0) << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            static int n;
            static String s;

            static long formas(int p) {
                if (p == n) return 1;
                if (p > n) return 0;
                if (p > 0 && s.charAt(p - 1) == 'x') return 0;
                return formas(p + 1) + formas(p + 2) + formas(p + 3);
            }

            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                n = sc.nextInt();
                s = sc.next();
                System.out.println(formas(0));
            }
        }
      `,
    },
    hints: [
      'Escribe una función formas(p): de cuántas maneras se llega al fondo si Greta está ahora en el saliente p. La respuesta es formas(0).',
      'Hay tres casos que se responden solos: llegaste justo al fondo (1 forma), te pasaste (0 formas) o estás en un saliente flojo (0 formas).',
      'En cualquier otro caso: formas(p) = formas(p + 1) + formas(p + 2) + formas(p + 3). Ojo: el saliente p está en s[p - 1], porque el texto empieza en 0.',
    ],
  },
  outro: [
    { speaker: 'GRETA', text: '¡Todas las bajadas contadas! Tres ramas en cada saliente y ninguna se te escapó.' },
    { speaker: 'GRETA', text: 'Viste cómo crecen las llamadas, ¿no? Por eso aquí la grieta es corta. Algún día aprenderás a recordar respuestas.' },
    { speaker: 'GRETA', text: 'Ámbar está al final de este túnel. Colecciona cristales y siempre prueba todas las combinaciones.' },
  ],
  rewardTip: {
    title: 'Recursión con ramas',
    text: {
      python: 'return f(p + 1) + f(p + 2) + f(p + 3): cada rama es una opción. Las llamadas crecen exponencialmente.',
      cpp: 'return f(p + 1) + f(p + 2) + f(p + 3): cada rama es una opción. Con 3 ramas, ~3ⁿ llamadas: N pequeño.',
      java: 'return f(p + 1) + f(p + 2) + f(p + 3): cada rama es una opción. Con 3 ramas, ~3ⁿ llamadas: N pequeño.',
    },
  },
};
