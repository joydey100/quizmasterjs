/* ========================
 ! - Important DOM Elements
 ==========================*/
const darkModeToggle = document.querySelector("#chk");
const modalOpenBtn = document.getElementById("condition-modal-btn");
const modalContainer = document.querySelector(".quiz-modal-container");
const modalConditionBox = modalContainer.querySelector(".quiz-modal-condition");
const exitModal = modalConditionBox.querySelector(".exit-modal");
const startQuizBtn = modalConditionBox.querySelector(".start-quiz");
const questionSection = document.querySelector(".question-section");
const questionText = questionSection.querySelector(".question-text");
const questionOptionContainer =
  questionSection.querySelector(".question-options");
const questionProgressText = questionSection.querySelector(
  ".question-progress-text"
);
const timeText = questionSection.querySelector(".time-count");
const nextQuiz = questionSection.querySelector(".next-question");
const scoreElement = questionSection.querySelector(".score");
const timelineElement = questionSection.querySelector(".timeline");
const questionProgressbar = questionSection.querySelector(".question-progress");
const resultSection = document.querySelector(".result-section");
const canvas = document.getElementById("my-canvas");
const resultExpression = resultSection.querySelector(".result-expression");
const resultText = resultSection.querySelector(".result-text");
const resultFeedback = resultSection.querySelector(".feedback");
const restart = resultSection.querySelector(".restart");
const backHome = resultSection.querySelector(".back-to-home");
const loadingContainer = document.querySelector(".loading-container");

/* =====================
 ! - Important Variables - *
 =======================*/
let questionIndex = 0;
let timeCount;
let userScore = 0;
let counter; // it will track the timer
let timelineCounter;

/* ===================
 ! - Important Elements - *
 =====================*/
// tick icon
const tick = document.createElement("div");
tick.classList.add("tick-icon");
tick.innerHTML = `<i class="fa-solid fa-check"></i>`;

// cross icon
const cross = document.createElement("div");
cross.classList.add("cross-icon");
cross.innerHTML = `<i class="fa-solid fa-xmark"></i>`;

/* ===================
 ! - Confetti Settings - *
 ====================*/
var confettiSettings = {
  target: "my-canvas",
  max: "250",
  size: "1.8",
  rotate: true,
  clock: "29",
  start_from_edge: true,
};
var confetti = new ConfettiGenerator(confettiSettings);

/* ========================
 ! - Important Functions - *
 ==========================*/

/*
 ! - Modal Open/Close Fuction - *
 */
const modalFunc = (condition) => {
  if (condition === "open") {
    modalConditionBox.classList.add("active");
    document.body.style.overflow = "hidden";
    if (document.body.classList.contains("dark-mode")) {
      modalContainer.classList.add("active-dark");
    } else {
      modalContainer.classList.add("active");
    }
  } else {
    modalConditionBox.classList.remove("active");
    document.body.style.overflow = "auto";
    if (document.body.classList.contains("dark-mode")) {
      modalContainer.classList.remove("active-dark");
    } else {
      modalContainer.classList.remove("active");
    }
  }
};

/*
! - Initial show Function
 * - // initial setup before showing question
* - // it is used in for later restart and back to home event listener
 */
const initialShowQuestion = () => {
  //Remove the result sections
  resultSection.classList.remove("active");
  canvas.style.display = "none";

  // the question and score will start from the 0
  questionIndex = 0;
  userScore = 0;
  scoreElement.textContent = userScore;
};

/*
 ! - Show Question Function - *
 */
