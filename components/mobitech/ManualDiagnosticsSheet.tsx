import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronLeftCircle, ChevronRight, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function generateTestId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
function getISTDateTime() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 3600000 * 5.5);
  return ist.toISOString();
}

const screenSpotOptions = [
  "Very Heavy or Large Spot",
  "No spot on screen",
  "3 or more than 3 spots",
  "2 or less than 2 spots (Small Spot)",
  "Colored spots / Colored Patches",
];
const screenPhysicalOptions = [
  "Excellent",
  "Minor scratches / normal signs of usage",
  "Heavy scratches",
  "Screen cracked or glass broken",
  "Single Line Crack",
  "Screen Scuffed",
];
const screenDiscolorOptions = [
  "No discoloration",
  "Light Yellow / blue / pink /green color on corner",
  "Discoloration on display corner",
  "Screen fading ( Colors / background imprint on full screen  )",
];
const screenBubbleOptions = [
  "Minor paint peel off / bubble",
  "Major paint peel off / bubble",
  "No Issues",
];
const batteryOptions = [
  "Working fine",
  "Battery Faulty or Low Backup",
  "Battery Buldge",
  "Battery in Service",
  "Battery less than 85%",
  "Battery more than 85%",
];
const copyScreenOptions = [
  "Phone doesn't have copy screen",
  "Phone has copy screen",
];
const simOptions = [
  "Both SIM are working",
  "Not working",
  "Single SIM Working",
];
const physicalScratchOptions = [
  "No Scratches",
  "Minor Scratches",
  "Heavy Scratches",
  "Minor paint peel off",
  "Major paint peel off",
];
const physicalDentOptions = [
  "No Dents",
  "Minor Dents ( 1 or 2 small)",
  "Major Dents ( More than 3 ) ",
];
const physicalPanelOptions = [
  "No Defect in Panel",
  "Loose Panel / Visible pasting",
  "Cracked and Broken Panel",
  "Glass Back Panel damaged",
];
const physicalBentOptions = [
  "Phone not bent",
  "Loose screen",
  "Bent panel ",
];

const tabOptions = (opts: string[], value: string, setValue: (v: string) => void) => (
  <div className="grid grid-cols-2 gap-2 my-2">
    {opts.map((opt) => (
      <Button
        key={opt}
        type="button"
        variant={value === opt ? "default" : "outline"}
        className={`w-full h-12 text-sm md:text-base lg:text-lg rounded-lg border-2 font-medium transition-all duration-150 ${
          value === opt ? "bg-blue-500 text-white border-blue-500" : "border-blue-500/50 text-gray-700 bg-gray-50"
        }`}
        onClick={() => setValue(opt)}
      >
        {opt}
      </Button>
    ))}
  </div>
);

const LOCAL_STORAGE_KEY = "manualDiagnosticsSheetState";

