import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const catalogo = (a: number[], q: number[]): [string, string] => {
  const pos = new Map<number, number>();
  a.forEach((x, i) => pos.set(x, i + 1));
  let encontradas = 0;
  let suma = 0;
  for (const x of q) {
    const p = pos.get(x);
    if (p !== undefined) {
      encontradas++;
      suma += p;
    }
  }
  return [`${a.length} ${q.length}\n${a.join(' ')}\n${q.join(' ')}`, `${encontradas}\n${suma}`];
};

const N = 200000;
const r = rng(2626);
/** n códigos distintos y ordenados entre 1 y max. */
const codigos = (n: number, max: number) => {
  const s = new Set<number>();
  while (s.size < n) s.add(r(1, max));
  return [...s].sort((x, y) => x - y);
};
const grande = codigos(N, 1000000000);
const mezcla = Array.from({ length: N }, (_, i) => (i % 2 === 0 ? grande[r(0, N - 1)]! : r(1, 1000000000)));
const todas = Array.from({ length: N }, () => grande[r(0, N - 1)]!);
// Ninguna está y todas son mayores que el último: la búsqueda lineal recorre el catálogo entero.
const ninguna = Array.from({ length: N }, () => 1000000000 + r(1, 1000));
const pares = Array.from({ length: N }, (_, i) => 2 * (i + 1));
const consultasPares = Array.from({ length: N }, () => r(1, 2 * N));

