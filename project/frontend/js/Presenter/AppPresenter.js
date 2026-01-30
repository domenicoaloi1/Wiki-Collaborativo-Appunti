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
        } catch (error) {
            this.view.showError("Errore inizializzazione.");
        }
    }

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
            this.view.renderList(notes, `Argomento: ${argNome}`);
            this.attachNoteEvents(argId, argNome);
        } catch (e) {
            this.view.showError("Errore nel caricamento degli appunti.");
        }
    }

    attachNoteEvents(argId, argNome) {
        const buttons = document.querySelectorAll('.view-note');
        buttons.forEach(btn => {
            btn.onclick = () => {
                const noteId = btn.getAttribute('data-id');
                this.handleViewNote(noteId, argId, argNome);
            };
        });
    }

    async handleViewNote(noteId, argId, argNome) {
        try {
            const note = await this.model.fetchNoteDetail(noteId);
            this.view.renderNoteDetail(note, () => {
                if (argId) {
                    this.handleArgomentoSelection(argId, argNome);
                }
            });
        } catch (e) {
            this.view.showError("Errore nel caricamento del dettaglio.");
        }
    }

    async handleSearch(query) {
        if (query.length < 2) return;
        try {
            const results = await this.model.searchNotes(query);
            this.view.renderList(results, `Risultati per: "${query}"`);
            this.attachNoteEvents(null, null);
        } catch (e) {
            console.error("Errore ricerca:", e);
        }
    }
}