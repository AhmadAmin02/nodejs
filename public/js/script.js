const menuToggle = document.querySelector('.menu-toggle');
const sidenav = document.querySelector('.sidenav');
const mainContent = document.querySelector('.main-content');
const topbar = document.querySelector('.topbar');
const sidenavToggle = document.querySelector('.sidenav-toggle');
const pageTitle = document.querySelector('.page-title');

menuToggle.addEventListener('click', () => {
  sidenav.classList.toggle('active');
  mainContent.classList.toggle('shifted');
  topbar.classList.toggle('shifted');
  menuToggle.classList.toggle('active');
  //sidenavToggle.classList.toggle('active');
});

sidenavToggle.addEventListener('click', () => {
  sidenav.classList.toggle('active');
  mainContent.classList.toggle('shifted');
  topbar.classList.toggle('shifted');
  menuToggle.classList.toggle('active');
  //sidenavToggle.classList.toggle('active');
});

// Content section switching
const sidenavItems = document.querySelectorAll('.sidenav-item');
const contentSections = document.querySelectorAll('.content-section');

sidenavItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Update active sidebar item
    sidenavItems.forEach(el => el.classList.remove('active'));
    item.classList.add('active');
    
    // Get section to show
    const sectionId = item.getAttribute('data-section');
    
    // Hide all sections and show the selected one
    contentSections.forEach(section => {
      section.classList.remove('active');
      if (section.id === `${sectionId}-section`) {
        section.classList.add('active');
      }
    });
    
    // Update page title
    pageTitle.textContent = item.querySelector('span').textContent;
    
    // On mobile, close the sidenav after selection
    if (window.innerWidth <= 768) {
      sidenav.classList.remove('active');
      mainContent.classList.remove('shifted');
      topbar.classList.remove('shifted');
      menuToggle.classList.remove('active');
    }
  });
});

// Set first item as active by default
sidenavItems[0].classList.add('active');

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 768) {
    if (!sidenav.contains(e.target) &&
      !menuToggle.contains(e.target) &&
      sidenav.classList.contains('active')) {
      sidenav.classList.remove('active');
      mainContent.classList.remove('shifted');
      topbar.classList.remove('shifted');
      menuToggle.classList.remove('active');
      sidenavToggle.classList.remove('active');
    }
  }
});

// Profile dropdown toggle
const profileImage = document.querySelector('.profile-image');
const profileDropdown = document.querySelector('.profile-dropdown');

profileImage.addEventListener('click', (e) => {
  e.stopPropagation();
  profileDropdown.classList.toggle('active');
});

// Close profile dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!profileDropdown.contains(e.target) && !profileImage.contains(e.target)) {
    profileDropdown.classList.remove('active');
  }
});

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');

// Check local storage for theme preference
if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  themeToggle.checked = true;
}

themeToggle.addEventListener('change', () => {
  if (themeToggle.checked) {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }
});

// Current time function
function updateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  document.getElementById('current-time').textContent = `${hours}:${minutes}:${seconds}`;
}

// Update time every second
updateTime();
setInterval(updateTime, 1000);

document.addEventListener("click", function() {
  let audio = document.getElementById("audio");
  audio.play();
}, { once: true }); // Hanya berjalan sekali

class TypeWriter {
  constructor(element, words, waitTime = 3000) {
    this.element = element;
    this.words = words;
    this.txt = '';
    this.waitTime = waitTime;
    this.isDeleting = false;
    this.wordIndex = Math.floor(Math.random() * this.words.length);
    this.type();
  }
  
  type() {
    const current = this.words[this.wordIndex];
    const fullTxt = '"' + current + '"';
    
    this.txt = this.isDeleting ?
      fullTxt.substring(0, this.txt.length - 1) :
      fullTxt.substring(0, this.txt.length + 1);
    
    // Tambahkan kursor "|" berkedip
    this.element.innerHTML = this.txt + '<span class="cursor">|</span>';
    
    let typeSpeed = 50;
    if (this.isDeleting) typeSpeed /= 2;
    
    if (!this.isDeleting && this.txt === fullTxt) {
      typeSpeed = this.waitTime;
      this.isDeleting = true;
    } else if (this.isDeleting && this.txt === '') {
      this.isDeleting = false;
      this.wordIndex = Math.floor(Math.random() * this.words.length);
      typeSpeed = 50;
    }
    
    setTimeout(() => this.type(), typeSpeed);
  }
}

// Ambil data dari quote.json
fetch('/database/motivasi.json')
  .then(response => response.json())
  .then(data => {
    const textElement = document.getElementById('katakata');
    new TypeWriter(textElement, data);
  })
  .catch(error => console.error('Error loading quotes:', error));

// Tambahkan CSS untuk animasi kursor berkedip
const style = document.createElement('style');
style.innerHTML = `
  .cursor {
    display: inline-block;
    animation: blink 1s infinite;
  }
  @keyframes blink {
    50% { opacity: 0; }
  }
`;
document.head.appendChild(style);