// frontend/js/View/AppView.js

class AppView extends BaseView{
    constructor() {
        super();
        this.sidebarContainer = document.getElementById('courses-list');
    }

    // --- RENDERING SIDEBAR ---


    renderHomeButton(onHomeClick) {
        const container = document.getElementById('home-button-container');
        if (!container) return;

        container.innerHTML = '';
        const btnHome = this._createElement('button', 'btn btn-outline-primary w-100 d-flex align-items-center justify-content-center');
        
        btnHome.innerHTML = '<i class="bi bi-house-door-fill me-2"></i> Torna alla pagina iniziale';
        
        btnHome.onclick = (e) => {
            e.preventDefault();
            onHomeClick();
        };

        container.appendChild(btnHome);
    }

    bindSearch(handler) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => handler(e.target.value));
        }
    }

    renderSidebar(courses, onCourseClick) {
        if (!this.sidebarContainer) return;
        this.sidebarContainer.innerHTML = '';

        courses.forEach(course => {
            const container = this._createElement('div', 'course-group mb-2');

            const a = this._createElement('a', 'list-group-item list-group-item-action fw-bold course-link d-flex justify-content-between align-items-center', { href: '#' });
            
            const span = this._createElement('span');
            span.textContent = course.nome;
            
            const arrow = this._createElement('small', 'text-muted');
            arrow.textContent = '▾';

            a.append(span, arrow);

            const subList = this._createElement('div', 'list-group list-group-flush ms-3 d-none', { id: `args-course-${course.id}` });

            a.addEventListener('click', (e) => {
                e.preventDefault();
                subList.classList.toggle('d-none');
                onCourseClick(course.id);
            });

            container.append(a, subList);
            this.sidebarContainer.appendChild(container);
        });
    }

    renderArgomenti(courseId, argomenti, onArgomentoClick) {
        const subList = document.getElementById(`args-course-${courseId}`);
        if (!subList) return;

        subList.innerHTML = ''; 
        argomenti.forEach(arg => {
            const a = this._createElement('a', 'list-group-item list-group-item-action py-1 small', { href: '#' });
            a.textContent = arg.nome;
            
            a.onclick = (e) => {
                e.preventDefault();
                onArgomentoClick(arg.id, arg.nome);
            };
            subList.appendChild(a);
        });
    }

    // --- RENDERING MAIN CONTENT ---
    renderWelcomeUser(user, onAdminClick) {
        this.mainContent.innerHTML = '';
        const container = this._createElement('div', 'text-center mt-5 p-4');
        
        // Titolo di benvenuto
        const h2 = this._createElement('h2', 'mb-4');
        h2.textContent = "Bentornato!";
        container.appendChild(h2);

        // Creazione del box messaggi (alert)
        const messageBox = this._createElement('div', 'alert mx-auto w-50 d-flex align-items-center justify-content-center');
        
        if (user.ruolo === 'amministratore') {
            // Stile Admin: Box Giallo
            messageBox.classList.add('alert-warning');
            messageBox.innerHTML = '<i class="bi bi-shield-lock-fill me-2"></i>Console di amministrazione.';
            
            // Pulsante Gestione (solo per Admin)
            const btnAdmin = this._createElement('button', 'btn btn-primary mt-3 d-flex align-items-center mx-auto');
            btnAdmin.innerHTML = '<i class="bi bi-gear-fill me-2"></i>Gestione catalogo';
            btnAdmin.onclick = onAdminClick;
            
            container.append(messageBox, btnAdmin);
        } else {
            // Stile Studente: Box Blu
            messageBox.classList.add('alert-info');
            messageBox.innerHTML = '<i class="bi bi-info-circle-fill me-2"></i>Naviga tra i corsi o cerca un appunto.';
            
            container.appendChild(messageBox);
        }

        this.mainContent.appendChild(container);
    }

    updateNavbar(user) {
        const btnContainer = document.querySelector('.navbar .d-flex');
        if (!btnContainer) return;
        btnContainer.innerHTML = '';

        if (user) {
            const userInfo = this._createElement('span', 'navbar-text me-3 text-light');
            userInfo.textContent = `👤 ${user.email} (${user.ruolo})`;
            
            const btnLogout = this._createElement('button', 'btn btn-outline-light btn-sm', { id: 'btn-logout' });
            btnLogout.textContent = 'Logout';
            
            btnContainer.append(userInfo, btnLogout);
        } else {
            const btnLogin = this._createElement('button', 'btn btn-outline-light me-2', { id: 'btn-login' });
            btnLogin.textContent = 'Login';
            
            const btnReg = this._createElement('button', 'btn btn-primary', { id: 'btn-register' });
            btnReg.textContent = 'Registrati';
            
            btnContainer.append(btnLogin, btnReg);
        }
    }



    renderGuestWelcome(onLoginClick) {
        this.mainContent.innerHTML = '';
        const container = this._createElement('div', 'text-center mt-5 p-5');
        
        container.innerHTML = `
            <h1 class="display-4 fw-bold text-primary mb-4">Benvenuto nel Catalogo Appunti</h1>
            <p class="lead mb-4">Naviga tra i corsi nella sidebar per consultare i materiali disponibili.</p>
            <div class="alert alert-info d-inline-block shadow-sm">
                <i class="bi bi-info-circle me-2"></i>
                Vuoi caricare i tuoi appunti o gestire il catalogo?
                <button id="btn-welcome-login" class="btn btn-link fw-bold p-0 ms-1">Accedi ora</button>
            </div>
        `;
        
        this.mainContent.appendChild(container);
        
        // Se l'utente preme "Accedi ora", apriamo il login
        document.getElementById('btn-welcome-login').onclick = onLoginClick;
    }

}