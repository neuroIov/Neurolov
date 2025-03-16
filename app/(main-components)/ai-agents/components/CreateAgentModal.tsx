"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChainType: boolean;
}

const steps = [
  {
    title: "Basic Information",
    description: "Set up your AI agent's core details",
    fields: ["name", "description"]
  },
  {
    title: "Capabilities",
    description: "Define what your AI agent can do",
    fields: ["capabilities"]
  },
  {
    title: "Integration",
    description: "Configure how your agent integrates with the system",
    fields: ["endpoint", "apiKey"]
  },
  {
    title: "Review",
    description: "Review and confirm your agent configuration",
    fields: []
  }
];

export default function CreateAgentModal({ isOpen, onClose, onChainType }: CreateAgentModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capabilities: "",
    endpoint: "",
    apiKey: ""
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    onClose();
  };

  const renderStep = () => {
    const step = steps[currentStep];
    
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        {currentStep === 0 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter agent name"
                className="bg-background/5 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what your agent does"
                className="bg-background/5 backdrop-blur-sm"
              />
            </div>
          </>
        )}

        {currentStep === 1 && (
          <div className="space-y-2">
            <Label htmlFor="capabilities">Agent Capabilities</Label>
            <Textarea
              id="capabilities"
              value={formData.capabilities}
              onChange={e => setFormData(prev => ({ ...prev, capabilities: e.target.value }))}
              placeholder="List the capabilities of your agent (one per line)"
              className="bg-background/5 backdrop-blur-sm min-h-[200px]"
            />
          </div>
        )}

        {currentStep === 2 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="endpoint">API Endpoint</Label>
              <Input
                id="endpoint"
                value={formData.endpoint}
                onChange={e => setFormData(prev => ({ ...prev, endpoint: e.target.value }))}
                placeholder="https://api.youragent.com/v1"
                className="bg-background/5 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={formData.apiKey}
                onChange={e => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter your API key"
                className="bg-background/5 backdrop-blur-sm"
              />
            </div>
          </>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div>
                <Label>Name</Label>
                <p className="text-sm">{formData.name}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm">{formData.description}</p>
              </div>
              <div>
                <Label>Type</Label>
                <p className="text-sm">{onChainType ? "On-Chain" : "Off-Chain"}</p>
              </div>
              <div>
                <Label>Capabilities</Label>
                <p className="text-sm whitespace-pre-line">{formData.capabilities}</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-background/90 to-background/50 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
            Create Custom {onChainType ? "On-Chain" : "Off-Chain"} Agent
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {steps[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="relative mb-6">
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-primary/20 -translate-y-1/2" />
          <div className="relative flex justify-between">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center"
                initial={false}
                animate={{
                  scale: currentStep >= index ? 1.1 : 1,
                  opacity: currentStep >= index ? 1 : 0.5,
                }}
              >
                <div
                  className={`w-4 h-4 rounded-full ${
                    currentStep >= index
                      ? "bg-primary"
                      : "bg-primary/20"
                  } relative z-10`}
                />
                <span className="text-xs mt-2">{step.title}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {renderStep()}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : currentStep === steps.length - 1 ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Create Agent
              </>
            ) : (
              "Next"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
