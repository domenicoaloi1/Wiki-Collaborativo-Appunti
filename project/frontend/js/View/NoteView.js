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
        if (!note) {
            this.mainContent.innerHTML = '<div class="alert alert-danger">Errore: Nota non trovata.</div>';
            return;
        }

        this.mainContent.innerHTML = '';
        const container = this._createElement('div', 'note-container p-4');

        const headerContainer = this._createElement('div', 'd-flex justify-content-between align-items-center mb-4');

        const title = this._createElement('h2', 'mb-4');
        title.textContent = note.titolo || 'Senza Titolo';


        if (canEdit) {
            const btnHelp = this._createElement('button', 'btn btn-outline-info btn-sm');
            btnHelp.innerHTML = '<i class="bi bi-question-circle me-1"></i> Guida Markdown';
            btnHelp.setAttribute('data-bs-toggle', 'modal');
            btnHelp.setAttribute('data-bs-target', '#markdownGuideModal');
            headerContainer.append(title, btnHelp);
        } else {
            headerContainer.appendChild(title);
        }

        container.appendChild(headerContainer);

        const converter = new showdown.Converter({
            tables: true,
            strikethrough: true,
            ghCodeBlocks: true,
            simpleLineBreaks: true
        });

        let textarea;
        let previewDiv;

        if (canEdit) {
            const row = this._createElement('div', 'row g-3 mb-4');
            
            const colEditor = this._createElement('div', 'col-12 col-md-6');
            textarea = this._createElement('textarea', 'form-control editor-height', { 
                placeholder: 'Scrivi in Markdown...',
                style: 'font-family: monospace; resize: none; overflow-y: auto;'
            });
            textarea.value = note.contenuto || '';
            colEditor.appendChild(textarea);

            const colPreview = this._createElement('div', 'col-12 col-md-6');
            previewDiv = this._createElement('div', 'markdown-body p-3 border rounded bg-white editor-height', {
                style: 'overflow-y: auto;'
            });

            previewDiv.innerHTML = converter.makeHtml(textarea.value);
            colPreview.appendChild(previewDiv);
            
            textarea.addEventListener('scroll', () => {
                previewDiv.scrollTop = textarea.scrollTop;
            });

            row.append(colEditor, colPreview);
            container.appendChild(row);

            textarea.addEventListener('input', () => {
                previewDiv.innerHTML = converter.makeHtml(textarea.value);
            });

        } else {
            previewDiv = this._createElement('div', 'markdown-body p-4 border rounded bg-white shadow-sm mb-4');
            previewDiv.innerHTML = converter.makeHtml(note.contenuto || '');
            container.appendChild(previewDiv);
        }

        const btnGroup = this._createElement('div', 'd-flex gap-2 mb-4');

        if (canEdit && onSaveVersion) {
            const btnSave = this._createElement('button', 'btn btn-success px-4');
            btnSave.innerHTML = '<i class="bi bi-save me-2"></i>Salva Nuova Versione';
            
            btnSave.onclick = async () => {
                const nuovoContenuto = textarea.value;
                
                btnSave.disabled = true;
                btnSave.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Salvataggio...';
                
                try {
                    await onSaveVersion(nuovoContenuto);
                    
                    btnSave.classList.replace('btn-success', 'btn-outline-success');
                    btnSave.innerHTML = '<i class="bi bi-check-lg me-2"></i>Salvato!';
                    
                    setTimeout(() => {
                        btnSave.classList.replace('btn-outline-success', 'btn-success');
                        btnSave.disabled = false;
                        btnSave.innerHTML = '<i class="bi bi-save me-2"></i>Salva Nuova Versione';
                    }, 2000);
                    
                } catch (error) {
                    btnSave.disabled = false;
                    btnSave.classList.replace('btn-success', 'btn-danger');
                    btnSave.innerHTML = '<i class="bi bi-exclamation-triangle me-2"></i>Errore';
                    console.error("Errore durante il salvataggio:", error);
                }
            };
            btnGroup.appendChild(btnSave);

            const btnExport = this._createElement('button', 'btn btn-outline-secondary');
            btnExport.innerHTML = '<i class="bi bi-file-earmark-pdf me-2"></i>Esporta PDF';
            btnExport.onclick = () => {
                if (textarea && previewDiv) {
                    previewDiv.innerHTML = converter.makeHtml(textarea.value);
                }
                window.print();
            };
            btnGroup.appendChild(btnExport);
        }
        
        if (canEdit && onShowHistory) {
            const btnHistory = this._createElement('button', 'btn btn-outline-primary');
            btnHistory.innerHTML = '<i class="bi bi-clock-history me-2"></i>Vedi Cronologia';
            btnHistory.onclick = () => onShowHistory();
            btnGroup.appendChild(btnHistory);
        }

        container.appendChild(btnGroup);
        
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