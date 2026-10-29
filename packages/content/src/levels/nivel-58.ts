import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const edicion = (a: string, b: string): [string, string] => {
  const m = b.length;
  let prev = Int32Array.from({ length: m + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = new Int32Array(m + 1);
    cur[0] = i;
    for (let j = 1; j <= m; j++) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1]! : 1 + Math.min(prev[j - 1]!, prev[j]!, cur[j - 1]!);
    }
    prev = cur;
  }
  return [`${a}\n${b}`, `${prev[m]}`];
};

const r = rng(5858);
const LETRAS = 'abcdefghijklmnopqrstuvwxyz';
const texto = (len: number, letras: string) => Array.from({ length: len }, () => letras[r(0, letras.length - 1)]).join('');
const L = 1000;
const base = texto(L, LETRAS);
// Un conjuro con unas pocas erratas: cambios, borrados e inserciones sueltas.
const erratas = (() => {
  const out: string[] = [];
  for (const c of base) {
    const t = r(1, 100);
    if (t <= 3) continue; // borrada
    if (t <= 6) out.push(LETRAS[r(0, 25)]!); // cambiada
    else out.push(c);
    if (r(1, 100) <= 3) out.push(LETRAS[r(0, 25)]!); // insertada
  }
  return out.join('').slice(0, L);
})();

