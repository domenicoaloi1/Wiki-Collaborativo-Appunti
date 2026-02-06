// js/View/AuthView.js
class AuthView extends BaseView {
    constructor() {
        super();
    }

    _renderFormCard(titleText, formId, fields, btnText, btnClass, onSubmit) {
        this.mainContent.innerHTML = '';
        const row = this._createElement('div', 'row justify-content-center py-5');
        const col = this._createElement('div', 'col-md-5');
        const card = this._createElement('div', 'card shadow border-0 animate__animated animate__fadeInDown');
        const cardBody = this._createElement('div', 'card-body p-5');
        
        const title = this._createElement('h3', 'text-center mb-4');
        title.textContent = titleText;

        const form = this._createElement('form', '', { id: formId });
        fields.forEach(f => {
            form.appendChild(this._createInputGroup(f.label, f.id, f.type, f.placeholder));
        });

        const submitBtn = this._createElement('button', `btn ${btnClass} w-100`, { type: 'submit' });
        submitBtn.textContent = btnText;

        form.appendChild(submitBtn);
        cardBody.append(title, form);
        card.appendChild(cardBody);
        col.appendChild(card);
        row.appendChild(col);
        this.mainContent.appendChild(row);

        form.onsubmit = (e) => {
            e.preventDefault();
            const values = fields.map(f => document.getElementById(f.id).value);
            onSubmit(...values);
        };
    }
    
    renderLoginForm(onSubmit) {
        this._renderFormCard("Accedi al Sistema", "login-form", [
            { label: "Email", id: "login-email", type: "email" },
            { label: "Password", id: "login-password", type: "password" }
        ], "Entra", "btn-primary", onSubmit);
    }

    renderRegisterForm(onSubmit) {
        this._renderFormCard("Crea un Account", "register-form", [
            { label: "Email Universitaria", id: "reg-email", type: "email", placeholder: "nome@studenti.unipr.it" },
            { label: "Password", id: "reg-password", type: "password" }
        ], "Registrati", "btn-success", onSubmit);
    }

}