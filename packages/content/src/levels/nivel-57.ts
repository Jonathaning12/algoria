import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const lcs = (a: string, b: string): [string, string] => {
  const m = b.length;
  let prev = new Int32Array(m + 1);
  for (let i = 0; i < a.length; i++) {
    const cur = new Int32Array(m + 1);
    for (let j = 0; j < m; j++) {
      cur[j + 1] = a[i] === b[j] ? prev[j]! + 1 : Math.max(prev[j + 1]!, cur[j]!);
    }
    prev = cur;
  }
  return [`${a}\n${b}`, `${prev[m]}`];
};

const r = rng(5757);
const texto = (len: number, letras: string) => Array.from({ length: len }, () => letras[r(0, letras.length - 1)]).join('');
const L = 1000;
const adn1 = texto(L, 'acgt');
const adn2 = texto(L, 'acgt');
const largo1 = texto(L, 'abcdefghijklmnopqrstuvwxyz');
const largo2 = texto(L, 'abcdefghijklmnopqrstuvwxyz');
// Una copia con algunas letras borradas: la respuesta es el largo de la copia.
const borrada = [...largo1].filter(() => r(1, 10) > 2).join('');

export const nivel57: Level = {
  number: 57,
  id: 'n57-lcs',
  title: 'Subsecuencia común',
  topic: 'Programación dinámica',
  npc: { id: 'gaspar', name: 'GASPAR', title: 'Copista de manuscritos', sprite: 'npc57', x: 13, y: 4 },
  greeting: 'Dos copias del mismo libro nunca son iguales. Pero algo comparten.',
  intro: [
    { speaker: 'GASPAR', text: 'Saludos. Soy Gaspar, copista. Llevo cuarenta años copiando libros a mano.' },
    { speaker: 'GASPAR', text: 'Encontré dos copias de un hechizo antiguo. Los copistas de antes se saltaron letras, cada uno las suyas.' },
    { speaker: 'GASPAR', text: 'Quiero saber cuántas letras, en orden, tienen las dos copias en común. Así sabré cuánto del original sobrevive.' },
    { speaker: 'GASPAR', text: 'La respuesta está en una tabla: una fila por cada letra de una copia y una columna por cada letra de la otra. ¿Te la muestro?' },
  ],
  lesson: {
    concept: 'LCS · TABLA DE DOS TEXTOS',
    goals: ['Definir dp[i][j] sobre dos prefijos', 'Distinguir el caso en que las letras coinciden', 'Llenar la tabla en O(n·m)'],
    explanation:
      'Una subsecuencia común es una lista de letras que aparece, en el mismo orden, en los dos textos (no hace falta que estén juntas). ' +
      'Sea dp[i][j] el largo de la más larga entre las primeras i letras de A y las primeras j de B. ' +
      'Si A[i-1] == B[j-1], esa letra se suma: dp[i][j] = dp[i-1][j-1] + 1. Si no, se descarta una de las dos: dp[i][j] = max(dp[i-1][j], dp[i][j-1]). ' +
      'La fila 0 y la columna 0 valen 0, y la respuesta queda en dp[n][m].',
    code: {
      python: code`
        a = input().strip()
        b = input().strip()
        n, m = len(a), len(b)
        dp = [[0] * (m + 1) for _ in range(n + 1)]
        for i in range(1, n + 1):
            for j in range(1, m + 1):
                if a[i - 1] == b[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + 1
                else:
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
        print(dp[n][m])
      `,
      cpp: code`
        #include <algorithm>
        #include <iostream>
        #include <string>
        #include <vector>
        using namespace std;

        int main() {
            string a, b;
            cin >> a >> b;
            int n = a.size(), m = b.size();
            vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
            for (int i = 1; i <= n; i++) {
                for (int j = 1; j <= m; j++) {
                    if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
                    else dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
            cout << dp[n][m] << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                String a = sc.next();
                String b = sc.next();
                int n = a.length(), m = b.length();
                int[][] dp = new int[n + 1][m + 1];
                for (int i = 1; i <= n; i++) {
                    for (int j = 1; j <= m; j++) {
                        if (a.charAt(i - 1) == b.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1] + 1;
                        else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                    }
                }
                System.out.println(dp[n][m]);
            }
        }
      `,
    },
    examples: [
      { input: 'abcde\nace', output: '3' },
      { input: 'magia\nmago', output: '3' },
      { input: 'abc\nxyz', output: '0' },
    ],
    tips: {
      python: 'Solo necesitas la fila anterior: guarda prev y cur en vez de toda la tabla. Leer con sys.stdin.buffer y comparar bytes también acelera.',
      cpp: 'Una tabla de 1001×1001 enteros cabe de sobra. Si quieres ahorrar memoria, dos filas bastan.',
      java: 'Pasa los textos a char[] con toCharArray(): leer a[i] es más rápido que charAt en bucles grandes.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          a = "torre"
          b = "tierra"
          n, m = len(a), len(b)
          dp = [[0] * (m + 1) for _ in range(n + 1)]
          for i in range(1, n + 1):
              for j in range(1, m + 1):
                  if a[i - 1] == b[j - 1]:
                      dp[i][j] = dp[i - 1][j - 1] + 1
                  else:
                      dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
          print(dp[n][m])
        `,
        cpp: code`
          #include <algorithm>
          #include <iostream>
          #include <string>
          using namespace std;

          int main() {
              string a = "torre", b = "tierra";
              int n = a.size(), m = b.size();
              int dp[6][7] = {};
              for (int i = 1; i <= n; i++) {
                  for (int j = 1; j <= m; j++) {
                      if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
                      else dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
                  }
              }
              cout << dp[n][m] << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  String a = "torre", b = "tierra";
                  int n = a.length(), m = b.length();
                  int[][] dp = new int[n + 1][m + 1];
                  for (int i = 1; i <= n; i++) {
                      for (int j = 1; j <= m; j++) {
                          if (a.charAt(i - 1) == b.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1] + 1;
                          else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                      }
                  }
                  System.out.println(dp[n][m]);
              }
          }
        `,
      },
      options: ['2', '3', '4'],
      answer: 1,
      explanation: '"trr" aparece en orden en las dos palabras. La "e" de tierra está antes de las erres, así que "tre" no sirve: el máximo es 3.',
      wrongHint: 'Busca letras que estén en las dos palabras y en el mismo orden. Ojo con dónde está la "e" en cada una.',
    },
  },
  problem: {
    id: 'p57-copias-de-gaspar',
    title: 'LAS COPIAS DE GASPAR',
    statement:
      'Gaspar tiene dos copias de un hechizo, A y B. Cada copista se saltó letras distintas. ' +
      'Una subsecuencia común es una lista de letras que aparece en A y en B en el mismo orden (no necesariamente juntas). ' +
      '¿Cuál es el largo de la subsecuencia común más larga?',
    inputSpec: 'Línea 1: el texto A. Línea 2: el texto B.',
    outputSpec: 'Un número: el largo de la subsecuencia común más larga.',
    constraints: '1 ≤ |A|, |B| ≤ 1000 · solo letras minúsculas (a–z).',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      lcs('abcde', 'ace'),
      lcs('hechizo', 'echo'),
      lcs(adn1, adn2),
      lcs(largo1, largo2),
      lcs(largo1, borrada),
      lcs(adn1, adn1),
      lcs('a'.repeat(L), 'b'.repeat(L)),
      lcs('z', largo1),
      lcs('abab', 'baba'),
    ]),
    starter: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        a, b = data[0], data[1]
        n, m = len(a), len(b)
        prev = [0] * (m + 1)
        for i in range(n):
            cur = [0] * (m + 1)
            # TODO: para j de 0 a m - 1: si a[i] == b[j], cur[j + 1] = prev[j] + 1;
            # si no, cur[j + 1] = max(prev[j + 1], cur[j])
            prev = cur
        print(prev[m])
      `,
      cpp: code`
        #include <algorithm>
        #include <iostream>
        #include <string>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            string a, b;
            cin >> a >> b;
            int n = a.size(), m = b.size();
            vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
            // TODO: llena dp[i][j] para i de 1 a n y j de 1 a m:
            // letras iguales -> dp[i-1][j-1] + 1; distintas -> max(dp[i-1][j], dp[i][j-1])
            cout << dp[n][m] << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                char[] a = br.readLine().trim().toCharArray();
                char[] b = br.readLine().trim().toCharArray();
                int n = a.length, m = b.length;
                int[][] dp = new int[n + 1][m + 1];
                // TODO: llena dp[i][j] para i de 1 a n y j de 1 a m:
                // letras iguales -> dp[i-1][j-1] + 1; distintas -> max(dp[i-1][j], dp[i][j-1])
                System.out.println(dp[n][m]);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        a, b = data[0], data[1]
        n, m = len(a), len(b)
        prev = [0] * (m + 1)
        for i in range(n):
            ca = a[i]
            cur = [0] * (m + 1)
            for j in range(m):
                if ca == b[j]:
                    cur[j + 1] = prev[j] + 1
                else:
                    x = prev[j + 1]
                    y = cur[j]
                    cur[j + 1] = x if x > y else y
            prev = cur
        print(prev[m])
      `,
      cpp: code`
        #include <algorithm>
        #include <iostream>
        #include <string>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            string a, b;
            cin >> a >> b;
            int n = a.size(), m = b.size();
            vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
            for (int i = 1; i <= n; i++) {
                for (int j = 1; j <= m; j++) {
                    if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
                    else dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
            cout << dp[n][m] << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                char[] a = br.readLine().trim().toCharArray();
                char[] b = br.readLine().trim().toCharArray();
                int n = a.length, m = b.length;
                int[][] dp = new int[n + 1][m + 1];
                for (int i = 1; i <= n; i++) {
                    for (int j = 1; j <= m; j++) {
                        if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
                        else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                    }
                }
                System.out.println(dp[n][m]);
            }
        }
      `,
    },
    hints: [
      'Probar todas las subsecuencias de A son 2ⁿ casos. Mejor compara prefijos: ¿cuánto comparten las primeras i letras de A con las primeras j de B?',
      'Mira la última letra de cada prefijo. Si son iguales, forman parte de la respuesta. Si no, al menos una de las dos sobra: prueba quitar cada una y quédate con lo mejor.',
      'dp[0][*] = dp[*][0] = 0. Si A[i-1] == B[j-1]: dp[i][j] = dp[i-1][j-1] + 1; si no: dp[i][j] = max(dp[i-1][j], dp[i][j-1]). La respuesta es dp[n][m].',
    ],
  },
  outro: [
    { speaker: 'GASPAR', text: 'Así que esto sobrevivió del hechizo original. Gracias: ahora puedo reconstruirlo.' },
    { speaker: 'GASPAR', text: 'Dos textos, una tabla, y cada casilla mira solo a sus tres vecinas. Esa idea sirve para muchísimos problemas.' },
    { speaker: 'GASPAR', text: 'Úrsula, la correctora, está a mi izquierda. Ella no solo compara: también arregla conjuros mal escritos.' },
  ],
  rewardTip: {
    title: 'Subsecuencia común más larga',
    text: {
      python: 'Iguales: dp[i-1][j-1] + 1; distintas: max(dp[i-1][j], dp[i][j-1]). Con dos filas (prev, cur) ahorras memoria y tiempo.',
      cpp: 'Iguales: dp[i-1][j-1] + 1; distintas: max(dp[i-1][j], dp[i][j-1]). O(n·m) con una tabla de (n+1)×(m+1).',
      java: 'Iguales: dp[i-1][j-1] + 1; distintas: Math.max(dp[i-1][j], dp[i][j-1]). Usa char[] para ir más rápido.',
    },
  },
};
