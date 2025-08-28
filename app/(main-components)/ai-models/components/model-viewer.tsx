'use client';

// import { useEffect, useRef } from 'react';
// import '@google/model-viewer';

// declare global {
//   namespace JSX {
//     interface IntrinsicElements {
//       'model-viewer': any;
//     }
//   }
// }

// interface ModelViewerProps {
//   src: string;
//   alt: string;
//   poster?: string;
//   className?: string;
// }

// export default function ModelViewer({ src, alt, poster, className = '' }: ModelViewerProps) {
//   const modelViewerRef = useRef(null);

//   return (
//     <model-viewer
//       ref={modelViewerRef}
//       src={src}
//       alt={alt}
//       poster={poster}
//       loading="eager"
//       camera-controls
//       auto-rotate
//       shadow-intensity="1"
//       environment-image="neutral"
//       exposure="0.75"
//       ar={false}
//       ar-modes="none"
//       ar-scale="fixed"
//       className={`w-full h-[400px] bg-muted/50 rounded-lg ${className}`}
//     />
//   );
// }



import React, { useRef, useEffect, Suspense, useState, useCallback } from 'react';
import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, useGLTF, Html } from '@react-three/drei';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import * as THREE from 'three';
import { Loader2 } from 'lucide-react';
import { Mesh, BufferGeometry, Material, Object3D, PerspectiveCamera } from 'three';

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
        <p className="text-sm">Loading model...</p>
      </div>
    </Html>
  );
}

interface ModelWrapperProps {
  src: string;
}

