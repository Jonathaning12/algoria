import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const olas = (h: number[]): [string, string] => {
  const pila: number[] = [];
  let espera = 0;
  for (let i = 0; i < h.length; i++) {
    while (pila.length > 0 && h[pila[pila.length - 1]!]! < h[i]!) espera += i - pila.pop()!;
    pila.push(i);
  }
  return [`${h.length}\n${h.join(' ')}`, `${espera}\n${pila.length}`];
};

const N = 200000;
const r = rng(3333);
const aleatoria = Array.from({ length: N }, () => r(1, 1000000000));
const bajas = Array.from({ length: N }, () => r(1, 5));
// Bajada constante: nadie ve una ola más alta y el método ingenuo recorre todo hasta el final.
const bajando = Array.from({ length: N }, (_, i) => N - i);
const iguales = Array.from({ length: N }, () => 7);
const subiendo = Array.from({ length: N }, (_, i) => i + 1);
// Dientes de sierra que decrecen hasta una ola gigante al final.
const sierra = Array.from({ length: N }, (_, i) => (i === N - 1 ? 1000000000 : N - i + (i % 2) * 3));

export const nivel33: Level = {
  number: 33,
  id: 'n33-pila-monotona',
  title: 'Pila monótona',
  topic: 'Pilas (stack)',
  npc: { id: 'nerea', name: 'NEREA', title: 'Vigía del rompeolas', sprite: 'npc33', x: 3, y: 5 },
  greeting: 'Cada ola espera a la siguiente que la supere. Algunas esperan para siempre.',
  intro: [
    { speaker: 'NEREA', text: 'Hola. Soy Nerea y desde la punta de este muelle mido la altura de cada ola.' },
    { speaker: 'NEREA', text: 'Para cada minuto quiero saber cuánto falta para que llegue una ola más alta.' },
    { speaker: 'NEREA', text: 'Mirar hacia adelante desde cada ola funciona... hasta que el mar se calma y las olas solo bajan. Ahí no termina nunca.' },
    { speaker: 'NEREA', text: 'Hay un truco con una pila que lo resuelve de una sola pasada. ¿Lo vemos o quieres intentarlo?' },
  ],
  lesson: {
    concept: 'PILA MONÓTONA · SIGUIENTE MAYOR',
    goals: ['Encontrar el siguiente elemento mayor de cada posición', 'Mantener una pila de pendientes que siempre baja', 'Resolverlo en O(n) en vez de O(n²)'],
    explanation:
      'Recorre de izquierda a derecha guardando en una pila las posiciones que aún no encontraron a alguien mayor. ' +
      'Cuando llega un valor nuevo, desapila a todos los de arriba que sean menores: ¡él es su siguiente mayor! Luego apílalo. ' +
      'La pila siempre queda ordenada de mayor a menor (por eso se llama monótona). Cada posición entra y sale una sola vez: O(n).',
    code: {
      python: code`
        n = int(input())
        a = list(map(int, input().split()))
        res = [-1] * n
        pila = []  # posiciones que esperan a alguien mayor
        for i in range(n):
            while pila and a[pila[-1]] < a[i]:
                res[pila.pop()] = a[i]
            pila.append(i)
        print(*res)
      `,
      cpp: code`
        #include <iostream>
        #include <stack>
        #include <vector>
        using namespace std;

        int main() {
            int n;
            cin >> n;
            vector<int> a(n), res(n, -1);
            for (int i = 0; i < n; i++) cin >> a[i];
            stack<int> pila;  // posiciones que esperan a alguien mayor
            for (int i = 0; i < n; i++) {
                while (!pila.empty() && a[pila.top()] < a[i]) {
                    res[pila.top()] = a[i];
                    pila.pop();
                }
                pila.push(i);
            }
            for (int i = 0; i < n; i++) cout << res[i] << (i + 1 < n ? " " : "\n");
            return 0;
        }
      `,
      java: code`
        import java.util.ArrayDeque;
        import java.util.Arrays;
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                int[] a = new int[n];
                int[] res = new int[n];
                Arrays.fill(res, -1);
                for (int i = 0; i < n; i++) a[i] = sc.nextInt();
                ArrayDeque<Integer> pila = new ArrayDeque<>();  // posiciones que esperan
                for (int i = 0; i < n; i++) {
                    while (!pila.isEmpty() && a[pila.peek()] < a[i]) {
                        res[pila.pop()] = a[i];
                    }
                    pila.push(i);
                }
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < n; i++) {
                    if (i > 0) sb.append(" ");
                    sb.append(res[i]);
                }
                System.out.println(sb);
            }
        }
      `,
    },
    examples: [
      { input: '5\n2 7 3 5 4', output: '7 -1 5 -1 -1' },
      { input: '4\n1 2 3 4', output: '2 3 4 -1' },
      { input: '3\n3 2 1', output: '-1 -1 -1' },
    ],
    tips: {
      python: 'Guarda posiciones en la pila, no valores: con la posición puedes saber tanto el valor a[j] como la distancia i - j.',
      cpp: 'Guarda índices en la pila. Aunque haya un while dentro del for, cada índice se apila y desapila una sola vez: el total es O(n).',
      java: 'Guarda índices en un ArrayDeque<Integer>. Aunque haya un while dentro del for, cada índice entra y sale una sola vez.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          a = [2, 1, 3]
          res = [-1, -1, -1]
          pila = []
          for i in range(3):
              while pila and a[pila[-1]] < a[i]:
                  res[pila.pop()] = a[i]
              pila.append(i)
          print(*res)
        `,
        cpp: code`
          #include <iostream>
          #include <stack>
          using namespace std;

          int main() {
              int a[3] = {2, 1, 3};
              int res[3] = {-1, -1, -1};
              stack<int> pila;
              for (int i = 0; i < 3; i++) {
                  while (!pila.empty() && a[pila.top()] < a[i]) {
                      res[pila.top()] = a[i];
                      pila.pop();
                  }
                  pila.push(i);
              }
              cout << res[0] << " " << res[1] << " " << res[2] << "\n";
              return 0;
          }
        `,
        java: code`
          import java.util.ArrayDeque;

          public class Main {
              public static void main(String[] args) {
                  int[] a = {2, 1, 3};
                  int[] res = {-1, -1, -1};
                  ArrayDeque<Integer> pila = new ArrayDeque<>();
                  for (int i = 0; i < 3; i++) {
                      while (!pila.isEmpty() && a[pila.peek()] < a[i]) {
                          res[pila.pop()] = a[i];
                      }
                      pila.push(i);
                  }
                  System.out.println(res[0] + " " + res[1] + " " + res[2]);
              }
          }
        `,
      },
      options: ['3 3 -1', '1 3 -1', '3 -1 -1'],
      answer: 0,
      explanation: 'El 1 no supera al 2, así que ambos esperan en la pila. Llega el 3 y es mayor que los dos: los desapila a ambos. Al 3 nadie lo supera.',
      wrongHint: 'El siguiente mayor tiene que ser estrictamente mayor y estar a la derecha. ¿Quién es el primero mayor que 2 hacia la derecha?',
    },
  },
  problem: {
    id: 'p33-olas-de-nerea',
    title: 'LAS OLAS DE NEREA',
    statement:
      'Nerea midió la altura de N olas, una por minuto: h₁, h₂, ..., hₙ. ' +
      'Para la ola del minuto i, su espera es cuántos minutos faltan hasta la primera ola estrictamente más alta que llegue después (si llega en el minuto j, la espera es j - i). ' +
      'Si ninguna ola posterior es más alta, ese minuto queda en calma. ' +
      'Imprime la suma de todas las esperas y cuántos minutos quedan en calma. Cuidado: con el mar en calma, mirar hacia adelante desde cada ola es demasiado lento.',
    inputSpec: 'Línea 1: N. Línea 2: N enteros h₁ ... hₙ separados por espacios.',
    outputSpec: 'Dos líneas: la suma de las esperas y la cantidad de minutos en calma.',
    constraints: '1 ≤ N ≤ 2·10⁵ · 1 ≤ hᵢ ≤ 10⁹ · La suma puede pasar de 2·10⁹: usa enteros de 64 bits.',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      olas([3, 1, 4, 1, 5]),
      olas([5, 5, 5]),
      olas([1]),
      olas([1, 2, 1, 2, 1, 3]),
      olas(aleatoria),
      olas(bajando),
      olas(iguales),
      olas(subiendo),
      olas(bajas),
      olas(sierra),
    ]),
    starter: {
      python: code`
        import sys
        input = sys.stdin.readline

        n = int(input())
        h = list(map(int, input().split()))
        espera = 0
        pila = []
        # TODO: recorre i de 0 a n - 1; mientras la ola de arriba de la pila sea
        # más baja que h[i], desapílala y suma la distancia; luego apila i
        print(espera)
        print(len(pila))
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
            long long espera = 0;
            vector<int> pila;
            // TODO: recorre i de 0 a n - 1; mientras la ola de arriba de la pila sea
            // más baja que h[i], desapílala y suma la distancia; luego apila i
            cout << espera << "\n" << pila.size() << "\n";
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
                long espera = 0;
                int[] pila = new int[n];
                int tope = 0;  // cantidad de elementos en la pila
                // TODO: recorre i de 0 a n - 1; mientras la ola de arriba de la pila sea
                // más baja que h[i], desapílala y suma la distancia; luego apila i
                System.out.println(espera);
                System.out.println(tope);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        input = sys.stdin.readline

        n = int(input())
        h = list(map(int, input().split()))
        espera = 0
        pila = []
        for i in range(n):
            x = h[i]
            while pila and h[pila[-1]] < x:
                espera += i - pila.pop()
            pila.append(i)
        print(espera)
        print(len(pila))
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
            long long espera = 0;
            vector<int> pila;
            for (int i = 0; i < n; i++) {
                while (!pila.empty() && h[pila.back()] < h[i]) {
                    espera += i - pila.back();
                    pila.pop_back();
                }
                pila.push_back(i);
            }
            cout << espera << "\n" << pila.size() << "\n";
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
                long espera = 0;
                int[] pila = new int[n];
                int tope = 0;  // cantidad de elementos en la pila
                for (int i = 0; i < n; i++) {
                    while (tope > 0 && h[pila[tope - 1]] < h[i]) {
                        tope--;
                        espera += i - pila[tope];
                    }
                    pila[tope++] = i;
                }
                System.out.println(espera);
                System.out.println(tope);
            }
        }
      `,
    },
    hints: [
      'Mirar hacia adelante desde cada ola cuesta hasta N pasos por ola: con N = 2·10⁵ olas que solo bajan, son unos 2·10¹⁰ pasos.',
      'Recorre una sola vez y guarda en una pila las posiciones de las olas que aún esperan a una más alta. Cuando llega una ola nueva, ¿a cuáles de la pila acaba de superar?',
      'Para cada i: mientras la pila no esté vacía y h[tope] < h[i], desapila j y suma i - j. Luego apila i. Al final, las que quedaron en la pila son los minutos en calma.',
    ],
  },
  outro: [
    { speaker: 'NEREA', text: 'Doscientas mil olas medidas sin volver atrás ni una vez. El mar te respeta.' },
    { speaker: 'NEREA', text: 'Cuando busques el siguiente mayor o menor, acuérdate de la pila que siempre baja.' },
    { speaker: 'NEREA', text: 'Salvador, el escribano de la aduana, está al final del muelle del este. Cuenta todo lo que entra al puerto.' },
  ],
  rewardTip: {
    title: 'Pila monótona',
    text: {
      python: 'while pila and a[pila[-1]] < a[i]: j = pila.pop() → a[i] es el siguiente mayor de j. Luego pila.append(i). O(n).',
      cpp: 'while (!p.empty() && a[p.back()] < a[i]) { /* a[i] es el siguiente mayor */ p.pop_back(); } p.push_back(i);',
      java: 'while (tope > 0 && a[pila[tope - 1]] < a[i]) tope--; pila[tope++] = i; Un int[] como pila es lo más rápido.',
    },
  },
};
