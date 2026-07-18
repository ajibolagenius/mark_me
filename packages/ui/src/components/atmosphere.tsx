export function Atmosphere() {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="pointer-events-none fixed -left-[120px] -top-[120px] h-[280px] w-[280px] rounded-full bg-mm-primary opacity-[0.035] blur-[140px]" />
      <div className="pointer-events-none fixed -bottom-[100px] -right-[100px] h-[220px] w-[220px] rounded-full bg-mm-secondary opacity-[0.03] blur-[120px]" />
    </>
  );
}
