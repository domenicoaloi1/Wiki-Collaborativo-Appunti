// frontend/js/Model/AppModel.js
class AppModel {
    constructor() {
        this.courses = [];
        this.apiBase = 'http://localhost:8000';
    }

    // RF3
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

    // RF4
    async fetchAppunti(courseId) {
        const response = await fetch(`${this.apiBase}/appunti?corso_id=${courseId}`);
        if (!response.ok) throw new Error("Errore recupero appunti");
        return await response.json();
    }

}