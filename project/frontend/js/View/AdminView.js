// js/View/AdminView.js
class AdminView extends BaseView {
    constructor() {
        super();
    }

    renderAdminDashboard(title, items, callbacks) {
        const showAddForm = callbacks.onSave !== null && callbacks.onSave !== undefined;

        this.mainContent.innerHTML = `
            <div class="p-4 bg-light border-bottom mb-4 d-flex align-items-center">
                ${callbacks.onBack ? '<button id="btn-admin-back" class="btn btn-outline-secondary btn-sm me-3"><i class="bi bi-arrow-left"></i></button>' : ''}
                <h2 class="text-primary m-0"><i class="bi bi-gear-fill me-2"></i>${title}</h2>
            </div>
            <div class="container">
                ${showAddForm ? `
                    <div class="card mb-4 shadow-sm border-primary animate__animated animate__fadeIn">
                        <div class="card-body">
                            <label class="form-label fw-bold">Aggiungi nuovo elemento:</label>
                            <div class="input-group">
                                <input type="text" id="admin-input-name" class="form-control" placeholder="Inserisci nome...">
                                <button id="btn-admin-save" class="bi bi-plus-circle me-2 btn btn-success"> Aggiungi</button>
                            </div>
                        </div>
                    </div>
                ` : `
                    <div class="alert alert-info mb-4 shadow-sm">
                        <i class="bi bi-info-circle-fill me-2"></i> 
                        In questa sezione puoi solo moderare o eliminare gli elementi esistenti.
                    </div>
                `}
                <div class="list-group shadow-sm" id="admin-data-list"></div>
            </div>
        `;

        if (callbacks.onBack) document.getElementById('btn-admin-back').onclick = callbacks.onBack;
        
        if (showAddForm) {
            document.getElementById('btn-admin-save').onclick = () => {
                const val = document.getElementById('admin-input-name').value.trim();
                if (val) {
                    callbacks.onSave(val);
                    document.getElementById('admin-input-name').value = '';
                }
            };
        }

        const list = document.getElementById('admin-data-list');
        items.forEach(item => {
            const div = this._createElement('div', 'list-group-item d-flex justify-content-between align-items-center');
            const span = this._createElement('span', 'flex-grow-1 py-2');
            span.textContent = item.nome || item.titolo; 
            
            if (callbacks.onSelect) {
                span.style.cursor = 'pointer';
                span.classList.add('fw-bold', 'text-primary');
                span.onclick = () => callbacks.onSelect(item.id, item.nome || item.titolo);
            }

            const btnDel = this._createElement('button', 'btn btn-outline-danger btn-sm border-0');
            btnDel.innerHTML = '<i class="bi bi-trash3"></i>';

            btnDel.onclick = () => {
                const nomeElemento = item.nome || item.titolo;
                
                this.showConfirm(`Sei sicuro di voler eliminare definitivamente <strong>"${nomeElemento}"</strong>?`, () => {
                    callbacks.onDelete(item.id);
                    this.showNotification("Richiesta di eliminazione inviata", "info");
                });
            };

            div.append(span, btnDel);
            list.appendChild(div);
        });
    }
}