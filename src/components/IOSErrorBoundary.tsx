import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRestarting: boolean;
  logOpen: boolean;
  checkedTips: boolean[];
}

const IOS_TIPS = [
  "Clear Safari cache and cookies",
  "Try Chrome instead of Safari",
  "Make sure JavaScript is enabled",
  "Check that iOS is up to date",
];

class IOSErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    isRestarting: false,
    logOpen: false,
    checkedTips: IOS_TIPS.map(() => false),
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("iOS Error Boundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private isIOSDevice = (): boolean => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  };

  private reloadPage = (): void => {
    this.setState({ isRestarting: true });
    window.setTimeout(() => {
      window.location.reload();
    }, 650);
  };

  private toggleTip = (index: number): void => {
    this.setState((prev) => {
      const next = [...prev.checkedTips];
      next[index] = !next[index];
      return { checkedTips: next };
    });
  };

  private toggleLog = (): void => {
    this.setState((prev) => ({ logOpen: !prev.logOpen }));
  };

  public render() {
    if (this.state.hasError) {
      const onIOS = this.isIOSDevice();
      const { isRestarting, logOpen, checkedTips } = this.state;

      return (
        <div className='min-h-screen flex items-center justify-center bg-[#f3f1ec] py-12 px-4 sm:px-6 lg:px-8'>
          <style>{`
            @keyframes pulseDot {
              0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(214,83,74,.45); }
              50% { opacity: .55; box-shadow: 0 0 0 7px rgba(214,83,74,0); }
            }
            @media (prefers-reduced-motion: reduce) {
              .animate-\\[pulseDot_2\\.2s_ease-in-out_infinite\\] { animation: none !important; opacity: 1 !important; }
            }
          `}</style>
          <div className='w-full max-w-[440px] rounded-2xl bg-[#20262b] px-7 pb-7 pt-8 text-[#f3f1ec] shadow-[0_24px_48px_-18px_rgba(0,0,0,0.45)] [box-shadow:0_24px_48px_-18px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] sm:px-8'>
            <div className='mb-6 flex items-center gap-[9px]'>
              <span
                className={`h-[9px] w-[9px] rounded-full ${
                  isRestarting ? "bg-[#4caf7d]" : "bg-[#d6534a]"
                } ${isRestarting ? "" : "animate-[pulseDot_2.2s_ease-in-out_infinite]"}`}
              />
              <span className='font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#9aa3ab]'>
                {isRestarting ? "Restarting" : "System fault"}
              </span>
            </div>

            <h2 className='mb-[0.6rem] font-sans text-[clamp(1.35rem,5vw,1.6rem)] font-semibold leading-tight text-[#f3f1ec]'>
              This screen lost power.
            </h2>
            <p className='mb-7 max-w-[38ch] text-[0.92rem] leading-[1.55] text-[#9aa3ab]'>
              {onIOS
                ? "We detected an iOS compatibility issue. Flip the switch to restart, or work through the checklist below."
                : "An unexpected error occurred. Flip the switch to bring it back online."}
            </p>

            <button
              type='button'
              role='switch'
              aria-checked={isRestarting}
              aria-label='Restart app'
              disabled={isRestarting}
              onClick={this.reloadPage}
              className='mb-7 flex w-full items-center gap-4 rounded-xl border-none bg-transparent px-2 py-[0.6rem] text-left transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#e2a13c] disabled:cursor-default'>
              <span className='relative h-16 w-[34px] flex-none rounded-[17px] bg-[#171b1f] [box-shadow:inset_0_2px_5px_rgba(0,0,0,0.6)]'>
                <span className='pointer-events-none absolute inset-x-0 top-[6px] text-center font-mono text-[8px] text-[#9aa3ab] opacity-45'>
                  I
                </span>
                <span className='pointer-events-none absolute inset-x-0 bottom-[6px] text-center font-mono text-[8px] text-[#9aa3ab] opacity-45'>
                  O
                </span>
                <span
                  className={`absolute left-[3px] bottom-[3px] z-[2] h-7 w-7 rounded-[9px] transition-transform duration-[400ms] [transition-timing-function:cubic-bezier(.34,1.56,.64,1)] ${
                    isRestarting
                      ? "-translate-y-[33px] bg-[#e2a13c] shadow-[0_0_14px_rgba(226,161,60,0.55)]"
                      : "bg-[#9aa3ab]"
                  }`}
                />
              </span>
              <span>
                <p className='m-0 mb-[2px] text-[0.95rem] font-medium text-[#f3f1ec]'>
                  {isRestarting ? "Restarting…" : "Restart app"}
                </p>
                <p className='m-0 text-[0.78rem] text-[#9aa3ab]'>
                  Reloads this page
                </p>
              </span>
            </button>

            {onIOS && (
              <div className='mb-6'>
                <p className='mb-[0.7rem] font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[#9aa3ab]'>
                  iOS Safari checklist
                </p>
                {IOS_TIPS.map((tip, i) => {
                  const checked = checkedTips[i];
                  return (
                    <button
                      key={tip}
                      type='button'
                      aria-pressed={checked}
                      onClick={() => this.toggleTip(i)}
                      className='flex w-full items-start gap-[11px] border-none bg-transparent py-[0.4rem] text-left'>
                      <span
                        className={`mt-[1px] flex h-[17px] w-[17px] flex-none items-center justify-center rounded border-[1.5px] transition-colors ${
                          checked
                            ? "border-[#e2a13c] bg-[#e2a13c]"
                            : "border-[#9aa3ab] bg-transparent"
                        }`}>
                        {checked && (
                          <svg
                            viewBox='0 0 16 16'
                            fill='none'
                            className='h-[10px] w-[10px]'>
                            <path
                              d='M3 8l3.5 3.5L13 4.5'
                              stroke='#171b1f'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            />
                          </svg>
                        )}
                      </span>
                      <span
                        className={`text-[0.86rem] leading-[1.4] text-[#f3f1ec] transition-opacity ${
                          checked ? "opacity-50" : "opacity-100"
                        }`}>
                        {tip}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {this.state.error && (
              <div>
                <button
                  type='button'
                  aria-expanded={logOpen}
                  onClick={this.toggleLog}
                  className='flex items-center gap-[7px] border-none bg-transparent p-0 py-[0.3rem] font-mono text-[0.78rem] text-[#9aa3ab]'>
                  <svg
                    viewBox='0 0 8 8'
                    fill='none'
                    className={`h-[11px] w-[11px] transition-transform duration-200 ${
                      logOpen ? "rotate-90" : ""
                    }`}>
                    <path
                      d='M1 1l6 3-6 3'
                      stroke='currentColor'
                      strokeWidth='1.4'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                  Technical log
                </button>
                <div
                  className={`overflow-hidden transition-[max-height] duration-300 ${
                    logOpen ? "max-h-[140px]" : "max-h-0"
                  }`}>
                  <pre className='mt-[0.6rem] max-h-[120px] overflow-auto whitespace-pre-wrap rounded-lg bg-[#171b1f] p-3 font-mono text-[11.5px] leading-[1.6] text-[#9aa3ab]'>
                    <span className='text-[#d6534a]'>
                      {this.state.error.toString()}
                    </span>
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default IOSErrorBoundary;
