// js/View/BaseView.js
class BaseView {
    constructor() {
        this.mainContent = document.getElementById('main-content');
    }

    _createElement(tag, className = "", attributes = {}) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        Object.entries(attributes).forEach(([key, value]) => el.setAttribute(key, value));
        return el;
    }

    _createInputGroup(labelTitle, id, type, placeholder = "") {
        const div = this._createElement('div', 'mb-3');
        const label = this._createElement('label', 'form-label');
        label.textContent = labelTitle;
        const input = this._createElement('input', 'form-control', { id, type, required: true, placeholder });
        div.append(label, input);
        return div;
    }

    showError(message) {
        alert(message);
    }
}