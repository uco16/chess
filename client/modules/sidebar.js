/* Defining some functions to open and close the sidebar menu on mobile devices */
function expandMenu() {
  let drawer = document.getElementById("menu-drawer");
    drawer.classList.add('drawn');
}

function afterTransition(element, func) {
  // wrap func in a wrapper that can remove its own event listener
  let callback = () => {
    func(); // call func
    element.removeEventListener('transitionend', callback);
  };
  element.addEventListener('transitionend', callback);
}

function collapseMenu() {
  let drawer = document.getElementById("menu-drawer");
  drawer.classList.remove('drawn');
  drawer.classList.add('shutting');

  afterTransition(drawer, () => {
    drawer.classList.remove('shutting');
  });
}
