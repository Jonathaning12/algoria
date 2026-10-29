import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const PARES: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

const balanceado = (s: string): boolean => {
  const pila: string[] = [];
  for (const c of s) {
    if (c === '(' || c === '[' || c === '{') pila.push(c);
    else if (pila.length === 0 || pila.pop() !== PARES[c]) return false;
  }
  return pila.length === 0;
};

const cajas = (lineas: string[]): [string, string] => [
  `${lineas.length}\n${lineas.join('\n')}`,
  lineas.map((s) => (balanceado(s) ? 'SI' : 'NO')).join('\n'),
];

const r = rng(3131);
const ABRE = '([{';
const CIERRA = ')]}';
/** Cadena balanceada al azar de largo par `n`. */
const balanceada = (n: number): string => {
  const out: string[] = [];
  const pila: number[] = [];
  for (let i = 0; i < n; i++) {
    const quedan = n - i;
    if (pila.length > 0 && (pila.length === quedan || r(0, 1) === 0)) out.push(CIERRA[pila.pop()!]!);
    else {
      const t = r(0, 2);
      pila.push(t);
      out.push(ABRE[t]!);
    }
  }
  return out.join('');
};
/** Cambia un signo al azar por otro: casi siempre la rompe. */
const romper = (s: string): string => {
  const i = r(0, s.length - 1);
  const todos = '()[]{}';
  let c = todos[r(0, 5)]!;
  if (c === s[i]) c = c === '(' ? ']' : '(';
  return s.slice(0, i) + c + s.slice(i + 1);
};

const profunda = '('.repeat(100000) + ')'.repeat(100000);
const profundaMal = '('.repeat(100000) + ')'.repeat(99999) + ']';
const mezcla = Array.from({ length: 100 }, (_, i) => (i % 3 === 0 ? romper(balanceada(2000)) : balanceada(2000)));
const largas = [balanceada(60000), romper(balanceada(60000)), balanceada(60000), '{'.repeat(10000) + '}'.repeat(9999)];
const repetida = ['()[]{}'.repeat(15000), '([{'.repeat(10000) + '}])'.repeat(10000), '([{'.repeat(10000) + ')]}'.repeat(10000)];

