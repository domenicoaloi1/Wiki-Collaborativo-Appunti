// frontend/js/Presenter/AdminPresenter.js
class AdminPresenter {
    constructor(model, view) {
        try{
            this.model = model;
            this.view = view;

            this.model.on('course:updated', () => this.init());
            this.model.on('arguments:updated', (id) => this.showArgomenti(id, this.currentCorsoNome));
            this.model.on('note:updated', (id) => this.showNotes(id, this.currentArgNome, this.currentCorsoId, this.currentCorsoNome));
        } catch (error) {
            console.error(error);
            this.view.showError("Errore inizializzazione AdminPresenter.");
        }
    }

    async init() {
        this.currentCorsoId = null;
        const courses = await this.model.fetchCorsi();
        this.view.renderAdminDashboard("Gestione Corsi", courses, {
            onSave: (nome) => this.handleSaveCourse(nome),
            onDelete: (id) => this.handleDeleteCourse(id),
            onSelect: (id, nome) => this.showArgomenti(id, nome),
            onEdit: (id, nome) => this.handleEditCourse(id, nome),
            onBack: null
        });
    }
    
    // --- LOGICA CORSI ADMIN ---

    async handleSaveCourse(nome) {
        if (!nome || nome.trim().length < 3) {
            this.view.showNotification("Il nome del corso è troppo corto!");
            return;
        }
        try {
            await this.model.createCourse(nome);
            this.view.showSuccess("Corso creato correttamente");
        } catch (e) {
            this.view.showError("Errore salvataggio: " + e.message);
        }
    }

    async handleDeleteCourse(id) {
        try {
            await this.model.deleteCourse(id);
            this.view.showSuccess("Corso cancellato correttamente");
        } catch (e) {
            this.view.showError("Errore eliminazione: " + e.message);
        }
    }
    
    async handleEditCourse(id, nuovoNome) {
        if (!nuovoNome || nuovoNome.trim().length < 3) {
            this.view.showNotification("Il nome del corso è troppo corto!");
            return;
        }
        try {
            await this.model.renameCourse(id, nuovoNome);
            this.view.showSuccess("Titolo corso aggiornato correttamente");
        } catch (e) {
            this.view.showNotification("Errore: " + e.message, "danger");
        }
    }

    // --- LOGICA ARGOMENTI ADMIN ---

    async showArgomenti(corsoId, corsoNome) {
        this.currentCorsoId = corsoId;
        this.currentCorsoNome = corsoNome;
        
        const topics = await this.model.fetchArgomenti(corsoId);
        this.view.renderAdminDashboard(`Argomenti di: ${corsoNome}`, topics, {
            onSave: (nome) => this.handleSaveArgument(corsoId, nome),
            onDelete: (id) => this.handleDeleteArgument(id, corsoId),
            onSelect: (id, nome) => this.showNotes(id, nome, corsoId, corsoNome),
            onEdit: (id, nome) => this.handleEditArgument(id, nome),
            onBack: () => this.init()
        });
    }
    
    async handleSaveArgument(corsoId, nome) {
        try {
            await this.model.createArgomento(corsoId, nome);
            this.view.showSuccess("Argomento creato correttamente");
        } catch (e) {
            this.view.showError("Errore salvataggio: " + e.message);
        }
    }

    async handleDeleteArgument(id, corsoId) {
        try {
            await this.model.deleteArgomento(id, corsoId);
            this.view.showSuccess("Argomento cancellato correttamente");
        } catch (e) {
            this.view.showError("Errore eliminazione: " + e.message);
        }
    }

    async handleEditArgument(id, nuovoNome) {
        if (!nuovoNome || nuovoNome.trim().length < 3) {
            this.view.showNotification("Nome troppo corto!");
            return;
        }
        try {
            await this.model.renameArgomento(id, nuovoNome, this.currentCorsoId);
            this.view.showSuccess("Titolo argomento aggiornato correttamente");
        } catch (e) {
            this.view.showNotification("Errore: " + e.message, "danger");
        }
    }

    // --- LOGICA NOTE ADMIN ---

    async showNotes(argId, argNome, corsoId, corsoNome) {
        this.currentArgId = argId;
        this.currentArgNome = argNome;
        this.currentCorsoId = corsoId;
        this.currentCorsoNome = corsoNome;

        const notes = await this.model.fetchAppunti(argId);
        this.view.renderAdminDashboard(`Appunti di: ${argNome}`, notes, {
            onSave: null,
            onDelete: (id) => this.handleDeleteNote(id, argId),
            onSelect: null,
            onEdit: (id, nome) => this.handleEditNoteTitle(id, nome),
            onBack: () => this.showArgomenti(corsoId, corsoNome)
        });
    }
    
    async handleDeleteNote(id, argId) {
        try {
            await this.model.deleteNote(id, argId);
            this.view.showSuccess("Appunto eliminato correttamente");
        } catch (e) {
            this.view.showError("Errore eliminazione: " + e.message);
        }
    }

    async handleEditNoteTitle(id, nuovoNome) {
        if (!nuovoNome || nuovoNome.trim().length < 3) {
            this.view.showNotification("Nome troppo corto!");
            return;
        }
        try {
            await this.model.renameNote(id, nuovoNome, this.currentArgId);
            this.view.showSuccess("Titolo appunto aggiornato correttamente");
        } catch (e) {
            this.view.showNotification("Errore: " + e.message, "danger");
        }
    }

}