// frontend/js/Model/AppModel.js
class AppModel extends EventEmitter{
    constructor() {
        super();
        this.courses = [];
        this.apiBase = 'http://localhost:8000';
        const savedUser = localStorage.getItem('user');
        this.currentUser = savedUser ? JSON.parse(savedUser) : null;    
    }

    // --- SIDEBAR ---

    async fetchCorsi() {
        try {
            const response = await fetch(`${this.apiBase}/corsi`, { credentials: 'include' });
            if (!response.ok) throw new Error("Risorsa non disponibile");
            this.courses = await response.json();
            return this.courses; 
        } catch (error) {
            console.error("Errore fetchCorsi:", error);
        }
    }

    async fetchArgomenti(courseId) {
        const response = await fetch(`${this.apiBase}/argomenti?corso_id=${courseId}`, { credentials: 'include' });
        if (!response.ok) throw new Error("Errore recupero argomenti");
        return await response.json();
    }

    // --- MAIN-CONTENT ---

    async fetchAppunti(argomentoId) {
        const response = await fetch(`${this.apiBase}/appunti?argomento_id=${argomentoId}`, { credentials: 'include' });
        if (!response.ok) throw new Error("Errore recupero appunti");
        return await response.json();
    }

    async fetchNoteDetail(noteId) {
        const response = await fetch(`${this.apiBase}/appunto?id=${noteId}`, { credentials: 'include' });
        if (!response.ok) throw new Error("Errore nel recupero del contenuto");
        return await response.json();
    }

    async searchNotes(query) {
        const response = await fetch(`${this.apiBase}/cerca?q=${encodeURIComponent(query)}`, { credentials: 'include' });
        if (!response.ok) throw new Error("Errore nella ricerca");
        return await response.json();
    }

    async createNote(argomentoId, titolo, contenuto) {
        const response = await fetch(`${this.apiBase}/appunto/crea`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                argomento_id: argomentoId,
                titolo: titolo,
                contenuto: contenuto
            }),
            credentials: 'include'
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Errore durante la creazione");
        }

        return data;
    }

    async saveVersion(noteId, testo) {
        const response = await fetch(`${this.apiBase}/appunto/versione/salva`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: noteId, testo }),
            credentials: 'include'
        });
        if (!response.ok) throw new Error("Errore nel salvataggio della versione");
        return await response.json();
    }

    async fetchStoria(noteId) {
        const response = await fetch(`${this.apiBase}/appunto/storia?id=${noteId}`, { credentials: 'include' });
        if (!response.ok) throw new Error("Errore nel recupero della cronologia");
        return await response.json();
    }

    async fetchVersionPreview(versioneId) {
        const response = await fetch(`${this.apiBase}/appunto/versione/visualizza?versione_id=${versioneId}`, { credentials: 'include' });
        if (!response.ok) throw new Error("Errore nel recupero dell'anteprima");
        return await response.json();
    }

    async restoreVersion(versioneId) {
        const response = await fetch(`${this.apiBase}/appunto/versione/ripristina`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ versione_id: versioneId }),
            credentials: 'include'
        });
        if (!response.ok) throw new Error("Errore nel ripristino della versione");
        return await response.json();
    }

    // --- LOGIN ---

    async login(email, password) {
        const response = await fetch(`${this.apiBase}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        if (!response.ok) throw new Error("Credenziali non valide");
        
        const data = await response.json();
        this.currentUser = data.user; // Salviamo l'utente nel modello

        localStorage.setItem('user', JSON.stringify(data.user));

        return data.user;
    }

    async logout() {
        try {
            await fetch(`${this.apiBase}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } finally {
            this.currentUser = null;
            localStorage.removeItem('user');
        }
    }

    async register(email, password) {
        const response = await fetch(`${this.apiBase}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Registrazione fallita");
        }

        return await response.json();
    }

    // --- ADMIN ---

    // ----- Corsi

    async createCourse(nome) {

        const response = await fetch(`${this.apiBase}/corso/crea`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome }),
            credentials: 'include'
        });

        if (response.ok) {
            this.emit('course:updated');
            this.view.showSuccess("Corso creato correttamente");
        }

        return await response.json();
    }

    async deleteCourse(id) {
        const response = await fetch(`${this.apiBase}/corso/elimina`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
            credentials: 'include'
        });

        if (response.ok) {
            this.emit('course:updated');
            this.view.showSuccess("Corso cancellato correttamente");
        }

        return await response.json();
        
    }

    async renameCourse(id, nuovoNome) {
        const response = await fetch(`${this.apiBase}/corso/modifica`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({nome: nuovoNome, id }),
            credentials: 'include'
        });

        if (response.ok) {
            this.emit('course:updated'); 
            this.view.showSuccess("Titolo corso aggiornato correttamente");
        }
        return await response.json();
    }
    
    // ----- Argomenti

    async createArgomento(corsoId, nome) {
        const response = await fetch(`${this.apiBase}/argomento/crea`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ corso_id: corsoId, nome }),
            credentials: 'include'
        });
        
        if (response.ok) {
            this.emit('arguments:updated', corsoId); 
            this.view.showSuccess("Argomento creato correttamente");
        }
        return await response.json();
    }

    async deleteArgomento(id, corsoId) {
        const response = await fetch(`${this.apiBase}/argomento/elimina`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
            credentials: 'include'
        });
        
        if (response.ok) {
            this.emit('arguments:updated', corsoId);
            this.view.showSuccess("Argomento cancellato correttamente");
        }
        return await response.json();
    }

    async renameArgomento(id, nuovoNome, corsoId) {
        const response = await fetch(`${this.apiBase}/argomento/modifica`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({nome: nuovoNome, id }),
            credentials: 'include'
        });

        if (response.ok) {
            this.emit('arguments:updated', corsoId);
            this.view.showSuccess("Titolo argomento aggiornato correttamente");
        }
        return await response.json();
    }
    
    // ----- Appunti

    async deleteNote(id, argomentoId) {
        const response = await fetch(`${this.apiBase}/appunto/elimina`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
            credentials: 'include'
        });
        
        if (response.ok) {
            this.emit('note:updated', argomentoId);
            this.view.showSuccess("Nota eliminata correttamente");
        }
        return await response.json();
    }

    async renameNote(id, nuovoNome, argomentoId) {
        const response = await fetch(`${this.apiBase}/appunto/modifica`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({nome: nuovoNome, id }),
            credentials: 'include'
        });

        if (response.ok) {
            this.emit('note:updated', argomentoId);
            this.view.showSuccess("Titolo appunto aggiornato correttamente");
        }
        return await response.json();
    }

}