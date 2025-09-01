'use client'

import { motion, useAnimation, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BarChart3, Recycle, Shield, Smartphone, Activity } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { LandingBackground } from "@/components/LandingBackground";

const features = [
  {
    icon: Smartphone,
    title: "Device Management",
    description: "Track and manage recycled devices throughout their lifecycle",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Recycle,
    title: "Recycling Process",
    description: "Streamlined workflow for device recycling and refurbishment",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Real-time insights into device inventory and performance",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    description: "Rigorous testing and certification processes",
    gradient: "from-orange-500 to-red-500",
  },
];

const liveData = {
  devicesProcessed: 1152,
  activeUsers: 2058,
  efficiency: 94,
};

const LandingPage = () => {
  const counterControls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      liveData.devicesProcessed += Math.floor(Math.random() * 3);
      liveData.activeUsers += Math.floor(Math.random() * 2) - 1;
      liveData.efficiency += (Math.random() * 2 - 1) * 0.5;
      counterControls.start({ opacity: [0.5, 1], scale: [0.95, 1] });
    }, 3000);

    return () => clearInterval(interval);
  }, [counterControls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as any
      }
    }
  };

  return (
    <>
      <LandingBackground />
      <div ref={containerRef} className="min-h-screen relative">
        {/* Navigation */}
        <motion.nav 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="container mx-auto px-4 py-4 sm:py-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center"
              >
                <Image src={'/icon.png'} width={50} height={50} alt="logo"/>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                Mobitech
              </motion.h1>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-200"></div>
              <Link
                href={"/auth/user/sign-in"}
                className="relative flex items-center px-4 sm:px-6 py-2 text-sm sm:text-base font-medium text-white bg-black rounded-full hover:bg-gray-900 transition-all"
              >
                {"Get Started"}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.nav>

        {/* Live Data Banner */}
        <motion.div 
          style={{ y, opacity }}
          className="bg-gradient-to-r from-gray-900/5 to-purple-900/5 py-2 mb-8 sm:mb-12 overflow-hidden"
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm">
              <motion.div
                animate={counterControls}
                className="flex items-center space-x-2"
              >
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                <span className="text-gray-600">Processed:</span>
                <span className="font-semibold text-green-600">{liveData.devicesProcessed}</span>
              </motion.div>
              <motion.div
                animate={counterControls}
                className="flex items-center space-x-2"
              >
                <div className="flex -space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 opacity-75"
                    />
                  ))}
                </div>
                <span className="text-gray-600">Active:</span>
                <span className="font-semibold text-blue-600">{liveData.activeUsers}</span>
              </motion.div>
              <motion.div
                animate={counterControls}
                className="flex items-center space-x-2"
              >
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500" />
                <span className="text-gray-600">Efficiency:</span>
                <span className="font-semibold text-purple-600">{liveData.efficiency.toFixed(1)}%</span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4 pt-4 sm:pt-8 pb-8 sm:pb-16"
        >
          <motion.div
            variants={itemVariants}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="relative mb-6 sm:mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-8 sm:-top-12 left-1/2 -translate-x-1/2 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-2xl"
              />
              <motion.h2 
                variants={itemVariants}
                className="relative text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 sm:mb-6 px-4"
              >
                Smart Device Recycling Management
              </motion.h2>
            </div>
            <motion.p 
              variants={itemVariants}
              className="text-gray-600 text-base sm:text-xl mb-8 leading-relaxed px-4"
            >
              Transform your device recycling operations with our comprehensive CRM solution.
              Streamline processes, increase efficiency, and make a positive environmental impact.
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="container mx-auto px-4 py-8 sm:py-16"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-r ${feature.gradient} w-fit mb-3 sm:mb-4 transform group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="container mx-auto px-4 py-8 sm:py-16"
        >
          <motion.div
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
            <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
              {[
                { value: "10K+", label: "Devices Recycled", gradient: "from-blue-600 to-cyan-600" },
                { value: "98%", label: "Customer Satisfaction", gradient: "from-green-600 to-emerald-600" },
                { value: "24/7", label: "Support Available", gradient: "from-purple-600 to-pink-600" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  className="p-4 sm:p-6 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.2, type: "spring" }}
                    className={`text-3xl sm:text-5xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-sm sm:text-base text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="container mx-auto px-4 py-8 sm:py-16"
        >
          <motion.div
            variants={itemVariants}
            className="text-center relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl" />
            <div className="relative p-6 sm:p-12 backdrop-blur-sm rounded-3xl border border-gray-200/50 shadow-lg">
              <motion.h2
                variants={itemVariants}
                className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent mb-4"
              >
                Ready to Get Started?
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-sm sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto"
              >
                Join the growing network of businesses transforming their device recycling operations.
              </motion.p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={"/auth/user/sign-in"}
                  className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                >
                  {"Start Your Journey"}
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default LandingPage;