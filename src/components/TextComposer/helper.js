export function getCurrentWord(editor) {
  const range = editor.getSelection();
  if (range) {
    let startPos = range.index - 1;
    while (startPos >= 0 && /\S/.test(editor.getText(startPos, 1))) {
      startPos--;
    }
    startPos++;
    let endPos = range.index;
    while (
      endPos < editor.getLength() &&
      /\S/.test(editor.getText(endPos, 1))
    ) {
      endPos++;
    }
    return editor.getText(startPos, endPos - startPos);
  }
  return null;
}

export const getWordsWithPositions = (text) => {
  return new Promise((resolve) => {
    let wordStart = null;
    const result = new Map();

    const checkedWordsInChunks = (index = 0) => {
      if (index >= text.length) {
        if (wordStart !== null) {
          if (result.has(text.slice(wordStart))) {
            result.set(text.slice(wordStart), [
              ...result.get(text.slice(wordStart)),
              wordStart,
            ]);
          } else {
            result.set(text.slice(wordStart), [wordStart]);
          }
        }
        resolve(result);
        return;
      }

      const chunkSize = 200000;
      const chunk = text.slice(index, index + chunkSize);

      for (let i = 0; i < chunk.length; i++) {
        if (/\S/.test(text[index + i])) {
          if (wordStart === null) {
            wordStart = index + i;
          }
        } else {
          if (wordStart !== null) {
            if (result.has(text.slice(wordStart, index + i))) {
              result.set(text.slice(wordStart, index + i), [
                ...result.get(text.slice(wordStart, index + i)),
                wordStart,
              ]);
            } else {
              result.set(text.slice(wordStart, index + i), [wordStart]);
            }
            wordStart = null;
          }
        }
      }

      requestAnimationFrame(() => checkedWordsInChunks(index + chunkSize));
    };

    checkedWordsInChunks();
  });
};
