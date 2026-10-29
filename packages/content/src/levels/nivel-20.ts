import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const huellas = (s: string, p: string): [string, string] => {
  const k = p.length;
  const cp = new Array<number>(26).fill(0);
  const cs = new Array<number>(26).fill(0);
  for (const c of p) cp[c.charCodeAt(0) - 97]!++;
  let total = 0;
  let primera = -1;
  for (let i = 0; i < s.length; i++) {
    cs[s.charCodeAt(i) - 97]!++;
    if (i >= k) cs[s.charCodeAt(i - k) - 97]!--;
    if (i >= k - 1) {
      if (cs.every((v, j) => v === cp[j])) {
        total++;
        if (primera === -1) primera = i - k + 2;
      }
    }
  }
  return [`${s}\n${p}`, `${total}\n${primera}`];
};

const r = rng(2020);
const texto = (len: number, letras: number) => Array.from({ length: len }, () => String.fromCharCode(97 + r(0, letras - 1))).join('');
const barajar = (s: string) => {
  const a = [...s];
  for (let i = a.length - 1; i > 0; i--) {
    const j = r(0, i);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a.join('');
};

const N = 200000;
const dosLetras = texto(N, 2);
const tresLetras = texto(N, 3);
const todoA = 'a'.repeat(N);
// Una sola pisada posible, justo al final del sendero (las ventanas anteriores tienen alguna z).
const rastro = texto(1000, 25);
const alFinal = { s: 'z'.repeat(N - 1000) + rastro, p: barajar(rastro) };
const sinPisadas = { s: alFinal.s, p: (rastro[0] === 'a' ? 'b' : 'a') + barajar(rastro.slice(1)) };

export const nivel20: Level = {
  number: 20,
  id: 'n20-gimnasio-bosque',
  title: 'Gimnasio Bosque',
  topic: 'Repaso: recorrer con eficiencia',
  gym: true,
  npc: { id: 'cedro', name: 'GUARDABOSQUES CEDRO', title: 'Líder del Gimnasio Bosque', sprite: 'gym_bosque', x: 7, y: 11 },
  greeting: 'En este bosque, quien recorre sin pensar se pierde. Quien piensa, encuentra el camino.',
  intro: [
    { speaker: 'CEDRO', text: 'Bienvenido al Gimnasio Bosque. Soy Cedro, el guardabosques, y conozco cada huella de este lugar.' },
    { speaker: 'CEDRO', text: 'Rana, Kai, Lupe, Otto, Mila, Tito, Zoe, Dante y Vera me hablaron de ti.' },
    { speaker: 'CEDRO', text: 'Mi reto junta lo que aprendiste aquí: recorrer textos, contar letras en cajones y deslizar una ventana.' },
    { speaker: 'CEDRO', text: 'Y el sendero es largo: si recuentas todo en cada paso, la noche te alcanzará.' },
    { speaker: 'CEDRO', text: '¿Un último repaso o entramos directo al duelo?' },
  ],
  lesson: {
    concept: 'REPASO: VENTANA + FRECUENCIAS',
    goals: ['Mantener un conteo dentro de una ventana', 'Actualizarlo con la letra que entra y la que sale', 'Recorrer todo el texto una sola vez'],
    explanation:
      'Una ventana deslizante no solo sirve para sumas: también puede llevar conteos. ' +
      'Al avanzar, la letra que entra suma 1 y la que sale resta 1, igual que con las luciérnagas de Dante. ' +
      'Si guardas los conteos en el arreglo de 26 cajones de Vera, cada paso cuesta poco, y el recorrido completo sigue siendo O(n).',
    code: {
      python: code`
        s = input().strip()
        k = int(input())
        v = 0
        for i in range(k):
            if s[i] in "aeiou":
                v += 1
        res = [v]
        for i in range(k, len(s)):
            if s[i] in "aeiou":
                v += 1
            if s[i - k] in "aeiou":
                v -= 1
            res.append(v)
        print(*res)
      `,
      cpp: code`
        #include <iostream>
        #include <string>
        using namespace std;

        bool esVocal(char c) {
            return c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u';
        }

        int main() {
            string s;
            int k;
            cin >> s >> k;
            int v = 0;
            for (int i = 0; i < k; i++) if (esVocal(s[i])) v++;
            cout << v;
            for (int i = k; i < (int)s.size(); i++) {
                if (esVocal(s[i])) v++;
                if (esVocal(s[i - k])) v--;
                cout << " " << v;
            }
            cout << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            static boolean esVocal(char c) {
                return "aeiou".indexOf(c) >= 0;
            }

            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                String s = sc.next();
                int k = sc.nextInt();
                int v = 0;
                for (int i = 0; i < k; i++) if (esVocal(s.charAt(i))) v++;
                StringBuilder sb = new StringBuilder();
                sb.append(v);
                for (int i = k; i < s.length(); i++) {
                    if (esVocal(s.charAt(i))) v++;
                    if (esVocal(s.charAt(i - k))) v--;
                    sb.append(" ").append(v);
                }
                System.out.println(sb);
            }
        }
      `,
    },
    examples: [
      { input: 'bosque\n3', output: '1 1 1 2' },
      { input: 'arbusto\n2', output: '1 0 1 1 0 1' },
      { input: 'oia\n3', output: '3' },
    ],
    tips: {
      python: 'Dos listas de 26 se comparan con == en un solo paso. Lee con sys.stdin.readline().strip() para no arrastrar el salto de línea.',
      cpp: 'Dos vector<int> se comparan con ==. Con un texto de 2·10⁵ letras, cin >> s ya es rápido si desactivas la sincronización.',
      java: 'Arrays.equals(a, b) compara los 26 cajones. Lee el texto con br.readLine() y recórrelo con charAt.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          s = "arbusto"
          k = 2
          v = 0
          for i in range(k):
              if s[i] in "aeiou":
                  v += 1
          mejor = v
          for i in range(k, len(s)):
              if s[i] in "aeiou":
                  v += 1
              if s[i - k] in "aeiou":
                  v -= 1
              mejor = max(mejor, v)
          print(mejor)
        `,
        cpp: code`
          #include <iostream>
          #include <string>
          using namespace std;

          bool esVocal(char c) {
              return c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u';
          }

          int main() {
              string s = "arbusto";
              int k = 2, v = 0;
              for (int i = 0; i < k; i++) if (esVocal(s[i])) v++;
              int mejor = v;
              for (int i = k; i < (int)s.size(); i++) {
                  if (esVocal(s[i])) v++;
                  if (esVocal(s[i - k])) v--;
                  if (v > mejor) mejor = v;
              }
              cout << mejor << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              static boolean esVocal(char c) {
                  return "aeiou".indexOf(c) >= 0;
              }

              public static void main(String[] args) {
                  String s = "arbusto";
                  int k = 2, v = 0;
                  for (int i = 0; i < k; i++) if (esVocal(s.charAt(i))) v++;
                  int mejor = v;
                  for (int i = k; i < s.length(); i++) {
                      if (esVocal(s.charAt(i))) v++;
                      if (esVocal(s.charAt(i - k))) v--;
                      mejor = Math.max(mejor, v);
                  }
                  System.out.println(mejor);
              }
          }
        `,
      },
      options: ['1', '2', '3'],
      answer: 0,
      explanation: 'Las ventanas de 2 letras son ar, rb, bu, us, st y to. Ninguna tiene dos vocales juntas, así que el máximo es 1.',
      wrongHint: 'La ventana solo ve 2 letras a la vez. Escríbelas todas y cuenta las vocales de cada una.',
    },
  },
  problem: {
    id: 'p20-huellas-del-bosque',
    title: 'LAS HUELLAS DEL BOSQUE',
    statement:
      'Cedro sigue el rastro de un animal. El sendero es un texto S y la huella del animal es una palabra P. ' +
      'Un tramo de S es una pisada si tiene el mismo largo que P y es un anagrama de P: las mismas letras, la misma cantidad de veces, en cualquier orden. ' +
      'Cuenta cuántos tramos de S son pisadas (pueden solaparse) y en qué posición empieza la primera.',
    inputSpec: 'Línea 1: el sendero S. Línea 2: la huella P.',
    outputSpec: 'Dos líneas: la cantidad de pisadas y la posición (desde 1) donde empieza la primera, o -1 si no hay ninguna.',
    constraints: '1 ≤ |P| ≤ |S| ≤ 2·10⁵ · S y P solo tienen letras minúsculas (a–z).',
    difficulty: 'dificil',
    xp: 250,
    timeLimitMs: 2000,
    tests: tests([
      huellas('cbaebabacd', 'abc'),
      huellas('bosque', 'xyz'),
      huellas('roma', 'amor'),
      huellas('abab', 'ab'),
      huellas('a', 'a'),
      huellas(todoA, 'aa'),
      huellas(dosLetras, 'aabab'),
      huellas(tresLetras, barajar(tresLetras.slice(50000, 150000))),
      huellas(alFinal.s, alFinal.p),
      huellas(sinPisadas.s, sinPisadas.p),
    ]),
    starter: {
      python: code`
        import sys
        input = sys.stdin.readline

        s = input().strip()
        p = input().strip()
        n, k = len(s), len(p)
        cp = [0] * 26
        cs = [0] * 26
        for c in p:
            cp[ord(c) - 97] += 1
        total = 0
        primera = -1
        # TODO: desliza una ventana de largo k por s, actualizando cs con la letra
        # que entra y la que sale; cuando cs == cp, es una pisada
        print(total)
        print(primera)
      `,
      cpp: code`
        #include <iostream>
        #include <string>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            string s, p;
            cin >> s >> p;
            int n = s.size(), k = p.size();
            vector<int> cp(26, 0), cs(26, 0);
            for (char c : p) cp[c - 'a']++;
            int total = 0, primera = -1;
            // TODO: desliza una ventana de largo k por s, actualizando cs con la letra
            // que entra y la que sale; cuando cs == cp, es una pisada
            cout << total << "\n" << primera << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.Arrays;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                String s = br.readLine().trim();
                String p = br.readLine().trim();
                int n = s.length(), k = p.length();
                int[] cp = new int[26];
                int[] cs = new int[26];
                for (int i = 0; i < k; i++) cp[p.charAt(i) - 'a']++;
                int total = 0, primera = -1;
                // TODO: desliza una ventana de largo k por s, actualizando cs con la letra
                // que entra y la que sale; cuando Arrays.equals(cs, cp), es una pisada
                System.out.println(total);
                System.out.println(primera);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        input = sys.stdin.readline

        s = input().strip()
        p = input().strip()
        n, k = len(s), len(p)
        cp = [0] * 26
        cs = [0] * 26
        for c in p:
            cp[ord(c) - 97] += 1
        total = 0
        primera = -1
        for i in range(n):
            cs[ord(s[i]) - 97] += 1
            if i >= k:
                cs[ord(s[i - k]) - 97] -= 1
            if i >= k - 1 and cs == cp:
                total += 1
                if primera == -1:
                    primera = i - k + 2
        print(total)
        print(primera)
      `,
      cpp: code`
        #include <iostream>
        #include <string>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            string s, p;
            cin >> s >> p;
            int n = s.size(), k = p.size();
            vector<int> cp(26, 0), cs(26, 0);
            for (char c : p) cp[c - 'a']++;
            int total = 0, primera = -1;
            for (int i = 0; i < n; i++) {
                cs[s[i] - 'a']++;
                if (i >= k) cs[s[i - k] - 'a']--;
                if (i >= k - 1 && cs == cp) {
                    total++;
                    if (primera == -1) primera = i - k + 2;
                }
            }
            cout << total << "\n" << primera << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.Arrays;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                String s = br.readLine().trim();
                String p = br.readLine().trim();
                int n = s.length(), k = p.length();
                int[] cp = new int[26];
                int[] cs = new int[26];
                for (int i = 0; i < k; i++) cp[p.charAt(i) - 'a']++;
                int total = 0, primera = -1;
                for (int i = 0; i < n; i++) {
                    cs[s.charAt(i) - 'a']++;
                    if (i >= k) cs[s.charAt(i - k) - 'a']--;
                    if (i >= k - 1 && Arrays.equals(cs, cp)) {
                        total++;
                        if (primera == -1) primera = i - k + 2;
                    }
                }
                System.out.println(total);
                System.out.println(primera);
            }
        }
      `,
    },
    hints: [
      'Para saber si un tramo es anagrama de P basta con comparar sus 26 conteos de letras, como hacía Vera.',
      'No recuentes cada tramo desde cero: si P es larga, serían |S|·|P| pasos. Los tramos vecinos solo difieren en una letra que entra y una que sale.',
      'Recorre i de 0 a n - 1: suma s[i] a cs; si i ≥ k, resta s[i - k]. Cuando i ≥ k - 1 y cs == cp, es una pisada que empieza en i - k + 2 (desde 1).',
    ],
  },
  outro: [
    { speaker: 'CEDRO', text: 'Ni una huella se te escapó, y sin recontar el sendero una sola vez. Eso es dominar el bosque.' },
    { speaker: 'CEDRO', text: 'Toma la Medalla Hoja. Te la ganaste recorriendo con cabeza, no solo con pies.' },
    { speaker: 'CEDRO', text: 'Más allá del sendero está la Cueva Recursiva. Sus puertas se abrirán próximamente.' },
  ],
  rewardTip: {
    title: 'Ventana de conteos',
    text: {
      python: 'cs[ord(s[i]) - 97] += 1 al entrar y -= 1 al salir. cs == cp compara los 26 cajones a la vez.',
      cpp: 'cs[s[i] - \'a\']++ al entrar y cs[s[i - k] - \'a\']-- al salir. cs == cp compara los vectores.',
      java: 'cs[s.charAt(i) - \'a\']++ al entrar y -- al salir. Arrays.equals(cs, cp) compara los 26 cajones.',
    },
  },
};
