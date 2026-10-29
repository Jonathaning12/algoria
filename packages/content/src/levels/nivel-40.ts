import type { Level } from '@algoria/shared';
import { code, rng, tests } from './_util';

/** Montículo genérico (solo para calcular respuestas). */
class Heap<T> {
  private h: T[] = [];
  constructor(private less: (a: T, b: T) => boolean) {}
  get size() {
    return this.h.length;
  }
  peek(): T {
    return this.h[0]!;
  }
  push(x: T) {
    const h = this.h;
    h.push(x);
    let i = h.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.less(h[i]!, h[p]!)) break;
      [h[p], h[i]] = [h[i]!, h[p]!];
      i = p;
    }
  }
  pop(): T {
    const h = this.h;
    const top = h[0]!;
    const last = h.pop()!;
    if (h.length > 0) {
      h[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, rr = l + 1;
        let m = i;
        if (l < h.length && this.less(h[l]!, h[m]!)) m = l;
        if (rr < h.length && this.less(h[rr]!, h[m]!)) m = rr;
        if (m === i) break;
        [h[m], h[i]] = [h[i]!, h[m]!];
        i = m;
      }
    }
    return top;
  }
}

type Op = ['OFERTA', string, number] | ['RETIRA', string] | ['COMPRA'];

const mercado = (ops: Op[]): [string, string] => {
  const precio = new Map<string, number>();
  const heap = new Heap<[number, string]>((a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]));
  const out: string[] = [];
  for (const op of ops) {
    if (op[0] === 'OFERTA') {
      precio.set(op[1], op[2]);
      heap.push([op[2], op[1]]);
    } else if (op[0] === 'RETIRA') {
      precio.delete(op[1]);
    } else {
      while (heap.size > 0 && precio.get(heap.peek()[1]) !== heap.peek()[0]) heap.pop();
      if (heap.size === 0) out.push('NADA');
      else {
        const [p, nombre] = heap.pop();
        precio.delete(nombre);
        out.push(`${nombre} ${p}`);
      }
    }
  }
  out.push(`QUEDAN ${precio.size}`);
  return [`${ops.length}\n${ops.map((o) => o.join(' ')).join('\n')}`, out.join('\n')];
};

const r = rng(4040);
const palabra = () => Array.from({ length: r(1, 8) }, () => String.fromCharCode(97 + r(0, 25))).join('');
const nombres = (n: number) => {
  const s = new Set<string>();
  while (s.size < n) s.add(palabra());
  return [...s];
};
const Q = 200000;
/** Q operaciones con exactamente `compras` COMPRA repartidas al azar. */
const dia = (pool: string[], compras: number, pRetira: number, pmax: number): Op[] => {
  const esCompra = new Set<number>();
  while (esCompra.size < compras) esCompra.add(r(0, Q - 1));
  return Array.from({ length: Q }, (_, i): Op => {
    if (esCompra.has(i)) return ['COMPRA'];
    const nombre = pool[r(0, pool.length - 1)]!;
    return r(0, 99) < pRetira ? ['RETIRA', nombre] : ['OFERTA', nombre, r(1, pmax)];
  });
};

const muchos = nombres(30000);
const aleatorio = dia(muchos, 2500, 20, 1000000000);
const baratos = dia(muchos, 2500, 5, 50); // muchos empates de precio: decide el nombre
const pocos = dia(nombres(12), 2500, 10, 1000000000); // los mismos nombres cambian de precio una y otra vez
const retiros = dia(nombres(500), 2000, 60, 1000); // casi todo se retira: muchas compras sin nada
// Primero llegan todas las ofertas y al final se compra.
const alFinal: Op[] = [
  ...Array.from({ length: Q - 2500 }, (_, i): Op => ['OFERTA', muchos[i % muchos.length]!, r(1, 1000000000)]),
  ...Array.from({ length: 2500 }, (): Op => ['COMPRA']),
];

