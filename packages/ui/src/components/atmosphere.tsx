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
      <div className="pointer-events-none fixed -left-[100px] -top-[100px] h-[300px] w-[300px] rounded-full bg-mm-primary opacity-[0.06] blur-[120px]" />
      <div className="pointer-events-none fixed -bottom-[80px] -right-[80px] h-[250px] w-[250px] rounded-full bg-mm-secondary opacity-[0.05] blur-[100px]" />
    </>
  );
}
