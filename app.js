// Resume Clicker - Core Game Engine Implementation (Task 2)
// Refactored into separate classes for better architecture

/**
 * GameState class to manage all game data
 */
class GameState {
    constructor() {
        // Use BigNumber for large number handling
        this.resumes = new BigNumber(0);
        this.totalResumes = new BigNumber(0);
        this.resumesPerSecond = new BigNumber(0);
        this.clickPower = new BigNumber(1);
        
        // Auto-senders management
        this.autoSenders = new Map();
        this.initializeAutoSenders();
        
        // Other game state
        this.upgrades = [];
        this.initializeUpgrades();
        this.achievementTracker = new AchievementTracker(this);
        this.achievements = this.achievementTracker.getAllAchievements(); // Legacy compatibility
        
        // Initialize prestige system
        this.prestige = new Prestige(this);
        
        // Performance tracking
        this.lastUpdateTime = performance.now();
        this.frameCount = 0;
        this.fps = 60;
    }

    /**
     * Initialize available auto-senders
     */
    initializeAutoSenders() {
        // Create LinkedIn Premium Bot (existing)
        const linkedinBot = new AutoSender(
            'linkedin-premium',
            'LinkedIn Premium Bot',
            15,  // baseCost
            0.1  // baseProduction (resumes per second)
        );
        linkedinBot.description = 'Automatically sends resumes to LinkedIn Premium job postings. Your first step into automation!';
        linkedinBot.icon = '💼';
        linkedinBot.unlockThreshold = 0; // Available from start
        
        this.autoSenders.set('linkedin-premium', linkedinBot);

        // Create Indeed Mass Applier
        const indeedApplier = new AutoSender(
            'indeed-mass-applier',
            'Indeed Mass Applier',
            500,  // baseCost
            8     // baseProduction (resumes per second)
        );
        indeedApplier.description = 'Spray and pray approach to job applications. Bulk applies to hundreds of Indeed postings automatically.';
        indeedApplier.icon = '📮';
        indeedApplier.unlockThreshold = 100; // Unlock after 100 total resumes
        
        this.autoSenders.set('indeed-mass-applier', indeedApplier);

        // Create Recruiter Network
        const recruiterNetwork = new AutoSender(
            'recruiter-network',
            'Recruiter Network',
            1200, // baseCost
            15    // baseProduction (resumes per second)
        );
        recruiterNetwork.description = 'Network of recruiters working on your behalf. They promise results but mostly just add to your LinkedIn connections.';
        recruiterNetwork.icon = '🕸️';
        recruiterNetwork.unlockThreshold = 250; // Unlock after 250 total resumes
        
        this.autoSenders.set('recruiter-network', recruiterNetwork);

        // Create Career Coach
        const careerCoach = new AutoSender(
            'career-coach',
            'Career Coach',
            2500, // baseCost
            25    // baseProduction (resumes per second)
        );
        careerCoach.description = 'Professional guidance for your job search strategy. Provides motivational quotes while doing nothing else.';
        careerCoach.icon = '🎓';
        careerCoach.unlockThreshold = 500; // Unlock after 500 total resumes
        
        this.autoSenders.set('career-coach', careerCoach);

        // Create Networking Events
        const networkingEvents = new AutoSender(
            'networking-events',
            'Networking Events',
            4000, // baseCost
            35    // baseProduction (resumes per second)
        );
        networkingEvents.description = 'Automated small talk generators at networking events. Schmooze your way to new opportunities!';
        networkingEvents.icon = '🤝';
        networkingEvents.unlockThreshold = 750; // Unlock after 750 total resumes
        
        this.autoSenders.set('networking-events', networkingEvents);

        // Create Job Fair Booth
        const jobFairBooth = new AutoSender(
            'job-fair-booth',
            'Job Fair Booth',
            8000, // baseCost
            50    // baseProduction (resumes per second)
        );
        jobFairBooth.description = 'Your own booth at job fairs across the country. Mindless resume distribution at its finest.';
        jobFairBooth.icon = '🏪';
        jobFairBooth.unlockThreshold = 1000; // Unlock after 1000 total resumes
        
        this.autoSenders.set('job-fair-booth', jobFairBooth);

        // Create Headhunter Agency
        const headhunterAgency = new AutoSender(
            'headhunter-agency',
            'Headhunter Agency',
            15000, // baseCost
            75     // baseProduction (resumes per second)
        );
        headhunterAgency.description = 'Elite headhunters hunting heads for you. Promises dream jobs, delivers nothing but hope.';
        headhunterAgency.icon = '🔍';
        headhunterAgency.unlockThreshold = 1500; // Unlock after 1500 total resumes
        
        this.autoSenders.set('headhunter-agency', headhunterAgency);

        // Create AI Resume Optimizer (highest tier)
        const aiOptimizer = new AutoSender(
            'ai-resume-optimizer',
            'AI Resume Optimizer',
            25000, // baseCost
            100    // baseProduction (resumes per second)
        );
        aiOptimizer.description = 'AI-powered resume optimization using machine learning algorithms. Constantly tweaks your resume to perfection.';
        aiOptimizer.icon = '🤖';
        aiOptimizer.unlockThreshold = 2000; // Unlock after 2000 total resumes
        
        this.autoSenders.set('ai-resume-optimizer', aiOptimizer);
    }

    /**
     * Initialize available upgrades
     */
    initializeUpgrades() {
        // Tier 1: Basic Upgrades (Foundation)
        const resumeFormatting = new Upgrade(
            'resume-formatting',
            'Resume Formatting',
            100,  // Cost: 100 resumes
            { type: 'click_multiplier', value: 2 }, // Double click power
            'Professionally format your resume for better impact. Doubles your click power!'
        );
        resumeFormatting.icon = '📝';
        resumeFormatting.unlockConditions.resumesSent = new BigNumber(75); // Unlock at 75 resumes sent (closer to cost)
        
        const coverLetterTemplates = new Upgrade(
            'cover-letter-templates',
            'Cover Letter Templates',
            250,  // Cost: 250 resumes
            { type: 'auto_sender_efficiency', value: 1.5 }, // 50% boost to auto-sender efficiency
            'Pre-written cover letter templates for different industries. Increases auto-sender efficiency by 50%!'
        );
        coverLetterTemplates.icon = '📋';
        coverLetterTemplates.unlockConditions.resumesSent = new BigNumber(200);
        coverLetterTemplates.dependencies = ['resume-formatting']; // Depends on resume formatting
        
        // Tier 2: Professional Upgrades
        const professionalHeadshots = new Upgrade(
            'professional-headshots',
            'Professional Headshots',
            500,  // Cost: 500 resumes
            { type: 'click_multiplier', value: 1.5 }, // Additional 50% click multiplier
            'High-quality professional photos that make you look competent. Increases click power by 50%!'
        );
        professionalHeadshots.icon = '📸';
        professionalHeadshots.unlockConditions.resumesSent = new BigNumber(400);
        professionalHeadshots.dependencies = ['cover-letter-templates'];
        
        const linkedinOptimization = new Upgrade(
            'linkedin-optimization',
            'LinkedIn Optimization',
            750,  // Cost: 750 resumes
            { type: 'auto_sender_unlock_boost', value: 0.8 }, // Reduce unlock thresholds by 20%
            'Optimize your LinkedIn profile for maximum visibility. Reduces auto-sender unlock requirements!'
        );
        linkedinOptimization.icon = '💼';
        linkedinOptimization.unlockConditions.resumesSent = new BigNumber(600);
        linkedinOptimization.dependencies = ['resume-formatting'];
        
        // Tier 3: Advanced Upgrades
        const interviewPrepCourses = new Upgrade(
            'interview-prep-courses',
            'Interview Prep Courses',
            1200,  // Cost: 1200 resumes
            { type: 'click_multiplier', value: 2 }, // Double click power again
            'Master the art of saying "I\'m passionate about synergy" with confidence. Doubles click power!'
        );
        interviewPrepCourses.icon = '🎭';
        interviewPrepCourses.unlockConditions.resumesSent = new BigNumber(1000);
        interviewPrepCourses.dependencies = ['professional-headshots', 'linkedin-optimization'];
        
        const certificationPrograms = new Upgrade(
            'certification-programs',
            'Certification Programs',
            1800,  // Cost: 1800 resumes
            { type: 'auto_sender_efficiency', value: 2 }, // Double auto-sender efficiency
            'Collect meaningless certificates that HR loves. Doubles auto-sender efficiency!'
        );
        certificationPrograms.icon = '🏆';
        certificationPrograms.unlockConditions.resumesSent = new BigNumber(1500);
        certificationPrograms.dependencies = ['cover-letter-templates'];
        
        // Tier 4: Expert Upgrades
        const skillsEndorsements = new Upgrade(
            'skills-endorsements',
            'Skills Endorsements',
            2500,  // Cost: 2500 resumes
            { type: 'auto_sender_cost_reduction', value: 0.25 }, // 25% cost reduction for auto-senders
            'Get your mom to endorse you for "leadership" on LinkedIn. Reduces auto-sender costs by 25%!'
        );
        skillsEndorsements.icon = '⭐';
        skillsEndorsements.unlockConditions.resumesSent = new BigNumber(2200);
        skillsEndorsements.dependencies = ['linkedin-optimization', 'certification-programs'];
        
        const portfolioEnhancements = new Upgrade(
            'portfolio-enhancements',
            'Portfolio Enhancements',
            3500,  // Cost: 3500 resumes
            { type: 'click_multiplier', value: 3 }, // Triple click power
            'A fancy website that nobody will ever visit. Triples your click power!'
        );
        portfolioEnhancements.icon = '🌐';
        portfolioEnhancements.unlockConditions.resumesSent = new BigNumber(3000);
        portfolioEnhancements.dependencies = ['interview-prep-courses'];
        
        // Tier 5: Master Tier (Endgame)
        const networkingMastery = new Upgrade(
            'networking-mastery',
            'Networking Mastery',
            5000,  // Cost: 5000 resumes
            { type: 'auto_sender_efficiency', value: 3 }, // Triple auto-sender efficiency
            'Master the art of pretending to care about strangers\' weekend plans. Triples auto-sender efficiency!'
        );
        networkingMastery.icon = '🤝';
        networkingMastery.unlockConditions.resumesSent = new BigNumber(4500);
        networkingMastery.dependencies = ['skills-endorsements'];
        
        const executivePresence = new Upgrade(
            'executive-presence',
            'Executive Presence',
            7500,  // Cost: 7500 resumes
            { type: 'click_multiplier', value: 5 }, // 5x click power
            'Learn to speak in corporate buzzwords fluently. 5x click power for maximum synergistic impact!'
        );
        executivePresence.icon = '👔';
        executivePresence.unlockConditions.resumesSent = new BigNumber(7000);
        executivePresence.dependencies = ['portfolio-enhancements', 'networking-mastery'];
        
        // Ultimate Upgrade
        const thoughtLeadership = new Upgrade(
            'thought-leadership',
            'Thought Leadership',
            12000, // Cost: 12000 resumes
            { type: 'ultimate_multiplier', value: 10 }, // 10x to everything
            'Become a LinkedIn influencer who posts about "Monday Motivation". 10x multiplier to all effects!'
        );
        thoughtLeadership.icon = '🧠';
        thoughtLeadership.unlockConditions.resumesSent = new BigNumber(11000);
        thoughtLeadership.dependencies = ['executive-presence'];
        
        // Add all upgrades to the array
        this.upgrades.push(
            resumeFormatting,
            coverLetterTemplates,
            professionalHeadshots,
            linkedinOptimization,
            interviewPrepCourses,
            certificationPrograms,
            skillsEndorsements,
            portfolioEnhancements,
            networkingMastery,
            executivePresence,
            thoughtLeadership
        );
    }

    /**
     * Get specific auto-sender by ID
     * @param {string} id - Auto-sender ID
     * @returns {AutoSender|null}
     */
    getAutoSender(id) {
        return this.autoSenders.get(id) || null;
    }

    /**
     * Get all available auto-senders (unlocked only)
     * @returns {Array<AutoSender>}
     */
    getAvailableAutoSenders() {
        return Array.from(this.autoSenders.values())
            .filter(autoSender => autoSender.isUnlocked(this));
    }

    /**
     * Get all auto-senders (including locked ones) for checking unlock status
     * @returns {Array<AutoSender>}
     */
    getAllAutoSenders() {
        return Array.from(this.autoSenders.values());
    }

    /**
     * Purchase an auto-sender
     * @param {string} id - Auto-sender ID
     * @returns {Object} Purchase result
     */
    purchaseAutoSender(id) {
        const autoSender = this.getAutoSender(id);
        if (!autoSender) {
            return { success: false, error: 'Auto-sender not found' };
        }

        const purchaseResult = autoSender.purchase(this.resumes);
        if (purchaseResult.success) {
            // Deduct cost from player resumes
            this.resumes = this.resumes.minus(purchaseResult.cost);
            
            // Execute the purchase
            autoSender.executePurchase();
            
            // Recalculate resumes per second
            this.updateResumeGeneration();
        }

        return purchaseResult;
    }

    /**
     * Calculate and update total resume generation rate
     */
    updateResumeGeneration() {
        // Batch process all auto-senders for better performance
        let totalProduction = new BigNumber(0);
        
        // Use for...of loop for better performance than forEach
        for (const autoSender of this.autoSenders.values()) {
            if (autoSender.owned > 0) {
                totalProduction = totalProduction.plus(autoSender.getProductionRate());
            }
        }
        
        // Apply auto-sender boost from random events if available
        if (this.randomEventManager) {
            const boost = this.randomEventManager.getAutoSenderBoost();
            totalProduction = totalProduction.multipliedBy(boost);
        }
        
        this.resumesPerSecond = totalProduction;
    }

    /**
     * Add resumes from clicking
     */
    addResumes(amount) {
        const bigAmount = new BigNumber(amount);
        this.resumes = this.resumes.plus(bigAmount);
        this.totalResumes = this.totalResumes.plus(bigAmount);
    }

    /**
     * Add resumes from auto-generation
     * @param {BigNumber} amount - Amount to add
     */
    addAutoResumes(amount) {
        // Add precise amount; UI will display rounded values
        this.resumes = this.resumes.plus(amount);
        this.totalResumes = this.totalResumes.plus(amount);
    }

    /**
     * Get formatted number for display
     */
    getFormattedNumber(bigNumber) {
        // Round to a reasonable precision for display
        const rounded = bigNumber.decimalPlaces(3);
        
        if (rounded.isLessThan(1000)) {
            // For small numbers, show clean integers or minimal decimals
            if (rounded.modulo(1).isLessThan(0.01)) {
                // If very close to a whole number, show as integer
                return rounded.integerValue().toString();
            } else if (rounded.modulo(0.1).isLessThan(0.01)) {
                // If close to a tenth, show one decimal
                return rounded.toFixed(1);
            } else {
                // Otherwise show two decimals max
                return rounded.toFixed(2).replace(/\.?0+$/, '');
            }
        } else if (rounded.isLessThan(1000000)) {
            return rounded.dividedBy(1000).toFixed(1) + 'K';
        } else if (rounded.isLessThan(1000000000)) {
            return rounded.dividedBy(1000000).toFixed(1) + 'M';
        } else if (rounded.isLessThan(1000000000000)) {
            return rounded.dividedBy(1000000000).toFixed(1) + 'B';
        } else {
            return rounded.dividedBy(1000000000000).toFixed(1) + 'T';
        }
    }

    /**
     * Get formatted resume count (always whole numbers)
     */
    getFormattedResumeCount(bigNumber) {
        // Floor the number - you can't have partial resumes
        const wholeNumber = bigNumber.integerValue(BigNumber.ROUND_DOWN);
        
        if (wholeNumber.isLessThan(1000)) {
            return wholeNumber.toString();
        } else if (wholeNumber.isLessThan(1000000)) {
            return wholeNumber.dividedBy(1000).toFixed(1) + 'K';
        } else if (wholeNumber.isLessThan(1000000000)) {
            return wholeNumber.dividedBy(1000000).toFixed(1) + 'M';
        } else if (wholeNumber.isLessThan(1000000000000)) {
            return wholeNumber.dividedBy(1000000000).toFixed(1) + 'B';
        } else {
            return wholeNumber.dividedBy(1000000000000).toFixed(1) + 'T';
        }
    }

    /**
     * Get formatted cost (always whole numbers - you can't pay fractional resumes)
     */
    getFormattedCost(bigNumber) {
        // Ceil the cost - round up to ensure player has enough for purchase
        const wholeCost = bigNumber.integerValue(BigNumber.ROUND_CEIL);
        
        if (wholeCost.isLessThan(1000)) {
            return wholeCost.toString();
        } else if (wholeCost.isLessThan(1000000)) {
            return wholeCost.dividedBy(1000).toFixed(1) + 'K';
        } else if (wholeCost.isLessThan(1000000000)) {
            return wholeCost.dividedBy(1000000).toFixed(1) + 'M';
        } else if (wholeCost.isLessThan(1000000000000)) {
            return wholeCost.dividedBy(1000000000).toFixed(1) + 'B';
        } else {
            return wholeCost.dividedBy(1000000000000).toFixed(1) + 'T';
        }
    }

    /**
     * Serialize game state for saving
     */
    serialize() {
        // Convert auto-senders Map to serializable format
        const autoSendersData = {};
        for (const [id, autoSender] of this.autoSenders) {
            autoSendersData[id] = autoSender.serialize();
        }

        // Serialize upgrades
        const upgradesData = this.upgrades.map(upgrade => upgrade.serialize());

        // Serialize achievement tracker
        const achievementData = this.achievementTracker ? this.achievementTracker.serialize() : { achievements: {}, statistics: {} };

        // Serialize random event manager if available
        const randomEventData = this.randomEventManager ? this.randomEventManager.serialize() : {};

        return {
            resumes: this.resumes.toString(),
            totalResumes: this.totalResumes.toString(),
            resumesPerSecond: this.resumesPerSecond.toString(),
            clickPower: this.clickPower.toString(),
            autoSenders: autoSendersData,
            upgrades: upgradesData,
            achievements: achievementData.achievements, // For save compatibility
            achievementTracker: achievementData, // Full achievement tracker data
            prestige: this.prestige.serialize(),
            randomEvents: randomEventData,
            temporaryEffects: this.temporaryEffects || {},
            lastUpdateTime: this.lastUpdateTime,
            saveTimestamp: Date.now()
        };
    }

