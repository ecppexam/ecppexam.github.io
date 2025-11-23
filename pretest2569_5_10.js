// =====================================================
// CONFIGURATION
// =====================================================
const CONFIG = {
    // LIFF_ID: "2004722900-27YqP7Qk",
    LIFF_ID: "2008553229-nr0bN3Yl",
    SHEET_API_URL: 'https://script.google.com/macros/s/AKfycbwZvq4tvkdJPxlKABj0Dut1ljYCLSQhlL6nypoVQlPINbg3PF25-AjRxEpkp1N4xMCh/exec',
    QUESTIONS_API_URL: 'https://script.google.com/macros/s/AKfycbwjtjMGHdd7_EDWUvkCXlsJPoSipaj4w895OBqgPHgF34P987mU1ScA7KnNY3pO5AH7/exec',
    SAVE_SCORE_API_URL: 'https://script.google.com/macros/s/AKfycbyrm59LjB85rWLZD5GOQe7R4wjdCO_PkLv0bHtXB8k_hxIWVYF5gfpOEwJNDnTjcCK6fg/exec',
    NUM_QUESTIONS: 10,
    LOADING_DELAY: 4000,
    DEFAULT_AVATAR: "https://i.pinimg.com/originals/be/04/0f/be040f35f073adc3a48c1fba489d2bc4.gif"
};

