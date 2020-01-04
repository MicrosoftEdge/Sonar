# 1.5.1 (December 3, 2019)


# 1.5.0 (December 2, 2019)

## New features

* [[`618e13aaf7`](https://github.com/webhintio/hint/commit/618e13aaf7e3ce863a3b539ee1e2f78743bcae93)] - New: Add 28-day retention telemetry.
* [[`a7278f2f78`](https://github.com/webhintio/hint/commit/a7278f2f78edb07df5e610c3b207c3b779ec1f2b)] - New: More severities and threshold in schema (see also: [`#3065`](https://github.com/webhintio/hint/issues/3065)).

## Bug fixes / Improvements

* [[`24f54fd854`](https://github.com/webhintio/hint/commit/24f54fd8547d47fe38195109b4b42d1b0aafe22b)] - Fix: Add getUserConfig to the try/catch block (see also: [`#3386`](https://github.com/webhintio/hint/issues/3386)).
* [[`d22e46d316`](https://github.com/webhintio/hint/commit/d22e46d3162ec8563d670ee9b38c2577f9da7b97)] - Docs: Improve VS Code readme and take it out of preview (see also: [`#1537`](https://github.com/webhintio/hint/issues/1537)).
* [[`7e77a1349e`](https://github.com/webhintio/hint/commit/7e77a1349e5e2e7f90da75ad1380af32e6838acc)] - Fix: Stability issues with VS Code extension.
* [[`1c6e51b831`](https://github.com/webhintio/hint/commit/1c6e51b8315ee168db26ea774b1214326f968477)] - Fix: Use VS Code language ID to reduce file type telemetry noise (see also: [`#3289`](https://github.com/webhintio/hint/issues/3289)).

## Chores

* [[`ff322d374c`](https://github.com/webhintio/hint/commit/ff322d374c352f415dca23ac63790c9349fe30da)] - Upgrade: Bump @types/node from 12.12.7 to 12.12.12.
* [[`422fd3f4f6`](https://github.com/webhintio/hint/commit/422fd3f4f6a63027eb8d16d0e8527a67ee722230)] - Upgrade: Bump vsce from 1.68.0 to 1.69.0.
* [[`f044c9b5a1`](https://github.com/webhintio/hint/commit/f044c9b5a1ef400ab50a6065cea7a8c9758db8bc)] - Chore: Update references to old methods/types in hint.
* [[`2c60ff85bd`](https://github.com/webhintio/hint/commit/2c60ff85bd9f8e5f8f6b17c4bb05cb61b9d219ea)] - Chore: Change unreleased packages version to 0.0.1.
* [[`5ef883ef1d`](https://github.com/webhintio/hint/commit/5ef883ef1d9f6eb8fc1e229c211182d441cb4a98)] - Upgrade: Bump eslint from 6.5.1 to 6.6.0.
* [[`9142edc7d3`](https://github.com/webhintio/hint/commit/9142edc7d362bfa44c3f5acab05ef44e52184143)] - Upgrade: Bump eslint-plugin-markdown from 1.0.0 to 1.0.1.
* [[`e6e47c71ca`](https://github.com/webhintio/hint/commit/e6e47c71ca029bb01ffba6b8560365b995d6616d)] - Upgrade: Bump webpack from 4.39.3 to 4.41.2.
* [[`c901412e50`](https://github.com/webhintio/hint/commit/c901412e5092a77b453400a56612a0460acc1893)] - Chore: Remap VS Code severity.
* [[`3f9aec8a79`](https://github.com/webhintio/hint/commit/3f9aec8a798170c3d14309dffd8bb80834ee2817)] - Chore: Use shared instrumentation key in VS Code.
* [[`8b1803a77d`](https://github.com/webhintio/hint/commit/8b1803a77debd7010807ba17c21a2419ef455b69)] - Upgrade: Bump webpack-cli from 3.3.9 to 3.3.10.
* [[`97bb31d0fa`](https://github.com/webhintio/hint/commit/97bb31d0fafb53572220cd647bb493716587ca2b)] - Chore: Update references to the new @hint/utils-types.


# 1.4.1 (October 30, 2019)

## Bug fixes / Improvements

* [[`e78e12b04b`](https://github.com/webhintio/hint/commit/e78e12b04beff09f5734b679a67b725a0d348b62)] - Fix: Include TypeScript in shared install.


# 1.4.0 (October 29, 2019)

## New features

* [[`e400f4a6e2`](https://github.com/webhintio/hint/commit/e400f4a6e2f85c072ced260181b1162681c89d39)] - New: Activate for TypeScript and TSX files (by [`Tony Ross`](https://github.com/antross)).
* [[`de43df9bbd`](https://github.com/webhintio/hint/commit/de43df9bbd2178c6ae7d40156f485193a9b5218c)] - New: Allow ranged locations in CSS (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#3130`](https://github.com/webhintio/hint/issues/3130)).
* [[`fac5cb2a10`](https://github.com/webhintio/hint/commit/fac5cb2a108fa0206dbd30fb2f310497fbb39bb3)] - New: Register to analyze JSX files (by [`Tony Ross`](https://github.com/antross)).

## Chores

* [[`6fdc164013`](https://github.com/webhintio/hint/commit/6fdc164013359ecf012fb9dcd5c0ef9ed5aca192)] - Upgrade: Bump @types/sinon from 7.0.13 to 7.5.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`ce965513ae`](https://github.com/webhintio/hint/commit/ce965513ae2b715881d4f7891e795c046579f0d5)] - Upgrade: Bump ava from 1.4.1 to 2.4.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview) / see also: [`#3022`](https://github.com/webhintio/hint/issues/3022)).
* [[`b8ba2e17cd`](https://github.com/webhintio/hint/commit/b8ba2e17cdca7fccfd274b2ba250a96329b23fe8)] - Upgrade: Bump sinon from 7.4.2 to 7.5.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`0d0466efff`](https://github.com/webhintio/hint/commit/0d0466efff7915f2ff929e0e85223841178eaac0)] - Upgrade: Bump typescript from 3.6.3 to 3.6.4 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`a9bd8358bd`](https://github.com/webhintio/hint/commit/a9bd8358bd257152a713b385b713bc334d84006e)] - Upgrade: Bump vsce from 1.67.1 to 1.68.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`0cfa8ecfbf`](https://github.com/webhintio/hint/commit/0cfa8ecfbf23aa46fb3e88794531144ab262ca21)] - Chore: Update proxyquire and fix tests (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#3121`](https://github.com/webhintio/hint/issues/3121)).


# 1.3.4 (October 17, 2019)


# 1.3.3 (October 16, 2019)

## Bug fixes / Improvements

* [[`ab14e80a7c`](https://github.com/webhintio/hint/commit/ab14e80a7c6fc63c1e4c17ac57ef16c710549587)] - Fix: Ensure shared webhint installs/updates correctly (by [`Tony Ross`](https://github.com/antross) / see also: [`#2998`](https://github.com/webhintio/hint/issues/2998)).
* [[`298fe8d97a`](https://github.com/webhintio/hint/commit/298fe8d97a8eb90f1b7901f3bc22d754ff2bdd7b)] - Docs: Improve information for contributors (by [`Antón Molleda`](https://github.com/molant) / see also: [`#3095`](https://github.com/webhintio/hint/issues/3095)).

## Chores

* [[`2517e0ced7`](https://github.com/webhintio/hint/commit/2517e0ced7c2fbcc947f7b1d8adaf0b40f1b059e)] - Upgrade: Bump @types/vscode from 1.38.0 to 1.39.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview) / see also: [`#3111`](https://github.com/webhintio/hint/issues/3111)).
* [[`995c967b64`](https://github.com/webhintio/hint/commit/995c967b64afbeecb5a4e4adf40179a416b4ee93)] - Upgrade: Bump eslint from 5.16.0 to 6.5.1 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview) / see also: [`#3092`](https://github.com/webhintio/hint/issues/3092)).
* [[`3f9cbc6ad5`](https://github.com/webhintio/hint/commit/3f9cbc6ad5c16ce3f29632241a57397e44a43632)] - Upgrade: Bump vsce from 1.66.0 to 1.67.1 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).


# 1.3.2 (September 26, 2019)

## Bug fixes / Improvements

* [[`0ed84ba7c8`](https://github.com/webhintio/hint/commit/0ed84ba7c8022f3cd20b9127a451c563e11c5f66)] - Fix: Load shared webhint when prompting to install locally () (by [`Tony Ross`](https://github.com/antross) / see also: [`#3031`](https://github.com/webhintio/hint/issues/3031)).


# 1.3.1 (September 24, 2019)

## Chores

* [[`53edf270f8`](https://github.com/webhintio/hint/commit/53edf270f84ead765bb981345d5321568ac69142)] - Upgrade: Bump @types/node from 12.7.4 to 12.7.5 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`7f9dd770ec`](https://github.com/webhintio/hint/commit/7f9dd770ec0350d7f50137d322159a07a3b203da)] - Upgrade: Bump webpack-cli from 3.3.7 to 3.3.9 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).


# 1.3.0 (September 19, 2019)

## Bug fixes / Improvements

* [[`65a3918894`](https://github.com/webhintio/hint/commit/65a3918894b7df50c5d2cfdeb96319828ba5362a)] - Fix: Remove unused devDependency (by [`Antón Molleda`](https://github.com/molant)).

## New features

* [[`ed793034ed`](https://github.com/webhintio/hint/commit/ed793034eddf3786795004b5baee4af5e93e9a3f)] - New: Log file extension in telemetry (by [`Antón Molleda`](https://github.com/molant) / see also: [`#2967`](https://github.com/webhintio/hint/issues/2967)).

## Chores

* [[`488fa0380d`](https://github.com/webhintio/hint/commit/488fa0380d006c09f71004d1cf51a5045c0d5bbc)] - Chore: Validate size of VS Code extension bundle (by [`Tony Ross`](https://github.com/antross) / see also: [`#2955`](https://github.com/webhintio/hint/issues/2955)).
* [[`c5e66947d4`](https://github.com/webhintio/hint/commit/c5e66947d494771b487c5d45a477069c61c9ed0b)] - Upgrade: Bump typescript from 3.6.2 to 3.6.3 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).


# 1.2.0 (September 12, 2019)

## Bug fixes / Improvements

* [[`ccf4c3fc61`](https://github.com/webhintio/hint/commit/ccf4c3fc619edbcbb7b0c6d1b8430d0d02231068)] - Docs: Improve title (by [`Antón Molleda`](https://github.com/molant)).
* [[`5603617df9`](https://github.com/webhintio/hint/commit/5603617df96def7c2571c8e94d595b76ec4633ec)] - Fix: Reference correct package directory in monorepo (by [`Tony Ross`](https://github.com/antross) / see also: [`#2873`](https://github.com/webhintio/hint/issues/2873)).

## New features

* [[`6977715bac`](https://github.com/webhintio/hint/commit/6977715bac129e5c56bb93c71dbda95884ee309d)] - New: Log when opting in to telemetry for the first time (by [`Tony Ross`](https://github.com/antross) / see also: [`#2744`](https://github.com/webhintio/hint/issues/2744)).
* [[`1e6fe95bd6`](https://github.com/webhintio/hint/commit/1e6fe95bd6c8eb0f487052cef513429a5eee0da8)] - New: Activate extension-vscode for LESS files (by [`Tony Ross`](https://github.com/antross)).
* [[`7824efcd67`](https://github.com/webhintio/hint/commit/7824efcd674f65ff88bcf933039883ea1aae8fd5)] - New: Activate extension-vscode for SASS files (by [`Tony Ross`](https://github.com/antross)).

## Chores

* [[`7d2cb353a2`](https://github.com/webhintio/hint/commit/7d2cb353a22d2469f7c01a6ba3005c6ed61405da)] - Chore: Update dependencies and package version (by [`Antón Molleda`](https://github.com/molant)).
* [[`7b8d905396`](https://github.com/webhintio/hint/commit/7b8d9053965eb3dea1aa1f809bfb89981b65a6a5)] - Chore: Bundle VS Code extension with webpack (by [`Tony Ross`](https://github.com/antross) / see also: [`#2803`](https://github.com/webhintio/hint/issues/2803)).
* [[`6a52ef4fb5`](https://github.com/webhintio/hint/commit/6a52ef4fb50931921be5da4c4cacd8760a3de887)] - Upgrade: Bump rimraf from 2.6.3 to 3.0.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`c2b32de999`](https://github.com/webhintio/hint/commit/c2b32de9997a922a4744991306a9bf9b22e3910f)] - Upgrade: Bump @types/node from 12.7.3 to 12.7.4 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`bbe99e3292`](https://github.com/webhintio/hint/commit/bbe99e329240a17e5f60c6c6261b0b9c2bd1774a)] - Upgrade: Bump typescript from 3.5.3 to 3.6.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`c94b993bab`](https://github.com/webhintio/hint/commit/c94b993babb99a9b49cc795fbf80663c4750ba93)] - Upgrade: Bump @types/node from 12.7.1 to 12.7.3 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`aab7643c70`](https://github.com/webhintio/hint/commit/aab7643c70042a5e7d2da9684844277d707854fe)] - Upgrade: Bump sinon from 7.3.2 to 7.4.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`abc947efeb`](https://github.com/webhintio/hint/commit/abc947efeb58b825ef143bc09de92301e79927fa)] - Upgrade: Bump vscode from 1.1.35 to 1.1.36 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).


# 1.1.0 (September 11, 2019)

## Bug fixes / Improvements

* [[`5603617df9`](https://github.com/webhintio/hint/commit/5603617df96def7c2571c8e94d595b76ec4633ec)] - Fix: Reference correct package directory in monorepo (by [`Tony Ross`](https://github.com/antross) / see also: [`#2873`](https://github.com/webhintio/hint/issues/2873)).


