export function initContactEventListeners() {
    const addContactBtn = document.getElementById('addContactBtn');
    const closeEditCardBtn = document.getElementById('closeEditCardBtn');
    const closeDetailsBtn = document.getElementById('closeDetailsBtn');
  
    addContactBtn?.addEventListener('click', openAddContactForm);
    closeEditCardBtn?.addEventListener('click', closeAddContactForm);
    closeDetailsBtn?.addEventListener('click', () => {
      document.getElementById('contactInfo').classList.add('d-none');
    });
  
    document.getElementById('contactForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      saveContact();
    });
  }
  