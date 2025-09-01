import Image from "next/image";
import { FormLabel } from "../ui/form";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "../ui/button";
import React from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

function isMobileDevice() {
    if (typeof navigator === "undefined") return false;
    return /iPhone|iPad|Android|Mobile/i.test(navigator.userAgent);
  }

// Helper to get IST datetime string
function getISTDateTimeString() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 3600000 * 5.5);
  return ist.toLocaleString("en-IN", { hour12: false });
}

export const ImageUploadField = ({
    label,
    name,
    value,
    onChange,
    onRemove,
    onCamera,
    onGallery,
    disabled = false,
  }: {
    label: React.ReactNode | string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    onRemove: () => void;
    onCamera?: (croppedImage: string) => void; // made optional and receives cropped image
    onGallery?: (croppedImage: string) => void; // made optional and receives cropped image
    disabled?: boolean;
  }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const cameraInputRef = React.useRef<HTMLInputElement>(null);
  
    // Crop dialog state
    const [cropDialogOpen, setCropDialogOpen] = React.useState(false);
    const [cropImage, setCropImage] = React.useState<string | null>(null);
    const [crop, setCrop] = React.useState<any>({ unit: "%", width: 80 });
    const [completedCrop, setCompletedCrop] = React.useState<any>(null);
    const imgRef = React.useRef<HTMLImageElement | null>(null);
    const [cropping, setCropping] = React.useState(false);
    const [originalValue, setOriginalValue] = React.useState<string>("");
    // Track which action triggered the crop (camera/gallery)
    const [cropSource, setCropSource] = React.useState<null | "camera" | "gallery">(null);

    // When user selects/captures an image, open crop dialog
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>, source: "camera" | "gallery") => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setCropImage(ev.target?.result as string);
          setCropDialogOpen(true);
          setOriginalValue(value); // Save current value in case of cancel
          setCropSource(source);
        };
        reader.readAsDataURL(file);
      }
    };
  
    // Crop image to base64 with IST datetime watermark
    const getCroppedImg = async (): Promise<string | null> => {
      if (!imgRef.current || !completedCrop?.width || !completedCrop?.height) return null;
      const image = imgRef.current;
      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );
      // Add IST datetime watermark
      const stamp = getISTDateTimeString();
      ctx.font = "bold 16px Arial";
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillRect(canvas.width - 210, canvas.height - 30, 210, 28);
      ctx.fillStyle = "#fff";
      ctx.fillText(stamp, canvas.width - 10, canvas.height - 10);
      return canvas.toDataURL("image/jpeg");
    };
  
    // Handle crop submit
    const handleCropSubmit = async () => {
      setCropping(true);
      const cropped = await getCroppedImg();
      if (cropped) {
        onChange(cropped);
        if (cropSource === "camera" && onCamera) {
          onCamera(cropped);
        } else if (cropSource === "gallery" && onGallery) {
          onGallery(cropped);
        }
      }
      setCropping(false);
      setCropDialogOpen(false);
      setCropImage(null);
      setCropSource(null);
    };
  
    // Handle crop cancel
    const handleCropCancel = () => {
      setCropDialogOpen(false);
      setCropImage(null);
      setCropSource(null);
      // Restore previous value (do nothing)
    };
  
    const handleCameraClick = () => {
      if (cameraInputRef.current) {
        cameraInputRef.current.value = ""; // reset input
        cameraInputRef.current.click();
      }
    };

    const handleGalleryClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // reset input
        fileInputRef.current.click();
      }
    };
  
    // Responsive dialog style
    const dialogContentClass =
      typeof window !== "undefined" && window.innerWidth < 640
        ? "w-screen h-screen max-w-none max-h-none p-0"
        : "max-w-md w-full";
  
    return (
      <div className="space-y-2">
        <FormLabel className="text-sm font-medium text-gray-700">
          {label}
        </FormLabel>
        <div className="relative aspect-[3/4] border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
          {value ? (
            <div className="relative h-full">
              <Image src={value} alt={label as string} fill className="object-cover" />
              <button
                type="button"
                onClick={onRemove}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
              <Camera className="h-8 w-8 text-gray-400" />
              <div className="flex gap-2 flex-col">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCameraClick}
                  className="w-[150px] md:hidden"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Camera
                </Button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  name={name}
                  onChange={e => handleFile(e, "camera")}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  name={name}
                  onChange={e => handleFile(e, "gallery")}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleGalleryClick}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Gallery
                </Button>
              </div>
            </div>
          )}
        </div>
        {/* Crop Dialog */}
        <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
          <DialogContent className={dialogContentClass}>
            <DialogHeader>
              <DialogTitle>Crop Image</DialogTitle>
            </DialogHeader>
            {cropImage && (
              <div className="flex flex-col items-center gap-4 h-full w-full justify-center">
                <div className="flex items-center justify-center w-full h-full max-h-[400px] max-w-[320px] mx-auto">
                  <ReactCrop
                    crop={crop}
                    onChange={setCrop}
                    onComplete={setCompletedCrop}
                    className="w-full h-full"
                  >
                    <img
                      ref={imgRef}
                      src={cropImage}
                      alt="Crop"
                      style={{ maxHeight: 400, maxWidth: 320, width: "100%", objectFit: "contain", display: "block", margin: "0 auto" }}
                      onLoad={() => setCrop({ unit: "%", width: 80 })}
                    />
                  </ReactCrop>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCropCancel}
                    disabled={cropping}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCropSubmit}
                    disabled={cropping || !completedCrop?.width || !completedCrop?.height}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {cropping ? "Cropping..." : "Submit"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  };