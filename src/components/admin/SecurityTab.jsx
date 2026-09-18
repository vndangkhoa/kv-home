import React, { useState } from 'react';
import QRCode from 'qrcode';
import { safeSessionStorage } from '../../utils/safeStorage';
import {
  Shield,
  ShieldCheck,
  Check,
  QrCode,
  Copy,
  Key
} from 'lucide-react';

export default function SecurityTab({
  token,
  twoFactorEnabled,
  setTwoFactorEnabled,
  onLogout,
  isDark,
  tokens,
  isSplitView = false,
}) {
  const { border, text, subText, cardBg, cardBorder, inputBg, inputBorder } = tokens;

  // Password change state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMessage, setPwMessage] = useState({ text: '', isError: false });

  // 2FA Management State
  const [twoFactorSetupData, setTwoFactorSetupData] = useState(null);
  const [verifyOtpInput, setVerifyOtpInput] = useState('');
  const [twoFactorMsg, setTwoFactorMsg] = useState({ text: '', isError: false });
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showDisable2FAConfirm, setShowDisable2FAConfirm] = useState(false);
  const [disable2FAPassword, setDisable2FAPassword] = useState('');

  const handleCopySecret = (textToCopy) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 3000);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMessage({ text: '', isError: false });

    if (!newPw || newPw.length < 4) {
      setPwMessage({ text: 'New password must be at least 4 characters', isError: true });
      return;
    }

    const authToken = safeSessionStorage.getItem('kv_admin_token') || token;
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken || ''}`,
        },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        if (data.error && data.error.includes('Current password')) {
          setPwMessage({ text: data.error, isError: true });
        } else {
          onLogout();
          alert('Session expired. Please log in again.');
        }
        return;
      }

      if (res.ok) {
        setPwMessage({ text: '✓ Password updated securely on server!', isError: false });
        setCurrentPw('');
        setNewPw('');
      } else {
        setPwMessage({ text: data.error || 'Failed to update password', isError: true });
      }
    } catch {
      setPwMessage({ text: 'Failed to communicate with server.', isError: true });
    }
  };

  const handleStart2FASetup = async () => {
    setTwoFactorMsg({ text: '', isError: false });
    const authToken = safeSessionStorage.getItem('kv_admin_token') || token;
    try {
      const res = await fetch('/api/auth/2fa/setup', {
        headers: { 'Authorization': `Bearer ${authToken || ''}` },
      });
      if (res.status === 401) {
        onLogout();
        alert('Session expired. Please log in again.');
        return;
      }
      const data = await res.json();
      if (data.secret && data.qrUri) {
        const qrDataUrl = await QRCode.toDataURL(data.qrUri, {
          width: 180,
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' },
        });
        setTwoFactorSetupData({ secret: data.secret, qrUri: data.qrUri, qrDataUrl });
        setVerifyOtpInput('');
        setCopiedSecret(false);
      } else {
        setTwoFactorMsg({ text: data.error || 'Failed to initialize 2FA setup.', isError: true });
      }
    } catch (e) {
      setTwoFactorMsg({ text: 'Error generating 2FA QR code: ' + e.message, isError: true });
    }
  };

  const handleConfirm2FA = async (e) => {
    e.preventDefault();
    setTwoFactorMsg({ text: '', isError: false });
    if (!verifyOtpInput || verifyOtpInput.trim().length !== 6) {
      setTwoFactorMsg({ text: 'Please enter the 6-digit code from your authenticator app.', isError: true });
      return;
    }

    const authToken = safeSessionStorage.getItem('kv_admin_token') || token;
    try {
      const res = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken || ''}`,
        },
        body: JSON.stringify({
          secret: twoFactorSetupData.secret,
          otp: verifyOtpInput.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTwoFactorEnabled(true);
        setTwoFactorSetupData(null);
        setVerifyOtpInput('');
        setTwoFactorMsg({ text: '✓ Two-Factor Authentication (2FA) is now active!', isError: false });
      } else {
        setTwoFactorMsg({ text: data.error || 'Failed to verify code.', isError: true });
      }
    } catch (e) {
      setTwoFactorMsg({ text: 'Network error: ' + e.message, isError: true });
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    setTwoFactorMsg({ text: '', isError: false });

    const authToken = safeSessionStorage.getItem('kv_admin_token') || token;
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken || ''}`,
        },
        body: JSON.stringify({ password: disable2FAPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTwoFactorEnabled(false);
        setShowDisable2FAConfirm(false);
        setDisable2FAPassword('');
        setTwoFactorMsg({ text: '✓ Two-Factor Authentication has been disabled.', isError: false });
      } else {
        setTwoFactorMsg({ text: data.error || 'Failed to disable 2FA. Incorrect password.', isError: true });
      }
    } catch (e) {
      setTwoFactorMsg({ text: 'Network error: ' + e.message, isError: true });
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: isSplitView ? '0' : '8px auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Card 1: Two-Factor Authentication */}
      <div style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: twoFactorEnabled ? (isDark ? '#1b3320' : '#e8f5e9') : (isDark ? '#262626' : '#f0f0f0'),
              color: twoFactorEnabled ? '#4CAF50' : text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {twoFactorEnabled ? <ShieldCheck size={18} /> : <Shield size={18} />}
            </div>
            <div>
              <span style={{ fontSize: '14px', fontWeight: '600', display: 'block' }}>
                Two-Factor Authentication (TOTP)
              </span>
              <span style={{ fontSize: '11px', color: subText }}>
                RFC 6238 Time-based One-Time Passwords
              </span>
            </div>
          </div>
          <span style={{
            fontSize: '11px',
            padding: '3px 8px',
            borderRadius: '4px',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: twoFactorEnabled ? (isDark ? '#14331e' : '#e8f5e9') : (isDark ? '#332714' : '#fff8e1'),
            color: twoFactorEnabled ? '#4CAF50' : '#ff9800',
            border: `1px solid ${twoFactorEnabled ? (isDark ? '#1e4d2b' : '#c8e6c9') : (isDark ? '#4d3a1e' : '#ffe082')}`
          }}>
            {twoFactorEnabled ? <Check size={11} /> : null}
            {twoFactorEnabled ? '2FA Enabled' : '2FA Disabled'}
          </span>
        </div>

        <p style={{ fontSize: '12px', color: subText, margin: 0, lineHeight: '1.5' }}>
          Protect your admin portal from unauthorized access. When active, every login requires a 6-digit code generated by your authenticator app (Google Authenticator, Apple Keychain, 1Password, or Authy).
        </p>

        {twoFactorMsg.text && (
          <div style={{
            fontSize: '11px',
            color: twoFactorMsg.isError ? '#f44336' : '#4CAF50',
            padding: '8px 10px',
            borderRadius: '4px',
            background: twoFactorMsg.isError ? (isDark ? '#331616' : '#ffebee') : (isDark ? '#16331a' : '#e8f5e9'),
            border: `1px solid ${twoFactorMsg.isError ? (isDark ? '#4d1e1e' : '#ffcdd2') : (isDark ? '#1e4d26' : '#c8e6c9')}`
          }}>
            {twoFactorMsg.text}
          </div>
        )}

        {/* State A: 2FA Disabled & Setup Not Started */}
        {!twoFactorEnabled && !twoFactorSetupData && (
          <div>
            <button
              type="button"
              onClick={handleStart2FASetup}
              style={{
                padding: '9px 16px',
                background: isDark ? '#ffffff' : '#000000',
                color: isDark ? '#000000' : '#ffffff',
                border: 'none',
                borderRadius: '5px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <QrCode size={14} /> Setup Two-Factor Authentication
            </button>
          </div>
        )}

        {/* State B: 2FA Setup Flow (QR Code & Secret) */}
        {twoFactorSetupData && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            padding: '14px',
            borderRadius: '6px',
            background: isDark ? '#141414' : '#f9f9f9',
            border: `1px solid ${border}`
          }}>
            <div style={{ fontSize: '12px', fontWeight: '600' }}>
              Step 1: Scan QR Code with Authenticator App
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{
                padding: '10px',
                background: '#ffffff',
                borderRadius: '8px',
                display: 'inline-block',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <img
                  src={twoFactorSetupData.qrDataUrl}
                  alt="2FA QR Code"
                  style={{ width: '160px', height: '160px', display: 'block' }}
                />
              </div>
              <span style={{ fontSize: '11px', color: subText, textAlign: 'center' }}>
                Open Google Authenticator, 1Password, or your camera to scan
              </span>
            </div>

            <div style={{ fontSize: '12px', fontWeight: '600', marginTop: '4px' }}>
              Step 2: Or Enter Key Manually
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              borderRadius: '5px',
              gap: '8px'
            }}>
              <code style={{ fontSize: '11px', letterSpacing: '1px', wordBreak: 'break-all' }}>
                {twoFactorSetupData.secret}
              </code>
              <button
                type="button"
                onClick={() => handleCopySecret(twoFactorSetupData.secret)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: copiedSecret ? '#4CAF50' : text,
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  flexShrink: 0
                }}
                title="Copy secret key"
              >
                {copiedSecret ? <Check size={13} /> : <Copy size={13} />}
                {copiedSecret ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div style={{ fontSize: '12px', fontWeight: '600', marginTop: '4px' }}>
              Step 3: Verify & Activate
            </div>

            <form onSubmit={handleConfirm2FA} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="Enter 6-digit code (e.g. 123456)"
                value={verifyOtpInput}
                onChange={(e) => setVerifyOtpInput(e.target.value.replace(/\D/g, ''))}
                autoFocus
                style={{
                  padding: '10px 12px',
                  borderRadius: '5px',
                  border: `1px solid ${inputBorder}`,
                  background: inputBg,
                  color: text,
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  textAlign: 'center',
                  letterSpacing: '4px',
                  outline: 'none'
                }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorSetupData(null);
                    setVerifyOtpInput('');
                    setTwoFactorMsg({ text: '', isError: false });
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '5px',
                    border: `1px solid ${border}`,
                    background: 'transparent',
                    color: text,
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyOtpInput.length !== 6}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '5px',
                    border: 'none',
                    background: verifyOtpInput.length === 6 ? (isDark ? '#ffffff' : '#000000') : (isDark ? '#333' : '#ddd'),
                    color: verifyOtpInput.length === 6 ? (isDark ? '#000000' : '#ffffff') : subText,
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: verifyOtpInput.length === 6 ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit'
                  }}
                >
                  Activate 2FA
                </button>
              </div>
            </form>
          </div>
        )}

        {/* State C: 2FA Active */}
        {twoFactorEnabled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {!showDisable2FAConfirm ? (
              <div>
                <button
                  type="button"
                  onClick={() => setShowDisable2FAConfirm(true)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '5px',
                    border: `1px solid ${border}`,
                    background: 'transparent',
                    color: '#f44336',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  Disable 2FA
                </button>
              </div>
            ) : (
              <form onSubmit={handleDisable2FA} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '12px',
                background: isDark ? '#141414' : '#f9f9f9',
                borderRadius: '6px',
                border: `1px solid ${border}`
              }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#f44336' }}>
                  Confirm 2FA Deactivation
                </span>
                <span style={{ fontSize: '11px', color: subText }}>
                  Enter your current admin password to deactivate Two-Factor Authentication.
                </span>
                <input
                  type="password"
                  placeholder="Current Password"
                  value={disable2FAPassword}
                  onChange={(e) => setDisable2FAPassword(e.target.value)}
                  required
                  autoFocus
                  style={{
                    padding: '8px 12px',
                    borderRadius: '5px',
                    border: `1px solid ${inputBorder}`,
                    background: inputBg,
                    color: text,
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    outline: 'none'
                  }}
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDisable2FAConfirm(false);
                      setDisable2FAPassword('');
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '4px',
                      border: `1px solid ${border}`,
                      background: 'transparent',
                      color: text,
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '6px 14px',
                      borderRadius: '4px',
                      border: 'none',
                      background: '#d32f2f',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    Confirm Disable
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Card 2: Update Password */}
      <div style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: isDark ? '#262626' : '#f0f0f0',
            color: text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Key size={18} />
          </div>
          <div>
            <span style={{ fontSize: '14px', fontWeight: '600', display: 'block' }}>
              Update Admin Password
            </span>
            <span style={{ fontSize: '11px', color: subText }}>
              Protected with cryptographic salted scrypt hashing
            </span>
          </div>
        </div>

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '10px', color: subText, display: 'block', marginBottom: '4px' }}>
              CURRENT PASSWORD
            </label>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '5px',
                border: `1px solid ${inputBorder}`,
                background: inputBg,
                color: text,
                fontSize: '12px',
                fontFamily: 'inherit',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: subText, display: 'block', marginBottom: '4px' }}>
              NEW PASSWORD (MIN. 4 CHARACTERS)
            </label>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '5px',
                border: `1px solid ${inputBorder}`,
                background: inputBg,
                color: text,
                fontSize: '12px',
                fontFamily: 'inherit',
              }}
            />
          </div>
          {pwMessage.text && (
            <div style={{
              fontSize: '11px',
              color: pwMessage.isError ? '#f44336' : '#4CAF50',
              padding: '8px 10px',
              borderRadius: '4px',
              background: pwMessage.isError ? (isDark ? '#331616' : '#ffebee') : (isDark ? '#16331a' : '#e8f5e9'),
              border: `1px solid ${pwMessage.isError ? (isDark ? '#4d1e1e' : '#ffcdd2') : (isDark ? '#1e4d26' : '#c8e6c9')}`
            }}>
              {pwMessage.text}
            </div>
          )}
          <div>
            <button
              type="submit"
              style={{
                padding: '9px 16px',
                background: isDark ? '#ffffff' : '#000000',
                color: isDark ? '#000000' : '#ffffff',
                border: 'none',
                borderRadius: '5px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'inherit',
                marginTop: '4px'
              }}
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
