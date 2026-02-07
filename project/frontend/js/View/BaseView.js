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

    // --- CONFIRM ---

    showConfirm(message, onConfirm) {
        const oldModal = document.getElementById('dynamicConfirmModal');
        if (oldModal) oldModal.remove();

        const modalHtml = `
            <div class="modal fade" id="dynamicConfirmModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title"><i class="bi bi-exclamation-triangle me-2"></i>Conferma Azione</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body p-4">
                            <p class="fs-5 mb-0">${message}</p>
                        </div>
                        <div class="modal-footer border-0">
                            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Annulla</button>
                            <button type="button" id="btn-modal-confirm" class="btn btn-danger px-4">Elimina</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const modalElement = document.getElementById('dynamicConfirmModal');
        const bsModal = new bootstrap.Modal(modalElement);
        
        document.getElementById('btn-modal-confirm').onclick = () => {
            onConfirm();
            bsModal.hide();
        };

        bsModal.show();

        modalElement.addEventListener('hidden.bs.modal', () => {
            modalElement.remove();
        });
    }
}