export const nivel40: Level = {
  number: 40,
  id: 'n40-gimnasio-puerto',
  title: 'Gimnasio Puerto',
  topic: 'Repaso: estructuras de datos',
  gym: true,
  npc: { id: 'marea', name: 'CAPITANA MAREA', title: 'Líder del Gimnasio Puerto', sprite: 'gym_puerto', x: 4, y: 11 },
  greeting: 'En mi puerto cada dato tiene su lugar. Si lo guardas mal, la marea se lo lleva.',
  intro: [
    { speaker: 'MAREA', text: 'Bienvenido a bordo del Gimnasio Puerto. Soy la Capitana Marea y este puerto funciona gracias a mí.' },
    { speaker: 'MAREA', text: 'Brisa, Ramón, Nerea, Salvador, Coral, Cipriano, Anselmo, Dora y Faustino me hablaron de ti.' },
    { speaker: 'MAREA', text: 'Mi reto es el mercado del muelle: ofertas que llegan, cambian de precio y se retiran mientras la gente compra.' },
    { speaker: 'MAREA', text: 'Una sola estructura no basta. Tendrás que hacer trabajar juntas a dos.' },
    { speaker: 'MAREA', text: '¿Un último repaso o zarpamos directo al duelo?' },
  ],
  lesson: {
    concept: 'REPASO: HEAP + MAPA',
    goals: ['Combinar dos estructuras que se vigilan entre sí', 'Borrar de un heap sin buscar: el borrado perezoso', 'Elegir la estructura correcta en cada lenguaje'],
    explanation:
      'Un heap da el menor muy rápido, pero no sabe borrar un elemento del medio. ' +
      'Truco del borrado perezoso: anota en un diccionario lo que sigue vigente y, cuando el de arriba del heap ya no lo esté, sácalo y descártalo. ' +
      'En C++ y Java también puedes usar un conjunto ordenado (multiset, TreeMap), que sí borra cualquier elemento en O(log n).',
    code: {
      python: code`
        import heapq

        q = int(input())
        heap = []
        cuenta = {}  # cuántas copias vigentes hay de cada valor
        for _ in range(q):
            p = input().split()
            if p[0] == "+":
                x = int(p[1])
                heapq.heappush(heap, x)
                cuenta[x] = cuenta.get(x, 0) + 1
            elif p[0] == "-":
                cuenta[int(p[1])] -= 1  # se borra del heap más tarde
            else:
                while heap and cuenta[heap[0]] == 0:
                    heapq.heappop(heap)  # borrado perezoso
                print(heap[0] if heap else "VACIO")
      `,
      cpp: code`
        #include <iostream>
        #include <set>
        #include <string>
        using namespace std;

        int main() {
            int q;
            cin >> q;
            multiset<int> s;  // ordenado y admite repetidos
            for (int i = 0; i < q; i++) {
                string op;
                cin >> op;
                if (op == "+") {
                    int x;
                    cin >> x;
                    s.insert(x);
                } else if (op == "-") {
                    int x;
                    cin >> x;
                    s.erase(s.find(x));  // borra una sola copia
                } else {
                    if (s.empty()) cout << "VACIO\n";
                    else cout << *s.begin() << "\n";
                }
            }
            return 0;
        }
      `,
      java: code`
        import java.util.Scanner;
        import java.util.TreeMap;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int q = sc.nextInt();
                TreeMap<Integer, Integer> cuenta = new TreeMap<>();  // valor → copias, ordenado
                for (int i = 0; i < q; i++) {
                    String op = sc.next();
                    if (op.equals("+")) {
                        cuenta.merge(sc.nextInt(), 1, Integer::sum);
                    } else if (op.equals("-")) {
                        int x = sc.nextInt();
                        if (cuenta.get(x) == 1) cuenta.remove(x);
                        else cuenta.put(x, cuenta.get(x) - 1);
                    } else {
                        System.out.println(cuenta.isEmpty() ? "VACIO" : String.valueOf(cuenta.firstKey()));
                    }
                }
            }
        }
      `,
    },
    examples: [
      { input: '5\n+ 5\n+ 3\n?\n- 3\n?', output: '3\n5' },
      { input: '3\n?\n+ 1\n?', output: 'VACIO\n1' },
      { input: '6\n+ 2\n+ 2\n- 2\n?\n- 2\n?', output: '2\nVACIO' },
    ],
    tips: {
      python: 'Python no trae un conjunto ordenado: heapq + diccionario con borrado perezoso es la receta. Las tuplas (precio, nombre) desempatan solas.',
      cpp: 'set<pair<long long,string>> ordena por precio y luego por nombre, y erase borra cualquier par. Acompáñalo de un map nombre → precio.',
      java: 'Un TreeSet con comparador (precio, luego nombre) y un HashMap nombre → precio. Antes de cambiar un precio, quita la entrada vieja del TreeSet.',
    },
    quiz: {
      question: '¿Qué imprime este programa?',
      code: {
        python: code`
          import heapq

          precio = {"ana": 5, "luis": 3}
          heap = [(5, "ana"), (3, "luis")]
          heapq.heapify(heap)
          precio["luis"] = 8
          heapq.heappush(heap, (8, "luis"))
          while precio.get(heap[0][1]) != heap[0][0]:
              heapq.heappop(heap)
          p, nombre = heap[0]
          print(nombre, p)
        `,
        cpp: code`
          #include <iostream>
          #include <map>
          #include <set>
          #include <string>
          using namespace std;

          int main() {
              map<string, int> precio = {{"ana", 5}, {"luis", 3}};
              set<pair<int, string>> orden = {{5, "ana"}, {3, "luis"}};
              orden.erase({precio["luis"], "luis"});
              precio["luis"] = 8;
              orden.insert({8, "luis"});
              cout << orden.begin()->second << " " << orden.begin()->first << "\n";
              return 0;
          }
        `,
        java: code`
          import java.util.HashMap;
          import java.util.Map;
          import java.util.TreeMap;

          public class Main {
              public static void main(String[] args) {
                  HashMap<String, Integer> precio = new HashMap<>();
                  TreeMap<Integer, String> orden = new TreeMap<>();  // precio → nombre
                  precio.put("ana", 5);
                  orden.put(5, "ana");
                  precio.put("luis", 3);
                  orden.put(3, "luis");
                  orden.remove(precio.get("luis"));
                  precio.put("luis", 8);
                  orden.put(8, "luis");
                  Map.Entry<Integer, String> e = orden.firstEntry();
                  System.out.println(e.getValue() + " " + e.getKey());
              }
          }
        `,
      },
      options: ['luis 3', 'ana 5', 'luis 8'],
      answer: 1,
      explanation: 'La oferta de luis a 3 ya no vale: subió a 8. La más barata vigente es la de ana a 5.',
      wrongHint: 'El precio viejo de luis ya no cuenta. ¿Cuál es la oferta más barata que sigue vigente?',
    },
  },
  problem: {
    id: 'p40-mercado-del-muelle',
    title: 'EL MERCADO DEL MUELLE',
    statement:
      'En el mercado del muelle los vendedores publican ofertas y la gente compra siempre la más barata. Llegan Q operaciones: ' +
      'OFERTA nombre precio: ese vendedor ofrece a ese precio (si ya tenía una oferta, cambia su precio). ' +
      'RETIRA nombre: el vendedor retira su oferta (si no tenía, no pasa nada). ' +
      'COMPRA: alguien compra la oferta más barata; si hay empate de precio, la del vendedor con el nombre menor en orden alfabético. Imprime nombre y precio, y esa oferta desaparece. Si no hay ofertas, imprime NADA. ' +
      'Al terminar, imprime QUEDAN y la cantidad de ofertas que siguen publicadas.',
    inputSpec: 'Línea 1: Q. Luego Q líneas, cada una con una operación.',
    outputSpec: 'Una línea por cada COMPRA (nombre y precio, o NADA), en orden. Al final, la línea QUEDAN x.',
    constraints: '1 ≤ Q ≤ 2·10⁵ · los nombres tienen de 1 a 8 letras minúsculas · 1 ≤ precio ≤ 10⁹ · hay a lo sumo 2500 operaciones COMPRA.',
    difficulty: 'dificil',
    xp: 250,
    timeLimitMs: 2000,
    tests: tests([
      mercado([
        ['OFERTA', 'ana', 5], ['OFERTA', 'beto', 3], ['OFERTA', 'caro', 3], ['COMPRA'],
        ['OFERTA', 'ana', 2], ['COMPRA'], ['RETIRA', 'caro'], ['COMPRA'], ['OFERTA', 'dani', 7],
      ]),
      mercado([['COMPRA'], ['OFERTA', 'luz', 10], ['OFERTA', 'luz', 4], ['RETIRA', 'mar'], ['COMPRA']]),
      mercado([
        ['OFERTA', 'b', 7], ['OFERTA', 'a', 7], ['OFERTA', 'ab', 7], ['OFERTA', 'b', 1], ['OFERTA', 'b', 9],
        ['COMPRA'], ['OFERTA', 'a', 7], ['RETIRA', 'a'], ['OFERTA', 'a', 7], ['COMPRA'], ['COMPRA'], ['COMPRA'],
      ]),
      mercado([['OFERTA', 'x', 1], ['RETIRA', 'x'], ['RETIRA', 'x'], ['COMPRA'], ['OFERTA', 'x', 1], ['OFERTA', 'x', 1], ['COMPRA'], ['COMPRA']]),
      mercado(aleatorio),
      mercado(baratos),
      mercado(pocos),
      mercado(retiros),
      mercado(alFinal),
    ]),
    starter: {
      python: code`
        import sys
        import heapq
        input = sys.stdin.readline

        q = int(input())
        precio = {}  # nombre → precio vigente
        heap = []    # (precio, nombre); puede tener ofertas viejas
        out = []
        for _ in range(q):
            p = input().split()
            # TODO: OFERTA → actualiza precio y mete (precio, nombre) al heap;
            # RETIRA → quítalo del diccionario;
            # COMPRA → descarta del heap las ofertas que ya no valen y compra la primera
        out.append("QUEDAN " + str(len(precio)))
        print("\n".join(out))
      `,
      cpp: code`
        #include <iostream>
        #include <map>
        #include <set>
        #include <string>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int q;
            cin >> q;
            map<string, long long> precio;           // nombre → precio vigente
            set<pair<long long, string>> orden;      // (precio, nombre), la más barata primero
            for (int i = 0; i < q; i++) {
                string op;
                cin >> op;
                // TODO: OFERTA → si ya tenía oferta, borra su par viejo de orden; guarda el nuevo;
                // RETIRA → borra de ambos; COMPRA → la primera de orden (o NADA)
            }
            cout << "QUEDAN " << precio.size() << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.HashMap;
        import java.util.StringTokenizer;
        import java.util.TreeSet;

        public class Main {
            static class Oferta {
                long precio;
                String nombre;
                Oferta(long precio, String nombre) {
                    this.precio = precio;
                    this.nombre = nombre;
                }
            }

            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                int q = Integer.parseInt(br.readLine().trim());
                HashMap<String, Long> precio = new HashMap<>();  // nombre → precio vigente
                TreeSet<Oferta> orden = new TreeSet<>((a, b) -> a.precio != b.precio ? Long.compare(a.precio, b.precio) : a.nombre.compareTo(b.nombre));
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < q; i++) {
                    StringTokenizer st = new StringTokenizer(br.readLine());
                    String op = st.nextToken();
                    // TODO: OFERTA → si ya tenía oferta, quita la vieja de orden; guarda la nueva;
                    // RETIRA → borra de ambos; COMPRA → la primera de orden (o NADA)
                }
                sb.append("QUEDAN ").append(precio.size()).append("\n");
                System.out.print(sb);
            }
        }
      `,
    },
    solution: {
      python: code`
        import sys
        import heapq
        input = sys.stdin.readline

        q = int(input())
        precio = {}  # nombre → precio vigente
        heap = []    # (precio, nombre); puede tener ofertas viejas
        out = []
        for _ in range(q):
            p = input().split()
            if p[0] == "OFERTA":
                nombre, x = p[1], int(p[2])
                precio[nombre] = x
                heapq.heappush(heap, (x, nombre))
            elif p[0] == "RETIRA":
                precio.pop(p[1], None)
            else:
                while heap and precio.get(heap[0][1]) != heap[0][0]:
                    heapq.heappop(heap)
                if heap:
                    x, nombre = heapq.heappop(heap)
                    del precio[nombre]
                    out.append(nombre + " " + str(x))
                else:
                    out.append("NADA")
        out.append("QUEDAN " + str(len(precio)))
        print("\n".join(out))
      `,
      cpp: code`
        #include <iostream>
        #include <map>
        #include <set>
        #include <string>
        using namespace std;

        int main() {
            ios::sync_with_stdio(false);
            cin.tie(nullptr);
            int q;
            cin >> q;
            map<string, long long> precio;           // nombre → precio vigente
            set<pair<long long, string>> orden;      // (precio, nombre), la más barata primero
            for (int i = 0; i < q; i++) {
                string op;
                cin >> op;
                if (op == "OFERTA") {
                    string nombre;
                    long long x;
                    cin >> nombre >> x;
                    auto it = precio.find(nombre);
                    if (it != precio.end()) orden.erase({it->second, nombre});
                    precio[nombre] = x;
                    orden.insert({x, nombre});
                } else if (op == "RETIRA") {
                    string nombre;
                    cin >> nombre;
                    auto it = precio.find(nombre);
                    if (it != precio.end()) {
                        orden.erase({it->second, nombre});
                        precio.erase(it);
                    }
                } else {
                    if (orden.empty()) {
                        cout << "NADA\n";
                    } else {
                        auto primera = *orden.begin();
                        orden.erase(orden.begin());
                        precio.erase(primera.second);
                        cout << primera.second << " " << primera.first << "\n";
                    }
                }
            }
            cout << "QUEDAN " << precio.size() << "\n";
            return 0;
        }
      `,
      java: code`
        import java.io.BufferedReader;
        import java.io.InputStreamReader;
        import java.util.HashMap;
        import java.util.StringTokenizer;
        import java.util.TreeSet;

        public class Main {
            static class Oferta {
                long precio;
                String nombre;
                Oferta(long precio, String nombre) {
                    this.precio = precio;
                    this.nombre = nombre;
                }
            }

            public static void main(String[] args) throws Exception {
                BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                int q = Integer.parseInt(br.readLine().trim());
                HashMap<String, Long> precio = new HashMap<>();  // nombre → precio vigente
                TreeSet<Oferta> orden = new TreeSet<>((a, b) -> a.precio != b.precio ? Long.compare(a.precio, b.precio) : a.nombre.compareTo(b.nombre));
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < q; i++) {
                    StringTokenizer st = new StringTokenizer(br.readLine());
                    String op = st.nextToken();
                    if (op.equals("OFERTA")) {
                        String nombre = st.nextToken();
                        long x = Long.parseLong(st.nextToken());
                        Long viejo = precio.get(nombre);
                        if (viejo != null) orden.remove(new Oferta(viejo, nombre));
                        precio.put(nombre, x);
                        orden.add(new Oferta(x, nombre));
                    } else if (op.equals("RETIRA")) {
                        String nombre = st.nextToken();
                        Long viejo = precio.remove(nombre);
                        if (viejo != null) orden.remove(new Oferta(viejo, nombre));
                    } else {
                        Oferta primera = orden.pollFirst();
                        if (primera == null) {
                            sb.append("NADA\n");
                        } else {
                            precio.remove(primera.nombre);
                            sb.append(primera.nombre).append(" ").append(primera.precio).append("\n");
                        }
                    }
                }
                sb.append("QUEDAN ").append(precio.size()).append("\n");
                System.out.print(sb);
            }
        }
      `,
    },
    hints: [
      'Necesitas dos cosas a la vez: saber el precio vigente de cada vendedor (un diccionario) y encontrar rápido la oferta más barata (un heap o un conjunto ordenado).',
      'Cuando un precio cambia o una oferta se retira, la entrada vieja sigue en el heap. No la busques: déjala ahí y descártala cuando llegue arriba y no coincida con el diccionario.',
      'En COMPRA: mientras el de arriba (precio, nombre) no coincida con precio[nombre], sácalo. Si queda alguno, cómpralo y bórralo del diccionario. En C++/Java, un set/TreeSet de (precio, nombre) permite borrar la entrada vieja directamente.',
    ],
  },
  outro: [
    { speaker: 'MAREA', text: 'Ni una oferta vieja te engañó. Así se lleva un puerto: cada dato en su estructura.' },
    { speaker: 'MAREA', text: 'Toma la Insignia Ancla. Que te recuerde elegir bien dónde guardas las cosas.' },
    { speaker: 'MAREA', text: 'Más allá del muelle este empieza la Montaña Grafo. Allí los caminos se cruzan y se enredan. ¡Buen viaje!' },
  ],
  rewardTip: {
    title: 'Borrado perezoso',
    text: {
      python: 'heapq + dict: al consultar, heappop mientras el de arriba no coincida con lo vigente en el dict.',
      cpp: 'set<pair<precio,nombre>> + map<nombre,precio>: borra el par viejo antes de insertar el nuevo. begin() es el mínimo.',
      java: 'TreeSet con comparador + HashMap: quita la Oferta vieja antes de poner la nueva. pollFirst() saca la más barata.',
    },
  },
};
