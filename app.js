const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Function to read and process files from data directory
async function generateResponse(query) {
    try {
        const dataDir = path.join(__dirname, 'data');
        const files = await fs.readdir(dataDir);
        
        if (files.length === 0) {
            return {
                response: "Non ho trovato nessun file nella cartella dei dati da cui attingere informazioni.",
                source: null
            };
        }

        // Read content of all files
        const fileContents = await Promise.all(
            files.map(async (file) => {
                const content = await fs.readFile(path.join(dataDir, file), 'utf8');
                return { file, content };
            })
        );

        // Simple simulation of AI response based on file contents
        // In a real application, this would use a proper AI model
        const relevantFile = fileContents[Math.floor(Math.random() * fileContents.length)];
        
        return {
            response: `Basandomi sui dati disponibili in "${relevantFile.file}", posso dirti che... [Simulazione risposta AI]`,
            source: relevantFile.file
        };
    } catch (error) {
        console.error('Error generating response:', error);
        if (error.code === 'ENOENT') {
            return {
                response: "La cartella dei dati non è disponibile al momento.",
                source: null
            };
        }
        throw error;
    }
}

// Chat endpoint
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Il messaggio non può essere vuoto' });
        }

        const response = await generateResponse(message);
        res.json(response);
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ 
            error: 'Si è verificato un errore durante l\'elaborazione della richiesta'
        });
    }
});

// Start server with error handling
const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is already in use. Trying to close existing process...`);
        require('child_process').exec(`lsof -i :${PORT} | grep LISTEN | awk '{print $2}' | xargs kill -9`, (error) => {
            if (error) {
                console.error('Error killing process:', error);
                return;
            }
            // Retry starting the server after a brief delay
            setTimeout(() => {
                app.listen(PORT, () => {
                    console.log(`Server restarted successfully on http://localhost:${PORT}`);
                });
            }, 1000);
        });
    } else {
        console.error('Error starting server:', err);
    }
});