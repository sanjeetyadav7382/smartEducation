class NotificationSystem {
    constructor() {
        this.container = document.getElementById('toast-container');
        this.activeToasts = new Set();
        this.cooldowns = new Map();
    }

    /**
     * Show a toast notification
     * @param {string} title 
     * @param {string} message 
     * @param {string} type 'info', 'warning', 'danger'
     * @param {number} cooldown Important: prevent spamming same notification for N ms
     */
    show(title, message, type = 'info', cooldown = 5000) {
        // Prevent spam
        const notifKey = `${type}-${title}`;
        const now = Date.now();
        if (this.cooldowns.has(notifKey)) {
            if (now - this.cooldowns.get(notifKey) < cooldown) return;
        }
        this.cooldowns.set(notifKey, now);

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Icon mapping
        let iconClass = 'fa-circle-info';
        if (type === 'warning') iconClass = 'fa-triangle-exclamation';
        if (type === 'danger') iconClass = 'fa-circle-exclamation';

        toast.innerHTML = `
            <div class="toast-icon ${type}">
                <i class="fa-solid ${iconClass}"></i>
            </div>
            <div class="toast-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        `;
        
        this.container.appendChild(toast);
        
        // Trigger entrance animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 400); // Wait for transition
        }, 4000);
    }

    info(title, message) { this.show(title, message, 'info'); }
    warning(title, message, cd) { this.show(title, message, 'warning', cd); }
    danger(title, message, cd) { this.show(title, message, 'danger', cd); }
}

window.NotificationSystem = NotificationSystem;
