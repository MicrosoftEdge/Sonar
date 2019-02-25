# 2.1.4 (February 22, 2019)

## Bug fixes / Improvements

* [[`44674e9c44`](https://github.com/webhintio/hint/commit/44674e9c4479cb3f3e3c2e66173437c74481f487)] - Fix: Refactor for file name convention (#1861) (by [`Karan Sapolia`](https://github.com/karansapolia) / see also: [`#1748`](https://github.com/webhintio/hint/issues/1748)).
* [[`b673efd377`](https://github.com/webhintio/hint/commit/b673efd3771887148dc91252fbe8314fed3656a0)] - Fix: Remove runtime `typescript` dependency (by [`Tony Ross`](https://github.com/antross) / see also: [`#1852`](https://github.com/webhintio/hint/issues/1852)).


# 2.1.3 (February 7, 2019)

## Bug fixes / Improvements

* [[`36b564624c`](https://github.com/webhintio/hint/commit/36b564624c0f899987d1b9dd84185899e592dfb9)] - Fix: Report inherited errors at `extends` location (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1717`](https://github.com/webhintio/hint/issues/1717)).


# 2.1.2 (January 15, 2019)

## Bug fixes / Improvements

* [[`e90f410556`](https://github.com/webhintio/hint/commit/e90f410556c817012e7667c8f4f0e27b14d91bd2)] - Fix: Improve feedback when config is invalid (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#1526`](https://github.com/webhintio/hint/issues/1526)).


# 2.1.1 (January 2, 2019)

## Bug fixes / Improvements

* [[`1ebd8a9a58`](https://github.com/webhintio/hint/commit/1ebd8a9a584151d2ee62641b7b1ce1d40099bd00)] - Fix: Update tsconfig schema (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#1487`](https://github.com/webhintio/hint/issues/1487)).
* [[`1fb8024b57`](https://github.com/webhintio/hint/commit/1fb8024b57f94552303258ab31b11d8d6de8a415)] - Docs: Fix some links (by [`Jesus David García Gomez`](https://github.com/sarvaje)).
* [[`c412f9aa7b`](https://github.com/webhintio/hint/commit/c412f9aa7ba99eb7ef6c20b7c496d629530f3ecf)] - Docs: Fix reference links and remove `markdownlint-cli` dependency (#1566) (by [`Antón Molleda`](https://github.com/molant)).


# 2.1.0 (November 28, 2018)

## Bug fixes / Improvements

* [[`009db779bc`](https://github.com/webhintio/hint/commit/009db779bc4a8e7b8ba413deb5f6b21590b294f0)] - Fix: Add types to tests (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#1517`](https://github.com/webhintio/hint/issues/1517)).

## New features

* [[`d40a0abad0`](https://github.com/webhintio/hint/commit/d40a0abad01c750174fbb5e41a6168feae5d4fea)] - New: Allow hint metadata to be imported separately (by [`Tony Ross`](https://github.com/antross)).


# 2.0.0 (November 5, 2018)

## Breaking Changes

* [[`931f70cb99`](https://github.com/webhintio/hint/commit/931f70cb99505cdb2ff8d9f7144714c243cda97b)] - Breaking: Update `parser-typescript-config` to `v2.0.0` [skip ci] (by [`Cătălin Mariș`](https://github.com/alrra)).
* [[`64cef0cc48`](https://github.com/webhintio/hint/commit/64cef0cc48d77a70df196fdb3a96eb1d33f1ea32)] - Breaking: Update `utils-tests-helpers` to `v2.0.0` [skip ci] (by [`Cătălin Mariș`](https://github.com/alrra)).
* [[`59e5b9ade4`](https://github.com/webhintio/hint/commit/59e5b9ade47698d9bae42106cd93606a451b5a56)] - Breaking: Update `hint` to `v4.0.0` [skip ci] (by [`Cătălin Mariș`](https://github.com/alrra)).
* [[`0e82bcad9b`](https://github.com/webhintio/hint/commit/0e82bcad9bd5fb3626bf68d94278b89d685b46c7)] - Breaking: Change `context.report` to take an `options` object (by [`Tony Ross`](https://github.com/antross) / see also: [`#1415`](https://github.com/webhintio/hint/issues/1415)).
* [[`8499d5ca65`](https://github.com/webhintio/hint/commit/8499d5ca6519d859d81d5126cfd9886bee5d3091)] - Breaking: Rename `parse::*::end`, etc. to `parse::end::*` (by [`Tony Ross`](https://github.com/antross) / see also: [`#1397`](https://github.com/webhintio/hint/issues/1397)).
* [[`d181168807`](https://github.com/webhintio/hint/commit/d18116880733897793628f0a8e829de941531d18)] - Breaking: Use typed event registration and dispatch (by [`Tony Ross`](https://github.com/antross) / see also: [`#123`](https://github.com/webhintio/hint/issues/123)).


# 1.1.2 (October 31, 2018)

## Bug fixes / Improvements

* [[`3c81bfb673`](https://github.com/webhintio/hint/commit/3c81bfb673dff06d518dcd829e9df793f33b342a)] - Docs: Update broken links (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1459`](https://github.com/webhintio/hint/issues/1459)).


# 1.1.1 (September 21, 2018)

## Bug fixes / Improvements

* [[`11e792b4af`](https://github.com/webhintio/hint/commit/11e792b4af558362b43fec08b6825a60dae55f1f)] - Fix: Scope `tslib` check to only run if `.tsconfig` exists (by [`Tony Ross`](https://github.com/antross) / see also: [`#1330`](https://github.com/webhintio/hint/issues/1330)).


# 1.1.0 (September 11, 2018)

## New features

* [[`0766455f1c`](https://github.com/webhintio/hint/commit/0766455f1c0ff9e4cfae7f8f6d2a57c661fae9c1)] - New: Add location (line/column) information for JSON (by [`Tony Ross`](https://github.com/antross) / see also: [`#1297`](https://github.com/webhintio/hint/issues/1297)).


# 1.0.2 (September 6, 2018)

## Bug fixes / Improvements

* [[`7cde2e145d`](https://github.com/webhintio/hint/commit/7cde2e145d247ea2dd0a42cbf2aa3a601b223a88)] - Fix: Make `npm` package not include `npm-shrinkwrap.json` file (by [`Cătălin Mariș`](https://github.com/alrra) / see also: [`#1294`](https://github.com/webhintio/hint/issues/1294)).


# 1.0.1 (August 10, 2018)

## Bug fixes / Improvements

* [[`ee5481d880`](https://github.com/webhintio/hint/commit/ee5481d880f3458b42748243346f55c6fdd2b600)] - Docs: Add missing commas (by [`Bruno Vinicius Figueiredo dos Santos`](https://github.com/IAmHopp)).
* [[`7aa21790f9`](https://github.com/webhintio/hint/commit/7aa21790f91552124a553213f655bfb017ae43fe)] - Docs: Fix typos and make minor improvements (by [`Bruno Vinicius Figueiredo dos Santos`](https://github.com/IAmHopp)).
* [[`0b43fb026f`](https://github.com/webhintio/hint/commit/0b43fb026f8d2c4c00c731c4c90b332ad6192819)] - Docs: Fix typos and make minor improvements (by [`Bruno Vinicius Figueiredo dos Santos`](https://github.com/IAmHopp)).


# 1.0.0 (August 6, 2018)

✨