export const nivel31: Level = {
  number: 31,
  id: 'n31-pila',
  title: 'Pila',
  topic: 'Pilas (stack)',
  npc: { id: 'brisa', name: 'BRISA', title: 'Estibadora del muelle', sprite: 'npc31', x: 4, y: 2 },
  greeting: 'La última caja que subo es la primera que bajo. Siempre.',
  intro: [
    { speaker: 'BRISA', text: '¡Ah del muelle! Bienvenido al Puerto Estructura. Soy Brisa y apilo cajas desde que amanece.' },
    { speaker: 'BRISA', text: 'Aquí aprenderás a guardar datos en las estructuras correctas. La primera es la más sencilla: la pila.' },
    { speaker: 'BRISA', text: 'Mis cajas llevan sellos que abren y cierran: ( [ {. Cada cierre tiene que tapar al último que quedó abierto.' },
    { speaker: 'BRISA', text: '¿Te enseño a apilar o pasamos directo al duelo?' },
  ],
  lesson: {
    concept: 'PILA (STACK) · LIFO',
    goals: ['Apilar y desapilar elementos', 'Entender LIFO: el último en entrar sale primero', 'Usar una pila para emparejar aperturas y cierres'],
    explanation:
      'Una pila es como una torre de cajas: solo puedes poner o quitar arriba. A eso se le llama LIFO (last in, first out). ' +
      'Apilar y desapilar cuestan O(1). ' +
      'Sirve cada vez que algo abierto debe cerrarse en orden inverso: paréntesis, etiquetas, llamadas a funciones.',
    code: {
      python: code`
        n = int(input())
        pila = []
        for x in input().split():
            pila.append(int(x))      # apilar
        salida = []
        while pila:
            salida.append(pila.pop())  # desapilar el de arriba
        print(*salida)
      `,
      cpp: code`
        #include <iostream>
        #include <stack>
        using namespace std;

        int main() {
            int n;
            cin >> n;
            stack<int> pila;
            for (int i = 0; i < n; i++) {
                int x;
                cin >> x;
                pila.push(x);
            }
            bool primero = true;
            while (!pila.empty()) {
                if (!primero) cout << " ";
                cout << pila.top();
                pila.pop();
                primero = false;
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
                ArrayDeque<Integer> pila = new ArrayDeque<>();
                for (int i = 0; i < n; i++) pila.push(sc.nextInt());
                StringBuilder sb = new StringBuilder();
                while (!pila.isEmpty()) {
                    if (sb.length() > 0) sb.append(" ");
                    sb.append(pila.pop());
                }
                System.out.println(sb);
            }
        }
      `,
    },
    examples: [
      { input: '4\n1 2 3 4', output: '4 3 2 1' },
      { input: '1\n7', output: '7' },
      { input: '3\n5 0 9', output: '9 0 5' },
    ],
    tips: {
      python: 'Una lista ya es una pila: append() apila y pop() desapila el último, ambos en O(1). Revisa que no esté vacía antes de pop().',
      cpp: 'stack<T> tiene push, top, pop y empty. Ojo: pop() no devuelve nada; lee top() antes de quitarlo.',
      java: 'Usa ArrayDeque como pila: push, peek y pop. La clase Stack es antigua y más lenta.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          pila = []
          pila.append(1)
          pila.append(2)
          pila.pop()
          pila.append(3)
          pila.append(4)
          pila.pop()
          print(pila[-1])
        `,
        cpp: code`
          #include <iostream>
          #include <stack>
          using namespace std;

          int main() {
              stack<int> pila;
              pila.push(1);
              pila.push(2);
              pila.pop();
              pila.push(3);
              pila.push(4);
              pila.pop();
              cout << pila.top() << "\n";
              return 0;
          }
        `,
        java: code`
          import java.util.ArrayDeque;

          public class Main {
              public static void main(String[] args) {
                  ArrayDeque<Integer> pila = new ArrayDeque<>();
                  pila.push(1);
                  pila.push(2);
                  pila.pop();
                  pila.push(3);
                  pila.push(4);
                  pila.pop();
                  System.out.println(pila.peek());
              }
          }
        `,
      },
      options: ['4', '3', '1'],
      answer: 1,
      explanation: 'Cada pop quita el de arriba: primero sale el 2 y luego el 4. Arriba queda el 3, encima del 1.',
      wrongHint: 'Dibuja la torre paso a paso: cada pop quita solo la caja de más arriba.',
    },
  },
  problem: {
    id: 'p31-sellos-de-brisa',
    title: 'LOS SELLOS DE BRISA',
    statement:
      'Cada carga de Brisa se describe con una fila de sellos: ( ) [ ] { }. ' +
      'Una carga está bien estibada si cada sello que cierra corresponde al último sello abierto que sigue sin cerrar, y al final no queda ninguno abierto. ' +
      'Por ejemplo, ([]{}) está bien, pero ([)] y (( no. Para cada carga, responde SI o NO.',
    inputSpec: 'Línea 1: T, la cantidad de cargas. Luego T líneas, cada una con una fila de sellos sin espacios.',
    outputSpec: 'T líneas: SI si la carga está bien estibada, NO si no.',
    constraints: '1 ≤ T ≤ 1000 · cada fila tiene entre 1 y 2·10⁵ sellos · en total hay a lo sumo 2,2·10⁵ sellos.',
    difficulty: 'facil',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      cajas(['([]{})', '([)]', '((', '}{']),
      cajas(['{[()()]}', '()[]{}', '[']),
      cajas([')', '()', '(]', '{}}']),
      cajas([profunda]),
      cajas([profundaMal]),
      cajas(mezcla),
      cajas(largas),
      cajas(repetida),
      cajas([')'.repeat(1000) + '('.repeat(1000), '[](){}'.repeat(5), '{[}]']),
    ]),
    starter: {
      python: code`
        import sys
        input = sys.stdin.readline

        pareja = {')': '(', ']': '[', '}': '{'}
        t = int(input())
        res = []
        for _ in range(t):
            s = input().strip()
            pila = []
            ok = True
            # TODO: recorre s; apila los que abren y, con cada cierre,
            # comprueba que el de arriba sea su pareja
            res.append("SI" if ok else "NO")
        print("\n".join(res))
      `,
      cpp: code`
        #include <iostream>
        #include <stack>
        #include <string>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int t;
            cin >> t;
            while (t--) {
                string s;
                cin >> s;
                stack<char> pila;
                bool ok = true;
                // TODO: recorre s; apila los que abren y, con cada cierre,
                // comprueba que el de arriba sea su pareja
                cout << (ok ? "SI" : "NO") << "\n";
            }
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayDeque;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                int t = Integer.parseInt(br.readLine().trim());
                StringBuilder sb = new StringBuilder();
                for (int k = 0; k < t; k++) {
                    String s = br.readLine().trim();
                    ArrayDeque<Character> pila = new ArrayDeque<>();
                    boolean ok = true;
                    // TODO: recorre s; apila los que abren y, con cada cierre,
                    // comprueba que el de arriba sea su pareja
                    sb.append(ok ? "SI" : "NO").append("\n");
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

        pareja = {')': '(', ']': '[', '}': '{'}
        t = int(input())
        res = []
        for _ in range(t):
            s = input().strip()
            pila = []
            ok = True
            for c in s:
                if c in '([{':
                    pila.append(c)
                elif not pila or pila.pop() != pareja[c]:
                    ok = False
                    break
            if pila:
                ok = False
            res.append("SI" if ok else "NO")
        print("\n".join(res))
      `,
      cpp: code`
        #include <iostream>
        #include <stack>
        #include <string>
        using namespace std;

        char pareja(char c) {
            if (c == ')') return '(';
            if (c == ']') return '[';
            return '{';
        }

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int t;
            cin >> t;
            while (t--) {
                string s;
                cin >> s;
                stack<char> pila;
                bool ok = true;
                for (char c : s) {
                    if (c == '(' || c == '[' || c == '{') {
                        pila.push(c);
                    } else if (pila.empty() || pila.top() != pareja(c)) {
                        ok = false;
                        break;
                    } else {
                        pila.pop();
                    }
                }
                if (!pila.empty()) ok = false;
                cout << (ok ? "SI" : "NO") << "\n";
            }
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayDeque;

        public class Main {
            static char pareja(char c) {
                if (c == ')') return '(';
                if (c == ']') return '[';
                return '{';
            }

            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                int t = Integer.parseInt(br.readLine().trim());
                StringBuilder sb = new StringBuilder();
                for (int k = 0; k < t; k++) {
                    String s = br.readLine().trim();
                    ArrayDeque<Character> pila = new ArrayDeque<>();
                    boolean ok = true;
                    for (int i = 0; i < s.length(); i++) {
                        char c = s.charAt(i);
                        if (c == '(' || c == '[' || c == '{') {
                            pila.push(c);
                        } else if (pila.isEmpty() || pila.pop() != pareja(c)) {
                            ok = false;
                            break;
                        }
                    }
                    if (!pila.isEmpty()) ok = false;
                    sb.append(ok ? "SI" : "NO").append("\n");
                }
                System.out.print(sb);
            }
        }
      `,
    },
    hints: [
      'Cuando llega un sello que cierra, solo importa el último que quedó abierto. ¿Qué estructura te da siempre el último?',
      'Apila cada sello que abre. Con cada cierre, mira el de arriba: si la pila está vacía o no es su pareja, la carga está mal.',
      'No olvides el final: si después de recorrer toda la fila la pila no quedó vacía, algún sello quedó abierto y la respuesta es NO.',
    ],
  },
  outro: [
    { speaker: 'BRISA', text: '¡Ni una caja mal estibada! Tienes buen ojo para las pilas.' },
    { speaker: 'BRISA', text: 'Recuerda: si lo último que abriste es lo primero que cierras, piensa en una pila.' },
    { speaker: 'BRISA', text: 'Ramón, el taquillero del ferry, está aquí al lado. Su fila funciona justo al revés que mis cajas.' },
  ],
  rewardTip: {
    title: 'Pila',
    text: {
      python: 'pila = []; pila.append(x) apila; pila.pop() quita el último; pila[-1] lo mira. Todo O(1).',
      cpp: 'stack<T> s; s.push(x); s.top(); s.pop(); s.empty(). Lee top() antes de pop().',
      java: 'ArrayDeque<T> pila: push(x), peek(), pop(), isEmpty(). Más rápida que Stack.',
    },
  },
};
