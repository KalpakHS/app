import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/common/Toast';

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, registerUser, allRoles } = useAuth();

  const [currentMode, setCurrentMode] = useState('signin'); // 'signin' | 'signup'
  const [selectedRole, setSelectedRole] = useState(allRoles[0]); // Patient default
  const [fullName, setFullName] = useState('Alex Mercer');
  const [email, setEmail] = useState('alex.mercer@patient.smartneb.io');
  const [password, setPassword] = useState('SmartNeb123!');
  const [confirmPassword, setConfirmPassword] = useState('SmartNeb123!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'signup') {
      setCurrentMode('signup');
    } else if (tabParam === 'signin') {
      setCurrentMode('signin');
    }
  }, [searchParams]);

  const handleRoleSelect = (roleObj) => {
    setSelectedRole(roleObj);
    setEmail(roleObj.email);
    if (roleObj.role === 'patient') setFullName('Alex Mercer');
    else if (roleObj.role === 'doctor') setFullName('Dr. Evelyn Vance');
    else if (roleObj.role === 'caregiver') setFullName('Elena Rostova');
    else if (roleObj.role === 'admin') setFullName('Fleet Administrator');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (currentMode === 'signup' && password !== confirmPassword) {
      setToast('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);

    if (currentMode === 'signup') {
      const res = await registerUser({
        full_name: fullName,
        email,
        password,
        confirm_password: confirmPassword,
        role: selectedRole.role,
        phone: '+1 (555) 000-0000',
      });
      setIsLoading(false);
      if (res.success) {
        setToast(`Account created! Launching ${selectedRole.label} console...`);
        setTimeout(() => {
          navigate(selectedRole.homeRoute);
        }, 700);
      } else {
        const err = res.error?.data;
        const msg = (err && typeof err === 'object')
          ? Object.values(err).flat().join(' ')
          : 'Registration failed.';
        setToast(msg);
      }
      return;
    }

    // Sign in
    const res = await login(selectedRole.role, email, password);
    setIsLoading(false);
    if (res.success) {
      setToast(`Welcome back, ${res.user?.name || fullName}! Launching ${selectedRole.label} console...`);
      setTimeout(() => {
        navigate(selectedRole.homeRoute);
      }, 700);
    } else {
      const err = res.error?.data;
      const msg = err?.detail || (err && typeof err === 'object' ? Object.values(err).flat().join(' ') : 'Invalid credentials.');
      setToast(msg);
    }
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login(selectedRole.role, email);
      setToast('Google OAuth simulated handshake verified.');
      setTimeout(() => {
        navigate(selectedRole.homeRoute);
      }, 700);
    }, 900);
  };

  const triggerForgot = (e) => {
    e.preventDefault();
    setToast(email ? `Password reset link sent to ${email}` : 'Please enter your email address first.');
  };

  return (
    <div className="bg-background font-body-md text-on-surface flex flex-col min-h-screen">
      <Toast message={toast} onClose={() => setToast(null)} />

      {/* Top App Bar */}
      <header className="fixed top-0 inset-x-0 z-40 bg-[#F8FAFC]/90 backdrop-blur-xl border-b border-outline-variant/60 pt-safe">
        <div className="h-16 px-4 flex items-center justify-between max-w-md mx-auto w-full">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 flex items-center justify-center text-on-surface rounded-full hover:bg-slate-100 transition-colors -ml-1.5"
              aria-label="Back to home"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
            </button>
            <span className="font-headline-md text-lg font-semibold text-on-surface">SmartNeb Auth</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-teal-50 text-primary border border-teal-200/80 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              person
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col relative w-full px-5 pt-20 pb-8 bg-background max-w-md mx-auto flex-grow justify-between">
        <div className="flex flex-col w-full">
          
          {/* Brand Header / Logo Section */}
          <div className="flex flex-col items-center justify-center pt-2 pb-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center shadow-sm relative mb-3">
              <div className="absolute inset-0 bg-primary/10 rounded-2xl animate-pulse"></div>
              <span className="material-symbols-outlined text-[36px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                pulmonology
              </span>
            </div>
            <h1 className="font-headline-md text-2xl font-bold text-on-surface mb-1">SmartNeb</h1>
            <p className="font-body-md text-xs text-on-surface-variant font-medium">IoT Respiratory Telemetry &amp; Therapy</p>
          </div>

          {/* Role Switcher Demo Pills */}
          <div className="mb-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1 flex items-center justify-between">
              <span>Select Role Profile</span>
              <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                Auto Route Active
              </span>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 overflow-x-auto no-scrollbar">
              {allRoles.map((r) => {
                const isSelected = selectedRole.role === r.role;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleRoleSelect(r)}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs transition-all text-center whitespace-nowrap ${
                      isSelected
                        ? 'font-semibold bg-white text-primary shadow-sm border border-slate-200/50'
                        : 'font-medium text-on-surface-variant hover:text-on-surface hover:bg-white/60'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Auth Card */}
          <div className="bg-surface border border-outline-variant rounded-2xl p-5 shadow-sm mb-6">
            
            {/* Segmented Control Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6 relative border border-slate-200">
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg transition-transform duration-300 ease-out shadow-sm border border-slate-200/60 ${
                  currentMode === 'signin' ? 'translate-x-0' : 'translate-x-[calc(100%+8px)]'
                }`}
              ></div>
              <button
                type="button"
                onClick={() => setCurrentMode('signin')}
                className={`relative z-10 py-2.5 text-center font-label-lg transition-colors duration-200 ${
                  currentMode === 'signin' ? 'font-semibold text-on-surface' : 'font-medium text-on-surface-variant'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setCurrentMode('signup')}
                className={`relative z-10 py-2.5 text-center font-label-lg transition-colors duration-200 ${
                  currentMode === 'signup' ? 'font-semibold text-on-surface' : 'font-medium text-on-surface-variant'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Auth Form */}
            <form className="flex flex-col gap-4" onSubmit={handleAuth}>
              
              {/* Full Name (Sign Up only) */}
              {currentMode === 'signup' && (
                <div className="flex flex-col gap-1.5 animate-fade-in">
                  <label className="font-label-sm text-xs font-semibold text-on-surface">Full Name</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 material-symbols-outlined text-slate-400 text-[20px]">badge</span>
                    <input
                      className="w-full bg-white h-12 py-3 pl-11 pr-4 rounded-xl text-on-surface placeholder:text-slate-400 border border-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-body-md transition-all shadow-sm"
                      type="text"
                      placeholder="Alex Mercer"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-xs font-semibold text-on-surface">Email Address</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 material-symbols-outlined text-slate-400 text-[20px]">mail</span>
                  <input
                    className="w-full bg-white h-12 py-3 pl-11 pr-4 rounded-xl text-on-surface placeholder:text-slate-400 border border-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-body-md transition-all shadow-sm"
                    type="email"
                    required
                    placeholder="alex.mercer@telemetry.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-label-sm text-xs font-semibold text-on-surface">Password</label>
                  {currentMode === 'signin' && (
                    <button
                      type="button"
                      onClick={triggerForgot}
                      className="font-label-sm text-xs text-primary hover:text-primary-hover font-medium hover:underline"
                    >
                      Forgot your password?
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 material-symbols-outlined text-slate-400 text-[20px]">lock</span>
                  <input
                    className="w-full bg-white h-12 py-3 pl-11 pr-12 rounded-xl text-on-surface placeholder:text-slate-400 border border-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-body-md transition-all shadow-sm"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-on-surface p-1"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up only) */}
              {currentMode === 'signup' && (
                <div className="flex flex-col gap-1.5 animate-fade-in">
                  <label className="font-label-sm text-xs font-semibold text-on-surface">Confirm Password</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 material-symbols-outlined text-slate-400 text-[20px]">lock_reset</span>
                    <input
                      className="w-full bg-white h-12 py-3 pl-11 pr-4 rounded-xl text-on-surface placeholder:text-slate-400 border border-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-body-md transition-all shadow-sm"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Dynamic Sign Up Notice */}
              {currentMode === 'signup' && (
                <div className="bg-teal-50/80 p-3.5 rounded-xl border border-teal-100 flex items-start gap-3 mt-1 animate-fade-in">
                  <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                    New accounts are automatically provisioned with a <span className="text-primary font-semibold">SmartNeb-X1 Demo Device</span>, standard reactive care plan, and assigned virtual care team.
                  </p>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full h-12 py-3.5 bg-primary hover:bg-primary-hover text-on-primary font-label-lg font-semibold rounded-xl shadow-sm hover:shadow transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">
                      {currentMode === 'signin' ? 'login' : 'rocket_launch'}
                    </span>
                    <span>
                      {currentMode === 'signin' ? `Sign In as ${selectedRole.label}` : 'Create Account & Provision Device'}
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-grow h-[1px] bg-slate-200"></div>
              <span className="px-3 font-label-sm text-xs text-on-surface-variant font-medium">or continue with</span>
              <div className="flex-grow h-[1px] bg-slate-200"></div>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full h-12 py-3 bg-white hover:bg-slate-50 text-on-surface font-label-lg font-medium rounded-xl transition-all flex items-center justify-center gap-3 border border-outline shadow-sm active:scale-[0.98]"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" fill="#4285F4"></path>
                <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.2v3.15C3.18 21.32 7.23 24 12 24z" fill="#34A853"></path>
                <path d="M5.27 14.24c-.25-.72-.39-1.5-.39-2.24s.14-1.52.39-2.24V6.6H1.2C.43 8.15 0 9.89 0 12s.43 3.85 1.2 5.4l4.07-3.16z" fill="#FBBC05"></path>
                <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.18 2.68 1.2 6.6l4.07 3.15c.95-2.85 3.6-4.96 6.73-4.96z" fill="#EA4335"></path>
              </svg>
              <span className="text-sm font-medium">Continue with Google</span>
            </button>
          </div>

        </div>

        {/* Trust & Security Footer Badge */}
        <div className="flex items-center justify-center gap-2 text-on-surface-variant pt-2 pb-safe text-center">
          <span className="material-symbols-outlined text-[16px] text-teal-600">lock_person</span>
          <span className="font-body-md text-xs font-medium">HIPAA Compliant &amp; End-to-End Encrypted Telemetry</span>
        </div>
      </main>
    </div>
  );
}
