class ErrorManager {
  constructor() {
    if (ErrorManager._instance) return ErrorManager._instance;
    this.toastContainer = this._createToastContainer();
    this.maxToasts = 5;
    ErrorManager._instance = this;
  }

  _createToastContainer() {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
  }

  showToast(message, type = 'info', duration = 4000, icon = '') {
    if (this.toastContainer.children.length >= this.maxToasts) {
      this.toastContainer.removeChild(this.toastContainer.firstChild);
    }

    const toast = document.createElement('div');
    toast.textContent = `${icon} ${message}`;
    toast.style.padding = '10px 16px';
    toast.style.backgroundColor = {
      error: '#f44336',
      success: '#4caf50',
      info: '#2196f3',
      warning: '#ff9800'
    }[type] || '#333';
    toast.style.color = 'white';
    toast.style.borderRadius = '6px';
    toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    toast.style.fontFamily = 'monospace';
    toast.style.fontSize = '14px';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';

    this.toastContainer.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    // Auto-remove with smooth fade-out
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'all 0.5s ease';  // Slightly slower for smoothness
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, duration);
  }

  logError(message, duration = 4000) {
    console.error(`[MockSDK Error] ${message}`);
    this.showToast(message, 'error', duration, '❌');
  }

  logSuccess(message, duration = 4000) {
    console.log(`[MockSDK] ${message}`);
    this.showToast(message, 'success', duration, '✅');
  }

  logInfo(message, duration = 4000) {
    console.log(`[MockSDK] ${message}`);
    this.showToast(message, 'info', duration, 'ℹ️');
  }

  logWarning(message, duration = 4000) {
    console.warn(`[MockSDK Warning] ${message}`);
    this.showToast(message, 'warning', duration, '⚠️');
  }
}

// Global singleton
window.ErrorManager = new ErrorManager();
