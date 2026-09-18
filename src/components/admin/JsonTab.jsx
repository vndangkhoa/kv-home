import React, { useState } from 'react';
import { Copy, Check, FileCode, Wand2 } from 'lucide-react';

export default function JsonTab({
  jsonText,
  setJsonText,
  handleImportJson,
  isDark,
  tokens,
  isSplitView = false,
}) {
  const { border, text, subText, inputBorder } = tokens;
  const [copied, setCopied] = useState(false);
  const [formatError, setFormatError] = useState('');

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setFormatError('');
    } catch (e) {
      setFormatError('Invalid JSON: ' + e.message);
      setTimeout(() => setFormatError(''), 5000);
    }
  };

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(jsonText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: subText }}>
          Export your link array configuration or paste JSON to overwrite and batch-update links.
        </span>

        <button
          type="button"
          onClick={handleFormatJson}
          style={{
            padding: '5px 10px',
            background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
            border: `1px solid ${border}`,
            borderRadius: '5px',
            fontSize: '11px',
            fontWeight: '500',
            color: text,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
          }}
          title="Format and Indent JSON"
        >
          <Wand2 size={12} color="#00BCD4" />
          <span>Format JSON</span>
        </button>
      </div>

      {formatError && (
        <div style={{
          padding: '8px 12px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #ef4444',
          borderRadius: '6px',
          color: '#ef4444',
          fontSize: '11px',
        }}>
          {formatError}
        </div>
      )}

      <textarea
        rows={isSplitView ? 14 : 18}
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        spellCheck={false}
        style={{
          width: '100%',
          padding: '12px',
          background: isDark ? '#0d1117' : '#f8fafc',
          color: isDark ? '#e6edf3' : '#1e293b',
          border: `1px solid ${inputBorder}`,
          borderRadius: '6px',
          fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'SF Mono', Consolas, monospace",
          fontSize: '11px',
          lineHeight: '1.5',
          resize: 'vertical',
        }}
      />

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleImportJson}
          style={{
            padding: '8px 16px',
            background: '#00BCD4',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <FileCode size={13} />
          <span>Import & Apply JSON</span>
        </button>

        <button
          type="button"
          onClick={handleCopy}
          style={{
            padding: '8px 14px',
            background: isDark ? '#262626' : '#f0f0f0',
            color: text,
            border: `1px solid ${border}`,
            borderRadius: '6px',
            fontSize: '11px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {copied ? <Check size={13} color="#4CAF50" /> : <Copy size={13} />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
        </button>
      </div>
    </div>
  );
}
