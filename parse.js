"use strict";
const { RipGrep } = require("ripgrep-node");

// Using `flashcard` as the roam tag to extract blocks for.
const tagRegexpForFlashcards = /#(flashcard|\\[\\[flashcard\\]\\])/g;
const tagRegexpForRgFlashcards = `^.*\s*#(flashcard|\\[\\[flashcard\\]\\])\s*.*$`;
const uidRegexpI = /{\s*uid:\s*(\d*)\s*}/i;
const uidRegexpGI = /\s*{\s*uid:\s*(\d*)\s*}\s*/gi;
const clozeMatchRegexp = /{\s*c\d*::[^{}]*\s*}/gi;
const firstDashRegexp = /^\s*-/;

// This file contains functions that parse a roam markdown block based on a set of assumptions.

// Roam block example:
// - After a computer or a user is added to an [[Active Directory]] group the computer has to be
//   {c1::rebooted} (if the computer account has been added to the domain group) or a user has to be logged off
//   and on again to update group membership or apply assigned policies.
//   It is necessary because the membership in [[AD Groups]] is updated when a {c1:: [[Kerberos]] ticket} is created,
//   which happens during the system boot and user login. #flashcard {uid: 20200405111533}

const findAllMatchingLines = function (dir) {
  const rg = new RipGrep(tagRegexpForRgFlashcards, dir);
  const matches = rg.json().run().asObject();
  return matches.map((x) => x.data.lines.text);
};

const findMatchingRoamBlocks = function (dir) {
  // console.log("findMatchingRoamBlocks");
  const lines = findAllMatchingLines(dir);
  // console.log(lines);
  var cardObjs = lines.map((l) => blockToClozeUID(l));
  var seen = new Set();
  // Remove dups early, reduce # calls to Anki.
  // Dups can also appear due to roam block references.
  cardObjs = cardObjs.filter(function (c) {
    if (seen.has(c.UID)) {
      console.log(`duplicate ${c.UID}`);
      return false;
    } else {
      seen.add(c.UID);
      return true;
    }
  });
  return cardObjs;
};

const blockToClozeUID = function (block = "") {
  const uid = block.match(uidRegexpI)[1];
  // Convert {c1: lorem} -> {{c1: lorem}}.
  // Remove leading dash.
  // Remove UID.
  // Trip spaces.
  // Remove flashcard tag.
  // TODO: parse out additional tags.
  // TODO: idempotent updates
  const cleanBlockTxt = block
    .replace(clozeMatchRegexp, "{$&}")
    .replace(firstDashRegexp, "")
    .replace(tagRegexpForFlashcards, "")
    .replace(uidRegexpGI, "")
    .trim();
  const resp = { Text: cleanBlockTxt, Extra: "", UID: uid };
  // console.log(resp);
  return resp;
};

module.exports = {
  findMatchingRoamBlocks: findMatchingRoamBlocks,
  blockToClozeUID: blockToClozeUID,
};
