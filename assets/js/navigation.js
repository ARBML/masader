/**
 * @type {HTMLUListElement}
 */
const menu = document.querySelector('.navigation-mobile-menu');

/**
 * @type {HTMLLIElement}
 */
const toggle = document.querySelector('.navigation-mobile-menu-toggle');

toggle.addEventListener('click', (e) => menu.classList.toggle('hidden'));

/**
 * Theme Toggle Functionality
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeToggleMobile = document.getElementById('theme-toggle-mobile');

    function getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    function updateThemeIcons(theme) {
        const darkIcons = document.querySelectorAll('.theme-icon-dark');
        const lightIcons = document.querySelectorAll('.theme-icon-light');

        if (theme === 'dark') {
            darkIcons.forEach((icon) => icon.classList.add('hidden'));
            lightIcons.forEach((icon) => icon.classList.remove('hidden'));
        } else {
            darkIcons.forEach((icon) => icon.classList.remove('hidden'));
            lightIcons.forEach((icon) => icon.classList.add('hidden'));
        }
    }

    function toggleTheme() {
        const currentTheme = getCurrentTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcons(newTheme);
    }

    // Initialize icons based on current theme
    updateThemeIcons(getCurrentTheme());

    // Add event listeners
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    if (themeToggleMobile) {
        themeToggleMobile.addEventListener('click', toggleTheme);
    }
}

// Initialize theme toggle when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
} else {
    initThemeToggle();
}
