import type { Level } from '@algoria/shared';
import { code, tests } from './_util';

const ficha = (nombre: string, edad: number): [string, string] => [`${nombre}\n${edad}`, `Nombre: ${nombre}\nEdad: ${edad}`];

export const nivel02: Level = {
  number: 2,
  id: 'n02-variables',
  title: 'Variables y tipos',
  topic: 'Variables',
  npc: { id: 'sofi', name: 'SOFI', title: 'Guardiana de las cajitas', sprite: 'sofi', x: 11, y: 2 },
  greeting: 'Todo lo que guardo tiene nombre y etiqueta.',
  intro: [
    { speaker: 'SOFI', text: '¡Hola! Soy Sofi. En mi casa cada cosa vive en una cajita con su nombre.' },
    { speaker: 'SOFI', text: 'Los programas hacen lo mismo: guardan datos en variables.' },
    { speaker: 'SOFI', text: 'Una variable tiene un nombre, un valor y un tipo: texto, número entero o decimal.' },
    { speaker: 'SOFI', text: '¿Te enseño a usarlas o vamos directo a llenar mi ficha en un duelo?' },
  ],
  lesson: {
    concept: 'VARIABLES Y TIPOS',
    goals: ['Guardar un valor con un nombre', 'Distinguir texto, entero y decimal', 'Imprimir el valor de una variable'],
    explanation:
      'Una variable es una cajita con nombre donde guardas un valor para usarlo después. ' +
      'Cada valor tiene un tipo: texto (string), número entero (int) o número decimal (double). ' +
      'Si imprimes la variable, se muestra lo que guarda, no su nombre.',
    code: {
      python: code`
        nombre = "Sofi"
        edad = 12
        altura = 1.45
        print(nombre)
        print(edad)
        print(altura)
      `,
      cpp: code`
        #include <iostream>
        #include <string>
        using namespace std;

        int main() {
            string nombre = "Sofi";
            int edad = 12;
            double altura = 1.45;
            cout << nombre << "\n";
            cout << edad << "\n";
            cout << altura << "\n";
            return 0;
        }
      `,
      java: code`
        public class Main {
            public static void main(String[] args) {
                String nombre = "Sofi";
                int edad = 12;
                double altura = 1.45;
                System.out.println(nombre);
                System.out.println(edad);
                System.out.println(altura);
            }
        }
      `,
    },
    examples: [{ input: '', output: 'Sofi\n12\n1.45' }],
    tips: {
      python: 'En Python no escribes el tipo: la variable lo toma del valor que le das.',
      cpp: 'En C++ declaras el tipo antes del nombre: int, double, string. string necesita #include <string>.',
      java: 'En Java String va con S mayúscula; int y double van en minúscula.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          x = 5
          x = 8
          print(x)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              int x = 5;
              x = 8;
              cout << x << "\n";
              return 0;
          }
        `,
        java: code`
          public class Main {
              public static void main(String[] args) {
                  int x = 5;
                  x = 8;
                  System.out.println(x);
              }
          }
        `,
      },
      options: ['5', '8', '13'],
      answer: 1,
      explanation: 'Al asignar de nuevo, la cajita cambia su contenido: el 5 se reemplaza por el 8.',
      wrongHint: 'Una variable guarda un solo valor a la vez. ¿Qué pasa con el valor viejo al asignar otro?',
    },
  },
  problem: {
    id: 'p02-ficha-de-sofi',
    title: 'LA FICHA DE SOFI',
    statement:
      'Sofi está haciendo fichas para cada visitante del pueblo. ' +
      'El programa ya lee el nombre y la edad y los guarda en dos variables. ' +
      'Tú solo debes imprimir la ficha con el formato exacto.',
    inputSpec: 'Línea 1: un nombre (una palabra). Línea 2: un entero, la edad.',
    outputSpec: 'Dos líneas: "Nombre: " seguido del nombre, y "Edad: " seguido de la edad.',
    constraints: 'El nombre tiene de 1 a 20 letras sin espacios · 0 ≤ edad ≤ 120',
    difficulty: 'facil',
    xp: 100,
    timeLimitMs: 1000,
    tests: tests([
      ficha('Ana', 15),
      ficha('Leo', 9),
      ficha('Bo', 0),
      ficha('Maximiliano', 120),
      ficha('Zoe', 1),
      ficha('Iris', 33),
      ficha('Algoritmo', 77),
    ]),
    starter: {
      python: code`
        nombre = input()
        edad = int(input())
        # TODO: imprime "Nombre: ..." y luego "Edad: ..."
      `,
      cpp: code`
        #include <iostream>
        #include <string>
        using namespace std;

        int main() {
            string nombre;
            int edad;
            cin >> nombre >> edad;
            // TODO: imprime "Nombre: ..." y luego "Edad: ..."
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                String nombre = sc.next();
                int edad = sc.nextInt();
                // TODO: imprime "Nombre: ..." y luego "Edad: ..."
            }
        }
      `,
    },
    solution: {
      python: code`
        nombre = input()
        edad = int(input())
        print("Nombre: " + nombre)
        print("Edad: " + str(edad))
      `,
      cpp: code`
        #include <iostream>
        #include <string>
        using namespace std;

        int main() {
            string nombre;
            int edad;
            cin >> nombre >> edad;
            cout << "Nombre: " << nombre << "\n";
            cout << "Edad: " << edad << "\n";
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                String nombre = sc.next();
                int edad = sc.nextInt();
                System.out.println("Nombre: " + nombre);
                System.out.println("Edad: " + edad);
            }
        }
      `,
    },
    hints: [
      'Las variables nombre y edad ya tienen los datos. Solo falta imprimirlos.',
      'Imprime primero el texto fijo "Nombre: " y justo después el valor de la variable.',
      'Ojo con el espacio después de los dos puntos: "Nombre: Ana", no "Nombre:Ana".',
    ],
  },
  outro: [
    { speaker: 'SOFI', text: '¡Ficha impecable! Cada dato en su cajita y con su etiqueta.' },
    { speaker: 'SOFI', text: 'Ahora busca a Iris: ella sabe escuchar todo lo que llega por la entrada.' },
  ],
  rewardTip: {
    title: 'Variables con tipo',
    text: {
      python: 'nombre = "Ana", edad = 15, altura = 1.6. Para unir texto y número usa str(edad).',
      cpp: 'string nombre = "Ana"; int edad = 15; double altura = 1.6;',
      java: 'String nombre = "Ana"; int edad = 15; double altura = 1.6; Con + unes texto y números.',
    },
  },
};
