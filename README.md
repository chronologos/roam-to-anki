# [[`Roam -> Anki Sync`]]

## Summary

This contains code meant to be used with [roam-backup](https://github.com/chronologos/roam-backup) and [Anki](https://ankiweb.net/). `roam-backup` saves your Roam Research into Google Cloud Storage. `Roam -> Anki Sync` reads from Google Cloud Storage and extracts any flashcards you defined into Anki.

### Features

- Any changes in Roam will be synced to Anki, preserving the card's existing review schedule.
- Lightning fast operation thanks to `ripgrep`.
- Unit tests (hey that's a feature for small hacked together projects right?)

## Known Bugs / Feature Requests:

- A note will not sync if it changes in Roam Research in a way that requires the user to manually run tools->empty cards in Anki (e.g. removing a cloze field). Workaround is to do just that and run the tool again.

## Requirements

0. You must install NodeJS, Git, Anki, ripgrep and the AnkiConnect Plugin.
1. You must have have `roam-backup` saving to a Google Cloud Storage bucket `GCS_BUCKET_NAME`.
2. `ripgrep` must be available on `$PATH` (usually this isn't a problem).
3. Create a local `.env` file to define nodejs env variables. See `Usage` section for what is expected there.
4. Create a new model in Anki called `ClozeUID` with 3 fields: `{ Text: text, Extra: extra, UID: uid }`. Easiest way is to clone the existing `Cloze` model and add a `UID` field. This field is used for idempotency.
5. AnkiConnect should be available on `http://127.0.0.1:8765`.

## Usage

This program expects some Node environment variables to be present. To provide them, create a `.env` file following the example below:

```
GCS_BUCKET_NAME="some-roam-backup"
GCS_SERVICEACCOUNT_KEYFILE="./key.json"
DEFAULT_DECK="Some Deckname"
ANKI_CONNECT_URL="http://127.0.0.1:8765"
```

`GCS_SERVICEACCOUNT_KEYFILE` can be omitted if using application default credentials.

`npm start` will do a one-time sync from Roam to Anki.

## Authenticating to GCS

1. If you have gCloud installed, you can run `gcloud auth application-default login`.
2. Otherwise, go to Google Cloud Console, download your service account keyfile and define add it to your `.env` file.
