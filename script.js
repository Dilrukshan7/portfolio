// script.js - Three.js Globe & Interactions

document.addEventListener('DOMContentLoaded', () => {
    initGlobe();
    initScrollEffects();
    initMobileMenu();
});

function initGlobe() {
    const canvas = document.getElementById('globe-canvas');
    if (!canvas) return;

    // Scene Setup
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 18;
    camera.position.y = 2;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Load Earth Texture for "Digital Map" look
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-dark.jpg');
    const moonTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg');

    // Globe Geometry
    const geometry = new THREE.SphereGeometry(6, 64, 64);

    // Material - Digital/Holographic look
    const material = new THREE.MeshPhongMaterial({
        map: earthTexture,
        color: 0xaaaaaa,
        specular: 0x333333,
        shininess: 15,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
    });

    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Add a wireframe overlay for extra "digital" feel
    const wireframeGeo = new THREE.WireframeGeometry(geometry);
    const wireframeMat = new THREE.LineBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.15
    });
    const wireframe = new THREE.LineSegments(wireframeGeo, wireframeMat);
    globe.add(wireframe);

    // --- ORBITING ELEMENTS ---

    // 1. Moon
    const moonGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const moonMat = new THREE.MeshPhongMaterial({
        map: moonTexture,
        color: 0xffffff,
        shininess: 5
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    const moonOrbitRadius = 12;
    scene.add(moon);

    // 2. Satellite
    const satGroup = new THREE.Group();
    // Simple satellite shape: Body + Panels
    const satBodyGeo = new THREE.BoxGeometry(0.4, 0.4, 0.8);
    const satBodyMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.4 });
    const satBody = new THREE.Mesh(satBodyGeo, satBodyMat);

    const panelGeo = new THREE.BoxGeometry(1.6, 0.05, 0.6);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x3366ff, roughness: 0.2, metalness: 0.8 });
    const panel1 = new THREE.Mesh(panelGeo, panelMat);
    panel1.position.x = 0;

    satGroup.add(satBody);
    satGroup.add(panel1);
    const satOrbitRadius = 8.5;
    scene.add(satGroup);

    // 3. Rocket
    const rocketGroup = new THREE.Group();
    // Simple Rocket Shape
    const rBodyGeo = new THREE.CylinderGeometry(0.2, 0.2, 1, 16);
    const rBodyMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    const rBody = new THREE.Mesh(rBodyGeo, rBodyMat);
    rBody.rotation.x = Math.PI / 2; // Point forward

    const rNoseGeo = new THREE.ConeGeometry(0.2, 0.4, 16);
    const rNoseMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const rNose = new THREE.Mesh(rNoseGeo, rNoseMat);
    rNose.rotation.x = Math.PI / 2;
    rNose.position.z = 0.7;

    const rFinGeo = new THREE.BoxGeometry(0.6, 0.05, 0.3);
    const rFinMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const rFin = new THREE.Mesh(rFinGeo, rFinMat);
    rFin.position.z = -0.3;

    rocketGroup.add(rBody);
    rocketGroup.add(rNose);
    rocketGroup.add(rFin);

    // Add flame particle
    const flameGeo = new THREE.ConeGeometry(0.1, 0.5, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.8 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.rotation.x = -Math.PI / 2;
    flame.position.z = -0.8;
    rocketGroup.add(flame);

    const rocketOrbitRadius = 9.5;
    scene.add(rocketGroup);


    // --- SRI LANKA HIGHLIGHT ---

    // Coordinates: 7.8731° N, 80.7718° E
    const lat = 7.8731;
    const lon = 80.7718;

    function latLonToVector3(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = (radius * Math.sin(phi) * Math.sin(theta));
        const y = (radius * Math.cos(phi));

        return new THREE.Vector3(x, y, z);
    }

    const slPos = latLonToVector3(lat, lon, 6.05);

    // Marker
    const markerGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xff3333 });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.copy(slPos);
    globe.add(marker);

    // Red Line pointing to Sri Lanka
    // We'll create a line from the surface extending outwards
    const lineStart = slPos.clone();
    const lineEnd = slPos.clone().multiplyScalar(1.3); // Extend out by 30%
    const lineGeo = new THREE.BufferGeometry().setFromPoints([lineStart, lineEnd]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
    const pointerLine = new THREE.Line(lineGeo, lineMat);
    globe.add(pointerLine);

    // Glowing Ring
    const ringGeo = new THREE.RingGeometry(0.2, 0.3, 32);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff3333,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(slPos);
    ring.lookAt(new THREE.Vector3(0, 0, 0));
    globe.add(ring);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x3b82f6, 1.5);
    pointLight.position.set(-10, 5, 20);
    scene.add(pointLight);

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
        const elapsedTime = clock.getElapsedTime();

        // Rotate globe
        globe.rotation.y = elapsedTime * 0.1;

        // Orbit Moon (Slow, wide orbit)
        moon.position.x = Math.cos(elapsedTime * 0.2) * moonOrbitRadius;
        moon.position.z = Math.sin(elapsedTime * 0.2) * moonOrbitRadius;
        moon.rotation.y += 0.005;

        // Orbit Satellite (Faster, inclined orbit)
        const satAngle = elapsedTime * 0.5;
        satGroup.position.x = Math.cos(satAngle) * satOrbitRadius;
        satGroup.position.z = Math.sin(satAngle) * satOrbitRadius;
        satGroup.position.y = Math.sin(satAngle) * 3; // Inclination
        satGroup.lookAt(new THREE.Vector3(0, 0, 0)); // Always face earth
        satGroup.rotateY(Math.PI / 2); // Adjust orientation

        // Orbit Rocket (Fast, elliptical or different axis)
        const rocketAngle = elapsedTime * 0.8 + Math.PI; // Offset start
        rocketGroup.position.x = Math.cos(rocketAngle) * rocketOrbitRadius;
        rocketGroup.position.y = Math.sin(rocketAngle) * rocketOrbitRadius;
        rocketGroup.position.z = Math.sin(rocketAngle * 2) * 2; // Wobble

        // Calculate tangent for rocket rotation (to face forward)
        const tangent = new THREE.Vector3(
            -Math.sin(rocketAngle) * rocketOrbitRadius,
            Math.cos(rocketAngle) * rocketOrbitRadius,
            Math.cos(rocketAngle * 2) * 4 // derivative of z wobble approx
        ).normalize();

        // Align rocket to tangent
        const up = new THREE.Vector3(0, 1, 0);
        const axis = new THREE.Vector3().crossVectors(up, tangent).normalize();
        const radians = Math.acos(up.dot(tangent));
        rocketGroup.quaternion.setFromAxisAngle(axis, radians);

        // Pulse effect for the ring
        const scale = 1 + Math.sin(elapsedTime * 3) * 0.3;
        ring.scale.set(scale, scale, scale);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };

    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Mouse Interaction (Parallax)
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = event.clientX / window.innerWidth - 0.5;
        mouseY = event.clientY / window.innerHeight - 0.5;

        // Subtle camera movement
        gsap.to(camera.position, {
            x: mouseX * 1,
            y: 2 + mouseY * 1,
            duration: 1,
            ease: 'power2.out'
        });
    });
}