const showQuestion = () => {
  // show Question Section
  questionSection.classList.add("active");

  // Start the timer
  timer();

  // Start the timelineFunc
  timelineFunc();

  // If there is any single option, remove the all option
  if (document.querySelectorAll(".single-option")) {
    document
      .querySelectorAll(".single-option")
      .forEach((element) => element.remove());
  }

  // showing question text
  questionText.textContent = `${questionIndex + 1}. ${
    quizArr[questionIndex].question
  }`;

  // Showing question Options
  const options = quizArr[questionIndex].options;

  for (let option in options) {
    let singleQuestionElement = document.createElement("div");
    singleQuestionElement.classList.add("single-option");
    singleQuestionElement.innerHTML = `
    <span class="single-option-text"> ${option}.  ${options[option]}</span>`;
    singleQuestionElement.addEventListener("click", (e) =>
      selectedAnswer(option, e)
    );
    questionOptionContainer.append(singleQuestionElement);
  }

  // Question Progress Text
  questionProgress();

  // user can not see the next quiz button initially
  nextQuiz.style.display = "none";
};

/*
 ! - Timeline Fuction - *
 */
const timelineFunc = () => {
  // initially the width will be 100%
  timelineElement.style.width = `100%`;
  timeText.textContent = 10;

  timelineCounter = setInterval(() => {
    // get the time
    const getTime = Number(timeText.textContent);

    // the width will change, according to the time
    timelineElement.style.width = `${getTime * 10}%`;
  }, 1000);
};

/*
 ! - After select an option, this selected answer function will be triggered - *
 */
const selectedAnswer = (option, e) => {
  // clear the time
  clearInterval(counter);

  // clear the timeline
  clearInterval(timelineCounter);

  // Get the Correct Answer
  const selectedOption = option;
  const correctOption = quizArr[questionIndex].answer;
  //  Checking condition
  if (selectedOption === correctOption) {
    userScore += 5;
    scoreElement.textContent = userScore;
    showIconTick(e, true);
  } else {
    showIconTick(e, false);
    showCorrectAnswer();
  }

  // After selected an option, User can not select any of the option again
  const singleOption = document.querySelectorAll(".single-option");
  singleOption.forEach((element) => element.classList.add("disabled"));

  // show the next question button
  nextQuizBtnChange();
};

/*
! - Show Icon Tick Function
*/
const showIconTick = (e, isTick) => {
  if (e.target.classList.contains("single-option")) {
    e.target.children[0].insertAdjacentElement(
      "afterend",
      isTick === true ? tick : cross
    );
    e.target.classList.add(isTick === true ? "correct" : "incorrect");
  } else {
    e.target.insertAdjacentElement("afterend", isTick === true ? tick : cross);
    e.target.parentNode.classList.add(
      isTick === true ? "correct" : "incorrect"
    );
  }
};

/*
! - Show Correct Answer Function
*/
const showCorrectAnswer = () => {
  // find all single options
  const singleOption = document.getElementsByClassName("single-option");

  // correct answer
  const correctOption = quizArr[questionIndex].answer;

  // looping the option and show the correct option with tick
  for (let option of singleOption) {
    if (option.textContent.trim().slice(0, 1) == correctOption) {
      option.children[0].insertAdjacentElement("afterend", tick);
      option.classList.add("correct");
    }

    // After showing the correct Answer, disable all the option
    option.classList.add("disabled");
  }
};

/*
! -  Question Progress Function
*/
const questionProgress = () => {
  // Question Progress Loading
  questionProgressbar.style.width = `${
    ((questionIndex + 1) / quizArr.length) * 100
  }%`;

  // Question Progress Text
  questionProgressText.innerHTML = `<span class="bold">${
    questionIndex + 1
  } </span> of  <span class="bold">${quizArr.length}</span> Questions`;
};

/*
! - Timer Function
*/
const timer = () => {
  // initially the time start from 10 seconds
  timeCount = 10;
  timeText.textContent = timeCount;
  counter = setInterval(() => {
    timeCount--;
    timeText.textContent = timeCount;
    if (timeCount == 0) {
      // The score and the timeline width will be 0
      timeText.textContent = "0" + timeCount;
      timelineElement.style.width = `0%`;

      // Clear the time counter and timeline counter
      clearInterval(counter);
      clearInterval(timelineCounter);

      // show the correct answer
      showCorrectAnswer();

      // show the next question button
      nextQuizBtnChange();
    } else {
      // Show the time
      timeText.textContent = "0" + timeCount;
    }
  }, 1000);
};

