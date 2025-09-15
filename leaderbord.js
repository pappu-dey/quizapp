class Leaderboard {
    constructor() {
        this.leaderboardData = [];
        this.currentPlayer = null;
        this.currentFilter = 'all';
        this.filteredData = [];
        
        this.init();
    }

    init() {
        console.log('Initializing leaderboard...');
        this.loadData();
        this.setupEventListeners();
        this.updateDisplay();
    }

    loadData() {
        // Try both possible localStorage keys for backward compatibility
        let data = localStorage.getItem('quizLeaderboard');
        if (!data) {
            data = localStorage.getItem('quizely-leaderboard');
        }
        
        try {
            this.leaderboardData = JSON.parse(data || '[]');
            console.log('Loaded leaderboard data:', this.leaderboardData);
        } catch (error) {
            console.error('Error parsing leaderboard data:', error);
            this.leaderboardData = [];
        }
        
        // Load current player data for highlighting
        try {
            this.currentPlayer = JSON.parse(localStorage.getItem('current-player') || 'null');
            console.log('Current player:', this.currentPlayer);
        } catch (error) {
            console.error('Error parsing current player data:', error);
            this.currentPlayer = null;
        }
        
        // Sort data by percentage (desc) then by time taken (asc)
        this.sortLeaderboardData();
        
        // Set initial filtered data
        this.filteredData = [...this.leaderboardData];
    }

    sortLeaderboardData() {
        this.leaderboardData.sort((a, b) => {
            if (b.percentage !== a.percentage) {
                return b.percentage - a.percentage;
            }
            // For time comparison, handle both string and number formats
            const timeA = this.parseTime(a.timeTaken);
            const timeB = this.parseTime(b.timeTaken);
            return timeA - timeB;
        });
    }

    parseTime(timeStr) {
        if (typeof timeStr === 'number') {
            return timeStr;
        }
        if (typeof timeStr === 'string' && timeStr.includes(':')) {
            const [minutes, seconds] = timeStr.split(':').map(Number);
            return (minutes * 60) + seconds;
        }
        return parseInt(timeStr) || 0;
    }

    formatTime(time) {
        const totalSeconds = typeof time === 'string' ? this.parseTime(time) : time;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterId = e.target.id;
                const filterType = filterId.split('-')[1];
                this.filterBy(filterType);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchPlayers(e.target.value);
                }, 300);
            });
        }

        // Action buttons
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        const clearBtn = document.getElementById('clear-data');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllData());
        }

        // Back button
        const backBtn = document.querySelector('.back-button');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.backToGame());
        }
    }

    filterBy(period) {
        const now = new Date();
        let filteredData = [...this.leaderboardData];

        switch (period) {
            case 'today':
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                filteredData = this.leaderboardData.filter(entry => {
                    const entryDate = new Date(entry.date || entry.timestamp);
                    return entryDate >= today;
                });
                break;
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filteredData = this.leaderboardData.filter(entry => {
                    const entryDate = new Date(entry.date || entry.timestamp);
                    return entryDate >= weekAgo;
                });
                break;
            case 'all':
            default:
                filteredData = [...this.leaderboardData];
                break;
        }

        this.currentFilter = period;
        this.filteredData = filteredData;

        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`filter-${period}`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.updateDisplay();
    }

    searchPlayers(query) {
        if (!query.trim()) {
            this.filterBy(this.currentFilter);
            return;
        }

        const lowerQuery = query.toLowerCase();
        this.filteredData = this.leaderboardData.filter(entry =>
            (entry.name && entry.name.toLowerCase().includes(lowerQuery)) ||
            (entry.email && entry.email.toLowerCase().includes(lowerQuery))
        );

        this.updateDisplay();
    }

    updateDisplay() {
        this.updateStats();
        this.updatePodium();
        this.updateLeaderboard();
    }

    updateStats() {
        const totalGamesEl = document.getElementById('total-games');
        const totalUsersEl = document.getElementById('total-users');
        
        if (totalGamesEl) {
            totalGamesEl.textContent = this.filteredData.length;
        }
        
        if (totalUsersEl) {
            // Count unique players by email and name combination
            const uniquePlayers = new Set();
            this.filteredData.forEach(entry => {
                const identifier = `${entry.name}_${entry.email || 'no-email'}`;
                uniquePlayers.add(identifier);
            });
            totalUsersEl.textContent = uniquePlayers.size;
        }
    }

    updatePodium() {
        const top3 = this.filteredData.slice(0, 3);
        
        // Helper function to safely update element
        const updateElement = (id, value) => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = value;
            }
        };
        
        // Update first place
        if (top3.length >= 1) {
            updateElement('first-name', top3[0].name || 'Unknown');
            updateElement('first-email', top3[0].email || 'No email provided');
            updateElement('first-accuracy', `${top3[0].percentage || 0}%`);
            updateElement('first-time', this.formatTime(top3[0].timeTaken || 0));
        } else {
            updateElement('first-name', 'No Player Yet');
            updateElement('first-email', '-');
            updateElement('first-accuracy', '0%');
            updateElement('first-time', '0:00');
        }

        // Update second place
        if (top3.length >= 2) {
            updateElement('second-name', top3[1].name || 'Unknown');
            updateElement('second-email', top3[1].email || 'No email provided');
            updateElement('second-accuracy', `${top3[1].percentage || 0}%`);
            updateElement('second-time', this.formatTime(top3[1].timeTaken || 0));
        } else {
            updateElement('second-name', 'No Player Yet');
            updateElement('second-email', '-');
            updateElement('second-accuracy', '0%');
            updateElement('second-time', '0:00');
        }

        // Update third place
        if (top3.length >= 3) {
            updateElement('third-name', top3[2].name || 'Unknown');
            updateElement('third-email', top3[2].email || 'No email provided');
            updateElement('third-accuracy', `${top3[2].percentage || 0}%`);
            updateElement('third-time', this.formatTime(top3[2].timeTaken || 0));
        } else {
            updateElement('third-name', 'No Player Yet');
            updateElement('third-email', '-');
            updateElement('third-accuracy', '0%');
            updateElement('third-time', '0:00');
        }
    }

    updateLeaderboard() {
        const tableBody = document.getElementById('leaderboard-body');
        if (!tableBody) {
            console.error('Leaderboard table body not found');
            return;
        }

        // Show only players from rank 4 onwards (since top 3 are in podium)
        const remainingPlayers = this.filteredData.slice(3);

        if (remainingPlayers.length === 0) {
            const message = this.filteredData.length === 0 
                ? 'No data available. Play some quizzes to see the leaderboard!'
                : 'Only top 3 players are shown in the podium above.';
                
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="no-data">
                        <div>
                            <h3><i class="fas fa-info-circle"></i> ${this.filteredData.length === 0 ? 'No Players Found' : 'No Additional Players'}</h3>
                            <p>${message}</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = remainingPlayers.map((entry, index) => {
            const rank = index + 4; // Start from rank 4
            const isCurrentPlayer = this.isCurrentPlayer(entry);
            const currentPlayerClass = isCurrentPlayer ? 'current-player' : '';
            const youBadge = isCurrentPlayer ? '<span class="you-badge">YOU</span>' : '';
            
            // Determine accuracy bar class and color
            const percentage = entry.percentage || 0;
            let accuracyClass = 'low';
            if (percentage >= 80) accuracyClass = 'high';
            else if (percentage >= 60) accuracyClass = 'medium';

            const formattedTime = this.formatTime(entry.timeTaken || 0);
            const playerName = this.escapeHtml(entry.name || 'Unknown Player');
            const playerEmail = this.escapeHtml(entry.email || 'No email provided');

            return `
                <tr class="${currentPlayerClass}">
                    <td class="rank">${rank}</td>
                    <td class="name">${playerName}${youBadge}</td>
                    <td class="email">${playerEmail}</td>
                    <td class="accuracy">
                        ${percentage}%
                        <div class="accuracy-bar">
                            <div class="accuracy-fill ${accuracyClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                        </div>
                    </td>
                    <td class="time">${formattedTime}</td>
                </tr>
            `;
        }).join('');
    }

    isCurrentPlayer(entry) {
        if (!this.currentPlayer) return false;
        
        // Check if this entry matches the current player
        return entry.name === this.currentPlayer.name && 
               Math.abs(new Date(entry.date || entry.timestamp).getTime() - this.currentPlayer.timestamp) < 30000;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text.toString();
        return div.innerHTML;
    }

    exportData() {
        if (this.leaderboardData.length === 0) {
            alert('No data to export!');
            return;
        }

        const csvContent = this.convertToCSV(this.filteredData.length > 0 ? this.filteredData : this.leaderboardData);
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
            URL.revokeObjectURL(url);
            
            console.log('CSV exported successfully');
        }
    }

    convertToCSV(data) {
        const headers = [
            'Rank', 
            'Name', 
            'Email', 
            'Score', 
            'Total Questions', 
            'Percentage', 
            'Time Taken', 
            'Date'
        ];
        
        const csvRows = [headers.join(',')];
        
        data.forEach((entry, index) => {
            const row = [
                index + 1,
                `"${(entry.name || '').replace(/"/g, '""')}"`,
                `"${(entry.email || '').replace(/"/g, '""')}"`,
                entry.score || 0,
                entry.totalQuestions || entry.total || 10,
                entry.percentage || 0,
                `"${this.formatTime(entry.timeTaken || 0)}"`,
                `"${new Date(entry.date || entry.timestamp).toLocaleDateString()}"`
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }

    clearAllData() {
        const confirmMessage = 'Are you sure you want to clear all leaderboard data? This action cannot be undone.';
        
        if (confirm(confirmMessage)) {
            // Clear both possible localStorage keys
            localStorage.removeItem('quizLeaderboard');
            localStorage.removeItem('quizely-leaderboard');
            localStorage.removeItem('current-player');
            
            this.leaderboardData = [];
            this.filteredData = [];
            this.currentPlayer = null;
            
            this.updateDisplay();
            
            alert('All leaderboard data has been cleared successfully!');
            console.log('Leaderboard data cleared');
        }
    }

    backToGame() {
        // Always redirect to index.html
        window.location.href = 'index.html';
    }

    // Method to add test data for development/testing
    addTestData() {
        const testData = [
            {
                name: "Alice Johnson",
                email: "alice@example.com",
                score: 9,
                totalQuestions: 10,
                percentage: 90,
                timeTaken: "02:45",
                date: new Date().toISOString(),
                timestamp: Date.now() - 1000000
            },
            {
                name: "Bob Smith",
                email: "bob@example.com",
                score: 8,
                totalQuestions: 10,
                percentage: 80,
                timeTaken: "03:12",
                date: new Date().toISOString(),
                timestamp: Date.now() - 2000000
            },
            {
                name: "Carol Davis",
                email: "carol@example.com",
                score: 7,
                totalQuestions: 10,
                percentage: 70,
                timeTaken: "03:30",
                date: new Date().toISOString(),
                timestamp: Date.now() - 3000000
            },
            {
                name: "David Wilson",
                email: "david@example.com",
                score: 6,
                totalQuestions: 10,
                percentage: 60,
                timeTaken: "04:15",
                date: new Date().toISOString(),
                timestamp: Date.now() - 4000000
            },
            {
                name: "Eva Brown",
                email: "eva@example.com",
                score: 5,
                totalQuestions: 10,
                percentage: 50,
                timeTaken: "04:45",
                date: new Date().toISOString(),
                timestamp: Date.now() - 5000000
            }
        ];

        // Add test data to current data
        this.leaderboardData = [...this.leaderboardData, ...testData];
        this.sortLeaderboardData();
        
        // Save to localStorage
        localStorage.setItem('quizLeaderboard', JSON.stringify(this.leaderboardData));
        localStorage.setItem('quizely-leaderboard', JSON.stringify(this.leaderboardData));
        
        // Update display
        this.filteredData = [...this.leaderboardData];
        this.updateDisplay();
        
        console.log('Test data added to leaderboard');
        alert('Test data added successfully!');
    }
}

// Global leaderboard instance
let leaderboard;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing leaderboard...');
    leaderboard = new Leaderboard();
});

// Global functions for button clicks
function backToGame() {
    if (leaderboard) {
        leaderboard.backToGame();
    }
}

// Add a temporary test data button (remove this in production)
window.addEventListener('load', () => {
    // Only add test button if no data exists
    if (leaderboard && leaderboard.leaderboardData.length === 0) {
        const testButton = document.createElement('button');
        testButton.textContent = 'Add Test Data';
        testButton.className = 'action-btn';
        testButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 1000;
            background: #007bff;
            color: white;
            border: 2px solid #0056b3;
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
        `;
        testButton.onclick = () => {
            if (leaderboard) {
                leaderboard.addTestData();
                testButton.remove();
            }
        };
        document.body.appendChild(testButton);
    }
});