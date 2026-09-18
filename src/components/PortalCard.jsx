import React from 'react';

const PortalCard = ({ item, _index }) => {
  const { title, subtitle, url } = item;
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="portal-link"
    >
      <span className="portal-title">{title}</span>
      {subtitle && <span className="portal-subtitle">{subtitle}</span>}
    </a>
  );
};

export default PortalCard;