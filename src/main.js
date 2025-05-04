const loginBtn = document.getElementById('loginBtn');
const loginScreen = document.getElementById('loginScreen');
const shopScreen = document.getElementById('shopScreen');
const shopItemsDiv = document.getElementById('shopItems');

loginBtn.onclick = () => {
    MockGameSDK.login('player1', 'password');
};

MockGameSDK.on('loginSuccess', (data) => {
    window.ErrorManager.logSuccess('Login successful!');
    loginScreen.classList.add('hidden');
    shopScreen.classList.remove('hidden');
    loadShopItems();
});

MockGameSDK.on('purchaseCompleted', (data) => {
    window.ErrorManager.logSuccess(`Purchase successful: ${data.itemId}`);
    loadShopItems();  // Refresh shop UI
});

MockGameSDK.on('purchaseFailed', (err) => {
    window.ErrorManager.logError(`Purchase failed: ${err.message}`);
});

function loadShopItems() {
    shopItemsDiv.innerHTML = '';  // Clear previous items

    // Show balance at top
    const balanceDisplay = document.createElement('div');
    balanceDisplay.textContent = `Your balance: $${MockGameSDK.getPlayerBalance().toFixed(2)}`;
    balanceDisplay.style.marginBottom = '20px';
    shopItemsDiv.appendChild(balanceDisplay);

    MockGameSDK.getShopItems().then(items => {
        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.textContent = `${item.name} - $${item.price.toFixed(2)}`;
            if (!item.purchased) {
                const buyBtn = document.createElement('button');
                buyBtn.textContent = 'Buy';
                buyBtn.onclick = () => {
                    MockGameSDK.buyItem(item.id);
                };
                itemDiv.appendChild(buyBtn);
            } else {
                const purchasedLabel = document.createElement('span');
                purchasedLabel.textContent = ' (Purchased)';
                purchasedLabel.style.color = '#0f0';
                itemDiv.appendChild(purchasedLabel);
            }
            shopItemsDiv.appendChild(itemDiv);
        });
    });
}
