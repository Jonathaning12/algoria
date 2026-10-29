import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const MOD = 1000000007;

const ascenso = (g: string[]): [string, string] => {
  const c = g[0]!.length;
  const best = new Array<number>(c).fill(-1); // -1 = inalcanzable
  const ways = new Array<number>(c).fill(0);
  g.forEach((row, i) => {
    let lb = -1;
    let lw = 0;
    for (let j = 0; j < c; j++) {
      if (row[j] === '#') {
        lb = -1;
        lw = 0;
      } else {
        let b: number;
        let w: number;
        if (i === 0 && j === 0) {
          b = 0;
          w = 1;
        } else if (best[j]! > lb) {
          b = best[j]!;
          w = ways[j]!;
        } else if (lb > best[j]!) {
          b = lb;
          w = lw;
        } else {
          b = lb;
          w = (ways[j]! + lw) % MOD;
        }
        if (b >= 0) b += row.charCodeAt(j) - 48;
        lb = b;
        lw = w;
      }
      best[j] = lb;
      ways[j] = lw;
    }
  });
  const out = best[c - 1]! < 0 ? '-1\n0' : `${best[c - 1]}\n${ways[c - 1]}`;
  return [`${g.length} ${c}\n${g.join('\n')}`, out];
};

const sala = (rows: number, cols: number, seed: number, digitos: string, muros: number) => {
  const r = rng(seed);
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => {
      const esquina = (i === 0 && j === 0) || (i === rows - 1 && j === cols - 1);
      if (!esquina && r(1, 1000) <= muros) return '#';
      return digitos[r(0, digitos.length - 1)]!;
    }).join(''),
  );
};
const llena = (rows: number, cols: number, d: string) => Array.from({ length: rows }, () => d.repeat(cols));
const muralla = llena(1000, 1000, '9').map((row, i) => (i === 400 ? '#'.repeat(1000) : row));

