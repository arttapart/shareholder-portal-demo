// تأیید پیش از عملیات حساس
document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-confirm]');
  if (el && !confirm(el.getAttribute('data-confirm'))) e.preventDefault();
});
document.addEventListener('submit', function (e) {
  var f = e.target;
  if (f.hasAttribute('data-confirm') && !confirm(f.getAttribute('data-confirm'))) e.preventDefault();
});
// بستن منوی موبایل با کلیک بیرون
document.addEventListener('click', function (e) {
  if (document.body.classList.contains('nav-open') && !e.target.closest('.sidenav,.menu-btn')) document.body.classList.remove('nav-open');
});
