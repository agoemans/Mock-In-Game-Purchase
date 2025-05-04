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

MockGameSDK.on('refundCompleted', (data) => {
    window.ErrorManager.logSuccess(`Refund successful: ${data.itemId}, refunded $${data.amountRefunded.toFixed(2)}`);
    loadShopItems();
});

MockGameSDK.on('refundFailed', (err) => {
    window.ErrorManager.logError(`Refund failed: ${err.message} (${err.code})`);
});

function loadShopItems() {
    shopItemsDiv.innerHTML = '';  // Clear previous items

    // Show balance at top
    const balanceDisplay = document.createElement('div');
    balanceDisplay.textContent = `Your balance: $${MockGameSDK.getPlayerBalance().toFixed(2)}`;
    balanceDisplay.className = 'balance';
    shopItemsDiv.appendChild(balanceDisplay);

    MockGameSDK.getShopItems().then(items => {
        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.textContent = `${item.name} - $${item.price.toFixed(2)}`;

            // If item NOT purchased → show Buy button
            if (!item.purchased) {
                const buyBtn = document.createElement('button');
                buyBtn.textContent = 'Buy';
                buyBtn.onclick = () => {
                    MockGameSDK.buyItem(item.id);
                };
                itemDiv.appendChild(buyBtn);

            // If item IS purchased → show Purchased label + Refund button
            } else {
                const purchasedLabel = document.createElement('span');
                purchasedLabel.textContent = ' (Purchased)';
                purchasedLabel.style.color = '#0f0';
                itemDiv.appendChild(purchasedLabel);

                // --- Refund button ---
                const refundBtn = document.createElement('button');
                refundBtn.textContent = 'Refund';
                refundBtn.style.marginLeft = '10px';
                refundBtn.className = 'refund';  // ADD THIS
                refundBtn.onclick = () => {
                    MockGameSDK.refundItem(item.id);
                };
                itemDiv.appendChild(refundBtn);
            }

            shopItemsDiv.appendChild(itemDiv);
        });
    });
}
