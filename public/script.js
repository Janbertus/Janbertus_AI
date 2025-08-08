const chatbox = document.getElementById('chat');
const questionInput = document.getElementById('question');
const statusText = document.getElementById('status');

let loadingInterval = null;
let availableModels = [];
let currentModel = 'gpt-oss:20b';

// 🔄 Intelligente Scroll-Funktion - scrollt nur wenn User bereits unten war
function smartScroll() {
  const isAtBottom = chatbox.scrollTop >= chatbox.scrollHeight - chatbox.clientHeight - 50;
  if (isAtBottom) {
    chatbox.scrollTop = chatbox.scrollHeight;
  }
}

// 🎲 Zufällige Beispielfragen
const exampleQuestions = [
  "Was ist ein Quantentunnel?",
  "Wie funktioniert künstliche Intelligenz?",
  "Erkläre mir die Relativitätstheorie",
  "Was sind schwarze Löcher?",
  "Wie entsteht ein Regenbogen?",
  "Was ist der Unterschied zwischen Viren und Bakterien?",
  "Wie funktioniert das Internet?",
  "Was ist Photosynthese?",
  "Erkläre mir Machine Learning",
  "Was ist DNA und wie funktioniert sie?",
  "Wie entstehen Träume?",
  "Was ist ein Algorithmus?",
  "Wie funktioniert ein Computer?",
  "Was ist der Treibhauseffekt?",
  "Erkläre mir die Evolution",
  "Was sind Atome?",
  "Wie funktioniert eine Rakete?",
  "Was ist Blockchain?",
  "Wie entstehen Erdbeben?",
  "Was ist Virtual Reality?"
];

// 🎯 Zufällige Beispielfrage auswählen
function setRandomPlaceholder() {
  const randomQuestion = exampleQuestions[Math.floor(Math.random() * exampleQuestions.length)];
  questionInput.placeholder = `z.B. ${randomQuestion}`;
  // Aktuelle Frage für Klick-Funktion speichern
  questionInput.dataset.currentSuggestion = randomQuestion;
}

// 🤖 Verfügbare Modelle laden
async function loadAvailableModels() {
  const ollamaStatus = document.getElementById('ollama-status');
  const modelSelect = document.getElementById('model-select-modal');
  const modelDisplay = document.getElementById('model-display');
  
  try {
    ollamaStatus.innerHTML = '🔄 Verbinde...';
    
    const response = await fetch('/api/models');
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Server-Fehler');
    }
    
    availableModels = data.models;
    
    // Select leeren und neue Optionen hinzufügen
    modelSelect.innerHTML = '';
    
    if (availableModels.length === 0) {
      modelSelect.innerHTML = '<option value="">❌ Keine Modelle gefunden</option>';
      modelDisplay.textContent = 'Ollama: Keine Modelle';
      ollamaStatus.innerHTML = '❌ Keine Modelle verfügbar';
      return;
    }
    
    // Modelle nach Kategorie gruppieren und hinzufügen
    const categories = {};
    availableModels.forEach(model => {
      if (!categories[model.category]) {
        categories[model.category] = [];
      }
      categories[model.category].push(model);
    });
    
    // Optionen hinzufügen
    Object.keys(categories).forEach(category => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = category;
      
      categories[category].forEach(model => {
        const option = document.createElement('option');
        option.value = model.name;
        option.textContent = `${model.name} (${formatFileSize(model.size)})`;
        optgroup.appendChild(option);
      });
      
      modelSelect.appendChild(optgroup);
    });
    
    // Standard-Modell auswählen
    const defaultModel = data.defaultModel;
    if (availableModels.find(m => m.name === defaultModel)) {
      modelSelect.value = defaultModel;
      currentModel = defaultModel;
    } else {
      currentModel = availableModels[0].name;
      modelSelect.value = currentModel;
    }
    
    updateModelInfo();
    ollamaStatus.innerHTML = `✅ ${availableModels.length} Modelle verfügbar`;
    
  } catch (error) {
    console.error('Fehler beim Laden der Modelle:', error);
    modelSelect.innerHTML = '<option value="">❌ Verbindung fehlgeschlagen</option>';
    ollamaStatus.innerHTML = '❌ Ollama nicht erreichbar';
    modelDisplay.textContent = 'Ollama: Offline';
    
    // Fallback auf Standard-Modell
    currentModel = 'gpt-oss:20b';
  }
}

