var expect = require("chai").expect;
var parse = require("../parse.js");

const testTempDir = "./test-data";

describe("findMatchingRoamBlocks()", function () {
  it("should add find all blocks that match in a document", function () {
    // 1. ARRANGE
    var wantMatchingBlocks = [
      {
        Text: "this is {{c1::a}} {{c2::flashcard}}.",
        Extra: "",
        UID: "20200405151328",
      },
      {
        Text: "this is {{c1::another}} {{c2::flashcard}} haha..",
        Extra: "",
        UID: "20200405151338",
      },
    ];

    // 2. ACT
    var gotMatchingBlocks = parse.findMatchingRoamBlocks(testTempDir);

    // 3. ASSERT
    expect(gotMatchingBlocks).to.be.eql(wantMatchingBlocks);
  });
});

describe("blockToClozeUID()", function () {
  it("should put a block into the correct format for anki", function () {
    // 1. ARRANGE
    var wantObject = {
      Text: "this is {{c1::a}} {{c2::flashcard}}.",
      Extra: "",
      UID: "20200405151328",
    };

    var testBlock =
      "- this is {c1::a} {c2::flashcard} #flashcard {uid:20200405151328}.";

    // 2. ACT
    var gotObject = parse.blockToClozeUID(testBlock);

    // 3. ASSERT
    expect(gotObject).to.be.eql(wantObject);
  });
});
