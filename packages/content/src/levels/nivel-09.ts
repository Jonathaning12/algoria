import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

function esPrimo(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}

const consultas = (ns: number[]): [string, string] => [
  `${ns.length}\n${ns.join('\n')}`,
  ns.map((n) => (esPrimo(n) ? 'SI' : 'NO')).join('\n'),
];

const aleatorios = (() => {
  const r = rng(909);
  return Array.from({ length: 20 }, () => r(0, 1000000000));
})();

export const nivel09: Level = {
  number: 9,
  id: 'n09-funciones',
  title: 'Funciones',
  topic: 'Funciones',
  npc: { id: 'gael', name: 'GAEL', title: 'Inventor de recetas', sprite: 'gael', x: 11, y: 8 },
  greeting: 'Escríbelo una vez, úsalo mil. Ese es mi lema.',
  intro: [
    { speaker: 'GAEL', text: '¡Ah, un visitante! Soy Gael, inventor oficial del Pueblo Semilla.' },
    { speaker: 'GAEL', text: 'Mi secreto: cuando algo me sale bien, lo apunto como receta y la reutilizo.' },
    { speaker: 'GAEL', text: 'En código, esas recetas se llaman funciones: reciben datos y devuelven un resultado.' },
    { speaker: 'GAEL', text: '¿Te comparto mi recetario o prefieres inventar en pleno duelo?' },
  ],
  lesson: {
    concept: 'FUNCIONES',
    goals: ['Definir una función con parámetros', 'Devolver un resultado con return', 'Llamar a la función las veces que quieras'],
    explanation:
      'Una función es un bloque de código con nombre que recibe datos (parámetros) y devuelve un resultado con return. ' +
      'La defines una vez y la llamas cuantas veces necesites. ' +
      'Así tu programa queda corto, ordenado y fácil de revisar.',
    code: {
      python: code`
        def mayor(a, b):
            if a > b:
                return a
            return b

        x, y = map(int, input().split())
        print(mayor(x, y))
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        int mayor(int a, int b) {
            if (a > b) return a;
            return b;
        }

        int main() {
            int x, y;
            cin >> x >> y;
            cout << mayor(x, y) << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            static int mayor(int a, int b) {
                if (a > b) return a;
                return b;
            }

            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int x = sc.nextInt();
                int y = sc.nextInt();
                System.out.println(mayor(x, y));
            }
        }
      `,
    },
    examples: [
      { input: '3 8', output: '8' },
      { input: '10 2', output: '10' },
      { input: '-5 -9', output: '-5' },
    ],
    tips: {
      python: 'Define la función con def antes de usarla. Si no llega a ningún return, devuelve None.',
      cpp: 'Antes del nombre va el tipo que devuelve: int, bool, long long. Escríbela antes de main.',
      java: 'Dentro de Main, las funciones auxiliares se declaran static: static boolean esPrimo(long n).',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          def f(x):
              return x * 2 + 1

          print(f(f(1)))
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int f(int x) {
              return x * 2 + 1;
          }

          int main() {
              cout << f(f(1)) << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              static int f(int x) {
                  return x * 2 + 1;
              }

              public static void main(String[] args) {
                  System.out.println(f(f(1)));
              }
          }
        `,
      },
      options: ['3', '5', '7'],
      answer: 2,
      explanation: 'Primero se resuelve la llamada de adentro: f(1) = 3. Luego f(3) = 7.',
      wrongHint: 'Resuelve de adentro hacia afuera: calcula f(1) y usa ese resultado en la segunda llamada.',
    },
  },
  problem: {
    id: 'p09-recetas-primas',
    title: 'LAS RECETAS PRIMAS',
    statement:
      'Gael solo guarda recetas cuyo número de serie es primo: mayor que 1 y divisible únicamente entre 1 y sí mismo. ' +
      'Escribe una función es_primo y úsala para responder Q consultas.',
    inputSpec: 'Línea 1: Q. Luego Q líneas, cada una con un entero N.',
    outputSpec: 'Q líneas: SI si N es primo, NO si no lo es.',
    constraints: '1 ≤ Q ≤ 20 · 0 ≤ N ≤ 10⁹',
    difficulty: 'medio',
    xp: 100,
    timeLimitMs: 1000,
    tests: tests([
      consultas([2, 9, 13]),
      consultas([1, 0]),
      consultas([3, 4, 5, 6, 7]),
      consultas([25, 49, 121, 169]),
      consultas([999999937]),
      consultas([1000000000, 999999999, 999999929]),
      consultas([961748941, 982451653, 999999893, 999999883, 999999797, 999999761]),
      consultas(aleatorios),
      consultas([97, 100, 101, 2147, 7919, 8191, 65537, 1, 2, 3]),
    ]),
    starter: {
      python: code`
        def es_primo(n):
            # TODO: devuelve True si n es primo y False si no
            return False

        q = int(input())
        for _ in range(q):
            n = int(input())
            print("SI" if es_primo(n) else "NO")
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        bool esPrimo(long long n) {
            // TODO: devuelve true si n es primo y false si no
            return false;
        }

        int main() {
            int q;
            cin >> q;
            while (q--) {
                long long n;
                cin >> n;
                cout << (esPrimo(n) ? "SI" : "NO") << "\n";
            }
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            static boolean esPrimo(long n) {
                // TODO: devuelve true si n es primo y false si no
                return false;
            }

            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int q = sc.nextInt();
                for (int k = 0; k < q; k++) {
                    long n = sc.nextLong();
                    System.out.println(esPrimo(n) ? "SI" : "NO");
                }
            }
        }
      `,
    },
    solution: {
      python: code`
        def es_primo(n):
            if n < 2:
                return False
            i = 2
            while i * i <= n:
                if n % i == 0:
                    return False
                i += 1
            return True

        q = int(input())
        for _ in range(q):
            n = int(input())
            print("SI" if es_primo(n) else "NO")
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        bool esPrimo(long long n) {
            if (n < 2) return false;
            for (long long i = 2; i * i <= n; i++) {
                if (n % i == 0) return false;
            }
            return true;
        }

        int main() {
            int q;
            cin >> q;
            while (q--) {
                long long n;
                cin >> n;
                cout << (esPrimo(n) ? "SI" : "NO") << "\n";
            }
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            static boolean esPrimo(long n) {
                if (n < 2) return false;
                for (long i = 2; i * i <= n; i++) {
                    if (n % i == 0) return false;
                }
                return true;
            }

            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int q = sc.nextInt();
                for (int k = 0; k < q; k++) {
                    long n = sc.nextLong();
                    System.out.println(esPrimo(n) ? "SI" : "NO");
                }
            }
        }
      `,
    },
    hints: [
      'El programa principal ya está listo: solo completa la función. Cuidado con 0 y 1, que no son primos.',
      'Prueba dividir n entre 2, 3, 4... Si alguno lo divide exacto (resto 0), no es primo.',
      'No hace falta probar hasta n: basta con los i tales que i * i <= n. Si ninguno divide a n, es primo.',
    ],
  },
  outro: [
    { speaker: 'GAEL', text: '¡Receta aprobada! Esa función te servirá en muchas aventuras.' },
    { speaker: 'GAEL', text: 'Ya tienes todo lo necesario. La líder del Gimnasio Semilla te espera frente a su puerta.' },
  ],
  rewardTip: {
    title: '¿Es primo?',
    text: {
      python: 'def es_primo(n): prueba divisores i mientras i * i <= n. 0 y 1 no son primos.',
      cpp: 'bool esPrimo(long long n): prueba divisores con for (long long i = 2; i * i <= n; i++).',
      java: 'static boolean esPrimo(long n): prueba divisores con for (long i = 2; i * i <= n; i++).',
    },
  },
};
