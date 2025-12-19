// نظام إدارة التطبيق الكامل
class LanguageLearningApp {
    constructor() {
        this.currentScreen = 'loading';
        this.currentLanguage = 'en';
        this.currentUser = null;
        this.lessons = [];
        this.currentLessonIndex = 0;
        this.currentExerciseIndex = 0;
        this.userProgress = {};
        this.xp = 0;
        this.level = 1;
        this.streak = 0;
        
        this.audioManager = audioManager;
        
        this.exercises = [
            { type: 'flashcard', duration: 2 },
            { type: 'multiple-choice', duration: 3 },
            { type: 'matching', duration: 4 },
            { type: 'listening', duration: 3 },
            { type: 'speaking', duration: 4 }
        ];
    }

    // تهيئة التطبيق
    init() {
        // تهيئة نظام الصوت
        this.audioManager.init();
        
        // تحميل البيانات
        this.loadLessons();
        this.loadUserProgress();
        
        // عرض شاشة التحميل أولاً
        this.showScreen('loading');
        
        // محاكاة التحميل
        setTimeout(() => {
            if (this.currentUser) {
                this.showScreen('main');
            } else {
                this.showScreen('register');
            }
        }, 2000);
    }

    // تحميل الدروس
    loadLessons() {
        this.lessons = [
            {
                id: 1,
                title: "المستوى 1: التحيات",
                description: "تعلم التحيات الأساسية",
                exercises: [
                    {
                        type: 'flashcard',
                        word: 'Hello',
                        translation: 'مرحباً',
                        options: ['مرحباً', 'شكراً', 'مع السلامة', 'من فضلك'],
                        correct: 0,
                        sound: 'hello'
                    },
                    {
                        type: 'multiple-choice',
                        question: 'ماذا تعني كلمة "Goodbye"؟',
                        options: ['مرحباً', 'شكراً', 'مع السلامة', 'أهلاً'],
                        correct: 2,
                        word: 'Goodbye',
                        sound: 'goodbye'
                    },
                    {
                        type: 'matching',
                        pairs: [
                            ['Hello', 'مرحباً'],
                            ['Thank you', 'شكراً'],
                            ['Goodbye', 'مع السلامة']
                        ]
                    },
                    {
                        type: 'listening',
                        word: 'Hello',
                        translation: 'مرحباً'
                    }
                ],
                requiredXP: 0
            },
            {
                id: 2,
                title: "المستوى 2: العائلة",
                description: "أفراد العائلة",
                exercises: [
                    // ... تمارين أخرى
                ],
                requiredXP: 50
            }
            // ... دروس أخرى
        ];
    }

