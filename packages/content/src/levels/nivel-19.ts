import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const conteo = (s: string) => {
  const c = new Array<number>(26).fill(0);
  for (const ch of s) c[ch.charCodeAt(0) - 97]!++;
  return c.join(',');
};
const anagramas = (pares: [string, string][]): [string, string] => [
  `${pares.length}\n${pares.map(([a, b]) => `${a} ${b}`).join('\n')}`,
  pares.map(([a, b]) => (conteo(a) === conteo(b) ? 'SI' : 'NO')).join('\n'),
];

const r = rng(1919);
const palabra = (len: number, letras = 26) => Array.from({ length: len }, () => String.fromCharCode(97 + r(0, letras - 1))).join('');
const barajar = (s: string) => {
  const a = [...s];
  for (let i = a.length - 1; i > 0; i--) {
    const j = r(0, i);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a.join('');
};
const cambiarUna = (s: string) => {
  const i = r(0, s.length - 1);
  const c = s[i] === 'a' ? 'b' : 'a';
  return s.slice(0, i) + c + s.slice(i + 1);
};

const larga1 = palabra(100000);
const larga2 = palabra(100000, 3);
const largos: [string, string][] = [
  [larga1, barajar(larga1)],
  [larga2, cambiarUna(barajar(larga2))],
];
const variados: [string, string][] = Array.from({ length: 10 }, (_, i) => {
  const a = palabra(r(1, 30), 4);
  return [a, i % 2 === 0 ? barajar(a) : cambiarUna(barajar(a))];
});

export const nivel19: Level = {
  number: 19,
  id: 'n19-arreglo-de-frecuencias',
  title: 'Arreglo de frecuencias',
  topic: 'Frecuencias',
  npc: { id: 'vera', name: 'VERA', title: 'Botánica de las letras', sprite: 'vera', x: 12, y: 10 },
  greeting: 'Veintiséis cajones, uno por letra. Nada se me pierde.',
  intro: [
    { speaker: 'VERA', text: 'Hola. Soy Vera y clasifico semillas... y letras. Para mí es lo mismo.' },
    { speaker: 'VERA', text: 'Tengo un mueble con 26 cajones, uno para cada letra de la a a la z.' },
    { speaker: 'VERA', text: 'Recorro una palabra y, por cada letra, echo una semilla en su cajón. Al final sé cuántas hay de cada una.' },
    { speaker: 'VERA', text: '¿Te muestro mis cajones o vamos al duelo?' },
  ],
  lesson: {
    concept: 'ARREGLO DE FRECUENCIAS',
    goals: ['Crear un arreglo de 26 contadores', 'Convertir una letra en su índice: letra - \'a\'', 'Comparar dos palabras por sus conteos'],
    explanation:
      'Un arreglo de frecuencias tiene una casilla por cada valor posible; para letras minúsculas son 26. ' +
      'La letra se convierte en índice restándole la a: la a va a la casilla 0, la b a la 1... la z a la 25. ' +
      'Recorres el texto una vez y sumas 1 en la casilla de cada letra. Dos palabras son anagramas si sus 26 conteos son iguales.',
    code: {
      python: code`
        s = input().strip()
        cnt = [0] * 26
        for c in s:
            cnt[ord(c) - ord("a")] += 1
        for i in range(26):
            if cnt[i] > 0:
                print(chr(ord("a") + i), cnt[i])
      `,
      cpp: code`
        #include <iostream>
        #include <string>
        using namespace std;

        int main() {
            string s;
            cin >> s;
            int cnt[26] = {0};
            for (char c : s) cnt[c - 'a']++;
            for (int i = 0; i < 26; i++) {
                if (cnt[i] > 0) cout << (char)('a' + i) << " " << cnt[i] << "\n";
            }
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                String s = sc.next();
                int[] cnt = new int[26];
                for (char c : s.toCharArray()) cnt[c - 'a']++;
                for (int i = 0; i < 26; i++) {
                    if (cnt[i] > 0) System.out.println((char) ('a' + i) + " " + cnt[i]);
                }
            }
        }
      `,
    },
    examples: [
      { input: 'banana', output: 'a 3\nb 1\nn 2' },
      { input: 'hoja', output: 'a 1\nh 1\nj 1\no 1' },
      { input: 'zzz', output: 'z 3' },
    ],
    tips: {
      python: 'ord(c) da el código de la letra; ord(c) - ord("a") la convierte en 0..25. chr hace lo contrario.',
      cpp: 'Un char es un número: c - \'a\' da 0..25. int cnt[26] = {0}; deja los 26 cajones en cero.',
      java: 'Un char es un número: c - \'a\' da 0..25. Arrays.equals(a, b) compara dos arreglos casilla por casilla.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          cnt = [0] * 26
          for c in "cocodrilo":
              cnt[ord(c) - ord("a")] += 1
          print(cnt[2] + cnt[14])
        `,
        cpp: code`
          #include <iostream>
          #include <string>
          using namespace std;

          int main() {
              int cnt[26] = {0};
              string s = "cocodrilo";
              for (char c : s) cnt[c - 'a']++;
              cout << cnt[2] + cnt[14] << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  int[] cnt = new int[26];
                  for (char c : "cocodrilo".toCharArray()) cnt[c - 'a']++;
                  System.out.println(cnt[2] + cnt[14]);
              }
          }
        `,
      },
      options: ['2', '5', '3'],
      answer: 1,
      explanation: 'La casilla 2 es la c (aparece 2 veces) y la 14 es la o (aparece 3 veces). 2 + 3 = 5.',
      wrongHint: 'Primero averigua qué letra es cada casilla: a = 0, b = 1, c = 2... ¿Cuál es la 14?',
    },
  },
  problem: {
    id: 'p19-anagramas-de-vera',
    title: 'LOS ANAGRAMAS DE VERA',
    statement:
      'Vera recibe T pares de palabras. Dos palabras son anagramas si tienen exactamente las mismas letras, ' +
      'la misma cantidad de veces cada una, aunque en otro orden (como amor y roma). Para cada par, responde SI o NO.',
    inputSpec: 'Línea 1: T. Luego T líneas, cada una con dos palabras separadas por un espacio.',
    outputSpec: 'T líneas: SI si las dos palabras son anagramas, NO si no lo son.',
    constraints: '1 ≤ T ≤ 10 · Cada palabra tiene de 1 a 10⁵ letras minúsculas (a–z).',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      anagramas([['amor', 'roma'], ['hoja', 'ojal'], ['sol', 'los']]),
      anagramas([['ab', 'abc']]),
      anagramas([['aab', 'abb'], ['abc', 'abc'], ['a', 'a'], ['a', 'b']]),
      anagramas([['bosque', 'buques'], ['iterador', 'rotadeir'], ['listen', 'silent']]),
      anagramas(variados),
      anagramas(largos),
      anagramas([[larga1, larga1], [larga1, larga1.slice(1)]]),
      anagramas([['zzzzzzzzzz', 'zzzzzzzzz'], ['xyz', 'zyx']]),
    ]),
    starter: {
      python: code`
        import sys
        input = sys.stdin.readline

        def contar(s):
            cnt = [0] * 26
            # TODO: suma 1 en la casilla de cada letra de s
            return cnt

        t = int(input())
        for _ in range(t):
            a, b = input().split()
            print("SI" if contar(a) == contar(b) else "NO")
      `,
      cpp: code`
        #include <iostream>
        #include <string>
        #include <vector>
        using namespace std;

        vector<int> contar(const string& s) {
            vector<int> cnt(26, 0);
            // TODO: suma 1 en la casilla de cada letra de s
            return cnt;
        }

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int t;
            cin >> t;
            while (t--) {
                string a, b;
                cin >> a >> b;
                cout << (contar(a) == contar(b) ? "SI" : "NO") << "\n";
            }
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.Arrays;
        import java.util.StringTokenizer;

        public class Main {
            static int[] contar(String s) {
                int[] cnt = new int[26];
                // TODO: suma 1 en la casilla de cada letra de s
                return cnt;
            }

            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                int t = Integer.parseInt(br.readLine().trim());
                for (int k = 0; k < t; k++) {
                    StringTokenizer st = new StringTokenizer(br.readLine());
                    String a = st.nextToken();
                    String b = st.nextToken();
                    System.out.println(Arrays.equals(contar(a), contar(b)) ? "SI" : "NO");
                }
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        input = sys.stdin.readline

        def contar(s):
            cnt = [0] * 26
            for c in s:
                cnt[ord(c) - 97] += 1
            return cnt

        t = int(input())
        for _ in range(t):
            a, b = input().split()
            print("SI" if contar(a) == contar(b) else "NO")
      `,
      cpp: code`
        #include <iostream>
        #include <string>
        #include <vector>
        using namespace std;

        vector<int> contar(const string& s) {
            vector<int> cnt(26, 0);
            for (char c : s) cnt[c - 'a']++;
            return cnt;
        }

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int t;
            cin >> t;
            while (t--) {
                string a, b;
                cin >> a >> b;
                cout << (contar(a) == contar(b) ? "SI" : "NO") << "\n";
            }
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.Arrays;
        import java.util.StringTokenizer;

        public class Main {
            static int[] contar(String s) {
                int[] cnt = new int[26];
                for (int i = 0; i < s.length(); i++) cnt[s.charAt(i) - 'a']++;
                return cnt;
            }

            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                int t = Integer.parseInt(br.readLine().trim());
                for (int k = 0; k < t; k++) {
                    StringTokenizer st = new StringTokenizer(br.readLine());
                    String a = st.nextToken();
                    String b = st.nextToken();
                    System.out.println(Arrays.equals(contar(a), contar(b)) ? "SI" : "NO");
                }
            }
        }
      `,
    },
    hints: [
      'No importa el orden de las letras, solo cuántas hay de cada una. ¿Cómo las contarías todas de una pasada?',
      'Usa un arreglo de 26 contadores por palabra. La letra c va a la casilla c - \'a\' (en Python, ord(c) - ord("a")).',
      'Cuenta las letras de cada palabra en su arreglo y compara los dos arreglos completos: si son iguales, SI. Si los largos difieren, ya sabes que es NO.',
    ],
  },
  outro: [
    { speaker: 'VERA', text: 'Cajón por cajón, todo coincide. Has aprendido a contar sin perder la cuenta.' },
    { speaker: 'VERA', text: 'Ya estás listo para el Gimnasio Bosque. El Guardabosques Cedro te espera frente a su puerta, al oeste.' },
  ],
  rewardTip: {
    title: 'Frecuencias',
    text: {
      python: 'cnt = [0] * 26; cnt[ord(c) - 97] += 1. Dos listas se comparan con ==.',
      cpp: 'vector<int> cnt(26); cnt[c - \'a\']++. Dos vectores se comparan con ==.',
      java: 'int[] cnt = new int[26]; cnt[c - \'a\']++. Compara con Arrays.equals(a, b).',
    },
  },
};
