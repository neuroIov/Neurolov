'use client';

import React from 'react';
import { Node } from './mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Activity, MapPin, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './styles.module.css';

interface NearbyNodeDialogProps {
  node: Node;
  distanceKm: number;
  onClose: () => void;
  onSendRequest: () => void;
}

export default function NearbyNodeDialog({
  node,
  distanceKm,
  onClose,
  onSendRequest
}: NearbyNodeDialogProps) {
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

          {/* Header with glowing effect */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={styles.dialogHeader}
          >
            <div className={styles.dialogTitle}>
              <span className={styles.dialogTitleText}>{node.name}</span>
              <span className={`${styles.statusDot} ${styles[`status${node.status}`]}`} />
            </div>
          </motion.div>

          {/* Location with map pin animation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={styles.dialogLocation}
          >
            <MapPin className="h-4 w-4" />
            <span>
              {node.location.city}, {node.location.country}
              <span className={styles.distance}>({distanceKm} km away)</span>
            </span>
          </motion.div>

          {/* Stats with counting animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={styles.dialogStats}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className={styles.dialogStat}
            >
              <Zap className="h-4 w-4" />
              <span>{node.computePower}</span>
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
              className={styles.dialogStat}
            >
              <Activity className="h-4 w-4" />
              <span>{node.uptime}</span>
            </motion.div>
          </motion.div>

          {/* Connection visualization */}
          <div className={styles.connectionVisual}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className={styles.connectionLine}
            />
            <motion.div
              animate={{ 
                x: ["0%", "100%", "0%"],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className={styles.connectionPulse}
            />
          </div>

          {/* Action buttons with hover effects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className={styles.dialogActions}
          >
            <Button
              onClick={onSendRequest}
              className={styles.connectButton}
              variant="outline"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Connect
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
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
