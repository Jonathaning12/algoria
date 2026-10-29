import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const picos = (h: number[]): [string, string] => {
  let c = 0;
  let s = 0n;
  for (let i = 1; i + 1 < h.length; i++) {
    if (h[i]! > h[i - 1]! && h[i]! > h[i + 1]!) {
      c++;
      s += BigInt(h[i]!);
    }
  }
  return [`${h.length}\n${h.join(' ')}`, `${c}\n${s}`];
};

const zigzag = Array.from({ length: 200000 }, (_, i) => (i % 2 === 1 ? 1000000000 : -1000000000));
const aleatoria = (() => {
  const r = rng(1010);
  return Array.from({ length: 200000 }, () => r(-1000000000, 1000000000));
})();
const meseta = (() => {
  const r = rng(77);
  return Array.from({ length: 1000 }, () => r(0, 3));
})();

export const nivel10: Level = {
  number: 10,
  id: 'n10-gimnasio-semilla',
  title: 'Gimnasio Semilla',
  topic: 'Repaso: todo junto',
  gym: true,
  npc: { id: 'olmo', name: 'MAESTRA OLMO', title: 'Líder del Gimnasio Semilla', sprite: 'gym_semilla', x: 8, y: 9 },
  greeting: 'Solo cruzan esta puerta quienes dominan lo aprendido en el pueblo.',
  intro: [
    { speaker: 'MAESTRA OLMO', text: 'Bienvenido al Gimnasio Semilla. Soy Olmo, y aquí termina el camino del pueblo.' },
    { speaker: 'MAESTRA OLMO', text: 'Leo, Sofi, Iris, Tomás, Lía, Max, Nora, Bruno y Gael me hablaron de ti.' },
    { speaker: 'MAESTRA OLMO', text: 'Mi reto mezcla todo: leer la entrada, listas, bucles, condiciones y cuentas grandes.' },
    { speaker: 'MAESTRA OLMO', text: 'Si me vences, el camino al Bosque Iterador quedará abierto.' },
    { speaker: 'MAESTRA OLMO', text: '¿Quieres un último repaso o te sientes listo para el duelo?' },
  ],
  lesson: {
    concept: 'REPASO: TODO JUNTO',
    goals: ['Leer una lista y recorrerla', 'Combinar for, if y funciones', 'Acumular resultados sin desbordarte'],
    explanation:
      'Los problemas reales mezclan varias ideas a la vez. ' +
      'Un buen plan: lee todo en una lista, recórrela con un for y decide con un if qué contar o sumar. ' +
      'Si una parte se repite o se complica, sácala a una función.',
    code: {
      python: code`
        def es_par(x):
            return x % 2 == 0

        n = int(input())
        a = list(map(int, input().split()))
        pares = 0
        for x in a:
            if es_par(x):
                pares += 1
        print(pares)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        bool esPar(int x) {
            return x % 2 == 0;
        }

        int main() {
            int n;
            cin >> n;
            vector<int> a(n);
            for (int i = 0; i < n; i++) cin >> a[i];
            int pares = 0;
            for (int i = 0; i < n; i++) {
                if (esPar(a[i])) pares++;
            }
            cout << pares << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            static boolean esPar(int x) {
                return x % 2 == 0;
            }

            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                int[] a = new int[n];
                for (int i = 0; i < n; i++) a[i] = sc.nextInt();
                int pares = 0;
                for (int i = 0; i < n; i++) {
                    if (esPar(a[i])) pares++;
                }
                System.out.println(pares);
            }
        }
      `,
    },
    examples: [
      { input: '5\n1 2 3 4 6', output: '3' },
      { input: '3\n7 9 11', output: '0' },
      { input: '4\n0 -2 5 8', output: '3' },
    ],
    tips: {
      python: 'for x in a: recorre los valores directamente. Si necesitas la posición, usa for i in range(n).',
      cpp: 'Con muchos datos, pon ios::sync_with_stdio(false); cin.tie(nullptr); al inicio de main para leer más rápido.',
      java: 'Con muchos datos, BufferedReader es mucho más rápido que Scanner.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          def g(a):
              total = 0
              for x in a:
                  if x > 2:
                      total += x
              return total

          print(g([1, 5, 2, 4]))
        `,
        cpp: code`
          #include <iostream>
          #include <vector>
          using namespace std;

          int g(vector<int> a) {
              int total = 0;
              for (int x : a) {
                  if (x > 2) total += x;
              }
              return total;
          }

          int main() {
              cout << g({1, 5, 2, 4}) << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              static int g(int[] a) {
                  int total = 0;
                  for (int x : a) {
                      if (x > 2) total += x;
                  }
                  return total;
              }

              public static void main(String[] args) {
                  System.out.println(g(new int[] {1, 5, 2, 4}));
              }
          }
        `,
      },
      options: ['2', '9', '12'],
      answer: 1,
      explanation: 'Solo pasan el filtro x > 2 el 5 y el 4, así que la suma es 9.',
      wrongHint: 'Revisa cada elemento por separado: ¿cuáles cumplen la condición? Suma solo esos.',
    },
  },
  problem: {
    id: 'p10-cordillera-semilla',
    title: 'LA CORDILLERA SEMILLA',
    statement:
      'Detrás del gimnasio hay una fila de N montañas con alturas h₁, h₂, ..., hₙ. ' +
      'Una montaña es un pico si es estrictamente más alta que sus dos vecinas (la primera y la última nunca son picos, porque tienen una sola vecina). ' +
      'Olmo quiere saber cuántos picos hay y cuánto suman sus alturas.',
    inputSpec: 'Línea 1: N. Línea 2: N enteros h₁ ... hₙ separados por espacios.',
    outputSpec: 'Dos líneas: la cantidad de picos y la suma de sus alturas (0 si no hay picos).',
    constraints: '1 ≤ N ≤ 2·10⁵ · -10⁹ ≤ hᵢ ≤ 10⁹ · La suma puede pasar de 10¹⁴.',
    difficulty: 'medio',
    xp: 250,
    timeLimitMs: 2000,
    tests: tests([
      picos([1, 3, 2, 5, 4]),
      picos([5, 4, 3, 2, 1]),
      picos([7]),
      picos([1, 2]),
      picos([2, 2, 2, 3, 3, 1]),
      picos([-5, -1, -8, -2, -9]),
      picos([0, 1000000000, 0, 1000000000, 0]),
      picos(meseta),
      picos(zigzag),
      picos(aleatoria),
    ]),
    starter: {
      python: code`
        n = int(input())
        h = list(map(int, input().split()))
        picos = 0
        suma = 0
        # TODO: recorre las montañas del medio y cuenta/suma los picos
        print(picos)
        print(suma)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n;
            cin >> n;
            vector<long long> h(n);
            for (int i = 0; i < n; i++) cin >> h[i];
            long long picos = 0, suma = 0;
            // TODO: recorre las montañas del medio y cuenta/suma los picos
            cout << picos << "\n" << suma << "\n";
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
                int n = Integer.parseInt(br.readLine().trim());
                StringTokenizer st = new StringTokenizer(br.readLine());
                long[] h = new long[n];
                for (int i = 0; i < n; i++) h[i] = Long.parseLong(st.nextToken());
                long picos = 0, suma = 0;
                // TODO: recorre las montañas del medio y cuenta/suma los picos
                System.out.println(picos);
                System.out.println(suma);
            }
        }
      `,
    },
    solution: {
      python: code`
        def es_pico(h, i):
            return h[i] > h[i - 1] and h[i] > h[i + 1]

        n = int(input())
        h = list(map(int, input().split()))
        picos = 0
        suma = 0
        for i in range(1, n - 1):
            if es_pico(h, i):
                picos += 1
                suma += h[i]
        print(picos)
        print(suma)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        bool esPico(const vector<long long>& h, int i) {
            return h[i] > h[i - 1] && h[i] > h[i + 1];
        }

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n;
            cin >> n;
            vector<long long> h(n);
            for (int i = 0; i < n; i++) cin >> h[i];
            long long picos = 0, suma = 0;
            for (int i = 1; i + 1 < n; i++) {
                if (esPico(h, i)) {
                    picos++;
                    suma += h[i];
                }
            }
            cout << picos << "\n" << suma << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.StringTokenizer;

        public class Main {
            static boolean esPico(long[] h, int i) {
                return h[i] > h[i - 1] && h[i] > h[i + 1];
            }

            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                int n = Integer.parseInt(br.readLine().trim());
                StringTokenizer st = new StringTokenizer(br.readLine());
                long[] h = new long[n];
                for (int i = 0; i < n; i++) h[i] = Long.parseLong(st.nextToken());
                long picos = 0, suma = 0;
                for (int i = 1; i + 1 < n; i++) {
                    if (esPico(h, i)) {
                        picos++;
                        suma += h[i];
                    }
                }
                System.out.println(picos);
                System.out.println(suma);
            }
        }
      `,
    },
    hints: [
      'Solo las montañas del medio (de la posición 1 a la n - 2) pueden ser picos. Con N = 1 o 2 no hay ninguno.',
      'Una montaña es pico si h[i] > h[i - 1] y también h[i] > h[i + 1]. Si es igual a una vecina, no cuenta.',
      'Recorre i de 1 a n - 2, y cuando sea pico suma 1 al contador y h[i] a la suma. La suma necesita long long / long, y puede ser negativa.',
    ],
  },
  outro: [
    { speaker: 'MAESTRA OLMO', text: 'Impresionante. Leíste, recorriste, decidiste y sumaste sin perder un solo dato.' },
    { speaker: 'MAESTRA OLMO', text: 'Toma la Medalla Semilla. El camino del sur ya está abierto.' },
    { speaker: 'MAESTRA OLMO', text: 'En el Bosque Iterador te esperan nuevos guardianes. Prof. Bit estará orgulloso.' },
  ],
  rewardTip: {
    title: 'Plan de ataque',
    text: {
      python: 'Lee todo en una lista, recórrela con for i in range(1, n - 1) y compara con h[i - 1] y h[i + 1].',
      cpp: 'Lee en vector<long long>, recorre con for (int i = 1; i + 1 < n; i++) y acumula en long long.',
      java: 'Lee con BufferedReader + StringTokenizer en long[], recorre de 1 a n - 2 y acumula en long.',
    },
  },
};
