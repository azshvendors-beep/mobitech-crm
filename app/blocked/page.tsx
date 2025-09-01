'use client';

import { Button } from "@/components/ui/button";
import { Ban, ArrowLeft, Mail, Phone, ExternalLink } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TimeBasedBackground } from "@/components/TimeBasedBackground";
import { Suspense } from "react";

function BlockedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'blocked';

  const getBlockedMessage = () => {
    switch (reason) {
      case 'maintenance':
        return {
          title: "Under Maintenance",
          description: "We're currently performing scheduled maintenance to improve our services. Please try again later.",
          icon: "🔧"
        };
      case 'deprecated':
        return {
          title: "Feature Deprecated",
          description: "This feature or page has been deprecated and is no longer available.",
          icon: "📦"
        };
      case 'beta':
        return {
          title: "Closed Beta",
          description: "This feature is currently in closed beta testing. Please check back later.",
          icon: "🚧"
        };
      case 'disabled':
        return {
          title: "Feature Disabled",
          description: "This feature has been temporarily disabled. We apologize for any inconvenience.",
          icon: "⚠️"
        };
      default:
        return {
          title: "Access Blocked",
          description: "This route is currently not accessible. It might be under maintenance, deprecated, or temporarily disabled.",
          icon: "🚫"
        };
    }
  };

  const message = getBlockedMessage();

  return (
    <div className="min-h-screen py-16 px-4 sm:py-24 sm:px-6 lg:px-8 backdrop-blur-sm">
      <div className="max-w-max mx-auto">
        <main className="sm:flex">
          <div className="sm:ml-6">
            <div className="sm:border-l sm:border-white/20 sm:pl-6">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <span className="text-4xl">{message.icon}</span>
                  <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
                    {message.title}
                  </h1>
                </div>
                
                <p className="mt-4 text-base text-white/80 max-w-2xl">
                  {message.description}
                </p>

                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => router.back()}
                    variant="secondary"
                    className="gap-2 bg-white/20 hover:bg-white/30 text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Go Back
                  </Button>
                  
                  <Button
                    asChild
                    variant="secondary"
                    className="gap-2 bg-white/20 hover:bg-white/30 text-white"
                  >
                    <Link href="/">
                      <ExternalLink className="h-4 w-4" />
                      Visit Homepage
                    </Link>
                  </Button>
                </div>

                <div className="mt-8 border-t border-white/20 pt-6">
                  <h3 className="text-sm font-medium text-white/80">Need assistance?</h3>
                  <div className="mt-3 space-y-3">
                    <Button
                      asChild
                      variant="link"
                      className="h-auto p-0 text-white/80 hover:text-white"
                    >
                      <Link href="mailto:developmentazsh@gmail.com" className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        developmentazsh@gmail.com
                      </Link>
                    </Button>
                    <div className="flex items-center text-white/80">
                      <Phone className="h-4 w-4 mr-2" />
                      +91 8918455383
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function BlockedPage() {
  return (
    <TimeBasedBackground>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      }>
        <BlockedContent />
      </Suspense>
    </TimeBasedBackground>
  );
} 