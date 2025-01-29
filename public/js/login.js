document.addEventListener('DOMContentLoaded', function() {
    const errorMessage = document.getElementById('error-message');

    document.getElementById('loginForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                errorMessage.innerHTML = 'Invalid credentials';
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Success:', data);

            // Store the token in local storage
            localStorage.setItem('token', data.token);

            // Redirect to the protected page
            window.location.href = '/generateKeys.html';
        } catch (error) {
            console.error('Error:', error);
        }
    });
});