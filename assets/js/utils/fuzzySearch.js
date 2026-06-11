/**
 * Client-side fuzzy matching for Masader catalogue search.
 * Uses Fuse.js when available; falls back to case-insensitive substring match.
 */
window.MasaderFuzzy = {
    datasetKeys: [
        { name: 'Name', weight: 0.55 },
        { name: 'Tasks', weight: 0.25 },
        { name: 'Dialect', weight: 0.1 },
        { name: 'Domain', weight: 0.05 },
        { name: 'Provider', weight: 0.05 },
    ],

    datasetOptions: {
        threshold: 0.42,
        ignoreLocation: true,
        minMatchCharLength: 1,
        includeScore: true,
    },

    tagOptions: {
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 1,
    },

    /**
     * @param {object[]} datasets
     * @param {string} searchTerm
     * @returns {object[]}
     */
    filterDatasets(datasets, searchTerm) {
        const term = (searchTerm || '').trim();
        if (!term) return datasets;

        if (typeof Fuse === 'undefined') {
            return this._substringFilterDatasets(datasets, term);
        }

        const fuse = new Fuse(datasets, {
            keys: this.datasetKeys,
            ...this.datasetOptions,
        });

        return fuse.search(term).map((result) => result.item);
    },

    /**
     * @param {string[]} labels
     * @param {string} searchTerm
     * @returns {string[]}
     */
    filterTagLabels(labels, searchTerm) {
        const term = (searchTerm || '').trim().toLowerCase();
        if (!term) return labels;

        if (typeof Fuse === 'undefined') {
            return labels.filter((label) => label.toLowerCase().includes(term));
        }

        const fuse = new Fuse(
            labels.map((label) => ({ label })),
            { keys: ['label'], ...this.tagOptions }
        );

        return fuse.search(term).map((result) => result.item.label);
    },

    _substringFilterDatasets(datasets, term) {
        const lower = term.toLowerCase();
        return datasets.filter((row) =>
            ['Name', 'Tasks', 'Dialect', 'Domain', 'Provider'].some((key) =>
                String(row[key] || '')
                    .toLowerCase()
                    .includes(lower)
            )
        );
    },
};
