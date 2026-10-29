import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

type Op = ['LLEGA', string] | ['SUBE', number] | ['PRIMERO'];

const ferry = (ops: Op[]): [string, string] => {
  const fila: string[] = [];
  let frente = 0;
  const out: string[] = [];
  for (const op of ops) {
    if (op[0] === 'LLEGA') fila.push(op[1]);
    else if (op[0] === 'PRIMERO') out.push(frente < fila.length ? fila[frente]! : 'NADIE');
    else if (frente === fila.length) out.push('NADIE');
    else {
      frente = Math.min(fila.length, frente + op[1]);
      out.push(fila[frente - 1]!);
    }
  }
  out.push(`QUEDAN ${fila.length - frente}`);
  return [`${ops.length}\n${ops.map((o) => o.join(' ')).join('\n')}`, out.join('\n')];
};

const r = rng(3232);
const nombre = () => Array.from({ length: r(3, 8) }, () => String.fromCharCode(97 + r(0, 25))).join('');
const llegan = (n: number): Op[] => Array.from({ length: n }, () => ['LLEGA', nombre()] as Op);

// Llegan 150 000 y luego suben de a muchos: sacar del frente de una lista es O(n) cada vez.
const enMasa: Op[] = [...llegan(150000)];
for (let i = 0; i < 2000; i++) enMasa.push(i % 2 === 0 ? ['SUBE', r(1, 100)] : ['PRIMERO']);
for (let i = 0; i < 2000; i++) enMasa.push(['SUBE', 1]);
// Mezcla al azar de llegadas y salidas.
const mezcla: Op[] = [];
for (let i = 0; i < 199000; i++) {
  const x = r(0, 99);
  if (x < 98 || mezcla.length < 10) mezcla.push(['LLEGA', nombre()]);
  else if (x === 98) mezcla.push(['SUBE', r(1, 120)]);
  else mezcla.push(['PRIMERO']);
}
// Una sola persona a la vez: llega, sube; llega, sube...
const turnos: Op[] = [];
for (let i = 0; i < 2400; i++) turnos.push(['LLEGA', nombre()], ['SUBE', 1], ['PRIMERO']);
// Todos llegan y se van de golpe, varias veces.
const oleadas: Op[] = [];
for (let o = 0; o < 4; o++) {
  oleadas.push(...llegan(45000));
  oleadas.push(['PRIMERO'], ['SUBE', 44999], ['PRIMERO'], ['SUBE', 5], ['SUBE', 1]);
}

