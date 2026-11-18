import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login } = useApp();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await login(studentId.trim(), password);
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e5e5e5] flex justify-center items-center selection:bg-[#05354d]/20 selection:text-[#05354d]">
      {/* Mobile Frame Container matching Figma width 402px */}
      <div className="w-full max-w-[402px] min-h-[755px] bg-[#e5e5e5] flex flex-col justify-between py-12 px-4 shadow-2xl relative">
        {/* Brand Header */}
        <div className="flex flex-col items-center pt-8">
          <img src="/logo.png" alt="Skool" className="h-16 object-contain" />
        </div>

        {/* Form Container (Figma: Frame 36 - 370px wide, white card) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200/80 my-auto">
          {/* Greeting (Figma: Hello Parent 👋) */}
          <h2 className="text-[18px] font-semibold text-[#191c1b] mb-6 flex items-center gap-1.5">
            Hello Parent<span>👋</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student ID */}
            <div>
              <div className="relative">
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                  placeholder="Student ID"
                  className="w-full h-[42px] px-3.5 rounded-lg border border-neutral-300 bg-white text-[14px] text-[#191c1b] placeholder:text-[#72787d] focus:outline-none focus:border-[#05354d] focus:ring-1 focus:ring-[#05354d] transition-all"
                />
              </div>
            </div>

            {/* Password with Hide / Unhide Toggle */}
            <div>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  className="w-full h-[42px] pl-3.5 pr-11 rounded-lg border border-neutral-300 bg-white text-[14px] text-[#191c1b] placeholder:text-[#72787d] focus:outline-none focus:border-[#05354d] focus:ring-1 focus:ring-[#05354d] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#72787d] hover:text-[#05354d] transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-[18px] h-[18px]" />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="text-[13px] text-red-600 font-medium text-center py-1 bg-red-50 rounded-md border border-red-200">
                {errorMsg}
              </div>
            )}

            {/* Login Button (Figma: Frame 56 - centered pill button) */}
            <div className="pt-3 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="w-[140px] h-[42px] rounded-full bg-[#05354d] text-white text-[15px] font-semibold hover:bg-[#042a3a] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center shadow-md shadow-[#05354d]/20"
              >
                {loading ? 'Logging in…' : 'Login'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer info for initial testing */}
        <div className="text-center text-[12px] text-[#72787d]">
          Student ID: <span className="font-semibold text-[#05354d]">1234</span> &nbsp;|&nbsp; Password: <span className="font-semibold text-[#05354d]">dad</span> or <span className="font-semibold text-[#05354d]">mom</span>
        </div>
      </div>
    </div>
  );
};
