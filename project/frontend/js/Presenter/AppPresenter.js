// frontend/js/Presenter/AppPresenter.js
class AppPresenter {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    // Aggiorna init() per passare il callback alla view
    async init() {
        try {
            // RF3
            const courses = await this.model.fetchCorsi();
            // RF4
            this.view.renderSidebar(courses, (id) => this.handleCourseSelection(id));
        } catch (error) {
            this.view.showError("Errore inizializzazione.");
        }
    }

    // RF4 + RF5
    async handleCourseSelection(courseId) {
        try {
            // RF4
            const notes = await this.model.fetchAppunti(courseId);
            this.view.renderList(notes);

            // RF5
            const buttons = document.querySelectorAll('.view-note');            
            buttons.forEach(btn => {
                btn.onclick = () => {
                    const noteId = btn.getAttribute('data-id');
                    this.handleViewNote(noteId, courseId);
                };
            });
        } catch (e) {
            console.error(e);
            this.view.showError("Errore nel caricamento appunti.");
        }
    }

    // RF5
    async handleViewNote(noteId, courseId) {
        try {
            const note = await this.model.fetchNoteDetail(noteId);
            this.view.renderNoteDetail(note, () => this.handleCourseSelection(courseId));
        } catch (e) {
            this.view.showError("Impossibile caricare l'appunto.");
        }
    }

}