import React, { useState } from 'react';
import { links, groups } from './data/links';
import Header from './components/Header';
import DotDivider from './components/DotDivider';
import Section from './components/Section';
import PortalCard from './components/PortalCard';
import { Search } from 'lucide-react';

// Interactive blueprint components
import PrimaryBlueprint from './components/illustrations/PrimaryBlueprint';
import MediaBlueprint from './components/illustrations/MediaBlueprint';
import MaintenanceBlueprint from './components/illustrations/MaintenanceBlueprint';
import DevToolsBlueprint from './components/illustrations/DevToolsBlueprint';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  // Enhanced links with categories and colors for the MakingSoftware look
  const enhancedLinks = links.map(link => {
    let color = '#3147ba'; // Primary Blue
    
    if (link.group === 'entertainment') {
      color = '#ec4899';
    } else if (link.group === 'dev') {
      color = '#10b981';
    } else if (link.group === 'rm8pfix-vn') {
      color = '#f59e0b';
    }

    return {
      ...link,
      color
    };
  });

  const filteredLinks = enhancedLinks.filter(link => 
    link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {groups.map((group, groupIndex) => {
          const groupLinks = filteredLinks
            .filter(link => link.group === group.id)
            .sort((a, b) => a.order - b.order);
          
          if (groupLinks.length === 0) return null;

          const isPrimary = group.id === 'primary';

          return (
            <React.Fragment key={group.id}>
              <Section 
                title={group.title} 
                description={group.description}
                index={groupIndex}
                isFeatured={isPrimary && !searchQuery}
                featuredImage={
                  group.id === 'primary' ? <PrimaryBlueprint /> :
                  group.id === 'entertainment' ? <MediaBlueprint /> :
                  group.id === 'rm8pfix-vn' ? <MaintenanceBlueprint /> :
                  <DevToolsBlueprint />
                }
              >
                {groupLinks.map((link, linkIndex) => (
                  <PortalCard 
                    key={link.id} 
                    item={link} 
                    index={linkIndex} 
                  />
                ))}
              </Section>

              {/* Position Search Bar immediately after the Primary Featured section */}
              {isPrimary && (
                <div className="ms-container pt-0 pb-1 md:pb-2">
                  <div className="mb-1"><DotDivider /></div>
                  <div className="relative group max-w-md">
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 font-mono text-[10px] text-blue-600 font-bold vertical-text hidden md:block">
                      SEARCH
                    </div>
                    <div className="flex items-center gap-2 border-b-2 border-black pb-2 focus-within:border-blue-600 transition-colors">
                      <Search className="text-gray-300 group-focus-within:text-blue-600 shrink-0" size={16} />
                      <input 
                        type="text" 
                        placeholder="FIND SYSTEM ACCESS..." 
                        className="w-full bg-transparent font-pixel text-[13px] md:text-sm focus:outline-none placeholder:text-gray-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {groupIndex < groups.length - 1 && !isPrimary && <div className="mt-1"><DotDivider /></div>}
            </React.Fragment>
          );
        })}

        {searchQuery && filteredLinks.length === 0 && (
          <div className="text-center py-12 px-4">
            <p className="font-pixel text-[10px] md:text-xs text-gray-300 uppercase tracking-widest">[ ERROR: NO ACCESS MATCHED ]</p>
          </div>
        )}
      </main>

      <footer className="ms-container border-t border-gray-100 mt-2 md:mt-4 pb-12 flex flex-col md:flex-row justify-between items-center md:items-end gap-8">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <h2 className="font-pixel text-blue-600 text-xs md:text-sm">VNDANGKHOA_PORTAL</h2>
        </div>
        
        <div className="text-center md:text-right w-full md:w-auto">
          <p className="font-serif text-[10px] md:text-[11px] font-bold text-gray-900 italic">
            "Software engineering is the most important trade of the 21st century."
          </p>
          <p className="font-mono text-[9px] text-gray-400 mt-2 tracking-widest">
             © {new Date().getFullYear()} REPRODUCED PIXEL PERFECT
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;