function ModelWrapper({ src }: ModelWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [modelReady, setModelReady] = useState(false);
  const [hasResized, setHasResized] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const maxRetries = 3;
  
  // Detect the file extension
  const getFileExtension = (url: string): string => {
    return url.split('.').pop()?.toLowerCase() || '';
  };
  
  const extension = getFileExtension(src);
  
  // Reset state when source changes
  useEffect(() => {
    setIsLoading(true);
    setModelReady(false);
    setLoadError(null);
    setRetryCount(0);
    
    // Add a delay before trying to load the model (this helps with initial loading)
    const timer = setTimeout(() => {
      setModelReady(true);
    }, 2000); // 2 second delay to ensure everything is ready
    
    // Handle window resize events
    const handleResize = () => {
      setHasResized(true);
      // Force re-render on resize by incrementing retry count
      setRetryCount(prev => prev + 1);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [src]);
  
  // Auto-retry logic when loading fails
  useEffect(() => {
    if (loadError && retryCount < maxRetries) {
      console.log(`Model loading failed, retrying (${retryCount + 1}/${maxRetries})...`);
      const retryTimer = setTimeout(() => {
        setLoadError(null);
        setRetryCount(prev => prev + 1);
      }, 1500 * (retryCount + 1)); // Increasing delay for subsequent retries
      
      return () => clearTimeout(retryTimer);
    }
  }, [loadError, retryCount]);
  
  const LoadedModel = () => {
    const { camera, scene, gl } = useThree();
    const modelRef = useRef<Object3D | Mesh | null>(null);
    const hasPositioned = useRef(false);
    
    // Handle resize in the render loop
    useFrame(() => {
      if (hasResized) {
        // Force renderer to update
        gl.render(scene, camera);
        setHasResized(false);
      }
    });
    
    useEffect(() => {
      if (modelRef.current && modelReady && !hasPositioned.current) {
        // Position model on the grid
        const positionModel = () => {
          if (!modelRef.current) return;
          
          try {
            const box = new THREE.Box3().setFromObject(modelRef.current);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            // Adjust model position to sit on top of the grid
            // Calculate the minimum y value of the model (bottom)
            const minY = box.min.y;
            
            // Move the model up so that its bottom is exactly at y=0 (on top of the grid)
            // Add a small offset to ensure it's visibly on top of the grid
            const yOffset = -minY + 0.02;
            modelRef.current.position.y += yOffset;
            center.y += yOffset; // Adjust the center for camera positioning
            
            // Set camera position based on model size
            const maxDim = Math.max(size.x, size.y, size.z);
            
            // Check if camera is PerspectiveCamera
            if (camera instanceof THREE.PerspectiveCamera) {
              const fov = camera.fov * (Math.PI / 180);
              const cameraZ = Math.abs(maxDim / Math.sin(fov / 2));
              
              // Set camera to view the center of the model
              camera.position.set(center.x, center.y, center.z + cameraZ * 1.5);
              camera.lookAt(center);
              camera.updateProjectionMatrix();
            }
            
            hasPositioned.current = true;
          } catch (error) {
            console.error('Error positioning model:', error);
            // Try again after a delay if there was an error
            setTimeout(positionModel, 500);
          }
        };
        
        // Add a significant delay to ensure the model is fully loaded before positioning
        setTimeout(positionModel, 1000);
      }
    }, [camera, scene, modelReady]);
    
    try {
      // Different loaders for different file types
      switch(extension) {
        case 'glb':
        case 'gltf': {
          // Use suspense for loading
          const gltf = useLoader(GLTFLoader, src, undefined, (error: any) => {
            console.error('Error loading GLB/GLTF:', error);
            setLoadError(error?.message || 'Failed to load GLB model');
          });
          if (!gltf.scene) throw new Error('No scene found in GLTF');
          return <primitive ref={modelRef} object={gltf.scene} dispose={null} position={[0, 0, 0]} />;
        }
        case 'obj': {
          const obj = useLoader(OBJLoader, src, undefined, (error: any) => {
            console.error('Error loading OBJ:', error);
            setLoadError(error?.message || 'Failed to load OBJ model');
          });
          return <primitive ref={modelRef} object={obj} dispose={null} position={[0, 0, 0]} />;
        }
        case 'stl': {
          const geometry = useLoader(STLLoader, src, undefined, (error: any) => {
            console.error('Error loading STL:', error);
            setLoadError(error?.message || 'Failed to load STL model');
          });
          // Create a separate mesh ref for STL
          const meshRef = useRef<Mesh>(null);
          // When the mesh is created, store it in modelRef for positioning
          useEffect(() => {
            if (meshRef.current) {
              modelRef.current = meshRef.current;
            }
          }, []);
          return (
            <mesh ref={meshRef} position={[0, 0, 0]}>
              <primitive object={geometry} attach="geometry" />
              <meshStandardMaterial color="#e6e6e6" roughness={0.5} metalness={0.4} />
            </mesh>
          );
        }
        case 'ply': {
          const geometry = useLoader(PLYLoader, src, undefined, (error: any) => {
            console.error('Error loading PLY:', error);
            setLoadError(error?.message || 'Failed to load PLY model');
          });
          // Create a separate mesh ref for PLY
          const meshRef = useRef<Mesh>(null);
          // When the mesh is created, store it in modelRef for positioning
          useEffect(() => {
            if (meshRef.current) {
              modelRef.current = meshRef.current;
            }
          }, []);
          return (
            <mesh ref={meshRef} position={[0, 0, 0]}>
              <primitive object={geometry} attach="geometry" />
              <meshStandardMaterial color="#e6e6e6" roughness={0.5} metalness={0.4} />
            </mesh>
          );
        }
        default:
          return <mesh />;
      }
    } catch (error) {
      console.error('Error loading model:', error);
      if (error instanceof Error) {
        setLoadError(error.message);
      } else {
        setLoadError('Unknown error loading model');
      }
      
      return (
        <Html center>
          <div className="text-red-500 bg-black/50 p-3 rounded-md flex flex-col gap-2">
            <p>Failed to load model</p>
            {retryCount < maxRetries && (
              <p className="text-sm text-amber-400">Retrying {retryCount + 1}/{maxRetries}...</p>
            )}
          </div>
        </Html>
      );
    }
  };
  
  // If we've hit max retries and still have an error, show a more prominent error
  if (loadError && retryCount >= maxRetries) {
    return (
      <Html center>
        <div className="bg-black/70 p-4 rounded-md max-w-xs">
          <h3 className="text-red-500 font-medium mb-2">Failed to load 3D model</h3>
          <p className="text-white text-sm mb-3">
            The model might be temporarily unavailable or in an unsupported format.
          </p>
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm"
            onClick={() => {
              setLoadError(null);
              setRetryCount(0);
            }}
          >
            Try Again
          </button>
        </div>
      </Html>
    );
  }
  
  return (
    <Suspense fallback={<Loader />}>
      {/* Add key based on retryCount to force re-mounting on retries */}
      <LoadedModel key={`model-${retryCount}-${src}`} />
    </Suspense>
  );
}

interface ModelViewerProps {
  src?: string;
  className?: string;
}

export default function ModelViewer({ src, className = '' }: ModelViewerProps) {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [renderKey, setRenderKey] = useState(0);
  
  // Helper to force reload the model through a simulated resize
  const forceReload = useCallback(() => {
    // Increment the render key to force a full re-render
    setRenderKey(prev => prev + 1);
    
    // Trigger a simulated resize event after a short delay
    // This can help with Three.js WebGL context issues
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
  }, []);
  
  // Public method to expose reload functionality
  // This can be called from parent components
  (ModelViewer as any).reloadModel = forceReload;
  
  // Enable touch events to improve mobile interaction
  useEffect(() => {
    if (containerRef) {
      // Make container focusable for better touch support
      containerRef.tabIndex = 0;
      
      // Ensure parent containers allow scrolling on mobile
      let parent = containerRef.parentElement;
      while (parent) {
        if (getComputedStyle(parent).overflow === 'hidden') {
          parent.style.overflow = 'auto';
        }
        parent = parent.parentElement;
      }
      
      // Force re-render when window is resized
      const handleResize = () => {
        setRenderKey(prev => prev + 1);
      };
      
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [containerRef]);
  
  // Add an effect to try reloading if src changes
  useEffect(() => {
    if (src) {
      // When src changes, force a reload after a short delay
      const timer = setTimeout(() => {
        forceReload();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [src, forceReload]);
  
  // If no source, return empty canvas
  if (!src) {
    return (
      <div 
        ref={setContainerRef} 
        className={`w-full h-full touch-auto ${className}`}
        style={{ touchAction: 'auto', overscrollBehavior: 'auto' }}
      >
        <Canvas 
          className="w-full h-full"
          camera={{ position: [0, 2, 5], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          shadows
        >
          <ambientLight intensity={0.5} />
          <OrbitControls autoRotate autoRotateSpeed={1} />
          <Grid 
            position={[0, 0, 0]}  
            sectionSize={1}
            cellSize={0.5}
            infiniteGrid
            cellColor="#4a4a4a"
            sectionColor="black"
          />
        </Canvas>
      </div>
    );
  }
  
  return (
    <div 
      ref={setContainerRef} 
      className={`w-full h-full touch-auto ${className}`}
      style={{ touchAction: 'auto', overscrollBehavior: 'auto' }}
    >
      <Canvas 
        key={`canvas-${renderKey}`}
        className="w-full h-full"
        camera={{ position: [0, 2, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        shadows
        dpr={[1, 2]} // Better performance on mobile
      >
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 10]} 
          intensity={1} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-10, 10, -10]} intensity={0.5} />
        <OrbitControls 
          enableZoom 
          enablePan 
          enableRotate 
          autoRotate={false}
          autoRotateSpeed={0.5}
          minDistance={1}
          maxDistance={20}
          makeDefault
          // Improve mobile handling
          enableDamping
          dampingFactor={0.1}
          rotateSpeed={0.8}
        />
        
        <ModelWrapper src={src} />
        
        <Environment preset="city" />

        <Grid 
          position={[0, 0, 0]}  
          sectionSize={1}
          cellSize={0.5}
          infiniteGrid
          fadeDistance={30}
          fadeStrength={1}
          cellColor="#4a4a4a"
          sectionColor="black"
        />
      </Canvas>
    </div>
  );
}
  