    /**
     * Deserialize game state from saved data
     */
    deserialize(data) {
        // Load basic state
        this.resumes = new BigNumber(data.resumes || 0);
        this.totalResumes = new BigNumber(data.totalResumes || 0);
        this.resumesPerSecond = new BigNumber(data.resumesPerSecond || 0);
        this.clickPower = new BigNumber(data.clickPower || 1);

        // Load auto-senders
        if (data.autoSenders) {
            for (const [id, autoSenderData] of Object.entries(data.autoSenders)) {
                const autoSender = this.getAutoSender(id);
                if (autoSender) {
                    autoSender.deserialize(autoSenderData);
                }
            }
        }

        // Load upgrades
        if (data.upgrades) {
            for (const upgradeData of data.upgrades) {
                const upgrade = this.getUpgrade(upgradeData.id);
                if (upgrade) {
                    upgrade.deserialize(upgradeData);
                }
            }
            // Apply upgrade effects after loading
            this.applyUpgradeEffects();
        }

        // Load achievement tracker data
        if (data.achievementTracker && this.achievementTracker) {
            this.achievementTracker.deserialize(data.achievementTracker);
        } else if (data.achievements && this.achievementTracker) {
            // Legacy compatibility for old save format
            console.log('Loading legacy achievement format...');
            const legacyData = {
                achievements: data.achievements,
                statistics: {}
            };
            this.achievementTracker.deserialize(legacyData);
        }

        // Update achievements array for legacy compatibility
        this.achievements = this.achievementTracker ? this.achievementTracker.getAllAchievements() : [];

        // Load random event manager data
        if (data.randomEvents && this.randomEventManager) {
            this.randomEventManager.deserialize(data.randomEvents);
        }

        // Load temporary effects
        if (data.temporaryEffects) {
            this.temporaryEffects = data.temporaryEffects;
        }

        // Update resume generation after loading auto-senders and applying upgrades
        this.updateResumeGeneration();

        // Load other data
        this.prestige.deserialize(data.prestige);
    }

    /**
     * Get specific upgrade by ID
     * @param {string} id - Upgrade ID
     * @returns {Upgrade|null}
     */
    getUpgrade(id) {
        return this.upgrades.find(upgrade => upgrade.id === id) || null;
    }

    /**
     * Get all available upgrades
     * @returns {Array<Upgrade>}
     */
    getAvailableUpgrades() {
        return this.upgrades;
    }

    /**
     * Purchase an upgrade
     * @param {string} id - Upgrade ID
     * @returns {Object} Purchase result
     */
    purchaseUpgrade(id) {
        const upgrade = this.getUpgrade(id);
        if (!upgrade) {
            return { success: false, error: 'Upgrade not found' };
        }

        if (!upgrade.isUnlocked(this)) {
            return { success: false, error: 'Upgrade not yet unlocked' };
        }

        const purchaseResult = upgrade.purchase(this.resumes);
        if (purchaseResult.success) {
            // Deduct cost from player resumes
            this.resumes = this.resumes.minus(purchaseResult.cost);
            
            // Execute the purchase
            upgrade.executePurchase();
            
            // Apply upgrade effects
            this.applyUpgradeEffects();
        }

        return purchaseResult;
    }

    /**
     * Apply all upgrade effects to game mechanics
     */
    applyUpgradeEffects() {
        // Reset click power to base (but maintain prestige bonuses)
        this.clickPower = new BigNumber(1);
        
        // Apply prestige permanent bonuses to click power
        const prestigeClickBonus = this.prestige.getPermanentBonusEffect('clickPowerMultiplier');
        this.clickPower = this.clickPower.multipliedBy(1 + prestigeClickBonus);
        
        // Apply industry bonuses to click power
        const industryBonuses = this.prestige.getCurrentIndustryBonuses();
        this.clickPower = this.clickPower.multipliedBy(industryBonuses.clickBonus);
        
        // Apply upgrade effects
        for (const upgrade of this.upgrades) {
            if (upgrade.purchased) {
                if (upgrade.effect.type === 'click_multiplier') {
                    this.clickPower = this.clickPower.multipliedBy(upgrade.effect.value);
                } else if (upgrade.effect.type === 'auto_sender_efficiency') {
                    // Apply to all auto-senders
                    for (const autoSender of this.autoSenders.values()) {
                        autoSender.efficiencyMultiplier = (autoSender.efficiencyMultiplier || 1) * upgrade.effect.value;
                    }
                } else if (upgrade.effect.type === 'auto_sender_unlock_boost') {
                    // Reduce unlock thresholds by the specified percentage
                    for (const autoSender of this.autoSenders.values()) {
                        autoSender.unlockThreshold = Math.floor(autoSender.unlockThreshold * upgrade.effect.value);
                    }
                }
            }
        }
        
        // Apply prestige auto-sender efficiency bonus
        const prestigeAutoSenderBonus = this.prestige.getPermanentBonusEffect('autoSenderEfficiency');
        const industryAutoSenderBonus = industryBonuses.autoSenderBonus;
        
        for (const autoSender of this.autoSenders.values()) {
            // Reset efficiency multiplier first
            autoSender.efficiencyMultiplier = 1;
            
            // Apply prestige bonus
            autoSender.efficiencyMultiplier *= (1 + prestigeAutoSenderBonus);
            
            // Apply industry bonus
            autoSender.efficiencyMultiplier *= industryAutoSenderBonus;
            
            // Re-apply upgrade bonuses
            for (const upgrade of this.upgrades) {
                if (upgrade.purchased && upgrade.effect.type === 'auto_sender_efficiency') {
                    autoSender.efficiencyMultiplier *= upgrade.effect.value;
                }
            }
        }
        
        // Apply upgrade cost reduction from prestige
        const upgradeCostReduction = this.prestige.getPermanentBonusEffect('upgradeCostReduction');
        if (upgradeCostReduction > 0) {
            for (const upgrade of this.upgrades) {
                if (!upgrade.purchased) {
                    upgrade.adjustedCost = Math.floor(upgrade.cost * (1 - upgradeCostReduction));
                }
            }
        }
    }

    /**
     * Analyze economic balance of auto-senders (for debugging/balancing)
     */
    analyzeEconomicBalance() {
        console.log('📊 Auto-sender Economic Analysis:');
        console.log('=====================================');
        
        this.getAllAutoSenders().forEach(autoSender => {
            const baseCost = autoSender.baseCost.toNumber();
            const baseProduction = autoSender.baseProduction.toNumber();
            const unlockThreshold = autoSender.unlockThreshold;
            
            // Calculate efficiency (production per cost)
            const efficiency = baseProduction / baseCost;
            
            // Calculate payback time (how long to earn back the cost)
            const paybackTime = baseCost / baseProduction;
            
            // Calculate cost for 10 units (to see scaling)
            const cost10 = autoSender.baseCost.multipliedBy(
                new BigNumber(1.15).exponentiatedBy(9)
            ).toNumber();
            
            console.log(`${autoSender.name}:`);
            console.log(`  Base Cost: ${baseCost} | Production: ${baseProduction}/sec`);
            console.log(`  Efficiency: ${efficiency.toFixed(4)} prod/cost`);
            console.log(`  Payback Time: ${paybackTime.toFixed(1)} seconds`);
            console.log(`  Unlock at: ${unlockThreshold} total resumes`);
            console.log(`  Cost for 10th: ${cost10.toFixed(0)}`);
            console.log('');
        });
        
        // Calculate total production at various stages
        const stages = [
            { name: 'Early Game', resumes: 100 },
            { name: 'Mid Game', resumes: 1000 },
            { name: 'Late Game', resumes: 10000 }
        ];
        
        stages.forEach(stage => {
            let totalProduction = 0;
            let totalCost = 0;
            
            this.getAllAutoSenders().forEach(autoSender => {
                if (autoSender.unlockThreshold <= stage.resumes) {
                    // Assume player can afford 1-3 of each unlocked auto-sender
                    const affordableCount = Math.min(3, Math.floor(stage.resumes / autoSender.baseCost.toNumber()));
                    if (affordableCount > 0) {
                        totalProduction += autoSender.baseProduction.toNumber() * affordableCount;
                        
                        // Calculate total cost for this many
                        let cost = 0;
                        for (let i = 0; i < affordableCount; i++) {
                            cost += autoSender.baseCost.multipliedBy(
                                new BigNumber(1.15).exponentiatedBy(i)
                            ).toNumber();
                        }
                        totalCost += cost;
                    }
                }
            });
            
            console.log(`${stage.name} (${stage.resumes} resumes):`);
            console.log(`  Total Production: ${totalProduction.toFixed(1)}/sec`);
            console.log(`  Total Investment: ${totalCost.toFixed(0)} resumes`);
            console.log(`  ROI Time: ${(totalCost / totalProduction / 60).toFixed(1)} minutes`);
            console.log('');
        });
    }
}

/**
 * AutoSender class to manage auto-generating resume functionality
 */
class AutoSender {
    constructor(id, name, baseCost, baseProduction) {
        this.id = id;
        this.name = name;
        this.baseCost = new BigNumber(baseCost);
        this.baseProduction = new BigNumber(baseProduction);
        this.owned = 0;
        
        // Description and display properties
        this.description = '';
        this.icon = '🤖';
        this.unlockThreshold = 0; // Unlock threshold based on total resumes
    }

    /**
     * Check if this auto-sender is unlocked based on game state
     * @param {GameState} gameState - Current game state
     * @returns {boolean}
     */
    isUnlocked(gameState) {
        return gameState.totalResumes.isGreaterThanOrEqualTo(this.unlockThreshold);
    }

    /**
     * Calculate current cost based on owned count
     * Formula: baseCost * (1.15^owned)
     */
    calculateCurrentCost() {
        const multiplier = new BigNumber(1.15).exponentiatedBy(this.owned);
        const exactCost = this.baseCost.multipliedBy(multiplier);
        // Round up to ensure costs are always whole numbers
        return exactCost.integerValue(BigNumber.ROUND_CEIL);
    }

    /**
     * Calculate current production rate per second
     * @returns {BigNumber} Production rate accounting for owned count and any bonuses
     */
    getProductionRate() {
        if (this.owned <= 0) {
            return new BigNumber(0);
        }
        
        // Base production multiplied by owned count
        let production = new BigNumber(this.baseProduction).multipliedBy(this.owned);
        
        // Apply efficiency multiplier from prestige bonuses and industry bonuses
        if (this.efficiencyMultiplier && this.efficiencyMultiplier !== 1) {
            production = production.multipliedBy(this.efficiencyMultiplier);
        }
        
        return production;
    }

    /**
     * Check if player can afford this auto-sender
     * @param {BigNumber} playerResumes - Current player resume count
     * @returns {boolean}
     */
    canAfford(playerResumes) {
        const currentCost = this.calculateCurrentCost();
        return playerResumes.isGreaterThanOrEqualTo(currentCost);
    }

    /**
     * Purchase this auto-sender (validation only - actual purchase handled by game state)
     * @param {BigNumber} playerResumes - Current player resume count
     * @returns {Object} Purchase result with success status and cost
     */
    purchase(playerResumes) {
        const currentCost = this.calculateCurrentCost();
        
        if (!this.canAfford(playerResumes)) {
            return {
                success: false,
                error: 'Insufficient resumes',
                cost: currentCost
            };
        }

        return {
            success: true,
            cost: currentCost,
            newOwned: this.owned + 1
        };
    }

    /**
     * Execute the purchase (updates owned count)
     */
    executePurchase() {
        this.owned += 1;
    }

    /**
     * Get formatted display information
     */
    getDisplayInfo(gameState) {
        const currentCost = this.calculateCurrentCost();
        const productionRate = this.getProductionRate();
        const canAfford = this.canAfford(gameState.resumes);
        const isUnlocked = this.isUnlocked(gameState);

        return {
            id: this.id,
            name: this.name,
            description: this.description,
            icon: this.icon,
            owned: this.owned,
            cost: currentCost,
            formattedCost: gameState.getFormattedCost(currentCost),
            productionRate: productionRate,
            formattedProductionRate: gameState.getFormattedNumber(productionRate),
            canAfford: canAfford,
            unlocked: isUnlocked,
            unlockThreshold: this.unlockThreshold,
            formattedUnlockThreshold: gameState.getFormattedNumber(new BigNumber(this.unlockThreshold))
        };
    }

    /**
     * Serialize auto-sender data for saving
     */
    serialize() {
        return {
            id: this.id,
            owned: this.owned
        };
    }

    /**
     * Restore auto-sender data from save
     */
    deserialize(data) {
        if (data && typeof data.owned === 'number') {
            this.owned = data.owned;
        }
    }
}

/**
 * Upgrade class to represent individual upgrades
 */
class Upgrade {
    constructor(id, name, cost, effect, description) {
        this.id = id;
        this.name = name;
        this.cost = new BigNumber(cost); // Cost in resumes
        this.effect = effect; // { type: 'click_multiplier', value: 2 }
        this.description = description;
        this.purchased = false;
        this.icon = '⬆️'; // Default icon
        
        // Unlock conditions
        this.unlockConditions = {
            resumesSent: new BigNumber(0),  // Minimum resumes sent
            autoSendersOwned: 0,            // Minimum auto-senders owned
            upgradesPurchased: 0,           // Minimum upgrades purchased
            achievementsUnlocked: 0         // Minimum achievements unlocked
        };
        
        // Dependencies (other upgrade IDs that must be purchased first)
        this.dependencies = [];
    }

    /**
     * Check if upgrade is unlocked
     * @param {GameState} gameState - Current game state
     * @returns {boolean} Whether upgrade is unlocked
     */
    isUnlocked(gameState) {
        // Check if all dependencies are purchased
        for (const depId of this.dependencies) {
            const dependency = gameState.getUpgrade(depId);
            if (!dependency || !dependency.purchased) {
            return false;
            }
        }
        
        // Check resume count requirement
        if (gameState.totalResumes.lt(this.unlockConditions.resumesSent)) {
            return false;
        }
        
        // Check auto-senders owned requirement
        const autoSendersOwned = gameState.getAllAutoSenders()
            .reduce((total, autoSender) => total + autoSender.owned, 0);
        if (autoSendersOwned < this.unlockConditions.autoSendersOwned) {
            return false;
        }

        // Check upgrades purchased requirement
        const upgradesPurchased = gameState.upgrades
            .filter(upgrade => upgrade.purchased).length;
        if (upgradesPurchased < this.unlockConditions.upgradesPurchased) {
            return false;
        }

        // Check achievements unlocked requirement
        const achievementsUnlocked = gameState.achievements
            .filter(achievement => achievement.unlocked).length;
        if (achievementsUnlocked < this.unlockConditions.achievementsUnlocked) {
                    return false;
        }

        return true;
    }

    /**
     * Check if upgrade can be afforded
     * @param {BigNumber} playerResumes - Player's current resume count
     * @returns {boolean} Whether upgrade can be afforded
     */
    canAfford(playerResumes) {
        return playerResumes.gte(this.cost);
    }

    /**
     * Attempt to purchase upgrade
     * @param {BigNumber} playerResumes - Player's current resume count
     * @returns {Object} Purchase result { success: boolean, cost?: BigNumber, error?: string }
     */
    purchase(playerResumes) {
        // Validation checks
        if (this.purchased) {
            return { success: false, error: 'Upgrade already purchased' };
        }

        if (!this.canAfford(playerResumes)) {
            return { success: false, error: 'Not enough resumes' };
        }
        
        // Execute purchase
        this.executePurchase();

        return { 
            success: true, 
            cost: this.cost
        };
    }

    /**
     * Execute the purchase (mark as purchased)
     */
    executePurchase() {
        this.purchased = true;
        console.log(`✅ Upgrade purchased: ${this.name}`);
    }

    /**
     * Apply upgrade effect to game state
     * @param {GameState} gameState - Game state to apply effect to
     */
    applyEffect(gameState) {
        if (!this.purchased) return;

        switch (this.effect.type) {
            case 'click_multiplier':
                gameState.clickPower = gameState.clickPower.times(this.effect.value);
                break;
                
            case 'auto_sender_efficiency':
                // Applied dynamically in auto-sender calculations
                break;
                
            case 'auto_sender_unlock_boost':
                // Applied dynamically in unlock threshold calculations
                break;
                
            case 'auto_sender_cost_reduction':
                // Applied dynamically in cost calculations
                break;
                
            case 'ultimate_multiplier':
                // Apply to both click power and auto-sender efficiency
                gameState.clickPower = gameState.clickPower.times(this.effect.value);
                // Auto-sender efficiency handled in updateResumeGeneration
                break;
                
            default:
                console.warn(`Unknown upgrade effect type: ${this.effect.type}`);
        }
    }

    /**
     * Get display information for UI
     * @param {GameState} gameState - Current game state
     * @returns {Object} Display information
     */
    getDisplayInfo(gameState) {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            icon: this.icon,
            cost: this.cost,
            formattedCost: gameState.getFormattedNumber(this.cost),
            canAfford: this.canAfford(gameState.resumes),
            purchased: this.purchased,
            effect: this.effect,
            unlocked: this.isUnlocked(gameState),
            dependencies: this.dependencies,
            unlockConditions: this.unlockConditions
        };
    }

    /**
     * Serialize upgrade for saving
     * @returns {Object} Serialized upgrade data
     */
    serialize() {
        return {
            id: this.id,
            purchased: this.purchased
        };
    }

    /**
     * Deserialize upgrade from save data
     * @param {Object} data - Saved upgrade data
     */
    deserialize(data) {
            this.purchased = data.purchased || false;
        }
    }

/**
 * Achievement class to represent individual achievements
 */
