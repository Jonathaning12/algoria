import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const espejo = (palabras: string[]): [string, string] => [
  `${palabras.length}\n${palabras.join('\n')}`,
  palabras
    .map((p) => {
      const inv = [...p].reverse().join('');
      return `${inv} ${inv === p ? 'SI' : 'NO'}`;
    })
    .join('\n'),
];

const palabra = (r: (lo: number, hi: number) => number, len: number, letras = 26) =>
  Array.from({ length: len }, () => String.fromCharCode(97 + r(0, letras - 1))).join('');

const capicua = (r: (lo: number, hi: number) => number, len: number) => {
  const mitad = palabra(r, Math.floor(len / 2), 3);
  const centro = len % 2 === 1 ? palabra(r, 1, 3) : '';
  return mitad + centro + [...mitad].reverse().join('');
};

const largas = (() => {
  const r = rng(1414);
  const casiPal = capicua(r, 1000);
  const casi = casiPal.slice(0, 499) + (casiPal[499] === 'z' ? 'y' : 'z') + casiPal.slice(500);
  return [capicua(r, 1000), casi, capicua(r, 999), palabra(r, 1000)];
})();
const variadas = (() => {
  const r = rng(4141);
  return Array.from({ length: 20 }, (_, i) => (i % 2 === 0 ? capicua(r, r(1, 40)) : palabra(r, r(1, 40), 2)));
})();

