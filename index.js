(function () {
      const canvas = document.getElementById('three-canvas');
      const W = window.innerWidth, H = window.innerHeight;
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
      camera.position.set(0, 0, 5);

      const ico = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.8, 1),
        new THREE.MeshBasicMaterial({ color: 0x00d4ff, wireframe: true, transparent: true, opacity: 0.07 })
      );
      ico.position.set(0, 0, -2);
      scene.add(ico);

      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(2.9, 0.007, 4, 90),
        new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.13 })
      );
      torus.rotation.x = Math.PI * 0.32;
      scene.add(torus);

      const sph = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x00d4ff, wireframe: true, transparent: true, opacity: 0.18 })
      );
      sph.position.set(4.2, 1.8, -3.5);
      scene.add(sph);

      const orbiters = [];
      for (let i = 0; i < 7; i++) {
        const a0 = (i / 7) * Math.PI * 2;
        const r = 3.2 + (i % 2) * 0.6;
        const m = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.2, 0.2),
          new THREE.MeshBasicMaterial({ color: 0x00d4ff, wireframe: true, transparent: true, opacity: 0.28 })
        );
        m.userData = { a: a0, speed: 0.0014 + i * 0.00025, r };
        m.position.set(Math.cos(a0) * r, Math.sin(a0) * r * 0.32, -1);
        scene.add(m);
        orbiters.push(m);
      }

      const N = 240;
      const pos = new Float32Array(N * 3);
      for (let i = 0; i < N * 3; i++) pos[i] = (Math.random() - .5) * 18;
      const pg = new THREE.BufferGeometry();
      pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      scene.add(new THREE.Points(pg,
        new THREE.PointsMaterial({ color: 0x00d4ff, size: 0.013, transparent: true, opacity: 0.4 })));

      let tmx = 0, tmy = 0, cmx = 0, cmy = 0;
      window.addEventListener('mousemove', e => {
        tmx = (e.clientX / window.innerWidth - 0.5);
        tmy = (e.clientY / window.innerHeight - 0.5);
      }, { passive: true });

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      let t = 0;
      function frame() {
        requestAnimationFrame(frame);
        t += 0.004;
        ico.rotation.x = t * 0.24;
        ico.rotation.y = t * 0.17;
        torus.rotation.z = t * 0.04;
        sph.rotation.x += 0.005;
        sph.rotation.y += 0.007;
        orbiters.forEach(m => {
          m.userData.a += m.userData.speed;
          const a = m.userData.a, r = m.userData.r;
          m.position.x = Math.cos(a) * r;
          m.position.y = Math.sin(a) * r * 0.32;
          m.rotation.x += 0.008;
          m.rotation.y += 0.01;
        });
        cmx += (tmx - cmx) * 0.035;
        cmy += (tmy - cmy) * 0.035;
        camera.position.x = cmx * 0.35;
        camera.position.y = -cmy * 0.25;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
      }
      frame();
    })();

    // ── SCROLL REVEAL ─────────────────────────────────────────────────────────
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // ── FORM — Real API Integration ───────────────────────────────────────────
    const clearForm = () => {
      document.getElementById('nameId').value = '';
      document.getElementById('email').value = '';
      document.getElementById('phone').value = '';
      document.getElementById('message').value = '';
    };

    const showStatus = (msg, isError = false) => {
      const ok = document.getElementById('formOk');
      ok.style.display = 'block';
      ok.style.borderColor = isError ? '#f97316' : 'var(--accent)';
      ok.style.color = isError ? '#f97316' : 'var(--accent)';
      ok.textContent = msg;
      if (!isError) setTimeout(() => { ok.style.display = 'none'; }, 5000);
    };

    const fetchData = async (name, email, phone, message) => {
      try {
        const response = await axios.post(
          'https://portfolio-data-five.vercel.app/portfolio/register',
          { name, email, phone, message },
          { withCredentials: true }
        );
        alert(response.data.message);
        clearForm();
      } catch (error) {
        console.log('Error:', error);
        alert(error.response ? error.response.data.message : 'An error occurred!');
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById('nameId').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const message = document.getElementById('message').value;
      if (!name || !email || !phone || !message) {
        alert('Please fill in all fields.');
        return;
      }
      const btn = document.getElementById('submitBtn');
      btn.textContent = 'Sending...';
      btn.disabled = true;
      fetchData(name, email, phone, message).finally(() => {
        btn.textContent = 'Send Message →';
        btn.disabled = false;
      });
    };