class Achievement {
    constructor(id, name, description, condition) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.condition = condition; // Function that returns boolean when checking if unlocked
        this.unlocked = false;
        this.unlockedAt = null; // Timestamp when achievement was unlocked
        this.icon = '🏆'; // Default icon
        this.rewards = []; // Array of reward objects { type: 'permanent_bonus', effect: {...} }
        this.hidden = false; // Whether achievement is visible before unlocking
        this.category = 'general'; // Category for organization
    }

    /**
     * Check if achievement condition is met
     * @param {GameState} gameState - Current game state
     * @param {Object} stats - Additional statistics for condition checking
     * @returns {boolean} Whether achievement should be unlocked
     */
    checkCondition(gameState, stats = {}) {
        if (this.unlocked) return true;
        return this.condition(gameState, stats);
    }

    /**
     * Unlock the achievement
     */
    unlock() {
        if (this.unlocked) return false;
        
        this.unlocked = true;
        this.unlockedAt = Date.now();
        
        console.log(`🏆 Achievement unlocked: ${this.name}`);
        return true;
    }

    /**
     * Apply any permanent bonuses from this achievement
     * @param {GameState} gameState - Game state to apply bonuses to
     */
    applyRewards(gameState) {
        if (!this.unlocked) return;
        
        this.rewards.forEach(reward => {
            switch (reward.type) {
                case 'permanent_bonus':
                    // Apply permanent bonus effects
                    break;
                case 'click_multiplier':
                    gameState.clickPower = gameState.clickPower.times(reward.value);
                    break;
                case 'auto_sender_efficiency':
                    // Applied in auto-sender calculations
                    break;
                default:
                    console.warn(`Unknown reward type: ${reward.type}`);
            }
        });
    }

    /**
     * Get display information for UI
     * @param {GameState} gameState - Current game state
     * @param {Object} stats - Additional statistics
     * @returns {Object} Display information
     */
    getDisplayInfo(gameState, stats = {}) {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            icon: this.icon,
            unlocked: this.unlocked,
            unlockedAt: this.unlockedAt,
            category: this.category,
            hidden: this.hidden,
            rewards: this.rewards,
            progress: this.getProgress(gameState, stats)
        };
    }

    /**
     * Get progress towards achievement (if applicable)
     * @param {GameState} gameState - Current game state
     * @param {Object} stats - Additional statistics
     * @returns {Object|null} Progress information or null if not applicable
     */
    getProgress(gameState, stats = {}) {
        // Override in specific achievement implementations if progress tracking is needed
        return null;
    }

    /**
     * Serialize achievement for saving
     * @returns {Object} Serialized achievement data
     */
    serialize() {
        return {
            id: this.id,
            unlocked: this.unlocked,
            unlockedAt: this.unlockedAt
        };
    }

    /**
     * Deserialize achievement from save data
     * @param {Object} data - Saved achievement data
     */
    deserialize(data) {
        this.unlocked = data.unlocked || false;
        this.unlockedAt = data.unlockedAt || null;
    }
}

/**
 * AchievementTracker class to manage all achievements and their conditions
 */
class AchievementTracker {
    constructor(gameState) {
        this.gameState = gameState;
        this.achievements = new Map();
        this.statistics = this.initializeStatistics();
        this.lastCheckTime = 0;
        this.checkInterval = 1000; // Check achievements every second
        
        this.initializeAchievements();
    }

    /**
     * Initialize achievement statistics tracking
     * @returns {Object} Statistics object
     */
    initializeStatistics() {
        return {
            totalClicks: 0,
            rejections: 0,
            consecutiveFailures: 0,
            longestGhostPeriod: 0, // Time without responses
            overqualifiedApplications: 0,
            entryLevelWithExperience: 0,
            networkingEvents: 0,
            totalTimeSpent: 0, // Total time playing
            gameStartTime: Date.now()
        };
    }

    /**
     * Initialize all achievements
     */
    initializeAchievements() {
        // Achievement 1: First Rejection
        const firstRejection = new Achievement(
            'first-rejection',
            'First Rejection',
            'Receive your first rejection. Welcome to the club!',
            (gameState, stats) => stats.rejections >= 1
        );
        firstRejection.icon = '💔';
        firstRejection.category = 'milestone';
        firstRejection.rewards = [{ type: 'click_multiplier', value: 1.1 }]; // 10% click bonus
        
        // Achievement 2: 100 Club
        const hundredClub = new Achievement(
            '100-club',
            '100 Club',
            'Send 100 resumes without getting a single interview.',
            (gameState, stats) => gameState.totalResumes.gte(100) && stats.rejections >= 50
        );
        hundredClub.icon = '💯';
        hundredClub.category = 'endurance';
        hundredClub.rewards = [{ type: 'auto_sender_efficiency', value: 1.15 }]; // 15% auto-sender boost
        
        // Achievement 3: Ghost Protocol
        const ghostProtocol = new Achievement(
            'ghost-protocol',
            'Ghost Protocol',
            'Go 30 days without hearing back from any employer.',
            (gameState, stats) => {
                // For game purposes, we'll use resume count as a proxy for time
                // 30 days = roughly 300 resumes sent
                return gameState.totalResumes.gte(300) && stats.consecutiveFailures >= 100;
            }
        );
        ghostProtocol.icon = '👻';
        ghostProtocol.category = 'endurance';
        ghostProtocol.rewards = [{ type: 'click_multiplier', value: 1.25 }]; // 25% click bonus
        
        // Achievement 4: Overqualified
        const overqualified = new Achievement(
            'overqualified',
            'Overqualified',
            'Get rejected for being overqualified 10 times.',
            (gameState, stats) => stats.overqualifiedApplications >= 10
        );
        overqualified.icon = '🎓';
        overqualified.category = 'irony';
        overqualified.rewards = [{ type: 'auto_sender_efficiency', value: 1.2 }]; // 20% auto-sender boost
        
        // Achievement 5: Entry Level Expert
        const entryLevelExpert = new Achievement(
            'entry-level-expert',
            'Entry Level Expert',
            'Apply for "entry level" positions that require 5+ years of experience.',
            (gameState, stats) => stats.entryLevelWithExperience >= 25
        );
        entryLevelExpert.icon = '🤡';
        entryLevelExpert.category = 'irony';
        entryLevelExpert.rewards = [{ type: 'click_multiplier', value: 1.3 }]; // 30% click bonus
        
        // Achievement 6: Networking Ninja
        const networkingNinja = new Achievement(
            'networking-ninja',
            'Networking Ninja',
            'Attend 50 networking events and still be unemployed.',
            (gameState, stats) => stats.networkingEvents >= 50
        );
        networkingNinja.icon = '🥷';
        networkingNinja.category = 'networking';
        networkingNinja.rewards = [{ type: 'auto_sender_efficiency', value: 1.5 }]; // 50% auto-sender boost
        
        // Add achievements to map
        this.achievements.set(firstRejection.id, firstRejection);
        this.achievements.set(hundredClub.id, hundredClub);
        this.achievements.set(ghostProtocol.id, ghostProtocol);
        this.achievements.set(overqualified.id, overqualified);
        this.achievements.set(entryLevelExpert.id, entryLevelExpert);
        this.achievements.set(networkingNinja.id, networkingNinja);
    }

    /**
     * Update statistics based on game events
     * @param {string} event - Event type
     * @param {*} data - Event data
     */
    updateStatistics(event, data = {}) {
        switch (event) {
            case 'click':
                this.statistics.totalClicks++;
                // Randomly generate job-hunting events based on clicks
                this.generateRandomEvents();
                break;
                
            case 'rejection':
                this.statistics.rejections++;
                this.statistics.consecutiveFailures++;
                break;
                
            case 'response':
                this.statistics.consecutiveFailures = 0; // Reset consecutive failures
                break;
                
            case 'overqualified':
                this.statistics.overqualifiedApplications++;
                break;
                
            case 'entry_level_experience':
                this.statistics.entryLevelWithExperience++;
                break;
                
            case 'networking_event':
                this.statistics.networkingEvents++;
                break;
                
            case 'time_update':
                this.statistics.totalTimeSpent = Date.now() - this.statistics.gameStartTime;
                break;
        }
    }

    /**
     * Generate random job hunting events based on game state
     */
    generateRandomEvents() {
        const totalResumes = this.gameState.totalResumes.toNumber();
        
        // Random chance of rejection (increases with more resumes sent)
        if (Math.random() < 0.05 + (totalResumes * 0.0001)) {
            this.updateStatistics('rejection');
        }
        
        // Random overqualified rejection
        if (Math.random() < 0.02 && totalResumes > 50) {
            this.updateStatistics('overqualified');
        }
        
        // Random entry level with experience
        if (Math.random() < 0.03 && totalResumes > 25) {
            this.updateStatistics('entry_level_experience');
        }
        
        // Random networking event (based on auto-senders owned)
        const autoSendersOwned = this.gameState.getAllAutoSenders()
            .reduce((total, autoSender) => total + autoSender.owned, 0);
        if (Math.random() < 0.01 && autoSendersOwned > 2) {
            this.updateStatistics('networking_event');
        }
    }

    /**
     * Check all achievements for new unlocks
     * @returns {Array} Array of newly unlocked achievements
     */
    checkAchievements() {
        const now = Date.now();
        if (now - this.lastCheckTime < this.checkInterval) {
            return []; // Don't check too frequently
        }
        this.lastCheckTime = now;
        
        const newlyUnlocked = [];
        
        this.achievements.forEach(achievement => {
            if (!achievement.unlocked && achievement.checkCondition(this.gameState, this.statistics)) {
                if (achievement.unlock()) {
                    newlyUnlocked.push(achievement);
                    // Apply any rewards
                    achievement.applyRewards(this.gameState);
                }
            }
        });
        
        return newlyUnlocked;
    }

    /**
     * Get all achievements
     * @returns {Array} Array of all achievements
     */
    getAllAchievements() {
        return Array.from(this.achievements.values());
    }

    /**
     * Get achievement by ID
     * @param {string} id - Achievement ID
     * @returns {Achievement|null} Achievement or null if not found
     */
    getAchievement(id) {
        return this.achievements.get(id) || null;
    }

    /**
     * Get unlocked achievements count
     * @returns {number} Number of unlocked achievements
     */
    getUnlockedCount() {
        return Array.from(this.achievements.values())
            .filter(achievement => achievement.unlocked).length;
    }

    /**
     * Serialize achievement tracker for saving
     * @returns {Object} Serialized data
     */
    serialize() {
        const achievementsData = {};
        this.achievements.forEach((achievement, id) => {
            achievementsData[id] = achievement.serialize();
        });
        
        return {
            achievements: achievementsData,
            statistics: this.statistics
        };
    }

    /**
     * Deserialize achievement tracker from save data
     * @param {Object} data - Saved data
     */
    deserialize(data) {
        if (data.achievements) {
            Object.entries(data.achievements).forEach(([id, achievementData]) => {
                const achievement = this.achievements.get(id);
                if (achievement) {
                    achievement.deserialize(achievementData);
                }
            });
        }
        
        if (data.statistics) {
            this.statistics = { ...this.statistics, ...data.statistics };
        }
    }
}

class ClickHandler {
    constructor(gameState, gameEngine) {
        this.gameState = gameState;
        this.gameEngine = gameEngine;
        this.isMouseDown = false;
        this.clickEffects = [];
        this.maxClickEffects = 10; // Limit visual effects for performance
        
        this.setupClickListeners();
    }

    setupClickListeners() {
        const resumeButton = document.getElementById('resume-button');
        
        resumeButton.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        resumeButton.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        resumeButton.addEventListener('click', (e) => this.handleClick(e));
        
        // Prevent context menu on right click
        resumeButton.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    handleClick(event) {
        // Prevent default to avoid any unwanted behavior
        event.preventDefault();
        
        // Add resumes based on click power
        this.gameState.addResumes(this.gameState.clickPower);
        
        // Update achievement statistics
        if (this.gameState.achievementTracker) {
            this.gameState.achievementTracker.updateStatistics('click');
        }
        
        // Create visual effect
        this.createClickEffect(event);
        
        // Update flavor text
        this.updateFlavorText();
        
        // Check for new auto-sender unlocks
        this.gameEngine.checkForNewUnlocks();
        
        console.log(`👆 Click! Added ${this.gameState.getFormattedNumber(this.gameState.clickPower)} resumes`);
    }

    handleMouseDown(event) {
        this.isMouseDown = true;
        const button = document.getElementById('resume-button');
        if (button) {
            button.style.transform = 'scale(0.95)';
        }
    }

    handleMouseUp(event) {
        this.isMouseDown = false;
        const button = document.getElementById('resume-button');
        if (button) {
            button.style.transform = '';
        }
    }

    createClickEffect(event) {
        const button = document.getElementById('resume-button');
        const leftPanel = document.getElementById('left-panel');
        
        // Button scale effect
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 100);

        // Create floating number effect
        const clickValue = this.gameState.getFormattedNumber(this.gameState.clickPower);
        const floatingNumber = document.createElement('div');
        floatingNumber.className = 'floating-number';
        floatingNumber.textContent = `+${clickValue}`;
        
        // Position the floating number at the click location
        const buttonRect = button.getBoundingClientRect();
        const panelRect = leftPanel.getBoundingClientRect();
        
        // Calculate position relative to the left panel
        const x = event.clientX - panelRect.left;
        const y = event.clientY - panelRect.top;
        
        floatingNumber.style.left = `${x}px`;
        floatingNumber.style.top = `${y}px`;
        
        leftPanel.appendChild(floatingNumber);
        
        // Add to click effects array for tracking
        this.clickEffects.push(floatingNumber);
        
        // Clean up old effects if we have too many
        if (this.clickEffects.length > this.maxClickEffects) {
            const oldEffect = this.clickEffects.shift();
            if (oldEffect && oldEffect.parentNode) {
                oldEffect.parentNode.removeChild(oldEffect);
            }
        }
        
        // Remove the floating number after animation completes
        setTimeout(() => {
            if (floatingNumber.parentNode) {
                floatingNumber.parentNode.removeChild(floatingNumber);
            }
            // Remove from tracking array
            const index = this.clickEffects.indexOf(floatingNumber);
            if (index > -1) {
                this.clickEffects.splice(index, 1);
            }
        }, 1000); // Match the animation duration
    }

    /**
     * Update flavor text with dynamic content
     */
    updateFlavorText() {
        const statusElement = document.getElementById('current-status');
        if (!statusElement) return;

        // Use industry-specific flavor text from prestige system
        const industryFlavorText = this.gameState.prestige.getCurrentIndustryFlavorText();
        statusElement.textContent = industryFlavorText;
    }
}

/**
 * GameEngine - Main game controller and orchestrator
 */
class GameEngine {
    constructor() {
        this.gameState = new GameState();
        this.clickHandler = new ClickHandler(this.gameState, this);
        this.visualWorkspace = new VisualWorkspace(this.gameState, this);
        this.randomEventManager = new RandomEventManager(this.gameState, this);
        this.gameState.randomEventManager = this.randomEventManager; // Give GameState access to RandomEventManager
        this.saveManager = new SaveManager(this.gameState, (message, type) => this.showNotification(message, type));
        this.isRunning = false;
        this.animationFrameId = null;
        
        // Performance monitoring
        this.frameCount = 0;
        this.lastFpsUpdate = performance.now();
        this.targetFps = 60;
        this.lastFrameTime = performance.now();
        
        // Unlock tracking
        this.unlockedAutoSenders = new Set();
        this.initializeUnlockedTracking();
        
        this.init();
    }

    /**
     * Initialize the game
     */
    init() {
        console.log('🎮 Initializing Resume Clicker...');
        
        // Set up UI components
        this.setupTabs();
        this.setupSaveLoadButtons();
        
        // Populate store items (placeholder functions)
        this.populateAutoSenders();
        this.populateUpgrades();
        this.populateAchievements();
        
        // Start the game loop
        this.startGameLoop();
        this.updateDisplay();
        
        console.log('✅ Game initialized successfully');
        console.log('📊 BigNumber.js loaded for large number support');
        console.log('⚡ 60fps game loop started');
    }

    /**
     * Start the main game loop using requestAnimationFrame
     */
    startGameLoop() {
        this.isRunning = true;
        this.gameLoop();
    }

    /**
     * Stop the game loop
     */
    stopGameLoop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    /**
     * Main game loop - runs at 60fps
     */
    gameLoop() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        
        // Update game logic
        this.update(deltaTime);
        
        // Render/Update UI
        this.render();
        
        // Performance monitoring
        this.updatePerformanceStats(currentTime);
        
        this.lastFrameTime = currentTime;
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Update game logic
     */
    update(deltaTime) {
        // Apply temporary effects from random events
        this.randomEventManager.applyTemporaryEffects();
        
        // Update resume generation rates first
        this.gameState.updateResumeGeneration();
        
        // Process auto-generation if any
        if (this.gameState.resumesPerSecond.isGreaterThan(0)) {
            const resumesToAdd = this.gameState.resumesPerSecond.multipliedBy(deltaTime / 1000);
            this.gameState.addAutoResumes(resumesToAdd);
        }

        // Process random events
        this.randomEventManager.processRandomEvents();

        // Check for achievement unlocks
        if (this.gameState.achievementTracker) {
            const newlyUnlocked = this.gameState.achievementTracker.checkAchievements();
            if (newlyUnlocked.length > 0) {
                newlyUnlocked.forEach(achievement => {
                    this.showNotification(`🏆 Achievement Unlocked: ${achievement.name}!`, 'achievement');
                    console.log(`🎉 Achievement unlocked: ${achievement.name} - ${achievement.description}`);
                });
                
                // Update achievements array for legacy compatibility
                this.gameState.achievements = this.gameState.achievementTracker.getAllAchievements();
                
                // Refresh achievements UI
                this.populateAchievements();
            }
        }

        // Check for newly unlocked auto-senders and show notifications
        this.checkForNewUnlocks();
    }

    /**
     * Render/Update the UI
     */
    render() {
        this.updateDisplay();
    }