export const nivel14: Level = {
  number: 14,
  id: 'n14-palindromos',
  title: 'Invertir y palíndromos',
  topic: 'Strings al revés',
  npc: { id: 'otto', name: 'OTTO', title: 'Guardián del espejo', sprite: 'otto', x: 9, y: 4 },
  greeting: 'O-T-T-O. Léelo al revés. ¿Ves? Sigo siendo yo.',
  intro: [
    { speaker: 'OTTO', text: '¡Saludos! Soy Otto. Mi nombre se lee igual de izquierda a derecha que de derecha a izquierda.' },
    { speaker: 'OTTO', text: 'A esas palabras se les llama palíndromos: oso, radar, reconocer...' },
    { speaker: 'OTTO', text: 'Para descubrirlas hay que saber recorrer un texto al revés, del último carácter al primero.' },
    { speaker: 'OTTO', text: '¿Te muestro el truco del espejo o pasamos al duelo?' },
  ],
  lesson: {
    concept: 'INVERTIR UN STRING',
    goals: ['Recorrer un string desde el final', 'Construir la palabra invertida', 'Saber si una palabra es palíndromo'],
    explanation:
      'El último carácter está en la posición n - 1. Si recorres desde ahí hasta 0 y vas pegando cada letra, obtienes la palabra al revés. ' +
      'Una palabra es palíndromo si es igual a su versión invertida. ' +
      'Otra forma: compara la primera letra con la última, la segunda con la penúltima, y así hasta el centro.',
    code: {
      python: code`
        s = input().strip()
        inv = ""
        for i in range(len(s) - 1, -1, -1):
            inv += s[i]
        print(inv)
      `,
      cpp: code`
        #include <iostream>
        #include <string>
        using namespace std;

        int main() {
            string s;
            cin >> s;
            string inv = "";
            for (int i = (int)s.size() - 1; i >= 0; i--) {
                inv += s[i];
            }
            cout << inv << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                String s = sc.next();
                StringBuilder inv = new StringBuilder();
                for (int i = s.length() - 1; i >= 0; i--) {
                    inv.append(s.charAt(i));
                }
                System.out.println(inv.toString());
            }
        }
      `,
    },
    examples: [
      { input: 'hola', output: 'aloh' },
      { input: 'oso', output: 'oso' },
      { input: 'bosque', output: 'euqsob' },
    ],
    tips: {
      python: 'Atajo: s[::-1] es s al revés. Y s == s[::-1] te dice si es palíndromo.',
      cpp: 'Atajo: string inv(s.rbegin(), s.rend()); construye s al revés. Compara strings con ==.',
      java: 'Atajo: new StringBuilder(s).reverse().toString(). Compara strings con equals, nunca con ==.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          s = "rodar"
          i = 0
          j = len(s) - 1
          ok = True
          while i < j:
              if s[i] != s[j]:
                  ok = False
              i += 1
              j -= 1
          print("SI" if ok else "NO")
        `,
        cpp: code`
          #include <iostream>
          #include <string>
          using namespace std;

          int main() {
              string s = "rodar";
              int i = 0, j = (int)s.size() - 1;
              bool ok = true;
              while (i < j) {
                  if (s[i] != s[j]) ok = false;
                  i++;
                  j--;
              }
              cout << (ok ? "SI" : "NO") << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  String s = "rodar";
                  int i = 0, j = s.length() - 1;
                  boolean ok = true;
                  while (i < j) {
                      if (s.charAt(i) != s.charAt(j)) ok = false;
                      i++;
                      j--;
                  }
                  System.out.println(ok ? "SI" : "NO");
              }
          }
        `,
      },
      options: ['SI', 'NO', 'rador'],
      answer: 1,
      explanation: 'Las puntas (r y r) coinciden, pero luego se compara la o con la a: son distintas. "rodar" no es palíndromo.',
      wrongHint: 'Compara por parejas desde fuera hacia dentro: primera con última, segunda con penúltima...',
    },
  },
  problem: {
    id: 'p14-espejo-de-otto',
    title: 'EL ESPEJO DE OTTO',
    statement:
      'Otto pone T palabras frente a su espejo. Para cada una, escribe cómo se ve reflejada (la palabra invertida) ' +
      'y di si es un palíndromo: SI si se lee igual al revés, NO si no.',
    inputSpec: 'Línea 1: T. Luego T líneas, cada una con una palabra.',
    outputSpec: 'T líneas: la palabra invertida, un espacio, y SI o NO.',
    constraints: '1 ≤ T ≤ 20 · Cada palabra tiene de 1 a 1000 letras minúsculas (a–z).',
    difficulty: 'facil',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      espejo(['hola', 'oso', 'reconocer']),
      espejo(['a', 'ab']),
      espejo(['otto', 'aa', 'abca', 'abba', 'abcba']),
      espejo(['anitalavalatina', 'bosque', 'radar', 'rodar']),
      espejo([largas[0]!, largas[1]!]),
      espejo([largas[2]!, largas[3]!]),
      espejo(variadas),
      espejo(['z', 'zz', 'zyz', 'zyyz', 'zyxz']),
    ]),
    starter: {
      python: code`
        t = int(input())
        for _ in range(t):
            s = input().strip()
            inv = ""
            # TODO: construye inv con s al revés
            print(inv, "SI" if inv == s else "NO")
      `,
      cpp: code`
        #include <iostream>
        #include <string>
        using namespace std;

        int main() {
            int t;
            cin >> t;
            while (t--) {
                string s;
                cin >> s;
                string inv = "";
                // TODO: construye inv con s al revés
                cout << inv << " " << (inv == s ? "SI" : "NO") << "\n";
            }
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                int t = Integer.parseInt(br.readLine().trim());
                for (int k = 0; k < t; k++) {
                    String s = br.readLine().trim();
                    StringBuilder inv = new StringBuilder();
                    // TODO: construye inv con s al revés
                    String r = inv.toString();
                    System.out.println(r + " " + (r.equals(s) ? "SI" : "NO"));
                }
            }
        }
      `,
    },
    solution: {
      python: code`
        t = int(input())
        for _ in range(t):
            s = input().strip()
            inv = ""
            for i in range(len(s) - 1, -1, -1):
                inv += s[i]
            print(inv, "SI" if inv == s else "NO")
      `,
      cpp: code`
        #include <iostream>
        #include <string>
        using namespace std;

        int main() {
            int t;
            cin >> t;
            while (t--) {
                string s;
                cin >> s;
                string inv = "";
                for (int i = (int)s.size() - 1; i >= 0; i--) {
                    inv += s[i];
                }
                cout << inv << " " << (inv == s ? "SI" : "NO") << "\n";
            }
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                int t = Integer.parseInt(br.readLine().trim());
                for (int k = 0; k < t; k++) {
                    String s = br.readLine().trim();
                    StringBuilder inv = new StringBuilder();
                    for (int i = s.length() - 1; i >= 0; i--) {
                        inv.append(s.charAt(i));
                    }
                    String r = inv.toString();
                    System.out.println(r + " " + (r.equals(s) ? "SI" : "NO"));
                }
            }
        }
      `,
    },
    hints: [
      'Primero consigue la palabra invertida. Con ella, saber si es palíndromo es una sola comparación.',
      'Recorre los índices desde len - 1 hasta 0 (bajando) y ve pegando cada letra al final de un texto nuevo.',
      'Si invertida == original, imprime SI; si no, NO. En Java compara con equals. Una sola letra siempre es palíndromo.',
    ],
  },
  outro: [
    { speaker: 'OTTO', text: '¡Reflejo perfecto! Ahora sabes caminar un texto hacia atrás.' },
    { speaker: 'OTTO', text: 'Mila está al oeste, preparando el baile del bosque. Busca parejas... muchas parejas.' },
  ],
  rewardTip: {
    title: 'El espejo',
    text: {
      python: 's[::-1] invierte. s == s[::-1] dice si es palíndromo.',
      cpp: 'string inv(s.rbegin(), s.rend()); o recorre de s.size() - 1 a 0. Compara con ==.',
      java: 'new StringBuilder(s).reverse().toString() invierte. Compara textos con equals.',
    },
  },
};
