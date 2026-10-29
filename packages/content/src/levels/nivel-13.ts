import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

const corteza = (s: string): [string, string] => {
  let vocales = 0;
  let consonantes = 0;
  for (const c of s) {
    if ('aeiou'.includes(c)) vocales++;
    else if (c >= 'a' && c <= 'z') consonantes++;
  }
  return [s, `${vocales}\n${consonantes}`];
};

const texto = (seed: number, largo: number) => {
  const r = rng(seed);
  const palabras: string[] = [];
  let total = 0;
  while (total < largo) {
    const len = r(1, 10);
    let p = '';
    for (let i = 0; i < len; i++) p += String.fromCharCode(97 + r(0, 25));
    palabras.push(p);
    total += len + 1;
  }
  return palabras.join(' ').slice(0, largo).trim();
};

export const nivel13: Level = {
  number: 13,
  id: 'n13-recorrer-strings',
  title: 'Recorrer strings',
  topic: 'Strings',
  npc: { id: 'lupe', name: 'LUPE', title: 'Lectora de cortezas', sprite: 'lupe', x: 14, y: 4 },
  greeting: 'Cada corteza es un texto. Y cada texto, una fila de letras.',
  intro: [
    { speaker: 'LUPE', text: 'Hola. Soy Lupe. Los árboles de este bosque llevan mensajes grabados en la corteza.' },
    { speaker: 'LUPE', text: 'Un texto, en el fondo, es como un arreglo: una fila de caracteres, cada uno en su posición.' },
    { speaker: 'LUPE', text: 'Así que se recorre igual que los nenúfares de Rana: letra por letra.' },
    { speaker: 'LUPE', text: '¿Leemos juntas la lección o prefieres el duelo ya?' },
  ],
  lesson: {
    concept: 'RECORRER UN STRING',
    goals: ['Leer una línea completa de texto', 'Recorrer un string carácter por carácter', 'Comparar caracteres con comillas simples'],
    explanation:
      'Un string es una fila de caracteres: s[0] es el primero y su largo te dice cuántos hay. ' +
      'Para recorrerlo usas un for, igual que con un arreglo, y comparas cada carácter con lo que buscas. ' +
      'Si el texto trae espacios, lee la línea completa: leer "una palabra" se detendría en el primer espacio.',
    code: {
      python: code`
        s = input()
        c = 0
        for letra in s:
            if letra == "a":
                c += 1
        print(c)
      `,
      cpp: code`
        #include <iostream>
        #include <string>
        using namespace std;

        int main() {
            string s;
            getline(cin, s);
            int c = 0;
            for (char letra : s) {
                if (letra == 'a') c++;
            }
            cout << c << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                String s = br.readLine();
                int c = 0;
                for (char letra : s.toCharArray()) {
                    if (letra == 'a') c++;
                }
                System.out.println(c);
            }
        }
      `,
    },
    examples: [
      { input: 'banana', output: '3' },
      { input: 'la casa azul', output: '4' },
      { input: 'kiwi', output: '0' },
    ],
    tips: {
      python: 'input() lee la línea entera, con espacios. Para saber si una letra es vocal: if letra in "aeiou".',
      cpp: 'cin >> s se detiene en el primer espacio; getline(cin, s) lee la línea entera. Los char van entre comillas simples: \'a\'.',
      java: 'br.readLine() lee la línea entera. Para saber si es vocal: "aeiou".indexOf(letra) >= 0.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          s = "programa"
          c = 0
          for letra in s:
              if letra == "r":
                  c += 1
          print(c)
        `,
        cpp: code`
          #include <iostream>
          #include <string>
          using namespace std;

          int main() {
              string s = "programa";
              int c = 0;
              for (char letra : s) {
                  if (letra == 'r') c++;
              }
              cout << c << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  String s = "programa";
                  int c = 0;
                  for (char letra : s.toCharArray()) {
                      if (letra == 'r') c++;
                  }
                  System.out.println(c);
              }
          }
        `,
      },
      options: ['1', '2', '3'],
      answer: 1,
      explanation: 'p-r-o-g-r-a-m-a: la r aparece en la segunda y en la quinta posición. Dos veces.',
      wrongHint: 'Escribe la palabra letra por letra y marca cada r que encuentres.',
    },
  },
  problem: {
    id: 'p13-cortezas-de-lupe',
    title: 'LAS CORTEZAS DE LUPE',
    statement:
      'Lupe copió el mensaje de una corteza: una línea con letras minúsculas y espacios. ' +
      'Para descifrarlo necesita saber cuántas vocales (a, e, i, o, u) y cuántas consonantes tiene. Los espacios no cuentan.',
    inputSpec: 'Una línea con el mensaje: letras de la a a la z (sin tildes ni ñ) y espacios.',
    outputSpec: 'Dos líneas: la cantidad de vocales y la cantidad de consonantes.',
    constraints: 'El mensaje tiene de 1 a 10⁵ caracteres y al menos una letra.',
    difficulty: 'facil',
    xp: 120,
    timeLimitMs: 1000,
    tests: tests([
      corteza('hola mundo'),
      corteza('el bosque iterador'),
      corteza('aeiou'),
      corteza('xyz'),
      corteza('a'),
      corteza('a b c d e f g h i j k l m n o p q r s t u v w x y z'),
      corteza('murcielago'),
      corteza(texto(1313, 100000)),
      corteza(texto(3131, 99999)),
    ]),
    starter: {
      python: code`
        s = input()
        vocales = 0
        consonantes = 0
        # TODO: recorre s; si es vocal suma a vocales, si es otra letra a consonantes
        print(vocales)
        print(consonantes)
      `,
      cpp: code`
        #include <iostream>
        #include <string>
        using namespace std;

        int main() {
            string s;
            getline(cin, s);
            int vocales = 0, consonantes = 0;
            // TODO: recorre s; si es vocal suma a vocales, si es otra letra a consonantes
            cout << vocales << "\n" << consonantes << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                String s = br.readLine();
                int vocales = 0, consonantes = 0;
                // TODO: recorre s; si es vocal suma a vocales, si es otra letra a consonantes
                System.out.println(vocales);
                System.out.println(consonantes);
            }
        }
      `,
    },
    solution: {
      python: code`
        s = input()
        vocales = 0
        consonantes = 0
        for c in s:
            if c in "aeiou":
                vocales += 1
            elif "a" <= c <= "z":
                consonantes += 1
        print(vocales)
        print(consonantes)
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
            getline(cin, s);
            int vocales = 0, consonantes = 0;
            for (char c : s) {
                if (esVocal(c)) vocales++;
                else if (c >= 'a' && c <= 'z') consonantes++;
            }
            cout << vocales << "\n" << consonantes << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;

        public class Main {
            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                String s = br.readLine();
                int vocales = 0, consonantes = 0;
                for (char c : s.toCharArray()) {
                    if ("aeiou".indexOf(c) >= 0) vocales++;
                    else if (c >= 'a' && c <= 'z') consonantes++;
                }
                System.out.println(vocales);
                System.out.println(consonantes);
            }
        }
      `,
    },
    hints: [
      'Recorre el mensaje carácter por carácter. Cada uno es vocal, consonante o espacio.',
      'Lee la línea completa (input(), getline o readLine): si lees solo una palabra perderás el resto del mensaje.',
      'Si el carácter está en "aeiou" suma a vocales; si no, y está entre \'a\' y \'z\', suma a consonantes. Los espacios se ignoran.',
    ],
  },
  outro: [
    { speaker: 'LUPE', text: 'Mensaje descifrado. Lees los textos como lees los arreglos: de uno en uno.' },
    { speaker: 'LUPE', text: 'Otto te espera junto al camino. Dice que su nombre se lee igual al derecho y al revés.' },
  ],
  rewardTip: {
    title: 'Letra por letra',
    text: {
      python: 'for c in s recorre las letras. c in "aeiou" pregunta si es vocal. len(s) es el largo.',
      cpp: 'getline(cin, s) para líneas con espacios. for (char c : s) recorre; s.size() es el largo.',
      java: 'br.readLine() lee la línea. s.charAt(i) da la letra i; s.length() es el largo.',
    },
  },
};
