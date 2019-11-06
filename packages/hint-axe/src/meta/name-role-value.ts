// autogenerated by scripts/create/create-metas.js
import { Category } from '@hint/utils-types';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';

import { getMessage } from '../i18n.import';

const meta: HintMetadata = {
    docs: {
        category: Category.accessibility,
        description: getMessage('nameRoleValue_description', 'en'),
        name: getMessage('nameRoleValue_name', 'en')
    },
    /* istanbul ignore next */
    getDescription(language: string) {
        return getMessage('nameRoleValue_description', language);
    },
    /* istanbul ignore next */
    getName(language: string) {
        return getMessage('nameRoleValue_name', language);
    },
    id: 'axe/name-role-value',
    schema: [
        {
            additionalProperties: false,
            properties: {
                'aria-hidden-focus': { enum: ['off', 'warning', 'error'], type: 'string' },
                'button-name': { enum: ['off', 'warning', 'error'], type: 'string' },
                'empty-heading': { enum: ['off', 'warning', 'error'], type: 'string' },
                'input-button-name': { enum: ['off', 'warning', 'error'], type: 'string' },
                'link-name': { enum: ['off', 'warning', 'error'], type: 'string' }
            }
        },
        {
            items: {
                enum: ['aria-hidden-focus', 'button-name', 'empty-heading', 'input-button-name', 'link-name'],
                type: 'string'
            },
            typeof: 'array',
            uniqueItems: true
        }
    ],
    scope: HintScope.any
};

export default meta;
