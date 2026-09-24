const body = document.body;
const themeToggle = document.querySelector('#theme-toggle');
const settingsTheme = document.querySelector('#settings-theme');
const modeLabel = document.querySelector('#mode-label');

function setTheme(light) {
  body.classList.toggle('light', light);
  modeLabel.textContent = light ? 'Light' : 'Dark';
  themeToggle.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
  localStorage.setItem('hack-theme', light ? 'light' : 'dark');
}

setTheme(localStorage.getItem('hack-theme') === 'light');
themeToggle.addEventListener('click', () => setTheme(!body.classList.contains('light')));
settingsTheme.addEventListener('click', () => setTheme(!body.classList.contains('light')));

document.querySelectorAll('.nav-item').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item === button));
    document.querySelectorAll('.view').forEach((view) => view.classList.toggle('active', view.id === button.dataset.view));
  });
});

const cards = [...document.querySelectorAll('.game-card')];
const search = document.querySelector('#game-search');
const emptyState = document.querySelector('#empty-state');
let activeFilter = 'all';

function filterGames() {
  const query = search.value.trim().toLowerCase();
  let visible = 0;
  cards.forEach((card) => {
    const matches = (activeFilter === 'all' || card.dataset.category === activeFilter) && card.dataset.name.includes(query);
    card.hidden = !matches;
    if (matches) visible += 1;
  });
  emptyState.hidden = visible !== 0;
}

search.addEventListener('input', filterGames);
document.querySelectorAll('.filter').forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll('.filter').forEach((item) => item.classList.toggle('active', item === button));
    filterGames();
  });
});

document.querySelector('#motion-toggle').addEventListener('click', (event) => {
  const button = event.currentTarget;
  button.classList.toggle('on');
  button.setAttribute('aria-pressed', button.classList.contains('on'));
  button.querySelector('b').textContent = button.classList.contains('on') ? 'On' : 'Off';
  body.classList.toggle('no-motion', !button.classList.contains('on'));
});

window.addEventListener('beforeunload', (event) => {
  event.preventDefault();
  event.returnValue = '';
});

lucide.createIcons();