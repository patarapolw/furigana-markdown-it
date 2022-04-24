// @ts-check

"use strict";

const assert = require("assert");
const {
  bracketMatcher,
  Bracket,
  parseContiguousBrackets,
} = require("../lib/brackets");

/** @type {Record<string, import("../lib/brackets").BracketDefinition>} */
const brackets = {
  kanji: { name: "kanji", on: "[", off: "]" },
  furigana: { name: "furigana", on: "{", off: "}" },
};

describe("Bracket", function () {
  it("should not accept unbracketed", function () {
    assert.throws(() => {
      new Bracket(brackets.kanji, "[");
    }, /^BracketError: raw /);
    assert.throws(() => {
      new Bracket(brackets.kanji, "]");
    }, /^BracketError: raw /);
    assert.throws(() => {
      new Bracket(brackets.kanji, "[] ");
    }, /^BracketError: raw /);
    assert.throws(() => {
      new Bracket(brackets.kanji, " []");
    }, /^BracketError: raw /);
    assert.throws(() => {
      new Bracket(brackets.kanji, "[[]] ");
    }, /^BracketError: raw /);
    assert.throws(() => {
      new Bracket(brackets.kanji, " [[]]");
    }, /^BracketError: raw /);
  });
});

describe("bracket matcher", function () {
  /**
   *
   * @param {(string | Bracket)[]} bs
   */
  function norm(bs) {
    return bs.map((b) => (b instanceof Bracket ? b.toJSON() : b.toString()));
  }

  it("should parse nested brackets", function () {
    assert.deepStrictEqual(
      norm(bracketMatcher("[[]]", [brackets.kanji])),
      norm([new Bracket(brackets.kanji, "[[]]")])
    );
  });

  it("should parse multiple brackets", function () {
    assert.deepStrictEqual(
      bracketMatcher("[漢字]{かんじ} [another]", [
        brackets.kanji,
        brackets.furigana,
      ]),
      [
        new Bracket(brackets.kanji, "[漢字]"),
        new Bracket(brackets.furigana, "{かんじ}"),
        " ",
        new Bracket(brackets.kanji, "[another]"),
      ]
    );
  });
});

class SimpleParser {
  depth = 0;

  /**
   *
   * @param {string} prev
   * @param {string} c
   * @param {string} [type]
   * @returns
   */
  parse(prev, c, type) {
    switch (type) {
      case "furigana":
        prev += "<rt>" + c + "</rt>";
        break;
      case "kanji":
        this.depth++;
        prev += "<ruby>";
        prev += c;
        break;
      default:
        if (this.depth) {
          this.depth--;
          if (!this.depth) {
            prev += "</ruby>";
          }
        }
        prev += c;
    }

    return prev;
  }
}

describe("contiguous bracket parser", function () {
  it("should parse single trailing bracket", function () {
    const parser = new SimpleParser();

    assert.strictEqual(
      parseContiguousBrackets(
        "[漢字]{かんじ}",
        brackets.kanji,
        brackets.furigana,
        (prev, c, type) => {
          return parser.parse(prev, c, type);
        }
      ),
      "<ruby>漢字<rt>かんじ</rt></ruby>"
    );
  });
});
