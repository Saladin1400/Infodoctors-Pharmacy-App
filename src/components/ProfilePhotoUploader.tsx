import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, Upload, X, RefreshCw, Check, AlertCircle, Image as ImageIcon, 
  Trash2, User, SwitchCamera, Sparkles, ShieldCheck, Video
} from "lucide-react";
import { PatientProfile } from "../types";

interface ProfilePhotoUploaderProps {
  patient: PatientProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSavePhoto: (photoDataUrl: string) => void;
}

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop"
];

export const ProfilePhotoUploader: React.FC<ProfilePhotoUploaderProps> = ({
  patient,
  isOpen,
  onClose,
  onSavePhoto
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'preset'>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(patient?.profilePhotoUrl || null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync capturedImage when patient prop changes
  useEffect(() => {
    if (patient?.profilePhotoUrl) {
      setCapturedImage(patient.profilePhotoUrl);
    }
  }, [patient?.profilePhotoUrl]);

  // Clean up camera stream when modal closes or unmounts
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 640 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setIsCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError("تم رفض الإذن بالوصول للكاميرا. يرجى تفعيل صلاحية الكاميرا من إعدادات المتصفح أو رفع صورة من الجهاز.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError("لم يتم العثور على كاميرا متصلة بالجهاز. يمكنك رفع صورة ملتقطة سابقاً.");
      } else {
        setCameraError("تعذر تشغيل الكاميرا المباشرة. يمكنك تجربة رفع صورة من جهازك.");
      }
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // Toggle Camera Mode (Front/Back)
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    if (isCameraActive) {
      startCamera();
    }
  };

  // Capture frame from video onto canvas
  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (context && video.videoWidth > 0 && video.videoHeight > 0) {
      // Make a square crop
      const size = Math.min(video.videoWidth, video.videoHeight);
      canvas.width = size;
      canvas.height = size;

      const startX = (video.videoWidth - size) / 2;
      const startY = (video.videoHeight - size) / 2;

      context.drawImage(video, startX, startY, size, size, 0, 0, size, size);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  // Handle File Upload from device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert("حجم الملف كبير جداً. يرجى اختيار صورة أقل من 8 ميجابايت.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setCapturedImage(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Final Selection
  const handleSave = () => {
    if (capturedImage) {
      onSavePhoto(capturedImage);
      stopCamera();
      onClose();
    }
  };

  // Remove photo (reset to default initials)
  const handleRemovePhoto = () => {
    setCapturedImage("");
    onSavePhoto("");
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 font-sans text-right" style={{ direction: "rtl" }}>
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold border border-teal-500/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">تخصيص الصورة الشخصية</h3>
              <p className="text-[10.5px] text-slate-400">التقط صورة مباشرة بالكاميرا أو اختر صورة من جهازك</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1.5 border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('camera');
              startCamera();
            }}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'camera' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>كاميرا مباشرة 📸</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('upload');
              stopCamera();
            }}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'upload' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>رفع صورة 📁</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('preset');
              stopCamera();
            }}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'preset' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>نماذج جاهزة 🎨</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* TAB 1: LIVE CAMERA CAPTURE */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              {cameraError ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                  <p className="text-xs font-bold text-rose-800">{cameraError}</p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                  >
                    الانتقال لرفع صورة من الجهاز 📁
                  </button>
                </div>
              ) : (
                <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-square flex items-center justify-center border-2 border-slate-800 shadow-inner">
                  {/* Hidden Canvas for Frame Capture */}
                  <canvas ref={canvasRef} className="hidden" />

                  {isCameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  ) : capturedImage ? (
                    <img
                      src={capturedImage}
                      alt="Captured Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-slate-500 text-center space-y-2">
                      <Video className="w-8 h-8 mx-auto animate-bounce text-slate-400" />
                      <p className="text-xs font-bold">انقر فوق "تشغيل الكاميرا" للبدء</p>
                    </div>
                  )}

                  {/* Top Live Camera Bar overlay */}
                  {isCameraActive && (
                    <div className="absolute top-3 right-3 left-3 flex justify-between items-center z-10">
                      <span className="bg-rose-600 text-white text-[9.5px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                        بث مباشر LIVE
                      </span>

                      <button
                        onClick={toggleFacingMode}
                        className="bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full border border-slate-700 transition-all cursor-pointer"
                        title="تبديل الكاميرا الأمامية/الخلفية"
                      >
                        <SwitchCamera className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Camera Action Buttons */}
              <div className="flex gap-2">
                {!isCameraActive ? (
                  <button
                    onClick={startCamera}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>تشغيل الكاميرا المباشرة</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCaptureSnapshot}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer animate-pulse"
                  >
                    <Camera className="w-4 h-4" />
                    <span>التقاط لقطة شاشة للصورة 📸</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FILE UPLOAD FROM DEVICE */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-teal-500 bg-slate-50 hover:bg-teal-50/30 rounded-2xl p-6 text-center transition-all cursor-pointer space-y-2 group"
              >
                <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-all">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">اختر صورة من جهازك المحمول أو الحاسوب</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">يدعم JPG, PNG, WEBP (حجم أقصى 8 ميجابايت)</p>
                </div>
              </div>

              {capturedImage && (
                <div className="flex items-center space-x-3 space-x-reverse bg-teal-50 border border-teal-200 p-2.5 rounded-xl">
                  <img
                    src={capturedImage}
                    alt="Uploaded preview"
                    className="w-12 h-12 rounded-xl object-cover border border-teal-300"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-teal-900 block">تم تحميل المعاينة بنجاح</span>
                    <span className="text-[10px] text-teal-700">يمكنك اعتماد هذه الصورة الآن للملف</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AVATAR PRESET GALLERY */}
          {activeTab === 'preset' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 font-bold">اختر رمزاً شخصياً افتراضياً مصمماً بعناية:</p>
              <div className="grid grid-cols-5 gap-2">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCapturedImage(preset)}
                    className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all cursor-pointer hover:scale-105 ${
                      capturedImage === preset ? 'border-teal-600 ring-2 ring-teal-400' : 'border-slate-200'
                    }`}
                  >
                    <img src={preset} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                    {capturedImage === preset && (
                      <div className="absolute inset-0 bg-teal-600/40 flex items-center justify-center text-white">
                        <Check className="w-5 h-5 font-bold" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview Selected Photo Banner */}
          {capturedImage && (
            <div className="bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5 space-x-reverse">
                <img
                  src={capturedImage}
                  alt="Profile Preview"
                  className="w-10 h-10 rounded-full object-cover border-2 border-teal-400"
                />
                <div>
                  <span className="text-xs font-extrabold block text-white">معاينة الصورة المختارة</span>
                  <span className="text-[9.5px] text-teal-300">جاهزة للحفظ والتطبيق</span>
                </div>
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={handleSave}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>حفظ الصورة</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 p-3 border-t border-slate-200 flex items-center justify-between text-xs">
          {patient?.profilePhotoUrl ? (
            <button
              onClick={handleRemovePhoto}
              className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>إزالة الصورة (العودة للاحرف)</span>
            </button>
          ) : (
            <span className="text-[10px] text-slate-400 font-bold">صورة ملتقطة وآمنة</span>
          )}

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-slate-500 hover:text-slate-800 font-bold px-3 py-1.5 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
          >
            إلغاء
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProfilePhotoUploader;
