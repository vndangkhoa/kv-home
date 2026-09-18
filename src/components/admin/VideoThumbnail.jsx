import React, { useState, useEffect } from 'react';
import { getVideoFromIndexedDB } from '../../utils/videoStorage';

/**
 * Thumbnail video preview supporting both remote/local URLs and IndexedDB blob keys
 */
export default function VideoThumbnail({ url, isDark }) {
  const [blobSrc, setBlobSrc] = useState(null);

  useEffect(() => {
    let active = true;
    let objectUrl = null;

    if (url && url.startsWith('idb://')) {
      getVideoFromIndexedDB(url).then((blobUrl) => {
        if (active && blobUrl) {
          objectUrl = blobUrl;
          setBlobSrc(blobUrl);
        }
      });
    }

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  const resolvedSrc = url && url.startsWith('idb://') ? blobSrc : url;

  if (!resolvedSrc) {
    return (
      <div style={{
        width: '100px',
        height: '60px',
        background: isDark ? '#1d1d1d' : '#f0f0f0',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        color: isDark ? '#666' : '#999',
        border: `1px dashed ${isDark ? '#333' : '#ccc'}`,
        flexShrink: 0
      }}>
        No Preview
      </div>
    );
  }

  return (
    <video
      src={resolvedSrc}
      autoPlay
      loop
      muted
      playsInline
      style={{
        width: '100px',
        height: '60px',
        borderRadius: '4px',
        objectFit: 'cover',
        border: `1px solid ${isDark ? '#444' : '#ccc'}`,
        backgroundColor: '#000',
        flexShrink: 0
      }}
    />
  );
}
