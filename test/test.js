"use strict";

const assert = require("assert");
const md = require("markdown-it")().use(require("../index"));

describe("ruby", function() {
  it("should parse basic [body]{toptext}", function() {
    assert.equal(
      md.renderInline("[漢字]{かんじ}"),
      "<ruby>漢字<rp>【</rp><rt>かんじ</rt><rp>】</rp></ruby>"
    );
  });

  it("should parse single [body]{toptext} in a sentence", function() {
    assert.equal(
      md.renderInline("Foo [漢字]{かんじ} bar."),
      "Foo <ruby>漢字<rp>【</rp><rt>かんじ</rt><rp>】</rp></ruby> bar."
    );
  });

  it("should parse multiple [body]{toptext} in a sentence", function() {
    assert.equal(
      md.renderInline("Foo [漢字]{かんじ} bar [猫]{ねこ} baz."),
      "Foo <ruby>漢字<rp>【</rp><rt>かんじ</rt><rp>】</rp></ruby> bar <ruby>猫<rp>【</rp><rt>ねこ</rt><rp>】</rp></ruby> baz."
    );
  });

  it("should ignore empty body", function() {
    assert.equal(md.renderInline("[]{ねこ}"), "[]{ねこ}");
    assert.equal(md.renderInline("[ ]{ねこ}"), "[ ]{ねこ}");
  });

  it("should ignore empty toptext", function() {
    assert.equal(md.renderInline("[猫]{}"), "[猫]{}");
    assert.equal(md.renderInline("[猫]{ }"), "[猫]{ }");
  });
});

describe("furigana", function() {
  it("should be able to pattern match a single kanji+hiragana word", function() {
    assert.equal(
      md.renderInline("[食べる]{たべる}"),
      "<ruby>食<rp>【</rp><rt>た</rt><rp>】</rp>べる<rt></rt></ruby>"
    );
  });

  it("should be able to pattern match a word with hiragana in the middle", function() {
    assert.equal(
      md.renderInline("[取り返す]{とりかえす}"),
      "<ruby>取<rp>【</rp><rt>と</rt><rp>】</rp>り<rt></rt>返<rp>【</rp><rt>かえ</rt><rp>】</rp>す<rt></rt></ruby>"
    );
  });

  it("should be able to split furigana with a dot", function() {
    assert.equal(
      md.renderInline("[漢字]{かん.じ}"),
      "<ruby>漢<rp>【</rp><rt>かん</rt><rp>】</rp>字<rp>【</rp><rt>じ</rt><rp>】</rp></ruby>"
    );
  });

  it("should be able to use dots to resolve ambiguities", function() {
    assert.equal(
      md.renderInline("[可愛い犬]{か.わい.い.いぬ}"),
      "<ruby>可<rp>【</rp><rt>か</rt><rp>】</rp>愛<rp>【</rp><rt>わい</rt><rp>】</rp>い<rt></rt>犬<rp>【</rp><rt>いぬ</rt><rp>】</rp></ruby>"
    );
  });

  it("should be able to use pluses to resolve ambiguities without splitting furigana", function() {
    assert.equal(
      md.renderInline("[可愛い犬]{か+わい.い.いぬ}"),
      "<ruby>可愛<rp>【</rp><rt>かわい</rt><rp>】</rp>い<rt></rt>犬<rp>【</rp><rt>いぬ</rt><rp>】</rp></ruby>"
    );
  });

  it("should be able to handle symbols other than kanji and kana in the body", function() {
    assert.equal(
      md.renderInline("[猫！？可愛い！！！w]{ねこ.かわいい}"),
      "<ruby>猫<rp>【</rp><rt>ねこ</rt><rp>】</rp>！？<rt></rt>可愛<rp>【</rp><rt>かわい</rt><rp>】</rp>い！！！w<rt></rt></ruby>"
    );
  });

  it("should apply the whole toptext to the whole body if it can't pattern match", function() {
    assert.equal(
      md.renderInline("[食べる]{たべべ}"),
      "<ruby>食べる<rp>【</rp><rt>たべべ</rt><rp>】</rp></ruby>"
    );
    assert.equal(
      md.renderInline("[アクセラレーター]{accelerator}"),
      "<ruby>アクセラレーター<rp>【</rp><rt>accelerator</rt><rp>】</rp></ruby>"
    );
    assert.equal(
      md.renderInline("[cat]{ねこ}"),
      "<ruby>cat<rp>【</rp><rt>ねこ</rt><rp>】</rp></ruby>"
    );
  });
});
