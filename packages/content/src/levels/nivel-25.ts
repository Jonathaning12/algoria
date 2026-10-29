import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

/** Cuenta inversiones con merge sort (la misma idea que la solución). */
const inversiones = (orig: number[]): number => {
  const a = [...orig];
  const aux = new Array<number>(a.length);
  const rec = (lo: number, hi: number): number => {
    if (hi - lo <= 1) return 0;
    const mid = (lo + hi) >> 1;
    let inv = rec(lo, mid) + rec(mid, hi);
    let i = lo, j = mid, k = lo;
    while (i < mid && j < hi) {
      if (a[i]! <= a[j]!) aux[k++] = a[i++]!;
      else {
        inv += mid - i;
        aux[k++] = a[j++]!;
      }
    }
    while (i < mid) aux[k++] = a[i++]!;
    while (j < hi) aux[k++] = a[j++]!;
    for (let t = lo; t < hi; t++) a[t] = aux[t]!;
    return inv;
  };
  return rec(0, a.length);
};
const desorden = (a: number[]): [string, string] => [`${a.length}\n${a.join(' ')}`, String(inversiones(a))];

const N = 200000;
const r = rng(2525);
const aleatoria = Array.from({ length: N }, () => r(1, 1000000000));
const repetidas = Array.from({ length: N }, () => r(1, 3));
const decreciente = Array.from({ length: N }, (_, i) => N - i);
const creciente = Array.from({ length: N }, (_, i) => i + 1);
// Casi ordenada: unos pocos intercambios lejanos.
const casi = (() => {
  const a = [...creciente];
  for (let t = 0; t < 50; t++) {
    const i = r(0, N - 1), j = r(0, N - 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
})();

export const nivel25: Level = {
  number: 25,
  id: 'n25-merge-sort',
  title: 'Merge sort',
  topic: 'Divide y vencerás',
  npc: { id: 'estela', name: 'ESTELA', title: 'Guardiana de estalactitas', sprite: 'npc25', x: 9, y: 4 },
  greeting: 'Partir a la mitad, resolver cada mitad y juntar. Así se ordena hasta el techo de una cueva.',
  intro: [
    { speaker: 'ESTELA', text: 'Mira hacia arriba... con cuidado. Soy Estela y cuido las estalactitas de esta galería.' },
    { speaker: 'ESTELA', text: 'Quiero saber qué tan desordenadas están: cuántas parejas tienen una más alta a la izquierda de una más baja.' },
    { speaker: 'ESTELA', text: 'Son doscientas mil. Comparar cada pareja tomaría horas. Pero si las ordeno partiendo a la mitad, el conteo sale casi gratis.' },
    { speaker: 'ESTELA', text: '¿Te muestro cómo divido y venzo, o pasas directo al duelo?' },
  ],
  lesson: {
    concept: 'MERGE SORT · DIVIDE Y VENCERÁS',
    goals: ['Partir un problema en dos mitades', 'Mezclar dos listas ordenadas en O(n)', 'Contar algo mientras se mezcla'],
    explanation:
      'Divide y vencerás: parte el arreglo en dos mitades, ordena cada una con recursión (caso base: un solo elemento ya está ordenado) y luego mézclalas. ' +
      'Mezclar dos listas ordenadas es fácil: miras el primero de cada una y tomas el menor, una y otra vez. ' +
      'Hay unos log₂ n niveles de mitades y en cada nivel se mezclan n elementos, así que todo cuesta O(n log n). ' +
      'Bonus: cuando tomas un elemento de la mitad derecha, todos los que quedan en la izquierda son mayores que él. Cada uno es una pareja desordenada.',
    code: {
      python: code`
        def merge_sort(a):
            if len(a) <= 1:                 # caso base
                return a
            mid = len(a) // 2
            izq = merge_sort(a[:mid])       # dividir
            der = merge_sort(a[mid:])
            res = []                        # mezclar
            i = j = 0
            while i < len(izq) and j < len(der):
                if izq[i] <= der[j]:
                    res.append(izq[i])
                    i += 1
                else:
                    res.append(der[j])
                    j += 1
            res.extend(izq[i:])
            res.extend(der[j:])
            return res

        n = int(input())
        a = list(map(int, input().split()))
        print(*merge_sort(a))
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        vector<int> a, aux;

        void mergeSort(int lo, int hi) {           // ordena a[lo..hi)
            if (hi - lo <= 1) return;               // caso base
            int mid = (lo + hi) / 2;
            mergeSort(lo, mid);                     // dividir
            mergeSort(mid, hi);
            int i = lo, j = mid, k = lo;            // mezclar
            while (i < mid && j < hi) {
                if (a[i] <= a[j]) aux[k++] = a[i++];
                else aux[k++] = a[j++];
            }
            while (i < mid) aux[k++] = a[i++];
            while (j < hi) aux[k++] = a[j++];
            for (int t = lo; t < hi; t++) a[t] = aux[t];
        }

        int main() {
            int n;
            cin >> n;
            a.resize(n);
            aux.resize(n);
            for (auto& x : a) cin >> x;
            mergeSort(0, n);
            for (int i = 0; i < n; i++) cout << a[i] << (i + 1 < n ? " " : "\n");
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            static int[] a, aux;

            static void mergeSort(int lo, int hi) {    // ordena a[lo..hi)
                if (hi - lo <= 1) return;               // caso base
                int mid = (lo + hi) / 2;
                mergeSort(lo, mid);                     // dividir
                mergeSort(mid, hi);
                int i = lo, j = mid, k = lo;            // mezclar
                while (i < mid && j < hi) {
                    if (a[i] <= a[j]) aux[k++] = a[i++];
                    else aux[k++] = a[j++];
                }
                while (i < mid) aux[k++] = a[i++];
                while (j < hi) aux[k++] = a[j++];
                for (int t = lo; t < hi; t++) a[t] = aux[t];
            }

            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                a = new int[n];
                aux = new int[n];
                for (int i = 0; i < n; i++) a[i] = sc.nextInt();
                mergeSort(0, n);
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < n; i++) sb.append(a[i]).append(i + 1 < n ? " " : "");
                System.out.println(sb);
            }
        }
      `,
    },
    examples: [
      { input: '5\n5 2 4 1 3', output: '1 2 3 4 5' },
      { input: '4\n3 3 1 2', output: '1 2 3 3' },
      { input: '1\n42', output: '42' },
    ],
    tips: {
      python: 'La profundidad de merge sort es solo log₂ n (unos 18 con 2·10⁵): no hace falta subir el límite de recursión.',
      cpp: 'Reserva el arreglo auxiliar una sola vez, fuera de la recursión. Crear vectores en cada llamada es lento.',
      java: 'Reserva el arreglo auxiliar una sola vez, como static. Las inversiones pueden pasar de 2·10⁹: usa long.',
    },
    quiz: {
      question: '¿Cuántas parejas desordenadas tiene el arreglo? (el programa lo imprime)',
      code: {
        python: code`
          a = [4, 1, 3, 2]
          inv = 0
          for i in range(len(a)):
              for j in range(i + 1, len(a)):
                  if a[i] > a[j]:
                      inv += 1
          print(inv)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              int a[] = {4, 1, 3, 2};
              int n = 4, inv = 0;
              for (int i = 0; i < n; i++) {
                  for (int j = i + 1; j < n; j++) {
                      if (a[i] > a[j]) inv++;
                  }
              }
              cout << inv << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  int[] a = {4, 1, 3, 2};
                  int inv = 0;
                  for (int i = 0; i < a.length; i++) {
                      for (int j = i + 1; j < a.length; j++) {
                          if (a[i] > a[j]) inv++;
                      }
                  }
                  System.out.println(inv);
              }
          }
        `,
      },
      options: ['3', '4', '6'],
      answer: 1,
      explanation: 'Las parejas desordenadas son (4,1), (4,3), (4,2) y (3,2): cuatro. Este doble bucle sirve para comprobar, pero con 2·10⁵ datos sería O(n²).',
      wrongHint: 'Busca cada pareja en la que el de la izquierda sea mayor que el de la derecha. Empieza por todas las que forma el 4.',
    },
  },
  problem: {
    id: 'p25-desorden-de-estalactitas',
    title: 'EL DESORDEN DE LAS ESTALACTITAS',
    statement:
      'Estela anotó la altura de N estalactitas de izquierda a derecha: a₁, a₂, ..., aₙ. ' +
      'Una pareja (i, j) está desordenada si i < j y aᵢ > aⱼ: una más alta está a la izquierda de una más baja. ' +
      '¿Cuántas parejas desordenadas hay? Con N tan grande, comparar todas las parejas es demasiado lento.',
    inputSpec: 'Línea 1: N. Línea 2: N enteros a₁ ... aₙ.',
    outputSpec: 'Un número: la cantidad de parejas desordenadas.',
    constraints: '1 ≤ N ≤ 2·10⁵ · 1 ≤ aᵢ ≤ 10⁹ · La respuesta puede pasar de 2·10⁹.',
    difficulty: 'dificil',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      desorden([2, 4, 1, 3, 5]),
      desorden([1, 2, 3, 4]),
      desorden([7]),
      desorden([5, 5, 5, 5, 1]),
      desorden([9, 8, 7, 6, 5, 4, 3, 2, 1]),
      desorden(decreciente),
      desorden(aleatoria),
      desorden(repetidas),
      desorden(creciente),
      desorden(casi),
    ]),
    starter: {
      python: code`
        import sys

        def contar(a):
            # Ordena la lista a y devuelve cuántas parejas desordenadas tenía.
            if len(a) <= 1:
                return 0
            mid = len(a) // 2
            izq = a[:mid]
            der = a[mid:]
            inv = contar(izq) + contar(der)
            # TODO: mezcla izq y der de vuelta en a (a[k] = ...).
            # Cada vez que tomes uno de der, suma cuántos quedan en izq: len(izq) - i
            return inv

        data = sys.stdin.buffer.read().split()
        n = int(data[0])
        a = list(map(int, data[1:n + 1]))
        print(contar(a))
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        vector<long long> a, aux;

        long long contar(int lo, int hi) {         // ordena a[lo..hi) y cuenta
            if (hi - lo <= 1) return 0;
            int mid = (lo + hi) / 2;
            long long inv = contar(lo, mid) + contar(mid, hi);
            // TODO: mezcla a[lo..mid) y a[mid..hi) en aux y cópialo de vuelta.
            // Cada vez que tomes uno de la derecha, suma cuántos quedan a la izquierda: mid - i
            return inv;
        }

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n;
            cin >> n;
            a.resize(n);
            aux.resize(n);
            for (auto& x : a) cin >> x;
            cout << contar(0, n) << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.DataInputStream;

        public class Main {
            static int[] a, aux;

            static long contar(int lo, int hi) {       // ordena a[lo..hi) y cuenta
                if (hi - lo <= 1) return 0;
                int mid = (lo + hi) / 2;
                long inv = contar(lo, mid) + contar(mid, hi);
                // TODO: mezcla a[lo..mid) y a[mid..hi) en aux y cópialo de vuelta.
                // Cada vez que tomes uno de la derecha, suma cuántos quedan a la izquierda: mid - i
                return inv;
            }

            static DataInputStream in = new DataInputStream(System.in);

            static int leer() throws Exception {
                int r = 0, b = in.read();
                while (b < '0') b = in.read();
                while (b >= '0') {
                    r = r * 10 + (b - '0');
                    b = in.read();
                }
                return r;
            }

            public static void main(String[] args) throws Exception {
                int n = leer();
                a = new int[n];
                aux = new int[n];
                for (int i = 0; i < n; i++) a[i] = leer();
                System.out.println(contar(0, n));
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys

        def contar(a):
            if len(a) <= 1:
                return 0
            mid = len(a) // 2
            izq = a[:mid]
            der = a[mid:]
            inv = contar(izq) + contar(der)
            i = j = k = 0
            li, ld = len(izq), len(der)
            while i < li and j < ld:
                if izq[i] <= der[j]:
                    a[k] = izq[i]
                    i += 1
                else:
                    a[k] = der[j]
                    j += 1
                    inv += li - i
                k += 1
            a[k:] = izq[i:] + der[j:]
            return inv

        data = sys.stdin.buffer.read().split()
        n = int(data[0])
        a = list(map(int, data[1:n + 1]))
        print(contar(a))
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        vector<long long> a, aux;

        long long contar(int lo, int hi) {
            if (hi - lo <= 1) return 0;
            int mid = (lo + hi) / 2;
            long long inv = contar(lo, mid) + contar(mid, hi);
            int i = lo, j = mid, k = lo;
            while (i < mid && j < hi) {
                if (a[i] <= a[j]) aux[k++] = a[i++];
                else {
                    inv += mid - i;
                    aux[k++] = a[j++];
                }
            }
            while (i < mid) aux[k++] = a[i++];
            while (j < hi) aux[k++] = a[j++];
            for (int t = lo; t < hi; t++) a[t] = aux[t];
            return inv;
        }

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n;
            cin >> n;
            a.resize(n);
            aux.resize(n);
            for (auto& x : a) cin >> x;
            cout << contar(0, n) << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.DataInputStream;

        public class Main {
            static int[] a, aux;

            static long contar(int lo, int hi) {
                if (hi - lo <= 1) return 0;
                int mid = (lo + hi) / 2;
                long inv = contar(lo, mid) + contar(mid, hi);
                int i = lo, j = mid, k = lo;
                while (i < mid && j < hi) {
                    if (a[i] <= a[j]) aux[k++] = a[i++];
                    else {
                        inv += mid - i;
                        aux[k++] = a[j++];
                    }
                }
                while (i < mid) aux[k++] = a[i++];
                while (j < hi) aux[k++] = a[j++];
                for (int t = lo; t < hi; t++) a[t] = aux[t];
                return inv;
            }

            static DataInputStream in = new DataInputStream(System.in);

            static int leer() throws Exception {
                int r = 0, b = in.read();
                while (b < '0') b = in.read();
                while (b >= '0') {
                    r = r * 10 + (b - '0');
                    b = in.read();
                }
                return r;
            }

            public static void main(String[] args) throws Exception {
                int n = leer();
                a = new int[n];
                aux = new int[n];
                for (int i = 0; i < n; i++) a[i] = leer();
                System.out.println(contar(0, n));
            }
        }
      `,
    },
    hints: [
      'Comparar todas las parejas son N·(N - 1)/2 ≈ 2·10¹⁰ comparaciones: demasiado. Hay que contar mientras se ordena con merge sort.',
      'Al mezclar dos mitades ya ordenadas, si el primero de la derecha es menor que el primero de la izquierda, también es menor que todos los que quedan en la izquierda.',
      'En la mezcla: si izq[i] <= der[j], toma izq[i]; si no, toma der[j] y suma (tamaño de izq) - i. Total = inversiones de la izquierda + de la derecha + las de la mezcla. Usa long.',
    ],
  },
  outro: [
    { speaker: 'ESTELA', text: 'Doscientas mil estalactitas y el desorden contado en un instante. Dividir y vencer nunca falla.' },
    { speaker: 'ESTELA', text: 'Fíjate en el patrón: el problema grande se resolvió con dos problemas de la mitad y una mezcla rápida.' },
    { speaker: 'ESTELA', text: 'Gema guarda el catálogo de la mina al final de este túnel. Encuentra cualquier piedra en un abrir y cerrar de ojos.' },
  ],
  rewardTip: {
    title: 'Merge sort e inversiones',
    text: {
      python: 'Al mezclar, si tomas de la derecha: inv += len(izq) - i. Total O(n log n). Lee con sys.stdin.buffer.',
      cpp: 'Al mezclar, si a[j] < a[i]: inv += mid - i. Arreglo aux global y long long para el total.',
      java: 'Al mezclar, si a[j] < a[i]: inv += mid - i. Arreglo aux static y long para el total.',
    },
  },
};
