import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  query,
  orderByChild,
  get,
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
import { firebaseConfig } from "./firebaseConfig.js";

const backButton = document.getElementById("back");
if (backButton) {
  backButton.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}
const app = initializeApp(firebaseConfig);
const database = getDatabase();
const postListRef = ref(database, "ScoresDatabase");

export function submitScore(scoreVal, name) {
  //console.log("submitScore called with score ", scoreVal, firebaseConfig);
  const intScore = parseInt(scoreVal, 10);
  const newPostRef = push(postListRef);
  set(newPostRef, {
    score: intScore,
    username: name,
  });
  //console.log("score sent to database with name: ", name);
} 

const leaderboardDiv = document.getElementById("leaders-and-scores");
if (leaderboardDiv) {
  fetchScoresFromDB();
  //console.log("fetchchScoresFromDB called");
}

function fetchScoresFromDB() {
  displayPlayerHighscore();
  let completeScoreListAsc = [];
  const que = query(ref(database, "ScoresDatabase"), orderByChild("score"));
  get(que)
    .then((snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        completeScoreListAsc.push(data);
      });
      //console.log("full ", completeScoreListAsc);
      getTopTen(completeScoreListAsc);
    })
    .catch((error) => {
      //console.error("Error fetching scoreboard data:", error);
    });
}

function getTopTen(full) {
  let count = 0;
  const users = new Set();
  for (let i = full.length - 1; i >= 0; i--) {
    if (users.has(full[i].username)) {
      continue;
    } else {
      document.getElementById("score" + count).innerHTML = full[i].score;
      document.getElementById("leader" + count).innerHTML = full[i].username;
      users.add(full[i].username);
      count++;
      if (count >= 10) {
        break;
      }
    }
  }
}

function displayPlayerHighscore() {
  const cachedHighscore = localStorage.getItem("cachedHighscore");
  if (cachedHighscore) {
    //console.log("setting cached high score", cachedHighscore);
    const highscore = document.getElementById("your-high-score");
    highscore.innerHTML = cachedHighscore;
  }
}
