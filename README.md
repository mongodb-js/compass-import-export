# Compass Import/Export Plugin [![][travis_img]][travis_url]

> [mongoimport][mongoimport] and [mongoexport][mongoexport] functionality in [Compass][compass].

## Development

After cloning this repository and running `npm install`, you can try this plugin with a real MongoDB Server in electron by running:

```bash
DEBUG=mongo* npm start
```

You can also utilize [Storybook](https://storybook.js.org/) when developing components:

```bash
npm run storybook;
```

### Code Tour

- `./examples` - Storybook stories
- `./test` - Test fixture file
- `./src/utils` - Small, well-tested modules that do heavy lifting
- `./src/modules` - Redux action creators+handlers that glue `./src/utils/*`
- `./src/components` - React components
- `./src/components/{import,export}-modal` - React HOC's components

### Debugging

We use [`debug`](https://npm.im/debug) so just set `DEBUG=mongo*` to get nice, grouped, colorized logging.

## Testing

```bash
npm test
```

Test fixture files are included in the `./test` directory.

## Contributing

- [Try to break things/force errors](#errors)
- Implement your idea or [use our running list of neat things below for inspiration](#ideas)
- Open question issues for unclear documentation or module design
- Adding missing JS doc anywhere

### Errors

Yay! We love finding new edge cases.

For import parsing:

1. Add your source file (eg `.json`) to [./test](https://github.com/mongodb-js/compass-import-export/tree/master/test)
2. Add a test to [parsers spec](https://github.com/mongodb-js/compass-import-export/blob/master/src/utils/parsers.spec.js#L40) that includes a failing test describing the behavior you are expecting

### Ideas

- [ ] Refactor src/modules/ so import and export reuse a common base
- [ ] Import and Export: Show system notification when operation completes. like dropbox screenshot message.
- [ ] Import csv: dynamicTyping of values like papaparse
- [ ] Import csv: mapHeaders option to support existing .<bson_type>() caster like [mongoimport does today][mongoimport]
- [ ] Import: expose finer-grained bulk op results in progress
- [ ] Import: define import mode: insert, upsert, merge
- [ ] Import: option to specify a different path for `_id` such as `business_id` in the yelp dataset
- [ ] Import: Paste URL to fetch from
- [ ] Import: multi file import via archive (supports gzip/zip/bzip2/etc.)
- [ ] Import: option for path to pass to JSONStream for nested docs (e.g. `results` array when fetching JSON from a rest api)
- [ ] Import: Option to drop target collection before import
- [ ] Import: Drop file target in modal
- [ ] Export: use electron add to destination file to [recent documents](https://electronjs.org/docs/tutorial/recent-documents)

## License

Apache 2.0

[travis_img]: https://travis-ci.org/mongodb-js/compass-import-export.svg?branch=master
[travis_url]: https://travis-ci.org/mongodb-js/compass-import-export
[compass]: https://github.com/mongodb-js/compass
[mongoimport]: https://docs.mongodb.com/manual/reference/program/mongoimport
[mongoexport]: https://docs.mongodb.com/manual/reference/program/mongoexport
