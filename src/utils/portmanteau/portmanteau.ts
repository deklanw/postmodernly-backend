export const glue = (a: string, b: string) => {
  // Look for longest coincidence between suffix and prefix of two words.
  // e.g. a=funhouse, b=housemaking -> {maxN: 5, result: 'funhousemaking'}

  let maxN = 0;
  const lenA = a.length;
  const lenB = b.length;

  for (let n = 0; n <= Math.min(lenA, lenB); n++) {
    const suffix = a.slice(lenA - n, lenA);
    const prefix = b.slice(0, n);
    if (prefix === suffix) {
      maxN = n;
    }
  }

  return { maxN, result: a + b.slice(maxN, lenB) };
};

export const portmanteau = (word1: string, word2: string) => {
  // Takes two words, one as prefix and one as suffix. Tries slicing from
  // 0 to factor * length from the end and beginning, then running glue.
  // take for example, "funhouses" and "zhousemaking"
  // the suffix of one is 'almost' the prefix of the other.
  // the desired result is "funhousemaking"

  // the value of factor needs to be determined experimentally

  const word1Len = word1.length;
  const word2Len = word2.length;
  let result = '';
  let n = -1;

  const factor = 2 / 3;

  for (let x = 0; x <= Math.floor(word1Len * factor); x++) {
    for (let y = 0; y <= Math.floor(word2Len * factor); y++) {
      const w1 = word1.slice(0, word1Len - x);
      const w2 = word2.slice(y, word2Len);

      const w3 = word2.slice(0, word2Len - y);
      const w4 = word1.slice(x, word1Len);

      const { maxN: n1, result: r1 } = glue(w1, w2);
      const { maxN: n2, result: r2 } = glue(w3, w4);
      if (n1 > n) {
        n = n1;
        result = r1;
      }
      if (n2 > n) {
        n = n2;
        result = r2;
      }
    }
  }
  return result;
};
