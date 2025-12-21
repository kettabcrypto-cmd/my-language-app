// theme-manager.js - إدارة الثيمات والموضوعات
class ThemeManager {
    constructor() {
        this.themes = {
            light: {
                name: 'Light',
                colors: {
                    '--primary-color': '#3498db',
                    '--primary-dark': '#2980b9',
                    '--primary-light': '#5dade2',
                    '--secondary-color': '#2ecc71',
                    '--secondary-dark': '#27ae60',
                    '--background': '#ffffff',
                    '--background-secondary': '#f8f9fa',
                    '--background-tertiary': '#e9ecef',
                    '--text-primary': '#2c3e50',
                    '--text-secondary': '#7f8c8d',
                    '--text-tertiary': '#95a5a6',
                    '--border-color': '#dee2e6',
                    '--card-bg': '#ffffff',
                    '--shadow-color': 'rgba(0, 0, 0, 0.1)',
                    '--success-color': '#28a745',
                    '--warning-color': '#ffc107',
                    '--danger-color': '#dc3545',
                    '--info-color': '#17a2b8'
                }
            },
            dark: {
                name: 'Dark',
                colors: {
                    '--primary-color': '#3498db',
                    '--primary-dark': '#2980b9',
                    '--primary-light': '#5dade2',
                    '--secondary-color': '#2ecc71',
                    '--secondary-dark': '#27ae60',
                    '--background': '#1a1a1a',
                    '--background-secondary': '#2d2d2d',
                    '--background-tertiary': '#404040',
                    '--text-primary': '#f8f9fa',
                    '--text-secondary': '#adb5bd',
                    '--text-tertiary': '#6c757d',
                    '--border-color': '#495057',
                    '--card-bg': '#2d2d2d',
                    '--shadow-color': 'rgba(0, 0, 0, 0.3)',
                    '--success-color': '#28a745',
                    '--warning-color': '#ffc107',
                    '--danger-color': '#dc3545',
                    '--info-color': '#17a2b8'
                }
            },
            blue: {
                name: 'Blue',
                colors: {
                    '--primary-color': '#1e88e5',
                    '--primary-dark': '#1565c0',
                    '--primary-light': '#64b5f6',
                    '--secondary-color': '#00bcd4',
                    '--secondary-dark': '#00838f',
                    '--background': '#e3f2fd',
                    '--background-secondary': '#bbdefb',
                    '--background-tertiary': '#90caf9',
                    '--text-primary': '#0d47a1',
                    '--text-secondary': '#1976d2',
                    '--text-tertiary': '#2196f3',
                    '--border-color': '#bbdefb',
                    '--card-bg': '#ffffff',
                    '--shadow-color': 'rgba(30, 136, 229, 0.2)',
                    '--success-color': '#4caf50',
                    '--warning-color': '#ff9800',
                    '--danger-color': '#f44336',
                    '--info-color': '#00bcd4'
                }
            },
            green: {
                name: 'Green',
                colors: {
                    '--primary-color': '#43a047',
                    '--primary-dark': '#2e7d32',
                    '--primary-light': '#66bb6a',
                    '--secondary-color': '#689f38',
                    '--secondary-dark': '#558b2f',
                    '--background': '#f1f8e9',
                    '--background-secondary': '#dcedc8',
                    '--background-tertiary': '#c5e1a5',
                    '--text-primary': '#1b5e20',
                    '--text-secondary': '#388e3c',
                    '--text-tertiary': '#4caf50',
                    '--border-color': '#c8e6c9',
                    '--card-bg': '#ffffff',
                    '--shadow-color': 'rgba(67, 160, 71, 0.2)',
                    '--success-color': '#4caf50',
                    '--warning-color': '#ff9800',
                    '--danger-color': '#f44336',
                    '--info-color': '#00bcd4'
                }
            }
        };
        
        this.currentTheme = 'light';
        this.init();
    }
    
    init() {
        // تحميل الثيم المحفوظ
        const savedTheme = localStorage.getItem('currencypro_theme') || 'light';
        this.setTheme(savedTheme);
        
        // إضافة CSS للمتغيرات
        this.injectThemeVariables();
        
        // استماع لتغير النظام
        this.detectSystemTheme();
    }
    
