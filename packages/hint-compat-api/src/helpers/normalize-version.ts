/**
 * @fileoverview Helper to work with versions and normalize it because versions sometimes are numbers and sometime not.
 * For more information on the issue: https://github.com/mdn/browser-compat-data/pull/2690#issuecomment-417237045
 */

class BrowserVersions {
    private columnSeparator = '.';
    private charForPad = '0';
    private itemsInColum = 2; // Assuming that worst case is xx.xx.xx
    private itemsInColumns = 6;
    public unit = 10000;

    /**
     * @method normalize
     * For more information on the issue: https://github.com/mdn/browser-compat-data/pull/2690#issuecomment-417237045
     * Examples:
     * 52 normalizes into 520000
     * 52.12 normalizes into 521200
     * 52.12.1 normalizes into 521201
     * 52.1.10 normalizes into 520110
     * 5.1.10 normalizes into 50110
     *
     */
    public normalize(browserVersion: string): number {
        const result = browserVersion.split(this.columnSeparator).map((column) => {
            return column.padStart(this.itemsInColum, this.charForPad);
        })
            .join('');

        return Number(result.padEnd(this.itemsInColumns, this.charForPad));
    }

    public deNormalize(normalizedVersion: number): string {
        const normalizedVersionString = `${normalizedVersion}`.padStart(this.itemsInColumns, this.charForPad);
        const columns = normalizedVersionString.match(/..?/g);

        if (!columns) {
            throw new Error(`Value ${normalizedVersion} is not allowed to be denormalized.`);
        }

        const realNumbers: number[] = [];
        let foundNumberGreaterThanZero = false;

        columns.reverse().forEach((items) => {
            const converted = Number(items);

            if (converted === 0 && !foundNumberGreaterThanZero) {
                return;
            }

            if (converted > 0) {
                foundNumberGreaterThanZero = true;
            }

            realNumbers.push(converted);
        });

        return realNumbers.reverse().join('.');
    }
}

export const browserVersions = new BrowserVersions();
