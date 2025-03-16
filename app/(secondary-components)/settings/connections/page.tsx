import { ComingSoonOverlay } from '@/components/ComingSoonOverlay'
import React from 'react'

const Home = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <ComingSoonOverlay 
        type="fixed"
        title="Connections"
        description="Connect your social and developer accounts to enhance your Neurolov experience."
        version="2.0"
      />
    </div>
  )
}

export default Home