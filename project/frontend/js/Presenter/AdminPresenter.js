// frontend/js/Presenter/AdminPresenter.js
class AdminPresenter {
    constructor(model, view) {
        try{
            this.model = model;
            this.view = view;

            this.model.on('course:created', () => this.init());
            this.model.on('topic:updated', (id) => this.showTopics(id, this.currentCorsoNome));
            
            // Observer per gli Appunti
            this.model.on('note:updated', (id) => this.showNotes(id, this.currentArgNome, this.currentCorsoId, this.currentCorsoNome));
        } catch (error) {
            console.error(error);
            this.view.showError("Errore inizializzazione AdminPresenter.");
        }
    }
    
    async handleSaveCourse(nome) {
        if (!nome || nome.trim().length < 3) {
            alert("Il nome del corso è troppo corto!");
            return;
        }

        try {
            console.log("AdminPresenter.handleSaveCourse");
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

    // LIVELLO 1: Lista Corsi
    async init() {
        this.currentCorsoId = null;
        const courses = await this.model.fetchCorsi();
        this.view.renderAdminDashboard("Gestione Corsi", courses, {
            onSave: (nome) => this.model.createCourse(nome, "Descrizione"),
            onDelete: (id) => this.handleDeleteCourse(id),
            onSelect: (id, nome) => this.showTopics(id, nome), // Cliccando sul nome
            onBack: null // Siamo al primo livello
        });
    }

    // LIVELLO 2: Lista Argomenti
    async showTopics(corsoId, corsoNome) {
        this.currentCorsoId = corsoId;
        this.currentCorsoNome = corsoNome;
        
        const topics = await this.model.fetchArgomenti(corsoId);
        this.view.renderAdminDashboard(`Argomenti di: ${corsoNome}`, topics, {
            onSave: (nome) => this.model.createArgomento(corsoId, nome),
            onDelete: (id) => this.model.deleteArgomento(id, corsoId),
            onSelect: (id, nome) => this.showNotes(id, nome, corsoId, corsoNome),
            onBack: () => this.init() // Torna ai corsi
        });
    }

    // LIVELLO 3: Lista Appunti
    async showNotes(argId, argNome, corsoId, corsoNome) {
        this.currentArgId = argId;
        this.currentArgNome = argNome;
        this.currentCorsoId = corsoId;
        this.currentCorsoNome = corsoNome;

        const notes = await this.model.fetchAppunti(argId);
        this.view.renderAdminDashboard(`Appunti di: ${argNome}`, notes, {
            onSave: null, // <--- L'admin NON aggiunge appunti
            onDelete: (id) => this.model.deleteNote(id, argId),
            onSelect: null, // Ultimo livello, per ora non scendiamo oltre
            onBack: () => this.showTopics(corsoId, corsoNome) // Torna agli argomenti
        });
    }


}