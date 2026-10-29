import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const ronda = (k: number, a: number[]): [string, string] => {
  let s = 0n;
  for (let i = 0; i < k; i++) s += BigInt(a[i]!);
  let mejor = s;
  let dia = 1;
  for (let i = k; i < a.length; i++) {
    s += BigInt(a[i]!) - BigInt(a[i - k]!);
    if (s > mejor) {
      mejor = s;
      dia = i - k + 2;
    }
  }
  return [`${a.length} ${k}\n${a.join(' ')}`, `${mejor}\n${dia}`];
};

const N = 200000;
const noches = (seed: number, max: number) => {
  const r = rng(seed);
  return Array.from({ length: N }, () => r(0, max));
};
const aleatoria = noches(1818, 1000000000);
const pocas = noches(8181, 10);
// El máximo queda al final: las ventanas crecen poco a poco.
const creciente = Array.from({ length: N }, (_, i) => Math.floor(i / 2) * 10000);
const llenas = Array.from({ length: N }, () => 1000000000);

export const nivel18: Level = {
  number: 18,
  id: 'n18-ventana-deslizante',
  title: 'Ventana deslizante',
  topic: 'Eficiencia (Big-O)',
  npc: { id: 'dante', name: 'DANTE', title: 'Vigía nocturno', sprite: 'dante', x: 14, y: 8 },
  greeting: 'No es lo mismo contar bien que contar rápido. Yo quiero las dos cosas.',
  intro: [
    { speaker: 'DANTE', text: 'Buenas noches. Soy Dante y cada noche cuento las luciérnagas del bosque.' },
    { speaker: 'DANTE', text: 'Ya tengo doscientas mil noches anotadas. Quiero saber cuál fue la mejor racha de K noches seguidas.' },
    { speaker: 'DANTE', text: 'Probé sumando cada racha desde cero... y la computadora se quedó pensando para siempre.' },
    { speaker: 'DANTE', text: 'Hoy aprenderás algo nuevo: no basta con que el programa sea correcto, también tiene que ser rápido.' },
    { speaker: 'DANTE', text: '¿Te explico por qué o quieres intentarlo primero en el duelo?' },
  ],
  lesson: {
    concept: 'VENTANA DESLIZANTE · O(n)',
    goals: ['Estimar cuántas operaciones hace tu programa', 'Mover una ventana sumando el que entra y restando el que sale', 'Pasar de O(n·k) a O(n)'],
    explanation:
      'Una computadora hace unos 10⁸ pasos sencillos por segundo. Si para cada una de las n ventanas sumas sus k valores, haces n·k pasos: ' +
      'con n = 2·10⁵ y k = 10⁵ son 10¹⁰, ¡casi dos minutos! A eso se le llama O(n·k). ' +
      'La idea: dos ventanas vecinas comparten casi todo. Al avanzar una casilla, suma el valor que entra y resta el que sale. ' +
      'Así cada paso cuesta lo mismo sin importar k, y todo el recorrido es O(n).',
    code: {
      python: code`
        import sys
        input = sys.stdin.readline

        n, k = map(int, input().split())
        a = list(map(int, input().split()))
        s = sum(a[:k])
        sumas = [s]
        for i in range(k, n):
            s += a[i] - a[i - k]
            sumas.append(s)
        print(*sumas)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, k;
            cin >> n >> k;
            vector<long long> a(n);
            for (int i = 0; i < n; i++) cin >> a[i];
            long long s = 0;
            for (int i = 0; i < k; i++) s += a[i];
            cout << s;
            for (int i = k; i < n; i++) {
                s += a[i] - a[i - k];
                cout << " " << s;
            }
            cout << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int k = Integer.parseInt(st.nextToken());
                st = new StringTokenizer(br.readLine());
                long[] a = new long[n];
                for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());
                long s = 0;
                for (int i = 0; i < k; i++) s += a[i];
                StringBuilder sb = new StringBuilder();
                sb.append(s);
                for (int i = k; i < n; i++) {
                    s += a[i] - a[i - k];
                    sb.append(" ").append(s);
                }
                System.out.println(sb);
            }
        }
      `,
    },
    examples: [
      { input: '5 3\n1 2 3 4 5', output: '6 9 12' },
      { input: '4 1\n7 0 2 9', output: '7 0 2 9' },
      { input: '3 3\n4 4 4', output: '12' },
    ],
    tips: {
      python: 'Antes de programar, multiplica: ¿cuántas vueltas dará tu bucle con N = 2·10⁵? Python hace unos 10⁷ pasos por segundo.',
      cpp: 'Regla práctica: hasta unos 10⁸ pasos cabe en un segundo; 10¹⁰ nunca. Cuenta antes de escribir el doble for.',
      java: 'Regla práctica: hasta unos 10⁸ pasos cabe en un segundo; 10¹⁰ nunca. Cuenta antes de escribir el doble for.',
    },
    quiz: {
      question: '¿Cuántas veces se ejecuta ops += 1? (el programa lo imprime)',
      code: {
        python: code`
          n = 1000
          ops = 0
          for i in range(n):
              for j in range(n):
                  ops += 1
          print(ops)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              int n = 1000;
              long long ops = 0;
              for (int i = 0; i < n; i++) {
                  for (int j = 0; j < n; j++) {
                      ops += 1;
                  }
              }
              cout << ops << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  int n = 1000;
                  long ops = 0;
                  for (int i = 0; i < n; i++) {
                      for (int j = 0; j < n; j++) {
                          ops += 1;
                      }
                  }
                  System.out.println(ops);
              }
          }
        `,
      },
      options: ['2000', '1000000', '1000'],
      answer: 1,
      explanation: 'Mil vueltas afuera por mil adentro: 10⁶ operaciones. Eso es O(n²): si n crece 10 veces, el trabajo crece 100.',
      wrongHint: 'Igual que en el baile de Mila: el bucle de adentro se repite completo en cada vuelta del de afuera.',
    },
  },
  problem: {
    id: 'p18-ronda-de-dante',
    title: 'LA RONDA DE DANTE',
    statement:
      'Dante anotó durante N noches cuántas luciérnagas vio: a₁, a₂, ..., aₙ. ' +
      'Quiere encontrar la mejor racha de K noches seguidas: la que suma más luciérnagas. ' +
      'Imprime esa suma y la noche en la que empieza la racha. Si hay empate, la que empiece antes. ' +
      'Cuidado: con N y K grandes, sumar cada racha desde cero es demasiado lento.',
    inputSpec: 'Línea 1: N y K. Línea 2: N enteros a₁ ... aₙ separados por espacios.',
    outputSpec: 'Dos líneas: la suma máxima de K noches seguidas y la noche (desde 1) en la que empieza.',
    constraints: '1 ≤ K ≤ N ≤ 2·10⁵ · 0 ≤ aᵢ ≤ 10⁹ · La suma puede llegar a 2·10¹⁴.',
    difficulty: 'medio',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      ronda(3, [2, 1, 5, 1, 3, 2, 4]),
      ronda(4, [5, 5, 5, 5]),
      ronda(1, [3, 9, 2, 9]),
      ronda(2, [0, 0, 0]),
      ronda(100000, aleatoria),
      ronda(N / 2, pocas),
      ronda(N, aleatoria),
      ronda(77777, creciente),
      ronda(50000, llenas),
    ]),
    starter: {
      python: code`
        import sys
        input = sys.stdin.readline

        n, k = map(int, input().split())
        a = list(map(int, input().split()))
        s = sum(a[:k])
        mejor = s
        dia = 1
        # TODO: desliza la ventana: suma el que entra, resta el que sale y guarda la mejor
        print(mejor)
        print(dia)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, k;
            cin >> n >> k;
            vector<long long> a(n);
            for (int i = 0; i < n; i++) cin >> a[i];
            long long s = 0;
            for (int i = 0; i < k; i++) s += a[i];
            long long mejor = s;
            int dia = 1;
            // TODO: desliza la ventana: suma el que entra, resta el que sale y guarda la mejor
            cout << mejor << "\n" << dia << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int k = Integer.parseInt(st.nextToken());
                st = new StringTokenizer(br.readLine());
                long[] a = new long[n];
                for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());
                long s = 0;
                for (int i = 0; i < k; i++) s += a[i];
                long mejor = s;
                int dia = 1;
                // TODO: desliza la ventana: suma el que entra, resta el que sale y guarda la mejor
                System.out.println(mejor);
                System.out.println(dia);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        input = sys.stdin.readline

        n, k = map(int, input().split())
        a = list(map(int, input().split()))
        s = sum(a[:k])
        mejor = s
        dia = 1
        for i in range(k, n):
            s += a[i] - a[i - k]
            if s > mejor:
                mejor = s
                dia = i - k + 2
        print(mejor)
        print(dia)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n, k;
            cin >> n >> k;
            vector<long long> a(n);
            for (int i = 0; i < n; i++) cin >> a[i];
            long long s = 0;
            for (int i = 0; i < k; i++) s += a[i];
            long long mejor = s;
            int dia = 1;
            for (int i = k; i < n; i++) {
                s += a[i] - a[i - k];
                if (s > mejor) {
                    mejor = s;
                    dia = i - k + 2;
                }
            }
            cout << mejor << "\n" << dia << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.StringTokenizer;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                StringTokenizer st = new StringTokenizer(br.readLine());
                int n = Integer.parseInt(st.nextToken());
                int k = Integer.parseInt(st.nextToken());
                st = new StringTokenizer(br.readLine());
                long[] a = new long[n];
                for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());
                long s = 0;
                for (int i = 0; i < k; i++) s += a[i];
                long mejor = s;
                int dia = 1;
                for (int i = k; i < n; i++) {
                    s += a[i] - a[i - k];
                    if (s > mejor) {
                        mejor = s;
                        dia = i - k + 2;
                    }
                }
                System.out.println(mejor);
                System.out.println(dia);
            }
        }
      `,
    },
    hints: [
      'Cuenta antes de programar: sumar cada racha desde cero son unas N·K operaciones. Con N = 2·10⁵ y K = 10⁵ eso es 10¹⁰: demasiado.',
      'La racha que empieza en la noche 2 se parece mucho a la que empieza en la 1: solo cambia una noche que sale y una que entra.',
      'Suma las primeras K noches. Luego, para i de K a N - 1: s += a[i] - a[i - K]. Si s supera al mejor (estrictamente, por el empate), guarda s y la noche i - K + 2.',
    ],
  },
  outro: [
    { speaker: 'DANTE', text: 'Doscientas mil noches en un suspiro. Eso es pensar en eficiencia.' },
    { speaker: 'DANTE', text: 'Desde ahora, antes de escribir un bucle, pregúntate cuántas vueltas dará.' },
    { speaker: 'DANTE', text: 'Vera, la botánica, está más al sur. Clasifica letras como si fueran semillas.' },
  ],
  rewardTip: {
    title: 'Ventana deslizante',
    text: {
      python: 's = sum(a[:k]); luego s += a[i] - a[i - k]. O(n) en vez de O(n·k). Lee con sys.stdin.',
      cpp: 's += a[i] - a[i - k]: cada paso cuesta lo mismo. O(n) en vez de O(n·k). Usa long long.',
      java: 's += a[i] - a[i - k]: cada paso cuesta lo mismo. O(n) en vez de O(n·k). Usa long.',
    },
  },
};
