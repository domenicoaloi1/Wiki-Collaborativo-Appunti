// js/View/NoteView.js
class NoteView extends BaseView {
    constructor() {
        super();
    }

    renderList(notes, contextTitle, onNoteClick, onCreateClick = null) {
        if (!this.mainContent) return;
        this.mainContent.innerHTML = '';

        const h2 = this._createElement('h2', 'mb-4 text-primary');
        h2.textContent = contextTitle;

        if (notes.length === 0) {
            const alert = this._createElement('div', 'alert alert-info');
            alert.textContent = "Nessun appunto trovato.";
            this.mainContent.append(h2, alert);
            if (onCreateClick) {
                const btnCreate = this._createElement('button', 'btn btn-primary mt-3');
                btnCreate.textContent = '+ Crea Nuovo Appunto';
                btnCreate.onclick = onCreateClick;
                this.mainContent.appendChild(btnCreate);
            }
            return;
        }

        const ul = this._createElement('ul', 'list-group shadow-sm');
        notes.forEach(note => {
            const li = this._createElement('li', 'list-group-item d-flex justify-content-between align-items-center p-3');
            
            const infoDiv = this._createElement('div');
            const h5 = this._createElement('h5', 'mb-1');
            h5.textContent = note.titolo;
            const small = this._createElement('small', 'text-muted');
            small.textContent = `Creato il: ${note.data_creazione}`;
            infoDiv.append(h5, small);

            const btn = this._createElement('button', 'btn btn-primary btn-sm');
            btn.textContent = "Leggi";
            btn.onclick = () => onNoteClick(note.id);

            li.append(infoDiv, btn);
            ul.appendChild(li);
        });

        this.mainContent.append(h2, ul);
        
        if (onCreateClick) {
            const btnCreate = this._createElement('button', 'btn btn-primary mt-3');
            btnCreate.textContent = '+ Crea Nuovo Appunto';
            btnCreate.onclick = onCreateClick;
            this.mainContent.appendChild(btnCreate);
        }
    }

    renderNoteDetail(note, canEdit, onSaveVersion, onShowHistory) {
        this.mainContent.innerHTML = '';
        const container = this._createElement('div', 'note-container p-4');

        const title = this._createElement('h2', 'mb-3');
        title.textContent = note.titolo;

        // Area di testo per il contenuto
        const textarea = this._createElement('textarea', 'form-control mb-3', { 
            rows: 15,
            placeholder: 'Contenuto dell\'appunto...'
        });
        textarea.value = note.contenuto;

        // LOGICA DI SOLA LETTURA
        if (!canEdit) {
            textarea.setAttribute('readonly', 'true');
            textarea.classList.add('bg-light'); // Grigio chiaro per feedback visivo
        }

        const btnGroup = this._createElement('div', 'd-flex gap-2 mb-4');

        // Mostriamo il tasto salva solo se l'utente può editare
        if (canEdit && onSaveVersion) {
            const btnSave = this._createElement('button', 'btn btn-success');
            btnSave.textContent = 'Salva Nuova Versione';
            btnSave.onclick = () => onSaveVersion(textarea.value);
            btnGroup.appendChild(btnSave);
        }
        
        if (canEdit) {
            const btnHistory = this._createElement('button', 'btn btn-outline-primary');
            btnHistory.textContent = 'Vedi Cronologia';
            btnHistory.onclick = () => onShowHistory();
            btnGroup.appendChild(btnHistory);
        }

        container.append(title, textarea, btnGroup);
        
        // Contenitore per la storia
        const historyContainer = this._createElement('div', 'history-section mt-4', { id: 'history-list' });
        container.appendChild(historyContainer);

        this.mainContent.appendChild(container);
    }

    renderHistory(versions, onRestore, onRead) {
        const container = document.getElementById('history-list');
        if (!container) return;
        
        container.innerHTML = ''; // Pulizia contenuto precedente

        const h4 = this._createElement('h4', 'mb-3 border-top pt-3');
        h4.textContent = 'Cronologia Versioni';
        container.appendChild(h4);

        // CONTROLLO CRONOLOGIA VUOTA
        if (!versions || versions.length === 0) {
            const emptyMsg = this._createElement('div', 'alert alert-warning');
            emptyMsg.textContent = 'Nessuna versione precedente disponibile.';
            container.appendChild(emptyMsg);
            return;
        }

        // Se ci sono versioni, procedi con la creazione della lista
        const list = this._createElement('ul', 'list-group');
        versions.forEach(v => {
            const li = this._createElement('li', 'list-group-item d-flex justify-content-between align-items-center');
            
            const info = this._createElement('div');
            info.innerHTML = `<strong>${v.data_modifica}</strong><br><small class="text-muted">Autore: ${v.autore}</small>`;
            
            const actions = this._createElement('div', 'btn-group');
            
            const btnRead = this._createElement('button', 'btn btn-sm btn-outline-info');
            btnRead.textContent = 'Leggi';
            btnRead.onclick = () => onRead(v.id, v.data_modifica);

            const btnRestore = this._createElement('button', 'btn btn-sm btn-warning');
            btnRestore.textContent = 'Ripristina';
            btnRestore.onclick = () => onRestore(v.id);

            actions.append(btnRead, btnRestore);
            li.append(info, actions);
            list.appendChild(li);
        });

        container.appendChild(list);
    }

    showVersionPreview(testo, data) {
        // Rimuoviamo eventuali anteprime precedenti
        const oldPreview = document.getElementById('version-preview-box');
        if (oldPreview) oldPreview.remove();

        const previewBox = this._createElement('div', 'alert alert-info mt-3', { id: 'version-preview-box' });
        previewBox.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h5>Visualizzazione versione del: ${data}</h5>
                <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
            <hr>
            <pre style="white-space: pre-wrap;">${testo}</pre>
            <div class="text-end mt-2">
                <small><i>Visualizzazione in sola lettura.</i></small>
            </div>
        `;
        
        document.getElementById('history-list').prepend(previewBox);
        previewBox.scrollIntoView({ behavior: 'smooth' });
    }

    
    renderCreateNoteForm(argomentoId, onSubmit) {
        this.mainContent.innerHTML = '';
        const container = this._createElement('div', 'p-4');
        const h2 = this._createElement('h2', 'mb-4');
        h2.textContent = 'Crea Nuovo Appunto';

        const form = this._createElement('form');
        const titleGroup = this._createInputGroup('Titolo Appunto', 'note-title', 'text', 'Inserisci titolo...');
        const contentGroup = this._createElement('div', 'mb-3');
        const label = this._createElement('label', 'form-label');
        label.textContent = 'Contenuto (Markdown)';
        const text = this._createElement('textarea', 'form-control', { id: 'note-content', rows: 10 });
        contentGroup.append(label, text);

        const btn = this._createElement('button', 'btn btn-primary', { type: 'submit' });
        btn.textContent = 'Pubblica Appunto';

        form.append(titleGroup, contentGroup, btn);
        form.onsubmit = (e) => {
            e.preventDefault();
            onSubmit(document.getElementById('note-title').value, text.value);
        };

        container.append(h2, form);
        this.mainContent.appendChild(container);
    }
}