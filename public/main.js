document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');

    // Function to create a message element
    function createMessageElement(content, isUser, source = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        messageDiv.appendChild(messageContent);

        if (source) {
            const sourceDiv = document.createElement('div');
            sourceDiv.className = 'source';
            sourceDiv.textContent = `Fonte: ${source}`;
            messageDiv.appendChild(sourceDiv);
        }

        return messageDiv;
    }

    // Function to add a message to the chat
    function addMessage(content, isUser, source = null) {
        const messageElement = createMessageElement(content, isUser, source);
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to show loading indicator
    function showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot loading';
        loadingDiv.id = 'loading-message';
        loadingDiv.textContent = 'Sto pensando';
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to remove loading indicator
    function removeLoading() {
        const loadingDiv = document.getElementById('loading-message');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    // Handle form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = userInput.value.trim();
        if (!message) return;

        // Clear input
        userInput.value = '';

        // Add user message to chat
        addMessage(message, true);

        // Show loading indicator
        showLoading();

        try {
            // Send message to server
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            // Remove loading indicator
            removeLoading();

            // Add bot response to chat
            addMessage(data.response, false, data.source);

        } catch (error) {
            console.error('Error:', error);
            removeLoading();
            addMessage('Mi dispiace, si è verificato un errore durante l\'elaborazione della tua richiesta.', false);
        }
    });

    // Focus input on page load
    userInput.focus();
});