'use client';
import React, { useState, useEffect } from 'react';
import { Laptop, Truck, Clock, Wrench, Sparkles, ArrowRight, Home, CheckCircle } from 'lucide-react';

const LaptopDoorstepPickup = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Home,
      title: "Doorstep Collection",
      description: "We'll pick up your laptop right from your home"
    },
    {
      icon: Wrench,
      title: "Expert Diagnosis",
      description: "Professional technicians assess your device"
    },
    {
      icon: CheckCircle,
      title: "Quality Repair",
      description: "State-of-the-art repair with genuine parts"
    },
    {
      icon: Truck,
      title: "Safe Delivery",
      description: "Your laptop delivered back in perfect condition"
    }
  ];

  type FloatingIconProps = {
    Icon: React.ComponentType<{ size?: number }>;
    delay?: number;
    size?: number;
  };

  const FloatingIcon: React.FC<FloatingIconProps> = ({ Icon, delay = 0, size = 24 }) => (
    <div 
      className={`absolute animate-bounce text-indigo-400/20 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ 
        animationDelay: `${delay}ms`,
        animationDuration: '3s'
      }}
    >
      <Icon size={size} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden ">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 ">
        <FloatingIcon Icon={Laptop} delay={0} size={32} />
        <FloatingIcon Icon={Truck} delay={500} size={28} />
        <FloatingIcon Icon={Wrench} delay={1000} size={24} />
        <FloatingIcon Icon={Sparkles} delay={1500} size={20} />
        
        {/* Positioned floating icons */}
        <div className="absolute top-20 left-20">
          <FloatingIcon Icon={Laptop} delay={2000} size={20} />
        </div>
        <div className="absolute top-40 right-32">
          <FloatingIcon Icon={Truck} delay={2500} size={24} />
        </div>
        <div className="absolute bottom-32 left-16">
          <FloatingIcon Icon={Wrench} delay={3000} size={28} />
        </div>
        <div className="absolute bottom-20 right-20">
          <FloatingIcon Icon={Sparkles} delay={3500} size={16} />
        </div>
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className={`text-center max-w-4xl transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          
          {/* Main Icon with Pulsing Animation */}
          <div className="relative mb-8 mt-5">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-2xl animate-pulse">
              <Laptop className="w-16 h-16 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-ping opacity-20"></div>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold  mb-6 bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
            Coming Soon
          </h1>
          
          {/* Service Title */}
          <h2 className="text-2xl md:text-4xl font-semibold text-purple-200 mb-4">
            Laptop Doorstep Pickup & Repair
          </h2>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Professional laptop repair service coming to your doorstep. 
            <span className="text-purple-300 font-medium"> No more hassle of visiting repair shops!</span>
          </p>

          {/* Animated Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`relative p-6 rounded-2xl backdrop-blur-sm border transition-all duration-500 transform ${
                    currentStep === index
                      ? 'bg-white/10 border-purple-400/50 scale-105 shadow-2xl'
                      : 'bg-white/5 border-white/10 hover:bg-white/8'
                  }`}
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-all duration-300 ${
                    currentStep === index
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white scale-110'
                      : 'bg-white/10 text-purple-300'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                  
                  {/* Progress indicator */}
                  {currentStep === index && (
                    <div className="absolute top-2 right-2">
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Clock className="w-5 h-5 text-purple-300" />
              <span className="text-purple-200 font-medium">Development Progress</span>
            </div>
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progress</span>
                <span>25%</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-pulse" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          {/* <div className="space-y-4">
            <button className="group inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
              <span>Get Notified When Ready</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="text-gray-400 text-sm">
              Be the first to know when our doorstep laptop repair service launches
            </p>
          </div> */}

          {/* Footer Note */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <p className="text-gray-500 text-sm">
              🚀 Currently under development • Expected launch: Q2 2025
            </p>
          </div>
        </div>
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LaptopDoorstepPickup;