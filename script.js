// --- 1. إعدادات الاتصال بـ Supabase ---
const SUPABASE_URL = "https://zqnqordfetvbzzggmmao.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbnFvcmRmZXR2Ynp6Z2dtbWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTIxNDYsImV4cCI6MjA4MDMyODE0Nn0.A3JSRO7MpxVkMflORIg-KCN-a8Hu522ezCZ1sm3ev4g";

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 2. البيانات والمتغيرات ---
const words = ["أحمر", "أزرق", "أخضر", "أصفر", "برتقالي"];
const colorsHex = {
    "أحمر": "#ff3b30",
    "أزرق": "#007aff",
    "أخضر": "#4cd964",
    "أصفر": "#ffeb3b",
    "برتقالي": "#ff9500"
};

const TOTAL = 40; // عدد الأسئلة
let current = 0, correct = 0, wrong = 0;
let trialStart = 0, trialData = [];
let studentName = "";

// عناصر الواجهة
const startScreen = document.getElementById("start-screen");
const testContainer = document.getElementById("test-container");
const endScreen = document.getElementById("end-screen");
const wordEl = document.getElementById("word");
const counterEl = document.getElementById("counter");

// --- 3. بدء الاختبار ---
document.getElementById("start-btn").onclick = () => {
    studentName = document.getElementById("student-name").value.trim();
    if (!studentName) {
        alert("يرجى كتابة اسم الطالب أولاً");
        return;
    }

    startScreen.style.display = "none";
    testContainer.style.display = "flex"; // flex لتفعيل التوسيط في CSS
    newTrial();
};

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// --- 4. منطق الجولة الجديدة ---
function newTrial() {
    current++;
    if (current > TOTAL) return finishTest();

    counterEl.textContent = `${current} / ${TOTAL}`;

    // اختيار عشوائي
    let wordText = pickRandom(words); // الكلمة المكتوبة (المشتت)
    let bgColor = pickRandom(words);  // لون الخلفية (الإجابة الصحيحة)

    // التأكد من أن الكلمة تختلف عن لون الخلفية (لتحقيق تأثير ستروب)
    while (bgColor === wordText) {
        bgColor = pickRandom(words);
    }

    // تطبيق الألوان
    document.body.style.backgroundColor = colorsHex[bgColor]; // الخلفية تأخذ لون الإجابة
    wordEl.textContent = wordText; // النص داخل المربع

    // حفظ البيانات للمقارنة عند الضغط
    wordEl.dataset.correctAnswer = bgColor; // الإجابة الصحيحة هي لون الخلفية
    wordEl.dataset.distractorWord = wordText;

    trialStart = performance.now();
}

// --- 5. التعامل مع الضغط على الأزرار ---
document.querySelectorAll(".btn").forEach(btn => {
    btn.onclick = () => {
        // منع النقر المتكرر أو النقر بعد انتهاء الاختبار
        if (testContainer.style.display === "none") return;

        let playerAnswer = btn.getAttribute("data-color");
        let correctAnswer = wordEl.dataset.correctAnswer;
        let rt = Math.round(performance.now() - trialStart);

        if (playerAnswer === correctAnswer) {
            correct++;
        } else {
            wrong++;
        }

        // تسجيل بيانات هذه المحاولة
        trialData.push({
            word_shown: wordEl.dataset.distractorWord,
            background_color: correctAnswer,
            player_answer: playerAnswer,
            reaction_time: rt
        });

        newTrial();
    };
});

// --- 6. إنهاء الاختبار والإرسال ---
async function finishTest() {
    // إعادة الخلفية للون رمادي محايد
    document.body.style.backgroundColor = "#333";
    
    testContainer.style.display = "none";
    endScreen.style.display = "block";

    // الحسابات
    const totalTime = trialData.reduce((a, b) => a + b.reaction_time, 0);
    const avgTime = Math.round(totalTime / trialData.length) || 0;

    // عرض النتائج
    document.getElementById("result-name").textContent = "الطالب: " + studentName;
    document.getElementById("result-correct").textContent = "إجابات صحيحة: " + correct;
    document.getElementById("result-wrong").textContent = "أخطاء: " + wrong;
    document.getElementById("result-time").textContent = "الزمن الكلي: " + totalTime + " ms";
    document.getElementById("result-avg").textContent = "المتوسط: " + avgTime + " ms";

    // الإرسال لقاعدة البيانات
    const { error } = await _supabase
        .from("stroop_results")
        .insert([{
            student_name: studentName,
            correct: correct,
            wrong: wrong,
            total_time_ms: totalTime,
            avg_time_ms: avgTime,
            stroop_effect: avgTime
        }]);

    if (error) {
        console.error(error);
        alert("لم يتم الحفظ! تأكد من إعدادات Supabase Policy.");
    } else {
        alert("تم حفظ النتيجة بنجاح ✅");
    }
}
