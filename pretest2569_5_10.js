// หลักสูตร PC
        const LIFF_ID = "2008553229-nr0bN3Yl";
        const state = {
            userProfile: null,
            questions: [],
            currentQuestionIndex: 0,
            score: 0,
            userAnswers: [],
            isLoading: true ,
            lesson: '' ,// เพิ่ม state สำหรับเก็บชื่อบทเรียน
            email: null // Initialize as null or empty
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
            // const lesson_1 = 'พรบ.การจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐและกฎหมายลำดับรอง(ระดับต้น)' ;
            document.querySelector('.progress-bar').style.width = `${progress}%`;
            document.getElementById('progressText').textContent = 
                `${state.currentQuestionIndex + 1}/${state.questions.length}`;
            document.getElementById('lesson').textContent = `${state.lesson}`; // ใช้ค่าจาก state
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
            // lesson = state.currentLesson  ; // เก็บชื่อบทเรียนใน state
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
    state.questions.forEach((question, index) => {
        // ตรวจสอบ undefined ก่อนเรียก .trim()
        const userAnswer = state.userAnswers[index] ? state.userAnswers[index].trim() : ""; 
        
        // ตรวจสอบว่า question.answer เป็นอาเรย์หรือไม่ ถ้าไม่ใช่ ให้แปลงเป็นอาเรย์
        const correctAnswers = Array.isArray(question.answer) 
            ? question.answer.map(answer => answer.trim()) 
            : [question.answer.trim()]; // ถ้าเป็นสตริง ให้แปลงเป็นอาเรย์ที่มีเพียงค่าเดียว
        
        console.log(`User answer: ${userAnswer}, Correct answer: ${correctAnswers}`);
        
        if (correctAnswers.includes(userAnswer)) { // เปรียบเทียบคำตอบโดยไม่รวมช่องว่าง
            state.score++;
        }
    });
};




    const showResults = () => {
    calculateScore();
    
    // แสดง loading screen
    document.getElementById('loadingScreen2').classList.remove('hidden'); 

    // ตั้งเวลาให้ loading screen แสดงนาน 2 วินาทีแล้วจึงซ่อนไป
    setTimeout(() => {
        document.getElementById('loadingScreen2').classList.add('hidden'); // ซ่อน loading screen

        // แสดงคะแนนหลังจาก loading screen ถูกซ่อน
        document.getElementById('scoreText').textContent = 
            `${state.score}/${state.questions.length}`;
        
        document.getElementById('scoreCard').classList.remove('hidden'); // แสดง scoreCard
        
        // Save results
        if (state.userProfile) {
            localStorage.setItem(state.userProfile.userId, 
                JSON.stringify({
                    name: state.userProfile.displayName,
                    score: state.score
                })
            );
        }
    }, 4000); // ตั้งเวลา 2 วินาที
};


        async function shareResults() {
        if (!state.userProfile) return;

        const flexMessage = {
          type: "flex",
          altText: "ผลการสอบ e-CPP",
          contents: 
          
          {
          "type": "bubble",
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "box",
                "layout": "horizontal",
                "contents": [
                  {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                      {
                        "type": "image",
                        "url": state.userProfile.pictureUrl || "https://i.pinimg.com/originals/be/04/0f/be040f35f073adc3a48c1fba489d2bc4.gif",
                        "aspectMode": "cover",
                        "size": "full"
                      }
                    ],
                    "cornerRadius": "100px",
                    "width": "72px",
                    "height": "72px"
                  },
                  {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                      {
                        "type": "text",
                        "contents": [
                          {
                            "type": "span",
                            "text": "คุณ : " + state.userProfile.displayName,
                            "weight": "bold",
                            "color": "#000000"
                          },
                          {
                            "type": "span",
                            "text": "     "
                          }
                        ],
                        "size": "sm",
                        "wrap": false
                      },
                      {
                        "type": "text",
                        "contents": [
                          {
                            "type": "span",
                            "text": "วิชา : " + state.lesson,
                            "weight": "bold",
                            "color": "#bcbcbc"
                          },
                          {
                            "type": "span",
                            "text": "     "
                          }
                        ],
                        "size": "sm",
                        "wrap": false
                      },
                      {
                        "type": "text",
                        "contents": [
                          {
                            "type": "span",
                            "text": `คะแนนของคุณ : ${state.score}/${state.questions.length}`,
                            "weight": "bold",
                            "color": "#000000"
                          },
                          {
                            "type": "span",
                            "text": "     "
                          }
                        ],
                        "size": "sm",
                        "wrap": true
                      }
                    ],
                    "justifyContent": "space-between"
                  }
                ],
                "spacing": "xl",
                "paddingAll": "20px"
              }
            ],
            "paddingAll": "0px"
          }
        }
          
          // {
          //   type: "bubble",
          //   hero: {
          //     type: "image",
          //     url: state.userProfile.pictureUrl || "https://i.pinimg.com/originals/be/04/0f/be040f35f073adc3a48c1fba489d2bc4.gif",
          //     size: "full",
          //     aspectRatio: "1:1",
          //     aspectMode: "cover"
          //   },
          //   body: {
          //     type: "box",
          //     layout: "vertical",
          //     contents: [
          //       {
          //         type: "text",
          //         text: state.userProfile.displayName,
          //         weight: "bold",
          //         size: "xl",
          //         color: "#1a237e"
          //       },
          //       {
          //         type: "text",
          //         text: `คะแนนของคุณ : ${state.score}/${state.questions.length}`,
          //         size: "md",
          //         color: state.score >= 6 ? "#4CAF50" : "#FF9800",
          //         margin: "md"
          //       },
          //       {
          //         type: "text",
          //         text: `${state.score >= 6 ? "ยินดีด้วย! คุณผ่านการทดสอบ" : "พยายามอีกครั้ง คุณทำได้!"}`,
          //         size: "sm",
          //         color: "#666666",
          //         margin: "md"
          //       }
          //     ]
          //   }
          // }
          
          
        };
        const userId = state.userProfile.userId;
        const name = state.userProfile.displayName;
        const email = state.email; 
        var lesson = state.lesson ;
        const score = state.score;
          
        try {
          await sendToGoogleSheet(userId, name, email, lesson, score);
          console.log("ข้อมูลถูกบันทึกสำเร็จ");
          await liff.sendMessages([flexMessage]);
          
          // Swal.fire({
          //   title: 'แชร์สำเร็จ',
          //   text: 'ผลคะแนนถูกแชร์ไปยัง LINE ของคุณแล้ว',
          //   icon: 'success',
          //   confirmButtonText: 'ตกลง'
          // }).then(() => {
          //   liff.closeWindow();
          // });
        } catch (error) {
          console.error('Error sharing results:', error);
          Swal.fire({
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถแชร์ผลคะแนนได้ กรุณาลองใหม่อีกครั้ง',
            icon: 'error',
            confirmButtonText: 'ตกลง'
          });
        }
      }
      
        // การเริ่มต้นใช้งาน LIFF และข้อมูล
          async function initializeLIFF() {
              try {
                  await liff.init({ liffId: LIFF_ID });
                  if (liff.isLoggedIn()) {
                      // ตั้งค่าข้อมูลโปรไฟล์ผู้ใช้และอีเมล
                      state.userProfile = await liff.getProfile();
                      const decodedToken = liff.getDecodedIDToken();
                      state.email = decodedToken.email; // ตั้งค่าอีเมลจาก decoded token 

                      // อัปเดตข้อมูลใน DOM
                      document.getElementById('userPicture').src = state.userProfile.pictureUrl;
                      document.getElementById('userName').textContent = state.userProfile.displayName;
                      // document.getElementById('userEmail').textContent = state.email; // ตัวเลือก: เพิ่มถ้าต้องการแสดงอีเมล

                      // เปิดใช้ฟังก์ชันเหล่านี้ถ้าจำเป็น
                      // checkIfAlreadyTaken(state.userProfile.userId);
                      // fetchQuestions();
                  } else {
                      liff.login();
                  }
              } catch (error) {
                  console.error('การเริ่มต้น LIFF ล้มเหลว:', error);
                  showError('ไม่สามารถเชื่อมต่อกับ LINE ได้ กรุณาลองใหม่อีกครั้ง');
              }
          }

        
                function selectSubject(subjectId) {
                // console.log("selectSubject function called with subjectId:", subjectId); // ตรวจสอบว่าฟังก์ชันถูกเรียก

                // Hide subject selection screen
                document.getElementById('subjectSelection').classList.add('hidden');
                // Show loading screen while fetching questions
                document.getElementById('loadingScreen').classList.remove('hidden');

                // Store subjectId in state
                // state.lesson = subjectId;
                // console.log("Selected Subject ID:", state.lesson); // Log the subjectId

                // Fetch questions for the selected subject from Google Sheets
                fetchQuestions(subjectId);
            }


            function fetchQuestions(subjectId) {
                // Call your Google Apps Script Web App with the subjectId as a parameter
                const url = `https://script.google.com/macros/s/AKfycbyEGecABBOETRpo2R1Gtzg0YwgQJjwx8TKZtE-7ke_HfIDzmMCmtYJn2nj5c4Qagwi3KQ/exec?lesson=${subjectId}`;
                // console.log("Fetching questions from URL:", url); // Log the URL for fetching questions

                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        // console.log("Fetched Questions Data:", data); // Log the fetched data

                        // Process and display questions
                        state.questions = getRandomQuestions(data, 50);
                        state.lesson = subjectId;
                        // console.log("Selected Questions:", state.lesson); // Log the selected questions

                        document.getElementById('loadingScreen').classList.add('hidden');
                        document.getElementById('quizContainer').classList.remove('hidden');

                        displayQuestion();
                    })
                    .catch(error => {
                        console.error("Error fetching questions:", error); // Log any errors
                        Swal.fire("Error", "Unable to load questions", "error");
                    });
            }


