import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const grua = (k: number, a: number[]): [string, string] => {
  const dq: number[] = [];
  let ini = 0;
  let suma = 0;
  let menor = Infinity;
  for (let i = 0; i < a.length; i++) {
    while (dq.length > ini && a[dq[dq.length - 1]!]! <= a[i]!) dq.pop();
    dq.push(i);
    if (dq[ini]! <= i - k) ini++;
    if (i >= k - 1) {
      const m = a[dq[ini]!]!;
      suma += m;
      if (m < menor) menor = m;
    }
  }
  return [`${a.length} ${k}\n${a.join(' ')}`, `${suma}\n${menor}`];
};

const N = 200000;
const r = rng(3939);
const aleatoria = Array.from({ length: N }, () => r(1, 1000000000));
// Bajada constante: el máximo de cada ventana es su primer contenedor.
const bajando = Array.from({ length: N }, (_, i) => N - i + 5);
const subiendo = Array.from({ length: N }, (_, i) => i + 1);
const pocos = Array.from({ length: N }, () => r(1, 3));

export const nivel39: Level = {
  number: 39,
  id: 'n39-deque-ventana',
  title: 'Deque y ventana',
  topic: 'Deque',
  npc: { id: 'faustino', name: 'FAUSTINO', title: 'Gruista del puerto', sprite: 'npc39', x: 9, y: 11 },
  greeting: 'Mi grúa ve K contenedores a la vez. Y siempre sabe cuál es el más pesado.',
  intro: [
    { speaker: 'FAUSTINO', text: '¡Eh, cuidado con la carga! Soy Faustino y manejo la grúa grande del puerto.' },
    { speaker: 'FAUSTINO', text: 'Los contenedores pasan en fila por debajo y mi grúa abarca K de ellos a la vez.' },
    { speaker: 'FAUSTINO', text: 'En cada posición necesito saber el más pesado de la ventana. Revisarlos todos cada vez me tomaría la vida entera.' },
    { speaker: 'FAUSTINO', text: 'Con una cola de dos puntas se hace en un suspiro. ¿Te enseño o vamos al duelo?' },
  ],
  lesson: {
    concept: 'DEQUE · MÁXIMO EN VENTANA',
    goals: ['Usar una cola de dos puntas (deque)', 'Guardar solo los candidatos a máximo', 'Calcular el máximo de cada ventana en O(n)'],
    explanation:
      'Un deque deja meter y sacar por ambos extremos en O(1). Para el máximo de una ventana, guarda posiciones con valores de mayor a menor. ' +
      'Cuando entra un valor, saca por atrás a los que no lo superan: ya nunca serán el máximo. Si el de adelante quedó fuera de la ventana, sácalo por delante. ' +
      'El frente siempre es el máximo, y cada posición entra y sale una sola vez: O(n).',
    code: {
      python: code`
        from collections import deque

        n, k = map(int, input().split())
        a = list(map(int, input().split()))
        dq = deque()  # posiciones, con valores de mayor a menor
        res = []
        for i in range(n):
            while dq and a[dq[-1]] <= a[i]:
                dq.pop()           # ya nunca será el máximo
            dq.append(i)
            if dq[0] <= i - k:
                dq.popleft()       # quedó fuera de la ventana
            if i >= k - 1:
                res.append(a[dq[0]])
        print(*res)
      `,
      cpp: code`
        #include <iostream>
        #include <deque>
        #include <vector>
        using namespace std;

        int main() {
            int n, k;
            cin >> n >> k;
            vector<int> a(n);
            for (int i = 0; i < n; i++) cin >> a[i];
            deque<int> dq;  // posiciones, con valores de mayor a menor
            bool primero = true;
            for (int i = 0; i < n; i++) {
                while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back();
                dq.push_back(i);
                if (dq.front() <= i - k) dq.pop_front();
                if (i >= k - 1) {
                    if (!primero) cout << " ";
                    cout << a[dq.front()];
                    primero = false;
                }
            }
            cout << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.ArrayDeque;
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                int k = sc.nextInt();
                int[] a = new int[n];
                for (int i = 0; i < n; i++) a[i] = sc.nextInt();
                ArrayDeque<Integer> dq = new ArrayDeque<>();  // posiciones, de mayor a menor
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < n; i++) {
                    while (!dq.isEmpty() && a[dq.peekLast()] <= a[i]) dq.pollLast();
                    dq.addLast(i);
                    if (dq.peekFirst() <= i - k) dq.pollFirst();
                    if (i >= k - 1) {
                        if (sb.length() > 0) sb.append(" ");
                        sb.append(a[dq.peekFirst()]);
                    }
                }
                System.out.println(sb);
            }
        }
      `,
    },
    examples: [
      { input: '8 3\n1 3 1 2 4 5 3 6', output: '3 3 4 5 5 6' },
      { input: '4 1\n5 2 7 1', output: '5 2 7 1' },
      { input: '5 5\n2 9 4 9 1', output: '9' },
    ],
    tips: {
      python: 'collections.deque: append/pop por atrás, appendleft/popleft por delante, dq[0] y dq[-1] para mirar. Todo O(1).',
      cpp: 'deque<int>: push_back, pop_back, pop_front, front, back. Guarda posiciones para saber cuándo un elemento sale de la ventana.',
      java: 'ArrayDeque: addLast, pollLast, pollFirst, peekFirst, peekLast. Guarda posiciones, no valores.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          from collections import deque

          d = deque([1, 2, 3])
          d.appendleft(0)
          d.append(4)
          d.popleft()
          d.pop()
          print(d[0], d[-1])
        `,
        cpp: code`
          #include <iostream>
          #include <deque>
          using namespace std;

          int main() {
              deque<int> d = {1, 2, 3};
              d.push_front(0);
              d.push_back(4);
              d.pop_front();
              d.pop_back();
              cout << d.front() << " " << d.back() << "\n";
              return 0;
          }
        `,
        java: code`
          import java.util.ArrayDeque;
          import java.util.Arrays;

          public class Main {
              public static void main(String[] args) {
                  ArrayDeque<Integer> d = new ArrayDeque<>(Arrays.asList(1, 2, 3));
                  d.addFirst(0);
                  d.addLast(4);
                  d.pollFirst();
                  d.pollLast();
                  System.out.println(d.peekFirst() + " " + d.peekLast());
              }
          }
        `,
      },
      options: ['0 4', '1 3', '2 3'],
      answer: 1,
      explanation: 'El 0 entró por delante y salió por delante; el 4 entró por atrás y salió por atrás. Queda 1 2 3.',
      wrongHint: 'Un deque tiene dos puertas. Fíjate por cuál entra y por cuál sale cada número.',
    },
  },
  problem: {
    id: 'p39-grua-de-faustino',
    title: 'LA GRÚA DE FAUSTINO',
    statement:
      'Pasan N contenedores en fila con pesos a₁, a₂, ..., aₙ. La grúa de Faustino abarca K contenedores seguidos y avanza de uno en uno: ' +
      'primero ve del 1 al K, luego del 2 al K+1, y así hasta el final. En cada posición anota el contenedor más pesado que ve. ' +
      'Imprime la suma de todos esos máximos y el menor de ellos. Cuidado: revisar los K contenedores en cada posición es demasiado lento.',
    inputSpec: 'Línea 1: N y K. Línea 2: N enteros a₁ ... aₙ.',
    outputSpec: 'Dos líneas: la suma de los máximos de todas las ventanas y el menor de esos máximos.',
    constraints: '1 ≤ K ≤ N ≤ 2·10⁵ · 1 ≤ aᵢ ≤ 10⁹ · La suma puede llegar a 2·10¹⁴: usa enteros de 64 bits.',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      grua(3, [1, 3, 1, 2, 4, 5, 3, 6]),
      grua(1, [5, 2, 7, 1]),
      grua(1, [42]),
      grua(5, [2, 9, 4, 9, 1]),
      grua(2, [4, 4, 4, 4, 4]),
      grua(100000, bajando),
      grua(1000, aleatoria),
      grua(N, aleatoria),
      grua(70000, subiendo),
      grua(50000, pocos),
    ]),
    starter: {
      python: code`
        import sys
        from collections import deque

        datos = sys.stdin.buffer.read().split()
        n, k = int(datos[0]), int(datos[1])
        a = list(map(int, datos[2:2 + n]))
        dq = deque()
        suma = 0
        menor = None
        # TODO: para cada i, saca por atrás los que no superan a a[i], mete i,
        # saca por delante si quedó fuera; desde i = k - 1, a[dq[0]] es el máximo
        print(suma)
        print(menor)
      `,
      cpp: code`
        #include <iostream>
        #include <deque>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, k;
            cin >> n >> k;
            vector<long long> a(n);
            for (int i = 0; i < n; i++) cin >> a[i];
            deque<int> dq;
            long long suma = 0, menor = -1;
            // TODO: para cada i, saca por atrás los que no superan a a[i], mete i,
            // saca por delante si quedó fuera; desde i = k - 1, a[dq.front()] es el máximo
            cout << suma << "\n" << menor << "\n";
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
                long[] a = new long[n];
                for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());
                int[] dq = new int[n];  // deque en un arreglo: posiciones de ini a fin - 1
                int ini = 0, fin = 0;
                long suma = 0, menor = Long.MAX_VALUE;
                // TODO: para cada i, saca por atrás los que no superan a a[i], mete i,
                // saca por delante si quedó fuera; desde i = k - 1, a[dq[ini]] es el máximo
                System.out.println(suma);
                System.out.println(menor);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        from collections import deque

        datos = sys.stdin.buffer.read().split()
        n, k = int(datos[0]), int(datos[1])
        a = list(map(int, datos[2:2 + n]))
        dq = deque()
        suma = 0
        menor = None
        for i in range(n):
            x = a[i]
            while dq and a[dq[-1]] <= x:
                dq.pop()
            dq.append(i)
            if dq[0] <= i - k:
                dq.popleft()
            if i >= k - 1:
                m = a[dq[0]]
                suma += m
                if menor is None or m < menor:
                    menor = m
        print(suma)
        print(menor)
      `,
      cpp: code`
        #include <iostream>
        #include <deque>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, k;
            cin >> n >> k;
            vector<long long> a(n);
            for (int i = 0; i < n; i++) cin >> a[i];
            deque<int> dq;
            long long suma = 0, menor = -1;
            for (int i = 0; i < n; i++) {
                while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back();
                dq.push_back(i);
                if (dq.front() <= i - k) dq.pop_front();
                if (i >= k - 1) {
                    long long m = a[dq.front()];
                    suma += m;
                    if (menor == -1 || m < menor) menor = m;
                }
            }
            cout << suma << "\n" << menor << "\n";
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
                long[] a = new long[n];
                for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());
                int[] dq = new int[n];  // deque en un arreglo: posiciones de ini a fin - 1
                int ini = 0, fin = 0;
                long suma = 0, menor = Long.MAX_VALUE;
                for (int i = 0; i < n; i++) {
                    while (fin > ini && a[dq[fin - 1]] <= a[i]) fin--;
                    dq[fin++] = i;
                    if (dq[ini] <= i - k) ini++;
                    if (i >= k - 1) {
                        long m = a[dq[ini]];
                        suma += m;
                        if (m < menor) menor = m;
                    }
                }
                System.out.println(suma);
                System.out.println(menor);
            }
        }
      `,
    },
    hints: [
      'Revisar K contenedores en cada una de las N - K + 1 posiciones son hasta 10¹⁰ pasos. Hay que reaprovechar el trabajo entre ventanas vecinas.',
      'Si entra un contenedor más pesado que otros que ya están en la ventana, esos otros nunca más serán el máximo: puedes olvidarlos.',
      'Guarda en un deque posiciones con pesos de mayor a menor. Para cada i: saca por atrás mientras a[atrás] <= a[i]; mete i; si el de adelante es <= i - K, sácalo. Desde i = K - 1, el de adelante es el máximo.',
    ],
  },
  outro: [
    { speaker: 'FAUSTINO', text: '¡Doscientos mil contenedores y la grúa ni se despeinó! Muy bien hecho.' },
    { speaker: 'FAUSTINO', text: 'Pila, cola, mapa, conjunto, heap y deque. Ya tienes la caja de herramientas completa.' },
    { speaker: 'FAUSTINO', text: 'Solo te falta la Capitana Marea, en el Gimnasio Puerto, a mi izquierda. Prepárate: no regala nada.' },
  ],
  rewardTip: {
    title: 'Deque monótono',
    text: {
      python: 'deque de posiciones: pop() mientras a[dq[-1]] <= a[i]; append(i); popleft() si dq[0] <= i - k. a[dq[0]] es el máximo.',
      cpp: 'deque<int>: pop_back mientras a[back] <= a[i]; push_back(i); pop_front si front <= i - k. O(n).',
      java: 'Un int[] con ini y fin funciona como deque rápido. O usa ArrayDeque<Integer> con pollLast/pollFirst.',
    },
  },
};
