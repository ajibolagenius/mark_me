import { T } from "@markme/ui";

export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        margin: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        background: T.bg,
        color: T.text,
        fontFamily: T.font,
        textAlign: "center",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          marginBottom: 24,
          background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})`,
          boxShadow: "4px 4px 0 rgba(0,0,0,0.45)",
        }}
        aria-hidden
      />
      <h1
        style={{
          margin: "0 0 12px",
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "-0.03em",
        }}
      >
        mark_me
      </h1>
      <p
        style={{
          margin: "0 0 28px",
          maxWidth: 360,
          fontSize: 15,
          fontWeight: 500,
          lineHeight: 1.5,
          color: T.textSec,
        }}
      >
        You&apos;re offline. Open the app again when you have a connection — your last synced
        bookmarks will still be available there.
      </p>
      <a
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px 20px",
          background: T.primary,
          color: T.onPrimary,
          fontWeight: 800,
          fontSize: 14,
          textDecoration: "none",
          boxShadow: "3px 3px 0 rgba(0,0,0,0.4)",
        }}
      >
        Try again
      </a>
    </main>
  );
}
