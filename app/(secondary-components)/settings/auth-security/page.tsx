import { ComingSoonOverlay } from '@/components/ComingSoonOverlay'
import React from 'react'

const Home = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <ComingSoonOverlay 
        type="fixed"
        title="Security Settings"
        description="Configure your account security and authentication preferences."
        version="2.0"
      />
    </div>
  )
}

export default Home