export const nivel58: Level = {
  number: 58,
  id: 'n58-distancia-edicion',
  title: 'Distancia de edición',
  topic: 'Programación dinámica',
  npc: { id: 'ursula', name: 'ÚRSULA', title: 'Correctora de conjuros', sprite: 'npc58', x: 4, y: 4 },
  greeting: 'Una letra mal puesta y el conjuro de lluvia invoca ranas.',
  intro: [
    { speaker: 'ÚRSULA', text: 'Hola, hola. Soy Úrsula y corrijo los conjuros que escriben los aprendices.' },
    { speaker: 'ÚRSULA', text: 'Cada corrección cuesta tinta: puedo cambiar una letra, borrarla o insertar una nueva.' },
    { speaker: 'ÚRSULA', text: 'Quiero saber cuántas correcciones necesito, como mínimo, para convertir un conjuro mal escrito en el correcto.' },
    { speaker: 'ÚRSULA', text: 'Es primo hermano de la tabla de Gaspar, pero con tres caminos en vez de dos. ¿Lo vemos?' },
  ],
  lesson: {
    concept: 'DISTANCIA DE EDICIÓN',
    goals: ['Definir dp[i][j] como el costo de convertir un prefijo en otro', 'Elegir entre cambiar, borrar e insertar', 'Inicializar bien la fila y la columna 0'],
    explanation:
      'Sea dp[i][j] el mínimo de operaciones para convertir las primeras i letras de A en las primeras j de B. ' +
      'Convertir i letras en nada cuesta i borrados: dp[i][0] = i. Y de nada a j letras son j inserciones: dp[0][j] = j. ' +
      'Si A[i-1] == B[j-1], no hace falta tocar nada: dp[i][j] = dp[i-1][j-1]. ' +
      'Si no, pagas 1 más la mejor de tres opciones: cambiar (dp[i-1][j-1]), borrar de A (dp[i-1][j]) o insertar en A (dp[i][j-1]).',
    code: {
      python: code`
        a = input().strip()
        b = input().strip()
        n, m = len(a), len(b)
        dp = [[0] * (m + 1) for _ in range(n + 1)]
        for i in range(n + 1):
            dp[i][0] = i
        for j in range(m + 1):
            dp[0][j] = j
        for i in range(1, n + 1):
            for j in range(1, m + 1):
                if a[i - 1] == b[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
                else:
                    dp[i][j] = 1 + min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
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
            for (int i = 0; i <= n; i++) dp[i][0] = i;
            for (int j = 0; j <= m; j++) dp[0][j] = j;
            for (int i = 1; i <= n; i++) {
                for (int j = 1; j <= m; j++) {
                    if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
                    else dp[i][j] = 1 + min({dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]});
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
                for (int i = 0; i <= n; i++) dp[i][0] = i;
                for (int j = 0; j <= m; j++) dp[0][j] = j;
                for (int i = 1; i <= n; i++) {
                    for (int j = 1; j <= m; j++) {
                        if (a.charAt(i - 1) == b.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1];
                        else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));
                    }
                }
                System.out.println(dp[n][m]);
            }
        }
      `,
    },
    examples: [
      { input: 'gato\npato', output: '1' },
      { input: 'sol\nsolar', output: '2' },
      { input: 'kitten\nsitting', output: '3' },
    ],
    tips: {
      python: 'Con dos filas (prev y cur) basta. No olvides cur[0] = i al empezar cada fila: es el costo de borrar las i letras.',
      cpp: 'min({x, y, z}) con llaves compara tres valores a la vez (necesita <algorithm>).',
      java: 'Math.min solo recibe dos valores: anídalo, Math.min(x, Math.min(y, z)). Usa char[] para recorrer rápido.',
    },
    quiz: {
      question: '¿Cuántas operaciones hacen falta para convertir "mesa" en "masa"? (el programa lo imprime)',
      code: {
        python: code`
          a = "mesa"
          b = "masa"
          n, m = len(a), len(b)
          dp = [[0] * (m + 1) for _ in range(n + 1)]
          for i in range(n + 1):
              dp[i][0] = i
          for j in range(m + 1):
              dp[0][j] = j
          for i in range(1, n + 1):
              for j in range(1, m + 1):
                  if a[i - 1] == b[j - 1]:
                      dp[i][j] = dp[i - 1][j - 1]
                  else:
                      dp[i][j] = 1 + min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
          print(dp[n][m])
        `,
        cpp: code`
          #include <algorithm>
          #include <iostream>
          #include <string>
          using namespace std;

          int main() {
              string a = "mesa", b = "masa";
              int n = a.size(), m = b.size();
              int dp[5][5];
              for (int i = 0; i <= n; i++) dp[i][0] = i;
              for (int j = 0; j <= m; j++) dp[0][j] = j;
              for (int i = 1; i <= n; i++) {
                  for (int j = 1; j <= m; j++) {
                      if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
                      else dp[i][j] = 1 + min({dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]});
                  }
              }
              cout << dp[n][m] << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  String a = "mesa", b = "masa";
                  int n = a.length(), m = b.length();
                  int[][] dp = new int[n + 1][m + 1];
                  for (int i = 0; i <= n; i++) dp[i][0] = i;
                  for (int j = 0; j <= m; j++) dp[0][j] = j;
                  for (int i = 1; i <= n; i++) {
                      for (int j = 1; j <= m; j++) {
                          if (a.charAt(i - 1) == b.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1];
                          else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));
                      }
                  }
                  System.out.println(dp[n][m]);
              }
          }
        `,
      },
      options: ['1', '2', '4'],
      answer: 0,
      explanation: 'Basta cambiar la "e" por una "a". Las otras tres letras ya coinciden, así que la distancia es 1.',
      wrongHint: 'Compara las palabras letra por letra: ¿cuántas posiciones son distintas? A veces cambiar es más barato que borrar e insertar.',
    },
  },
  problem: {
    id: 'p58-conjuros-de-ursula',
    title: 'LOS CONJUROS DE ÚRSULA',
    statement:
      'Úrsula recibe un conjuro mal escrito A y conoce la versión correcta B. ' +
      'En cada operación puede cambiar una letra por otra, borrar una letra o insertar una letra en cualquier posición. ' +
      '¿Cuál es el mínimo de operaciones para convertir A en B?',
    inputSpec: 'Línea 1: el conjuro A. Línea 2: el conjuro correcto B.',
    outputSpec: 'Un número: la distancia de edición entre A y B.',
    constraints: '1 ≤ |A|, |B| ≤ 1000 · solo letras minúsculas (a–z).',
    difficulty: 'dificil',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      edicion('lluvia', 'luvia'),
      edicion('abracadabra', 'cabra'),
      edicion(erratas, base),
      edicion(texto(L, LETRAS), texto(L, LETRAS)),
      edicion(texto(L, 'ab'), texto(L, 'ab')),
      edicion(base, base),
      edicion('a'.repeat(L), 'b'),
      edicion('x', base),
      edicion('conjuro', 'conjuros'),
    ]),
    starter: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        a, b = data[0], data[1]
        n, m = len(a), len(b)
        prev = list(range(m + 1))
        for i in range(1, n + 1):
            cur = [0] * (m + 1)
            cur[0] = i
            # TODO: para j de 1 a m: si a[i-1] == b[j-1], cur[j] = prev[j-1];
            # si no, cur[j] = 1 + min(prev[j-1], prev[j], cur[j-1])
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
            for (int i = 0; i <= n; i++) dp[i][0] = i;
            for (int j = 0; j <= m; j++) dp[0][j] = j;
            // TODO: para i de 1 a n y j de 1 a m: letras iguales -> dp[i-1][j-1];
            // distintas -> 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])
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
                for (int i = 0; i <= n; i++) dp[i][0] = i;
                for (int j = 0; j <= m; j++) dp[0][j] = j;
                // TODO: para i de 1 a n y j de 1 a m: letras iguales -> dp[i-1][j-1];
                // distintas -> 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])
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
        prev = list(range(m + 1))
        for i in range(1, n + 1):
            ca = a[i - 1]
            cur = [0] * (m + 1)
            cur[0] = i
            for j in range(1, m + 1):
                if ca == b[j - 1]:
                    cur[j] = prev[j - 1]
                else:
                    x = prev[j - 1]
                    if prev[j] < x:
                        x = prev[j]
                    if cur[j - 1] < x:
                        x = cur[j - 1]
                    cur[j] = x + 1
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
            for (int i = 0; i <= n; i++) dp[i][0] = i;
            for (int j = 0; j <= m; j++) dp[0][j] = j;
            for (int i = 1; i <= n; i++) {
                for (int j = 1; j <= m; j++) {
                    if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
                    else dp[i][j] = 1 + min({dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]});
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
                for (int i = 0; i <= n; i++) dp[i][0] = i;
                for (int j = 0; j <= m; j++) dp[0][j] = j;
                for (int i = 1; i <= n; i++) {
                    for (int j = 1; j <= m; j++) {
                        if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
                        else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));
                    }
                }
                System.out.println(dp[n][m]);
            }
        }
      `,
    },
    hints: [
      'Igual que con Gaspar, compara prefijos: ¿cuánto cuesta convertir las primeras i letras de A en las primeras j de B?',
      'Mira la última letra de cada prefijo. Si coinciden, no cuesta nada. Si no, la última operación fue cambiar, borrar o insertar: prueba las tres.',
      'dp[i][0] = i, dp[0][j] = j. Si A[i-1] == B[j-1]: dp[i][j] = dp[i-1][j-1]; si no: 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]). La respuesta es dp[n][m].',
    ],
  },
  outro: [
    { speaker: 'ÚRSULA', text: '¡Ni una gota de tinta desperdiciada! Los aprendices ya no invocarán ranas por error.' },
    { speaker: 'ÚRSULA', text: 'Cambiar, borrar o insertar: cuando hay varias jugadas posibles, la DP prueba todas y se queda con la mejor.' },
    { speaker: 'ÚRSULA', text: 'Melquíades, el maestro de aprendices, está en el último piso antes del gimnasio. Le encanta usar bits.' },
  ],
  rewardTip: {
    title: 'Distancia de edición',
    text: {
      python: 'dp[i][0] = i, dp[0][j] = j. Iguales: dp[i-1][j-1]; distintas: 1 + min de las tres vecinas. Dos filas bastan.',
      cpp: 'dp[i][0] = i, dp[0][j] = j. Iguales: dp[i-1][j-1]; distintas: 1 + min({diag, arriba, izquierda}).',
      java: 'dp[i][0] = i, dp[0][j] = j. Iguales: dp[i-1][j-1]; distintas: 1 + Math.min(diag, Math.min(arriba, izq)).',
    },
  },
};
