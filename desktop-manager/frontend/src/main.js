// AgenticCheckout Desktop Control Center - Frontend Controller
let dockerStatus = { installed: false, running: false, composeCmd: '', message: 'Checking...' };
let isOperating = false;

// DOM Elements
const passphraseInput = document.getElementById('passphraseInput');
const togglePassphraseBtn = document.getElementById('togglePassphraseBtn');
const genPassphraseBtn = document.getElementById('genPassphraseBtn');
const gatewayPortInput = document.getElementById('gatewayPort');
const customerPortInput = document.getElementById('customerPort');
const postgresPortInput = document.getElementById('postgresPort');
const redisPortInput = document.getElementById('redisPort');
const includeSimCheck = document.getElementById('includeSimCheck');

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const restartBtn = document.getElementById('restartBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');

const validationError = document.getElementById('validationError');
const validationErrorText = document.getElementById('validationErrorText');

const dockerStatusCard = document.getElementById('dockerStatusCard');
const dockerDot = document.getElementById('dockerDot');
const dockerMessage = document.getElementById('dockerMessage');
const dockerActionArea = document.getElementById('dockerActionArea');

const logTerminal = document.getElementById('logTerminal');
const toggleLogsBtn = document.getElementById('toggleLogsBtn');

// Hub Elements
const linkMerchantBtn = document.getElementById('linkMerchantBtn');
const linkAdminBtn = document.getElementById('linkAdminBtn');
const linkUpiBtn = document.getElementById('linkUpiBtn');
const linkGatewayBtn = document.getElementById('linkGatewayBtn');
const linkManifestBtn = document.getElementById('linkManifestBtn');

const dotUpi = document.getElementById('dotUpi');
const badgeUpiPort = document.getElementById('badgeUpiPort');
const badgeGatewayPort = document.getElementById('badgeGatewayPort');
const badgeManifestPort = document.getElementById('badgeManifestPort');

// Password Visibility Toggle
togglePassphraseBtn.addEventListener('click', () => {
  if (passphraseInput.type === 'password') {
    passphraseInput.type = 'text';
    togglePassphraseBtn.textContent = '🔒';
  } else {
    passphraseInput.type = 'password';
    togglePassphraseBtn.textContent = '👁';
  }
});

// Generate Random Master Key
genPassphraseBtn.addEventListener('click', async () => {
  if (window.go?.main?.App?.GeneratePassphrase) {
    const key = await window.go.main.App.GeneratePassphrase();
    passphraseInput.value = key;
  } else {
    passphraseInput.value = 'agentic_master_' + Math.random().toString(16).substring(2, 18);
  }
  clearValidationError();
});

// Clear Logs
toggleLogsBtn.addEventListener('click', () => {
  logTerminal.textContent = '';
});

// Transport Radio Pills
document.querySelectorAll('.transport-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.transport-pill').forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');
    pill.querySelector('input').checked = true;
  });
});

// Dynamic Port Badge Updates
function updatePortBadges() {
  const gPort = gatewayPortInput.value.trim() || '8080';
  const uPort = customerPortInput.value.trim() || '3002';

  if (badgeGatewayPort) badgeGatewayPort.textContent = `http://localhost:${gPort}/mcp`;
  if (badgeManifestPort) badgeManifestPort.textContent = `http://localhost:${gPort}/.well-known/agent-manifest.json`;
  if (badgeUpiPort) badgeUpiPort.textContent = `http://localhost:${uPort}`;

  if (includeSimCheck.checked) {
    if (dotUpi) dotUpi.classList.remove('inactive');
    if (linkUpiBtn) linkUpiBtn.disabled = false;
  } else {
    if (dotUpi) dotUpi.classList.add('inactive');
  }
}

gatewayPortInput.addEventListener('input', updatePortBadges);
customerPortInput.addEventListener('input', updatePortBadges);
includeSimCheck.addEventListener('change', updatePortBadges);

// Validation
function showValidationError(msg) {
  validationErrorText.textContent = msg;
  validationError.classList.remove('hidden');
}

function clearValidationError() {
  validationError.classList.add('hidden');
}

passphraseInput.addEventListener('input', clearValidationError);

