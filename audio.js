// voice.js - نظام الأصوات الحقيقي
const VoiceSystem = {
    // أصوات التأثيرات
    sounds: {
        correct: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3'),
        wrong: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3'),
        click: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3'),
        win: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3')
    },

    // نطق الكلمات باللغة الإنجليزية (Web Speech API)
    speakEnglish(word) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            utterance.pitch = 1;
            
            // البحث عن صوت أنثوي أفضل
            const voices = speechSynthesis.getVoices();
            const englishVoice = voices.find(voice => 
                voice.lang === 'en-US' && voice.name.includes('Female')
            );
            
            if (englishVoice) {
                utterance.voice = englishVoice;
            }
            
            speechSynthesis.speak(utterance);
            return true;
        }
        return false;
    },

    // نطق الجمل
    speakSentence(sentence) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(sentence);
            utterance.lang = 'en-US';
            utterance.rate = 0.7; // أبطأ للجمل
            speechSynthesis.speak(utterance);
        }
    },

    // تشغيل صوت التأثير
    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play();
        }
    },

    // التحقق من دعم الصوت
    isSupported() {
        return 'speechSynthesis' in window;
    }
};
