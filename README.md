# 🎀 Janbertus AI - Dein lokaler KI-Chat mit Kawaii-Modus

Eine moderne Chat-Anwendung für lokale Ollama-KI-Modelle mit einem besonderen **Kawaii-Modus** für extra süße Antworten! 💖✨

![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-5.1.0-blue?logo=express)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Kawaii](https://img.shields.io/badge/Kawaii-Modus-pink?logo=heart)

---

## ✨ Besondere Features

### 🧠 **Dual-Modus System**
- **Normaler Modus**: Professionelle, sachliche Antworten
- **🎀 Kawaii-Modus**: Süße Anime-Style Antworten mit japanischen Ausdrücken!

### 💫 **Weitere Highlights**
- 📱 **Responsive Web-Interface** - Funktioniert auf allen Geräten
- 🖥️ **100% Lokal** - Keine externen APIs, komplette Privatsphäre
- 📝 **Markdown-Support** - Schöne Formatierung mit Code-Highlighting
- ⚡ **Real-time Chat** - Schnelle Antworten mit Tipp-Animation
- 🎨 **Modernes Design** - Saubere UI mit CSS-Animationen

---

## 🚀 Schnellstart

### 📋 Voraussetzungen
- [Node.js](https://nodejs.org/) v18 oder höher
- [Ollama](https://ollama.com/) installiert und laufend
- Das Modell `gpt-oss:20b` (oder ein anderes deiner Wahl)

### ⚙️ Installation

1. **Repository herunterladen**
   ```bash
   git clone https://github.com/Janbertus/Janbertus_AI.git
   cd Janbertus_AI
   ```

2. **Dependencies installieren**
   ```bash
   npm install
   ```

3. **Ollama starten** (separates Terminal)
   ```bash
   ollama serve
   ```

4. **KI-Modell laden**
   ```bash
   ollama pull gpt-oss:20b
   ```

5. **Server starten**
   ```bash
   npm start
   ```

6. **🌐 Browser öffnen:** http://localhost:3000

---

## 🎮 Bedienung

### 💬 **Normal chatten**
1. Frage in das Eingabefeld tippen
2. Enter drücken oder "Senden" klicken
3. Sachliche, professionelle Antwort erhalten

### 🎀 **Kawaii-Modus aktivieren**
1. Den **💖 Kawaii-Modus** Schalter anklicken
2. Jetzt dieselbe Frage stellen
3. Eine süße Anime-Style Antwort bekommen mit:
   - Kawaii-Emojis: 🌸💖🍓🎀✨
   - Japanische Ausdrücke: "sugoi!!", "nya~!", "senpai~"
   - Überdrehte, süße Persönlichkeit

### 📱 **Chat-Features**
- **Chat-Verlauf** bleibt erhalten
- **Markdown-Rendering** für schöne Formatierung
- **Tipp-Animation** während der KI denkt
- **Responsive Design** für Handy & Desktop

---

## 🛠️ Technische Details

### 📁 **Projektstruktur**
```
Janbertus_AI/
├── 📄 server.js          # Express Backend mit Dual-Modus Logic
├── 📦 package.json       # Dependencies & Scripts
├── 📖 README.md          # Diese Anleitung
└── public/               # Frontend
    ├── 🌐 index.html     # HTML mit Kawaii-Toggle
    ├── ⚡ script.js      # JavaScript für Chat & Modus-Wechsel
    └── 🎨 style.css      # Modernes CSS-Design
```

### 🔧 **Tech-Stack**
- **Backend:** Node.js + Express.js
- **Frontend:** Vanilla JavaScript + HTML5 + CSS3
- **KI-Backend:** Ollama API (`gpt-oss:20b`)
- **Markdown:** Marked.js für Formatierung

### 🎯 **API-Endpoint**
**POST** `/api/ask`
```json
{
  "question": "Erkläre mir Quantenphysik",
  "kawaii": false  // true für Kawaii-Modus
}
```

**Response:**
```json
{
  "answer": "# Quantenphysik\n\nQuantenphysik beschäftigt sich mit..."
}
```

---

## ⚙️ Anpassungen

### 🤖 **Anderes KI-Modell verwenden**
In `server.js` Zeile ~31:
```javascript
model: 'llama2',  // Statt 'gpt-oss:20b'
```

### 🌐 **Port ändern**
```javascript
const PORT = 4000;  // Statt 3000
```

### 🎀 **Kawaii-Prompt anpassen**
In `server.js` ab Zeile ~14 findest du den `kawaiiPrompt` - hier kannst du die Persönlichkeit ändern!

---

## 🐛 Problemlösungen

### ❌ **Server startet nicht**
```bash
# Port bereits belegt? Anderen verwenden:
PORT=4000 npm start

# Oder prüfen was Port 3000 blockiert:
netstat -ano | findstr :3000
```

### 🤖 **Keine KI-Antworten**
```bash
# Ollama läuft?
curl http://localhost:11434/api/tags

# Modell verfügbar?
ollama list
```

### 🌐 **Website lädt nicht**
- Firewall/Antivirus prüfen
- `http://localhost:3000` (nicht `https://`)
- Browser-Cache leeren

---

## 🎨 Screenshots

### Normal-Modus:
> Professionelle, sachliche Antworten mit sauberem Markdown

### Kawaii-Modus:
> 🌸💖 Sugoi!! Alles wird super kawaii mit vielen Emojis, nya~! ✨🎀

---

## 🚧 Entwicklung & Erweiterungen

### 🔥 **Development Mode**
```bash
# Auto-Reload bei Änderungen
npm install -g nodemon
nodemon server.js
```

### 📝 **Geplante Features**
- [ ] 💾 Chat-Verlauf speichern
- [ ] 🌙 Dark/Light Theme Toggle
- [ ] 📁 Datei-Upload für Kontext
- [ ] 🔄 Model-Switcher in der UI
- [ ] 🎵 Kawaii-Sound-Effekte
- [ ] 📊 Token-Counter & Statistiken

### 🤝 **Contributing**
1. Fork das Repo
2. Feature branch: `git checkout -b feature/NeuesFeature`
3. Commit: `git commit -m 'Add NeuesFeature'`
4. Push: `git push origin feature/NeuesFeature`
5. Pull Request erstellen

---

## 📜 Lizenz

MIT License - Siehe `LICENSE` für Details.

## 🙏 Danksagungen

- **Ollama Team** - Für das fantastische lokale KI-Framework
- **Express.js** - Robustes Web-Framework
- **Marked.js** - Markdown-Parser
- **Anime Community** - Inspiration für den Kawaii-Modus! 🎀

---

<div align="center">

**💖 Erstellt mit Liebe von Janbertus 💖**

*Lokale KI war noch nie so süß!* ✨🎀

</div>