export const nivel26: Level = {
  number: 26,
  id: 'n26-busqueda-binaria',
  title: 'Búsqueda binaria',
  topic: 'Búsqueda binaria',
  npc: { id: 'gema', name: 'GEMA', title: 'Catalogadora de gemas', sprite: 'npc26', x: 4, y: 4 },
  greeting: '¿Está o no está? Abro el catálogo por la mitad y en veinte pasos te respondo.',
  intro: [
    { speaker: 'GEMA', text: 'Hola. Soy Gema y llevo el catálogo de todas las piedras de la mina, ordenado por código.' },
    { speaker: 'GEMA', text: 'Los mercaderes me traen montones de piedras y preguntan si cada una está en el catálogo, y en qué página.' },
    { speaker: 'GEMA', text: 'Si leyera el catálogo de principio a fin cada vez, me harían falta años. Como está ordenado, lo abro por la mitad y descarto la mitad que no sirve.' },
    { speaker: 'GEMA', text: '¿Te enseño mi método o vamos directo al duelo?' },
  ],
  lesson: {
    concept: 'BÚSQUEDA BINARIA',
    goals: ['Buscar en un arreglo ordenado partiendo a la mitad', 'Mantener el intervalo [lo, hi] donde puede estar la respuesta', 'Pasar de O(n) a O(log n) por consulta'],
    explanation:
      'Si el arreglo está ordenado, mira el elemento del medio: si es el que buscas, listo; si es menor, la respuesta solo puede estar a la derecha; si es mayor, a la izquierda. ' +
      'Cada paso descarta la mitad, así que con 2·10⁵ elementos bastan unos 18 pasos: eso es O(log n). ' +
      'Con q consultas, buscar de a uno cuesta O(n·q), pero con búsqueda binaria es O(q log n). ' +
      'El truco está en los bordes: el intervalo es [lo, hi] y el bucle sigue mientras lo <= hi.',
    code: {
      python: code`
        n, x = map(int, input().split())
        a = list(map(int, input().split()))
        lo, hi = 0, n - 1
        pos = -1
        while lo <= hi:
            mid = (lo + hi) // 2
            if a[mid] == x:
                pos = mid + 1
                break
            elif a[mid] < x:
                lo = mid + 1    # está a la derecha
            else:
                hi = mid - 1    # está a la izquierda
        print(pos)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            int n;
            long long x;
            cin >> n >> x;
            vector<long long> a(n);
            for (auto& v : a) cin >> v;
            int lo = 0, hi = n - 1, pos = -1;
            while (lo <= hi) {
                int mid = (lo + hi) / 2;
                if (a[mid] == x) {
                    pos = mid + 1;
                    break;
                } else if (a[mid] < x) {
                    lo = mid + 1;   // está a la derecha
                } else {
                    hi = mid - 1;   // está a la izquierda
                }
            }
            cout << pos << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                long x = sc.nextLong();
                long[] a = new long[n];
                for (int i = 0; i < n; i++) a[i] = sc.nextLong();
                int lo = 0, hi = n - 1, pos = -1;
                while (lo <= hi) {
                    int mid = (lo + hi) / 2;
                    if (a[mid] == x) {
                        pos = mid + 1;
                        break;
                    } else if (a[mid] < x) {
                        lo = mid + 1;   // está a la derecha
                    } else {
                        hi = mid - 1;   // está a la izquierda
                    }
                }
                System.out.println(pos);
            }
        }
      `,
    },
    examples: [
      { input: '5 7\n1 3 5 7 9', output: '4' },
      { input: '5 4\n1 3 5 7 9', output: '-1' },
      { input: '1 2\n2', output: '1' },
    ],
    tips: {
      python: 'from bisect import bisect_left hace la búsqueda por ti: i = bisect_left(a, x) y luego revisa si a[i] == x (si i < n).',
      cpp: 'lower_bound(a.begin(), a.end(), x) devuelve un iterador al primero >= x. Réstale a.begin() para tener la posición.',
      java: 'Arrays.binarySearch(a, x) devuelve la posición si está, o un número negativo si no está.',
    },
    quiz: {
      question: '¿Cuántos pasos da para adivinar el 1 entre 1 y 1000? (el programa lo imprime)',
      code: {
        python: code`
          lo, hi = 1, 1000
          secreto = 1
          pasos = 0
          while lo <= hi:
              mid = (lo + hi) // 2
              pasos += 1
              if mid == secreto:
                  break
              elif mid < secreto:
                  lo = mid + 1
              else:
                  hi = mid - 1
          print(pasos)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              int lo = 1, hi = 1000, secreto = 1, pasos = 0;
              while (lo <= hi) {
                  int mid = (lo + hi) / 2;
                  pasos++;
                  if (mid == secreto) break;
                  else if (mid < secreto) lo = mid + 1;
                  else hi = mid - 1;
              }
              cout << pasos << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  int lo = 1, hi = 1000, secreto = 1, pasos = 0;
                  while (lo <= hi) {
                      int mid = (lo + hi) / 2;
                      pasos++;
                      if (mid == secreto) break;
                      else if (mid < secreto) lo = mid + 1;
                      else hi = mid - 1;
                  }
                  System.out.println(pasos);
              }
          }
        `,
      },
      options: ['9', '500', '1000'],
      answer: 0,
      explanation: 'Prueba 500, 250, 125, 62, 31, 15, 7, 3 y 1: nueve pasos. Como 2¹⁰ = 1024, nunca hacen falta más de 10.',
      wrongHint: 'No recorre los números de uno en uno: cada paso parte el intervalo a la mitad. ¿Cuántas veces se puede partir 1000 hasta llegar a 1?',
    },
  },
  problem: {
    id: 'p26-catalogo-de-gemas',
    title: 'EL CATÁLOGO DE GEMAS',
    statement:
      'El catálogo de Gema tiene N códigos distintos, ordenados de menor a mayor; el código de la página i está en la posición i (desde 1). ' +
      'Un mercader trae Q piedras y pregunta por el código de cada una. ' +
      'Para no imprimir tanto, Gema solo anota dos cosas: cuántas de las Q piedras están en el catálogo y la suma de las posiciones de las que sí están.',
    inputSpec: 'Línea 1: N y Q. Línea 2: los N códigos del catálogo, ordenados de menor a mayor. Línea 3: los Q códigos que pregunta el mercader.',
    outputSpec: 'Dos líneas: cuántas consultas están en el catálogo y la suma de sus posiciones (si una piedra se pregunta dos veces, cuenta dos veces).',
    constraints: '1 ≤ N, Q ≤ 2·10⁵ · 1 ≤ códigos ≤ 2·10⁹ · La suma puede pasar de 2·10⁹.',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      catalogo([2, 4, 6, 8, 10], [4, 5, 10, 1]),
      catalogo([10, 20, 30], [30, 30, 15]),
      catalogo([7], [7, 6, 8]),
      catalogo([1, 3, 5, 7, 9, 11], [11, 1, 2, 12, 9]),
      catalogo(grande, mezcla),
      catalogo(grande, todas),
      catalogo(grande, ninguna),
      catalogo(pares, consultasPares),
    ]),
    starter: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        n, q = int(data[0]), int(data[1])
        a = list(map(int, data[2:2 + n]))
        consultas = list(map(int, data[2 + n:2 + n + q]))
        encontradas = 0
        suma = 0
        for x in consultas:
            # TODO: busca x en a con búsqueda binaria (lo, hi, mid).
            # Si está en el índice mid, suma 1 a encontradas y mid + 1 a suma.
            pass
        print(encontradas)
        print(suma)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, q;
            cin >> n >> q;
            vector<long long> a(n);
            for (auto& v : a) cin >> v;
            long long encontradas = 0, suma = 0;
            for (int t = 0; t < q; t++) {
                long long x;
                cin >> x;
                // TODO: busca x en a con búsqueda binaria (lo, hi, mid).
                // Si está en el índice mid, suma 1 a encontradas y mid + 1 a suma.
            }
            cout << encontradas << "\n" << suma << "\n";
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
                int q = Integer.parseInt(st.nextToken());
                long[] a = new long[n];
                st = new StringTokenizer(br.readLine());
                for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());
                st = new StringTokenizer(br.readLine());
                long encontradas = 0, suma = 0;
                for (int t = 0; t < q; t++) {
                    long x = Long.parseLong(st.nextToken());
                    // TODO: busca x en a con búsqueda binaria (lo, hi, mid).
                    // Si está en el índice mid, suma 1 a encontradas y mid + 1 a suma.
                }
                System.out.println(encontradas);
                System.out.println(suma);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        from bisect import bisect_left

        data = sys.stdin.buffer.read().split()
        n, q = int(data[0]), int(data[1])
        a = list(map(int, data[2:2 + n]))
        consultas = list(map(int, data[2 + n:2 + n + q]))
        encontradas = 0
        suma = 0
        for x in consultas:
            i = bisect_left(a, x)
            if i < n and a[i] == x:
                encontradas += 1
                suma += i + 1
        print(encontradas)
        print(suma)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, q;
            cin >> n >> q;
            vector<long long> a(n);
            for (auto& v : a) cin >> v;
            long long encontradas = 0, suma = 0;
            for (int t = 0; t < q; t++) {
                long long x;
                cin >> x;
                int lo = 0, hi = n - 1;
                while (lo <= hi) {
                    int mid = (lo + hi) / 2;
                    if (a[mid] == x) {
                        encontradas++;
                        suma += mid + 1;
                        break;
                    } else if (a[mid] < x) {
                        lo = mid + 1;
                    } else {
                        hi = mid - 1;
                    }
                }
            }
            cout << encontradas << "\n" << suma << "\n";
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
                int q = Integer.parseInt(st.nextToken());
                long[] a = new long[n];
                st = new StringTokenizer(br.readLine());
                for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());
                st = new StringTokenizer(br.readLine());
                long encontradas = 0, suma = 0;
                for (int t = 0; t < q; t++) {
                    long x = Long.parseLong(st.nextToken());
                    int lo = 0, hi = n - 1;
                    while (lo <= hi) {
                        int mid = (lo + hi) / 2;
                        if (a[mid] == x) {
                            encontradas++;
                            suma += mid + 1;
                            break;
                        } else if (a[mid] < x) {
                            lo = mid + 1;
                        } else {
                            hi = mid - 1;
                        }
                    }
                }
                System.out.println(encontradas);
                System.out.println(suma);
            }
        }
      `,
    },
    hints: [
      'Recorrer el catálogo entero en cada consulta son hasta N·Q = 4·10¹⁰ pasos. Aprovecha que está ordenado.',
      'Para cada consulta, mira el código del medio del intervalo [lo, hi]: si es menor que x, descarta la mitad izquierda; si es mayor, la derecha.',
      'lo = 0, hi = n - 1; mientras lo <= hi: mid = (lo + hi) / 2; si a[mid] == x, suma 1 y mid + 1 y corta; si a[mid] < x, lo = mid + 1; si no, hi = mid - 1. Usa long para la suma.',
    ],
  },
  outro: [
    { speaker: 'GEMA', text: 'Doscientas mil consultas y ni una página leída de más. Eso es buscar con cabeza.' },
    { speaker: 'GEMA', text: 'Recuerda: la búsqueda binaria solo funciona si los datos están ordenados. Ordenar primero suele valer la pena.' },
    { speaker: 'GEMA', text: 'Cruza los puentes del lago subterráneo. Pico, el picador, usa este mismo truco... pero para adivinar respuestas.' },
  ],
  rewardTip: {
    title: 'Búsqueda binaria',
    text: {
      python: 'i = bisect_left(a, x); está si i < n and a[i] == x. O(log n) por consulta en vez de O(n).',
      cpp: 'while (lo <= hi) { mid = (lo + hi) / 2; ... lo = mid + 1 o hi = mid - 1; }. O(log n) por consulta.',
      java: 'while (lo <= hi) { mid = (lo + hi) / 2; ... }. O Arrays.binarySearch(a, x) >= 0. O(log n) por consulta.',
    },
  },
};
