const questions = [
    {
        question: "What is the powerhouse of the cell?",
        options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
        answer: 1
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Jupiter", "Mars", "Saturn"],
        answer: 2
    },
    {
        question: "Who wrote 'Romeo and Juliet'?",
        options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
        answer: 1
    }
];

let currentQuestionIndex = 0;
let score = 0;

const startScreen = document.getElementById('start-screen');
const questionScreen = document.getElementById('question-screen');
const resultScreen = document.getElementById('result-screen');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const progressFill = document.getElementById('progress');
const scoreText = document.getElementById('score-text');

const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');

startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
});
restartBtn.addEventListener('click', startQuiz);

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    startScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    questionScreen.classList.remove('hidden');
    showQuestion();
}

function showQuestion() {
    const q = questions[currentQuestionIndex];
    questionText.textContent = q.question;
    optionsContainer.innerHTML = '';
    nextBtn.classList.add('hidden');

    q.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('option-btn');
        button.addEventListener('click', () => selectOption(index));
        optionsContainer.appendChild(button);
    });

    const progress = ((currentQuestionIndex) / questions.length) * 100;
    progressFill.style.width = `${progress}%`;
}

function selectOption(index) {
    const q = questions[currentQuestionIndex];
    const buttons = optionsContainer.querySelectorAll('.option-btn');
    
    buttons.forEach(btn => btn.disabled = true);
    
    if (index === q.answer) {
        score++;
        buttons[index].style.background = '#22c55e'; // Green
    } else {
        buttons[index].style.background = '#ef4444'; // Red
        buttons[q.answer].style.background = '#22c55e'; // Highlight correct answer
    }

    nextBtn.classList.remove('hidden');
    
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressFill.style.width = `${progress}%`;
}

function showResult() {
    questionScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    scoreText.textContent = `Your score: ${score} / ${questions.length}`;
}
