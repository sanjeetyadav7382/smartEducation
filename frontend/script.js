async function login() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const statusMsg = document.getElementById('statusMessage');
    const btn = document.querySelector('.btn');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        statusMsg.textContent = 'Please enter both email and password.';
        statusMsg.className = 'message error';
        return;
    }

    // Interactive button state
    const originalBtnText = btn.textContent;
    btn.textContent = 'Logging in...';
    btn.disabled = true;
    
    // Simulate loading for better UX even if backend is fast
    await new Promise(r => setTimeout(r, 800));

    try {
        const res = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            statusMsg.textContent = data.message;
            statusMsg.className = 'message success';
            setTimeout(() => {
                statusMsg.textContent = 'Redirecting to Dashboard...';
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            statusMsg.textContent = data.message || 'Login Failed';
            statusMsg.className = 'message error';
            btn.textContent = originalBtnText;
            btn.disabled = false;
        }
    } catch (error) {
        // If the backend isn't running yet, we show a helpful error
        console.error('Login error:', error);
        statusMsg.textContent = 'Cannot connect to server. Is the backend running?';
        statusMsg.className = 'message error';
        btn.textContent = originalBtnText;
        btn.disabled = false;
    }
}
