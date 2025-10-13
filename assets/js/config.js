// Global configuration for Masader application
window.MasaderConfig = {
    // Base API URL for all dataset endpoints
    API_BASE_URL: "https://web-production-25a2.up.railway.app",
    
    // Derived URLs for convenience
    get DATASETS_URL() {
        return `${this.API_BASE_URL}/datasets`;
    },
    
    get DATASETS_WITH_EMBEDDINGS_URL() {
        return `${this.API_BASE_URL}/datasets?features=Cluster,Embeddings`;
    },
    
    get CONTRIBUTORS_URL() {
        return `${this.API_BASE_URL}/datasets/tags?features=Added By`;
    }
};
