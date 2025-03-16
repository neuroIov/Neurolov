export interface Node {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    city: string;
    country: string;
  };
  status: 'online' | 'offline' | 'busy';
  computePower: string;
  uptime: string;
  isFriend: boolean;
  lastPing: string;
}

// Helper function to generate random coordinates within a region
function generateRandomCoords(
  baseLat: number,
  baseLng: number,
  spread: number = 5
): { lat: number; lng: number } {
  return {
    lat: baseLat + (Math.random() - 0.5) * spread,
    lng: baseLng + (Math.random() - 0.5) * spread
  };
}

// Major tech hubs and their base coordinates
const techHubs = [
  { city: 'San Francisco', country: 'USA', lat: 37.7749, lng: -122.4194 },
  { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
  { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
  { city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050 },
  { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
  { city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { city: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777 },
  { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
  { city: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.9780 },
  { city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832 },
  { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { city: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041 },
  { city: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686 },
  { city: 'Tel Aviv', country: 'Israel', lat: 32.0853, lng: 34.7818 },
  { city: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 }
];

// Generate 100 nodes
export const mockNodes: Node[] = Array.from({ length: 100 }, (_, i) => {
  // Select a random tech hub
  const hub = techHubs[Math.floor(Math.random() * techHubs.length)];
  const coords = generateRandomCoords(hub.lat, hub.lng);
  
  // Generate random compute power between 8 and 20 TFLOPS
  const computePower = (8 + Math.random() * 12).toFixed(1);
  
  // Generate random uptime between 95% and 100%
  const uptime = (95 + Math.random() * 5).toFixed(1);
  
  // Generate random ping between 20ms and 200ms
  const ping = Math.floor(20 + Math.random() * 180);
  
  // 70% chance of being online, 20% busy, 10% offline
  const statusRoll = Math.random();
  const status = statusRoll > 0.3 
    ? 'online' 
    : statusRoll > 0.1 
    ? 'busy' 
    : 'offline';

  return {
    id: (i + 1).toString(),
    name: `${hub.city}-Node-${(Math.floor(Math.random() * 999) + 1).toString().padStart(3, '0')}`,
    location: {
      lat: coords.lat,
      lng: coords.lng,
      city: hub.city,
      country: hub.country
    },
    status,
    computePower: `${computePower} TFLOPS`,
    uptime: `${uptime}%`,
    isFriend: Math.random() > 0.8, // 20% chance of being a friend
    lastPing: `${ping}ms`
  };
});
