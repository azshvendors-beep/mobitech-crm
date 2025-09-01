"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { INDIAN_STATES, storeSchema } from "@/constants/const";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Loader2,
  MessageCircle,
  X,
  XCircle,
  CheckCircle,
} from "lucide-react";
import React, { useState } from "react";
import { Control, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const AddExchangeStore = () => {
  const [isSubmittingStoreData, setIsSubmittingStoreData] = useState(false);
  const [isOTPSheetOpen, setOTPSheetOpen] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const formSchema = storeSchema;
  type StoreFormData = z.infer<typeof storeSchema>;

  const form = useForm<StoreFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "Exchange Store",
      password: "",
      storeName: "",
      address: {
        city: "",
        pinCode: "",
        state: "",
        streetAddress: "",
        country: "India",
      },
      ownerName: "",
      ownerPhone: "",
      ownerEmail: "",
    },
  });

  const onSubmit = async (values: StoreFormData) => {
    console.log("Form is valid:", values);
    setIsSubmittingStoreData(true);
try {
      const isValid = await form.trigger();
    if (!isValid) {
      console.error("Form validation failed");
      setIsSubmittingStoreData(false);
      console.log("Form errors:", form.formState.errors);
      return;
    }
    // {
    //   // Handle store registration
    const storeData = values as StoreFormData;

    //   // Send data to API with the generated storeId
    const response = await fetch("/api/stores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...storeData,
      }),
    });

    const result = await response.json();

    if (response.status === 409) {
      toast.error(
        result.error || "Store with this phone number already exists"
      );
    } else if (response.status === 201) {
      toast.success(
        `Store registered successfully! Store ID: ${result.storeId}`
      );

      form.reset();
   
    }
  } catch (error) {
    console.error("Error occurred while registering store:", error);
    toast.error("Failed to register store");

  } finally {
    setIsSubmittingStoreData(false);
  };
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto max-w-4xl space-y-6 max-sm:px-2">
        {/* Heading */}
        <div className="text-start space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Add New Exchange Store
          </h1>
          <p className="text-gray-600 max-sm:text-sm">
            Complete the form to register a new exchange store
          </p>
        </div>
        <Card className="p-8 bg-white/80 backdrop-blur-sm border-white shadow-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-6 h-6 text-green-500" />
                  <h3 className="text-xl font-bold text-gray-900">
                    Store Details
                  </h3>
                </div>
                <FormField
                  control={form.control as unknown as Control<StoreFormData>}
                  name="storeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Store Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="h-12"
                          placeholder="Enter store name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Store Address</h4>
                  <FormField
                    control={form.control as unknown as Control<StoreFormData>}
                    name="address.streetAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-12"
                            placeholder="Enter complete street address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={
                        form.control as unknown as Control<StoreFormData>
                      }
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-12"
                              placeholder="Enter city name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={
                        form.control as unknown as Control<StoreFormData>
                      }
                      name="address.pinCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PIN Code</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-12"
                              placeholder="Enter 6-digit PIN code"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={
                        form.control as unknown as Control<StoreFormData>
                      }
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 w-full">
                                <SelectValue placeholder="Select a state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60">
                              {INDIAN_STATES.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control as unknown as Control<StoreFormData>}
                    name="ownerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-12"
                            placeholder="Enter owner's full name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as unknown as Control<StoreFormData>}
                    name="ownerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            {...field}
                            className="h-12"
                            placeholder="Enter owner's email address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as unknown as Control<StoreFormData>}
                    name="ownerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-12"
                            placeholder="Enter 10-digit phone number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control as unknown as Control<StoreFormData>}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          className="h-12"
                          placeholder="Enter password (min 8 chars)"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end pt-8 border-t">
                <Button
                  type="submit"
                  // onClick={() => {
                  //   onSubmit(form.getValues());
                  // }}
                  className="h-10 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isSubmittingStoreData}
                >
                  {isSubmittingStoreData ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    "Submit Registration"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
      {/* OTP Sheet for phone verification (if needed) */}
      {/* <Sheet open={isOTPSheetOpen} onOpenChange={setOTPSheetOpen}>
        <SheetContent side="right" className="max-w-xs w-full px-4">
          <SheetHeader>
            <SheetTitle>Verify Phone Number</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              maxLength={6}
              onChange={(e) => setOtp(e.target.value)}
              className="h-12 text-lg tracking-widest text-center"
              autoFocus
            />
            {otpError && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <XCircle className="w-4 h-4" /> {otpError}
              </div>
            )}
            <Button
              className="w-full"
              onClick={async () => {
                setIsVerifyingOtp(true);
                setOtpError(null);
                await new Promise((r) => setTimeout(r, 700));
                if (otp === "123456") {
                  setIsPhoneVerified(true);
                  setOTPSheetOpen(false);
                  setOtpError(null);
                } else {
                  setOtpError("Invalid OTP. Please try again.");
                }
                setIsVerifyingOtp(false);
              }}
              disabled={otp.length !== 6 || isVerifyingOtp}
            >
              {isVerifyingOtp ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                "Submit"
              )}
            </Button>
            <div className="text-xs text-muted-foreground text-center">
              (Use 123456 as OTP for demo)
            </div>
          </div>
        </SheetContent>
      </Sheet> */}
    </div>
  );
};

export default AddExchangeStore;
