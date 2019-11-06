/**
 * @fileoverview Check if `.webmanifest` is used as the file extension
 * for the web app manifest file.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { normalizeString } from '@hint/utils/dist/src/misc/normalize-string';
import { fileExtension as getFileExtension } from '@hint/utils/dist/src/fs/file-extension';
import { ElementFound, IHint, Severity } from 'hint/dist/src/lib/types';
import { HintContext } from 'hint/dist/src/lib/hint-context';

import meta from './meta';
import { getMessage } from './i18n.import';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class ManifestFileExtensionHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {

        const standardManifestFileExtension: string = 'webmanifest';

        const validate = ({ element, resource }: ElementFound) => {
            if (normalizeString(element.getAttribute('rel')) === 'manifest') {
                const href = element.resolveUrl(element.getAttribute('href') || /* istanbul ignore next */ '');
                const fileExtension: string = getFileExtension(normalizeString(href) || /* istanbul ignore next */ '');

                if (fileExtension !== standardManifestFileExtension) {
                    let message: string;
                    let severity: Severity;

                    if (fileExtension) {
                        message = getMessage('shouldHaveFileExtensionNot', context.language, [standardManifestFileExtension, fileExtension]);

                        severity = fileExtension === 'json' ?
                            Severity.hint :
                            Severity.warning;
                    } else {
                        message = getMessage('shouldHaveFileExtension', context.language, standardManifestFileExtension);
                        severity = Severity.warning;
                    }

                    context.report(resource, message, { content: fileExtension, element, severity });
                }
            }
        };

        context.on('element::link', validate);
    }
}
