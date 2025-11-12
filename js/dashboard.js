// Dashboard functionality
class Dashboard {
    constructor() {
        this.user = null;
        this.userData = null;
        this.init();
    }

    async init() {
        await this.loadUserData();
        this.updateDashboard();
        this.loadRecentTransactions();
    }

    async loadUserData() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            this.user = user;

            if (user) {
                // Get user data from database
                const { data: userData, error } = await supabase
                    .from('users')
                    .select('*, plans(*)')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;
                this.userData = userData;

                // Give signup bonus if not given
                if (!userData.signup_bonus_given) {
                    await this.giveSignupBonus();
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async giveSignupBonus() {
        try {
            // Add ₹15 signup bonus
            const bonusAmount = 15;
            
            // Update wallet
            const { error: updateError } = await supabase
                .from('users')
                .update({ 
                    wallet: this.userData.wallet + bonusAmount,
                    signup_bonus_given: true 
                })
                .eq('id', this.user.id);

            if (updateError) throw updateError;

            // Add transaction record
            const { error: transError } = await supabase
                .from('transactions')
                .insert({
                    user_id: this.user.id,
                    type: 'credit',
                    amount: bonusAmount,
                    reason: 'signup_bonus'
                });

            if (transError) throw transError;

            utils.showNotification(`🎉 ₹${bonusAmount} signup bonus added to your wallet!`);
            
            // Reload user data
            await this.loadUserData();
            this.updateDashboard();

        } catch (error) {
            console.error('Error giving signup bonus:', error);
        }
    }

    updateDashboard() {
        if (!this.userData) return;

        // Update wallet
        document.getElementById('walletAmount').textContent = 
            utils.formatCurrency(this.userData.wallet);

        // Update plan info
        document.getElementById('planName').textContent = this.userData.plans.name + ' Plan';
        document.getElementById('planMultiplier').textContent = 
            `Multiplier: ${this.userData.plans.multiplier}×`;
        
        // Update streak
        document.getElementById('streakCount').textContent = 
            `${this.userData.streak_count || 0} Days`;

        // Update user name
        document.getElementById('userName').textContent = this.user.email.split('@')[0];

        // Update stats
        this.updateStats();
    }

    async updateStats() {
        try {
            // Get total earned
            const { data: transactions, error } = await supabase
                .from('transactions')
                .select('amount')
                .eq('user_id', this.user.id)
                .eq('type', 'credit');

            if (error) throw error;

            const totalEarned = transactions.reduce((sum, trans) => sum + trans.amount, 0);
            document.getElementById('totalEarned').textContent = utils.formatCurrency(totalEarned);

            // Get tasks completed
            const { data: tasks, error: tasksError } = await supabase
                .from('tasks')
                .select('id')
                .eq('user_id', this.user.id)
                .eq('status', 'approved');

            if (!tasksError) {
                document.getElementById('tasksCompleted').textContent = tasks.length;
            }

            // Get referrals count
            const { data: referrals, error: refError } = await supabase
                .from('referrals')
                .select('id')
                .eq('referrer_id', this.user.id);

            if (!refError) {
                document.getElementById('referralsCount').textContent = referrals.length;
            }

        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    async loadRecentTransactions() {
        try {
            const { data: transactions, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', this.user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;

            const earningsList = document.getElementById('earningsList');
            earningsList.innerHTML = '';

            transactions.forEach(trans => {
                if (trans.type === 'credit') {
                    const item = document.createElement('div');
                    item.className = 'earning-item';
                    item.innerHTML = `
                        <span>${this.getReasonText(trans.reason)}</span>
                        <span>+${utils.formatCurrency(trans.amount)}</span>
                    `;
                    earningsList.appendChild(item);
                }
            });

        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    }

    getReasonText(reason) {
        const reasons = {
            'signup_bonus': 'Signup Bonus',
            'checkin': 'Daily Check-in',
            'scratch': 'Scratch Card',
            'treasure': 'Treasure Box',
            'task': 'Task Completed',
            'referral': 'Referral Bonus'
        };
        return reasons[reason] || reason;
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});
