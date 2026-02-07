// frontend/js/Presenter/AppPresenter.js
class AppPresenter {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.model.on('course:updated', () => this.init());
    }

    async init() {
        try {
            const courses = await this.model.fetchCorsi();

            this.view.renderHomeButton(() => this.goToHome());

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

    // --- LOGICA AUTH/NAVBAR ---
    
    bindNavbarEvents() {
        this.view.bindNavbarActions({
            onLogin: () => this.showLogin(),
            onRegister: () => this.showRegister(),
            onLogout: () => this.handleLogout()
        });
    }

    showLogin() {
        const authView = new AuthView();
        authView.renderLoginForm(async (email, password) => {
            try {
                const user = await this.model.login(email, password);
                this.view.updateNavbar(user);
                this.bindNavbarEvents();

                this.view.renderWelcomeUser(user, () => {
                    this.handleShowAdminDashboard();
                });

                authView.showSuccess("Login riuscito.");
                
            } catch (e) {
                authView.showError("Credenziali non valide.");
            }
        });
    }

    showRegister() {
        const authView = new AuthView();
        
        authView.renderRegisterForm(async (email, password) => {
            try {
                await this.model.register(email, password);
                
                authView.showSuccess("Registrazione ok! Ora accedi.");
                this.showLogin(); 
                
            } catch (e) {
                authView.showError(e.message);
            }
        });
    }

    async handleLogout() {
        try {
            await this.model.logout();
            this.view.showNotification("Logout avvenuto");
            location.reload(); 
            
        } catch (e) {
            console.error("Errore durante il logout:", e);
            location.reload();
        }
    }

    // --- LOGICA SIDEBAR ---

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
            const noteView = new NoteView();

            const onCreateAction = (this.model.currentUser?.ruolo === "studente") 
                ? () => this.showCreateNote(argId) 
                : null;

            noteView.renderList(
                appunti, 
                `Appunti: ${argNome}`, 
                (noteId) => this.handleViewNote(noteId),
                onCreateAction
            );

        } catch (e) {
            console.error(e);
            this.view.showError("Errore caricamento appunti.");
        }
    }
    
    async handleSearch(query) {
        if (query.length < 2) return;
        try {
            const results = await this.model.searchNotes(query);
            const noteView = new NoteView();
            noteView.renderList(results, `Risultati per: "${query}"`, (noteId) => {
                this.handleViewNote(noteId, null, null);
            });
        } catch (e) {
            console.error("Errore ricerca:", e);
        }
    }

    // --- LOGICA MAIN-CONTENT NOTE/VERSIONI STUDENTE AUTH ---

    async handleViewNote(noteId) {
        try {
            const note = await this.model.fetchNoteDetail(noteId);
            const isLogged = this.model.currentUser?.ruolo === "studente";

            const onSave = isLogged ? (testo) => this.handleSaveVersion(noteId, testo) : null;
            const onShowHistory = isLogged ? () => this.handleShowHistory(noteId) : null;            

            const noteView = new NoteView();
            noteView.renderNoteDetail(note, isLogged, onSave, onShowHistory);

        } catch (e) {
            this.view.showError("Impossibile caricare l'appunto.");
        }
    }

    async handleSaveVersion(noteId, testo) {
        try {
            await this.model.saveVersion(noteId, testo, this.model.currentUser.id);
            this.view.showSuccess("Nuova versione salvata con successo!");
        } catch (e) {
            this.view.showError(e.message);
        }
    }

    async handleShowHistory(noteId) {
        try {
            const history = await this.model.fetchStoria(noteId);
            const noteView = new NoteView();
            noteView.renderHistory(
                history, 
                (vId) => this.handleRestoreVersion(vId),
                (vId, date) => this.handlePreviewVersion(vId, date)
            );
        } catch (e) {
            this.view.showError("Errore nel caricamento della cronologia.");
        }
    }

    async handlePreviewVersion(versioneId, dataModifica) {
        try {
            const res = await this.model.fetchVersionPreview(versioneId);
            const noteView = new NoteView();
            noteView.showVersionPreview(res.testo, dataModifica);
        } catch (e) {
            this.view.showError("Impossibile caricare l'anteprima della versione.");
        }
    }

    async handleRestoreVersion(versioneId) {
        const messaggio = "Sei sicuro di voler ripristinare questa versione? Il testo attuale verrà archiviato e sostituito.";
        this.view.showConfirm(messaggio, async () => {
            try {
                const result = await this.model.restoreVersion(versioneId, this.model.currentUser.id);
                const textarea = document.querySelector('textarea');
                if (textarea) {
                    textarea.value = result.testo;
                }
                if (typeof this.view.hideHistory === 'function') {
                    this.view.hideHistory();
                }
                this.view.showSuccess("Versione ripristinata correttamente!");                
            } catch (e) {
                this.view.showError("Errore nel ripristino: " + e.message);
            }
        });
    }

    showCreateNote(argId) {
        const noteView = new NoteView();
        noteView.renderCreateNoteForm(argId, async (titolo, contenuto) => {
            try {
                const res = await this.model.createNote(argId, this.model.currentUser.id, titolo, contenuto);
                this.view.showSuccess("Appunto creato!");
                await this.handleViewNote(res.id);
            } catch (e) {
                this.view.showError(e.message);
            }
        });
    }

    // --- ADMIN ---

    handleShowAdminDashboard() {
        console.log("Sto passando al modulo Admin...");
        const adminView = new AdminView();        
        const adminPresenter = new AdminPresenter(this.model, adminView);
        adminPresenter.init();
    }

    goToHome() {
        const user = this.model.currentUser;
        
        if (!user) {
            this.view.renderGuestWelcome(() => this.showLogin());
            return;
        }

        this.view.renderWelcomeUser(user, () => {
            const adminView = new AdminView();
            const adminPresenter = new AdminPresenter(this.model, adminView);
            adminPresenter.init();
        });
    }

    // ----- Livello corsi

    async manageAdminCourses() {
        try {
            const courses = await this.model.fetchCorsi();
            this.view.renderAdminList(
                "Gestione Corsi",
                courses,
                null,
                () => this.handleCreateCourse().then(() => this.manageAdminCourses()),
                (id) => this.handleDeleteCourse(id).then(() => this.manageAdminCourses()),
                (id, nome) => this.manageAdminTopics(id, nome)
            );
        } catch (e) {
            this.view.showError("Errore caricamento corsi.");
        }
    }

    async handleCreateCourse() {
        const nome = prompt("Inserisci il nome del nuovo corso:");
        const descrizione = prompt("Inserisci una breve descrizione:");
        
        if (nome && descrizione) {
            try {
                await this.model.createCourse(nome, descrizione);
                this.view.showSuccess("Corso creato!");
                this.manageAdminCourses();
            } catch (e) {
                this.view.showError(e.message);
            }
        }
    }

    async handleDeleteCourse(id) {
        const messaggio = "Sei sicuro? <strong>Eliminando il corso cancellerai anche tutti i suoi argomenti e appunti.</strong>";
        this.view.showConfirm(messaggio, async () => {
            try {
                await this.model.deleteCourse(id);
                this.view.showSuccess("Corso e relativi contenuti eliminati.");
                this.manageAdminCourses(); 
            } catch (e) {
                this.view.showError("Impossibile eliminare il corso: " + e.message);
            }
        });
    }

    // ----- Livello argomenti

    async manageAdminTopics(corsoId, corsoNome) {
        try {
            const topics = await this.model.fetchArgomenti(corsoId);
            this.view.renderAdminList(
                `Argomenti: ${corsoNome}`,
                topics,
                () => this.manageAdminCourses(),
                () => this.handleCreateArgomento(corsoId).then(() => this.manageAdminTopics(corsoId, corsoNome)),
                (id) => this.handleDeleteArgomento(id).then(() => this.manageAdminTopics(corsoId, corsoNome)),
                (id, nome) => this.manageAdminNotes(id, nome, corsoId, corsoNome)
            );
        } catch (e) {
            this.view.showError("Errore caricamento argomenti.");
        }
    }

    async handleCreateArgomento(corsoId, corsoNome) {
        const nome = prompt("Nome del nuovo argomento:");
        if (nome) {
            try {
                await this.model.createArgomento(corsoId, nome);
                this.manageAdminTopics(corsoId, corsoNome);
            } catch (e) {
                this.view.showError(e.message);
            }
        }
    }

    async handleDeleteArgomento(id, corsoId, corsoNome) {
        const messaggio = "Sei sicuro di voler eliminare questo argomento? <strong>Verranno cancellati definitivamente anche tutti i suoi appunti.</strong>";
        this.view.showConfirm(messaggio, async () => {
            try {
                await this.model.deleteArgomento(id); 
                this.view.showSuccess("Argomento e appunti eliminati con successo.");
                this.manageAdminTopics(corsoId, corsoNome);
            } catch (e) {
                this.view.showError("Errore durante l'eliminazione: " + e.message);
            }
        });
    }

    // ----- Livello appunti

    async manageAdminNotes(argomentoId, argomentoNome, corsoId, corsoNome) {
        try {
            const notes = await this.model.fetchAppunti(argomentoId);
            this.view.renderAdminList(
                `Appunti: ${argomentoNome}`,
                notes,
                () => this.manageAdminTopics(corsoId, corsoNome),
                () => this.showCreateNote(argomentoId).then(() => this.manageAdminNotes(argomentoId, argomentoNome, corsoId, corsoNome)),
                (id) => this.handleDeleteNote(id, argomentoId, argomentoNome).then(() => this.manageAdminNotes(argomentoId, argomentoNome, corsoId, corsoNome)),
                null
            );
        } catch (e) {
            this.view.showError("Errore caricamento appunti.");
        }
    }

    async handleDeleteNote(id, argId, argNome, corsoId, corsoNome) {
        const messaggio = "Sei sicuro di voler eliminare definitivamente questo appunto?";
        this.view.showConfirm(messaggio, async () => {
            try {
                await this.model.deleteNote(id);
                this.view.showSuccess("Appunto eliminato correttamente.");
                this.manageAdminNotes(argId, argNome, corsoId, corsoNome);
            } catch (e) {
                this.view.showError("Errore durante l'eliminazione: " + e.message);
            }
        });
    }

}