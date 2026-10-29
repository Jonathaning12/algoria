import type { NaiveSolution } from './types';

export const naive: NaiveSolution[] = [
  {
    problemId: 'p18-ronda-de-dante',
    language: 'cpp',
    idea: 'sumar cada ventana desde cero, O(n·k)',
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
    long long mejor = -1;
    int dia = 1;
    for (int i = 0; i + k <= n; i++) {
        long long s = 0;
        for (int j = i; j < i + k; j++) s += a[j];
        if (s > mejor) {
            mejor = s;
            dia = i + 1;
        }
    }
    cout << mejor << "\\n" << dia << "\\n";
    return 0;
}
`,
  },
];
