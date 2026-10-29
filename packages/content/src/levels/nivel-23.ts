import type { Level } from '@algoria/shared';
import { code, tests } from './_util';

const mochila = (s: number, w: number[]): [string, string] => {
  const lineas: string[] = [];
  const elegidos: number[] = [];
  const explorar = (desde: number, suma: number) => {
    for (let i = desde; i < w.length; i++) {
      const nueva = suma + w[i]!;
      if (nueva > s) continue;
      elegidos.push(i + 1);
      if (nueva === s) lineas.push(elegidos.join(' '));
      else explorar(i + 1, nueva);
      elegidos.pop();
    }
  };
  explorar(0, 0);
  return [`${w.length} ${s}\n${w.join(' ')}`, [String(lineas.length), ...lineas].join('\n')];
};

export const nivel23: Level = {
  number: 23,
  id: 'n23-backtracking',
  title: 'Backtracking',
  topic: 'Backtracking: subconjuntos',
  npc: { id: 'ambar', name: 'ÁMBAR', title: 'Coleccionista de cristales', sprite: 'npc23', x: 14, y: 2 },
  greeting: 'Lo tomo, pruebo, lo devuelvo. Así reviso cada combinación sin olvidar ninguna.',
  intro: [
    { speaker: 'ÁMBAR', text: 'Bienvenido. Soy Ámbar y colecciono los cristales más raros de la cueva.' },
    { speaker: 'ÁMBAR', text: 'Mi mochila se equilibra solo con un peso exacto. Así que pruebo todas las combinaciones de cristales.' },
    { speaker: 'ÁMBAR', text: 'Mi método se llama backtracking: elijo un cristal, sigo explorando y, al volver, lo devuelvo para probar otro.' },
    { speaker: 'ÁMBAR', text: '¿Revisamos la lección juntos o vas directo al duelo?' },
  ],
  lesson: {
    concept: 'BACKTRACKING · SUBCONJUNTOS',
    goals: ['Generar todas las combinaciones con recursión', 'Elegir, explorar y deshacer', 'Podar ramas que ya no sirven'],
    explanation:
      'Backtracking es probar opciones de forma ordenada: eliges algo, exploras todo lo que se puede hacer a partir de ahí y luego deshaces la elección para probar la siguiente. ' +
      'Para generar los subconjuntos de {1, ..., n}, la función recibe desde qué número puede elegir: toma cada i, lo agrega, se llama con i + 1 y al volver lo quita. ' +
      'Hay 2ⁿ subconjuntos, así que solo sirve con n pequeño. Y si una rama ya no puede funcionar (por ejemplo, te pasaste del peso), no hace falta seguirla: eso se llama podar.',
    code: {
      python: code`
        n = int(input())
        elegidos = []

        def explorar(desde):
            for i in range(desde, n + 1):
                elegidos.append(i)      # elegir
                print(*elegidos)
                explorar(i + 1)         # explorar
                elegidos.pop()          # deshacer

        explorar(1)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int n;
        vector<int> elegidos;

        void explorar(int desde) {
            for (int i = desde; i <= n; i++) {
                elegidos.push_back(i);      // elegir
                for (int j = 0; j < (int)elegidos.size(); j++) {
                    if (j > 0) cout << " ";
                    cout << elegidos[j];
                }
                cout << "\n";
                explorar(i + 1);            // explorar
                elegidos.pop_back();        // deshacer
            }
        }

        int main() {
            cin >> n;
            explorar(1);
            return 0;
        }
      `,
      java: code`
        import java.util.ArrayList;
        import java.util.Scanner;

        public class Main {
            static int n;
            static ArrayList<Integer> elegidos = new ArrayList<>();
            static StringBuilder sb = new StringBuilder();

            static void explorar(int desde) {
                for (int i = desde; i <= n; i++) {
                    elegidos.add(i);                            // elegir
                    for (int j = 0; j < elegidos.size(); j++) {
                        if (j > 0) sb.append(" ");
                        sb.append(elegidos.get(j));
                    }
                    sb.append("\n");
                    explorar(i + 1);                            // explorar
                    elegidos.remove(elegidos.size() - 1);       // deshacer
                }
            }

            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                n = sc.nextInt();
                explorar(1);
                System.out.print(sb);
            }
        }
      `,
    },
    examples: [
      { input: '2', output: '1\n1 2\n2' },
      { input: '3', output: '1\n1 2\n1 2 3\n1 3\n2\n2 3\n3' },
      { input: '1', output: '1' },
    ],
    tips: {
      python: 'elegidos.append(i) y elegidos.pop() van siempre en pareja: lo que eliges antes de explorar, lo quitas al volver.',
      cpp: 'push_back antes de explorar y pop_back al volver. Si olvidas deshacer, el vector arrastra elecciones viejas.',
      java: 'add antes de explorar y remove(size() - 1) al volver. Con remove(i) borrarías por posición, no por valor: cuidado.',
    },
    quiz: {
      question: '¿Cuántos subconjuntos no vacíos genera para n = 4? (el programa lo imprime)',
      code: {
        python: code`
          n = 4
          total = 0

          def explorar(desde):
              global total
              for i in range(desde, n + 1):
                  total += 1
                  explorar(i + 1)

          explorar(1)
          print(total)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int n = 4, total = 0;

          void explorar(int desde) {
              for (int i = desde; i <= n; i++) {
                  total++;
                  explorar(i + 1);
              }
          }

          int main() {
              explorar(1);
              cout << total << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              static int n = 4, total = 0;

              static void explorar(int desde) {
                  for (int i = desde; i <= n; i++) {
                      total++;
                      explorar(i + 1);
                  }
              }

              public static void main(String[] args) {
                  explorar(1);
                  System.out.println(total);
              }
          }
        `,
      },
      options: ['4', '15', '16'],
      answer: 1,
      explanation: 'Cada elemento puede estar o no estar: 2⁴ = 16 subconjuntos. Como el vacío nunca se cuenta, quedan 15.',
      wrongHint: 'Cada número del 1 al 4 está o no está en el subconjunto. ¿Cuántas combinaciones da eso? ¿Se cuenta el vacío aquí?',
    },
  },
  problem: {
    id: 'p23-mochila-de-ambar',
    title: 'LA MOCHILA DE ÁMBAR',
    statement:
      'Ámbar tiene N cristales en fila, numerados del 1 al N, y cada uno pesa wᵢ. Su mochila solo se equilibra si lleva exactamente S de peso. ' +
      'Encuentra todas las combinaciones de cristales (sin repetir ninguno) que pesan exactamente S. ' +
      'Escribe cada combinación con los números de sus cristales en orden creciente. ' +
      'Ordena las combinaciones como en un diccionario, comparando número a número: "1 4" va antes que "2 3", y "1 2" va antes que "1 2 5".',
    inputSpec: 'Línea 1: N y S. Línea 2: N enteros w₁ ... wₙ.',
    outputSpec: 'Línea 1: la cantidad K de combinaciones. Luego K líneas, una por combinación, con los números de los cristales separados por espacios.',
    constraints: '1 ≤ N ≤ 10 · 1 ≤ wᵢ ≤ 100 · 1 ≤ S ≤ 1000.',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      mochila(5, [1, 2, 3, 4]),
      mochila(10, [1, 2, 3]),
      mochila(7, [7]),
      mochila(6, [1, 2, 3, 4, 5, 6]),
      mochila(5, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]),
      mochila(550, [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]),
      mochila(250, [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]),
      mochila(300, [1, 2, 4, 8, 16, 32, 64, 128, 256, 100]),
      mochila(12, [3, 9, 4, 3, 5, 7, 2, 8, 1, 6]),
      mochila(1000, [100, 100, 100, 100, 100, 100, 100, 100, 100, 99]),
    ]),
    starter: {
      python: code`
        n, s = map(int, input().split())
        w = list(map(int, input().split()))
        elegidos = []
        combinaciones = []

        def explorar(desde, suma):
            # TODO: para cada i desde "desde" hasta n - 1:
            # elige el cristal i + 1, y si la suma llega justo a s guarda la combinación;
            # si todavía falta peso, explora desde i + 1. Al volver, deshaz la elección.
            pass

        explorar(0, 0)
        print(len(combinaciones))
        for c in combinaciones:
            print(*c)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int n, s;
        vector<int> w, elegidos;
        vector<vector<int>> combinaciones;

        void explorar(int desde, int suma) {
            // TODO: para cada i desde "desde" hasta n - 1:
            // elige el cristal i + 1, y si la suma llega justo a s guarda la combinación;
            // si todavía falta peso, explora desde i + 1. Al volver, deshaz la elección.
        }

        int main() {
            cin >> n >> s;
            w.resize(n);
            for (int i = 0; i < n; i++) cin >> w[i];
            explorar(0, 0);
            cout << combinaciones.size() << "\n";
            for (auto& c : combinaciones) {
                for (int j = 0; j < (int)c.size(); j++) {
                    if (j > 0) cout << " ";
                    cout << c[j];
                }
                cout << "\n";
            }
            return 0;
        }
      `,
      java: code`
        import java.util.ArrayList;
        import java.util.Scanner;

        public class Main {
            static int n, s;
            static int[] w;
            static ArrayList<Integer> elegidos = new ArrayList<>();
            static ArrayList<String> combinaciones = new ArrayList<>();

            static void explorar(int desde, int suma) {
                // TODO: para cada i desde "desde" hasta n - 1:
                // elige el cristal i + 1, y si la suma llega justo a s guarda la combinación
                // (como texto, con sus números separados por espacios);
                // si todavía falta peso, explora desde i + 1. Al volver, deshaz la elección.
            }

            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                n = sc.nextInt();
                s = sc.nextInt();
                w = new int[n];
                for (int i = 0; i < n; i++) w[i] = sc.nextInt();
                explorar(0, 0);
                StringBuilder sb = new StringBuilder();
                sb.append(combinaciones.size()).append("\n");
                for (String c : combinaciones) sb.append(c).append("\n");
                System.out.print(sb);
            }
        }
      `,
    },
    solution: {
      python: code`
        n, s = map(int, input().split())
        w = list(map(int, input().split()))
        elegidos = []
        combinaciones = []

        def explorar(desde, suma):
            for i in range(desde, n):
                nueva = suma + w[i]
                if nueva > s:
                    continue
                elegidos.append(i + 1)
                if nueva == s:
                    combinaciones.append(list(elegidos))
                else:
                    explorar(i + 1, nueva)
                elegidos.pop()

        explorar(0, 0)
        print(len(combinaciones))
        for c in combinaciones:
            print(*c)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int n, s;
        vector<int> w, elegidos;
        vector<vector<int>> combinaciones;

        void explorar(int desde, int suma) {
            for (int i = desde; i < n; i++) {
                int nueva = suma + w[i];
                if (nueva > s) continue;
                elegidos.push_back(i + 1);
                if (nueva == s) combinaciones.push_back(elegidos);
                else explorar(i + 1, nueva);
                elegidos.pop_back();
            }
        }

        int main() {
            cin >> n >> s;
            w.resize(n);
            for (int i = 0; i < n; i++) cin >> w[i];
            explorar(0, 0);
            cout << combinaciones.size() << "\n";
            for (auto& c : combinaciones) {
                for (int j = 0; j < (int)c.size(); j++) {
                    if (j > 0) cout << " ";
                    cout << c[j];
                }
                cout << "\n";
            }
            return 0;
        }
      `,
      java: code`
        import java.util.ArrayList;
        import java.util.Scanner;

        public class Main {
            static int n, s;
            static int[] w;
            static ArrayList<Integer> elegidos = new ArrayList<>();
            static ArrayList<String> combinaciones = new ArrayList<>();

            static void explorar(int desde, int suma) {
                for (int i = desde; i < n; i++) {
                    int nueva = suma + w[i];
                    if (nueva > s) continue;
                    elegidos.add(i + 1);
                    if (nueva == s) {
                        StringBuilder c = new StringBuilder();
                        for (int j = 0; j < elegidos.size(); j++) {
                            if (j > 0) c.append(" ");
                            c.append(elegidos.get(j));
                        }
                        combinaciones.add(c.toString());
                    } else {
                        explorar(i + 1, nueva);
                    }
                    elegidos.remove(elegidos.size() - 1);
                }
            }

            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                n = sc.nextInt();
                s = sc.nextInt();
                w = new int[n];
                for (int i = 0; i < n; i++) w[i] = sc.nextInt();
                explorar(0, 0);
                StringBuilder sb = new StringBuilder();
                sb.append(combinaciones.size()).append("\n");
                for (String c : combinaciones) sb.append(c).append("\n");
                System.out.print(sb);
            }
        }
      `,
    },
    hints: [
      'Con N ≤ 10 hay como mucho 2¹⁰ = 1024 combinaciones: se pueden probar todas. Usa la plantilla de la lección: elegir, explorar, deshacer.',
      'Si eliges los cristales siempre en orden creciente (cada llamada empieza desde i + 1), las combinaciones salen solas en orden de diccionario.',
      'En explorar(desde, suma): para i desde "desde", nueva = suma + w[i]. Si nueva > S, sáltalo. Agrega i + 1; si nueva == S, guarda una copia; si no, explora(i + 1, nueva). Luego quítalo.',
    ],
  },
  outro: [
    { speaker: 'ÁMBAR', text: 'Ni una combinación perdida, y todas en orden. Mi mochila nunca estuvo tan equilibrada.' },
    { speaker: 'ÁMBAR', text: 'Elegir, explorar, deshacer. Ese ritmo te servirá para laberintos, sudokus y muchos acertijos más.' },
    { speaker: 'ÁMBAR', text: 'Baja al segundo túnel: Roque, el capataz, está armando el ranking de los mineros.' },
  ],
  rewardTip: {
    title: 'Backtracking',
    text: {
      python: 'for i in range(desde, n): elegidos.append(i); explorar(i + 1); elegidos.pop(). Guarda list(elegidos), no la lista misma.',
      cpp: 'for (i = desde; i < n; i++) { push_back(i); explorar(i + 1); pop_back(); }. 2ⁿ ramas: n pequeño.',
      java: 'for (i = desde; i < n; i++) { add(i); explorar(i + 1); remove(size() - 1); }. 2ⁿ ramas: n pequeño.',
    },
  },
};
