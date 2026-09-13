const keywords = new Set([
  'as', 'async', 'await', 'class', 'const', 'else', 'export', 'extends', 'from',
  'function', 'if', 'import', 'interface', 'let', 'new', 'return', 'type',
  'typeof', 'undefined', 'var', 'while'
]);

const tokenPattern = /^(\/\/[^\n]*|\/\*[\s\S]*?\*\/|`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:as|async|await|class|const|else|export|extends|from|function|if|import|interface|let|new|return|type|typeof|undefined|var|while)\b|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b|===|!==|=>|==|!=|<=|>=|&&|\|\||[+*/%=<>!-]|[{}()[\].,;:?])/;

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function tokenClass(value, source, offset) {
  if (value.startsWith('//') || value.startsWith('/*')) return 'comment';
  if (/^[`"']/.test(value)) return 'string';
  if (/^\d/.test(value)) return 'number';
  if (keywords.has(value)) return 'keyword';
  if (/^[+*/%=<>!-]|^(===|!==|=>|==|!=|<=|>=|&&|\|\|)$/.test(value)) return 'operator';
  if (/^[{}()[\].,;:?]$/.test(value)) return 'punctuation';
  if (/^[A-Za-z_$][\w$]*$/.test(value) && /^\s*\(/.test(source.slice(offset + value.length))) return 'function';
  return '';
}

function highlight(source) {
  let output = '';
  let index = 0;
  while (index < source.length) {
    const whitespace = source.slice(index).match(/^\s+/);
    if (whitespace) {
      output += escapeHtml(whitespace[0]);
      index += whitespace[0].length;
      continue;
    }

    const match = source.slice(index).match(tokenPattern);
    if (!match) {
      output += escapeHtml(source[index] ?? '');
      index += 1;
      continue;
    }

    const value = match[0];
    const className = tokenClass(value, source, index);
    output += className ? `<span class="token ${className}">${escapeHtml(value)}</span>` : escapeHtml(value);
    index += value.length;
  }
  return output;
}

for (const code of document.querySelectorAll('pre code[class*="language-"]')) {
  if (code.dataset.highlighted === 'true') continue;
  code.innerHTML = highlight(code.textContent ?? '');
  code.dataset.highlighted = 'true';
}
