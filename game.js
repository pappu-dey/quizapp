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

        // Set up full screen black and white theme
        this.setupGlobalStyles();
        this.showWelcomePopup();
    }

    setupGlobalStyles() {
        // Remove any existing styles and set clean black/white theme with color coding
        const style = document.createElement('style');
        style.textContent = `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            html, body {
                height: 100%;
                width: 100%;
                overflow-x: hidden;
            }
            
            body {
                background-color: #ffffff !important;
                color: #000000 !important;
                font-family: 'Source Code Pro', 'Courier New', monospace !important;
                line-height: 1.6;
                font-size: 16px;
            }
            
            /* Enhanced Answer Button Styles */
            .btn-answer {
                transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
                position: relative;
                overflow: hidden;
            }
            
            .btn-answer::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                transition: left 0.4s ease;
                z-index: -1;
            }
            
            /* Correct Answer - Green */
            .btn-answer.correct {
                background-color: #22c55e !important;
                color: #ffffff !important;
                border-color: #16a34a !important;
                box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4) !important;
                transform: translateY(-3px) scale(1.02) !important;
                font-weight: 700 !important;
            }
            
            .btn-answer.correct::before {
                background: linear-gradient(45deg, #22c55e, #16a34a);
                left: 0;
            }
            
            /* Wrong Answer - Red */
            .btn-answer.incorrect {
                background-color: #ef4444 !important;
                color: #ffffff !important;
                border-color: #dc2626 !important;
                box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4) !important;
                transform: translateY(-2px) scale(0.98) !important;
                opacity: 0.8 !important;
            }
            
            .btn-answer.incorrect::before {
                background: linear-gradient(45deg, #ef4444, #dc2626);
                left: 0;
            }
            
            /* Selected but not yet revealed */
            .btn-answer.selected {
                background-color: #2e353fff !important;
                color: #ffffff !important;
                border-color: #1c2027ff !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3) !important;
            }
            
            /* Hover effects for non-disabled buttons */
            .btn-answer:not(:disabled):hover {
                transform: translateY(-3px) !important;
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15) !important;
            }
            
            /* Disabled state */
            .btn-answer:disabled {
                cursor: not-allowed !important;
                pointer-events: none;
            }
            
            /* Animation for correct answer reveal */
            @keyframes correctPulse {
                0% { transform: translateY(-3px) scale(1.02); }
                50% { transform: translateY(-3px) scale(1.05); }
                100% { transform: translateY(-3px) scale(1.02); }
            }
            
            .btn-answer.correct {
                animation: correctPulse 0.6s ease-in-out;
            }
            
            /* Animation for incorrect answer */
            @keyframes incorrectShake {
                0%, 100% { transform: translateY(-2px) scale(0.98) translateX(0); }
                25% { transform: translateY(-2px) scale(0.98) translateX(-3px); }
                75% { transform: translateY(-2px) scale(0.98) translateX(3px); }
            }
            
            .btn-answer.incorrect {
                animation: incorrectShake 0.5s ease-in-out;
            }
            
            /* Score display enhancements */
            .score-highlight {
                background: linear-gradient(45deg, #22c55e, #16a34a) !important;
                color: white !important;
                padding: 0.2rem 0.6rem !important;
                border-radius: 4px !important;
                animation: scoreUpdate 0.5s ease-out !important;
            }
            
            @keyframes scoreUpdate {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            
            @media (max-width: 768px) {
                body {
                    font-size: 14px;
                }
                
                .btn-answer.correct,
                .btn-answer.incorrect {
                    transform: translateY(-1px) scale(1.01) !important;
                }
            }
            
            /* Enhanced visual feedback */
            .question-container.answered {
                animation: questionComplete 0.6s ease-out;
            }
            
            @keyframes questionComplete {
                0% { opacity: 1; }
                50% { opacity: 0.8; }
                100% { opacity: 1; }
            }
            
            /* Next button enhancement */
            .next-btn.show {
                animation: slideInUp 0.5s ease-out !important;
            }
            
            @keyframes slideInUp {
                from {
                    transform: translateY(30px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    showWelcomePopup() {
        const popup = document.createElement('div');
        popup.id = 'welcome-popup';
        popup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #ffffff;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.6s ease-in;
        `;

        popup.innerHTML = `
            <div class="welcome-container" style="
                background: #ffffff;
                border: 4px solid #000000;
                padding: 3rem;
                text-align: center;
                max-width: 90vw;
                max-height: 90vh;
                width: 100%;
                max-width: 600px;
                position: relative;
                animation: slideInScale 0.8s ease-out;
                overflow-y: auto;
            ">
                <!-- Header -->
                <div class="welcome-header" style="
                    border-bottom: 3px solid #000000;
                    padding-bottom: 2rem;
                    margin-bottom: 2.5rem;
                ">
                    <h1 style="
                        color: #000000;
                        margin-bottom: 1rem;
                        font-size: clamp(2rem, 5vw, 3rem);
                        font-weight: 900;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        line-height: 1.2;
                    ">QUIZ CHALLENGE</h1>
                    <p style="
                        color: #000000;
                        font-size: clamp(1rem, 3vw, 1.2rem);
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    ">ENTER YOUR DETAILS TO BEGIN</p>
                </div>
                
                <!-- Form Section -->
                <div class="form-section" style="
                    margin-bottom: 2.5rem;
                ">
                    <div class="input-group" style="
                        margin-bottom: 2rem;
                        text-align: left;
                    ">
                        <label style="
                            display: block;
                            margin-bottom: 0.8rem;
                            color: #000000;
                            font-weight: 700;
                            font-size: 1rem;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                        ">FULL NAME:</label>
                        <input type="text" id="player-name" placeholder="Enter your full name" style="
                            width: 100%;
                            padding: 1rem 1.2rem;
                            border: 3px solid #000000;
                            background: #ffffff;
                            color: #000000;
                            font-size: 1.1rem;
                            font-weight: 500;
                            font-family: 'Source Code Pro', monospace;
                            transition: all 0.3s ease;
                            outline: none;
                        " />
                    </div>
                    
                    <div class="input-group" style="
                        margin-bottom: 2rem;
                        text-align: left;
                    ">
                        <label style="
                            display: block;
                            margin-bottom: 0.8rem;
                            color: #000000;
                            font-weight: 700;
                            font-size: 1rem;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                        ">EMAIL ADDRESS:</label>
                        <input type="email" id="player-email" placeholder="Enter your email address" style="
                            width: 100%;
                            padding: 1rem 1.2rem;
                            border: 3px solid #000000;
                            background: #ffffff;
                            color: #000000;
                            font-size: 1.1rem;
                            font-weight: 500;
                            font-family: 'Source Code Pro', monospace;
                            transition: all 0.3s ease;
                            outline: none;
                        " />
                    </div>
                    
                    <div id="popup-error" style="
                        background: #ef4444;
                        color: #ffffff;
                        padding: 1rem;
                        margin-bottom: 1.5rem;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        display: none;
                        text-align: center;
                        border: 2px solid #dc2626;
                    "></div>
                </div>
                
                <!-- Action Button -->
                <button id="start-quiz-btn" style="
                    background: #000000;
                    color: #ffffff;
                    border: 3px solid #000000;
                    padding: 1.2rem 2.5rem;
                    font-size: 1.2rem;
                    font-weight: 700;
                    font-family: 'Source Code Pro', monospace;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    width: 100%;
                    max-width: 300px;
                " onmouseover="
                    this.style.background='#ffffff'; 
                    this.style.color='#000000';
                    this.style.transform='translateY(-3px)';
                    this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)';
                " onmouseout="
                    this.style.background='#000000'; 
                    this.style.color='#ffffff';
                    this.style.transform='translateY(0)';
                    this.style.boxShadow='none';
                ">
                    START QUIZ
                </button>
                
                <!-- Footer Info -->
                <div style="
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 2px solid #000000;
                    color: #000000;
                    font-size: 0.9rem;
                    font-weight: 500;
                ">
                    <p>10 Questions • Multiple Choice • Medium Difficulty</p>
                    <p style="margin-top: 0.5rem; color: #666;">
                        <span style="color: #22c55e;">■</span> Correct Answer
                        <span style="color: #ef4444; margin-left: 1rem;">■</span> Wrong Answer
                    </p>
                </div>
            </div>
        `;

        // Enhanced CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideInScale {
                0% { 
                    transform: scale(0.8) translateY(-50px); 
                    opacity: 0; 
                }
                100% { 
                    transform: scale(1) translateY(0); 
                    opacity: 1; 
                }
            }
            
            #player-name:focus, #player-email:focus {
                background: #f8f8f8 !important;
                box-shadow: 0 0 0 2px #000000 !important;
                transform: scale(1.02);
            }
            
            @media (max-width: 768px) {
                .welcome-container {
                    padding: 2rem 1.5rem !important;
                    border-width: 3px !important;
                }
                
                .input-group {
                    margin-bottom: 1.5rem !important;
                }
                
                #start-quiz-btn {
                    padding: 1rem 2rem !important;
                    font-size: 1.1rem !important;
                }
            }
            
            @media (max-width: 480px) {
                .welcome-container {
                    padding: 1.5rem 1rem !important;
                    margin: 1rem;
                }
                
                .welcome-header {
                    padding-bottom: 1.5rem !important;
                    margin-bottom: 2rem !important;
                }
                
                .form-section {
                    margin-bottom: 2rem !important;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(popup);

        // Event listeners
        document.getElementById('start-quiz-btn').addEventListener('click', () => {
            this.validateAndStartQuiz();
        });

        popup.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.validateAndStartQuiz();
            }
        });

        // Focus on first input
        setTimeout(() => {
            document.getElementById('player-name').focus();
        }, 500);
    }

    validateAndStartQuiz() {
        const nameInput = document.getElementById('player-name');
        const emailInput = document.getElementById('player-email');
        const errorDiv = document.getElementById('popup-error');
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        
        // Reset error display
        errorDiv.style.display = 'none';
        
        // Validation
        if (!name) {
            this.showError('PLEASE ENTER YOUR FULL NAME', errorDiv, nameInput);
            return;
        }
        
        if (name.length < 2) {
            this.showError('NAME MUST BE AT LEAST 2 CHARACTERS', errorDiv, nameInput);
            return;
        }
        
        if (!email) {
            this.showError('PLEASE ENTER YOUR EMAIL ADDRESS', errorDiv, emailInput);
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('PLEASE ENTER A VALID EMAIL ADDRESS', errorDiv, emailInput);
            return;
        }
        
        this.playerName = name;
        this.playerEmail = email;
        
        document.getElementById('welcome-popup').remove();
        this.showLoadingScreen();
    }

    showError(message, errorDiv, inputElement) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        inputElement.focus();
        
        // Add shake animation to the input
        inputElement.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            inputElement.style.animation = '';
        }, 500);
        
        // Add shake animation CSS if not exists
        if (!document.querySelector('#shake-animation')) {
            const shakeStyle = document.createElement('style');
            shakeStyle.id = 'shake-animation';
            shakeStyle.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(shakeStyle);
        }
    }

    showLoadingScreen() {
        const loading = document.createElement('div');
        loading.id = 'loading-screen';
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        loading.innerHTML = `
            <div style="text-align: center; max-width: 90vw;">
                <!-- Loading Animation -->
                <div class="loading-container" style="
                    margin-bottom: 3rem;
                    position: relative;
                ">
                    <div class="loading-spinner" style="
                        width: 80px;
                        height: 80px;
                        border: 6px solid #f0f0f0;
                        border-top: 6px solid #000000;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto;
                    "></div>
                </div>
                
                <!-- Loading Text -->
                <div class="loading-text" style="
                    border: 3px solid #000000;
                    padding: 2rem;
                    background: #ffffff;
                    max-width: 500px;
                    margin: 0 auto;
                ">
                    <h2 style="
                        color: #000000;
                        margin-bottom: 1rem;
                        font-size: clamp(1.8rem, 4vw, 2.5rem);
                        font-weight: 900;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                    ">PREPARING QUIZ</h2>
                    
                    <p style="
                        color: #000000;
                        font-size: clamp(1.1rem, 3vw, 1.3rem);
                        margin-bottom: 1rem;
                        font-weight: 600;
                    ">WELCOME, ${this.playerName.toUpperCase()}</p>
                    
                    <div class="progress-info" style="
                        color: #000000;
                        font-size: 1rem;
                        font-weight: 500;
                        line-height: 1.8;
                    ">
                        <p>• LOADING QUESTIONS...</p>
                        <p>• SETTING UP GAME ENGINE...</p>
                        <p>• OPTIMIZING FOR YOUR DEVICE...</p>
                        <p style="color: #22c55e;">• GREEN = CORRECT ANSWER</p>
                        <p style="color: #ef4444;">• RED = WRONG ANSWER</p>
                    </div>
                    
                    <div class="loading-dots" style="
                        margin-top: 1.5rem;
                        font-size: 2rem;
                        color: #000000;
                        font-weight: 900;
                        animation: dots 1.5s infinite;
                    ">●●●</div>
                </div>
            </div>
        `;

        const loadingStyle = document.createElement('style');
        loadingStyle.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes dots {
                0%, 33% { opacity: 1; }
                34%, 66% { opacity: 0.3; }
                67%, 100% { opacity: 1; }
            }
            
            @media (max-width: 768px) {
                .loading-text {
                    padding: 1.5rem 1rem !important;
                    margin: 0 1rem !important;
                }
                
                .loading-container {
                    margin-bottom: 2rem !important;
                }
            }
        `;
        document.head.appendChild(loadingStyle);

        document.body.appendChild(loading);

        setTimeout(() => {
            loading.remove();
            this.init();
        }, 3500);
    }

    createNextButton() {
        const nextBtn = document.createElement('button');
        nextBtn.id = 'next-btn';
        nextBtn.className = 'btn next-btn';
        nextBtn.textContent = 'NEXT QUESTION';
        nextBtn.style.display = 'none';
        
        this.answerButtonsEl.parentNode.appendChild(nextBtn);
        return nextBtn;
    }

    createScoreDisplay() {
        const scoreDiv = document.createElement('div');
        scoreDiv.innerHTML = `
            <div style="
                position: fixed; 
                top: 2rem; 
                right: 2rem; 
                background: #ffffff; 
                border: 3px solid #000000; 
                padding: 1.5rem;
                font-family: 'Source Code Pro', monospace;
                z-index: 1000;
                min-width: 200px;
            ">
                <div style="
                    font-weight: 900; 
                    color: #000000; 
                    margin-bottom: 0.5rem;
                    font-size: 1.1rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                ">SCORE: <span id="score">0</span>/<span id="total">0</span></div>
                <div style="
                    color: #000000;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                ">QUESTION: <span id="current-q">1</span>/<span id="total-q">0</span></div>
            </div>
        `;
        document.body.appendChild(scoreDiv);
        
        this.currentQuestionEl = document.getElementById('current-q');
        this.totalQuestionsEl = document.getElementById('total-q');
        
        return document.getElementById('score');
    }

    async init() {
        this.startTime = new Date();
        console.log("Initializing QuizGame...");
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
        console.log("Fetching questions from API...");
        
        try {
            const response = await fetch("https://opentdb.com/api.php?amount=10&category=9&difficulty=medium&type=multiple");
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("API Response:", data);
            
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
            
            console.log(`Successfully processed ${this.questions.length} questions`);
            
        } catch (error) {
            console.error("Error fetching questions:", error);
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
        
        this.questionEl.textContent = `${this.currentQuestionIndex + 1}. ${currentQuestion.question}`;
        
        if (this.currentQuestionEl) {
            this.currentQuestionEl.textContent = this.currentQuestionIndex + 1;
        }

        this.answerButtonsEl.innerHTML = '';
        this.selectedAnswer = null;
        this.isAnswered = false;
        
        if (this.nextBtn) {
            this.nextBtn.style.display = 'none';
            this.nextBtn.classList.remove('show');
        }

        // Remove answered class from question container
        if (this.questionContainerEl) {
            this.questionContainerEl.classList.remove('answered');
        }

        currentQuestion.allAnswers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.textContent = answer;
            button.className = 'btn btn-answer';
            button.style.animationDelay = `${index * 0.1}s`;
            button.addEventListener('click', () => this.selectAnswer(button, answer));
            this.answerButtonsEl.appendChild(button);
        });
        
        console.log(`Showing question ${this.currentQuestionIndex + 1}:`, currentQuestion.question);
    }

    selectAnswer(button, answer) {
        if (this.isAnswered) return;

        // Add selected class immediately
        button.classList.add('selected');
        
        this.selectedAnswer = answer;
        this.isAnswered = true;

        const currentQuestion = this.questions[this.currentQuestionIndex];
        const isCorrect = answer === currentQuestion.correct;

        // Short delay before revealing answer for better UX
        setTimeout(() => {
            this.revealAnswer(button, answer, currentQuestion, isCorrect);
        }, 800);
    }

    revealAnswer(selectedButton, selectedAnswer, currentQuestion, isCorrect) {
        // Remove selected class
        selectedButton.classList.remove('selected');
        
        if (isCorrect) {
            this.score++;
            if (this.scoreEl) {
                this.scoreEl.textContent = this.score;
                this.scoreEl.classList.add('score-highlight');
                setTimeout(() => {
                    this.scoreEl.classList.remove('score-highlight');
                }, 600);
            }
            
            selectedButton.classList.add('correct');
            console.log("Correct answer!");
        } else {
            selectedButton.classList.add('incorrect');
            
            // Highlight correct answer
            Array.from(this.answerButtonsEl.children).forEach(btn => {
                if (btn.textContent === currentQuestion.correct) {
                    btn.classList.add('correct');
                }
            });
            console.log("Incorrect answer. Correct was:", currentQuestion.correct);
        }

        // Disable all buttons with enhanced visual feedback
        Array.from(this.answerButtonsEl.children).forEach(btn => {
            btn.disabled = true;
            if (!btn.classList.contains('correct') && !btn.classList.contains('incorrect')) {
                btn.style.opacity = '0.6';
                btn.style.transform = 'scale(0.98)';
            }
        });

        // Add answered class to question container
        if (this.questionContainerEl) {
            this.questionContainerEl.classList.add('answered');
        }

        // Show next button with enhanced animation
        setTimeout(() => {
            if (this.nextBtn) {
                if (this.currentQuestionIndex < this.questions.length - 1) {
                    this.nextBtn.textContent = 'NEXT QUESTION';
                } else {
                    this.nextBtn.textContent = 'SHOW RESULTS';
                }
                this.nextBtn.style.display = 'block';
                this.nextBtn.classList.add('show');
            }
        }, 1000);
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        this.showQuestion();
    }

    showGameOver() {
        this.endTime = new Date();
        const scoreDisplay = document.querySelector('[style*="position: fixed; top: 2rem; right: 2rem"]');
        if (scoreDisplay) {
            scoreDisplay.style.display = 'none';
        }

        this.createEnhancedGameOverScreen();
        const percentage = Math.round((this.score / this.questions.length) * 100);
        console.log(`Quiz completed! Score: ${this.score}/${this.questions.length} (${percentage}%)`);
    }

    getTimeTaken() {
        if (this.startTime && this.endTime) {
            const timeDiff = Math.floor((this.endTime - this.startTime) / 1000);
            const minutes = Math.floor(timeDiff / 60);
            const seconds = timeDiff % 60;
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return '00:00';
    }

    saveToLeaderboard() {
        const playerData = {
            id: Date.now() + Math.random(),
            name: this.playerName,
            email: this.playerEmail,
            score: this.score,
            totalQuestions: this.questions.length,
            percentage: Math.round((this.score / this.questions.length) * 100),
            timeTaken: this.getTimeTaken(),
            date: new Date().toISOString(),
            timestamp: Date.now(),
            rank: this.getRank(Math.round((this.score / this.questions.length) * 100))
        };

        // Get existing leaderboard data (try both storage keys for compatibility)
        let leaderboard = [];
        try {
            let existing = localStorage.getItem('quizLeaderboard');
            if (!existing) {
                existing = localStorage.getItem('quizely-leaderboard');
            }
            if (existing) {
                leaderboard = JSON.parse(existing);
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        }

        // Add new score
        leaderboard.push(playerData);

        // Sort by percentage (desc), then by time taken (asc) for same percentage
        leaderboard.sort((a, b) => {
            if (b.percentage !== a.percentage) {
                return b.percentage - a.percentage;
            }
            
            // Handle time comparison (both string MM:SS and seconds formats)
            const timeA = this.parseTimeToSeconds(a.timeTaken);
            const timeB = this.parseTimeToSeconds(b.timeTaken);
            return timeA - timeB;
        });

        // Keep only top 100 scores
        leaderboard = leaderboard.slice(0, 100);

        // Save to both storage keys for maximum compatibility
        try {
            localStorage.setItem('quizLeaderboard', JSON.stringify(leaderboard));
            localStorage.setItem('quizely-leaderboard', JSON.stringify(leaderboard));
            console.log('Score saved to leaderboard!');
        } catch (error) {
            console.error('Error saving to leaderboard:', error);
        }

        return playerData;
    }

    parseTimeToSeconds(timeStr) {
        if (typeof timeStr === 'number') {
            return timeStr;
        }
        if (typeof timeStr === 'string' && timeStr.includes(':')) {
            const [minutes, seconds] = timeStr.split(':').map(Number);
            return (minutes * 60) + seconds;
        }
        return parseInt(timeStr) || 0;
    }

    getRank(percentage) {
        if (percentage >= 90) return "GRANDMASTER";
        if (percentage >= 80) return "MASTER";
        if (percentage >= 70) return "ELITE";
        if (percentage >= 60) return "APPRENTICE";
        return "NOVICE";
    }

    createEnhancedGameOverScreen() {
        const percentage = Math.round((this.score / this.questions.length) * 100);
        const timeTaken = this.getTimeTaken();
        
        let message = '';
        let messageColor = '#000000';
        let rank = '';
        
        if (percentage >= 90) {
            message = "OUTSTANDING PERFORMANCE";
            rank = "GRANDMASTER";
            messageColor = '#22c55e';
        } else if (percentage >= 80) {
            message = "EXCELLENT WORK";
            rank = "MASTER";
            messageColor = '#3b82f6';
        } else if (percentage >= 70) {
            message = "WELL DONE";
            rank = "ELITE";
            messageColor = '#f59e0b';
        } else if (percentage >= 60) {
            message = "GOOD EFFORT";
            rank = "APPRENTICE";
            messageColor = '#8b5cf6';
        } else {
            message = "KEEP PRACTICING";
            rank = "NOVICE";
            messageColor = '#ef4444';
        }

        // Save to leaderboard
        const playerData = this.saveToLeaderboard();

        const gameOverDiv = document.createElement('div');
        gameOverDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #ffffff;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.8s ease-in;
            overflow-y: auto;
            padding: 2rem 1rem;
        `;

        gameOverDiv.innerHTML = `
            <div class="results-container" style="
                background: #ffffff;
                border: 4px solid #000000;
                padding: 3rem 2rem;
                text-align: center;
                max-width: 700px;
                width: 100%;
                position: relative;
                animation: slideInScale 0.8s ease-out;
                margin: auto;
            ">
                <!-- Header Section -->
                <div class="results-header" style="
                    border-bottom: 3px solid #000000;
                    padding-bottom: 2rem;
                    margin-bottom: 2rem;
                ">
                    <h1 style="
                        color: #000000;
                        margin-bottom: 1rem;
                        font-size: clamp(2rem, 6vw, 3.5rem);
                        font-weight: 900;
                        text-transform: uppercase;
                        letter-spacing: 3px;
                        line-height: 1.1;
                    ">QUIZ COMPLETE</h1>
                    
                    <div style="
                        background: ${messageColor};
                        color: #ffffff;
                        padding: 1rem 2rem;
                        font-size: clamp(1.2rem, 4vw, 1.8rem);
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        margin: 0 auto;
                        max-width: 400px;
                        border: 3px solid ${messageColor};
                    ">${message}</div>
                </div>
                
                <!-- Player Info Section -->
                <div class="player-info" style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    text-align: left;
                ">
                    <div style="
                        border: 2px solid #000000;
                        padding: 1.5rem;
                        background: #ffffff;
                    ">
                        <h3 style="
                            color: #000000;
                            font-size: 0.9rem;
                            font-weight: 700;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            margin-bottom: 0.5rem;
                        ">PLAYER</h3>
                        <p style="
                            color: #000000;
                            font-size: 1.1rem;
                            font-weight: 600;
                            word-break: break-word;
                        ">${this.playerName}</p>
                    </div>
                    
                    <div style="
                        border: 2px solid #000000;
                        padding: 1.5rem;
                        background: linear-gradient(135deg, ${messageColor}22, #ffffff);
                        border-color: ${messageColor};
                    ">
                        <h3 style="
                            color: #000000;
                            font-size: 0.9rem;
                            font-weight: 700;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            margin-bottom: 0.5rem;
                        ">RANK</h3>
                        <p style="
                            color: ${messageColor};
                            font-size: 1.1rem;
                            font-weight: 900;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                        ">${rank}</p>
                    </div>
                </div>
                
                <!-- Main Score Section -->
                <div class="score-display" style="
                    background: linear-gradient(135deg, #000000, #333333);
                    color: #ffffff;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    text-align: center;
                    border: 3px solid #000000;
                ">
                    <div style="
                        font-size: clamp(3rem, 8vw, 5rem);
                        font-weight: 900;
                        margin-bottom: 0.5rem;
                        line-height: 1;
                    ">${this.score}/${this.questions.length}</div>
                    
                    <div style="
                        font-size: clamp(1.5rem, 5vw, 2.5rem);
                        font-weight: 900;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        margin-bottom: 1rem;
                        color: ${percentage >= 80 ? '#22c55e' : percentage >= 60 ? '#f59e0b' : '#ef4444'};
                    ">${percentage}% CORRECT</div>
                    
                    <div style="
                        font-size: 1.2rem;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    ">TIME: ${timeTaken}</div>
                </div>
                
                <!-- Enhanced Stats Section -->
                <div class="stats-section" style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                ">
                    <div style="
                        border: 2px solid #22c55e;
                        padding: 1rem;
                        text-align: center;
                        background: linear-gradient(135deg, #22c55e22, #ffffff);
                    ">
                        <div style="
                            font-size: 2rem;
                            font-weight: 900;
                            color: #22c55e;
                            margin-bottom: 0.5rem;
                        ">${this.score}</div>
                        <div style="
                            font-size: 0.8rem;
                            font-weight: 600;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            color: #000000;
                        ">CORRECT</div>
                    </div>
                    
                    <div style="
                        border: 2px solid #ef4444;
                        padding: 1rem;
                        text-align: center;
                        background: linear-gradient(135deg, #ef444422, #ffffff);
                    ">
                        <div style="
                            font-size: 2rem;
                            font-weight: 900;
                            color: #ef4444;
                            margin-bottom: 0.5rem;
                        ">${this.questions.length - this.score}</div>
                        <div style="
                            font-size: 0.8rem;
                            font-weight: 600;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            color: #000000;
                        ">INCORRECT</div>
                    </div>
                    
                    <div style="
                        border: 2px solid #3b82f6;
                        padding: 1rem;
                        text-align: center;
                        background: linear-gradient(135deg, #3b82f622, #ffffff);
                    ">
                        <div style="
                            font-size: 2rem;
                            font-weight: 900;
                            color: #3b82f6;
                            margin-bottom: 0.5rem;
                        ">${timeTaken}</div>
                        <div style="
                            font-size: 0.8rem;
                            font-weight: 600;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            color: #000000;
                        ">DURATION</div>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="action-buttons" style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 2rem;
                ">
                    <button id="play-again-btn" style="
                        background: #ffffff;
                        color: #000000;
                        border: 3px solid #000000;
                        padding: 1.2rem 2rem;
                        font-size: 1.1rem;
                        font-weight: 700;
                        font-family: 'Source Code Pro', monospace;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    " onmouseover="
                        this.style.background='#000000';
                        this.style.color='#ffffff';
                        this.style.transform='translateY(-2px)';
                    " onmouseout="
                        this.style.background='#ffffff';
                        this.style.color='#000000';
                        this.style.transform='translateY(0)';
                    ">
                        PLAY AGAIN
                    </button>
                    
                    <button id="view-leaderboard-btn" style="
                        background: #000000;
                        color: #ffffff;
                        border: 3px solid #000000;
                        padding: 1.2rem 2rem;
                        font-size: 1.1rem;
                        font-weight: 700;
                        font-family: 'Source Code Pro', monospace;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    " onmouseover="
                        this.style.background='#ffffff';
                        this.style.color='#000000';
                        this.style.transform='translateY(-2px)';
                    " onmouseout="
                        this.style.background='#000000';
                        this.style.color='#ffffff';
                        this.style.transform='translateY(0)';
                    ">
                        LEADERBOARD
                    </button>
                </div>
                
                <!-- Footer -->
                <div style="
                    border-top: 2px solid #000000;
                    padding-top: 1.5rem;
                    color: #000000;
                    font-size: 0.9rem;
                    font-weight: 500;
                ">
                    <p style="margin-bottom: 0.5rem;">
                        <span style="color: #22c55e; font-weight: 700;">✓</span> Score saved to leaderboard!
                    </p>
                    <p>Thank you for playing Quiz Challenge</p>
                    <p style="margin-top: 0.5rem; font-size: 0.8rem; color: #666;">
                        <span style="color: #22c55e;">■</span> Correct answers were shown in green
                        <span style="color: #ef4444; margin-left: 1rem;">■</span> Wrong answers in red
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(gameOverDiv);

        // Add event listeners for action buttons
        document.getElementById('play-again-btn').addEventListener('click', () => {
            location.reload();
        });

        document.getElementById('view-leaderboard-btn').addEventListener('click', () => {
            // Store current player data for highlighting in leaderboard
            localStorage.setItem('current-player', JSON.stringify({
                name: this.playerName,
                timestamp: this.endTime.getTime()
            }));
            window.open('leaderbord.html', '_blank');
        });

        // Add responsive styles for mobile
        const responsiveStyle = document.createElement('style');
        responsiveStyle.textContent = `
            @media (max-width: 768px) {
                .results-container {
                    padding: 2rem 1rem !important;
                }
                
                .player-info, .action-buttons {
                    grid-template-columns: 1fr !important;
                }
                
                .stats-section {
                    grid-template-columns: 1fr 1fr !important;
                }
            }
            
            @media (max-width: 480px) {
                .stats-section {
                    grid-template-columns: 1fr !important;
                }
                
                .results-container {
                    padding: 1.5rem 1rem !important;
                    margin: 1rem;
                }
            }
        `;
        document.head.appendChild(responsiveStyle);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new QuizGame();
});