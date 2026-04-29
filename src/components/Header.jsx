import React from 'react';

const Header = () => {
  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4"
    >
      <a 
        href="/" 
        className="font-mono text-sm"
      >
        Khoa.vo
      </a>
      <div className="flex gap-6">
      </div>
    </header>
  );
};

export default Header;