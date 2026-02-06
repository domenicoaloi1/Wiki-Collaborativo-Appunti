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

    // --- TOAST ---

    showError(message) {
        this._showNotification(message, 'danger');
    }
    showNotification(message) {
        this._showNotification(message);
    }
    showSuccess(message) {
        this._showNotification(message, 'success');
    }

    _showNotification(message, type = 'info') {
        const container = document.getElementById('toastPlacement');
        if (!container) return;

        const toastEl = this._createElement('div', `toast align-items-center text-white bg-${type} border-0 animate__animated animate__fadeInUp`, {
            'role': 'alert',
            'aria-live': 'assertive',
            'aria-atomic': 'true'
        });

        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${type === 'danger' ? '<i class="bi bi-exclamation-triangle-fill me-2"></i>' : ''}
                    ${type === 'success' ? '<i class="bi bi-check-circle-fill me-2"></i>' : ''}
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;

        container.appendChild(toastEl);

        const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
        toast.show();

        toastEl.addEventListener('hidden.bs.toast', () => {
            toastEl.remove();
        });
    }
}