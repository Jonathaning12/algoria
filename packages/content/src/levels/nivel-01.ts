import type { Level } from '@algoria/shared';
import { code, tests } from './_util';

const EXPECTED = 'Hola, mundo!\nBienvenido a Algoria';

export const nivel01: Level = {
  number: 1,
  id: 'n01-hola-mundo',
  title: 'Hola, mundo',
  topic: 'Imprimir',
  npc: { id: 'leo', name: 'LEO', title: 'Guardián del primer saludo', sprite: 'leo', x: 6, y: 2 },
  greeting: '¡Eh, tú! Todo programa empieza con un saludo.',
  intro: [
    { speaker: 'LEO', text: '¡Hola, viajero! Soy Leo y cuido la entrada del Pueblo Semilla.' },
    { speaker: 'LEO', text: 'Aquí todos aprendemos lo mismo primero: hacer que la computadora hable.' },
    { speaker: 'LEO', text: 'Para eso basta una instrucción que imprime texto en la pantalla.' },
    { speaker: 'LEO', text: '¿Te lo muestro en un minuto, o ya quieres saludar al pueblo en un duelo?' },
  ],
  lesson: {
    concept: 'IMPRIMIR TEXTO',
    goals: ['Escribir tu primer programa', 'Imprimir una línea de texto', 'Imprimir varias líneas en orden'],
    explanation:
      'Un programa es una lista de instrucciones que se ejecutan de arriba hacia abajo. ' +
      'La instrucción de imprimir muestra un texto y salta a la línea siguiente. ' +
      'El texto va entre comillas dobles y se imprime tal cual, letra por letra.',
    code: {
      python: code`
        print("Hola, mundo!")
        print("Soy Leo")
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        int main() {
            cout << "Hola, mundo!" << "\n";
            cout << "Soy Leo" << "\n";
            return 0;
        }
      `,
      java: code`
        public class Main {
            public static void main(String[] args) {
                System.out.println("Hola, mundo!");
                System.out.println("Soy Leo");
            }
        }
      `,
    },
    examples: [{ input: '', output: 'Hola, mundo!\nSoy Leo' }],
    tips: {
      python: 'print() ya añade el salto de línea al final. No necesitas escribirlo tú.',
      cpp: 'Cada instrucción termina en punto y coma. "\\n" es el salto de línea.',
      java: 'println imprime y salta de línea; print imprime sin saltar.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          print("A")
          print("B")
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              cout << "A" << "\n";
              cout << "B" << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  System.out.println("A");
                  System.out.println("B");
              }
          }
        `,
      },
      options: ['A\nB', 'B\nA', 'AB'],
      answer: 0,
      explanation: 'Las instrucciones se ejecutan en orden y cada una salta de línea: primero A, luego B.',
      wrongHint: 'Fíjate en el orden de las líneas y en si cada impresión salta de línea o no.',
    },
  },
  problem: {
    id: 'p01-hola-mundo',
    title: 'EL CARTEL DE LEO',
    statement:
      'Leo quiere colgar un cartel de bienvenida en la entrada del pueblo. ' +
      'Escribe un programa que imprima exactamente estas dos líneas: Hola, mundo! y Bienvenido a Algoria.',
    inputSpec: 'No hay entrada.',
    outputSpec: 'Dos líneas: "Hola, mundo!" y luego "Bienvenido a Algoria".',
    constraints: 'Respeta mayúsculas, comas y signos tal cual.',
    difficulty: 'facil',
    xp: 100,
    timeLimitMs: 1000,
    tests: tests([
      ['', EXPECTED],
      ['', EXPECTED],
      ['', EXPECTED],
      ['', EXPECTED],
      ['', EXPECTED],
      ['', EXPECTED],
    ]),
    starter: {
      python: code`
        # TODO: imprime "Hola, mundo!" y luego "Bienvenido a Algoria"
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        int main() {
            // TODO: imprime "Hola, mundo!" y luego "Bienvenido a Algoria"
            return 0;
        }
      `,
      java: code`
        public class Main {
            public static void main(String[] args) {
                // TODO: imprime "Hola, mundo!" y luego "Bienvenido a Algoria"
            }
        }
      `,
    },
    solution: {
      python: code`
        print("Hola, mundo!")
        print("Bienvenido a Algoria")
      `,
      cpp: code`
        #include <iostream>
        using namespace std;

        int main() {
            cout << "Hola, mundo!" << "\n";
            cout << "Bienvenido a Algoria" << "\n";
            return 0;
        }
      `,
      java: code`
        public class Main {
            public static void main(String[] args) {
                System.out.println("Hola, mundo!");
                System.out.println("Bienvenido a Algoria");
            }
        }
      `,
    },
    hints: [
      'Necesitas dos instrucciones de imprimir, una por cada línea.',
      'Copia el texto exacto entre comillas dobles, con la coma y el signo de exclamación.',
      'Primero imprime "Hola, mundo!" y en la línea siguiente "Bienvenido a Algoria".',
    ],
  },
  outro: [
    { speaker: 'LEO', text: '¡Ese cartel quedó perfecto! Ya hablas el idioma de las máquinas.' },
    { speaker: 'LEO', text: 'Sigue el camino: Sofi te enseñará a guardar cosas en cajitas llamadas variables.' },
  ],
  rewardTip: {
    title: 'Imprimir una línea',
    text: {
      python: 'print("texto") imprime y salta de línea.',
      cpp: 'cout << "texto" << "\\n"; imprime y salta de línea. Necesita #include <iostream>.',
      java: 'System.out.println("texto"); imprime y salta de línea.',
    },
  },
};
