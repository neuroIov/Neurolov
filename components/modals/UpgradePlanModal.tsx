import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Crown, Zap, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelName: string;
}

const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
  isOpen,
  onClose,
  modelName
}) => {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push('/subscription');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-[#1c1c1c] to-[#121212] border border-[#333] text-white">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-xl text-center text-white">
            Upgrade Required
          </DialogTitle>
          <DialogDescription className="text-center text-white/70">
            To use <span className="text-[#00FFBF] font-semibold">{modelName}</span> you need a Ultimate plan or higher
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 space-y-4">
          <div className="bg-[#222] p-4 rounded-lg border border-[#333]">
            <h4 className="flex items-center text-white font-medium mb-2">
              <Sparkles className="h-4 w-4 text-yellow-400 mr-2" />
              Pro Plan Benefits
            </h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li className="flex items-center">
                <Zap className="h-3 w-3 text-[#00FFBF] mr-2" />
                Access to all premium AI models
              </li>
              <li className="flex items-center">
                <Zap className="h-3 w-3 text-[#00FFBF] mr-2" />
                Higher generation limits
              </li>
              <li className="flex items-center">
                <Zap className="h-3 w-3 text-[#00FFBF] mr-2" />
                Priority processing for all requests
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex sm:flex-row flex-col gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10"
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleUpgrade}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-[#00FFBF] hover:opacity-90 text-white"
          >
            Upgrade Now
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradePlanModal; 