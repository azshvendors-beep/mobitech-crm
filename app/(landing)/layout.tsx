"use client";
import { motion } from "framer-motion";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="h-screen overflow-auto relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-blue-200/20 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />
        
        {/* Floating elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-gradient-to-l from-green-400/20 to-teal-400/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
            x: [0, 20, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 left-1/2 w-96 h-96 rounded-full bg-gradient-to-t from-pink-400/20 to-purple-400/20 blur-3xl"
        />

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_500px_at_50%_200px,rgba(255,255,255,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(white,transparent_70%)] opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10 backdrop-blur-[2px]">{children}</div>
    </main>
  );
};

export default LandingLayout;

// Add this CSS to your globals.css
// .bg-grid-blue-200 {
//   background-size: 40px 40px;
//   background-image: linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
//     linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
// }
