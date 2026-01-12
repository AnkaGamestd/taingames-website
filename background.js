// TAIN Games - 3D Background Experience
// Using Three.js for immersive visuals

const init3DBackground = () => {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050508, 0.002);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00f2ff, 2, 50);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xbd00ff, 2, 50);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    // Objects (Floating Spheres)
    const spheres = [];
    const geometry = new THREE.IcosahedronGeometry(1, 1); // Low poly look or high poly

    // Material: Dark reflective glass/metal
    const material = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.1,
        metalness: 0.8,
        emissive: 0x000000,
        flatShading: true
    });

    const highlightMaterial = new THREE.MeshStandardMaterial({
        color: 0x00f2ff,
        roughness: 0.2,
        metalness: 0.5,
        emissive: 0x00f2ff,
        emissiveIntensity: 0.5,
        wireframe: true
    });

    for (let i = 0; i < 50; i++) {
        const isHighlight = Math.random() > 0.9;
        const mesh = new THREE.Mesh(geometry, isHighlight ? highlightMaterial : material);

        mesh.position.x = (Math.random() - 0.5) * 60;
        mesh.position.y = (Math.random() - 0.5) * 60;
        mesh.position.z = (Math.random() - 0.5) * 40;

        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;

        const scale = Math.random() * 1.5 + 0.5;
        mesh.scale.set(scale, scale, scale);

        // Custom properties for animation
        mesh.userData = {
            speedX: (Math.random() - 0.5) * 0.02,
            speedY: (Math.random() - 0.5) * 0.02,
            rotationSpeed: (Math.random() - 0.5) * 0.02
        };

        spheres.push(mesh);
        scene.add(mesh);
    }

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.05;
        mouseY = (event.clientY - windowHalfY) * 0.05;
    });

    // Animation Loop
    const animate = () => {
        requestAnimationFrame(animate);

        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        // Rotate scene slightly based on mouse
        scene.rotation.y += 0.05 * (targetX - scene.rotation.y);
        scene.rotation.x += 0.05 * (targetY - scene.rotation.x);

        // Animate spheres
        spheres.forEach(sphere => {
            sphere.rotation.x += sphere.userData.rotationSpeed;
            sphere.rotation.y += sphere.userData.rotationSpeed;

            sphere.position.x += sphere.userData.speedX;
            sphere.position.y += sphere.userData.speedY;

            // Boundary check to keep them in view
            if (Math.abs(sphere.position.x) > 30) sphere.userData.speedX *= -1;
            if (Math.abs(sphere.position.y) > 30) sphere.userData.speedY *= -1;
        });

        renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init3DBackground);
