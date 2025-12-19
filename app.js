// تطبيق تعلم اللغات - ملف JavaScript الرئيسي
console.log("أهلاً! تطبيق تعلم اللغات يعمل!");

// بيانات الكلمات
const words = [
    { arabic: "كتاب", english: "Book", example: "I read a book - أنا أقرأ كتاب" },
    { arabic: "قلم", english: "Pen", example: "This is my pen - هذا قلمي" },
    { arabic: "مدرسة", english: "School", example: "I go to school - أنا أذهب إلى المدرسة" }
];

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log("الصفحة جاهزة!");
    
    // تغيير لون الخلفية عند النقر
    document.body.addEventListener('click', function() {
        document.body.style.backgroundColor = 
            document.body.style.backgroundColor === 'lightblue' ? 'white' : 'lightblue';
    });
    
    // عرض أول كلمة
    if (words.length > 0) {
        const firstWord = words[0];
        alert(`الكلمة الأولى: ${firstWord.arabic} = ${firstWord.english}`);
    }
});
