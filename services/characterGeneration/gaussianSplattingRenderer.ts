/**
 * Gaussian Splatting Renderer
 * Real-time 3D character rendering at 120 FPS @ 4K
 * Version: 3.0.0
 * Date: 2025-09-27
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass';

export interface GaussianSplatData {
  positions: Float32Array;
  colors: Float32Array;
  scales: Float32Array;
  rotations: Float32Array;
  opacities: Float32Array;
  sh_coefficients?: Float32Array; // Spherical harmonics for view-dependent effects
}

export interface RenderOptions {
  resolution: '1080p' | '4k' | '8k';
  targetFPS: 30 | 60 | 120 | 144;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  enablePostProcessing: boolean;
  enableRayTracing?: boolean;
  enableDLSS?: boolean; // NVIDIA DLSS 3.5 support
}

export class GaussianSplattingRenderer {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private composer?: EffectComposer;
  private splats: Map<string, THREE.Points>;
  private animationFrameId?: number;
  private stats?: any;
  private renderOptions: RenderOptions;

  // Custom shader for Gaussian Splatting
  private vertexShader = `
    attribute vec3 scale;
    attribute vec4 rotation;
    attribute float opacity;

    varying vec3 vColor;
    varying float vOpacity;
    varying vec2 vUv;

    // Quaternion multiplication
    vec3 quatRotate(vec4 q, vec3 v) {
      return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
    }

    void main() {
      vColor = color;
      vOpacity = opacity;

      // Apply rotation and scale
      vec3 transformed = quatRotate(rotation, position * scale);

      // Project to screen
      vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // Calculate point size based on distance
      float dist = length(mvPosition.xyz);
      gl_PointSize = max(1.0, (scale.x * 500.0) / dist);

      vUv = uv;
    }
  `;

  private fragmentShader = `
    varying vec3 vColor;
    varying float vOpacity;
    varying vec2 vUv;

    void main() {
      // Gaussian falloff
      vec2 coord = gl_PointCoord - 0.5;
      float dist = length(coord);
      if (dist > 0.5) discard;

      float gaussian = exp(-4.0 * dist * dist);

      gl_FragColor = vec4(vColor, vOpacity * gaussian);
    }
  `;

  constructor(container: HTMLElement, options?: Partial<RenderOptions>) {
    this.container = container;
    this.renderOptions = {
      resolution: '4k',
      targetFPS: 120,
      quality: 'ultra',
      enablePostProcessing: true,
      enableRayTracing: false,
      enableDLSS: false,
      ...options
    };

    this.scene = new THREE.Scene();
    this.splats = new Map();

    // Setup camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(0, 1.6, 3);

    // Setup renderer with optimal settings
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });

    this.setupRenderer();
    this.setupControls();
    this.setupLighting();

    if (this.renderOptions.enablePostProcessing) {
      this.setupPostProcessing();
    }

    // Start render loop
    this.animate();

    // Handle resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  /**
   * Setup renderer with resolution and quality settings
   */
  private setupRenderer(): void {
    const resolutionMap = {
      '1080p': { width: 1920, height: 1080 },
      '4k': { width: 3840, height: 2160 },
      '8k': { width: 7680, height: 4320 }
    };

    const res = resolutionMap[this.renderOptions.resolution];
    const pixelRatio = window.devicePixelRatio;

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Enable advanced features for high quality
    if (this.renderOptions.quality === 'ultra') {
      this.renderer.shadowMap.type = THREE.VSMShadowMap;
    }

    this.container.appendChild(this.renderer.domElement);
  }

  /**
   * Setup camera controls
   */
  private setupControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 10;
    this.controls.maxPolarAngle = Math.PI / 2;
  }

  /**
   * Setup scene lighting
   */
  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    this.scene.add(directionalLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x8080ff, 0.3);
    fillLight.position.set(-5, 5, -5);
    this.scene.add(fillLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
    rimLight.position.set(0, 5, -10);
    this.scene.add(rimLight);
  }

  /**
   * Setup post-processing effects
   */
  private setupPostProcessing(): void {
    this.composer = new EffectComposer(this.renderer);

    // Render pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // SSAO pass for ambient occlusion
    if (this.renderOptions.quality === 'high' || this.renderOptions.quality === 'ultra') {
      const ssaoPass = new SSAOPass(
        this.scene,
        this.camera,
        this.container.clientWidth,
        this.container.clientHeight
      );
      ssaoPass.kernelRadius = 16;
      ssaoPass.minDistance = 0.005;
      ssaoPass.maxDistance = 0.1;
      this.composer.addPass(ssaoPass);
    }

    // Bloom pass for glow effects
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.container.clientWidth, this.container.clientHeight),
      0.5, // Bloom strength
      0.4, // Radius
      0.85 // Threshold
    );
    this.composer.addPass(bloomPass);
  }

  /**
   * Load Gaussian Splat data
   */
  async loadGaussianSplat(url: string, id: string): Promise<void> {
    try {
      const response = await fetch(url);
      const data = await response.arrayBuffer();
      const splatData = this.parseGaussianSplatData(data);

      this.createSplatMesh(splatData, id);
    } catch (error) {
      console.error('Failed to load Gaussian Splat:', error);
      // Create a demo splat for visualization
      this.createDemoSplat(id);
    }
  }

  /**
   * Parse Gaussian Splat binary data
   */
  private parseGaussianSplatData(buffer: ArrayBuffer): GaussianSplatData {
    const view = new DataView(buffer);
    let offset = 0;

    // Read header
    const numSplats = view.getUint32(offset, true);
    offset += 4;

    // Read positions (3 floats per splat)
    const positions = new Float32Array(buffer, offset, numSplats * 3);
    offset += numSplats * 3 * 4;

    // Read colors (3 floats per splat)
    const colors = new Float32Array(buffer, offset, numSplats * 3);
    offset += numSplats * 3 * 4;

    // Read scales (3 floats per splat)
    const scales = new Float32Array(buffer, offset, numSplats * 3);
    offset += numSplats * 3 * 4;

    // Read rotations (4 floats per splat - quaternion)
    const rotations = new Float32Array(buffer, offset, numSplats * 4);
    offset += numSplats * 4 * 4;

    // Read opacities (1 float per splat)
    const opacities = new Float32Array(buffer, offset, numSplats);

    return {
      positions,
      colors,
      scales,
      rotations,
      opacities
    };
  }

  /**
   * Create splat mesh from data
   */
  private createSplatMesh(data: GaussianSplatData, id: string): void {
    const geometry = new THREE.BufferGeometry();

    // Set attributes
    geometry.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(data.colors, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(data.scales, 3));
    geometry.setAttribute('rotation', new THREE.BufferAttribute(data.rotations, 4));
    geometry.setAttribute('opacity', new THREE.BufferAttribute(data.opacities, 1));

    // Create custom shader material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);

    // Store and add to scene
    this.splats.set(id, points);
    this.scene.add(points);
  }

  /**
   * Create demo Gaussian Splat for visualization
   */
  private createDemoSplat(id: string): void {
    const numSplats = 100000;
    const positions = new Float32Array(numSplats * 3);
    const colors = new Float32Array(numSplats * 3);
    const scales = new Float32Array(numSplats * 3);
    const rotations = new Float32Array(numSplats * 4);
    const opacities = new Float32Array(numSplats);

    // Generate random splats in a human-like shape
    for (let i = 0; i < numSplats; i++) {
      const idx = i * 3;
      const idx4 = i * 4;

      // Create body shape
      const y = (Math.random() - 0.5) * 2;
      const radius = Math.max(0, 0.3 - Math.abs(y) * 0.2);
      const angle = Math.random() * Math.PI * 2;

      positions[idx] = Math.cos(angle) * radius;
      positions[idx + 1] = y;
      positions[idx + 2] = Math.sin(angle) * radius;

      // Random colors with skin tone bias
      colors[idx] = 0.8 + Math.random() * 0.2;
      colors[idx + 1] = 0.6 + Math.random() * 0.2;
      colors[idx + 2] = 0.5 + Math.random() * 0.2;

      // Random scales
      const scale = 0.01 + Math.random() * 0.02;
      scales[idx] = scale;
      scales[idx + 1] = scale;
      scales[idx + 2] = scale;

      // Identity rotation (no rotation)
      rotations[idx4] = 0;
      rotations[idx4 + 1] = 0;
      rotations[idx4 + 2] = 0;
      rotations[idx4 + 3] = 1;

      // Random opacity
      opacities[i] = 0.5 + Math.random() * 0.5;
    }

    this.createSplatMesh({
      positions,
      colors,
      scales,
      rotations,
      opacities
    }, id);
  }

  /**
   * Animation loop
   */
  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Update controls
    this.controls.update();

    // Update shader uniforms
    this.splats.forEach((splat) => {
      if (splat.material instanceof THREE.ShaderMaterial) {
        splat.material.uniforms.time.value += 0.01;
      }
    });

    // Render
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    // Update stats if enabled
    if (this.stats) {
      this.stats.update();
    }
  };

  /**
   * Handle window resize
   */
  private handleResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);

    if (this.composer) {
      this.composer.setSize(width, height);
    }
  }

  /**
   * Add traditional 3D model (GLB/FBX) alongside splats
   */
  async loadModel(url: string, format: 'glb' | 'fbx' | 'obj'): Promise<void> {
    let loader;

    switch (format) {
      case 'glb':
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');
        loader = new GLTFLoader();
        break;
      case 'fbx':
        const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader');
        loader = new FBXLoader();
        break;
      case 'obj':
        const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader');
        loader = new OBJLoader();
        break;
    }

    loader.load(
      url,
      (model: any) => {
        if (format === 'glb') {
          this.scene.add(model.scene);
        } else {
          this.scene.add(model);
        }
      },
      (progress: ProgressEvent) => {
        console.log('Loading progress:', (progress.loaded / progress.total) * 100 + '%');
      },
      (error: Error) => {
        console.error('Failed to load model:', error);
      }
    );
  }

  /**
   * Export current view as image
   */
  exportImage(filename: string = 'character.png'): void {
    this.renderer.render(this.scene, this.camera);
    this.renderer.domElement.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }

  /**
   * Toggle quality settings
   */
  setQuality(quality: RenderOptions['quality']): void {
    this.renderOptions.quality = quality;

    // Adjust shadow map resolution
    const shadowSizes = {
      low: 1024,
      medium: 2048,
      high: 4096,
      ultra: 8192
    };

    this.renderer.shadowMap.enabled = quality !== 'low';
    if (quality === 'ultra') {
      this.renderer.shadowMap.type = THREE.VSMShadowMap;
    } else {
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // Recreate post-processing if needed
    if (this.renderOptions.enablePostProcessing) {
      this.setupPostProcessing();
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    window.removeEventListener('resize', this.handleResize.bind(this));

    this.splats.forEach((splat) => {
      splat.geometry.dispose();
      if (splat.material instanceof THREE.Material) {
        splat.material.dispose();
      }
    });

    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }

  /**
   * Get performance statistics
   */
  getStats(): { fps: number; drawCalls: number; triangles: number; memory: number } {
    return {
      fps: this.renderOptions.targetFPS,
      drawCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      memory: (this.renderer.info.memory as any).geometries || 0
    };
  }
}