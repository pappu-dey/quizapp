class Leaderboard {
    constructor() {
        this.leaderboardData = [];
        this.currentPlayer = null;
        this.currentSort = 'score';
        this.currentOrder = 'desc';
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderLeaderboard();
        this.updateStats();
    }

    loadData() {
        // Load leaderboard data from localStorage
        this.leaderboardData = JSON.parse(localStorage.getItem('quizely-leaderboard') || '[]');
        
        // Load current player data for highlighting
        this.currentPlayer = JSON.parse(localStorage.getItem('current-player') || 'null');
        
        console.log('📊 Loaded leaderboard data:', this.leaderboardData);
        console.log('👤 Current player:', this.currentPlayer);
    }

    setupEventListeners() {
        // Sort buttons
        document.getElementById('sort-score').addEventListener('click', () => this.sortBy('score'));
        document.getElementById('sort-percentage').addEventListener('click', () => this.sortBy('percentage'));
        document.getElementById('sort-time').addEventListener('click', () => this.sortBy('timeTaken'));
        document.getElementById('sort-date').addEventListener('click', () => this.sortBy('timestamp'));

        // Filter buttons
        document.getElementById('filter-all').addEventListener('click', () => this.filterBy('all'));
        document.getElementById('filter-today').addEventListener('click', () => this.filterBy('today'));
        document.getElementById('filter-week').addEventListener('click', () => this.filterBy('week'));

        // Clear data button
        document.getElementById('clear-data').addEventListener('click', () => this.clearAllData());

        // Export data button
        document.getElementById('export-data').addEventListener('click', () => this.exportData());

        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchPlayers(e.target.value));
        }
    }

    sortBy(field) {
        // Toggle order if same field, otherwise default to desc
        if (this.currentSort === field) {
            this.currentOrder = this.currentOrder === 'desc' ? 'asc' : 'desc';
        } else {
            this.currentSort = field;
            this.currentOrder = field === 'timeTaken' ? 'asc' : 'desc';
        }

        // Update active button
        document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`sort-${field === 'timestamp' ? 'date' : field}`).classList.add('active');

        this.renderLeaderboard();
    }

    filterBy(period) {
        const now = new Date();
        let filteredData = [...this.leaderboardData];

        switch (period) {
            case 'today':
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                filteredData = this.leaderboardData.filter(entry => {
                    const entryDate = new Date(entry.timestamp);
                    return entryDate >= today;
                });
                break;
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filteredData = this.leaderboardData.filter(entry => {
                    const entryDate = new Date(entry.timestamp);
                    return entryDate >= weekAgo;
                });
                break;
            case 'all':
            default:
                filteredData = [...this.leaderboardData];
                break;
        }

        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`filter-${period}`).classList.add('active');

        this.renderLeaderboard(filteredData);
    }

    searchPlayers(query) {
        if (!query.trim()) {
            this.renderLeaderboard();
            return;
        }

        const filteredData = this.leaderboardData.filter(entry =>
            entry.name.toLowerCase().includes(query.toLowerCase()) ||
            (entry.email && entry.email.toLowerCase().includes(query.toLowerCase()))
        );

        this.renderLeaderboard(filteredData);
    }

    renderLeaderboard(data = null) {
        const tableBody = document.getElementById('leaderboard-body');
        const displayData = data || this.getSortedData();

        if (displayData.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-data">
                        <div style="text-align: center; padding: 2rem; color: #666;">
                            <h3>No data available</h3>
                            <p>Play some quizzes to see the leaderboard!</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = displayData.map((entry, index) => {
            const isCurrentPlayer = this.currentPlayer && 
                entry.name === this.currentPlayer.name && 
                Math.abs(entry.timestamp - this.currentPlayer.timestamp) < 5000;

            const rank = index + 1;
            const date = new Date(entry.timestamp).toLocaleDateString();
            const time = this.formatTime(entry.timeTaken);

            return `
                <tr class="${isCurrentPlayer ? 'current-player' : ''} ${rank <= 3 ? 'top-player' : ''}">
                    <td class="rank">
                        ${rank <= 3 ? this.getRankIcon(rank) : rank}
                    </td>
                    <td class="name">
                        ${this.escapeHtml(entry.name)}
                        ${isCurrentPlayer ? '<span class="you-badge">YOU</span>' : ''}
                    </td>
                    <td class="score">${entry.score}/${entry.total}</td>
                    <td class="percentage">
                        <div class="percentage-bar">
                            <div class="percentage-fill" style="width: ${entry.percentage}%"></div>
                            <span class="percentage-text">${entry.percentage}%</span>
                        </div>
                    </td>
                    <td class="time">${time}</td>
                    <td class="date">${date}</td>
                    <td class="actions">
                        <button class="action-btn" onclick="leaderboard.viewDetails(${index})">
                            VIEW
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    getSortedData() {
        const sorted = [...this.leaderboardData].sort((a, b) => {
            let aVal = a[this.currentSort];
            let bVal = b[this.currentSort];

            if (this.currentSort === 'timestamp') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }

            if (this.currentOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return sorted;
    }

    getRankIcon(rank) {
        const icons = {
            1: '🥇',
            2: '🥈',
            3: '🥉'
        };
        return `<span class="rank-icon">${icons[rank]} ${rank}</span>`;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateStats() {
        const stats = this.calculateStats();
        
        document.getElementById('total-players').textContent = stats.totalPlayers;
        document.getElementById('total-games').textContent = stats.totalGames;
        document.getElementById('avg-score').textContent = `${stats.avgScore}%`;
        document.getElementById('top-score').textContent = `${stats.topScore}%`;
    }

    calculateStats() {
        if (this.leaderboardData.length === 0) {
            return {
                totalPlayers: 0,
                totalGames: 0,
                avgScore: 0,
                topScore: 0
            };
        }

        const uniquePlayers = [...new Set(this.leaderboardData.map(entry => entry.name))];
        const totalGames = this.leaderboardData.length;
        const avgScore = Math.round(
            this.leaderboardData.reduce((sum, entry) => sum + entry.percentage, 0) / totalGames
        );
        const topScore = Math.max(...this.leaderboardData.map(entry => entry.percentage));

        return {
            totalPlayers: uniquePlayers.length,
            totalGames,
            avgScore,
            topScore
        };
    }

    viewDetails(index) {
        const entry = this.getSortedData()[index];
        const modal = document.getElementById('detail-modal');
        
        // Populate modal with entry details
        document.getElementById('detail-name').textContent = entry.name;
        document.getElementById('detail-email').textContent = entry.email || 'Not provided';
        document.getElementById('detail-score').textContent = `${entry.score}/${entry.total}`;
        document.getElementById('detail-percentage').textContent = `${entry.percentage}%`;
        document.getElementById('detail-time').textContent = this.formatTime(entry.timeTaken);
        document.getElementById('detail-date').textContent = new Date(entry.timestamp).toLocaleString();
        
        modal.style.display = 'flex';
    }

    closeDetails() {
        document.getElementById('detail-modal').style.display = 'none';
    }

    clearAllData() {
        if (confirm('⚠️ Are you sure you want to clear all leaderboard data? This action cannot be undone!')) {
            localStorage.removeItem('quizely-leaderboard');
            localStorage.removeItem('current-player');
            this.leaderboardData = [];
            this.currentPlayer = null;
            this.renderLeaderboard();
            this.updateStats();
            
            alert('✅ All leaderboard data has been cleared!');
        }
    }

    exportData() {
        if (this.leaderboardData.length === 0) {
            alert('No data to export!');
            return;
        }

        const csvContent = this.convertToCSV(this.leaderboardData);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `quizely-leaderboard-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    convertToCSV(data) {
        const headers = ['Name', 'Email', 'Score', 'Total', 'Percentage', 'Time (seconds)', 'Date'];
        const csvRows = [headers.join(',')];
        
        data.forEach(entry => {
            const row = [
                `"${entry.name}"`,
                `"${entry.email || ''}"`,
                entry.score,
                entry.total,
                entry.percentage,
                entry.timeTaken,
                `"${new Date(entry.timestamp).toISOString()}"`
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }

    goBackToGame() {
        window.close();
        // If window.close() doesn't work (popup blockers), redirect
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 100);
    }
}

// Global leaderboard instance
let leaderboard;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    leaderboard = new Leaderboard();
});

// Modal close functionality
function closeModal() {
    leaderboard.closeDetails();
}

// Back to game functionality
function backToGame() {
    leaderboard.goBackToGame();
}