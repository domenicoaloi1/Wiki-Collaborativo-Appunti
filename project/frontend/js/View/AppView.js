// frontend/js/View/AppView.js
class AppView {
    constructor() {
        this.sidebarContainer = document.getElementById('courses-list');
        this.mainContent = document.getElementById('main-content');
    }
    
    showError(msg) {
        alert("Errore: " + msg);
    }

    renderSidebar(courses, onCourseClick) {
        if (!this.sidebarContainer) return;
        this.sidebarContainer.innerHTML = ''; 

        courses.forEach(course => {
            const container = document.createElement('div');
            container.className = "course-group mb-2";

            const a = document.createElement('a');
            a.href = "#";
            a.className = "list-group-item list-group-item-action fw-bold course-link d-flex justify-content-between align-items-center";
            a.innerHTML = `<span>${course.nome}</span> <small class="text-muted">▾</small>`;
            a.dataset.id = course.id;

            const subList = document.createElement('div');
            subList.id = `args-course-${course.id}`;
            subList.className = "list-group list-group-flush ms-3 d-none";

            a.addEventListener('click', (e) => {
                e.preventDefault();
                subList.classList.toggle('d-none');
                onCourseClick(course.id);
            });

            container.appendChild(a);
            container.appendChild(subList);
            this.sidebarContainer.appendChild(container);
        });
    }

    renderArgomenti(courseId, argomenti, onArgomentoClick) {
        const subList = document.getElementById(`args-course-${courseId}`);
        if (!subList) return;

        subList.innerHTML = '';
        argomenti.forEach(arg => {
            const a = document.createElement('a');
            a.href = "#";
            a.className = "list-group-item list-group-item-action py-1 small";
            a.textContent = arg.nome;
            a.onclick = (e) => {
                e.preventDefault();
                onArgomentoClick(arg.id, arg.nome);
            };
            subList.appendChild(a);
        });
    }

    renderList(notes, contextTitle) {
        if (!this.mainContent) return;

        if (notes.length === 0) {
            this.mainContent.innerHTML = `
                <h2 class="mb-4 text-secondary">${contextTitle}</h2>
                <div class="alert alert-info">Nessun appunto trovato per questo argomento.</div>`;
            return;
        }

        let html = '<ul class="list-group shadow-sm">';
        notes.forEach(note => {
            html += `
                <li class="list-group-item d-flex justify-content-between align-items-center p-3">
                    <div>
                        <h5 class="mb-1">${note.titolo}</h5>
                        <small class="text-muted">Creato il: ${note.data_creazione}</small>
                    </div>
                    <button class="btn btn-primary btn-sm view-note" data-id="${note.id}">Leggi</button>
                </li>`;
        });
        html += '</ul>';

        this.mainContent.innerHTML = `<h2 class="mb-4 text-primary">${contextTitle}</h2>${html}`;
    }

    renderNoteDetail(note, onBackClick) {
        if (!this.mainContent) return;
        this.mainContent.innerHTML = `
            <div class="card border-0 shadow-sm">
                <div class="card-body p-4">
                    <button class="btn btn-outline-secondary btn-sm mb-3" id="btn-back">&larr; Torna alla lista</button>
                    <h1 class="h2 text-primary mb-1">${note.titolo}</h1>
                    <p class="text-muted small mb-4">Caricato il: ${note.data_creazione}</p>
                    <div class="note-body" style="white-space: pre-wrap; line-height: 1.6;">
                        ${note.contenuto || "<i>Nessun contenuto disponibile.</i>"}
                    </div>
                </div>
            </div>
        `;
        document.getElementById('btn-back').onclick = onBackClick;
    }

    bindSearch(handler) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => handler(e.target.value));
        }
    }
    
    renderLoginForm(onSubmit) {
        this.mainContent.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <div class="card shadow-sm">
                        <div class="card-body p-5">
                            <h2 class="text-center mb-4">Accedi a Wiki UNIPR</h2>
                            <form id="login-form">
                                <div class="mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" id="login-email" class="form-control" required placeholder="email">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Password</label>
                                    <input type="password" id="login-password" class="form-control" required placeholder="password">
                                </div>
                                <button type="submit" class="btn btn-primary w-100">Entra</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('login-form').onsubmit = (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            onSubmit(email, password);
        };
    }
    
    updateNavbar(user) {
        const btnContainer = document.querySelector('.navbar .d-flex');
        if (!btnContainer) return;

        if (user) {
            // Utente Loggato: Mostra Email e Logout
            btnContainer.innerHTML = `
                <span class="navbar-text me-3 text-light">
                    <i class="bi bi-person-circle"></i> ${user.email} (${user.ruolo})
                </span>
                <button class="btn btn-outline-light btn-sm" id="btn-logout">Logout</button>
            `;
        } else {
            // Utente Anonimo: Mostra Login e Registrati
            btnContainer.innerHTML = `
                <button class="btn btn-outline-light me-2" id="btn-login">Login</button>
                <button class="btn btn-primary" id="btn-register">Registrati</button>
            `;
        }
    }
}