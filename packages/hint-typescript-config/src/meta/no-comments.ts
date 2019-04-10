import { Category, HintMetadata, HintScope } from 'hint';

const meta: HintMetadata = {
    docs: {
        category: Category.development,
        description: '`typescript-config/no-comments` checks if the property `removeComments` is enabled in the TypeScript configuration file (i.e `tsconfig.json`)',
        name: 'TypeScript remove comments'
    },
    id: 'typescript-config/no-comments',
    schema: [],
    scope: HintScope.local
};

export default meta;
