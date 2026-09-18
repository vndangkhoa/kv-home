import React from 'react';
import { Key, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function AdminLogin({
  loginStep,
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

  return (
    <div style={{ padding: '48px 24px', maxWidth: '380px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
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
          <div style={{ fontSize: '12px', color: subText, marginBottom: '24px', lineHeight: '1.4' }}>
            Enter password to access portal controls and settings.
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              style={{
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
            {authError && (
              <div style={{ color: '#f44336', fontSize: '11px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={12} /> {authError}
              </div>
            )}
            <button
              type="submit"
              style={{
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
              Log In
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
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              autoFocus
              style={{
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
            {authError && (
              <div style={{ color: '#f44336', fontSize: '11px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
              ← Back to Password
            </button>
          </form>
        </>
      )}
    </div>
  );
}
