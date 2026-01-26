// frontend/js/Presenter/AppPresenter.js
class AppPresenter {
    constructor(model, view) {
        this.model = model;
        this.view = view;

    }

    /**
     * Quando si carica la home page atterra qui
     */
    async init() {
        try {
            // RF3
            const courses = await this.model.fetchCorsi();
            this.view.renderSidebar(courses, (id) => this.handleCourseSelection(id));
            
        } catch (error) {
            this.view.showError("Impossibile inizializzare i dati della sidebar.");
        }
    }

}