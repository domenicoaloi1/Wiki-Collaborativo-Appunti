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
                        In questa sezione puoi solo rinominare o eliminare gli elementi esistenti.
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
            const span = this._createElement('span', 'flex-grow-1 py-2 mx-2');
            const titoloAttuale = item.nome || item.titolo;
            span.textContent = titoloAttuale;
            
            if (callbacks.onSelect) {
                span.style.cursor = 'pointer';
                span.classList.add('fw-bold', 'text-primary');
                span.onclick = () => callbacks.onSelect(item.id, titoloAttuale);
            }
            
            const btnEdit = this._createElement('button', 'btn btn-outline-warning btn-sm border-0');
            btnEdit.innerHTML = '<i class="bi bi-pencil"></i>';
            btnEdit.onclick = (e) => {
                e.stopPropagation();
                let isSaving = false;
                const input = this._createElement('input', 'form-control form-control-sm flex-grow-1 mx-2');
                input.value = titoloAttuale;

                span.replaceWith(input);
                input.focus();
                input.select();

                const closeEdit = () => {
                    if (input.isConnected) {
                        input.replaceWith(span);
                    }
                };

                input.onkeydown = async (ev) => {
                    if (ev.key === 'Enter') {
                        const nuovoTitolo = input.value.trim();
                        if (nuovoTitolo && nuovoTitolo !== titoloAttuale) {
                            isSaving = true;
                            await callbacks.onEdit(item.id, nuovoTitolo);
                        }
                        closeEdit();
                    } else if (ev.key === 'Escape') {
                        closeEdit();
                    }
                };

                input.onblur = () => {
                    if (!isSaving) {
                        closeEdit();
                    }
                };
            };
            
            const btnDel = this._createElement('button', 'btn btn-outline-danger btn-sm border-0');
            btnDel.innerHTML = '<i class="bi bi-trash3"></i>';

            btnDel.onclick = (e) => {
                e.stopPropagation();                
                this.showConfirm(`Sei sicuro di voler eliminare definitivamente <strong>"${titoloAttuale}"</strong>?`, () => {
                    callbacks.onDelete(item.id);
                    this.showNotification("Richiesta di eliminazione inviata", "info");
                });
            };

            div.append(btnEdit, span, btnDel);
            list.appendChild(div);
        });
    }
}
