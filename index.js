"use strict";
require("dotenv").config();

const needle = require("needle");
const unzipper = require("unzipper");
const fs = require("fs");
const path = require("path");
const { Storage } = require("@google-cloud/storage");
const anki = require("./anki.js");
const parse = require("./parse.js");

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
  const f = await data[0].reduce(getLatestFile);
  console.log(f.metadata.name);
  await f.download({ destination: "./latest.zip" });
  await fs.mkdir("./temp", (err) => {
    if (err) console.log(err);
  });
  return fs
    .createReadStream("./latest.zip")
    .pipe(unzipper.Extract({ path: "./temp" }))
    .promise();
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
    await listBucket();
    const blocks = await parse.findMatchingRoamBlocks();
    console.log(blocks);
    for (const b of blocks) {
      console.log(b);
      anki.addUIDCloze(b);
    }
  } catch (err) {
    console.log(err);
  }
};

main();
