import React from 'react'
import { footer } from '@/constants/values'
const Footer = () => {
  return (
    <div className={` py-4 flex flex-row flex-shrink flex-1 justify-between `}>
        {footer.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className={` text-lg flex flex-1 justify-center space-x-2 flex-row`}
          >
            <div>
              {item.name.charAt(0).toUpperCase() }
            </div>
            <span>
              {item.name}
            </span>
          </a>
        ))}
      </div>
  )
}

export default Footer
