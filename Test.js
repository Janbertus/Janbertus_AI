// 🎭 Der lustige Zufallsspruch-Generator 🎭

class LustigerBot {
    constructor() {
        this.sprüche = [
            "Warum nehmen Geister keine Drogen? Sie sind schon high genug! 👻",
            "Ich bin nicht faul, ich bin im Energiesparmodus! 😴",
            "404 - Motivation not found! 🤖",
            "Ich programmiere nicht, ich überzeuge Computer! 💻",
            "Kaffee ist die Antwort - egal was die Frage war! ☕",
            "Bugs sind Features, die noch nicht dokumentiert wurden! 🐛",
            "Ich spreche fließend Sarkasmus und JavaScript! 😏"
        ];
        
        this.emojis = ["🎉", "😂", "🤣", "😄", "🎪", "🌟", "✨"];
    }
    
    zufallsSpruch() {
        const spruch = this.sprüche[Math.floor(Math.random() * this.sprüche.length)];
        const emoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
        return `${emoji} ${spruch} ${emoji}`;
    }
    
    regenbogenText(text) {
        const farben = [
            '\x1b[31m', // rot
            '\x1b[33m', // gelb  
            '\x1b[32m', // grün
            '\x1b[36m', // cyan
            '\x1b[34m', // blau
            '\x1b[35m'  // magenta
        ];
        
        let bunterText = '';
        for (let i = 0; i < text.length; i++) {
            const farbe = farben[i % farben.length];
            bunterText += farbe + text[i];
        }
        return bunterText + '\x1b[0m'; // reset
    }
    
    partyZeit() {
        console.log("🎪 WILLKOMMEN ZUR JAVASCRIPT PARTY! 🎪");
        console.log("=" + "=".repeat(40));
        
        // 5 zufällige Sprüche ausgeben
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                console.log(this.regenbogenText(this.zufallsSpruch()));
            }, i * 1000);
        }
        
        // Tanzende Figuren
        setTimeout(() => {
            console.log("\n🕺💃 DANCE BATTLE! 💃🕺");
            let tänzer = "\\o/  |o|  /o\\  |o|  \\o/";
            console.log(this.regenbogenText(tänzer));
        }, 6000);
        
        // ASCII Art Finale
        setTimeout(() => {
            console.log("\n" + this.regenbogenText(`
    ╔══════════════════════════════════╗
    ║        JAVASCRIPT ROCKS!         ║
    ║              🎸🎵                ║
    ║     Code like nobody's watching  ║
    ╚══════════════════════════════════╝
            `));
        }, 7000);
    }
}

// 🚀 Los geht's!
const bot = new LustigerBot();
bot.partyZeit();

// Bonus: Interaktive Funktion
console.log("\n💡 Tipp: Ruf 'bot.zufallsSpruch()' auf für einen neuen Spruch!");
console.log("🎯 Oder 'bot.regenbogenText(\"Dein Text\")' für bunten Text!");