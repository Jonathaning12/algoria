import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const sendero = (a: number[], qs: [number, number][]): [string, string] => {
  const p: bigint[] = [0n];
  for (const x of a) p.push(p[p.length - 1]! + BigInt(x));
  return [
    `${a.length} ${qs.length}\n${a.join(' ')}\n${qs.map(([l, r]) => `${l} ${r}`).join('\n')}`,
    qs.map(([l, r]) => `${p[r]! - p[l - 1]!}`).join('\n'),
  ];
};

const consultas = (seed: number, n: number, q: number): [number, number][] => {
  const r = rng(seed);
  return Array.from({ length: q }, () => {
    const a = r(1, n);
    const b = r(1, n);
    return [Math.min(a, b), Math.max(a, b)];
  });
};

const N = 100000;
const piedras = (() => {
  const r = rng(1717);
  return Array.from({ length: N }, () => r(0, 1000000000));
})();
const pesadas = Array.from({ length: N }, () => 1000000000);
const completas: [number, number][] = Array.from({ length: 3000 }, (_, i) => [1 + (i % 5), N - (i % 7)]);

export const nivel17: Level = {
  number: 17,
  id: 'n17-sumas-acumuladas',
  title: 'Sumas acumuladas',
  topic: 'Sumas acumuladas',
  npc: { id: 'zoe', name: 'ZOE', title: 'Cartógrafa del sendero', sprite: 'zoe', x: 9, y: 8 },
  greeting: '¿Cuántas piedras hay del tramo 3 al 8? Pregúntame lo que quieras: ya hice mis cuentas.',
  intro: [
    { speaker: 'ZOE', text: '¡Hola! Soy Zoe y estoy dibujando el mapa del sendero, tramo por tramo.' },
    { speaker: 'ZOE', text: 'Los viajeros me preguntan cuántas piedras hay entre dos tramos. Miles de veces al día.' },
    { speaker: 'ZOE', text: 'Si sumara el tramo completo en cada pregunta, no terminaría nunca. Así que hago un truco: sumas acumuladas.' },
    { speaker: 'ZOE', text: '¿Te enseño el truco o vamos directo al duelo?' },
  ],
  lesson: {
    concept: 'SUMAS ACUMULADAS',
    goals: ['Construir el arreglo de sumas acumuladas p', 'Responder la suma de a[l..r] como p[r] - p[l - 1]', 'Contestar cada pregunta sin volver a recorrer'],
    explanation:
      'Guarda en p[i] la suma de los primeros i elementos, con p[0] = 0. Se construye en un solo recorrido: p[i] = p[i - 1] + a[i]. ' +
      'Así, la suma del tramo de l a r (contando desde 1) es p[r] - p[l - 1]: lo acumulado hasta r, menos lo que había antes de l. ' +
      'Construir p cuesta un recorrido; después, cada pregunta se responde con una sola resta.',
    code: {
      python: code`
        n = int(input())
        a = list(map(int, input().split()))
        p = [0] * (n + 1)
        for i in range(1, n + 1):
            p[i] = p[i - 1] + a[i - 1]
        print(*p[1:])
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            int n;
            cin >> n;
            vector<long long> a(n + 1), p(n + 1, 0);
            for (int i = 1; i <= n; i++) cin >> a[i];
            for (int i = 1; i <= n; i++) p[i] = p[i - 1] + a[i];
            for (int i = 1; i <= n; i++) cout << p[i] << (i < n ? " " : "\n");
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
                long[] p = new long[n + 1];
                for (int i = 1; i <= n; i++) p[i] = p[i - 1] + Long.parseLong(st.nextToken());
                StringBuilder sb = new StringBuilder();
                for (int i = 1; i <= n; i++) sb.append(p[i]).append(i < n ? " " : "\n");
                System.out.print(sb);
            }
        }
      `,
    },
    examples: [
      { input: '4\n3 1 4 1', output: '3 4 8 9' },
      { input: '1\n5', output: '5' },
      { input: '5\n2 0 2 0 2', output: '2 2 4 4 6' },
    ],
    tips: {
      python: 'Haz p de tamaño n + 1 con p[0] = 0: así p[r] - p[l - 1] funciona incluso cuando l = 1.',
      cpp: 'p de tamaño n + 1 y en long long: la suma de 10⁵ valores de 10⁹ no cabe en int.',
      java: 'p de tamaño n + 1 y en long. Junta las respuestas en un StringBuilder y imprímelas al final.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          a = [2, 5, 1, 3]
          p = [0, 2, 7, 8, 11]
          print(p[4] - p[1])
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              int p[5] = {0, 2, 7, 8, 11};
              cout << p[4] - p[1] << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  int[] p = {0, 2, 7, 8, 11};
                  System.out.println(p[4] - p[1]);
              }
          }
        `,
      },
      options: ['9', '11', '6'],
      answer: 0,
      explanation: 'p[4] - p[1] = 11 - 2 = 9: es la suma de los tramos 2 al 4 (5 + 1 + 3).',
      wrongHint: 'Solo hay que restar dos valores de p. ¿Cuánto vale p[4]? ¿Y p[1]?',
    },
  },
  problem: {
    id: 'p17-sendero-de-zoe',
    title: 'EL SENDERO DE ZOE',
    statement:
      'El sendero tiene N tramos numerados del 1 al N, y en el tramo i hay aᵢ piedras. ' +
      'Llegan Q viajeros, y cada uno pregunta cuántas piedras hay en total desde el tramo l hasta el tramo r (ambos incluidos). Responde a todos.',
    inputSpec: 'Línea 1: N y Q. Línea 2: N enteros a₁ ... aₙ. Luego Q líneas, cada una con l y r.',
    outputSpec: 'Q líneas: la respuesta a cada pregunta, en orden.',
    constraints: '1 ≤ N ≤ 10⁵ · 1 ≤ Q ≤ 3000 · 0 ≤ aᵢ ≤ 10⁹ · 1 ≤ l ≤ r ≤ N',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      sendero([3, 1, 4, 1, 5], [[1, 5], [2, 4], [3, 3]]),
      sendero([7], [[1, 1]]),
      sendero([0, 0, 0], [[1, 3], [2, 2]]),
      sendero([5, 10, 15, 20], [[1, 1], [4, 4], [1, 4], [2, 3]]),
      sendero(piedras.slice(0, 50), consultas(17, 50, 50)),
      sendero(piedras, consultas(171, N, 3000)),
      sendero(pesadas, completas),
      sendero(piedras, consultas(1771, N, 2500)),
    ]),
    starter: {
      python: code`
        import sys
        input = sys.stdin.readline

        n, q = map(int, input().split())
        a = list(map(int, input().split()))
        p = [0] * (n + 1)
        # TODO: llena p con las sumas acumuladas
        res = []
        for _ in range(q):
            l, r = map(int, input().split())
            # TODO: agrega a res la suma de a[l..r] usando p
        print("\n".join(map(str, res)))
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
            vector<long long> a(n + 1), p(n + 1, 0);
            for (int i = 1; i <= n; i++) cin >> a[i];
            // TODO: llena p con las sumas acumuladas
            while (q--) {
                int l, r;
                cin >> l >> r;
                long long suma = 0;
                // TODO: calcula la suma de a[l..r] usando p
                cout << suma << "\n";
            }
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
                st = new StringTokenizer(br.readLine());
                long[] a = new long[n + 1];
                for (int i = 1; i <= n; i++) a[i] = Long.parseLong(st.nextToken());
                long[] p = new long[n + 1];
                // TODO: llena p con las sumas acumuladas
                StringBuilder sb = new StringBuilder();
                for (int k = 0; k < q; k++) {
                    st = new StringTokenizer(br.readLine());
                    int l = Integer.parseInt(st.nextToken());
                    int r = Integer.parseInt(st.nextToken());
                    long suma = 0;
                    // TODO: calcula la suma de a[l..r] usando p
                    sb.append(suma).append("\n");
                }
                System.out.print(sb);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        input = sys.stdin.readline

        n, q = map(int, input().split())
        a = list(map(int, input().split()))
        p = [0] * (n + 1)
        for i in range(1, n + 1):
            p[i] = p[i - 1] + a[i - 1]
        res = []
        for _ in range(q):
            l, r = map(int, input().split())
            res.append(p[r] - p[l - 1])
        print("\n".join(map(str, res)))
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
            vector<long long> a(n + 1), p(n + 1, 0);
            for (int i = 1; i <= n; i++) cin >> a[i];
            for (int i = 1; i <= n; i++) p[i] = p[i - 1] + a[i];
            while (q--) {
                int l, r;
                cin >> l >> r;
                cout << p[r] - p[l - 1] << "\n";
            }
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
                st = new StringTokenizer(br.readLine());
                long[] p = new long[n + 1];
                for (int i = 1; i <= n; i++) p[i] = p[i - 1] + Long.parseLong(st.nextToken());
                StringBuilder sb = new StringBuilder();
                for (int k = 0; k < q; k++) {
                    st = new StringTokenizer(br.readLine());
                    int l = Integer.parseInt(st.nextToken());
                    int r = Integer.parseInt(st.nextToken());
                    sb.append(p[r] - p[l - 1]).append("\n");
                }
                System.out.print(sb);
            }
        }
      `,
    },
    hints: [
      'Sumar el tramo completo en cada pregunta funciona, pero repite trabajo. ¿Y si preparas algo una sola vez antes de las preguntas?',
      'Arma p con p[0] = 0 y p[i] = p[i - 1] + a[i]. p[i] es el total de piedras desde el tramo 1 hasta el i.',
      'La respuesta de (l, r) es p[r] - p[l - 1]. Usa long long / long: la suma puede llegar a 10¹⁴.',
    ],
  },
  outro: [
    { speaker: 'ZOE', text: '¡Exacto! Una resta por pregunta. Tu mapa ya está listo para cualquier viajero.' },
    { speaker: 'ZOE', text: 'Dante, el vigía nocturno, vive al este. Le obsesiona que sus cuentas sean rápidas. Muy rápidas.' },
  ],
  rewardTip: {
    title: 'Sumas acumuladas',
    text: {
      python: 'p[0] = 0; p[i] = p[i - 1] + a[i - 1]. Suma de l a r (desde 1): p[r] - p[l - 1].',
      cpp: 'vector<long long> p(n + 1); p[i] = p[i - 1] + a[i]. Suma de l a r: p[r] - p[l - 1].',
      java: 'long[] p = new long[n + 1]; p[i] = p[i - 1] + a[i]. Suma de l a r: p[r] - p[l - 1].',
    },
  },
};
