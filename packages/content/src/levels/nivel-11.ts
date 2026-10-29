import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const charca = (t: number[]): [string, string] => {
  let suma = 0n;
  let mayor = t[0]!;
  let menor = t[0]!;
  for (const x of t) {
    suma += BigInt(x);
    if (x > mayor) mayor = x;
    if (x < menor) menor = x;
  }
  return [`${t.length}\n${t.join(' ')}`, `${suma}\n${mayor}\n${menor}`];
};

const aleatoria = (() => {
  const r = rng(1111);
  return Array.from({ length: 200000 }, () => r(-1000000000, 1000000000));
})();
const calurosa = Array.from({ length: 200000 }, () => 1000000000);
const helada = Array.from({ length: 200000 }, () => -1000000000);
const negativos = (() => {
  const r = rng(4242);
  return Array.from({ length: 1000 }, () => r(-1000, -1));
})();

export const nivel11: Level = {
  number: 11,
  id: 'n11-recorrer-arreglos',
  title: 'Recorrer arreglos',
  topic: 'Recorrer arreglos',
  npc: { id: 'rana', name: 'RANA', title: 'Saltadora de nenúfares', sprite: 'rana', x: 5, y: 2 },
  greeting: 'Salto de nenúfar en nenúfar, y no me salto ninguno.',
  intro: [
    { speaker: 'RANA', text: '¡Croac! Bienvenido al Bosque Iterador. Soy Rana y vivo en la charca del norte.' },
    { speaker: 'RANA', text: 'Cada mañana anoto la temperatura del agua. Ya tengo miles de números en fila.' },
    { speaker: 'RANA', text: 'Para entenderlos hay que recorrerlos de uno en uno, guardando lo importante por el camino.' },
    { speaker: 'RANA', text: '¿Saltamos juntos por la lección o vamos directo al duelo?' },
  ],
  lesson: {
    concept: 'RECORRER UN ARREGLO',
    goals: ['Recorrer un arreglo de principio a fin', 'Acumular una suma', 'Guardar el mayor y el menor visto'],
    explanation:
      'Recorrer es visitar cada elemento una vez, en orden. Mientras avanzas, llevas variables que resumen lo que has visto: ' +
      'una suma que crece, o el mayor valor hasta ahora. ' +
      'Truco clave: el mayor y el menor empiezan con el primer elemento, no con 0; así funcionan aunque todo sea negativo.',
    code: {
      python: code`
        import sys
        input = sys.stdin.readline

        n = int(input())
        a = list(map(int, input().split()))
        mayor = a[0]
        for x in a:
            if x > mayor:
                mayor = x
        print(mayor)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n;
            cin >> n;
            vector<long long> a(n);
            for (int i = 0; i < n; i++) cin >> a[i];
            long long mayor = a[0];
            for (int i = 0; i < n; i++) {
                if (a[i] > mayor) mayor = a[i];
            }
            cout << mayor << "\n";
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
                int n = Integer.parseInt(br.readLine().trim());
                StringTokenizer st = new StringTokenizer(br.readLine());
                long[] a = new long[n];
                for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());
                long mayor = a[0];
                for (int i = 0; i < n; i++) {
                    if (a[i] > mayor) mayor = a[i];
                }
                System.out.println(mayor);
            }
        }
      `,
    },
    examples: [
      { input: '5\n3 9 2 9 4', output: '9' },
      { input: '3\n-5 -2 -8', output: '-2' },
      { input: '1\n7', output: '7' },
    ],
    tips: {
      python: 'Con muchos datos, import sys e input = sys.stdin.readline hacen que leer sea mucho más rápido.',
      cpp: 'Con muchos datos, pon ios::sync_with_stdio(false); cin.tie(nullptr); al inicio de main. Las sumas grandes van en long long.',
      java: 'Scanner es lento con miles de números: usa BufferedReader + StringTokenizer. Las sumas grandes van en long.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          a = [4, 3, 6, 5]
          menor = 0
          for x in a:
              if x < menor:
                  menor = x
          print(menor)
        `,
        cpp: code`
          #include <iostream>
          #include <vector>
          using namespace std;

          int main() {
              vector<int> a = {4, 3, 6, 5};
              int menor = 0;
              for (int x : a) {
                  if (x < menor) menor = x;
              }
              cout << menor << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  int[] a = {4, 3, 6, 5};
                  int menor = 0;
                  for (int x : a) {
                      if (x < menor) menor = x;
                  }
                  System.out.println(menor);
              }
          }
        `,
      },
      options: ['3', '0', '4'],
      answer: 1,
      explanation: 'menor empezó en 0 y ningún número es menor que 0, así que nunca cambió. Por eso conviene empezar con a[0].',
      wrongHint: 'Fíjate en el valor inicial de menor. ¿Alguno de los números logra ser más pequeño que él?',
    },
  },
  problem: {
    id: 'p11-charca-de-rana',
    title: 'LA CHARCA DE RANA',
    statement:
      'Rana anotó la temperatura de la charca durante N mañanas: t₁, t₂, ..., tₙ. ' +
      'Quiere saber tres cosas: la suma de todas las temperaturas, la más alta y la más baja.',
    inputSpec: 'Línea 1: N. Línea 2: N enteros t₁ ... tₙ separados por espacios.',
    outputSpec: 'Tres líneas: la suma, la temperatura máxima y la temperatura mínima.',
    constraints: '1 ≤ N ≤ 2·10⁵ · -10⁹ ≤ tᵢ ≤ 10⁹ · La suma puede llegar a 2·10¹⁴.',
    difficulty: 'facil',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      charca([3, -1, 4, 1, 5]),
      charca([-7]),
      charca([2, 2, 2, 2]),
      charca([0, -3, 8, -3, 8]),
      charca(negativos),
      charca(calurosa),
      charca(helada),
      charca(aleatoria),
    ]),
    starter: {
      python: code`
        import sys
        input = sys.stdin.readline

        n = int(input())
        t = list(map(int, input().split()))
        suma = 0
        mayor = t[0]
        menor = t[0]
        # TODO: recorre t y actualiza suma, mayor y menor
        print(suma)
        print(mayor)
        print(menor)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n;
            cin >> n;
            vector<long long> t(n);
            for (int i = 0; i < n; i++) cin >> t[i];
            long long suma = 0, mayor = t[0], menor = t[0];
            // TODO: recorre t y actualiza suma, mayor y menor
            cout << suma << "\n" << mayor << "\n" << menor << "\n";
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
                int n = Integer.parseInt(br.readLine().trim());
                StringTokenizer st = new StringTokenizer(br.readLine());
                long[] t = new long[n];
                for (int i = 0; i < n; i++) t[i] = Long.parseLong(st.nextToken());
                long suma = 0, mayor = t[0], menor = t[0];
                // TODO: recorre t y actualiza suma, mayor y menor
                System.out.println(suma);
                System.out.println(mayor);
                System.out.println(menor);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        input = sys.stdin.readline

        n = int(input())
        t = list(map(int, input().split()))
        suma = 0
        mayor = t[0]
        menor = t[0]
        for x in t:
            suma += x
            if x > mayor:
                mayor = x
            if x < menor:
                menor = x
        print(suma)
        print(mayor)
        print(menor)
      `,
      cpp: code`
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int n;
            cin >> n;
            vector<long long> t(n);
            for (int i = 0; i < n; i++) cin >> t[i];
            long long suma = 0, mayor = t[0], menor = t[0];
            for (int i = 0; i < n; i++) {
                suma += t[i];
                if (t[i] > mayor) mayor = t[i];
                if (t[i] < menor) menor = t[i];
            }
            cout << suma << "\n" << mayor << "\n" << menor << "\n";
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
                int n = Integer.parseInt(br.readLine().trim());
                StringTokenizer st = new StringTokenizer(br.readLine());
                long[] t = new long[n];
                for (int i = 0; i < n; i++) t[i] = Long.parseLong(st.nextToken());
                long suma = 0, mayor = t[0], menor = t[0];
                for (int i = 0; i < n; i++) {
                    suma += t[i];
                    if (t[i] > mayor) mayor = t[i];
                    if (t[i] < menor) menor = t[i];
                }
                System.out.println(suma);
                System.out.println(mayor);
                System.out.println(menor);
            }
        }
      `,
    },
    hints: [
      'Basta con un solo recorrido: en cada paso actualizas las tres respuestas a la vez.',
      'mayor y menor empiezan con el primer elemento. Si empezaran en 0, fallarías cuando todo es negativo (o todo positivo).',
      'Por cada x: suma += x; si x > mayor, mayor = x; si x < menor, menor = x. La suma necesita long long / long.',
    ],
  },
  outro: [
    { speaker: 'RANA', text: '¡Croac, croac! Ni un nenúfar sin visitar. Así se recorre un arreglo.' },
    { speaker: 'RANA', text: 'Sigue el camino hacia el este: Kai vigila los árboles y lo cuenta todo.' },
  ],
  rewardTip: {
    title: 'Mayor y menor',
    text: {
      python: 'Empieza con mayor = a[0] y menor = a[0]. También existen max(a), min(a) y sum(a).',
      cpp: 'Empieza con mayor = a[0] y acumula en long long. Lectura rápida: ios::sync_with_stdio(false); cin.tie(nullptr); o bien scanf("%lld", &x) y printf("%lld\\n", s) de <cstdio>. Elige uno: no mezcles scanf/printf con cin/cout si desactivaste la sincronización.',
      java: 'Empieza con mayor = a[0]. Acumula en long y lee con BufferedReader + StringTokenizer.',
    },
  },
};
