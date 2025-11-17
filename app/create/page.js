
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { defaultQuizzes } from "../data/route";
import { loadQuizzes, saveQuizzes } from "../utils/storage";

function emptyQuestion(idSuffix = "") {
  return {
    id: `q-${Date.now()}-${idSuffix}`,
    question: "",
    options: ["", "", "", ""],
    correctIndex: 0,
  };
}

export default function CreatePage() {
  const router = useRouter();
  const [editId, setEditId] = useState(null); //editId: agar user kisi existing quiz ko edit kar raha hai to uska ID.
  const [title, setTitle] = useState(""); 
  const [questions, setQuestions] = useState([emptyQuestion("init")]); //“initial ek blank question object bana do jiska id ke end me word init lage.”

  console.log("Questions array:", questions);

  // 🟢 FIX: useEffect me window.searchParams se ID le rahe hain
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      if (id) setEditId(id);
    }
  }, []); 

  // 🟢 Load quiz data for edit mode 
  useEffect(() => { //Ye tab run hota hai jab hum edit pe click karte hain (matlab editId me koi value aa jaati hai)
    if (editId) {
      const saved = loadQuizzes() || defaultQuizzes; //loadQuizzes() se localStorage me se saved quizzes aati hain. Agar app pehli baar chal rahi hai to defaultQuizzes se sample data milta hai.
      const q = saved.find((x) => x.id === editId); //Example: agar editId = 8, to ye check karega x.id === 8 har quiz ke liye, jab tak match na mil jaaye.
      if (q) {
        setTitle(q.title); 
        setQuestions(q.questions.map((qq) => ({ ...qq })));
      }
      
    }
  }, [editId]); //Ye effect tab chalega jab editId change hota hai, ya page load hone ke baad editId milta hai.

  function addQuestion() {
    setQuestions((s) => [...s, emptyQuestion(s.length)]);
    //  console.log("After adding question:", newArray);
    // return newArray;
  }

  function removeQuestion(index) {
    setQuestions((s) => s.filter((_, i) => i !== index)); //“Sirf un items ko rakho jinka index remove karne wale index ke barabar na ho”
  }

  function updateQuestion(index, newQuestion) {
    setQuestions((s) => s.map((q, i) => (i === index ? newQuestion : q)));
   
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a quiz title");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        alert(`Question ${i + 1} is empty`);
        return;
      }
      if (q.options.some((opt) => !opt.trim())) {
        alert(`All 4 options required for question ${i + 1}`);
        return;
      }
    }

    const saved = loadQuizzes() || defaultQuizzes;
    if (editId) {
      const updated = saved.map((s) =>
        s.id === editId ? { ...s, title: title.trim(), questions } : s
      );
      saveQuizzes(updated);
    } else {
      const newQuiz = {
        id: `quiz-${Date.now()}`,
        title: title.trim(),
        questions,
      };
      saved.push(newQuiz);
      saveQuizzes(saved);
    }

    alert("Quiz saved!");
    router.push("/");
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
          {editId ? "✏️ Edit Quiz" : "🧠 Create New Quiz"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Enter quiz title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-400"
            required
          />

          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="border rounded-lg p-4 bg-gray-50 shadow-sm transition hover:shadow-md"
            >
              <div className="flex justify-between items-center mb-3">
                <strong className="text-indigo-700">
                  Question {idx + 1}
                </strong>
                {questions.length > 1 && ( // ques ki length 1 se jyada hai to ye dikhega vrna nhi 
                  <button 
                    type="button"
                    onClick={() => removeQuestion(idx)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Enter question text..."
                value={q.question}
                onChange={(e) =>
                  updateQuestion(idx, { ...q, question: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-300"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={q.correctIndex === oi}
                      onChange={() =>
                        updateQuestion(idx, { ...q, correctIndex: oi })
                      }
                    />

                    <input
                      type="text"
                      placeholder={`Option ${oi + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...q.options];
                        newOptions[oi] = e.target.value;
                        updateQuestion(idx, { ...q, options: newOptions });
                      }}
                      className="flex-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                ))}
              </div>

            </div>
          ))}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={addQuestion}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
              + Add Question
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
            >
              Save Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

