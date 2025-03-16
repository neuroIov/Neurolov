# Particle Effect Component

A reusable React component that creates an interactive 3D particle effect from a GLTF model. When users hover over the model, particles disperse in an animated pattern.

## Installation

1. Make sure you have the following dependencies installed:
```bash
npm install three @react-three/fiber @react-three/drei
```

## Usage

1. Import the component:
```jsx
import ParticleEffect from './particle-effect/ParticleEffect';
```

2. Use it in your React component:
```jsx
function App() {
  return (
    <ParticleEffect
      modelPath="/path/to/your/model.glb"
      width={600}
      height={600}
      particleCount={25000}
      particleSize={0.02}
      particleColor={0x007bff}
      disperseSpeed={0.15}
      disperseDistance={2}
    />
  );
}
```

## Props

- `modelPath` (required): Path to your GLTF model file
- `width` (optional): Width of the container (default: 600)
- `height` (optional): Height of the container (default: 600)
- `particleCount` (optional): Maximum number of particles (default: 25000)
- `particleSize` (optional): Size of each particle (default: 0.02)
- `particleColor` (optional): Color of particles in hex format (default: 0x007bff)
- `disperseSpeed` (optional): Speed of particle dispersion (default: 0.15)
- `disperseDistance` (optional): Maximum distance particles can disperse (default: 2)

## Features

- Interactive 3D particle effect
- Mouse hover interaction
- Customizable particle properties
- Responsive design
- Optimized performance with WebGL
- Automatic cleanup of resources

## Notes

- Make sure your GLTF model is properly optimized for web use
- The component automatically handles window resizing
- Uses Three.js for 3D rendering
- Implements proper cleanup to prevent memory leaks
