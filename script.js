// الاتصال بقاعدة Supabase
const SUPABASE_URL = "https://zqnqordfetvbzzggmmao.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbnFvcmRmZXR2Ynp6Z2dtbWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTIxNDYsImV4cCI6MjA4MDMyODE0Nn0.A3JSRO7MpxVkMflORIg-KCN-a8Hu522ezCZ1sm3ev4g";
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// عناصر الصفحة
const startBtn = document.getElementById("startBtn");
const nameInput = document.getElementById("studentName");
const testArea = document.getElementById("testArea");
const wordEl = document.getElementById("word");
const resultArea = document.getElementById("resultArea");

// بيانات الاختبار
const words = ["أحمر", "أصفر", "أخضر", "أزرق", "أسود"];
const colors = ["red", "yellow", "green", "blue", "black"];

let correct = 0;
let wrong = 0;
let totalShown = 0;
let startTime = 0;

// بدء الاختبار
startBtn.onclick = () => {
  const name = nameInput.value.trim();
  if (!name) {
    alert("أدخل اسم الطالب أولاً");
    return;
  }

  startBtn.style.display = "none";
  nameInput.style.display = "none";
  testArea.style.display = "block";
  startTime = performance.now();
  showNextWord(name);
};

// عرض كلمة جديدة
function showNextWord(name) {
  if (totalShown >= 40) {
    finishTest(name);
    return;
  }

  totalShown++;
  const i = Math.floor(Math.random() * words.length);
  const j = Math.floor(Math.random() * colors.length);

  wordEl.textContent = words[i];
  wordEl.style.color = colors[j];

  document.querySelectorAll(".color-btn").forEach((btn) => {
    btn.onclick = () => {
      if (btn.dataset.color === colors[j]) correct++;
      else wrong++;
      showNextWord(name);
    };
  });
}

// إنهاء الاختبار
async function finishTest(name) {
  testArea.style.display = "none";
  resultArea.style.display = "block";

  const totalTime = Math.round((performance.now() - startTime) / 1000);
  const avgTime = Math.round((totalTime / totalShown) * 1000);

  document.getElementById("rName").textContent = "الاسم: " + name;
  document.getElementById("rCorrect").textContent = "إجابات صحيحة: " + correct;
  document.getElementById("rWrong").textContent = "أخطاء: " + wrong;
  document.getElementById("rTotalTime").textContent = "الوقت الكلي: " + totalTime + " ثانية";
  document.getElementById("rAvgTime").textContent = "متوسط الزمن: " + avgTime + " ملّي ثانية";

  // إرسال البيانات إلى Supabase
  const { error } = await db.from("stroop_results").insert([
    {
      student: name,
      correct: correct,
      wrong: wrong,
      total_time: totalTime
    }
  ]);

  if (error) console.error("خطأ في الإرسال:", error);
  else console.log("تم حفظ البيانات بنجاح!");
}
