import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const parejas = (k: number, a: number[]): [string, string] => {
  let c = 0;
  for (let i = 0; i < a.length; i++) {
    for (let j = i + 1; j < a.length; j++) {
      if (a[i]! + a[j]! === k) c++;
    }
  }
  return [`${a.length} ${k}\n${a.join(' ')}`, `${c}`];
};

const iguales = Array.from({ length: 2000 }, () => 5);
const chicos = (() => {
  const r = rng(1515);
  return Array.from({ length: 2000 }, () => r(1, 100));
})();
const grandes = (() => {
  const r = rng(5151);
  return Array.from({ length: 2000 }, () => r(1, 1000000));
})();

export const nivel15: Level = {
  number: 15,
  id: 'n15-bucles-anidados',
  title: 'Bucles anidados',
  topic: 'Bucles anidados',
  npc: { id: 'mila', name: 'MILA', title: 'Organizadora del baile', sprite: 'mila', x: 4, y: 4 },
  greeting: 'Uno, dos, tres... cada quien con cada quien. ¡Así se arma un baile!',
  intro: [
    { speaker: 'MILA', text: '¡Hola, hola! Soy Mila y esta noche organizo el baile del bosque.' },
    { speaker: 'MILA', text: 'Necesito probar todas las parejas posibles: el primero con cada uno, el segundo con cada uno...' },
    { speaker: 'MILA', text: 'Eso es un bucle dentro de otro bucle. Por cada vuelta del de afuera, el de adentro da todas sus vueltas.' },
    { speaker: 'MILA', text: '¿Ensayamos los pasos en la lección o bailamos directo en el duelo?' },
  ],
  lesson: {
    concept: 'BUCLES ANIDADOS',
    goals: ['Poner un bucle dentro de otro', 'Recorrer todas las parejas i < j', 'Contar cuántas vueltas da en total'],
    explanation:
      'Un bucle anidado es un for dentro de otro for. El de afuera elige a i; el de adentro recorre a j por completo antes de que i avance. ' +
      'Si el de adentro empieza en j = i + 1, visitas cada pareja una sola vez y nunca emparejas a alguien consigo mismo. ' +
      'Ojo: con N elementos son unas N·N/2 vueltas. Con N = 2000 son dos millones: todavía va rápido.',
    code: {
      python: code`
        n = int(input())
        for i in range(1, n + 1):
            for j in range(i + 1, n + 1):
                print(i, j)
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        int main() {
            int n;
            cin >> n;
            for (int i = 1; i <= n; i++) {
                for (int j = i + 1; j <= n; j++) {
                    cout << i << " " << j << "\n";
                }
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
                for (int i = 1; i <= n; i++) {
                    for (int j = i + 1; j <= n; j++) {
                        System.out.println(i + " " + j);
                    }
                }
            }
        }
      `,
    },
    examples: [
      { input: '3', output: '1 2\n1 3\n2 3' },
      { input: '2', output: '1 2' },
      { input: '4', output: '1 2\n1 3\n1 4\n2 3\n2 4\n3 4' },
    ],
    tips: {
      python: 'range(i + 1, n) empieza justo después de i. Usa nombres distintos (i, j) para cada bucle.',
      cpp: 'Cada bucle con su propia variable: i afuera, j adentro. Si mezclas i++ y j++, el bucle no termina.',
      java: 'Cada bucle con su propia variable: i afuera, j adentro. Si mezclas i++ y j++, el bucle no termina.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          c = 0
          for i in range(4):
              for j in range(3):
                  c += 1
          print(c)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              int c = 0;
              for (int i = 0; i < 4; i++) {
                  for (int j = 0; j < 3; j++) {
                      c++;
                  }
              }
              cout << c << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  int c = 0;
                  for (int i = 0; i < 4; i++) {
                      for (int j = 0; j < 3; j++) {
                          c++;
                      }
                  }
                  System.out.println(c);
              }
          }
        `,
      },
      options: ['7', '12', '16'],
      answer: 1,
      explanation: 'El bucle de afuera da 4 vueltas y, en cada una, el de adentro da 3. En total 4 × 3 = 12.',
      wrongHint: 'El bucle de adentro se repite completo en cada vuelta del de afuera. ¿Se suman o se multiplican?',
    },
  },
  problem: {
    id: 'p15-parejas-de-mila',
    title: 'LAS PAREJAS DE MILA',
    statement:
      'Al baile llegan N bailarines, cada uno con una energía aᵢ. Mila dice que una pareja (i, j) con i < j es perfecta ' +
      'si sus energías suman exactamente K. ¿Cuántas parejas perfectas puede formar?',
    inputSpec: 'Línea 1: N y K. Línea 2: N enteros a₁ ... aₙ separados por espacios.',
    outputSpec: 'Un número: la cantidad de parejas perfectas.',
    constraints: '2 ≤ N ≤ 2000 · 1 ≤ aᵢ ≤ 10⁶ · 1 ≤ K ≤ 2·10⁶',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      parejas(6, [1, 5, 3, 3, 2]),
      parejas(10, [1, 2, 3, 4]),
      parejas(2, [1, 1]),
      parejas(4, [2, 2, 2, 2]),
      parejas(7, [1, 6, 2, 5, 3, 4, 7]),
      parejas(10, iguales),
      parejas(101, chicos),
      parejas(1000000, grandes),
      parejas(2000000, [1000000, 1000000, 999999, 1]),
    ]),
    starter: {
      python: code`
        import sys
        input = sys.stdin.readline

        n, k = map(int, input().split())
        a = list(map(int, input().split()))
        c = 0
        # TODO: recorre todas las parejas i < j y cuenta las que suman k
        print(c)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n;
            long long k;
            cin >> n >> k;
            vector<long long> a(n);
            for (int i = 0; i < n; i++) cin >> a[i];
            long long c = 0;
            // TODO: recorre todas las parejas i < j y cuenta las que suman k
            cout << c << "\n";
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
                long k = Long.parseLong(st.nextToken());
                st = new StringTokenizer(br.readLine());
                long[] a = new long[n];
                for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());
                long c = 0;
                // TODO: recorre todas las parejas i < j y cuenta las que suman k
                System.out.println(c);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        input = sys.stdin.readline

        n, k = map(int, input().split())
        a = list(map(int, input().split()))
        c = 0
        for i in range(n):
            falta = k - a[i]
            for j in range(i + 1, n):
                if a[j] == falta:
                    c += 1
        print(c)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n;
            long long k;
            cin >> n >> k;
            vector<long long> a(n);
            for (int i = 0; i < n; i++) cin >> a[i];
            long long c = 0;
            for (int i = 0; i < n; i++) {
                for (int j = i + 1; j < n; j++) {
                    if (a[i] + a[j] == k) c++;
                }
            }
            cout << c << "\n";
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
                long k = Long.parseLong(st.nextToken());
                st = new StringTokenizer(br.readLine());
                long[] a = new long[n];
                for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());
                long c = 0;
                for (int i = 0; i < n; i++) {
                    for (int j = i + 1; j < n; j++) {
                        if (a[i] + a[j] == k) c++;
                    }
                }
                System.out.println(c);
            }
        }
      `,
    },
    hints: [
      'Hay que probar cada pareja una vez. Dos bucles, uno dentro del otro, te dan todas.',
      'Si j empieza en i + 1, nunca repites una pareja ni emparejas a alguien consigo mismo.',
      'for i de 0 a n - 1, for j de i + 1 a n - 1: si a[i] + a[j] == K, suma 1. Con N = 2000 el total puede pasar de un millón.',
    ],
  },
  outro: [
    { speaker: 'MILA', text: '¡Qué ritmo! Probaste cada pareja sin pisar a nadie dos veces.' },
    { speaker: 'MILA', text: 'Cruza el puente hacia el sur: Tito cuida un huerto ordenado en filas y columnas.' },
  ],
  rewardTip: {
    title: 'Todas las parejas',
    text: {
      python: 'for i in range(n): for j in range(i + 1, n): visita cada pareja una vez. Son unas n*n/2 vueltas.',
      cpp: 'for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) visita cada pareja una vez: unas n*n/2 vueltas.',
      java: 'for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) visita cada pareja una vez: unas n*n/2 vueltas.',
    },
  },
};