    /**
     * Calculate resume generation from auto-senders (deprecated - moved to GameState)
     * @deprecated Use GameState.updateResumeGeneration() instead
     */
    calculateResumeGeneration() {
        // This method is now handled by GameState.updateResumeGeneration()
        // Keeping for backward compatibility
        this.gameState.updateResumeGeneration();
    }

    /**
     * Update performance statistics
     */
    updatePerformanceStats(currentTime) {
        this.frameCount++;
        
        // Update FPS every second
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.gameState.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
            
            // Log performance warning if FPS drops significantly
            if (this.gameState.fps < 45) {
                console.warn(`⚠️  Performance warning: FPS dropped to ${this.gameState.fps}`);
            }
        }
    }

    /**
     * Set up tab navigation
     */
    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                button.classList.add('active');
                const targetContent = document.getElementById(`${tabName}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    /**
     * Set up save/load button event listeners
     */
    setupSaveLoadButtons() {
        // Save button
        const saveButton = document.getElementById('save-button');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.saveManager.manualSave();
            });
        }

        // Load button
        const loadButton = document.getElementById('load-button');
        if (loadButton) {
            loadButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to load your saved game? This will overwrite your current progress.')) {
                    this.saveManager.load();
                    this.updateDisplay();
                    this.populateAutoSenders();
                    this.populateUpgrades();
                    this.populateAchievements();
                }
            });
        }

        // Export button
        const exportButton = document.getElementById('export-button');
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                this.saveManager.exportSave();
            });
        }

        // Import button
        const importButton = document.getElementById('import-button');
        const importInput = document.getElementById('import-input');
        if (importButton && importInput) {
            importButton.addEventListener('click', () => {
                importInput.click();
            });

            importInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    this.saveManager.importSave(file).then(success => {
                        if (success) {
                            this.updateDisplay();
                            this.populateAutoSenders();
                            this.populateUpgrades();
                            this.populateAchievements();
                        }
                    });
                }
                // Reset the input so the same file can be selected again
                event.target.value = '';
            });
        }

        // Reset button
        const resetButton = document.getElementById('reset-button');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset your game? This will delete all progress and cannot be undone!')) {
                    if (confirm('This is your final warning! All progress will be permanently lost. Continue?')) {
                        this.resetGame();
                    }
                }
            });
        }

        // Career Change button
        const careerChangeButton = document.getElementById('career-change-button');
        if (careerChangeButton) {
            careerChangeButton.addEventListener('click', () => {
                this.performCareerChange();
            });
        }
    }

    /**
     * Update all UI displays
     */
    updateDisplay() {
        this.updateResumeCounter();
        this.updateAutoSenderUI();
        this.updateUpgradesUI();
        this.updateStats();
        this.updatePrestigeUI(); // Add prestige UI updates
        this.visualWorkspace.updateLanes(); // Update visual workspace
    }

    /**
     * Update auto-sender UI (dynamic parts only)
     */
    updateAutoSenderUI() {
        const autoSenders = this.gameState.getAvailableAutoSenders();
        
        // Cache DOM elements to avoid repeated queries
        if (!this.autoSenderElements) {
            this.autoSenderElements = new Map();
        }
        
        autoSenders.forEach(autoSender => {
            const displayInfo = autoSender.getDisplayInfo(this.gameState);
            
            // Use cached element or find and cache it
            let itemDiv = this.autoSenderElements.get(displayInfo.id);
            if (!itemDiv) {
                itemDiv = document.querySelector(`[data-auto-sender-id="${displayInfo.id}"]`);
                if (itemDiv) {
                    this.autoSenderElements.set(displayInfo.id, itemDiv);
                    // Cache child elements too for faster access
                    itemDiv._cachedElements = {
                        ownedCount: itemDiv.querySelector('.owned-count'),
                        productionRate: itemDiv.querySelector('.production-rate'),
                        costAmount: itemDiv.querySelector('.cost-amount'),
                        purchaseBtn: itemDiv.querySelector('.purchase-btn')
                    };
                }
            }
            
            if (itemDiv && itemDiv._cachedElements) {
                const cached = itemDiv._cachedElements;
                const isActive = displayInfo.owned > 0 && displayInfo.productionRate.isGreaterThan(0);
                
                // Update owned count only if changed
                if (cached.ownedCount && cached.ownedCount.textContent !== displayInfo.owned.toString()) {
                    cached.ownedCount.textContent = displayInfo.owned;
                }
                
                // Update production rate only if changed
                if (cached.productionRate) {
                    const newRate = `${displayInfo.formattedProductionRate}/sec`;
                    if (cached.productionRate.textContent !== newRate) {
                        cached.productionRate.textContent = newRate;
                    }
                }
                
                // Update cost only if changed
                if (cached.costAmount) {
                    const newCost = `${displayInfo.formattedCost} 📄`;
                    if (cached.costAmount.textContent !== newCost) {
                        cached.costAmount.textContent = newCost;
                    }
                }
                
                // Update purchase button state only if changed
                if (cached.purchaseBtn) {
                    const shouldBeEnabled = displayInfo.canAfford;
                    const isCurrentlyEnabled = !cached.purchaseBtn.disabled;
                    
                    if (shouldBeEnabled !== isCurrentlyEnabled) {
                        if (shouldBeEnabled) {
                            cached.purchaseBtn.classList.remove('disabled');
                            cached.purchaseBtn.disabled = false;
                        } else {
                            cached.purchaseBtn.classList.add('disabled');
                            cached.purchaseBtn.disabled = true;
                        }
                    }
                }
                
                // Update activity state only if changed
                const hasActiveClass = itemDiv.classList.contains('active');
                if (isActive !== hasActiveClass) {
                    if (isActive) {
                        itemDiv.classList.add('active');
                        if (!itemDiv.querySelector('.activity-indicator')) {
                            const indicator = document.createElement('div');
                            indicator.className = 'activity-indicator';
                            itemDiv.appendChild(indicator);
                        }
                    } else {
                        itemDiv.classList.remove('active');
                        const indicator = itemDiv.querySelector('.activity-indicator');
                        if (indicator) indicator.remove();
                    }
                }
            }
        });
    }

    /**
     * Update resume counter display
     */
    updateResumeCounter() {
        const resumeCount = document.getElementById('resume-count');
        const resumePerSecond = document.getElementById('resume-per-second');
        
        if (resumeCount) {
            const newCount = this.gameState.getFormattedResumeCount(this.gameState.resumes);
            // Only update if the formatted value actually changed
            if (resumeCount.textContent !== newCount) {
                resumeCount.textContent = newCount;
            }
        }
        if (resumePerSecond) {
            const newRate = `per second: ${this.gameState.getFormattedNumber(this.gameState.resumesPerSecond)}`;
            // Only update if the formatted value actually changed
            if (resumePerSecond.textContent !== newRate) {
                resumePerSecond.textContent = newRate;
            }
        }
    }

    /**
     * Update statistics display
     */
    updateStats() {
        // Calculate stats
        const totalAutoSenders = Array.from(this.gameState.autoSenders.values())
            .reduce((total, autoSender) => total + autoSender.owned, 0);
        
        const upgradesPurchased = this.gameState.upgrades
            .filter(upgrade => upgrade.purchased).length;

        // Get achievements unlocked count from achievement tracker
        const achievementsUnlocked = this.gameState.achievementTracker ? 
            this.gameState.achievementTracker.getUnlockedCount() : 0;

        const statsMap = {
            'total-resumes-stat': this.gameState.totalResumes,
            'click-power-stat': this.gameState.clickPower,
            'auto-senders-owned-stat': new BigNumber(totalAutoSenders),
            'upgrades-owned-stat': new BigNumber(upgradesPurchased),
            'achievements-unlocked-stat': new BigNumber(achievementsUnlocked)
        };

        // Update each stat element
        Object.entries(statsMap).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                // Use resume count formatting for total resumes
                if (id === 'total-resumes-stat') {
                    element.textContent = this.gameState.getFormattedResumeCount(value);
                } else {
                    element.textContent = this.gameState.getFormattedNumber(value);
                }
            }
        });
    }

    /**
     * Reset game to initial state
     */
    resetGame() {
        if (confirm('Are you sure you want to reset your progress? This cannot be undone!')) {
            this.gameState = new GameState();
            // Update clickHandler and saveManager to use new gameState
            this.clickHandler.gameState = this.gameState;
            this.saveManager.gameState = this.gameState;
            // Update visualWorkspace to use new gameState and recreate lanes
            this.visualWorkspace.gameState = this.gameState;
            this.visualWorkspace.createLanes(); // Recreate the visual lanes from scratch
            // Update randomEventManager to use new gameState
            this.randomEventManager.gameState = this.gameState;
            this.gameState.randomEventManager = this.randomEventManager;
            // Clear cached auto-sender elements to force UI refresh
            this.autoSenderElements = new Map();
            // Reset unlock tracking
            this.unlockedAutoSenders = new Set();
            this.initializeUnlockedTracking();
            // Repopulate the store with the new game state
            this.populateAutoSenders();
            this.populateUpgrades();
            this.populateAchievements();
            this.updateDisplay();
            this.saveManager.resetSave();
            this.showNotification('Game reset successfully!', 'success');
            console.log('🔄 Game reset to initial state');
        }
    }

    /**
     * Show notification to user
     */
    showNotification(message, type = 'success') {
        const notificationArea = document.getElementById('notification-area');
        if (!notificationArea) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            background-color: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#f39c12'};
        `;

        // Add slide-in animation if not present
        this.ensureNotificationAnimation();

        notificationArea.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }

    /**
     * Ensure notification animation CSS is present
     */
    ensureNotificationAnimation() {
        if (!document.head.querySelector('style[data-notification-animation]')) {
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            style.setAttribute('data-notification-animation', 'true');
            document.head.appendChild(style);
        }
    }

    /**
     * Populate auto-senders in the store
     */
    populateAutoSenders() {
        const autoSendersList = document.getElementById('auto-senders-list');
        if (!autoSendersList) {
            console.warn('Auto-senders list element not found');
            return;
        }

        // Clear existing content and DOM cache
        autoSendersList.innerHTML = '';
        if (this.autoSenderElements) {
            this.autoSenderElements.clear();
        }

        // Get all auto-senders (both unlocked and locked)
        const allAutoSenders = this.gameState.getAllAutoSenders();

        allAutoSenders.forEach(autoSender => {
            const displayInfo = autoSender.getDisplayInfo(this.gameState);
            const isActive = displayInfo.owned > 0 && displayInfo.productionRate.isGreaterThan(0);
            
            // Create auto-sender item container
            const itemDiv = document.createElement('div');
            const lockClass = displayInfo.unlocked ? '' : 'locked';
            itemDiv.className = `store-item auto-sender-item ${isActive ? 'active' : ''} ${lockClass}`;
            itemDiv.dataset.autoSenderId = displayInfo.id;
            itemDiv.style.position = 'relative'; // For activity indicator positioning

            // Different content for locked vs unlocked auto-senders
            if (displayInfo.unlocked) {
                // Unlocked auto-sender - show normal interface
                itemDiv.innerHTML = `
                    ${isActive ? '<div class="activity-indicator"></div>' : ''}
                    <div class="item-header">
                        <span class="item-icon">${displayInfo.icon}</span>
                        <div class="item-info">
                            <h4 class="item-name">${displayInfo.name}</h4>
                            <p class="item-description">${displayInfo.description}</p>
                        </div>
                    </div>
                    <div class="item-stats">
                        <div class="stat-row">
                            <span class="stat-label">Owned:</span>
                            <span class="owned-count">${displayInfo.owned}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Production:</span>
                            <span class="production-rate">${displayInfo.formattedProductionRate}/sec</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Cost:</span>
                            <span class="cost-amount">${displayInfo.formattedCost} 📄</span>
                        </div>
                    </div>
                    <button class="purchase-btn ${displayInfo.canAfford ? '' : 'disabled'}" 
                            ${displayInfo.canAfford ? '' : 'disabled'}>
                        Buy ${displayInfo.name}
                    </button>
                `;

                // Add click handler for purchase button
                const purchaseBtn = itemDiv.querySelector('.purchase-btn');
                purchaseBtn.addEventListener('click', () => {
                    this.purchaseAutoSender(displayInfo.id);
                });
            } else {
                // Locked auto-sender - show unlock requirements
                const progressPercent = Math.min(100, (this.gameState.totalResumes.toNumber() / displayInfo.unlockThreshold) * 100);
                
                itemDiv.innerHTML = `
                    <div class="lock-indicator">🔒</div>
                    <div class="item-header">
                        <span class="item-icon locked-icon">${displayInfo.icon}</span>
                        <div class="item-info">
                            <h4 class="item-name">${displayInfo.name}</h4>
                            <p class="item-description">Requires ${displayInfo.formattedUnlockThreshold} total resumes sent</p>
                        </div>
                    </div>
                    <div class="unlock-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="progress-text">
                            ${this.gameState.getFormattedNumber(this.gameState.totalResumes)} / ${displayInfo.formattedUnlockThreshold}
                        </div>
                    </div>
                `;
            }

            autoSendersList.appendChild(itemDiv);
        });

        // Populate upgrades as well when populating store
        this.populateUpgrades();
    }

    /**
     * Handle auto-sender purchase
     */
    purchaseAutoSender(autoSenderId) {
        const result = this.gameState.purchaseAutoSender(autoSenderId);
        
        if (result.success) {
            // Update achievement statistics
            if (this.gameState.achievementTracker) {
                this.gameState.achievementTracker.updateStatistics('auto_sender_purchase', {
                    autoSenderId: autoSenderId,
                    cost: result.cost
                });
            }
            
            // Trigger visual effects in workspace
            this.visualWorkspace.triggerPurchaseEffect(autoSenderId);
            
            // Update UI
            this.updateDisplay();
            this.populateAutoSenders(); // Full refresh after purchase to show new state
            
            // Show success notification
            const autoSender = this.gameState.getAutoSender(autoSenderId);
            this.showNotification(`Hired ${autoSender.name}! Your unemployed empire grows!`, 'success');
            
            console.log(`✅ Purchased ${autoSender.name} for ${this.gameState.getFormattedNumber(result.cost)} resumes`);
        } else {
            // Show error notification
            this.showNotification(result.error || 'Purchase failed', 'error');
            console.warn('❌ Purchase failed:', result.error);
        }
    }

    /**
     * Populate upgrades in the store
     */
    populateUpgrades() {
        const upgradesList = document.getElementById('upgrades-list');
        if (!upgradesList) {
            console.warn('Upgrades list element not found');
            return;
        }

        // Clear existing content
        upgradesList.innerHTML = '';

        // Get all upgrades (not just available ones to show dependencies)
        const allUpgrades = this.gameState.upgrades;

        if (allUpgrades.length === 0) {
            upgradesList.innerHTML = '<div class="empty-state">No upgrades available yet. Keep playing to unlock upgrades!</div>';
            return;
        }

        // Sort upgrades by unlock order (basic ones first)
        const sortedUpgrades = [...allUpgrades].sort((a, b) => {
            // First by unlock conditions (total resumes needed)
            const aUnlock = a.unlockConditions.resumesSent.toNumber();
            const bUnlock = b.unlockConditions.resumesSent.toNumber();
            if (aUnlock !== bUnlock) return aUnlock - bUnlock;
            
            // Then by cost
            return a.baseCost.minus(b.baseCost).toNumber();
        });

        sortedUpgrades.forEach(upgrade => {
            const displayInfo = upgrade.getDisplayInfo(this.gameState);
            
            // Create upgrade item container
            const itemDiv = document.createElement('div');
            const isLocked = !displayInfo.unlocked;
            const isPurchased = displayInfo.purchased;
            
            itemDiv.className = `store-item upgrade-item ${isPurchased ? 'purchased' : ''} ${isLocked ? 'locked' : ''}`;
            itemDiv.dataset.upgradeId = displayInfo.id;

            // Create dependency info
            let dependencyInfo = '';
            if (displayInfo.dependencies && displayInfo.dependencies.length > 0) {
                const depNames = displayInfo.dependencies.map(depId => {
                    const depUpgrade = this.gameState.getUpgrade(depId);
                    const isDepPurchased = depUpgrade && depUpgrade.purchased;
                    return `<span class="dependency ${isDepPurchased ? 'satisfied' : 'unsatisfied'}">${depUpgrade ? depUpgrade.name : depId}</span>`;
                });
                dependencyInfo = `
                    <div class="dependency-info">
                        <span class="dependency-label">Requires:</span>
                        ${depNames.join(', ')}
                    </div>
                `;
            }

            // Create unlock requirements for locked upgrades
            let unlockInfo = '';
            if (isLocked) {
                const reqResumes = upgrade.unlockConditions.resumesSent;
                const currentResumes = this.gameState.totalResumes;
                const progress = currentResumes.dividedBy(reqResumes).toNumber();
                const progressPercent = Math.min(progress * 100, 100);
                
                unlockInfo = `
                    <div class="unlock-requirements">
                        <div class="unlock-text">
                            Unlock at ${this.gameState.getFormattedNumber(reqResumes)} total resumes
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="progress-text">
                            ${this.gameState.getFormattedNumber(currentResumes)} / ${this.gameState.getFormattedNumber(reqResumes)}
                        </div>
                    </div>
                `;
            }

            // Create the HTML structure
            itemDiv.innerHTML = `
                <div class="item-header">
                    <span class="item-icon ${isLocked ? 'locked-icon' : ''}">${displayInfo.icon}</span>
                    <div class="item-info">
                        <h4 class="item-name">${displayInfo.name}</h4>
                        <p class="item-description">${displayInfo.description}</p>
                        ${dependencyInfo}
                    </div>
                    ${isLocked ? '<div class="lock-indicator">🔒</div>' : ''}
                </div>
                <div class="item-stats">
                    <div class="stat-row">
                        <span class="stat-label">Effect:</span>
                        <span class="effect-description">${this.formatUpgradeEffect(displayInfo.effect)}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Status:</span>
                        <span class="purchase-status ${isPurchased ? 'purchased' : (isLocked ? 'locked' : 'available')}">
                            ${isPurchased ? 'PURCHASED' : (isLocked ? 'LOCKED' : 'AVAILABLE')}
                        </span>
                    </div>
                    ${!isPurchased && !isLocked ? `
                    <div class="stat-row">
                        <span class="stat-label">Cost:</span>
                        <span class="cost-amount">${displayInfo.formattedCost} 📄</span>
                    </div>
                    ` : ''}
                </div>
                ${unlockInfo}
                ${!isPurchased && !isLocked ? `
                <button class="purchase-btn ${displayInfo.canAfford ? '' : 'disabled'}" 
                        ${displayInfo.canAfford ? '' : 'disabled'}
                        title="${displayInfo.canAfford ? 'Click to purchase' : 'Need more resumes'}">
                    Buy ${displayInfo.name}
                </button>
                ` : (isPurchased ? '<div class="purchased-indicator">✅ Purchased</div>' : '')}
            `;

            // Add click handler for purchase button if not purchased and unlocked
            if (!isPurchased && !isLocked) {
                const purchaseBtn = itemDiv.querySelector('.purchase-btn');
                if (purchaseBtn) {
                    purchaseBtn.addEventListener('click', () => {
                        this.purchaseUpgrade(displayInfo.id);
                    });
                }
            }

            upgradesList.appendChild(itemDiv);
        });
    }

    /**
     * Format upgrade effect for display
     * @param {Object} effect - Upgrade effect object
     * @returns {string} Formatted effect description
     */
    formatUpgradeEffect(effect) {
        switch (effect.type) {
            case 'click_multiplier':
                return `${effect.value}x click power`;
            case 'auto_sender_efficiency':
                return `${effect.value}x auto-sender efficiency`;
            case 'auto_sender_unlock_boost':
                return `${Math.round((1 - effect.value) * 100)}% faster auto-sender unlocks`;
            case 'auto_sender_cost_reduction':
                return `${Math.round(effect.value * 100)}% auto-sender cost reduction`;
            case 'ultimate_multiplier':
                return `${effect.value}x EVERYTHING!`;
            default:
                return 'Unknown effect';
        }
    }

    /**
     * Handle upgrade purchase
     */
    purchaseUpgrade(upgradeId) {
        const result = this.gameState.purchaseUpgrade(upgradeId);
        
        if (result.success) {
            // Update achievement statistics
            if (this.gameState.achievementTracker) {
                this.gameState.achievementTracker.updateStatistics('upgrade_purchase', {
                    upgradeId: upgradeId,
                    cost: result.cost
                });
            }
            
            // Update UI
            this.updateDisplay();
            this.populateUpgrades(); // Full refresh after purchase to show new state
            
            // Show success notification
            const upgrade = this.gameState.getUpgrade(upgradeId);
            this.showNotification(`Purchased ${upgrade.name}!`, 'success');
            
            console.log(`✅ Purchased upgrade: ${upgrade.name} for ${this.gameState.getFormattedNumber(result.cost)} resumes`);
        } else {
            // Show error notification
            this.showNotification(result.error || 'Purchase failed', 'error');
            console.warn('❌ Upgrade purchase failed:', result.error);
        }
    }

    /**
     * Populate achievements in the achievements tab
     */
    populateAchievements() {
        const achievementsList = document.getElementById('achievements-list');
        if (!achievementsList) {
            console.warn('Achievements list element not found');
            return;
        }

        // Clear existing content
        achievementsList.innerHTML = '';

        if (!this.gameState.achievementTracker) {
            achievementsList.innerHTML = '<div class="no-content">Achievement system not initialized</div>';
            return;
        }

        const achievements = this.gameState.achievementTracker.getAllAchievements();
        const stats = this.gameState.achievementTracker.statistics;

        if (achievements.length === 0) {
            achievementsList.innerHTML = '<div class="no-content">No achievements available</div>';
            return;
        }

        achievements.forEach(achievement => {
            const displayInfo = achievement.getDisplayInfo(this.gameState, stats);
            
            // Skip hidden achievements that aren't unlocked yet
            if (displayInfo.hidden && !displayInfo.unlocked) {
                return;
            }

            const itemDiv = document.createElement('div');
            itemDiv.className = `store-item achievement-item ${displayInfo.unlocked ? 'unlocked' : 'locked'}`;
            itemDiv.dataset.achievementId = displayInfo.id;

            // Create achievement HTML
            if (displayInfo.unlocked) {
                // Unlocked achievement
                const unlockedDate = displayInfo.unlockedAt ? 
                    new Date(displayInfo.unlockedAt).toLocaleDateString() : 'Unknown';
                
                itemDiv.innerHTML = `
                    <div class="achievement-banner unlocked-banner">✨ UNLOCKED ✨</div>
                    <div class="item-header">
                        <span class="item-icon achievement-icon">${displayInfo.icon}</span>
                        <div class="item-info">
                            <h4 class="item-name">${displayInfo.name}</h4>
                            <p class="item-description">${displayInfo.description}</p>
                        </div>
                        <div class="unlock-indicator">🏆</div>
                    </div>
                    <div class="item-stats">
                        <div class="stat-row">
                            <span class="stat-label">Category:</span>
                            <span class="achievement-category">${displayInfo.category}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Unlocked:</span>
                            <span class="unlock-date">${unlockedDate}</span>
                        </div>
                        ${displayInfo.rewards && displayInfo.rewards.length > 0 ? `
                        <div class="stat-row">
                            <span class="stat-label">Reward:</span>
                            <span class="achievement-reward">${this.formatAchievementRewards(displayInfo.rewards)}</span>
                        </div>
                        ` : ''}
                    </div>
                `;
            } else {
                // Locked achievement
                const progress = displayInfo.progress;
                
                itemDiv.innerHTML = `
                    <div class="achievement-banner locked-banner">🔒 LOCKED</div>
                    <div class="item-header">
                        <span class="item-icon achievement-icon locked-icon">${displayInfo.icon}</span>
                        <div class="item-info">
                            <h4 class="item-name">${displayInfo.name}</h4>
                            <p class="item-description">${displayInfo.description}</p>
                        </div>
                        <div class="lock-indicator">🔒</div>
                    </div>
                    <div class="item-stats">
                        <div class="stat-row">
                            <span class="stat-label">Category:</span>
                            <span class="achievement-category">${displayInfo.category}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Status:</span>
                            <span class="achievement-status">Not yet unlocked</span>
                        </div>
                        ${displayInfo.rewards && displayInfo.rewards.length > 0 ? `
                        <div class="stat-row">
                            <span class="stat-label">Reward:</span>
                            <span class="achievement-reward">${this.formatAchievementRewards(displayInfo.rewards)}</span>
                        </div>
                        ` : ''}
                    </div>
                    ${progress ? `
                    <div class="achievement-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress.percent}%"></div>
                        </div>
                        <div class="progress-text">${progress.current} / ${progress.target}</div>
                    </div>
                    ` : ''}
                `;
            }

            achievementsList.appendChild(itemDiv);
        });

        // Add statistics section at the bottom
        const statsDiv = document.createElement('div');
        statsDiv.className = 'achievement-stats-section';
        statsDiv.innerHTML = `
            <h4>📊 Achievement Statistics</h4>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Total Clicks:</span>
                    <span class="stat-value">${stats.totalClicks}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Rejections:</span>
                    <span class="stat-value">${stats.rejections}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Overqualified:</span>
                    <span class="stat-value">${stats.overqualifiedApplications}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Entry Level Expert:</span>
                    <span class="stat-value">${stats.entryLevelWithExperience}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Networking Events:</span>
                    <span class="stat-value">${stats.networkingEvents}</span>
                </div>
            </div>
        `;
        
        achievementsList.appendChild(statsDiv);
    }

    /**
     * Format achievement rewards for display
     * @param {Array} rewards - Array of reward objects
     * @returns {string} Formatted reward text
     */
    formatAchievementRewards(rewards) {
        return rewards.map(reward => {
            switch (reward.type) {
                case 'click_multiplier':
                    return `+${Math.round((reward.value - 1) * 100)}% click power`;
                case 'auto_sender_efficiency':
                    return `+${Math.round((reward.value - 1) * 100)}% auto-sender efficiency`;
                case 'permanent_bonus':
                    return 'Permanent bonus';
                default:
                    return 'Special reward';
            }
        }).join(', ');
    }

    /**
     * Update the dynamic parts of upgrade UI (costs, affordability, unlock progress)
     */
    updateUpgradesUI() {
        const upgradeItems = document.querySelectorAll('.upgrade-item');
        
        upgradeItems.forEach(item => {
            const upgradeId = item.dataset.upgradeId;
            const upgrade = this.gameState.getUpgrade(upgradeId);
            
            if (!upgrade || upgrade.purchased) return;

            // Detect newly unlocked upgrades by checking DOM state vs game state
            const wasLocked = item.classList.contains('locked');
            const displayInfo = upgrade.getDisplayInfo(this.gameState);
            const isLocked = !displayInfo.unlocked;
            if (wasLocked && !isLocked) {
                // Upgrade has just unlocked, refresh the list
                this.populateUpgrades();
                return;
            }

            // Update purchase button state
            const purchaseBtn = item.querySelector('.purchase-btn');
            if (purchaseBtn) {
                if (displayInfo.canAfford) {
                    purchaseBtn.disabled = false;
                    purchaseBtn.classList.remove('disabled');
                } else {
                    purchaseBtn.disabled = true;
                    purchaseBtn.classList.add('disabled');
                }
            }
            
            // Update cost display
            const costElement = item.querySelector('.cost-amount');
            if (costElement) {
                costElement.textContent = `${displayInfo.formattedCost} 📄`;
            }
            
            // Update unlock progress for still-locked upgrades
            if (isLocked) {
                const progressFill = item.querySelector('.progress-fill');
                const progressText = item.querySelector('.progress-text');
                
                if (progressFill && progressText) {
                    const reqResumes = upgrade.unlockConditions.resumesSent;
                    const currentResumes = this.gameState.totalResumes;
                    const currentResumesInt = currentResumes.integerValue(BigNumber.ROUND_DOWN);
                    const reqResumesInt = reqResumes.integerValue(BigNumber.ROUND_DOWN);
                    const progress = currentResumesInt.dividedBy(reqResumesInt).toNumber();
                    const progressPercent = Math.min(progress * 100, 100);
                    
                    progressFill.style.width = `${progressPercent}%`;
                    progressText.textContent = `${this.gameState.getFormattedResumeCount(currentResumesInt)} / ${this.gameState.getFormattedResumeCount(reqResumesInt)}`;
                }
            }
        });
    }

    /**
     * Initialize unlock tracking for auto-senders
     */
    initializeUnlockedTracking() {
        // Track initially unlocked auto-senders
        this.gameState.getAllAutoSenders().forEach(autoSender => {
            if (autoSender.isUnlocked(this.gameState)) {
                this.unlockedAutoSenders.add(autoSender.id);
            }
        });
    }

    /**
     * Check for newly unlocked auto-senders and show notifications
     */
    checkForNewUnlocks() {
        this.gameState.getAllAutoSenders().forEach(autoSender => {
            if (autoSender.isUnlocked(this.gameState) && !this.unlockedAutoSenders.has(autoSender.id)) {
                // Newly unlocked auto-sender!
                this.unlockedAutoSenders.add(autoSender.id);
                this.showNotification(`🔓 New workforce unlocked: ${autoSender.name}!`, 'achievement');
                
                // Refresh the auto-senders list to show the newly unlocked item
                this.populateAutoSenders();
                
                // Update visual workspace to show new unlocked lanes
                this.visualWorkspace.updateLanes();
                
                console.log(`🎉 Auto-sender unlocked: ${autoSender.name}`);
            }
        });
    }

    /**
     * Update prestige UI elements
     */
    updatePrestigeUI() {
        const prestigeInfo = this.gameState.prestige.getDisplayInfo();
        
        // Update overview section
        const levelDisplay = document.getElementById('prestige-level-display');
        const experienceDisplay = document.getElementById('life-experience-display');
        const industryDisplay = document.getElementById('current-industry-display');
        
        if (levelDisplay) levelDisplay.textContent = prestigeInfo.level;
        if (experienceDisplay) {
            experienceDisplay.textContent = this.gameState.getFormattedNumber(prestigeInfo.lifeExperiencePoints);
        }
        if (industryDisplay) {
            const industry = this.gameState.prestige.industries.get(prestigeInfo.currentIndustry);
            industryDisplay.textContent = industry ? `${industry.name} ${industry.icon}` : 'Technology 💻';
        }
        
        // Update career change button and progress
        this.updateCareerChangeButton(prestigeInfo);
        
        // Update industry selection
        this.updateIndustrySelection(prestigeInfo);
        
        // Update permanent bonuses
        this.updatePermanentBonuses(prestigeInfo);
        
        // Update prestige achievements
        this.updatePrestigeAchievements(prestigeInfo);
    }

    /**
     * Update career change button and progress
     */
    updateCareerChangeButton(prestigeInfo) {
        const button = document.getElementById('career-change-button');
        const progressText = document.querySelector('.progress-text');
        const progressFill = document.getElementById('prestige-progress-fill');
        const experiencePreview = document.getElementById('experience-gain-preview');
        
        if (!button || !progressText || !progressFill || !experiencePreview) return;
        
        const requirement = prestigeInfo.prestigeRequirement;
        const current = this.gameState.totalResumes;
        const canPrestige = prestigeInfo.canPrestige;
        
        // Update button state
        button.disabled = !canPrestige;
        button.textContent = canPrestige ? 'Career Change' : 'Need More Resumes';
        
        // Update progress text and bar
        if (canPrestige) {
            progressText.textContent = 'Ready for Career Change!';
            progressFill.style.width = '100%';
        } else {
            const progressPercent = Math.min(100, (current.dividedBy(requirement).multipliedBy(100)).toNumber());
            progressText.textContent = `${this.gameState.getFormattedNumber(current)} / ${this.gameState.getFormattedNumber(requirement)} resumes`;
            progressFill.style.width = `${progressPercent}%`;
        }
        
        // Update experience preview
        experiencePreview.textContent = this.gameState.getFormattedNumber(prestigeInfo.experienceGainPreview);
    }

    /**
     * Update industry selection grid
     */
    updateIndustrySelection(prestigeInfo) {
        const industryList = document.getElementById('industry-list');
        if (!industryList) return;
        
        industryList.innerHTML = '';
        
        for (const [industryId, industry] of this.gameState.prestige.industries) {
            const isUnlocked = this.gameState.prestige.isIndustryUnlocked(industryId);
            const isCurrent = industryId === prestigeInfo.currentIndustry;
            
            const industryCard = document.createElement('div');
            industryCard.className = `industry-card ${isCurrent ? 'current' : ''} ${!isUnlocked ? 'locked' : ''}`;
            industryCard.dataset.industryId = industryId;
            
            industryCard.innerHTML = `
                <span class="industry-icon">${industry.icon}</span>
                <div class="industry-name">${industry.name}</div>
                <div class="industry-description">${industry.description}</div>
                ${!isUnlocked ? `<div class="industry-unlock-level">Unlocks at level ${industry.unlockLevel}</div>` : ''}
                ${isCurrent ? '<div class="industry-current">Current Industry</div>' : ''}
            `;
            
            if (isUnlocked && !isCurrent) {
                industryCard.addEventListener('click', () => {
                    this.selectIndustry(industryId);
                });
            }
            
            industryList.appendChild(industryCard);
        }
    }

    /**
     * Update permanent bonuses list
     */
    updatePermanentBonuses(prestigeInfo) {
        const bonusesList = document.getElementById('bonuses-list');
        if (!bonusesList) return;
        
        bonusesList.innerHTML = '';
        
        prestigeInfo.permanentBonuses.forEach(bonus => {
            const bonusItem = document.createElement('div');
            bonusItem.className = 'bonus-item';
            
            const isMaxed = bonus.level >= bonus.maxLevel;
            const effectText = this.formatBonusEffect(bonus);
            
            bonusItem.innerHTML = `
                <div class="bonus-info">
                    <div class="bonus-name">${bonus.name}</div>
                    <div class="bonus-description">${bonus.description}</div>
                    <div class="bonus-level">Level ${bonus.level}/${bonus.maxLevel} ${effectText}</div>
                </div>
                <div class="bonus-purchase">
                    ${isMaxed ? 
                        '<div class="bonus-maxed">MAXED</div>' :
                        `<div class="bonus-cost">${this.gameState.getFormattedNumber(bonus.nextCost)} LP</div>
                         <button class="bonus-buy-btn" ${bonus.canAfford ? '' : 'disabled'} onclick="gameEngine.purchaseBonus('${bonus.id}')">
                             Upgrade
                         </button>`
                    }
                </div>
            `;
            
            bonusesList.appendChild(bonusItem);
        });
    }

    /**
     * Update prestige achievements grid
     */
    updatePrestigeAchievements(prestigeInfo) {
        const achievementsList = document.getElementById('prestige-achievements-list');
        if (!achievementsList) return;
        
        achievementsList.innerHTML = '';
        
        prestigeInfo.prestigeAchievements.forEach(achievement => {
            const achievementDiv = document.createElement('div');
            achievementDiv.className = `prestige-achievement ${achievement.unlocked ? 'unlocked' : ''}`;
            
            achievementDiv.innerHTML = `
                <div class="prestige-achievement-name">${achievement.name}</div>
                <div class="prestige-achievement-description">${achievement.description}</div>
                <div class="prestige-achievement-reward">
                    Reward: ${achievement.reward.lifeExperience || 0} Life Experience
                </div>
            `;
            
            achievementsList.appendChild(achievementDiv);
        });
    }

    /**
     * Format bonus effect for display
     */
    formatBonusEffect(bonus) {
        if (bonus.currentEffect === 0) return '';
        
        switch (bonus.id) {
            case 'clickPowerMultiplier':
                return `(+${(bonus.currentEffect * 100).toFixed(0)}% click power)`;
            case 'autoSenderEfficiency':
                return `(+${(bonus.currentEffect * 100).toFixed(0)}% auto-sender efficiency)`;
            case 'startingResumes':
                return `(+${bonus.currentEffect} starting resumes)`;
            case 'upgradeCostReduction':
                return `(-${(bonus.currentEffect * 100).toFixed(0)}% upgrade costs)`;
            case 'experienceGainRate':
                return `(+${(bonus.currentEffect * 100).toFixed(0)}% experience gain)`;
            default:
                return '';
        }
    }

    /**
     * Handle industry selection
     */
    selectIndustry(industryId) {
        if (this.gameState.prestige.isIndustryUnlocked(industryId)) {
            this.gameState.prestige.currentIndustry = industryId;
            this.updatePrestigeUI();
            this.showNotification(`Switched to ${this.gameState.prestige.industries.get(industryId).name} industry!`, 'success');
        }
    }

    /**
     * Purchase a permanent bonus
     */
    purchaseBonus(bonusId) {
        const result = this.gameState.prestige.purchasePermanentBonus(bonusId);
        
        if (result.success) {
            this.showNotification(result.message, 'success');
            
            // Re-apply all effects since bonuses have changed
            this.gameState.applyUpgradeEffects();
            
            // Update all UI elements
            this.updateDisplay();
        } else {
            this.showNotification(result.message, 'error');
        }
    }

    /**
     * Perform career change (prestige)
     */
    performCareerChange() {
        if (!this.gameState.prestige.canPrestige()) {
            this.showNotification('Not enough resumes for Career Change!', 'error');
            return;
        }

        // Show confirmation dialog
        const confirmed = confirm(
            `Are you sure you want to perform a Career Change?\n\n` +
            `This will reset your progress but grant you ${this.gameState.getFormattedNumber(this.gameState.prestige.calculateLifeExperienceGain())} Life Experience!\n\n` +
            `You will keep:\n` +
            `• Life Experience points\n` +
            `• Permanent bonuses\n` +
            `• Prestige achievements\n\n` +
            `You will lose:\n` +
            `• All resumes\n` +
            `• All auto-senders\n` +
            `• All upgrades`
        );

        if (!confirmed) return;

        const result = this.gameState.prestige.performCareerChange();
        
        if (result.success) {
            this.showNotification(result.message, 'achievement');
            
            // Update all UI elements after prestige
            this.updateDisplay();
            this.populateAutoSenders();
            this.populateUpgrades();
            this.populateAchievements();
            
            // Show industry flavor text
            setTimeout(() => {
                const flavorText = this.gameState.prestige.getCurrentIndustryFlavorText();
                this.updateFlavorText(flavorText);
            }, 1000);
            
        } else {
            this.showNotification(result.message, 'error');
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.gameEngine = new GameEngine();
});

