import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const vigia = (k: number, h: number[]): [string, string] => {
  let bajos = 0;
  let iguales = 0;
  let altos = 0;
  for (const x of h) {
    if (x < k) bajos++;
    else if (x === k) iguales++;
    else altos++;
  }
  return [`${h.length} ${k}\n${h.join(' ')}`, `${bajos} ${iguales} ${altos}`];
};

const pequenos = (() => {
  const r = rng(1212);
  return Array.from({ length: 200000 }, () => r(1, 100));
})();
const grandes = (() => {
  const r = rng(2121);
  return Array.from({ length: 200000 }, () => r(1, 1000000000));
})();

export const nivel12: Level = {
  number: 12,
  id: 'n12-contar-con-condicion',
  title: 'Contar con condición',
  topic: 'Contar con condición',
  npc: { id: 'kai', name: 'KAI', title: 'Vigía de los árboles', sprite: 'kai', x: 12, y: 2 },
  greeting: 'Desde aquí arriba lo veo todo. Y lo que veo, lo cuento.',
  intro: [
    { speaker: 'KAI', text: '¡Eh, tú! Aquí arriba. Soy Kai, el vigía del bosque.' },
    { speaker: 'KAI', text: 'Mi trabajo es contar: cuántos árboles crecieron, cuántos son demasiado bajos...' },
    { speaker: 'KAI', text: 'No cuento todo, solo lo que cumple una condición. Un if dentro del recorrido y listo.' },
    { speaker: 'KAI', text: '¿Te enseño mi método o subes directo al duelo?' },
  ],
  lesson: {
    concept: 'CONTAR CON CONDICIÓN',
    goals: ['Usar un contador que empieza en 0', 'Sumar 1 solo cuando se cumple la condición', 'Separar casos con if / else if / else'],
    explanation:
      'Contar es recorrer con un contador al lado. El contador empieza en 0 y, cada vez que un elemento cumple la condición, sube en 1. ' +
      'Si quieres clasificar en varios grupos, usa if / else if / else: cada elemento cae exactamente en uno, ' +
      'así que la suma de los contadores siempre es N.',
    code: {
      python: code`
        import sys
        input = sys.stdin.readline

        n, k = map(int, input().split())
        a = list(map(int, input().split()))
        mayores = 0
        for x in a:
            if x > k:
                mayores += 1
        print(mayores)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, k;
            cin >> n >> k;
            vector<int> a(n);
            for (int i = 0; i < n; i++) cin >> a[i];
            int mayores = 0;
            for (int i = 0; i < n; i++) {
                if (a[i] > k) mayores++;
            }
            cout << mayores << "\n";
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
                int k = Integer.parseInt(st.nextToken());
                st = new StringTokenizer(br.readLine());
                int mayores = 0;
                for (int i = 0; i < n; i++) {
                    int x = Integer.parseInt(st.nextToken());
                    if (x > k) mayores++;
                }
                System.out.println(mayores);
            }
        }
      `,
    },
    examples: [
      { input: '5 3\n1 4 3 8 2', output: '2' },
      { input: '3 10\n1 2 3', output: '0' },
      { input: '4 0\n5 5 5 5', output: '4' },
    ],
    tips: {
      python: 'Para dos números en la misma línea: n, k = map(int, input().split()). elif es el else if de Python.',
      cpp: 'x++ suma 1 a x. Encadena casos con if (...) {...} else if (...) {...} else {...}.',
      java: 'Puedes leer cada número dentro del mismo for con st.nextToken(), sin guardar el arreglo.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          a = [5, 3, 8, 3, 1]
          c = 0
          for x in a:
              if x >= 3:
                  c += 1
          print(c)
        `,
        cpp: code`
          #include <iostream>
          #include <vector>
          using namespace std;

          int main() {
              vector<int> a = {5, 3, 8, 3, 1};
              int c = 0;
              for (int x : a) {
                  if (x >= 3) c++;
              }
              cout << c << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  int[] a = {5, 3, 8, 3, 1};
                  int c = 0;
                  for (int x : a) {
                      if (x >= 3) c++;
                  }
                  System.out.println(c);
              }
          }
        `,
      },
      options: ['2', '3', '4'],
      answer: 2,
      explanation: '>= incluye el propio 3: cuentan 5, 3, 8 y 3. Solo el 1 se queda fuera.',
      wrongHint: 'Revisa el operador: >= significa "mayor o igual". ¿Qué pasa con los dos 3?',
    },
  },
  problem: {
    id: 'p12-vigia-de-kai',
    title: 'LA VIGÍA DE KAI',
    statement:
      'Kai midió los N árboles del bosque: h₁, h₂, ..., hₙ. Para el informe de hoy usa una altura de referencia K. ' +
      'Cuenta cuántos árboles son más bajos que K, cuántos miden exactamente K y cuántos son más altos.',
    inputSpec: 'Línea 1: N y K. Línea 2: N enteros h₁ ... hₙ separados por espacios.',
    outputSpec: 'Una línea con tres números separados por un espacio: bajos, iguales y altos.',
    constraints: '1 ≤ N ≤ 2·10⁵ · 1 ≤ K, hᵢ ≤ 10⁹',
    difficulty: 'facil',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      vigia(5, [1, 5, 8, 5, 9, 2, 3]),
      vigia(10, [1, 2, 3]),
      vigia(7, [7, 7, 7, 7]),
      vigia(1, [1, 2, 1, 3]),
      vigia(1000000000, [999999999, 1000000000, 1]),
      vigia(4, [9]),
      vigia(50, pequenos),
      vigia(500000000, grandes),
    ]),
    starter: {
      python: code`
        import sys
        input = sys.stdin.readline

        n, k = map(int, input().split())
        h = list(map(int, input().split()))
        bajos = 0
        iguales = 0
        altos = 0
        # TODO: recorre h y suma 1 al contador que corresponda
        print(bajos, iguales, altos)
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
            vector<long long> h(n);
            for (int i = 0; i < n; i++) cin >> h[i];
            int bajos = 0, iguales = 0, altos = 0;
            // TODO: recorre h y suma 1 al contador que corresponda
            cout << bajos << " " << iguales << " " << altos << "\n";
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
                long[] h = new long[n];
                for (int i = 0; i < n; i++) h[i] = Long.parseLong(st.nextToken());
                int bajos = 0, iguales = 0, altos = 0;
                // TODO: recorre h y suma 1 al contador que corresponda
                System.out.println(bajos + " " + iguales + " " + altos);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        input = sys.stdin.readline

        n, k = map(int, input().split())
        h = list(map(int, input().split()))
        bajos = 0
        iguales = 0
        altos = 0
        for x in h:
            if x < k:
                bajos += 1
            elif x == k:
                iguales += 1
            else:
                altos += 1
        print(bajos, iguales, altos)
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
            vector<long long> h(n);
            for (int i = 0; i < n; i++) cin >> h[i];
            int bajos = 0, iguales = 0, altos = 0;
            for (int i = 0; i < n; i++) {
                if (h[i] < k) bajos++;
                else if (h[i] == k) iguales++;
                else altos++;
            }
            cout << bajos << " " << iguales << " " << altos << "\n";
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
                long[] h = new long[n];
                for (int i = 0; i < n; i++) h[i] = Long.parseLong(st.nextToken());
                int bajos = 0, iguales = 0, altos = 0;
                for (int i = 0; i < n; i++) {
                    if (h[i] < k) bajos++;
                    else if (h[i] == k) iguales++;
                    else altos++;
                }
                System.out.println(bajos + " " + iguales + " " + altos);
            }
        }
      `,
    },
    hints: [
      'Necesitas tres contadores que empiezan en 0, y un solo recorrido por los árboles.',
      'Cada árbol cae en exactamente un grupo: más bajo, igual o más alto que K. Las tres respuestas suman N.',
      'Usa if (h < K) bajos++; else if (h == K) iguales++; else altos++. Imprime los tres en una línea separados por espacios.',
    ],
  },
  outro: [
    { speaker: 'KAI', text: '¡Cuentas perfectas! Ni un árbol de más, ni uno de menos.' },
    { speaker: 'KAI', text: 'Baja un poco: Lupe lee los mensajes que el bosque escribe en las cortezas.' },
  ],
  rewardTip: {
    title: 'Contador',
    text: {
      python: 'c = 0 antes del for; dentro, if condición: c += 1. También vale sum(1 for x in a if x > k).',
      cpp: 'int c = 0; antes del for; dentro, if (condición) c++;. Clasifica con if / else if / else.',
      java: 'int c = 0; antes del for; dentro, if (condición) c++;. Clasifica con if / else if / else.',
    },
  },
};
