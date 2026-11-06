(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* menu mobilne */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu-mob');
  function zamknij() { menu.hidden = true; burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Otwórz menu'); }
  burger.addEventListener('click', function () {
    var otw = menu.hidden;
    menu.hidden = !otw;
    burger.setAttribute('aria-expanded', String(otw));
    burger.setAttribute('aria-label', otw ? 'Zamknij menu' : 'Otwórz menu');
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) zamknij(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { zamknij(); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 1100 && !menu.hidden) zamknij(); });

  /* karuzele w kartach: palec, mysz, strzałki, licznik */
  var strz = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  document.querySelectorAll('[data-car]').forEach(function (car) {
    var tor = car.querySelector('.car-tor');
    var el = tor.children;
    var n = el.length;
    if (n < 2) return;
    car.setAttribute('data-wiele', '');
    tor.setAttribute('tabindex', '0');
    tor.setAttribute('aria-label', 'Zdjęcia - przewiń w bok');
    var nr = document.createElement('span'); nr.className = 'car-nr'; car.appendChild(nr);
    var l = document.createElement('button'); l.type = 'button'; l.className = 'car-btn l'; l.innerHTML = strz; l.setAttribute('aria-label', 'Poprzednie zdjęcie');
    var p = document.createElement('button'); p.type = 'button'; p.className = 'car-btn p'; p.innerHTML = strz.replace('M15 5l-7 7 7 7', 'M9 5l7 7-7 7'); p.setAttribute('aria-label', 'Następne zdjęcie');
    car.appendChild(l); car.appendChild(p);
    function krok() { return el[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(el[0]).marginRight) || 0); }
    function idx() { return Math.round(tor.scrollLeft / krok()); }
    function odswiez() {
      var i = idx();
      nr.textContent = (Math.min(i, n - 1) + 1) + ' / ' + n;
      l.disabled = tor.scrollLeft < 4;
      p.disabled = tor.scrollLeft > tor.scrollWidth - tor.clientWidth - 4;
    }
    function idz(d) { tor.scrollBy({ left: d * krok(), behavior: reduce ? 'auto' : 'smooth' }); }
    l.addEventListener('click', function () { idz(-1); });
    p.addEventListener('click', function () { idz(1); });
    tor.addEventListener('scroll', function () { window.requestAnimationFrame(odswiez); }, { passive: true });
    tor.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); idz(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); idz(-1); } });
    /* przeciąganie myszą */
    var start = null, sl = 0, ruch = false;
    tor.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      start = e.clientX; sl = tor.scrollLeft; ruch = false;
      tor.setPointerCapture(e.pointerId);
    });
    tor.addEventListener('pointermove', function (e) {
      if (start === null) return;
      var dx = e.clientX - start;
      if (Math.abs(dx) > 4) { ruch = true; car.classList.add('ciag'); }
      if (ruch) tor.scrollLeft = sl - dx;
    });
    function koniec() {
      if (start === null) return;
      start = null;
      if (ruch) {
        var k = krok(), cel = Math.round(tor.scrollLeft / k) * k;
        car.classList.remove('ciag');
        tor.scrollTo({ left: cel, behavior: reduce ? 'auto' : 'smooth' });
      }
    }
    tor.addEventListener('pointerup', koniec);
    tor.addEventListener('pointercancel', koniec);
    tor.addEventListener('click', function (e) { if (ruch) { e.preventDefault(); e.stopPropagation(); ruch = false; } }, true);
    window.addEventListener('resize', odswiez);
    odswiez();
  });

  /* pole plików: nazwy wybranych plików */
  var plik = document.querySelector('.plik input'), plikNazwa = document.getElementById('plik-nazwa');
  var plikDomyslnie = plikNazwa ? plikNazwa.innerHTML : '';
  function pokazPliki() {
    if (!plik) return;
    var f = plik.files;
    if (!f || !f.length) { plikNazwa.innerHTML = plikDomyslnie; return; }
    var nazwy = [].map.call(f, function (x) { return x.name; });
    var b = document.createElement('b'); b.textContent = f.length === 1 ? 'Dodano 1 plik' : 'Dodano pliki: ' + f.length;
    plikNazwa.textContent = ''; plikNazwa.appendChild(b); plikNazwa.appendChild(document.createTextNode(nazwy.join(', ')));
  }
  if (plik) plik.addEventListener('change', pokazPliki);

  /* usługi na telefonie: licznik kart */
  var uTor = document.getElementById('usl-tor'), uNr = document.getElementById('usl-nr');
  if (uTor && uNr) {
    var uN = uTor.children.length;
    uTor.addEventListener('scroll', function () {
      window.requestAnimationFrame(function () {
        var k = uTor.children[0].getBoundingClientRect().width + 14;
        var i = Math.min(uN - 1, Math.round(uTor.scrollLeft / k));
        if (uTor.scrollLeft > uTor.scrollWidth - uTor.clientWidth - 4) i = uN - 1;
        uNr.textContent = (i + 1) + ' / ' + uN;
      });
    }, { passive: true });
  }

  /* formularz (wizualizacja - bez wysyłki) */
  var form = document.getElementById('form');
  var info = document.getElementById('form-info');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nazwa = form.nazwa.value.trim(), tel = form.tel.value.trim(), mail = form.email.value.trim();
    if (!nazwa || (!tel && !mail)) {
      info.className = 'form-info blad';
      info.textContent = 'Podaj imię lub nazwę firmy oraz telefon albo e-mail.';
      return;
    }
    info.className = 'form-info ok';
    info.textContent = 'Dziękujemy. To wizualizacja - w docelowej stronie zapytanie razem z załącznikami trafi od razu na agromiar@o2.pl.';
    form.reset(); pokazPliki();
  });

  /* dolny pasek na telefonie: dopiero po przewinięciu za przycisk w hero */
  var pasek = document.getElementById('mob-pasek');
  var cta = document.getElementById('hero-cta');
  var kontakt = document.getElementById('kontakt');
  if ('IntersectionObserver' in window && pasek && cta) {
    var zaCta = false, wKontakcie = false;
    function ustaw() {
      var w = zaCta && !wKontakcie;
      pasek.classList.toggle('widac', w);
      pasek.setAttribute('aria-hidden', String(!w));
      pasek.querySelectorAll('a').forEach(function (a) { a.tabIndex = w ? 0 : -1; });
    }
    new IntersectionObserver(function (en) { zaCta = !en[0].isIntersecting && en[0].boundingClientRect.top < 0; ustaw(); }).observe(cta);
    new IntersectionObserver(function (en) { wKontakcie = en[0].isIntersecting; ustaw(); }, { threshold: 0.15 }).observe(kontakt);
  }
})();
