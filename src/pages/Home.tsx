import { RubiksCubeViewer } from '@/components/rubiks-cube'

export default function HomePage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Cube Solve Saver</h1>
        <p className="text-muted-foreground">
          Connect your GAN 12 UI Freeplay and track your solves in real-time.
        </p>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-lg border bg-muted/30">
        <RubiksCubeViewer className="h-full w-full" />
        <div className="absolute bottom-4 left-4 rounded-md bg-background/80 px-3 py-1.5 text-sm backdrop-blur">
          Drag to rotate • Scroll to zoom
        </div>
      </div>
    </div>
  )
}