// Expose game engine globally for debugging
window.BigNumber = BigNumber;

// Expose economic analysis for debugging
window.analyzeBalance = () => {
    if (window.gameEngine) {
        window.gameEngine.analyzeEconomicBalance();
    } else {
        console.log('Game engine not initialized yet');
    }
}; 

/**
 * Prestige class to manage prestige mechanics and Career Change system
 */
class Prestige {
    constructor(gameState) {
        this.gameState = gameState;
        this.level = 0;
        this.lifeExperiencePoints = new BigNumber(0);
        this.totalLifeExperienceEarned = new BigNumber(0);
        this.permanentBonuses = new Map();
        this.currentIndustry = 'tech'; // Default industry
        this.unlockedIndustries = new Set(['tech']);
        
        // Initialize permanent bonus categories
        this.initializePermanentBonuses();
        
        // Initialize industry definitions
        this.initializeIndustries();
        
        // Track prestige-specific achievements
        this.prestigeAchievements = new Map();
        this.initializePrestigeAchievements();
    }

    /**
     * Initialize permanent bonus categories and their base values
     */
    initializePermanentBonuses() {
        // Click Power Multiplier
        this.permanentBonuses.set('clickPowerMultiplier', {
            level: 0,
            baseCost: new BigNumber(10),
            costMultiplier: 1.5,
            effect: 0.25, // 25% per level
            maxLevel: 20,
            description: 'Increases click power by 25% per level'
        });

        // Auto-Sender Efficiency
        this.permanentBonuses.set('autoSenderEfficiency', {
            level: 0,
            baseCost: new BigNumber(15),
            costMultiplier: 1.6,
            effect: 0.2, // 20% per level
            maxLevel: 15,
            description: 'Increases all auto-sender production by 20% per level'
        });

        // Starting Resumes
        this.permanentBonuses.set('startingResumes', {
            level: 0,
            baseCost: new BigNumber(25),
            costMultiplier: 2.0,
            effect: 100, // 100 resumes per level
            maxLevel: 10,
            description: 'Start each prestige with 100 more resumes per level'
        });

        // Upgrade Cost Reduction
        this.permanentBonuses.set('upgradeCostReduction', {
            level: 0,
            baseCost: new BigNumber(30),
            costMultiplier: 1.8,
            effect: 0.05, // 5% reduction per level
            maxLevel: 12,
            description: 'Reduces upgrade costs by 5% per level'
        });

        // Experience Gain Rate
        this.permanentBonuses.set('experienceGainRate', {
            level: 0,
            baseCost: new BigNumber(50),
            costMultiplier: 2.2,
            effect: 0.3, // 30% more experience per level
            maxLevel: 8,
            description: 'Increases Life Experience gain rate by 30% per level'
        });
    }

