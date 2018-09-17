# webhint

[![Greenkeeper badge](https://badges.greenkeeper.io/webhintio/hint.svg)](https://greenkeeper.io/)

<!-- markdownlint-disable MD013 MD033 -->

<a href="https://travis-ci.org/webhintio/hint"><img src="https://travis-ci.org/webhintio/hint.svg?branch=master" alt="Travis CI Build Status"></a> <a href="https://ci.appveyor.com/project/NellieTheNarwhal/hint"><img src="https://ci.appveyor.com/api/projects/status/8rkglhr41pwao9pd?svg=true" alt="AppVeyor Build Status"></a> <a href="https://gitter.im/webhintio/Lobby"><img src="https://badges.gitter.im/Join%20Chat.svg" alt="Gitter"></a>

<!-- markdownlint-enable -->

## Quick start user guide

Once you have [`Node.js`][node] v8.x on your machine, you can use
[`npx`][npx] or install `hint` globally to use it.

### Using `npx`

Run the following command:

```bash
npx hint https://example.com
```

This will analyze `https://example.com` using the default configuration.

### Installing `webhint` globally

```bash
npm install -g --engine-strict hint
```

Create a `.hintrc` file by running this command and following the
instructions:

```bash
npm create hintrc
```

Scan a website:

```bash
hint https://example.com
```

To use a different formatter than the one specified in your `.hintrc`
file you can do the following:

```bash
hint https://example.com --formatters excel
```

To use a different hint than the one specified in your `.hintrc` file:

```bash
hint https://example.com --hints html-checker
```

Multiple hints can be specified as a comma sepreated string:

```bash
hint https://example.com --hints axe,html-checker
```

For more in depth information on how to get started, configurations,
and more, see the online [user guide][user guide], or the [local
version][local user guide] for the most recent (and unstable) content.

## Contributing to webhint

To know more about the internals of `webhint`, the structure of the
project, how to create new hints, collectors, formatters, etc, take
a look at the online [contributor guide][contributor guide] (or the
[local version][local contributor guide]).

## Code of Conduct

This project adheres to the JS Foundation’s [code of conduct][coc].
By participating in this project you agree to abide by its terms.

## License

The code is available under the [Apache 2.0 license][license].

<!-- Link labels: -->

[coc]: https://js.foundation/community/code-of-conduct
[contributor guide]: https://webhint.io/docs/contributor-guide/
[local contributor guide]: ./packages/hint/docs/contributor-guide/index.md
[local user guide]: ./packages/hint/docs/user-guide/index.md
[node]: https://nodejs.org/en/download/current/
[npx]: https://github.com/zkat/npx
[user guide]: https://webhint.io/docs/user-guide/
[license]: LICENSE.txt
