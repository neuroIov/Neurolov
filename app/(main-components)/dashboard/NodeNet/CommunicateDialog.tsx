'use client';

import React from 'react';
import { Node } from './mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Users, Share2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';

interface CommunicateDialogProps {
  node: Node;
  onClose: () => void;
}

export default function CommunicateDialog({
  node,
  onClose
}: CommunicateDialogProps) {
  const router = useRouter();

  const goToCommunity = () => {
    router.push(`/community?node=${node.id}`);
  };

  return (
    <AnimatePresence>
      <div className={styles.dialogOverlay}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className={styles.dialogContent}
        >
          {/* Close button */}
          <button onClick={onClose} className={styles.dialogClose}>
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={styles.dialogHeader}
          >
            <div className={styles.dialogTitle}>
              <span className={styles.dialogTitleText}>Connect with {node.name}</span>
              <span className={`${styles.statusDot} ${styles[`status${node.status}`]}`} />
            </div>
          </motion.div>

          {/* Connection Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={styles.connectionStats}
          >
            <div className={styles.connectionStat}>
              <Zap className="h-4 w-4" />
              <span>Compute Power: {node.computePower}</span>
            </div>
            <div className={styles.connectionStat}>
              <Share2 className="h-4 w-4" />
              <span>Last Interaction: 2h ago</span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={styles.communicateActions}
          >
            {/* Direct Message Button */}
            <Button
              onClick={goToCommunity}
              className={styles.communicateButton}
              variant="outline"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Direct Message
              <motion.div
                className={styles.buttonGlow}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </Button>

            {/* Community Chat Button */}
            <Button
              onClick={goToCommunity}
              className={styles.communicateButton}
              variant="outline"
            >
              <Users className="h-4 w-4 mr-2" />
              Join Community Chat
              <motion.div
                className={styles.buttonGlow}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />
            </Button>
          </motion.div>

          {/* Active Connection Visual */}
          <div className={styles.activeConnection}>
            <motion.div
              className={styles.connectionRing}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className={styles.connectionDot}
              animate={{
                scale: [1, 0.8, 1],
                opacity: [1, 0.7, 1]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
