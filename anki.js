"use strict";
const needle = require("needle");

const ankiConnectAddress = "http://127.0.0.1:8765";

// This file contains functions that interact with AnkiConnect

const callAnkiConnect = function (action, version, params = {}) {
  // console.log(`${action} ${version}`);
  const data = JSON.stringify({ action, version, params });
  return needle("post", ankiConnectAddress, data)
    .then(function (response) {
      const parsed = JSON.parse(response.body);
      if (!parsed.hasOwnProperty("error")) {
        throw "response is missing required error field";
      }
      if (!parsed.hasOwnProperty("result")) {
        throw "response is missing required result field";
      }
      console.log(JSON.stringify(parsed));
      return;
    })
    .catch(function (err) {
      console.log(err);
    });
};

const addNote = function (deckName, modelName, fields = {}, tags = []) {
  const action = "addNote";
  const version = 6;
  const params = {
    note: {
      deckName: deckName,
      modelName: modelName,
      fields: fields,
      options: {
        allowDuplicate: false,
      },
      tags: tags,
    },
  };
  console.log(params);
  callAnkiConnect(action, version, params);
};

const defaultDeckName = "Max Infinity";
const clozeUIDModel = "ClozeUID";
// For this to work, a model named "ClozeUID" must exist in Anki.
// It has three fields: Text, Extra, UID.
// You can easily create this model in Anki by cloning the built-in cloze model and adding a UID field.
// UID field will be used to ensure idempotency when syncing from Roam.
const addUIDCloze = function (fields, tags = []) {
  addNote(
    defaultDeckName,
    clozeUIDModel,
    fields, //{ Text: text, Extra: extra, UID: uid }
    tags
  );
};

module.exports = {
  addNote: addNote,
  addUIDCloze: addUIDCloze,
};
