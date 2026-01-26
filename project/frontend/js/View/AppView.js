// frontend/js/View/AppView.js
class AppView {
    constructor() {
        // Elementi della Sidebar (RF3)
        this.sidebarContainer = document.getElementById('courses-list');
    }

    /**
     * RF3: Disegna l'elenco dei corsi nella sidebar
     */
    renderSidebar(courses) {
        if (!this.sidebarContainer) return;
        this.sidebarContainer.innerHTML = ''; 

        courses.forEach(course => {
            const a = document.createElement('a');
            a.href = "#";
            a.className = "list-group-item list-group-item-action course-link";
            a.textContent = course.nome;
            a.dataset.id = course.id;
            this.sidebarContainer.appendChild(a);
        });
    }

    showError(msg) {
        alert("Errore: " + msg);
    }

}