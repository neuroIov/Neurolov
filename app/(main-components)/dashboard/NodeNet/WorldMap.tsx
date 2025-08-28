'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Node } from './mockData';
import 'leaflet/dist/leaflet.css';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ZoomIn, ZoomOut } from 'lucide-react';
import styles from './styles.module.css';

interface WorldMapProps {
  nodes: Node[];
  onNodeClick: (node: Node) => void;
  currentUserId?: string;
}

// Custom zoom controls component
function ZoomControl() {
  const map = useMap();

  return (
    <div className={styles.zoomControls}>
      <button
        className={styles.zoomButton}
        onClick={() => map.zoomIn()}
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      <button
        className={styles.zoomButton}
        onClick={() => map.zoomOut()}
      >
        <ZoomOut className="h-4 w-4" />
      </button>
    </div>
  );
}

// Map bounds control component
function BoundsControl() {
  const map = useMap();

  useEffect(() => {
    // Set maximum bounds (whole world)
    const southWest = [-90, -180];
    const northEast = [90, 180];
    map.setMaxBounds([southWest, northEast]);
    
    // Set minimum zoom level
    map.setMinZoom(2);
    // Set maximum zoom level
    map.setMaxZoom(8);
    
    // Prevent dragging outside bounds
    map.on('drag', () => {
      map.panInsideBounds([southWest, northEast], { animate: false });
    });
  }, [map]);

  return null;
}

// Search component
function SearchControl({ nodes, onSelect }: { nodes: Node[], onSelect: (node: Node) => void }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Node[]>([]);
  const map = useMap();

  const handleSearch = (value: string) => {
    setSearch(value);
    if (value.length > 2) {
      const filtered = nodes.filter(node => 
        node.name.toLowerCase().includes(value.toLowerCase()) ||
        node.location.city.toLowerCase().includes(value.toLowerCase())
      );
      setResults(filtered.slice(0, 5));
    } else {
      setResults([]);
    }
  };

  const handleSelect = (node: Node) => {
    map.setView([node.location.lat, node.location.lng], 8);
    onSelect(node);
    setSearch('');
    setResults([]);
  };

  return (
    <div className={styles.searchContainer}>
      <div className="relative">
        <input
          type="text"
          placeholder="Search nodes..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className={styles.searchInput}
        />
        <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
      </div>
      {results.length > 0 && (
        <div className={styles.searchResults}>
          {results.map(node => (
            <button
              key={node.id}
              className={styles.searchResultItem}
              onClick={() => handleSelect(node)}
            >
              <div className={styles.searchResultName}>{node.name}</div>
              <div className={styles.searchResultLocation}>{node.location.city}, {node.location.country}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Memoized map instance to prevent multiple renders
const MemoizedMap = React.memo(function WorldMap({ nodes, onNodeClick, currentUserId = '1' }: WorldMapProps) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={3}
      className={styles.leafletContainer}
      style={{ height: '100%', width: '100%', background: 'rgb(14, 14, 14)' }}
      zoomControl={false}
      doubleClickZoom={false}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      
      {nodes.map(node => {
        const isCurrentUser = node.id === currentUserId;
        const isFriend = node.isFriend;
        const isNearby = !isFriend && !isCurrentUser;

        let color = '#4299e1'; // blue for nearby nodes
        if (isCurrentUser) color = '#f56565'; // red for current user
        if (isFriend && node.status !== 'online') color = '#718096'; // grey for inactive friends
        if (isFriend && node.status === 'online') color = '#48bb78'; // green for active friends

        return (
          <CircleMarker
            key={node.id}
            center={[node.location.lat, node.location.lng]}
            radius={isCurrentUser ? 8 : 6}
            fillColor={color}
            color={color}
            weight={2}
            opacity={0.8}
            fillOpacity={0.5}
            eventHandlers={{
              click: () => onNodeClick(node)
            }}
          >
            <Popup>
              <div className={styles.nodePopup}>
                <div className={styles.nodePopupName}>{node.name}</div>
                <div className={styles.nodePopupLocation}>{node.location.city}, {node.location.country}</div>
                <div className={styles.nodePopupStatus}>
                  Status: <span className={
                    node.status === 'online' ? styles.statusOnline : 
                    node.status === 'busy' ? styles.statusBusy : 
                    styles.statusOffline
                  }>{node.status}</span>
                </div>
                <div className={styles.nodePopupCompute}>Compute: {node.computePower}</div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      <BoundsControl />
      <ZoomControl />
      <SearchControl nodes={nodes} onSelect={onNodeClick} />
    </MapContainer>
  );
});

export default MemoizedMap;
