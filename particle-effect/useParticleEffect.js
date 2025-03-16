import { useCallback, useRef } from 'react';
import * as THREE from 'three';

export const useParticleEffect = ({
  modelPath,
  modelScale = 1,
  particleCount = 1000,
  particleSize = 0.02,
  particleSpread = 2
}) => {
  const cleanupRef = useRef(null);

  const initParticleEffect = useCallback(async (container) => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    camera.position.z = 5;

    // Load GLTFLoader dynamically
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const loader = new GLTFLoader();

    try {
      const gltf = await new Promise((resolve, reject) => {
        loader.load(modelPath, resolve, undefined, reject);
      });

      const model = gltf.scene;
      model.scale.set(modelScale, modelScale, modelScale);
      
      // Create particles
      const particles = new THREE.Points(
        new THREE.BufferGeometry(),
        new THREE.PointsMaterial({
          size: particleSize,
          color: 0xffffff,
          transparent: true,
          opacity: 0.8,
        })
      );

      // Initialize particle positions
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * particleSpread;
        positions[i * 3 + 1] = (Math.random() - 0.5) * particleSpread;
        positions[i * 3 + 2] = (Math.random() - 0.5) * particleSpread;
      }
      particles.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      scene.add(particles);

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        particles.rotation.y += 0.001;
        renderer.render(scene, camera);
      };
      animate();

      // Cleanup function
      const cleanup = () => {
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        scene.remove(particles);
        particles.geometry.dispose();
        particles.material.dispose();
        renderer.dispose();
      };

      return cleanup;
    } catch (error) {
      console.error('Error loading model:', error);
      return () => {};
    }
  }, [modelPath, modelScale, particleCount, particleSize, particleSpread]);

  return { initParticleEffect };
};
