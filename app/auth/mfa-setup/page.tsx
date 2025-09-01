"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, ShieldCheck, Smartphone, Key, CheckCircle, AlertCircle, Loader2, QrCode } from "lucide-react";
import toast from "react-hot-toast";

function MfaSetupContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  
  const [qr, setQr] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [step, setStep] = useState<'generate' | 'verify' | 'complete'>('generate');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter()

  useEffect(() => {
    if (!userId) {
      setError("User ID is required");
    }
  }, [userId]);

  async function handleGenerate() {
    if (!userId) {
      setError("User ID not found");
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const res = await fetch("/api/mfa/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.qrCodeDataUrl) {
        setQr(data.qrCodeDataUrl);
        setStep('verify');
        setSuccess("QR code generated successfully! Scan with your authenticator app.");
      } else {
        throw new Error(data.message || "Failed to generate QR code");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate QR code");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleVerify() {
    if (!userId) {
      setError("User ID not found");
      return;
    }

    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsVerifying(true);
    setError(null);
    
    try {
      const res = await fetch("/api/mfa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, token: code }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        data.isAdmin ? router.push("/admin/dashboard") : router.push("/dashboard");
        setStep('complete');
        setSuccess("MFA has been successfully enabled for your account!");
        setCode("");
      } else {
        throw new Error(data.message || "Verification failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  }

  function handleCodeChange(value: string) {
    // Only allow numeric input and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setCode(numericValue);
    setError(null);
  }

  function resetSetup() {
    setStep('generate');
    setQr(null);
    setCode("");
    setError(null);
    setSuccess(null);
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Access</h2>
          <p className="text-gray-600">User ID is required to set up MFA.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">Multi-Factor Authentication</h1>
              <p className="text-blue-100">Secure your account with 2FA</p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="px-8 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${step === 'generate' ? 'text-blue-600' : step === 'verify' || step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === 'generate' ? 'bg-blue-100 text-blue-600' : step === 'verify' || step === 'complete' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                1
              </div>
              <span className="font-medium">Generate QR</span>
            </div>
            
            <div className={`w-16 h-1 rounded-full ${step === 'verify' || step === 'complete' ? 'bg-green-500' : 'bg-gray-200'}`} />
            
            <div className={`flex items-center gap-2 ${step === 'verify' ? 'text-blue-600' : step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === 'verify' ? 'bg-blue-100 text-blue-600' : step === 'complete' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                2
              </div>
              <span className="font-medium">Verify Code</span>
            </div>
            
            <div className={`w-16 h-1 rounded-full ${step === 'complete' ? 'bg-green-500' : 'bg-gray-200'}`} />
            
            <div className={`flex items-center gap-2 ${step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === 'complete' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {step === 'complete' ? <CheckCircle className="h-4 w-4" /> : '3'}
              </div>
              <span className="font-medium">Complete</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800">Success</h3>
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            </div>
          )}

          {/* Step 1: Generate QR Code */}
          {step === 'generate' && (
            <div className="text-center">
              <QrCode className="h-16 w-16 text-blue-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Set Up Authenticator App</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                First, you'll need to generate a QR code to connect your authenticator app like Google Authenticator or Authy.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-6 mb-8">
                <Smartphone className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-blue-900 mb-2">Before you continue</h3>
                <p className="text-blue-800 text-sm">
                  Make sure you have an authenticator app installed on your phone (Google Authenticator, Authy, Microsoft Authenticator, etc.)
                </p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="h-5 w-5" />
                    Generate QR Code
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 2: Scan QR and Verify */}
          {step === 'verify' && qr && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Scan QR Code & Verify</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* QR Code */}
                <div className="text-center">
                  <div className="bg-white p-4 rounded-xl border-2 border-gray-200 inline-block mb-4">
                    <img src={qr} alt="MFA QR Code" className="w-48 h-48 mx-auto" />
                  </div>
                  <p className="text-sm text-gray-600">Scan this QR code with your authenticator app</p>
                </div>

                {/* Verification */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      Instructions:
                    </h3>
                    <ol className="text-sm text-gray-600 space-y-1">
                      <li>1. Open your authenticator app</li>
                      <li>2. Tap "Add account" or "+"</li>
                      <li>3. Scan the QR code</li>
                      <li>4. Enter the 6-digit code below</li>
                    </ol>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="000000"
                        value={code}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono tracking-widest"
                        maxLength={6}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code from your authenticator app</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleVerify}
                      disabled={isVerifying || code.length !== 6}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors duration-200"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-5 w-5" />
                          Verify & Enable
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={resetSetup}
                      className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Complete */}
          {step === 'complete' && (
            <div className="text-center">
              <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">MFA Successfully Enabled!</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Your account is now protected with multi-factor authentication. You'll need to use your authenticator app to sign in from now on.
              </p>
              
              {/* <div className="bg-green-50 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold text-green-900 mb-3">What's Next?</h3>
                <ul className="text-green-800 text-sm space-y-2">
                  <li>• Keep your authenticator app safe and backed up</li>
                  <li>• Save your backup codes in a secure location</li>
                  <li>• Test signing in with MFA to make sure it works</li>
                </ul>
              </div>

              <button
                onClick={resetSetup}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Set Up Another Device
              </button> */}
                          <div className="bg-green-50 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold text-green-900 mb-3">What's Next?</h3>
                <ul className="text-green-800 text-sm space-y-2">
                  <li>• Keep your authenticator app safe and backed up</li>
                  <li>• Save your backup codes in a secure location</li>
                  <li>• Test signing in with MFA to make sure it works</li>
                </ul>
              </div>

              <button
                onClick={resetSetup}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Set Up Another Device
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function MfaSetupLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">Multi-Factor Authentication</h1>
              <p className="text-blue-100">Loading...</p>
            </div>
          </div>
        </div>
        <div className="p-8 text-center">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading MFA setup...</p>
        </div>
      </div>
    </div>
  );
}

export default function MfaSetup() {
  return (
    <Suspense fallback={<MfaSetupLoading />}>
      <MfaSetupContent />
    </Suspense>
  );
}