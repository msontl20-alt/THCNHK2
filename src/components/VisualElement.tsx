// src/components/VisualElement.tsx
import React from 'react';
import { Globe, MousePointer2, Keyboard, Monitor, Printer, Speaker, Trash2, Battery, Lightbulb, Settings, Scissors, Pencil, Ruler, Dices, Package, Wrench, Snowflake } from 'lucide-react';

export const VisualElement = ({ type }: { type: string }) => {
  if (!type) return null;
  switch(type) {
    // 1. Biểu tượng phần mềm & Phần cứng
    case 'word': 
      return <div className="w-14 h-14 bg-blue-600 text-white flex items-center justify-center rounded-xl font-bold text-3xl shadow-lg border-2 border-blue-700">W</div>;
    case 'powerpoint': 
      return <div className="w-14 h-14 bg-orange-600 text-white flex items-center justify-center rounded-xl font-bold text-3xl shadow-lg border-2 border-orange-700">P</div>;
    case 'excel': 
      return <div className="w-14 h-14 bg-green-600 text-white flex items-center justify-center rounded-xl font-bold text-3xl shadow-lg border-2 border-green-700">X</div>;
    case 'folder': 
      return <div className="w-16 h-11 bg-yellow-400 rounded-lg relative shadow-lg mt-2 border border-yellow-500 before:absolute before:w-6 before:h-3 before:bg-yellow-400 before:-top-3 before:left-0 before:rounded-t-md before:border-t before:border-l before:border-yellow-500"></div>;
    case 'firefox': 
      return <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-600 text-white flex items-center justify-center rounded-full shadow-lg border-2 border-orange-500"><Globe size={32} className="text-blue-800 bg-white/95 rounded-full p-0.5" /></div>;
    case 'mouse':
      return <div className="w-14 h-14 bg-gray-100 rounded-2xl border-2 border-gray-300 flex items-center justify-center shadow-md"><MousePointer2 size={32} className="text-gray-600" /></div>;
    case 'keyboard':
      return <div className="w-16 h-10 bg-gray-700 rounded-md border-2 border-gray-800 flex items-center justify-center shadow-md px-1"><Keyboard size={32} className="text-gray-100" /></div>;
    case 'monitor':
      return <div className="w-14 h-14 flex flex-col items-center"><div className="w-14 h-10 bg-gray-800 rounded-md border-2 border-gray-900 shadow-md"></div><div className="w-4 h-2 bg-gray-700"></div><div className="w-8 h-1 bg-gray-900 rounded-full"></div></div>;
    case 'printer':
      return <div className="w-14 h-14 flex items-center justify-center"><Printer size={40} className="text-gray-600" /></div>;
    case 'speaker':
      return <div className="w-14 h-14 flex items-center justify-center"><Speaker size={40} className="text-gray-600" /></div>;
    case 'trash':
      return <div className="w-14 h-14 flex items-center justify-center text-red-500"><Trash2 size={40} /></div>;

    // 2. Công nghệ & Thủ công
    case 'battery':
      return <div className="w-14 h-14 flex items-center justify-center text-green-600"><Battery size={48} fill="currentColor" fillOpacity={0.2} /></div>;
    case 'lightbulb':
      return <div className="w-14 h-14 flex items-center justify-center text-yellow-500"><Lightbulb size={48} fill="currentColor" fillOpacity={0.2} /></div>;
    case 'gear':
      return <div className="w-14 h-14 flex items-center justify-center text-gray-500"><Settings size={48} className="animate-[spin_4s_linear_infinite]" /></div>;
    case 'scissors':
      return <div className="w-14 h-14 flex items-center justify-center text-red-500 scale-x-[-1]"><Scissors size={40} /></div>;
    case 'pencil':
      return <div className="w-14 h-14 flex items-center justify-center text-blue-500"><Pencil size={40} /></div>;
    case 'ruler':
      return <div className="w-14 h-14 flex items-center justify-center text-amber-600"><Ruler size={40} /></div>;
    case 'dice':
      return <div className="w-14 h-14 flex items-center justify-center text-purple-600"><Dices size={40} /></div>;
    case 'box':
      return <div className="w-14 h-14 flex items-center justify-center text-orange-600 text-xs font-mono relative"><Package size={44} /><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold bg-white/80 px-0.5 rounded">x = ?</span></div>;
    case 'wrench':
      return <div className="w-14 h-14 flex items-center justify-center text-gray-600"><Wrench size={40} /></div>;
    case 'snowflake':
      return <div className="w-14 h-14 flex items-center justify-center text-blue-400"><Snowflake size={44} /></div>;
    case 'logic':
      return (
        <div className="w-16 h-16 flex items-center justify-center relative">
          <div className="w-8 h-8 border-2 border-indigo-500 rounded-lg rotate-45 flex items-center justify-center bg-indigo-50">
            <span className="text-indigo-600 font-bold -rotate-45 text-xs">IF</span>
          </div>
          <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
        </div>
      );
    case 'loop_infinite':
      return (
        <div className="w-16 h-16 flex items-center justify-center">
          <div className="w-12 h-6 border-4 border-amber-500 rounded-full relative animate-[spin_2s_linear_infinite]">
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-amber-500 rounded-full shadow-sm"></div>
          </div>
        </div>
      );
    
    // 2. Khối lệnh Scratch
    case 'scratch_flag': 
      return <div className="bg-yellow-400 text-yellow-900 px-6 py-3 rounded-t-3xl rounded-b-xl font-bold flex items-center shadow-md border-b-4 border-yellow-500 text-xl w-max mx-auto">Khi bấm vào <span className="text-green-600 ml-2 text-4xl drop-shadow-sm leading-none">⚑</span></div>;
    case 'scratch_motion_turn': 
      return <div className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-md border-b-4 border-blue-600 text-xl w-max mx-auto flex items-center">xoay ↻ <span className="bg-white text-blue-900 px-3 py-1 rounded-full mx-2 border border-gray-300">15</span> dộ</div>;
    case 'scratch_repeat': 
      return (
        <div className="bg-amber-500 text-white px-5 py-4 rounded-xl font-bold shadow-md border-b-4 border-amber-600 text-xl w-max flex flex-col items-start mx-auto">
          <div className="flex items-center mb-1">lặp lại <span className="bg-white text-amber-900 px-3 py-1 rounded-full mx-2 border border-gray-300">10</span></div>
          <div className="w-8 h-12 border-l-[10px] border-amber-500 rounded-bl-md"></div>
          <div className="h-6 w-28 bg-amber-500 rounded-b-xl border-b-4 border-amber-600 mt-[-2px]"></div>
        </div>
      );
    case 'scratch_ifelse': 
      return (
        <div className="bg-amber-500 text-white px-5 py-4 rounded-xl font-bold shadow-md border-b-4 border-amber-600 text-xl w-max flex flex-col items-start mx-auto">
          <div className="flex items-center mb-1">nếu <span className="bg-amber-600 border-2 border-amber-400 w-12 h-8 mx-2 rounded-sm shadow-inner opacity-90"></span> thì</div>
          <div className="w-8 h-10 border-l-[10px] border-amber-500 rounded-bl-md"></div>
          <div className="h-12 flex items-center bg-amber-500 px-4 rounded-r-xl w-full -ml-2 mt-[-2px] z-10 border-b-4 border-amber-600 shadow-sm">nếu không thì</div>
          <div className="w-8 h-10 border-l-[10px] border-amber-500 rounded-bl-md mt-[-4px]"></div>
          <div className="h-6 w-24 bg-amber-500 rounded-b-xl border-b-4 border-amber-600 mt-[-2px]"></div>
        </div>
      );
    case 'scratch_change_var': 
      return <div className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow-md border-b-4 border-orange-600 text-xl w-max mx-auto flex items-center">thay dổi <span className="bg-orange-600 border-2 border-orange-400 px-3 py-1 rounded-lg mx-2 drop-shadow-sm flex items-center">diểm ▼</span> một lượng <span className="bg-white text-orange-900 px-3 py-1 rounded-full mx-2 border border-gray-300">1</span></div>;
    
    // 3. Biển báo giao thông
    case 'traffic_stop': 
      return <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center border-[6px] border-white shadow-xl ring-2 ring-gray-300 mx-auto"><div className="w-14 h-4 bg-white"></div></div>;
    case 'traffic_warning': 
      return (
        <div className="relative mx-auto my-4 drop-shadow-xl filter">
          {/* Hình tam giác viền dỏ */}
          <div className="w-0 h-0 border-l-[50px] border-l-transparent border-r-[50px] border-r-transparent border-b-[86px] border-b-red-600 relative">
            {/* Hình tam giác nền vàng bên trong */}
            <div className="absolute -left-[38px] top-[10px] w-0 h-0 border-l-[38px] border-l-transparent border-r-[38px] border-r-transparent border-b-[66px] border-b-yellow-400">
              <div className="absolute -left-[5px] top-[12px] text-gray-900 font-black text-4xl">!</div>
            </div>
          </div>
        </div>
      );
    case 'traffic_info': 
      return <div className="w-24 h-24 bg-blue-500 rounded-xl flex items-center justify-center border-[6px] border-white shadow-xl ring-2 ring-gray-300 mx-auto text-white font-bold font-serif text-6xl">i</div>;
    
    default: return null;
  }
};