export const nivel60: Level = {
  number: 60,
  id: 'n60-gimnasio-torre',
  title: 'Gimnasio Torre',
  topic: 'Repaso: programación dinámica',
  gym: true,
  npc: { id: 'isolda', name: 'ARCHIMAGA ISOLDA', title: 'Líder del Gimnasio Torre', sprite: 'gym_torre', x: 5, y: 2 },
  greeting: 'Arriba de esta torre no se llega a fuerza de probar. Se llega recordando.',
  intro: [
    { speaker: 'ISOLDA', text: 'Llegaste a la cima. Soy Isolda, archimaga de la torre y la última líder de gimnasio de Algoria.' },
    { speaker: 'ISOLDA', text: 'Elda, Tobías, Casiopea, Baltasar, Orfea, Selene, Gaspar, Úrsula y Melquíades me hablaron de ti.' },
    { speaker: 'ISOLDA', text: 'Mi sala de gemas junta dos ideas: buscar el mejor camino, como Orfea y Baltasar, y contar caminos, como Tobías y Casiopea.' },
    { speaker: 'ISOLDA', text: 'Tendrás que hacer las dos cosas a la vez, en un millón de baldosas. Nada de probar caminos uno por uno.' },
    { speaker: 'ISOLDA', text: '¿Un último repaso o subimos directo al duelo?' },
  ],
  lesson: {
    concept: 'REPASO: EL MEJOR Y CUÁNTAS FORMAS',
    goals: ['Guardar dos datos por estado: el mejor valor y cuántas formas lo logran', 'Combinar bien los empates', 'Marcar los estados inalcanzables'],
    explanation:
      'A veces no basta con el mejor valor: también piden cuántas formas lo alcanzan. Entonces cada estado guarda un par (mejor, formas). ' +
      'Al llegar desde dos estados anteriores: si uno tiene mejor valor, copias su par; si empatan, el valor es el mismo y las formas se suman. ' +
      'Después sumas lo que aporta la casilla actual. ' +
      'Un estado inalcanzable se marca con un valor especial (como -1) para que nunca gane una comparación.',
    code: {
      python: code`
        n = int(input())
        g = [0] + list(map(int, input().split()))
        mejor = [0] * (n + 1)
        formas = [0] * (n + 1)
        formas[0] = 1
        for i in range(1, n + 1):
            mejor[i], formas[i] = mejor[i - 1], formas[i - 1]
            if i >= 2:
                if mejor[i - 2] > mejor[i]:
                    mejor[i], formas[i] = mejor[i - 2], formas[i - 2]
                elif mejor[i - 2] == mejor[i]:
                    formas[i] += formas[i - 2]
            mejor[i] += g[i]
        print(mejor[n], formas[n])
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            int n;
            cin >> n;
            vector<long long> g(n + 1, 0), mejor(n + 1, 0), formas(n + 1, 0);
            for (int i = 1; i <= n; i++) cin >> g[i];
            formas[0] = 1;
            for (int i = 1; i <= n; i++) {
                mejor[i] = mejor[i - 1];
                formas[i] = formas[i - 1];
                if (i >= 2) {
                    if (mejor[i - 2] > mejor[i]) {
                        mejor[i] = mejor[i - 2];
                        formas[i] = formas[i - 2];
                    } else if (mejor[i - 2] == mejor[i]) {
                        formas[i] += formas[i - 2];
                    }
                }
                mejor[i] += g[i];
            }
            cout << mejor[n] << " " << formas[n] << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                long[] g = new long[n + 1];
                long[] mejor = new long[n + 1];
                long[] formas = new long[n + 1];
                for (int i = 1; i <= n; i++) g[i] = sc.nextLong();
                formas[0] = 1;
                for (int i = 1; i <= n; i++) {
                    mejor[i] = mejor[i - 1];
                    formas[i] = formas[i - 1];
                    if (i >= 2) {
                        if (mejor[i - 2] > mejor[i]) {
                            mejor[i] = mejor[i - 2];
                            formas[i] = formas[i - 2];
                        } else if (mejor[i - 2] == mejor[i]) {
                            formas[i] += formas[i - 2];
                        }
                    }
                    mejor[i] += g[i];
                }
                System.out.println(mejor[n] + " " + formas[n]);
            }
        }
      `,
    },
    examples: [
      { input: '3\n1 1 1', output: '3 1' },
      { input: '4\n0 0 0 0', output: '0 5' },
      { input: '2\n0 5', output: '5 2' },
    ],
    tips: {
      python: 'Guarda dos listas paralelas, mejor y formas. Lee la sala con sys.stdin.buffer: cada fila es bytes y fila[j] - 48 es el dígito.',
      cpp: 'Dos vectores de una fila bastan, uno para el mejor y otro para las formas. Suma las formas con % MOD solo en los empates.',
      java: 'Dos long[] de una fila bastan. Lee cada fila con br.readLine() y usa charAt(j) - \'0\' para el dígito.',
    },
    quiz: {
      question: '¿Qué imprime este programa? (mejor suma y cuántos caminos la logran)',
      code: {
        python: code`
          sala = ["12", "21"]
          mejor = [[0] * 2 for _ in range(2)]
          formas = [[0] * 2 for _ in range(2)]
          for i in range(2):
              for j in range(2):
                  v = int(sala[i][j])
                  if i == 0 and j == 0:
                      mejor[i][j], formas[i][j] = v, 1
                  elif i == 0:
                      mejor[i][j], formas[i][j] = mejor[i][j - 1] + v, formas[i][j - 1]
                  elif j == 0:
                      mejor[i][j], formas[i][j] = mejor[i - 1][j] + v, formas[i - 1][j]
                  else:
                      a, b = mejor[i - 1][j], mejor[i][j - 1]
                      if a > b:
                          mejor[i][j], formas[i][j] = a + v, formas[i - 1][j]
                      elif b > a:
                          mejor[i][j], formas[i][j] = b + v, formas[i][j - 1]
                      else:
                          mejor[i][j], formas[i][j] = a + v, formas[i - 1][j] + formas[i][j - 1]
          print(mejor[1][1], formas[1][1])
        `,
        cpp: code`
          #include <iostream>
          #include <string>
          using namespace std;

          int main() {
              string sala[2] = {"12", "21"};
              int mejor[2][2], formas[2][2];
              for (int i = 0; i < 2; i++) {
                  for (int j = 0; j < 2; j++) {
                      int v = sala[i][j] - '0';
                      if (i == 0 && j == 0) { mejor[i][j] = v; formas[i][j] = 1; }
                      else if (i == 0) { mejor[i][j] = mejor[i][j - 1] + v; formas[i][j] = formas[i][j - 1]; }
                      else if (j == 0) { mejor[i][j] = mejor[i - 1][j] + v; formas[i][j] = formas[i - 1][j]; }
                      else {
                          int a = mejor[i - 1][j], b = mejor[i][j - 1];
                          if (a > b) { mejor[i][j] = a + v; formas[i][j] = formas[i - 1][j]; }
                          else if (b > a) { mejor[i][j] = b + v; formas[i][j] = formas[i][j - 1]; }
                          else { mejor[i][j] = a + v; formas[i][j] = formas[i - 1][j] + formas[i][j - 1]; }
                      }
                  }
              }
              cout << mejor[1][1] << " " << formas[1][1] << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  String[] sala = {"12", "21"};
                  int[][] mejor = new int[2][2];
                  int[][] formas = new int[2][2];
                  for (int i = 0; i < 2; i++) {
                      for (int j = 0; j < 2; j++) {
                          int v = sala[i].charAt(j) - '0';
                          if (i == 0 && j == 0) { mejor[i][j] = v; formas[i][j] = 1; }
                          else if (i == 0) { mejor[i][j] = mejor[i][j - 1] + v; formas[i][j] = formas[i][j - 1]; }
                          else if (j == 0) { mejor[i][j] = mejor[i - 1][j] + v; formas[i][j] = formas[i - 1][j]; }
                          else {
                              int a = mejor[i - 1][j], b = mejor[i][j - 1];
                              if (a > b) { mejor[i][j] = a + v; formas[i][j] = formas[i - 1][j]; }
                              else if (b > a) { mejor[i][j] = b + v; formas[i][j] = formas[i][j - 1]; }
                              else { mejor[i][j] = a + v; formas[i][j] = formas[i - 1][j] + formas[i][j - 1]; }
                          }
                      }
                  }
                  System.out.println(mejor[1][1] + " " + formas[1][1]);
              }
          }
        `,
      },
      options: ['4 1', '4 2', '3 2'],
      answer: 1,
      explanation: 'Los dos caminos suman 1 + 2 + 1 = 4. Como empatan en el mejor valor, sus formas se suman: 2.',
      wrongHint: 'Escribe los dos caminos posibles (derecha-abajo y abajo-derecha) y suma sus gemas. ¿Qué pasa con las formas cuando empatan?',
    },
  },
  problem: {
    id: 'p60-ascenso-de-isolda',
    title: 'EL ASCENSO DE ISOLDA',
    statement:
      'La sala de Isolda es una cuadrícula de R filas y C columnas. Cada baldosa tiene un dígito (las gemas que guarda) o un "#" (un muro). ' +
      'Entras por la esquina de arriba a la izquierda y sales por la de abajo a la derecha, moviéndote solo a la derecha o hacia abajo y sin pisar muros. ' +
      'Recoges las gemas de cada baldosa que pisas, incluidas la primera y la última. ' +
      'Imprime el mayor número de gemas que se puede recoger y cuántos caminos distintos logran ese máximo, módulo 1 000 000 007. ' +
      'Si no hay ningún camino posible, imprime -1 y 0.',
    inputSpec: 'Línea 1: R y C. Luego R líneas de C caracteres cada una (dígitos del 0 al 9 o "#").',
    outputSpec: 'Dos líneas: el máximo de gemas (o -1) y la cantidad de caminos que lo logran módulo 1 000 000 007 (o 0).',
    constraints: '1 ≤ R, C ≤ 1000 · la entrada y la salida pueden ser muros.',
    difficulty: 'dificil',
    xp: 250,
    timeLimitMs: 2000,
    tests: tests([
      ascenso(['123', '4#6', '789']),
      ascenso(['11', '11']),
      ascenso(llena(30, 30, '5')),
      ascenso(sala(1000, 1000, 6060, '0123456789', 100)),
      ascenso(llena(1000, 1000, '0')),
      ascenso(['#1', '11']),
      ascenso(sala(1000, 1000, 6006, '01', 50)),
      ascenso(['7']),
      ascenso(sala(1000, 1000, 6600, '89', 0)),
      ascenso(muralla),
    ]),
    starter: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        r, c = int(data[0]), int(data[1])
        sala = data[2:2 + r]
        MOD = 1000000007
        mejor = [-1] * c   # -1 = inalcanzable
        formas = [0] * c
        for i in range(r):
            fila = sala[i]
            for j in range(c):
                # TODO: si fila[j] es "#" (35): mejor[j] = -1, formas[j] = 0.
                # Si no: elige entre arriba (mejor[j]) e izquierda (mejor[j - 1]); en empate suma las formas.
                # La esquina (0, 0) empieza con mejor 0 y formas 1. Luego suma el dígito: fila[j] - 48.
                pass
        if mejor[c - 1] < 0:
            print(-1)
            print(0)
        else:
            print(mejor[c - 1])
            print(formas[c - 1])
      `,
      cpp: code`
        #include <iostream>
        #include <string>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            const long long MOD = 1000000007;
            int r, c;
            cin >> r >> c;
            vector<long long> mejor(c, -1), formas(c, 0);  // -1 = inalcanzable
            for (int i = 0; i < r; i++) {
                string fila;
                cin >> fila;
                for (int j = 0; j < c; j++) {
                    // TODO: si fila[j] es '#': mejor[j] = -1, formas[j] = 0.
                    // Si no: elige entre arriba (mejor[j]) e izquierda (mejor[j - 1]); en empate suma las formas.
                    // La esquina (0, 0) empieza con mejor 0 y formas 1. Luego suma el dígito: fila[j] - '0'.
                }
            }
            if (mejor[c - 1] < 0) cout << -1 << "\n" << 0 << "\n";
            else cout << mejor[c - 1] << "\n" << formas[c - 1] << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.Arrays;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int r = Integer.parseInt(st.nextToken());
                int c = Integer.parseInt(st.nextToken());
                final long MOD = 1000000007L;
                long[] mejor = new long[c];
                long[] formas = new long[c];
                Arrays.fill(mejor, -1);  // -1 = inalcanzable
                for (int i = 0; i < r; i++) {
                    String fila = br.readLine().trim();
                    for (int j = 0; j < c; j++) {
                        // TODO: si fila.charAt(j) es '#': mejor[j] = -1, formas[j] = 0.
                        // Si no: elige entre arriba (mejor[j]) e izquierda (mejor[j - 1]); en empate suma las formas.
                        // La esquina (0, 0) empieza con mejor 0 y formas 1. Luego suma el dígito: charAt(j) - '0'.
                    }
                }
                if (mejor[c - 1] < 0) System.out.println("-1\n0");
                else System.out.println(mejor[c - 1] + "\n" + formas[c - 1]);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys

        data = sys.stdin.buffer.read().split()
        r, c = int(data[0]), int(data[1])
        sala = data[2:2 + r]
        MOD = 1000000007
        mejor = [-1] * c
        formas = [0] * c
        for i in range(r):
            fila = sala[i]
            lb = -1
            lw = 0
            for j in range(c):
                ch = fila[j]
                if ch == 35:
                    lb = -1
                    lw = 0
                else:
                    ub = mejor[j]
                    if i == 0 and j == 0:
                        b = 0
                        w = 1
                    elif ub > lb:
                        b = ub
                        w = formas[j]
                    elif lb > ub:
                        b = lb
                        w = lw
                    else:
                        b = lb
                        w = formas[j] + lw
                        if w >= MOD:
                            w -= MOD
                    if b >= 0:
                        b += ch - 48
                    lb = b
                    lw = w
                mejor[j] = lb
                formas[j] = lw
        if mejor[c - 1] < 0:
            print(-1)
            print(0)
        else:
            print(mejor[c - 1])
            print(formas[c - 1])
      `,
      cpp: code`
        #include <iostream>
        #include <string>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            const long long MOD = 1000000007;
            int r, c;
            cin >> r >> c;
            vector<long long> mejor(c, -1), formas(c, 0);
            for (int i = 0; i < r; i++) {
                string fila;
                cin >> fila;
                for (int j = 0; j < c; j++) {
                    if (fila[j] == '#') {
                        mejor[j] = -1;
                        formas[j] = 0;
                        continue;
                    }
                    long long b, w;
                    long long ub = mejor[j], uw = formas[j];
                    long long lb = j > 0 ? mejor[j - 1] : -1, lw = j > 0 ? formas[j - 1] : 0;
                    if (i == 0 && j == 0) { b = 0; w = 1; }
                    else if (ub > lb) { b = ub; w = uw; }
                    else if (lb > ub) { b = lb; w = lw; }
                    else { b = lb; w = (uw + lw) % MOD; }
                    if (b >= 0) b += fila[j] - '0';
                    mejor[j] = b;
                    formas[j] = w;
                }
            }
            if (mejor[c - 1] < 0) cout << -1 << "\n" << 0 << "\n";
            else cout << mejor[c - 1] << "\n" << formas[c - 1] << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.Arrays;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int r = Integer.parseInt(st.nextToken());
                int c = Integer.parseInt(st.nextToken());
                final long MOD = 1000000007L;
                long[] mejor = new long[c];
                long[] formas = new long[c];
                Arrays.fill(mejor, -1);
                for (int i = 0; i < r; i++) {
                    String fila = br.readLine().trim();
                    for (int j = 0; j < c; j++) {
                        char ch = fila.charAt(j);
                        if (ch == '#') {
                            mejor[j] = -1;
                            formas[j] = 0;
                            continue;
                        }
                        long b, w;
                        long ub = mejor[j], uw = formas[j];
                        long lb = j > 0 ? mejor[j - 1] : -1, lw = j > 0 ? formas[j - 1] : 0;
                        if (i == 0 && j == 0) { b = 0; w = 1; }
                        else if (ub > lb) { b = ub; w = uw; }
                        else if (lb > ub) { b = lb; w = lw; }
                        else { b = lb; w = (uw + lw) % MOD; }
                        if (b >= 0) b += ch - '0';
                        mejor[j] = b;
                        formas[j] = w;
                    }
                }
                if (mejor[c - 1] < 0) System.out.println("-1\n0");
                else System.out.println(mejor[c - 1] + "\n" + formas[c - 1]);
            }
        }
      `,
    },
    hints: [
      'Probar todos los caminos es imposible: en una sala de 30×30 ya hay más de 10¹⁶. Como con Casiopea, a cada baldosa solo se llega desde arriba o desde la izquierda.',
      'Guarda dos cosas por baldosa: el máximo de gemas para llegar a ella y cuántos caminos logran ese máximo. Gana el vecino con más gemas; si empatan, se suman sus caminos.',
      'Usa -1 para "inalcanzable" (muros incluidos). Esquina: (0, 1). Si arriba > izquierda copia el par de arriba; si izquierda > arriba, el de la izquierda; si empatan, suma las formas % MOD. Luego, si es alcanzable, suma el dígito.',
    ],
  },
  outro: [
    { speaker: 'ISOLDA', text: 'El mejor camino y cuántos lo logran, en un millón de baldosas y sin probar ni uno a ciegas. Dominas la torre.' },
    { speaker: 'ISOLDA', text: 'Toma la Insignia Torre, la última de Algoria. Recuerda: guarda lo que calculas y nunca lo calcules dos veces.' },
    { speaker: 'ISOLDA', text: 'Sobre esta sala está el Coliseo, donde se reúnen los mejores. Su puerta del norte ya está abierta para ti.' },
  ],
  rewardTip: {
    title: 'El mejor y cuántas formas',
    text: {
      python: 'Por estado guarda (mejor, formas). Gana el mejor; en empate se suman las formas. -1 marca lo inalcanzable.',
      cpp: 'Por estado guarda (mejor, formas). Gana el mejor; en empate, formas = (a + b) % MOD. -1 marca lo inalcanzable.',
      java: 'Por estado guarda (mejor, formas). Gana el mejor; en empate, formas = (a + b) % MOD. -1 marca lo inalcanzable.',
    },
  },
};
