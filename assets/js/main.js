// En-tête compact, menu mobile, apparitions au défilement. Aucun texte n'est injecté.
(function () {
  var entete = document.querySelector('.entete');
  var bascule = document.querySelector('.bascule');
  var menu = document.getElementById('menu');

  function surDefilement() { entete.classList.toggle('est-compact', window.scrollY > 40); }
  surDefilement();
  window.addEventListener('scroll', surDefilement, { passive: true });

  function ouvrir(oui) {
    bascule.setAttribute('aria-expanded', oui ? 'true' : 'false');
    bascule.textContent = oui ? 'Fermer' : 'Menu';
    menu.classList.toggle('est-ouvert', oui);
  }
  bascule.addEventListener('click', function () { ouvrir(bascule.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) ouvrir(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && bascule.getAttribute('aria-expanded') === 'true') { ouvrir(false); bascule.focus(); }
  });

  // Sites : un seul ouvert. Au bureau, le survol prévisualise ; sur mobile, on touche pour ouvrir ou fermer.
  var bureau = window.matchMedia('(min-width: 900px)');
  var sites = Array.prototype.slice.call(document.querySelectorAll('[data-sites] .site'));
  function montrer(site) {
    sites.forEach(function (s) {
      var oui = s === site;
      s.classList.toggle('est-ouvert', oui);
      s.querySelector('.site__nom').setAttribute('aria-expanded', oui ? 'true' : 'false');
    });
  }
  sites.forEach(function (site) {
    var bouton = site.querySelector('.site__nom'), attente;
    bouton.addEventListener('click', function () {
      var ferme = !bureau.matches && site.classList.contains('est-ouvert');
      montrer(ferme ? null : site);
      if (!ferme && !bureau.matches) {
        var haut = bouton.getBoundingClientRect().top + window.scrollY - 76;
        window.scrollTo({ top: haut });
      }
    });
    bouton.addEventListener('mouseenter', function () { if (bureau.matches) attente = setTimeout(function () { montrer(site); }, 110); });
    bouton.addEventListener('mouseleave', function () { clearTimeout(attente); });
    bouton.addEventListener('focus', function () { if (bureau.matches) montrer(site); });
  });

  // Data : trois étapes (onglets, flèches du clavier, boutons dans chaque étape)
  var labo = document.querySelector('[data-labo]');
  if (labo) {
    var onglets = Array.prototype.slice.call(labo.querySelectorAll('[role="tab"]'));
    var choisir = function (onglet, focus) {
      onglets.forEach(function (o) {
        var oui = o === onglet;
        o.setAttribute('aria-selected', oui ? 'true' : 'false');
        o.tabIndex = oui ? 0 : -1;
        document.getElementById(o.getAttribute('aria-controls')).hidden = !oui;
      });
      if (focus) onglet.focus({ preventScroll: true });
    };
    choisir(onglets[0]);
    onglets.forEach(function (o, i) {
      o.addEventListener('click', function () { choisir(o); });
      o.addEventListener('keydown', function (e) {
        var pas = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (pas) { e.preventDefault(); choisir(onglets[(i + pas + onglets.length) % onglets.length], true); }
      });
    });
    labo.querySelectorAll('[data-vers]').forEach(function (b) {
      b.addEventListener('click', function () { choisir(document.getElementById(b.dataset.vers), true);
        if (labo.getBoundingClientRect().top < 80) labo.scrollIntoView();
      });
    });
  }

  // Contact : la phrase choisie devient le message WhatsApp
  var message = document.querySelector('[data-message]');
  if (message) {
    var lienEnvoi = message.querySelector('[data-envoi]');
    var composer = function () {
      var v = function (id) { return document.getElementById(id).value; };
      lienEnvoi.href = 'https://wa.me/243826780873?text=' + encodeURIComponent('Bonjour John, je représente ' + v('qui') + ' et j’ai besoin ' + v('quoi') + ' ' + v('quand') + '. Je vous écris ' + v('ou') + '.');
    };
    message.addEventListener('change', composer);
    composer();
  }

  var cibles = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) { cibles.forEach(function (el) { el.classList.add('is-visible'); }); return; }
  var io = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  cibles.forEach(function (el) { io.observe(el); });
})();