// Render Docker Status
function renderDockerStatus(status) {
  dockerStatus = status;
  dockerStatusCard.className = 'docker-banner mt-3';
  dockerActionArea.innerHTML = '';

  if (!status.installed) {
    dockerStatusCard.classList.add('banner-danger');
    dockerMessage.textContent = 'Docker is not installed on this system.';
    
    const installBtn = document.createElement('button');
    installBtn.type = 'button';
    installBtn.className = 'docker-action-btn';
    installBtn.textContent = 'Install Docker ↗';
    installBtn.onclick = () => {
      if (window.go?.main?.App?.OpenInstallPage) window.go.main.App.OpenInstallPage();
      else window.open('https://docs.docker.com/desktop/', '_blank');
    };
    dockerActionArea.appendChild(installBtn);
    startBtn.disabled = true;
  } else if (!status.running) {
    dockerStatusCard.classList.add('banner-warning');
    dockerMessage.textContent = 'Docker is installed but not running.';

    const launchBtn = document.createElement('button');
    launchBtn.type = 'button';
    launchBtn.className = 'docker-action-btn';
    launchBtn.textContent = 'Open Docker Desktop';
    launchBtn.onclick = () => {
      if (window.go?.main?.App?.OpenDockerDesktop) window.go.main.App.OpenDockerDesktop();
    };
    dockerActionArea.appendChild(launchBtn);
    startBtn.disabled = true;
  } else {
    dockerStatusCard.classList.add('banner-ready');
    dockerMessage.textContent = `Docker daemon detected (${status.composeCmd || 'ready'}) - operational`;
    if (!isOperating) startBtn.disabled = false;
  }
}

// 1. Start / Apply Configuration
startBtn.addEventListener('click', async () => {
  if (isOperating) return;

  const passphrase = passphraseInput.value.trim();
  if (!passphrase) {
    showValidationError('Master Security Passphrase is required. It is used by PostgreSQL to encrypt all merchant credentials.');
    passphraseInput.focus();
    return;
  }

  const transport = document.querySelector('input[name="transport"]:checked')?.value || 'streamablehttp';
  const gatewayPort = gatewayPortInput.value.trim() || '8080';
  const customerPort = customerPortInput.value.trim() || '3002';
  const postgresPort = postgresPortInput.value.trim() || '5433';
  const redisPort = redisPortInput.value.trim() || '6380';
  const includeSim = includeSimCheck.checked;

  isOperating = true;
  startBtn.disabled = true;
  btnText.textContent = 'Applying & Launching...';
  btnSpinner.classList.remove('hidden');

  logTerminal.textContent += '\n[Initiating] AgenticCheckout deployment sequence...\n';

  try {
    if (window.go?.main?.App?.SaveConfigAndStart) {
      const result = await window.go.main.App.SaveConfigAndStart(
        passphrase,
        transport,
        gatewayPort,
        customerPort,
        postgresPort,
        redisPort,
        includeSim
      );

      if (result.success) {
        btnText.textContent = 'Running';
        btnSpinner.classList.add('hidden');
        logTerminal.textContent += '\nPlatform services started successfully.\n';
      } else {
        btnText.textContent = 'Launch Failed';
        btnSpinner.classList.add('hidden');
        showValidationError(result.error);
        logTerminal.textContent += `\nError: ${result.error}\n`;
      }
    } else {
      // Mock dev mode
      logTerminal.textContent += 'Mock dev mode: Launched with transport ' + transport + '\n';
      setTimeout(() => {
        btnText.textContent = 'Running';
        btnSpinner.classList.add('hidden');
      }, 1000);
    }
  } catch (err) {
    btnText.textContent = 'Error - Retry';
    btnSpinner.classList.add('hidden');
    showValidationError(String(err));
  } finally {
    isOperating = false;
    startBtn.disabled = false;
  }
});

// 2. Stop All Services
stopBtn.addEventListener('click', async () => {
  if (isOperating) return;
  isOperating = true;
  stopBtn.disabled = true;
  logTerminal.textContent += '\n[Stopping] Stopping all running containers...\n';

  try {
    if (window.go?.main?.App?.StopServices) {
      const result = await window.go.main.App.StopServices();
      if (result.success) {
        btnText.textContent = 'Start Services';
        logTerminal.textContent += '\nAll services stopped cleanly.\n';
      } else {
        logTerminal.textContent += `\nFailed to stop: ${result.error}\n`;
      }
    }
  } catch (err) {
    logTerminal.textContent += `\nError: ${err}\n`;
  } finally {
    isOperating = false;
    stopBtn.disabled = false;
  }
});

