'use client'

import { useState, useEffect } from 'react';
import { Smartphone, Apple, Download, Monitor } from 'lucide-react';

const DiagnosticsAppDownloadPage = () => {
  const [showIosDialog, setShowIosDialog] = useState(false);

  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark');
    document.body.style.backgroundColor = '#111827'; // bg-gray-900
    
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  const handleAndroidDownload = (isBC = false) => {
    // Create a direct link element and trigger click
    const link = document.createElement('a');
    const fileName = isBC ? 'Mobitech_Diagnose_2.2.10(BC).apk' : 'Mobitech_Diagnose_2.2.10.apk';
    link.href = `/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleIosClick = () => {
    setShowIosDialog(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100" style={{ backgroundColor: '#111827' }}>
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-400 mb-4">Mobitech Diagnose</h1>
          <p className="text-xl text-gray-300">
            Download our diagnostic app for your device
          </p>
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          {/* Android Regular Version Card */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-blue-500/20 transition-shadow" style={{ backgroundColor: '#1f2937' }}>
            <div className="flex justify-center mb-6">
              <Smartphone size={80} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold text-center mb-2 text-white">Android</h2>
            <p className="text-green-400 text-center font-medium mb-4">Regular Version</p>
            <p className="text-gray-300 mb-6 text-center text-sm">
              For modern Android devices with latest features
            </p>
            <button
              onClick={() => handleAndroidDownload(false)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Download APK (v2.2.10)
            </button>
            <div className="mt-4 text-sm text-gray-400 text-center">
              Requires Android 8.0 or later
            </div>
          </div>

          {/* Android BC Version Card */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-blue-500/20 transition-shadow" style={{ backgroundColor: '#1f2937' }}>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Smartphone size={80} className="text-orange-500" />
                <Monitor size={24} className="text-orange-400 absolute -bottom-1 -right-1" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-center mb-2 text-white">Android</h2>
            <p className="text-orange-400 text-center font-medium mb-4">Legacy Version</p>
            <p className="text-gray-300 mb-6 text-center text-sm">
              For older Android devices with backward compatibility
            </p>
            <button
              onClick={() => handleAndroidDownload(true)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Download BC APK (v2.2.10)
            </button>
            <div className="mt-4 text-sm text-gray-400 text-center">
              Requires Android 5.0 or later
            </div>
          </div>

          {/* iOS Download Card */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-blue-500/20 transition-shadow  md:col-span-2 lg:col-span-1" style={{ backgroundColor: '#1f2937' }}>
            <div className="flex justify-center mb-6">
              <Apple size={80} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-center mb-2 text-white">iOS</h2>
            <p className="text-gray-400 text-center font-medium mb-4">Coming Soon</p>
            <p className="text-gray-300 mb-6 text-center text-sm">
              Available on the App Store soon
            </p>
            <button
              onClick={handleIosClick}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors cursor-not-allowed flex items-center justify-center gap-2"
              disabled
            >
              <Apple size={20} />
              Coming Soon
            </button>
            <div className="mt-4 text-sm text-gray-400 text-center">
              Requires iOS 14 or later
            </div>
          </div>
        </div>

        {/* Version Information Section */}
        <div className="mt-12 bg-gray-800 rounded-xl p-6" style={{ backgroundColor: '#1f2937' }}>
          <h3 className="text-xl font-semibold text-white mb-4 text-center">Which version should I choose?</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="text-lg font-medium text-green-400 mb-2">Regular Version</h4>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Latest features and optimizations</li>
                <li>• Better performance</li>
                <li>• Modern UI components</li>
                <li>• Recommended for most users</li>
              </ul>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="text-lg font-medium text-orange-400 mb-2">Legacy Version (BC)</h4>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Compatible with older devices</li>
                <li>• Reduced system requirements</li>
                <li>• Stable on legacy hardware</li>
                <li>• Choose if regular version doesn't work</li>
              </ul>
            </div>
          </div>
        </div>

        {/* iOS Coming Soon Dialog */}
        {showIosDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl" style={{ backgroundColor: '#1f2937' }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">iOS Version</h3>
                <button 
                  onClick={() => setShowIosDialog(false)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-300 mb-6">
                The Mobitech Diagnose app for iOS is currently in development and will be available on the App Store soon.
                Please check back later!
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => setShowIosDialog(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 text-center text-gray-400 text-sm">
          <p>By downloading, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </main>
    </div>
  );
};

export default DiagnosticsAppDownloadPage;