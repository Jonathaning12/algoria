import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const cortar = (h: number[], alto: number) => {
  let s = 0;
  for (const x of h) if (x > alto) s += x - alto;
  return s;
};
const maquina = (m: number, h: number[]): [string, string] => {
  let lo = 0;
  let hi = h.reduce((a, b) => Math.max(a, b), 0);
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    if (cortar(h, mid) >= m) lo = mid;
    else hi = mid - 1;
  }
  return [`${h.length} ${m}\n${h.join(' ')}`, String(lo)];
};

const N = 100000;
const r = rng(2727);
const altas = Array.from({ length: N }, () => r(1, 1000000000));
const total = altas.reduce((s, x) => s + x, 0);
const iguales = Array.from({ length: N }, () => 1000000000);
const bajas = Array.from({ length: N }, () => r(1, 1000));

export const nivel27: Level = {
  number: 27,
  id: 'n27-binaria-respuesta',
  title: 'Binaria sobre la respuesta',
  topic: 'Búsqueda binaria sobre la respuesta',
  npc: { id: 'pico', name: 'PICO', title: 'Picador de cristales', sprite: 'npc27', x: 4, y: 8 },
  greeting: '¿Más alta o más baja? Mi cuchilla encuentra la altura justa sin probarlas todas.',
  intro: [
    { speaker: 'PICO', text: '¡Clink, clink! Soy Pico. Corto las columnas de cristal de la cueva con mi máquina.' },
    { speaker: 'PICO', text: 'Pongo la cuchilla a una altura y corto todo lo que sobresale. Necesito cierta cantidad de cristal, pero quiero cortar lo menos posible.' },
    { speaker: 'PICO', text: 'Probar todas las alturas, de una en una, llevaría mil millones de intentos. Pero si una altura sirve, todas las más bajas también sirven...' },
    { speaker: 'PICO', text: '...y eso significa que puedo buscar la respuesta con búsqueda binaria. ¿Te lo explico o vamos al duelo?' },
  ],
  lesson: {
    concept: 'BÚSQUEDA BINARIA SOBRE LA RESPUESTA',
    goals: ['Reconocer una condición monótona: sí, sí, sí... no, no, no', 'Buscar el último "sí" con búsqueda binaria', 'Comprobar cada candidato con una función aparte'],
    explanation:
      'A veces no buscas un valor dentro de un arreglo, sino la respuesta misma. Si puedes escribir una función ok(x) que diga si x sirve, ' +
      'y los valores que sirven forman un bloque (todos los pequeños sí, todos los grandes no), puedes buscar el borde con búsqueda binaria. ' +
      'Mantén lo como un valor que sí sirve y hi como el máximo posible; prueba mid = (lo + hi + 1) / 2 y descarta la mitad que corresponda. ' +
      'Con respuestas hasta 10⁹ son solo unos 30 intentos.',
    code: {
      python: code`
        # la mayor x con x * x <= n
        n = int(input())
        lo, hi = 0, 10 ** 6         # lo siempre sirve
        while lo < hi:
            mid = (lo + hi + 1) // 2
            if mid * mid <= n:      # ok(mid)
                lo = mid            # mid sirve: la respuesta es mid o mayor
            else:
                hi = mid - 1        # mid no sirve: es menor
        print(lo)
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        // la mayor x con x * x <= n
        int main() {
            long long n;
            cin >> n;
            long long lo = 0, hi = 1000000;     // lo siempre sirve
            while (lo < hi) {
                long long mid = (lo + hi + 1) / 2;
                if (mid * mid <= n) lo = mid;   // mid sirve: la respuesta es mid o mayor
                else hi = mid - 1;              // mid no sirve: es menor
            }
            cout << lo << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        // la mayor x con x * x <= n
        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                long n = sc.nextLong();
                long lo = 0, hi = 1000000;          // lo siempre sirve
                while (lo < hi) {
                    long mid = (lo + hi + 1) / 2;
                    if (mid * mid <= n) lo = mid;   // mid sirve: la respuesta es mid o mayor
                    else hi = mid - 1;              // mid no sirve: es menor
                }
                System.out.println(lo);
            }
        }
      `,
    },
    examples: [
      { input: '10', output: '3' },
      { input: '16', output: '4' },
      { input: '1000000000000', output: '1000000' },
    ],
    tips: {
      python: 'Si buscas el último "sí", usa mid = (lo + hi + 1) // 2. Con (lo + hi) // 2 y lo = mid, el bucle puede no terminar nunca.',
      cpp: 'Si buscas el último "sí", usa mid = (lo + hi + 1) / 2. Y long long: mid * mid o las sumas desbordan int enseguida.',
      java: 'Si buscas el último "sí", usa mid = (lo + hi + 1) / 2. Y long: mid * mid o las sumas desbordan int enseguida.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          # el menor d entre 1 y 100 con d * d * d >= 50
          lo, hi = 1, 100
          while lo < hi:
              mid = (lo + hi) // 2
              if mid * mid * mid >= 50:
                  hi = mid
              else:
                  lo = mid + 1
          print(lo)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          // el menor d entre 1 y 100 con d * d * d >= 50
          int main() {
              int lo = 1, hi = 100;
              while (lo < hi) {
                  int mid = (lo + hi) / 2;
                  if (mid * mid * mid >= 50) hi = mid;
                  else lo = mid + 1;
              }
              cout << lo << "\n";
              return 0;
          }
        `,
        java: code`
          // el menor d entre 1 y 100 con d * d * d >= 50
          public class Main {
              public static void main(String[] args) {
                  int lo = 1, hi = 100;
                  while (lo < hi) {
                      int mid = (lo + hi) / 2;
                      if (mid * mid * mid >= 50) hi = mid;
                      else lo = mid + 1;
                  }
                  System.out.println(lo);
              }
          }
        `,
      },
      options: ['3', '4', '50'],
      answer: 1,
      explanation: '3³ = 27 no llega a 50, pero 4³ = 64 sí. La condición es "no, no, no, sí, sí..." y la búsqueda encuentra el primer sí: 4.',
      wrongHint: 'No hace falta seguir el bucle paso a paso: piensa qué número cumple la condición y es el más pequeño que lo hace.',
    },
  },
  problem: {
    id: 'p27-maquina-de-pico',
    title: 'LA MÁQUINA DE PICO',
    statement:
      'Hay N columnas de cristal con alturas h₁, ..., hₙ. Pico pone la cuchilla de su máquina a una altura entera H y corta todo lo que sobresale: ' +
      'de cada columna más alta que H se lleva hᵢ - H; las demás quedan intactas. ' +
      'Necesita llevarse al menos M unidades de cristal, pero quiere dañar la cueva lo menos posible, así que busca la mayor altura H que le alcance.',
    inputSpec: 'Línea 1: N y M. Línea 2: N enteros h₁ ... hₙ.',
    outputSpec: 'Un número: la mayor altura H (H ≥ 0) con la que se lleva al menos M unidades.',
    constraints: '1 ≤ N ≤ 10⁵ · 1 ≤ hᵢ ≤ 10⁹ · 1 ≤ M ≤ h₁ + ... + hₙ (siempre hay solución).',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      maquina(7, [20, 15, 10, 17]),
      maquina(20, [4, 42, 40, 26, 46]),
      maquina(1, [1]),
      maquina(10, [5, 5]),
      maquina(3, [1, 1, 1, 1, 1, 1000]),
      maquina(1, altas),
      maquina(Math.floor(total / 2), altas),
      maquina(total, altas),
      maquina(123456789, iguales),
      maquina(30000000, bajas),
    ]),
    starter: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        n, m = int(data[0]), int(data[1])
        h = list(map(int, data[2:2 + n]))

        def cortado(alto):
            return sum(x - alto for x in h if x > alto)

        lo, hi = 0, max(h)      # con altura 0 siempre alcanza
        # TODO: búsqueda binaria del último alto que sirve:
        # mid = (lo + hi + 1) // 2; si cortado(mid) >= m, lo = mid; si no, hi = mid - 1
        print(lo)
      `,
      cpp: code`
        #include <algorithm>
        #include <iostream>
        #include <vector>
        using namespace std;

        int n;
        long long m;
        vector<long long> h;

        long long cortado(long long alto) {
            long long s = 0;
            for (long long x : h) if (x > alto) s += x - alto;
            return s;
        }

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            cin >> n >> m;
            h.resize(n);
            for (auto& x : h) cin >> x;
            long long lo = 0, hi = *max_element(h.begin(), h.end());   // con altura 0 siempre alcanza
            // TODO: búsqueda binaria del último alto que sirve:
            // mid = (lo + hi + 1) / 2; si cortado(mid) >= m, lo = mid; si no, hi = mid - 1
            cout << lo << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.StringTokenizer;

        public class Main {
            static int n;
            static long[] h;

            static long cortado(long alto) {
                long s = 0;
                for (long x : h) if (x > alto) s += x - alto;
                return s;
            }

            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                n = Integer.parseInt(st.nextToken());
                long m = Long.parseLong(st.nextToken());
                h = new long[n];
                st = new StringTokenizer(br.readLine());
                long max = 0;
                for (int i = 0; i < n; i++) {
                    h[i] = Long.parseLong(st.nextToken());
                    max = Math.max(max, h[i]);
                }
                long lo = 0, hi = max;      // con altura 0 siempre alcanza
                // TODO: búsqueda binaria del último alto que sirve:
                // mid = (lo + hi + 1) / 2; si cortado(mid) >= m, lo = mid; si no, hi = mid - 1
                System.out.println(lo);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        n, m = int(data[0]), int(data[1])
        h = list(map(int, data[2:2 + n]))

        def cortado(alto):
            return sum(x - alto for x in h if x > alto)

        lo, hi = 0, max(h)
        while lo < hi:
            mid = (lo + hi + 1) // 2
            if cortado(mid) >= m:
                lo = mid
            else:
                hi = mid - 1
        print(lo)
      `,
      cpp: code`
        #include <algorithm>
        #include <iostream>
        #include <vector>
        using namespace std;

        int n;
        long long m;
        vector<long long> h;

        long long cortado(long long alto) {
            long long s = 0;
            for (long long x : h) if (x > alto) s += x - alto;
            return s;
        }

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            cin >> n >> m;
            h.resize(n);
            for (auto& x : h) cin >> x;
            long long lo = 0, hi = *max_element(h.begin(), h.end());
            while (lo < hi) {
                long long mid = (lo + hi + 1) / 2;
                if (cortado(mid) >= m) lo = mid;
                else hi = mid - 1;
            }
            cout << lo << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.StringTokenizer;

        public class Main {
            static int n;
            static long[] h;

            static long cortado(long alto) {
                long s = 0;
                for (long x : h) if (x > alto) s += x - alto;
                return s;
            }

            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                n = Integer.parseInt(st.nextToken());
                long m = Long.parseLong(st.nextToken());
                h = new long[n];
                st = new StringTokenizer(br.readLine());
                long max = 0;
                for (int i = 0; i < n; i++) {
                    h[i] = Long.parseLong(st.nextToken());
                    max = Math.max(max, h[i]);
                }
                long lo = 0, hi = max;
                while (lo < hi) {
                    long mid = (lo + hi + 1) / 2;
                    if (cortado(mid) >= m) lo = mid;
                    else hi = mid - 1;
                }
                System.out.println(lo);
            }
        }
      `,
    },
    hints: [
      'Probar todas las alturas desde la más alta hacia abajo puede costar 10⁹ intentos. Fíjate: si una altura H alcanza, cualquier altura más baja también alcanza.',
      'Escribe cortado(H), que suma lo que sobresale de cada columna: O(N). Luego busca con búsqueda binaria la mayor H con cortado(H) >= M; son unos 30 intentos.',
      'lo = 0 (siempre alcanza), hi = máximo. Mientras lo < hi: mid = (lo + hi + 1) / 2; si cortado(mid) >= M, lo = mid; si no, hi = mid - 1. Usa long para la suma.',
    ],
  },
  outro: [
    { speaker: 'PICO', text: '¡Corte perfecto! Ni una pizca de cristal de más, y sin probar mil millones de alturas.' },
    { speaker: 'PICO', text: 'Cuando la respuesta tenga forma de "sí, sí, sí... no, no", piensa en búsqueda binaria aunque no haya ningún arreglo ordenado.' },
    { speaker: 'PICO', text: 'Nico arma cordadas en este mismo túnel. Él busca parejas con dos dedos, uno en cada punta de la fila.' },
  ],
  rewardTip: {
    title: 'Binaria sobre la respuesta',
    text: {
      python: 'Último sí: while lo < hi: mid = (lo + hi + 1) // 2; lo = mid si ok(mid), si no hi = mid - 1.',
      cpp: 'Último sí: while (lo < hi) { mid = (lo + hi + 1) / 2; if (ok(mid)) lo = mid; else hi = mid - 1; }',
      java: 'Último sí: while (lo < hi) { mid = (lo + hi + 1) / 2; if (ok(mid)) lo = mid; else hi = mid - 1; }',
    },
  },
};
