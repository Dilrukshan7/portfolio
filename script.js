/* ============================================================
   Dilrukshan portfolio
   - Three.js space scene: lit Earth, clouds, atmosphere,
     star field, moon, satellite, Sri Lanka ping
   - GSAP: entrance choreography + scroll-driven reveals
   Every module is guarded so the script also runs on pages
   that only contain a subset of the elements (thankyou.html).
   ============================================================ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';

  if (hasST) gsap.registerPlugin(ScrollTrigger);

  document.addEventListener('DOMContentLoaded', function () {
    initGlobe();
    initHeroIntro();
    initHeader();
    initScrollReveals();
    initCounters();
    initGalleryParallax();
    initLightbox();
    initMagnetic();
    initTilt();
    initMarquee();
    initMobileMenu();
  });

  /* ----------------------------------------------------------
     Space scene
  ---------------------------------------------------------- */
  function initGlobe() {
    var canvas = document.getElementById('globe-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    var EARTH_R = 6;

    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 400);
    camera.position.set(0, 0.5, 24);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // scrollGroup carries scroll-driven motion; system carries layout position.
    var scrollGroup = new THREE.Group();
    scene.add(scrollGroup);

    var system = new THREE.Group();
    system.rotation.z = -0.12; // subtle axial tilt
    scrollGroup.add(system);

    var EARTH_START = -3.05; // Sri Lanka drifts to face the camera just after load
    var spinGroup = new THREE.Group();
    spinGroup.rotation.y = EARTH_START;
    system.add(spinGroup);

    var loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    var TEX = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/';

    function loadTex(file, onDone) {
      return loader.load(TEX + file, onDone, undefined, function () { /* keep fallback material */ });
    }

    // --- Earth ---
    var earthMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: 0x333f5e,
      shininess: 18,
      transparent: true,
      opacity: 0
    });
    var earth = new THREE.Mesh(new THREE.SphereGeometry(EARTH_R, 96, 96), earthMat);
    spinGroup.add(earth);

    earthMat.map = loadTex('earth_atmos_2048.jpg', function () {
      earthMat.needsUpdate = true;
      fadeIn(earthMat, 1);
    });
    earthMat.specularMap = loadTex('earth_specular_2048.jpg', function () { earthMat.needsUpdate = true; });
    earthMat.normalMap = loadTex('earth_normal_2048.jpg', function () { earthMat.needsUpdate = true; });
    earthMat.normalScale = new THREE.Vector2(0.75, 0.75);

    // --- Clouds (independent, slightly faster drift) ---
    var cloudMat = new THREE.MeshLambertMaterial({ transparent: true, opacity: 0, depthWrite: false });
    var clouds = new THREE.Mesh(new THREE.SphereGeometry(EARTH_R * 1.012, 96, 96), cloudMat);
    system.add(clouds);

    cloudMat.map = loadTex('earth_clouds_1024.png', function () {
      cloudMat.needsUpdate = true;
      fadeIn(cloudMat, 0.55);
    });

    // --- Atmosphere rim glow (fresnel, back side) ---
    var atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_R, 64, 64),
      new THREE.ShaderMaterial({
        vertexShader: [
          'varying vec3 vNormal;',
          'void main() {',
          '  vNormal = normalize(normalMatrix * normal);',
          '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
          '}'
        ].join('\n'),
        fragmentShader: [
          'varying vec3 vNormal;',
          'void main() {',
          '  float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);',
          '  gl_FragColor = vec4(0.30, 0.52, 1.0, 1.0) * intensity;',
          '}'
        ].join('\n'),
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
      })
    );
    atmosphere.scale.setScalar(1.18);
    system.add(atmosphere);

    // --- Star field (two layers for depth + twinkle) ---
    var starsNear = makeStars(900, 0.55, 0.9, 55, 110);
    var starsFar = makeStars(1200, 0.35, 0.6, 110, 190);
    scene.add(starsNear);
    scene.add(starsFar);

    function makeStars(count, size, opacity, rMin, rMax) {
      var positions = new Float32Array(count * 3);
      for (var i = 0; i < count; i++) {
        var v = new THREE.Vector3(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1
        ).normalize().multiplyScalar(rMin + Math.random() * (rMax - rMin));
        positions[i * 3] = v.x;
        positions[i * 3 + 1] = v.y;
        positions[i * 3 + 2] = v.z;
      }
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      var mat = new THREE.PointsMaterial({
        color: 0xcdd8ff,
        size: size,
        sizeAttenuation: true,
        transparent: true,
        opacity: opacity,
        depthWrite: false
      });
      return new THREE.Points(geo, mat);
    }

    // --- Moon ---
    var moonOrbit = new THREE.Group();
    moonOrbit.rotation.set(0.18, 0, -0.08);
    system.add(moonOrbit);

    var moonMat = new THREE.MeshPhongMaterial({ color: 0xbfbfbf, shininess: 4 });
    var moon = new THREE.Mesh(new THREE.SphereGeometry(1.0, 48, 48), moonMat);
    moonOrbit.add(moon);
    moonMat.map = loadTex('moon_1024.jpg', function () {
      moonMat.color.set(0xffffff);
      moonMat.needsUpdate = true;
    });
    var MOON_R = 15;

    // --- Satellite with a faint orbit path ---
    var satOrbit = new THREE.Group();
    satOrbit.rotation.set(0.62, 0, 0.25);
    system.add(satOrbit);

    var sat = new THREE.Group();
    var satBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.3, 0.55),
      new THREE.MeshStandardMaterial({ color: 0xd9dfeb, roughness: 0.35, metalness: 0.6 })
    );
    var panelMat = new THREE.MeshStandardMaterial({
      color: 0x2b5cc4,
      roughness: 0.25,
      metalness: 0.7,
      emissive: 0x102a5e,
      emissiveIntensity: 0.6
    });
    var panelL = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.04, 0.45), panelMat);
    panelL.position.x = -0.95;
    var panelR = panelL.clone();
    panelR.position.x = 0.95;
    sat.add(satBody, panelL, panelR);
    satOrbit.add(sat);

    var SAT_R = 8.8;
    var pathPts = [];
    for (var p = 0; p <= 96; p++) {
      var a = (p / 96) * Math.PI * 2;
      pathPts.push(new THREE.Vector3(Math.cos(a) * SAT_R, 0, Math.sin(a) * SAT_R));
    }
    var satPath = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pathPts),
      new THREE.LineBasicMaterial({ color: 0x4d8dff, transparent: true, opacity: 0.12 })
    );
    satOrbit.add(satPath);

    // --- Sri Lanka ping (location marker, warm tone by design) ---
    var slPos = latLonToVector3(7.8731, 80.7718, EARTH_R * 1.004);

    var marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xff7a5c })
    );
    marker.position.copy(slPos);
    spinGroup.add(marker);

    var pingRings = [];
    for (var r = 0; r < 2; r++) {
      var ring = new THREE.Mesh(
        new THREE.RingGeometry(0.14, 0.18, 32),
        new THREE.MeshBasicMaterial({
          color: 0xff7a5c,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          depthWrite: false
        })
      );
      ring.position.copy(slPos);
      ring.lookAt(slPos.clone().multiplyScalar(2));
      spinGroup.add(ring);
      pingRings.push(ring);
    }

    function latLonToVector3(lat, lon, radius) {
      var phi = (90 - lat) * (Math.PI / 180);
      var theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }

    // --- Lighting: one warm sun from the right, cool fill on the night side ---
    scene.add(new THREE.AmbientLight(0x2a3550, 0.9));

    var sun = new THREE.DirectionalLight(0xfff2dd, 1.5);
    sun.position.set(14, 4, 8);
    scene.add(sun);

    var nightFill = new THREE.PointLight(0x3b6dd6, 0.35);
    nightFill.position.set(-18, -2, -6);
    scene.add(nightFill);

    // --- Layout: planet sits right of center on wide screens ---
    function layout() {
      var w = window.innerWidth;
      camera.aspect = w / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(w, window.innerHeight);
      system.position.x = w > 1024 ? 4.4 : 0;
      system.position.y = w > 1024 ? -1.2 : -2.2;
      camera.position.z = w < 768 ? 34 : 29;
      if (reduceMotion) renderStatic();
    }
    window.addEventListener('resize', layout);

    // --- Texture fade-in helper ---
    function fadeIn(material, target) {
      if (reduceMotion || !hasGsap) {
        material.opacity = target;
        renderStatic();
        return;
      }
      gsap.to(material, { opacity: target, duration: 1.6, ease: 'power2.out' });
    }

    // --- Scroll choreography: planet sinks and dims as content arrives ---
    if (hasST && !reduceMotion && document.querySelector('.hero')) {
      gsap.to(scrollGroup.position, {
        y: -16,
        ease: 'none',
        scrollTrigger: { start: 0, end: function () { return window.innerHeight * 1.6; }, scrub: 0.6 }
      });
      gsap.to(canvas, {
        opacity: 0.38,
        ease: 'none',
        scrollTrigger: { start: 0, end: function () { return window.innerHeight * 1.2; }, scrub: 0.6 }
      });
    }

    // --- Pointer parallax (damped in the render loop, no per-event tweens) ---
    var pointerX = 0;
    var pointerY = 0;
    if (finePointer && !reduceMotion) {
      window.addEventListener('pointermove', function (e) {
        pointerX = e.clientX / window.innerWidth - 0.5;
        pointerY = e.clientY / window.innerHeight - 0.5;
      });
    }

    // --- Render loop ---
    var clock = new THREE.Clock();
    var rafId = null;

    function frame() {
      var t = clock.getElapsedTime();

      spinGroup.rotation.y = EARTH_START + t * 0.045;
      clouds.rotation.y = t * 0.058;

      starsNear.rotation.y = t * 0.004;
      starsFar.rotation.y = -t * 0.002;
      starsNear.material.opacity = 0.75 + Math.sin(t * 0.9) * 0.15;
      starsFar.material.opacity = 0.5 + Math.sin(t * 0.6 + 2.0) * 0.1;

      var ma = t * 0.06;
      moon.position.set(Math.cos(ma) * MOON_R, 0, Math.sin(ma) * MOON_R);
      moon.rotation.y = -ma; // tidally locked

      var sa = t * 0.3;
      sat.position.set(Math.cos(sa) * SAT_R, 0, Math.sin(sa) * SAT_R);
      sat.rotation.y = -sa + Math.PI / 2;

      for (var i = 0; i < pingRings.length; i++) {
        var ph = (t * 0.45 + i * 0.5) % 1;
        var s = 1 + ph * 2.4;
        pingRings[i].scale.set(s, s, s);
        pingRings[i].material.opacity = (1 - ph) * 0.55;
      }

      // damped camera drift toward the pointer
      camera.position.x += (pointerX * 1.6 - camera.position.x) * 0.04;
      camera.position.y += (0.5 - pointerY * 1.2 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(frame);
    }

    function renderStatic() {
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }

    if (reduceMotion) {
      // one composed frame, refreshed as textures arrive
      clouds.rotation.y = 1.2;
      renderStatic();
    } else {
      rafId = requestAnimationFrame(frame);
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = null;
        } else if (!rafId) {
          clock.getDelta();
          rafId = requestAnimationFrame(frame);
        }
      });
    }

    layout();
  }

  /* ----------------------------------------------------------
     Hero entrance
  ---------------------------------------------------------- */
  function initHeroIntro() {
    var title = document.querySelector('[data-split]');
    if (!title || !hasGsap || reduceMotion) return;

    var text = title.textContent.trim();
    title.setAttribute('aria-label', text);
    title.textContent = '';
    text.split('').forEach(function (ch) {
      var span = document.createElement('span');
      span.className = 'char';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = ch;
      title.appendChild(span);
    });

    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from(title.querySelectorAll('.char'), {
      yPercent: 115,
      duration: 1.1,
      stagger: 0.045
    }, 0.15);
    tl.from('.hero [data-fade]', {
      y: 26,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      clearProps: 'transform'
    }, '-=0.7');
  }

  /* ----------------------------------------------------------
     Header: glass on scroll, hide on scroll down
  ---------------------------------------------------------- */
  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    if (hasST) {
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: function (self) {
          var y = self.scroll();
          header.classList.toggle('scrolled', y > 60);
          var menuOpen = document.querySelector('.site-nav.open');
          if (self.direction === 1 && y > 400 && !menuOpen) {
            header.classList.add('header-hidden');
          } else {
            header.classList.remove('header-hidden');
          }
        }
      });
    } else {
      // sentinel fallback without scroll listeners
      var sentinel = document.createElement('div');
      sentinel.style.cssText = 'position:absolute;top:60px;height:1px;width:1px;';
      document.body.prepend(sentinel);
      new IntersectionObserver(function (entries) {
        header.classList.toggle('scrolled', !entries[0].isIntersecting);
      }).observe(sentinel);
    }
  }

  /* ----------------------------------------------------------
     Scroll reveals
  ---------------------------------------------------------- */
  function initScrollReveals() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length || !hasST || reduceMotion) return;

    items.forEach(function (el) {
      gsap.from(el, {
        y: 44,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        clearProps: 'transform',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
  }

  /* ----------------------------------------------------------
     Stat counters
  ---------------------------------------------------------- */
  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    counters.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      if (!hasST || reduceMotion) {
        el.textContent = target;
        return;
      }
      var state = { v: 0 };
      gsap.to(state, {
        v: target,
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onUpdate: function () { el.textContent = Math.round(state.v); }
      });
    });
  }

  /* ----------------------------------------------------------
     Gallery: scroll parallax + lightbox
  ---------------------------------------------------------- */
  function initGalleryParallax() {
    var items = document.querySelectorAll('.gallery-item');
    if (!items.length || !hasST || reduceMotion) return;

    items.forEach(function (item) {
      var img = item.querySelector('img');
      if (!img) return;
      var speed = parseFloat(item.getAttribute('data-speed')) || 1;
      var amp = 7 * speed;
      gsap.fromTo(img,
        { yPercent: -amp, scale: 1.12 },
        {
          yPercent: amp,
          scale: 1.12,
          ease: 'none',
          scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: 0.4 }
        }
      );
    });
  }

  function initLightbox() {
    var lightbox = document.getElementById('lightbox');
    var items = document.querySelectorAll('.gallery-item');
    if (!lightbox || !items.length) return;

    var lbImg = lightbox.querySelector('.lightbox-img');
    var closeBtn = lightbox.querySelector('.lightbox-close');
    var lastFocus = null;

    function open(src, alt) {
      lastFocus = document.activeElement;
      lbImg.src = src;
      lbImg.alt = alt || '';
      lightbox.hidden = false;
      requestAnimationFrame(function () { lightbox.classList.add('open'); });
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function close() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      window.setTimeout(function () {
        lightbox.hidden = true;
        lbImg.src = '';
      }, 350);
      if (lastFocus) lastFocus.focus();
    }

    items.forEach(function (item) {
      var img = item.querySelector('img');
      if (!img) return;
      item.addEventListener('click', function () { open(img.src, img.alt); });
    });

    closeBtn.addEventListener('click', close);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) close();
    });
  }

  /* ----------------------------------------------------------
     Magnetic buttons
  ---------------------------------------------------------- */
  function initMagnetic() {
    if (!finePointer || reduceMotion || !hasGsap) return;

    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var rect = el.getBoundingClientRect();
        var dx = (e.clientX - rect.left) / rect.width - 0.5;
        var dy = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(el, { x: dx * 14, y: dy * 10, duration: 0.4, ease: 'power3.out' });
      });
      el.addEventListener('pointerleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
      });
    });
  }

  /* ----------------------------------------------------------
     Profile card tilt + glare
  ---------------------------------------------------------- */
  function initTilt() {
    var card = document.querySelector('[data-tilt]');
    if (!card || !finePointer || reduceMotion || !hasGsap) return;

    card.addEventListener('pointermove', function (e) {
      var rect = card.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width;
      var py = (e.clientY - rect.top) / rect.height;
      gsap.to(card, {
        rotationX: -(py - 0.5) * 10,
        rotationY: (px - 0.5) * 12,
        transformPerspective: 900,
        duration: 0.5,
        ease: 'power2.out'
      });
      card.style.setProperty('--gx', (px * 100) + '%');
      card.style.setProperty('--gy', (py * 100) + '%');
    });

    card.addEventListener('pointerleave', function () {
      gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' });
    });
  }

  /* ----------------------------------------------------------
     Skills marquee (duplicate the group for a seamless loop)
  ---------------------------------------------------------- */
  function initMarquee() {
    var track = document.querySelector('.marquee-track');
    if (!track || reduceMotion) return;

    var group = track.querySelector('.marquee-group');
    if (!group) return;
    var clone = group.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  }

  /* ----------------------------------------------------------
     Mobile menu
  ---------------------------------------------------------- */
  function initMobileMenu() {
    var toggle = document.querySelector('.mobile-toggle');
    var nav = document.querySelector('.site-nav');
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.innerHTML = open ? '<i class="ri-close-line"></i>' : '<i class="ri-menu-4-line"></i>';
      document.body.style.overflow = open ? 'hidden' : '';
    }

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('open'));
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && nav.classList.contains('open')) setOpen(false);
    });
  }
})();