    /**
     * Initialize different industries with unique mechanics
     */
    initializeIndustries() {
        this.industries = new Map();

        // Tech Industry (Default)
        this.industries.set('tech', {
            name: 'Technology',
            icon: '💻',
            description: 'Fast-paced innovation with stock options that may never vest',
            unlockLevel: 0,
            specialMechanics: {
                clickBonus: 1.0, // No bonus/penalty
                autoSenderBonus: 1.0,
                specialUpgrades: ['stock-options', 'ping-pong-table', 'unlimited-pto']
            },
            flavorTexts: [
                'Disrupting the job market...',
                'Scaling your career...',
                'Pivoting to new opportunities...',
                'Iterating on your resume...'
            ]
        });

        // Finance Industry
        this.industries.set('finance', {
            name: 'Finance',
            icon: '💰',
            description: 'High stress, high reward... mostly stress',
            unlockLevel: 1,
            specialMechanics: {
                clickBonus: 0.8, // 20% slower clicks
                autoSenderBonus: 1.5, // 50% better auto-senders
                specialUpgrades: ['bonus-calculator', 'expense-account', 'golden-handcuffs']
            },
            flavorTexts: [
                'Maximizing your portfolio...',
                'Diversifying your applications...',
                'Calculating expected returns...',
                'Hedging your career bets...'
            ]
        });

        // Healthcare Industry
        this.industries.set('healthcare', {
            name: 'Healthcare',
            icon: '🏥',
            description: 'Saving lives while drowning in paperwork',
            unlockLevel: 2,
            specialMechanics: {
                clickBonus: 1.2, // 20% better clicks
                autoSenderBonus: 0.9, // 10% slower auto-senders
                specialUpgrades: ['medical-license', 'burnout-prevention', 'patient-advocacy']
            },
            flavorTexts: [
                'Healing the job market...',
                'Diagnosing career problems...',
                'Prescribing new opportunities...',
                'Making house calls to HR...'
            ]
        });

        // Education Industry
        this.industries.set('education', {
            name: 'Education',
            icon: '🎓',
            description: 'Shaping young minds for poverty wages',
            unlockLevel: 3,
            specialMechanics: {
                clickBonus: 0.9, // 10% slower clicks
                autoSenderBonus: 0.8, // 20% slower auto-senders
                specialUpgrades: ['tenure-track', 'summer-vacation', 'student-loan-forgiveness']
            },
            flavorTexts: [
                'Teaching the art of job hunting...',
                'Grading your applications...',
                'Assigning homework to HR...',
                'Taking attendance at interviews...'
            ]
        });

        // Entertainment Industry
        this.industries.set('entertainment', {
            name: 'Entertainment',
            icon: '🎭',
            description: 'Dream big, earn small, blame the algorithm',
            unlockLevel: 4,
            specialMechanics: {
                clickBonus: 1.3, // 30% better clicks
                autoSenderBonus: 1.2, // 20% better auto-senders
                specialUpgrades: ['viral-portfolio', 'influencer-network', 'streaming-deal']
            },
            flavorTexts: [
                'Performing for HR audiences...',
                'Auditioning for dream jobs...',
                'Going viral on LinkedIn...',
                'Producing career content...'
            ]
        });
    }

    /**
     * Initialize prestige-specific achievements
     */
    initializePrestigeAchievements() {
        // First Career Change
        this.prestigeAchievements.set('first-career-change', {
            name: 'Career Pivot',
            description: 'Complete your first Career Change',
            condition: () => this.level >= 1,
            reward: { lifeExperience: 50 },
            unlocked: false
        });

        // Industry Hopper
        this.prestigeAchievements.set('industry-hopper', {
            name: 'Industry Hopper',
            description: 'Unlock all 5 industries',
            condition: () => this.unlockedIndustries.size >= 5,
            reward: { lifeExperience: 200 },
            unlocked: false
        });

        // Life Experience Collector
        this.prestigeAchievements.set('experience-collector', {
            name: 'Wise Beyond Your Years',
            description: 'Accumulate 1000 Life Experience points',
            condition: () => this.totalLifeExperienceEarned.gte(1000),
            reward: { lifeExperience: 100 },
            unlocked: false
        });

        // Maxed Out
        this.prestigeAchievements.set('maxed-out', {
            name: 'Life Mastery',
            description: 'Max out any permanent bonus',
            condition: () => {
                for (const bonus of this.permanentBonuses.values()) {
                    if (bonus.level >= bonus.maxLevel) return true;
                }
                return false;
            },
            reward: { lifeExperience: 500 },
            unlocked: false
        });
    }

    /**
     * Calculate Life Experience points earned from current run
     */
    calculateLifeExperienceGain() {
        const totalResumes = this.gameState.totalResumes;
        
        // Base formula: sqrt(totalResumes / 1000) * level multiplier
        let baseExperience = totalResumes.dividedBy(1000).sqrt().multipliedBy(10);
        
        // Level multiplier (each prestige level gives 10% more experience)
        const levelMultiplier = 1 + (this.level * 0.1);
        baseExperience = baseExperience.multipliedBy(levelMultiplier);
        
        // Apply experience gain rate bonus
        const experienceBonus = this.getPermanentBonusEffect('experienceGainRate');
        baseExperience = baseExperience.multipliedBy(1 + experienceBonus);
        
        // Industry-specific bonuses could be added here
        
        return baseExperience.integerValue();
    }

    /**
     * Check if player can perform Career Change (prestige)
     */
    canPrestige() {
        // Minimum requirement: 10,000 total resumes sent
        const minResumes = new BigNumber(10000).multipliedBy(Math.pow(2, this.level)); // Exponential scaling
        return this.gameState.totalResumes.gte(minResumes);
    }

    /**
     * Get the minimum resumes required for next prestige
     */
    getPrestigeRequirement() {
        return new BigNumber(10000).multipliedBy(Math.pow(2, this.level));
    }

    /**
     * Perform Career Change (prestige reset)
     */
    performCareerChange(newIndustry = null) {
        if (!this.canPrestige()) {
            return { success: false, message: 'Not enough resumes sent for Career Change!' };
        }

        // Calculate Life Experience gain
        const experienceGained = this.calculateLifeExperienceGain();
        
        // Add to Life Experience
        this.lifeExperiencePoints = this.lifeExperiencePoints.plus(experienceGained);
        this.totalLifeExperienceEarned = this.totalLifeExperienceEarned.plus(experienceGained);
        
        // Increase prestige level
        this.level += 1;
        
        // Switch industry if requested and unlocked
        if (newIndustry && this.isIndustryUnlocked(newIndustry)) {
            this.currentIndustry = newIndustry;
        }
        
        // Unlock new industry if applicable
        this.checkForNewIndustryUnlocks();
        
        // Reset game state (but keep prestige data)
        this.resetGameState();
        
        // Apply starting bonuses
        this.applyStartingBonuses();
        
        // Check for prestige achievements
        this.checkPrestigeAchievements();
        
        return {
            success: true,
            message: `Career Change complete! Gained ${this.gameState.getFormattedNumber(experienceGained)} Life Experience`,
            experienceGained: experienceGained,
            newLevel: this.level,
            newIndustry: this.currentIndustry
        };
    }

    /**
     * Reset game state for prestige
     */
    resetGameState() {
        // Reset core progression
        this.gameState.resumes = new BigNumber(0);
        this.gameState.totalResumes = new BigNumber(0);
        this.gameState.resumesPerSecond = new BigNumber(0);
        this.gameState.clickPower = new BigNumber(1);
        
        // Reset auto-senders
        for (const autoSender of this.gameState.autoSenders.values()) {
            autoSender.owned = 0;
            autoSender.totalOwned = 0;
        }
        
        // Reset upgrades
        for (const upgrade of this.gameState.upgrades) {
            upgrade.purchased = false;
        }
        
        // Keep achievements but reset statistics
        this.gameState.achievementTracker.initializeStatistics();
    }

    /**
     * Apply starting bonuses from permanent upgrades
     */
    applyStartingBonuses() {
        // Starting resumes bonus
        const startingResumesBonus = this.getPermanentBonusEffect('startingResumes');
        if (startingResumesBonus > 0) {
            this.gameState.resumes = this.gameState.resumes.plus(startingResumesBonus);
            this.gameState.totalResumes = this.gameState.totalResumes.plus(startingResumesBonus);
        }
        
        // Apply other permanent bonuses
        this.gameState.applyUpgradeEffects();
    }

    /**
     * Check for new industry unlocks
     */
    checkForNewIndustryUnlocks() {
        for (const [industryId, industry] of this.industries) {
            if (this.level >= industry.unlockLevel && !this.unlockedIndustries.has(industryId)) {
                this.unlockedIndustries.add(industryId);
            }
        }
    }

    /**
     * Check if an industry is unlocked
     */
    isIndustryUnlocked(industryId) {
        return this.unlockedIndustries.has(industryId);
    }

    /**
     * Get available industries for selection
     */
    getAvailableIndustries() {
        const available = [];
        for (const [industryId, industry] of this.industries) {
            if (this.isIndustryUnlocked(industryId)) {
                available.push({
                    id: industryId,
                    ...industry,
                    isCurrent: industryId === this.currentIndustry
                });
            }
        }
        return available;
    }

    /**
     * Purchase a permanent bonus upgrade
     */
    purchasePermanentBonus(bonusId) {
        const bonus = this.permanentBonuses.get(bonusId);
        if (!bonus) {
            return { success: false, message: 'Invalid bonus type!' };
        }

        if (bonus.level >= bonus.maxLevel) {
            return { success: false, message: 'Bonus already at maximum level!' };
        }

        const cost = this.calculateBonusCost(bonusId);
        if (this.lifeExperiencePoints.lt(cost)) {
            return { success: false, message: 'Not enough Life Experience!' };
        }

        // Purchase the bonus
        this.lifeExperiencePoints = this.lifeExperiencePoints.minus(cost);
        bonus.level += 1;

        return {
            success: true,
            message: `${bonusId} upgraded to level ${bonus.level}!`,
            newLevel: bonus.level,
            cost: cost
        };
    }

    /**
     * Calculate cost for next level of a permanent bonus
     */
    calculateBonusCost(bonusId) {
        const bonus = this.permanentBonuses.get(bonusId);
        if (!bonus) return new BigNumber(0);
        
        return bonus.baseCost.multipliedBy(Math.pow(bonus.costMultiplier, bonus.level));
    }

    /**
     * Get the effective value of a permanent bonus
     */
    getPermanentBonusEffect(bonusId) {
        const bonus = this.permanentBonuses.get(bonusId);
        if (!bonus) return 0;
        
        return bonus.effect * bonus.level;
    }

    /**
     * Get current industry bonuses applied to game mechanics
     */
    getCurrentIndustryBonuses() {
        const industry = this.industries.get(this.currentIndustry);
        if (!industry) return { clickBonus: 1.0, autoSenderBonus: 1.0 };
        
        return {
            clickBonus: industry.specialMechanics.clickBonus,
            autoSenderBonus: industry.specialMechanics.autoSenderBonus,
            specialUpgrades: industry.specialMechanics.specialUpgrades || []
        };
    }

    /**
     * Get random flavor text for current industry
     */
    getCurrentIndustryFlavorText() {
        const industry = this.industries.get(this.currentIndustry);
        if (!industry || !industry.flavorTexts) return 'Looking for opportunities...';
        
        const texts = industry.flavorTexts;
        return texts[Math.floor(Math.random() * texts.length)];
    }

    /**
     * Check and unlock prestige achievements
     */
    checkPrestigeAchievements() {
        for (const [achievementId, achievement] of this.prestigeAchievements) {
            if (!achievement.unlocked && achievement.condition()) {
                achievement.unlocked = true;
                
                // Apply rewards
                if (achievement.reward.lifeExperience) {
                    this.lifeExperiencePoints = this.lifeExperiencePoints.plus(achievement.reward.lifeExperience);
                }
                
                // Show notification (if available)
                if (this.gameState.gameEngine && this.gameState.gameEngine.showNotification) {
                    this.gameState.gameEngine.showNotification(
                        `🏆 Prestige Achievement: ${achievement.name}!`,
                        'achievement'
                    );
                }
            }
        }
    }

    /**
     * Get display information for prestige system
     */
    getDisplayInfo() {
        return {
            level: this.level,
            lifeExperiencePoints: this.lifeExperiencePoints,
            totalLifeExperienceEarned: this.totalLifeExperienceEarned,
            currentIndustry: this.currentIndustry,
            canPrestige: this.canPrestige(),
            prestigeRequirement: this.getPrestigeRequirement(),
            experienceGainPreview: this.calculateLifeExperienceGain(),
            availableIndustries: this.getAvailableIndustries(),
            permanentBonuses: this.getPermanentBonusesDisplay(),
            prestigeAchievements: Array.from(this.prestigeAchievements.values())
        };
    }

