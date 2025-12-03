// Supabase اتصال
const SUPABASE_URL = "https://zqnqordfetvbzzggmmao.supabase.co";
const SUPABASE_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbnFvcmRmZXR2Ynp6Z2dtbWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTIxNDYsImV4cCI6MjA4MDMyODE0Nn0.A3JSRO7MpxVkMflORIg-KCN-a8Hu522ezCZ1sm3ev4g";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// كلمات الاختبار
const words = ["أحمر", "أزرق", "أخضر", "أصفر", "برتقالي"];
const colorsHex = {
    "أحمر": "#ff3b30",
    "أزرق": "#007aff",
    "أخضر": "#4cd964",
    "أصفر": "#ffeb3b",
    "برتقاني": "#ff9500"
};
const TOTAL = 40;

let current = 0, correct = 0, wrong = 0;
let trialStart = 0, trialData = [];
let studentName = "";

// عناصر الصفحة
const startScreen = document.getElementById("start-screen");
const testContainer = document.getElementById("test-container");
const endScreen = document.getElementById("end-screen");
const wordEl = document.getElementById("word");
const counterEl = document.getElementById("counter");
const timerEl = document.getElementById("timer");

// بدء الاختبار
document.getElementById("start-btn").onclick = () => {
    studentName = document.getElementById("student-name").value.trim();
    if (!studentName) return alert("يرجى كتابة اسم الطالب");

    startScreen.style.display = "none";
    testContainer.style.display = "block";
    newTrial();
};

// جولة جديدة
function newTrial() {
    current++;
    if (current > TOTAL) return finishTest();

    counterEl.textContent = `${current} / ${TOTAL}`;

    let word = pickRandom(words);
    let ink = pickRandom(words.filter(w => w !== word));

    wordEl.textContent = word;
    wordEl.style.color = colorsHex[ink];
    document.body.style.background = colorsHex[ink];

    wordEl.dataset.word = word;
    wordEl.dataset.ink = ink;

    trialStart = performance.now();
}

// الضغط على زر
document.querySelectorAll(".btn").forEach(btn => {
    btn.onclick = () => {
        let answer = btn.dataset.color;
        let ink = wordEl.dataset.ink;
        let rt = Math.round(performance.now() - trialStart);

        if (answer === ink) correct++;
        else wrong++;

        trialData.push({ word: wordEl.dataset.word, ink, answer, rt });

        newTrial();
    };
});

// إنهاء الاختبار
async function finishTest() {
    testContainer.style.display = "none";
    endScreen.style.display = "block";

    const totalTime = trialData.reduce((a, b) => a + b.rt, 0);
    const avgTime = Math.round(totalTime / trialData.length);

    document.getElementById("result-name").textContent = "الاسم: " + studentName;
    document.getElementById("result-correct").textContent = "الإجابات الصحيحة: " + correct;
    document.getElementById("result-wrong").textContent = "الأخطاء: " + wrong;
    document.getElementById("result-time").textContent = "الزمن الكلي: " + totalTime + " مللي ثانية";
    document.getElementById("result-avg").textContent = "المتوسط: " + avgTime + " مللي ثانية";

    // إرسال الى Supabase
    await supabase.from("stroop_results").insert([{
        student: studentName,
        correct: correct,
        wrong: wrong,
        total_time: totalTime,
        avg_time: avgTime
    }]);
}

// اختيار عشوائي
function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
