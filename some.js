class QuizGame {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.isAnswered = false;
        this.playerName = '';
        this.playerEmail = '';
        this.startTime = null;
        this.endTime = null;

        // Get elements
        this.questionEl = document.getElementById('question');
        this.answerButtonsEl = document.getElementById('answer-buttons');
        this.nextBtn = document.getElementById('next-btn');
        this.currentQuestionEl = document.getElementById('current-question');
        this.totalQuestionsEl = document.getElementById('total-questions');
        this.currentScoreEl = document.getElementById('current-score');
        this.currentPlayerEl = document.getElementById('current-player');
    }

    async fetchQuestions() {
        console.log("📡 Fetching questions from API...");
        
        try {
            const response = await fetch("https://opentdb.com/api.php?amount=10&category=9&difficulty=medium&type=multiple");
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("✅ API Response:", data);
            
            if (data.response_code !== 0) {
                throw new Error(`API Error Code: ${data.response_code}`);
            }
            
            if (!data.results || data.results.length === 0) {
                throw new Error("No questions received from API");
            }
            
            this.questions = data.results.map(q => ({
                question: this.decodeHTML(q.question),
                correct: this.decodeHTML(q.correct_answer),
                incorrect: q.incorrect_answers.map(ans => this.decodeHTML(ans)),
                allAnswers: this.shuffleArray([
                    this.decodeHTML(q.correct_answer),
                    ...q.incorrect_answers.map(ans => this.decodeHTML(ans))
                ])
            }));
            
            console.log(`✅ Successfully processed ${this.questions.length} questions`);
            
        } catch (error) {
            console.error("❌ Error fetching questions:", error);
            this.questions = [];
            throw error;
        }
    }

    decodeHTML(html) {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    async startGame(playerName, playerEmail = '') {
        this.playerName = playerName;
        this.playerEmail = playerEmail;
        this.startTime = new Date();
        
        // Update UI
        this.currentPlayerEl.textContent = playerName;
        
        // Show loading screen
        showScreen('loading-screen');
        
        try {
            await this.fetchQuestions();
            
            // Simulate loading delay for better UX
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if (this.questions.length > 0) {
                this.totalQuestionsEl.textContent = this.questions.length;
                showScreen('quiz-screen');
                this.showQuestion();
                this.nextBtn.addEventListener('click', () => this.nextQuestion());
            } else {
                throw new Error("Failed to load questions");
            }
        } catch (error) {
            alert(`Error loading quiz: ${error.message}\nPlease try again.`);
            showScreen('welcome-screen');
        }
    }

    showQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.showGameOver();
            return;
        }

        const currentQuestion = this.questions[this.currentQuestionIndex];
        
        // Update question text
        this.questionEl.textContent = `${this.currentQuestionIndex + 1}. ${currentQuestion.question}`;
        
        // Update progress
        this.currentQuestionEl.textContent = this.currentQuestionIndex + 1;
        this.currentScoreEl.textContent = this.score;

        // Clear previous answers
        this.answerButtonsEl.innerHTML = '';
        this.selectedAnswer = null;
        this.isAnswered = false;
        
        // Hide next button
        this.nextBtn.style.display = 'none';
        this.nextBtn.classList.remove('show');

        // Create answer buttons
        currentQuestion.allAnswers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.textContent = answer;
            button.className = 'btn btn-answer';
            button.style.animationDelay = `${index * 0.1}s`;
            button.addEventListener('click', () => this.selectAnswer(button, answer));
            this.answerButtonsEl.appendChild(button);
        });
        
        console.log(`📝 Showing question ${this.currentQuestionIndex + 1}:`, currentQuestion.question);
    }

    selectAnswer(button, answer) {
        if (this.isAnswered) return;

        this.selectedAnswer = answer;
        this.isAnswered = true;

        const currentQuestion = this.questions[this.currentQuestionIndex];
        const isCorrect = answer === currentQuestion.correct;

        if (isCorrect) {
            this.score++;
            this.currentScoreEl.textContent = this.score;
            button.style.backgroundColor = '#000000';
            button.style.color = '#ffffff';
            button.style.transform = 'scale(1.05)';
            button.style.border = '3px solid #000000';
            console.log("✅ Correct answer!");
        } else {
            button.style.backgroundColor = '#666666';
            button.style.color = '#ffffff';
            button.style.border = '3px solid #666666';
            
            // Highlight correct answer
            Array.from(this.answerButtonsEl.children).forEach(btn => {
                if (btn.textContent === currentQuestion.correct) {
                    btn.style.backgroundColor = '#000000';
                    btn.style.color = '#ffffff';
                    btn.style.transform = 'scale(1.05)';
                    btn.style.border = '3px solid #000000';
                }
            });
            console.log("❌ Incorrect answer. Correct was:", currentQuestion.correct);
        }

        // Disable all buttons
        Array.from(this.answerButtonsEl.children).forEach(btn => {
            btn.disabled = true;
        });

        // Show next button
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.nextBtn.textContent = 'NEXT QUESTION';
        } else {
            this.nextBtn.textContent = 'SHOW RESULTS';
        }
        this.nextBtn.style.display = 'block';
        this.nextBtn.classList.add('show');
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        this.showQuestion();
    }

    showGameOver() {
        this.endTime = new Date();
        const timeTaken = Math.round((this.endTime - this.startTime) / 1000);
        const percentage = Math.round((this.score / this.questions.length) * 100);

        // Save to leaderboard
        this.saveToLeaderboard(timeTaken, percentage);

        // Update game over screen
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-total').textContent = this.questions.length;
        document.getElementById('final-player').textContent = this.playerName;

        let message = '';
        if (percentage >= 80) {
            message = "🏆 Excellent! You're a quiz master!";
        } else if (percentage >= 60) {
            message = '👍 Good job! Keep it up!';
        } else if (percentage >= 40) {
            message = '📚 Not bad! Room for improvement.';
        } else {
            message = "💪 Keep practicing! You'll get better.";
        }

        document.getElementById('final-message').textContent = message;

        showScreen('game-over-screen');
        console.log(`🎯 Quiz completed! Score: ${this.score}/${this.questions.length} (${percentage}%) in ${timeTaken}s`);
    }

    saveToLeaderboard(timeTaken, percentage) {
        const leaderboardData = {
            name: this.playerName,
            email: this.playerEmail,
            score: this.score,
            total: this.questions.length,
            percentage: percentage,
            timeTaken: timeTaken,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };

        // Get existing leaderboard data
        let leaderboard = JSON.parse(localStorage.getItem('quizely-leaderboard') || '[]');
        
        // Add new entry
        leaderboard.push(leaderboardData);
        
        // Sort by score (desc) then by time (asc)
        leaderboard.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return a.timeTaken - b.timeTaken;
        });

        // Keep only top 100 entries
        leaderboard = leaderboard.slice(0, 100);

        // Save back to localStorage
        localStorage.setItem('quizely-leaderboard', JSON.stringify(leaderboard));
        
        console.log('💾 Saved to leaderboard:', leaderboardData);
    }

    restart() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.isAnswered = false;
        this.questions = [];
        showScreen('welcome-screen');
    }
}