    injectThemeVariables() {
        let style = document.getElementById('theme-variables');
        if (!style) {
            style = document.createElement('style');
            style.id = 'theme-variables';
            document.head.appendChild(style);
        }
        
        this.updateThemeVariables();
    }
    
    updateThemeVariables() {
        const theme = this.themes[this.currentTheme];
        const style = document.getElementById('theme-variables');
        
        let css = ':root {\n';
        Object.entries(theme.colors).forEach(([variable, value]) => {
            css += `  ${variable}: ${value};\n`;
        });
        css += '}\n';
        
        // إضافة أنيميشن للتبديل
        css += `
            * {
                transition: background-color 0.3s ease, 
                          color 0.3s ease, 
                          border-color 0.3s ease,
                          box-shadow 0.3s ease;
            }
        `;
        
        style.textContent = css;
    }
    
    setTheme(themeName) {
        if (!this.themes[themeName]) {
            console.warn(`Theme "${themeName}" not found, using light theme`);
            themeName = 'light';
        }
        
        this.currentTheme = themeName;
        document.body.setAttribute('data-theme', themeName);
        localStorage.setItem('currencypro_theme', themeName);
        
        this.updateThemeVariables();
        this.dispatchThemeChangeEvent();
        
        console.log(`🎨 Theme changed to: ${this.themes[themeName].name}`);
    }
    
    getCurrentTheme() {
        return {
            name: this.currentTheme,
            displayName: this.themes[this.currentTheme].name,
            colors: this.themes[this.currentTheme].colors
        };
    }
    
    getAllThemes() {
        return Object.keys(this.themes).map(key => ({
            id: key,
            name: this.themes[key].name,
            colors: this.themes[key].colors
        }));
    }
    
    detectSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e) => {
            const savedTheme = localStorage.getItem('currencypro_theme');
            // تطبيق ثيم النظام فقط إذا لم يكن هناك ثيم محفوظ
            if (!savedTheme || savedTheme === 'system') {
                const systemTheme = e.matches ? 'dark' : 'light';
                this.setTheme(systemTheme);
            }
        };
        
        mediaQuery.addEventListener('change', handleChange);
        
        // فحص أولي
        const savedTheme = localStorage.getItem('currencypro_theme');
        if (!savedTheme || savedTheme === 'system') {
            handleChange(mediaQuery);
        }
    }
    
    dispatchThemeChangeEvent() {
        const event = new CustomEvent('themechange', {
            detail: {
                theme: this.currentTheme,
                themeName: this.themes[this.currentTheme].name
            }
        });
        document.dispatchEvent(event);
    }
    
    // إنشاء ثيم مخصص
    createCustomTheme(name, colors) {
        const themeId = name.toLowerCase().replace(/\s+/g, '_');
        this.themes[themeId] = {
            name: name,
            colors: { ...this.themes.light.colors, ...colors }
        };
        
        // حفظ الثيم المخصص
        this.saveCustomThemes();
        
        return themeId;
    }
    
    saveCustomThemes() {
        const customThemes = {};
        Object.entries(this.themes).forEach(([key, theme]) => {
            if (!['light', 'dark', 'blue', 'green'].includes(key)) {
                customThemes[key] = theme;
            }
        });
        
        localStorage.setItem('currencypro_custom_themes', JSON.stringify(customThemes));
    }
    
    loadCustomThemes() {
        try {
            const customThemes = JSON.parse(localStorage.getItem('currencypro_custom_themes') || '{}');
            Object.assign(this.themes, customThemes);
        } catch (error) {
            console.error('Error loading custom themes:', error);
        }
    }
    
    // توليد ثيم عشوائي
    generateRandomTheme() {
        const colors = [
            '#3498db', '#2ecc71', '#e74c3c', '#9b59b6', '#1abc9c',
            '#f39c12', '#d35400', '#c0392b', '#16a085', '#8e44ad'
        ];
        
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const darkColor = this.darkenColor(randomColor, 20);
        const lightColor = this.lightenColor(randomColor, 20);
        
        const themeName = `Custom ${randomColor}`;
        const themeId = this.createCustomTheme(themeName, {
            '--primary-color': randomColor,
            '--primary-dark': darkColor,
            '--primary-light': lightColor
        });
        
        this.setTheme(themeId);
        return themeId;
    }
    
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        
        return '#' + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }
    
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return '#' + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }
}
