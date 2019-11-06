// autogenerated by scripts/create/create-metas.js
import { Category } from '@hint/utils-types';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

import { getMessage } from '../i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.accessibility,
        description: getMessage('timeAndMedia_description', 'en'),
        name: getMessage('timeAndMedia_name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('timeAndMedia_description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('timeAndMedia_name', language);
    },
    id: 'axe/time-and-media',
    schema: [
        {
            additionalProperties: false,
            properties: {
                'audio-caption': { enum: ['off', 'warning', 'error'], type: 'string' },
                blink: { enum: ['off', 'warning', 'error'], type: 'string' },
                'meta-refresh': { enum: ['off', 'warning', 'error'], type: 'string' }
            }
        },
        {
            items: {
                enum: ['audio-caption', 'blink', 'meta-refresh'],
                type: 'string'
            },
            typeof: 'array',
            uniqueItems: true
        }
    ],
    scope: HintScope.any
};

export default meta;
