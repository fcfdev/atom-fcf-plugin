'use babel';

import AtomFcfPluginView from './atom-fcf-plugin-view';
import { CompositeDisposable, TextEditor } from 'atom';
import * as libChildProcess from 'child_process';
import * as libFS from 'fs';

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
        this.executeCommand(a_target, "module", "Enter a new module name", false);
      },
      'atom-fcf-plugin:create-package': (a_target) => {
        this.executeCommand(a_target, "package", "Enter a new package name", false);
      },
      'atom-fcf-plugin:create-projection': (a_target) => {
        this.executeCommand(a_target, "projection", "Enter a new projection name", false);
      },
      'atom-fcf-plugin:create-template': (a_target) => {
        this.executeCommand(a_target, "template", "Enter a new template name", true);
      },
      'atom-fcf-plugin:create-template-file': (a_target) => {
        this.executeCommand(a_target, "template-file", "Enter a new template file name", true);
      },
      'atom-fcf-plugin:create-wrapper': (a_target) => {
        this.executeCommand(a_target, "wrapper", "Enter a new wrapper file name", true);
      },
      'atom-fcf-plugin:create-hooks': (a_target) => {
        this.executeCommand(a_target, "hooks", "Enter a new hooks file name", false);
      },
      'atom-fcf-plugin:create-receive': (a_target) => {
        this.executeCommand(a_target, "receive", "Enter a new receive file name", false);
      },
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

  executeCommand(a_target, a_command, a_inputDescription, a_enableInheritance){
    let directory = a_target.target.dataset.path !== undefined
                      ? a_target.target.dataset.path
                      : document.querySelectorAll(".tool-panel.tree-view>.tree-view-root .selected .name")[0].getAttribute("data-path");
    if (!libFS.statSync(directory).isDirectory())
      directory = require('path').dirname(directory);
    this.showPanel(a_inputDescription, a_enableInheritance, ()=>{
      this.createTemplate(directory, a_command, this.panelItem.pathEditor.getText(), a_enableInheritance ? this.panelItem.inheritancePathEditor.getText() : "");
    });
  },

  createTemplate(a_directory, a_templateType, a_templateName, a_inheritance) {
    libChildProcess.exec(`fcfmngr create "${a_templateType}" "${a_templateName}" "${a_inheritance}"`, { cwd: a_directory });
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
