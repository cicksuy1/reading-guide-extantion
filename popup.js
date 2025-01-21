const Settings = {
    defaults: {
      enabled: true,
      barColor: '#FFFF00',
      opacity: 10,
      height: 30,
      smoothFollow: true,
      followSpeed: 50
    },
  
    async load() {
      try {
        return await new Promise((resolve) => {
          chrome.storage.local.get(this.defaults, resolve);
        });
      } catch (error) {
        console.error('Error loading settings:', error);
        return this.defaults;
      }
    },
  
    async save(settings) {
      try {
        await new Promise((resolve) => {
          chrome.storage.local.set(settings, resolve);
        });
        return true;
      } catch (error) {
        console.error('Error saving settings:', error);
        return false;
      }
    }
  };
  
  const UI = {
    elements: {},
  
    initialize() {
      // Cache DOM elements
      const ids = ['enabled', 'barColor', 'opacity', 'height', 'smoothFollow', 'followSpeed'];
      ids.forEach(id => {
        this.elements[id] = document.getElementById(id);
      });
  
      // Add event listeners
      ids.forEach(id => {
        this.elements[id].addEventListener('change', () => this.handleChange());
        this.elements[id].addEventListener('input', () => this.handleInput());
      });
    },
  
    updateDisplay(settings) {
      // Update inputs
      Object.keys(settings).forEach(key => {
        const element = this.elements[key];
        if (element) {
          if (element.type === 'checkbox') {
            element.checked = settings[key];
          } else {
            element.value = settings[key];
          }
        }
      });
  
      // Update display values
      document.getElementById('opacityValue').textContent = `${settings.opacity}%`;
      document.getElementById('heightValue').textContent = `${settings.height}px`;
      document.getElementById('speedValue').textContent = `${settings.followSpeed}%`;
  
      this.updatePreview(settings);
    },
  
    updatePreview(settings) {
      const preview = document.getElementById('barPreview');
      preview.style.backgroundColor = settings.barColor;
      preview.style.opacity = settings.opacity / 100;
      preview.style.height = `${settings.height}px`;
      preview.style.width = '100%';
      preview.style.position = 'absolute';
      preview.style.top = '0';
    },
  
    getSettings() {
      return {
        enabled: this.elements.enabled.checked,
        barColor: this.elements.barColor.value,
        opacity: parseInt(this.elements.opacity.value),
        height: parseInt(this.elements.height.value),
        smoothFollow: this.elements.smoothFollow.checked,
        followSpeed: parseInt(this.elements.followSpeed.value)
      };
    },
  
    async handleChange() {
      const settings = this.getSettings();
      await Settings.save(settings);
      this.updateDisplay(settings);
      this.notifyContentScript(settings);
    },
  
    handleInput() {
      const settings = this.getSettings();
      this.updateDisplay(settings);
    },
  
    async notifyContentScript(settings) {
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'updateSettings',
          settings: settings
        });
      }
    }
  };
  
  // Initialize popup
  document.addEventListener('DOMContentLoaded', async () => {
    UI.initialize();
    const settings = await Settings.load();
    UI.updateDisplay(settings);
  });
  