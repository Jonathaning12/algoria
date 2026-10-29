import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

// Los números llegan como texto (hasta 10^18 no cabe exacto en un number de JS).
const sumaDigitos = (n: string) => String([...n].reduce((s, c) => s + Number(c), 0));
const eco = (n: string): [number, string] => {
  if (n.length === 1) return [0, n];
  const [pasos, d] = eco(sumaDigitos(n));
  return [pasos + 1, d];
};
const ecos = (nums: string[]): [string, string] => [
  `${nums.length}\n${nums.join('\n')}`,
  nums.map((n) => eco(n).join(' ')).join('\n'),
];

const r = rng(2121);
const numero = (maxLen: number) => {
  const len = r(1, maxLen);
  let s = String(r(1, 9));
  for (let i = 1; i < len; i++) s += String(r(0, 9));
  return s;
};
const grandes = Array.from({ length: 1000 }, () => numero(18));
const pequenos = Array.from({ length: 1000 }, (_, i) => String(i));
const nueves = Array.from({ length: 18 }, (_, i) => '9'.repeat(i + 1));

export const nivel21: Level = {
  number: 21,
  id: 'n21-recursion',
  title: 'Recursión',
  topic: 'Recursión: caso base',
  npc: { id: 'eco', name: 'ECO', title: 'Murciélago del eco', sprite: 'npc21', x: 4, y: 2 },
  greeting: 'Grita un número y la cueva te lo devuelve... un poco más pequeño cada vez.',
  intro: [
    { speaker: 'ECO', text: '¡Hola, hola, hola! Soy Eco, el murciélago que vive a la entrada de la cueva.' },
    { speaker: 'ECO', text: 'Aquí, cuando gritas un número, la cueva responde con la suma de sus dígitos. Y luego con la suma de esa suma...' },
    { speaker: 'ECO', text: 'Eso es recursión: una función que se llama a sí misma con un problema más pequeño, hasta llegar a uno tan simple que se responde solo.' },
    { speaker: 'ECO', text: '¿Escuchamos juntos la lección o vas directo al duelo?' },
  ],
  lesson: {
    concept: 'RECURSIÓN · CASO BASE',
    goals: ['Escribir una función que se llama a sí misma', 'Reconocer el caso base que detiene la recursión', 'Achicar el problema en cada llamada'],
    explanation:
      'Una función recursiva resuelve un problema usando la respuesta de una versión más pequeña del mismo problema. ' +
      'Necesita dos partes: el caso base, que se responde directo y detiene las llamadas, y la llamada recursiva, que achica el problema. ' +
      'Por ejemplo, la suma de dígitos de 1234 es 4 más la suma de dígitos de 123. Y si el número tiene un solo dígito, la suma es él mismo. ' +
      'Sin caso base, la función se llamaría para siempre.',
    code: {
      python: code`
        def suma_digitos(n):
            if n < 10:                          # caso base: un solo dígito
                return n
            return n % 10 + suma_digitos(n // 10)  # último dígito + el resto

        n = int(input())
        print(suma_digitos(n))
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        long long sumaDigitos(long long n) {
            if (n < 10) return n;                   // caso base: un solo dígito
            return n % 10 + sumaDigitos(n / 10);    // último dígito + el resto
        }

        int main() {
            long long n;
            cin >> n;
            cout << sumaDigitos(n) << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            static long sumaDigitos(long n) {
                if (n < 10) return n;                   // caso base: un solo dígito
                return n % 10 + sumaDigitos(n / 10);    // último dígito + el resto
            }

            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                long n = sc.nextLong();
                System.out.println(sumaDigitos(n));
            }
        }
      `,
    },
    examples: [
      { input: '1234', output: '10' },
      { input: '7', output: '7' },
      { input: '1000000', output: '1' },
    ],
    tips: {
      python: 'Python corta la recursión a unas 1000 llamadas de profundidad. Aquí bastan 19, pero recuérdalo: sys.setrecursionlimit sube ese tope.',
      cpp: 'Cada llamada guarda sus variables en la pila. Con unas pocas miles de llamadas no hay problema; con millones, sí.',
      java: 'Marca tus funciones como static para llamarlas desde main sin crear objetos. long llega hasta 9·10¹⁸.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          def f(n):
              if n == 0:
                  return 1
              return 2 * f(n - 1)

          print(f(5))
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int f(int n) {
              if (n == 0) return 1;
              return 2 * f(n - 1);
          }

          int main() {
              cout << f(5) << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              static int f(int n) {
                  if (n == 0) return 1;
                  return 2 * f(n - 1);
              }

              public static void main(String[] args) {
                  System.out.println(f(5));
              }
          }
        `,
      },
      options: ['10', '32', '64'],
      answer: 1,
      explanation: 'f(0) = 1 es el caso base. Cada llamada duplica la anterior: 2, 4, 8, 16 y 32. Es 2 elevado a 5.',
      wrongHint: 'Empieza por el caso base: ¿cuánto vale f(0)? Luego f(1) = 2 · f(0), f(2) = 2 · f(1)... hasta f(5).',
    },
  },
  problem: {
    id: 'p21-ecos-de-la-cueva',
    title: 'LOS ECOS DE LA CUEVA',
    statement:
      'Cuando Eco grita un número N, la cueva responde con un eco: la suma de los dígitos de N. ' +
      'Luego ese eco vuelve a rebotar y la cueva responde con la suma de sus dígitos, y así sucesivamente, ' +
      'hasta que el eco es un número de un solo dígito. Por ejemplo, 9875 → 29 → 11 → 2: tres ecos y queda el 2. ' +
      'Para cada grito, imprime cuántos ecos hubo y el dígito final.',
    inputSpec: 'Línea 1: T, la cantidad de gritos. Luego T líneas, cada una con un número N.',
    outputSpec: 'T líneas: la cantidad de ecos y el dígito final, separados por un espacio. Si N ya tiene un dígito, hay 0 ecos.',
    constraints: '1 ≤ T ≤ 1000 · 0 ≤ N ≤ 10¹⁸.',
    difficulty: 'facil',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      ecos(['9875', '7', '99']),
      ecos(['0', '1000000000000000000']),
      ecos(['10', '19', '199', '1999999999']),
      ecos(['199999999999999999', '999999999999999999', '5']),
      ecos(nueves),
      ecos(pequenos),
      ecos(grandes),
      ecos(['123456789012345678', '888888888888888888', '1', '18']),
    ]),
    starter: {
      python: code`
        import sys

        def suma_digitos(n):
            if n < 10:
                return n
            return n % 10 + suma_digitos(n // 10)

        def ecos(n):
            # TODO: caso base: si n tiene un dígito, hay 0 ecos.
            # Si no, es 1 eco más los ecos de suma_digitos(n).
            return 0

        def final(n):
            # TODO: caso base: si n tiene un dígito, es el final.
            # Si no, el final de n es el final de suma_digitos(n).
            return n

        data = sys.stdin.read().split()
        t = int(data[0])
        for i in range(1, t + 1):
            n = int(data[i])
            print(ecos(n), final(n))
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        long long sumaDigitos(long long n) {
            if (n < 10) return n;
            return n % 10 + sumaDigitos(n / 10);
        }

        int ecos(long long n) {
            // TODO: caso base: si n tiene un dígito, hay 0 ecos.
            // Si no, es 1 eco más los ecos de sumaDigitos(n).
            return 0;
        }

        long long final_(long long n) {
            // TODO: caso base: si n tiene un dígito, es el final.
            // Si no, el final de n es el final de sumaDigitos(n).
            return n;
        }

        int main() {
            int t;
            cin >> t;
            while (t--) {
                long long n;
                cin >> n;
                cout << ecos(n) << " " << final_(n) << "\n";
            }
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;

        public class Main {
            static long sumaDigitos(long n) {
                if (n < 10) return n;
                return n % 10 + sumaDigitos(n / 10);
            }

            static int ecos(long n) {
                // TODO: caso base: si n tiene un dígito, hay 0 ecos.
                // Si no, es 1 eco más los ecos de sumaDigitos(n).
                return 0;
            }

            static long fin(long n) {
                // TODO: caso base: si n tiene un dígito, es el final.
                // Si no, el final de n es el final de sumaDigitos(n).
                return n;
            }

            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                int t = Integer.parseInt(br.readLine().trim());
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < t; i++) {
                    long n = Long.parseLong(br.readLine().trim());
                    sb.append(ecos(n)).append(" ").append(fin(n)).append("\n");
                }
                System.out.print(sb);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys

        def suma_digitos(n):
            if n < 10:
                return n
            return n % 10 + suma_digitos(n // 10)

        def ecos(n):
            if n < 10:
                return 0
            return 1 + ecos(suma_digitos(n))

        def final(n):
            if n < 10:
                return n
            return final(suma_digitos(n))

        data = sys.stdin.read().split()
        t = int(data[0])
        for i in range(1, t + 1):
            n = int(data[i])
            print(ecos(n), final(n))
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        long long sumaDigitos(long long n) {
            if (n < 10) return n;
            return n % 10 + sumaDigitos(n / 10);
        }

        int ecos(long long n) {
            if (n < 10) return 0;
            return 1 + ecos(sumaDigitos(n));
        }

        long long final_(long long n) {
            if (n < 10) return n;
            return final_(sumaDigitos(n));
        }

        int main() {
            int t;
            cin >> t;
            while (t--) {
                long long n;
                cin >> n;
                cout << ecos(n) << " " << final_(n) << "\n";
            }
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;

        public class Main {
            static long sumaDigitos(long n) {
                if (n < 10) return n;
                return n % 10 + sumaDigitos(n / 10);
            }

            static int ecos(long n) {
                if (n < 10) return 0;
                return 1 + ecos(sumaDigitos(n));
            }

            static long fin(long n) {
                if (n < 10) return n;
                return fin(sumaDigitos(n));
            }

            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                int t = Integer.parseInt(br.readLine().trim());
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < t; i++) {
                    long n = Long.parseLong(br.readLine().trim());
                    sb.append(ecos(n)).append(" ").append(fin(n)).append("\n");
                }
                System.out.print(sb);
            }
        }
      `,
    },
    hints: [
      'Piensa primero en el caso más fácil: si N tiene un solo dígito, ¿cuántos ecos hay y cuál es el final?',
      'Si N tiene más dígitos, el primer eco lo convierte en suma_digitos(N). Desde ahí, el problema es el mismo pero con un número más pequeño.',
      'ecos(n) = 0 si n < 10; si no, 1 + ecos(suma_digitos(n)). final(n) = n si n < 10; si no, final(suma_digitos(n)).',
    ],
  },
  outro: [
    { speaker: 'ECO', text: '¡Eco, eco, eco! Cada grito se hizo más pequeño hasta llegar al caso base. Así se piensa en recursión.' },
    { speaker: 'ECO', text: 'Recuerda: primero la salida, después la llamada. Una recursión sin caso base es un túnel sin fondo.' },
    { speaker: 'ECO', text: 'Greta te espera más adelante, colgada de su cuerda. Ella baja por las grietas de muchas maneras distintas.' },
  ],
  rewardTip: {
    title: 'Recursión',
    text: {
      python: 'def f(n): if caso_base: return algo; return combinar(f(más_pequeño)). Profundo: sys.setrecursionlimit.',
      cpp: 'Toda función recursiva: un if con el caso base que retorna directo y una llamada con un problema más pequeño.',
      java: 'static long f(long n) { if (caso base) return ...; return ... f(más pequeño) ...; }',
    },
  },
};
