import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "../ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "../ui/form";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, CircleX, RefreshCcw } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";

// Zod schema for the Aadhar verification form
const aadharFormSchema = z.object({
  aadharNumber: z
    .string()
    .min(12, "Aadhar number must be 12 digits")
    .max(12, "Aadhar number must be 12 digits")
    .regex(/^\d{12}$/, "Aadhar number must contain only digits"),
  captcha: z.string().min(1, "Captcha is required"),
  fullName: z.string().optional(),
  phoneNumber: z.string().optional(),
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

type AadharFormData = z.infer<typeof aadharFormSchema>;
type AadharDataType = {
  profile_image?: string;
  full_name: string;
  gender: string;
  dob: string;
  aadhaar_number?: string;
  address: {
    house?: string;
    street?: string;
    loc?: string;
    vtc?: string;
    dist?: string;
    state?: string;
    country?: string;
  };
};

interface MobileAadharSheetProps {
  onFormSubmit?: (data: {
    formData: AadharFormData;
    aadharDetails: AadharDataType | null;
  }) => void;
  onFormFail?: () => void;
  triggerText?: string;
  initialData?: Partial<AadharFormData>;
}

const MobileAadharSheet = ({
  onFormSubmit,
  onFormFail,
  triggerText = "Open Aadhar Verification",
  initialData = {},
}: MobileAadharSheetProps) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isOpen, setIsOpen] = useState(false);
  const totalSteps = 4;
  const [captchaText, setCaptchaText] = useState<string>("");
  const [aadharRequestId, setAadharRequestId] = useState("");
  const [aadharOtpSent, setIsAadharOtpSent] = useState(false);
  const [aadharOTPSending, setAadharOTPSending] = useState(false);
  const [aadharDetails, setAadharDetails] = useState<any>(null);
  const [aadharOTPVerificationPassed, setAadharOTPVerificationPassed] =
    useState(false);
  const [aadharDataLoading, setAadharDataLoading] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);
  const isFormDirty = () => {
    const values = form.getValues();
    return (
      values.aadharNumber !== "" ||
      values.captcha !== "" ||
      values.fullName !== "" ||
      values.phoneNumber !== "" ||
      values.otp !== "" ||
      currentStep > 1
    );
  };
  // Initialize form with Zod schema
  const form = useForm<AadharFormData>({
    resolver: zodResolver(aadharFormSchema),
    defaultValues: {
      aadharNumber: "",
      captcha: "",
      fullName: "",
      phoneNumber: "",
      otp: "",
      ...initialData,
    },
    mode: "onChange",
  });

  // Generate a random 5-character captcha
  const generateCaptcha = () => {
    let uniqueChar = "";
    const randomchar =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 5; i++) {
      uniqueChar += randomchar.charAt(
        Math.floor(Math.random() * randomchar.length)
      );
    }
    setCaptchaText(uniqueChar);
  };

  useEffect(() => {
    if (currentStep === 2) {
      generateCaptcha();
    }
  }, [currentStep]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form to initial values
      form.reset({
        aadharNumber: "",
        captcha: "",
        fullName: "",
        phoneNumber: "",
        otp: "",
        ...initialData, // Restore any initial data if provided
      });

      // Reset all component state
      setCurrentStep(1);
      setCaptchaText("");
      setAadharRequestId("");
      setIsAadharOtpSent(false);
      setAadharOTPSending(false);
      setAadharDetails(null);
      setAadharOTPVerificationPassed(false);
      setAadharDataLoading(false);

      // Clear any form errors
      form.clearErrors();
    }
  };
  // Handle form submission success
  const handleFormSuccess = () => {
    const formData = form.getValues();
    onFormSubmit?.({
      formData,
      aadharDetails,
    });
    setIsOpen(false);
  };

  // Handle form submission failure
  const handleFormFailure = () => {
    onFormFail?.();
    setIsOpen(false);
  };

  // Render step-specific form fields
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <FormField
            control={form.control}
            name="aadharNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-gray-500">
                  Aadhar Number
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your 12-digit Aadhar number"
                    className="font-sans mt-3 border-gray-500/60 focus-visible:border-blue-500 focus-visible:outline-1 focus-visible:outline-blue-500 focus-visible:ring-0 h-12"
                    {...field}
                    maxLength={12}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 2:
        return (
          <div>
            {/* Captcha Display */}
            <div className="mb-4 text-center border border-gray-500/70 rounded-lg p-4">
              <p className="font-medium text-gray-700 mb-4">
                Captcha Verification
              </p>
              <div
                className="mx-auto my-2 py-1 px-4 rounded border border-gray-400 select-none font-mono text-lg bg-gray-100"
                style={{ width: "fit-content" }}
              >
                {captchaText}
              </div>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={generateCaptcha}
              >
                <RefreshCcw className="w-4 h-4 mr-1" /> Refresh Captcha
              </Button>
            </div>
            {/* Captcha Input Field */}
            <FormField
              control={form.control}
              name="captcha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-gray-500">
                    Enter Captcha
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter captcha text"
                      className="font-sans mt-3 border-gray-500/60 focus-visible:border-blue-500 focus-visible:outline-1 focus-visible:outline-blue-500 focus-visible:ring-0 h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Verified Message */}
            {form.watch("captcha") === captchaText &&
              form.watch("captcha") !== "" && (
                <p className="text-green-600 text-sm font-medium mt-2">
                  ✅ Captcha Verified!
                </p>
              )}
          </div>
        );

      case 3:
        return (
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-gray-500">
                  An otp has been sent to your mobile number registered with
                  your Aadhar number
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter the 6-digit OTP"
                    className="font-sans mt-3 text-center border-gray-500/60 focus-visible:border-blue-500 focus-visible:outline-1 focus-visible:outline-blue-500 focus-visible:ring-0 h-12"
                    {...field}
                    maxLength={6}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 4:
        return aadharDataLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            {aadharDetails ? (
              <div className="space-y-6">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 text-sm rounded mb-4 font-semibold text-center">
                  Please match aadhar details with physical copy
                </div>
                <div className="bg-gray-50 rounded-lg p-4 md:p-6 space-y-6">
                  {aadharDetails.profile_image && (
                    <div className="flex justify-center">
                      <div className="w-28 h-36 md:w-32 md:h-36 border border-gray-600/50">
                        <img
                          src={`data:image/jpeg;base64,${aadharDetails.profile_image}`}
                          alt="Aadhar Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <p className="text-xs md:text-sm text-gray-500">
                          Full Name:
                        </p>
                        <p className="font-medium text-sm md:text-base">
                          {aadharDetails.full_name}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs md:text-sm text-gray-500">
                          Address Details:
                        </p>
                        <p className="text-sm md:text-base whitespace-pre-wrap">
                          {[
                            aadharDetails.address.house,
                            aadharDetails.address.street,
                            aadharDetails.address.loc,
                            aadharDetails.address.vtc,
                            aadharDetails.address.dist,
                            aadharDetails.address.state,
                            aadharDetails.address.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>

                      <div className="flex justify-between">
                        <div className="space-y-1">
                          <p className="text-xs md:text-sm text-gray-500">
                            Gender:
                          </p>
                          <p className="font-medium text-sm md:text-base">
                            {aadharDetails.gender === "M" ? "Male" : "Female"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs md:text-sm text-gray-500">
                            Date of Birth:
                          </p>
                          <p className="font-medium text-sm md:text-base">
                            {aadharDetails.dob}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                No Aadhar data available. Please try again later.
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  const handleProceed = async () => {
    switch (currentStep) {
      case 1:
        const isAadharValid = await form.trigger("aadharNumber");
        if (isAadharValid) {
          setCurrentStep(2);
        }
        break;

      case 2:
        const captchaValid =
          form.watch("captcha") === captchaText && form.watch("captcha") !== "";
        if (!captchaValid) {
          form.setError("captcha", {
            type: "manual",
            message: "Please enter the correct captcha",
          });
          return;
        }

        if (aadharOtpSent) {
          // OTP already sent, just move to next step
          setCurrentStep(3);
          return;
        }

        // Send OTP
        try {
          setAadharOTPSending(true);
          const res = await fetch(`/api/aadhar/generate-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_number: form.getValues("aadharNumber") }),
          });
          const data = await res.json();

          if (res.ok && data.status_code === 200 && data.request_id) {
            setAadharRequestId(data.request_id);
            setIsAadharOtpSent(true);
            toast.success("OTP sent successfully!");
            setCurrentStep(3);
          } else if (data.status_code === 402) {
            toast.error("Balance exhausted 402. Please check and try again.");
          } else {
            toast.error("Failed to generate OTP. Please try again.");
          }
        } catch (error) {
          toast.error("Failed to generate OTP. Please try again.");
        } finally {
          setAadharOTPSending(false);
        }
        break;

      case 3:
        const isOtpValid = await form.trigger("otp");
        if (!isOtpValid) return;

        if (aadharOTPVerificationPassed && aadharDetails) {
          // Already verified, just move to next step
          setCurrentStep(4);
          return;
        }

        // Verify OTP
        try {
          setAadharDataLoading(true);
          const res = await fetch("/api/aadhar/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              request_id: aadharRequestId,
              otp: form.getValues("otp"),
            }),
          });
          const data = await res.json();

          if (res.ok && data.status_code === 200 && data.data) {
            setAadharDetails(data.data);
            setAadharOTPVerificationPassed(true);
            toast.success("OTP verified successfully!");
            setCurrentStep(4);
          } else {
            toast.error("Invalid OTP. Please try again.");
          }
        } catch (error) {
          toast.error("Failed to verify OTP. Please try again.");
        } finally {
          setAadharDataLoading(false);
        }
        break;

      default:
        break;
    }
  };
  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
          <Button className="mt-4 max-md:w-full bg-green-500 text-white">
            {triggerText}
          </Button>
        </SheetTrigger>
        <SheetContent
          className="w-full rounded-t-lg max-sm:h-[95vh] font-sans flex flex-col"
          side="bottom"
        >
          <SheetHeader>
            <SheetTitle className="text-xl">
              Step {currentStep} of {totalSteps}
            </SheetTitle>
          </SheetHeader>

          <Form {...form}>
            <form className="flex-1 flex flex-col">
              {/* Step Content */}
              <div className="mt-1 px-4 flex-1 overflow-y-auto">
                {renderStepContent()}
              </div>

              {/* Bottom Navigation */}
              {currentStep <= totalSteps - 1 && (
                <div className="bg-white p-4 border-t flex justify-between items-center">
                  <Button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="flex items-center gap-1 h-12 w-1/3 border-blue-500 border text-blue-500 bg-white hover:bg-blue-50"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={handleProceed}
                    disabled={aadharOTPSending}
                    className="flex items-center gap-1 w-1/3 h-12 bg-blue-500 hover:bg-blue-600"
                  >
                    Proceed
                    <ChevronRight size={16} />
                  </Button>
                </div>
              )}

              {currentStep === totalSteps && (
                <div className="bg-white px-4 pt-4 pb-7 border-t flex w-full justify-between items-center">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleFormFailure}
                    className="flex items-center gap-1 h-12 w-1/4 "
                  >
                    <CircleX size={16} />
                    Fail
                  </Button>
                  <Button
                    type="button"
                    onClick={handleFormSuccess}
                    className="flex items-center gap-1 h-12 w-1/4 bg-blue-600 hover:bg-blue-600"
                  >
                    Pass
                    <ChevronRight size={16} />
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileAadharSheet;
