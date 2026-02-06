// js/Patterns/EventEmitter.js
class EventEmitter {
    constructor() {
        this._events = {};
    }

    // Registra un listener per un evento
    on(eventName, listener) {
        if (!this._events[eventName]) {
            this._events[eventName] = [];
        }
        this._events[eventName].push(listener);
    }

    // Notifica tutti i listener registrati
    emit(eventName, ...args) {
        if (!this._events[eventName]) return;
        this._events[eventName].forEach(listener => {
            listener(...args);
        });
    }
}