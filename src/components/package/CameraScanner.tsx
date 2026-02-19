import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { hasPagePermission } from "../../utils/helperFunction";
import { Barcode, Camera, CameraOff, Zap, X } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface CameraScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: string) => void;
}

export function CameraScanner({ onScan, onError }: CameraScannerProps) {
  const user = useSelector((state: any) => state?.user);
  const userPermissions = user?.permissions || [];

  // Permission check
  const canEdit = hasPagePermission("package", "edit", userPermissions);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment",
  );
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [error, setError] = useState<string>("");
  const [lastScannedCode, setLastScannedCode] = useState<string>("");
  const [scanDelay, setScanDelay] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionLoopRef = useRef<number | null>(null);

  // Check HTTPS early
  const isHttpsRequired =
    window.location.protocol !== "https:" &&
    window.location.hostname !== "localhost";

  // Stop camera function (defined before useEffect)
  const stopCamera = () => {
    if (detectionLoopRef.current) {
      cancelAnimationFrame(detectionLoopRef.current);
      detectionLoopRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
    setIsVideoReady(false);
    setLastScannedCode("");
  };

  // Cleanup on unmount - MUST be called before any early returns
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Early returns AFTER all hooks
  if (!canEdit) {
    return (
      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center'>
        <CameraOff className='h-12 w-12 text-yellow-600 mx-auto mb-3' />
        <h3 className='text-lg font-semibold text-yellow-800 mb-2'>
          Permission Required
        </h3>
        <p className='text-yellow-700'>
          You don't have permission to use the barcode scanner.
          <br />
          Please contact your administrator for "Package: Edit" permission.
        </p>
      </div>
    );
  }

  // Load available cameras
  const loadCameras = async () => {
    try {
      // First request permission
      const permissionStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      // Stop the permission stream immediately
      permissionStream.getTracks().forEach((track) => track.stop());

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );
      setDevices(videoDevices);

      if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to access camera";
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      setError("");
      setIsVideoReady(false);

      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Mobile-friendly constraints
      let constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
        },
      };

      // Add deviceId only if it's set and not on mobile
      if (
        selectedDeviceId &&
        !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      ) {
        constraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            deviceId: { exact: selectedDeviceId },
          },
        };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      console.log(
        "Camera stream obtained:",
        stream.getVideoTracks().length,
        "video tracks",
      );
      console.log(
        "Video track settings:",
        stream.getVideoTracks()[0]?.getSettings(),
      );

      // Set video source BEFORE trying to play
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for loadedmetadata event before playing
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error("Video element not found"));
            return;
          }

          const handleMetadata = () => {
            console.log("Video metadata loaded");
            videoRef.current?.removeEventListener(
              "loadedmetadata",
              handleMetadata,
            );
            resolve();
          };

          const handleError = (e: Event) => {
            console.error("Video error during load:", e);
            videoRef.current?.removeEventListener("error", handleError);
            reject(new Error("Video failed to load"));
          };

          videoRef.current.addEventListener("loadedmetadata", handleMetadata);
          videoRef.current.addEventListener("error", handleError);

          // Trigger load
          videoRef.current.load();
        });

        // Now play the video
        try {
          await videoRef.current.play();
          console.log("Video playing successfully");
          setIsVideoReady(true);
        } catch (playError) {
          console.error("Play error:", playError);
          throw new Error("Failed to play video stream");
        }
      }

      // Try to enable torch if requested (after stream is active)
      if (torchEnabled) {
        try {
          const track = stream.getVideoTracks()[0];
          const capabilities = track.getCapabilities?.();
          // @ts-ignore - torch is not in standard types
          if (capabilities?.torch) {
            // @ts-ignore
            await track.applyConstraints({ advanced: [{ torch: true }] });
            console.log("Torch enabled");
          } else {
            console.warn("Torch not supported on this device");
            setTorchEnabled(false);
          }
        } catch (torchErr) {
          console.warn("Torch not supported:", torchErr);
          setTorchEnabled(false);
        }
      }

      setIsCameraActive(true);

      // Start barcode detection loop
      detectionLoopRef.current = requestAnimationFrame(detectBarcode);
    } catch (err) {
      console.error("Camera start error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start camera";
      setError(errorMessage);
      setIsCameraActive(false);
      setIsVideoReady(false);
      onError?.(errorMessage);
    }
  };

  // Detect barcode using ZXing
  const detectBarcode = async () => {
    if (!isCameraActive || !videoRef.current || !isVideoReady) {
      if (isCameraActive) {
        detectionLoopRef.current = requestAnimationFrame(detectBarcode);
      }
      return;
    }

    if (scanDelay > 0) {
      const now = Date.now();
      if (now - scanDelay < 2000) {
        detectionLoopRef.current = requestAnimationFrame(detectBarcode);
        return;
      } else {
        setScanDelay(0);
      }
    }

    try {
      // Dynamically import ZXing to avoid SSR issues
      const { BrowserMultiFormatReader } = await import("@zxing/library");

      const reader = new BrowserMultiFormatReader();

      // Use decodeFromVideoElement
      const result = await reader.decodeFromVideoElement(videoRef.current);

      if (result && result.getText()) {
        const code = result.getText();

        // Prevent duplicate scans
        if (code !== lastScannedCode) {
          console.log("Barcode detected:", code);
          setLastScannedCode(code);
          setScanDelay(Date.now());

          // Play beep sound
          playBeep();

          // Vibrate on mobile
          if ("vibrate" in navigator) {
            navigator.vibrate(200);
          }

          // Trigger scan callback
          onScan(code);

          // Reset after delay
          setTimeout(() => {
            setLastScannedCode("");
            setScanDelay(0);
          }, 2000);
        }
      }
    } catch (err) {
      // No barcode detected in this frame, continue scanning
    }

    // Continue detection loop
    if (isCameraActive) {
      detectionLoopRef.current = requestAnimationFrame(detectBarcode);
    }
  };

  // Play beep sound
  const playBeep = () => {
    try {
      const audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (err) {
      console.error("Failed to play beep:", err);
    }
  };

  // Toggle camera
  const toggleCamera = async () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      await loadCameras();
      await startCamera();
    }
  };

  // Switch camera (front/back)
  const switchCamera = async () => {
    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacingMode);
    if (isCameraActive) {
      stopCamera();
      await new Promise((resolve) => setTimeout(resolve, 200));
      await startCamera();
    }
  };

  // Toggle torch
  const toggleTorch = async () => {
    const newTorchState = !torchEnabled;
    setTorchEnabled(newTorchState);
    if (isCameraActive) {
      stopCamera();
      await new Promise((resolve) => setTimeout(resolve, 200));
      await startCamera();
    }
  };

  // Early return for HTTPS check (after hooks)
  if (isHttpsRequired) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
        <CameraOff className='h-12 w-12 text-red-600 mx-auto mb-3' />
        <h3 className='text-lg font-semibold text-red-800 mb-2'>
          HTTPS Required
        </h3>
        <p className='text-red-700'>
          Camera access requires HTTPS. Please access this page via a secure
          connection.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Camera Controls */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Badge variant={isCameraActive ? "default" : "secondary"}>
            {isCameraActive ? "Camera Active" : "Camera Inactive"}
          </Badge>
          {devices.length > 1 && (
            <span className='text-sm text-gray-500'>
              {devices.length} cameras available
            </span>
          )}
        </div>
        <Button
          onClick={toggleCamera}
          variant={isCameraActive ? "destructive" : "default"}
          size='sm'>
          {isCameraActive ? (
            <>
              <CameraOff className='h-4 w-4 mr-2' />
              Stop Camera
            </>
          ) : (
            <>
              <Camera className='h-4 w-4 mr-2' />
              Start Camera
            </>
          )}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <div className='flex items-start justify-between'>
            <div className='flex items-start gap-3'>
              <X className='h-5 w-5 text-red-600 mt-0.5' />
              <div>
                <h4 className='font-semibold text-red-800'>Camera Error</h4>
                <p className='text-sm text-red-700 mt-1'>{error}</p>
              </div>
            </div>
            <Button variant='ghost' size='sm' onClick={() => setError("")}>
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}

      {/* Camera View */}
      {isCameraActive && (
        <div
          className='relative bg-black rounded-lg overflow-hidden'
          style={{ minHeight: "400px", maxHeight: "600px" }}>
          <video
            ref={videoRef}
            className='w-full h-full object-cover'
            autoPlay
            playsInline
            muted
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          {/* Loading indicator */}
          {!isVideoReady && (
            <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50'>
              <div className='text-white text-center'>
                <Camera className='h-12 w-12 mx-auto mb-2 animate-pulse' />
                <p>Loading camera...</p>
              </div>
            </div>
          )}

          {/* Scanning Overlay */}
          {isVideoReady && (
            <div className='absolute inset-0 pointer-events-none'>
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='w-64 h-64 border-4 border-green-500 rounded-lg relative'>
                  {/* Corner markers */}
                  <div className='absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400' />
                  <div className='absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400' />
                  <div className='absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400' />
                  <div className='absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400' />

                  {/* Scanning line animation */}
                  <div className='absolute inset-0 bg-gradient-to-b from-transparent via-green-400 to-transparent opacity-50 animate-[scan_2s_ease-in-out_infinite]' />
                </div>
              </div>
            </div>
          )}

          {/* Torch Button */}
          {isVideoReady && (
            <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2'>
              {devices.length > 1 && (
                <Button variant='secondary' size='sm' onClick={switchCamera}>
                  <Camera className='h-4 w-4 mr-2' />
                  Switch Camera
                </Button>
              )}
              <Button
                variant={torchEnabled ? "default" : "secondary"}
                size='sm'
                onClick={toggleTorch}>
                <Zap className='h-4 w-4 mr-2' />
                {torchEnabled ? "Torch On" : "Torch Off"}
              </Button>
            </div>
          )}

          {/* Last Scanned Code */}
          {lastScannedCode && (
            <div className='absolute top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2'>
              <Barcode className='h-4 w-4' />
              <span className='font-mono font-semibold'>{lastScannedCode}</span>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!isCameraActive && !error && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <h4 className='font-semibold text-blue-900 mb-2'>How to Scan</h4>
          <ul className='text-sm text-blue-800 space-y-1'>
            <li>• Click "Start Camera" to begin scanning</li>
            <li>• Position the barcode within the green frame</li>
            <li>• Hold steady until the barcode is detected</li>
            <li>• The scanner will beep and vibrate on success</li>
            <li>• Use torch in low-light conditions</li>
          </ul>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(240px);
          }
        }
      `}</style>
    </div>
  );
}
