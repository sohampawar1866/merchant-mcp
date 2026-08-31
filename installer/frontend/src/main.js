// Wails JS Bridge & Runtime Setup
let dockerStatus = { installed: false, running: false, composeCmd: '', message: 'Checking...' };
let isLaunching = false;

// Elements
const keyIdInput = document.getElementById('keyId');
const keySecretInput = document.getElementById('keySecret');
const webhookSecretInput = document.getElementById('webhookSecret');
const portInput = document.getElementById('port');
const startBtn = document.getElementById('startBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');
const toggleSecretBtn = document.getElementById('toggleSecretBtn');
const openRazorpayBtn = document.getElementById('openRazorpayBtn');
const dockerStatusCard = document.getElementById('dockerStatusCard');
const dockerDot = document.getElementById('dockerDot');
const dockerMessage = document.getElementById('dockerMessage');
const dockerActionArea = document.getElementById('dockerActionArea');
const logSection = document.getElementById('logSection');
const logTerminal = document.getElementById('logTerminal');
const toggleLogsBtn = document.getElementById('toggleLogsBtn');
const successCard = document.getElementById('successCard');
const openDashboardBtn = document.getElementById('openDashboardBtn');

// Password Visibility Toggle
toggleSecretBtn.addEventListener('click', () => {
  if (keySecretInput.type === 'password') {
    keySecretInput.type = 'text';
    toggleSecretBtn.textContent = '🔒';
  } else {
    keySecretInput.type = 'password';
    toggleSecretBtn.textContent = '👁';
  }
});

// Open Razorpay Dashboard
openRazorpayBtn.addEventListener('click', () => {
  if (window.go?.main?.App?.OpenRazorpayDashboard) {
    window.go.main.App.OpenRazorpayDashboard();
  } else {
    window.open('https://dashboard.razorpay.com/app/keys', '_blank');
  }
});

// Open Merchant Dashboard
openDashboardBtn.addEventListener('click', () => {
  if (window.go?.main?.App?.OpenDashboard) {
    window.go.main.App.OpenDashboard();
  } else {
    window.open('http://localhost:3000', '_blank');
  }
});

// Clear Logs
toggleLogsBtn.addEventListener('click', () => {
  logTerminal.textContent = '';
});

// Radio Pill Handling
document.querySelectorAll('.transport-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.transport-pill').forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');
    pill.querySelector('input').checked = true;
  });
});

// Validation and Button State
function updateButtonState() {
  const hasKeyId = keyIdInput.value.trim().length > 0;
  const hasSecret = keySecretInput.value.trim().length > 0;
  const isDockerReady = dockerStatus.installed && dockerStatus.running;

  if (hasKeyId && hasSecret && isDockerReady && !isLaunching) {
    startBtn.disabled = false;
  } else {
    startBtn.disabled = true;
  }
}

keyIdInput.addEventListener('input', updateButtonState);
keySecretInput.addEventListener('input', updateButtonState);

// Render Docker Status
function renderDockerStatus(status) {
  dockerStatus = status;
  dockerStatusCard.className = 'docker-banner mt-4';
  dockerActionArea.innerHTML = '';

  if (!status.installed) {
    dockerStatusCard.classList.add('banner-danger');
    dockerMessage.textContent = 'Docker is not installed on this system.';
    
    const installBtn = document.createElement('button');
    installBtn.type = 'button';
    installBtn.className = 'docker-action-btn';
    installBtn.textContent = 'Install Docker ↗';
    installBtn.onclick = () => {
      if (window.go?.main?.App?.OpenInstallPage) {
        window.go.main.App.OpenInstallPage();
      }
    };
    dockerActionArea.appendChild(installBtn);
  } else if (!status.running) {
    dockerStatusCard.classList.add('banner-warning');
    dockerMessage.textContent = 'Docker is installed but not running.';

    const launchBtn = document.createElement('button');
    launchBtn.type = 'button';
    launchBtn.className = 'docker-action-btn';
    launchBtn.textContent = 'Open Docker Desktop';
    launchBtn.onclick = () => {
      if (window.go?.main?.App?.OpenDockerDesktop) {
        window.go.main.App.OpenDockerDesktop();
      }
    };
    dockerActionArea.appendChild(launchBtn);
  } else {
    dockerStatusCard.classList.add('banner-ready');
    dockerMessage.textContent = `Docker detected (${status.composeCmd || 'ready'}) — ready to launch`;
  }

  updateButtonState();
}

// Form Submission: Write Env & Launch
startBtn.addEventListener('click', async () => {
  if (startBtn.disabled || isLaunching) return;

  const keyId = keyIdInput.value.trim();
  const keySecret = keySecretInput.value.trim();
  const webhookSecret = webhookSecretInput.value.trim();
  const port = portInput.value.trim() || '8080';
  const transport = document.querySelector('input[name="transport"]:checked')?.value || 'streamablehttp';

  isLaunching = true;
  startBtn.disabled = true;
  btnText.textContent = 'Starting Containers...';
  btnSpinner.classList.remove('hidden');
  logSection.classList.remove('hidden');
  logTerminal.textContent = 'Initializing AgenticCheckout launch sequence...\n';
  successCard.classList.add('hidden');

  try {
    if (window.go?.main?.App?.WriteEnvAndLaunch) {
      const result = await window.go.main.App.WriteEnvAndLaunch(keyId, keySecret, webhookSecret, transport, port);
      
      if (result.success) {
        btnText.textContent = 'Running ✓';
        btnSpinner.classList.add('hidden');
        successCard.classList.remove('hidden');
      } else {
        btnText.textContent = 'Launch Failed — Retry';
        btnSpinner.classList.add('hidden');
        startBtn.disabled = false;
        isLaunching = false;
        logTerminal.textContent += `\n❌ Error: ${result.error}\n`;
      }
    } else {
      // Mock fallback in pure browser testing
      logTerminal.textContent += 'Mock dev mode: Launched on port ' + port + ' with ' + transport + '\n';
      setTimeout(() => {
        btnText.textContent = 'Running ✓';
        btnSpinner.classList.add('hidden');
        successCard.classList.remove('hidden');
      }, 1500);
    }
  } catch (err) {
    btnText.textContent = 'Error — Retry';
    btnSpinner.classList.add('hidden');
    startBtn.disabled = false;
    isLaunching = false;
    logTerminal.textContent += `\n❌ System exception: ${err}\n`;
  }
});

// Wails Event Listeners
window.addEventListener('DOMContentLoaded', () => {
  // Listen for real-time live log streams from Go
  if (window.runtime?.EventsOn) {
    window.runtime.EventsOn('log', (msg) => {
      logSection.classList.remove('hidden');
      logTerminal.textContent += msg + '\n';
      logTerminal.scrollTop = logTerminal.scrollHeight;
    });

    // Listen for Docker status polling events from Go
    window.runtime.EventsOn('docker:status', (status) => {
      renderDockerStatus(status);
    });
  }

  // Initial Docker Status Check
  if (window.go?.main?.App?.CheckDockerStatus) {
    window.go.main.App.CheckDockerStatus().then(renderDockerStatus);
  } else {
    // Browser fallback
    renderDockerStatus({ installed: true, running: true, composeCmd: 'docker compose', message: 'Docker is ready.' });
  }
});
