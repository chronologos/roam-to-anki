"use strict";
const needle = require("needle");

// This file contains functions that interact with AnkiConnect
const ankiConnectAddress = process.env.ANKI_CONNECT_URL;
const ankiCardNotFoundError = "card not found";
const defaultDeckName = process.env.DEFAULT_DECK;
const clozeUIDModel = "ClozeUID";
// For this to work, a model named "ClozeUID" must exist in Anki.
// It has three fields: Text, Extra, UID.
// You can easily create this model in Anki by cloning the built-in cloze model and adding a UID field.
// UID field will be used to ensure idempotency when syncing from Roam.

const callAnkiConnect = async function (action, version, params = {}) {
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
      console.log(`resp from anki for ${action}: ${JSON.stringify(parsed)}`);
      return parsed;
    })
    .catch(function (err) {
      console.log(`error; ${err}`);
    });
};

// Use ClozeUID model's UID field to find the note ID's of matching notes.
// Barring user error, there should only be one match.
const findNoteByUID = async function (uid) {
  const action = "findNotes";
  const version = 6;
  const params = {
    query: `UID:${uid}`,
  };

  return callAnkiConnect(action, version, params).then(function (resp) {
    if (resp["result"] && resp["result"].length == 0) {
      return undefined;
    }
    const cardID = resp.result[0];
    return cardID;
  }).catch(function (err){
    console.log(`error; ${err}`);
  });
};

const addNote = async function (deckName, modelName, fields = {}, tags = []) {
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
  // console.log(params);
  return callAnkiConnect(action, version, params);
};

const updateNote = async function (noteID, fields = {}) {
  const action = "updateNoteFields";
  const version = 6;
  const params = {
    note: {
      id: `${noteID}`,
      fields: fields,
    },
  };
  return callAnkiConnect(action, version, params);
};

const addUIDCloze = async function (fields, tags = []) {
  const uid = fields.UID;
  const noteID = await findNoteByUID(uid);
  if (noteID != undefined) {
    console.log(`found existing note ${noteID}!`);
    updateNote(noteID, fields);
    return;
  }
  addNote(
    defaultDeckName,
    clozeUIDModel,
    fields, //{ Text: text, Extra: extra, UID: uid }
    tags
  );
};

const sync = async function () {
  callAnkiConnect("sync", 6)
}

module.exports = {
  addNote: addNote,
  addUIDCloze: addUIDCloze,
  sync: sync,
};
