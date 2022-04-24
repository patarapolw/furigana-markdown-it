// @ts-check

"use strict";

/**
 * @typedef {{ name: string; on: string; off: string }} BracketDefinition
 */

class Bracket {
  /**
   *
   * @param {BracketDefinition} bracket
   * @param {string} raw
   */
  constructor(bracket, raw) {
    const err = new Error();
    err.name = "BracketError";

    if (raw.length < bracket.on.length + bracket.off.length) {
      err.message = `raw too short - ${JSON.stringify(raw)}`;
      throw err;
    }
    if (!raw.startsWith(bracket.on)) {
      err.message = `raw not started with ${JSON.stringify(
        bracket.on
      )} - ${JSON.stringify(raw)}`;
      throw err;
    }

    let prevPos = 0;
    let offPos = 0;
    while ((offPos = raw.indexOf(bracket.off, prevPos + 1)) !== -1) {
      prevPos = offPos;
    }

    if (prevPos !== raw.length - bracket.off.length) {
      err.message = `raw not ended with ${JSON.stringify(
        bracket.off
      )} - ${JSON.stringify(raw)}`;
      throw err;
    }

    this.bracket = bracket;
    this.raw = raw;
  }

  getInner() {
    return this.raw.substring(
      this.bracket.on.length,
      this.raw.length - this.bracket.off.length
    );
  }

  toString() {
    return this.raw;
  }

  toJSON() {
    return {
      ...this.bracket,
      raw: this.raw,
      inner: this.getInner(),
    };
  }
}

/**
 *
 * @param {string} raw
 * @param {BracketDefinition[]} bTypes
 * @returns {(string | Bracket)[]}
 */
function bracketMatcher(raw, bTypes) {
  let s = "";
  /** @type {BracketDefinition} */
  let type;

  /** @type {(string | Bracket)[]} */
  const rt = [];
  /** @type {string[]} */
  const brackets = [];

  const onMap = Object.fromEntries(bTypes.map((v) => [v.on, v]));
  const offMap = Object.fromEntries(bTypes.map((v) => [v.off, v]));

  raw.split("").map((c) => {
    /** @type {BracketDefinition} */
    let b;

    if ((b = onMap[c])) {
      if (!type && s) {
        rt.push(s);
        s = "";
      }

      type = type || b;

      if (type && type.name === b.name) {
        brackets.push(type.name);
        s += c;
        return;
      }
    }

    s += c;

    if ((b = offMap[c])) {
      if (brackets[brackets.length - 1] === b.name) {
        brackets.pop();
        if (!brackets.length) {
          rt.push(new Bracket(b, s));
          s = "";
          type = undefined;
        }
        return;
      }
    }
  });

  if (s) {
    rt.push(type ? new Bracket(type, s) : s);
  }

  return rt;
}

/**
 *
 * @param {string} raw
 * @param {BracketDefinition} b1
 * @param {BracketDefinition} b2
 * @param {(prev: string, c: string, type?: string) => string} parser
 * @returns
 */
function parseContiguousBrackets(raw, b1, b2, parser) {
  const rt = bracketMatcher(raw, [b1, b2]);

  /** @type {string[]} */
  const out = [];
  for (let i = 0; i < rt.length; i++) {
    const rx = rt[i];
    let ry = rt[i + 1];

    if (
      rx instanceof Bracket &&
      ry instanceof Bracket &&
      rx.bracket.name === b1.name &&
      ry.bracket.name === b2.name
    ) {
      let current = parser("", rx.getInner(), b1.name);

      do {
        current += parser(
          current,
          ry instanceof Bracket ? ry.getInner() : ry,
          b2.name
        );
        ry = rt[++i + 1];
      } while (ry instanceof Bracket && ry.bracket.name === b2.name);

      current += parser("", "");
      out.push(current);
      continue;
    }

    out.push(rx.toString());
  }

  return out.join("");
}

module.exports = {
  bracketMatcher,
  Bracket,
  parseContiguousBrackets,
};
