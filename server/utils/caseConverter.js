function snakeToCamel(obj) {
    if (Array.isArray(obj)) {
        return obj.map(snakeToCamel);
    }
    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            acc[camelKey] = snakeToCamel(obj[key]);
            return acc;
        }, {});
    }
    return obj;
}

module.exports = { snakeToCamel };
