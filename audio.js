// نظام إدارة الأصوات
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.isMuted = false;
    }

    // تهيئة نظام الصوت
    init() {
        if (window.AudioContext || window.webkitAudioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.loadDefaultSounds();
        } else {
            console.warn('Web Audio API غير مدعوم في هذا المتصفح');
        }
    }

    // تحميل الأصوات الأساسية
    loadDefaultSounds() {
        // أصوات الكلمات الإنجليزية
        this.sounds['hello'] = this.createSound(261.63, 0.5); // C4
        this.sounds['goodbye'] = this.createSound(293.66, 0.5); // D4
        this.sounds['thank_you'] = this.createSound(329.63, 0.5); // E4
        
        // أصوات التأثيرات
        this.sounds['correct'] = this.createChord([523.25, 659.25], 0.3); // C5 + E5
        this.sounds['wrong'] = this.createSound(220, 0.3); // A3
        this.sounds['level_up'] = this.createArpeggio([261.63, 329.63, 392.00], 0.5);
        this.sounds['click'] = this.createSound(800, 0.1);
    }

    // إنشاء نغمة بسيطة
    createSound(frequency, duration) {
        return () => {
            if (this.isMuted || !this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }

    // إنشاء آكورد (أكثر من نغمة)
    createChord(frequencies, duration) {
        return () => {
            if (this.isMuted || !this.audioContext) return;
            
            frequencies.forEach(freq => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'triangle';
                
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            });
        };
    }

    // تشغيل صوت الكلمة
    playWord(word, language = 'en') {
        if (this.isMuted) return;
        
        const wordKey = word.toLowerCase().replace(' ', '_');
        
        if (this.sounds[wordKey]) {
            this.sounds[wordKey]();
        } else {
            // استخدام Web Speech API إذا متاح
            this.speakText(word, language);
        }
        
        // لعب صوت النقر
        this.playClick();
    }

    // استخدام Web Speech API (أفضل للكلمات الحقيقية)
    speakText(text, language = 'en') {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            
            // تعيين اللغة
            const voices = {
                'en': 'en-US',
                'fr': 'fr-FR',
                'es': 'es-ES',
                'de': 'de-DE'
            };
            
            utterance.lang = voices[language] || 'en-US';
            utterance.rate = 0.8; // سرعة أبطأ
            utterance.pitch = 1;
            
            // البحث عن صوت مناسب
            const availableVoices = speechSynthesis.getVoices();
            const preferredVoice = availableVoices.find(voice => 
                voice.lang.startsWith(language)
            );
            
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
            
            speechSynthesis.speak(utterance);
        }
    }

    // أصوات التأثيرات
    playCorrect() {
        if (this.sounds.correct) this.sounds.correct();
    }

    playWrong() {
        if (this.sounds.wrong) this.sounds.wrong();
    }

    playLevelUp() {
        if (this.sounds.level_up) this.sounds.level_up();
    }

    playClick() {
        if (this.sounds.click) this.sounds.click();
    }

    // التحكم في الصوت
    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }

    setVolume(level) {
        // يمكن إضافة تحكم في مستوى الصوت
    }
}

// إنشاء نسخة عامة
const audioManager = new AudioManager();