/*
! - Next Quiz Button Change function
*/
const nextQuizBtnChange = () => {
  nextQuiz.style.display = "block";
  if (questionIndex === quizArr.length - 1) {
    nextQuiz.textContent = "Show Result";
  } else {
    nextQuiz.textContent = "Next Question";
  }
};

/*
! - Show Result Function
*/
const showResult = () => {
  questionSection.classList.remove("active");
  resultSection.classList.add("active");
  canvas.style.display = "block";

  // Show the result in the result text
  resultText.textContent = `You scored ${userScore} points`;

  // Giving feedback
  scoreFeedback(userScore);
};

/*
! - Score Feedback Function
*/
const scoreFeedback = (userScore) => {
  // the result will show according to the score
  if (userScore >= 80 && userScore <= 100) {
    confettiStart();
    resultFeedback.textContent = `You are an expert in JavaScript, well done on your outstanding performance. Keep up the good work and continue to showcase your skills.`;
  } else if (userScore >= 60 && userScore < 80) {
    confettiStart();
    resultFeedback.textContent = `You have a solid understanding of JavaScript, keep working to improve your skills and understanding. Your performance is good, but with additional practice and focus, you can excel in this subject. `;
  } else if (userScore >= 40 && userScore < 60) {
    confettiStart();
    resultFeedback.textContent = `You have a fair understanding of JavaScript, but there is room for improvement. It's important to continue practicing and reviewing the material to solidify your understanding and skills. I suggest seeking additional resources and assistance to help you improve in this subject.`;
  } else {
    confetti.clear();
    resultExpression.textContent = `Needs Improvement!!!`;
    resultFeedback.textContent = `The result of this quiz is not satisfactory, it's clear that you have a limited understanding of JavaScript. It's important to put in extra effort and seek assistance to improve your understanding and skills in this subject. I suggest reviewing the material and practicing regularly in order to improve your performance.`;
  }
};

/*
! - Confetti Start Functionality
*/
const confettiStart = () => {
  setTimeout(() => confetti.render(), 500);
};

/* ==========================
! - Event Listeners
============================*/

// Switch dark mode event listener
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// Modal Open Button Event listener
modalOpenBtn.addEventListener("click", () => {
  modalFunc("open");
});

// Exit Modal Button Event Listener
exitModal.addEventListener("click", () => {
  modalFunc("close");
});

//When Click on the modal container, the modal will be closed
modalContainer.addEventListener("click", (e) => {
  if (e.target == modalContainer) {
    modalFunc("close");
  }
});

// Start Quiz Event Listener
startQuizBtn.addEventListener("click", () => {
  // Close the modal
  modalFunc("close");

  // before question start, there will be a loading state, after the first question, the loading option will not be shown
  if (questionIndex === 0) {
    loadingContainer.style.display = "flex";
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      loadingContainer.style.display = "none";
      showQuestion();
    }, 2500);
  } else {
    //   Show the question
    showQuestion();
  }

  // From the beginning the score will be 0
  scoreElement.textContent = 0;
});

// Next Quiz Event listener
nextQuiz.addEventListener("click", () => {
  // Increasing the question index
  questionIndex++;

  // if the question completed then the result will show
  if (questionIndex > quizArr.length - 1) {
    showResult();
  } else {
    // Show the Question
    showQuestion();
  }
});

// Restart Event functionality
restart.addEventListener("click", () => {
  // some initial task will show before shoing question
  // like - removing the result section, and reset the time and score as well
  initialShowQuestion();

  // before question start, there will be a loading state, after the first question, the loading option will not be shown
  if (questionIndex === 0) {
    loadingContainer.style.display = "flex";
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      loadingContainer.style.display = "none";
      showQuestion();
    }, 2500);
  } else {
    //   Show the question
    showQuestion();
  }
});

// Back To Home Event listner
backHome.addEventListener("click", () => {
  // some initial task will show before shoing question
  // like - removing the result section, and reset the time and score as well
  initialShowQuestion();
});
