// app/page.js
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { defaultQuizzes } from "./data/route";
import { loadQuizzes, saveQuizzes } from "./utils/storage";

export default function Page() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);

// agr permanently delet krna hai to ye code 
  // useEffect(() => {
  //   // try load saved quizzes; if none, initialize with defaults
  //   const saved = loadQuizzes();
  //   if (!saved || saved.length === 0) {
  //     saveQuizzes(defaultQuizzes);
  //     setQuizzes(defaultQuizzes);
  //   } else {
  //     setQuizzes(saved);
  //   }
  // }, []);

// vrna ye 
  useEffect(() => {
    const saved = loadQuizzes() || [];
    const merged = [
      ...defaultQuizzes.filter((dq) => !saved.some((sq) => sq.id === dq.id)),
      ...saved,
    ];
    saveQuizzes(merged);
    setQuizzes(merged);
  }, []);

  function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    const updated = quizzes.filter((q) => q.id !== id);
    setQuizzes(updated);
    saveQuizzes(updated);
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-100 to-indigo-100">
      <h1 className="text-4xl font-bold text-center mb-8">
        Quiz Builder — Home
      </h1>

      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => router.push("/create")}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Create New Quiz
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white rounded-xl p-4 shadow-md">
            <h2 className="text-xl font-semibold mb-2">{quiz.title}</h2>
            <p className="text-sm text-gray-600 mb-3">
              {quiz.questions.length} questions
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/play/${quiz.id}`)}
                className="px-3 py-1 bg-green-500 text-white rounded cursor-pointer"
              >
                Play
              </button>

              <button
                onClick={() =>
                  router.push(`/create?id=${encodeURIComponent(quiz.id)}`)
                } //Ye JavaScript ka built-in function hai.Agar quiz.id hai "quiz 1/special",to URL me space aur slash problem karte hain. Matlab ye ensure karta hai ke URL valid rahe aur koi error na aaye.
                className="px-3 py-1 bg-yellow-500 text-white rounded cursor-pointer"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(quiz.id)}
                className="px-3 py-1 bg-red-500 text-white rounded cursor-pointer"
              >
                Delete
              </button>
            </div>
            
          </div>
        ))}
      </div>

      {quizzes.length === 0 && (
        <p className="text-center text-gray-700 mt-8">
          No quizzes — create one!
        </p>
      )}
    </div>
  );
}


