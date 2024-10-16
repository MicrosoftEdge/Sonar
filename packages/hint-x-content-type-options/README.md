# Use `X-Content-Type-Options` header (`x-content-type-options`)

`x-content-type-options` requires that all resources are
served with the `X-Content-Type-Options: nosniff`
HTTP response header.

## Why is this important?

Sometimes the metadata browsers need to know how to interpret the
content of a resource is either incorrect, not reliable, or absent.
In those cases, browsers use contextual clues that inspect the bytes
of the response to detect the file format. This is known as [MIME
sniffing][mime sniffing spec] and it is done regardless of the specified
`Content-Type` HTTP header sent by servers.

For example, if a browser requests a script, but that script is served
with an incorrect media type (e.g. `x/x`), the browser will still detect
the script and execute it.

While content sniffing can be beneficial, it can also expose the web
site/app to attacks based on MIME-type confusion leading to security
problems, especially in the case of servers hosting untrusted content.

Fortunately, browsers provide a way to opt-out of MIME sniffing by
using the `X-Content-Type-Options: nosniff` HTTP response header.

Going back to the previous example, if the `X-Content-Type-Options: nosniff`
header is sent for the script and the browser detects that it’s a script
and it wasn’t served with one of the [JavaScript media types][javascript
media types], the script will be blocked.

While [modern browsers respect the header mainly for scripts and
stylesheets][fetch spec blocking], [Chromium uses this response header on
other resources][chromium ssca] for
[Cross-Origin Read Blocking][chromium corb].

## What does the hint check?

The hint checks if all resources are served with the
`X-Content-Type-Options` HTTP headers with the value of `nosniff`.

### Examples that **trigger** the hint

Resource is not served with the
`X-Content-Type-Options` HTTP header.

```text
HTTP/... 200 OK

...

Content-Type: image/png
```

Script is served with the `X-Content-Type-Options` HTTP header
with the invalid value of `no-sniff`.

```text
HTTP/... 200 OK

...
Content-Type: text/javascript; charset=utf-8
X-Content-Type-Options: no-sniff
```

### Examples that **pass** the hint

Script is served with the `X-Content-Type-Options` HTTP header
with the valid value of `nosniff`.

```text
HTTP/... 200 OK

...
Content-Type: text/javascript; charset=utf-8
X-Content-Type-Options: nosniff
```

## How to configure the server to pass this hint

<details><summary>How to configure Apache</summary>

Apache can be configured to add headers using the [`Header`
directive][header directive].

```apache
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
</IfModule>
```

Note that:

* The above snippet works with Apache `v2.2.0+`, but you need to have
  [`mod_headers`][mod_headers] [enabled][how to enable apache modules]
  for it to take effect.

* If you have access to the [main Apache configuration file][main
  apache conf file] (usually called `httpd.conf`), you should add
  the logic in, for example, a [`<Directory>`][apache directory]
  section in that file. This is usually the recommended way as
  [using `.htaccess` files slows down][htaccess is slow] Apache!

  If you don't have access to the main configuration file (quite
  common with hosting services), add the snippets in a `.htaccess`
  file in the root of the web site/app.

For the complete set of configurations, not just for this rule, see
the [Apache server configuration related documentation][apache config].

</details>

<details>

<summary>How to configure IIS</summary>

You can add this header unconditionally to all responses.

```xml
<configuration>
     <system.webServer>
        <httpProtocol>
            <customHeaders>
                <add name="X-Content-Type-Options" value="nosniff" />
            </customHeaders>
        </httpProtocol>
    </system.webServer>
</configuration>
```

Note that:

* The above snippet works with IIS 7+.
* You should use the above snippet in the `web.config` of your
  application.

For the complete set of configurations, not just for this rule,
see the [IIS server configuration related documentation][iis config].

</details>

<details>

<summary>How to configure NGINX</summary>

You can add this header unconditionally to all responses.

```nginx
add_header X-Content-Type-Options nosniff always;
```

</details>

## How to use this hint?

This package is installed automatically by webhint:

```bash
npm install hint --save-dev
```

To use it, activate it via the [`.hintrc`][hintrc] configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "x-content-type-options": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Further Reading

* [`X-Content-Type-Options` header](https://fetch.spec.whatwg.org/#x-content-type-options-header)
* [Reducing MIME type security risks](https://msdn.microsoft.com/en-us/library/gg622941.aspx)
* [Mitigating MIME Confusion Attacks in Firefox](https://blog.mozilla.org/security/2016/08/26/mitigating-mime-confusion-attacks-in-firefox/)
* [Script Polyglots](https://blogs.msdn.microsoft.com/ieinternals/2014/11/24/script-polyglots/)
* [IE8 Security Part V: Comprehensive Protection](https://blogs.msdn.microsoft.com/ie/2008/07/02/ie8-security-part-v-comprehensive-protection/)

<!-- Link labels: -->

[chromium corb]: https://chromium.googlesource.com/chromium/src/+/master/services/network/cross_origin_read_blocking_explainer.md
[chromium ssca]: https://www.chromium.org/Home/chromium-security/ssca
[fetch spec blocking]: https://fetch.spec.whatwg.org/#should-response-to-request-be-blocked-due-to-nosniff%3F
[fetch spec issue]: https://github.com/whatwg/fetch/issues/395
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[javascript media types]: https://html.spec.whatwg.org/multipage/scripting.html#javascript-mime-type
[mime sniffing spec]: https://mimesniff.spec.whatwg.org/

<!-- Apache links -->

[apache config]: https://webhint.io/docs/user-guide/server-configurations/apache/
[apache directory]: https://httpd.apache.org/docs/current/mod/core.html#directory
[header directive]: https://httpd.apache.org/docs/current/mod/mod_headers.html#header
[how to enable apache modules]: https://github.com/h5bp/server-configs-apache/tree/7eb30da6a06ec4fc24daf33c75b7bd86f9ad1f68#enable-apache-httpd-modules
[htaccess is slow]: https://httpd.apache.org/docs/current/howto/htaccess.html#when
[main apache conf file]: https://httpd.apache.org/docs/current/configuring.html#main
[mod_headers]: https://httpd.apache.org/docs/current/mod/mod_headers.html

<!-- IIS links -->

[iis config]: https://webhint.io/docs/user-guide/server-configurations/iis/