export const nivel32: Level = {
  number: 32,
  id: 'n32-cola',
  title: 'Cola',
  topic: 'Colas (queue)',
  npc: { id: 'ramon', name: 'RAMÓN', title: 'Taquillero del ferry', sprite: 'npc32', x: 13, y: 2 },
  greeting: 'Aquí nadie se cuela. El primero que llega es el primero que sube.',
  intro: [
    { speaker: 'RAMÓN', text: 'Buenas. Soy Ramón y vendo los boletos del ferry desde hace treinta años.' },
    { speaker: 'RAMÓN', text: 'Brisa saca primero la última caja. Yo hago lo contrario: sube primero quien llegó primero.' },
    { speaker: 'RAMÓN', text: 'Los días de feria la fila es enorme. Si la manejas mal, el ferry zarpa sin nadie.' },
    { speaker: 'RAMÓN', text: '¿Te explico cómo funciona una cola o vamos al duelo?' },
  ],
  lesson: {
    concept: 'COLA (QUEUE) · FIFO',
    goals: ['Encolar al final y sacar del frente', 'Entender FIFO: el primero en entrar sale primero', 'Usar una estructura donde sacar del frente sea O(1)'],
    explanation:
      'Una cola es una fila: se entra por atrás y se sale por adelante. A eso se le llama FIFO (first in, first out). ' +
      'Cuidado: sacar el primero de una lista o arreglo normal mueve todos los demás un lugar, y eso cuesta O(n). ' +
      'Las colas de verdad (deque, queue, ArrayDeque) sacan del frente en O(1).',
    code: {
      python: code`
        from collections import deque

        n, k = map(int, input().split())
        fila = deque(range(1, n + 1))
        for _ in range(k):
            fila.append(fila.popleft())  # el primero pasa al final
        print(*fila)
      `,
      cpp: code`
        #include <iostream>
        #include <queue>
        using namespace std;

        int main() {
            int n, k;
            cin >> n >> k;
            queue<int> fila;
            for (int i = 1; i <= n; i++) fila.push(i);
            for (int i = 0; i < k; i++) {
                fila.push(fila.front());  // el primero pasa al final
                fila.pop();
            }
            bool primero = true;
            while (!fila.empty()) {
                if (!primero) cout << " ";
                cout << fila.front();
                fila.pop();
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
                int k = sc.nextInt();
                ArrayDeque<Integer> fila = new ArrayDeque<>();
                for (int i = 1; i <= n; i++) fila.addLast(i);
                for (int i = 0; i < k; i++) {
                    fila.addLast(fila.pollFirst());  // el primero pasa al final
                }
                StringBuilder sb = new StringBuilder();
                while (!fila.isEmpty()) {
                    if (sb.length() > 0) sb.append(" ");
                    sb.append(fila.pollFirst());
                }
                System.out.println(sb);
            }
        }
      `,
    },
    examples: [
      { input: '5 2', output: '3 4 5 1 2' },
      { input: '3 0', output: '1 2 3' },
      { input: '4 5', output: '2 3 4 1' },
    ],
    tips: {
      python: 'Usa collections.deque: append() encola y popleft() saca del frente en O(1). lista.pop(0) es O(n) y con filas grandes da TLE.',
      cpp: 'queue<T> tiene push, front, pop y empty. Igual que en la pila, pop() no devuelve nada: lee front() antes.',
      java: 'ArrayDeque sirve también como cola: addLast() encola, peekFirst() mira y pollFirst() saca del frente.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          from collections import deque

          fila = deque()
          fila.append(1)
          fila.append(2)
          fila.append(3)
          fila.popleft()
          fila.append(4)
          print(fila[0])
        `,
        cpp: code`
          #include <iostream>
          #include <queue>
          using namespace std;

          int main() {
              queue<int> fila;
              fila.push(1);
              fila.push(2);
              fila.push(3);
              fila.pop();
              fila.push(4);
              cout << fila.front() << "\n";
              return 0;
          }
        `,
        java: code`
          import java.util.ArrayDeque;

          public class Main {
              public static void main(String[] args) {
                  ArrayDeque<Integer> fila = new ArrayDeque<>();
                  fila.addLast(1);
                  fila.addLast(2);
                  fila.addLast(3);
                  fila.pollFirst();
                  fila.addLast(4);
                  System.out.println(fila.peekFirst());
              }
          }
        `,
      },
      options: ['1', '2', '4'],
      answer: 1,
      explanation: 'El 1 llegó primero y fue el primero en salir. Ahora encabeza la fila el 2; el 4 se formó al final.',
      wrongHint: 'En una cola se sale por adelante y se entra por atrás. ¿Quién quedó adelante después de que saliera uno?',
    },
  },
  problem: {
    id: 'p32-fila-del-ferry',
    title: 'LA FILA DEL FERRY',
    statement:
      'Ramón anota todo lo que pasa en la fila del ferry. Hay tres tipos de operaciones: ' +
      'LLEGA nombre: esa persona se forma al final de la fila. ' +
      'SUBE k: las primeras k personas de la fila suben al ferry (si hay menos de k, suben todas); imprime el nombre de la última que subió, o NADIE si la fila estaba vacía. ' +
      'PRIMERO: imprime el nombre de quien encabeza la fila sin sacarlo, o NADIE si está vacía. ' +
      'Al terminar, imprime QUEDAN seguido de cuántas personas siguen en la fila.',
    inputSpec: 'Línea 1: Q, la cantidad de operaciones. Luego Q líneas, cada una con una operación.',
    outputSpec: 'Una línea por cada SUBE y cada PRIMERO, en orden. Al final, la línea QUEDAN x.',
    constraints: '1 ≤ Q ≤ 2·10⁵ · 1 ≤ k ≤ 2·10⁵ · los nombres tienen de 1 a 8 letras minúsculas · hay a lo sumo 5000 operaciones SUBE o PRIMERO.',
    difficulty: 'facil',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      ferry([['LLEGA', 'ana'], ['LLEGA', 'beto'], ['LLEGA', 'caro'], ['PRIMERO'], ['SUBE', 2], ['PRIMERO'], ['SUBE', 5], ['SUBE', 1]]),
      ferry([['PRIMERO'], ['LLEGA', 'luz'], ['SUBE', 1], ['LLEGA', 'mar'], ['LLEGA', 'sol']]),
      ferry([['SUBE', 3]]),
      ferry([['LLEGA', 'eva'], ['LLEGA', 'eva'], ['SUBE', 1], ['PRIMERO'], ['SUBE', 200000], ['PRIMERO']]),
      ferry(enMasa),
      ferry(mezcla),
      ferry(turnos),
      ferry(oleadas),
    ]),
    starter: {
      python: code`
        import sys
        from collections import deque
        input = sys.stdin.readline

        q = int(input())
        fila = deque()
        out = []
        for _ in range(q):
            partes = input().split()
            # TODO: LLEGA → encola el nombre; PRIMERO → mira el frente;
            # SUBE k → saca hasta k del frente y anota el último (o NADIE)
        out.append("QUEDAN " + str(len(fila)))
        print("\n".join(out))
      `,
      cpp: code`
        #include <iostream>
        #include <queue>
        #include <string>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int q;
            cin >> q;
            queue<string> fila;
            for (int i = 0; i < q; i++) {
                string op;
                cin >> op;
                // TODO: LLEGA → lee el nombre y encólalo; PRIMERO → mira el frente;
                // SUBE k → saca hasta k del frente e imprime el último (o NADIE)
            }
            cout << "QUEDAN " << fila.size() << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayDeque;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                int q = Integer.parseInt(br.readLine().trim());
                ArrayDeque<String> fila = new ArrayDeque<>();
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < q; i++) {
                    StringTokenizer st = new StringTokenizer(br.readLine());
                    String op = st.nextToken();
                    // TODO: LLEGA → encola el nombre; PRIMERO → mira el frente;
                    // SUBE k → saca hasta k del frente y anota el último (o NADIE)
                }
                sb.append("QUEDAN ").append(fila.size()).append("\n");
                System.out.print(sb);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        from collections import deque
        input = sys.stdin.readline

        q = int(input())
        fila = deque()
        out = []
        for _ in range(q):
            partes = input().split()
            if partes[0] == "LLEGA":
                fila.append(partes[1])
            elif partes[0] == "PRIMERO":
                out.append(fila[0] if fila else "NADIE")
            else:
                k = int(partes[1])
                if not fila:
                    out.append("NADIE")
                else:
                    ultimo = ""
                    while k > 0 and fila:
                        ultimo = fila.popleft()
                        k -= 1
                    out.append(ultimo)
        out.append("QUEDAN " + str(len(fila)))
        print("\n".join(out))
      `,
      cpp: code`
        #include <iostream>
        #include <queue>
        #include <string>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int q;
            cin >> q;
            queue<string> fila;
            for (int i = 0; i < q; i++) {
                string op;
                cin >> op;
                if (op == "LLEGA") {
                    string nombre;
                    cin >> nombre;
                    fila.push(nombre);
                } else if (op == "PRIMERO") {
                    cout << (fila.empty() ? "NADIE" : fila.front()) << "\n";
                } else {
                    int k;
                    cin >> k;
                    if (fila.empty()) {
                        cout << "NADIE\n";
                    } else {
                        string ultimo;
                        while (k > 0 && !fila.empty()) {
                            ultimo = fila.front();
                            fila.pop();
                            k--;
                        }
                        cout << ultimo << "\n";
                    }
                }
            }
            cout << "QUEDAN " << fila.size() << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.ArrayDeque;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                int q = Integer.parseInt(br.readLine().trim());
                ArrayDeque<String> fila = new ArrayDeque<>();
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < q; i++) {
                    StringTokenizer st = new StringTokenizer(br.readLine());
                    String op = st.nextToken();
                    if (op.equals("LLEGA")) {
                        fila.addLast(st.nextToken());
                    } else if (op.equals("PRIMERO")) {
                        sb.append(fila.isEmpty() ? "NADIE" : fila.peekFirst()).append("\n");
                    } else {
                        int k = Integer.parseInt(st.nextToken());
                        if (fila.isEmpty()) {
                            sb.append("NADIE\n");
                        } else {
                            String ultimo = "";
                            while (k > 0 && !fila.isEmpty()) {
                                ultimo = fila.pollFirst();
                                k--;
                            }
                            sb.append(ultimo).append("\n");
                        }
                    }
                }
                sb.append("QUEDAN ").append(fila.size()).append("\n");
                System.out.print(sb);
            }
        }
      `,
    },
    hints: [
      'Quien llega se pone al final y quien sube sale del principio: es una cola (FIFO).',
      'No uses una lista quitando el elemento 0: cada vez mueve a todos los demás. Con 10⁵ personas eso es demasiado. Usa deque, queue o ArrayDeque.',
      'Para SUBE k: si la fila está vacía imprime NADIE; si no, saca del frente mientras k > 0 y queden personas, guardando el último nombre que saliste. Ese es el que imprimes.',
    ],
  },
  outro: [
    { speaker: 'RAMÓN', text: '¡Todos a bordo y en orden! Así da gusto trabajar.' },
    { speaker: 'RAMÓN', text: 'Pila para lo último, cola para lo primero. Ya tienes dos herramientas del puerto.' },
    { speaker: 'RAMÓN', text: 'Baja por el muelle del oeste. Al final está Nerea, la vigía, contando olas.' },
  ],
  rewardTip: {
    title: 'Cola',
    text: {
      python: 'from collections import deque; append() encola, popleft() saca del frente en O(1). Nunca lista.pop(0) en filas grandes.',
      cpp: 'queue<T> q; q.push(x); q.front(); q.pop(); q.size(). Lee front() antes de pop().',
      java: 'ArrayDeque<T> q: addLast(x), peekFirst(), pollFirst(), size(). O(1) en ambos extremos.',
    },
  },
};
