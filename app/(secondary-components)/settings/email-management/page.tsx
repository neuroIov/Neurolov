import { ComingSoonOverlay } from '@/components/ComingSoonOverlay'
import React from 'react'

const Home = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <ComingSoonOverlay 
        type="fixed"
        title="Email Management"
        description="Manage your email preferences and notifications settings."
        version="2.0"
      />
    </div>
  )
}

export default Home