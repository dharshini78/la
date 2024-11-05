import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { CiCircleMore } from "react-icons/ci";


const MenuComponent = () => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang) => {
    // Handle language change logic here
    setShowMenu(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setShowMenu(!showMenu)} 
        className="p-2 rounded-full hover:bg-gray-100"
      >
        <CiCircleMore className="w-6 h-6" />
      </button>

      {showMenu && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className="absolute right-0 top-0 w-64 h-full bg-white/90 backdrop-blur p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Change Language</h2>
              <button 
                onClick={() => setShowMenu(false)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex gap-2 mb-8">
              <button 
                onClick={() => handleLanguageChange('English')}
                className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                English
              </button>
              <button 
                onClick={() => handleLanguageChange('Hindi')}
                className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                Hindi
              </button>
            </div>

            <div className="space-y-4">
              <button className="w-full text-left py-2">
                Download Brochure
              </button>
              <button className="w-full text-left py-2">
                About Jain's Aadhya
              </button>
              <div className="flex gap-4 mt-4">
                <a href="#" className="p-2 hover:bg-gray-200 rounded">
                  <img src="/instagram-icon.svg" alt="Instagram" className="w-6 h-6" />
                </a>
                <a href="#" className="p-2 hover:bg-gray-200 rounded">
                  <img src="/twitter-icon.svg" alt="Twitter" className="w-6 h-6" />
                </a>
                <a href="#" className="p-2 hover:bg-gray-200 rounded">
                  <img src="/linkedin-icon.svg" alt="LinkedIn" className="w-6 h-6" />
                </a>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 text-sm text-gray-500">
              powered by xrv
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuComponent;