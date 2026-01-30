// frontend/js/Presenter/AppPresenter.js
class AppPresenter {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    async init() {
        try {
            // RF3
            const courses = await this.model.fetchCorsi();
            this.view.renderSidebar(courses, (id) => this.handleCourseSelection(id));
            
            // RF9
            this.view.bindSearch((query) => this.handleSearch(query));
        } catch (error) {
            this.view.showError("Errore inizializzazione.");
        }
    }

    attachNoteEvents(currentCourseId) {
        const buttons = document.querySelectorAll('.view-note');
        buttons.forEach(btn => {
            btn.onclick = () => {
                const noteId = btn.getAttribute('data-id');
                this.handleViewNote(noteId, currentCourseId);
            };
        });
    }

    // RF4 + RF5
    async handleCourseSelection(courseId) {
        try {
            // RF4
            const notes = await this.model.fetchAppunti(courseId);
            
            const course = this.model.courses.find(c => c.id == courseId);
            const title = course ? `Appunti di ${course.nome}` : "Appunti del Corso";

            this.view.renderList(notes, title);

            // RF5
            this.attachNoteEvents(courseId);

        } catch (e) {
            console.error(e);
            this.view.showError("Errore nel caricamento appunti.");
        }
    }

    // RF9
    async handleSearch(query) {
        if (query.length < 2) return;
        
        try {
            const results = await this.model.searchNotes(query);
            
            const title = `Risultati per: "${query}" <span class="badge bg-secondary" style="font-size:0.5em; vertical-align:middle; margin-left:10px;">RICERCA</span>`;
            
            this.view.renderList(results, title);
            
            this.attachNoteEvents(null); 

        } catch (e) {
            console.error("Errore ricerca:", e);
        }
    }

    // RF5
    async handleViewNote(noteId, courseId) {
        try {
            const note = await this.model.fetchNoteDetail(noteId);
            
            this.view.renderNoteDetail(note, () => {
                if (courseId) {
                    this.handleCourseSelection(courseId);
                } else {
                    document.getElementById('main-content').innerHTML = '<div class="text-center py-5"><h5>Seleziona un corso per continuare</h5></div>';
                }
            });
        } catch (e) {
            this.view.showError("Impossibile caricare l'appunto.");
        }
    }
    
}