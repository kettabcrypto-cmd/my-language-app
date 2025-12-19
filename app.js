// تطبيق تعلم اللغات - JavaScript الكامل
// ======================================

// 1. بيانات التطبيق
// =================
const vocabulary = {
    en: [ // الإنجليزية
        { word: "Hello", translation: "مرحباً", example: "Hello, how are you? - مرحباً، كيف حالك؟" },
        { word: "Goodbye", translation: "مع السلامة", example: "Goodbye, see you tomorrow - مع السلامة، أرك غداً" },
        { word: "Thank you", translation: "شكراً", example: "Thank you for your help - شكراً على مساعدتك" },
        { word: "Please", translation: "من فضلك", example: "Please sit down - من فضلك اجلس" },
        { word: "Water", translation: "ماء", example: "I need water - أحتاج ماء" },
        { word: "Food", translation: "طعام", example: "The food is delicious - الطعام لذيذ" },
        { word: "Friend", translation: "صديق", example: "He is my best friend - هو أفضل صديق لي" },
        { word: "Family", translation: "عائلة", example: "I love my family - أحب عائلتي" },
        { word: "Home", translation: "منزل", example: "I'm going home - أنا ذاهب إلى المنزل" },
        { word: "Love", translation: "حب", example: "Love is beautiful - الحب جميل" }
    ],
    fr: [ // الفرنسية
        { word: "Bonjour", translation: "مرحباً", example: "Bonjour, comment ça va? - مرحباً، كيف حالك؟" },
        { word: "Merci", translation: "شكراً", example: "Merci beaucoup - شكراً جزيلاً" },
        { word: "Au revoir", translation: "مع السلامة", example: "Au revoir, à demain - مع السلامة، أراك غداً" }
    ],
    es: [ // الإسبانية
        { word: "Hola", translation: "مرحباً", example: "Hola, ¿cómo estás? - مرحباً، كيف حالك؟" },
        { word: "Gracias", translation: "شكراً", example: "Muchas gracias - شكراً جزيلاً" }
    ],
    de: [ // الألمانية
        { word: "Hallo", translation: "مرحباً", example: "Hallo, wie geht's? - مرحباً، كيف حالك؟" },
        { word: "Danke", translation: "شكراً", example: "Danke schön - شكراً جزيلاً" }
    ]
};

// 2. متغيرات التطبيق
// ===================
let currentLanguage = 'en';
let currentCardIndex = 0;
let streak = 0;
let learnedWords = 0;
let userLevel = "مبتدئ";
let currentWords = [];
let cardHistory = [];

// 3. عناصر DOM
// =============
const cardElement = document.getElementById('card');
const wordElement = document.getElementById('word');
const translationElement = document.getElementById('translation');
const exampleElement = document.getElementById('example');
const streakElement = document.getElementById('streak');
const wordsLearnedElement = document.getElementById('words-learned');
const progressFillElement = document.getElementById('progressFill');
const progressTextElement = document.getElementById('progressText');
const levelElement = document.getElementById('level');
const motivationElement = document.getElementById('motivation');

// 4. دوال التطبيق الرئيسية
// =========================

// تهيئة التطبيق عند التحميل
function initApp() {
    console.log("🚀 تطبيق تعلم اللغات يعمل!");
    
    // تحميل التقدم المحفوظ
    loadProgress();
    
    // تعيين اللغة الحالية
    setLanguage(currentLanguage, false);
    
    // إضافة حدث النقر للبطاقة
    cardElement.addEventListener('click', flipCard);
    
    // تحديث الإحصائيات
    updateStats();
    
    // عرض رسالة ترحيب
    showMessage("أهلاً بك! ابدأ رحلة تعلم اللغات 🎯", 3000);
}

// قلب البطاقة
function flipCard() {
    cardElement.classList.toggle('flipped');
    
    // تسجيل التاريخ
    if (!cardElement.classList.contains('flipped')) {
        const cardData = {
            word: currentWords[currentCardIndex].word,
            date: new Date().toLocaleString(),
            difficulty: 'unknown'
        };
        cardHistory.push(cardData);
        console.log("تم تدوير البطاقة:", cardData);
    }
}

// عرض البطاقة الحالية
function showCard(index) {
    if (!currentWords || currentWords.length === 0) {
        console.error("لا توجد كلمات متاحة!");
        return;
    }
    
    const currentCard = currentWords[index];
    
    // تحديث العناصر
    wordElement.textContent = currentCard.word;
    translationElement.textContent = currentCard.translation;
    exampleElement.textContent = currentCard.example;
    
    // إعادة ضبط وضع البطاقة
    cardElement.classList.remove('flipped');
    
    // تحديث شريط التقدم
    updateProgressBar();
}