    // إظهار شاشة معينة
    showScreen(screenName) {
        // إخفاء جميع الشاشات
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // إظهار الشاشة المطلوبة
        const screen = document.getElementById(screenName + '-screen');
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenName;
            
            // تشغيل صوت النقر
            this.audioManager.playClick();
            
            // تحميل محتوى الشاشة
            this.loadScreenContent(screenName);
        }
    }

    // تحميل محتوى الشاشة
    loadScreenContent(screenName) {
        switch(screenName) {
            case 'main':
                this.loadLesson();
                break;
            case 'learn':
                this.showLessonSelection();
                break;
            case 'profile':
                this.showUserProfile();
                break;
        }
    }

    // تحميل الدرس الحالي
    loadLesson() {
        const lesson = this.lessons[this.currentLessonIndex];
        const exercise = lesson.exercises[this.currentExerciseIndex];
        
        const lessonArea = document.getElementById('lesson-area');
        
        // استخدام القالب المناسب
        const template = document.getElementById(exercise.type + '-template');
        if (template) {
            const clone = template.content.cloneNode(true);
            lessonArea.innerHTML = '';
            lessonArea.appendChild(clone);
            
            // تعبئة البيانات
            this.populateExercise(exercise);
        }
    }

    // تعبئة التمرين بالبيانات
    populateExercise(exercise) {
        switch(exercise.type) {
            case 'flashcard':
                document.getElementById('word-text').textContent = exercise.word;
                // تعيين الأزرار
                const buttons = document.querySelectorAll('.option');
                buttons.forEach((btn, index) => {
                    btn.textContent = exercise.options[index];
                    btn.onclick = () => this.checkAnswer(exercise.correct === index);
                });
                break;
                
            case 'listening':
                // إعداد زر الاستماع
                document.querySelector('.play-btn').onclick = () => {
                    this.audioManager.speakText(exercise.word, this.currentLanguage);
                };
                break;
        }
    }

    // التحقق من الإجابة
    checkAnswer(isCorrect) {
        if (isCorrect) {
            // تشغيل صوت صحيح
            this.audioManager.playCorrect();
            
            // إضافة نقاط
            this.addXP(10);
            
            // عرض رسالة النجاح
            this.showMessage('🎉 إجابة صحيحة! +10 نقطة', 'success');
            
            // الانتقال للتمرين التالي
            this.nextExercise();
        } else {
            // تشغيل صوت خطأ
            this.audioManager.playWrong();
            
            // خسارة قلب
            this.loseHeart();
            
            // عرض رسالة الخطأ
            this.showMessage('❌ حاول مرة أخرى', 'error');
        }
    }

    // التمرين التالي
    nextExercise() {
        const lesson = this.lessons[this.currentLessonIndex];
        
        this.currentExerciseIndex++;
        
        if (this.currentExerciseIndex >= lesson.exercises.length) {
            // انتهى الدرس
            this.completeLesson();
        } else {
            // تحميل التمرين التالي
            this.loadLesson();
        }
    }

    // إكمال الدرس
    completeLesson() {
        // تشغيل صوت النجاح
        this.audioManager.playLevelUp();
        
        // إضافة نقاط إضافية
        this.addXP(50);
        
        // عرض شاشة النجاح
        this.showSuccessScreen();
        
        // تحديث التقدم
        this.saveProgress();
    }

    // إضافة نقاط الخبرة
    addXP(amount) {
        this.xp += amount;
        
        // تحديث واجهة المستخدم
        this.updateXPDisplay();
        
        // التحقق من المستوى
        this.checkLevelUp();
    }

    // تحديث عرض النقاط
    updateXPDisplay() {
        const xpFill = document.getElementById('xp-fill');
        const xpPercent = (this.xp % 100); // 100 نقطة لكل مستوى
        if (xpFill) {
            xpFill.style.width = `${xpPercent}%`;
        }
        
        // تحديث العداد
        const xpText = document.querySelector('.xp-text');
        if (xpText) {
            xpText.textContent = `${this.xp} XP`;
        }
    }

    // التحقق من الترقية لمستوى جديد
    checkLevelUp() {
        const oldLevel = this.level;
        this.level = Math.floor(this.xp / 100) + 1;
        
        if (this.level > oldLevel) {
            // تشغيل صوت الترقية
            this.audioManager.playLevelUp();
            
            // عرض رسالة الترقية
            this.showMessage(`🎊 مبروك! وصلت للمستوى ${this.level}`, 'level-up');
        }
    }

    // خسارة قلب
    loseHeart() {
        const hearts = document.getElementById('hearts');
        let heartCount = parseInt(hearts.textContent);
        
        if (heartCount > 0) {
            heartCount--;
            hearts.textContent = heartCount;
            
            if (heartCount === 0) {
                // نفذت القلوب
                this.showOutOfHearts();
            }
        }
    }

    // حفظ التقدم
    saveProgress() {
        this.userProgress = {
            language: this.currentLanguage,
            lessonsCompleted: this.currentLessonIndex + 1,
            xp: this.xp,
            level: this.level,
            streak: this.streak,
            lastPlayed: new Date().toISOString()
        };
        
        localStorage.setItem('languageAppProgress', JSON.stringify(this.userProgress));
    }

    // تحميل التقدم
    loadUserProgress() {
        const saved = localStorage.getItem('languageAppProgress');
        if (saved) {
            this.userProgress = JSON.parse(saved);
            this.xp = this.userProgress.xp || 0;
            this.level = this.userProgress.level || 1;
            this.streak = this.userProgress.streak || 0;
            this.currentLanguage = this.userProgress.language || 'en';
        }
    }

    // رسائل للمستخدم
    showMessage(text, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;
        
        document.body.appendChild(messageDiv);
        
        // إخفاء الرسالة بعد 3 ثواني
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    // بدء التعلم
    startLearning() {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        
        if (username && email) {
            this.currentUser = { username, email };
            this.showScreen('language');
        }
    }

    // اختيار اللغة
    selectLanguage(lang) {
        this.currentLanguage = lang;
        this.showScreen('main');
        
        // تشغيل صوت الترحيب باللغة المختارة
        this.audioManager.speakText('Welcome', lang);
    }
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const app = new LanguageLearningApp();
    window.app = app; // لجعل التطبيق متاحاً في الكونسول
    app.init();
});
