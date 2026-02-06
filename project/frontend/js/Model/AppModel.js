// frontend/js/Model/AppModel.js
class AppModel extends EventEmitter{
    constructor() {
        super();
        this.courses = [];
        this.apiBase = 'http://localhost:8000';
        const savedUser = localStorage.getItem('user');
        this.currentUser = savedUser ? JSON.parse(savedUser) : null;    
    }

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

    async createNote(argomentoId, utenteId, titolo, contenuto) {
        const response = await fetch(`${this.apiBase}/appunto/crea`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                argomento_id: argomentoId,
                utente_id: utenteId,
                titolo: titolo,
                contenuto: contenuto
            }),
            credentials: 'include'
        });
        const data = await response.json();

        if (!response.ok) {
            // Lanciamo l'errore specifico che arriva dal PHP
            throw new Error(data.error || "Errore durante la creazione");
        }

        return data; // Ritorna {status: "success", id: ...}
    }

    async saveVersion(noteId, testo, utenteId) {
        const response = await fetch(`${this.apiBase}/appunto/versione/salva`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: noteId, testo, utente_id: utenteId }),
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

    async restoreVersion(versioneId, utenteId) {
        const response = await fetch(`${this.apiBase}/appunto/versione/ripristina`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ versione_id: versioneId, utente_id: utenteId }),
            credentials: 'include'
        });
        if (!response.ok) throw new Error("Errore nel ripristino della versione");
        return await response.json();
    }

    async createCourse(nome) {
        console.log("Model.createCourse");
        const response = await fetch(`${this.apiBase}/corso/crea`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome }),
            credentials: 'include'
        });
        return await response.json();
    }

    async deleteCourse(id) {
        console.log("Model.deleteCourse");
        return await fetch(`${this.apiBase}/corso/elimina`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
            credentials: 'include'
        }).then(res => res.json());
    }

    async createArgomento(corsoId, nome) {
        const response = await fetch(`${this.apiBase}/argomento/crea`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ corso_id: corsoId, nome }),
            credentials: 'include'
        });
        
        if (response.ok) {
            // Notifichiamo che gli argomenti di questo corso sono cambiati
            this.emit('topic:updated', corsoId); 
        }
        return await response.json();
    }

    async deleteArgomento(id, corsoId) {
        const response = await fetch(`${this.apiBase}/argomento/elimina`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
            credentials: 'include'
        });
        
        if (response.ok) {
            this.emit('topic:updated', corsoId);
        }
        return await response.json();
    }

    async deleteNote(id) {
        return await fetch(`${this.apiBase}/appunto/elimina`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
            credentials: 'include'
        }).then(res => res.json());
    }

    async createNote(argomentoId, titolo, contenuto) {
        const response = await fetch(`${this.apiBase}/appunto/crea`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ argomento_id: argomentoId, titolo, contenuto }),
            credentials: 'include'
        });
        
        if (response.ok) {
            this.emit('note:updated', argomentoId); 
        }
        return await response.json();
    }

    async deleteNote(id, argomentoId) {
        const response = await fetch(`${this.apiBase}/appunto/elimina`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
            credentials: 'include'
        });
        
        if (response.ok) {
            this.emit('note:updated', argomentoId);
        }
        return await response.json();
    }

}