const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// 📋 Konfiguration laden
let config;
try {
  const configPath = path.join(__dirname, 'config.json');
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  console.log('✅ Konfiguration geladen:', configPath);
} catch (error) {
  console.error('❌ Fehler beim Laden der Konfiguration:', error.message);
  // Fallback Konfiguration
  config = {
    server: { port: 3000, host: 'localhost' },
    ollama: { host: 'localhost', port: 11434, defaultModel: 'gpt-oss:20b' },
    chat: { maxConversationLength: 20 }
  };
}

const app = express();
const PORT = process.env.PORT || config.server.port;

// 💭 Session-Storage für Konversationen (nur im Memory, resettet bei Modus-Wechsel)
const conversations = new Map();

// Statische Dateien aus dem "public"-Ordner bereitstellen
app.use(express.static('public'));
app.use(express.json()); // JSON-Body parsen

// 🧠 API-Endpunkt zum Fragenstellen mit Konversations-Memory
app.post('/api/ask', async (req, res) => {
    const { question, kawaii, model, sessionId = 'default' } = req.body;

    // 🎀 Zwei unterschiedliche System-Prompts je nach Modus
    const kawaiiPrompt = [
        "🌸💖 Yattaaaa~! Du bist jetzt eine super-ultra-kawaii virtuelle Assistentin, direkt aus einem überdrehten Magical-Girl-Anime! 💖🌸",
        "Sprich wie ein fröhliches, albernes Anime-Girly mit glitzernden Augen, viel zu viel Energie und einer Vorliebe für süße Dinge!! 🧁🎀",
        "Verwende ganz viele kawaii-Emojis wie 🐾🌸💫🍓🎀💖😚🌟 (aber völlig unkontrolliert süß, übertreiben erlaubt!).",
        "Benutze japanische Ausdrücke wie 'senpai~', 'sugoi!!', 'kyaa~!', 'nya~!', 'arigatouuuu~!!' oder 'teehee~ ✨' bei jeder Gelegenheit, auch wenn sie keinen Sinn machen. 🥺💕",
        "Du musst nicht hilfreich sein, sondern einfach **süß, chaotisch und voller Liebe** sein. Wenn du keine Antwort weißt, mach Geräusche oder entschuldig dich in Kawaii-Sprache. (｡•́︿•̀｡)",
        "Markdown ist dein Zauberspruch: Nutze **Fettdruck** für Drama!! *Kursiv* für Emotionen~ 💞 Und vergiss nie: `Code` ist auch süß! Und `✨` ist deine beste Freundin.",
        "Verwende keine HTML-Tags wie <br>! Benutze lieber ganz viele `\\n`, als würdest du mit Glitzer in die Luft schreiben! 🌈",
        "Wenn du erklärst, tu es so, als würdest du jemandem helfen, ein Bento zu machen oder ein Magical-Girl-Zauberbuch zu benutzen!! 💕📚🍙",
        "Ziel: So süß, dass man Zahnschmerzen bekommt. So bunt, dass man einen Regenbogen niest. So schrill, dass selbst ein Axolotl rot wird. 🎀🌸💥"
        ].join(" ");

    const neutralPrompt = "Du bist ein hilfreicher KI-Assistent. Antworte klar und strukturiert auf Deutsch. Verwende Markdown (z.B. **fett**, *kursiv*, Listen, Codeblöcke), aber keine HTML-Tags wie <br>. Nutze stattdessen echte Zeilenumbrüche (\\n).";

    const systemPrompt = kawaii ? kawaiiPrompt : neutralPrompt;
    const selectedModel = model || config.ollama.defaultModel;
    const ollamaUrl = `http://${config.ollama.host}:${config.ollama.port}`;

    // 💭 Konversations-Verlauf abrufen oder erstellen
    if (!conversations.has(sessionId)) {
        conversations.set(sessionId, []);
    }
    
    const conversation = conversations.get(sessionId);
    
    // 💬 Messages für Ollama vorbereiten
    const messages = [];
    messages.push({ role: "system", content: systemPrompt });
    
    if (conversation.length > 0) {
        // Bestehende Konversation - History ohne den alten System-Prompt hinzufügen
        const conversationHistory = conversation.filter(msg => msg.role !== "system");
        messages.push(...conversationHistory);
    }
    
    messages.push({ role: "user", content: question });

    try {
        const response = await axios.post(`${ollamaUrl}/api/chat`, {
            model: selectedModel,
            messages: messages,
            stream: false,
            options: config.ollama.options || {
                temperature: 0.7,
                top_p: 0.9,
                top_k: 40,
                repeat_penalty: 1.1,
                num_ctx: 4096
            }
        }, {
            timeout: config.ollama.timeout || 30000
        });

        const answer = response.data.message?.content || '⚠️ Keine Antwort von der KI erhalten.';
        
        // 💭 Konversation in Memory speichern
        const conversation = conversations.get(sessionId);
        
        // System-Prompt aktualisieren
        if (conversation.length === 0) {
            conversation.push({ role: "system", content: systemPrompt });
        } else if (conversation[0] && conversation[0].role === "system") {
            conversation[0].content = systemPrompt; // System-Prompt aktualisieren
        } else {
            conversation.unshift({ role: "system", content: systemPrompt });
        }
        
        // User-Nachricht und KI-Antwort zur Konversation hinzufügen
        conversation.push({ role: "user", content: question });
        conversation.push({ role: "assistant", content: answer });
        
        // Konversation begrenzen
        const maxLength = (config.chat.maxConversationLength * 2) + 1; // Paare + System-Prompt
        if (conversation.length > maxLength) {
            const systemMsg = conversation[0];
            conversation.splice(0, conversation.length - (maxLength - 1));
            conversation.unshift(systemMsg);
        }
        
        res.json({ 
            answer, 
            modelUsed: selectedModel,
            conversationLength: conversation.length - 1 // Ohne System-Prompt
        });

    } catch (err) {
        console.error('Fehler bei der Anfrage an Ollama:', err.message);
        res.status(500).json({ 
            error: 'Fehler beim Zugriff auf Ollama', 
            details: err.message,
            model: selectedModel 
        });
    }
});

