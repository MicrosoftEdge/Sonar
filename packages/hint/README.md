# webhint (`hint`)

<!-- markdownlint-disable MD013 MD033 -->

<p align="center"><img src="https://user-images.githubusercontent.com/1223565/34734522-e0dd1226-f520-11e7-8277-ec0e0a7199c1.png" alt="webhint logo"></p>

<!-- markdownlint-enable -->

## Quick start user guide

Once you have [`Node.js`](https://nodejs.org/en/download/current/)
v8.x on your machine, you can use `npx` or install `webhint` globally
to use it.

### Using `npx`

Run the following command:

```bash
npx hint https://example.com
```

This will start the wizard to create a `.hintrc` file, and then
analyze `https://example.com`.

**Windows users**: Currently [`npx` has an issue in this
platform](https://github.com/npm/npm/issues/17869).

### Installing `webhint` globally

```bash
npm install -g --engine-strict hint
```

Create a `.hintrc` file by running this command and following the
instructions:

```bash
hint --init
```

Scan a website:

```bash
hint https://example.com
```

For more in depth information on how to get started, configurations,
and more, see the online [user guide](https://webhint.io/docs/user-guide/),
or the [local version](./docs/user-guide/index.md)
for the most recent (and unstable) content.

## Contributing to hint

To know more about the internals of `webhint`, the structure of the
project, how to create new hints, collectors, formatters, etc, take a
look at the online [contributor
guide](https://webhint.io/docs/contributor-guide/) (or the [local
version](./docs/contributor-guide/index.md)).

## Code of Conduct

This project adheres to the JS Foundation’s [code of
conduct](https://js.foundation/community/code-of-conduct).
By participating in this project you agree to abide by its terms.

## License

The code is available under the [Apache 2.0 license](LICENSE.txt).
