"use strict";
require("dotenv").config();

const needle = require("needle");
const unzipper = require("unzipper");
const fs = require("fs");
const path = require("path");
const { Storage } = require("@google-cloud/storage");
const anki = require("./anki.js");
const parse = require("./parse.js");
const tempDir = "./temp";

const listBucket = async function () {
  var storage = new Storage();
  if (process.env.GCS_SERVICEACCOUNT_KEYFILE) {
    fs.readFile(process.env.GCS_SERVICEACCOUNT_KEYFILE, "utf8", function (
      err,
      data
    ) {
      if (err) throw err;
      storage = new Storage(data);
    });
  }
  const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
  const data = await bucket.getFiles();
  const f = data[0].reduce(getLatestFile);
  await f.download({ destination: "./latest.zip" });
  await fs.mkdir(tempDir, (err) => {
    if (err) console.log(err);
  });
  return unzipper.Open.file("./latest.zip")
    .then(function (d) {
      return d.extract({ path: path.join(__dirname, "temp"), concurrency: 10 });
    })
    .catch((err) => console.log(err));
};

const getLatestFile = (latestFile, currentFile) => {
  if (
    Date.parse(currentFile.metadata.timeCreated) >
    Date.parse(latestFile.metadata.timeCreated)
  ) {
    return currentFile;
  }
  latestFile;
};

const main = async function () {
  try {
    await anki.sync();
    await listBucket().then((d) => console.log(d));
    const blocks = parse.findMatchingRoamBlocks(tempDir);
    for (const b of blocks) {
      console.log(b);
      await anki.addUIDCloze(b);
    }
  } catch (err) {
    console.log(err);
  }
};

main();