// 3. Restart Services
restartBtn.addEventListener('click', async () => {
  if (isOperating) return;
  isOperating = true;
  restartBtn.disabled = true;
  logTerminal.textContent += '\n[Restarting] Restarting all running containers...\n';

  try {
    if (window.go?.main?.App?.RestartServices) {
      const result = await window.go.main.App.RestartServices();
      if (result.success) {
        btnText.textContent = 'Running';
        logTerminal.textContent += '\nAll services restarted successfully.\n';
      } else {
        logTerminal.textContent += `\nFailed to restart: ${result.error}\n`;
      }
    }
  } catch (err) {
    logTerminal.textContent += `\nError: ${err}\n`;
  } finally {
    isOperating = false;
    restartBtn.disabled = false;
  }
});

// 4. Local Service Hub Navigation Handlers
linkMerchantBtn.addEventListener('click', () => {
  if (window.go?.main?.App?.OpenMerchantDashboard) window.go.main.App.OpenMerchantDashboard();
  else window.open('http://localhost:3000', '_blank');
});

linkAdminBtn.addEventListener('click', () => {
  if (window.go?.main?.App?.OpenAdminDashboard) window.go.main.App.OpenAdminDashboard();
  else window.open('http://localhost:3001', '_blank');
});

linkUpiBtn.addEventListener('click', () => {
  if (window.go?.main?.App?.OpenCustomerUPIApp) window.go.main.App.OpenCustomerUPIApp();
  else window.open(`http://localhost:${customerPortInput.value || 3002}`, '_blank');
});

linkGatewayBtn.addEventListener('click', () => {
  if (window.go?.main?.App?.OpenMCPGateway) window.go.main.App.OpenMCPGateway();
  else window.open(`http://localhost:${gatewayPortInput.value || 8080}/mcp`, '_blank');
});

linkManifestBtn.addEventListener('click', () => {
  if (window.go?.main?.App?.OpenAgentManifest) window.go.main.App.OpenAgentManifest();
  else window.open(`http://localhost:${gatewayPortInput.value || 8080}/.well-known/agent-manifest.json`, '_blank');
});

// Pre-fill Configuration on Load
async function loadConfig() {
  if (window.go?.main?.App?.GetConfig) {
    try {
      const cfg = await window.go.main.App.GetConfig();
      if (cfg) {
        if (cfg.encryptionPassphrase) passphraseInput.value = cfg.encryptionPassphrase;
        if (cfg.gatewayPort) gatewayPortInput.value = cfg.gatewayPort;
        if (cfg.customerAppPort) customerPortInput.value = cfg.customerAppPort;
        if (cfg.postgresPort) postgresPortInput.value = cfg.postgresPort;
        if (cfg.redisPort) redisPortInput.value = cfg.redisPort;
        includeSimCheck.checked = cfg.includeSimulation;

        if (cfg.mcpTransport) {
          const radio = document.querySelector(`.transport-pill input[value="${cfg.mcpTransport}"]`);
          if (radio) {
            document.querySelectorAll('.transport-pill').forEach((p) => p.classList.remove('active'));
            radio.closest('.transport-pill')?.classList.add('active');
            radio.checked = true;
          }
        }
        updatePortBadges();
      }
    } catch (e) {
      console.warn('Could not load config:', e);
    }
  }
}

// Lifecycle Init
window.addEventListener('DOMContentLoaded', () => {
  loadConfig();

  if (window.runtime?.EventsOn) {
    window.runtime.EventsOn('log', (msg) => {
      logTerminal.textContent += msg + '\n';
      logTerminal.scrollTop = logTerminal.scrollHeight;
    });

    window.runtime.EventsOn('docker:status', (status) => {
      renderDockerStatus(status);
    });
  }

  if (window.go?.main?.App?.CheckDockerStatus) {
    window.go.main.App.CheckDockerStatus().then(renderDockerStatus);
  } else {
    renderDockerStatus({ installed: true, running: true, composeCmd: 'docker compose', message: 'Docker is ready.' });
  }
});
