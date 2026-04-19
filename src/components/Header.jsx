import React from 'react';

const Header = () => {
  return (
    <div className="border-b border-gray-100">
      <header className="ms-container py-6 md:py-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="flex flex-col">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[84px] text-blue-600 font-pixel tracking-[-0.05em] leading-[0.85] uppercase">
            VNDANGKHOA<br />PORTAL
          </h1>
        </div>
        
        <div className="flex flex-col text-left lg:text-right max-w-sm lg:mb-2">
          <p className="font-serif text-[15px] md:text-[17px] leading-snug italic text-gray-900 font-medium">
            A reference manual for people who design and build software.
          </p>
          <p className="font-mono text-[11px] md:text-[12px] font-bold mt-2 text-black uppercase tracking-[0.2em]">
            Managed and illustrated by Khoa Vo.
          </p>
        </div>
      </header>
      
      {/* Manual Divider Pattern */}
      <div className="ms-container overflow-hidden whitespace-nowrap opacity-20 select-none pb-4" aria-hidden="true">
        <div className="text-[10px] font-mono tracking-[0.5em] flex justify-between w-full">
          {Array(20).fill('❖ ❖ ❖ ❖ ❖').join(' ')}
        </div>
      </div>
    </div>
  );
};

export default Header;
