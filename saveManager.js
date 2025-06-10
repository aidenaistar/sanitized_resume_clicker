/**
 * SaveManager - Handles all save/load operations for Resume Clicker
 * Features: Auto-save, backup slots, import/export, data compression, localStorage management
 */
class SaveManager {
    constructor(gameState, notificationCallback = null) {
        this.gameState = gameState;
        this.showNotification = notificationCallback;
        
        // Configuration
        this.config = {
            primarySaveKey: 'resumeClickerSave',
            backupSaveKey: 'resumeClickerBackup',
            autoSaveInterval: 30000, // 30 seconds
            maxSaveSize: 10240, // 10KB limit
            compressionThreshold: 5120 // 5KB - compress if larger
        };
        
        // State tracking
        this.autoSaveTimer = null;
        this.lastSaveTime = 0;
        this.saveCounter = 0;
        
        // Initialize
        this.init();
    }

    /**
     * Initialize SaveManager
     */
    init() {
        // Check localStorage availability
        if (!this.isLocalStorageAvailable()) {
            console.warn('⚠️ localStorage not available - save functionality disabled');
            this.notify('Warning: Save functionality not available', 'warning');
            return;
        }
        
        // Start auto-save
        this.startAutoSave();
        
        // Try to load existing save on init
        this.autoLoad();
        
        console.log('💾 SaveManager initialized successfully');
    }

