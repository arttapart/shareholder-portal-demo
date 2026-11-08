// اسکریپت نسخه پیش‌نمایش ایستا (فقط برای نمایش؛ در نسخه اصلی وجود ندارد)
(function () {
  var D = window.DEMO || {};
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  var css = '.demo-toast{position:fixed;left:50%;bottom:calc(70px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:#074440;color:#fff;padding:10px 18px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.25);z-index:999;max-width:min(92vw,520px);font-size:14px;line-height:1.8;text-align:center;opacity:0;transition:opacity .2s;pointer-events:none}' +
    '.demo-toast.on{opacity:1}' +
    '.demo-pill{position:fixed;left:calc(12px + env(safe-area-inset-left,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));background:#f28a1d;color:#fff;border-radius:20px;padding:4px 14px;font-size:12px;z-index:998;box-shadow:0 4px 12px rgba(0,0,0,.2)}' +
    '.demo-panel{margin-top:16px;background:rgba(255,255,255,.96);border-radius:14px;padding:16px;color:#1d2b2a;font-size:13px}' +
    '.demo-panel h3{margin:0 0 8px;font-size:15px;color:#074440}.demo-panel table{width:100%;border-collapse:collapse}.demo-panel td,.demo-panel th{padding:3px 6px;border-bottom:1px solid #dfe7e5;text-align:right}' +
    '.demo-panel .ltr{direction:ltr;text-align:left;font-variant-numeric:tabular-nums}.demo-panel button{font:inherit;font-size:12px;border:1px solid #c3dfdb;background:#e6f2f0;border-radius:6px;cursor:pointer;padding:0 8px}' +
    '@media print{.demo-toast,.demo-pill{display:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var toastEl, tmr;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'demo-toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('on');
    clearTimeout(tmr); tmr = setTimeout(function () { toastEl.classList.remove('on'); }, 3800);
  }
  var OFF = 'در نسخه پیش‌نمایش ذخیره و تغییر اطلاعات غیرفعال است؛ در نسخه نصب‌شده روی هاست کامل کار می‌کند.';

  var pill = document.createElement('div'); pill.className = 'demo-pill'; pill.textContent = 'نسخه پیش‌نمایش · داده‌های ساختگی';
  if (window === window.top) document.body.appendChild(pill);

  window.print = function () { toast('چاپ در این پیش‌نمایش ممکن نیست. در نسخه نصب‌شده با همین دکمه، برگه چاپ یا به PDF ذخیره می‌شود.'); };
  window.confirm = function () { return true; };

  function showError(form, msg) {
    var a = form.parentNode.querySelector('.alert-error');
    if (!a) { a = document.createElement('div'); a.className = 'alert alert-error'; form.parentNode.insertBefore(a, form); }
    a.textContent = msg;
  }
  function en(s) { return String(s || '').replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); }).replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).trim(); }

  function handle(form) {
    var orig = form.getAttribute('data-orig') || '';
    // ورود سهامدار
    if (D.page === 'login' && D.ctx === 'root') {
      var sn = en(form.username.value), pw = en(form.password.value), u = null;
      (D.users || []).forEach(function (x) { if (x[0] === sn) u = x; });
      if (!u) return showError(form, 'شماره سهام یا رمز عبور اشتباه است.');
      var saved = store('demo-pw-' + sn);
      if (pw !== u[1] && pw !== saved) return showError(form, 'شماره سهام یا رمز عبور اشتباه است.');
      location.href = 'u' + sn + '/index.html'; return;
    }
    if (D.page === 'login' && D.ctx === 'admin') {
      if (form.username.value.trim() === 'admin' && form.password.value === 'Admin12345') location.href = 'index.html';
      else showError(form, 'نام کاربری یا رمز عبور اشتباه است.');
      return;
    }
    if (/change_password/.test(orig)) {
      var me = null; (D.users || []).forEach(function (x) { if (x[0] === D.me) me = x; });
      var cur = en(form.current.value), saved2 = store('demo-pw-' + D.me), nw = form['new'].value;
      if (D.page === 'first-login' && me && cur !== me[1] && cur !== saved2) return showError(form, 'رمز عبور فعلی درست نیست.');
      if (nw !== form.confirm.value) return showError(form, 'رمز جدید و تکرار آن یکسان نیستند.');
      if (nw.length < 8) return showError(form, 'رمز عبور باید حداقل ۸ کاراکتر باشد.');
      if (!/[A-Za-z]/.test(nw) || !/\d/.test(en(nw))) return showError(form, 'رمز عبور باید ترکیبی از حروف انگلیسی و عدد باشد.');
      store('demo-pw-' + D.me, nw);
      location.href = 'index.html'; return;
    }
    if ((form.method || 'get').toLowerCase() === 'get' && !form.querySelector('input[type=file]')) {
      var params = [];
      new FormData(form).forEach(function (v, k) { if (v !== '' && typeof v === 'string') params.push([k, v]); });
      params.sort(function (a, b) { return a[0] < b[0] ? -1 : 1; });
      var key = orig + '?' + params.map(function (p) { return p[0] + '=' + p[1]; }).join('&');
      if (D.map[key]) { location.href = D.map[key]; return; }
      toast('جستجوی متنی در پیش‌نمایش فعال نیست؛ در نسخه نصب‌شده کار می‌کند.'); return;
    }
    toast(OFF);
  }
  document.addEventListener('submit', function (e) { e.preventDefault(); e.stopImmediatePropagation(); handle(e.target); }, true);
  HTMLFormElement.prototype.submit = function () { handle(this); };
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href="#demo-off"]');
    if (a) { e.preventDefault(); e.stopImmediatePropagation(); toast(/sample|export/.test(a.textContent + a.className) ? OFF : OFF); }
  }, true);

  // مهر «نمونه» روی برگه‌های سهام پیش‌نمایش
  var sheet = document.querySelector('.sheet');
  if (sheet) {
    var wm = document.createElement('div');
    wm.textContent = 'نمونه آزمایشی · فاقد اعتبار';
    wm.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-18deg);font:700 34pt Vazirmatn,Tahoma,sans-serif;color:rgba(192,57,43,.28);border:4px solid rgba(192,57,43,.28);border-radius:12px;padding:4mm 10mm;white-space:nowrap;pointer-events:none;z-index:5';
    sheet.appendChild(wm);
  }

  // راهنمای حساب‌های آزمایشی در صفحه ورود
  if (D.page === 'login' && D.ctx === 'root') {
    var card = document.querySelector('.simple-links');
    var box = document.createElement('div'); box.className = 'demo-panel';
    var rows = (D.users || []).map(function (u) {
      var changed = store('demo-pw-' + u[0]);
      return '<tr><td class="ltr">' + u[0] + '</td><td class="ltr">' + u[1] + '</td><td><button type="button" data-u="' + u[0] + '">پر کن</button></td></tr>';
    }).join('');
    box.innerHTML = '<h3>حساب‌های آزمایشی</h3><p style="margin:0 0 8px">نام کاربری = شماره سهام، رمز = کد ملی. (در این نسخه نمایشی، مرحله‌ی تغییر اجباری رمز در اولین ورود حذف شده است.) مدیر: <b class="ltr">admin</b> / <b class="ltr">Admin12345</b></p>' +
      '<table><thead><tr><th>شماره سهام</th><th>کد ملی (رمز اولیه)</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '';
    card.parentNode.insertBefore(box, card.nextSibling);
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.id === 'demoReset') { (D.users || []).forEach(function (u) { try { localStorage.removeItem('demo-pw-' + u[0]); } catch (x) {} }); location.reload(); return; }
      var u = null; (D.users || []).forEach(function (x) { if (x[0] === b.getAttribute('data-u')) u = x; });
      var f = document.querySelector('form'); f.username.value = u[0]; f.password.value = u[1]; f.password.focus();
    });
  }
})();
