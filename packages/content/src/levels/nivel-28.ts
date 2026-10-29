import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const cordada = (x: number, a: number[]): [string, string] => {
  let i = 0;
  let j = a.length - 1;
  let c = 0;
  while (i < j) {
    if (a[i]! + a[j]! <= x) {
      c += j - i;
      i++;
    } else j--;
  }
  return [`${a.length} ${x}\n${a.join(' ')}`, String(c)];
};

const N = 200000;
const r = rng(2828);
const ordenada = (n: number, lo: number, hi: number) => Array.from({ length: n }, () => r(lo, hi)).sort((p, q) => p - q);
const pesos = ordenada(N, 1, 1000000000);
const livianos = ordenada(N, 1, 100);
const iguales = Array.from({ length: N }, () => 500000000);

export const nivel28: Level = {
  number: 28,
  id: 'n28-dos-punteros',
  title: 'Dos punteros',
  topic: 'Dos punteros',
  npc: { id: 'nico', name: 'NICO', title: 'Jefe de cordada', sprite: 'npc28', x: 9, y: 8 },
  greeting: 'Un dedo en el más liviano, otro en el más pesado. Y los voy acercando.',
  intro: [
    { speaker: 'NICO', text: '¡Hola, compañero de cuerda! Soy Nico y organizo las cordadas para bajar al fondo de la cueva.' },
    { speaker: 'NICO', text: 'Los exploradores bajan de dos en dos, y la cuerda aguanta un peso máximo. Quiero saber cuántas parejas pueden bajar juntas.' },
    { speaker: 'NICO', text: 'Probar todas las parejas son miles de millones de cuentas. Pero con la fila ordenada por peso, me bastan dos dedos que se acercan.' },
    { speaker: 'NICO', text: '¿Te enseño el truco de los dos punteros o vas al duelo?' },
  ],
  lesson: {
    concept: 'DOS PUNTEROS',
    goals: ['Recorrer un arreglo ordenado desde las dos puntas', 'Decidir qué puntero mover según la suma', 'Pasar de O(n²) a O(n)'],
    explanation:
      'En un arreglo ordenado, pon un puntero i al principio (el menor) y otro j al final (el mayor). ' +
      'Mira a[i] + a[j]: si es muy grande, el único modo de achicarla es mover j a la izquierda; si es muy chica, mueve i a la derecha. ' +
      'En cada paso uno de los dos avanza y nunca retroceden, así que en total dan como mucho n pasos: O(n) en lugar de probar las n²/2 parejas. ' +
      'Funciona porque el orden te dice qué parejas ya no hace falta mirar.',
    code: {
      python: code`
        # cuántas parejas suman exactamente x (valores distintos y ordenados)
        n, x = map(int, input().split())
        a = list(map(int, input().split()))
        i, j = 0, n - 1
        parejas = 0
        while i < j:
            s = a[i] + a[j]
            if s == x:
                parejas += 1
                i += 1
                j -= 1
            elif s < x:
                i += 1      # necesito más: avanza el pequeño
            else:
                j -= 1      # me pasé: retrocede el grande
        print(parejas)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        // cuántas parejas suman exactamente x (valores distintos y ordenados)
        int main() {
            int n;
            long long x;
            cin >> n >> x;
            vector<long long> a(n);
            for (auto& v : a) cin >> v;
            int i = 0, j = n - 1, parejas = 0;
            while (i < j) {
                long long s = a[i] + a[j];
                if (s == x) {
                    parejas++;
                    i++;
                    j--;
                } else if (s < x) {
                    i++;    // necesito más: avanza el pequeño
                } else {
                    j--;    // me pasé: retrocede el grande
                }
            }
            cout << parejas << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        // cuántas parejas suman exactamente x (valores distintos y ordenados)
        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                long x = sc.nextLong();
                long[] a = new long[n];
                for (int i = 0; i < n; i++) a[i] = sc.nextLong();
                int i = 0, j = n - 1, parejas = 0;
                while (i < j) {
                    long s = a[i] + a[j];
                    if (s == x) {
                        parejas++;
                        i++;
                        j--;
                    } else if (s < x) {
                        i++;    // necesito más: avanza el pequeño
                    } else {
                        j--;    // me pasé: retrocede el grande
                    }
                }
                System.out.println(parejas);
            }
        }
      `,
    },
    examples: [
      { input: '5 9\n1 2 4 5 7', output: '2' },
      { input: '4 100\n1 2 3 4', output: '0' },
      { input: '2 3\n1 2', output: '1' },
    ],
    tips: {
      python: 'Con un while y dos índices recorres todo una sola vez. Lee los 2·10⁵ números con sys.stdin.buffer.read().split().',
      cpp: 'a[i] + a[j] puede pasar de 2·10⁹: usa long long tanto para los valores como para el conteo.',
      java: 'a[i] + a[j] puede pasar de 2·10⁹: usa long tanto para los valores como para el conteo.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          a = [1, 2, 3, 4, 5]
          x = 6
          i, j = 0, len(a) - 1
          c = 0
          while i < j:
              if a[i] + a[j] <= x:
                  c += j - i
                  i += 1
              else:
                  j -= 1
          print(c)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              int a[] = {1, 2, 3, 4, 5};
              int x = 6, i = 0, j = 4, c = 0;
              while (i < j) {
                  if (a[i] + a[j] <= x) {
                      c += j - i;
                      i++;
                  } else {
                      j--;
                  }
              }
              cout << c << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  int[] a = {1, 2, 3, 4, 5};
                  int x = 6, i = 0, j = 4, c = 0;
                  while (i < j) {
                      if (a[i] + a[j] <= x) {
                          c += j - i;
                          i++;
                      } else {
                          j--;
                      }
                  }
                  System.out.println(c);
              }
          }
        `,
      },
      options: ['4', '6', '10'],
      answer: 1,
      explanation: 'Con i = 0, 1 + 5 <= 6: el 1 hace pareja con los 4 de la derecha. Luego j baja hasta el 4 y el 2 hace pareja con 3 y 4. Total: 4 + 2 = 6.',
      wrongHint: 'Cuando a[i] + a[j] <= x, a[i] también hace pareja con todos los que están entre i y j, porque son más livianos que a[j].',
    },
  },
  problem: {
    id: 'p28-cuerda-de-nico',
    title: 'LA CUERDA DE NICO',
    statement:
      'Nico tiene N exploradores en fila, ordenados de menor a mayor peso: a₁ ≤ a₂ ≤ ... ≤ aₙ. ' +
      'Bajan de dos en dos, y la cuerda aguanta como mucho X kilos. ' +
      '¿Cuántas parejas distintas (i, j), con i < j, cumplen aᵢ + aⱼ ≤ X? Con tantos exploradores, probar todas las parejas es demasiado lento.',
    inputSpec: 'Línea 1: N y X. Línea 2: N enteros a₁ ... aₙ, ordenados de menor a mayor.',
    outputSpec: 'Un número: la cantidad de parejas que pueden bajar juntas.',
    constraints: '2 ≤ N ≤ 2·10⁵ · 1 ≤ aᵢ ≤ 10⁹ · 1 ≤ X ≤ 2·10⁹ · La respuesta puede pasar de 2·10⁹.',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      cordada(7, [1, 2, 3, 4, 5]),
      cordada(1, [1, 1, 1, 1]),
      cordada(2, [1, 1]),
      cordada(10, [2, 3, 5, 5, 8, 9]),
      cordada(2000000000, pesos),
      cordada(1000000000, pesos),
      cordada(100, livianos),
      cordada(1000000000, iguales),
      cordada(999999999, iguales),
    ]),
    starter: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        n, x = int(data[0]), int(data[1])
        a = list(map(int, data[2:2 + n]))
        i, j = 0, n - 1
        parejas = 0
        # TODO: mientras i < j: si a[i] + a[j] <= x, a[i] hace pareja con todos
        # los de i + 1 a j (suma j - i) y avanza i; si no, retrocede j
        print(parejas)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n;
            long long x;
            cin >> n >> x;
            vector<long long> a(n);
            for (auto& v : a) cin >> v;
            int i = 0, j = n - 1;
            long long parejas = 0;
            // TODO: mientras i < j: si a[i] + a[j] <= x, a[i] hace pareja con todos
            // los de i + 1 a j (suma j - i) y avanza i; si no, retrocede j
            cout << parejas << "\n";
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
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                long x = Long.parseLong(st.nextToken());
                long[] a = new long[n];
                st = new StringTokenizer(br.readLine());
                for (int k = 0; k < n; k++) a[k] = Long.parseLong(st.nextToken());
                int i = 0, j = n - 1;
                long parejas = 0;
                // TODO: mientras i < j: si a[i] + a[j] <= x, a[i] hace pareja con todos
                // los de i + 1 a j (suma j - i) y avanza i; si no, retrocede j
                System.out.println(parejas);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        n, x = int(data[0]), int(data[1])
        a = list(map(int, data[2:2 + n]))
        i, j = 0, n - 1
        parejas = 0
        while i < j:
            if a[i] + a[j] <= x:
                parejas += j - i
                i += 1
            else:
                j -= 1
        print(parejas)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n;
            long long x;
            cin >> n >> x;
            vector<long long> a(n);
            for (auto& v : a) cin >> v;
            int i = 0, j = n - 1;
            long long parejas = 0;
            while (i < j) {
                if (a[i] + a[j] <= x) {
                    parejas += j - i;
                    i++;
                } else {
                    j--;
                }
            }
            cout << parejas << "\n";
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
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                long x = Long.parseLong(st.nextToken());
                long[] a = new long[n];
                st = new StringTokenizer(br.readLine());
                for (int k = 0; k < n; k++) a[k] = Long.parseLong(st.nextToken());
                int i = 0, j = n - 1;
                long parejas = 0;
                while (i < j) {
                    if (a[i] + a[j] <= x) {
                        parejas += j - i;
                        i++;
                    } else {
                        j--;
                    }
                }
                System.out.println(parejas);
            }
        }
      `,
    },
    hints: [
      'Probar todas las parejas son unas N²/2 = 2·10¹⁰ sumas. Aprovecha que la fila ya viene ordenada.',
      'Pon i en el más liviano y j en el más pesado. Si a[i] + a[j] cabe, entonces a[i] también cabe con todos los que están entre i y j.',
      'Mientras i < j: si a[i] + a[j] <= X, suma j - i parejas y avanza i; si no, retrocede j. Guarda el conteo en long.',
    ],
  },
  outro: [
    { speaker: 'NICO', text: '¡Todas las cordadas listas! Dos dedos, una pasada, y ni una pareja contada de más.' },
    { speaker: 'NICO', text: 'Cuando tengas un arreglo ordenado y busques parejas, piensa primero en dos punteros.' },
    { speaker: 'NICO', text: 'Petra, la geóloga, trabaja al final de este túnel. Siempre pregunta cuántas rocas hay entre dos edades.' },
  ],
  rewardTip: {
    title: 'Dos punteros',
    text: {
      python: 'i, j = 0, n - 1; while i < j: si cabe, c += j - i; i += 1; si no, j -= 1. O(n) en vez de O(n²).',
      cpp: 'while (i < j) { if (a[i] + a[j] <= x) { c += j - i; i++; } else j--; }. O(n). Conteo en long long.',
      java: 'while (i < j) { if (a[i] + a[j] <= x) { c += j - i; i++; } else j--; }. O(n). Conteo en long.',
    },
  },
};
