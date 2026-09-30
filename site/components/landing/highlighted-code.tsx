import * as React from 'react';

const tokenPattern =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|\b(?:import|from|const|new|console|log|export|return|class|extends|true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b|\b(?:Hurstify|generateFractionalBrownianMotion|estimateSingleWithDiagnostics|scaleA1|scaleA2|sampleSize|iterations|H)\b)/g;

function tokenClass(token: string) {
  if (token.startsWith('//') || token.startsWith('/*')) return 'code-comment';
  if (/^[`'\"]/.test(token)) return 'code-string';
  if (/^\d/.test(token)) return 'code-number';
  if (
    /^(Hurstify|generateFractionalBrownianMotion|estimateSingleWithDiagnostics|scaleA1|scaleA2|sampleSize|iterations|H)$/.test(
      token,
    )
  )
    return 'code-function';
  return 'code-keyword';
}

function isToken(part: string) {
  return (
    part.startsWith('//') ||
    part.startsWith('/*') ||
    /^[`'\"]/.test(part) ||
    /^\d/.test(part) ||
    /^(?:import|from|const|new|console|log|export|return|class|extends|true|false|null|undefined|Hurstify|generateFractionalBrownianMotion|estimateSingleWithDiagnostics|scaleA1|scaleA2|sampleSize|iterations|H)$/.test(
      part,
    )
  );
}

export function HighlightedCode({code}: {code: string}) {
  const lines = code.split('\n');
  return (
    <>
      {lines.map((line, lineIndex) => (
        <React.Fragment key={`${lineIndex}-${line}`}>
          <span>
            {line.split(tokenPattern).map((part, partIndex) =>
              part && isToken(part) ? (
                <span
                  key={`${lineIndex}-${partIndex}`}
                  className={tokenClass(part)}
                >
                  {part}
                </span>
              ) : (
                <React.Fragment key={`${lineIndex}-${partIndex}`}>
                  {part}
                </React.Fragment>
              ),
            )}
          </span>
          {lineIndex < lines.length - 1 ? '\n' : null}
        </React.Fragment>
      ))}
    </>
  );
}
