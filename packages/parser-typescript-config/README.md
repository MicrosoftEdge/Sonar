# TypeScript config (`@hint/parser-typescript-config`)

The `typescript-config` parser allows the user to analyze the
TypeScript configuration in their projects.

To use it you will have to install it via `npm`:

```bash
npm install @hint/parser-typescript-config
```

Note: You can make `npm` install it as a `devDependency` using the
`--save-dev` parameter, or to install it globally, you can use the
`-g` parameter. For other options see [`npm`'s
documentation](https://docs.npmjs.com/cli/install).

And then activate it via the [`.hintrc`][hintrc] configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        ...
    },
    "parsers": ["typescript-config"],
    ...
}
```

This parser detect if a TypeScript configuration file is present in
your project, checking the name of the file (i.e. `tsconfig.json`,
`tsconfig.developement.json`). This parser detects if a config file
has a valid content.

## Events emitted

This `parser` emits the following events:

* `parse::start::typescript-config`, of type `TypeScriptConfigParseStart`
  which contains the following information:

  * `resource`: the resource we are going to parse.

* `parse::end::typescript-config`, of type `TypeScriptConfigParse`
  which contains the following information:

  * `resource`: the parsed resource.
  * `config`: an object with a valid configuration (`TypeScriptConfig`).

* `parse::error::typescript-config::json`, of type `TypeScriptConfigInvalidJSON`
  which contains the following information:

  * `resource`: the parsed resource.
  * `error`: the error emited parsing the configuration file.

* `parse::error::typescript-config::cicular`, of type `TypeScriptConfigInvalidJSON`
  which contains the following information:

  * `resource`: the parsed resource.
  * `error`: the error emited parsing the configuration file.

* `parse::error::typescript-config::extends`, of type `TypeScriptConfigInvalidJSON`
  which contains the following information:

  * `resource`: the parsed resource.
  * `error`: the error emited parsing the configuration file.

* `parse::error::typescript-config::schema`, of type
  `TypeScriptConfigInvalidSchema` which contains the following information:

  * `resource`: the parsed resource.
  * `errors`: all the errors that the schama validator returns.

## Types

If you need to import any type or enum defined in this parser, you
need to import them as follows:

```ts
import { TypeOrEnumYouWantToUse } from '@hint/parser-typescript-config';
```

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
