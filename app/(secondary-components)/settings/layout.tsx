"use client"

import React, { ReactNode, useRef } from 'react';
import { Separator } from '@/components/ui/separator';
import { usePathname, useRouter } from 'next/navigation';

const menuItems = [
  { name: 'Account Info', link: '/' }
];

const Layout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const currentPath = usePathname();

  return (
    <div className='flex flex-col px-8 bg-black justify-center items-center'>
      <div className='relative flex items-center w-full max-w-5xl pt-6'>
        <div className='flex w-full items-center'>
          <div className='flex items-center space-x-4 bg-gray-950 py-2 px-8 whitespace-nowrap'>
            {menuItems.map((item, index) => (
              <div key={index} className='flex items-center pb-4'>
                <span
                  onClick={() => router.push(`/settings/${item.link}`)}
                  className={`
                    px-4 py-2 rounded-xl cursor-pointer
                    hover:bg-gray-800
                    ${currentPath.slice(9) === item.link ? 'bg-blue-600 text-white' : ''}
                  `}
                >
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='flex-1 w-full max-w-5xl'>
        {children}
      </div>
    </div>
  );
};

export default Layout;
