// Global configuration for Masader application
window.MasaderConfig = {
    // Base API URL for all dataset endpoints
    API_BASE_URL: 'https://web-production-25a2.up.railway.app',

    // Derived URLs for convenience
    get DATASETS_URL() {
        return `${this.API_BASE_URL}/datasets`;
    },

    get DATASETS_WITH_EMBEDDINGS_URL() {
        return `${this.API_BASE_URL}/datasets?features=Cluster,Embeddings`;
    },

    get CONTRIBUTORS_URL() {
        return `${this.API_BASE_URL}/datasets/tags?features=Added By`;
    },

    // Theme configuration for charts
    theme: {
        light: {
            background: '#ffffff',
            text: '#353738',
            grid: '#e0e0e0',
            tooltip: '#ffffff',
        },
        dark: {
            background: '#121212',
            text: '#ffffff',
            grid: '#424242',
            tooltip: '#252525',
        },
    },

    getCurrentTheme() {
        const theme =
            document.documentElement.getAttribute('data-theme') || 'light';
        return this.theme[theme] || this.theme.light;
    },

    isDarkMode() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    },
};
