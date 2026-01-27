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

    // RF4
    async handleCourseSelection(courseId) {
        try {
            const notes = await this.model.fetchAppunti(courseId);
            this.view.renderList(notes);
        } catch (error) {
            this.view.showError("Impossibile caricare gli appunti.");
        }
    }

}