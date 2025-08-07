const axios = require('axios');

// Die Funktion sendet eine Anfrage an Ollama
async function askOllama(question) {
    try {
        const response = await axios.post('http://localhost:11434/api/chat', {
            model: 'gpt-oss:20b',
            messages: [
                { role: 'user', content: question }
            ],
            stream: false
        });

        const answer = response.data.message.content;
        console.log('\nAntwort von Ollama:\n', answer);
    } catch (error) {
        console.error('Fehler beim Zugriff auf Ollama:', error.message);
    }
}

// Beispiel: eine einfache Frage stellen
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('Was möchtest du Ollama fragen? ', (frage) => {
    askOllama(frage).then(() => readline.close());
});
