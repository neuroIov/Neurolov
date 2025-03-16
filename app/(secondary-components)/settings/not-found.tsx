import { ComingSoonOverlay } from '@/components/ComingSoonOverlay'
import React from 'react'

const NotFound = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <ComingSoonOverlay 
        type="fixed"
        title="Page Not Found"
        description="This page is not available yet. We're working on it!"
        version="2.0"
      />
    </div>
  )
}

export default NotFound