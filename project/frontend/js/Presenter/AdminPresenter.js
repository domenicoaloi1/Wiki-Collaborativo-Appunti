// frontend/js/Presenter/AdminPresenter.js
class AdminPresenter {
    constructor(model, view) {
        try{
            this.model = model;
            this.view = view;

            this.model.on('course:updated', () => this.init());
            this.model.on('arguments:updated', (id) => this.showTopics(id, this.currentCorsoNome));
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
            onSelect: (id, nome) => this.showTopics(id, nome),
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
            console.log("AdminPresenter.handleSaveCourse chiama model.createCourse");
            await this.model.createCourse(nome);
        } catch (e) {
            console.error("Errore salvataggio:", e);
        }
    }

    async handleDeleteCourse(id) {
        if (confirm("Vuoi eliminare questo corso?")) {
            try {
                console.log("AdminPresenter.handleDeleteCourse");
                await this.model.deleteCourse(id);
                this.init();
            } catch (e) {
                this.view.showError("Errore eliminazione: " + e.message);
            }
        }
    }

    // --- LOGICA ARGOMENTI ADMIN ---

    async showTopics(corsoId, corsoNome) {
        this.currentCorsoId = corsoId;
        this.currentCorsoNome = corsoNome;
        
        const topics = await this.model.fetchArgomenti(corsoId);
        this.view.renderAdminDashboard(`Argomenti di: ${corsoNome}`, topics, {
            onSave: (nome) => this.model.createArgomento(corsoId, nome),
            onDelete: (id) => this.model.deleteArgomento(id, corsoId),
            onSelect: (id, nome) => this.showNotes(id, nome, corsoId, corsoNome),
            onBack: () => this.init()
        });
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
            onDelete: (id) => this.model.deleteNote(id, argId),
            onSelect: null,
            onBack: () => this.showTopics(corsoId, corsoNome)
        });
    }


}