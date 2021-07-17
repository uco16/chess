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
    <a href="./index.html">Chess</a>
  </span>

  <nav class="toolbar">
    <a class="tab">About</a>
    <a class="tab" href="/play.html">New Game</a>
    <a class="tab">Change Name</a>
    <a class="tab">Sign In</a>
  </nav>
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
