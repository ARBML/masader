// Global configuration for Masader application
window.MasaderConfig = {
    // Base API URL for all dataset endpoints
    API_BASE_URL: 'http://127.0.0.1:5000',

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

    // Endpoint for the datasets chatbot (RAG over the catalogue)
    get CHAT_URL() {
        return `${this.API_BASE_URL}/chat`;
    },

    // Show the debug activity log panel in chat UIs (full page + widget)
    SHOW_CHAT_ACTIVITY_LOG: false,
};
