// frontend/js/Model/AppModel.js
class AppModel {
    constructor() {
        this.courses = [];
        this.apiBase = 'http://localhost:8000';
        this.currentUser = JSON.parse(localStorage.getItem('user')) || null;
    }

    async fetchCorsi() {
        try {
            const response = await fetch(`${this.apiBase}/corsi`);
            if (!response.ok) throw new Error("Risorsa non disponibile");
            this.courses = await response.json();
            return this.courses; 
        } catch (error) {
            console.error("Errore fetchCorsi:", error);
        }
    }

    async fetchArgomenti(courseId) {
        const response = await fetch(`${this.apiBase}/argomenti?corso_id=${courseId}`);
        if (!response.ok) throw new Error("Errore recupero argomenti");
        return await response.json();
    }

    async fetchAppunti(argomentoId) {
        const response = await fetch(`${this.apiBase}/appunti?argomento_id=${argomentoId}`);
        if (!response.ok) throw new Error("Errore recupero appunti");
        return await response.json();
    }

    async fetchNoteDetail(noteId) {
        const response = await fetch(`${this.apiBase}/appunto?id=${noteId}`);
        if (!response.ok) throw new Error("Errore nel recupero del contenuto");
        return await response.json();
    }

    async searchNotes(query) {
        const response = await fetch(`${this.apiBase}/cerca?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("Errore nella ricerca");
        return await response.json();
    }

    async login(email, password) {
        const response = await fetch(`${this.apiBase}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) throw new Error("Credenziali non valide");
        
        const data = await response.json();
        this.currentUser = data.user; // Salviamo l'utente nel modello
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
            })
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
            body: JSON.stringify({ id: noteId, testo, utente_id: utenteId })
        });
        if (!response.ok) throw new Error("Errore nel salvataggio della versione");
        return await response.json();
    }

    async fetchStoria(noteId) {
        const response = await fetch(`${this.apiBase}/appunto/storia?id=${noteId}`);
        if (!response.ok) throw new Error("Errore nel recupero della cronologia");
        return await response.json();
    }

    async fetchVersionPreview(versioneId) {
        const response = await fetch(`${this.apiBase}/appunto/versione/visualizza?versione_id=${versioneId}`);
        if (!response.ok) throw new Error("Errore nel recupero dell'anteprima");
        return await response.json();
    }

    async restoreVersion(versioneId, utenteId) {
        const response = await fetch(`${this.apiBase}/appunto/versione/ripristina`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ versione_id: versioneId, utente_id: utenteId })
        });
        if (!response.ok) throw new Error("Errore nel ripristino della versione");
        return await response.json();
    }

    async createCourse(nome, descrizione) {
        const response = await fetch(`${this.apiBase}/corso/crea`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, descrizione })
        });
        return await response.json();
    }

    async deleteCourse(id) {
        return await fetch(`${this.apiBase}/corso/elimina`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        }).then(res => res.json());
    }

    async createArgomento(corsoId, nome) {
        const response = await fetch(`${this.apiBase}/argomento/crea`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ corso_id: corsoId, nome })
        });
        return await response.json();
    }

    async deleteArgomento(id) {
        return await fetch(`${this.apiBase}/argomento/elimina`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        }).then(res => res.json());
    }

    async deleteNote(id) {
        return await fetch(`${this.apiBase}/appunto/elimina`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        }).then(res => res.json());
    }

}