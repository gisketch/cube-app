export interface LightConfig {
  ambient: {
    intensity: number
  }
  directional1: {
    position: [number, number, number]
    intensity: number
  }
  directional2: {
    position: [number, number, number]
    intensity: number
  }
}

export interface MaterialConfig {
  face: {
    roughness: number
    metalness: number
    clearcoat: number
    clearcoatRoughness: number
    reflectivity: number
  }
  inner: {
    roughness: number
    metalness: number
  }
}

export interface CameraConfig {
  position: [number, number, number]
  fov: number
  minDistance: number
  maxDistance: number
}

export interface CubeConfig {
  scale: number
  cubeSize: number
  gap: number
}

export interface EnvironmentConfig {
  preset: 'apartment' | 'city' | 'dawn' | 'forest' | 'lobby' | 'night' | 'park' | 'studio' | 'sunset' | 'warehouse'
}

export interface SceneConfig {
  light: LightConfig
  material: MaterialConfig
  camera: CameraConfig
  cube: CubeConfig
  environment: EnvironmentConfig
}

export const DEFAULT_CONFIG: SceneConfig = {
  light: {
    ambient: {
      intensity: 0,
    },
    directional1: {
      position: [10, 10, 5],
      intensity: 0.8,
    },
    directional2: {
      position: [-10, -10, -5],
      intensity: 0,
    },
  },
  material: {
    face: {
      roughness: 0.25,
      metalness: 0.28,
      clearcoat: 0.3,
      clearcoatRoughness: 0.1,
      reflectivity: 0.2,
    },
    inner: {
      roughness: 0.6,
      metalness: 0.4,
    },
  },
  camera: {
    position: [6, 4.5, 6],
    fov: 31,
    minDistance: 5.5,
    maxDistance: 12,
  },
  cube: {
    scale: 0.5,
    cubeSize: 0.95,
    gap: 0,
  },
  environment: {
    preset: 'sunset',
  },
}

export const ENVIRONMENT_PRESETS = [
  'apartment',
  'city',
  'dawn',
  'forest',
  'lobby',
  'night',
  'park',
  'studio',
  'sunset',
  'warehouse',
] as const
