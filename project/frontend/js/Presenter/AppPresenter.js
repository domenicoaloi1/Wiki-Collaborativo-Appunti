// frontend/js/Presenter/AppPresenter.js

class AppPresenter {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    async init() {
        try {
            const courses = await this.model.fetchCorsi();

            this.view.renderSidebar(courses, (id) => this.handleCourseSelection(id));
            
            this.view.bindSearch((query) => this.handleSearch(query));
            
            this.view.updateNavbar(this.model.currentUser);
            
            this.bindNavbarEvents();
        } catch (error) {
            this.view.showError("Errore inizializzazione.");
        }
    }

    bindNavbarEvents() {
        const btnLogin = document.getElementById('btn-login');
        if (btnLogin) btnLogin.onclick = () => this.showLogin();

        const btnRegister = document.getElementById('btn-register');
        if (btnRegister) btnRegister.onclick = () => this.showRegister();

        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) btnLogout.onclick = () => this.handleLogout();
    }

    // --- LOGICA CORSI E ARGOMENTI ---

    async handleCourseSelection(courseId) {
        try {
            const argomenti = await this.model.fetchArgomenti(courseId);
            this.view.renderArgomenti(courseId, argomenti, (argId, argNome) => 
                this.handleArgomentoSelection(argId, argNome)
            );
        } catch (e) {
            this.view.showError("Errore nel caricamento degli argomenti.");
        }
    }

    async handleArgomentoSelection(argId, argNome) {
        try {
            const notes = await this.model.fetchAppunti(argId);
            this.view.renderList(notes, `Argomento: ${argNome}`, (noteId) => {
                this.handleViewNote(noteId, argId, argNome);
            });
        } catch (e) {
            this.view.showError("Errore nel caricamento degli appunti.");
        }
    }

    async handleViewNote(noteId, argId, argNome) {
        try {
            const note = await this.model.fetchNoteDetail(noteId);
            this.view.renderNoteDetail(note, () => {
                this.handleArgomentoSelection(argId, argNome);
            });
        } catch (e) {
            this.view.showError("Errore nel caricamento del dettaglio.");
        }
    }

    // --- LOGICA AUTH ---

    showLogin() {
        this.view.renderLoginForm(async (email, password) => {
            try {
                const user = await this.model.login(email, password);
                this.view.updateNavbar(user);
                this.bindNavbarEvents();
                this.view.renderList([], "Bentornato!"); 
            } catch (e) {
                this.view.showError("Credenziali non valide.");
            }
        });
    }

    showRegister() {
        this.view.renderRegisterForm(async (email, password) => {
            try {
                const response = await fetch(`${this.model.apiBase}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                if (!response.ok) throw new Error("Registrazione fallita");
                alert("Registrazione ok! Ora accedi.");
                this.showLogin();
            } catch (e) {
                this.view.showError(e.message);
            }
        });
    }

    handleLogout() {
        this.model.currentUser = null;
        this.view.updateNavbar(null);
        this.bindNavbarEvents();
        location.reload(); 
    }

    async handleSearch(query) {
        if (query.length < 2) return;
        try {
            const results = await this.model.searchNotes(query);
            this.view.renderList(results, `Risultati per: "${query}"`, (noteId) => {
                this.handleViewNote(noteId, null, null);
            });
        } catch (e) {
            console.error("Errore ricerca:", e);
        }
    }
}