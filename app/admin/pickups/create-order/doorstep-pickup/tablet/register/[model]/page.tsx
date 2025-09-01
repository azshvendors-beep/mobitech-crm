"use client";

import { useModelData } from "@/components/GetModelData";
import { useParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { variantSchema } from "@/constants/const";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { ImageUploadField } from "@/components/mobitech/image-upload-field";
import { handleFileSelect } from "@/lib/pickup-fx/handleFileSelect";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  ChevronsRight,
  CircleCheck,
  Loader2,
  Plus,
  QrCode,
  Smartphone,
  Trash,
  X,
  ArrowLeft,
  ChevronLeft,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BarcodeScanner from "react-qr-barcode-scanner";
import ManualDiagnosticsSheet from "@/components/mobitech/ManualDiagnosticsSheet";
import { toast } from "sonner";
import DesktopAadharSheet from "@/components/sheets/DesktopAadharSheet";
import MobileAadharSheet from "@/components/sheets/MobileAadharSheet";
import DesktopVoterIdSheet from "@/components/sheets/DesktopVoterSheet";
import MobileVoterIdSheet from "@/components/sheets/MobileVoterSheet";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import SignatureCanvas from "react-signature-canvas";
import type { SignatureCanvas as SignatureCanvasType } from "react-signature-canvas";
import { Label } from "@/components/ui/label";
import { SiGooglepay, SiPhonepe, SiHdfcbank as SiBhim } from "react-icons/si";
import { MdAccountBalance } from "react-icons/md";
type ZXingBarcodeScannerProps = {
  onResult: (text: string) => void;
  onError?: (err: unknown) => void;
};
function ZXingBarcodeScanner({ onResult, onError }: ZXingBarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let active = true;

    codeReader
      .decodeFromVideoDevice(
        undefined,
        videoRef.current as HTMLVideoElement,
        (result, err) => {
          if (!active) return;
          if (result) {
            onResult(result.getText());
            if (typeof (codeReader as any).reset === "function") {
              (codeReader as any).reset();
            } else if ((codeReader as any).stream) {
              (codeReader as any).stream
                .getTracks()
                .forEach((track: any) => track.stop());
            }
          }
          if (err && err.name !== "NotFoundException") {
            onError?.(err);
          }
        }
      )
      .catch(onError);

    return () => {
      active = false;
      if (typeof (codeReader as any).reset === "function") {
        (codeReader as any).reset();
      } else if ((codeReader as any).stream) {
        (codeReader as any).stream
          .getTracks()
          .forEach((track: any) => track.stop());
      }
    };
  }, [onResult, onError]);

  return (
    <video
      ref={videoRef}
      style={{ width: 300, height: 300, objectFit: "cover" }}
      autoPlay
      muted
    />
  );
}

