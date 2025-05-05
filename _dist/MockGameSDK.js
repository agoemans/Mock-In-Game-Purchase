const MockGameSDK = {
    _events: {},
    _player: {
      userId: null,
      balance: 20.00
    },
    _items: [
      {
          id: 'sword_001',
          name: 'Sword of Destiny',
          price: 9.99,
          description: 'A legendary blade forged in dragon fire.',
          purchased: false,
          image: 'item_001.png'
      },
      {
          id: 'shield_002',
          name: 'Shield of Valor',
          price: 12.50,
          description: 'An unbreakable shield blessed by the ancients.',
          purchased: false,
          image: 'item_002.png'
      },
      {
          id: 'potion_003',
          name: 'Potion of Healing',
          price: 5.25,
          description: 'Restores health and cures minor ailments.',
          purchased: false,
          image: 'item_003.png'
      }
  ],
    _nextPurchaseError: null,
    _nextRefundError: null,
  
    // --- User login ---
    login(username, password) {
      return new Promise((resolve) => {
        const traceId = this._generateTraceId('login');
        setTimeout(() => {
          this._player.userId = 'user123';
          this._emit('loginSuccess', { userId: this._player.userId, token: 'abc123', traceId });
          resolve({ userId: this._player.userId, token: 'abc123', traceId });
        }, 1000);
      });
    },
  
    getPlayerBalance() {
      return this._player.balance;
    },
  
    getShopItems() {
      return Promise.resolve(this._items);
    },
  
    // --- Purchase flow ---
    buyItem(itemId) {
      const traceId = this._generateTraceId('purchase');
      this._emit('purchaseStarted', { itemId, traceId });
  
      return new Promise((resolve, reject) => {
        const item = this._items.find(it => it.id === itemId);
  
        // Forced error (dev-triggered)
        if (this._nextPurchaseError) {
          const forcedCode = this._nextPurchaseError;
          this._nextPurchaseError = null;
          return this._failPurchase(itemId, `Forced error for testing (${forcedCode})`, forcedCode, traceId, reject);
        }
  
        if (!item) {
          return this._failPurchase(itemId, 'Item not found.', 'ITEM_NOT_FOUND', traceId, reject);
        }
  
        if (item.purchased) {
          return this._failPurchase(itemId, 'Item already purchased.', 'ITEM_ALREADY_PURCHASED', traceId, reject);
        }
  
        if (this._player.balance < item.price) {
          return this._failPurchase(itemId, 'Insufficient funds.', 'INSUFFICIENT_FUNDS', traceId, reject);
        }
  
        // Random error simulation (5%)
        if (Math.random() < 0.05) {
          return this._failPurchase(itemId, 'Payment provider timeout.', 'PAYMENT_TIMEOUT', traceId, reject);
        }
  
        setTimeout(() => {
          item.purchased = true;
          this._player.balance -= item.price;
          const orderResult = {
            itemId,
            orderId: 'order_' + Math.random().toString(36).substr(2, 9),
            traceId
          };
          this._emit('purchaseCompleted', orderResult);
          resolve(orderResult);
        }, 1000);
      });
    },
  
    refundItem(itemId) {
      const traceId = this._generateTraceId('refund');
      this._emit('refundStarted', { itemId, traceId });
  
      return new Promise((resolve, reject) => {
        const item = this._items.find(it => it.id === itemId);
  
        // Forced error (dev-triggered)
        if (this._nextRefundError) {
          const forcedCode = this._nextRefundError;
          this._nextRefundError = null;
          return this._failRefund(itemId, `Forced error for testing (${forcedCode})`, forcedCode, traceId, reject);
        }
  
        if (!item) {
          return this._failRefund(itemId, 'Item not found.', 'ITEM_NOT_FOUND', traceId, reject);
        }
  
        if (!item.purchased) {
          return this._failRefund(itemId, 'Item has not been purchased.', 'ITEM_NOT_PURCHASED', traceId, reject);
        }
  
        setTimeout(() => {
          item.purchased = false;
          this._player.balance += item.price;
          const refundResult = {
            itemId,
            amountRefunded: item.price,
            traceId
          };
          this._emit('refundCompleted', refundResult);
          resolve(refundResult);
        }, 1000);
      });
    },
  
    // --- Error simulation hooks ---
    simulateNextPurchaseError(code) {
      this._nextPurchaseError = code;
    },
  
    simulateNextRefundError(code) {
      this._nextRefundError = code;
    },
  
    // --- Internal helpers ---
    on(eventName, callback) {
      this._events[eventName] = callback;
    },
  
    _emit(eventName, data) {
      if (this._events[eventName]) {
        this._events[eventName](data);
      }
    },
  
    _failPurchase(itemId, message, code, traceId, rejectFn) {
      const error = {
        itemId,
        message,
        code,
        traceId,
        suggestion: this._getSuggestion(code)
      };
      this._emit('purchaseFailed', error);
      rejectFn(error);
    },
  
    _failRefund(itemId, message, code, traceId, rejectFn) {
      const error = {
        itemId,
        message,
        code,
        traceId,
        suggestion: this._getSuggestion(code)
      };
      this._emit('refundFailed', error);
      rejectFn(error);
    },
  
    _getSuggestion(code) {
      const suggestions = {
        ITEM_NOT_FOUND: 'Verify the item ID.',
        ITEM_ALREADY_PURCHASED: 'Check purchase status before buying.',
        INSUFFICIENT_FUNDS: 'Top up user balance or choose cheaper item.',
        PAYMENT_TIMEOUT: 'Retry purchase or contact payment provider.',
        ITEM_NOT_PURCHASED: 'Cannot refund an item that wasn’t purchased.'
      };
      return suggestions[code] || 'See documentation for next steps.';
    },
  
    _generateTraceId(prefix) {
      return `${prefix}_${Math.random().toString(36).substr(2, 8)}`;
    }
  };
  