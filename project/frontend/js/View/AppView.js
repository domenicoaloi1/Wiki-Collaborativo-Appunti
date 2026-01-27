// frontend/js/View/AppView.js
class AppView {
    constructor() {
        this.sidebarContainer = document.getElementById('courses-list');
        this.mainContent = document.getElementById('main-content');
    }
    
    showError(msg) {
        alert("Errore: " + msg);
    }

    // RF3 + RF4
    renderSidebar(courses, onCourseClick) {
        if (!this.sidebarContainer) return;
        this.sidebarContainer.innerHTML = ''; 

        courses.forEach(course => {
            // RF3
            const a = document.createElement('a');
            a.href = "#";
            a.className = "list-group-item list-group-item-action course-link";
            a.textContent = course.nome;
            a.dataset.id = course.id;

            // RF4
            a.addEventListener('click', (e) => {
                e.preventDefault();
                onCourseClick(course.id);
            });

            this.sidebarContainer.appendChild(a);
        });
    }

    // RF4
    renderList(notes) {
        const container = document.getElementById('main-content');
        if (!container) return;

        if (notes.length === 0) {
            container.innerHTML = '<div class="alert alert-info">Nessun appunto presente per questo corso.</div>';
            return;
        }

        let html = '<ul class="list-group shadow-sm">';
        notes.forEach(note => {
            html += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-1">${note.titolo}</h5>
                        <small class="text-muted">Creato il: ${note.data_creazione}</small>
                    </div>
                    <button class="btn btn-primary btn-sm view-note" data-id="${note.id}">Leggi</button>
                </li>`;
        });
        html += '</ul>';

        container.innerHTML = `<h2 class="mb-4 text-primary">Appunti del Corso</h2>${html}`;
    }

    // RF5
    renderNoteDetail(note, onBackClick) {
        if (!this.mainContent) return;

        this.mainContent.innerHTML = `
            <div class="card border-0 shadow-sm">
                <div class="card-body p-4">
                    <button class="btn btn-outline-secondary btn-sm mb-3" id="btn-back">
                        &larr; Torna alla lista
                    </button>
                    <h1 class="h2 text-primary mb-1">${note.titolo}</h1>
                    <p class="text-muted small mb-4">Caricato il: ${note.data_creazione}</p>
                    <div class="note-body" style="white-space: pre-wrap; line-height: 1.6;">
                        ${note.contenuto || "<i>Nessun contenuto disponibile.</i>"}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btn-back').onclick = onBackClick;
    }
}