import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const cuaderno = (a: number[], q: number[]): [string, string] => {
  const s = new Set(a);
  return [
    `${a.length} ${q.length}\n${a.join(' ')}\n${q.join(' ')}`,
    [String(s.size), ...q.map((x) => (s.has(x) ? 'SI' : 'NO'))].join('\n'),
  ];
};

const r = rng(3535);
const lista = (n: number, lo: number, hi: number) => Array.from({ length: n }, () => r(lo, hi));
const N = 200000;
const Q = 10000;

const grandes = lista(N, 1, 1000000000);
// Mitad de las consultas son especies anotadas y mitad, al azar.
const consultasMitad = Array.from({ length: Q }, (_, i) => (i % 2 === 0 ? grandes[r(0, N - 1)]! : r(1, 1000000000)));
const pocas = lista(N, 1, 50);
const consultasPocas = lista(Q, 1, 100);
const todas = Array.from({ length: N }, () => 424242);
const consultasTodas = Array.from({ length: Q }, (_, i) => (i % 3 === 0 ? 424242 : 424242 + i));
const distintas = Array.from({ length: N }, (_, i) => 2 * i + 1);
const consultasPares = Array.from({ length: Q }, (_, i) => (i % 2 === 0 ? 2 * r(1, N) : 2 * r(0, N - 1) + 1));

