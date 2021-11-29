import { 
   App, 
   MarkdownPreviewView, 
   MarkdownView, 
   Plugin, 
   PluginSettingTab, 
   Setting, 
} from 'obsidian';

// Remember to rename these classes and interfaces!


interface PreviewKeybindsPluginSettings {
   linesToScroll: number;
   up: string;
   down: string;
   enterEditMode: string;
   searchDoc: string;
   scrollBottom: string;
   scrollTop: string;
}

const DEFAULT_SETTINGS: PreviewKeybindsPluginSettings = {
   linesToScroll: 3,
   up: 'k',
   down: 'j',
   enterEditMode: 'i',
   searchDoc: '/',
   scrollBottom: 'g',
   scrollTop: '0',
}

export default class PreviewKeybinds extends Plugin {
	public settings: PreviewKeybindsPluginSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new PreviewKeybindsSettingTab(this.app, this));

      this.registerEvent(this.app.workspace.on("layout-change", this.onLayoutChange));
	}
   /*onPlaceholderEvent(cm: Editor): (instance: Editor, option: string) => void {
      throw new Error('Method not implemented.');
   }*/

   private readonly onLayoutChange= (): void => {
      const previews: HTMLElement[] =  Array.from(document.querySelectorAll(".markdown-preview-view"));
      previews.forEach((preview) => {
         /* Using parent element to potentially fix preview not being focused after closing search bar, revert if doesn't work? */
         this.registerDomEvent(preview.parentElement, "keydown", this.onKeyDown);
      })
   }

   private readonly onKeyDown = (e: KeyboardEvent) => {
      const view = this.app.workspace.getActiveViewOfType(MarkdownView);
      /* this works but this.app.workspave.getActiveViewOfType(MarkdownView).previewMode.applyScroll() doesn't. why?? */
      const preview = this.app.workspace.getActiveViewOfType(MarkdownView).previewMode;
      if (view.containerEl.querySelector('.is-searching') || !preview) {
         console.debug('skipping keyboard event ', e.key);
      }

      switch (e.key) {
         case this.settings.up:
            preview.applyScroll(preview.getScroll() - this.settings.linesToScroll);
            break;
         case this.settings.down:
            preview.applyScroll(preview.getScroll() + this.settings.linesToScroll);
            break;
         case this.settings.enterEditMode:
            /* kind of hacky */
            (this.app as any).commands.executeCommandById('markdown:toggle-preview');
            break;
         case this.settings.searchDoc:
            view.showSearch(false);
            e.preventDefault();
            break;
         case this.settings.scrollTop:
            preview.applyScroll(0);
            break;
         case this.settings.scrollBottom:
            // doesn't work TODO
            preview.applyScroll(view.editor.lastLine());
            break;
         default:
            return;
      }
   }


	async onunload() {
      this.app.workspace.iterateCodeMirrors((cm) => {
         cm.off('optionChange', this.onLayoutChange);
      });
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

}

class PreviewKeybindsSettingTab extends PluginSettingTab {
	plugin: PreviewKeybinds;

	constructor(app: App, plugin: PreviewKeybinds) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();


		new Setting(containerEl)
			.setName('Number of Lines to Scroll')
			.setDesc("Affects 'Scroll up' and 'Scroll down' keybinds")
			.addText(text => text 
				.setValue(this.plugin.settings.linesToScroll.toString())
				.onChange(async (value) => {
               let newVal = Number(value)
               /* compare to NaN instead? */
               if(newVal === null) return;
               if(newVal <= 0) newVal = 1;
					this.plugin.settings.linesToScroll = Math.round(newVal);
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h3', {text: 'Custom Keybindings'});
		containerEl.createEl('p', {text: 'Only non-space character keys (letters, symbols and digits) can be used for keybindings. Arrow keys, enter, space, tab etc. are not supproted. Modifier keys (shift, alt etc.) are not supported.'});


		new Setting(containerEl)
			.setName('Scroll Up')
			.addText(text => text 
				.setValue(this.plugin.settings.up)
				.onChange(async (value) => {
               let newKey: string = this.verifyNewKeyBinding(value);
               if(newKey === '') return;
					this.plugin.settings.up = newKey;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Scroll Down')
			//.setDesc('Toggle Plugin')
			.addText(text => text 
				.setValue(this.plugin.settings.down)
				.onChange(async (value) => {
               let newKey: string = this.verifyNewKeyBinding(value);
               if(newKey === '') return;
					this.plugin.settings.down = newKey;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Enter Edit Mode')
			//.setDesc('Toggle Plugin')
			.addText(text => text 
				.setValue(this.plugin.settings.enterEditMode)
				.onChange(async (value) => {
               let newKey: string = this.verifyNewKeyBinding(value);
               if(newKey === '') return;
					this.plugin.settings.enterEditMode = newKey;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Search')
			//.setDesc('Toggle Plugin')
			.addText(text => text 
				.setValue(this.plugin.settings.searchDoc)
				.onChange(async (value) => {
               let newKey: string = this.verifyNewKeyBinding(value);
               if(newKey === '') return;
					this.plugin.settings.searchDoc = newKey;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Scroll to Bottom')
			//.setDesc('Toggle Plugin')
			.addText(text => text 
				.setValue(this.plugin.settings.scrollBottom)
				.onChange(async (value) => {
               let newKey: string = this.verifyNewKeyBinding(value);
               if(newKey === '') return;
					this.plugin.settings.scrollBottom = newKey;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Scroll to Top')
			//.setDesc('Toggle Plugin')
			.addText(text => text 
				.setValue(this.plugin.settings.scrollTop)
				.onChange(async (value) => {
               let newKey: string = this.verifyNewKeyBinding(value);
               if(newKey === '') return;
					this.plugin.settings.scrollTop = newKey;
					await this.plugin.saveSettings();
				}));
	}

   private readonly verifyNewKeyBinding = (newKey: string): string => {
      if (newKey.length >= 0) newKey = newKey.trim().charAt(0);
      return newKey.toLowerCase();
   }

}

