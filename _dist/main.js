// const loginBtn = document.getElementById('loginBtn');
const loginScreen = document.getElementById('loginScreen');
const shopScreen = document.getElementById('shopScreen');
const shopItemsDiv = document.getElementById('shopItems');
const errorSimContainer = document.getElementById('errorSimContainer');

// loginBtn.onclick = () => {
//     MockGameSDK.login('player1', 'password');
// };

MockGameSDK.on('loginSuccess', (data) => {
    window.ErrorManager.logSuccess('Login successful!');
    loginScreen.classList.add('hidden');
    errorSimContainer.classList.remove('hidden');
    shopScreen.classList.remove('hidden');
    loadShopItems();
});

function updateBalanceDisplay() {
    const balance = MockGameSDK.getPlayerBalance();
    const balanceContainer = document.getElementById('userBalance');

    // Clear previous content
    balanceContainer.innerHTML = '';

    // Coin image
    const coinImg = document.createElement('img');
    coinImg.src = 'images/coin.png'; // Your generated coin image
    coinImg.alt = 'Coin';
    coinImg.className = 'coinIcon';

    // Balance text
    const balanceText = document.createElement('span');
    balanceText.textContent = `$${balance.toFixed(2)}`;

    balanceContainer.appendChild(coinImg);
    balanceContainer.appendChild(balanceText);

    const avatar = document.getElementById('avatar');

    if (balance >= 15) {
        avatar.src = 'images/avatar_happy.png'; // Rich
    } else if (balance >= 5) {
        avatar.src = 'images/avatar_neutral.png'; // Normal
    } else {
        avatar.src = 'images/avatar_sad.png'; // Poor
    }
}

function loadShopItems() {
    const shopContainer = document.getElementById('shopContainer');
    shopContainer.innerHTML = '';

    MockGameSDK.getShopItems().then(items => {
        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'shopItem';

            const price = document.createElement('h3');
            price.textContent = `$${item.price.toFixed(2)}`;
            itemDiv.appendChild(price);

            const itemName = document.createElement('h2');
            itemName.textContent = item.name;
            itemDiv.appendChild(itemName);

            const itemDesc = document.createElement('p');
            itemDesc.textContent = item.description;
            itemDiv.appendChild(itemDesc);

            const image = document.createElement('img');
            image.src = 'images/' + item.image; // Placeholder image
            itemDiv.appendChild(image);

            if (!item.purchased) {
                const buyBtn = document.createElement('button');
                buyBtn.textContent = 'BUY';
                buyBtn.onclick = () => {
                    MockGameSDK.buyItem(item.id);
                };
                itemDiv.appendChild(buyBtn);
            } else {
                const purchasedLabel = document.createElement('span');
                purchasedLabel.textContent = 'Purchased';
                purchasedLabel.style.color = '#0f0';
                itemDiv.appendChild(purchasedLabel);

                const refundBtn = document.createElement('button');
                refundBtn.textContent = 'Refund';
                refundBtn.style.marginTop = '5px';
                refundBtn.onclick = () => {
                    MockGameSDK.refundItem(item.id);
                };
                itemDiv.appendChild(refundBtn);
            }

            shopContainer.appendChild(itemDiv);
        });
    });

    updateBalanceDisplay();
}

// Hook up all the events
MockGameSDK.on('purchaseCompleted', (data) => {
    window.ErrorManager.logSuccess(`Purchase successful: ${data.itemId}`);
    loadShopItems();
});

MockGameSDK.on('purchaseFailed', (err) => {
    window.ErrorManager.logError(`Purchase failed: ${err.message} (${err.code})`);
});

MockGameSDK.on('refundCompleted', (data) => {
    window.ErrorManager.logSuccess(`Refund successful: ${data.itemId}, refunded $${data.amountRefunded.toFixed(2)}`);
    loadShopItems();
});

MockGameSDK.on('refundFailed', (err) => {
    window.ErrorManager.logError(`Refund failed: ${err.message} (${err.code})`);
});

/// on start
window.addEventListener('load', () => {
    loadShopItems();
});

function simulatePurchaseError(code) {
    MockGameSDK.simulateNextPurchaseError(code);
    window.ErrorManager.logInfo(`Next purchase will fail with ${code}`);
}

function simulateRefundError(code) {
    MockGameSDK.simulateNextRefundError(code);
    window.ErrorManager.logInfo(`Next refund will fail with ${code}`);
}