    /**
     * Get permanent bonuses formatted for display
     */
    getPermanentBonusesDisplay() {
        const display = [];
        for (const [bonusId, bonus] of this.permanentBonuses) {
            display.push({
                id: bonusId,
                name: bonusId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                level: bonus.level,
                maxLevel: bonus.maxLevel,
                nextCost: bonus.level < bonus.maxLevel ? this.calculateBonusCost(bonusId) : null,
                currentEffect: this.getPermanentBonusEffect(bonusId),
                description: bonus.description,
                canAfford: bonus.level < bonus.maxLevel && this.lifeExperiencePoints.gte(this.calculateBonusCost(bonusId))
            });
        }
        return display;
    }

    /**
     * Serialize prestige data for saving
     */
    serialize() {
        return {
            level: this.level,
            lifeExperiencePoints: this.lifeExperiencePoints.toString(),
            totalLifeExperienceEarned: this.totalLifeExperienceEarned.toString(),
            currentIndustry: this.currentIndustry,
            unlockedIndustries: Array.from(this.unlockedIndustries),
            permanentBonuses: Object.fromEntries(
                Array.from(this.permanentBonuses.entries()).map(([key, bonus]) => [
                    key, { level: bonus.level }
                ])
            ),
            prestigeAchievements: Object.fromEntries(
                Array.from(this.prestigeAchievements.entries()).map(([key, achievement]) => [
                    key, { unlocked: achievement.unlocked }
                ])
            )
        };
    }

    /**
     * Deserialize prestige data from save
     */
    deserialize(data) {
        if (!data) return;
        
        this.level = data.level || 0;
        this.lifeExperiencePoints = new BigNumber(data.lifeExperiencePoints || 0);
        this.totalLifeExperienceEarned = new BigNumber(data.totalLifeExperienceEarned || 0);
        this.currentIndustry = data.currentIndustry || 'tech';
        this.unlockedIndustries = new Set(data.unlockedIndustries || ['tech']);
        
        // Restore permanent bonuses
        if (data.permanentBonuses) {
            for (const [bonusId, bonusData] of Object.entries(data.permanentBonuses)) {
                const bonus = this.permanentBonuses.get(bonusId);
                if (bonus) {
                    bonus.level = bonusData.level || 0;
                }
            }
        }
        
        // Restore prestige achievements
        if (data.prestigeAchievements) {
            for (const [achievementId, achievementData] of Object.entries(data.prestigeAchievements)) {
                const achievement = this.prestigeAchievements.get(achievementId);
                if (achievement) {
                    achievement.unlocked = achievementData.unlocked || false;
                }
            }
        }
    }
}

/**
 * VisualWorkspace class to manage the middle panel visual representations
 */
class VisualWorkspace {
    constructor(gameState, gameEngine) {
        this.gameState = gameState;
        this.gameEngine = gameEngine;
        this.lanes = new Map();
        this.particlePool = [];
        this.maxParticles = 20;
        this.lastParticleTime = 0;
        this.particleInterval = 2000; // 2 seconds between particles
        
        this.init();
    }

    /**
     * Initialize the visual workspace
     */
    init() {
        this.createLanes();
        this.startParticleSystem();
        console.log('🏢 Visual Workspace initialized');
    }

    /**
     * Create lanes for each auto-sender type
     */
    createLanes() {
        const workspaceLanes = document.getElementById('workspace-lanes');
        if (!workspaceLanes) {
            console.warn('Workspace lanes container not found');
            return;
        }

        // Clear existing lanes
        workspaceLanes.innerHTML = '';
        this.lanes.clear();

        // Create a lane for each auto-sender type
        const autoSenders = this.gameState.getAllAutoSenders();
        
        autoSenders.forEach(autoSender => {
            const lane = this.createLane(autoSender);
            workspaceLanes.appendChild(lane);
            this.lanes.set(autoSender.id, lane);
        });
    }

    /**
     * Create a single lane for an auto-sender type
     */
    createLane(autoSender) {
        const lane = document.createElement('div');
        lane.className = 'auto-sender-lane empty';
        lane.dataset.type = autoSender.id;
        
        // Create lane header
        const header = document.createElement('div');
        header.className = 'lane-header';
        
        const icon = document.createElement('span');
        icon.className = 'lane-icon';
        icon.textContent = autoSender.icon;
        
        const name = document.createElement('span');
        name.className = 'lane-name';
        name.textContent = autoSender.name;
        
        const count = document.createElement('span');
        count.className = 'lane-count';
        count.textContent = '0';
        
        header.appendChild(icon);
        header.appendChild(name);
        header.appendChild(count);
        
        // Create workers container
        const workers = document.createElement('div');
        workers.className = 'lane-workers';
        
        // Add empty state message
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = autoSender.isUnlocked(this.gameState) ? 
            'No workers hired yet' : 
            `Unlocks at ${this.gameState.getFormattedNumber(new BigNumber(autoSender.unlockThreshold))} total resumes`;
        emptyMessage.style.color = '#7f8c8d';
        emptyMessage.style.fontStyle = 'italic';
        emptyMessage.style.fontSize = '0.8em';
        workers.appendChild(emptyMessage);
        
        lane.appendChild(header);
        lane.appendChild(workers);
        
        // Add click handler for lane info
        lane.addEventListener('click', () => {
            this.showLaneTooltip(autoSender);
        });
        
        return lane;
    }

    /**
     * Update all lanes based on current game state
     */
    updateLanes() {
        this.gameState.getAllAutoSenders().forEach(autoSender => {
            this.updateLane(autoSender);
        });
    }

    /**
     * Update a specific lane
     */
    updateLane(autoSender) {
        const lane = this.lanes.get(autoSender.id);
        if (!lane) return;

        const isUnlocked = autoSender.isUnlocked(this.gameState);
        const owned = autoSender.owned;
        const isActive = owned > 0 && autoSender.getProductionRate().gt(0);

        // Update lane state
        lane.classList.toggle('empty', owned === 0);
        lane.classList.toggle('active', isActive);
        
        // Update count
        const countElement = lane.querySelector('.lane-count');
        countElement.textContent = owned.toString();
        countElement.style.background = owned > 0 ? this.getTypeColor(autoSender.id) : '#95a5a6';

        // Update workers
        const workersContainer = lane.querySelector('.lane-workers');
        this.updateWorkers(workersContainer, autoSender, owned, isActive);

        // Update unlock state
        if (!isUnlocked) {
            lane.classList.add('locked');
            const emptyMessage = workersContainer.querySelector('.empty-message');
            if (emptyMessage) {
                const progress = this.gameState.totalResumes.div(autoSender.unlockThreshold).times(100).toNumber();
                emptyMessage.textContent = `Unlocks at ${this.gameState.getFormattedNumber(new BigNumber(autoSender.unlockThreshold))} total resumes (${Math.min(progress, 100).toFixed(1)}%)`;
            }
        } else {
            lane.classList.remove('locked');
        }
    }

    /**
     * Update workers in a lane
     */
    updateWorkers(container, autoSender, owned, isActive) {
        container.innerHTML = '';

        if (owned === 0) {
            // Empty state
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'Ready to hire unemployed workers';
            emptyMessage.style.color = '#7f8c8d';
            emptyMessage.style.fontStyle = 'italic';
            emptyMessage.style.fontSize = '0.8em';
            container.appendChild(emptyMessage);
            return;
        }

        // Determine display strategy based on quantity
        if (owned <= 5) {
            // Show individual workers
            for (let i = 0; i < owned; i++) {
                const worker = this.createWorker(autoSender, isActive);
                container.appendChild(worker);
            }
        } else if (owned <= 15) {
            // Show some individuals + cluster
            const individualsToShow = 3;
            for (let i = 0; i < individualsToShow; i++) {
                const worker = this.createWorker(autoSender, isActive);
                container.appendChild(worker);
            }
            
            const cluster = this.createWorkerCluster(autoSender, owned - individualsToShow, isActive);
            container.appendChild(cluster);
        } else {
            // Show only clusters
            const clustersNeeded = Math.ceil(owned / 10);
            const workersPerCluster = Math.floor(owned / clustersNeeded);
            const remainder = owned % clustersNeeded;
            
            for (let i = 0; i < clustersNeeded; i++) {
                const clusterSize = workersPerCluster + (i < remainder ? 1 : 0);
                const cluster = this.createWorkerCluster(autoSender, clusterSize, isActive);
                container.appendChild(cluster);
            }
        }
    }

    /**
     * Create a single worker representation
     */
    createWorker(autoSender, isActive) {
        const worker = document.createElement('div');
        worker.className = `auto-sender-worker ${isActive ? 'active' : ''}`;
        worker.dataset.type = autoSender.id;
        worker.textContent = autoSender.icon;
        worker.title = `${autoSender.name} - ${isActive ? 'Working' : 'Idle'}`;
        
        // Add click handler
        worker.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showWorkerTooltip(autoSender, e.target);
        });
        
        return worker;
    }

    /**
     * Create a worker cluster representation
     */
    createWorkerCluster(autoSender, count, isActive) {
        const cluster = document.createElement('div');
        cluster.className = `worker-cluster ${isActive ? 'active' : ''}`;
        cluster.dataset.type = autoSender.id;
        cluster.title = `${count} ${autoSender.name} workers - ${isActive ? 'Working' : 'Idle'}`;
        
        const icon = document.createElement('div');
        icon.className = 'cluster-icon';
        icon.textContent = autoSender.icon;
        icon.style.background = this.getTypeColor(autoSender.id);
        
        const countBadge = document.createElement('div');
        countBadge.className = 'cluster-count';
        countBadge.textContent = count.toString();
        
        cluster.appendChild(icon);
        cluster.appendChild(countBadge);
        
        // Add click handler
        cluster.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showWorkerTooltip(autoSender, e.target, count);
        });
        
        return cluster;
    }

    /**
     * Get color for auto-sender type
     */
    getTypeColor(type) {
        const colors = {
            'linkedin-premium': '#0077b5',
            'indeed-mass-applier': '#2164f3',
            'recruiter-network': '#8e44ad',
            'career-coach': '#f39c12',
            'networking-events': '#27ae60',
            'job-fair-booth': '#e67e22',
            'headhunter-agency': '#c0392b',
            'ai-resume-optimizer': '#9b59b6'
        };
        return colors[type] || '#3498db';
    }

    /**
     * Show tooltip for lane
     */
    showLaneTooltip(autoSender) {
        const displayInfo = autoSender.getDisplayInfo(this.gameState);
        console.log(`Lane Info: ${autoSender.name} - Owned: ${displayInfo.owned}, Production: ${displayInfo.formattedProductionRate}/sec`);
    }

    /**
     * Show tooltip for worker
     */
    showWorkerTooltip(autoSender, element, count = 1) {
        const production = autoSender.getProductionRate();
        const perWorkerProduction = autoSender.owned > 0 ? production.div(autoSender.owned) : new BigNumber(0);
        
        console.log(`Worker Info: ${count > 1 ? `${count} ` : ''}${autoSender.name} - Production: ${this.gameState.getFormattedNumber(perWorkerProduction)}/sec each`);
    }

    /**
     * Start the particle system for visual feedback
     */
    startParticleSystem() {
        setInterval(() => {
            this.updateParticles();
        }, 100); // Update particles every 100ms for smooth generation
    }

    /**
     * Update particle system
     */
    updateParticles() {
        const now = Date.now();
        
        // Generate particles from each active auto-sender individually
        this.gameState.getAllAutoSenders().forEach(autoSender => {
            if (autoSender.owned > 0 && autoSender.getProductionRate().gt(0)) {
                this.generateParticlesForAutoSender(autoSender, now);
            }
        });

        // Clean up old particles
        this.cleanupParticles();
    }

    /**
     * Generate particles for a specific auto-sender based on its production rate
     */
    generateParticlesForAutoSender(autoSender, currentTime) {
        const productionRate = autoSender.getProductionRate().toNumber();
        
        // Calculate time since last particle for this auto-sender
        if (!autoSender.lastParticleTime) {
            autoSender.lastParticleTime = currentTime;
            return;
        }
        
        const timeDelta = currentTime - autoSender.lastParticleTime;
        
        // Determine particle tier based on production rate
        const particleType = this.determineParticleTypeForRate(productionRate);
        
        // Calculate how many particles of this type should be generated
        const particleRate = productionRate / particleType.value; // particles per second
        const particlesThisFrame = (particleRate * timeDelta) / 1000;
        
        // Accumulate fractional particles
        if (!autoSender.accumulatedParticles) {
            autoSender.accumulatedParticles = 0;
        }
        autoSender.accumulatedParticles += particlesThisFrame;
        
        // Generate whole particles
        while (autoSender.accumulatedParticles >= 1) {
            this.createTypedParticle(autoSender, particleType);
            autoSender.accumulatedParticles -= 1;
        }
        
        autoSender.lastParticleTime = currentTime;
    }

    /**
     * Determine particle type based on production rate (pure tiers)
     */
    determineParticleTypeForRate(productionRate) {
        // Extended pure tier system - powers of 10
        if (productionRate >= 1000000000) { // 1B+
            return { value: 1000000000, emoji: '🌍', sizeClass: 'ultimate', color: '#8e44ad' };
        } else if (productionRate >= 100000000) { // 100M+
            return { value: 100000000, emoji: '🚀', sizeClass: 'massive', color: '#e74c3c' };
        } else if (productionRate >= 10000000) { // 10M+
            return { value: 10000000, emoji: '🏙️', sizeClass: 'huge', color: '#c0392b' };
        } else if (productionRate >= 1000000) { // 1M+
            return { value: 1000000, emoji: '🌆', sizeClass: 'giant', color: '#9b59b6' };
        } else if (productionRate >= 100000) { // 100K+
            return { value: 100000, emoji: '🏭', sizeClass: 'enormous', color: '#8e44ad' };
        } else if (productionRate >= 10000) { // 10K+
            return { value: 10000, emoji: '🏢', sizeClass: 'mega', color: '#9b59b6' };
        } else if (productionRate >= 1000) { // 1K+
            return { value: 1000, emoji: '🏪', sizeClass: 'large', color: '#e74c3c' };
        } else if (productionRate >= 100) { // 100+
            return { value: 100, emoji: '📦', sizeClass: 'medium', color: '#f39c12' };
        } else if (productionRate >= 10) { // 10+
            return { value: 10, emoji: '📋', sizeClass: 'small', color: '#27ae60' };
        } else { // 1-9
            return { value: 1, emoji: '📄', sizeClass: 'tiny', color: '#3498db' };
        }
    }

    /**
     * Determine what type of particle to generate based on accumulated production
     */
    determineParticleType(accumulatedProduction) {
        // Define particle tiers (value, emoji, size class)
        const particleTypes = [
            { value: 1000, emoji: '🏢', sizeClass: 'mega', color: '#9b59b6' },    // Mega chunk
            { value: 100, emoji: '📦', sizeClass: 'large', color: '#e74c3c' },   // Large chunk  
            { value: 10, emoji: '📋', sizeClass: 'medium', color: '#f39c12' },   // Medium chunk
            { value: 1, emoji: '📄', sizeClass: 'small', color: '#3498db' }      // Small chunk
        ];
        
        // Choose the largest particle type that fits
        for (const type of particleTypes) {
            if (accumulatedProduction >= type.value) {
                return type;
            }
        }
        
        // Fallback to smallest particle
        return particleTypes[particleTypes.length - 1];
    }

    /**
     * Create a typed particle with specific value and appearance
     */
    createTypedParticle(autoSender, particleType) {
        const particlesContainer = document.getElementById('floating-particles');
        if (!particlesContainer) return;

        const particle = document.createElement('div');
        particle.className = `floating-resume ${particleType.sizeClass}`;
        particle.textContent = particleType.emoji;
        
        // Style the particle based on its type
        particle.style.color = particleType.color;
        particle.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))';
        
        // Add a value indicator for larger particles
        if (particleType.value > 1) {
            particle.title = `+${particleType.value} resumes`;
            
            // Add a small value badge for medium+ particles
            if (particleType.value >= 10) {
                const valueBadge = document.createElement('div');
                valueBadge.className = 'particle-value-badge';
                valueBadge.textContent = particleType.value >= 1000 ? `${particleType.value/1000}K` : particleType.value.toString();
                particle.appendChild(valueBadge);
            }
        }
        
        // Position near the auto-sender's lane
        const lane = this.lanes.get(autoSender.id);
        if (lane) {
            const laneRect = lane.getBoundingClientRect();
            const containerRect = particlesContainer.getBoundingClientRect();
            
            // Tighter particle stream - reduced randomness for more direct trajectory
            const startX = laneRect.right - containerRect.left - 20 + (Math.random() * 20 - 10); // ±10px instead of ±30px
            const startY = laneRect.top - containerRect.top + (laneRect.height / 2) + (Math.random() * 20 - 10); // Center of lane ±10px
            
            particle.style.left = `${startX}px`;
            particle.style.top = `${startY}px`;
        } else {
            // Fallback position
            particle.style.left = `${Math.random() * 100}px`;
            particle.style.top = `${Math.random() * 200 + 100}px`;
        }
        
        // Vary animation duration based on particle size (bigger = slightly slower)
        const baseDuration = 2500;
        const sizeMultiplier = particleType.value >= 100 ? 1.2 : particleType.value >= 10 ? 1.1 : 1.0;
        const duration = baseDuration * sizeMultiplier + (Math.random() * 500);
        particle.style.animationDuration = `${duration}ms`;
        
        particlesContainer.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, duration);
    }

    /**
     * Create a floating resume particle (legacy method - now redirects to typed system)
     */
    createParticle(autoSender) {
        // Use the new typed system with a default small particle
        const defaultParticleType = { value: 1, emoji: '📄', sizeClass: 'small', color: this.getTypeColor(autoSender.id) };
        this.createTypedParticle(autoSender, defaultParticleType);
    }

    /**
     * Clean up old particles
     */
    cleanupParticles() {
        const particlesContainer = document.getElementById('floating-particles');
        if (!particlesContainer) return;

        // Remove particles that have completed their animation
        const particles = particlesContainer.querySelectorAll('.floating-resume');
        particles.forEach(particle => {
            const computedStyle = getComputedStyle(particle);
            if (computedStyle.opacity === '0') {
                particle.remove();
            }
        });
    }

    /**
     * Trigger particle burst when auto-sender is purchased
     */
    triggerPurchaseEffect(autoSenderId) {
        const lane = this.lanes.get(autoSenderId);
        if (!lane) return;

        // Add temporary purchase effect
        lane.style.animation = 'productionPulse 0.6s ease-out';
        setTimeout(() => {
            lane.style.animation = '';
        }, 600);

        // Create celebration particles
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const autoSender = this.gameState.getAutoSender(autoSenderId);
                if (autoSender) {
                    this.createParticle(autoSender);
                }
            }, i * 100);
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Recreate lanes if needed for responsive behavior
        this.updateLanes();
    }
}

