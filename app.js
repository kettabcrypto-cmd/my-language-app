// تطبيق تعلم اللغات - النسخة البسيطة
console.log("✅ تطبيق تعلم اللغات يعمل!");

// البيانات الأساسية
const words = [
    { english: "Hello", arabic: "مرحباً", sentence: "Hello, how are you?" },
    { english: "Goodbye", arabic: "مع السلامة", sentence: "Goodbye, see you tomorrow" },
    { english: "Thank you", arabic: "شكراً", sentence: "Thank you very much" },
    { english: "Please", arabic: "من فضلك", sentence: "Please sit down" },
    { english: "Water", arabic: "ماء", sentence: "I drink water every day" }
];

let currentWordIndex = 0;
let score = 0;
let streak = 0;
let level = 1;

// عرض التطبيق
function renderApp() {
    const app = document.getElementById('app');
    if (!app) {
        console.error("❌ عنصر #app غير موجود!");
        return;
    }
    
    app.innerHTML = `
        <div class="container">
            <header>
                <h1>🌍 تعلم اللغات</h1>
                <p>1000+ كلمة مع أصوات حقيقية</p>
                
                <div class="stats-bar">
                    <div class="stat-item">
                        <span class="stat-value" id="total-words">${score}</span>
                        <span class="stat-label">كلمة مكتسبة</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" id="xp">${score * 10}</span>
                        <span class="stat-label">XP نقطة</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" id="streak">${streak}</span>
                        <span class="stat-label">يوم متتالي</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" id="level">${level}</span>
                        <span class="stat-label">مستوى</span>
                    </div>
                </div>
            </header>
            
            <main>
                <div class="exercise-card">
                    <h2>اختبر نفسك</h2>
                    <div class="word-display">
                        <span id="word">${words[currentWordIndex].english}</span>
                    </div>
                    <div class="sentence-display">
                        "${words[currentWordIndex].sentence}"
                    </div>
                    
                    <div class="audio-controls">
                        <button class="audio-btn" onclick="playSound()">
                            <i class="fas fa-volume-up"></i> استمع للنطق
                        </button>
                    </div>
                    
                    <div class="options-grid">
                        ${getOptionsHTML()}
                    </div>
                    
                    <div class="controls">
                        <button class="action-btn btn-secondary" onclick="showLessonMenu()">
                            <i class="fas fa-book"></i> اختيار درس آخر
                        </button>
                        <button class="action-btn btn-primary" onclick="nextWord()">
                            التالي <i class="fas fa-arrow-left"></i>
                        </button>
                    </div>
                </div>
            </main>
            
            <footer>
                <div class="progress-container">
                    <div class="progress-header">
                        <span>التقدم</span>
                        <span>${currentWordIndex + 1}/${words.length}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill" style="width: ${((currentWordIndex + 1) / words.length) * 100}%"></div>
                    </div>
                </div>
            </footer>
        </div>
    `;
}

// إنشاء خيارات الإجابة
function getOptionsHTML() {
    const currentWord = words[currentWordIndex];
    const options = [
        currentWord.arabic,
        words[(currentWordIndex + 1) % words.length].arabic,
        words[(currentWordIndex + 2) % words.length].arabic,
        words[(currentWordIndex + 3) % words.length].arabic
    ].sort(() => Math.random() - 0.5);
    
    return options.map(option => `
        <button class="option-btn" onclick="checkAnswer('${option}', '${currentWord.arabic}')">
            ${option}
        </button>
    `).join('');
}

// التحقق من الإجابة
function checkAnswer(selected, correct) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent.trim() === correct) {
            btn.classList.add('correct');
        }
        if (btn.textContent.trim() === selected && selected !== correct) {
            btn.classList.add('wrong');
        }
    });
    
    if (selected === correct) {
        score++;
        streak++;
        showMessage('🎉 إجابة صحيحة! +10 نقطة', 'success');
    } else {
        streak = 0;
        showMessage('❌ الإجابة الصحيحة: ' + correct, 'error');
    }
    
    updateStats();
}

// الكلمة التالية
function nextWord() {
    currentWordIndex = (currentWordIndex + 1) % words.length;
    renderApp();
}

// تشغيل الصوت
function playSound() {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(words[currentWordIndex].english);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    } else {
        showMessage('⚠️ خاصية الصوت غير مدعومة في متصفحك', 'info');
    }
}

// تحديث الإحصائيات
function updateStats() {
    document.getElementById('total-words').textContent = score;
    document.getElementById('xp').textContent = score * 10;
    document.getElementById('streak').textContent = streak;
    document.getElementById('level').textContent = Math.floor(score / 5) + 1;
}

// عرض الرسائل
function showMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = text;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        background: ${type === 'success' ? '#58CC02' : type === 'error' ? '#FF4B4B' : '#1CB0F6'};
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// عند تحميل الصفحة
window.onload = function() {
    console.log("📱 صفحة التطبيق محملة");
    renderApp();
    showMessage('مرحباً! ابدأ رحلة تعلم اللغات 🚀', 'info');
};

// إضافة أنيميشن
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

console.log("✨ التطبيق جاهز للعمل!");
