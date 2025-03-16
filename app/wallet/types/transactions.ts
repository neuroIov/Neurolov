export interface NLOVTransaction {
  id: string;
  type: 'earning' | 'received';
  amount: number;
  timestamp: Date;
  source: string;
  status: 'completed' | 'pending' | 'failed';
  details?: {
    modelName?: string;
    gpuHours?: number;
  };
}
