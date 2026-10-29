import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const MOD = 1000000007;
const MAX = 1000000;
// Tabla completa de pergaminos: P(1) = P(2) = 1, P(n) = P(n-1) + P(n-2) (mod 10⁹+7).
const P = new Int32Array(MAX + 1);
P[1] = 1;
P[2] = 1;
for (let i = 3; i <= MAX; i++) P[i] = (P[i - 1]! + P[i - 2]!) % MOD;

const pergaminos = (ns: number[]): [string, string] => [`${ns.length}\n${ns.join(' ')}`, ns.map((n) => P[n]).join('\n')];

const r = rng(5151);
const aleatorias = Array.from({ length: 5000 }, () => r(1, MAX));
const enormes = Array.from({ length: 5000 }, () => MAX);
const medianas = Array.from({ length: 5000 }, () => r(40, 200));

export const nivel51: Level = {
  number: 51,
  id: 'n51-memoizacion',
  title: 'Memoización',
  topic: 'Programación dinámica',
  npc: { id: 'elda', name: 'ELDA', title: 'Guardiana del archivo', sprite: 'npc51', x: 3, y: 10 },
  greeting: 'Lo que ya se escribió no se vuelve a escribir. Se busca en el archivo.',
  intro: [
    { speaker: 'ELDA', text: 'Bienvenido a la Torre Dinámica. Soy Elda y cuido el archivo de pergaminos del primer piso.' },
    { speaker: 'ELDA', text: 'Cada pergamino nuevo se escribe copiando los dos anteriores. Los aprendices me piden miles de ellos.' },
    { speaker: 'ELDA', text: 'Un aprendiz intentó calcularlos con pura recursión y sigue ahí sentado desde el invierno pasado.' },
    { speaker: 'ELDA', text: 'El secreto de esta torre es simple: nunca resuelvas dos veces lo mismo. ¿Te lo explico o vamos al duelo?' },
  ],
  lesson: {
    concept: 'MEMOIZACIÓN',
    goals: ['Ver por qué la recursión ingenua explota', 'Guardar cada resultado la primera vez que se calcula', 'Pasar de memoria a una tabla de abajo hacia arriba'],
    explanation:
      'Con fib(n) = fib(n-1) + fib(n-2), la recursión pide fib(n-2) dos veces, fib(n-3) tres veces... y así crece hasta unos 2ⁿ pasos. ' +
      'Memoizar es anotar cada respuesta en un arreglo la primera vez y, si te la vuelven a pedir, devolverla sin recalcular. ' +
      'Así cada valor se calcula una sola vez: O(n). ' +
      'Eso es programación dinámica: dividir en subproblemas que se repiten y guardar sus respuestas. Muchas veces conviene llenar la tabla en orden, de abajo hacia arriba, sin recursión.',
    code: {
      python: code`
        import sys
        sys.setrecursionlimit(10000)

        memo = {}

        def fib(n):
            if n <= 2:
                return 1
            if n in memo:
                return memo[n]
            memo[n] = fib(n - 1) + fib(n - 2)
            return memo[n]

        n = int(input())
        print(fib(n))
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        long long memo[91];

        long long fib(int n) {
            if (n <= 2) return 1;
            if (memo[n] != 0) return memo[n];
            memo[n] = fib(n - 1) + fib(n - 2);
            return memo[n];
        }

        int main() {
            int n;
            cin >> n;
            cout << fib(n) << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            static long[] memo = new long[91];

            static long fib(int n) {
                if (n <= 2) return 1;
                if (memo[n] != 0) return memo[n];
                memo[n] = fib(n - 1) + fib(n - 2);
                return memo[n];
            }

            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                System.out.println(fib(n));
            }
        }
      `,
    },
    examples: [
      { input: '10', output: '55' },
      { input: '50', output: '12586269025' },
      { input: '1', output: '1' },
    ],
    tips: {
      python: 'Un dict o una lista sirven de memoria. Para n grande, mejor llena una lista con un for: la recursión de Python es lenta y tiene límite de profundidad.',
      cpp: 'Un arreglo global empieza en 0, así que 0 puede significar "aún no calculado". Con n grande, llena la tabla con un for en vez de recursión.',
      java: 'Un long[] estático empieza en 0: úsalo como "aún no calculado". Con n grande, llena la tabla con un for para no agotar la pila.',
    },
    quiz: {
      question: 'Sin memoria, ¿cuántas veces se llama a f para calcular f(6)? (el programa lo imprime)',
      code: {
        python: code`
          llamadas = 0

          def f(n):
              global llamadas
              llamadas += 1
              if n <= 2:
                  return 1
              return f(n - 1) + f(n - 2)

          f(6)
          print(llamadas)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int llamadas = 0;

          int f(int n) {
              llamadas++;
              if (n <= 2) return 1;
              return f(n - 1) + f(n - 2);
          }

          int main() {
              f(6);
              cout << llamadas << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              static int llamadas = 0;

              static int f(int n) {
                  llamadas++;
                  if (n <= 2) return 1;
                  return f(n - 1) + f(n - 2);
              }

              public static void main(String[] args) {
                  f(6);
                  System.out.println(llamadas);
              }
          }
        `,
      },
      options: ['6', '15', '8'],
      answer: 1,
      explanation: 'f(6) llama a f(5) y f(4), que a su vez repiten trabajo: 15 llamadas en total. Con memoria serían solo unas 6.',
      wrongHint: 'Dibuja el árbol: f(6) llama a f(5) y a f(4); f(5) llama a f(4) y a f(3)... Cuenta cada nodo, también los repetidos.',
    },
  },
  problem: {
    id: 'p51-pergaminos-de-elda',
    title: 'LOS PERGAMINOS DE ELDA',
    statement:
      'En el archivo de Elda, el pergamino 1 y el pergamino 2 tienen una runa cada uno. ' +
      'Cada pergamino n ≥ 3 se escribe copiando juntos el pergamino n - 1 y el n - 2, así que P(n) = P(n-1) + P(n-2). ' +
      'Los aprendices hacen T preguntas: para cada n, responde cuántas runas tiene el pergamino n. ' +
      'Como el número es enorme, imprímelo módulo 1 000 000 007. Cuidado: la recursión sin memoria no termina a tiempo.',
    inputSpec: 'Línea 1: T. Línea 2: T enteros n separados por espacios.',
    outputSpec: 'T líneas: P(n) mod 1 000 000 007 para cada pregunta, en el mismo orden.',
    constraints: '1 ≤ T ≤ 5000 · 1 ≤ n ≤ 10⁶.',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      pergaminos([1, 2, 3, 10, 20]),
      pergaminos([5, 6, 7]),
      pergaminos([30, 40, 45, 50]),
      pergaminos([MAX]),
      pergaminos(aleatorias),
      pergaminos(enormes),
      pergaminos(medianas),
      pergaminos([90, 91, 92, 93, 94, 95, 96, 97, 98, 99]),
      pergaminos([1, 1]),
    ]),
    starter: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        t = int(data[0])
        ns = [int(x) for x in data[1:1 + t]]
        MOD = 1000000007
        mx = max(ns)
        p = [0] * (mx + 2)
        p[1] = 1
        p[2] = 1
        # TODO: llena p[3..mx] con p[i] = (p[i - 1] + p[i - 2]) % MOD
        print("\n".join(str(p[n]) for n in ns))
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            const long long MOD = 1000000007;
            int t;
            cin >> t;
            vector<int> ns(t);
            int mx = 2;
            for (int i = 0; i < t; i++) {
                cin >> ns[i];
                if (ns[i] > mx) mx = ns[i];
            }
            vector<long long> p(mx + 1, 0);
            p[1] = 1;
            p[2] = 1;
            // TODO: llena p[3..mx] con p[i] = (p[i - 1] + p[i - 2]) % MOD
            for (int n : ns) cout << p[n] << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.io.StreamTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                StreamTokenizer in = new StreamTokenizer(new BufferedReader(new InputStreamReader(System.in)));
                final long MOD = 1000000007L;
                in.nextToken();
                int t = (int) in.nval;
                int[] ns = new int[t];
                int mx = 2;
                for (int i = 0; i < t; i++) {
                    in.nextToken();
                    ns[i] = (int) in.nval;
                    mx = Math.max(mx, ns[i]);
                }
                long[] p = new long[mx + 1];
                p[1] = 1;
                p[2] = 1;
                // TODO: llena p[3..mx] con p[i] = (p[i - 1] + p[i - 2]) % MOD
                StringBuilder sb = new StringBuilder();
                for (int n : ns) sb.append(p[n]).append('\n');
                System.out.print(sb);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        t = int(data[0])
        ns = [int(x) for x in data[1:1 + t]]
        MOD = 1000000007
        mx = max(ns)
        p = [0] * (mx + 2)
        p[1] = 1
        p[2] = 1
        for i in range(3, mx + 1):
            p[i] = (p[i - 1] + p[i - 2]) % MOD
        print("\n".join(str(p[n]) for n in ns))
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            const long long MOD = 1000000007;
            int t;
            cin >> t;
            vector<int> ns(t);
            int mx = 2;
            for (int i = 0; i < t; i++) {
                cin >> ns[i];
                if (ns[i] > mx) mx = ns[i];
            }
            vector<long long> p(mx + 1, 0);
            p[1] = 1;
            p[2] = 1;
            for (int i = 3; i <= mx; i++) p[i] = (p[i - 1] + p[i - 2]) % MOD;
            for (int n : ns) cout << p[n] << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.io.StreamTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                StreamTokenizer in = new StreamTokenizer(new BufferedReader(new InputStreamReader(System.in)));
                final long MOD = 1000000007L;
                in.nextToken();
                int t = (int) in.nval;
                int[] ns = new int[t];
                int mx = 2;
                for (int i = 0; i < t; i++) {
                    in.nextToken();
                    ns[i] = (int) in.nval;
                    mx = Math.max(mx, ns[i]);
                }
                long[] p = new long[mx + 1];
                p[1] = 1;
                p[2] = 1;
                for (int i = 3; i <= mx; i++) p[i] = (p[i - 1] + p[i - 2]) % MOD;
                StringBuilder sb = new StringBuilder();
                for (int n : ns) sb.append(p[n]).append('\n');
                System.out.print(sb);
            }
        }
      `,
    },
    hints: [
      'La recursión directa recalcula los mismos pergaminos una y otra vez: para n = 50 ya son miles de millones de llamadas.',
      'Cada pergamino solo depende de los dos anteriores. Si los guardas en un arreglo, calcular el siguiente cuesta una suma.',
      'Llena p[1] = p[2] = 1 y, para i de 3 al mayor n pedido, p[i] = (p[i-1] + p[i-2]) % MOD. Luego responde cada pregunta mirando la tabla.',
    ],
  },
  outro: [
    { speaker: 'ELDA', text: 'Un millón de pergaminos y ni uno escrito dos veces. Así se trabaja en esta torre.' },
    { speaker: 'ELDA', text: 'Recuerda: si un cálculo se repite, guárdalo. Esa idea te llevará hasta la cima.' },
    { speaker: 'ELDA', text: 'Tobías, el campanero, te espera junto a la escalera. Quiere saber de cuántas formas se puede subir.' },
  ],
  rewardTip: {
    title: 'Memoización',
    text: {
      python: 'Si un subproblema se repite, guarda su respuesta. p[i] = p[i-1] + p[i-2] en un for: O(n) y sin límite de recursión.',
      cpp: 'Si un subproblema se repite, guarda su respuesta en un vector. Llenar la tabla en orden evita la recursión: O(n).',
      java: 'Si un subproblema se repite, guarda su respuesta en un long[]. Llenar la tabla en orden evita agotar la pila: O(n).',
    },
  },
};
