interface LogoProps {
  size?: number;
}

export function Logo({ size = 28 }: LogoProps) {
  return (
    <div className="flex cursor-pointer items-center gap-2.5">
      <div
        className="flex items-center justify-center bg-gradient-to-br from-mm-primary to-mm-secondary"
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.55 }} className="brightness-200">
          🔖
        </span>
      </div>
      <span
        className="font-sans font-extrabold tracking-tight"
        style={{ fontSize: size * 0.6 }}
      >
        mark<span className="text-mm-primary">_</span>me
      </span>
    </div>
  );
}
