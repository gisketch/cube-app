export function GradientOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute -right-32 top-1/4 h-80 w-80 rounded-full opacity-25 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #f97316 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute -bottom-48 left-1/4 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute -right-24 bottom-1/4 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #f97316 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
        }}
      />
    </div>
  )
}
