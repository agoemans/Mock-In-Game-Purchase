class PopUpManager {
    constructor() {
        this.overlay = document.getElementById('popupOverlay');
        this.message = document.getElementById('popupMessage');
        this.btnYes = document.getElementById('popupBtnYes');
        this.btnNo = document.getElementById('popupBtnNo');
    }

    show(message, yesCallback, noCallback) {
        this.overlay.style.display = 'flex';
        this.message.textContent = message;

        this.btnYes.onclick = () => {
            this.hide();
            if (yesCallback) yesCallback();
        };

        this.btnNo.onclick = () => {
            this.hide();
            if (noCallback) noCallback();
        };
    }

    hide() {
        this.overlay.style.display = 'none';
    }
}

// Create a single instance you can call anywhere
const popup = new PopUpManager();
