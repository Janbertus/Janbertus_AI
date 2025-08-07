const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

// Statische Dateien aus dem "public"-Ordner bereitstellen
app.use(express.static('public'));
app.use(express.json()); // JSON-Body parsen

// 🧠 API-Endpunkt zum Fragenstellen
app.post('/api/ask', async (req, res) => {
    const question = req.body.question;

    try {
        // Anfrage an Ollama
        const response = await axios.post('http://localhost:11434/api/chat', {
            model: 'gpt-oss:20b',
            messages: [
            {
                role: "system",
                content: "Du bist ein hilfreicher KI-Assistent in einer lokalen Chat-Anwendung. Bitte antworte immer klar, strukturiert und leserfreundlich im Markdown-Format.\n\nVerwende:\n- **Fettdruck** für wichtige Begriffe\n- *Kursiv* für Hervorhebungen\n- # oder ## für Überschriften\n- - für Listen\n- `Code` für kurze Begriffe\n- ``` (drei Backticks) für längere Codeblöcke\n\nVerwende keine HTML-Tags wie <br> oder <strong>. Nutze echte Zeilenumbrüche (\\n) und Markdown-Auszeichnung.\n\nSprich höflich, professionell und motivierend. Antworte kompakt, aber inhaltlich vollständig, als würdest du einer echten Person helfen wollen, zu lernen oder etwas zu verstehen."
            },
            {
                role: "user",
                content: question
            }
            ],
            stream: false
        });

        // Debug-Ausgabe
        console.log('OLLAMA RESPONSE:', response.data);

        // Antwortinhalt sicher extrahieren
        let answer = '';

        if (response.data.message && response.data.message.content) {
            answer = response.data.message.content;
        } else if (response.data.messages && response.data.messages.length > 0) {
            answer = response.data.messages.map(m => m.content).join('\n');
        } else {
            answer = '⚠️ Keine Antwort von der KI erhalten.';
        }

        res.json({ answer });

    } catch (err) {
        console.error('❌ Fehler beim Zugriff auf Ollama:', err.message);
        res.status(500).json({ error: 'Fehler beim Zugriff auf Ollama' });
    }
});

// 🟢 Server starten
app.listen(PORT, () => {
    console.log(`🌐 Server läuft unter http://localhost:${PORT}`);
});
