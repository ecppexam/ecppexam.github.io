// LIFF App ID
        const LIFF_ID = "2006455439-Kvmx5Wrd";

        // State Management
        const state = {
            userProfile: null,
            questions: [],
            currentQuestionIndex: 0,
            score: 0,
            userAnswers: [],
            isLoading: true,
            lesson: '',
            email: null,
            currentPage: 1,
            subjectsPerPage: 4,
            questionResults: [],
            subjects: []
        };

        // Utility Functions
        const shuffle = array => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        const getRandomQuestions = (questions, num) => {
            return shuffle([...questions]).slice(0, num);
        };

        // UI Update Functions
        const updateProgressBar = () => {
            const progress = ((state.currentQuestionIndex + 1) / state.questions.length) * 100;
            document.querySelector('.progress-bar').style.width = `${progress}%`;
            document.getElementById('progressText').textContent = `${state.currentQuestionIndex + 1}/${state.questions.length}`;
            document.getElementById('lesson').textContent = `${state.lesson}`;
        };

        const displayQuestion = () => {
            const question = state.questions[state.currentQuestionIndex];
            const container = document.getElementById('questionContainer');
            container.innerHTML = `
                <h2 class="text-xl font-semibold text-gray-800 mb-4">
                    ${state.currentQuestionIndex + 1}. ${question.question}
                </h2>
                <div class="space-y-3">
                    ${question.options.map((option, index) => `
                        <div class="option-card p-4 rounded-lg border ${
                            state.userAnswers[state.currentQuestionIndex] === option ? 'selected' : ''
                        }"
                        onclick="selectOption('${option.replace(/'/g, "\\'")}')"
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
            updateProgressBar();
            updateNavigationButtons();
        };

        const updateNavigationButtons = () => {
            document.getElementById('backButton').classList.toggle('hidden', state.currentQuestionIndex === 0);
            document.getElementById('nextButton').classList.toggle('hidden', state.currentQuestionIndex >= state.questions.length - 1);
            document.getElementById('submitButton').classList.toggle('hidden', state.currentQuestionIndex < state.questions.length - 1);
        };

        // Event Handlers
        const selectOption = (option) => {
            state.userAnswers[state.currentQuestionIndex] = option;
            displayQuestion();
        };

        const nextQuestion = () => {
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
            displayQuestion();
        };

        const previousQuestion = () => {
            state.currentQuestionIndex--;
            displayQuestion();
        };

        const calculateScore = () => {
            state.score = 0;
            state.questionResults = [];
            state.questions.forEach((question, index) => {
                const userAnswer = state.userAnswers[index] ? state.userAnswers[index].trim() : "";
                const correctAnswers = Array.isArray(question.answer)
                    ? question.answer.map(a => a.trim())
                    : [question.answer.trim()];
                const isCorrect = correctAnswers.includes(userAnswer);
                if (isCorrect) state.score++;
                state.questionResults.push({
                    questionNumber: index + 1,
                    question: question.question,
                    userAnswer,
                    correctAnswers,
                    isCorrect
                });
            });
        };

        const showResults = () => {
            calculateScore();
            // แสดง loading screen
            document.getElementById('loadingScreen2').classList.remove('hidden');

            setTimeout(() => {
                document.getElementById('loadingScreen2').classList.add('hidden');
                document.getElementById('scoreText').textContent = `${state.score}/${state.questions.length}`;
                const scoreCard = document.getElementById('scoreCard');
                scoreCard.classList.remove('hidden');

                const incorrectAnswers = state.questionResults.filter(result => !result.isCorrect);
                let resultsHTML;
                if (incorrectAnswers.length === 0) {
                    resultsHTML = `
                        <div class="text-center py-4">
                            <p class="text-green-600 font-bold">🎉 ยินดีด้วย! คุณตอบถูกทุกข้อ!</p>
                        </div>
                    `;
                } else {
                    resultsHTML = incorrectAnswers.map((result, index) => `
                        <div class="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
                                <div class="flex items-center mb-2">
                                    <div class="text-sm font-semibold mr-2">ข้อ ${result.questionNumber}:</div>
                                    <div class="text-red-600">❌ ผิด</div>
                                </div>
                                <div class="pl-5 space-y-1">
                                    <div class="text-sm text-gray-600"><b>คำถาม:</b> ${result.question}</div>
                                    <div class="text-sm text-gray-600"><b>คำตอบของคุณ:</b> ${result.userAnswer || '-'}</div>
                                    <div class="text-sm text-green-700"><b>คำตอบที่ถูกต้อง:</b> ${result.correctAnswers.join(', ')}</div>
                                </div>
                            </div>
                    `).join('');
                }

                const summarySection = document.createElement('div');
                summarySection.innerHTML = `
                    <div class="mt-6">
                        <h3 class="text-lg font-bold mb-4">สรุปข้อที่คุณตอบผิด (${incorrectAnswers.length} ข้อ)</h3>
                        <div class="max-h-96 overflow-y-auto">
                            ${resultsHTML}
                        </div>
                    </div>
                `;

                const existingSummary = scoreCard.querySelector('.summary-section');
                if (existingSummary) existingSummary.remove();
                summarySection.classList.add('summary-section');
                scoreCard.appendChild(summarySection);
            }, 4000);
        };

        // ฟังก์ชันตรวจสอบสิทธิ์ผู้ใช้
        async function checkUserPermission(userId) {
            try {
                const response = await fetch('https://script.google.com/macros/s/AKfycbysX1yZD0rm8oCq9X545gAVrIrVbh1GsFZK3pUnhvVO09509lOi7_HiynzzMmtaiHftWg/exec', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({ userId: userId })
                });

                const result = await response.json();
                if (result.status === 'success') {
                    loadSubjects(); // โหลดข้อมูลหรือหน้าต่อไป
                } else {
                    Swal.fire({
                        title: 'ไม่มีสิทธิ์',
                        text: result.message || 'คุณไม่มีสิทธิ์ใช้งานระบบ',
                        icon: 'error',
                        confirmButtonText: 'ตกลง'
                    }).then(() => {
                        localStorage.clear();
                        document.getElementById('loginScreen').classList.remove('hidden');
                    });
                }
            } catch (error) {
                console.error('Error checking user permission:', error);
                Swal.fire({
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถตรวจสอบสิทธิ์ผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง',
                    icon: 'error',
                    confirmButtonText: 'ตกลง'
                }).then(() => {
                    document.getElementById('loginScreen').classList.remove('hidden');
                });
            }
        }

        // ฟังก์ชันเริ่มต้น LIFF
        async function initializeLIFF() {
            // ซ่อนปุ่ม Login และแสดงหน้าจอโหลด
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('loadingLogin').classList.remove('hidden');

            try {
                await liff.init({ liffId: LIFF_ID });

                if (liff.isLoggedIn()) {
                    // หากผู้ใช้เข้าสู่ระบบแล้ว
                    state.userProfile = await liff.getProfile();
                    const userId = state.userProfile.userId;
                    await checkUserPermission(userId);
                    document.getElementById('loadingLogin').classList.add('hidden');
                } else {
                    // หากผู้ใช้ยังไม่ได้เข้าสู่ระบบ ให้เข้าสู่ระบบทันที
                    liff.login();
                }
            } catch (error) {
                console.error('การเริ่มต้น LIFF ล้มเหลว:', error);
                Swal.fire({
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถเชื่อมต่อกับ LINE ได้ กรุณาลองใหม่อีกครั้ง',
                    icon: 'error',
                    confirmButtonText: 'ตกลง'
                }).then(() => {
                    document.getElementById('loginScreen').classList.remove('hidden');
                });
            }
        }

        // เมื่อหน้าเว็บโหลดเสร็จ ให้เริ่มต้น LIFF ทันที
        document.getElementById('loginButton').addEventListener('click', () => {
            initializeLIFF();
        });

        function selectSubject(subjectId) {
            document.getElementById('subjectSelection').classList.add('hidden');
            document.getElementById('loadingScreen').classList.remove('hidden');
            fetchQuestions(subjectId);
        }

        function fetchQuestions(subjectId) {
            const url = `https://script.google.com/macros/s/AKfycbyDm_sPrbYoEjVBtXUzJ1i2y5bw1tH0v0l5VKXb5IKCfiuGJNAmKgkOLNPZzkVdTcRD/exec?lesson=${subjectId}`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    state.questions = getRandomQuestions(data, 10);
                    state.lesson = subjectId;
                    document.getElementById('paginationContainer').classList.add('hidden');
                    document.getElementById('loadingScreen').classList.add('hidden');
                    document.getElementById('quizContainer').classList.remove('hidden');
                    displayQuestion();
                })
                .catch(error => {
                    console.error("Error fetching questions:", error);
                    Swal.fire("Error", "Unable to load questions", "error");
                });
        }

        async function sendToGoogleSheet(userId, name, email, lesson, score) {
            try {
                const response = await fetch('https://script.google.com/macros/s/AKfycbyrm59LjB85rWLZD5GOQe7R4wjdCO_PkLv0bHtXB8k_hxIWVYF5gfpOEwJNDnTjcCK6fg/exec', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        userId: userId,
                        displayName: name,
                        email: email,
                        lesson: lesson,
                        score: score,
                    })
                });

                const result = await response.json();
                if (result.statusCode === 200) {
                    // console.log('ข้อมูลถูกบันทึกเรียบร้อย');
                } else {
                    Swal.fire('Error', 'เกิดข้อผิดพลาดขณะเข้าสู่เว็บไซต์', 'error');
                }
            } catch (error) {
                console.error("Error sending data to Google Sheet:", error);
                Swal.fire('Error', 'มีข้อผิดพลาดในการบันทึกข้อมูล', 'error').then(() => {
                    liff.closeWindow();
                });
            }
        }
      
        function restartQuiz() {
            state.currentQuestionIndex = 0;
            state.userAnswers = [];
            state.score = 0;
            displayQuestion();
            document.getElementById('scoreCard').classList.add('hidden');
            document.getElementById('quizContainer').classList.remove('hidden');
            state.questionResults = [];
        }

        function restartPages() {
            state.currentQuestionIndex = 0;
            state.userAnswers = [];
            state.score = 0;
            document.getElementById('scoreCard').classList.add('hidden');
            document.getElementById('subjectSelection').classList.remove('hidden');
            document.getElementById('paginationContainer').classList.remove('hidden');
            state.questionResults = [];
        }

        function showError(message) {
            document.getElementById('loadingScreen').classList.add('hidden');
            Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: message,
                icon: 'error',
                confirmButtonText: 'ลองใหม่',
                allowOutsideClick: false
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.reload();
                }
            });
        }

        function checkIfDesktop() {
            const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (!isMobile) {
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

        // Event Listeners
        document.getElementById('nextButton').addEventListener('click', nextQuestion);
        document.getElementById('backButton').addEventListener('click', previousQuestion);

        document.getElementById('submitButton').addEventListener('click', () => {
            if (!state.userAnswers[state.currentQuestionIndex]) {
                Swal.fire({
                    title: 'คำเตือน',
                    text: 'กรุณาเลือกคำตอบก่อนส่ง',
                    icon: 'warning',
                    confirmButtonText: 'ตกลง'
                });
                return;
            }

            Swal.fire({
                title: 'ยืนยันการส่งคำตอบ',
                text: 'คุณต้องการส่งคำตอบหรือไม่?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'ส่งคำตอบ',
                cancelButtonText: 'ยกเลิก'
            }).then((result) => {
                if (result.isConfirmed) {
                    document.getElementById('quizContainer').classList.add('hidden');
                    showResults();
                    saveResults();
                    
                } else {
                    document.getElementById('loadingScreen2').classList.add('hidden');
                }
            })
        });

        // Initialize the app
        window.onload = async () => {
            document.getElementById('loginScreen').classList.remove('hidden');
            document.getElementById('quizContainer').classList.add('hidden');
            // await initializeLIFF();
            // checkIfDesktop();
        };

        // URL of your Google Apps Script Web App
        const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbxttGc-YjxTVZSjrzOdZ-5Th_Pr9rBruu6rchf-5-Pq8dLu-SpwDoYyjjgZWNdcQEPDdw/exec';

        // Load Subjects when the page loads
        // document.addEventListener('DOMContentLoaded', loadSubjects);

        // Function to handle subject selection
        function selectSubject(subjectName) {
            document.getElementById('subjectSelection').classList.add('hidden');
            document.getElementById('loadingScreen').classList.remove('hidden');
            fetchQuestions(subjectName);
        }

        function renderPagination() {
            const paginationContainer = document.getElementById('paginationContainer');
            paginationContainer.innerHTML = '';

            const totalPages = Math.ceil(state.subjects.length / state.subjectsPerPage);

            const prevButton = document.createElement('button');
            prevButton.textContent = 'ย้อนกลับ';
            prevButton.className = 'px-4 py-2 bg-gray-300 rounded-lg mx-1';
            prevButton.disabled = state.currentPage === 1;
            prevButton.onclick = () => {
                if (state.currentPage > 1) {
                    state.currentPage--;
                    displaySubjects(state.currentPage);
                }
            };
            paginationContainer.appendChild(prevButton);

            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement('button');
                pageButton.textContent = i;
                pageButton.className = `px-4 py-2 mx-1 rounded-lg ${
                    i === state.currentPage ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                }`;
                pageButton.onclick = () => {
                    state.currentPage = i;
                    displaySubjects(state.currentPage);
                };
                paginationContainer.appendChild(pageButton);
            }

            const nextButton = document.createElement('button');
            nextButton.textContent = 'ถัดไป';
            nextButton.className = 'px-4 py-2 bg-gray-300 rounded-lg mx-1';
            nextButton.disabled = state.currentPage === totalPages;
            nextButton.onclick = () => {
                if (state.currentPage < totalPages) {
                    state.currentPage++;
                    displaySubjects(state.currentPage);
                }
            };
            paginationContainer.appendChild(nextButton);
        }

        function displaySubjects(page) {
            const container = document.getElementById('subjectButtonsContainer');
            container.innerHTML = '';

            const startIndex = (page - 1) * state.subjectsPerPage;
            const endIndex = startIndex + state.subjectsPerPage;
            const subjectsToShow = state.subjects.slice(startIndex, endIndex);

            const wrapper = document.createElement('div');
            wrapper.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';

            subjectsToShow.forEach(subject => {
                const subjectCard = document.createElement('div');
                subjectCard.className = 'flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300';

                const title = document.createElement('h3');
                title.className = 'text-xl font-bold text-gray-800 mb-2';
                title.textContent = subject.name;

                const button = document.createElement('button');
                button.className = 'w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-300';
                button.textContent = 'ทำข้อสอบวิชานี้';
                button.onclick = () => selectSubject(subject.name);

                subjectCard.appendChild(title);
                subjectCard.appendChild(button);
                wrapper.appendChild(subjectCard);
            });

            container.appendChild(wrapper);
            renderPagination();
        }

        async function loadSubjects() {
            document.getElementById('loadingScreen3').classList.remove('hidden');

            try {
                const response = await fetch(SHEET_API_URL);
                const data = await response.json();
                state.subjects = data.subjects;
                displaySubjects(state.currentPage);
            } catch (error) {
                console.error('Error loading subjects:', error);
            } finally {
                document.getElementById('loadingScreen3').classList.add('hidden');
                document.getElementById('loginScreen').classList.add('hidden');
                document.getElementById('subjectSelection').classList.remove('hidden');
            }
        }
      
        async function saveResults() {
            if (!state.userProfile) return;

            const userId = state.userProfile.userId;
            const name = state.userProfile.displayName;
            const email = state.email; 
            var lesson = state.lesson ;
            const score = state.score;

            try {
                await sendToGoogleSheet(userId, name, email, lesson, score);
                // console.log("ข้อมูลถูกบันทึกสำเร็จ");
            } catch (error) {
                console.error('Error savescore results:', error);
                Swal.fire({
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถบันทึกผลคะแนนได้ กรุณาลองใหม่อีกครั้ง',
                    icon: 'error',
                    confirmButtonText: 'ตกลง'
                });
            }
        }
