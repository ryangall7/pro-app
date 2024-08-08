class ProApplicationInput extends HTMLElement {

    universalAttributes() {
        this.label.innerHTML = `${this.field.name}${this.field.required ? "*" : ""}`;
        this.label.setAttribute("for", this.field.key);
        this.input.setAttribute("id", this.field.key);
        this.input.setAttribute("name", this.field.key);
        this.field.required && this.input.setAttribute("required", "required");
    }

    helpText() {
        if (this.field.helpText) {
            const helpText = document.createElement("small");
            helpText.setAttribute("class", "form-text text-muted");
            helpText.innerHTML = this.field.helpText;
            this.container.appendChild(helpText);
        }
    }
}

class ProApplicationTextInput extends ProApplicationInput {
    connectedCallback() {
        let template = document.getElementById("ProApplicationInputTextTemplate");
        let templateContent = template.content;
        this.appendChild(templateContent.cloneNode(true));

        this.container = this.querySelector(".pro-app__form-input-container");
        this.label = this.querySelector("label");
        this.input = this.querySelector("input");
        this.input.value = this.field.value || "";

        this.universalAttributes();
        this.helpText();
    }

    helpText() {
        if (this.field.helpText && this.container) {
            this.container.appendChild(`<small class="form-text text-muted">${this.field.helpText}</small>`);
        }
    }

}

export const registerProApplicationTextInput = () => {
    customElements.define("pro-application-text-input", ProApplicationTextInput);
}

class ProApplicationSelectInput extends ProApplicationInput {

    connectedCallback() {
        let template = document.getElementById("ProApplicationInputSelectTemplate");
        let templateContent = template.content;
        this.appendChild(templateContent.cloneNode(true));

        this.container = this.querySelector(".pro-app__form-input-container");
        this.label = this.querySelector("label");
        this.input = this.querySelector("select");

        this.universalAttributes();
        this.buildOptions();
        this.helpText();
    }

    buildOptions() {
        let placeholder = document.createElement("option");
        placeholder.setAttribute("value", "");
        placeholder.setAttribute("disabled", "disabled");
        placeholder.innerHTML = "Please Select...";
        this.input.appendChild(placeholder);

        var self = this;
        this.field.options.forEach(function (option) {
            let optionElement = document.createElement("option");
            optionElement.setAttribute("value", option.value);
            optionElement.innerHTML = option.label;
            if(option.value == self.field.value){
                optionElement.setAttribute("selected", "selected");
            }
            self.input.appendChild(optionElement);
        })
    }
}

export const registerProApplicationSelectInput = () => {
    customElements.define("pro-application-select-input", ProApplicationSelectInput);
}