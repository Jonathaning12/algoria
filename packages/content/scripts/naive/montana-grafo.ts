import type { NaiveSolution } from './types';

export const naive: NaiveSolution[] = [
  {
    problemId: 'p47-correo-de-fausto',
    language: 'cpp',
    idea: 'Dijkstra sin cola de prioridad: buscar el más cercano recorriendo todos, O(V²)',
    code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<pair<int, int>>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b, w;
        cin >> a >> b >> w;
        adj[a].push_back({b, w});
        adj[b].push_back({a, w});
    }
    const long long INF = 4e18;
    vector<long long> dist(n + 1, INF);
    vector<bool> hecho(n + 1, false);
    dist[1] = 0;
    for (int it = 0; it < n; it++) {
        int u = -1;
        for (int v = 1; v <= n; v++) {
            if (!hecho[v] && (u == -1 || dist[v] < dist[u])) u = v;
        }
        if (u == -1 || dist[u] == INF) break;
        hecho[u] = true;
        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
        }
    }
    cout << (dist[n] == INF ? -1 : dist[n]) << "\\n";
    return 0;
}
`,
  },
  {
    problemId: 'p48-cuerdas-de-olga',
    language: 'cpp',
    idea: 'responder cada pregunta con un BFS sobre las cuerdas tendidas, O(P·(N + Q))',
    code: `#include <algorithm>
#include <iostream>
#include <queue>
#include <string>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<vector<int>> adj(n + 1);
    vector<char> visto(n + 1);
    string res;
    for (int i = 0; i < q; i++) {
        char t;
        int a, b;
        cin >> t >> a >> b;
        if (t == 'U') {
            adj[a].push_back(b);
            adj[b].push_back(a);
            continue;
        }
        fill(visto.begin(), visto.end(), 0);
        queue<int> cola;
        cola.push(a);
        visto[a] = 1;
        while (!cola.empty() && !visto[b]) {
            int u = cola.front();
            cola.pop();
            for (int v : adj[u]) {
                if (!visto[v]) {
                    visto[v] = 1;
                    cola.push(v);
                }
            }
        }
        res += visto[b] ? "SI\\n" : "NO\\n";
    }
    cout << res;
    return 0;
}
`,
  },
  {
    problemId: 'p49-telefericos-de-ignacio',
    language: 'cpp',
    idea: 'Kruskal sin Union-Find: comprobar con un DFS sobre los cables elegidos si cada cable cierra un ciclo, O(M·N)',
    code: `#include <algorithm>
#include <iostream>
#include <tuple>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<tuple<int, int, int>> cables(m);
    for (auto& [c, a, b] : cables) cin >> a >> b >> c;
    sort(cables.begin(), cables.end());
    vector<vector<int>> arbol(n + 1);
    vector<char> visto(n + 1);
    long long total = 0;
    int usados = 0;
    for (auto& [c, a, b] : cables) {
        fill(visto.begin(), visto.end(), 0);
        vector<int> pila = {a};
        visto[a] = 1;
        while (!pila.empty()) {
            int u = pila.back();
            pila.pop_back();
            for (int v : arbol[u]) {
                if (!visto[v]) {
                    visto[v] = 1;
                    pila.push_back(v);
                }
            }
        }
        if (!visto[b]) {
            arbol[a].push_back(b);
            arbol[b].push_back(a);
            total += c;
            usados++;
        }
    }
    if (usados == n - 1) cout << total << "\\n";
    else cout << "IMPOSIBLE\\n";
    return 0;
}
`,
  },
];
