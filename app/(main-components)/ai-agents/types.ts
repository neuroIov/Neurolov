export interface Agent {
  name: string;
  description: string;
  icon: string;
  status: "active" | "inactive";
  usageCount?: number;
  performance?: number;
  pricing: {
    monthly: number;
    yearly: number;
    payAsYouGo: number;
  };
  features: string[];
  category: "Essential" | "Professional" | "Enterprise";
  deploymentTime: string;
  securityLevel: string;
}
