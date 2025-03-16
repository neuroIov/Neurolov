'use client';

import React, { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Network } from 'lucide-react';
import { toast } from 'sonner';
import NodeCard from './NodeCard';
import NearbyNodeDialog from './NearbyNodeDialog';
import { mockNodes, Node } from './mockData';
import dynamic from 'next/dynamic';

// Dynamically import the WorldMap component with no SSR
const WorldMap = dynamic(() => import('./WorldMap'), { 
  ssr: false,
  loading: () => (
    <Card className="bg-black/50 border-gray-800 h-[600px] relative overflow-hidden flex items-center justify-center">
      <div className="text-gray-500">
        <Network className="h-16 w-16 mb-4 mx-auto animate-pulse" />
        <p>Loading World Map...</p>
      </div>
    </Card>
  )
});

const CURRENT_USER_ID = '1'; // This would come from auth in a real app

export default function NodeNetPage() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedNearbyNode, setSelectedNearbyNode] = useState<Node | null>(null);
  const [networkStatus, setNetworkStatus] = useState('online');
  const nodes = mockNodes;

  // Get current user's location
  const currentUser = useMemo(() => 
    nodes.find(n => n.id === CURRENT_USER_ID), 
    [nodes]
  );

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  // Get friends and friend suggestions
  const { friends, friendSuggestions } = useMemo(() => {
    if (!currentUser) return { friends: [], friendSuggestions: [] };

    const friends = nodes.filter(node => 
      node.isFriend && node.id !== CURRENT_USER_ID
    );

    // Get nodes that aren't friends, sorted by distance to current user
    const nonFriends = nodes
      .filter(node => !node.isFriend && node.id !== CURRENT_USER_ID)
      .map(node => ({
        ...node,
        distance: calculateDistance(
          currentUser.location.lat,
          currentUser.location.lng,
          node.location.lat,
          node.location.lng
        )
      }))
      .sort((a, b) => a.distance - b.distance);

    return {
      friends,
      friendSuggestions: nonFriends.slice(0, 5) // Get 5 closest non-friends
    };
  }, [nodes, currentUser]);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/50 border-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-400">Active Friends</h3>
          <p className="text-2xl font-bold mt-2">
            {friends.filter(n => n.status === 'online').length}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            of {friends.length} total friends
          </p>
        </Card>
        <Card className="bg-black/50 border-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-400">Network Status</h3>
          <p className="text-2xl font-bold mt-2 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${networkStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {networkStatus.charAt(0).toUpperCase() + networkStatus.slice(1)}
          </p>
        </Card>
        <Card className="bg-black/50 border-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-400">Total Compute Power</h3>
          <p className="text-2xl font-bold mt-2">
            {friends
              .filter(n => n.status === 'online')
              .reduce((acc, node) => acc + parseFloat(node.computePower), 0)
              .toFixed(1)} TFLOPS
          </p>
        </Card>
        <Card className="bg-black/50 border-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-400">Average Latency</h3>
          <p className="text-2xl font-bold mt-2">
            {Math.round(
              friends
                .filter(n => n.status === 'online')
                .reduce((acc, node) => acc + parseInt(node.lastPing), 0) / 
              friends.filter(n => n.status === 'online').length
            )}ms
          </p>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* World Map and Network Visualization */}
        <div className="lg:col-span-2">
          <Card className="bg-black/50 border-gray-800 h-[600px] relative overflow-hidden">
            <WorldMap 
              nodes={nodes} 
              onNodeClick={(node) => {
                setSelectedNode(node);
                toast.info(`Selected ${node.name} from ${node.location.city}`);
              }}
              currentUserId={CURRENT_USER_ID}
            />
          </Card>
        </div>

        {/* Node Lists */}
        <div className="space-y-6">
          {/* Friends Section */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Active Friends</h2>
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
              {friends
                .filter(node => node.status === 'online')
                .map(node => (
                  <NodeCard key={node.id} node={node} />
                ))
              }
            </div>
          </div>

          {/* Friend Suggestions Section */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Nearby Nodes</h2>
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
              {friendSuggestions.map(node => (
                <NodeCard 
                  key={node.id} 
                  node={node}
                  distanceKm={Math.round(node.distance)}
                  onClick={() => setSelectedNearbyNode(node)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Nearby Node Dialog */}
      {selectedNearbyNode && (
        <NearbyNodeDialog
          node={selectedNearbyNode}
          distanceKm={Math.round(
            friendSuggestions.find(n => n.id === selectedNearbyNode.id)?.distance || 0
          )}
          onClose={() => setSelectedNearbyNode(null)}
          onSendRequest={() => {
            toast.success(`Friend request sent to ${selectedNearbyNode.name}`);
            setSelectedNearbyNode(null);
          }}
        />
      )}
    </div>
  );
}
