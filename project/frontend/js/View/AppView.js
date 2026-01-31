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

    renderNoteDetail(note, onBackClick) {
        if (!this.mainContent) return;
        this.mainContent.innerHTML = '';

        const card = this._createElement('div', 'card border-0 shadow-sm');
        const cardBody = this._createElement('div', 'card-body p-4');

        const btnBack = this._createElement('button', 'btn btn-outline-secondary btn-sm mb-3');
        btnBack.textContent = '← Torna alla lista';
        btnBack.onclick = onBackClick;

        const h1 = this._createElement('h1', 'h2 text-primary mb-1');
        h1.textContent = note.titolo;

        const meta = this._createElement('p', 'text-muted small mb-4');
        meta.textContent = `Caricato il: ${note.data_creazione}`;

        const body = this._createElement('div', 'note-body', { style: 'white-space: pre-wrap; line-height: 1.6;' });
        body.textContent = note.contenuto || "Nessun contenuto disponibile.";

        cardBody.append(btnBack, h1, meta, body);
        card.appendChild(cardBody);
        this.mainContent.appendChild(card);
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
}