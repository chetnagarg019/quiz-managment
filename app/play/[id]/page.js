// app/play/[id]/page.js
"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; //useParams() → URL se quiz ka id nikalne ke liye (jaise /play/123 → id = 123)
import { defaultQuizzes } from "../../data/route";
import { loadQuizzes, saveQuizzes } from "../../utils/storage";

export default function PlayPage() {
  const params = useParams(); //quizId URL se milta hai. Example: /play/8 → quizId = "8"
  const router = useRouter(); 
  const quizId = params?.id;
  const [quiz, setQuiz] = useState(null); //Current quiz object (title, question, etc.)
  const [index, setIndex] = useState(0); //Abhi kaunsa question chal raha hai (0 = first)
  const [selected, setSelected] = useState(null); //User ne konsa option choose kiya 
  const [score, setScore] = useState(0); //User ke sahi answers ka count
  const [finished, setFinished] = useState(false); //Quiz complete hua ya nahi
  const [answers, setAnswers] = useState([]); // Har question ke answers store karta hai review ke liye

  useEffect(() => {
    const saved = loadQuizzes() || defaultQuizzes;
    const q = saved.find((x) => x.id === quizId);
    if (q) setQuiz(q);
  }, [quizId]);

  if (!quiz) { //👉 Agar quiz null hai (matlab nahi mila), to user ko message dikhata hai aur “Back” button deta hai home page ke liye.
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading quiz... or quiz not found.</p>
        <div className="mt-4">
          <button onClick={() => router.push("/")} className="ml-4 px-3 py-2 bg-gray-200 rounded">Back</button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[index];

  function submitAnswer() {
    if (selected === null) {
      alert("Please choose an option");
      return;
    }
    const correct = selected === question.correctIndex;
    if (correct) setScore((s) => s + 1);

    setAnswers((a) => [...a, { qId: question.id, selected, correctIndex: question.correctIndex }]);

    setSelected(null);

    if (index + 1 < quiz.questions.length) {
      setIndex((i) => i + 1);
    } else {
      // finished
      setFinished(true);

      // Optionally: save attempt (not required, but could be stored in localStorage)
      const attemptsKey = "quiz_attempts_v1";
      try {
        const raw = localStorage.getItem(attemptsKey);
        const arr = raw ? JSON.parse(raw) : [];
        arr.push({ quizId: quiz.id, date: new Date().toISOString(), score: correct ? 1 : 0 }); // simple
        localStorage.setItem(attemptsKey, JSON.stringify(arr));
      } catch (e) {
        console.error(e);
      } 
    }
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setAnswers([]);
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">{quiz.title}</h1> 
        {/* finished ek state bnayi hai jisse ye pta chla rha hai ki quiz complete hua ya nhi  */}
        {!finished ? (
          <>
            <div className="mb-4">
              <div className="text-sm text-gray-600">Question {index + 1} / {quiz.questions.length}</div>
              <div className="mt-2 text-lg font-semibold">{question.question}</div>
            </div>

            <div className="grid gap-2">
              {question.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`text-left p-3 border rounded ${selected === i ? "bg-indigo-100 border-indigo-400" : "bg-gray-50"}`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => router.push("/")} className="px-3 py-2 bg-gray-200 rounded">Exit</button>
              <button onClick={submitAnswer} className="px-4 py-2 bg-indigo-600 text-white rounded">
                {index + 1 === quiz.questions.length ? "Finish" : "Next"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold">Quiz Complete</h2>
              <p className="mt-2">Your score: <span className="font-semibold">{score}</span> / {quiz.questions.length}</p>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Review</h3>
              <div className="space-y-3">
                {quiz.questions.map((q, idx) => {
                  const ans = answers[idx];
                  const chosen = ans ? ans.selected : null;
                  const correctIdx = q.correctIndex;
                  return (
                    <div key={q.id} className="p-3 border rounded bg-gray-50">
                      <div className="font-medium">{q.question}</div>
                      <div className="mt-2">
                        {q.options.map((o, oi) => (
                          <div key={oi} className={`text-sm ${oi === correctIdx ? "text-green-700 font-semibold" : ""} ${oi === chosen && oi !== correctIdx ? "text-red-600" : ""}`}>
                            {oi === chosen ? "👉 " : ""}{o}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <button onClick={restart} className="px-4 py-2 bg-yellow-500 text-white rounded">Retry</button>
              <button onClick={() => router.push("/")} className="px-4 py-2 bg-gray-200 rounded">Back</button>
            </div>
          </>
        )}

        {/* finsih nhi ? opt vala code : score dikhana   */}
      </div>
    </div> 
  );
}
