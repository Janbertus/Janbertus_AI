const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

// Statische Dateien aus dem "public"-Ordner bereitstellen
app.use(express.static('public'));
app.use(express.json()); // JSON-Body parsen

// 🧠 API-Endpunkt zum Fragenstellen mit Kawaii-Toggle
app.post('/api/ask', async (req, res) => {
    const { question, kawaii } = req.body;

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

    try {
        const response = await axios.post('http://localhost:11434/api/chat', {
            model: 'gpt-oss:20b',
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: question }
            ],
            stream: false
        });

        const answer = response.data.message?.content || '⚠️ Keine Antwort von der KI erhalten.';
        res.json({ answer });

    } catch (err) {
        console.error('Fehler bei der Anfrage an Ollama:', err.message);
        res.status(500).json({ error: 'Fehler beim Zugriff auf Ollama' });
    }
});
        

// 🟢 Server starten
app.listen(PORT, () => {
    console.log(`🌐 Server läuft unter http://localhost:${PORT}`);
});
