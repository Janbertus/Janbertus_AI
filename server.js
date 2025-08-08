const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// 💭 Session-Storage für Konversationen
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
    const selectedModel = model || 'gpt-oss:20b'; // Fallback auf Standard-Modell

    // 💭 Konversations-Verlauf abrufen oder erstellen
    if (!conversations.has(sessionId)) {
        conversations.set(sessionId, []);
    }
    
    const conversation = conversations.get(sessionId);
    
    // System-Prompt nur setzen wenn neue Konversation oder Modus geändert
    const messages = [];
    if (conversation.length === 0 || conversation[0].content !== systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
        // Bei Modus-Wechsel: Konversation zurücksetzen aber mit Info
        if (conversation.length > 0) {
            conversation.length = 0; // Verlauf löschen
            messages.push({ role: "assistant", content: kawaii ? 
                "🌸💖 Kyaa~! Ich bin jetzt im super-kawaii Modus, nya~! ✨🎀" : 
                "Ich bin jetzt im normalen Modus und antworte sachlich." 
            });
        }
    } else {
        // Bestehende Konversation laden
        messages.push(...conversation);
    }
    
    // Neue User-Nachricht hinzufügen
    messages.push({ role: "user", content: question });

    try {
        const response = await axios.post('http://localhost:11434/api/chat', {
            model: selectedModel,
            messages: messages,
            stream: false,
            options: {
                temperature: 0.7,        // Kreativität vs. Konsistenz
                top_p: 0.9,             // Nucleus Sampling
                top_k: 40,              // Top-K Sampling  
                repeat_penalty: 1.1,    // Verhindert Wiederholungen
                num_ctx: 4096          // Context-Fenster
            }
        });

        const answer = response.data.message?.content || '⚠️ Keine Antwort von der KI erhalten.';
        
        // 💭 Konversation in Memory speichern
        const conversation = conversations.get(sessionId);
        
        // System-Prompt hinzufügen falls noch nicht da
        if (conversation.length === 0) {
            conversation.push({ role: "system", content: systemPrompt });
        }
        
        // User-Nachricht und KI-Antwort zur Konversation hinzufügen
        conversation.push({ role: "user", content: question });
        conversation.push({ role: "assistant", content: answer });
        
        // Konversation begrenzen (letzte 20 Nachrichten + System-Prompt)
        if (conversation.length > 41) { // 1 System + 20 Paare (40) = 41
            const systemMsg = conversation[0];
            conversation.splice(0, conversation.length - 40);
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
        res.json({ message: 'Konversation zurückgesetzt', sessionId });
    } else {
        res.json({ message: 'Keine aktive Konversation gefunden', sessionId });
    }
});

// 📊 API-Endpunkt: Konversations-Info
app.get('/api/conversation/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId || 'default';
    const conversation = conversations.get(sessionId) || [];
    
    res.json({
        sessionId,
        messageCount: Math.max(0, conversation.length - 1), // Ohne System-Prompt
        hasConversation: conversation.length > 1
    });
});

// 📊 API-Endpunkt: Konversations-Info (Default)
app.get('/api/conversation', (req, res) => {
    const sessionId = 'default';
    const conversation = conversations.get(sessionId) || [];
    
    res.json({
        sessionId,
        messageCount: Math.max(0, conversation.length - 1), // Ohne System-Prompt
        hasConversation: conversation.length > 1
    });
});

// 🤖 API-Endpunkt: Verfügbare Ollama-Modelle abrufen
app.get('/api/models', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:11434/api/tags');
        const models = response.data.models || [];
        
        // Modelle mit zusätzlichen Infos anreichern
        const enrichedModels = models.map(model => ({
            name: model.name,
            size: model.size,
            modified: model.modified_at,
            // Geschätzte Eigenschaften basierend auf Modellnamen
            category: getModelCategory(model.name),
            description: getModelDescription(model.name)
        }));

        res.json({ 
            models: enrichedModels, 
            count: models.length,
            defaultModel: 'gpt-oss:20b' 
        });
    } catch (err) {
        console.error('Fehler beim Abrufen der Modelle:', err.message);
        res.status(500).json({ 
            error: 'Ollama nicht erreichbar', 
            details: err.message,
            models: [],
            defaultModel: 'gpt-oss:20b'
        });
    }
});

// 🏷️ Hilfsfunktion: Modell-Kategorie bestimmen
function getModelCategory(modelName) {
    const name = modelName.toLowerCase();
    if (name.includes('llama')) return '🦙 Llama';
    if (name.includes('gpt')) return '🤖 GPT';
    if (name.includes('mistral')) return '💨 Mistral';
    if (name.includes('codellama') || name.includes('code')) return '💻 Code';
    if (name.includes('phi')) return '🧠 Phi';
    if (name.includes('gemma')) return '💎 Gemma';
    return '🎯 Andere';
}

// 📝 Hilfsfunktion: Modell-Beschreibung
function getModelDescription(modelName) {
    const name = modelName.toLowerCase();
    if (name.includes('7b')) return 'Schnell & effizient (7B Parameter)';
    if (name.includes('13b')) return 'Ausgewogen (13B Parameter)';
    if (name.includes('20b')) return 'Leistungsstark (20B Parameter)';
    if (name.includes('70b')) return 'Sehr leistungsstark (70B Parameter)';
    if (name.includes('code')) return 'Spezialisiert auf Programmierung';
    if (name.includes('instruct')) return 'Optimiert für Anweisungen';
    return 'Allzweck-Sprachmodell';
}

// 🟢 Server starten
app.listen(PORT, () => {
    console.log(`🌐 Server läuft unter http://localhost:${PORT}`);
});
