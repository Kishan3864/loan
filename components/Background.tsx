export function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-white">
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(10,10,10,0.035) 1px, transparent 0)",
          backgroundSize: "30px 30px",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-64"
        style={{
          background: "linear-gradient(180deg, rgba(47,91,255,0.035), transparent)",
        }}
      />
    </div>
  );
}
