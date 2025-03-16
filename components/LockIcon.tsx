import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export const LockIcon = () => {
  return (
    <motion.div
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{ 
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="text-blue-400"
    >
      <Lock className="h-4 w-4" />
    </motion.div>
  );
};