export const nivel35: Level = {
  number: 35,
  id: 'n35-conjunto',
  title: 'Conjunto',
  topic: 'Conjuntos (set)',
  npc: { id: 'coral', name: 'CORAL', title: 'Pescadora de altura', sprite: 'npc35', x: 4, y: 7 },
  greeting: 'Si ya la anoté, no la vuelvo a anotar. Mi cuaderno no tiene repetidos.',
  intro: [
    { speaker: 'CORAL', text: '¡Hola! Soy Coral. Salgo a pescar antes del amanecer y anoto cada especie que saco.' },
    { speaker: 'CORAL', text: 'Pero en mi cuaderno solo me importa si una especie ya está o no, no cuántas veces la pesqué.' },
    { speaker: 'CORAL', text: 'Para eso existe el conjunto: guarda cada cosa una sola vez y responde al instante si algo está dentro.' },
    { speaker: 'CORAL', text: '¿Echamos la red sobre la lección o vamos directo al duelo?' },
  ],
  lesson: {
    concept: 'CONJUNTO (SET) · SIN REPETIDOS',
    goals: ['Guardar elementos sin repetidos', 'Preguntar si un elemento está en O(1) o O(log n)', 'Contar cuántos elementos distintos hay'],
    explanation:
      'Un conjunto guarda cada valor una sola vez: si agregas algo que ya estaba, no pasa nada. ' +
      'Su gran ventaja es preguntar "¿está x?" sin recorrer todo: en una lista eso cuesta O(n), en un conjunto casi nada. ' +
      'set de Python y unordered_set/HashSet no tienen orden; set de C++ y TreeSet de Java sí, de menor a mayor.',
    code: {
      python: code`
        n = int(input())
        especies = set()
        for x in input().split():
            especies.add(int(x))
        print(len(especies))
        print(*sorted(especies))
      `,
      cpp: code`
        #include <iostream>
        #include <set>
        using namespace std;

        int main() {
            int n;
            cin >> n;
            set<int> especies;  // ordenado y sin repetidos
            for (int i = 0; i < n; i++) {
                int x;
                cin >> x;
                especies.insert(x);
            }
            cout << especies.size() << "\n";
            bool primero = true;
            for (int x : especies) {
                if (!primero) cout << " ";
                cout << x;
                primero = false;
            }
            cout << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;
        import java.util.TreeSet;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                TreeSet<Integer> especies = new TreeSet<>();  // ordenado y sin repetidos
                for (int i = 0; i < n; i++) especies.add(sc.nextInt());
                System.out.println(especies.size());
                StringBuilder sb = new StringBuilder();
                for (int x : especies) {
                    if (sb.length() > 0) sb.append(" ");
                    sb.append(x);
                }
                System.out.println(sb);
            }
        }
      `,
    },
    examples: [
      { input: '6\n4 1 4 2 1 4', output: '3\n1 2 4' },
      { input: '3\n9 9 9', output: '1\n9' },
      { input: '4\n8 3 5 1', output: '4\n1 3 5 8' },
    ],
    tips: {
      python: 'x in conjunto es O(1); x in lista es O(n). Con 10⁴ preguntas sobre 2·10⁵ datos, esa diferencia decide el duelo.',
      cpp: 'unordered_set da count(x) en O(1) promedio; set lo da en O(log n) y además ordenado. Ambos sirven aquí.',
      java: 'HashSet<Integer> tiene contains(x) en O(1) promedio. TreeSet va ordenado, con contains en O(log n).',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          s = {3, 1, 3, 2, 1}
          s.add(5)
          s.add(3)
          print(len(s))
        `,
        cpp: code`
          #include <iostream>
          #include <set>
          using namespace std;

          int main() {
              set<int> s = {3, 1, 3, 2, 1};
              s.insert(5);
              s.insert(3);
              cout << s.size() << "\n";
              return 0;
          }
        `,
        java: code`
          import java.util.Arrays;
          import java.util.HashSet;

          public class Main {
              public static void main(String[] args) {
                  HashSet<Integer> s = new HashSet<>(Arrays.asList(3, 1, 3, 2, 1));
                  s.add(5);
                  s.add(3);
                  System.out.println(s.size());
              }
          }
        `,
      },
      options: ['4', '7', '5'],
      answer: 0,
      explanation: 'Al principio el conjunto es {1, 2, 3}. Se agrega el 5 y el 3 ya estaba: quedan 4 elementos.',
      wrongHint: 'Un conjunto ignora los repetidos, tanto al crearlo como al agregar.',
    },
  },
  problem: {
    id: 'p35-cuaderno-de-coral',
    title: 'EL CUADERNO DE CORAL',
    statement:
      'Coral pescó N peces y anotó el código de especie de cada uno (puede repetirse). ' +
      'Primero quiere saber cuántas especies distintas pescó. ' +
      'Luego su tripulación le hace Q preguntas: para cada código, ¿ya pescó esa especie? Responde SI o NO.',
    inputSpec: 'Línea 1: N y Q. Línea 2: N códigos de especie. Línea 3: Q códigos a consultar.',
    outputSpec: 'Línea 1: la cantidad de especies distintas. Luego Q líneas con SI o NO, en el orden de las preguntas.',
    constraints: '1 ≤ N ≤ 2·10⁵ · 1 ≤ Q ≤ 10⁴ · los códigos están entre 1 y 10⁹.',
    difficulty: 'facil',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      cuaderno([4, 7, 4, 1, 7], [7, 2, 1]),
      cuaderno([5, 5, 5], [5, 6]),
      cuaderno([1000000000], [1, 1000000000]),
      cuaderno([3, 1, 2, 3, 1, 2], [1, 2, 3, 4, 3, 2, 1]),
      cuaderno(grandes, consultasMitad),
      cuaderno(pocas, consultasPocas),
      cuaderno(todas, consultasTodas),
      cuaderno(distintas, consultasPares),
    ]),
    starter: {
      python: code`
        import sys

        datos = sys.stdin.buffer.read().split()
        n, q = int(datos[0]), int(datos[1])
        peces = datos[2:2 + n]
        preguntas = datos[2 + n:2 + n + q]
        # TODO: guarda las especies en un conjunto, imprime cuántas hay
        # y responde cada pregunta con SI o NO
      `,
      cpp: code`
        #include <iostream>
        #include <unordered_set>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, q;
            cin >> n >> q;
            unordered_set<int> especies;
            // TODO: lee los n códigos y agrégalos; imprime cuántas especies hay;
            // luego lee cada pregunta y responde SI o NO
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.HashSet;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int q = Integer.parseInt(st.nextToken());
                HashSet<Integer> especies = new HashSet<>();
                StringBuilder sb = new StringBuilder();
                // TODO: lee la línea de peces y agrégalos; anota cuántas especies hay;
                // luego lee la línea de preguntas y responde SI o NO
                System.out.print(sb);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys

        datos = sys.stdin.buffer.read().split()
        n, q = int(datos[0]), int(datos[1])
        peces = datos[2:2 + n]
        preguntas = datos[2 + n:2 + n + q]
        especies = set(int(x) for x in peces)
        out = [str(len(especies))]
        for x in preguntas:
            out.append("SI" if int(x) in especies else "NO")
        print("\n".join(out))
      `,
      cpp: code`
        #include <iostream>
        #include <unordered_set>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, q;
            cin >> n >> q;
            unordered_set<int> especies;
            especies.reserve(2 * n);
            for (int i = 0; i < n; i++) {
                int x;
                cin >> x;
                especies.insert(x);
            }
            cout << especies.size() << "\n";
            for (int i = 0; i < q; i++) {
                int x;
                cin >> x;
                cout << (especies.count(x) ? "SI" : "NO") << "\n";
            }
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.HashSet;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int q = Integer.parseInt(st.nextToken());
                HashSet<Integer> especies = new HashSet<>();
                StringBuilder sb = new StringBuilder();
                st = new StringTokenizer(br.readLine());
                for (int i = 0; i < n; i++) especies.add(Integer.parseInt(st.nextToken()));
                sb.append(especies.size()).append("\n");
                st = new StringTokenizer(br.readLine());
                for (int i = 0; i < q; i++) {
                    int x = Integer.parseInt(st.nextToken());
                    sb.append(especies.contains(x) ? "SI" : "NO").append("\n");
                }
                System.out.print(sb);
            }
        }
      `,
    },
    hints: [
      'No te importa cuántas veces salió cada especie, solo si salió. ¿Qué estructura guarda cada cosa una sola vez?',
      'Mete los N códigos en un conjunto: su tamaño es la cantidad de especies distintas.',
      'Para cada pregunta usa la pertenencia del conjunto (x in s, count(x), contains(x)). Buscar en la lista original cuesta N pasos por pregunta.',
    ],
  },
  outro: [
    { speaker: 'CORAL', text: '¡Red llena y sin un solo repetido! Así da gusto llevar el cuaderno.' },
    { speaker: 'CORAL', text: 'Cuando solo importa si algo está o no, el conjunto es tu mejor anzuelo.' },
    { speaker: 'CORAL', text: 'Cipriano, el mercader de balanzas, está al otro lado de la playa. Busca pesas que sumen justo lo que pide.' },
  ],
  rewardTip: {
    title: 'Conjunto',
    text: {
      python: 's = set(); s.add(x); x in s es O(1); len(s) cuenta distintos. sorted(s) si necesitas orden.',
      cpp: 'unordered_set<int> s; s.insert(x); s.count(x) para preguntar. set<int> si necesitas orden.',
      java: 'HashSet<Integer> s; s.add(x); s.contains(x); s.size(). TreeSet si necesitas orden.',
    },
  },
};
