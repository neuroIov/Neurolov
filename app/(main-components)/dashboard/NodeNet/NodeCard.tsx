'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Activity, Send, UserPlus, Zap } from 'lucide-react';
import { Node } from './mockData';
import CommunicateDialog from './CommunicateDialog';

interface NodeCardProps {
  node: Node;
  distanceKm?: number;
  onClick?: () => void;
}

export default function NodeCard({ node, distanceKm, onClick }: NodeCardProps) {
  const [isPinging, setIsPinging] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [showSendTokens, setShowSendTokens] = useState(false);
  const [tokenAmount, setTokenAmount] = useState('');
  const [showCommunicateDialog, setShowCommunicateDialog] = useState(false);
  const [isSendingTokens, setIsSendingTokens] = useState(false);

  const handlePing = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPinging(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`Ping response from ${node.name}: ${node.lastPing}`);
    setIsPinging(false);
  };

  const handleFriendRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSendingRequest(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success(`Friend request sent to ${node.name}`);
    setIsSendingRequest(false);
  };

  const handleSendTokens = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const amount = Number(tokenAmount);
    
    if (!tokenAmount || isNaN(amount)) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (amount > 1000000) {
      toast.error('Amount exceeds maximum limit');
      return;
    }

    setIsSendingTokens(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`${amount} NLOV sent to ${node.name}`);
      setShowSendTokens(false);
      setTokenAmount('');
    } catch (error) {
      toast.error('Failed to send NLOV');
    } finally {
      setIsSendingTokens(false);
    }
  };

  const handleCardClick = () => {
    if (node.isFriend && node.status === 'online') {
      setShowCommunicateDialog(true);
    } else if (onClick) {
      onClick();
    }
  };

  const handleTokenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const value = e.target.value;
    // Only allow numbers and one decimal point
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setTokenAmount(value);
    }
  };

  return (
    <>
      <Card 
        className="bg-black/50 border-gray-800 p-4 hover:bg-black/70 transition-colors cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-white">{node.name}</h3>
              <span className={`w-2 h-2 rounded-full ${
                node.status === 'online' ? 'bg-green-500' : 
                node.status === 'busy' ? 'bg-yellow-500' : 
                'bg-gray-500'
              }`}></span>
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {node.location.city}, {node.location.country}
              {distanceKm !== undefined && (
                <span className="text-gray-500 ml-2">
                  ({distanceKm} km away)
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                {node.computePower}
              </div>
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4" />
                {node.uptime}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-black/70 hover:bg-black/90"
              onClick={handlePing}
              disabled={isPinging}
            >
              {isPinging ? 'Pinging...' : `Ping ${node.lastPing}`}
            </Button>

            {!node.isFriend && (
              <Button
                size="sm"
                variant="outline"
                className="bg-black/70 hover:bg-black/90"
                onClick={handleFriendRequest}
                disabled={isSendingRequest}
              >
                {isSendingRequest ? (
                  'Sending...'
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Friend
                  </>
                )}
              </Button>
            )}

            {node.isFriend && (
              <>
                {showSendTokens ? (
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <Input
                      type="text"
                      placeholder="NLOV"
                      value={tokenAmount}
                      onChange={handleTokenInputChange}
                      className="w-24 bg-black/70 border-gray-800 text-white"
                      onClick={e => e.stopPropagation()}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-black/70 hover:bg-black/90 whitespace-nowrap"
                      onClick={handleSendTokens}
                      disabled={isSendingTokens}
                    >
                      {isSendingTokens ? 'Sending...' : 'Send'}
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-black/70 hover:bg-black/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSendTokens(true);
                    }}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send NLOV
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </Card>

      {showCommunicateDialog && (
        <CommunicateDialog
          node={node}
          onClose={() => setShowCommunicateDialog(false)}
        />
      )}
    </>
  );
}
