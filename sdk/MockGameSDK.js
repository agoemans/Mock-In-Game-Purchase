const MockGameSDK = {
    _events: {},
    _player: {
        userId: null,
        balance: 20.00
    },
    _items: [
        { id: 'sword_001', name: 'Sword of Destiny', price: 9.99, purchased: false },
        { id: 'shield_002', name: 'Shield of Valor', price: 12.50, purchased: false },
        { id: 'potion_003', name: 'Potion of Healing', price: 5.25, purchased: false }
    ],

    // --- User login simulation ---
    login(username, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                this._player.userId = 'user123';
                this._emit('loginSuccess', { userId: this._player.userId, token: 'abc123' });
                resolve({ userId: this._player.userId, token: 'abc123' });
            }, 1000);
        });
    },

    getPlayerBalance() {
        return this._player.balance;
    },

    getShopItems() {
        return Promise.resolve(this._items);
    },

    buyItem(itemId) {
        return new Promise((resolve, reject) => {
            const item = this._items.find(it => it.id === itemId);

            // Basic checks
            if (!item) {
                return this._failPurchase(itemId, 'Item not found.', 'ITEM_NOT_FOUND', reject);
            }

            if (item.purchased) {
                return this._failPurchase(itemId, 'Item already purchased.', 'ITEM_ALREADY_PURCHASED', reject);
            }

            // Check player has enough money
            if (this._player.balance < item.price) {
                return this._failPurchase(itemId, 'Insufficient funds.', 'INSUFFICIENT_FUNDS', reject);
            }

            // --- Optional: Random payment errors (still keep a bit of realism!) ---
            const random = Math.random();
            if (random < 0.05) {
                return this._failPurchase(itemId, 'Payment provider timeout.', 'PAYMENT_TIMEOUT', reject);
            }

            // Successful purchase
            setTimeout(() => {
                item.purchased = true;
                this._player.balance -= item.price;
                const orderResult = {
                    itemId,
                    orderId: 'order_' + Math.random().toString(36).substr(2, 9)
                };
                this._emit('purchaseCompleted', orderResult);
                resolve(orderResult);
            }, 1000);
        });
    },

    on(eventName, callback) {
        this._events[eventName] = callback;
    },

    _emit(eventName, data) {
        if (this._events[eventName]) {
            this._events[eventName](data);
        }
    },

    _failPurchase(itemId, message, code, rejectFn) {
        const error = { itemId, message, code };
        this._emit('purchaseFailed', error);
        rejectFn(error);
    },

    refundItem(itemId) {
        return new Promise((resolve, reject) => {
            const item = this._items.find(it => it.id === itemId);

            if (!item) {
                return this._failRefund(itemId, 'Item not found.', 'ITEM_NOT_FOUND', reject);
            }

            if (!item.purchased) {
                return this._failRefund(itemId, 'Item has not been purchased.', 'ITEM_NOT_PURCHASED', reject);
            }

            // Process refund
            setTimeout(() => {
                item.purchased = false;
                this._player.balance += item.price;
                const refundResult = {
                    itemId,
                    amountRefunded: item.price
                };
                this._emit('refundCompleted', refundResult);
                resolve(refundResult);
            }, 1000);
        });
    },

    _failRefund(itemId, message, code, rejectFn) {
        const error = { itemId, message, code };
        this._emit('refundFailed', error);
        rejectFn(error);
    }

};
