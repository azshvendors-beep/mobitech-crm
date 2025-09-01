import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, FileText, X, MessageCircle, CheckCircle } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

export function AadharSheet({
  open,
  onOpenChange,
  form,
  aadharVerified,
  isVerifyingAadhar,
  aadharData,
  isLoadingAadharData,
  aadharOtpInput,
  setAadharOtpInput,
  verifyAadhar,
  verifyAadharOTP,
  handleAadharVerification,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any;
  aadharVerified: boolean;
  isVerifyingAadhar: boolean;
  aadharData: any;
  isLoadingAadharData: boolean;
  aadharOtpInput: string;
  setAadharOtpInput: (v: string) => void;
  verifyAadhar: () => Promise<void>;
  verifyAadharOTP: () => Promise<void>;
  handleAadharVerification: (status: "pass" | "fail") => void;
}) {
  const [step, setStep] = useState(1);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Reset step and timer when sheet is opened/closed
  useEffect(() => {
    if (open) {
      setStep(1);
      setResendTimer(30);
      setCanResend(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [open]);

  // Move to step 3 if aadharData is set after OTP
  useEffect(() => {
    if (aadharData) setStep(3);
  }, [aadharData]);

  // Start timer when entering step 2
  useEffect(() => {
    if (step === 2) {
      setResendTimer(30);
      setCanResend(false);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] md:h-full w-full p-0 md:max-w-md overflow-y-auto"
      >
        <SheetHeader className="sticky top-0 bg-white z-10 p-6 md:p-6 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center space-x-2 text-xl">
              <FileText className="w-5 h-5" />
              <span>Aadhar Verification</span>
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </SheetHeader>
        <div className="flex flex-col h-[calc(100%-80px)]">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {step === 1 && (
              <FormField
                control={form.control}
                name="aadharNumber"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Aadhar Number
                    </FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input
                          {...field}
                          maxLength={12}
                          className="h-12"
                          placeholder="Enter 12-digit Aadhar number"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        onClick={async () => {
                          await verifyAadhar();
                          setStep(2);
                        }}
                        disabled={
                          !field.value ||
                          field.value.length !== 12 ||
                          isVerifyingAadhar
                        }
                        className="h-12"
                      >
                        {isVerifyingAadhar ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify"
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {step === 2 && (
              <div className="space-y-8 py-4">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <MessageCircle className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg md:text-xl">
                      Enter OTP
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base mt-2">
                      Please enter the OTP sent to your registered mobile
                      number
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={aadharOtpInput}
                    onChange={(e) => setAadharOtpInput(e.target.value)}
                    className=" h-12 "
                  />
                  <Button
                    onClick={async () => {
                      await verifyAadharOTP();
                      // If aadharData is set, step will auto-advance to 3
                    }}
                    className="w-full h-12 text-base "
                    disabled={!aadharOtpInput || aadharOtpInput.length !== 6}
                  >
                    Verify OTP
                  </Button>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!canResend}
                      onClick={async () => {
                        await verifyAadhar();
                        setResendTimer(30);
                        setCanResend(false);
                        if (timerRef.current) clearInterval(timerRef.current);
                        timerRef.current = setInterval(() => {
                          setResendTimer((prev) => {
                            if (prev <= 1) {
                              if (timerRef.current) clearInterval(timerRef.current);
                              setCanResend(true);
                              return 0;
                            }
                            return prev - 1;
                          });
                        }, 1000);
                      }}
                    >
                      Resend OTP
                    </Button>
                    {!canResend && (
                      <span className="text-xs text-gray-500">
                        Resend in {resendTimer}s
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
            {step === 3 && aadharData && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 md:p-6 space-y-6">
                  {aadharData.profile_image && (
                    <div className="flex justify-center">
                      <div className="w-28 h-36 md:w-32 md:h-36   border-4 border-blue-200">
                        <img
                          src={`data:image/jpeg;base64,${aadharData.profile_image}`}
                          alt="Aadhar Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-base md:text-lg">
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 bg-white p-3 rounded-lg border">
                        <p className="text-xs md:text-sm text-gray-500">
                          Full Name
                        </p>
                        <p className="font-medium text-sm md:text-base">
                          {aadharData.full_name}
                        </p>
                      </div>
                      <div className="space-y-1 bg-white p-3 rounded-lg border">
                        <p className="text-xs md:text-sm text-gray-500">
                          Gender
                        </p>
                        <p className="font-medium text-sm md:text-base">
                          {aadharData.gender === "M" ? "Male" : "Female"}
                        </p>
                      </div>
                      <div className="space-y-1 bg-white p-3 rounded-lg border">
                        <p className="text-xs md:text-sm text-gray-500">
                          Date of Birth
                        </p>
                        <p className="font-medium text-sm md:text-base">
                          {aadharData.dob}
                        </p>
                      </div>
                      <div className="space-y-1 bg-white p-3 rounded-lg border">
                        <p className="text-xs md:text-sm text-gray-500">
                          Aadhar Number
                        </p>
                        <p className="font-medium text-sm md:text-base">
                          {aadharData.aadhaar_number}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-base md:text-lg">
                      Address Details
                    </h4>
                    <div className="bg-white rounded-lg p-3 md:p-4 border">
                      <p className="text-sm md:text-base whitespace-pre-wrap">
                        {[
                          aadharData.address.house,
                          aadharData.address.street,
                          aadharData.address.loc,
                          aadharData.address.vtc,
                          aadharData.address.dist,
                          aadharData.address.state,
                          aadharData.address.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t bg-white p-4 md:p-6">
                  <div className="flex gap-4 max-w-md mx-auto">
                    <Button
                      variant="destructive"
                      onClick={() => handleAadharVerification("fail")}
                      className="flex-1 h-11 md:h-12 text-sm md:text-base"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleAadharVerification("pass")}
                      className="flex-1 h-11 md:h-12 text-sm md:text-base bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {isLoadingAadharData && step !== 3 && (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p>Loading...</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 