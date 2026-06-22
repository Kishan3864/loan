export function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-canvas" />
      <div
        className="absolute inset-x-0 top-0 h-80"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(26,115,232,0.08), transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(60,64,67,0.05) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  );
}