// ... existing code ... 

/**
 * RandomEvent class representing a single random event
 */
class RandomEvent {
    constructor(id, type, title, message, options = {}) {
        this.id = id;
        this.type = type; // 'rejection', 'fake_interview', 'networking', 'success_tease', 'flavor'
        this.title = title;
        this.message = message;
        this.icon = options.icon || '📧';
        this.duration = options.duration || 5000; // Display time in ms
        this.probability = options.probability || 0.1; // Base probability (0-1)
        this.requirements = options.requirements || {}; // unlock requirements
        this.effects = options.effects || {}; // temporary effects
        this.choices = options.choices || null; // player interaction options
        this.onSelect = options.onSelect || null; // callback for player choice
    }

    /**
     * Check if this event can trigger based on game state
     */
    canTrigger(gameState, eventManager) {
        // Check basic requirements
        if (this.requirements.minResumes && gameState.totalResumes.isLessThan(this.requirements.minResumes)) {
            return false;
        }
        if (this.requirements.maxResumes && gameState.totalResumes.isGreaterThan(this.requirements.maxResumes)) {
            return false;
        }
        if (this.requirements.minAutoSenders) {
            const autoSendersOwned = gameState.getAllAutoSenders()
                .reduce((total, autoSender) => total + autoSender.owned, 0);
            if (autoSendersOwned < this.requirements.minAutoSenders) {
                return false;
            }
        }

        // Check cooldown
        if (eventManager.isOnCooldown(this.id)) {
            return false;
        }

        return true;
    }

    /**
     * Apply temporary effects to game state
     */
    applyEffects(gameState) {
        if (this.effects.clickMultiplier) {
            // Store original value for restoration
            if (!gameState.temporaryEffects) {
                gameState.temporaryEffects = {};
            }
            gameState.temporaryEffects.clickMultiplier = {
                original: gameState.clickPower,
                multiplier: this.effects.clickMultiplier,
                duration: this.effects.duration || 30000,
                startTime: Date.now()
            };
        }

        if (this.effects.autoSenderBoost) {
            if (!gameState.temporaryEffects) {
                gameState.temporaryEffects = {};
            }
            gameState.temporaryEffects.autoSenderBoost = {
                multiplier: this.effects.autoSenderBoost,
                duration: this.effects.duration || 30000,
                startTime: Date.now()
            };
        }
    }

    /**
     * Create the event display element
     */
    createEventElement(gameEngine) {
        const eventDiv = document.createElement('div');
        eventDiv.className = `random-event ${this.type}`;
        eventDiv.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            max-width: 300px;
            padding: 15px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            cursor: pointer;
        `;

        // Set background color based on event type
        const colors = {
            rejection: '#e74c3c',
            fake_interview: '#f39c12', 
            networking: '#3498db',
            success_tease: '#9b59b6',
            flavor: '#34495e'
        };
        eventDiv.style.backgroundColor = colors[this.type] || '#34495e';

        let innerHTML = `
            <div class="event-header">
                <span class="event-icon">${this.icon}</span>
                <span class="event-title">${this.title}</span>
            </div>
            <div class="event-message">${this.message}</div>
        `;

        // Add choices if available
        if (this.choices && this.choices.length > 0) {
            innerHTML += '<div class="event-choices">';
            this.choices.forEach((choice, index) => {
                innerHTML += `<button class="event-choice" data-choice="${index}">${choice.text}</button>`;
            });
            innerHTML += '</div>';
        }

        eventDiv.innerHTML = innerHTML;

        // Add click handlers for choices
        if (this.choices && this.choices.length > 0) {
            const choiceButtons = eventDiv.querySelectorAll('.event-choice');
            choiceButtons.forEach((button, index) => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (this.onSelect) {
                        this.onSelect(index, this.choices[index], gameEngine.gameState);
                    }
                    eventDiv.remove();
                });
            });
        } else {
            // Auto-dismiss after duration if no choices
            setTimeout(() => {
                if (eventDiv.parentNode) {
                    eventDiv.style.animation = 'slideOut 0.3s ease-in';
                    setTimeout(() => {
                        if (eventDiv.parentNode) {
                            eventDiv.remove();
                        }
                    }, 300);
                }
            }, this.duration);
        }

        return eventDiv;
    }
}

/**
 * RandomEventManager - Manages random events and flavor text
 */
class RandomEventManager {
    constructor(gameState, gameEngine) {
        this.gameState = gameState;
        this.gameEngine = gameEngine;
        this.events = new Map();
        this.eventCooldowns = new Map();
        this.lastEventTime = 0;
        this.eventInterval = 15000; // Base time between events (15 seconds)
        this.newsTicker = null;
        this.currentNewsIndex = 0;
        this.newsUpdateInterval = 8000; // News ticker update every 8 seconds
        
        this.initializeEvents();
        this.startNewsTicker();
    }

    /**
     * Initialize all random events
     */
    initializeEvents() {
        // Rejection emails
        this.addEvent(new RandomEvent(
            'rejection-generic',
            'rejection',
            'Application Status Update',
            'Thank you for your interest in our company. While your background is impressive, we have decided to move forward with other candidates who more closely match our requirements.',
            {
                icon: '📧',
                probability: 0.3,
                requirements: { minResumes: 5 }
            }
        ));

        this.addEvent(new RandomEvent(
            'rejection-overqualified',
            'rejection',
            'Position Update',
            'We appreciate your application, but unfortunately, you appear to be overqualified for this role. We worry you might leave when something better comes along.',
            {
                icon: '🎓',
                probability: 0.2,
                requirements: { minResumes: 50 }
            }
        ));

        this.addEvent(new RandomEvent(
            'rejection-experience',
            'rejection',
            'Application Review Complete',
            'While we were impressed with your resume, we have decided to pursue candidates with more relevant experience in this specific field.',
            {
                icon: '📊',
                probability: 0.25,
                requirements: { minResumes: 25 }
            }
        ));

        // Fake interview opportunities
        this.addEvent(new RandomEvent(
            'fake-interview-phone',
            'fake_interview',
            'Interview Opportunity!',
            'Congratulations! You\'ve been selected for a phone screening. We\'ll call you next Tuesday between 9 AM and 5 PM. Please keep your phone available.',
            {
                icon: '📞',
                probability: 0.15,
                duration: 8000,
                requirements: { minResumes: 20 },
                choices: [
                    { text: 'Exciting!', effect: 'hope' },
                    { text: 'I\'ll wait...', effect: 'patience' }
                ],
                onSelect: (choiceIndex, choice, gameState) => {
                    if (choiceIndex === 0) {
                        // Add temporary click boost from excitement
                        gameState.temporaryEffects = gameState.temporaryEffects || {};
                        gameState.temporaryEffects.clickMultiplier = {
                            original: gameState.clickPower,
                            multiplier: 1.5,
                            duration: 60000,
                            startTime: Date.now()
                        };
                    }
                }
            }
        ));

        this.addEvent(new RandomEvent(
            'fake-interview-video',
            'fake_interview',
            'Video Interview Scheduled',
            'Great news! We\'d like to schedule a video interview with you. Please download our proprietary interview platform and create an account.',
            {
                icon: '💻',
                probability: 0.12,
                duration: 7000,
                requirements: { minResumes: 40 },
                choices: [
                    { text: 'Download now', effect: 'enthusiasm' },
                    { text: 'Seems sketchy...', effect: 'doubt' }
                ]
            }
        ));

        // Networking "opportunities"
        this.addEvent(new RandomEvent(
            'networking-linkedin',
            'networking',
            'LinkedIn Connection',
            'A "Senior Talent Acquisition Specialist" wants to connect with you! Their profile says they can help you find your dream job.',
            {
                icon: '💼',
                probability: 0.18,
                requirements: { minResumes: 15 },
                choices: [
                    { text: 'Accept', effect: 'network' },
                    { text: 'Ignore', effect: 'skepticism' }
                ],
                onSelect: (choiceIndex, choice, gameState) => {
                    if (choiceIndex === 0) {
                        // Slight auto-sender boost from "networking"
                        gameState.temporaryEffects = gameState.temporaryEffects || {};
                        gameState.temporaryEffects.autoSenderBoost = {
                            multiplier: 1.1,
                            duration: 45000,
                            startTime: Date.now()
                        };
                    }
                }
            }
        ));

        this.addEvent(new RandomEvent(
            'networking-recruiter',
            'networking',
            'Recruiter Reached Out',
            'A recruiter from "Dynamic Solutions Inc" has an amazing opportunity that\'s "perfect for your background." It\'s confidential, so they can\'t tell you the company name.',
            {
                icon: '🕵️',
                probability: 0.16,
                requirements: { minAutoSenders: 2 },
                choices: [
                    { text: 'Tell me more!', effect: 'curiosity' },
                    { text: 'Red flags...', effect: 'wisdom' }
                ]
            }
        ));

        // Success teases that lead nowhere
        this.addEvent(new RandomEvent(
            'success-final-round',
            'success_tease',
            'Final Round Interview!',
            'Fantastic news! You\'ve made it to the final round! You\'re one of our top 3 candidates. We should have a decision by end of week.',
            {
                icon: '🎉',
                probability: 0.08,
                duration: 6000,
                requirements: { minResumes: 75 },
                effects: { clickMultiplier: 2, duration: 120000 },
                choices: [
                    { text: 'I knew it!', effect: 'confidence' },
                    { text: 'Don\'t jinx it...', effect: 'caution' }
                ]
            }
        ));

        this.addEvent(new RandomEvent(
            'success-reference-check',
            'success_tease',
            'Reference Check',
            'We\'re moving forward with your application and would like to conduct a reference check. This is typically the final step in our process!',
            {
                icon: '✅',
                probability: 0.06,
                duration: 5000,
                requirements: { minResumes: 100 },
                effects: { autoSenderBoost: 1.5, duration: 180000 }
            }
        ));

        // General flavor text events
        this.addEvent(new RandomEvent(
            'flavor-job-fair',
            'flavor',
            'Virtual Job Fair',
            'There\'s a virtual job fair happening today! Entry is free, but you need to register with your email, phone, and complete a 47-question personality assessment.',
            {
                icon: '🏢',
                probability: 0.1,
                requirements: { minResumes: 30 }
            }
        ));

        this.addEvent(new RandomEvent(
            'flavor-career-advice',
            'flavor',
            'Career Tip of the Day',
            'Remember: 80% of jobs are never posted online! Focus on networking, informational interviews, and reaching out directly to hiring managers.',
            {
                icon: '💡',
                probability: 0.12,
                requirements: { minResumes: 10 }
            }
        ));

        this.addEvent(new RandomEvent(
            'flavor-salary-survey',
            'flavor',
            'Salary Survey',
            'A salary survey shows that professionals in your field earn 20% more than you expected! Unfortunately, none of them seem to be hiring.',
            {
                icon: '💰',
                probability: 0.09,
                requirements: { minResumes: 60 }
            }
        ));
    }

    /**
     * Add an event to the manager
     */
    addEvent(event) {
        this.events.set(event.id, event);
    }

    /**
     * Check if an event is on cooldown
     */
    isOnCooldown(eventId) {
        const cooldownTime = this.eventCooldowns.get(eventId);
        if (!cooldownTime) return false;
        
        return Date.now() - cooldownTime < 30000; // 30 second cooldown per event
    }

    /**
     * Set cooldown for an event
     */
    setCooldown(eventId) {
        this.eventCooldowns.set(eventId, Date.now());
    }

    /**
     * Process random events
     */
    processRandomEvents() {
        const now = Date.now();
        
        // Check if enough time has passed since last event
        if (now - this.lastEventTime < this.eventInterval) {
            return;
        }

        // Random chance to trigger an event
        if (Math.random() > 0.3) { // 30% chance each interval
            return;
        }

        // Get available events
        const availableEvents = Array.from(this.events.values())
            .filter(event => event.canTrigger(this.gameState, this));

        if (availableEvents.length === 0) {
            return;
        }

        // Weight events by probability and select one
        const totalWeight = availableEvents.reduce((sum, event) => sum + event.probability, 0);
        let random = Math.random() * totalWeight;
        
        let selectedEvent = null;
        for (const event of availableEvents) {
            random -= event.probability;
            if (random <= 0) {
                selectedEvent = event;
                break;
            }
        }

        if (selectedEvent) {
            this.triggerEvent(selectedEvent);
            this.setCooldown(selectedEvent.id);
            this.lastEventTime = now;
        }
    }

    /**
     * Trigger a specific event
     */
    triggerEvent(event) {
        // Apply any effects
        event.applyEffects(this.gameState);
        
        // Create and show the event UI
        const eventElement = event.createEventElement(this.gameEngine);
        document.body.appendChild(eventElement);

        // Log for debugging
        console.log(`🎭 Random Event: ${event.title}`);
    }

    /**
     * Initialize and start the news ticker
     */
    startNewsTicker() {
        const newsData = [
            "📰 Local startup seeks 'rockstar ninja unicorn' developer with 10+ years experience in technology invented last week",
            "📈 Job market is 'stronger than ever' according to people who already have jobs",
            "🎓 New study: Having a degree makes you both overqualified and underqualified for the same position",
            "💼 Company culture described as 'like a family' - a dysfunctional family that doesn't pay well",
            "🏆 'Entry-level' position requires 5 years experience, PhD, and ability to work for 'competitive' salary",
            "📊 Remote work opportunities: Must be able to commute to office daily",
            "🔍 Hiring manager still looking for 'purple squirrel' candidate after 2 years of searching",
            "💡 Revolutionary idea: Maybe the problem isn't your resume, it's the entire system",
            "⚡ Breaking: Local person actually gets call back, turns out to be wrong number",
            "🎯 Recruiter promises to 'circle back' - experts predict heat death of universe first"
        ];

        const newsContainer = document.getElementById('recent-activity');
        if (!newsContainer) return;

        // Create ticker element if it doesn't exist
        if (!this.newsTicker) {
            this.newsTicker = document.createElement('div');
            this.newsTicker.className = 'news-ticker';
            this.newsTicker.style.cssText = `
                font-size: 12px;
                color: #666;
                font-style: italic;
                padding: 5px 0;
                border-top: 1px solid #eee;
                margin-top: 10px;
                min-height: 20px;
                animation: fadeIn 0.5s ease;
            `;
            newsContainer.appendChild(this.newsTicker);
        }

        // Update ticker content
        const updateTicker = () => {
            if (this.newsTicker) {
                this.newsTicker.textContent = newsData[this.currentNewsIndex];
                this.newsTicker.style.animation = 'none';
                this.newsTicker.offsetHeight; // Trigger reflow
                this.newsTicker.style.animation = 'fadeIn 0.5s ease';
                
                this.currentNewsIndex = (this.currentNewsIndex + 1) % newsData.length;
            }
        };

        // Initial update
        updateTicker();
        
        // Set interval for updates
        setInterval(updateTicker, this.newsUpdateInterval);
    }

    /**
     * Apply temporary effects to game state
     */
    applyTemporaryEffects() {
        if (!this.gameState.temporaryEffects) return;

        const now = Date.now();
        const effects = this.gameState.temporaryEffects;

        // Handle click multiplier effect
        if (effects.clickMultiplier) {
            const effect = effects.clickMultiplier;
            if (now - effect.startTime < effect.duration) {
                // Effect is still active
                this.gameState.clickPower = effect.original.multipliedBy(effect.multiplier);
            } else {
                // Effect expired, restore original
                this.gameState.clickPower = effect.original;
                delete effects.clickMultiplier;
            }
        }

        // Handle auto-sender boost effect
        if (effects.autoSenderBoost) {
            const effect = effects.autoSenderBoost;
            if (now - effect.startTime >= effect.duration) {
                // Effect expired, remove it
                delete effects.autoSenderBoost;
                // Force update of resume generation to remove boost
                this.gameState.updateResumeGeneration();
            }
        }
    }

    /**
     * Get current auto-sender boost multiplier
     */
    getAutoSenderBoost() {
        if (!this.gameState.temporaryEffects || !this.gameState.temporaryEffects.autoSenderBoost) {
            return 1;
        }

        const effect = this.gameState.temporaryEffects.autoSenderBoost;
        const now = Date.now();
        
        if (now - effect.startTime < effect.duration) {
            return effect.multiplier;
        }
        
        return 1;
    }

    /**
     * Serialize for saving
     */
    serialize() {
        return {
            eventCooldowns: Object.fromEntries(this.eventCooldowns),
            lastEventTime: this.lastEventTime,
            currentNewsIndex: this.currentNewsIndex
        };
    }

    /**
     * Deserialize from save data
     */
    deserialize(data) {
        if (data.eventCooldowns) {
            this.eventCooldowns = new Map(Object.entries(data.eventCooldowns));
        }
        if (data.lastEventTime) {
            this.lastEventTime = data.lastEventTime;
        }
        if (data.currentNewsIndex !== undefined) {
            this.currentNewsIndex = data.currentNewsIndex;
        }
    }
}

// ... existing code ... 