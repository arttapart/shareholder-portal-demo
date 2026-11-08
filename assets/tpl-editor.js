// ویرایشگر قالب برگه سهام
(function () {
  var T = window.TPL, fields = T.fields || [], sel = -1, scale = 3;
  var stage = document.getElementById('stage'), wrap = document.getElementById('stageWrap');
  var wIn = document.getElementById('wIn'), hIn = document.getElementById('hIn'), sizeSel = document.getElementById('sizeSel');
  var list = document.getElementById('fieldList'), props = document.getElementById('fieldProps');
  var showSample = document.getElementById('showSample');
  var P = {
    text: document.getElementById('pText'), x: document.getElementById('pX'), y: document.getElementById('pY'), w: document.getElementById('pW'),
    size: document.getElementById('pSize'), color: document.getElementById('pColor'), lh: document.getElementById('pLh'),
    align: document.getElementById('pAlign'), bold: document.getElementById('pBold')
  };

  function fill(text) {
    if (!showSample.checked) return text;
    return text.replace(/\{([a-z_]+)\}/g, function (m, k) { return T.sample[k] !== undefined ? T.sample[k] : m; });
  }
  function short(text) { return text.replace(/\{([a-z_]+)\}/g, function (m, k) { return '«' + (T.placeholders[k] || k) + '»'; }).slice(0, 60); }

  function layout() {
    var W = parseFloat(wIn.value) || 297, H = parseFloat(hIn.value) || 210;
    scale = Math.max(1.2, (wrap.clientWidth - 32) / W);
    stage.style.width = (W * scale) + 'px';
    stage.style.height = (H * scale) + 'px';
    render();
  }

  function render() {
    Array.prototype.slice.call(stage.querySelectorAll('.tpl-field')).forEach(function (n) { n.remove(); });
    fields.forEach(function (f, i) {
      var d = document.createElement('div');
      d.className = 'tpl-field' + (i === sel ? ' sel' : '');
      d.style.right = (f.x * scale) + 'px';
      d.style.top = (f.y * scale) + 'px';
      if (+f.w > 0) d.style.width = (f.w * scale) + 'px';
      d.style.fontSize = (f.size * 0.3528 * scale) + 'px';
      d.style.color = f.color || '#000';
      d.style.fontWeight = f.bold ? 700 : 400;
      d.style.textAlign = f.align || 'right';
      d.style.lineHeight = f.lh || 1.9;
      d.textContent = fill(f.text || '');
      d.addEventListener('pointerdown', function (e) { startDrag(e, i); });
      stage.appendChild(d);
    });
    list.innerHTML = '';
    fields.forEach(function (f, i) {
      var r = document.createElement('div');
      r.className = i === sel ? 'sel' : '';
      r.textContent = (i + 1) + '. ' + (short(f.text || '') || '(خالی)');
      r.onclick = function () { select(i); };
      list.appendChild(r);
    });
    syncProps();
  }

  function syncProps() {
    if (sel < 0 || !fields[sel]) { props.style.display = 'none'; return; }
    props.style.display = '';
    var f = fields[sel];
    if (document.activeElement !== P.text) P.text.value = f.text;
    ['x', 'y', 'w', 'size', 'lh'].forEach(function (k) { if (document.activeElement !== P[k]) P[k].value = f[k]; });
    P.color.value = f.color || '#000000';
    P.align.value = f.align || 'right';
    P.bold.checked = !!f.bold;
  }

  function select(i) { sel = i; render(); }

  function startDrag(e, i) {
    e.preventDefault();
    select(i);
    var f = fields[i], sx = e.clientX, sy = e.clientY, ox = f.x, oy = f.y;
    function mv(ev) {
      f.x = Math.round((ox - (ev.clientX - sx) / scale) * 2) / 2;
      f.y = Math.round((oy + (ev.clientY - sy) / scale) * 2) / 2;
      var n = stage.querySelectorAll('.tpl-field')[i];
      n.style.right = (f.x * scale) + 'px';
      n.style.top = (f.y * scale) + 'px';
      syncProps();
    }
    function up() { document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up); render(); }
    document.addEventListener('pointermove', mv);
    document.addEventListener('pointerup', up);
  }

  Object.keys(P).forEach(function (k) {
    P[k].addEventListener('input', function () {
      if (sel < 0) return;
      var f = fields[sel];
      if (k === 'text' || k === 'color' || k === 'align') f[k] = P[k].value;
      else if (k === 'bold') f.bold = P.bold.checked ? 1 : 0;
      else f[k] = parseFloat(P[k].value) || 0;
      render();
    });
    if (k === 'bold' || k === 'align') P[k].addEventListener('change', function () { P[k].dispatchEvent(new Event('input')); });
  });

  var ph = document.getElementById('phList');
  Object.keys(T.placeholders).forEach(function (k) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = T.placeholders[k];
    b.onclick = function () {
      if (sel < 0) return;
      var t = P.text, s = t.selectionStart || t.value.length;
      t.value = t.value.slice(0, s) + '{' + k + '}' + t.value.slice(t.selectionEnd || s);
      t.dispatchEvent(new Event('input'));
      t.focus();
    };
    ph.appendChild(b);
  });

  document.getElementById('addField').onclick = function () {
    fields.push({ text: 'متن جدید', x: 30, y: 30, w: 0, size: 12, color: '#000000', bold: 0, align: 'right', lh: 1.9 });
    select(fields.length - 1);
  };
  document.getElementById('delField').onclick = function () {
    if (sel < 0 || !confirm('این فیلد حذف شود؟')) return;
    fields.splice(sel, 1);
    sel = -1;
    render();
  };

  document.addEventListener('keydown', function (e) {
    if (sel < 0 || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    var st = e.shiftKey ? 5 : 0.5, f = fields[sel];
    if (e.key === 'ArrowLeft') f.x += st; else if (e.key === 'ArrowRight') f.x -= st;
    else if (e.key === 'ArrowUp') f.y -= st; else if (e.key === 'ArrowDown') f.y += st; else return;
    e.preventDefault();
    f.x = Math.round(f.x * 10) / 10; f.y = Math.round(f.y * 10) / 10;
    render();
  });

  sizeSel.onchange = function () {
    if (sizeSel.value !== 'custom') { var p = sizeSel.value.split('x'); wIn.value = p[0]; hIn.value = p[1]; layout(); }
  };
  wIn.oninput = hIn.oninput = layout;
  showSample.onchange = render;
  window.addEventListener('resize', layout);

  // پیش‌نمایش فوری تصویر زمینه انتخاب‌شده
  var fileIn = document.querySelector('input[name=background]');
  fileIn.addEventListener('change', function () {
    if (!fileIn.files[0]) return;
    var img = stage.querySelector('img.bg');
    if (!img) { img = document.createElement('img'); img.className = 'bg'; stage.insertBefore(img, stage.firstChild); }
    img.src = URL.createObjectURL(fileIn.files[0]);
  });

  document.getElementById('tplForm').addEventListener('submit', function () {
    document.getElementById('fieldsInput').value = JSON.stringify(fields);
  });

  layout();
})();
