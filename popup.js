let targetDomain = '';

// Universal tab resolver for both Chrome desktop & mobile Kiwi Browser
async function resolveCurrentTab() {
  const tabs = await chrome.tabs.query({ active: true });
  return tabs && tabs.length > 0 ? tabs[0] : null;
}

// Visual state switcher for Material Radio Cards
function syncCardState(selectedValue) {
  document.querySelectorAll('.md-card').forEach((card) => {
    card.classList.remove('active');
  });
  const currentCard = document.getElementById('card-' + selectedValue);
  if (currentCard) {
    currentCard.classList.add('active');
  }
}

async function bootstrap() {
  const domainLabel = document.getElementById('targetDomain');
  const applyBtn = document.getElementById('applyBtn');

  // Interactive radio events
  document.querySelectorAll('input[name="scriptRule"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      syncCardState(e.target.value);
    });
  });

  try {
    const activeTab = await resolveCurrentTab();
    if (!activeTab || !activeTab.url) {
      domainLabel.innerText = 'No active page found';
      applyBtn.disabled = true;
      return;
    }

    const currentUrl = new URL(activeTab.url);
    if (!currentUrl.hostname || currentUrl.protocol.startsWith('chrome')) {
      domainLabel.innerText = 'System page (Protected)';
      applyBtn.disabled = true;
      return;
    }

    targetDomain = currentUrl.hostname.replace(/^www\./, '');
    domainLabel.innerText = targetDomain;

    // Load saved choice from storage
    chrome.storage.local.get([targetDomain], (data) => {
      const persistedMode = data && data[targetDomain] ? data[targetDomain] : 'none';
      const activeRadio = document.querySelector(`input[name="scriptRule"][value="${persistedMode}"]`);
      if (activeRadio) {
        activeRadio.checked = true;
        syncCardState(persistedMode);
      }
    });
  } catch (err) {
    domainLabel.innerText = 'Error detecting host';
  }
}

document.getElementById('applyBtn').addEventListener('click', async () => {
  const statusEl = document.getElementById('status-indicator');
  if (!targetDomain) return;

  const selectedRule = document.querySelector('input[name="scriptRule"]:checked').value;
  const applyBtn = document.getElementById('applyBtn');

  applyBtn.disabled = true;
  statusEl.style.color = '#1a73e8';
  statusEl.innerText = 'Applying changes...';

  // Save rule in local storage
  await chrome.storage.local.set({ [targetDomain]: selectedRule });

  statusEl.style.color = '#137333';
  statusEl.innerText = '✓ Saved! Refreshing page...';

  // Force page reload
  const tab = await resolveCurrentTab();
  if (tab && tab.id) {
    chrome.tabs.reload(tab.id);
  }

  setTimeout(() => {
    window.close();
  }, 900);
});

bootstrap();