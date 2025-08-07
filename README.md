# Ollama Client (Node.js)

# 🤖 Janbertus AI

Ein minimalistisches Node.js-Tool, um mit einem lokal laufenden Ollama KI-Modell wie `gpt-oss:20b` zu kommunizieren.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-v18+-green.svg)
![Express](https://img.shields.io/badge/express-v5.1.0-blue.svg)

## 🌟 Features

- **🖥️ Moderne Web-Oberfläche**: Saubere, responsive Chat-UI
- **🧠 Lokale KI-Integration**: Direkte Verbindung zu Ollama-Modellen
- **📝 Markdown-Support**: Formatierte Antworten mit Code-Highlighting
- **⚡ Real-time Chat**: Schnelle Antworten ohne Verzögerung
- **🎨 Ansprechendes Design**: Moderne CSS-Styles mit Animationen
- **🔒 100% Lokal**: Keine externen APIs, komplette Privatsphäre

## 🚀 Quick Start

### Voraussetzungen

- [Node.js](https://nodejs.org/) (v18 oder höher)
- [Ollama](https://ollama.ai/) mit installiertem `gpt-oss:20b` Modell

### Installation

1. **Repository klonen oder herunterladen**
   ```bash
   git clone https://github.com/Janbertus/Janbertus_AI.git
   cd Janbertus_AI
   ```

2. **Dependencies installieren**
   ```bash
   npm install
   ```

3. **Ollama starten** (in separatem Terminal)
   ```bash
   ollama serve
   ```

4. **GPT-OSS Modell laden** (falls noch nicht geschehen)
   ```bash
   ollama pull gpt-oss:20b
   ```

5. **Server starten**
   ```bash
   npm start
   ```

6. **Browser öffnen**: http://localhost:3000

## 📁 Projektstruktur

```
Janbertus_AI/
├── 📄 server.js          # Express.js Backend
├── 📄 package.json       # NPM Konfiguration
├── 📄 README.md          # Diese Datei
└── public/               # Frontend-Dateien
    ├── 📄 index.html     # Haupt-HTML
    ├── 📄 script.js      # JavaScript Logic
    └── 🎨 style.css      # Styling
```

## 🛠️ Technologie-Stack

- **Backend**: Node.js + Express.js
- **Frontend**: Vanilla JavaScript + HTML5 + CSS3
- **KI-Integration**: Ollama API
- **Markdown**: Marked.js für formatierte Ausgabe

## ⚙️ Konfiguration

### Modell ändern
In `server.js` kannst du das Ollama-Modell anpassen:

```javascript
const response = await axios.post('http://localhost:11434/api/chat', {
    model: 'dein-gewünschtes-modell',  // z.B. 'llama2', 'mistral'
    // ...
});
```

### Port ändern
```javascript
const PORT = 3000; // Ändere hier den Port
```

## 🎯 Verwendung

1. **Frage eingeben**: Tippe deine Frage in das Eingabefeld
2. **Enter drücken**: Oder auf "Senden" klicken
3. **Antwort erhalten**: Die KI antwortet in formatiertem Markdown
4. **Chat-Verlauf**: Alle Nachrichten bleiben im Chat sichtbar

## 🐛 Troubleshooting

### Häufige Probleme

**Server startet nicht:**
- Prüfe ob Port 3000 frei ist: `netstat -ano | findstr :3000`
- Andere Ports mit `PORT=4000 npm start` verwenden

**Keine KI-Antworten:**
- Ollama läuft: `curl http://localhost:11434/api/tags`
- Modell verfügbar: `ollama list`

**Verbindungsfehler:**
- Firewall/Antivirus prüfen
- Localhost-Zugriff erlauben

## 🚧 Entwicklung

### Features hinzufügen
```bash
# Development Server mit Auto-Reload
npm install -g nodemon
nodemon server.js
```

### Geplante Features
- [ ] 💾 Chat-History speichern
- [ ] 🎨 Theme-Wechsler (Hell/Dunkel)
- [ ] 📁 Datei-Upload für Kontext
- [ ] 🔧 Modell-Switcher in UI
- [ ] 📊 Token-Counter

## 📝 API Endpoints

### POST `/api/ask`
Stellt eine Frage an das KI-Modell.

**Request:**
```json
{
  "question": "Was ist Quantencomputing?"
}
```

**Response:**
```json
{
  "answer": "# Quantencomputing\n\nQuantencomputing ist..."
}
```

## 🤝 Contributing

1. Fork das Repository
2. Feature Branch erstellen: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Pull Request öffnen

## 📜 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe `LICENSE` für Details.

## 🙏 Credits

- **Ollama Team** - Für das fantastische lokale KI-Framework
- **Express.js** - Für das robuste Web-Framework
- **Marked.js** - Für Markdown-Parsing

---

**Erstellt mit ❤️ von Janbertus**

*Lokale KI, maximale Kontrolle!* ✨

## 🧠 Was ist Ollama?

[Ollama](https://ollama.com) ermöglicht es, Sprachmodelle lokal auszuführen. Dieses Tool stellt eine einfache Frage-Antwort-Interaktion mit dem Modell her.

## 🚀 Setup

### Voraussetzungen

- Node.js (empfohlen: LTS-Version)
- Ollama installiert und Modell geladen:
  ```bash
  ollama pull gpt-oss:20b
