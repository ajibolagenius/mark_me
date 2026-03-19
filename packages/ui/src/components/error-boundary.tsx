"use client";

import React, { type ReactNode, type ErrorInfo } from "react";
import { ShieldAlert } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", err, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="m-4 border border-mm-error/20 bg-mm-bg-el p-6 font-sans">
          <div className="-mx-6 -mt-6 mb-4 h-[3px] bg-mm-error" />
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-mm-error/20 bg-mm-error/10 text-mm-error">
              <ShieldAlert size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="mb-1.5 font-sans text-sm font-extrabold tracking-tight text-mm-text">
                {this.props.fallbackTitle || "Something went wrong"}
              </h3>
              <p className="mb-3 text-xs leading-relaxed text-mm-text-muted">
                {this.props.fallbackMessage || "This section encountered an error. Your data is safe."}
              </p>
              <div className="mb-3 max-h-[60px] overflow-auto whitespace-pre-wrap break-all border border-mm-error/15 bg-mm-error/5 p-2 font-mono text-[11px] text-mm-error">
                {this.state.error?.message || "Unknown error"}
              </div>
              <button
                type="button"
                onClick={() => this.setState({ error: null })}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 border-none bg-mm-error px-4 py-[7px] font-sans text-xs font-bold text-white shadow-[2px_2px_0_rgba(0,0,0,0.3)] transition-all hover:-translate-y-px hover:shadow-[4px_4px_0_rgba(0,0,0,0.4)]"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
