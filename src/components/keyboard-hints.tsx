export function KeyboardHints({ isConnected }: { isConnected: boolean }) {
  return (
    <div
      className="flex items-center justify-center gap-6 py-2 text-xs"
      style={{ color: 'var(--theme-sub)' }}
    >
      {isConnected ? (
        <>
          <div className="flex items-center gap-2">
            <Kbd>U4</Kbd>
            <span>- calibrate gyro</span>
          </div>
          <div className="flex items-center gap-2">
            <Kbd>F4</Kbd>
            <span>- sync cube</span>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <Kbd>shift</Kbd>
            <span>+</span>
            <Kbd>enter</Kbd>
          </span>
          <span>- connect cube</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1">
          <Kbd>ctrl</Kbd>
          <span>+</span>
          <Kbd>k</Kbd>
        </span>
        <span>or</span>
        <Kbd>esc</Kbd>
        <span>- command palette</span>
      </div>
    </div>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="rounded px-1.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: 'var(--theme-subAlt)',
        color: 'var(--theme-text)',
      }}
    >
      {children}
    </kbd>
  )
}
