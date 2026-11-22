import React, { useState } from 'react';
import { Key, ShieldCheck, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin({
  loginStep,
  username,
  setUsername,
  password,
  setPassword,
  otpCode,
  setOtpCode,
  authError,
  handleLogin,
  setLoginStep,
  setAuthError,
  isDark,
  tokens
}) {
  const { inputBg, inputBorder, text, subText } = tokens;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ padding: '40px 24px', maxWidth: '380px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
      {loginStep === 'password' ? (
        <>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            background: isDark ? '#262626' : '#eeeeee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: text
          }}>
            <Key size={20} />
          </div>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
            Administrator Authentication
          </div>
          <div style={{ fontSize: '12px', color: subText, marginBottom: '22px', lineHeight: '1.4' }}>
            Sign in with your administrator credentials to manage portal settings.
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label
                htmlFor="admin-username"
                style={{ fontSize: '10px', color: subText, fontWeight: '600', letterSpacing: '0.4px' }}
              >
                USERNAME
              </label>
              <input
                id="admin-username"
                name="username"
                type="text"
                autoComplete="username"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="none"
                enterKeyHint="next"
                required
                autoFocus
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: `1px solid ${inputBorder}`,
                  background: inputBg,
                  color: text,
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label
                htmlFor="admin-password"
                style={{ fontSize: '10px', color: subText, fontWeight: '600', letterSpacing: '0.4px' }}
              >
                PASSWORD
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  enterKeyHint="done"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 40px 10px 14px',
                    borderRadius: '6px',
                    border: `1px solid ${inputBorder}`,
                    background: inputBg,
                    color: text,
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    background: 'none',
                    border: 'none',
                    color: subText,
                    cursor: 'pointer',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            {authError && (
              <div
                role="alert"
                style={{ color: '#f44336', fontSize: '11px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <AlertTriangle size={12} /> {authError}
              </div>
            )}
            <button
              type="submit"
              style={{
                marginTop: '4px',
                padding: '10px',
                background: isDark ? '#ffffff' : '#000000',
                color: isDark ? '#000000' : '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Sign In
            </button>
          </form>
        </>
      ) : (
        <>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            background: isDark ? '#1a3320' : '#e8f5e9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: '#4CAF50'
          }}>
            <ShieldCheck size={22} />
          </div>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
            Two-Factor Authentication
          </div>
          <div style={{ fontSize: '12px', color: subText, marginBottom: '20px', lineHeight: '1.4' }}>
            Enter the 6-digit code from your authenticator app (Google Authenticator, 1Password, Authy).
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <label
                htmlFor="admin-otp"
                style={{ fontSize: '10px', color: subText, fontWeight: '600', letterSpacing: '0.4px' }}
              >
                AUTHENTICATION CODE
              </label>
              <input
                id="admin-otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                enterKeyHint="done"
                pattern="[0-9]*"
                maxLength={6}
                required
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                autoFocus
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: `1px solid ${inputBorder}`,
                  background: inputBg,
                  color: text,
                  fontSize: '22px',
                  fontFamily: 'inherit',
                  letterSpacing: '8px',
                  textAlign: 'center',
                  outline: 'none',
                  fontWeight: '600'
                }}
              />
            </div>
            {authError && (
              <div
                role="alert"
                style={{ color: '#f44336', fontSize: '11px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <AlertTriangle size={12} /> {authError}
              </div>
            )}
            <button
              type="submit"
              disabled={otpCode.length !== 6}
              style={{
                padding: '10px',
                background: otpCode.length === 6 ? (isDark ? '#ffffff' : '#000000') : (isDark ? '#333' : '#ddd'),
                color: otpCode.length === 6 ? (isDark ? '#000000' : '#ffffff') : subText,
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: otpCode.length === 6 ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
              }}
            >
              Verify Code & Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginStep('password');
                setOtpCode('');
                setAuthError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: subText,
                fontSize: '11px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textDecoration: 'underline'
              }}
            >
              ← Back to Sign In
            </button>
          </form>
        </>
      )}
    </div>
  );
}
