// app/create/page.js
"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { defaultQuizzes } from "../data/route";
import { loadQuizzes, saveQuizzes } from "../utils/storage";

function emptyQuestion(idSuffix = "") {
  return {
    id: `q-${Date.now()}-${idSuffix}`,
    question: "",
    options: ["", "", "", ""],
    correctIndex: 0
  };
}

export default function CreatePage() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params?.get("id") || null;

  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([emptyQuestion("init")]);

  useEffect(() => {
    // If editing, load quiz
    if (editId) {
      const saved = loadQuizzes() || defaultQuizzes;
      const q = saved.find((x) => x.id === editId);
      if (q) {
        setTitle(q.title);
        setQuestions(q.questions.map((qq) => ({ ...qq })));
      }
    }
  }, [editId]);

  function addQuestion() {
    setQuestions((s) => [...s, emptyQuestion(s.length)]);
  }

  function removeQuestion(index) {
    setQuestions((s) => s.filter((_, i) => i !== index));
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
    // basic validation: each question should have non-empty text and 4 non-empty options
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
      // update
      const updated = saved.map((s) =>
        s.id === editId ? { ...s, title: title.trim(), questions } : s
      );
      saveQuizzes(updated);
    } else {
      // new
      const newQuiz = {
        id: `quiz-${Date.now()}`,
        title: title.trim(),
        questions
      };
      saved.push(newQuiz);
      saveQuizzes(saved);
    }

    alert("Quiz saved!");
    router.push("/");
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">{editId ? "Edit Quiz" : "Create Quiz"}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Quiz title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />

          {questions.map((q, idx) => (
            <div key={q.id} className="border rounded p-3">
              <div className="flex justify-between items-center mb-2">
                <strong>Question {idx + 1}</strong>
                <div className="flex gap-2">
                  {questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(idx)} className="text-red-600">
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <input
                type="text"
                placeholder="Question text"
                value={q.question}
                onChange={(e) =>
                  updateQuestion(idx, { ...q, question: e.target.value })
                }
                className="w-full border px-2 py-2 rounded mb-2"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={q.correctIndex === oi}
                      onChange={() => updateQuestion(idx, { ...q, correctIndex: oi })}
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
                      className="flex-1 border px-2 py-2 rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <button type="button" onClick={addQuestion} className="px-3 py-2 bg-gray-200 rounded">
              + Add Question
            </button>

            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">
              Save Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
