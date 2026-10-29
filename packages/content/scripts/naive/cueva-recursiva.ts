import type { NaiveSolution } from './types';

// Soluciones ingenuas de la Cueva Recursiva: pasan los ejemplos pero deben dar TLE en algún test oculto.
export const naive: NaiveSolution[] = [
  {
    problemId: 'p25-desorden-de-estalactitas',
    language: 'cpp',
    idea: 'comparar todas las parejas, O(n²)',
    code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    long long inv = 0;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (a[i] > a[j]) inv++;
    cout << inv << "\\n";
    return 0;
}
`,
  },
  {
    problemId: 'p26-catalogo-de-gemas',
    language: 'cpp',
    idea: 'buscar cada consulta recorriendo el catálogo, O(n·q)',
    code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<long long> a(n);
    for (auto& v : a) cin >> v;
    long long encontradas = 0, suma = 0;
    for (int t = 0; t < q; t++) {
        long long x;
        cin >> x;
        for (int i = 0; i < n; i++) {
            if (a[i] == x) {
                encontradas++;
                suma += i + 1;
                break;
            }
        }
    }
    cout << encontradas << "\\n" << suma << "\\n";
    return 0;
}
`,
  },
  {
    problemId: 'p27-maquina-de-pico',
    language: 'cpp',
    idea: 'bajar la cuchilla de 1 en 1 desde la columna más alta, O(n·max h)',
    code: `#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long m;
    cin >> n >> m;
    vector<long long> h(n);
    for (auto& x : h) cin >> x;
    long long alto = *max_element(h.begin(), h.end());
    while (alto > 0) {
        long long s = 0;
        for (long long x : h) if (x > alto) s += x - alto;
        if (s >= m) break;
        alto--;
    }
    cout << alto << "\\n";
    return 0;
}
`,
  },
  {
    problemId: 'p28-cuerda-de-nico',
    language: 'cpp',
    idea: 'probar todas las parejas, O(n²)',
    code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long x;
    cin >> n >> x;
    vector<long long> a(n);
    for (auto& v : a) cin >> v;
    long long parejas = 0;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (a[i] + a[j] <= x) parejas++;
    cout << parejas << "\\n";
    return 0;
}
`,
  },
  {
    problemId: 'p30-resonancia-de-obsidiana',
    language: 'cpp',
    idea: 'búsqueda binaria sobre D, pero contando parejas con doble bucle, O(n² log V)',
    code: `#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int n;
vector<long long> a;

long long contar(long long d) {
    long long c = 0;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (a[j] - a[i] <= d) c++;
    return c;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long k;
    cin >> n >> k;
    a.resize(n);
    for (auto& v : a) cin >> v;
    sort(a.begin(), a.end());
    long long lo = 0, hi = a[n - 1] - a[0];
    while (lo < hi) {
        long long mid = (lo + hi) / 2;
        if (contar(mid) >= k) hi = mid;
        else lo = mid + 1;
    }
    cout << lo << "\\n";
    return 0;
}
`,
  },
];
