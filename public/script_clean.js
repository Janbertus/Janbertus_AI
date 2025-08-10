const chatbox = document.getElementById('chat');
const questionInput = document.getElementById('question');

let availableModels = [];
let currentModel = 'gpt-oss:20b';
let sessionId = 'default';
let isRequestInProgress = false;

// 🔧 Konfigurationsvariable mit Default-Werten
let appConfig = {
  server: { port: 3000, host: 'localhost' },
  ollama: { host: 'localhost', port: 11434, defaultModel: 'gpt-oss:20b' },
  chat: { maxConversationLength: 20, typingSpeed: 50 },
  ui: { theme: 'dark', compactMode: false },
  features: { autoScroll: true }
};

// 🌟 Konfiguration laden
async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        if (response.ok) {
            const config = await response.json();
            appConfig = { ...appConfig, ...config };
            console.log('✅ Konfiguration geladen:', appConfig);
        }
    } catch (error) {
        console.warn('⚠️ Fehler beim Laden der Konfiguration:', error);
    }
}

// Frage senden
async function sendQuestion() {
  const question = questionInput.value.trim();
  if (!question || isRequestInProgress) return;

  const kawaiiMode = document.getElementById('kawaii-toggle').checked;
  const selectedModel = document.getElementById('model-select-modal').value || currentModel;

  setRequestInProgress(true);
  addMessage(question, 'user');
  questionInput.value = '';

  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        question, 
        kawaii: kawaiiMode,
        model: selectedModel,
        sessionId: sessionId
      })
    });

    if (!res.ok) {
      throw new Error(`Server-Fehler: ${res.status}`);
    }

    const data = await res.json();
    const answer = data.answer || 'Fehler bei der Antwort';

    // Model-Info aktualisieren falls geändert
    if (data.modelUsed && data.modelUsed !== currentModel) {
      currentModel = data.modelUsed;
      updateModelInfo();
    }
    
    // Konversations-Info aktualisieren
    if (data.conversationLength !== undefined) {
      updateConversationInfo(data.conversationLength);
    }

    await typeMessage(answer, 'assistant');
  } catch (err) {
    console.error('Fehler bei der API-Anfrage:', err);
    addMessage('❌ Fehler: ' + err.message, 'assistant');
  } finally {
    setRequestInProgress(false);
  }
}

// 🛑 Generation stoppen
function stopGeneration() {
  // Placeholder für zukünftige Implementierung
}

// 🚫 UI-Elemente während Request deaktivieren/aktivieren
function setRequestInProgress(inProgress) {
    isRequestInProgress = inProgress;
    
    const sendButton = document.getElementById('send-btn');
    const stopButton = document.getElementById('stop-btn');
    const questionInput = document.getElementById('question');
    const resetButton = document.querySelector('button[onclick="resetConversation()"]');
    
    if (inProgress) {
        if (sendButton) {
            sendButton.disabled = true;
            sendButton.textContent = '⏳ Lädt...';
            sendButton.style.opacity = '0.6';
        }
        
        if (stopButton) {
            stopButton.style.display = 'block';
        }
        
        if (resetButton) {
            resetButton.disabled = true;
            resetButton.style.opacity = '0.6';
        }
        
        if (questionInput) {
            questionInput.disabled = true;
            questionInput.style.opacity = '0.7';
            questionInput.placeholder = 'Warte auf KI-Antwort...';
        }
    } else {
        if (sendButton) {
            sendButton.disabled = false;
            sendButton.textContent = 'Senden';
            sendButton.style.opacity = '1';
        }
        
        if (stopButton) {
            stopButton.style.display = 'none';
        }
        
        if (resetButton) {
            resetButton.disabled = false;
            resetButton.style.opacity = '1';
        }
        
        if (questionInput) {
            questionInput.disabled = false;
            questionInput.style.opacity = '1';
            setRandomPlaceholder();
        }
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
    // Konversations-Info aktualisieren
    loadConversationInfo();
  }
}

// 🗑️ Konversation zurücksetzen
async function resetConversation() {
  if (isRequestInProgress) {
    addMessage('⚠️ Warte bis die aktuelle Anfrage abgeschlossen ist', 'assistant');
    return;
  }

  try {
    const response = await fetch('/api/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
    
    const data = await response.json();
    
    // UI zurücksetzen
    chatbox.innerHTML = '';
    updateConversationInfo(0);
    
    // Bestätigung anzeigen
    addMessage('💭 Konversation wurde zurückgesetzt.', 'assistant');
    
  } catch (error) {
    console.error('Fehler beim Zurücksetzen:', error);
    addMessage('❌ Fehler beim Zurücksetzen der Konversation.', 'assistant');
  }
}

// 📊 Konversations-Info laden
async function loadConversationInfo() {
  try {
    const response = await fetch(`/api/conversation/${sessionId}`);
    const data = await response.json();
    updateConversationInfo(data.messageCount);
  } catch (error) {
    console.error('Fehler beim Laden der Konversations-Info:', error);
  }
}

// 📊 Konversations-Info aktualisieren
function updateConversationInfo(messageCount) {
  const conversationInfo = document.getElementById('conversation-info');
  if (conversationInfo) {
    if (messageCount === 0) {
      conversationInfo.textContent = 'Keine Nachrichten';
    } else {
      conversationInfo.textContent = `${messageCount} Nachrichten im Verlauf`;
    }
  }
}

//Markdown Textformatierung
function parseMarkdown(text) {
  if (typeof marked !== 'undefined') {
    return marked.parse(text);
  }
  return text.replace(/\n/g, '<br>');
}

// Nachricht anzeigen
function addMessage(text, role) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;
  messageDiv.innerHTML = parseMarkdown(text);
  
  chatbox.appendChild(messageDiv);
  
  // Auto-Scroll wenn aktiviert
  if (appConfig.features.autoScroll) {
    chatbox.scrollTop = chatbox.scrollHeight;
  }
}

// Tipp-Animation bei KI-Antwort
async function typeMessage(text, role) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;
  chatbox.appendChild(messageDiv);
  
  // Auto-Scroll wenn aktiviert
  if (appConfig.features.autoScroll) {
    chatbox.scrollTop = chatbox.scrollHeight;
  }
  
  const words = text.split(' ');
  let displayedText = '';
  
  for (let i = 0; i < words.length; i++) {
    displayedText += (i === 0 ? '' : ' ') + words[i];
    messageDiv.innerHTML = parseMarkdown(displayedText);
    
    if (appConfig.features.autoScroll) {
      chatbox.scrollTop = chatbox.scrollHeight;
    }
    
    // Kurze Pause zwischen Wörtern
    await new Promise(resolve => setTimeout(resolve, appConfig.chat.typingSpeed || 50));
  }
}

// Enter zum Absenden
questionInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter' && !isRequestInProgress) {
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
  loadAvailableModels();
  loadConfig();
});

// 🤖 Model-Select Change Handler
document.addEventListener('DOMContentLoaded', () => {
  const modelSelect = document.getElementById('model-select-modal');
  if (modelSelect) {
    modelSelect.addEventListener('change', (e) => {
      currentModel = e.target.value;
      updateModelInfo();
    });
  }
});

// ⚙️ Settings Modal: Schließen bei Klick außerhalb
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        toggleSettings();
      }
    });
  }
});

// 🎯 Placeholder-Vorschlag direkt senden können (Doppelklick)
questionInput.addEventListener('dblclick', () => {
  if (questionInput.value.trim() === '' && !isRequestInProgress) {
    questionInput.value = questionInput.placeholder.replace('z.B. ', '');
    sendQuestion();
  }
});