function initScrollEffects() {
    // Header scroll effect
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // GSAP Animations
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        gsap.from('.hero-title', { opacity: 0, y: 30, duration: 1, delay: 0.2 });
        gsap.from('.hero-subtitle', { opacity: 0, y: 20, duration: 1, delay: 0.4 });
        gsap.from('.hero-actions', { opacity: 0, y: 20, duration: 1, delay: 0.6 });

        gsap.utils.toArray('.section-header').forEach(header => {
            gsap.from(header, {
                scrollTrigger: {
                    trigger: header,
                    start: 'top 80%',
                },
                opacity: 0,
                y: 30,
                duration: 0.8
            });
        });

        gsap.utils.toArray('.glass-panel').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                },
                opacity: 0,
                y: 30,
                duration: 0.8,
                delay: i * 0.1
            });
        });
    }
}

function initMobileMenu() {
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.site-nav');

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            const isVisible = nav.style.display === 'flex';

            if (isVisible) {
                nav.style.display = 'none';
                toggle.innerHTML = '<i class="ri-menu-4-line"></i>';
            } else {
                nav.style.display = 'flex';
                nav.style.flexDirection = 'column';
                nav.style.position = 'absolute';
                nav.style.top = '100%';
                nav.style.left = '0';
                nav.style.width = '100%';
                nav.style.background = '#050a18';
                nav.style.padding = '20px';
                nav.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
                toggle.innerHTML = '<i class="ri-close-line"></i>';
            }
        });
    }
}
