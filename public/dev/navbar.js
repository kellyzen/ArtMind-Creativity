document.addEventListener('DOMContentLoaded', () => {
  // Initial load
  toggleVisibility('home');

  // Add event listeners for navigation
  document.getElementById('nav-home').addEventListener('click', () => {
    toggleVisibility('home');
  });

  document.getElementById('nav-test').addEventListener('click', () => {
    toggleVisibility('test');
  });

  document.getElementById('nav-about').addEventListener('click', () => {
    toggleVisibility('about');
  });

  document.getElementById('nav-instructions').addEventListener('click', () => {
    toggleVisibility('instructions');
  });

  document.getElementById('trynow-btn').addEventListener('click', () => {
    toggleVisibility('instructions');
  });

  document.getElementById('tnc-link').addEventListener('click', () => {
    toggleVisibility('instructions');
  });
});

// Store loaded scripts in an object to track their status
const loadedScripts = {};

function toggleVisibility(page) {
  const pages = ['home', 'test', 'about', 'instructions'];

  // Hide all pages
  pages.forEach((section) => {
    document.getElementById(`${section}-container`).style.display = 'none';
    document.getElementById(`nav-${section}`).style.textDecoration = 'none';
  });

  // Show the selected page
  document.getElementById(`${page}-container`).style.display = 'block';
  document.getElementById(`nav-${page}`).style.textDecoration = 'underline';

  // Load the corresponding JavaScript file if not loaded before
  const script = `${page}.js`;
  if (!loadedScripts[script]) {
    const scriptElement = document.createElement('script');
    scriptElement.src = `dev/${page}/${script}`;
    document.head.appendChild(scriptElement);

    if(script == 'test.js') {
      const scriptElement = document.createElement('script');
      scriptElement.src = `dev/${page}/canvas.js`;
      document.head.appendChild(scriptElement);
    }

    // Mark the script as loaded
    loadedScripts[script] = true;
  }
}