import type { Language, SpriteId } from '@algoria/shared';

export interface LanguageInfo {
  id: Language;
  label: string;
  companion: string;
  sprite: SpriteId;
  color: string;
  /** Color de texto legible sobre `color`. */
  onColor: string;
  /** Fondo suave para retratos del compañero. */
  tint: string;
  fileName: string;
  blurb: string;
  stat: string;
}

export const LANGUAGE_INFO: Record<Language, LanguageInfo> = {
  python: {
    id: 'python', label: 'PYTHON', companion: 'PYXI', sprite: 'pyxi',
    // #2f5fc4 en vez de #3f74d8 para que el texto claro pase AA a tamaño pequeño.
    color: '#2f5fc4', onColor: '#fbf7ea', tint: '#7fd3e8', fileName: 'solucion.py',
    blurb: 'Lee casi como inglés. Ideal si es tu primera vez programando.',
    stat: 'Facilidad ★★★ · Velocidad ★☆☆',
  },
  cpp: {
    id: 'cpp', label: 'C++', companion: 'CEEPLUS', sprite: 'ceeplus',
    color: '#3a8fb5', onColor: '#1c1a2b', tint: '#c3c7d4', fileName: 'solucion.cpp',
    blurb: 'Rápido como un rayo. El favorito de las competencias.',
    stat: 'Facilidad ★☆☆ · Velocidad ★★★',
  },
  java: {
    id: 'java', label: 'JAVA', companion: 'JAVO', sprite: 'javo',
    color: '#f08a3c', onColor: '#1c1a2b', tint: '#f3ead0', fileName: 'Main.java',
    blurb: 'Ordenado y robusto. Todo vive dentro de clases.',
    stat: 'Facilidad ★★☆ · Velocidad ★★☆',
  },
};
