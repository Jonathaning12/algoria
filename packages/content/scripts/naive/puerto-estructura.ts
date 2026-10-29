import type { NaiveSolution } from './types';

export const naive: NaiveSolution[] = [
  {
    problemId: 'p33-olas-de-nerea',
    language: 'cpp',
    idea: 'mirar hacia adelante desde cada ola hasta encontrar una más alta, O(n²)',
    code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> h(n);
    for (int i = 0; i < n; i++) cin >> h[i];
    long long espera = 0, calma = 0;
    for (int i = 0; i < n; i++) {
        int j = i + 1;
        while (j < n && h[j] <= h[i]) j++;
        if (j < n) espera += j - i;
        else calma++;
    }
    cout << espera << "\\n" << calma << "\\n";
    return 0;
}
`,
  },
  {
    problemId: 'p36-pesas-de-cipriano',
    language: 'cpp',
    idea: 'probar todas las parejas i < j, O(n²)',
    code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long k;
    cin >> n >> k;
    vector<long long> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    long long pares = 0;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (a[i] + a[j] == k) pares++;
    cout << pares << "\\n";
    return 0;
}
`,
  },
  {
    problemId: 'p38-amarres-de-dora',
    language: 'cpp',
    idea: 'revisar los M muelles por cada barco, O(N·M)',
    code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<long long> libre(m + 1, 0);
    vector<int> atendidos(m + 1, 0);
    long long espera = 0, fin = 0;
    for (int i = 0; i < n; i++) {
        long long t, d;
        cin >> t >> d;
        int elegido = -1;
        for (int j = 1; j <= m; j++) {
            if (libre[j] <= t) { elegido = j; break; }
        }
        if (elegido == -1) {
            elegido = 1;
            for (int j = 2; j <= m; j++) if (libre[j] < libre[elegido]) elegido = j;
        }
        long long inicio = libre[elegido] > t ? libre[elegido] : t;
        espera += inicio - t;
        atendidos[elegido]++;
        libre[elegido] = inicio + d;
        if (inicio + d > fin) fin = inicio + d;
    }
    int mejor = 1;
    for (int j = 2; j <= m; j++) if (atendidos[j] > atendidos[mejor]) mejor = j;
    cout << fin << "\\n" << espera << "\\n" << mejor << "\\n";
    return 0;
}
`,
  },
  {
    problemId: 'p39-grua-de-faustino',
    language: 'cpp',
    idea: 'buscar el máximo de cada ventana desde cero, O(n·k)',
    code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k;
    cin >> n >> k;
    vector<long long> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    long long suma = 0, menor = -1;
    for (int i = 0; i + k <= n; i++) {
        long long m = a[i];
        for (int j = i + 1; j < i + k; j++)
            if (a[j] > m) m = a[j];
        suma += m;
        if (menor == -1 || m < menor) menor = m;
    }
    cout << suma << "\\n" << menor << "\\n";
    return 0;
}
`,
  },
];
