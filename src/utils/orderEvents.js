export const ORDER_STATUS_UPDATED = 'ORDER_STATUS_UPDATED';
export const orderEventEmitter = {
    listeners: {},
    
    emit(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => callback(data));
    },
    
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
        
        // Return cleanup function
        return () => {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        };
    }
};
