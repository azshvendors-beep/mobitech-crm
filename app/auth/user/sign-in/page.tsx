"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, FileX, Loader2 } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { motion } from "framer-motion";
import { FloatingCrystals } from "@/components/3d/FloatingCrystals";
import {
  AnimatedForm,
  AnimatedFormItem,
} from "@/components/animations/AnimatedForm";

const formSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(10, "Phone number must not exceed 10 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useSession();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      setMfaError(null);
      // Step 1: Validate credentials
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: values.phone, password: values.password }),
      });
      if (!res.ok) {
        throw new Error("Invalid credentials");
      }
      const data = await res.json();
      setUserId(data.userId);
      // Step 2: Check if MFA is enabled
      const mfaRes = await fetch("/api/mfa/check", { method: "GET" });
      const mfaData = await mfaRes.json();
      if (mfaData.isMfaEnabled) {
        setMfaRequired(true);
        setLoading(false);
        return;
      }
      // If not, proceed with normal login
      await login(values.phone, values.password);
    } catch (error) {
      console.error("Login error:", error);
      form.setError("root", {
        message: "Invalid phone number or password",
      });
      setLoading(false);
    }
  }

  async function 
  handleMfaVerify() {
    if (!userId || mfaCode.length !== 6) {
      setMfaError("Please enter a valid 6-digit code");
      return;
    }
    setLoading(true);
    setMfaError(null);
    try {
      const res = await fetch("/api/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token: mfaCode }),
      });
      const data = await res.json();
      if (!data.success) {
        setMfaError(data.message || "Invalid code");
        setLoading(false);
        return;
      }
      // MFA verified, complete login
      await login(form.getValues("phone"), form.getValues("password"));
    } catch (error) {
      setMfaError("Failed to verify MFA");
    } finally {
      setLoading(false);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-tl from-blue-600 font-sans to-blue-500 overflow-hidden">
      <div className="relative w-full max-w-md px-4">
        <AnimatedForm>
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                Welcome back
              </h2>
              <p className="text-white/60">Sign in to your account</p>
            </motion.div>
          </div>

          {!mfaRequired ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <AnimatedFormItem>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="1234567890"
                            {...field}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/40"
                          />
                        </FormControl>
                        <FormMessage className="text-pink-300" />
                      </FormItem>
                    )}
                  />
                </AnimatedFormItem>

                <AnimatedFormItem>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/40 pr-10"
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-white/10 text-white/60 hover:text-white"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <FormMessage className="text-pink-300" />
                      </FormItem>
                    )}
                  />
                </AnimatedFormItem>

                {form.formState.errors.root && (
                  <AnimatedFormItem>
                    <div className="text-sm text-pink-300 text-center">
                      {form.formState.errors.root.message}
                    </div>
                  </AnimatedFormItem>
                )}

                <AnimatedFormItem>
                  <Button
                    type="submit"
                    className="w-full bg-white/10 hover:bg-white/20  text-white border border-white/20 backdrop-blur-sm "
                    disabled={loading}
                  >
                    {loading ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center"
                      >
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </motion.div>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </AnimatedFormItem>
              </form>
            </Form>
          ) : (
            <form onSubmit={e => { e.preventDefault(); handleMfaVerify(); }} className="space-y-6">
              <div>
                <label className="block text-white mb-2">Enter 2FA Code</label>
                <input
                  type="text"
                  placeholder="000000"
                  value={mfaCode}
                  onChange={e => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/40 text-center text-xl tracking-widest w-full rounded-md py-3"
                  maxLength={6}
                  disabled={loading}
                />
                {mfaError && (
                  <div className="text-sm text-pink-300 text-center mt-2">{mfaError}</div>
                )}
              </div>
              <div>
                <Button
                  type="submit"
                  className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm "
                  disabled={loading || mfaCode.length !== 6}
                >
                  {loading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center"
                    >
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </motion.div>
                  ) : (
                    "Verify & Sign in"
                  )}
                </Button>
              </div>
            </form>
          )}
        </AnimatedForm>
      </div>
    </div>
  );



}









// Styles.js


