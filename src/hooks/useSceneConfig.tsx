import { createContext, useContext } from 'react'
import { type SceneConfig, DEFAULT_CONFIG } from '@/config/scene-config'

const SceneConfigContext = createContext<SceneConfig>(DEFAULT_CONFIG)

export function SceneConfigProvider({
  config,
  children,
}: {
  config: SceneConfig
  children: React.ReactNode
}) {
  return <SceneConfigContext.Provider value={config}>{children}</SceneConfigContext.Provider>
}

export function useSceneConfig() {
  return useContext(SceneConfigContext)
}
