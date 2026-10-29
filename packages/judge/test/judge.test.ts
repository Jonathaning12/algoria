import { describe, expect, it } from 'vitest';
import type { Language, TestCase } from '@algoria/shared';
import { detectCompilers, judge, normalizeOutput } from '../src/index';

const tests: TestCase[] = [
  { id: 't1', input: '2 3\n', expected: '5\n', sample: true },
  { id: 't2', input: '10 -4\n', expected: '6', sample: false },
];

type Programs = Record<'ac' | 'wa' | 'tle' | 're' | 'ce', string>;

const programs: Record<Language, Programs> = {
  python: {
    ac: 'a, b = map(int, input().split())\nprint(a + b)\n',
    wa: 'a, b = map(int, input().split())\nprint(a - b)\n',
    tle: 'while True:\n    pass\n',
    re: 'raise ValueError("boom")\n',
    ce: 'def f(:\n    pass\n',
  },
  cpp: {
    ac: '#include <iostream>\nint main(){long long a,b;std::cin>>a>>b;std::cout<<a+b<<"\\n";}\n',
    wa: '#include <iostream>\nint main(){long long a,b;std::cin>>a>>b;std::cout<<a*b<<"\\n";}\n',
    tle: 'int main(){volatile unsigned long long x=0;while(true){x++;}}\n',
    re: '#include <cstdlib>\nint main(){return 3;}\n',
    ce: 'int main(){ this is not cpp }\n',
  },
  java: {
    ac: 'import java.util.*;\npublic class Main{public static void main(String[] a){Scanner s=new Scanner(System.in);long x=s.nextLong(),y=s.nextLong();System.out.println(x+y);}}\n',
    wa: 'public class Main{public static void main(String[] a){System.out.println("nope");}}\n',
    tle: 'public class Main{public static void main(String[] a){long x=0;while(true){x++; if(x<0)System.out.print("");}}}\n',
    re: 'public class Main{public static void main(String[] a){int[] v=new int[1];System.out.println(v[5]);}}\n',
    ce: 'public class Main{public static void main(String[] a){int x = "texto";}}\n',
  },
};

const TIME_LIMIT = 1000;

describe('normalizeOutput', () => {
  it('ignora CRLF, espacios finales y líneas vacías finales', () => {
    expect(normalizeOutput('1 2  \r\n3\t\r\n\r\n\n')).toBe('1 2\n3');
    expect(normalizeOutput('')).toBe('');
  });
});

describe('detectCompilers', () => {
  it('detecta los tres lenguajes', async () => {
    const r = await detectCompilers();
    expect(r.python.ok).toBe(true);
    expect(r.cpp.ok).toBe(true);
    expect(r.java.ok).toBe(true);
  }, 60_000);
});

for (const language of ['python', 'cpp', 'java'] as Language[]) {
  describe(`judge ${language}`, () => {
    const p = programs[language];
    const run = (code: string) => judge({ language, code, tests, timeLimitMs: TIME_LIMIT });

    it('AC', async () => {
      const r = await run(p.ac);
      expect(r.verdict).toBe('AC');
      expect(r.passed).toBe(2);
      expect(r.total).toBe(2);
      for (const t of r.results) {
        expect(t.input).toBeDefined();
        expect(t.expected).toBeDefined();
        expect(t.output).toBeDefined();
        expect(t.stderr).toBeDefined();
      }
    }, 120_000);

    it('WA', async () => {
      const r = await run(p.wa);
      expect(r.verdict).toBe('WA');
      expect(r.passed).toBe(0);
      expect(r.results[0]!.output).not.toBe('');
    }, 120_000);

    it('TLE (bucle infinito)', async () => {
      const r = await run(p.tle);
      expect(r.verdict).toBe('TLE');
      expect(r.results.every((t) => t.verdict === 'TLE')).toBe(true);
    }, 120_000);

    it('RE', async () => {
      const r = await run(p.re);
      expect(r.verdict).toBe('RE');
      expect(r.results[0]!.stderr).toBeTruthy();
    }, 120_000);

    it('CE', async () => {
      const r = await run(p.ce);
      expect(r.verdict).toBe('CE');
      expect(r.passed).toBe(0);
      expect(r.compileOutput).toBeTruthy();
      expect(r.compileOutput).not.toMatch(/algoria-judge-/);
      expect(r.results.every((t) => t.verdict === 'CE')).toBe(true);
    }, 120_000);
  });
}

describe('casos especiales', () => {
  it('Java sin class Main → CE con mensaje claro', async () => {
    const r = await judge({
      language: 'java',
      code: 'public class Solucion{public static void main(String[] a){}}',
      tests,
      timeLimitMs: TIME_LIMIT,
    });
    expect(r.verdict).toBe('CE');
    expect(r.compileOutput).toMatch(/clase Main/);
  }, 60_000);

  it('salida enorme se corta y marca WA', async () => {
    const r = await judge({
      language: 'python',
      code: 'import sys\nwhile True:\n    sys.stdout.write("x" * 1000 + "\\n")\n',
      tests: [tests[0]!],
      timeLimitMs: 2000,
    });
    expect(r.verdict).toBe('WA');
    expect(Buffer.byteLength(r.results[0]!.output ?? '')).toBeLessThanOrEqual(64 * 1024);
  }, 60_000);

  it('un fallo de un test no impide ejecutar los siguientes; veredicto = primero distinto de AC', async () => {
    const r = await judge({
      language: 'python',
      code: 'a, b = map(int, input().split())\nprint(5)\n',
      tests,
      timeLimitMs: TIME_LIMIT,
    });
    expect(r.results.map((t) => t.verdict)).toEqual(['AC', 'WA']);
    expect(r.verdict).toBe('WA');
    expect(r.passed).toBe(1);
  }, 60_000);

  it('máximo 2 juicios a la vez (los demás esperan)', async () => {
    const code = 'import time\ntime.sleep(0.6)\nprint(5)\n';
    const one = [tests[0]!];
    const start = Date.now();
    const rs = await Promise.all(
      [0, 1, 2, 3].map(() => judge({ language: 'python', code, tests: one, timeLimitMs: 3000 })),
    );
    const elapsed = Date.now() - start;
    expect(rs.every((r) => r.verdict === 'AC')).toBe(true);
    // 4 juicios de >=0.6 s con 2 huecos → al menos 2 rondas.
    expect(elapsed).toBeGreaterThanOrEqual(1200);
  }, 60_000);
});
