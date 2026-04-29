export const getWordStartingIndices = (sentence: string): number[] =>
  Array.from(sentence.matchAll(/\S+/g), (match) => match.index!);

const getTextSpans = (element: Element): Element[] =>
  element.children.length
    ? Array.from(element.children).flatMap(getTextSpans)
    : [element];

export const getOrderedTextSpans = (elements: HTMLCollection): Element[] =>
  Array.from(elements)
    .flatMap(getTextSpans)
    .filter((span) => span.textContent?.trim())
    .map((span) => ({ span, rect: span.getBoundingClientRect() }))
    .sort((a, b) => {
      const topDifference = a.rect.top - b.rect.top;
      // treat tops within 3px as the same row due to pdfjs oddity
      return Math.abs(topDifference) > 3
        ? topDifference
        : a.rect.left - b.rect.left;
    })
    .map(({ span }) => span);
