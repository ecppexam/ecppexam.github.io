 <script>
        // Configuration
        const CONFIG = {
            LIFF_ID: "2006455439-DvrXJ76M",
            QUESTIONS_API_URL: "https://script.google.com/macros/s/AKfycbyQAlZTaPFJg51C_YcxshGFhsUjLpWTJP4CBjX3vOxyvY9XGErQgz_NflYTbs5SPcvy/exec",
            SUBJECTS_API_URL: "https://script.google.com/macros/s/AKfycbym2tq5jyjKUIzVhoTncQ4ssWfldulG7sLiLx740PZjy_DKBjX064IfxnqLZl2yQc2vtg/exec",
            SHEET_SAVE_URL: "https://script.google.com/macros/s/AKfycbyrm59LjB85rWLZD5GOQe7R4wjdCO_PkLv0bHtXB8k_hxIWVYF5gfpOEwJNDnTjcCK6fg/exec",
            QUESTIONS_PER_QUIZ: 10
        };

        // Application State
        class QuizState {
            constructor() {
                this.userProfile = null;
                this.questions = [];
                this.currentQuestionIndex = 0;
                this.score = 0;
                this.userAnswers = [];
                this.lesson = '';
                this.email = null;
                this.isLoading = false;
            }

            reset() {
                this.questions = [];
                this.currentQuestionIndex = 0;
                this.score = 0;
                this.userAnswers = [];
                this.lesson = '';
            }

            resetToSubjectSelection() {
                this.reset();
                // Keep userProfile and email
            }
        }

        const state = new QuizState();

        // Utility Functions
        const Utils = {
            shuffle: (array) => {
                const shuffled = [...array];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                return shuffled;
            },

            getRandomQuestions: (questions, num) => {
                return Utils.shuffle(questions).slice(0, num);
            },

            escapeHtml: (text) => {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            },

            showLoading: (screenId) => {
                document.querySelectorAll('[id^="loadingScreen"]').forEach(screen => {
                    screen.classList.add('hidden');
                });
                document.getElementById(screenId).classList.remove('hidden');
            },

            hideAllScreens: () => {
                const screens = ['subjectSelection', 'loadingScreen', 'loadingScreen2', 'loadingScreen3', 'quizContainer', 'scoreCard'];
                screens.forEach(screen => {
                    document.getElementById(screen).classList.add('hidden');
                });
            }
        };

        // UI Management
        class UIManager {
            static updateProgressBar() {
                const progress = ((state.currentQuestionIndex + 1) / state.questions.length) * 100;
                document.querySelector('.progress-bar').style.width = `${progress}%`;
                document.getElementById('progressText').textContent = 
                    `${state.currentQuestionIndex + 1}/${state.questions.length}`;
                document.getElementById('lesson').textContent = state.lesson;
            }

            static displayQuestion() {
                const question = state.questions[state.currentQuestionIndex];
                const container = document.getElementById('questionContainer');
                
                container.innerHTML = `
                    <h2 class="text-xl font-semibold text-gray-800 mb-6">
                        ${state.currentQuestionIndex + 1}. ${Utils.escapeHtml(question.question)}
                    </h2>
                    <div class="space-y-3">
                        ${question.options.map((option, index) => `
                            <div class="option-card p-4 rounded-lg border ${
                                state.userAnswers[state.currentQuestionIndex] === option ? 'selected' : ''
                            }"
                            onclick="QuizManager.selectOption('${Utils.escapeHtml(option)}')"
                            >
                                <div class="flex items-center">
                                    <span class="w-6 h-6 flex items-center justify-center rounded-full border-2 border-gray-300 mr-3 text-sm">
                                        ${state.userAnswers[state.currentQuestionIndex] === option ? '✓' : String.fromCharCode(65 + index)}
                                    </span>
                                    <span class="flex-1">${Utils.escapeHtml(option)}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;

                UIManager.updateProgressBar();
                UIManager.updateNavigationButtons();
            }

            static updateNavigationButtons() {
                const backBtn = document.getElementById('backButton');
                const nextBtn = document.getElementById('nextButton');
                const submitBtn = document.getElementById('submitButton');

                backBtn.classList.toggle('hidden', state.currentQuestionIndex === 0);
                nextBtn.classList.toggle('hidden', state.currentQuestionIndex >= state.questions.length - 1);
                submitBtn.classList.toggle('hidden', state.currentQuestionIndex < state.questions.length - 1);
            }

            static showResults() {
                document.getElementById('scoreText').textContent = 
                    `${state.score}/${state.questions.length}`;
                document.getElementById('scoreCard').classList.remove('hidden');
                
                // Add confetti effect for good scores
                if (state.score >= state.questions.length * 0.6) {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }
            }

            static showError(message) {
                Utils.hideAllScreens();
                Swal.fire({
                    title: 'เกิดข้อผิดพลาด',
                    text: message,
                    icon: 'error',
                    confirmButtonText: 'ลองใหม่',
                    allowOutsideClick: false
                }).then(() => {
                    window.location.reload();
                });
            }
        }

        // Quiz Management
        class QuizManager {
            static selectOption(option) {
                // Decode HTML entities
                const textarea = document.createElement('textarea');
                textarea.innerHTML = option;
                const decodedOption = textarea.value;
                
                state.userAnswers[state.currentQuestionIndex] = decodedOption;
                UIManager.displayQuestion();
            }

            static nextQuestion() {
                if (!state.userAnswers[state.currentQuestionIndex]) {
                    Swal.fire({
                        title: 'คำเตือน',
                        text: 'กรุณาเลือกคำตอบก่อนไปข้อถัดไป',
                        icon: 'warning',
                        confirmButtonText: 'ตกลง'
                    });
                    return;
                }
                state.currentQuestionIndex++;
                UIManager.displayQuestion();
            }

            static previousQuestion() {
                if (state.currentQuestionIndex > 0) {
                    state.currentQuestionIndex--;
                    UIManager.displayQuestion();
                }
            }

            static calculateScore() {
                state.score = 0;
                state.questions.forEach((question, index) => {
                    const userAnswer = state.userAnswers[index]?.trim() || "";
                    const correctAnswers = Array.isArray(question.answer) 
                        ? question.answer.map(answer => answer.trim()) 
                        : [question.answer.trim()];
                    
                    if (correctAnswers.includes(userAnswer)) {
                        state.score++;
                    }
                });
            }

            static async submitQuiz() {
                if (!state.userAnswers[state.currentQuestionIndex]) {
                    Swal.fire({
                        title: 'คำเตือน',
                        text: 'กรุณาเลือกคำตอบก่อนส่ง',
                        icon: 'warning',
                        confirmButtonText: 'ตกลง'
                    });
                    return;
                }

                const result = await Swal.fire({
                    title: 'ยืนยันการส่งคำตอบ',
                    text: 'คุณต้องการส่งคำตอบหรือไม่?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'ส่งคำตอบ',
                    cancelButtonText: 'ยกเลิก'
                });

                if (result.isConfirmed) {
                    Utils.hideAllScreens();
                    Utils.showLoading('loadingScreen2');
                    
                    QuizManager.calculateScore();
                    
                    setTimeout(async () => {
                        try {
                            await DataManager.saveResults();
                            await DataManager.shareResults();
                            document.getElementById('loadingScreen2').classList.add('hidden');
                            UIManager.showResults();
                        } catch (error) {
                            console.error('Error in submit process:', error);
                            UIManager.showError('เกิดข้อผิดพลาดในการส่งคำตอบ');
                        }
                    }, 2000);
                }
            }

            static restartQuiz() {
                state.reset();
                state.lesson = state.lesson; // Keep current lesson
                Utils.hideAllScreens();
                Utils.showLoading('loadingScreen');
                DataManager.fetchQuestions(state.lesson);
            }

            static restartToSubjectSelection() {
                state.resetToSubjectSelection();
                Utils.hideAllScreens();
                document.getElementById('subjectSelection').classList.remove('hidden');
            }
        }

        // Data Management
        class DataManager {
            static async initializeLIFF() {
                try {
                    await liff.init({ liffId: CONFIG.LIFF_ID });
                    
                    if (liff.isLoggedIn()) {
                        state.userProfile = await liff.getProfile();
                        const decodedToken = liff.getDecodedIDToken();
                        state.email = decodedToken?.email || null;

                        // Update UI
                        document.getElementById('userPicture').src = state.userProfile.pictureUrl;
                        document.getElementById('userName').textContent = state.userProfile.displayName;
                        
                        return true;
                    } else {
                        liff.login();
                        return false;
                    }
                } catch (error) {
                    console.error('LIFF initialization failed:', error);
                    UIManager.showError('ไม่สามารถเชื่อมต่อกับ LINE ได้ กรุณาลองใหม่อีกครั้ง');
                    return false;
                }
            }

            static async loadSubjects() {
                Utils.showLoading('loadingScreen3');
                
                try {
                    const response = await fetch(CONFIG.SUBJECTS_API_URL);
                    if (!response.ok) throw new Error('Failed to fetch subjects');
                    
                    const data = await response.json();
                    const container = document.getElementById('subjectButtonsContainer');
                    
                    container.innerHTML = '';
                    
                    data.subjects.forEach(subject => {
                        const subjectCard = document.createElement('div');
                        subjectCard.className = 'subject-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer';
                        subjectCard.onclick = () => DataManager.selectSubject(subject.name);
                        
                        subjectCard.innerHTML = `
                            <h3 class="text-lg font-bold text-gray-800 mb-4 text-center">${Utils.escapeHtml(subject.name)}</h3>
                            <button class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                                ทำข้อสอบวิชานี้
                            </button>
                        `;
                        
                        container.appendChild(subjectCard);
                    });
                    
                    document.getElementById('loadingScreen3').classList.add('hidden');
                    document.getElementById('subjectSelection').classList.remove('hidden');
                    
                } catch (error) {
                    console.error('Error loading subjects:', error);
                    UIManager.showError('ไม่สามารถโหลดรายวิชาได้');
                }
            }

            static selectSubject(subjectName) {
                Utils.hideAllScreens();
                Utils.showLoading('loadingScreen');
                state.lesson = subjectName;
                DataManager.fetchQuestions(subjectName);
            }

            static async fetchQuestions(subjectName) {
                try {
                    const url = `${CONFIG.QUESTIONS_API_URL}?lesson=${encodeURIComponent(subjectName)}`;
                    const response = await fetch(url);
                    
                    if (!response.ok) throw new Error('Failed to fetch questions');
                    
                    const data = await response.json();
                    state.questions = Utils.getRandomQuestions(data, CONFIG.QUESTIONS_PER_QUIZ);
                    state.userAnswers = new Array(state.questions.length);
                    
                    document.getElementById('loadingScreen').classList.add('hidden');
                    document.getElementById('quizContainer').classList.remove('hidden');
                    
                    UIManager.displayQuestion();
                    
                } catch (error) {
                    console.error('Error fetching questions:', error);
                    UIManager.showError('ไม่สามารถโหลดข้อสอบได้');
                }
            }

            static async saveResults() {
                if (!state.userProfile) return;
                
                try {
                    const response = await fetch(CONFIG.SHEET_SAVE_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams({
                            userId: state.userProfile.userId,
                            displayName: state.userProfile.displayName,
                            email: state.email || '',
                            lesson: state.lesson,
                            score: state.score,
                        })
                    });

                    const result = await response.json();
                    if (result.statusCode !== 200) {
                        throw new Error('Failed to save results');
                    }
                } catch (error) {
                    console.error('Error saving results:', error);
                    throw error;
                }
            }

            static async shareResults() {
                if (!state.userProfile) return;

                const flexMessage = {
                    type: "flex",
                    altText: "ผลการสอบ e-CPP",
                    contents: {
                        type: "bubble",
                        body: {
                            type: "box",
                            layout: "vertical",
                            contents: [
                                {
                                    type: "box",
                                    layout: "horizontal",
                                    contents: [
                                        {
                                            type: "box",
                                            layout: "vertical",
                                            contents: [
                                                {
                                                    type: "image",
                                                    url: state.userProfile.pictureUrl || "https://i.pinimg.com/originals/be/04/0f/be040f35f073adc3a48c1fba489d2bc4.gif",
                                                    aspectMode: "cover",
                                                    size: "full"
                                                }
                                            ],
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
                                                    text: `คุณ: ${state.userProfile.displayName}`,
                                                    weight: "bold",
                                                    color: "#000000",
                                                    size: "sm"
                                                },
                                                {
                                                    type: "text",
                                                    text: `วิชา: ${state.lesson}`,
                                                    weight: "bold",
                                                    color: "#bcbcbc",
                                                    size: "sm"
                                                },
                                                {
                                                    type: "text",
                                                    text: `คะแนน: ${state.score}/${state.questions.length}`,
                                                    weight: "bold",
                                                    color: "#000000",
                                                    size: "sm"
                                                }
                                            ],
                                            justifyContent: "space-between"
                                        }
                                    ],
                                    spacing: "xl",
                                    paddingAll: "20px"
                                }
                            ],
                            paddingAll: "0px"
                        }
                    }
                };

                try {
                    await liff.sendMessages([flexMessage]);
                } catch (error) {
                    console.error('Error sharing results:', error);
                    throw error;
                }
            }
        }

        // Event Listeners
        function setupEventListeners() {
            document.getElementById('nextButton').addEventListener('click', QuizManager.nextQuestion);
            document.getElementById('backButton').addEventListener('click', QuizManager.previousQuestion);
            document.getElementById('submitButton').addEventListener('click', QuizManager.submitQuiz);
            document.getElementById('restartQuizBtn').addEventListener('click', QuizManager.restartQuiz);
            document.getElementById('restartPagesBtn').addEventListener('click', QuizManager.restartToSubjectSelection);
        }

        // Initialize Application
        async function initializeApp() {
            setupEventListeners();
            
            const liffInitialized = await DataManager.initializeLIFF();
            if (liffInitialized) {
                await DataManager.loadSubjects();
            }
        }

        // Start the application
        window.onload = initializeApp;
    </script>
