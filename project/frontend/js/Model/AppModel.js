// frontend/js/Model/AppModel.js
class AppModel {
    constructor() {
        this.courses = [];
        this.apiBase = 'http://localhost:8000';
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
}