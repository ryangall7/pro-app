class ProApplicationLogin extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
        this.loginForm = this.querySelector("#CustomerLoginForm");
        this.createForm = this.querySelector("#CustomerAccountCreateForm");
        this.recoverForm = this.querySelector("#RecoverPasswordForm");

        this.recoverLinks = this.querySelectorAll("[href='#recover']")
        this.createLinks = this.querySelectorAll("[href='#create']")
        this.loginLinks = this.querySelectorAll("[href='#login']")

        this.loadCurrentForm();

        window.addEventListener("popstate", this.loadCurrentForm);

    }

    loadCurrentForm = ()  => {
        if (window.location.hash == '#reset') {
            this.activateForm(this.recoverForm);
        }else if (window.location.hash == '#create') {
            this.activateForm(this.createForm);
        }else{
            this.activateForm(this.loginForm);
        }
    }

    activateForm = (form) => {
        this.loginForm.style.display = "none";
        this.createForm.style.display = "none";
        this.recoverForm.style.display = "none";
        form.style.display = "block";
    }

}

export const registerProApplicationLogin = () => {
    customElements.define("pro-application-login", ProApplicationLogin);
}