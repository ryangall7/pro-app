import Dropzone from "dropzone";
import $ from "jquery";
import "dropzone/dist/dropzone.css";

Dropzone.autoDiscover = false;

class ProApplication extends HTMLElement {

  connectedCallback() {
    this.getApplication();
    this.bindFormEvents();
    this.configDropzone();
    this.form = this.querySelector("#ProApplicationForm");
    this.skeleton = this.querySelector("#ProApplicationInputsLoading");
    this.button = this.querySelector("#ProApplicationSubmit");
  }

  getApplication() {
    var self = this;
    $.getJSON("/apps/pros/pro-app", function(data) {

      self.data = data;

      if(data.employerType){
        $("#ProApplicationEmployerType").val(data.employerType);
      }
      if(data.employer){
        $("#ProApplicationEmployerName").val(data.employer);
      }

      //hide the loading skeleton
      self.skeleton.style.display = "none";

      if(data.fields && data.fields.length){
        data.fields.forEach(function(field) {
            let inputTag;
            switch (field.type) {
                case "select":
                    inputTag = "pro-application-select-input";
                    break;
                default:
                    inputTag = "pro-application-text-input";
            }
            const inputElement = document.createElement(inputTag);
            inputElement.field = field;
            self.form.appendChild(inputElement);
        });
      }

      self.button.removeAttribute("disabled");

      data.files && data.files.forEach(function(file) {
        self.dropzone.displayExistingFile({
          name: file.name,
          id: file.id,
        }, file.preview, null, "anonymous");
      })
    })
    .fail(function (data) {
        self.reportError("Could not reach server, please try again later.");
    });
  }

  bindFormEvents() {
    var self = this;
    $("#ProApplicationSubmit").on("click", function(event) {
      $("#ProApplicationForm").trigger("submit");
    })
    $("#ProApplicationForm").on("submit", function(event) {

      event.preventDefault();

      if(this.checkValidity() && (self.dropzone.files.length || self.data.files)){

        let post_url = $(this).attr("action");
        let request_method = $(this).attr("method");
        let form_data = self.getFormData($(this));
        self.button.classList.add("loading");

        $.ajax({
            url: post_url,
            type: request_method,
            dataType: 'json',
            contentType: "application/json",
            data: JSON.stringify(form_data)
          }).done(function(data) {
            self.button.classList.remove("loading");

            if (!data.success) {
              console.log(data.errors);
            } else {
              $("#form-submit-success").show();
              $("#ProApplicationForm").hide();
              $("#ProApplicationFilesWrap").hide();
              $("#ProApplicationSubmit").hide();
            }

          })
          .fail(function (data) {
            self.reportError.bind(self).call("Could not reach server, please try again later.");
          });

      }else{
        self.reportFileValidity();
        this.reportValidity()
        return false;

      }
    });
  }

  reportError(error){
    $(this.form).prepend(
        `<div class="bg-red-100 border border-solid border-red-300 text-red-700 px-4 py-3 rounded relative mb-7" role="alert">${error}</div>`
      );
  }

  reportFileValidity(){
    const validFiles = this.dropzone.files.filter(function(file){
      return file.status !== "error"
    });
    if(validFiles.length){
      this.filesError?.remove();
    }else{
      $("#ProApplicationFiles").addClass("has-error");
      this.filesError = $('<div class="text-red-700">Please upload at least one file.</div>')
      $("#ProApplicationFiles").append(this.filesError);
    }
  }

  configDropzone(){
    var self = this;
    this.dropzone = new Dropzone("#ProApplicationFiles", {
      url: "/apps/pros/pro-app/file",
      acceptedFiles: "image/*,application/pdf",
      dictDefaultMessage: "Drag files here or click to select and upload.<br/>(.jpg, .png, .pdf)",
      addRemoveLinks: true,
    });

    this.dropzone.on('success', function(file, repsonse) {
      if(repsonse?.uploads?.length){
        file.id = repsonse.uploads[0].id;
      }
    });

    this.dropzone.on("removedfile", function(file, response) {

        const x = confirm('Do you want to delete?');
        if(!x) return false;

        $.ajax({
          url: "/apps/pros/pro-app/file",
          type: "DELETE",
          dataType: 'json',
          contentType: "application/json",
          data: JSON.stringify({
            id: file.id
          }),
          success: function(data) {
            console.log("Success deleting file");
          }
        });
    });
  }

  getFormData($form) {
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
  }
}

export const registerProApplication = () => {
    customElements.define('pro-application', ProApplication);
}