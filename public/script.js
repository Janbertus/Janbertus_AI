const chatbox = document.getElementById('chat');
const questionInput = document.getElementById('question');
const statusText = document.getElementById('status');

let loadingInterval = null;

//Markdown Textformatierung
function parseMarkdown(text) {
  return marked.parse(text);
}

// Ladeanimation
function startTypingAnimation() {
  let dots = '';
  loadingInterval = setInterval(() => {
    dots = dots.length < 3 ? dots + '.' : '';
    statusText.textContent = '📝 Antwort wird geschrieben' + dots;
  }, 400);
}

function stopTypingAnimation() {
  clearInterval(loadingInterval);
  statusText.textContent = '';
}

// Frage senden
async function sendQuestion() {
  const question = questionInput.value.trim();
  if (!question) return;

  // Nutzerfrage anzeigen
  addMessage(question, 'user');
  questionInput.value = '';
  startTypingAnimation();

  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });

    const data = await res.json();
    const answer = data.answer || 'Fehler bei der Antwort';

    await typeMessage(answer, 'assistant');
  } catch (err) {
    addMessage('Fehler: ' + err.message, 'assistant');
  }

  stopTypingAnimation();
}

// Nachricht anzeigen
function addMessage(text, role) {
  const bubble = document.createElement('div');
  bubble.className = `message ${role}`;
  bubble.innerHTML = parseMarkdown(text);
  chatbox.appendChild(bubble);
  chatbox.scrollTop = chatbox.scrollHeight;
}




// Tipp-Animation bei KI-Antwort
async function typeMessage(text, role) {
  const bubble = document.createElement('div');
  bubble.className = `message ${role}`;
  chatbox.appendChild(bubble);

  let currentText = '';
  for (let i = 0; i < text.length; i++) {
    currentText += text[i];
    bubble.innerHTML = parseMarkdown(currentText);
    chatbox.scrollTop = chatbox.scrollHeight;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}



// Enter zum Absenden
questionInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendQuestion();
  }
});
