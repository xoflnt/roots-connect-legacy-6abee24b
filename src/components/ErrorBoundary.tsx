import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen flex items-center justify-center p-6"
          style={{ background: "hsl(38 30% 96%)", fontFamily: "Tajawal, sans-serif" }}
        >
          <div className="text-center max-w-md space-y-4">
            <div className="text-5xl">⚠️</div>
            <h1 className="text-xl font-bold" style={{ color: "hsl(152 42% 13%)" }}>
              حدث خطأ غير متوقع
            </h1>
            <p className="text-sm" style={{ color: "hsl(152 15% 40%)" }}>
              نعتذر عن هذا الخطأ. يرجى إعادة تحميل الصفحة.
            </p>
            <button
              onClick={this.handleReload}
              className="px-6 py-3 rounded-xl text-sm font-bold"
              style={{
                background: "hsl(152 42% 18%)",
                color: "hsl(38 28% 97%)",
                minHeight: 44,
                minWidth: 44,
              }}
            >
              إعادة تحميل
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