// التالي
function nextCard() {
    // زيادة العداد
    currentCardIndex = (currentCardIndex + 1) % currentWords.length;
    
    // إذا عدنا للنقطة الأولى، زد المتتالية
    if (currentCardIndex === 0) {
        streak++;
        updateStats();
        showMessage("🎉 أكملت جولة كاملة! استمر في التقدم!", 2000);
    }
    
    // عرض البطاقة الجديدة
    showCard(currentCardIndex);
    
    // حفظ التقدم
    saveProgress();
}

// تقييم الصعوبة
function markEasy() {
    learnedWords += 1;
    showMessage("👏 ممتاز! هذه الكلمة أصبحت سهلة لك", 1500);
    saveProgress();
    setTimeout(nextCard, 1000);
}

function markMedium() {
    learnedWords += 0.7;
    showMessage("💪 جيد! تحتاج إلى ممارسة أكثر", 1500);
    saveProgress();
    setTimeout(nextCard, 1000);
}

function markHard() {
    learnedWords += 0.3;
    showMessage("🔁 لا بأس، سنراجعها مرة أخرى", 1500);
    saveProgress();
    setTimeout(nextCard, 1000);
}

// تعيين اللغة
function setLanguage(lang, showAlert = true) {
    currentLanguage = lang;
    currentWords = vocabulary[lang] || vocabulary['en'];
    currentCardIndex = 0;
    
    const languageNames = {
        'en': 'الإنجليزية',
        'fr': 'الفرنسية',
        'es': 'الإسبانية',
        'de': 'الألمانية'
    };
    
    if (showAlert) {
        showMessage(`🌍 تم اختيار ${languageNames[lang]}! لديك ${currentWords.length} كلمة للتعلم`, 2500);
    }
    
    // تحديث الواجهة
    showCard(currentCardIndex);
    updateProgressBar();
    updateStats();
    
    // تغيير لون الأزرار النشطة
    updateActiveLanguageButton(lang);
}

// تحديث زر اللغة النشط
function updateActiveLanguageButton(activeLang) {
    const buttons = document.querySelectorAll('.language-selector button');
    buttons.forEach(button => {
        if (button.getAttribute('onclick').includes(`'${activeLang}'`)) {
            button.style.background = '#4CAF50';
            button.style.color = 'white';
        } else {
            button.style.background = 'white';
            button.style.color = '#667eea';
        }
    });
}

// تحديث الإحصائيات
function updateStats() {
    // تحديث الأرقام
    streakElement.textContent = streak;
    wordsLearnedElement.textContent = Math.floor(learnedWords);
    
    // تحديث المستوى
    if (learnedWords >= 50) {
        userLevel = "متقدم";
        levelElement.style.color = "#FF6B6B";
    } else if (learnedWords >= 20) {
        userLevel = "متوسط";
        levelElement.style.color = "#4ECDC4";
    } else {
        userLevel = "مبتدئ";
        levelElement.style.color = "#FFD166";
    }
    
    levelElement.textContent = userLevel;
    levelElement.style.fontWeight = "bold";
    
    // تحديث العنوان بناءً على المستوى
    const title = document.querySelector('header h1');
    if (title) {
        title.innerHTML = `<i class="fas fa-language"></i> تطبيق تعلم اللغات <small>(${userLevel})</small>`;
    }
}

// تحديث شريط التقدم
function updateProgressBar() {
    if (!currentWords || currentWords.length === 0) return;
    
    const progressPercentage = ((currentCardIndex + 1) / currentWords.length) * 100;
    progressFillElement.style.width = `${progressPercentage}%`;
    progressTextElement.textContent = `${currentCardIndex + 1}/${currentWords.length}`;
    
    // تغيير لون شريط التقدم
    if (progressPercentage >= 80) {
        progressFillElement.style.background = "#4CAF50"; // أخضر
    } else if (progressPercentage >= 50) {
        progressFillElement.style.background = "#FFB74D"; // برتقالي
    } else {
        progressFillElement.style.background = "#F44336"; // أحمر
    }
}

// عرض الرسائل
function showMessage(message, duration = 2000) {
    motivationElement.textContent = message;
    motivationElement.style.opacity = "1";
    motivationElement.style.transform = "translateY(0)";
    
    setTimeout(() => {
        motivationElement.style.opacity = "0.7";
        motivationElement.style.transform = "translateY(-5px)";
        setTimeout(() => {
            if (learnedWords < 5) {
                motivationElement.textContent = "استمر! كل خطوة تقربك من الطلاقة 💫";
            } else if (learnedWords < 20) {
                motivationElement.textContent = "رائع! أنت تتقدم بسرعة ⚡";
            } else {
                motivationElement.textContent = "مذهل! أنت تصبح محترفاً 🏆";
            }
            motivationElement.style.opacity = "1";
            motivationElement.style.transform = "translateY(0)";
        }, 300);
    }, duration);
}