// Global game instance
let game = null;

// Screen management
function showScreen(screenId) {
    const screens = ['welcome-screen', 'loading-screen', 'quiz-screen', 'game-over-screen'];
    screens.forEach(screen => {
        const element = document.getElementById(screen);
        if (element) {
            element.style.display = 'none';
        }
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.style.display = screenId === 'loading-screen' ? 'flex' : 'block';
    }
}

// Modal functions
function showModal() {
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('player-name').focus();
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('player-name').value = '';
    document.getElementById('player-email').value = '';
}

function startQuiz() {
    const name = document.getElementById('player-name').value.trim();
    const email = document.getElementById('player-email').value.trim();

    if (!name) {
        alert('Name is required!');
        document.getElementById('player-name').focus();
        return;
    }

    closeModal();
    game = new QuizGame();
    game.startGame(name, email);
}

function nextQuestion() {
    if (game) {
        game.nextQuestion();
    }
}

function restartGame() {
    if (game) {
        game.restart();
    }
}

function viewLeaderboard() {
    // Store current player data for highlighting
    if (game) {
        localStorage.setItem('current-player', JSON.stringify({
            name: game.playerName,
            timestamp: game.endTime.getTime()
        }));
    }
    
    // Open leaderboard page
    window.open('leaderboard.html', '_blank');
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const modal = document.getElementById('modal-overlay');
        if (modal && modal.style.display === 'flex') {
            startQuiz();
        }
    }
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Initialize welcome screen on page load
document.addEventListener('DOMContentLoaded', () => {
    showScreen('welcome-screen');
});

// Also handle window load event as backup
window.addEventListener('load', () => {
    showScreen('welcome-screen');
});