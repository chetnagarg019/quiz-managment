// app/utils/storage.js
const KEY = "quizzes_v1";

export function loadQuizzes() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("loadQuizzes error", e);
    return null;
  }
}

export function saveQuizzes(quizzes) {
  try {
    localStorage.setItem(KEY, JSON.stringify(quizzes));
  } catch (e) {
    console.error("saveQuizzes error", e);
  }
}
