# [[`Roam -> Anki Sync`]]

## Summary
This contains code meant to be used with [roam-backup](https://github.com/chronologos/roam-backup) and [Anki](https://ankiweb.net/). `roam-backup` saves your Roam Research into Google Cloud Storage. `Roam -> Anki Sync` reads from Google Cloud Storage and extracts any flashcards you defined into Anki.

## Requirements
0. You must install NodeJS,  Git, Anki, ripgrep and the AnkiConnect Plugin.
3. You must have have `roam-backup` saving to a Google Cloud Storage bucket `GCS_BUCKET_NAME`.
4. `ripgrep` must be available on `$PATH` (usually this isn't a problem).
5. Create a local `.env` file to define nodejs env variables.

## Usage

`.env` file will look like this:
```
GCS_BUCKET_NAME="some-bucket-for-backups"
GCS_SERVICEACCOUNT_KEYFILE="./some-keyfile.json"
```

`npm start` will do a one-time sync.

## Authenticating to GCS
1. If you have gCloud installed, you can run `gcloud auth application-default login`. 
2. Otherwise, go to Google Cloud Console, download your service account keyfile and define add it to your `.env` file.
