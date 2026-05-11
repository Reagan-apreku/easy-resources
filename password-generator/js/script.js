document.addEventListener('DOMContentLoaded', () => {
    const passwordOutput = document.getElementById('passwordOutput');
    const regenerateBtn = document.getElementById('regenerateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const lengthRange = document.getElementById('lengthRange');
    const lengthVal = document.getElementById('lengthVal');
    const strengthLevel = document.getElementById('strengthLevel');
    const strengthText = document.querySelector('#strengthText span');

    const toggles = {
        uppercase: document.getElementById('uppercase'),
        lowercase: document.getElementById('lowercase'),
        numbers: document.getElementById('numbers'),
        symbols: document.getElementById('symbols')
    };

    const charSets = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
    };

    function generatePassword() {
        const length = parseInt(lengthRange.value);
        let allowedChars = '';
        let password = '';

        Object.keys(toggles).forEach(key => {
            if (toggles[key].checked) {
                allowedChars += charSets[key];
            }
        });

        if (allowedChars === '') {
            passwordOutput.value = '';
            updateStrength(0);
            return;
        }

        // Use cryptographically secure random numbers
        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
            password += allowedChars.charAt(array[i] % allowedChars.length);
        }

        passwordOutput.value = password;
        calculateStrength(password);
    }

    function calculateStrength(password) {
        let score = 0;
        if (!password) {
            updateStrength(0);
            return;
        }

        if (password.length >= 12) score += 1;
        if (password.length >= 20) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        updateStrength(score);
    }

    function updateStrength(score) {
        let color = 'var(--border)';
        let text = 'Unknown';
        let width = '0%';

        if (score === 0) {
            width = '0%';
        } else if (score <= 2) {
            color = 'var(--strength-weak)';
            text = 'Weak';
            width = '25%';
        } else if (score === 3) {
            color = 'var(--strength-fair)';
            text = 'Fair';
            width = '50%';
        } else if (score === 4) {
            color = 'var(--strength-good)';
            text = 'Good';
            width = '75%';
        } else {
            color = 'var(--strength-strong)';
            text = 'Strong';
            width = '100%';
        }

        strengthLevel.style.width = width;
        strengthLevel.style.backgroundColor = color;
        strengthText.textContent = text;
        strengthText.style.color = color;
    }

    function copyToClipboard() {
        const password = passwordOutput.value;
        if (!password) return;

        navigator.clipboard.writeText(password).then(() => {
            const originalContent = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i data-lucide="check"></i><span>Copied!</span>';
            lucide.createIcons();
            
            setTimeout(() => {
                copyBtn.innerHTML = originalContent;
                lucide.createIcons();
            }, 2000);
        });
    }

    // Event Listeners
    lengthRange.addEventListener('input', (e) => {
        lengthVal.textContent = e.target.value;
        generatePassword();
    });

    Object.values(toggles).forEach(toggle => {
        toggle.addEventListener('change', generatePassword);
    });

    regenerateBtn.addEventListener('click', generatePassword);
    copyBtn.addEventListener('click', copyToClipboard);

    // Initial generation
    generatePassword();
});
