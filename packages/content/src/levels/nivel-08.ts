import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const reves = (a: number[]): [string, string] => [`${a.length}\n${a.join(' ')}`, [...a].reverse().join(' ')];

const grande = (() => {
  const r = rng(808);
  return Array.from({ length: 5000 }, () => r(-1000000000, 1000000000));
})();

export const nivel08: Level = {
  number: 8,
  id: 'n08-listas',
  title: 'Listas y arreglos',
  topic: 'Listas',
  npc: { id: 'bruno', name: 'BRUNO', title: 'Guardián del almacén', sprite: 'bruno', x: 11, y: 6 },
  greeting: 'Cada caja en su sitio, y cada sitio con su número.',
  intro: [
    { speaker: 'BRUNO', text: '¡Hola! Soy Bruno y cuido el almacén del pueblo.' },
    { speaker: 'BRUNO', text: 'Aquí no tengo una caja: tengo cientos, todas en fila y numeradas.' },
    { speaker: 'BRUNO', text: 'Una lista (o arreglo) guarda muchos valores bajo un solo nombre, cada uno en su posición.' },
    { speaker: 'BRUNO', text: '¿Te enseño a ordenar el almacén o pasamos directo al duelo?' },
  ],
  lesson: {
    concept: 'LISTAS / ARREGLOS',
    goals: ['Guardar muchos valores en una lista', 'Acceder a un elemento por su posición', 'Recorrer la lista con un for'],
    explanation:
      'Una lista guarda varios valores en fila; a la posición de cada uno se le llama índice. ' +
      'Los índices empiezan en 0: el primero es a[0] y el último es a[n - 1]. ' +
      'Así puedes leer N números una vez y volver a usarlos todas las veces que quieras.',
    code: {
      python: code`
        n = int(input())
        a = list(map(int, input().split()))
        print(a[0])
        print(a[n - 1])
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            int n;
            cin >> n;
            vector<int> a(n);
            for (int i = 0; i < n; i++) cin >> a[i];
            cout << a[0] << "\n";
            cout << a[n - 1] << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                int[] a = new int[n];
                for (int i = 0; i < n; i++) a[i] = sc.nextInt();
                System.out.println(a[0]);
                System.out.println(a[n - 1]);
            }
        }
      `,
    },
    examples: [
      { input: '3\n4 8 15', output: '4\n15' },
      { input: '1\n7', output: '7\n7' },
      { input: '5\n1 2 3 4 5', output: '1\n5' },
    ],
    tips: {
      python: 'a[-1] también es el último elemento, y len(a) te dice cuántos hay.',
      cpp: 'vector<int> a(n); crea n casillas. a.size() te dice cuántas hay. Necesita #include <vector>.',
      java: 'int[] a = new int[n]; crea n casillas. a.length te dice cuántas hay.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          a = [5, 3, 9]
          a[1] = 4
          print(a[0] + a[1])
        `,
        cpp: code`
          #include <iostream>
          #include <vector>
          using namespace std;

          int main() {
              vector<int> a = {5, 3, 9};
              a[1] = 4;
              cout << a[0] + a[1] << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  int[] a = {5, 3, 9};
                  a[1] = 4;
                  System.out.println(a[0] + a[1]);
              }
          }
        `,
      },
      options: ['7', '8', '9'],
      answer: 2,
      explanation: 'a[1] es el segundo elemento: el 3 pasa a ser 4. Entonces a[0] + a[1] = 5 + 4 = 9.',
      wrongHint: 'Recuerda en qué número empiezan los índices y qué casilla cambia en la segunda línea.',
    },
  },
  problem: {
    id: 'p08-almacen-al-reves',
    title: 'EL ALMACÉN AL REVÉS',
    statement:
      'Bruno recibió N cajas en fila, cada una con un número. Para sacarlas, empieza por la última. ' +
      'Imprime los números de las cajas en orden inverso.',
    inputSpec: 'Línea 1: N. Línea 2: N enteros separados por espacios.',
    outputSpec: 'Una línea con los N enteros en orden inverso, separados por un espacio.',
    constraints: '1 ≤ N ≤ 5000 · -10⁹ ≤ cada número ≤ 10⁹',
    difficulty: 'facil',
    xp: 100,
    timeLimitMs: 1000,
    tests: tests([
      reves([1, 2, 3, 4, 5]),
      reves([10, -3, 7]),
      reves([42]),
      reves([0, 0, 0]),
      reves([-1, -2, -3, -4]),
      reves([1000000000, -1000000000]),
      reves([5, 1, 5, 1, 5, 2]),
      reves(grande),
    ]),
    starter: {
      python: code`
        n = int(input())
        a = list(map(int, input().split()))
        # TODO: imprime los elementos de a desde el último hasta el primero
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            int n;
            cin >> n;
            vector<long long> a(n);
            for (int i = 0; i < n; i++) cin >> a[i];
            // TODO: imprime los elementos de a desde el último hasta el primero
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                long[] a = new long[n];
                for (int i = 0; i < n; i++) a[i] = sc.nextLong();
                // TODO: imprime los elementos de a desde el último hasta el primero
            }
        }
      `,
    },
    solution: {
      python: code`
        n = int(input())
        a = list(map(int, input().split()))
        print(*a[::-1])
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
            vector<long long> a(n);
            for (int i = 0; i < n; i++) cin >> a[i];
            for (int i = n - 1; i >= 0; i--) {
                cout << a[i];
                if (i > 0) cout << " ";
            }
            cout << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                long[] a = new long[n];
                for (int i = 0; i < n; i++) a[i] = sc.nextLong();
                StringBuilder sb = new StringBuilder();
                for (int i = n - 1; i >= 0; i--) {
                    sb.append(a[i]);
                    if (i > 0) sb.append(' ');
                }
                System.out.println(sb);
            }
        }
      `,
    },
    hints: [
      'Primero guarda todos los números en una lista; luego recórrela en sentido contrario.',
      'El último elemento está en la posición n - 1 y el primero en la 0. Un for puede ir hacia atrás.',
      'for i desde n - 1 bajando hasta 0, imprimiendo a[i] con un espacio entre números. En Python, a[::-1] ya es la lista al revés; en Java, junta todo en un StringBuilder antes de imprimir.',
    ],
  },
  outro: [
    { speaker: 'BRUNO', text: '¡Almacén vaciado en perfecto orden! Te ganaste mi respeto.' },
    { speaker: 'BRUNO', text: 'Gael, el inventor, guarda recetas de código para no repetir trabajo. Búscalo.' },
  ],
  rewardTip: {
    title: 'Leer una lista',
    text: {
      python: 'a = list(map(int, input().split())) lee una línea de números. a[::-1] la invierte.',
      cpp: 'vector<long long> a(n); for (auto& x : a) cin >> x; lee n números.',
      java: 'long[] a = new long[n]; for (int i = 0; i < n; i++) a[i] = sc.nextLong(); Para salidas largas, usa StringBuilder.',
    },
  },
};