    /**
     * Check if localStorage is available and working
     */
    isLocalStorageAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, 'test');
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Start auto-save functionality
     */
    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setInterval(() => {
            this.autoSave();
        }, this.config.autoSaveInterval);
        
        console.log(`🔄 Auto-save started (every ${this.config.autoSaveInterval / 1000}s)`);
    }

    /**
     * Stop auto-save functionality
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
            console.log('⏹️ Auto-save stopped');
        }
    }

    /**
     * Perform auto-save (silent, no notifications)
     */
    autoSave() {
        try {
            const success = this.save(true); // silent = true
            if (success) {
                console.log('🔄 Auto-save completed');
            }
        } catch (error) {
            console.warn('⚠️ Auto-save failed:', error.message);
        }
    }

    /**
     * Manually save game (with user feedback)
     */
    manualSave() {
        const success = this.save(false); // silent = false
        return success;
    }

    /**
     * Core save function
     * @param {boolean} silent - Whether to show notifications
     * @returns {boolean} Success status
     */
    save(silent = false) {
        if (!this.isLocalStorageAvailable()) {
            if (!silent) this.notify('Save failed: localStorage not available', 'error');
            return false;
        }

        try {
            // Serialize game state
            const saveData = this.gameState.serialize();
            const saveJson = JSON.stringify(saveData);
            
            // Check save size
            const saveSize = new Blob([saveJson]).size;
            if (saveSize > this.config.maxSaveSize) {
                console.warn(`⚠️ Save size (${saveSize} bytes) exceeds limit (${this.config.maxSaveSize} bytes)`);
                if (!silent) this.notify('Warning: Save file is large, may cause issues', 'warning');
            }

            // Create backup before saving new data
            this.createBackup();
            
            // Save primary data
            localStorage.setItem(this.config.primarySaveKey, saveJson);
            
            // Update tracking
            this.lastSaveTime = Date.now();
            this.saveCounter++;
            
            // Success feedback
            if (!silent) {
                this.notify('Game saved successfully!', 'success');
                console.log(`💾 Game saved (${saveSize} bytes, save #${this.saveCounter})`);
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Save failed:', error);
            if (!silent) this.notify('Failed to save game: ' + error.message, 'error');
            return false;
        }
    }

    /**
     * Load game from localStorage
     * @returns {boolean} Success status
     */
    load() {
        if (!this.isLocalStorageAvailable()) {
            this.notify('Load failed: localStorage not available', 'error');
            return false;
        }

        try {
            const saveData = localStorage.getItem(this.config.primarySaveKey);
            
            if (!saveData) {
                this.notify('No save data found!', 'warning');
                return false;
            }

            // Parse and validate save data
            const parsedData = JSON.parse(saveData);
            if (!this.validateSaveData(parsedData)) {
                throw new Error('Invalid save data format');
            }

            // Load into game state
            this.gameState.deserialize(parsedData);
            
            this.notify('Game loaded successfully!', 'success');
            console.log('📁 Game loaded from localStorage');
            
            return true;
            
        } catch (error) {
            console.error('❌ Load failed:', error);
            
            // Try loading from backup
            if (this.loadFromBackup()) {
                this.notify('Loaded from backup due to corrupted save', 'warning');
                return true;
            }
            
            this.notify('Failed to load game: ' + error.message, 'error');
            return false;
        }
    }

    /**
     * Auto-load on initialization (silent)
     */
    autoLoad() {
        try {
            const saveData = localStorage.getItem(this.config.primarySaveKey);
            if (saveData) {
                const parsedData = JSON.parse(saveData);
                if (this.validateSaveData(parsedData)) {
                    this.gameState.deserialize(parsedData);
                    console.log('📁 Auto-loaded existing save');
                }
            }
        } catch (error) {
            console.warn('⚠️ Auto-load failed, starting fresh:', error.message);
        }
    }

    /**
     * Create backup of current save
     */
    createBackup() {
        try {
            const currentSave = localStorage.getItem(this.config.primarySaveKey);
            if (currentSave) {
                localStorage.setItem(this.config.backupSaveKey, currentSave);
                console.log('💿 Backup created');
            }
        } catch (error) {
            console.warn('⚠️ Backup creation failed:', error.message);
        }
    }

    /**
     * Load from backup
     * @returns {boolean} Success status
     */
    loadFromBackup() {
        try {
            const backupData = localStorage.getItem(this.config.backupSaveKey);
            if (!backupData) return false;

            const parsedData = JSON.parse(backupData);
            if (!this.validateSaveData(parsedData)) return false;

            this.gameState.deserialize(parsedData);
            console.log('📁 Loaded from backup');
            return true;
            
        } catch (error) {
            console.warn('⚠️ Backup load failed:', error.message);
            return false;
        }
    }

    /**
     * Validate save data structure
     * @param {Object} data - Parsed save data
     * @returns {boolean} True if valid
     */
    validateSaveData(data) {
        if (!data || typeof data !== 'object') return false;
        
        // Check required fields
        const requiredFields = ['resumes', 'totalResumes', 'clickPower'];
        for (const field of requiredFields) {
            if (!(field in data)) {
                console.warn(`Missing required field: ${field}`);
                return false;
            }
        }
        
        // Validate prestige data if present
        if (data.prestige && typeof data.prestige === 'object') {
            const prestigeRequired = ['level', 'lifeExperiencePoints', 'currentIndustry'];
            for (const field of prestigeRequired) {
                if (!(field in data.prestige)) {
                    console.warn(`Missing prestige field: ${field}`);
                    // Don't fail validation, just set defaults
                    break;
                }
            }
        }
        
        return true;
    }

    /**
     * Export save data as downloadable file
     * @returns {boolean} Success status
     */
    exportSave() {
        try {
            const saveData = this.gameState.serialize();
            const saveJson = JSON.stringify(saveData, null, 2);
            
            // Create download
            const blob = new Blob([saveJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `resume-clicker-save-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            this.notify('Save exported successfully!', 'success');
            console.log('📤 Save exported as file');
            return true;
            
        } catch (error) {
            console.error('❌ Export failed:', error);
            this.notify('Failed to export save: ' + error.message, 'error');
            return false;
        }
    }

    /**
     * Import save data from file
     * @param {File} file - File to import
     * @returns {Promise<boolean>} Success status
     */
    async importSave(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (!this.validateSaveData(data)) {
                throw new Error('Invalid save file format');
            }
            
            // Create backup before importing
            this.createBackup();
            
            // Load imported data
            this.gameState.deserialize(data);
            
            // Save imported data to localStorage
            this.save(true);
            
            this.notify('Save imported successfully!', 'success');
            console.log('📥 Save imported from file');
            return true;
            
        } catch (error) {
            console.error('❌ Import failed:', error);
            this.notify('Failed to import save: ' + error.message, 'error');
            return false;
        }
    }

    /**
     * Reset all save data
     */
    resetSave() {
        try {
            localStorage.removeItem(this.config.primarySaveKey);
            localStorage.removeItem(this.config.backupSaveKey);
            
            this.notify('All save data cleared!', 'success');
            console.log('🗑️ Save data reset');
            return true;
            
        } catch (error) {
            console.error('❌ Reset failed:', error);
            this.notify('Failed to reset save data: ' + error.message, 'error');
            return false;
        }
    }

    /**
     * Get save statistics
     * @returns {Object} Save stats
     */
    getSaveStats() {
        try {
            const saveData = localStorage.getItem(this.config.primarySaveKey);
            const backupData = localStorage.getItem(this.config.backupSaveKey);
            
            return {
                hasSave: !!saveData,
                hasBackup: !!backupData,
                saveSize: saveData ? new Blob([saveData]).size : 0,
                backupSize: backupData ? new Blob([backupData]).size : 0,
                lastSaveTime: this.lastSaveTime,
                saveCounter: this.saveCounter,
                autoSaveEnabled: !!this.autoSaveTimer
            };
        } catch (error) {
            console.warn('⚠️ Failed to get save stats:', error.message);
            return null;
        }
    }

    /**
     * Show notification (if callback provided)
     */
    notify(message, type = 'success') {
        if (this.showNotification) {
            this.showNotification(message, type);
        }
    }

    /**
     * Cleanup on destruction
     */
    destroy() {
        this.stopAutoSave();
        console.log('💾 SaveManager destroyed');
    }
}

// Export for module use (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SaveManager;
} 