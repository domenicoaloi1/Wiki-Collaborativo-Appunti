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

            this.goToHome();
        } catch (error) {
            console.error(error);
            this.view.showError("Errore inizializzazione AppPresenter.");
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

                this.view.renderWelcomeUser(user, () => {
                    console.log("Click rilevato nel Presenter principale!"); // Log di test 1
                    this.handleShowAdminDashboard();
                });
                
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
        localStorage.removeItem('user');
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
            const res = await this.model.fetchVersionPreview(versioneId);
            this.view.showVersionPreview(res.testo, dataModifica);
        } catch (e) {
            this.view.showError("Impossibile caricare l'anteprima della versione.");
        }
    }

    async handleRestoreVersion(versioneId) {
        if (!confirm("Sei sicuro di voler ripristinare questa versione? Il testo attuale verrà archiviato e sostituito.")) return;
        try {
            const result = await this.model.restoreVersion(versioneId, this.model.currentUser.id);
            
            const textarea = document.querySelector('textarea');
            if (textarea) textarea.value = result.testo;
            
            this.view.hideHistory();
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

    // --- LIVELLO 1: CORSI ---
    async manageAdminCourses() {
        try {
            const courses = await this.model.fetchCorsi();
            this.view.renderAdminList(
                "Gestione Corsi",
                courses,
                null, // Nessun tasto indietro qui
                () => this.handleCreateCourse().then(() => this.manageAdminCourses()),
                (id) => this.handleDeleteCourse(id).then(() => this.manageAdminCourses()),
                (id, nome) => this.manageAdminTopics(id, nome) // Passa al livello 2
            );
        } catch (e) {
            this.view.showError("Errore caricamento corsi.");
        }
    }

    // --- LIVELLO 2: ARGOMENTI ---
    async manageAdminTopics(corsoId, corsoNome) {
        try {
            const topics = await this.model.fetchArgomenti(corsoId);
            this.view.renderAdminList(
                `Argomenti: ${corsoNome}`,
                topics,
                () => this.manageAdminCourses(), // Torna indietro ai corsi
                () => this.handleCreateArgomento(corsoId).then(() => this.manageAdminTopics(corsoId, corsoNome)),
                (id) => this.handleDeleteArgomento(id).then(() => this.manageAdminTopics(corsoId, corsoNome)),
                (id, nome) => this.manageAdminNotes(id, nome, corsoId, corsoNome) // Passa al livello 3
            );
        } catch (e) {
            this.view.showError("Errore caricamento argomenti.");
        }
    }

    // --- LIVELLO 3: APPUNTI ---
    async manageAdminNotes(argomentoId, argomentoNome, corsoId, corsoNome) {
        try {
            const notes = await this.model.fetchAppunti(argomentoId);
            this.view.renderAdminList(
                `Appunti: ${argomentoNome}`,
                notes,
                () => this.manageAdminTopics(corsoId, corsoNome), // Torna indietro agli argomenti
                () => this.showCreateNote(argomentoId).then(() => this.manageAdminNotes(argomentoId, argomentoNome, corsoId, corsoNome)),
                (id) => this.handleDeleteNote(id, argomentoId, argomentoNome).then(() => this.manageAdminNotes(argomentoId, argomentoNome, corsoId, corsoNome)),
                null // Livello finale: non si clicca ulteriormente per ora
            );
        } catch (e) {
            this.view.showError("Errore caricamento appunti.");
        }
    }

    // --- HANDLER PER CORSI ---
    async handleCreateCourse() {
        const nome = prompt("Inserisci il nome del nuovo corso:");
        const descrizione = prompt("Inserisci una breve descrizione:");
        
        if (nome && descrizione) {
            try {
                await this.model.createCourse(nome, descrizione);
                alert("Corso creato!");
                this.manageAdminCourses(); // Ricarica la lista per vedere la modifica
            } catch (e) {
                this.view.showError(e.message);
            }
        }
    }

    async handleDeleteCourse(id) {
        if (confirm("Sei sicuro? Eliminando il corso cancellerai anche tutti i suoi argomenti e appunti.")) {
            try {
                await this.model.deleteCourse(id);
                this.manageAdminCourses(); // Aggiorna la lista
            } catch (e) {
                this.view.showError(e.message);
            }
        }
    }

    // --- HANDLER PER ARGOMENTI ---
    async handleCreateArgomento(corsoId, corsoNome) {
        const nome = prompt("Nome del nuovo argomento:");
        if (nome) {
            try {
                await this.model.createArgomento(corsoId, nome);
                this.manageAdminTopics(corsoId, corsoNome); // Aggiorna lista argomenti
            } catch (e) {
                this.view.showError(e.message);
            }
        }
    }

    async handleDeleteArgomento(id, corsoId, corsoNome) {
        if (confirm("Eliminare questo argomento e tutti i suoi appunti?")) {
            try {
                await this.model.deleteArgomento(id); 
                this.manageAdminTopics(corsoId, corsoNome);
            } catch (e) {
                this.view.showError(e.message);
            }
        }
    }

    // --- HANDLER PER APPUNTI ---
    async handleDeleteNote(id, argId, argNome, corsoId, corsoNome) {
        if (confirm("Eliminare definitivamente questo appunto?")) {
            try {
                await this.model.deleteNote(id);
                this.manageAdminNotes(argId, argNome, corsoId, corsoNome); // Aggiorna lista appunti
            } catch (e) {
                this.view.showError(e.message);
            }
        }
    }

    handleShowAdminDashboard() {
        console.log("Sto passando al modulo Admin...");
        // Nascondiamo la sidebar se vogliamo "un'altra pagina" virtuale
        // document.getElementById('sidebar-wrapper').style.display = 'none';
        
        // Inizializziamo il presenter dedicato
        const admin = new AdminPresenter(this.model, this.view);
        admin.init();
    }

    goToHome() {
        console.log("Pulsante Home premuto!");
        const user = this.model.currentUser;
        console.log("Navigazione Home - Utente:", user ? user.nome : "Ospite");        
        
        if (!user) {
                console.warn("Nessun utente trovato, ritorno al login...");
                this.view.renderGuestWelcome(() => this.showLogin());                
                return;
        }
        // Usiamo il metodo che abbiamo già creato e rifinito
        this.view.renderWelcomeUser(user, () => {
            console.log("Utente trovato, inizializzo AdminPresenter dalla Home...");
            const adminPresenter = new AdminPresenter(this.model, this.view);
            adminPresenter.init();
        });
    }
}