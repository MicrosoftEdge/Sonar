/** Convert '-' delimitered string to camel case name. */
export default (value: string) => value.split('-').reduce((accu: string, w: string) => {
    if (!accu.length) {
        return w.toLocaleLowerCase();
    }

    let current = accu;

    current += w.length ? `${w.charAt(0).toUpperCase()}${w.substr(1).toLowerCase()}` : '';

    return current;
}, '');
