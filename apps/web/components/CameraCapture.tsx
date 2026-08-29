"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  RefreshCw,
  X,
  Check,
  AlertTriangle,
  RotateCw,
  Image as ImageIcon,
  Trash2,
  Lock,
} from "lucide-react";

export interface CapturedPhoto {
  url: string;
  public_id: string;
  originalName: string;
}

interface CameraCaptureProps {
  photos: CapturedPhoto[];
  onPhotoAdded: (photo: CapturedPhoto) => void;
  onPhotoRemoved: (publicId: string) => void;
  maxPhotos?: number;
}

export function CameraCapture({
  photos,
  onPhotoAdded,
  onPhotoRemoved,
  maxPhotos = 3,
}: CameraCaptureProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Start live camera stream
  const startCamera = async (mode: "environment" | "user" = facingMode) => {
    setCameraError(null);
    setCapturedSnapshot(null);

    // Stop existing stream if running
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          "Camera API is not supported in this browser context (requires HTTPS or localhost)."
        );
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError(
          "Camera access denied. Please enable camera permissions in your browser bar to capture incident evidence."
        );
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("No camera hardware detected on this device.");
      } else {
        setCameraError(`Camera initialization error: ${err.message || "Unknown error"}`);
      }
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCapturedSnapshot(null);
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  // Flip camera between front and rear
  const toggleCameraFacing = () => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    startCamera(newMode);
  };

  // Capture frame from video to canvas
  const handleSnapFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setCapturedSnapshot(dataUrl);
    }
  };

  // Upload captured photo to backend Cloudinary endpoint
  const handleConfirmUpload = async () => {
    if (!canvasRef.current || !capturedSnapshot) return;

    setIsUploading(true);
    try {
      const canvas = canvasRef.current;

      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert("Failed to process image capture.");
          setIsUploading(false);
          return;
        }

        const formData = new FormData();
        formData.append("photo", blob, `pawtrack-live-capture-${Date.now()}.jpg`);

        const token = localStorage.getItem("paw_access_token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

        const res = await fetch(`${apiUrl}/uploads/report-photo`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.success && data.data) {
          onPhotoAdded({
            url: data.data.url,
            public_id: data.data.public_id,
            originalName: data.data.originalName || "Live Captured Photo",
          });
          stopCamera();
        } else {
          alert(data.message || "Failed to upload captured photo to media storage.");
        }
        setIsUploading(false);
      }, "image/jpeg", 0.85);
    } catch (err: any) {
      alert("Photo upload error: " + err.message);
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          Live Photo Evidence ({photos.length}/{maxPhotos})
        </label>
        <span className="text-[11px] text-slate-500 font-medium">
          In-browser camera capture
        </span>
      </div>

      {/* Captured Photo Thumbnails */}
      <div className="grid grid-cols-3 gap-3">
        {photos.map((p) => (
          <div
            key={p.public_id}
            className="relative rounded-xl border border-slate-200 overflow-hidden group aspect-video bg-slate-100 shadow-2xs"
          >
            <img
              src={p.url}
              alt="Evidence Capture"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onPhotoRemoved(p.public_id)}
              className="absolute top-1.5 right-1.5 p-1 rounded-md bg-slate-900/70 hover:bg-red-600 text-white transition-colors cursor-pointer"
              title="Remove photo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* Open Camera Trigger Button */}
        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded-xl border-2 border-dashed border-slate-300 hover:border-teal-600 bg-slate-50/70 hover:bg-teal-50/40 p-4 flex flex-col items-center justify-center gap-1.5 text-slate-600 hover:text-teal-900 transition-all cursor-pointer aspect-video"
          >
            <Camera className="w-5 h-5 text-teal-700" />
            <span className="text-xs font-bold">Capture Photo</span>
            <span className="text-[10px] text-slate-400">Live Camera</span>
          </button>
        )}
      </div>

      {/* Live Camera Viewfinder Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 text-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-800 space-y-4 p-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-bold text-white">
                  Live Incident Camera Viewfinder
                </span>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message if Permission Denied */}
            {cameraError ? (
              <div className="p-6 text-center space-y-3 bg-red-950/40 border border-red-800/50 rounded-xl">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
                <p className="text-xs text-red-200 leading-relaxed font-medium">
                  {cameraError}
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => startCamera(facingMode)}
                    className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Retry Camera
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                  >
                    Proceed Without Photo
                  </button>
                </div>
              </div>
            ) : (
              /* Live Viewfinder or Snapshot Preview */
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800">
                  {capturedSnapshot ? (
                    <img
                      src={capturedSnapshot}
                      alt="Captured Evidence Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Hidden Canvas for Frame Extraction */}
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Switch Front/Back Camera Overlay */}
                  {!capturedSnapshot && (
                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors cursor-pointer"
                      title="Switch Camera (Front/Rear)"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Shutter / Confirmation Controls */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  {capturedSnapshot ? (
                    <>
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => setCapturedSnapshot(null)}
                        className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                      >
                        Retake Photo
                      </button>
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={handleConfirmUpload}
                        className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-teal-900/30 cursor-pointer"
                      >
                        {isUploading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading to Cloud...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Accept & Attach Photo</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSnapFrame}
                      className="p-4 rounded-full bg-white hover:bg-slate-200 text-slate-900 shadow-xl transition-transform active:scale-95 flex items-center justify-center cursor-pointer border-4 border-slate-800 ring-2 ring-white/50"
                      title="Take Snapshot"
                    >
                      <div className="w-6 h-6 rounded-full bg-teal-800" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
