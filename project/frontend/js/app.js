// frontend/js/app.js

document.addEventListener('DOMContentLoaded', () => {
    const model = new AppModel();
    const view = new AppView();
    
    const presenter = new AppPresenter(model, view);

    presenter.init();
});