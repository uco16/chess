// settings box for header in play (and possibly future pages?)

function toggleSettings() {
  let settings = document.getElementById('settings_dialog');
  if (!settings)
    document.body.appendChild(createSettingsDialog());
  else
    settings.remove();
}

function createCheckbox(option) {
  let checkbox = document.createElement("input");
  checkbox.setAttribute("type", "checkbox");
  checkbox.checked = !!localStorage.getItem(option);
  checkbox.addEventListener('change', (e) => {
    if (e.currentTarget.checked)
      localStorage.setItem(option, "on");
    else
      localStorage.removeItem(option);
  });
  return checkbox;
}

function div(classList, id) {
  let element = document.createElement('div');
  element.classList = classList;
  if (id)
    element.id = id;
  return element;
}

function toggle_switch(option, text) {
  let toggle = document.createElement("label");
  toggle.classList.add("switch");
  if (text)
    toggle.textContent=text;
  let checkbox = createCheckbox(option);
  let slider = div(["slider"]);
  toggle.appendChild(checkbox);
  toggle.appendChild(slider);
  return toggle;
}

function appendSettingOptions(settings) {
  for (let option of Object.keys(setting_options)) {

    let text = setting_options[option];
    let toggle = toggle_switch(option, text);
    toggle.classList.add("setting");

    settings.appendChild(toggle);
  }
}

function createSettingsDialog() {
  let settings = div(["window"], "settings_dialog");
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
  'autoPromoteToQueen': 'always promote to queen',
  'playSoundOnMove': 'play sound on move'
};

document.getElementById('settings').addEventListener('click', toggleSettings);

// -----------------
