import type { NaiveSolution } from './types';

export const naive: NaiveSolution[] = [
  {
    problemId: 'p51-pergaminos-de-elda',
    language: 'cpp',
    idea: 'recursión sin memoria para cada pregunta, O(2ⁿ)',
    code: `#include <iostream>
using namespace std;

const long long MOD = 1000000007;

long long f(int n) {
    if (n <= 2) return 1;
    return (f(n - 1) + f(n - 2)) % MOD;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    for (int i = 0; i < t; i++) {
        int n;
        cin >> n;
        cout << f(n) << "\\n";
    }
    return 0;
}
`,
  },
  {
    problemId: 'p52-escalera-de-tobias',
    language: 'cpp',
    idea: 'probar todas las subidas con recursión sin memoria, exponencial',
    code: `#include <iostream>
#include <vector>
using namespace std;

const long long MOD = 1000000007;
vector<int> saltos;
vector<bool> roto;

long long formas(int i) {
    if (i == 0) return 1;
    if (roto[i]) return 0;
    long long s = 0;
    for (int d : saltos) {
        if (d <= i) s = (s + formas(i - d)) % MOD;
    }
    return s;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k, m;
    cin >> n >> k >> m;
    saltos.resize(k);
    for (int i = 0; i < k; i++) cin >> saltos[i];
    roto.assign(n + 1, false);
    for (int i = 0; i < m; i++) {
        int x;
        cin >> x;
        roto[x] = true;
    }
    cout << formas(n) << "\\n";
    return 0;
}
`,
  },
  {
    problemId: 'p54-mochila-de-baltasar',
    language: 'cpp',
    idea: 'probar todos los subconjuntos (llevar o no cada ingrediente), O(2ᴺ)',
    code: `#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int n;
vector<int> p;
vector<long long> v;

long long mejor(int i, int cap) {
    if (i == n) return 0;
    long long res = mejor(i + 1, cap);
    if (p[i] <= cap) res = max(res, mejor(i + 1, cap - p[i]) + v[i]);
    return res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int w;
    cin >> n >> w;
    p.resize(n);
    v.resize(n);
    for (int i = 0; i < n; i++) cin >> p[i] >> v[i];
    cout << mejor(0, w) << "\\n";
    return 0;
}
`,
  },
  {
    problemId: 'p56-estrellas-de-selene',
    language: 'cpp',
    idea: 'DP clásica O(n²): para cada i, mirar todos los j < i',
    code: `#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> a(n), dp(n, 1);
    for (int i = 0; i < n; i++) cin >> a[i];
    int mejor = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (a[j] < a[i] && dp[j] + 1 > dp[i]) dp[i] = dp[j] + 1;
        }
        mejor = max(mejor, dp[i]);
    }
    cout << mejor << "\\n";
    return 0;
}
`,
  },
  {
    problemId: 'p59-aprendices-de-melquiades',
    language: 'cpp',
    idea: 'probar todos los repartos con next_permutation, O(N!·N)',
    code: `#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<vector<long long>> c(n, vector<long long>(n));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) cin >> c[i][j];
    vector<int> perm(n);
    for (int i = 0; i < n; i++) perm[i] = i;
    long long mejor = -1;
    do {
        long long s = 0;
        for (int i = 0; i < n; i++) s += c[i][perm[i]];
        if (mejor < 0 || s < mejor) mejor = s;
    } while (next_permutation(perm.begin(), perm.end()));
    cout << mejor << "\\n";
    return 0;
}
`,
  },
  {
    problemId: 'p60-ascenso-de-isolda',
    language: 'cpp',
    idea: 'recorrer todos los caminos con DFS, exponencial',
    code: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

const long long MOD = 1000000007;
int r, c;
vector<string> g;
long long mejor = -1, formas = 0;

void dfs(int i, int j, long long suma) {
    if (i >= r || j >= c || g[i][j] == '#') return;
    suma += g[i][j] - '0';
    if (i == r - 1 && j == c - 1) {
        if (suma > mejor) {
            mejor = suma;
            formas = 1;
        } else if (suma == mejor) {
            formas = (formas + 1) % MOD;
        }
        return;
    }
    dfs(i + 1, j, suma);
    dfs(i, j + 1, suma);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> r >> c;
    g.resize(r);
    for (int i = 0; i < r; i++) cin >> g[i];
    dfs(0, 0, 0);
    if (mejor < 0) cout << -1 << "\\n" << 0 << "\\n";
    else cout << mejor << "\\n" << formas << "\\n";
    return 0;
}
`,
  },
];
