import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('⚠️ App ErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] bg-[#F5F3FA] flex items-center justify-center p-4 font-prompt">
          <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-3xl border border-black/10 p-8 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#FF4757]/10 text-[#FF4757] flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="font-extrabold text-xl sm:text-2xl text-[#1A1525] font-kanit">
                เกิดข้อผิดพลาดในการแสดงผล
              </h2>
              <p className="text-xs sm:text-sm text-[#5C526E] leading-relaxed">
                ขออภัยในความไม่สะดวก ระบบพบปัญหาชั่วคราวขณะโหลดข้อมูล โปรดลองโหลดหน้านี้ใหม่อีกครั้ง
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-black/5 text-[#8E85A2] text-xs font-mono break-all text-left max-h-24 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full btn-glass-violet min-h-[50px] px-6 py-3 text-sm font-black flex items-center justify-center gap-2 cursor-pointer font-kanit shadow-md rounded-2xl active:scale-98 transition-all"
            >
              <RefreshCw size={18} />
              <span>รีโหลดหน้าเว็บใหม่</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
