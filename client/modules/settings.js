// settings box for header in play (and possibly future pages?)

function toggleSettings() {
  let settings = document.getElementById('settings_dialog');
  if (!settings)
    openSettings();
  else
    settings.remove();
}

function openSettings() {
  let settings = createSettingsDialog();
  document.body.appendChild(settings);
}


function appendSettingOptions(settings) {
  for (let option of Object.keys(setting_options)) {
    let checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.checked = !!localStorage.getItem(option);
    checkbox.addEventListener('change', (e) => {
      if (e.currentTarget.checked)
	localStorage.setItem(option, "on");
      else
	localStorage.removeItem(option);
    });

    let optionLabel = setting_options[option];
    let label = document.createElement("label");
    label.textContent = optionLabel;
    label.appendChild(checkbox);

    settings.appendChild(label);
  }
}

function createSettingsDialog() {
  let settings = document.createElement("div");
  settings.id = "settings_dialog";
  settings.classList.add("window");

  appendSettingOptions(settings);

  let closingButton = createClosingButton(settings);
  settings.appendChild(closingButton);

  return settings;
}

function createClosingButton(element_to_be_removed) {
  let closer = document.createElement("div");
  closer.classList.add("closer");
  closer.appendChild(document.createElement('div')); // diagonal bars inside the closer
  closer.appendChild(document.createElement('div'));

  closer.addEventListener('click', () => element_to_be_removed.remove())
  return closer;
}

// ------ MAIN -----

let setting_options = { 
  'highlightsAreActive': 'highlight last move', 
  'autoPromoteToQueen': 'always promote to queen'
};

document.getElementById('settings').addEventListener('click', toggleSettings);

// -----------------
