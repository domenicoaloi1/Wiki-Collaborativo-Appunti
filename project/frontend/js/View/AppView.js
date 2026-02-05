// frontend/js/View/AppView.js

class AppView {
    constructor() {
        this.sidebarContainer = document.getElementById('courses-list');
        this.mainContent = document.getElementById('main-content');
    }

    // --- HELPERS PRIVATI ---

    /**
     * Crea un elemento DOM in modo granulare
     */
    _createElement(tag, className = "", attributes = {}) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        Object.entries(attributes).forEach(([key, value]) => el.setAttribute(key, value));
        return el;
    }

    /**
     * Helper per creare gruppi di input Bootstrap
     */
    _createInputGroup(labelTitle, id, type, placeholder = "") {
        const div = this._createElement('div', 'mb-3');
        const label = this._createElement('label', 'form-label');
        label.textContent = labelTitle;
        const input = this._createElement('input', 'form-control', { id, type, required: true, placeholder });
        div.append(label, input);
        return div;
    }

    // --- RENDERING SIDEBAR ---

    renderSidebar(courses, onCourseClick) {
        if (!this.sidebarContainer) return;
        this.sidebarContainer.innerHTML = ''; 

        courses.forEach(course => {
            const container = this._createElement('div', 'course-group mb-2');

            const a = this._createElement('a', 'list-group-item list-group-item-action fw-bold course-link d-flex justify-content-between align-items-center', { href: '#' });
            
            const span = this._createElement('span');
            span.textContent = course.nome;
            
            const arrow = this._createElement('small', 'text-muted');
            arrow.textContent = '▾';

            a.append(span, arrow);

            const subList = this._createElement('div', 'list-group list-group-flush ms-3 d-none', { id: `args-course-${course.id}` });

            a.addEventListener('click', (e) => {
                e.preventDefault();
                subList.classList.toggle('d-none');
                onCourseClick(course.id);
            });

            container.append(a, subList);
            this.sidebarContainer.appendChild(container);
        });
    }

    renderArgomenti(courseId, argomenti, onArgomentoClick) {
        const subList = document.getElementById(`args-course-${courseId}`);
        if (!subList) return;

        subList.innerHTML = ''; 
        argomenti.forEach(arg => {
            const a = this._createElement('a', 'list-group-item list-group-item-action py-1 small', { href: '#' });
            a.textContent = arg.nome;
            
            a.onclick = (e) => {
                e.preventDefault();
                onArgomentoClick(arg.id, arg.nome);
            };
            subList.appendChild(a);
        });
    }

    // --- RENDERING MAIN CONTENT ---
    renderWelcomeUser(user, onAdminClick) {
        this.mainContent.innerHTML = '';
        const container = this._createElement('div', 'text-center mt-5 p-4');
        
        // Titolo di benvenuto
        const h2 = this._createElement('h2', 'mb-4');
        h2.textContent = "Bentornato!";
        container.appendChild(h2);

        // Creazione del box messaggi (alert)
        const messageBox = this._createElement('div', 'alert mx-auto w-50 d-flex align-items-center justify-content-center');
        
        if (user.ruolo === 'amministratore') {
            // Stile Admin: Box Giallo
            messageBox.classList.add('alert-warning');
            messageBox.innerHTML = '<i class="bi bi-shield-lock-fill me-2"></i>Console di amministrazione.';
            
            // Pulsante Gestione (solo per Admin)
            const btnAdmin = this._createElement('button', 'btn btn-primary mt-3 d-flex align-items-center mx-auto');
            btnAdmin.innerHTML = '<i class="bi bi-gear-fill me-2"></i>Gestione catalogo';
            btnAdmin.onclick = onAdminClick;
            
            container.append(messageBox, btnAdmin);
        } else {
            // Stile Studente: Box Blu
            messageBox.classList.add('alert-info');
            messageBox.innerHTML = '<i class="bi bi-info-circle-fill me-2"></i>Naviga tra i corsi o cerca un appunto.';
            
            container.appendChild(messageBox);
        }

        this.mainContent.appendChild(container);
    }
    renderList(notes, contextTitle, onNoteClick) {
        if (!this.mainContent) return;
        this.mainContent.innerHTML = '';

        const h2 = this._createElement('h2', 'mb-4 text-primary');
        h2.textContent = contextTitle;

        if (notes.length === 0) {
            const alert = this._createElement('div', 'alert alert-info');
            alert.textContent = "Nessun appunto trovato.";
            this.mainContent.append(h2, alert);
            return;
        }

        const ul = this._createElement('ul', 'list-group shadow-sm');
        notes.forEach(note => {
            const li = this._createElement('li', 'list-group-item d-flex justify-content-between align-items-center p-3');
            
            const infoDiv = this._createElement('div');
            const h5 = this._createElement('h5', 'mb-1');
            h5.textContent = note.titolo;
            const small = this._createElement('small', 'text-muted');
            small.textContent = `Creato il: ${note.data_creazione}`;
            infoDiv.append(h5, small);

            const btn = this._createElement('button', 'btn btn-primary btn-sm');
            btn.textContent = "Leggi";
            btn.onclick = () => onNoteClick(note.id);

            li.append(infoDiv, btn);
            ul.appendChild(li);
        });

        this.mainContent.append(h2, ul);
    }

    renderNoteDetail(note, canEdit, onSaveVersion, onShowHistory) {
        this.mainContent.innerHTML = '';
        const container = this._createElement('div', 'note-container p-4');

        const title = this._createElement('h2', 'mb-3');
        title.textContent = note.titolo;

        // Area di testo per il contenuto
        const textarea = this._createElement('textarea', 'form-control mb-3', { 
            rows: 15,
            placeholder: 'Contenuto dell\'appunto...'
        });
        textarea.value = note.contenuto;

        // LOGICA DI SOLA LETTURA
        if (!canEdit) {
            textarea.setAttribute('readonly', 'true');
            textarea.classList.add('bg-light'); // Grigio chiaro per feedback visivo
        }

        const btnGroup = this._createElement('div', 'd-flex gap-2 mb-4');

        // Mostriamo il tasto salva solo se l'utente può editare
        if (canEdit && onSaveVersion) {
            const btnSave = this._createElement('button', 'btn btn-success');
            btnSave.textContent = 'Salva Nuova Versione';
            btnSave.onclick = () => onSaveVersion(textarea.value);
            btnGroup.appendChild(btnSave);
        }

        const btnHistory = this._createElement('button', 'btn btn-outline-primary');
        btnHistory.textContent = 'Vedi Cronologia';
        btnHistory.onclick = () => onShowHistory();
        btnGroup.appendChild(btnHistory);

        container.append(title, textarea, btnGroup);
        
        // Contenitore per la storia
        const historyContainer = this._createElement('div', 'history-section mt-4', { id: 'history-list' });
        container.appendChild(historyContainer);

        this.mainContent.appendChild(container);
    }

    // --- FORMS (LOGIN & REGISTER) ---

    renderLoginForm(onSubmit) {
        this._renderFormCard("Accedi al Sistema", "login-form", [
            { label: "Email", id: "login-email", type: "email" },
            { label: "Password", id: "login-password", type: "password" }
        ], "Entra", "btn-primary", onSubmit);
    }

    renderRegisterForm(onSubmit) {
        this._renderFormCard("Crea un Account", "register-form", [
            { label: "Email Universitaria", id: "reg-email", type: "email", placeholder: "nome@studenti.unipr.it" },
            { label: "Password", id: "reg-password", type: "password" }
        ], "Registrati", "btn-success", onSubmit);
    }

    /**
     * Helper generico per renderizzare le card dei form
     */
    _renderFormCard(titleText, formId, fields, btnText, btnClass, onSubmit) {
        if (!this.mainContent) return;
        this.mainContent.innerHTML = '';

        const row = this._createElement('div', 'row justify-content-center py-5');
        const col = this._createElement('div', 'col-md-5');
        const card = this._createElement('div', 'card shadow border-0');
        const cardBody = this._createElement('div', 'card-body p-5');
        
        const title = this._createElement('h3', 'text-center mb-4');
        title.textContent = titleText;

        const form = this._createElement('form', '', { id: formId });

        fields.forEach(f => {
            form.appendChild(this._createInputGroup(f.label, f.id, f.type, f.placeholder));
        });

        const submitBtn = this._createElement('button', `btn ${btnClass} w-100`, { type: 'submit' });
        submitBtn.textContent = btnText;

        form.appendChild(submitBtn);
        cardBody.append(title, form);
        card.appendChild(cardBody);
        col.appendChild(card);
        row.appendChild(col);
        this.mainContent.appendChild(row);

        form.onsubmit = (e) => {
            e.preventDefault();
            const values = fields.map(f => document.getElementById(f.id).value);
            onSubmit(...values);
        };
    }

    updateNavbar(user) {
        const btnContainer = document.querySelector('.navbar .d-flex');
        if (!btnContainer) return;
        btnContainer.innerHTML = '';

        if (user) {
            const userInfo = this._createElement('span', 'navbar-text me-3 text-light');
            userInfo.textContent = `👤 ${user.email} (${user.ruolo})`;
            
            const btnLogout = this._createElement('button', 'btn btn-outline-light btn-sm', { id: 'btn-logout' });
            btnLogout.textContent = 'Logout';
            
            btnContainer.append(userInfo, btnLogout);
        } else {
            const btnLogin = this._createElement('button', 'btn btn-outline-light me-2', { id: 'btn-login' });
            btnLogin.textContent = 'Login';
            
            const btnReg = this._createElement('button', 'btn btn-primary', { id: 'btn-register' });
            btnReg.textContent = 'Registrati';
            
            btnContainer.append(btnLogin, btnReg);
        }
    }

    showError(msg) {
        alert("Errore: " + msg);
    }

    bindSearch(handler) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => handler(e.target.value));
        }
    }

    renderHistory(versions, onRestore, onRead) {
        const container = document.getElementById('history-list');
        if (!container) return;
        
        container.innerHTML = ''; // Pulizia contenuto precedente

        const h4 = this._createElement('h4', 'mb-3 border-top pt-3');
        h4.textContent = 'Cronologia Versioni';
        container.appendChild(h4);

        // CONTROLLO CRONOLOGIA VUOTA
        if (!versions || versions.length === 0) {
            const emptyMsg = this._createElement('div', 'alert alert-warning');
            emptyMsg.textContent = 'Nessuna versione precedente disponibile.';
            container.appendChild(emptyMsg);
            return;
        }

        // Se ci sono versioni, procedi con la creazione della lista
        const list = this._createElement('ul', 'list-group');
        versions.forEach(v => {
            const li = this._createElement('li', 'list-group-item d-flex justify-content-between align-items-center');
            
            const info = this._createElement('div');
            info.innerHTML = `<strong>${v.data_modifica}</strong><br><small class="text-muted">Autore: ${v.autore}</small>`;
            
            const actions = this._createElement('div', 'btn-group');
            
            const btnRead = this._createElement('button', 'btn btn-sm btn-outline-info');
            btnRead.textContent = 'Leggi';
            btnRead.onclick = () => onRead(v.id, v.data_modifica);

            const btnRestore = this._createElement('button', 'btn btn-sm btn-warning');
            btnRestore.textContent = 'Ripristina';
            btnRestore.onclick = () => onRestore(v.id);

            actions.append(btnRead, btnRestore);
            li.append(info, actions);
            list.appendChild(li);
        });

        container.appendChild(list);
    }

    showVersionPreview(testo, data) {
        // Rimuoviamo eventuali anteprime precedenti
        const oldPreview = document.getElementById('version-preview-box');
        if (oldPreview) oldPreview.remove();

        const previewBox = this._createElement('div', 'alert alert-info mt-3', { id: 'version-preview-box' });
        previewBox.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h5>Visualizzazione versione del: ${data}</h5>
                <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
            <hr>
            <pre style="white-space: pre-wrap;">${testo}</pre>
            <div class="text-end mt-2">
                <small><i>Visualizzazione in sola lettura.</i></small>
            </div>
        `;
        
        document.getElementById('history-list').prepend(previewBox);
        previewBox.scrollIntoView({ behavior: 'smooth' });
    }

    renderCreateNoteForm(argomentoId, onSubmit) {
        this.mainContent.innerHTML = '';
        const container = this._createElement('div', 'p-4');
        const h2 = this._createElement('h2', 'mb-4');
        h2.textContent = 'Crea Nuovo Appunto';

        const form = this._createElement('form');
        const titleGroup = this._createInputGroup('Titolo Appunto', 'note-title', 'text', 'Inserisci titolo...');
        const contentGroup = this._createElement('div', 'mb-3');
        const label = this._createElement('label', 'form-label');
        label.textContent = 'Contenuto (Markdown)';
        const text = this._createElement('textarea', 'form-control', { id: 'note-content', rows: 10 });
        contentGroup.append(label, text);

        const btn = this._createElement('button', 'btn btn-primary', { type: 'submit' });
        btn.textContent = 'Pubblica Appunto';

        form.append(titleGroup, contentGroup, btn);
        form.onsubmit = (e) => {
            e.preventDefault();
            onSubmit(document.getElementById('note-title').value, text.value);
        };

        container.append(h2, form);
        this.mainContent.appendChild(container);
    }

    renderAdminList(title, items, onBack, onAdd, onDelete, onSelectItem) {
        this.mainContent.innerHTML = '';
        const container = this._createElement('div', 'p-4');

        // Header con tasto Indietro (se non siamo al livello Corsi) e Titolo
        const header = this._createElement('div', 'd-flex align-items-center mb-4');
        if (onBack) {
            const btnBack = this._createElement('button', 'btn btn-outline-secondary btn-sm me-3');
            btnBack.innerHTML = '<i class="bi bi-arrow-left"></i>';
            btnBack.onclick = onBack;
            header.appendChild(btnBack);
        }
        const h2 = this._createElement('h2', 'm-0');
        h2.textContent = title;
        header.appendChild(h2);

        // Tasto Aggiungi
        const btnAdd = this._createElement('button', 'btn btn-success btn-sm mb-3 d-inline-flex align-items-center');
        btnAdd.innerHTML = `<i class="bi bi-plus-lg me-1"></i>Aggiungi`;
        btnAdd.onclick = onAdd;
        const btnWrapper = this._createElement('div', 'text-end'); // o 'text-end' se lo preferisci a destra
        btnWrapper.appendChild(btnAdd);

        // Lista degli elementi
        const list = this._createElement('div', 'list-group shadow-sm');
        items.forEach(item => {
            const div = this._createElement('div', 'list-group-item d-flex justify-content-between align-items-center');
            
            // Nome cliccabile (se c'è un'azione di selezione, es. per scendere di livello)
            const label = this._createElement('span', 'flex-grow-1 py-2');
            label.textContent = item.nome || item.titolo;
            if (onSelectItem) {
                label.style.cursor = 'pointer';
                label.classList.add('fw-bold', 'text-primary');
                label.onclick = () => onSelectItem(item.id, item.nome || item.titolo);
            }

            // Tasto Elimina (Cestino rosso)
            const btnDel = this._createElement('button', 'btn btn-outline-danger border-0');
            btnDel.innerHTML = '<i class="bi bi-trash3"></i>';
            btnDel.onclick = () => onDelete(item.id);

            div.append(label, btnDel);
            list.appendChild(div);
        });

        container.append(header, btnWrapper, list);
        this.mainContent.appendChild(container);
    }
}