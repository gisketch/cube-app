import { useState } from 'react'
import { Copy, Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { type SceneConfig, DEFAULT_CONFIG, ENVIRONMENT_PRESETS } from '@/config/scene-config'

interface DebugConfigPanelProps {
  config: SceneConfig
  onChange: (config: SceneConfig) => void
  isOpen: boolean
  onToggle: () => void
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/60">{label}</span>
        <span className="font-mono text-xs text-white/80">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-blue-500"
      />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="border-b border-white/10 pb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 text-xs font-medium uppercase tracking-wider text-white/40"
      >
        {title}
        {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col gap-3 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function DebugConfigPanel({ config, onChange, isOpen, onToggle }: DebugConfigPanelProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const configJson = JSON.stringify(config, null, 2)
    await navigator.clipboard.writeText(configJson)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    onChange(DEFAULT_CONFIG)
  }

  const updateLight = (path: string, value: number) => {
    const newConfig = { ...config }
    const parts = path.split('.')
    let current: Record<string, unknown> = newConfig.light as unknown as Record<string, unknown>
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]] as Record<string, unknown>
    }
    current[parts[parts.length - 1]] = value
    onChange({ ...newConfig })
  }

  const updateMaterial = (path: string, value: number) => {
    const newConfig = { ...config }
    const parts = path.split('.')
    let current: Record<string, unknown> = newConfig.material as unknown as Record<string, unknown>
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]] as Record<string, unknown>
    }
    current[parts[parts.length - 1]] = value
    onChange({ ...newConfig })
  }

  const updateCamera = (key: keyof typeof config.camera, value: number) => {
    onChange({
      ...config,
      camera: { ...config.camera, [key]: value },
    })
  }

  const updateCube = (key: keyof typeof config.cube, value: number) => {
    onChange({
      ...config,
      cube: { ...config.cube, [key]: value },
    })
  }

  const updateEnvironment = (preset: (typeof ENVIRONMENT_PRESETS)[number]) => {
    onChange({
      ...config,
      environment: { preset },
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col border-l border-white/10 bg-black/90 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <h2 className="text-sm font-medium text-white">Debug Config</h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="rounded p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                title="Copy config"
              >
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </button>
              <button
                onClick={onToggle}
                className="rounded p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-4">
              <Section title="Lighting">
                <Slider
                  label="Ambient Intensity"
                  value={config.light.ambient.intensity}
                  min={0}
                  max={2}
                  step={0.05}
                  onChange={(v) => updateLight('ambient.intensity', v)}
                />
                <Slider
                  label="Main Light Intensity"
                  value={config.light.directional1.intensity}
                  min={0}
                  max={2}
                  step={0.05}
                  onChange={(v) => updateLight('directional1.intensity', v)}
                />
                <Slider
                  label="Fill Light Intensity"
                  value={config.light.directional2.intensity}
                  min={0}
                  max={2}
                  step={0.05}
                  onChange={(v) => updateLight('directional2.intensity', v)}
                />
              </Section>

              <Section title="Face Material">
                <Slider
                  label="Roughness"
                  value={config.material.face.roughness}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => updateMaterial('face.roughness', v)}
                />
                <Slider
                  label="Metalness"
                  value={config.material.face.metalness}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => updateMaterial('face.metalness', v)}
                />
                <Slider
                  label="Clearcoat"
                  value={config.material.face.clearcoat}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => updateMaterial('face.clearcoat', v)}
                />
                <Slider
                  label="Clearcoat Roughness"
                  value={config.material.face.clearcoatRoughness}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => updateMaterial('face.clearcoatRoughness', v)}
                />
                <Slider
                  label="Reflectivity"
                  value={config.material.face.reflectivity}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => updateMaterial('face.reflectivity', v)}
                />
              </Section>

              <Section title="Inner Material">
                <Slider
                  label="Roughness"
                  value={config.material.inner.roughness}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => updateMaterial('inner.roughness', v)}
                />
                <Slider
                  label="Metalness"
                  value={config.material.inner.metalness}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => updateMaterial('inner.metalness', v)}
                />
              </Section>

              <Section title="Camera">
                <Slider
                  label="FOV"
                  value={config.camera.fov}
                  min={20}
                  max={90}
                  step={1}
                  onChange={(v) => updateCamera('fov', v)}
                />
                <Slider
                  label="Min Distance"
                  value={config.camera.minDistance}
                  min={2}
                  max={10}
                  step={0.5}
                  onChange={(v) => updateCamera('minDistance', v)}
                />
                <Slider
                  label="Max Distance"
                  value={config.camera.maxDistance}
                  min={8}
                  max={30}
                  step={0.5}
                  onChange={(v) => updateCamera('maxDistance', v)}
                />
              </Section>

              <Section title="Cube">
                <Slider
                  label="Scale"
                  value={config.cube.scale}
                  min={0.5}
                  max={2}
                  step={0.05}
                  onChange={(v) => updateCube('scale', v)}
                />
                <Slider
                  label="Piece Size"
                  value={config.cube.cubeSize}
                  min={0.7}
                  max={1}
                  step={0.01}
                  onChange={(v) => updateCube('cubeSize', v)}
                />
                <Slider
                  label="Gap"
                  value={config.cube.gap}
                  min={0}
                  max={0.1}
                  step={0.005}
                  onChange={(v) => updateCube('gap', v)}
                />
              </Section>

              <Section title="Environment">
                <div className="grid grid-cols-2 gap-1">
                  {ENVIRONMENT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => updateEnvironment(preset)}
                      className={`rounded px-2 py-1 text-xs capitalize transition-colors ${
                        config.environment.preset === preset
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </Section>
            </div>
          </div>

          <div className="border-t border-white/10 p-4">
            <button
              onClick={handleReset}
              className="w-full rounded bg-white/10 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/20"
            >
              Reset to Default
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
