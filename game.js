class QuizGame {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.isAnswered = false;
        this.playerName = '';
        this.playerEmail = '';

        // Get elements that exist in your HTML
        this.questionEl = document.getElementById('question');
        this.answerButtonsEl = document.getElementById('answer-buttons');
        
        // Create missing elements or handle their absence
        this.nextBtn = document.getElementById('next-btn') || this.createNextButton();
        this.scoreEl = document.getElementById('score') || this.createScoreDisplay();
        this.currentQuestionEl = document.getElementById('current-question');
        this.totalQuestionsEl = document.getElementById('total-questions');
        this.gameOverEl = document.getElementById('game-over');
        this.questionContainerEl = document.getElementById('question-container') || document.querySelector('.question-container');

        // Set white background
        document.body.style.backgroundColor = 'white';
        document.body.style.fontFamily = 'Arial, sans-serif';

        this.showWelcomePopup();
    }

    showWelcomePopup() {
        const popup = document.createElement('div');
        popup.id = 'welcome-popup';
        popup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeIn 0.5s ease-in;
        `;

        popup.innerHTML = `
            <div style="
                background: white;
                padding: 40px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 400px;
                width: 90%;
                animation: slideIn 0.5s ease-out;
            ">
                <h2 style="color: #333; margin-bottom: 30px; font-size: 28px;">🎯 Welcome to Quiz Challenge!</h2>
                <p style="color: #666; margin-bottom: 25px; font-size: 16px;">Enter your details to start the quiz</p>
                
                <div style="margin-bottom: 20px; text-align: left;">
                    <label style="display: block; margin-bottom: 8px; color: #333; font-weight: bold;">Name:</label>
                    <input type="text" id="player-name" placeholder="Enter your name" style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #ddd;
                        border-radius: 8px;
                        font-size: 16px;
                        box-sizing: border-box;
                        transition: border-color 0.3s;
                    " />
                </div>
                
                <div style="margin-bottom: 30px; text-align: left;">
                    <label style="display: block; margin-bottom: 8px; color: #333; font-weight: bold;">Email:</label>
                    <input type="email" id="player-email" placeholder="Enter your email" style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #ddd;
                        border-radius: 8px;
                        font-size: 16px;
                        box-sizing: border-box;
                        transition: border-color 0.3s;
                    " />
                </div>
                
                <button id="start-quiz-btn" style="
                    background: linear-gradient(45deg, #333, #555);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 8px;
                    font-size: 18px;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    font-weight: bold;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(0,0,0,0.3)'" 
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                    Start Quiz 🚀
                </button>
                
                <div id="popup-error" style="
                    color: #dc3545;
                    margin-top: 15px;
                    font-size: 14px;
                    display: none;
                "></div>
            </div>
        `;

        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            #player-name:focus, #player-email:focus {
                border-color: #333 !important;
                outline: none;
                box-shadow: 0 0 0 3px rgba(51, 51, 51, 0.1);
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(popup);

        // Add event listener to start button
        document.getElementById('start-quiz-btn').addEventListener('click', () => {
            this.validateAndStartQuiz();
        });

        // Allow Enter key to submit
        popup.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.validateAndStartQuiz();
            }
        });
    }

    validateAndStartQuiz() {
        const nameInput = document.getElementById('player-name');
        const emailInput = document.getElementById('player-email');
        const errorDiv = document.getElementById('popup-error');
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        
        // Basic validation
        if (!name) {
            errorDiv.textContent = 'Please enter your name';
            errorDiv.style.display = 'block';
            nameInput.focus();
            return;
        }
        
        if (!email) {
            errorDiv.textContent = 'Please enter your email';
            errorDiv.style.display = 'block';
            emailInput.focus();
            return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errorDiv.textContent = 'Please enter a valid email address';
            errorDiv.style.display = 'block';
            emailInput.focus();
            return;
        }
        
        this.playerName = name;
        this.playerEmail = email;
        
        // Remove popup and show loading
        document.getElementById('welcome-popup').remove();
        this.showLoadingScreen();
    }

    showLoadingScreen() {
        const loading = document.createElement('div');
        loading.id = 'loading-screen';
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        loading.innerHTML = `
            <div style="text-align: center;">
                <div class="loading-spinner" style="
                    width: 60px;
                    height: 60px;
                    border: 6px solid #f0f0f0;
                    border-top: 6px solid #333;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 30px auto;
                "></div>
                <h2 style="color: #333; margin-bottom: 15px; font-size: 24px;">Loading Quiz...</h2>
                <p style="color: #666; font-size: 16px; margin-bottom: 10px;">Welcome, ${this.playerName}! 👋</p>
                <p style="color: #666; font-size: 14px;">Preparing your personalized quiz experience...</p>
                <div class="loading-dots" style="
                    margin-top: 20px;
                    font-size: 24px;
                    color: #333;
                    animation: dots 1.5s infinite;
                ">●●●</div>
            </div>
        `;

        // Add loading animations
        const loadingStyle = document.createElement('style');
        loadingStyle.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes dots {
                0%, 20% { opacity: 0; }
                50% { opacity: 1; }
                80%, 100% { opacity: 0; }
            }
        `;
        document.head.appendChild(loadingStyle);

        document.body.appendChild(loading);

        // Initialize quiz after loading animation
        setTimeout(() => {
            loading.remove();
            this.init();
        }, 3000);
    }

    createNextButton() {
        const nextBtn = document.createElement('button');
        nextBtn.id = 'next-btn';
        nextBtn.className = 'btn next-btn';
        nextBtn.textContent = 'Next Question';
        nextBtn.style.display = 'none';
        
        // Add it after the answer buttons
        this.answerButtonsEl.parentNode.appendChild(nextBtn);
        return nextBtn;
    }

    createScoreDisplay() {
        const scoreDiv = document.createElement('div');
        scoreDiv.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: white; padding: 15px; border: 2px solid #333; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
                <div style="font-weight: bold; color: #333; margin-bottom: 5px;">Score: <span id="score">0</span>/<span id="total">0</span></div>
                <div style="color: #666;">Question: <span id="current-q">1</span>/<span id="total-q">0</span></div>
            </div>
        `;
        document.body.appendChild(scoreDiv);
        
        this.currentQuestionEl = document.getElementById('current-q');
        this.totalQuestionsEl = document.getElementById('total-q');
        
        return document.getElementById('score');
    }

    async init() {
        console.log("🚀 Initializing QuizGame...");
        await this.fetchQuestions();
        
        if (this.questions.length > 0) {
            if (this.totalQuestionsEl) {
                this.totalQuestionsEl.textContent = this.questions.length;
            }
            document.getElementById('total').textContent = this.questions.length;
            this.showQuestion();
            this.nextBtn.addEventListener('click', () => this.nextQuestion());
        } else {
            this.questionEl.textContent = "Failed to load questions. Please refresh the page.";
        }
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
            
            // Process questions properly
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
            
            if (this.questionEl) {
                this.questionEl.textContent = `Error: ${error.message}`;
            }
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

    showQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.showGameOver();
            return;
        }

        const currentQuestion = this.questions[this.currentQuestionIndex];
        
        // Update question text
        this.questionEl.textContent = `${this.currentQuestionIndex + 1}. ${currentQuestion.question}`;
        
        // Update current question number
        if (this.currentQuestionEl) {
            this.currentQuestionEl.textContent = this.currentQuestionIndex + 1;
        }

        // Clear previous answers
        this.answerButtonsEl.innerHTML = '';
        this.selectedAnswer = null;
        this.isAnswered = false;
        
        // Hide next button
        if (this.nextBtn) {
            this.nextBtn.style.display = 'none';
        }

        // Create answer buttons
        currentQuestion.allAnswers.forEach(answer => {
            const button = document.createElement('button');
            button.textContent = answer;
            button.className = 'btn btn-answer';
            button.addEventListener('click', () =>
                this.selectAnswer(button, answer)
            );
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
            if (this.scoreEl) {
                this.scoreEl.textContent = this.score;
            }
            button.style.backgroundColor = '#28a745';
            button.style.color = 'white';
            console.log("✅ Correct answer!");
        } else {
            button.style.backgroundColor = '#dc3545';
            button.style.color = 'white';
            
            // Highlight correct answer
            Array.from(this.answerButtonsEl.children).forEach(btn => {
                if (btn.textContent === currentQuestion.correct) {
                    btn.style.backgroundColor = '#28a745';
                    btn.style.color = 'white';
                }
            });
            console.log("❌ Incorrect answer. Correct was:", currentQuestion.correct);
        }

        // Disable all buttons
        Array.from(this.answerButtonsEl.children).forEach(btn => {
            btn.disabled = true;
        });

        // Show next button or finish
        if (this.nextBtn) {
            if (this.currentQuestionIndex < this.questions.length - 1) {
                this.nextBtn.textContent = 'Next Question';
            } else {
                this.nextBtn.textContent = 'Show Results';
            }
            this.nextBtn.style.display = 'block';
        }
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        this.showQuestion();
    }

    showGameOver() {
        // Hide the score display
        const scoreDisplay = document.querySelector('[style*="position: fixed; top: 20px; right: 20px"]');
        if (scoreDisplay) {
            scoreDisplay.style.display = 'none';
        }

        this.createEnhancedGameOverScreen();
        const percentage = Math.round((this.score / this.questions.length) * 100);
        console.log(`🎯 Quiz completed! Score: ${this.score}/${this.questions.length} (${percentage}%)`);
    }

    createEnhancedGameOverScreen() {
        const percentage = Math.round((this.score / this.questions.length) * 100);
        
        let message = '';
        let emoji = '';
        if (percentage >= 80) {
            message = "Outstanding Performance!";
            emoji = "🏆";
        } else if (percentage >= 60) {
            message = 'Well Done!';
            emoji = "👏";
        } else if (percentage >= 40) {
            message = 'Good Effort!';
            emoji = "📚";
        } else {
            message = "Keep Practicing!";
            emoji = "💪";
        }

        const gameOverDiv = document.createElement('div');
        gameOverDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeIn 0.8s ease-in;
        `;

        gameOverDiv.innerHTML = `
            <div style="
                background: white;
                border: 3px solid #000;
                padding: 60px 40px;
                text-align: center;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 0 0 10px white, 0 0 0 13px #000;
                position: relative;
                animation: slideInScale 0.8s ease-out;
            ">
                <!-- Decorative corners -->
                <div style="position: absolute; top: 10px; left: 10px; width: 20px; height: 20px; border-left: 3px solid #000; border-top: 3px solid #000;"></div>
                <div style="position: absolute; top: 10px; right: 10px; width: 20px; height: 20px; border-right: 3px solid #000; border-top: 3px solid #000;"></div>
                <div style="position: absolute; bottom: 10px; left: 10px; width: 20px; height: 20px; border-left: 3px solid #000; border-bottom: 3px solid #000;"></div>
                <div style="position: absolute; bottom: 10px; right: 10px; width: 20px; height: 20px; border-right: 3px solid #000; border-bottom: 3px solid #000;"></div>
                
                <div style="font-size: 48px; margin-bottom: 20px; animation: bounce 2s infinite;">${emoji}</div>
                <h1 style="color: #000; margin-bottom: 10px; font-size: 32px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">QUIZ COMPLETE</h1>
                <h2 style="color: #000; margin-bottom: 30px; font-size: 24px; font-weight: normal;">${message}</h2>
                
                <!-- Player Info -->
                <div style="background: #f8f8f8; border: 2px solid #000; padding: 20px; margin-bottom: 30px; text-align: left;">
                    <div style="font-weight: bold; color: #000; margin-bottom: 5px;">Player: ${this.playerName}</div>
                    <div style="color: #666; font-size: 14px;">${this.playerEmail}</div>
                </div>
                
                <!-- Score Display -->
                <div style="margin-bottom: 30px;">
                    <div style="font-size: 48px; font-weight: bold; color: #000; margin-bottom: 10px;">
                        ${this.score}/${this.questions.length}
                    </div>
                    <div style="font-size: 24px; color: #000; font-weight: bold; background: ${percentage >= 80 ? '#000' : percentage >= 60 ? '#333' : '#666'}; color: white; padding: 10px 20px; display: inline-block;">
                        ${percentage}% CORRECT
                    </div>
                </div>
                
                <!-- Performance Breakdown -->
                <div style="background: #f8f8f8; border: 2px solid #000; padding: 20px; margin-bottom: 30px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-weight: bold; color: #000;">Correct Answers:</span>
                        <span style="color: #000;">${this.score}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-weight: bold; color: #000;">Wrong Answers:</span>
                        <span style="color: #000;">${this.questions.length - this.score}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="font-weight: bold; color: #000;">Total Questions:</span>
                        <span style="color: #000;">${this.questions.length}</span>
                    </div>
                </div>
                
                <!-- Progress Bar -->
                <div style="width: 100%; height: 20px; border: 2px solid #000; margin-bottom: 30px; overflow: hidden;">
                    <div style="
                        height: 100%;
                        width: ${percentage}%;
                        background: #000;
                        transition: width 1.5s ease-in-out;
                        animation: fillBar 1.5s ease-in-out;
                    "></div>
                </div>
                
                <button onclick="location.reload()" style="
                    background: #000;
                    color: white;
                    border: 3px solid #000;
                    padding: 15px 40px;
                    font-size: 18px;
                    font-weight: bold;
                    cursor: pointer;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    transition: all 0.3s;
                " onmouseover="this.style.background='white'; this.style.color='#000';" 
                   onmouseout="this.style.background='#000'; this.style.color='white';">
                    Play Again
                </button>
            </div>
        `;

        // Add enhanced animations
        const enhancedStyle = document.createElement('style');
        enhancedStyle.textContent = `
            @keyframes slideInScale {
                from { 
                    transform: scale(0.5) translateY(-100px); 
                    opacity: 0; 
                }
                to { 
                    transform: scale(1) translateY(0); 
                    opacity: 1; 
                }
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-20px);
                }
                60% {
                    transform: translateY(-10px);
                }
            }
            
            @keyframes fillBar {
                from { width: 0%; }
                to { width: ${percentage}%; }
            }
        `;
        document.head.appendChild(enhancedStyle);

        // Replace the entire page content
        document.body.innerHTML = '';
        document.body.appendChild(gameOverDiv);
    }
}

// Initialize the game when page loads
window.addEventListener('load', () => {
    console.log("🎮 Starting QuizGame...");
    new QuizGame();
});