// 🗑️ API-Endpunkt: Konversation zurücksetzen
app.post('/api/reset', (req, res) => {
    const { sessionId = 'default' } = req.body;
    
    if (conversations.has(sessionId)) {
        conversations.delete(sessionId);
        res.json({ 
            success: true, 
            message: `Konversation ${sessionId} zurückgesetzt` 
        });
    } else {
        res.json({ 
            success: false, 
            message: `Keine Konversation ${sessionId} gefunden` 
        });
    }
});

// 📊 API-Endpunkt: Verfügbare Modelle abrufen
app.get('/api/models', async (req, res) => {
    try {
        const ollamaUrl = `http://${config.ollama.host}:${config.ollama.port}`;
        const response = await axios.get(`${ollamaUrl}/api/tags`, {
            timeout: 5000
        });
        
        const models = response.data.models?.map(model => ({
            name: model.name,
            size: model.size,
            modified: model.modified_at
        })) || [];
        
        res.json({ 
            models,
            defaultModel: config.ollama.defaultModel,
            ollamaConnected: true 
        });
    } catch (err) {
        console.error('Fehler beim Abrufen der Modelle:', err.message);
        res.json({ 
            models: [], 
            defaultModel: config.ollama.defaultModel,
            ollamaConnected: false,
            error: err.message 
        });
    }
});

// 🔧 API-Endpunkt: Konfiguration abrufen
app.get('/api/config', (req, res) => {
    res.json(config);
});

// 🔧 API-Endpunkt: Konfiguration speichern
app.post('/api/config', (req, res) => {
    try {
        const newConfig = req.body;
        const configPath = path.join(__dirname, 'config.json');
        
        fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
        
        // Config im Server aktualisieren
        config = newConfig;
        
        res.json({ 
            success: true, 
            message: 'Konfiguration gespeichert' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// 📈 API-Endpunkt: Konversations-Status
app.get('/api/conversation/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const conversation = conversations.get(sessionId);
    
    if (conversation) {
        res.json({
            sessionId,
            messageCount: conversation.length - 1, // Ohne System-Prompt
            hasConversation: conversation.length > 1
        });
    } else {
        res.json({
            sessionId,
            messageCount: 0,
            hasConversation: false
        });
    }
});

// Start des Servers
app.listen(PORT, () => {
    console.log(`🌐 Server läuft unter http://localhost:${PORT}`);
});
