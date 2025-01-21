// content.js
const Settings = {
    defaults: {
      enabled: true,
      barColor: '#FFFF00',
      opacity: 10,
      height: 30,
      smoothFollow: true,
      followSpeed: 50
    }
  };
  
  class ReadingBar {
    constructor() {
      this.settings = null;
      this.bar = null;
      this.initialize();
    }
  
    async initialize() {
      try {
        this.settings = await this.loadSettings();
        this.createBar();
        this.setupEventListeners();
        this.updateBarStyles();
        this.show();
      } catch (error) {
        console.error('Error initializing reading bar:', error);
      }
    }
  
    async loadSettings() {
      return new Promise((resolve) => {
        chrome.storage.local.get(Settings.defaults, resolve);
      });
    }
  
    createBar() {
      this.bar = document.createElement('div');
      this.bar.className = 'reading-bar';
      document.body.appendChild(this.bar);
    }
  
    setupEventListeners() {
      // Mouse movement
      document.addEventListener('mousemove', (e) => {
        window.requestAnimationFrame(() => this.updatePosition(e));
      });
  
      // Settings updates
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'updateSettings') {
          this.settings = request.settings;
          this.updateBarStyles();
          this.toggleVisibility();
        }
      });
  
      // Window events
      window.addEventListener('resize', () => this.handleResize());
      document.addEventListener('scroll', () => this.handleScroll());
    }
  
    updatePosition(e) {
      if (!this.bar || !this.settings.enabled) return;
  
      const barHeight = this.bar.offsetHeight;
      const yPosition = e.clientY - (barHeight / 2);
      const maxY = window.innerHeight - barHeight;
      const clampedY = Math.max(0, Math.min(yPosition, maxY));
      
      this.bar.style.top = `${clampedY}px`;
    }
  
    updateBarStyles() {
      if (!this.bar) return;
      
      this.bar.style.height = `${this.settings.height}px`;
      this.bar.style.backgroundColor = this.settings.barColor;
      this.bar.style.opacity = this.settings.opacity / 100;
      this.bar.style.transition = this.settings.smoothFollow ? 
        `top ${(100 - this.settings.followSpeed) / 1000}s ease` : 'none';
    }
  
    toggleVisibility() {
      if (this.bar) {
        this.bar.style.display = this.settings.enabled ? 'block' : 'none';
      }
    }
  
    handleResize() {
      if (this.bar) {
        const currentTop = parseInt(this.bar.style.top) || 0;
        const maxY = window.innerHeight - this.bar.offsetHeight;
        this.bar.style.top = `${Math.min(currentTop, maxY)}px`;
      }
    }
  
    handleScroll() {
      if (this.bar) {
        const currentTop = parseInt(this.bar.style.top) || 0;
        this.bar.style.top = `${currentTop}px`;
      }
    }
  
    show() {
      if (this.bar && this.settings.enabled) {
        this.bar.style.display = 'block';
      }
    }
  }
  
  // Initialize reading bar
  new ReadingBar();