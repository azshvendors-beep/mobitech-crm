import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedFormProps {
  children: ReactNode;
}

const formVariants = {
  hidden: { 
    opacity: 0, 
    y: 50,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as any
    }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5
    }
  }
};

export function AnimatedForm({ children }: AnimatedFormProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={formVariants}
      className="w-full max-w-md space-y-8 rounded-2xl bg-white/10 backdrop-blur-xl p-8 shadow-2xl border border-white/20"
    >
      <motion.div
        variants={containerVariants}
        className="space-y-6"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function AnimatedFormItem({ children }: { children: ReactNode }) {
  return (
    <motion.div variants={itemVariants}>
      {children}
    </motion.div>
  );
} 