//         function fetchQuestions(subjectId) {
//             const lesson = 'พรบ.การจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐและกฎหมายลำดับรอง(ระดับต้น)' ;
//             try {
//                 const response = fetch(`https://script.google.com/macros/s/AKfycbyrm59LjB85rWLZD5GOQe7R4wjdCO_PkLv0bHtXB8k_hxIWVYF5gfpOEwJNDnTjcCK6fg/exec?lesson=${encodeURIComponent(subjectId)}`);
//                 if (!response.ok) throw new Error('Network response was not ok');
                
//                 const data = response.json();
//                 state.questions = getRandomQuestions(data, 10);
//                 // state.questions = data;
//                 // document.getElementById('loadingScreen2').classList.add('hidden');
//                 document.getElementById('loadingScreen').classList.add('hidden');
                
//                 document.getElementById('quizContainer').classList.remove('hidden');
                
//                 displayQuestion();
//             } catch (error) {
//                 console.error('Error fetching questions:', error);
//                 showError('ไม่สามารถโหลดข้อสอบได้ กรุณาลองใหม่อีกครั้ง');
//             }
//         }
      
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
            console.log('ข้อมูลถูกบันทึกเรียบร้อย');
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

        // function checkIfAlreadyTaken(userId) {
        //     const previousResult = JSON.parse(localStorage.getItem(userId));
        //     if (previousResult) {
        //         Swal.fire({
        //             title: 'คุณทำข้อสอบนี้แล้ว',
        //             html: `
        //                 <p>คะแนนของคุณคือ: <strong>${previousResult.score}/10</strong></p>
        //                 <p class="mt-2">คุณต้องการทำข้อสอบนี้อีกครั้งหรือไม่?</p>
        //             `,
        //             icon: 'info',
        //             showCancelButton: true,
        //             confirmButtonText: 'ทำอีกครั้ง',
        //             cancelButtonText: 'ปิด',
        //             reverseButtons: true
        //         }).then((result) => {
        //             if (result.isConfirmed) {
        //                 localStorage.removeItem(userId);
        //                 window.location.reload();
        //             } else {
        //                 liff.closeWindow();
        //             }
        //         });
        //     }
        // }
        
         function restartQuiz() {
            state.currentQuestionIndex = 0;
            state.userAnswers = [];
            state.score = 0;
            displayQuestion();
            document.getElementById('scoreCard').classList.add('hidden');
            document.getElementById('quizContainer').classList.remove('hidden');
        }
        
        function restartPages() {
            state.currentQuestionIndex = 0;
            state.userAnswers = [];
            state.score = 0;
            // displayQuestion();
            document.getElementById('scoreCard').classList.add('hidden');
            document.getElementById('subjectSelection').classList.remove('hidden');
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

    // แสดง dialog ยืนยันการส่งคำตอบ
    Swal.fire({
        title: 'ยืนยันการส่งคำตอบ',
        text: 'คุณต้องการส่งคำตอบหรือไม่?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'ส่งคำตอบ',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            // document.getElementById('scoreCard').classList.add('hidden');
            document.getElementById('quizContainer').classList.add('hidden');
            
            
            // เรียกฟังก์ชันที่ใช้ในการคำนวณผลลัพธ์และแชร์ผลลัพธ์
            showResults();
            shareResults();
          
            // document.getElementById('scoreCard').classList.remove('hidden');
            // document.getElementById('scoreCard').classList.remove('hidden');
            
        } else {
            // ถ้ายกเลิกการส่งคำตอบ, ซ่อน loading screen ทันที
            document.getElementById('loadingScreen2').classList.add('hidden');
        }
    });
});
          
        
  
        // Initialize the app
        window.onload = async () => {
            // checkIfDesktop();
            await initializeLIFF();
            // await fetchQuestions();
        };
    

