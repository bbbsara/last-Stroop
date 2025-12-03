// إعداد الاتصال مع Supabase
const SUPABASE_URL = "https://zqnqordfetvbzzggmmao.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbnFvcmRmZXR2Ynp6Z2dtbWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTIxNDYsImV4cCI6MjA4MDMyODE0Nn0.A3JSRO7MpxVkMflORIg-KCN-a8Hu522ezCZ1sm3ev4g";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// كلمات ستروب
const words = ["أحمر", "أصفر", "أخضر", "أزرق", "أسود"];
const colors = ["red", "yellow", "green", "blue", "black"];

let student = "";
let correct = 0;
let wrong = 0;
let totalTime = 0;
let trials = 0;
let startTime = 0;

// عناصر الواجهة
const startBtn = document.getElementById("startBtn");
const testDiv = document.getElementById("test");
const infoDiv = document.getElementById("info");
const resultDiv = document.getElementById("result");
const wordDiv = document.getElementById("word");
const buttonsDiv = document.getElementById("buttons");
const timerDiv = document.getElementById("timer");

// بدأ الاختبار
startBtn.onclick = () => {
    student = document.getElementById("studentName").value.trim();
    if (!student) {
        alert("أدخل اسم الطالب");
        return;
    }

    infoDiv.style.display = "none";
    testDiv.style.display = "block";

    startTime = performance.now();
    nextWord();
};

// عرض كلمة جديدة
function nextWord() {
    if (trials >= 40) return finishTest();

    let i = Math.floor(Math.random() * words.length);
    let j = Math.floor(Math.random() * colors.length);

    wordDiv.textContent = words[i];
    wordDiv.style.color = colors[j];

    buttonsDiv.innerHTML = "";
    colors.forEach((c) => {
        let btn = document.createElement("button");
        btn.textContent = c;
        btn.onclick = () => check(c, colors[j]);
        buttonsDiv.appendChild(btn);
    });

    trials++;
}

// التحقق من الإجابة
function check(answer, correctColor) {
    if (answer === correctColor) correct++;
    else wrong++;

    nextWord();
}

// انتهاء الاختبار
function finishTest() {
    testDiv.style.display = "none";
    resultDiv.style.display = "block";

    const end = performance.now();
    totalTime = Math.round((end - startTime) / 1000);

    document.getElementById("resName").textContent = "الاسم: " + student;
    document.getElementById("resCorrect").textContent = "الإجابات الصحيحة: " + correct;
    document.getElementById("resWrong").textContent = "الأخطاء: " + wrong;
    document.getElementById("resTotalTime").textContent = "الوقت الكلي: " + totalTime + " ثانية";

    sendToSupabase();
}

// إرسال للقاعدة
async function sendToSupabase() {
    const { data, error } = await db.from("stroop_results").insert([
        {
            student: student,
            correct: correct,
            wrong: wrong,
            total_time: totalTime
        }
    ]);

    if (error) {
        document.getElementById("sendStatus").textContent = "فشل إرسال البيانات!";
        console.log(error);
    } else {
        document.getElementById("sendStatus").textContent =
            "تم الإرسال بنجاح إلى قاعدة Supabase";
    }
}
