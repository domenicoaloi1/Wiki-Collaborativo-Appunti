// frontend/js/app.js

// Istanza dei componenti
const model = new AppModel();
const view = new AppView();

// Rendi 'presenter' globale assegnandolo a window
window.presenter = new AppPresenter(model, view);

// Avvio dell'applicazione
document.addEventListener('DOMContentLoaded', () => {
    window.presenter.init(); // RF3 sta nell'init della classe AppPresenter
});