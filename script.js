// --- 1. إعدادات الاتصال (لا تغير هذه الرموز) ---
const SUPABASE_URL = "https://zqnqordfetvbzzggmmao.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbnFvcmRmZXR2Ynp6Z2dtbWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTIxNDYsImV4cCI6MjA4MDMyODE0Nn0.A3JSRO7MpxVkMflORIg-KCN-a8Hu522ezCZ1sm3ev4g";

// التحقق من تحميل المكتبة
if (typeof supabase === 'undefined') {
    alert("تنبيه: مكتبة Supabase لم تتحمل بشكل صحيح. تأكد من اتصال الإنترنت.");
}

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 2. متغيرات اللعبة ---
const words = ["أحمر", "أزرق", "أخضر", "أصفر", "برتقالي"];
const colorsHex = {
    "أحمر": "#ff3b30",
    "أزرق": "#007aff",
    "أخضر": "#4cd964",
    "أصفر": "#ffeb3b",
    "برتقالي": "#ff9500"
};

// عدد المحاولات (يمكنك تقليله للتجربة، مثلاً اجعله 5)
const TOTAL = 40; 

let current = 0, correct = 0, wrong = 0;
let trialStart = 0, trialData = [];
let studentName = "";

// عناصر HTML
const startScreen = document.getElementById("start-screen");
const testContainer = document.getElementById("test-container");
const endScreen = document.getElementById("end-screen");
const wordEl = document.getElementById("word");
const counterEl = document.getElementById("counter");

// --- 3. بدء الاختبار ---
document.getElementById("start-btn").onclick = () => {
    studentName = document.getElementById("student-name").value.trim();
    
    if (!studentName) {
        alert("يرجى كتابة اسم الطالب أولاً!");
        return;
    }

    startScreen.style.display = "none";
    testContainer.style.display = "block";
    newTrial();
};

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// --- 4. جولة جديدة ---
function newTrial() {
    current++;
    if (current > TOTAL) {
        finishTest();
        return;
    }

    counterEl.textContent = `${current} / ${TOTAL}`;

    let word = pickRandom(words);
    let ink = pickRandom(words);

    // جعل الاختبار "صعباً" دائماً (لون الحبر يختلف عن الكلمة)
    while (ink === word) {
        ink = pickRandom(words);
    }

    wordEl.textContent = word;
    wordEl.style.color = colorsHex[ink];
    
    // ملاحظة: ألغيت تغيير خلفية الصفحة لكي لا يختفي النص
    
    wordEl.dataset.word = word;
    wordEl.dataset.ink = ink;

    trialStart = performance.now();
}

// --- 5. التعامل مع ضغط الأزرار ---
document.querySelectorAll(".btn").forEach(btn => {
    btn.onclick = () => {
        // منع النقر إذا انتهى الاختبار
        if (testContainer.style.display === "none") return;

        let answer = btn.getAttribute("data-color");
        let ink = wordEl.dataset.ink;
        
        // حساب زمن رد الفعل
        let rt = Math.round(performance.now() - trialStart);

        if (answer === ink) {
            correct++;
        } else {
            wrong++;
        }

        // حفظ بيانات المحاولة الحالية
        trialData.push({ word: wordEl.dataset.word, ink, answer, rt });
        
        // الانتقال للتالي
        newTrial();
    };
});

// --- 6. إنهاء الاختبار والإرسال ---
async function finishTest() {
    testContainer.style.display = "none";
    endScreen.style.display = "block";

    // الحسابات النهائية
    const totalTime = trialData.reduce((a, b) => a + b.rt, 0);
    const avgTime = Math.round(totalTime / trialData.length) || 0;
    
    // عرض النتيجة للطالب
    document.getElementById("result-name").textContent = "الاسم: " + studentName;
    document.getElementById("result-correct").textContent = "الإجابات الصحيحة: " + correct;
    document.getElementById("result-wrong").textContent = "الأخطاء: " + wrong;
    document.getElementById("result-time").textContent = "الزمن الكلي: " + totalTime + " ms";
    document.getElementById("result-avg").textContent = "متوسط الزمن: " + avgTime + " ms";

    console.log("...جاري إرسال البيانات إلى Supabase");

    // الإرسال الفعلي لقاعدة البيانات
    const { data, error } = await _supabase
        .from("stroop_results")
        .insert([{
            student_name: studentName,
            correct: correct,
            wrong: wrong,
            total_time_ms: totalTime,
            avg_time_ms: avgTime,
            stroop_effect: avgTime // نستخدم المتوسط كمقياس حالياً
        }])
        .select();

    if (error) {
        console.error("Supabase Error:", error);
        alert("حدثت مشكلة في حفظ البيانات! \n" + error.message);
    } else {
        console.log("Success:", data);
        alert("✅ تم حفظ نتيجتك بنجاح في النظام!");
    }
}