const RegisterPickup = () => {
  const params = useParams();

  const modelParam = params.model;
  const modelId = Array.isArray(modelParam) ? modelParam[0] : modelParam ?? "";
  const { mobileDataLoading, mobileData, mobileDataError } =
    useModelData(modelId);

  function isImei2Required() {
    if (
      !mobileDataLoading &&
      mobileData &&
      typeof mobileData.model === "string"
    ) {
      return !mobileData.model.toLowerCase().includes("apple");
    }
    // Default to required if loading or no data
    return true;
  }

  const [step, setStep] = useState(1);
  const [imeiScanTarget, setImeiScanTarget] = useState<
    "imei1" | "imei2" | null
  >(null);
  const [isIMEIQRDialogOpen, setIsIMEIQRDialogOpen] = useState(false);
  const [currentImageField, setCurrentImageField] = useState<null | string>(
    null
  );
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [qrScanResult, setQrScanResult] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  const [manualTestId, setManualTestId] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [qcReportData, setQcReportData] = useState<any>(null);

  const [signatureRef, setSignatureRef] = useState<SignatureCanvasType | null>(
    null
  );
  const [isSignatureLocked, setIsSignatureLocked] = useState(false);

  const [finalAmount, setFinalAmount] = useState("");
  const [isManualSheetOpen, setIsManualSheetOpen] = useState(false);
  const [manualDiagTouched, setManualDiagTouched] = useState(false);
  const [showManualCloseWarning, setShowManualCloseWarning] =
    useState<boolean>(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false);
  const [phoneToVerify, setPhoneToVerify] = useState("");
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [aadharSheetOpen, setAadharSheetOpen] = useState(false);
  const [isAadharVerified, setIsAadharVerified] = useState(false);
  const [isVoterVerified, setIsVoterVerified] = useState(false);
  const [aadharVerificationData, setAadharVerificationData] =
    useState<any>(null);
  const [voterVerificationData, setVoterVerificationData] = useState<any>(null);
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState("");
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] =
    React.useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [paymentMode, setPaymentMode] = useState<
    "upi" | "bank" | "exchange" | "cash" | ""
  >("");
  const [paymentStatus, setPaymentStatus] = useState<
    "paid" | "not_paid" | "exchange" | ""
  >("");
  const [isUpiQRDialogOpen, setIsUpiQRDialogOpen] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [upiIdSaved, setUpiIdSaved] = useState(false);
  const [bankDetailsSaved, setBankDetailsSaved] = useState(false);
  const [upiVerifyStatus, setUpiVerifyStatus] = useState<
    "success" | "fail" | null
  >(null);
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);
  const [bankName, setBankName] = useState("");
  const [bankSearch, setBankSearch] = useState("");
  const [bankSearchOpen, setBankSearchOpen] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [upiData, setUpiData] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [exchangeModel, setExchangeModel] = useState("");
  const [exchangeImei, setExchangeImei] = useState("");
  const [exchangeModels, setExchangeModels] = useState<string[]>([]);
  const [showAddModelDialog, setShowAddModelDialog] = useState(false);
  const [newModelName, setNewModelName] = useState("");

  const [utrNo, setUtrNo] = useState("");
  const [paymentPaidBy, setPaymentPaidBy] = useState("");
  const [purchaserBank, setPurchaserBank] = useState("");
  const [purchaserPaymentMode, setPurchaserPaymentMode] = useState("");

  const [sellingAmount, setSellingAmount] = useState("");

  const [convertedSellingAmount, setConvertedSellingAmount] = useState(0);

  // Add state for account verification
  const [accountVerifyStatus, setAccountVerifyStatus] = useState<
    "idle" | "loading" | "success" | "fail"
  >("idle");
  const [verifiedBeneficiaryName, setVerifiedBeneficiaryName] = useState("");
  const [accountVerifyError, setAccountVerifyError] = useState("");

  type VariantForm = z.infer<typeof variantSchema>;

  const form = useForm<VariantForm>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      variant: "",
      imei1: "",
      imei2: "",
      deviceFrontImage: "",
      deviceBackImage: "",
      diagnosticsProcess: undefined,
      qcReport: undefined,
      phoneVerified: false,
      isAadharVerified: false,
      voterIdVerified: false,
      // Manual Diagnostics fields (step 1)
      screenTouch: "",
      screenSpot: "",
      screenLines: "",
      screenPhysical: "",
      screenDiscolor: "",
      screenBubble: "",
      // Manual Diagnostics fields (step 3)
      physicalScratch: "",
      physicalDent: "",
      physicalPanel: "",
      physicalBent: "",
      remarks: "",
    },
  });

  useEffect(() => {
    if (isSignatureDialogOpen) {
      setTimeout(() => {
        if (canvasContainerRef.current) {
          const rect = canvasContainerRef.current.getBoundingClientRect();
          setCanvasSize({ width: rect.width, height: rect.height });
        }
      }, 0);
    }
  }, [isSignatureDialogOpen]);

  useEffect(() => {
    if (form.watch("diagnosticsProcess") === "manual") {
      setIsManualSheetOpen(true);
    } else {
      setIsManualSheetOpen(false);
      // setManualDiagForm({ field1: "", field2: "" });
      setManualDiagTouched(false);
    }
  }, [form.watch("diagnosticsProcess")]);

  const handleVerifyUpi = async () => {
    setIsVerifyingUpi(true);
    setUpiVerifyStatus(null);
    try {
      const res = await fetch("/api/bank/verify-upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upi_id: upiId }),
      });
      const data = await res.json();
      if (data && data.status_code === 200) {
        setUpiData(data.data.name_information.name_at_bank_cleaned);
        setUpiVerifyStatus("success");
      } else {
        setUpiVerifyStatus("fail");
      }
    } catch {
      setUpiVerifyStatus("fail");
    } finally {
      setIsVerifyingUpi(false);
    }
  };
  const handleUpiQRScan = (err: any, result: any) => {
    if (result && result.text) {
      setUpiId(result.text);
      setIsUpiQRDialogOpen(false);
    }
  };
  useEffect(() => {
    if (paymentMode === "exchange") {
      fetch("/api/v3/get-individual-model-data", { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.data)) {
            setExchangeModels(data.data.map((m: any) => m.model));
          }
        });
    }
  }, [paymentMode]);
  const handleSubmit = (values: VariantForm) => {
    const completeFormData = {
      ...values,
      aadharVerification: aadharVerificationData,
    };

  };

  const fetchQcReportByTestId = async (testId: string) => {
    setQrLoading(true);
    setQrError(null);
    setQcReportData(null);
    try {
      const res = await fetch("/api/qc-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId }),
      });
      if (!res.ok) throw new Error("No report found");
      const data = await res.json();
      
      if (!data || data === false) {
        setQrError("No report found");
        setQcReportData(null);
      } else {
        setQcReportData(data);

        form.setValue("qcReport", testId);
        setTimeout(() => {
          setIsQRDialogOpen(false);
          setTimeout(() => {
            setQrScanResult(null);
            setQrError(null);
            // setQcReportData(null);
            setManualEntry(false);
            setManualTestId("");
          }, 300);
        }, 500);
      }
    } catch (err: any) {
      setQrError("No report found");
      setQcReportData(null);
    } finally {
      setQrLoading(false);
      setManualLoading(false);
    }
  };

  const handleAadharSuccess = (aadharData: any) => {

    form.setValue("isAadharVerified", true);
    setAadharVerificationData(aadharData);
    setIsAadharVerified(true);
    toast.success("Aadhar verification completed successfully!");
  };

  const handleAadharFailure = () => {
   
    form.setValue("isAadharVerified", false);
    setIsAadharVerified(false);
    setAadharVerificationData(null);
    toast.error("Aadhar verification failed. Please try again.");
  };

  const handleVoterSuccess = (voterdata: any) => {
    
    setIsVoterVerified(true);
    setVoterVerificationData(voterdata);
    form.setValue("voterIdVerified", true);
    toast.success("Voter ID verification completed successfully!");
  };

  const handleVoterFailure = () => {
   
    setIsVoterVerified(false);
    setVoterVerificationData(null);
    form.setValue("voterIdVerified", false);
    toast.error("Voter ID verification failed. Please try again.");
  };

  const handleQRUpdate = (err: any, result: any) => {
    if (result && result.text) {
      setQrScanResult(result.text);
      fetchQcReportByTestId(result.text);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualTestId.trim()) {
      setManualLoading(true);
      fetchQcReportByTestId(manualTestId.trim());
    }
  };
  type PhoneOtpDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    phone: string;
    onVerified: (phone: string) => void;
  };

  function PhoneOtpDialog({
    open,
    onOpenChange,
    phone,
    onVerified,
  }: PhoneOtpDialogProps) {
    const [otp, setOtp] = React.useState("");
  
    const [loading, setLoading] = React.useState(false);
    const [step, setStep] = React.useState<"send" | "verify">("send");
    const [error, setError] = React.useState("");
    const [timer, setTimer] = React.useState(0);
    const [canResend, setCanResend] = React.useState(false);
    const recaptchaContainerId = "recaptcha-container-root";

    // Reset state when dialog opens
    useEffect(() => {
      if (open) {
        setOtp("");
        setStep("send");
        setError("");
        // setConfirmationResult(null);
        setTimer(0);
        setCanResend(false);
      }
    }, [open]);

    // Timer effect
    useEffect(() => {
      let interval: NodeJS.Timeout;
      if (timer > 0) {
        interval = setInterval(() => {
          setTimer((prev) => {
            if (prev <= 1) {
              setCanResend(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [timer]);

    // Send OTP
    const sendOtp = async () => {
      setLoading(true);
      setError("");
      // Validate phone number
      if (!phone || !/^\d{10}$/.test(phone)) {
        setError("Please enter a valid 10-digit phone number");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/otp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: phone,
            message: "Your Verification Code is", // or any custom message
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || "Failed to send OTP");
          setLoading(false);
          return;
        }
        setStep("verify");
        setTimer(30); // Start 30 second timer
        setCanResend(false);
      } catch (err: any) {
        setError(err?.message || "Failed to send OTP");
        console.log(err);
      }
      setLoading(false);
    };

    // Verify OTP
    const verifyOtp = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: phone, otp }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || "Invalid OTP");
          setLoading(false);
          return;
        }
        onVerified(phone);
        onOpenChange(false);
      } catch (err: any) {
        setError(err?.message || "Invalid OTP");
      }
      setLoading(false);
    };

    useEffect(() => {
      if (finalAmount) {
        const fa = parseFloat(finalAmount) || 0;
        const selling = Math.round((fa + 49) * 1.15);
        setConvertedSellingAmount(selling);
        setSellingAmount(selling.toString());
      } else {
        setSellingAmount("");
      }
    }, [finalAmount]);

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-white w-[95vw] max-w-sm mx-auto p-6 sm:p-6">
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
              Verify Phone Number
            </DialogTitle>
            <p className="text-xs sm:text-sm text-gray-600">
              {step === "send"
                ? `We'll send a verification code to ${phone}`
                : `Enter the 6-digit code sent to ${phone}`}
            </p>
          </DialogHeader>

          {step === "send" ? (
            <div className="space-y-4">
              <Button
                onClick={sendOtp}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 h-12 text-base"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  "Send OTP"
                )}
              </Button>
              {error && (
                <div className="text-red-500 text-xs sm:text-sm text-center bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-4">
                <div className="flex justify-center px-2">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    className="gap-1 sm:gap-2"
                  >
                    <InputOTPGroup className="gap-1 sm:gap-2">
                      {[...Array(6)].map((_, i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="w-10 h-10 sm:w-12 sm:h-12 text-base sm:text-lg font-semibold border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {/* Timer and Resend */}
                <div className="text-center space-y-3">
                  {timer > 0 ? (
                    <div className="text-xs sm:text-sm text-gray-600">
                      Resend code in{" "}
                      <span className="font-semibold text-blue-600">
                        {timer}s
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs sm:text-sm text-gray-600">
                      Didn't receive the code?
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={sendOtp}
                    disabled={!canResend || loading}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm h-10"
                  >
                    {loading ? "Sending..." : "Resend Code"}
                  </Button>
                </div>
              </div>

              {/* Verify Button */}
              <Button
                onClick={verifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </div>
                ) : (
                  "Verify OTP"
                )}
              </Button>

              {error && (
                <div className="text-red-500 text-xs sm:text-sm text-center bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <>
      <PhoneOtpDialog
        open={otpDialogOpen}
        onOpenChange={setOtpDialogOpen}
        phone={phoneToVerify}
        onVerified={(verifiedPhone) => {
          setPhoneVerified(true);
          setVerifiedPhoneNumber(verifiedPhone);
          form.setValue("phoneVerified", true);
        }}
      />
      <Dialog
        open={isSignatureDialogOpen}
        onOpenChange={setIsSignatureDialogOpen}
      >
        <DialogContent className="max-w-full w-full h-[90vh] flex flex-col justify-center items-center p-0">
          <DialogHeader className="w-full px-4 pt-4">
            <DialogTitle>Sign Below</DialogTitle>
          </DialogHeader>
          <div
            ref={canvasContainerRef}
            className="relative w-full max-w-md mx-auto h-full flex-1 flex flex-col items-center justify-center"
            style={{ minHeight: 300, maxHeight: "calc(90vh - 60px)" }}
          >
            {canvasSize.width > 0 && canvasSize.height > 0 ? (
              <SignatureCanvas
                ref={setSignatureRef}
                canvasProps={{
                  className:
                    "w-full h-full border border-gray-300 rounded-lg bg-white",
                  width: canvasSize.width || 400,
                  height: canvasSize.height || 300,
                  style: {
                    width: "100%",
                    height: "100%",
                    minHeight: "300px",
                    maxHeight: "calc(90vh - 60px)",
                    pointerEvents: isSignatureLocked ? "none" : "auto",
                    touchAction: "none",
                  },
                }}
                onEnd={() => {
                  if (signatureRef) {
                    // Do not update field here, only on Done
                  }
                }}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            )}
            {/* Overlayed button group */}
            <div className="absolute bottom-4 left-0 w-full flex justify-center z-10">
              <div className="flex gap-2 px-4 py-2 rounded-lg bg-white/80 backdrop-blur border border-gray-200 shadow-md">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (signatureRef) {
                      signatureRef.clear();
                      setIsSignatureLocked(false);
                    }
                  }}
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (signatureRef) {
                      setIsSignatureLocked(!isSignatureLocked);
                    }
                  }}
                >
                  {isSignatureLocked ? "Unlock Signature" : "Lock Signature"}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (signatureRef) {
                      const dataUrl = signatureRef.toDataURL();
                      form.setValue("customerSignature", dataUrl);
                      setIsSignatureDialogOpen(false);
                      setIsSignatureLocked(false);
                    }
                  }}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <div className="max-w-2xl mx-auto p-4">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            className=" fixed rounded-lg mt-3 mb-3 max-sm:top-14 max-sm:left-1  z-50  flex items-center shadow-lg bg-white text-blue-500 border-blue-500   min-md:hidden"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="flex flex-col gap-4 mt-3">
          {/* Progress Bar Stepper */}
          <div className="w-full mb-2">
            <div className="h-2 bg-gray-200 rounded">
              <div
                className="h-2 rounded transition-all"
                style={{
                  width: `${
                    step === 1
                      ? 16.67
                      : step === 2
                      ? 33.33
                      : step === 3
                      ? 50
                      : step === 4
                      ? 66.67
                      : step === 5
                      ? 83.33
                      : 100
                  }%`,
                  background: "#3b82f6",
                }}
              />
            </div>
          </div>

          {/* Selected Device Part Starts*/}

          {mobileDataLoading && (
            <>
              <Skeleton className="w-40 h-3 bg-gray-500/20 mb-3" />
              <div className="flex items-center space-x-4">
                <Skeleton className="w-16 h-16 rounded-md bg-gray-500/20" />
                <Skeleton className="h-6 w-40 bg-gray-500/20" />
              </div>
            </>
          )}

          {mobileDataError && (
            <div className="text-red-500 mt-4">
              {typeof mobileDataError === "string"
                ? mobileDataError
                : "Failed to load model data."}
            </div>
          )}

          {!mobileDataLoading && mobileData && step === 1 && (
            <>
              <h2 className="text-black text-base font-semibold mb-3">
                Selected Device :
              </h2>
              <div className="flex items-center space-x-4">
                <img
                  src={mobileData.imageUrl}
                  alt={mobileData.model}
                  className="w-16 h-16 rounded-md object-contain bg-gray-200 py-2"
                />
                <span className="text-lg text-center font-semibold">
                  {mobileData.model}
                </span>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-black text-base font-semibold mb-3">
                Upload Device Images :
              </h2>
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="text-black text-base font-semibold mb-3">
                Select Diagnostics Process :
              </h2>
            </>
          )}
          {step === 4 && (
            <>
              <h2 className="text-black text-base font-semibold mb-3">
                Complete Diagnostics Process :
              </h2>
            </>
          )}
          {step === 5 && (
            <>
              <h2 className="text-black text-base font-semibold mb-3">
                Customer Details :
              </h2>
            </>
          )}
          {step === 6 && (
            <>
              <h2 className="text-black text-base font-semibold mb-3">
                Payment Details :
              </h2>
            </>
          )}
        </div>

        {/* Selected Device Part Ends*/}

        {/* Form Parts Starts */}
        <div className="flex-1 min-h-0 overflow-y-auto mb-10">
          <Card className="bg-white shadow-sm border-0 overflow-hidden mt-4">
            <CardContent className="p-3 lg:p-6">
              <Form {...form}>
                <form
                  className="space-y-6"
                  onSubmit={(e) => e.preventDefault()}
                >
                  {/* Step 1: Device Registration */}
                  {!mobileDataLoading && mobileData && step === 1 && (
                    <>
                      {mobileData.detailedSpec?.variants?.length > 0 && (
                        <FormField
                          control={form.control}
                          name="variant"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">
                                Select Variant{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="grid grid-cols-1 gap-3"
                                >
                                  {mobileData.detailedSpec.variants.map(
                                    (variant: any, idx: number) => (
                                      <FormItem
                                        key={variant.name}
                                        className="flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer"
                                      >
                                        <FormControl>
                                          <RadioGroupItem
                                            value={variant.name}
                                            className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                                          />
                                        </FormControl>
                                        <FormLabel className="font-medium text-gray-800 cursor-pointer flex-1">
                                          {variant.name}
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  )}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="imei1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">
                                IMEI 1 <span className="text-red-500">*</span>
                              </FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Enter 15-digit IMEI"
                                    maxLength={15}
                                    className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                                  />
                                </FormControl>
                                <button
                                  type="button"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700"
                                  onClick={() => {
                                    setImeiScanTarget("imei1");
                                    setIsIMEIQRDialogOpen(true);
                                  }}
                                  tabIndex={-1}
                                >
                                  <svg
                                    width="22"
                                    height="22"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      d="M3 3v6h2V5h4V3H3Zm12 0v2h4v4h2V3h-6ZM5 19v-4H3v6h6v-2H5Zm16 0h-2v2h-4v2h6v-6ZM7 7h2v2H7V7Zm8 0h2v2h-2V7ZM7 15h2v2H7v-2Zm8 0h2v2h-2v-2Z"
                                      fill="currentColor"
                                    />
                                  </svg>
                                </button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="imei2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">
                                IMEI 2<span className="text-red-500">*</span>
                              </FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Enter 15-digit IMEI"
                                    maxLength={15}
                                    className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                                  />
                                </FormControl>
                                <button
                                  type="button"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700"
                                  onClick={() => {
                                    setImeiScanTarget("imei2");
                                    setIsIMEIQRDialogOpen(true);
                                  }}
                                  tabIndex={-1}
                                >
                                  <svg
                                    width="22"
                                    height="22"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      d="M3 3v6h2V5h4V3H3Zm12 0v2h4v4h2V3h-6ZM5 19v-4H3v6h6v-2H5Zm16 0h-2v2h-4v2h6v-6ZM7 7h2v2H7V7Zm8 0h2v2h-2V7ZM7 15h2v2H7v-2Zm8 0h2v2h-2v-2Z"
                                      fill="currentColor"
                                    />
                                  </svg>
                                </button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  {/* Step 2: Device Image Upload */}
                  {step === 2 && (
                    <>
                      <div className="space-y-4">
                        {/* <h4 className="text-sm font-medium text-gray-700">
                        Device Images <span className="text-red-500">*</span>
                      </h4> */}
                        <div className="grid min-[432px]:grid-cols-2 gap-2">
                          <FormField
                            control={form.control}
                            name="deviceFrontImage"
                            render={({ field }) => (
                              <FormItem>
                                <ImageUploadField
                                  label="Front"
                                  name="deviceFrontImage"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  onRemove={() => field.onChange("")}
                                  onCamera={() => {
                                    setCurrentImageField("deviceFrontImage");
                                    setCameraOpen(true);
                                  }}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="deviceBackImage"
                            render={({ field }) => (
                              <FormItem>
                                <ImageUploadField
                                  label="Back"
                                  name="deviceBackImage"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  onRemove={() => field.onChange("")}
                                  onCamera={() => {
                                    setCurrentImageField("deviceBackImage");
                                    setCameraOpen(true);
                                  }}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </>
                  )}
                  {/* Step 3: Diagnostics Process Selection*/}
                  {step == 3 && (
                    <>
                      <FormField
                        control={form.control}
                        name="diagnosticsProcess"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Diagnostics Process{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  if (value !== "app")
                                    form.setValue("qcReport", undefined);
                                }}
                                value={field.value}
                                className="grid grid-cols-1 gap-4"
                              >
                                <FormItem>
                                  <FormControl>
                                    <RadioGroupItem
                                      value="app"
                                      className="peer sr-only"
                                    />
                                  </FormControl>
                                  <FormLabel className="flex flex-col items-center justify-center rounded-md border-2 border-blue-500/50  bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                    <div className="flex items-center justify-center gap-2">
                                      {/* <Smartphone className="h-5 w-5" /> */}
                                      <span className="font-medium text-xs">
                                        Mobitech Diagnose
                                      </span>
                                    </div>
                                  </FormLabel>
                                </FormItem>
                                <FormItem>
                                  <FormControl>
                                    <RadioGroupItem
                                      value="manual"
                                      className="peer sr-only"
                                      onClick={() => setIsManualSheetOpen(true)}
                                    />
                                  </FormControl>
                                  <FormLabel className="flex flex-col items-center justify-center rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                    <div className="flex items-center gap-2 justify-center">
                                      {/* <Info className="h-5 w-5" /> */}
                                      <span className="font-medium text-xs">
                                        Self Diagnose
                                      </span>
                                    </div>
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  {step == 4 && (
                    <>
                      {/* Existing Step 4 Fields */}
                      {form.watch("diagnosticsProcess") === "app" && (
                        <>
                          <h3 className="text-lg font-bold text-black my-4">
                            Select QC Report :{" "}
                          </h3>
                          <FormField
                            control={form.control}
                            name="qcReport"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  QC Report{" "}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <div className="flex items-center gap-2 mb-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsQRDialogOpen(true)}
                                  >
                                    Scan QR for QC Report{" "}
                                    <QrCode className="w-4 h-4 ml-2" />
                                  </Button>
                                </div>

                                {/* Selected QC Report Display */}
                                {field.value && qcReportData === true && (
                                  <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <span className="font-medium text-green-800">
                                        QC Report Selected
                                      </span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Test ID:
                                        </span>
                                        <span className="font-medium">
                                          {field.value}
                                        </span>
                                      </div>

                                      {/* Display Boolean Test Results
                                      <div className="mt-3 space-y-2">
                                        <div className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                                          Test Results:
                                        </div>
                                        {Object.entries(qcReportData).map(([key, value]) => {
                                          // Skip non-boolean values and internal fields
                                          if (typeof value !== 'boolean' || key === 'id' || key === 'testId' || key === 'createdAt') {
                                            return null;
                                          }
                                          
                                          return (
                                            <div key={key} className="flex justify-between items-center">
                                              <span className="text-gray-600 capitalize">
                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                              </span>
                                              <span className={`font-medium ${value ? 'text-green-600' : 'text-red-600'}`}>
                                                {value ? '✓ Pass' : '✗ Fail'}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div> */}
                                    </div>
                                  </div>
                                )}

                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="mb-6 flex flex-col gap-3">
                            <h3 className="text-lg font-bold text-black mb-2">
                              Screen Condition Category :
                            </h3>
                            <FormField
                              control={form.control}
                              name="screenTouch"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                                    Screen Touch Calibration{" "}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <div className="grid grid-cols-2 gap-2 my-2">
                                    {["Working", "Not working"].map((opt) => (
                                      <Button
                                        key={opt}
                                        type="button"
                                        variant={
                                          field.value === opt
                                            ? "default"
                                            : "outline"
                                        }
                                        className={`w-full h-12 text-sm md:text-base lg:text-lg rounded-lg border-2 font-medium transition-all duration-150 ${
                                          field.value === opt
                                            ? "bg-blue-500 text-white border-blue-500"
                                            : "border-blue-500/50 text-gray-700 bg-gray-50"
                                        }`}
                                        onClick={() => field.onChange(opt)}
                                      >
                                        {opt}
                                      </Button>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="screenSpot"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                                    Screen Display Spot{" "}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger className="w-full bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-base text-gray-800">
                                      <SelectValue placeholder="Select Screen Display Spot" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-50">
                                      {[
                                        "Very Heavy or Large Spot",
                                        "No spot on screen",
                                        "3 or more than 3 spots",
                                        "2 or less than 2 spots (Small Spot)",
                                        "Colored spots / Colored Patches",
                                      ].map((opt) => (
                                        <SelectItem
                                          key={opt}
                                          value={opt}
                                          className="text-base text-gray-800 "
                                        >
                                          {opt}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="screenLines"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                                    Screen Display Lines{" "}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <div className="grid grid-cols-2 gap-2 my-2">
                                    {[
                                      "Lines on Display",
                                      "No Lines on Display",
                                    ].map((opt) => (
                                      <Button
                                        key={opt}
                                        type="button"
                                        variant={
                                          field.value === opt
                                            ? "default"
                                            : "outline"
                                        }
                                        className={`w-full h-12 text-sm md:text-base lg:text-lg rounded-lg border-2 font-medium transition-all duration-150 ${
                                          field.value === opt
                                            ? "bg-blue-500 text-white border-blue-500"
                                            : "border-blue-500/50 text-gray-700 bg-gray-50"
                                        }`}
                                        onClick={() => field.onChange(opt)}
                                      >
                                        {opt}
                                      </Button>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="screenPhysical"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                                    Screen Physical Condition{" "}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger className="w-full bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-base text-gray-800">
                                      <SelectValue placeholder="Select Screen Physical Condition" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-50">
                                      {[
                                        "Excellent",
                                        "Minor scratches / normal signs of usage",
                                        "Heavy scratches",
                                        "Screen cracked or glass broken",
                                        "Single Line Crack",
                                        "Screen Scuffed",
                                      ].map((opt) => (
                                        <SelectItem
                                          key={opt}
                                          value={opt}
                                          className="text-base text-gray-800 "
                                        >
                                          {opt}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="screenDiscolor"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                                    Screen Discoloration{" "}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger className="w-full bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-base text-gray-800">
                                      <SelectValue placeholder="Select Screen Discoloration" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-50">
                                      {[
                                        "No discoloration",
                                        "Light Yellow / blue / pink /green color on corner",
                                        "Discoloration on display corner",
                                        "Screen fading ( Colors / background imprint on full screen  )",
                                      ].map((opt) => (
                                        <SelectItem
                                          key={opt}
                                          value={opt}
                                          className="text-base text-gray-800 "
                                        >
                                          {opt}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="screenBubble"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                                    Screen Bubble or Paint{" "}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger className="w-full bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-base text-gray-800">
                                      <SelectValue placeholder="Select Screen Bubble or Paint" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-50">
                                      {[
                                        "Minor paint peel off / bubble",
                                        "Major paint peel off / bubble",
                                        "No Issues",
                                      ].map((opt) => (
                                        <SelectItem
                                          key={opt}
                                          value={opt}
                                          className="text-base text-gray-800 "
                                        >
                                          {opt}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="mb-6 flex flex-col gap-3">
                            <h3 className="text-lg font-bold text-black my-4">
                              Phone's Overall Condition :
                            </h3>
                            <FormField
                              control={form.control}
                              name="physicalScratch"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                                    Physical Condition (Scratch){" "}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger className="w-full bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-base text-gray-800">
                                      <SelectValue placeholder="Select Physical Condition (Scratch)" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-50">
                                      {[
                                        "No Scratches",
                                        "minor Scratches",
                                        "Heavy Scratches",
                                        "Minor paint peel off",
                                        "Major paint peel off",
                                      ].map((opt) => (
                                        <SelectItem
                                          key={opt}
                                          value={opt}
                                          className="text-base text-gray-800 "
                                        >
                                          {opt}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="physicalDent"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                                    Physical Condition (Dent){" "}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger className="w-full bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-base text-gray-800">
                                      <SelectValue placeholder="Select Physical Condition (Dent)" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-50">
                                      {[
                                        "No Dents",
                                        "minor Dents ( 1 or 2 small)",
                                        "Major Dents ( More than 3 ) ",
                                      ].map((opt) => (
                                        <SelectItem
                                          key={opt}
                                          value={opt}
                                          className="text-base text-gray-800 "
                                        >
                                          {opt}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="physicalPanel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                                    Physical Condition (Panel){" "}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger className="w-full bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-base text-gray-800">
                                      <SelectValue placeholder="Select Physical Condition (Panel)" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-50">
                                      {[
                                        "No Defect in Panel",
                                        "Loose Panel / Visible pasting",
                                        "Cracked and Broken Panel",
                                        "Glass Back Panel damaged",
                                      ].map((opt) => (
                                        <SelectItem
                                          key={opt}
                                          value={opt}
                                          className="text-base text-gray-800 "
                                        >
                                          {opt}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="physicalBent"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                                    Physical Condition (Bent){" "}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger className="w-full bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-base text-gray-800">
                                      <SelectValue placeholder="Select Physical Condition (Bent)" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-50">
                                      {[
                                        "Phone not bent",
                                        "Loose screen",
                                        "Bent panel ",
                                      ].map((opt) => (
                                        <SelectItem
                                          key={opt}
                                          value={opt}
                                          className="text-base text-gray-800 "
                                        >
                                          {opt}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </>
                      )}

                      {/* The rest of diagnostics fields (repairRequired, accessories, deviceAge, warrantyType, hasGstBill, gstInvoice, boxImeiMatch) */}
                      <h3 className="text-lg font-bold text-black my-4">
                        Additional Details :
                      </h3>
                      <FormField
                        control={form.control}
                        name="repairRequired"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Is this Phone need Repair?{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="grid grid-cols-2 gap-4"
                              >
                                <FormItem>
                                  <FormControl>
                                    <RadioGroupItem
                                      value="yes"
                                      className="peer sr-only"
                                    />
                                  </FormControl>
                                  <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                    <span className="font-medium">Yes</span>
                                  </FormLabel>
                                </FormItem>
                                <FormItem>
                                  <FormControl>
                                    <RadioGroupItem
                                      value="no"
                                      className="peer sr-only"
                                    />
                                  </FormControl>
                                  <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                    <span className="font-medium">No</span>
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {form.watch("repairRequired") === "yes" && (
                        <>
                          <FormField
                            control={form.control}
                            name="repairStatus"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  Repair Status{" "}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="grid grid-cols-2 gap-4"
                                  >
                                    <FormItem>
                                      <FormControl>
                                        <RadioGroupItem
                                          value="pending"
                                          className="peer sr-only"
                                        />
                                      </FormControl>
                                      <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                        <span className="font-medium">
                                          Pending
                                        </span>
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem>
                                      <FormControl>
                                        <RadioGroupItem
                                          value="completed"
                                          className="peer sr-only"
                                        />
                                      </FormControl>
                                      <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                        <span className="font-medium">
                                          Completed
                                        </span>
                                      </FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {/* Additional fields when repairStatus is completed */}
                          {form.watch("repairStatus") === "completed" && (
                            <RepairCompletedFields form={form} />
                          )}
                        </>
                      )}
                      <FormField
                        control={form.control}
                        name="accessories"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Accessories{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                  <SelectValue placeholder="Select accessories" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="only_charger">
                                  Only Charger (Original)
                                </SelectItem>
                                <SelectItem value="only_box">
                                  Only Box
                                </SelectItem>
                                <SelectItem value="box_and_charger">
                                  Box and Charger Both
                                </SelectItem>
                                <SelectItem value="not_available">
                                  Not Available
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="deviceAge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Device Age <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                  <SelectValue placeholder="Select device age" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="below_3_months">
                                  Below 3 months
                                </SelectItem>
                                <SelectItem value="3_to_6_months">
                                  3 months - 6 months
                                </SelectItem>
                                <SelectItem value="6_to_11_months">
                                  6 months - 11 months
                                </SelectItem>
                                <SelectItem value="above_11_months">
                                  Above 11 months
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {form.watch("deviceAge") === "above_11_months" && (
                        <FormField
                          control={form.control}
                          name="warrantyType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">
                                Warranty Type{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                    <SelectValue placeholder="Select additional warranty" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="brand_warranty">
                                    Brand Warranty
                                  </SelectItem>
                                  <SelectItem value="3_month_xtracover">
                                    3 Month XtraCover Warranty
                                  </SelectItem>
                                  <SelectItem value="not_applicable">
                                    Not Applicable
                                  </SelectItem>
                                  <SelectItem value="5_days_checking">
                                    5 Days checking warranty
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <FormField
                        control={form.control}
                        name="hasGstBill"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Do you have GST valid bill with the same IMEI?{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="grid grid-cols-2 gap-4"
                              >
                                <FormItem>
                                  <FormControl>
                                    <RadioGroupItem
                                      value="available"
                                      className="peer sr-only"
                                    />
                                  </FormControl>
                                  <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                    <span className="font-medium">
                                      Available
                                    </span>
                                  </FormLabel>
                                </FormItem>
                                <FormItem>
                                  <FormControl>
                                    <RadioGroupItem
                                      value="not_available"
                                      className="peer sr-only"
                                    />
                                  </FormControl>
                                  <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                    <span className="font-medium">
                                      Not Available
                                    </span>
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {form.watch("hasGstBill") === "available" && (
                        <FormField
                          control={form.control}
                          name="gstInvoice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">
                                Upload Invoice{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (e) => {
                                        field.onChange(e.target?.result);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <FormField
                        control={form.control}
                        name="boxImeiMatch"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Is Box IMEI and Device IMEI same?{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="grid grid-cols-2 gap-4"
                              >
                                <FormItem>
                                  <FormControl>
                                    <RadioGroupItem
                                      value="yes"
                                      className="peer sr-only"
                                    />
                                  </FormControl>
                                  <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                    <span className="font-medium">Yes</span>
                                  </FormLabel>
                                </FormItem>
                                <FormItem>
                                  <FormControl>
                                    <RadioGroupItem
                                      value="not_available"
                                      className="peer sr-only"
                                    />
                                  </FormControl>
                                  <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                    <span className="font-medium">
                                      Not Available
                                    </span>
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {form.watch("hasGstBill") === "not_available" &&
                        form.watch("boxImeiMatch") === "not_available" && (
                          <>
                            <FormField
                              control={form.control}
                              name="customerProofImage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700">
                                    Customer Photo with ( Device IMEI & ID
                                    Proof){" "}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <ImageUploadField
                                    label=""
                                    name="customerProofImage"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    onRemove={() => field.onChange("")}
                                    onCamera={() => {
                                      setCurrentImageField(
                                        "customerProofImage"
                                      );
                                      setCameraOpen(true);
                                    }}
                                  />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="customerDeclaration"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700">
                                    Upload Declaration
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="file"
                                      accept=".pdf,.jpg,.jpeg,.png"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onload = (e) => {
                                            field.onChange(e.target?.result);
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                      className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                      <div className="mt-4">
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Final Amount <span className="text-red-500">*</span>
                        </FormLabel>
                        <Input
                          type="number"
                          placeholder="Enter Final Amount"
                          value={finalAmount}
                          onChange={(e) => setFinalAmount(e.target.value)}
                          className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {step == 5 && (
                    <>
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Customer Name (Same as ID Proof){" "}
                              <span className="text-red-500">*</span>{" "}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter customer name"
                                className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="mobileNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Enter Mobile No{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <div className="flex gap-2 items-center">
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Enter 10-digit mobile number"
                                  maxLength={10}
                                  className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                  disabled={phoneVerified}
                                />
                              </FormControl>
                              <Button
                                type="button"
                                size="sm"
                                className={`h-10 ${
                                  phoneVerified
                                    ? "bg-green-500 text-white"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                                disabled={phoneVerified || isSendingPhoneOtp}
                                onClick={() => {
                                  const mobileNumber = form.watch("mobileNumber");
                                  if (mobileNumber) {
                                    setPhoneToVerify(mobileNumber);
                                    setOtpDialogOpen(true);
                                  }
                                }}
                              >
                                {phoneVerified ? "Verified" : "Verify"}
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Enter Customer's Address
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <div className="flex gap-2 items-center">
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Enter customer's address"
                                  className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="addressProofType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Select Address Proof*{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="grid grid-cols-2 gap-4"
                              >
                                <FormItem>
                                  <FormControl>
                                    <RadioGroupItem
                                      value="aadhar"
                                      className="peer sr-only"
                                    />
                                  </FormControl>
                                  <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                    <span className="font-medium">
                                      Aadhar Card
                                    </span>
                                  </FormLabel>
                                </FormItem>
                                <FormItem>
                                  <FormControl>
                                    <RadioGroupItem
                                      value="voter_id"
                                      className="peer sr-only"
                                    />
                                  </FormControl>
                                  <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                    <span className="font-medium">
                                      Voter ID
                                    </span>
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("addressProofType") === "aadhar" && (
                        <>
                          <FormField
                            control={form.control}
                            name="aadharFrontImage"
                            render={({ field }) => (
                              <FormItem>
                                <ImageUploadField
                                  label={
                                    <>
                                      Aadhar Front Image{" "}
                                      <span className="text-red-500">*</span>
                                    </>
                                  }
                                  name="aadharFrontImage"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  onRemove={() => field.onChange("")}
                                  onCamera={() => {
                                    setCurrentImageField("aadharFrontImage");
                                    setCameraOpen(true);
                                  }}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="aadharBackImage"
                            render={({ field }) => (
                              <FormItem>
                                <ImageUploadField
                                  label={
                                    <>
                                      Aadhar Back Image{" "}
                                      <span className="text-red-500">*</span>
                                    </>
                                  }
                                  name="aadharBackImage"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  onRemove={() => field.onChange("")}
                                  onCamera={() => {
                                    setCurrentImageField("aadharBackImage");
                                    setCameraOpen(true);
                                  }}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {form.watch("aadharFrontImage") &&
                            form.watch("aadharBackImage") && (
                              <>
                                {isAadharVerified ? (
                                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                      <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                                      <div>
                                        <p className="text-sm font-medium text-green-800">
                                          Aadhar verified successfully!
                                        </p>
                                      </div>
                                    </div>
                                    {/* <Button
                                      variant="outline"
                                      size="sm"
                                      className="mt-3"
                                      onClick={() => {
                                        setIsAadharVerified(false);
                                        setAadharVerificationData(null);
                                      }}
                                    >
                                      Reverify Aadhar
                                    </Button> */}
                                  </div>
                                ) : (
                                  <div className="">
                                    <Label>
                                      Aadhar verification{" "}
                                      <span className="text-red-500">*</span>
                                    </Label>
                                    {/* Desktop and Mobile Aadhar Sheets */}
                                    <div className="space-y-2">
                                      <DesktopAadharSheet
                                        onFormSubmit={handleAadharSuccess}
                                        onFormFail={handleAadharFailure}
                                        triggerText="Verify Aadhar"
                                      />
                                      <MobileAadharSheet
                                        onFormSubmit={handleAadharSuccess}
                                        onFormFail={handleAadharFailure}
                                        triggerText="Verify Aadhar"
                                      />
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                        </>
                      )}

                      {form.watch("addressProofType") === "voter_id" && (
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="voterIdFrontImage"
                            render={({ field }) => (
                              <FormItem>
                                <ImageUploadField
                                  label={
                                    <>
                                      Voter ID Front Image{" "}
                                      <span className="text-red-500">*</span>
                                    </>
                                  }
                                  name="voterIdFrontImage"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  onRemove={() => field.onChange("")}
                                  onCamera={() => {
                                    setCurrentImageField("voterIdFrontImage");
                                    setCameraOpen(true);
                                  }}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="voterIdBackImage"
                            render={({ field }) => (
                              <FormItem>
                                <ImageUploadField
                                  label={
                                    <>
                                      Voter ID Back Image{" "}
                                      <span className="text-red-500">*</span>
                                    </>
                                  }
                                  name="voterIdBackImage"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  onRemove={() => field.onChange("")}
                                  onCamera={() => {
                                    setCurrentImageField("voterIdBackImage");
                                    setCameraOpen(true);
                                  }}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {form.watch("voterIdFrontImage") &&
                            form.watch("voterIdBackImage") && (
                              <>
                                {isVoterVerified ? (
                                  <>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                      <div className="flex items-center">
                                        <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                                        <div>
                                          <p className="text-sm font-medium text-green-800">
                                            Voter verified successfully!
                                          </p>
                                        </div>
                                      </div>
                                      {/* <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
                                        onClick={() => {
                                          setIsVoterVerified(false);
                                          // setVoterIdDetails(null);
                                          setVoterVerificationData(null);
                                        }}
                                      >
                                        Reverify Voter ID
                                      </Button> */}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                      <div className="flex items-center mb-3">
                                        <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
                                        <p className="text-sm text-yellow-800">
                                          Please complete Aadhar verification to
                                          continue.
                                        </p>
                                      </div>

                                      {/* Desktop and Mobile Aadhar Sheets */}
                                      <div className="space-y-2">
                                        <DesktopVoterIdSheet
                                          onFormSubmit={handleVoterSuccess}
                                          onFormFail={handleVoterFailure}
                                          triggerText="Verify Voter ID (Desktop)"
                                        />
                                        <MobileVoterIdSheet
                                          onFormSubmit={handleVoterSuccess}
                                          onFormFail={handleVoterFailure}
                                          triggerText="Verify Voter ID (Mobile)"
                                        />
                                      </div>
                                    </div>
                                  </>
                                )}
                              </>
                            )}
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="customerSignature"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Customer Signature{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <div className="space-y-2">
                              {/* Show preview if signature exists */}
                              {field.value ? (
                                <div className="flex flex-col gap-2 items-start">
                                  <div className="border border-gray-300 rounded-lg overflow-hidden w-40 h-24 bg-white">
                                    <img
                                      src={field.value}
                                      alt="Signature Preview"
                                      className="object-contain w-full h-full"
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="default"
                                    onClick={() =>
                                      setIsSignatureDialogOpen(true)
                                    }
                                  >
                                    E-sign
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  type="button"
                                  variant="default"
                                  onClick={() => setIsSignatureDialogOpen(true)}
                                >
                                  E-sign
                                </Button>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {step == 6 && (
                    <>
                      <div className="mb-4 space-y-3">
                        <h2 className="text-lg md:text-xl font-bold text-blue-600 mb-2 break-words max-w-full truncate md:whitespace-normal md:truncate-none">
                          Payment Details
                        </h2>
                        {/* Payment Mode Tabs */}
                        <div className="flex mb-3 mt-6">
                          <Label>
                            Select Payment Method{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                        </div>
                        <div className="grid grid-cols-subgrid gap-2 mb-8">
                          {["upi", "bank", "exchange", "cash"]
                            .filter(
                              (mode) =>
                                mode !== "cash" ||
                                convertedSellingAmount <= 10000
                            )
                            .map((mode) => (
                              <Button
                                size={"xl"}
                                key={mode}
                                type="button"
                                variant={
                                  paymentMode === mode ? "default" : "outline"
                                }
                                className={`flex-1 min-w-[140px] rounded-md border-2 ${
                                  paymentMode === mode
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "border-blue-500/50 text-black"
                                }`}
                                onClick={() => setPaymentMode(mode as any)}
                              >
                                {mode === "upi" && "UPI Transfer"}
                                {mode === "bank" && "Bank Transfer"}
                                {mode === "exchange" &&
                                  "Exchange (Brand New Mobile)"}
                                {mode === "cash" && "Cash"}
                              </Button>
                            ))}
                        </div>

                        {/* Payment Mode Fields */}
                        {paymentMode === "upi" && (
                          <div className="space-y-2 mt-5">
                            <Label>
                              Enter UPI ID
                              <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="text"
                                readOnly={upiIdSaved}
                                placeholder="Enter UPI ID"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                className=" bg-green-500 text-white h-11 "
                                onClick={handleVerifyUpi}
                                disabled={
                                  !upiId || isVerifyingUpi || upiIdSaved
                                }
                              >
                                <span>
                                  {isVerifyingUpi ? "Verifying..." : "Verify"}
                                </span>
                              </Button>
                            </div>

                            {upiVerifyStatus === "success" && (
                              <>
                                <span className="font-semibold">
                                  Beneficary Name:
                                </span>
                                <div className=" text-green-800 rounded px-4 py-3 mt-2 font-bold text-center text-lg">
                                  {upiData}
                                </div>
                              </>
                            )}
                            {upiVerifyStatus === "fail" && (
                              <span className="text-red-600 font-medium mt-2">
                                Invalid UPI ID
                              </span>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              className="h-11 bg-blue-600 text-white w-full"
                              // onClick={() => setIsUpiQRDialogOpen(true)}
                              disabled={upiIdSaved}
                              onClick={() => {
                                upiVerifyStatus === "success"
                                  ? setUpiIdSaved(true)
                                  : setUpiIdSaved(false);
                              }}
                            >
                              {upiIdSaved ? "UPI ID Saved" : "Save UPI ID"}
                            </Button>
                          </div>
                        )}
                        {paymentMode === "bank" && (
                          <div className="space-y-4">
                            <Label>
                              Enter Bank Details{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            {/* Mobile-friendly bank selection */}
                            <div className="relative">
                              <Input
                                type="text"
                                placeholder="Search Bank..."
                                value={bankSearch}
                                onChange={(e) => setBankSearch(e.target.value)}
                                className="w-full"
                                onFocus={() => setBankSearchOpen(true)}
                                onBlur={() => {
                                  // Delay closing to allow clicking on options
                                  setTimeout(
                                    () => setBankSearchOpen(false),
                                    200
                                  );
                                }}
                              />

                              {/* Bank dropdown */}
                              {bankSearchOpen && (
                                <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                                  {[
                                    "AIRTEL PAYMENTS BANK",
                                    "AU SMALL FINANCE BANK",
                                    "AXIS BANK",
                                    "BANDHAN BANK",
                                    "BANK OF BARODA",
                                    "BANK OF INDIA",
                                    "BANK OF MAHARASHTRA",
                                    "CANARA BANK",
                                    "CATHOLIC SYRIAN BANK",
                                    "CENTRAL BANK OF INDIA",
                                    "CITY UNION BANK",
                                    "CSB BANK",
                                    "DCB BANK",
                                    "DHANLAXMI BANK",
                                    "EQUITAS SMALL FINANCE BANK",
                                    "FEDERAL BANK",
                                    "HDFC BANK",
                                    "ICICI BANK",
                                    "IDBI BANK",
                                    "IDFC FIRST BANK",
                                    "INDIA POST PAYMENTS BANK",
                                    "INDIAN BANK",
                                    "INDIAN OVERSEAS BANK",
                                    "INDUSIND BANK",
                                    "JANA SMALL FINANCE BANK",
                                    "KARNATAKA BANK",
                                    "KARUR VYSYA BANK",
                                    "KOTAK MAHINDRA BANK",
                                    "LAKSHMI VILAS BANK",
                                    "MEHSANA URBAN CO-OPERATIVE BANK",
                                    "NKGSB CO-OPERATIVE BANK",
                                    "PAYTM PAYMENTS BANK",
                                    "PUNJAB & SIND BANK",
                                    "PUNJAB NATIONAL BANK",
                                    "RBL BANK",
                                    "SARASWAT CO-OPERATIVE BANK",
                                    "SHAMRAO VITHAL CO-OPERATIVE BANK",
                                    "SOUTH INDIAN BANK",
                                    "STATE BANK OF INDIA",
                                    "SURYODAY SMALL FINANCE BANK",
                                    "TAMILNAD MERCANTILE BANK",
                                    "THE GUJARAT STATE CO-OPERATIVE BANK",
                                    "THE HALOL MERCANTILE CO-OPERATIVE BANK",
                                    "THE HOWRAH DISTRICT CENTRAL CO-OPERATIVE BANK",
                                    "THE JALGAON DISTRICT CENTRAL CO-OPERATIVE BANK",
                                    "THE KARNATAKA STATE CO-OPERATIVE APEX BANK",
                                    "THE MADURAI DISTRICT CENTRAL CO-OPERATIVE BANK",
                                    "THE MAGADH CENTRAL CO-OPERATIVE BANK",
                                    "THE MAHENDRAGARH CENTRAL CO-OPERATIVE BANK",
                                    "THE MAHOBA URBAN CO-OPERATIVE BANK",
                                    "THE MATTANCHERRY SARVAJANIK CO-OPERATIVE BANK",
                                    "THE MEENACHIL EAST URBAN CO-OPERATIVE BANK",
                                    "THE MUMBAI DISTRICT CENTRAL CO-OPERATIVE BANK",
                                    "THE MUZAFFARPUR CENTRAL CO-OPERATIVE BANK",
                                    "THE NAGPUR DISTRICT CENTRAL CO-OPERATIVE BANK",
                                    "THE NANDED DISTRICT CENTRAL CO-OPERATIVE BANK",
                                    "THE NATIONAL CO-OPERATIVE BANK",
                                    "THE NAVAL DOCKYARD CO-OPERATIVE BANK",
                                    "THE NAWANSHAHR CENTRAL CO-OPERATIVE BANK",
                                    "THE NILAMBUR CO-OPERATIVE URBAN BANK",
                                    "THE NILGIRIS DISTRICT CENTRAL CO-OPERATIVE BANK",
                                    "THE RAJASTHAN STATE CO-OPERATIVE BANK",
                                    "THE TAMILNADU STATE APEX CO-OPERATIVE BANK",
                                    "THE THIRUVANNAMALAI DISTRICT CENTRAL CO-OPERATIVE BANK",
                                    "THE VIRUDHUNAGAR DISTRICT CENTRAL CO-OPERATIVE BANK",
                                    "THE VISAKHAPATNAM CO-OPERATIVE BANK",
                                    "THE WEST BENGAL STATE CO-OPERATIVE BANK",
                                    "UCO BANK",
                                    "UJJIVAN SMALL FINANCE BANK",
                                    "UNION BANK OF INDIA",
                                    "VASAI JANATA SAHAKARI BANK",
                                    "YES BANK",
                                  ]
                                    .filter((bank) =>
                                      bank
                                        .toLowerCase()
                                        .includes(bankSearch.toLowerCase())
                                    )
                                    .map((bank) => (
                                      <button
                                        key={bank}
                                        type="button"
                                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={bankDetailsSaved}
                                        onClick={() => {
                                          setBankName(bank);
                                          setBankSearch(bank);
                                          setBankSearchOpen(false);
                                        }}
                                      >
                                        {bank}
                                      </button>
                                    ))}
                                </div>
                              )}
                            </div>

                            {/* Selected bank display */}
                            {bankName && (
                              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <p className="text-sm font-medium text-blue-800">
                                  Selected: {bankName}
                                </p>
                              </div>
                            )}
                            <Input
                              type="text"
                              placeholder="Account Number"
                              value={accountNumber}
                              readOnly={bankDetailsSaved}
                              onChange={(e) => setAccountNumber(e.target.value)}
                            />
                            <Input
                              type="text"
                              readOnly={bankDetailsSaved}
                              placeholder="Confirm Account Number"
                              value={confirmAccountNumber}
                              onChange={(e) =>
                                setConfirmAccountNumber(e.target.value)
                              }
                            />
                            <div className="flex  gap-2">
                              <Input
                                type="text"
                                readOnly={bankDetailsSaved}
                                placeholder="IFSC Code"
                                value={ifsc}
                                onChange={(e) => setIfsc(e.target.value)}
                              />
                            </div>
                            <Button
                              type="button"
                              className="w-full h-11 bg-green-500 text-white"
                              onClick={async () => {
                                setAccountVerifyStatus("loading");
                                setAccountVerifyError("");
                                setVerifiedBeneficiaryName("");
                                try {
                                  const res = await fetch(
                                    "/api/bank/verify-account",
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        id_number: accountNumber,
                                        ifsc,
                                      }),
                                    }
                                  );
                                  const data = await res.json();
                                  if (
                                    res.ok &&
                                    data &&
                                    data.status_code === 200 &&
                                    data.data &&
                                    data.data.full_name
                                  ) {
                                    setVerifiedBeneficiaryName(
                                      data.data.full_name
                                    );
                                    setAccountVerifyStatus("success");
                                  } else {
                                    setAccountVerifyStatus("fail");
                                    setAccountVerifyError(
                                      data?.message || "Verification failed"
                                    );
                                  }
                                } catch (err: any) {
                                  setAccountVerifyStatus("fail");
                                  setAccountVerifyError(
                                    err?.message || "Verification failed"
                                  );
                                }
                              }}
                              disabled={
                                accountVerifyStatus === "loading" ||
                                !accountNumber ||
                                !ifsc ||
                                bankDetailsSaved
                              }
                            >
                              {accountVerifyStatus === "loading"
                                ? "Verifying..."
                                : "Verify Account"}
                            </Button>

                            {/* Remove Beneficiary Name field */}
                            {/* Add Verify Account button */}

                            {/* Show beneficiary name on success */}
                            {accountVerifyStatus === "success" &&
                              verifiedBeneficiaryName && (
                                <>
                                  <span className="font-semibold">
                                    Beneficary Name:
                                  </span>

                                  <div className=" text-green-800 rounded px-4 py-3 mt-2 font-bold text-center text-lg">
                                    {verifiedBeneficiaryName}
                                  </div>
                                </>
                              )}
                            {/* Show error on fail */}
                            {accountVerifyStatus === "fail" &&
                              accountVerifyError && (
                                <div className="bg-red-100 border border-red-400 text-red-800 rounded px-4 py-3 mt-2 text-center">
                                  {accountVerifyError}
                                </div>
                              )}
                            <Button
                              type="button"
                              variant="outline"
                              className="h-11 bg-blue-600 text-white w-full"
                              disabled={bankDetailsSaved}
                              onClick={() => {
                                accountVerifyStatus === "success"
                                  ? setBankDetailsSaved(true)
                                  : toast.error("Please verify account first");
                              }}
                            >
                              {bankDetailsSaved
                                ? "Bank Details Saved"
                                : "Save Bank Details"}
                            </Button>
                          </div>
                        )}
                        {paymentMode === "exchange" && (
                          <>
                            <div className="space-y-4">
                              <div>
                                <Label>
                                  Select Model (Brand New Mobile){" "}
                                  <span className="text-red-500">*</span>
                                </Label>
                              </div>
                              <Select
                                value={exchangeModel}
                                onValueChange={(value) => {
                                  if (value === "add_new") {
                                    setShowAddModelDialog(true);
                                    setExchangeModel("");
                                  } else {
                                    setExchangeModel(value);
                                  }
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select Model" />
                                </SelectTrigger>
                                <SelectContent>
                                  {exchangeModels.map((model) => (
                                    <SelectItem key={model} value={model}>
                                      {model}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="add_new" className="text-blue-600 font-semibold">
                                    + Add New Model
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <Label>Enter IMEI (Brand New Mobile)</Label>
                              <Input
                                type="text"
                                placeholder="Enter IMEI (Brand New Mobile)"
                                value={exchangeImei}
                                onChange={(e) =>
                                  setExchangeImei(e.target.value)
                                }
                              />
                            </div>
                          </>
                        )}
                        {paymentMode === "cash" && (
                          <FormField
                            control={form.control}
                            name="cashPaymentReceiptImage"
                            render={({ field }) => (
                              <FormItem>
                                <ImageUploadField
                                  label="Cash Payment Receipt"
                                  name="cashPaymentReceiptImage"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  onRemove={() => field.onChange("")}
                                  onCamera={() => {
                                    setCurrentImageField(
                                      "cashPaymentReceiptImage"
                                    );
                                    setCameraOpen(true);
                                  }}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        {/* Payment Status Tabs */}
                        <div className="mt-8">
                          <Label>
                            Payment Status{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3 mb-5">
                          <Button
                            type="button"
                            size={"xl"}
                            variant={
                              paymentStatus === "paid" ? "default" : "outline"
                            }
                            className={`flex-1 min-w-[100px] flex items-center gap-2 rounded-md border-2 ${
                              paymentStatus === "paid"
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-blue-500/50 text-black"
                            }`}
                            onClick={() => setPaymentStatus("paid")}
                          >
                            <CircleCheck className="w-4 h-4 text-green-500" />{" "}
                            Paid
                          </Button>
                          <Button
                            type="button"
                            size={"xl"}
                            variant={
                              paymentStatus === "not_paid"
                                ? "default"
                                : "outline"
                            }
                            className={`flex-1 min-w-[100px] flex items-center gap-2 rounded-md border-2 ${
                              paymentStatus === "not_paid"
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-blue-500/50 text-black"
                            }`}
                            onClick={() => setPaymentStatus("not_paid")}
                          >
                            <X className="w-4 h-4 text-red-500" /> Not Paid
                          </Button>
                          <Button
                            type="button"
                            size={"xl"}
                            variant={
                              paymentStatus === "exchange"
                                ? "default"
                                : "outline"
                            }
                            className={`flex-1 min-w-[100px] flex items-center gap-2 rounded-md border-2 ${
                              paymentStatus === "exchange"
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-blue-500/50 text-black"
                            }`}
                            onClick={() => setPaymentStatus("exchange")}
                          >
                            <Smartphone className="w-4 h-4 text-blue-500" />{" "}
                            Exchange
                          </Button>
                        </div>
                        {/* Payment Status Conditional Fields */}
                        {paymentStatus === "paid" && (
                          <div className="space-y-4">
                            <Label>
                              UTR / RRN No.{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              type="text"
                              placeholder="UTR / RRN No."
                              value={utrNo}
                              maxLength={12}
                              onChange={(e) => setUtrNo(e.target.value)}
                            />
                            <Label>
                              Paid By <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex flex-wrap gap-2 space-y-3">
                              {["Mukesh Rana", "Other"].map((name) => (
                                <Button
                                  key={name}
                                  size={"xl"}
                                  variant={
                                    paymentPaidBy === name
                                      ? "mobitechBlue"
                                      : "outline"
                                  }
                                  className="flex-1 min-w-[100px]"
                                  onClick={() => setPaymentPaidBy(name)}
                                >
                                  {name}
                                </Button>
                              ))}
                            </div>
                            <Label>
                              Purchaser Bank Name{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex flex-wrap gap-2">
                              {["SBI", "Axis"].map((bank) => (
                                <Button
                                  size="xl"
                                  key={bank}
                                  type="button"
                                  variant={
                                    purchaserBank === bank
                                      ? "mobitechBlue"
                                      : "outline"
                                  }
                                  className="flex-1 min-w-[200px]"
                                  onClick={() => setPurchaserBank(bank)}
                                >
                                  {bank === "SBI"
                                    ? "SBI (MOBITECH) XXX8851"
                                    : "Axis (Mukesh) XXX4691"}
                                </Button>
                              ))}
                            </div>
                            <Label>
                              Purchaser Payment Mode{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex flex-wrap gap-2">
                              {[
                                "Phonepe",
                                "G-Pay",
                                "BHIM",
                                "Mobile Banking App",
                              ].map((mode) => (
                                <Button
                                  size={"xl"}
                                  key={mode}
                                  type="button"
                                  variant={
                                    purchaserPaymentMode === mode
                                      ? "mobitechBlue"
                                      : "outline"
                                  }
                                  className="flex-1 min-w-[100px] flex items-center gap-2"
                                  onClick={() => setPurchaserPaymentMode(mode)}
                                >
                                  {mode === "Phonepe" && (
                                    <SiPhonepe size={20} />
                                  )}
                                  {mode === "G-Pay" && (
                                    <SiGooglepay size={20} />
                                  )}
                                  {mode === "BHIM" && <SiBhim size={20} />}
                                  {mode === "Mobile Banking App" && (
                                    <MdAccountBalance size={20} />
                                  )}
                                  {mode}
                                </Button>
                              ))}
                            </div>
                            {/* <Label>Final Amount</Label>
                            <Input
                              type="number"
                              placeholder="Enter Final Amount"
                              value={finalAmount}
                              onChange={(e) => setFinalAmount(e.target.value)}
                            /> */}
                          </div>
                        )}
                        {/* {(paymentStatus === "not_paid" ||
                          paymentStatus === "exchange") && (
                          <div className="space-y-4">
                            <Input
                              type="number"
                              placeholder="Enter Final Amount"
                              value={finalAmount}
                              onChange={(e) => setFinalAmount(e.target.value)}
                            />
                          </div>
                        )} */}
                      </div>
                      {/* After Payment Details */}
                      <div className="space-y-4 mt-6">
                        <div>
                          <Label>Enter Selling Amount</Label>
                        </div>
                        <Input
                          type="number"
                          placeholder="Enter Selling Amount"
                          value={sellingAmount}
                          readOnly
                          onChange={(e) => setSellingAmount(e.target.value)}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="remarks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Remarks <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <textarea
                                {...field}
                                placeholder="Enter any additional remarks or notes about the device..."
                                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md bg-gray-50 focus:border-blue-500 focus:ring-blue-500 resize-none"
                                rows={4}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deviceReset"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Have you reset the device?{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="grid grid-cols-2 gap-4"
                              >
                                <FormItem>
                                  <FormControl>
                                    <RadioGroupItem
                                      value="done"
                                      className="peer sr-only"
                                    />
                                  </FormControl>
                                  <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                    <span className="font-medium">Done</span>
                                  </FormLabel>
                                </FormItem>
                                <FormItem>
                                  <FormControl>
                                    <RadioGroupItem
                                      value="not_done"
                                      className="peer sr-only"
                                    />
                                  </FormControl>
                                  <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-blue-500/50 bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-primary cursor-pointer">
                                    <span className="font-medium">
                                      Not Done
                                    </span>
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("deviceReset") === "done" && (
                        <>
                          <FormField
                            control={form.control}
                            name="deviceStartScreenImage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  Upload Device Start Screen Image{" "}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <ImageUploadField
                                  label=""
                                  name="deviceStartScreenImage"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  onRemove={() => field.onChange("")}
                                  onCamera={() => {
                                    setCurrentImageField(
                                      "deviceStartScreenImage"
                                    );
                                    setCameraOpen(true);
                                  }}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                      {/* UPI QR Dialog */}
                      <Dialog
                        open={isUpiQRDialogOpen}
                        onOpenChange={setIsUpiQRDialogOpen}
                      >
                        <DialogContent className="max-w-md w-full">
                          <DialogHeader>
                            <DialogTitle>Scan UPI QR Code</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-full flex justify-center">
                              <div className="rounded-lg overflow-hidden border border-gray-200 bg-black">
                                <BarcodeScanner
                                  width={300}
                                  height={300}
                                  onUpdate={handleUpiQRScan}
                                  facingMode="environment"
                                />
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                  {/* Stepper Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    {step > 1 && (
                      <Button
                        variant="outline"
                        onClick={() => setStep(step - 1)}
                        className="flex-1 max-md:hidden"
                      >
                        <ArrowLeft className="w-5 h-5 " /> Back
                      </Button>
                    )}
                    {step == 1 && (
                      <Button
                        type="button"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white justify-center "
                        onClick={async () => {
                          let valid = true;

                          if (step === 1) {
                            const fields = ["variant", "imei1", "imei2"];

                            valid = await form.trigger(
                              fields as (keyof VariantForm)[]
                            );
                          }
                          if (valid) setStep(step + 1);
                        }}
                      >
                        <span>Upload Device Image</span> <ArrowRight />
                      </Button>
                    )}
                    {step == 2 && (
                      <Button
                        type="button"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={async () => {
                          let valid = true;

                          if (step === 2) {
                            valid = await form.trigger([
                              "deviceFrontImage",
                              "deviceBackImage",
                            ]);
                          }
                          if (valid) setStep(step + 1);
                        }}
                      >
                        Select Diagnose Method <ArrowRight />
                      </Button>
                    )}
                    {step == 3 && (
                      <Button
                        type="button"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={async () => {
                          let valid = true;

                          if (step === 3) {
                            valid = await form.trigger(["diagnosticsProcess"]);
                          }
                          if (valid) setStep(step + 1);
                        }}
                      >
                        Proceed <ArrowRight />
                      </Button>
                    )}
                    {step == 4 && (
                      <Button
                        type="button"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={async () => {
                          let valid = true;
                          if (step === 4) {
                            if (form.watch("diagnosticsProcess") === "app") {
                              const fieldsToValidate = [
                                "diagnosticsProcess",
                                "qcReport",
                                "screenTouch",
                                "screenSpot",
                                "screenLines",
                                "screenPhysical",
                                "screenDiscolor",
                                "screenBubble",
                                "physicalScratch",
                                "physicalDent",
                                "physicalPanel",
                                "physicalBent",
                                "repairRequired",
                                "accessories",
                                "deviceAge",
                                "hasGstBill",
                                "boxImeiMatch",
                              ];

                              valid = await form.trigger(
                                fieldsToValidate as (keyof VariantForm)[]
                              );

                              if (
                                (valid && form.watch("qcReport") === null) ||
                                form.watch("qcReport") === undefined ||
                                form.watch("qcReport") === ""
                              ) {
                                valid = false;
                                toast.error("QC Report is required");
                                form.setError("qcReport", {
                                  type: "manual",
                                  message: "QC Report is required",
                                });
                              }

                              // Validate final amount
                              if (!finalAmount || finalAmount.trim() === "") {
                                valid = false;
                                toast.error("Final amount is required");
                              }

                              // Add repair status validation if repair is required
                              if (
                                form.watch("repairRequired") === "yes" &&
                                valid
                              ) {
                                if (
                                  form.watch("repairStatus") === null ||
                                  form.watch("repairStatus") === undefined
                                ) {
                                  valid = false;
                                  toast.error("Repair status is required");
                                  form.setError("repairStatus", {
                                    type: "manual",
                                    message: "Repair status is required",
                                  });
                                } else if (
                                  form.watch("repairStatus") === "completed" &&
                                  (
                                    !Array.isArray(form.watch("repairParts")) ||
                                    form.watch("repairParts") === null ||
                                    form.watch("repairParts") === undefined ||
                                    form.watch("repairParts")!.length === 0 ||
                                    form.watch("repairParts")!.every(
                                      (part) => !part.name || part.name === ""
                                    ) ||
                                    form.watch("repairDate") === null ||
                                    form.watch("repairDate") === undefined ||
                                    form.watch("repairDate") === ""
                                  )
                                ) {
                                  valid = false;
                                  toast.error(
                                    "Repair parts and date are required"
                                  );
                                  form.setError("repairParts", {
                                    type: "manual",
                                    message:
                                      "Repair parts and date are required",
                                  });
                                }
                              }

                              // Add warranty type validation if device age is above 11 months
                              if (
                                valid &&
                                form.watch("deviceAge") === "above_11_months" &&
                                (form.watch("warrantyType") === null ||
                                  form.watch("warrantyType") === undefined)
                              ) {
                                valid = false;
                                toast.error("Warranty type is required");
                                form.setError("warrantyType", {
                                  type: "manual",
                                  message: "Warranty type is required",
                                });
                              }

                              // Add GST invoice validation if GST bill is available
                              if (
                                valid &&
                                form.watch("hasGstBill") === "available" &&
                                (form.watch("gstInvoice") === null ||
                                  form.watch("gstInvoice") === undefined)
                              ) {
                                valid = false;
                                toast.error("GST invoice is required");
                                form.setError("gstInvoice", {
                                  type: "manual",
                                  message: "GST invoice is required",
                                });
                              }

                              // Add customer proof and declaration if both GST bill and box IMEI are not available
                              if (
                                valid &&
                                form.watch("hasGstBill") === "not_available" &&
                                form.watch("boxImeiMatch") ===
                                  "not_available" &&
                                (form.watch("customerProofImage") === null ||
                                  form.watch("customerProofImage") ===
                                    undefined ||
                                  form.watch("customerProofImage") === "") &&
                                (form.watch("customerDeclaration") === null ||
                                  form.watch("customerDeclaration") ===
                                    undefined ||
                                  form.watch("customerDeclaration") === "")
                              ) {
                                valid = false;
                              
                                toast.error(
                                  "Customer proof and declaration are required"
                                );
                                form.setError("customerProofImage", {
                                  type: "manual",
                                  message: "Customer proof is required",
                                });
                                form.setError("customerDeclaration", {
                                  type: "manual",
                                  message: "Customer declaration is required",
                                });
                              }
                            } else if (
                              form.watch("diagnosticsProcess") === "manual"
                            ) {
                              const fieldsToValidate = [
                                "diagnosticsProcess",
                                "repairRequired",
                                "accessories",
                                "deviceAge",
                                "hasGstBill",
                                "boxImeiMatch",
                              ];

                              // Add warranty type validation if device age is above 11 months

                              valid = await form.trigger(
                                fieldsToValidate as (keyof VariantForm)[]
                              );
                              // Validate final amount
                              if (!finalAmount || finalAmount.trim() === "") {
                                valid = false;
                                toast.error("Final amount is required");
                              }

                              // Add repair status validation if repair is required
                              if (
                                form.watch("repairRequired") === "yes" &&
                                valid
                              ) {
                                if (
                                  form.watch("repairStatus") === null ||
                                  form.watch("repairStatus") === undefined
                                ) {
                                  valid = false;
                                  toast.error("Repair status is required");
                                  form.setError("repairStatus", {
                                    type: "manual",
                                    message: "Repair status is required",
                                  });
                                } else if (
                                  form.watch("repairStatus") === "completed" &&
                                  (
                                    !Array.isArray(form.watch("repairParts")) ||
                                    form.watch("repairParts") === null ||
                                    form.watch("repairParts") === undefined ||
                                    form.watch("repairParts")!.length === 0 ||
                                    form.watch("repairParts")!.every(
                                      (part) => !part.name || part.name === ""
                                    ) ||
                                    form.watch("repairDate") === null ||
                                    form.watch("repairDate") === undefined ||
                                    form.watch("repairDate") === ""
                                  )
                                ) {
                                  valid = false;
                                  toast.error(
                                    "Repair parts and date are required"
                                  );
                                  form.setError("repairParts", {
                                    type: "manual",
                                    message:
                                      "Repair parts and date are required",
                                  });
                                }
                              }

                              // Add warranty type validation if device age is above 11 months
                              if (
                                valid &&
                                form.watch("deviceAge") === "above_11_months" &&
                                (form.watch("warrantyType") === null ||
                                  form.watch("warrantyType") === undefined)
                              ) {
                                valid = false;
                                toast.error("Warranty type is required");
                                form.setError("warrantyType", {
                                  type: "manual",
                                  message: "Warranty type is required",
                                });
                              }

                              // Add GST invoice validation if GST bill is available
                              if (
                                valid &&
                                form.watch("hasGstBill") === "available" &&
                                (form.watch("gstInvoice") === null ||
                                  form.watch("gstInvoice") === undefined)
                              ) {
                                valid = false;
                                toast.error("GST invoice is required");
                                form.setError("gstInvoice", {
                                  type: "manual",
                                  message: "GST invoice is required",
                                });
                              }

                              // Add customer proof and declaration if both GST bill and box IMEI are not available
                              if (
                                valid &&
                                form.watch("hasGstBill") === "not_available" &&
                                form.watch("boxImeiMatch") ===
                                  "not_available" &&
                                (form.watch("customerProofImage") === null ||
                                  form.watch("customerProofImage") ===
                                    undefined ||
                                  form.watch("customerProofImage") === "") &&
                                (form.watch("customerDeclaration") === null ||
                                  form.watch("customerDeclaration") ===
                                    undefined ||
                                  form.watch("customerDeclaration") === "")
                              ) {
                                valid = false;
                            
                                toast.error(
                                  "Customer proof and declaration are required"
                                );
                                form.setError("customerProofImage", {
                                  type: "manual",
                                  message: "Customer proof is required",
                                });
                                form.setError("customerDeclaration", {
                                  type: "manual",
                                  message: "Customer declaration is required",
                                });
                              }
                            }

                            // Additional validations
                            if (valid) {
                              // Validate final amount
                              if (!finalAmount || finalAmount.trim() === "") {
                                valid = false;
                                toast.error("Final amount is required");
                              }
                            }
                          }
                          if (valid) setStep(step + 1);
                        }}
                      >
                        Proceed <ArrowRight />
                      </Button>
                    )}

                    {step === 5 && (
                      <Button
                        type="button"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={async () => {
                          let valid = true;
                          if (step === 5) {
                            // Base fields that are always required
                            const baseFields = [
                              "address",
                              "customerName",
                              "mobileNumber",
                              "addressProofType",
                              "customerSignature",
                            ];

                            // Get the current addressProofType value
                            const addressProofType =
                              form.getValues("addressProofType");

                            // Determine conditional fields based on addressProofType
                            let conditionalFields: (keyof VariantForm)[] = [];

                            if (addressProofType === "aadhar") {
                              conditionalFields = [
                                "aadharFrontImage",
                                "aadharBackImage",
                                "isAadharVerified",
                              ];
                            } else if (addressProofType === "voter_id") {
                              conditionalFields = [
                                "voterIdFrontImage",
                                "voterIdBackImage",
                                "voterIdVerified",
                              ];
                            }

                            // Combine base fields with conditional fields
                            const fieldsToValidate = [
                              ...baseFields,
                              ...conditionalFields,
                            ] as (keyof VariantForm)[];

                            // Trigger validation for all required fields
                            valid = await form.trigger(fieldsToValidate);

                            // Additional manual validation for verification status
                            if (addressProofType === "aadhar") {
                              const isAadharVerified =
                                form.getValues("isAadharVerified");
                              if (!isAadharVerified) {
                                valid = false;
                                toast.error("Aadhar verification is required");
                                form.setError("isAadharVerified", {
                                  type: "manual",
                                  message: "Aadhar verification is required",
                                });
                              }
                            } else if (addressProofType === "voter_id") {
                              const voterIdVerified =
                                form.getValues("voterIdVerified");
                              if (!voterIdVerified) {
                                valid = false;
                                toast.error(
                                  "Voter ID verification is required"
                                );
                                form.setError("voterIdVerified", {
                                  type: "manual",
                                  message: "Voter ID verification is required",
                                });
                              }
                            }

                            if(!phoneVerified){
                              valid = false;
                              toast.error("Phone verification is required");
                              form.setError("phoneVerified", {
                                type: "manual",
                                message: "Phone verification is required",
                              });
                            }
                          }
                          if (valid) setStep(step + 1);
                        }}
                      >
                        Proceed to Payment
                      </Button>
                    )}

                    {step === 6 && (
                      <>
                        <Button
                          type="button"
                          onClick={async () => {
                            let valid = true;
                            
                            // 1. Validate payment mode
                            if (!paymentMode) {
                              valid = false;
                              toast.error("Please select a payment method");
                            }

                            // 2. Validate payment status
                            if (!paymentStatus) {
                              valid = false;
                              toast.error("Please select payment status");
                            }

                            // 3. Validate final amount for not_paid and exchange status
                            if ((paymentStatus === "not_paid" || paymentStatus === "exchange") && (!finalAmount || finalAmount.trim() === "")) {
                              valid = false;
                              toast.error("Final amount is required");
                            }

                            // 4. Validate payment-specific fields
                            if (valid && paymentMode === "upi") {
                              if (!upiId || !upiIdSaved) {
                                valid = false;
                                toast.error("Please enter and save a valid UPI ID");
                              }
                            }

                            if (valid && paymentMode === "bank") {
                              if (!bankName || !accountNumber || !ifsc || !bankDetailsSaved) {
                                valid = false;
                                toast.error("Please complete and save bank details");
                              }
                            }

                            if (valid && paymentMode === "exchange") {
                              if (!exchangeModel || !exchangeImei) {
                                valid = false;
                                toast.error("Please select exchange model and enter IMEI");
                              }
                            }

                            if (valid && paymentMode === "cash") {
                              if (!form.watch("cashPaymentReceiptImage")) {
                                valid = false;
                                toast.error("Cash payment receipt image is required");
                                form.setError("cashPaymentReceiptImage", {
                                  type: "manual",
                                  message: "Cash payment receipt image is required",
                                });
                              }
                            }

                            // 5. Validate paid status fields
                            if (valid && paymentStatus === "paid") {
                              if (!utrNo || !paymentPaidBy || !purchaserBank || !purchaserPaymentMode) {
                                valid = false;
                                toast.error("Please fill all payment details for paid status");
                              }
                            }

                            // 6. Validate remarks
                            const remarks = form.getValues("remarks");
                            if (!remarks || remarks.trim() === "") {
                              valid = false;
                              toast.error("Remarks are required");
                              form.setError("remarks", {
                                type: "manual",
                                message: "Remarks are required",
                              });
                            }

                            // 7. Validate device reset
                            if (!form.watch("deviceReset")) {
                              valid = false;
                              toast.error("Please select device reset status");
                              form.setError("deviceReset", {
                                type: "manual",
                                message: "Device reset status is required",
                              });
                            }

                            // 8. Validate device start screen image when reset is done
                            if (valid && form.watch("deviceReset") === "done") {
                              if (!form.watch("deviceStartScreenImage")) {
                                valid = false;
                                toast.error("Device start screen image is required after reset");
                                form.setError("deviceStartScreenImage", {
                                  type: "manual",
                                  message: "Device start screen image is required after reset",
                                });
                              }
                            }

                            // If all validations pass, submit the form
                            if (valid) {
                             
                              // Call the handleSubmit function directly with form values
                              const formValues = form.getValues();
                              handleSubmit(formValues);
                            }
                          }}
                          className="bg-green-500 hover:bg-green-500/70 text-white"
                        >
                          Submit
                        </Button>
                      </>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      <ManualDiagnosticsSheet
        open={isManualSheetOpen}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setShowManualCloseWarning(true);
          } else {
            setIsManualSheetOpen(open);
          }
        }}
        showWarning={showManualCloseWarning}
        setShowWarning={setShowManualCloseWarning}
        onDiscard={() => {
          setManualDiagTouched(false);
          setIsManualSheetOpen(false);
          setShowManualCloseWarning(false);
          form.setValue("diagnosticsProcess", "app");
        }}
        onSave={(data: any) => {
     
          form.setValue("manualQcReport", data);
          setIsManualSheetOpen(false);
        }}
      />
      {/* IMEI Scanner starts */}
      <Dialog open={isIMEIQRDialogOpen} onOpenChange={setIsIMEIQRDialogOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Scan IMEI (QR/Barcode)</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <ZXingBarcodeScanner
              onResult={(text: string) => {
                if (imeiScanTarget) {
                  form.setValue(imeiScanTarget, text);
                }
                setIsIMEIQRDialogOpen(false);
              }}
              onError={(err: unknown) => {
                // Optionally show error
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
      {/* IMEI Scanner stops */}
      {/* QR Code Scanner Dialog */}
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Scan QC Report QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {!manualEntry && (
              <>
                <div className="w-full flex justify-center">
                  <div className="rounded-lg overflow-hidden border border-gray-200 bg-black">
                    <BarcodeScanner
                      width={300}
                      height={300}
                      onUpdate={handleQRUpdate}
                      facingMode="environment"
                    />
                  </div>
                </div>
                {qrLoading && <p className="text-blue-500">Loading...</p>}
                {qrError && <p className="text-red-500">{qrError}</p>}
                {qcReportData && (
                  <div className="w-full bg-gray-50 rounded p-2 text-sm text-gray-700 flex items-center gap-2">
                    Fetched Report{" "}
                    <CircleCheck className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-400">Closing...</span>
                  </div>
                )}
              </>
            )}
            {/* Manual Entry Section */}
            {manualEntry && (
              <form
                onSubmit={handleManualSubmit}
                className="w-full flex flex-col gap-4"
              >
                <Input
                  type="text"
                  placeholder="Enter Test ID manually"
                  value={manualTestId}
                  onChange={(e) => setManualTestId(e.target.value)}
                  className="w-full border-blue-500"
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={manualLoading}
                >
                  {manualLoading ? "Fetching..." : "Submit"}
                </Button>
                {qrError && <p className="text-red-500">{qrError}</p>}
                {qcReportData && (
                  <div className="w-full bg-gray-50 rounded p-2 text-sm text-gray-700">
                    Fetched Report{" "}
                    <CircleCheck className="w-4 h-4 text-green-500" />
                  </div>
                )}
              </form>
            )}
            {/* Toggle Manual Entry */}
            <div className="w-full flex flex-col items-center mt-4">
              {!manualEntry ? (
                <button
                  type="button"
                  className="text-blue-600 hover:underline text-sm"
                  onClick={() => setManualEntry(true)}
                >
                  Unable to scan? Enter Manually
                </button>
              ) : (
                <button
                  type="button"
                  className="text-blue-600 hover:underline text-sm"
                  onClick={() => setManualEntry(false)}
                >
                  Back to QR Scan
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Model Dialog */}
      <Dialog open={showAddModelDialog} onOpenChange={setShowAddModelDialog}>
        <DialogContent className="bg-white max-w-sm mx-auto p-6">
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
              Add New Model
            </DialogTitle>
            <p className="text-xs sm:text-sm text-gray-600">
              Enter the name of the new model to add to the exchange list
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="newModelName" className="text-sm font-medium text-gray-700">
                Model Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="newModelName"
                type="text"
                placeholder="e.g., iPhone 15 Pro Max, Samsung Galaxy S24"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                className="w-full mt-1"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModelDialog(false);
                  setNewModelName("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (newModelName.trim()) {
                    // Add the new model to the list
                    setExchangeModels(prev => [...prev, newModelName.trim()]);
                    // Set it as the selected model
                    setExchangeModel(newModelName.trim());
                    // Close dialog and reset
                    setShowAddModelDialog(false);
                    setNewModelName("");
                    toast.success("Model added successfully!");
                  } else {
                    toast.error("Please enter a model name");
                  }
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Model
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RegisterPickup;

const PART_OPTIONS = [
  "Back Panel",
  "Battery",
  "OCA Glass",
  "Combo (Folder)",
  "MIddle Frame",
  "Touch Screen",
  "CHarging port",
  "Camera Lens",
  "Frame Housing",
  "Fingerprint Flex Cable",
  "Front Camera",
  "Back Camera",
  "Power button flex",
  "Back Skin",
  "Chargin Board",
  "Power bottom",
  "Sim Tray",
  "Volume flex",
  "Microphone replace",
  "Ringer (speaker)",
  "Outer Button",
  "OCA Paper",
  "Fingerprint",
  "IC Work",
];

function RepairCompletedFields({ form }: { form: any }) {
  const [parts, setParts] = React.useState([{ name: "", price: "" }]);
  // Date/time state (integrate with form if needed)
  const [repairDate, setRepairDate] = React.useState("");

  // Save to form on change
  React.useEffect(() => {
    form.setValue("repairParts", parts);
    form.setValue("repairDate", repairDate);
  }, [parts, repairDate]);

  return (
    <div className="space-y-4 mt-4">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Repairing Date <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={repairDate}
          onChange={(e) => setRepairDate(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-3">
          Parts Used <sup className="text-red-600">*</sup>
        </label>
        {parts.map((part, idx) => (
          <div
            key={idx}
            className="flex flex-col md:flex-row gap-2 mb-4 items-center "
          >
            <label className="text-xs font-semibold text-gray-600 mb-1 w-full md:w-auto">
              Part {idx + 1}
            </label>
            <Select
              value={part.name}
              onValueChange={(val) => {
                const newParts = [...parts];
                newParts[idx].name = val;
                setParts(newParts);
              }}
            >
              <SelectTrigger className="flex-1 border border-gray-300 rounded px-2 py-2 w-full">
                <SelectValue placeholder="Select Part Name" />
              </SelectTrigger>
              <SelectContent className="max-h-[240px] overflow-y-auto">
                {PART_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="number"
              className="flex-1 border border-gray-300 rounded px-2 py-2 w-full"
              placeholder="Part Price"
              value={part.price}
              onChange={(e) => {
                const newParts = [...parts];
                newParts[idx].price = e.target.value;
                setParts(newParts);
              }}
            />
            {parts.length > 1 && (
              <Button
                variant="destructive"
                type="button"
                className=" px-2 py-1"
                onClick={() => setParts(parts.filter((_, i) => i !== idx))}
              >
                Remove <Trash />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full h-12"
          onClick={() => setParts([...parts, { name: "", price: "" }])}
        >
          Add More Parts <Plus />
        </Button>
      </div>
    </div>
  );
}

// Add this function inside RegisterPickup