// 📊 Dateigröße formatieren
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// 📝 Model-Info aktualisieren
function updateModelInfo() {
  const modelInfo = document.getElementById('model-info-modal');
  const modelDisplay = document.getElementById('model-display');
  
  if (currentModel) {
    const model = availableModels.find(m => m.name === currentModel);
    if (model) {
      modelInfo.innerHTML = `
        <small>
          ${model.description}<br>
          Größe: ${formatFileSize(model.size)}
        </small>
      `;
      modelDisplay.textContent = `${model.name}`;
    } else {
      modelDisplay.textContent = currentModel;
    }
  }
}

// ⚙️ Settings Modal Toggle
function toggleSettings() {
  const modal = document.getElementById('settings-modal');
  const isVisible = modal.style.display === 'flex';
  modal.style.display = isVisible ? 'none' : 'flex';
  
  if (!isVisible) {
    // Modal wird geöffnet - Modelle neu laden falls nötig
    if (availableModels.length === 0) {
      loadAvailableModels();
    }
  }
}

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

  const kawaiiMode = document.getElementById('kawaii-toggle').checked;
  const selectedModel = document.getElementById('model-select-modal').value || currentModel;

  addMessage(question, 'user');
  questionInput.value = '';
  setRandomPlaceholder(); // 🎲 Neue zufällige Frage nach dem Senden
  updateSuggestionButton(); // 💡 Button-Sichtbarkeit aktualisieren
  startTypingAnimation();

  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        question, 
        kawaii: kawaiiMode,
        model: selectedModel 
      })
    });

    const data = await res.json();
    const answer = data.answer || 'Fehler bei der Antwort';

    // Model-Info aktualisieren falls geändert
    if (data.modelUsed && data.modelUsed !== currentModel) {
      currentModel = data.modelUsed;
      updateModelInfo();
    }

    await typeMessage(answer, 'assistant');
  } catch (err) {
    addMessage('❌ Fehler: ' + err.message, 'assistant');
  }

  stopTypingAnimation();
}


// Nachricht anzeigen
function addMessage(text, role) {
  const bubble = document.createElement('div');
  bubble.className = `message ${role}`;
  bubble.innerHTML = parseMarkdown(text);
  chatbox.appendChild(bubble);
  chatbox.scrollTop = chatbox.scrollHeight; // Bei neuen Nachrichten immer scrollen
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
    smartScroll(); // 🔄 Intelligentes Scrolling statt forciertem Scroll
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  // Final complete rendering
  bubble.innerHTML = parseMarkdown(text);
}

// Enter zum Absenden
questionInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendQuestion();
  }
});

// Kawaii-Toggle aktiv beobachten
const kawaiiToggle = document.getElementById('kawaii-toggle');
kawaiiToggle.addEventListener('change', () => {
  document.body.classList.toggle('kawaii-mode', kawaiiToggle.checked);
});

// 🎲 Zufällige Beispielfrage beim Laden der Seite setzen
document.addEventListener('DOMContentLoaded', () => {
  setRandomPlaceholder();
  updateSuggestionButton();
  loadAvailableModels(); // 🤖 Modelle laden
});

// 🤖 Model-Select Change Handler
document.addEventListener('DOMContentLoaded', () => {
  const modelSelect = document.getElementById('model-select-modal');
  modelSelect.addEventListener('change', (e) => {
    currentModel = e.target.value;
    updateModelInfo();
  });
});

// ⚙️ Settings Modal: Schließen bei Klick außerhalb
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('settings-modal');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      toggleSettings();
    }
  });
});

// 🎯 Placeholder-Vorschlag direkt senden können (Doppelklick)
questionInput.addEventListener('dblclick', () => {
  // Nur wenn das Input leer ist und ein Vorschlag da ist
  if (questionInput.value.trim() === '' && questionInput.dataset.currentSuggestion) {
    questionInput.value = questionInput.dataset.currentSuggestion;
    sendQuestion();
  }
});

// 💡 Funktion zum Senden des Vorschlags
function sendSuggestion() {
  if (questionInput.dataset.currentSuggestion && questionInput.value.trim() === '') {
    questionInput.value = questionInput.dataset.currentSuggestion;
    sendQuestion();
  }
}

// 🔄 Suggestion-Button Sichtbarkeit
function updateSuggestionButton() {
  const suggestionBtn = document.getElementById('suggestion-btn');
  if (questionInput.value.trim() === '' && questionInput.dataset.currentSuggestion) {
    suggestionBtn.style.display = 'block';
    suggestionBtn.title = `Sende: "${questionInput.dataset.currentSuggestion}"`;
  } else {
    suggestionBtn.style.display = 'none';
  }
}

// Input-Änderungen überwachen
questionInput.addEventListener('input', updateSuggestionButton);
