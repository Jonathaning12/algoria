// Editor CodeMirror con tema oscuro de la paleta Algoria.
import { useMemo } from 'react';
import CodeMirror, { EditorView, type Extension } from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
// Dependencias transitivas de @codemirror/lang-* (ver informe: conviene declararlas en package.json).
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import type { Language } from '@algoria/shared';

const algoriaTheme = EditorView.theme(
  {
    '&': { backgroundColor: '#1c1a2b', color: '#fbf7ea', fontSize: '15px' },
    '.cm-content': { fontFamily: 'var(--font-code)', caretColor: '#f6c945', padding: '12px 0' },
    '.cm-scroller': { fontFamily: 'var(--font-code)', lineHeight: '1.6' },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#f6c945', borderLeftWidth: '2px' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: '#4a4560 !important' },
    '.cm-gutters': { backgroundColor: '#1c1a2b', color: '#7d8399', borderRight: '2px solid #4a4560' },
    '.cm-activeLineGutter': { backgroundColor: '#2a2740', color: '#fbf7ea' },
    '.cm-activeLine': { backgroundColor: '#24213a' },
    '.cm-matchingBracket': { backgroundColor: '#4a4560', outline: '1px solid #f6c945' },
    '.cm-tooltip': { backgroundColor: '#1e1b33', color: '#fbf7ea', border: '2px solid #fbf7ea' },
    '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: '#3f74d8', color: '#fbf7ea' },
  },
  { dark: true },
);

// Colores con contraste AA sobre #1c1a2b.
const algoriaHighlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.operatorKeyword, t.definitionKeyword, t.moduleKeyword], color: '#ff9e8f' },
  { tag: [t.string, t.special(t.string)], color: '#a8e06a' },
  { tag: [t.number, t.bool, t.null], color: '#f6c945' },
  { tag: [t.comment, t.lineComment, t.blockComment], color: '#a9adbf', fontStyle: 'italic' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: '#7fd3e8' },
  { tag: [t.typeName, t.className, t.standard(t.variableName)], color: '#c9a7f2' },
  { tag: [t.processingInstruction, t.meta], color: '#f0a868' },
  { tag: [t.operator, t.punctuation, t.bracket], color: '#e4dfcf' },
]);

const LANG_EXT: Record<Language, () => Extension> = { python, cpp, java };

export function CodeEditor({
  language,
  value,
  onChange,
  label,
  readOnly = false,
}: {
  language: Language;
  value: string;
  onChange: (v: string) => void;
  label: string;
  readOnly?: boolean;
}) {
  const extensions = useMemo(
    () => [
      LANG_EXT[language](),
      syntaxHighlighting(algoriaHighlight),
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({ 'aria-label': label }),
    ],
    [language, label],
  );
  return (
    <div className="cl-editor">
      <CodeMirror
        value={value}
        onChange={onChange}
        theme={algoriaTheme}
        extensions={extensions}
        readOnly={readOnly}
        minHeight="260px"
        basicSetup={{ foldGutter: false, highlightActiveLine: true, autocompletion: true }}
      />
    </div>
  );
}