// URL of your Google Apps Script Web App
const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbyT9ybGy5zOTd55RdAglddfPkTjaV8hJWXPGDWhczNcn8el2yaJujL0eGClMUc8-Xc/exec';

async function loadSubjects() {
    // Show the loading spinner
    document.getElementById('loadingScreen3').classList.remove('hidden');

    try {
        // Fetch subjects from the Google Sheet
        const response = await fetch(SHEET_API_URL);
        const data = await response.json();

        // Container for subject buttons
        const container = document.getElementById('subjectButtonsContainer');
        container.innerHTML = ''; // เคลียร์เนื้อหาเดิม

        // Create a button for each subject
        // data.subjects.forEach(subject => {
        //     const button = document.createElement('button');
        //     button.className = 'button mb-4 px-6 py-3 bg-indigo-600 text-white rounded-lg';
        //     button.innerText = subject.name;
        //     button.onclick = () => selectSubject(subject.name);
        //     subjectButtonsContainer.appendChild(button);
        // });
      
         // สร้าง wrapper div สำหรับ flex layout
    const wrapper = document.createElement('div');
    wrapper.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
    
    data.subjects.forEach(subject => {
        // สร้าง div สำหรับแต่ละวิชา
        const subjectCard = document.createElement('div');
        subjectCard.className = 'flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300';
        
        // สร้างส่วนหัวข้อวิชา
        const title = document.createElement('h3');
        title.className = 'text-xl font-bold text-gray-800 mb-2';
        title.textContent = subject.name;
        
        // สร้างส่วนรหัสวิชา
        // const code = document.createElement('p');
        // code.className = 'text-gray-600 mb-4';
        // code.textContent = `รหัสวิชา: ${subject.code}`;
        // code.textContent = `รหัสวิชา: ${subject.id}`;
        
        // สร้างปุ่มสำหรับเลือกวิชา
        const button = document.createElement('button');
        button.className = 'w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-300';
        button.textContent = 'ทำข้อสอบวิชานี้';
        button.onclick = () => selectSubject(subject.name);
        
        // เพิ่มทุกส่วนเข้าใน card
        subjectCard.appendChild(title);
        // subjectCard.appendChild(code);
        subjectCard.appendChild(button);
        
        // เพิ่ม card เข้าใน wrapper
        wrapper.appendChild(subjectCard);
    });
    
    // เพิ่ม wrapper เข้าใน container
    container.appendChild(wrapper);
        
    } catch (error) {
        console.error('Error loading subjects:', error);
    } finally {
        // Hide the loading spinner after the request is complete
        document.getElementById('loadingScreen3').classList.add('hidden');
        document.getElementById('subjectSelection').classList.remove('hidden');
    }
}

// Call the function to load subjects when the page loads
document.addEventListener('DOMContentLoaded', loadSubjects);


// Function to handle subject selection
function selectSubject(subjectName) {
    document.getElementById('subjectSelection').classList.add('hidden');
    document.getElementById('loadingScreen').classList.remove('hidden');
    // Continue to load questions based on the selected subject
    // loadQuizForSubject(subjectName);
    fetchQuestions(subjectName)
}
