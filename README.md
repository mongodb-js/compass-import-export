# Compass Import/Export Plugin [![][travis_img]][travis_url]

> mongoimport and mongoexport functionality in [Compass][compass].

## Development

```bash
DEBUG=mongo* npm start
```

## Testing

```bash
npm test
```

### Test Cases

#### `compass-data-sets:crimedb.incidents`

We should be able to export this and import it back without losing anything. If I export it with the current Compass it only exports ~115k docs.

#### `compass-data-sets:test.people`

Small but contains arrays and _id is a UUID

#### `compass-data-sets:test.people_missing_fields`

Small but not all documents contain all the fields

## License

Apache 2.0

[travis_img]: https://travis-ci.org/mongodb-js/compass-import-export.svg?branch=master
[travis_url]: https://travis-ci.org/mongodb-js/compass-import-export
[compass]: https://github.com/mongodb-js/compass
