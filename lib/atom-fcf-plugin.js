'use babel';

import AtomFcfPluginView from './atom-fcf-plugin-view';
import { CompositeDisposable, TextEditor } from 'atom';
import * as libChildProcess from 'child_process';

export default {

  atomFcfPluginView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomFcfPluginView = new AtomFcfPluginView(state.atomFcfPluginViewState);
    this.panelItem  = {};
    this.panelItem.pathEditor = new TextEditor({ mini: true });
    this.panelItem.inheritancePathEditor = new TextEditor({ mini: true });
    this.panelItem.message = document.createElement('div');
    this.panelItem.message.classList.add('message');
    this.panelItem.message.innerHTML = "Text";
    this.panelItem.inheritanceMessage = document.createElement('div');
    this.panelItem.inheritanceMessage.classList.add('message');
    this.panelItem.inheritanceMessage.innerHTML = "Enter the path to the base template (The input field can be empty)";
    this.panelItem.element = document.createElement('div');
    this.panelItem.element.classList.add('go-to-line');
    this.panelItem.element.appendChild(this.panelItem.message);
    this.panelItem.element.appendChild(this.panelItem.pathEditor.element);
    this.panelItem.element.appendChild(this.panelItem.inheritanceMessage);
    this.panelItem.element.appendChild(this.panelItem.inheritancePathEditor.element);

    this.modalPanel = atom.workspace.addModalPanel({
      item:    this.panelItem,
      visible: false
    });

    atom.commands.add(this.panelItem.pathEditor.element, 'core:confirm', () => {
      this.confirm();
    });
    atom.commands.add(this.panelItem.pathEditor.element, 'core:cancel', () => {
      this.cancel();
    });
    atom.commands.add(this.panelItem.inheritancePathEditor.element, 'core:confirm', () => {
      this.confirm();
    });
    atom.commands.add(this.panelItem.inheritancePathEditor.element, 'core:cancel', () => {
      this.cancel();
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-fcf-plugin:create-module': (a_target) => {
        let directory = require('path').dirname(a_target.target.dataset.path);
        this.showPanel("Enter a new module name", false, ()=>{
          this.createTemplate(directory, "module", this.panelItem.pathEditor.getText(), "");
        });
      },
      'atom-fcf-plugin:create-module-in-directory': (a_target) => {
        let directory = a_target.target.dataset.path;
        this.showPanel("Enter a new module name", false, ()=>{
          this.createTemplate(directory, "module", this.panelItem.pathEditor.getText(), "");
        });
      },
      'atom-fcf-plugin:create-package': (a_target) => {
        let directory = require('path').dirname(a_target.target.dataset.path);
        this.showPanel("Enter a new package name", false, ()=>{
          this.createTemplate(directory, "package", this.panelItem.pathEditor.getText(), "");
        });
      },
      'atom-fcf-plugin:create-package-in-directory': (a_target) => {
        let directory = a_target.target.dataset.path;
        this.showPanel("Enter a new package name", false, ()=>{
          this.createTemplate(directory, "package", this.panelItem.pathEditor.getText(), "");
        });
      },
      'atom-fcf-plugin:create-projection': (a_target) => {
        let directory = require('path').dirname(a_target.target.dataset.path);
        this.showPanel("Enter a new projection name", false, ()=>{
          this.createTemplate(directory, "projection", this.panelItem.pathEditor.getText(), "");
        });
      },
      'atom-fcf-plugin:create-projection-in-directory': (a_target) => {
        let directory = a_target.target.dataset.path;
        this.showPanel("Enter a new projection name", false, ()=>{
          this.createTemplate(directory, "projection", this.panelItem.pathEditor.getText(), "");
        });
      },
      'atom-fcf-plugin:create-template': (a_target) => {
        let directory = require('path').dirname(a_target.target.dataset.path);
        this.showPanel("Enter a new template name", true, ()=>{
          this.createTemplate(directory, "template", this.panelItem.pathEditor.getText(), this.panelItem.inheritancePathEditor.getText());
        });
      },
      'atom-fcf-plugin:create-template-in-directory': (a_target) => {
        let directory = a_target.target.dataset.path;
        this.showPanel("Enter a new template name", true, ()=>{
          this.createTemplate(directory, "template", this.panelItem.pathEditor.getText(), this.panelItem.inheritancePathEditor.getText());
        });
      },
      'atom-fcf-plugin:create-template-file': (a_target) => {
        let directory = require('path').dirname(a_target.target.dataset.path);
        this.showPanel("Enter a new template file name", true, ()=>{
          this.createTemplate(directory, "template-file", this.panelItem.pathEditor.getText(), this.panelItem.inheritancePathEditor.getText());
        });
      },
      'atom-fcf-plugin:create-template-file-in-directory': (a_target) => {
        let directory = a_target.target.dataset.path;
        this.showPanel("Enter a new template file name", true, ()=>{
          this.createTemplate(directory, "template-file", this.panelItem.pathEditor.getText(), this.panelItem.inheritancePathEditor.getText());
        });
      },
      'atom-fcf-plugin:create-wrapper': (a_target) => {
        let directory = require('path').dirname(a_target.target.dataset.path);
        this.showPanel("Enter a new wrapper file name", true, ()=>{
          this.createTemplate(directory, "wrapper", this.panelItem.pathEditor.getText(), this.panelItem.inheritancePathEditor.getText());
        });
      },
      'atom-fcf-plugin:create-wrapper-in-directory': (a_target) => {
        let directory = a_target.target.dataset.path;
        this.showPanel("Enter a new wrapper file name", true, ()=>{
          this.createTemplate(directory, "wrapper", this.panelItem.pathEditor.getText(), this.panelItem.inheritancePathEditor.getText());
        });
      },
      'atom-fcf-plugin:create-hooks': (a_target) => {
        let directory = require('path').dirname(a_target.target.dataset.path);
        this.showPanel("Enter a new hooks file name", false, ()=>{
          this.createTemplate(directory, "hooks", this.panelItem.pathEditor.getText(), "");
        });
      },
      'atom-fcf-plugin:create-hooks-in-directory': (a_target) => {
        let directory = a_target.target.dataset.path;
        this.showPanel("Enter a new hooks file name", false, ()=>{
          this.createTemplate(directory, "hooks", this.panelItem.pathEditor.getText(), "");
        });
      },
      'atom-fcf-plugin:receive-hooks': (a_target) => {
        let directory = require('path').dirname(a_target.target.dataset.path);
        this.showPanel("Enter a new receive file name", false, ()=>{
          this.createTemplate(directory, "receive", this.panelItem.pathEditor.getText(), "");
        });
      },
      'atom-fcf-plugin:create-receive-in-directory': (a_target) => {
        let directory = a_target.target.dataset.path;
        this.showPanel("Enter a new receive file name", false, ()=>{
          this.createTemplate(directory, "receive", this.panelItem.pathEditor.getText(), "");
        });
      }
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomFcfPluginView.destroy();
  },

  serialize() {
    return {
      atomFcfPluginViewState: this.atomFcfPluginView.serialize()
    };
  },

  confirm(){
    if (this.panelItem.cb){
      this.panelItem.cb();
    }
    this.closePanel();
  },

  cancel(){
    this.closePanel();
  },

  createTemplate(a_directory, a_templateType, a_templateName, a_inheritance) {
    libChildProcess.exec(`fcfmngr create ${a_templateType} ${a_templateName} ${a_inheritance}`, { cwd: a_directory });
  },

  showPanel(a_message, a_inheritance, a_cb) {
    this.modalPanel.show();
    this.panelItem.cb = a_cb;
    this.panelItem.message.innerHTML = a_message;
    this.panelItem.pathEditor.setText("");
    this.panelItem.inheritancePathEditor.setText("");
    this.panelItem.pathEditor.element.focus();
    if (a_inheritance) {
      this.panelItem.inheritanceMessage.style.display = "block";
      this.panelItem.inheritancePathEditor.element.style.display = "block";
    } else {
      this.panelItem.inheritanceMessage.style.display = "none";
      this.panelItem.inheritancePathEditor.element.style.display = "none";
    }

  },

  closePanel() {
    if (!this.modalPanel.isVisible())
      return;
    this.modalPanel.hide();
  }

};
