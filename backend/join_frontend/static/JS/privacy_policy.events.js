document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('navLogo')?.addEventListener('click', () => {
      window.location.href = LOGIN_URL;
    });
  
    document.getElementById('navPrivacyPolicy')?.addEventListener('click', () => {
      window.location.href = PRIVACY_URL;
    });
  
    document.getElementById('navLegalNotice')?.addEventListener('click', () => {
      window.location.href = LEGAL_URL;
    });
  
    document.getElementById('goBackBtn')?.addEventListener('click', () => {
      history.back();
    });
  });
  