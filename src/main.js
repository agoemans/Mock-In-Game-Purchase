const loginScreen = document.getElementById('loginScreen');
const shopScreen = document.getElementById('shopScreen');
const shopItemsDiv = document.getElementById('shopItems');
const errorSimContainer = document.getElementById('errorSimContainer');


MockGameSDK.on('loginSuccess', (data) => {
    window.ErrorManager.logSuccess('Login successful!');
    loadShopItems();
});

//ToDO separate all responsibilities
function updateAvatar() {
    const balance = MockGameSDK.getPlayerBalance();
    const avatar = document.getElementById('avatar');

    if (!MockGameSDK._player.userId) {
        avatar.src = 'images/avatar_guest.png';
        return;
    }

    avatar.src = 'images/avatar_happy.png';
}

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

    updateAvatar();


}

async function loadShopItems() {
    const shopContainer = document.getElementById('shopContainer');
    shopContainer.innerHTML = '';

    updateAvatar();

    let items  = await MockGameSDK.getShopItems();
    if(items) {
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

            const purchasedLabel = document.createElement('span');
            purchasedLabel.textContent = 'Purchased';
            purchasedLabel.style.color = '#0f0';
            itemDiv.appendChild(purchasedLabel);

            if (!item.purchased) {
                purchasedLabel.style.display = 'none';
                const buyBtn = document.createElement('button');
                buyBtn.textContent = 'BUY';
                buyBtn.style.backgroundColor = '#4caf50';
                buyBtn.onclick = () => {
                    //change this to read data from the sdk
                    if (!MockGameSDK._player.userId) {
                        popup.show(
                            'You need to log in for purchases. Log in?',
                            () => {  // Yes clicked
                                performLoginAndBuy(item.id);
                            },
                            () => {  // No clicked
                                window.ErrorManager.logInfo('Purchase cancelled by user.');
                            }
                        );
                    } else {
                        MockGameSDK.buyItem(item.id);
                    }
                };
                itemDiv.appendChild(buyBtn);
            } else {
                purchasedLabel.style.display = 'block';

                const refundBtn = document.createElement('button');
                refundBtn.textContent = 'REFUND';
                refundBtn.style.marginTop = '5px';
                refundBtn.style.backgroundColor = '#ff1919';
                refundBtn.onclick = () => {
                    MockGameSDK.refundItem(item.id);
                };
                itemDiv.appendChild(refundBtn);
            }

            shopContainer.appendChild(itemDiv);
        });
    }

    // MockGameSDK.getShopItems().then(items => {
        
    // });

    updateBalanceDisplay();
}

function performLoginAndBuy(itemId) {
    MockGameSDK.login('player1', 'password').then(() => {

        MockGameSDK.buyItem(itemId);
    });
}

// Hook up all the events
MockGameSDK.on('purchaseCompleted', async (data) => {
    window.ErrorManager.logSuccess(`Purchase successful: ${data.itemId}`);
    await loadShopItems();
});

MockGameSDK.on('purchaseFailed', (err) => {
    window.ErrorManager.logError(`Purchase failed: ${err.message} (${err.code})`);
});

MockGameSDK.on('refundCompleted', async (data) => {
    window.ErrorManager.logSuccess(`Refund successful: ${data.itemId}, refunded $${data.amountRefunded.toFixed(2)}`);
    await loadShopItems();
});

MockGameSDK.on('refundFailed', (err) => {
    window.ErrorManager.logError(`Refund failed: ${err.message} (${err.code})`);
});

/// on start
window.addEventListener('load', async () => {
    await loadShopItems();
});

function simulatePurchaseError(code) {
    MockGameSDK.simulateNextPurchaseError(code);
    window.ErrorManager.logInfo(`Next purchase will fail with ${code}`);
}

function simulateRefundError(code) {
    MockGameSDK.simulateNextRefundError(code);
    window.ErrorManager.logInfo(`Next refund will fail with ${code}`);
}
