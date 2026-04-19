import React from 'react';

const Header = () => {
  return (
    <header className="ms-container pt-8 md:pt-12 pb-4 md:pb-8 flex flex-col md:flex-row justify-between items-start md:items-baseline gap-6 md:gap-4">
      <div className="flex flex-col w-full md:w-auto">
        <h1 className="text-3xl sm:text-4xl md:text-6xl text-blue-600 font-pixel tracking-tighter leading-none">
          VNDANGKHOA<span className="text-gray-200">_</span>PORTAL
        </h1>
      </div>
      
      <div className="flex flex-col text-left md:text-right md:max-w-xs transition-opacity hover:opacity-100 opacity-80">
        <p className="font-serif text-[12px] md:text-[13px] leading-relaxed italic text-gray-800">
          A reference manual for people who design and build software.
        </p>
        <p className="font-serif text-[11px] md:text-[12px] font-bold mt-1 text-black uppercase tracking-wider">
          Managed by Khoa Vo.
        </p>
      </div>
    </header>
  );
};

export default Header;