// =====================================================
// STATE MANAGEMENT
// =====================================================
const state = {
    userProfile: null,
    userId: null,
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    userAnswers: [],
    isLoading: true,
    lesson: '',
    email: null
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================
const Utils = {
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    getRandomQuestions(questions, num) {
        return this.shuffle(questions).slice(0, num);
    },

    escapeHtml(text) {
        return text.replace(/'/g, "\\'");
    },

    isMobileDevice() {
        return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    },

    showElement(elementId) {
        document.getElementById(elementId)?.classList.remove('hidden');
    },

    hideElement(elementId) {
        document.getElementById(elementId)?.classList.add('hidden');
    }
};

// =====================================================
// UI MANAGEMENT
// =====================================================
const UI = {
    updateProgressBar() {
        const progress = ((state.currentQuestionIndex + 1) / state.questions.length) * 100;
        const progressBar = document.querySelector('.progress-bar');
        const progressText = document.getElementById('progressText');
        const lessonText = document.getElementById('lesson');

        if (progressBar) progressBar.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${state.currentQuestionIndex + 1}/${state.questions.length}`;
        if (lessonText) lessonText.textContent = state.lesson;
    },

    displayQuestion() {
        const question = state.questions[state.currentQuestionIndex];
        const container = document.getElementById('questionContainer');
        
        if (!container || !question) return;

        container.innerHTML = `
            <h2 class="text-xl font-semibold text-gray-800 mb-4">
                ${state.currentQuestionIndex + 1}. ${question.question}
            </h2>
            <div class="space-y-3">
                ${question.options.map(option => `
                    <div class="option-card p-4 rounded-lg border cursor-pointer ${
                        state.userAnswers[state.currentQuestionIndex] === option ? 'selected' : ''
                    }"
                    onclick="QuizController.selectOption('${Utils.escapeHtml(option)}')"
                    >
                        <div class="flex items-center">
                            <span class="w-6 h-6 flex items-center justify-center rounded-full border-2 border-gray-300 mr-3">
                                ${state.userAnswers[state.currentQuestionIndex] === option ? '✓' : ''}
                            </span>
                            ${option}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        this.updateProgressBar();
        this.updateNavigationButtons();
    },

    updateNavigationButtons() {
        const backBtn = document.getElementById('backButton');
        const nextBtn = document.getElementById('nextButton');
        const submitBtn = document.getElementById('submitButton');

        if (backBtn) backBtn.classList.toggle('hidden', state.currentQuestionIndex === 0);
        if (nextBtn) nextBtn.classList.toggle('hidden', state.currentQuestionIndex >= state.questions.length - 1);
        if (submitBtn) submitBtn.classList.toggle('hidden', state.currentQuestionIndex < state.questions.length - 1);
    },

    updateUserProfile() {
        const userPicture = document.getElementById('userPicture');
        const userName = document.getElementById('userName');

        if (userPicture && state.userProfile) {
            userPicture.src = state.userProfile.pictureUrl || CONFIG.DEFAULT_AVATAR;
        }
        if (userName && state.userProfile) {
            userName.textContent = state.userProfile.displayName;
        }
    },

    showAlert(title, text, icon = 'info') {
        return Swal.fire({
            title,
            text,
            icon,
            confirmButtonText: 'ตกลง'
        });
    },

    showConfirm(title, text) {
        return Swal.fire({
            title,
            text,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก'
        });
    }
};

// =====================================================
// QUIZ CONTROLLER
// =====================================================
const QuizController = {
    selectOption(option) {
        state.userAnswers[state.currentQuestionIndex] = option;
        UI.displayQuestion();
    },

    nextQuestion() {
        if (!state.userAnswers[state.currentQuestionIndex]) {
            UI.showAlert('คำเตือน', 'กรุณาเลือกคำตอบก่อนไปข้อถัดไป', 'warning');
            return;
        }
        state.currentQuestionIndex++;
        UI.displayQuestion();
    },

    previousQuestion() {
        if (state.currentQuestionIndex > 0) {
            state.currentQuestionIndex--;
            UI.displayQuestion();
        }
    },

    calculateScore() {
        state.score = 0;
        state.questions.forEach((question, index) => {
            const userAnswer = (state.userAnswers[index] || "").trim();
            const correctAnswers = Array.isArray(question.answer) 
                ? question.answer.map(ans => ans.trim()) 
                : [question.answer.trim()];
            
            if (correctAnswers.includes(userAnswer)) {
                state.score++;
            }
        });
    },

async showResults() {
        this.calculateScore();
        
        Utils.showElement('loadingScreen2');

        await new Promise(resolve => setTimeout(resolve, CONFIG.LOADING_DELAY));
        
        Utils.hideElement('loadingScreen2');
        
        const scoreText = document.getElementById('scoreText');
        if (scoreText) {
            scoreText.textContent = `${state.score}/${state.questions.length}`;
        }
        
        // Display wrong answers review
        this.displayWrongAnswers();
        
        Utils.showElement('scoreCard');
        
        // Save to localStorage
        if (state.userProfile) {
            localStorage.setItem(state.userProfile.userId, JSON.stringify({
                name: state.userProfile.displayName,
                score: state.score
            }));
        }
    },

    displayWrongAnswers() {
        const container = document.getElementById('wrongAnswersContainer');
        if (!container) return;

        const wrongAnswers = [];
        
        state.questions.forEach((question, index) => {
            const userAnswer = (state.userAnswers[index] || "").trim();
            const correctAnswers = Array.isArray(question.answer) 
                ? question.answer.map(ans => ans.trim()) 
                : [question.answer.trim()];
            
            if (!correctAnswers.includes(userAnswer)) {
                wrongAnswers.push({
                    questionNumber: index + 1,
                    question: question.question,
                    userAnswer: userAnswer || "ไม่ได้ตอบ",
                    correctAnswer: correctAnswers[0]
                });
            }
        });

        if (wrongAnswers.length === 0) {
            container.innerHTML = `
                <div class="perfect-score">
                    <div class="emoji">🎉</div>
                    <p class="message">ยินดีด้วย! คุณทำถูกทุกข้อ</p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div style="margin-bottom: 1rem;">
                    <h3 style="font-size: 1.125rem; font-weight: bold; color: #dc2626; margin-bottom: 0.5rem;">
                        📝 ข้อที่ทำผิด (${wrongAnswers.length} ข้อ)
                    </h3>
                </div>
                ${wrongAnswers.map(item => `
                    <div class="wrong-answer-item">
                        <p class="question-text">
                            <span class="question-number">ข้อ ${item.questionNumber}</span>
                            ${item.question}
                        </p>
                        <div class="answer-row wrong">
                            <span class="icon">✗</span>
                            <div class="content">
                                <span class="label">คำตอบของคุณ:</span>
                                <p class="answer-text">${item.userAnswer}</p>
                            </div>
                        </div>
                        <div class="answer-row correct">
                            <span class="icon">✓</span>
                            <div class="content">
                                <span class="label">เฉลยที่ถูกต้อง:</span>
                                <p class="answer-text">${item.correctAnswer}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            `;
        }
    },

    async submitQuiz() {
        if (!state.userAnswers[state.currentQuestionIndex]) {
            UI.showAlert('คำเตือน', 'กรุณาเลือกคำตอบก่อนส่ง', 'warning');
            return;
        }

        const result = await UI.showConfirm('ยืนยันการส่งคำตอบ', 'คุณต้องการส่งคำตอบหรือไม่?');
        
        if (result.isConfirmed) {
            Utils.hideElement('quizContainer');
            await this.showResults();
            await this.shareResults();
        }
    },

    async shareResults() {
        if (!state.userProfile) return;

        const flexMessage = {
            type: "flex",
            altText: "ผลการสอบ e-CPP",
            contents: {
                type: "bubble",
                body: {
                    type: "box",
                    layout: "vertical",
                    contents: [{
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            {
                                type: "box",
                                layout: "vertical",
                                contents: [{
                                    type: "image",
                                    url: state.userProfile.pictureUrl || CONFIG.DEFAULT_AVATAR,
                                    aspectMode: "cover",
                                    size: "full"
                                }],
                                cornerRadius: "100px",
                                width: "72px",
                                height: "72px"
                            },
                            {
                                type: "box",
                                layout: "vertical",
                                contents: [
                                    {
                                        type: "text",
                                        contents: [
                                            { type: "span", text: `คุณ : ${state.userProfile.displayName}`, weight: "bold", color: "#000000" }
                                        ],
                                        size: "sm",
                                        wrap: true
                                    },
                                    {
                                        type: "text",
                                        contents: [
                                            { type: "span", text: `วิชา : ${state.lesson}`, weight: "bold", color: "#bcbcbc" }
                                        ],
                                        size: "sm",
                                        wrap: true
                                    },
                                    {
                                        type: "text",
                                        contents: [
                                            { type: "span", text: `คะแนนของคุณ : ${state.score}/${state.questions.length}`, weight: "bold", color: "#000000" }
                                        ],
                                        size: "sm",
                                        wrap: true
                                    }
                                ],
                                justifyContent: "space-between"
                            }
                        ],
                        spacing: "xl",
                        paddingAll: "20px"
                    }],
                    paddingAll: "0px"
                }
            }
        };

        try {
            await API.saveScore(
                state.userProfile.userId,
                state.userProfile.displayName,
                state.email,
                state.lesson,
                state.score
            );
            
            await liff.sendMessages([flexMessage]);
        } catch (error) {
            console.error('Error sharing results:', error);
            UI.showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถแชร์ผลคะแนนได้ กรุณาลองใหม่อีกครั้ง', 'error');
        }
    },

    restartQuiz() {
        state.currentQuestionIndex = 0;
        state.userAnswers = [];
        state.score = 0;
        Utils.hideElement('scoreCard');
        Utils.showElement('quizContainer');
        UI.displayQuestion();
    },

    restartToSubjectSelection() {
        state.currentQuestionIndex = 0;
        state.userAnswers = [];
        state.score = 0;
        Utils.hideElement('scoreCard');
        Utils.showElement('subjectSelection');
    }
};

// =====================================================
// API MANAGEMENT
// =====================================================
const API = {
    async fetchSubjects(userId) {
        const url = `${CONFIG.SHEET_API_URL}?userId=${encodeURIComponent(userId)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch subjects');
        return response.json();
    },

    async fetchQuestions(subjectId) {
        const url = `${CONFIG.QUESTIONS_API_URL}?lesson=${encodeURIComponent(subjectId)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch questions');
        return response.json();
    },

    async saveScore(userId, name, email, lesson, score) {
        const response = await fetch(CONFIG.SAVE_SCORE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ userId, displayName: name, email, lesson, score })
        });

        const result = await response.json();
        if (result.statusCode !== 200) {
            throw new Error('Failed to save score');
        }
        return result;
    }
};

// =====================================================
// SUBJECT MANAGEMENT
// =====================================================
const SubjectManager = {
    async loadSubjects(userId) {
        Utils.showElement('loadingScreen3');

        try {
            const data = await API.fetchSubjects(userId);
            this.renderSubjects(data.subjects);
        } catch (error) {
            console.error('Error loading subjects:', error);
            UI.showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดรายวิชาได้', 'error');
        } finally {
            Utils.hideElement('loadingScreen3');
            Utils.showElement('subjectSelection');
        }
    },

    renderSubjects(subjects) {
        const container = document.getElementById('subjectButtonsContainer');
        if (!container) return;

        container.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';

        subjects.forEach(subject => {
            const card = this.createSubjectCard(subject);
            wrapper.appendChild(card);
        });

        container.appendChild(wrapper);
    },

    createSubjectCard(subject) {
        const card = document.createElement('div');
        card.className = 'flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300';

        const title = document.createElement('h3');
        title.className = 'text-xl font-bold text-gray-800 mb-2';
        title.textContent = subject.name;

        const button = document.createElement('button');
        button.className = 'w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-300';
        button.textContent = 'ทำข้อสอบวิชานี้';
        button.onclick = () => this.selectSubject(subject.name);

        card.appendChild(title);
        card.appendChild(button);

        return card;
    },

    async selectSubject(subjectName) {
        Utils.hideElement('subjectSelection');
        Utils.showElement('loadingScreen');

        try {
            const data = await API.fetchQuestions(subjectName);
            state.questions = Utils.getRandomQuestions(data, CONFIG.NUM_QUESTIONS);
            state.lesson = subjectName;

            Utils.hideElement('loadingScreen');
            Utils.showElement('quizContainer');
            UI.displayQuestion();
        } catch (error) {
            console.error('Error fetching questions:', error);
            Utils.hideElement('loadingScreen');
            UI.showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดคำถามได้', 'error');
        }
    }
};

// =====================================================
// LIFF MANAGEMENT
// =====================================================
const LIFFManager = {
    async initialize() {
        try {
            await liff.init({ liffId: CONFIG.LIFF_ID });
            
            if (liff.isLoggedIn()) {
                state.userProfile = await liff.getProfile();
                const decodedToken = liff.getDecodedIDToken();
                state.email = decodedToken?.email || null;

                UI.updateUserProfile();
                await SubjectManager.loadSubjects(state.userProfile.userId);
            } else {
                liff.login();
            }
        } catch (error) {
            console.error('LIFF initialization failed:', error);
            UI.showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับ LINE ได้ กรุณาลองใหม่อีกครั้ง', 'error');
        }
    },

    checkDevice() {
        if (!Utils.isMobileDevice()) {
            Swal.fire({
                title: 'แจ้งเตือน',
                text: 'กรุณาใช้งานผ่านอุปกรณ์มือถือ',
                icon: 'warning',
                confirmButtonText: 'ปิด',
                allowOutsideClick: false
            }).then(() => {
                liff.closeWindow();
            });
        }
    }
};

// =====================================================
// EVENT LISTENERS
// =====================================================
function setupEventListeners() {
    const nextBtn = document.getElementById('nextButton');
    const backBtn = document.getElementById('backButton');
    const submitBtn = document.getElementById('submitButton');

    if (nextBtn) nextBtn.addEventListener('click', () => QuizController.nextQuestion());
    if (backBtn) backBtn.addEventListener('click', () => QuizController.previousQuestion());
    if (submitBtn) submitBtn.addEventListener('click', () => QuizController.submitQuiz());
}

// =====================================================
// INITIALIZATION
// =====================================================
window.onload = async () => {
    setupEventListeners();
    await LIFFManager.initialize();
};

// =====================================================
// GLOBAL FUNCTIONS (for inline onclick handlers)
// =====================================================
window.QuizController = QuizController;
window.SubjectManager = SubjectManager;
window.selectSubject = (name) => SubjectManager.selectSubject(name);
window.selectOption = (option) => QuizController.selectOption(option);
window.restartQuiz = () => QuizController.restartQuiz();
window.restartPages = () => QuizController.restartToSubjectSelection();