// 5. نظام حفظ التقدم
// ===================
function saveProgress() {
    const progress = {
        language: currentLanguage,
        streak: streak,
        learnedWords: learnedWords,
        currentCardIndex: currentCardIndex,
        level: userLevel,
        lastSaved: new Date().toISOString()
    };
    
    try {
        localStorage.setItem('languageAppProgress', JSON.stringify(progress));
        console.log("💾 تم حفظ التقدم:", progress);
    } catch (error) {
        console.error("❌ خطأ في حفظ التقدم:", error);
    }
}

function loadProgress() {
    try {
        const saved = localStorage.getItem('languageAppProgress');
        if (saved) {
            const progress = JSON.parse(saved);
            streak = progress.streak || 0;
            learnedWords = progress.learnedWords || 0;
            currentCardIndex = progress.currentCardIndex || 0;
            userLevel = progress.level || "مبتدئ";
            currentLanguage = progress.language || 'en';
            
            console.log("📂 تم تحميل التقدم:", progress);
            showMessage(`مرحباً بعودتك! آخر حفظ: ${new Date(progress.lastSaved).toLocaleDateString('ar-EG')}`, 2500);
        }
    } catch (error) {
        console.error("❌ خطأ في تحميل التقدم:", error);
    }
}

// 6. مميزات إضافية
// =================
function showDailyStats() {
    const today = new Date().toDateString();
    const dailyCards = cardHistory.filter(card => 
        new Date(card.date).toDateString() === today
    ).length;
    
    console.log(`📊 إحصائيات اليوم: ${dailyCards} بطاقة`);
    return dailyCards;
}

function resetProgress() {
    if (confirm("هل تريد حقاً إعادة تعيين كل تقدمك؟")) {
        localStorage.removeItem('languageAppProgress');
        streak = 0;
        learnedWords = 0;
        currentCardIndex = 0;
        userLevel = "مبتدئ";
        
        updateStats();
        showCard(currentCardIndex);
        showMessage("♻️ تم إعادة التعيين. ابدأ من جديد!", 2000);
    }
}

// 7. إضافة أزرار إضافية
function addExtraButtons() {
    // زر إعادة التعيين
    const resetBtn = document.createElement('button');
    resetBtn.innerHTML = '<i class="fas fa-redo"></i> إعادة التعيين';
    resetBtn.style.background = '#FF6B6B';
    resetBtn.style.marginTop = '10px';
    resetBtn.onclick = resetProgress;
    
    // زر الإحصائيات
    const statsBtn = document.createElement('button');
    statsBtn.innerHTML = '<i class="fas fa-chart-bar"></i> إحصائيات اليوم';
    statsBtn.style.background = '#6C63FF';
    statsBtn.style.marginTop = '10px';
    statsBtn.style.marginLeft = '10px';
    statsBtn.onclick = function() {
        const daily = showDailyStats();
        showMessage(`📊 اليوم: ${daily} بطاقة | الإجمالي: ${cardHistory.length}`, 2000);
    };
    
    // إضافة الأزرار لواجهة التحكم
    const controls = document.querySelector('.controls');
    if (controls) {
        controls.appendChild(resetBtn);
        controls.appendChild(statsBtn);
    }
}

// 8. بدء التطبيق
// ===============
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة التطبيق
    initApp();
    
    // إضافة أزرار إضافية
    addExtraButtons();
    
    // إضافة تأثيرات عند التحميل
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.5s";
    
    setTimeout(() => {
        document.body.style.opacity = "1";
    }, 100);
    
    // حفظ التقدم عند إغلاق الصفحة
    window.addEventListener('beforeunload', saveProgress);
    
    // إضافة اختصارات لوحة المفاتيح
    document.addEventListener('keydown', function(event) {
        switch(event.key) {
            case 'ArrowRight':
            case ' ':
                nextCard();
                break;
            case '1':
                markEasy();
                break;
            case '2':
                markMedium();
                break;
            case '3':
                markHard();
                break;
            case 'e':
                setLanguage('en');
                break;
            case 'f':
                setLanguage('fr');
                break;
            case 's':
                setLanguage('es');
                break;
            case 'g':
                setLanguage('de');
                break;
        }
    });
    
    // تعليمات الاختصارات
    console.log(`
    🎮 اختصارات لوحة المفاتيح:
    → أو Space: التالي
    1: سهل | 2: متوسط | 3: صعب
    e: الإنجليزية | f: الفرنسية
    s: الإسبانية | g: الألمانية
    `);
});

// 9. تصدير الدوال للاستخدام في console (للتجارب)
window.appFunctions = {
    nextCard,
    markEasy,
    markMedium,
    markHard,
    setLanguage,
    showDailyStats,
    resetProgress,
    getStats: () => ({
        streak,
        learnedWords: Math.floor(learnedWords),
        level: userLevel,
        currentLanguage,
        currentCard: currentWords[currentCardIndex]
    })
};

console.log("🌟 تطبيق تعلم اللغات جاهز! استخدم window.appFunctions للتحكم بالتطبيق");
