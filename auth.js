// auth.js - Shared authentication logic

// INICIALIZAR EMAILJS CON TU PUBLIC KEY
(function() {
    emailjs.init("y6z1_yLYoZzfUqleA");
    console.log("EmailJS initialized");
})();

// Debug function
function debugLog(message) {
    console.log(message);
    const debugInfo = document.getElementById('debug-info');
    if (debugInfo) {
        debugInfo.innerHTML += `<div>${new Date().toLocaleTimeString()}: ${message}</div>`;
        debugInfo.style.display = 'block';
    }
}

// REAL EMAIL VERIFICATION WITH EMAILJS - VERSIÓN MEJORADA
function sendVerificationCode() {
    const email = document.getElementById('email-input').value.trim();
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    debugLog(`Starting verification for: ${email}`);
    
    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    debugLog(`Generated code: ${verificationCode}`);
    
    // Store for verification
    sessionStorage.setItem('pendingVerification', JSON.stringify({
        email: email,
        code: verificationCode,
        timestamp: Date.now()
    }));
    
    // Show sending status
    const emailStatus = document.getElementById('email-status');
    emailStatus.style.display = 'block';
    emailStatus.textContent = '⏳ Sending verification code...';
    emailStatus.className = 'email-status';
    
    // CONFIGURACIÓN ACTUALIZADA CON TUS CREDENCIALES
    const SERVICE_ID = "service_l01icdo";
    const TEMPLATE_ID = "template_exzottb";
    
    debugLog(`Sending email with Service: ${SERVICE_ID}, Template: ${TEMPLATE_ID}`);
    
    // Send email using EmailJS
    emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        to_email: email,
        verification_code: verificationCode
    })
    .then(function(response) {
        debugLog('✅ Email sent successfully!');
        console.log('✅ Email sent successfully!', response);
        
        emailStatus.textContent = `✅ Verification code sent to ${email}`;
        emailStatus.className = 'email-status bg-green-100 text-green-800 p-4 rounded-lg my-4 text-center';
        
        document.getElementById('verification-modal').style.display = 'flex';
        
        // Clear email input
        document.getElementById('email-input').value = '';
    }, function(error) {
        debugLog('❌ Failed to send email: ' + JSON.stringify(error));
        console.log('❌ Failed to send email:', error);
        
        let errorMessage = 'Failed to send verification code. ';
        if (error.text) {
            errorMessage += `Error: ${error.text}`;
        } else if (error.status) {
            errorMessage += `Status: ${error.status}`;
        }
        
        emailStatus.textContent = errorMessage;
        emailStatus.className = 'email-status bg-red-100 text-red-800 p-4 rounded-lg my-4 text-center';
        
        // For testing purposes, show the modal anyway with the code
        if (confirm('Email sending failed. For testing, would you like to see the verification code?')) {
            alert(`TEST CODE: ${verificationCode}`);
            document.getElementById('verification-modal').style.display = 'flex';
        }
    });
}

function verifyCode() {
    const pendingVerification = JSON.parse(sessionStorage.getItem('pendingVerification'));
    const enteredCode = document.getElementById('verification-input').value.trim();
    
    if (!enteredCode) {
        alert('Please enter the verification code');
        return;
    }
    
    if (!pendingVerification) {
        alert('No verification session found. Please request a new code.');
        return;
    }
    
    // Check if code is expired (10 minutes)
    const now = Date.now();
    if (now - pendingVerification.timestamp > 10 * 60 * 1000) {
        alert('Verification code has expired. Please request a new one.');
        sessionStorage.removeItem('pendingVerification');
        return;
    }
    
    if (enteredCode === pendingVerification.code) {
        // Successful verification
        const currentUser = {
            email: pendingVerification.email,
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Hide the modal and clear session
        document.getElementById('verification-modal').style.display = 'none';
        sessionStorage.removeItem('pendingVerification');
        document.getElementById('verification-input').value = '';
        
        debugLog('User successfully verified and logged in');
        
        // Call the success handler if it exists
        if (typeof handleSuccessfulLogin === 'function') {
            handleSuccessfulLogin();
        } else {
            alert('Successfully signed in!');
        }
    } else {
        alert('Invalid verification code. Please try again.');
        document.getElementById('verification-input').value = '';
        document.getElementById('verification-input').focus();
    }
}

function resendVerificationCode() {
    const pendingVerification = JSON.parse(sessionStorage.getItem('pendingVerification'));
    if (!pendingVerification) {
        alert('No pending verification found. Please enter your email again.');
        return;
    }
    
    const email = pendingVerification.email;
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    debugLog(`Resending code to: ${email}, new code: ${newCode}`);
    
    // Update stored code
    sessionStorage.setItem('pendingVerification', JSON.stringify({
        email: email,
        code: newCode,
        timestamp: Date.now()
    }));
    
    const emailStatus = document.getElementById('email-status');
    emailStatus.style.display = 'block';
    emailStatus.textContent = '⏳ Resending verification code...';
    emailStatus.className = 'email-status';
    
    const SERVICE_ID = "service_l01icdo";
    const TEMPLATE_ID = "template_exzottb";
    
    emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        to_email: email,
        verification_code: newCode
    })
    .then(function(response) {
        emailStatus.textContent = `✅ Verification code resent to ${email}`;
        emailStatus.className = 'email-status bg-green-100 text-green-800 p-4 rounded-lg my-4 text-center';
        debugLog('Resent email successfully');
    }, function(error) {
        emailStatus.textContent = '❌ Failed to resend verification code. Please try again.';
        emailStatus.className = 'email-status bg-red-100 text-red-800 p-4 rounded-lg my-4 text-center';
        debugLog('Failed to resend email: ' + JSON.stringify(error));
        
        // For testing
        if (confirm('Resend failed. Show code for testing?')) {
            alert(`TEST CODE: ${newCode}`);
        }
    });
}

function closeVerificationModal() {
    document.getElementById('verification-modal').style.display = 'none';
    document.getElementById('verification-input').value = '';

}
