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
            const appunti = await this.model.fetchAppunti(argId);
            this.view.renderList(appunti, `Appunti: ${argNome}`, (noteId) => {
                this.handleViewNote(noteId);
            });

            // Se l'utente è loggato, aggiungiamo il tasto per creare un nuovo appunto
            if (this.model.currentUser) {
                const btnCreate = document.createElement('button');
                btnCreate.className = 'btn btn-primary mt-3';
                btnCreate.textContent = '+ Crea Nuovo Appunto';
                btnCreate.onclick = () => this.showCreateNote(argId);
                document.getElementById('main-content').appendChild(btnCreate);
            }
        } catch (e) {
            this.view.showError("Errore caricamento appunti.");
        }
    }

    async handleViewNote(noteId) {
        try {
            const note = await this.model.fetchNoteDetail(noteId);
            
            // Verifichiamo se l'utente è loggato
            const isLogged = this.model.currentUser !== null;

            // Passiamo isLogged come parametro canEdit
            const onSave = isLogged ? (testo) => this.handleSaveVersion(noteId, testo) : null;
            const onShowHistory = () => this.handleShowHistory(noteId);

            // La View riceve il permesso di editing (isLogged)
            this.view.renderNoteDetail(note, isLogged, onSave, onShowHistory);

        } catch (e) {
            this.view.showError("Impossibile caricare l'appunto.");
        }
    }

    // --- LOGICA AUTH ---

    showLogin() {
        this.view.renderLoginForm(async (email, password) => {
            try {
                const user = await this.model.login(email, password);
                this.view.updateNavbar(user);
                this.bindNavbarEvents();
                this.view.renderWelcomeUser("Bentornato!");  
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

    async handleSaveVersion(noteId, testo) {
        try {
            await this.model.saveVersion(noteId, testo, this.model.currentUser.id);
            alert("Nuova versione salvata con successo!");
        } catch (e) {
            this.view.showError(e.message);
        }
    }

    async handleShowHistory(noteId) {
        try {
            const history = await this.model.fetchStoria(noteId);
            this.view.renderHistory(
                history, 
                (vId) => this.handleRestoreVersion(vId), // Callback Ripristina
                (vId, date) => this.handlePreviewVersion(vId, date) // Callback Leggi
            );
        } catch (e) {
            this.view.showError("Errore nel caricamento della cronologia.");
        }
    }

    async handlePreviewVersion(versioneId, dataModifica) {
        try {
            const testo = await this.model.restoreVersion(versioneId);
            this.view.showVersionPreview(testo.testo, dataModifica);
        } catch (e) {
            this.view.showError("Impossibile caricare l'anteprima della versione.");
        }
    }

    async handleRestoreVersion(versioneId) {
        if (!confirm("Sei sicuro di voler ripristinare questa versione? Il testo attuale verrà sostituito.")) return;
        try {
            const result = await this.model.restoreVersion(versioneId);
            // Aggiorniamo la textarea con il testo ripristinato
            const textarea = document.querySelector('textarea');
            if (textarea) textarea.value = result.testo;
            alert("Versione ripristinata correttamente!");
        } catch (e) {
            this.view.showError(e.message);
        }
    }

    showCreateNote(argId) {
        this.view.renderCreateNoteForm(argId, async (titolo, contenuto) => {
            try {
                const res = await this.model.createNote(argId, this.model.currentUser.id, titolo, contenuto);
                alert("Appunto creato!");
                await this.handleViewNote(res.id);
            } catch (e) {
                this.view.showError(e.message);
            }
        });
    }
}