const ManualDiagnosticsSheet: React.FC<any> = ({
  open,
  onOpenChange,
  showWarning,
  setShowWarning,
  onDiscard,
  onSave,
}) => {
  // Default state
  const defaultForm = {
    testId: generateTestId(),
    istDate: getISTDateTime(),
    // Step 1
    screenTouch: "",
    screenSpot: "",
    screenLines: "",
    screenPhysical: "",
    screenDiscolor: "",
    screenBubble: "",
    // Step 2
    frontCamera: "",
    backCamera: "",
    audioJack: "",
    wifi: "",
    gps: "",
    bluetooth: "",
    volumeButton: "",
    flashLight: "",
    fcImageBlurred: "",
    bcImageBlurred: "",
    vibrator: "",
    battery: "",
    speaker: "",
    microphone: "",
    fingerprint: "",
    proximity: "",
    chargingPort: "",
    powerButton: "",
    faceLock: "",
    copyScreen: "",
    sim: "",
    // Step 3
    physicalScratch: "",
    physicalDent: "",
    physicalPanel: "",
    physicalBent: "",
  };

  // Try to restore from localStorage
  const [form, setForm] = useState<any>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.form || defaultForm;
        } catch {
          return defaultForm;
        }
      }
    }
    return defaultForm;
  });
  const [step, setStep] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return typeof parsed.step === "number" ? parsed.step : 0;
        } catch {
          return 0;
        }
      }
    }
    return 0;
  });

  // Save to localStorage on form or step change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ form, step })
      );
    }
  }, [form, step]);

  // Clear localStorage on discard
  const handleDiscard = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    setForm(defaultForm);
    setStep(0);
    if (onDiscard) onDiscard();
  };

  // Step fields
  const stepFields = [
    [
      // Step 1: Screen Condition
      {
        label: "Screen Touch Calibration",
        type: "tab",
        options: ["Working", "Not working"],
        key: "screenTouch",
      },
      {
        label: "Screen Display Spot",
        type: "dropdown",
        options: screenSpotOptions,
        key: "screenSpot",
      },
      {
        label: "Screen Display Lines",
        type: "tab",
        options: ["Lines on Display", "No Lines on Display"],
        key: "screenLines",
      },
      {
        label: "Screen Physical Condition",
        type: "dropdown",
        options: screenPhysicalOptions,
        key: "screenPhysical",
      },
      {
        label: "Screen Discoloration",
        type: "dropdown",
        options: screenDiscolorOptions,
        key: "screenDiscolor",
      },
      {
        label: "Screen Bubble or Paint",
        type: "dropdown",
        options: screenBubbleOptions,
        key: "screenBubble",
      },
    ],
    [
      // Step 2: Functional Problems
      { label: "Front Camera", type: "tab", options: ["Working", "Not working"], key: "frontCamera" },
      { label: "Back Camera", type: "tab", options: ["Working", "Not working"], key: "backCamera" },
      { label: "Audio Jack", type: "tab", options: ["Working", "Not working"], key: "audioJack" },
      { label: "Wifi", type: "tab", options: ["Working", "Not working"], key: "wifi" },
      { label: "GPS", type: "tab", options: ["Working", "Not working"], key: "gps" },
      { label: "Bluetooth", type: "tab", options: ["Working", "Not working"], key: "bluetooth" },
      { label: "Volume Button", type: "tab", options: ["Working", "Not working"], key: "volumeButton" },
      { label: "Flash Light", type: "tab", options: ["Working", "Not working"], key: "flashLight" },
      { label: "FC Image Blurred", type: "tab", options: ["No Issues", "Yes"], key: "fcImageBlurred" },
      { label: "BC Image Blurred", type: "tab", options: ["No Issues", "Yes"], key: "bcImageBlurred" },
      { label: "Vibrator", type: "tab", options: ["Working", "Not working"], key: "vibrator" },
      { label: "Battery", type: "dropdown", options: batteryOptions, key: "battery" },
      { label: "Speaker", type: "tab", options: ["Working", "Not working"], key: "speaker" },
      { label: "Microphone", type: "tab", options: ["Working", "Not working"], key: "microphone" },
      { label: "Fingerprint Touch Sensor", type: "tab", options: ["Working", "Not working", "Not Available"], key: "fingerprint" },
      { label: "Proximity Sensor", type: "tab", options: ["Working", "Not working"], key: "proximity" },
      { label: "Charging Port", type: "tab", options: ["Working", "Not working"], key: "chargingPort" },
      { label: "Power Button", type: "tab", options: ["Working", "Not working", "Missing"], key: "powerButton" },
      { label: "Face Lock / Face ID", type: "tab", options: ["Working", "Not working", "Not Available"], key: "faceLock" },
      { label: "Copy Screen", type: "dropdown", options: copyScreenOptions, key: "copyScreen" },
      { label: "Sim", type: "tab", options: ["Both SIM are working", "Not working", "Single SIM Working"], key: "sim" },
    ],
    [
      // Step 3: Phone's Overall Condition
      { label: "Physical Condition (Scratch)", type: "dropdown", options: physicalScratchOptions, key: "physicalScratch" },
      { label: "Physical Condition (Dent)", type: "dropdown", options: physicalDentOptions, key: "physicalDent" },
      { label: "Physical Condition (Panel)", type: "dropdown", options: physicalPanelOptions, key: "physicalPanel" },
      { label: "Physical Condition (Bent)", type: "dropdown", options: physicalBentOptions, key: "physicalBent" },
    ],
  ];
  const stepHeaders = [
    "Screen Condition",
    "Functional Problems",
    "Phone's Overall Condition",
  ];
  // Validation: all fields in current step must be filled
  const currentFields = stepFields[step];
  const canGoNext = currentFields.every(f => form[f.key]);
  const canGoBack = step > 0;
  const canSave = step === 2 && canGoNext;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="w-full h-[100vh] max-w-full p-0 md:max-w-full md:h-[100vh] flex flex-col"
          style={{ maxHeight: '100vh', height: '100vh' }}
        >
          {/* Only show the active step header */}
          <div className="sticky top-0 z-20 bg-white p-4 border-b flex items-center justify-between">
              {canGoBack && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="text-blue-600 border-blue-500/50"><ChevronLeft /></Button>
              )}

            <div className="text-lg font-bold text-black">{stepHeaders[step]}</div>
            <div className="flex gap-2">
              {step == 0 && (
                 <Button
                 variant="destructive"
                 onClick={handleDiscard}
               >
                 Discard
               </Button>
              )}
              {step < 2 && (
                <Button variant="outline" onClick={() => canGoNext && setStep(step + 1)} disabled={!canGoNext} className="text-blue-600 border-blue-500/50"><ChevronRight /></Button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <form className="space-y-6">
              {currentFields.map(field => (
                <div key={field.key} className="mb-6">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">{field.label} <span className="text-red-500">*</span></Label>
                  {field.type === "tab"
                    ? tabOptions(field.options, form[field.key], v => setForm((f: any) => ({ ...f, [field.key]: v })) )
                    : (
                      <Select value={form[field.key]} onValueChange={v => setForm((f: any) => ({ ...f, [field.key]: v }))}>
                        <SelectTrigger className="w-full bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-base text-gray-800">
                          <SelectValue placeholder={`Select ${field.label}`} />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-50">
                          {field.options.map((opt: string) => (
                            <SelectItem key={opt} value={opt} className="text-base text-gray-800 ">
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                </div>
              ))}
              {canSave && (
                <Button type="button" className="w-full bg-blue-500 text-white mt-6 h-12 text-base rounded-lg" onClick={() => onSave(form)}>
                  Save
                </Button>
              )}
            </form>
          </div>
        </SheetContent>
      </Sheet>
      {/* Warning Dialog for closing Manual Diagnostics Sheet */}
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Discard Manual Diagnostics?</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-gray-700">
            Are you sure you want to discard all manual diagnostics data? This action cannot be undone and diagnostics process will be set to App.
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowWarning(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDiscard}
            >
              Discard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManualDiagnosticsSheet; 