// header template
document.write(`
<header>
  <!-- following script defines expandMenu() and collapseMenu() -->
  <script src="./client/modules/sidebar.js"></script>
  <div class="menu-icon" onclick="expandMenu()">
    <div class="menu-icon_bar"></div>
    <div class="menu-icon_bar"></div>
    <div class="menu-icon_bar"></div>
  </div>

  <span class="hp-title">
    <a href="./">Chess</a>
  </span>

  <nav class="toolbar">
    <a class="tab">About</a>
    <a class="tab" href="/play">New Game</a>
    <input type="textbox" id="name_selector" placeholder="Choose Name">
    <img src="./client/icons/settings.png" alt="settings" width="32px" height="32px">
  </nav>
  </div>
</header>
<div>
  <aside id="menu-drawer">
    <nav class="menu-list">
      <a class="menu-item" onclick="collapseMenu()">About</a>
      <a class="menu-item" onclick="collapseMenu()">Sign In</a>
      <a class="menu-item" onclick="collapseMenu()">New Game</a>
    </nav>
  </aside>
  <div id="menu-dimming" onclick="collapseMenu()"></div>
</div>
<div class="header-height-adjust"></div>
`);
