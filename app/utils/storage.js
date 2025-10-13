// app/utils/storage.js

const KEY = "quizzes_v1";

export function loadQuizzes() { // data ko localstorage se lane ke liye 
  try {
    const raw = localStorage.getItem(KEY); //Browser ke localStorage se "quizzes_v1" naam ke data ko read karo aur usse raw variable me daal do.
    return raw ? JSON.parse(raw) : null; //Agar raw me data hai to usse parse karke (object bana ke) return karo,warna null return kar do.
  } catch (e) {
    console.error("loadQuizzes error", e); //Agar try me kuch galat hua (for example JSON parse fail hua),to error console me dikhao aur null return karo.
    return null;
  }

}

export function saveQuizzes(quizzes) {
  try {
    localStorage.setItem(KEY, JSON.stringify(quizzes)); //Quizzes ko string me badal ke localStorage me "quizzes_v1" ke naam se save karo.
  } catch (e) {
    console.error("saveQuizzes error", e); //Agar storage me save karte waqt koi problem hui (jaise memory full ya permission error),to error console me print kar do.
  }
} 


