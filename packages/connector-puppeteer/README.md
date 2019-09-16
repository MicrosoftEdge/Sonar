# Puppeteer (`@hint/connector-puppeteer`)

A connector that uses [puppeteer][puppeteer]
to communicate with the browsers in `webhint`.

## Installation

First, you need to install [`webhint`](https://webhint.io/):

```bash
npm install hint
```

Then, install the new connector:

```bash
npm install @hint/connector-puppeteer
```

## Usage

Configure the connector name in your [`.hintrc`][hintrc]
configuration file:

```json
{
    "connector": {
        "name": "puppeteer"
    },
    ...
}
```

## Options

The set of settings supported by the Puppeteer connector are:

```json
{
    "connector": {
        "name": "puppeteer",
        "options": {
            "auth": AuthObject,
            "browser": "chrome|chromium|edge",
            "ignoreHTTPSErrors": true|false,
            "puppeteerOptions": "object",
            "waitUntil": "dom|loaded|networkidle0|networkidle2"
        }
    },
    ...
}
```

All properties of `options` are optional.

* `auth`: The credentials and elements to authenticate on a website.
  See next section for further details.
* `browser (chrome|chromium|edge)`: Tells the preferred browser to
  use. Webhint will search the executable for the given one and fail
  if it does not find one. Keep in mind that not all browsers are
  available in all platforms and that you need to **manually install
  the browser**.
* `ignoreHTTPSError (boolean)`: Indicates if errors with certificates
  should be ignored. Use this when checking self-signed certificates.
  It is `false` by default.
* `puppeteerOptions (object)`: A set of launch options to pass to
  puppeteer. See the [puppeteer launch options][puppeteer launch
  options] for more information.
* `waitUntil (dom|loaded|networkidle0|networkidle2)`: Is the waiting
  strategy to decide when a page is considered loaded. See the
  [puppeteer goto options][puppeteer goto options] to know more.

### Website authentication

The `puppeteer` connector allows to authenticate on a website that
supports Basic HTTP Authentication or:

* uses user/password (i.e.: no MFA or captcha).
* redirects to the login page and to the initial target after successful
  authentication.

For Basic Authentication the `auth` object properties are:

* `user`: a `string` with the user name to use
* `password`: a `string` with the password to use

E.g.:

```json
{
    "user": "userName",
    "password": "Passw0rd"
}
```

Otherwise, `auth` properties are:

* `user`: the information needed to identify the `input` element via
  a query `selector` (e.g.: `#login`) to type the `value` for the
  username in (e.g.: `username1`).
* `password`: the information needed to identify the `input` element via
  a query `selector` (e.g.: `#password`) to type the `value` for the
  password in (e.g.: `P@ssw0rd`).
* `next`: the information needed to identify the `input` (or `button`)
  element via a query `selector` (e.g.: `input[type="submit"]`) to `click`
  to get to the next step of the authentication process. This is an
  optional property as not all services prompt first for the user name
  before asking for the password in the following screen. An example of
  such a service would be Azure Pipelines.
* `submit`: the information needed to identify the `input` (or `button`)
  element via a query `selector` (e.g.: `input[type="submit"]`) to `click`
  to submit the crendentials.

E.g.:

```json
{
    "user": {
        "selector": "string",
        "value": "string"
    },
    "password": {
        "selector": "string",
        "value": "string"
    },
    "next": {
        "selector": "string"
    },
    "submit": {
        "selector": "string"
    }
}
```

## Further Reading

* [Connectors][connectors]

<!-- Link labels: -->

[connectors]: https://webhint.io/docs/user-guide/concepts/connectors/
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[puppeteer]: https://pptr.dev/
[puppeteer goto options]: https://pptr.dev/#?product=Puppeteer&version=master&show=api-pagegotourl-options
[puppeteer launch options]: https://pptr.dev/#?product=Puppeteer&version=master&show=api-puppeteerlaunchoptions
