/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "motion/react";
import { jsPDF } from "jspdf";
import { 
  Phone, User, Calendar, Shield, Award, Sparkles, AlertCircle, CheckCircle2, 
  Trash2, Plus, ArrowLeft, Camera, Bell, BellOff, Hourglass, Video, Check, 
  ChevronRight, RefreshCw, Layers, MapPin, Heart, HelpCircle,
  HeartPulse, Activity, FileText, AlertTriangle, FileCheck, ShieldAlert,
  Mic, MicOff, VideoOff, PhoneOff, MessageSquare, CreditCard, Copy
} from "lucide-react";
import { PatientProfile, ApprovedSpecialtiesList, ApprovedSpecialty, ClinicalReport, AppNotification, AlcoholLevel, PhysicalActivity, CurrentMedication, PharmacistProfile, PharmacistReview } from "../types";
import AuthInterface from "./AuthInterface";
import MedicationInsights from "./MedicationInsights";
import PatientPortalSummaryStats from "./PatientPortalSummaryStats";
import MedicationScheduleAlerts from "./MedicationScheduleAlerts";
import RecentNotifications from "./RecentNotifications";
import ProfilePhotoUploader from "./ProfilePhotoUploader";
import PharmacistProfileModal from "./PharmacistProfileModal";
import PharmacistsDirectory from "./PharmacistsDirectory";
import { Fingerprint, Lock, UserCheck } from "lucide-react";
import { registerPushNotifications, triggerLocalNativeNotification } from "../lib/pushNotifications";
import { useLanguage, LanguageSwitcher } from "../LanguageContext";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 14
    }
  }
};

interface MobilePatientSimulatorProps {
  onServiceCreated: () => void;
  activePatientId: string;
  setActivePatientId: (id: string) => void;
  patients: PatientProfile[];
  onReloadPatients: () => void;
  currentUser?: any;
  onAuthSuccess: (token: string, user: any) => void;
  onLogout: () => void;
}

export default function MobilePatientSimulator({ 
  onServiceCreated, 
  activePatientId, 
  setActivePatientId, 
  patients,
  onReloadPatients,
  currentUser,
  onAuthSuccess,
  onLogout
}: MobilePatientSimulatorProps) {
  const { t, language, isRtl, dir } = useLanguage();

  // Navigation states inside simulated phone app
  // Screens: 'dashboard' | 'profile' | 'otc-book' | 'rev-book' | 'pillbox' | 'scanner' | 'payment' | 'videocall' | 'overview' | 'auth' | 'insights' | 'pharmacists'
  const [screen, setScreen] = useState<'dashboard' | 'profile' | 'otc-book' | 'rev-book' | 'pillbox' | 'scanner' | 'payment' | 'videocall' | 'overview' | 'auth' | 'insights' | 'pharmacists'>('dashboard');
  
  // Pharmacist Profile Modal state for patient inspection
  const [selectedPharmacistProfile, setSelectedPharmacistProfile] = useState<PharmacistProfile | null>(null);
  const [isPharmacistModalOpen, setIsPharmacistModalOpen] = useState<boolean>(false);

  const handleOpenPharmacistProfile = async (licenseOrProfile: string | PharmacistProfile) => {
    if (typeof licenseOrProfile === 'object' && licenseOrProfile !== null) {
      setSelectedPharmacistProfile(licenseOrProfile);
      setIsPharmacistModalOpen(true);
      return;
    }

    const lic = licenseOrProfile || "LIC-12345";
    try {
      const res = await fetch(`/api/v1/pharmacists/profile/${lic}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedPharmacistProfile(data);
      } else {
        setSelectedPharmacistProfile({
          fullName: "د. أميرة أحمد الخطيب",
          licenseNumber: lic,
          specialty: "OB-GYN",
          degree: "Specialist",
          country: "مصر",
          governorate: "القاهرة",
          city: "القاهرة الجديدة",
          photoUrl: "https://images.unsplash.com/photo-1594824813566-88855ce78907?q=80&w=256&auto=format&fit=crop",
          bio: "أخصائية الصيدلة الإكلينيكية للنساء والتوليد ومراجعة السلامة الدوائية.",
          rating: 4.9,
          reviewCount: 42
        });
      }
    } catch (e) {
      console.warn("Failed fetching pharmacist profile:", e);
      setSelectedPharmacistProfile({
        fullName: "د. أميرة أحمد الخطيب",
        licenseNumber: lic,
        specialty: "OB-GYN",
        degree: "Specialist",
        country: "مصر",
        governorate: "القاهرة",
        city: "القاهرة الجديدة",
        photoUrl: "https://images.unsplash.com/photo-1594824813566-88855ce78907?q=80&w=256&auto=format&fit=crop",
        bio: "أخصائية الصيدلة الإكلينيكية للنساء والتوليد ومراجعة السلامة الدوائية.",
        rating: 4.9,
        reviewCount: 42
      });
    }
    setIsPharmacistModalOpen(true);
  };

  const handleAddPharmacistReview = async (licenseNumber: string, reviewData: any) => {
    try {
      await fetch(`/api/v1/pharmacists/${licenseNumber}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
    } catch (e) {
      console.warn("Failed posting pharmacist review:", e);
    }
  };
  
  // Dependents List state (managed locally and saved to primary DB if requested)
  const [dependents, setDependents] = useState<Array<{ name: string; relation: string; nationalId: string }>>([
    { name: "ليلى أحمد محمد علي", relation: "ابنة", nationalId: "31008151234567" },
    { name: "مريم أحمد محمد علي", relation: "ابنة", nationalId: "31210201234567" }
  ]);
  const [newDepName, setNewDepName] = useState("");
  const [newDepRelation, setNewDepRelation] = useState("ابن");
  const [newDepNId, setNewDepNId] = useState("");

  // Booking states
  const [bookingSpecialty, setBookingSpecialty] = useState<ApprovedSpecialty>("OB-GYN");
  const [bookingComplaint, setBookingComplaint] = useState("");
  const [bookingDate, setBookingDate] = useState("2026-05-28");
  const [bookingTime, setBookingTime] = useState("");
  const [scannedImage, setScannedImage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<'visa' | 'fawry' | 'vodafone'>('visa');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentServiceType, setPaymentServiceType] = useState<'OTC' | 'REV' | 'MMP'>('OTC');
  const [paymentSimulateStatus, setPaymentSimulateStatus] = useState<'Success' | 'Failed'>('Success');
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null);
  const [paymentSuccessTxnId, setPaymentSuccessTxnId] = useState<string | null>(null);

  // Detailed mock payment fields for EG-Gateway Simulation
  const [mockCardName, setMockCardName] = useState("");
  const [mockCardNo, setMockCardNo] = useState("4312 9015 8421 9901");
  const [mockCardExp, setMockCardExp] = useState("09/29");
  const [mockCardCvv, setMockCardCvv] = useState("385");
  const [mockWalletPhone, setMockWalletPhone] = useState("01077654321");
  const [mockWalletOtp, setMockWalletOtp] = useState("2849");
  const [mockDeclineReason, setMockDeclineReason] = useState("INSUFFICIENT_FUNDS");

  // Active call simulation
  const [callTimer, setCallTimer] = useState(0);

  // Chat messaging states
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // WebRTC & WebSocket Active States for Patient Video Calls
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'ended'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [peerJoined, setPeerJoined] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [googleMeetUrl, setGoogleMeetUrl] = useState<string | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (screen !== 'videocall' || !activePatient) {
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      if (socketRef.current) {
        if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            type: "hangup",
            roomId: activePatient?.nationalId || "room_otc_default",
            userId: activePatient?.nationalId
          }));
        }
        socketRef.current.close();
        socketRef.current = null;
      }
      setCallStatus('idle');
      setPeerJoined(false);
      return;
    }

    setCallStatus('connecting');
    setErrorMessage(null);

    const roomId = activePatient.nationalId;
    const userId = activePatient.nationalId;
    const role = "patient";

    // Pre-load Google Meet details if already generated on server
    const fetchActiveMeetUrl = async () => {
      try {
        const res = await fetch("/api/v1/services");
        if (res.ok) {
          const data = await res.json();
          const activeOtc = data.otc?.find((c: any) => c.patientId === activePatient.nationalId && c.googleMeetUrl);
          const activeRev = data.revisions?.find((c: any) => c.patientId === activePatient.nationalId && c.googleMeetUrl);
          if (activeOtc) {
            setGoogleMeetUrl(activeOtc.googleMeetUrl);
          } else if (activeRev) {
            setGoogleMeetUrl(activeRev.googleMeetUrl);
          } else {
            setGoogleMeetUrl(null);
          }
        }
      } catch (e) {
        console.warn("Failed to fetch current meet URL on client start:", e);
      }
    };
    fetchActiveMeetUrl();

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ]
    });
    pcRef.current = pc;

    async function startMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });
        setCallStatus('connecting');
      } catch (err: any) {
        console.warn("Camera or microphone access denied/unavailable:", err);
        setErrorMessage("الكاميرا الحقيقية غير متوفرة أو يحظرها المتصفح. تفعيل اتصال الفيديو والمحاكاة الرقمية التفاعلية بنجاح.");
      }
    }

    startMedia();

    pc.onicecandidate = (event) => {
      if (event.candidate && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: "signal",
          roomId,
          userId,
          signal: { candidate: event.candidate }
        }));
      }
    };

    pc.ontrack = (event) => {
      console.log("[WebRTC] Got Remote Track!");
      if (event.streams && event.streams[0]) {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        setCallStatus('connected');
      }
    };

    socket.onopen = () => {
      console.log("[WS] Patient connected to signaling.");
      socket.send(JSON.stringify({
        type: "join",
        roomId,
        userId,
        role
      }));
    };

    socket.onmessage = async (event) => {
      try {
        const payload = JSON.parse(event.data);
        switch (payload.type) {
          case "room-users": {
            const hasPharmacist = payload.users.some((u: any) => u.role === "pharmacist");
            if (hasPharmacist) {
              setPeerJoined(true);
              setCallStatus('connected');
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              socket.send(JSON.stringify({
                type: "signal",
                roomId,
                userId,
                signal: { sdp: pc.localDescription }
              }));
            }
            break;
          }
          case "user-joined": {
            if (payload.role === "pharmacist") {
              setPeerJoined(true);
              setCallStatus('connected');
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              socket.send(JSON.stringify({
                type: "signal",
                roomId,
                userId,
                signal: { sdp: pc.localDescription }
              }));
            }
            break;
          }
          case "signal": {
            const { signal } = payload;
            if (signal.sdp) {
              await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
              if (signal.sdp.type === "offer") {
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.send(JSON.stringify({
                  type: "signal",
                  roomId,
                  userId,
                  signal: { sdp: pc.localDescription }
                }));
              }
            } else if (signal.candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }
            break;
          }
          case "hangup": {
            setCallStatus('ended');
            setPeerJoined(false);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = null;
            }
            break;
          }
          case "chat-message": {
            if (payload.message) {
              setChatMessages(prev => {
                if (prev.some(m => m.timestamp === payload.message.timestamp && m.text === payload.message.text)) {
                  return prev;
                }
                return [...prev, payload.message];
              });
            }
            break;
          }
          case "google-meet-started": {
            if (payload.googleMeetUrl) {
              setGoogleMeetUrl(payload.googleMeetUrl);
            }
            break;
          }
          case "user-left": {
            if (payload.userId !== userId) {
              setPeerJoined(false);
              setCallStatus('connecting');
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
              }
            }
            break;
          }
        }
      } catch (err) {
        console.error("[WS] Error reading signal packet:", err);
      }
    };

    socket.onclose = () => {
      console.log("[WS] Patient signaling closed.");
    };

    return () => {
      if (pc.signalingState !== "closed") {
        pc.close();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      socket.close();
    };
  }, [screen, activePatientId]);

  const sendChatMessage = () => {
    if (!newMessageText.trim() || !activePatient || !socketRef.current) return;
    
    const textMsg = newMessageText.trim();
    setNewMessageText("");
    
    // Broadcast via Websocket
    if (socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "chat-message",
        roomId: activePatient.nationalId,
        sender: "patient",
        senderName: activePatient.fullName,
        text: textMsg
      }));
    }
  };

  // Pillbox interaction - interactive offline cached alarms
  const [pillStatus, setPillStatus] = useState<Record<string, boolean>>({
    "concor-morning": false,
    "iron-afternoon": false
  });
  const [pillAlarms, setPillAlarms] = useState<Record<string, boolean>>({
    "concor-morning": true,
    "iron-afternoon": true
  });
  const [snoozedAlarms, setSnoozedAlarms] = useState<Record<string, { time: string; count: number }>>({});
  const [skippedAlarms, setSkippedAlarms] = useState<Record<string, boolean>>({});

  // Clinical reports state for the active patient
  const [reports, setReports] = useState<ClinicalReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ClinicalReport | null>(null);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  // Simulated push notifications & recent pharmacy alerts states
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: "notif-001",
      recipient: "patient",
      title: "💊 تنبيه الجرعة: كونكور 5 ملجم",
      body: "حان موعد الجرعة الصباحية (قرص واحد بعد الإفطار). يرجى الالتزام بالموعد.",
      type: "PillReminder",
      read: false,
      createdAt: new Date().toISOString(),
      metadata: { brandName: "Concor 5mg", timeOfDay: "08:00 AM" }
    },
    {
      id: "notif-002",
      recipient: "patient",
      title: "📋 تم إصدار تقرير فحص الروشتة",
      body: "تم اعتماد الروشتة وتوثيق الخطة العلاجية بواسطة الصيدلي الإكلينيكي المختص.",
      type: "ReportSigned",
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      metadata: { serviceId: "REV-2026-01" }
    },
    {
      id: "notif-003",
      recipient: "patient",
      title: "⚠️ تنبيه تعارض دوائي غذائي",
      body: "تجنب تناول عصير الجريب فروت مع دواء الضغط لتفادي زيادة امتصاص المادة الفعالة.",
      type: "General",
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ]);
  const [showNotifCenter, setShowNotifCenter] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [activePush, setActivePush] = useState<AppNotification | null>(null);
  const shownPushIdsRef = useRef<Set<string>>(new Set());

  // Booked Services lists
  const [bookedServices, setBookedServices] = useState<{otc: any[], revisions: any[], plan: any[]}>({otc: [], revisions: [], plan: []});

  // Profile Photo state & uploader modal state
  const [isPhotoUploaderOpen, setIsPhotoUploaderOpen] = useState(false);
  const [profilePhotos, setProfilePhotos] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("patient_profile_photos");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const baseActivePatient = patients.find(p => p.nationalId === activePatientId) || patients[0];
  const activePatient = useMemo(() => {
    if (!baseActivePatient) return null;
    return {
      ...baseActivePatient,
      profilePhotoUrl: profilePhotos[baseActivePatient.nationalId] || baseActivePatient.profilePhotoUrl
    };
  }, [baseActivePatient, profilePhotos]);

  const handleSaveProfilePhoto = (photoDataUrl: string) => {
    if (!baseActivePatient) return;
    const updated = { ...profilePhotos, [baseActivePatient.nationalId]: photoDataUrl };
    setProfilePhotos(updated);
    try {
      localStorage.setItem("patient_profile_photos", JSON.stringify(updated));
    } catch (e) {
      console.warn("Error saving photo to localStorage:", e);
    }
  };

  // Load chat history on Joining videocall
  useEffect(() => {
    if (screen === 'videocall' && activePatient?.nationalId) {
      const fetchHistory = async () => {
        try {
          const res = await fetch(`/api/v1/chat/${activePatient.nationalId}`);
          const data = await res.json();
          if (data.success && data.messages) {
            setChatMessages(data.messages);
          }
        } catch (err) {
          console.error("Error loading chat history:", err);
        }
      };
      fetchHistory();
    } else {
      setChatMessages(prev => (prev.length === 0 ? prev : []));
    }
  }, [screen, activePatient?.nationalId]);

  const patientOtc = useMemo(() => bookedServices.otc?.filter(c => c.patientId === activePatient?.nationalId) || [], [bookedServices.otc, activePatient?.nationalId]);
  const patientRevisions = useMemo(() => bookedServices.revisions?.filter(c => c.patientId === activePatient?.nationalId) || [], [bookedServices.revisions, activePatient?.nationalId]);
  const patientMmp = useMemo(() => bookedServices.plan?.filter(c => c.patientId === activePatient?.nationalId) || [], [bookedServices.plan, activePatient?.nationalId]);

  const allPatientBookings = useMemo(() => [
    ...patientOtc.map(c => ({...c, typeLabel: "استشارة OTC مباشرة", type: "OTC"})),
    ...patientRevisions.map(c => ({...c, typeLabel: "مراجعة روشتة DUR", type: "REV"})),
    ...patientMmp.map(c => ({...c, typeLabel: "إدارة الخطة MMP", type: "MMP"}))
  ], [patientOtc, patientRevisions, patientMmp]);

  // Browser Notification integration states
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );
  const [pushRegistrationInfo, setPushRegistrationInfo] = useState<any>(null);
  const [isRegisteringPush, setIsRegisteringPush] = useState(false);

  const handleSetupPushNotifications = async () => {
    if (!activePatient) return;
    setIsRegisteringPush(true);
    try {
      const info = await registerPushNotifications(activePatient.nationalId, 'patient');
      setPushRegistrationInfo(info);
      setNotificationPermission(Notification.permission);
    } catch (e) {
      console.error("[Push SDK] Failed setup:", e);
    } finally {
      setIsRegisteringPush(false);
    }
  };

  const triggerTestPush = async () => {
    if (!activePatient) return;
    try {
      await fetch("/api/v1/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: activePatient.nationalId,
          role: "patient",
          title: "⏰ منبه دواء MMP: Haematon Capsules",
          body: "عزيزتي سارة، حان الوقت لتناول كبسولة Haematon لدعم الحديد وحمض الفوليك. يرجى الشرب مع كوب ماء وفير.",
          type: "PillReminder",
          metadata: { brandName: "Haematon" }
        })
      });
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const [timetableTimeOverrides, setTimetableTimeOverrides] = useState<Record<string, string>>({});
  const triggeredTimetableKeysRef = useRef<Set<string>>(new Set());

  const requestBrowserNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("⚠️ متصفحك الحالي لا يدعم إشعارات الويب ديسكتوب القياسية.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === "granted") {
        new Notification("🔔 تم تفعيل إشعارات الدواء بنجاح!", {
          body: "ستتلقى دائمًا التنبيهات والمنبهات في موعدها القياسي المحدد.",
          icon: "/favicon.ico"
        });
      }
    } catch (err) {
      console.error("Error requesting notification permission:", err);
    }
  };

  const finalTimetableItems = useMemo(() => {
    const activePatientTimetableItems: any[] = [];
    if (patientMmp && patientMmp.length > 0) {
      patientMmp.forEach(plan => {
        if (plan.timetable) {
          plan.timetable.forEach((item: any) => {
            activePatientTimetableItems.push({
              ...item,
              timeOfDay: timetableTimeOverrides[item.id] || item.timeOfDay,
              planId: plan.id
            });
          });
        }
      });
    }

    if (activePatientTimetableItems.length > 0) {
      return activePatientTimetableItems;
    }

    return [
      {
        id: "concor-morning",
        activeIngredient: "Bisoprolol Hemifumarate",
        brandName: "Concor CO 5mg",
        dosageForm: "Tablet",
        dose: "1 Tablet",
        timeOfDay: timetableTimeOverrides["concor-morning"] || "08:00",
        foodRelation: "Before Food",
        specialInstructions: "صباحاً على الريق لتنظيم ضربات القلب وضغط الدم الشرياني",
        notificationTriggered: false
      },
      {
        id: "iron-afternoon",
        activeIngredient: "Ferrous Gluconate + Folic Acid",
        brandName: "Haematon Capsules",
        dosageForm: "Capsule",
        dose: "1 Capsule",
        timeOfDay: timetableTimeOverrides["iron-afternoon"] || "16:00",
        foodRelation: "After Food",
        specialInstructions: "بعد الغداء بساعتين لضمان الامتصاص التام وتفادي تهييج المعدة",
        notificationTriggered: false
      }
    ];
  }, [patientMmp, timetableTimeOverrides]);

  const [notifDropdownTab, setNotifDropdownTab] = useState<'reminders' | 'alerts'>('reminders');

  // Compute upcoming medication reminders based on current prescriptions & timetable
  const upcomingReminders = useMemo(() => {
    const list: Array<{
      id: string;
      medName: string;
      dose: string;
      time: string;
      foodRelation?: string;
      instructions?: string;
      isTaken: boolean;
      source: 'timetable' | 'prescription';
    }> = [];

    finalTimetableItems.forEach(item => {
      const id = item.id || `time-${item.brandName}`;
      list.push({
        id,
        medName: item.brandName || item.activeIngredient,
        dose: item.dose || "1 قرص",
        time: item.timeOfDay || "08:00",
        foodRelation: item.foodRelation === "Before Food" ? "قبل الأكل" : item.foodRelation === "After Food" ? "بعد الأكل" : item.foodRelation,
        instructions: item.specialInstructions || "",
        isTaken: pillStatus[id] === true,
        source: 'timetable'
      });
    });

    if (activePatient?.currentMedications) {
      activePatient.currentMedications.forEach((med: any, idx: number) => {
        const medName = med.brandName || med.activeIngredient || med.name || "دواء متناول";
        const existsInTimetable = list.some(r => 
          r.medName.toLowerCase().includes(medName.toLowerCase()) || 
          medName.toLowerCase().includes(r.medName.toLowerCase())
        );
        if (!existsInTimetable) {
          const id = `curr-med-${idx}-${medName}`;
          const freqStr = typeof med.frequency === 'object' && med.frequency !== null
            ? `${med.frequency.units || 1} ${med.frequency.type || ''} (${med.frequency.timeframe || ''})`.trim()
            : String(med.frequency || "حسب الجدول");
          const doseStr = med.concentration 
            ? `${med.dosageForm || ''} ${med.concentration}`.trim() 
            : (typeof med.dose === 'string' ? med.dose : "الجرعة المحددة");

          list.push({
            id,
            medName,
            dose: doseStr,
            time: freqStr,
            foodRelation: med.instructions || med.reason ? `التعليمات: ${med.instructions || med.reason}` : undefined,
            instructions: freqStr,
            isTaken: pillStatus[id] === true,
            source: 'prescription'
          });
        }
      });
    }

    return list;
  }, [finalTimetableItems, activePatient?.currentMedications, pillStatus]);

  const pendingRemindersCount = upcomingReminders.filter(r => !r.isTaken).length;
  const unreadAlertsCount = notifications.filter(n => !n.read).length;
  const totalAlertCount = pendingRemindersCount + unreadAlertsCount;

  const handleTakeDoseInDropdown = (id: string, medName: string) => {
    setPillStatus(prev => ({ ...prev, [id]: true }));
    triggerLocalNativeNotification(
      "💊 تم تأكيد تناول الجرعة",
      `تم تسجيل تناول جرعة دواء (${medName}) بنجاح. نتمنى لك دوام الصحة والعافية!`
    );
  };

  const handleUpdateTimeOfDay = async (item: any, newTime: string) => {
    setTimetableTimeOverrides(prev => ({ ...prev, [item.id]: newTime }));
    if (item.planId) {
      const planToUpdate = patientMmp.find(plan => plan.id === item.planId);
      if (planToUpdate && planToUpdate.timetable) {
        const updatedTimetable = planToUpdate.timetable.map((t: any) => 
          t.id === item.id ? { ...t, timeOfDay: newTime } : t
        );
        try {
          const res = await fetch(`/api/v1/services/${item.planId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ timetable: updatedTimetable })
          });
          if (res.ok) {
            loadBookedServices();
          }
        } catch (e) {
          console.error("Failed to sync updated timetable time to backend:", e);
        }
      }
    }
  };

  const snoozeAlarm = async (item: any) => {
    const now = new Date();
    // Calculate new snooze time +10 minutes from now
    const future = new Date(now.getTime() + 10 * 60 * 1000);
    const hrs = String(future.getHours()).padStart(2, '0');
    const mins = String(future.getMinutes()).padStart(2, '0');
    const snoozeTime = `${hrs}:${mins}`;

    const prevCount = snoozedAlarms[item.id]?.count || 0;
    const newCount = prevCount + 1;
    
    setSnoozedAlarms(prev => ({
      ...prev,
      [item.id]: { time: snoozeTime, count: newCount }
    }));

    // Settle new time
    await handleUpdateTimeOfDay(item, snoozeTime);

    // Add push notification to warn patient they snoozed
    const snoozeNotif: AppNotification = {
      id: `NOT-SNOOZE-${item.id}-${Date.now().toString().slice(-4)}`,
      recipient: "patient",
      patientId: activePatient?.nationalId || "",
      title: `🕒 تم تأجيل منبه: ${item.brandName}`,
      body: `تم تأجيل منبه الدواء بنجاح لمدة 10 دقائق. المنبه القادم في الساعة ${snoozeTime}.`,
      type: "PillReminder",
      read: false,
      createdAt: now.toISOString()
    };
    setActivePush(snoozeNotif);
    setNotifications(prev => [snoozeNotif, ...prev]);

    // Send to central server audit log
    try {
      await fetch("/api/v1/admin/audit-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "Medication Alarm Snoozed",
          pharmacist: `المريض: ${activePatient?.fullName || "المستخدم المستفيد"}`,
          serviceId: "MMP-ALARM",
          details: `قام المريض بتأجيل (Snooze) منبه الدواء "${item.brandName}" لليوم ليرن في الساعة ${snoozeTime} (المرة رقم ${newCount} للتأجيل).`
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const skipAlarm = async (item: any) => {
    // Disable alarm
    setPillAlarms(prev => ({ ...prev, [item.id]: false }));
    setSkippedAlarms(prev => ({ ...prev, [item.id]: true }));

    const now = new Date();
    // Add skip notification record
    const skipNotif: AppNotification = {
      id: `NOT-SKIP-${item.id}-${Date.now().toString().slice(-4)}`,
      recipient: "patient",
      patientId: activePatient?.nationalId || "",
      title: `⚠️ تم تخطي دواء: ${item.brandName}`,
      body: `تم تسجيل تخطي جرعة الدواء (${item.brandName}) لليوم بناءً على اختيارك اليدوي. يرجى توخي الحذر والالتزام بالجدول السريري للامتثال الدوائي ومطابقة معايير السلامة وصحة الكلى.`,
      type: "PillReminder",
      read: false,
      createdAt: now.toISOString()
    };
    setActivePush(skipNotif);
    setNotifications(prev => [skipNotif, ...prev]);

    // Send skip event to central server audit log
    try {
      await fetch("/api/v1/admin/audit-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "Medication Alarm Skipped",
          pharmacist: `المريض: ${activePatient?.fullName || "المستخدم المستفيد"}`,
          serviceId: "MMP-ALARM",
          details: `قام المريض بتخطي (Skip) جرعة الدواء "${item.brandName}" لليوم لموعد ${item.timeOfDay || "غير محدد"}.`
        })
      });
    } catch (error) {
      console.error("Error logging skip audit log:", error);
    }
  };

  const resetAlarmStatus = async (item: any) => {
    setPillStatus(prev => ({ ...prev, [item.id]: false }));
    setPillAlarms(prev => ({ ...prev, [item.id]: true }));
    setSkippedAlarms(prev => ({ ...prev, [item.id]: false }));
    setSnoozedAlarms(prev => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });

    const now = new Date();
    // Add reset notification record
    const resetNotif: AppNotification = {
      id: `NOT-RESET-${item.id}-${Date.now().toString().slice(-4)}`,
      recipient: "patient",
      patientId: activePatient?.nationalId || "",
      title: `🔄 إعادة تفعيل منبه: ${item.brandName}`,
      body: `تمت إعادة تفعيل منبه الدواء وحالة الامتثال لليوم بنجاح للوضع النشط القياسي.`,
      type: "PillReminder",
      read: false,
      createdAt: now.toISOString()
    };
    setActivePush(resetNotif);
    setNotifications(prev => [resetNotif, ...prev]);

    // Send reset event to central server audit log
    try {
      await fetch("/api/v1/admin/audit-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "Medication Alarm Reset",
          pharmacist: `المريض: ${activePatient?.fullName || "المستخدم المستفيد"}`,
          serviceId: "MMP-ALARM",
          details: `قام المريض بإعادة ضبط وتفعيل منبه الدواء "${item.brandName}" لليوم للوضع الافتراضي.`
        })
      });
    } catch (error) {
      console.error("Error logging reset audit log:", error);
    }
  };

  // Real-time alarm ticker
  useEffect(() => {
    const checkTimetableAlarms = () => {
      if (!activePatient) return;
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentHHMM = `${currentHours}:${currentMinutes}`;
      const todayStr = now.toISOString().split('T')[0];

      finalTimetableItems.forEach(item => {
        const alarmEnabled = pillAlarms[item.id] !== false;
        if (!alarmEnabled) return;

        if (item.timeOfDay === currentHHMM) {
          const triggerKey = `${item.id}_${item.timeOfDay}_${todayStr}`;
          if (!triggeredTimetableKeysRef.current.has(triggerKey)) {
            triggeredTimetableKeysRef.current.add(triggerKey);

            // 1. Audio double ping chime
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.type = "sine";
              osc.frequency.setValueAtTime(650, audioCtx.currentTime);
              gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.15);

              setTimeout(() => {
                const osc2 = audioCtx.createOscillator();
                const gain2 = audioCtx.createGain();
                osc2.connect(gain2);
                gain2.connect(audioCtx.destination);
                osc2.type = "sine";
                osc2.frequency.setValueAtTime(900, audioCtx.currentTime);
                gain2.gain.setValueAtTime(0.08, audioCtx.currentTime);
                osc2.start();
                osc2.stop(audioCtx.currentTime + 0.2);
              }, 180);
            } catch (e) {
              console.warn(e);
            }

            // 2. Custom on-screen simulated push notification
            const newNotif: AppNotification = {
              id: `NOT-REM-REAL-${item.id}-${Math.floor(1000 + Math.random() * 9000)}`,
              recipient: "patient",
              patientId: activePatient.nationalId,
              title: `⏰ حان موعد دواء: ${item.brandName}`,
              body: `تذكير جرعتك الوقائية (${item.dose}) من دواء ${item.brandName} (${item.activeIngredient}). التعليمات: ${
                item.foodRelation === "Before Food" || item.foodRelation === "Before Food" ? "قبل الأكل" :
                item.foodRelation === "After Food" || item.foodRelation === "After Food" ? "بعد الأكل" :
                item.foodRelation === "With Food" ? "مع الأكل" :
                item.foodRelation === "Empty Stomach" ? "على معدة فارغة" : "لا يشترط وقت الأكل"
              }. إرشادات: ${item.specialInstructions || "لا يوجد"}.`,
              type: "PillReminder",
              read: false,
              createdAt: now.toISOString()
            };

            setActivePush(newNotif);
            setNotifications(prev => [newNotif, ...prev]);

            // Save to backend database as an official notification record
            fetch("/api/v1/notifications", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newNotif)
            }).then(() => loadNotifications())
              .catch(err => console.error(err));

            // 3. HTML5 browser-based native push notifications Web API
            if ("Notification" in window) {
              if (Notification.permission === "granted") {
                new Notification(newNotif.title, {
                  body: newNotif.body,
                  icon: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=128&auto=format&fit=crop"
                });
              } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(p => {
                  if (p === "granted") {
                    new Notification(newNotif.title, {
                      body: newNotif.body,
                      icon: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=128&auto=format&fit=crop"
                    });
                  }
                });
              }
            }
          }
        }
      });
    };

    checkTimetableAlarms();
    const tickInterval = setInterval(checkTimetableAlarms, 8000);
    return () => clearInterval(tickInterval);
  }, [finalTimetableItems, pillAlarms, activePatient?.nationalId]);

  const handleDownloadPDF = (report: ClinicalReport) => {
    if (!report) return;
    setIsDownloadingPDF(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Coordinates helper
      let y = 15;

      // Header Top Border
      doc.setDrawColor(20, 110, 120); // Teal
      doc.setLineWidth(1.5);
      doc.line(10, 10, 200, 10);

      // CareConnect official document header
      doc.setTextColor(20, 110, 120);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("CARECONNECT EHRS - CLINICAL PHARMACY", 12, y + 5);

      doc.setFontSize(9);
      doc.setTextColor(110, 120, 130);
      doc.setFont("helvetica", "normal");
      doc.text("Egyptian Drug Authority (EDA) Compliant Official Summary", 12, y + 10);

      // Logo Badge
      doc.setFillColor(20, 110, 120);
      doc.rect(148, 12, 52, 11, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("OFFICIAL REPORT UNIFIED", 150, 19.5);

      y += 18;

      // Horizontal separator line
      doc.setDrawColor(210, 215, 220);
      doc.setLineWidth(0.5);
      doc.line(10, y, 200, y);

      y += 6;

      // Section 1: Demographics & Clinical Profile
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 110, 120);
      doc.text("1. CLINICAL BIOMETRICS & DEMOGRAPHICS", 12, y);

      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(50, 60, 70);

      const patientName = activePatient?.fullName || "Unspecified Patient";
      const nationalId = activePatient?.nationalId || report.patientId || "N/A";
      const age = activePatient?.dob 
        ? `${new Date().getFullYear() - new Date(activePatient.dob).getFullYear()} Years` 
        : "Unspecified";

      doc.text(`Patient Full Name: ${patientName}`, 12, y);
      doc.text(`State ID / National NID: ${nationalId}`, 110, y);

      y += 5.5;
      doc.text(`Age Group: ${age} (Born: ${activePatient?.dob || "N/A"})`, 12, y);
      doc.text(`Biological Blood Group: ${activePatient?.bloodGroup || "O+"}`, 110, y);

      y += 5.5;
      doc.text(`Stature Biometrics: Height ${activePatient?.height || 170} cm | Mass ${activePatient?.weight || 70} kg`, 12, y);
      const isPreg = activePatient?.pregnancyLactation?.isPregnant 
        ? `Active Pregnancy (Week ${activePatient?.pregnancyLactation?.weeks || "?"})` 
        : "Negative / Non-Pregnant";
      doc.text(`Pregnancy Status: ${isPreg}`, 110, y);

      y += 7;
      doc.line(10, y, 200, y);
      y += 6;

      // Section 2: Clinical Evaluation Specs
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 110, 120);
      doc.text("2. DRUG UTILIZATION CLINICAL PARAMETERS", 12, y);

      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(50, 60, 70);

      doc.text(`Report Log Reference: #REP-${report.id.toUpperCase()}`, 12, y);
      doc.text(`System Sync: ${new Date(report.createdAt).toLocaleString("en-US")}`, 110, y);

      y += 5.5;
      doc.text(`Consultant Clinical Pharmacist: ${report.pharmacistName}`, 12, y);
      doc.text(`Care Pathway Type: ${report.serviceType === "OTC_CONSULTATION" ? "OTC Consultation Plan" : "Prescription Review (DUR)"}`, 110, y);

      y += 7;
      doc.line(10, y, 200, y);
      y += 6;

      // Section 3: Diagnostic Findings & Statements
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 110, 120);
      doc.text("3. CLINICAL FINDINGS & DIAGNOSES REVIEW", 12, y);

      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(50, 60, 70);

      if (report.serviceType === "OTC_CONSULTATION" && report.otcFields) {
        doc.setFont("helvetica", "bold");
        doc.text("Chief Complaint & Indication Summary:", 12, y);
        doc.setFont("helvetica", "normal");
        
        const complaintText = doc.splitTextToSize(report.otcFields.chiefComplaint, 180);
        doc.text(complaintText, 12, y + 4.5);
        y += (complaintText.length * 4.5) + 6;

        doc.setFont("helvetica", "bold");
        doc.text("Dietary & Behavioral Counseling Guidelines:", 12, y);
        doc.setFont("helvetica", "normal");
        
        const lifestyleText = doc.splitTextToSize(report.otcFields.behavioralRecommendations, 180);
        doc.text(lifestyleText, 12, y + 4.5);
        y += (lifestyleText.length * 4.5) + 6;

      } else if (report.serviceType === "PRESCRIPTION_REVISION" && report.revisionFields) {
        doc.setFont("helvetica", "bold");
        doc.text("Diagnosed Clinical Indication:", 12, y);
        doc.setFont("helvetica", "normal");
        doc.text(report.revisionFields.diagnosis, 65, y);

        y += 5.5;
        doc.setFont("helvetica", "bold");
        doc.text("Treating Physician & Department:", 12, y);
        doc.setFont("helvetica", "normal");
        doc.text(`${report.revisionFields.treatingPhysician} (${report.revisionFields.treatingSpecialty})`, 76, y);

        y += 5.5;
        doc.setFont("helvetica", "bold");
        doc.text("Therapeutic Drug-Diagnosis Alignment Statement:", 12, y);
        doc.setFont("helvetica", "normal");
        y += 5.5;
        const alignmentText = doc.splitTextToSize(report.revisionFields.drugDiagnosisMatch, 180);
        doc.text(alignmentText, 12, y);
        y += (alignmentText.length * 4.5) + 6;
      }

      doc.line(10, y, 200, y);
      y += 6;

      // Section 4: Therapeutic Drug Plan
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 110, 120);
      doc.text("4. APPROVED REGULATED MEDICATIONS & ADMINISTRATION SYSTEM", 12, y);

      y += 6;
      doc.setFont("helvetica", "normal");

      // Table header with background block
      doc.setFillColor(242, 246, 247);
      doc.rect(12, y, 185, 6, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(40, 50, 60);
      doc.text("Ingredient / Brand Name", 15, y + 4.2);
      doc.text("Dose & Frequency", 68, y + 4.2);
      doc.text("Therapeutic Course", 110, y + 4.2);
      doc.text("Food Cohort / Specific Safe Guidelines", 140, y + 4.2);

      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(50, 60, 70);

      let medCount = 0;

      if (report.serviceType === "OTC_CONSULTATION" && report.otcFields?.therapeuticRecommendations?.otcMedications) {
        report.otcFields.therapeuticRecommendations.otcMedications.forEach((med) => {
          if (y > 270) {
            doc.addPage();
            y = 15;
          }
          doc.setFont("helvetica", "bold");
          doc.text(`${med.brandName} (${med.activeIngredient})`, 15, y + 4);
          doc.setFont("helvetica", "normal");
          doc.text(med.dose, 68, y + 4);
          doc.text(med.duration, 110, y + 4);
          
          const timingText = doc.splitTextToSize(med.timing, 52);
          doc.text(timingText, 140, y + 4);

          y += Math.max(timingText.length * 4, 6.5);
          doc.setDrawColor(235, 240, 242);
          doc.line(12, y, 197, y);
          medCount++;
        });
      } else if (report.serviceType === "PRESCRIPTION_REVISION" && report.revisionFields?.administrationGuidelines) {
        report.revisionFields.administrationGuidelines.forEach((g) => {
          if (y > 270) {
            doc.addPage();
            y = 15;
          }
          doc.setFont("helvetica", "bold");
          doc.text(`${g.brandName} (${g.activeIngredient})`, 15, y + 4);
          doc.setFont("helvetica", "normal");
          doc.text(g.dose, 68, y + 4);
          doc.text(g.duration, 110, y + 4);

          const guidelineDetail = `${g.foodRelation}${g.precautions ? ` | Note: ${g.precautions}` : ""}`;
          const guidelineText = doc.splitTextToSize(guidelineDetail, 52);
          doc.text(guidelineText, 140, y + 4);

          y += Math.max(guidelineText.length * 4, 6.5);
          doc.setDrawColor(235, 240, 242);
          doc.line(12, y, 197, y);
          medCount++;
        });
      }

      if (medCount === 0) {
        doc.text("No dynamic medications are listed inside this specific report block.", 15, y + 4);
        y += 6.5;
      }

      y += 4;
      if (y > 255) {
        doc.addPage();
        y = 15;
      }

      doc.setDrawColor(210, 215, 220);
      doc.line(10, y, 200, y);
      y += 6;

      // Section 5: Drug Utilization Review Findings (Clinical-grade checks)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 110, 120);
      doc.text("5. CLINICAL DRUG-DRUG INTERACTIONS & TOXICITY WARNINGS", 12, y);

      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(50, 60, 70);

      if (report.serviceType === "PRESCRIPTION_REVISION" && report.revisionFields) {
        const severity = report.revisionFields.drugDrugInteractions;
        doc.setFont("helvetica", "bold");
        doc.text("Assessed Drug Interactivity Severity Rank: ", 12, y);
        
        if (severity === "Red") {
          doc.setTextColor(210, 30, 45);
          doc.text("CRITICAL OVERLAPPING RISK (PRESCRIP ADJUSTMENT ENFORCED)", 80, y);
        } else if (severity === "Yellow") {
          doc.setTextColor(220, 130, 15);
          doc.text("MODERATE WARNING (CLOSE DOSAGE MONITORING REQUIRED)", 80, y);
        } else {
          doc.setTextColor(30, 155, 65);
          doc.text("LOW TO NEGLIGIBLE INTERACTION PROFILE (OPTIMAL)", 80, y);
        }
        
        doc.setTextColor(50, 60, 70);
        doc.setFont("helvetica", "normal");
        
        y += 5.5;
        const explanationLines = doc.splitTextToSize(`Interaction Evaluation Details: ${report.revisionFields.interactionDetails}`, 180);
        doc.text(explanationLines, 12, y);
        y += (explanationLines.length * 4.5) + 3;

        // Discontinued meds
        if (report.revisionFields.unnecessaryMedications && report.revisionFields.unnecessaryMedications.length > 0) {
          doc.setFont("helvetica", "bold");
          doc.setTextColor(210, 30, 45);
          doc.text("DISCONTINUED MEDICATIONS (DE-PRESCRIBING RECOMMENDED SYNC):", 12, y);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(50, 60, 70);
          y += 4.5;
          report.revisionFields.unnecessaryMedications.forEach((med) => {
            doc.text(`- DETECTED THERAPEUTIC DUPLICATION / OUT OF SCOPE: Stop taking ${med}`, 15, y);
            y += 4.5;
          });
        }
      } else {
        doc.text("Comprehensive databases cross-checked (Allergies, chronic conditions, bio-stature).", 12, y);
        y += 5.5;
        
        if (activePatient?.allergies?.drugAllergies && activePatient.allergies.drugAllergies.length > 0) {
          doc.setFont("helvetica", "bold");
          doc.setTextColor(210, 30, 45);
          doc.text(`Registered Patient Allergies: ${activePatient.allergies.drugAllergies.join(", ")}`, 12, y);
          doc.setTextColor(50, 60, 70);
          doc.setFont("helvetica", "normal");
          y += 5.5;
        } else {
          doc.text("No specific drug hypersensitivities or interactions were logged for current therapy.", 12, y);
          y += 5.5;
        }
      }

      // Footing & Stamp signatures
      if (y > 235) {
        doc.addPage();
        y = 15;
      } else {
        y = 238;
      }

      doc.setDrawColor(20, 110, 120);
      doc.setLineWidth(0.6);
      doc.line(10, y, 200, y);

      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(110, 120, 130);
      doc.text("This official evaluation is issued in electronic format following successful checking.", 12, y);
      doc.text("Complies with modern Egyptian Ministry of Health & EDA guidelines regarding inpatient / outpatient DUR.", 12, y + 4.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(20, 110, 120);
      doc.text("ELECTRONIC APPROVAL STAMP", 135, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 60, 70);
      doc.text(`Pharmacist: ${report.pharmacistName}`, 135, y + 4.5);
      doc.text("Licensed Pharmacy Clinician, MoHP", 135, y + 8.5);

      // Signature bounding box
      doc.rect(133, y - 2.5, 63, 15);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150, 160, 170);
      doc.text("Page 1 of 1 | Documentation reference: CareConnect-EHR-EDA", 12, 287);
      doc.text("Digital Signature Verified Sec-SHA256", 145, 287);

      doc.save(`Clinical_Report_Summary_${report.id}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF clinical report summary:", err);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const fetchReports = async () => {
    if (!activePatient) return;
    setIsLoadingReports(true);
    try {
      const res = await fetch("/api/v1/reports");
      if (res.ok) {
        const data = await res.json();
        // filter reports for the active patient
        setReports(data.filter((r: ClinicalReport) => r.patientId === activePatient.nationalId) || []);
      }
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setIsLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activePatientId, screen]);

  useEffect(() => {
    let interval: any;
    if (screen === 'videocall') {
      interval = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [screen]);

  // Form validations
  const getMinBookingTime = () => {
    // Return standard minimum 2 hours from now
    const now = new Date();
    now.setHours(now.getHours() + 2);
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    return `${hrs}:${mins}`;
  };

  const currentMinTime = getMinBookingTime();

  const handleProcessPayment = async () => {
    setIsProcessingPayment(true);
    setPaymentErrorMessage(null);
    setPaymentSuccessTxnId(null);

    const priceMap = {
      OTC: 250,
      REV: 350,
      MMP: 400
    };
    const amount = priceMap[paymentServiceType];

    try {
      const payload = {
        serviceType: paymentServiceType,
        amount,
        paymentMethod: paymentProvider,
        patientId: activePatient.nationalId,
        patientName: activePatient.fullName,
        simulateStatus: paymentSimulateStatus,
        errorCode: paymentSimulateStatus === 'Failed' ? mockDeclineReason : undefined,
        specialty: bookingSpecialty,
        complaintSummary: bookingComplaint,
        prescriptionImageUrl: scannedImage || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop",
        appointmentTime: `${bookingDate}T${bookingTime || "18:00"}:00Z`,
        mockCardNo,
        mockCardName,
        mockWalletPhone
      };

      const res = await fetch("/api/v1/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      
      if (res.ok && result.success) {
        setPaymentSuccessTxnId(result.transactionId);
        // Reload services & notifications
        await loadBookedServices();
        onServiceCreated();
        
        // Show brief success transition
        setTimeout(() => {
          setIsProcessingPayment(false);
          setPaymentSuccessTxnId(null);
          
          if (paymentServiceType === 'OTC') {
            setScreen('videocall');
          } else if (paymentServiceType === 'REV') {
            setScreen('dashboard');
            alert(`تم تأكيد السداد الآمن بنجاح! رقم المعاملة: ${result.transactionId}. تم رفع طلب المراجعة بنجاح لصيدلي المشرق.`);
          } else if (paymentServiceType === 'MMP') {
            setScreen('pillbox');
            alert(`تم تأكيد السداد الآمن بنجاح! رقم المعاملة: ${result.transactionId}. تم تفعيل خدمة تنظيم الدواء المميزة (MMP) بنجاح.`);
          }
          
          // Clear inputs
          setBookingComplaint("");
          setScannedImage("");
        }, 2200);
      } else {
        setIsProcessingPayment(false);
        setPaymentErrorMessage(result.message || "فشلت عملية الدفع ومصادقة التفويض المصرفي.");
      }
    } catch (err) {
      console.error("Payment submission error:", err);
      setIsProcessingPayment(false);
      setPaymentErrorMessage("حدث خطأ تقني غير متوقع في محاولة سداد المعاملة المصرفية.");
    }
  };

  // Profile data editing triggers
  const [editAllergies, setEditAllergies] = useState(false);
  const [editedDrugAllergies, setEditedDrugAllergies] = useState<string[]>([]);
  const [editedFoodAllergies, setEditedFoodAllergies] = useState<string[]>([]);

  // Habits & Lifestyle Edit States
  const [editedMealsCount, setEditedMealsCount] = useState<number>(3);
  const [editedMealsTiming, setEditedMealsTiming] = useState<string>("");
  const [editedMealsType, setEditedMealsType] = useState<string>("");
  const [editedCoffee, setEditedCoffee] = useState<boolean>(false);
  const [editedTea, setEditedTea] = useState<boolean>(false);
  const [editedDrinksDetails, setEditedDrinksDetails] = useState<string>("");
  const [editedSmokingType, setEditedSmokingType] = useState<'Cigarettes' | 'Vape' | 'Shisha' | 'None'>('None');
  const [editedAlcoholLevel, setEditedAlcoholLevel] = useState<AlcoholLevel>('None');
  const [editedSubstanceAbuse, setEditedSubstanceAbuse] = useState<string[]>([]);
  const [editedPhysicalActivity, setEditedPhysicalActivity] = useState<PhysicalActivity>('Moderate');
  const [editedProfession, setEditedProfession] = useState<string>("");
  const [editedSleepTiming, setEditedSleepTiming] = useState<string>("");
  const [editedSleepHours, setEditedSleepHours] = useState<number>(8);
  const [editedSleepQuality, setEditedSleepQuality] = useState<'Poor' | 'Fair' | 'Good' | 'Excellent'>('Good');
  
  // Vision States
  const [editedWearsGlasses, setEditedWearsGlasses] = useState<boolean>(false);
  const [editedVisionType, setEditedVisionType] = useState<'Hyperopia' | 'Myopia' | 'Astigmatism' | 'Reading' | 'None'>('None');
  const [editedHasLasik, setEditedHasLasik] = useState<boolean>(false);
  
  // Sub-tabs for Lifestyle Screen
  const [lifestyleTab, setLifestyleTab] = useState<'food' | 'drinks' | 'activity' | 'profession' | 'sleep' | 'vision'>('food');

  // Personal Medications editing
  const [editedCurrentMedications, setEditedCurrentMedications] = useState<CurrentMedication[]>([]);
  const [quickMedName, setQuickMedName] = useState<string>("");
  const [quickMedIngredient, setQuickMedIngredient] = useState<string>("");
  const [quickMedDose, setQuickMedDose] = useState<string>("");

  const toggleDrugAllergy = (allergy: string) => {
    setEditedDrugAllergies(prev => 
      prev.includes(allergy) ? prev.filter(a => a !== allergy) : [...prev, allergy]
    );
  };

  const toggleFoodAllergy = (allergy: string) => {
    setEditedFoodAllergies(prev => 
      prev.includes(allergy) ? prev.filter(f => f !== allergy) : [...prev, allergy]
    );
  };

  const handleSaveProfileHealth = async () => {
    const updatedProfile: PatientProfile = {
      ...activePatient,
      allergies: {
        drugAllergies: editedDrugAllergies,
        foodAllergies: editedFoodAllergies,
        otherAllergies: activePatient.allergies.otherAllergies
      },
      lifestyle: {
        ...activePatient.lifestyle,
        meals: {
          count: editedMealsCount,
          timing: editedMealsTiming,
          type: editedMealsType
        },
        drinks: {
          coffee: editedCoffee,
          tea: editedTea,
          details: editedDrinksDetails
        },
        smoking: {
          isSmoking: editedSmokingType !== "None",
          type: editedSmokingType,
          level: activePatient.lifestyle?.smoking?.level || 'None'
        },
        alcohol: {
          level: editedAlcoholLevel
        },
        substanceAbuse: editedSubstanceAbuse,
        physicalActivity: editedPhysicalActivity,
        profession: editedProfession,
        sleep: {
          timing: editedSleepTiming,
          hours: editedSleepHours,
          quality: editedSleepQuality
        }
      },
      vision: {
        wearsGlasses: editedWearsGlasses,
        type: editedVisionType,
        hasLasik: editedHasLasik
      },
      currentMedications: editedCurrentMedications
    };

    try {
      const res = await fetch("/api/v1/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile)
      });
      if (res.ok) {
        onReloadPatients();
        setEditAllergies(false);
        setScreen('dashboard');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addDependent = () => {
    if (!newDepName || !newDepNId) {
      alert("يرجى ملء اسم التابع والرقم القومي");
      return;
    }
    if (newDepNId.length !== 14) {
      alert("الرقم القومي المصري يجب أن يكون 14 رقماً");
      return;
    }
    if (dependents.length >= 5) {
      alert("أقصى عدد للتابعين هو 5 أفراد لكل هاتف محمول مسبق الدفع");
      return;
    }

    setDependents(prev => [...prev, { name: newDepName, relation: newDepRelation, nationalId: newDepNId }]);
    setNewDepName("");
    setNewDepNId("");
  };

  // Simulated push notifications helper engines
  const triggerAudioPing = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
      
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(1046.5, audioCtx.currentTime); 
        gain2.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.15);
      }, 150);
    } catch (e) {
      // standard limits
    }
  };

  const loadNotifications = async (retryCount = 0) => {
    if (!activePatient) return;
    try {
      const res = await fetch(`/api/v1/notifications?recipient=patient&patientId=${activePatient.nationalId}`);
      if (res.ok) {
        const data: AppNotification[] = await res.json();
        setNotifications(data || []);
        
        // Find if there is any unread notification we haven't shown as a push alert popup yet
        const newUnread = data.find(n => !n.read && !shownPushIdsRef.current.has(n.id));
        if (newUnread) {
          setActivePush(newUnread);
          shownPushIdsRef.current.add(newUnread.id);
          triggerAudioPing();
          // Trigger system push notification (FCM style)
          triggerLocalNativeNotification(newUnread.title, newUnread.body, newUnread.metadata);
          
          setTimeout(() => {
            setActivePush(null);
          }, 5000);
        }
      } else if (res.status >= 500 && retryCount < 3) {
        setTimeout(() => loadNotifications(retryCount + 1), 2000);
      }
    } catch (err) {
      if (retryCount < 3) {
        setTimeout(() => loadNotifications(retryCount + 1), 2000);
      } else {
        console.warn("Patient notifications fetch warning:", err);
      }
    }
  };

  const markNotifAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/notifications/${id}/read`, { method: "PUT" });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        loadNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerMedicationReminders = async () => {
    if (!activePatient) return;
    try {
      const res = await fetch("/api/v1/notifications/trigger-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: activePatient.nationalId })
      });
      if (res.ok) {
        loadNotifications();
      }
    } catch (err) {
      console.error("Error triggering med plan reminders:", err);
    }
  };

  const loadBookedServices = async (retryCount = 0) => {
    try {
      const res = await fetch("/api/v1/services");
      if (res.ok) {
        const data = await res.json();
        setBookedServices(data || {otc: [], revisions: [], plan: []});
      } else if (res.status >= 500 && retryCount < 3) {
        setTimeout(() => loadBookedServices(retryCount + 1), 2000);
      }
    } catch (err) {
      if (retryCount < 3) {
        setTimeout(() => loadBookedServices(retryCount + 1), 2000);
      } else {
        console.error("Error loading booked services:", err);
      }
    }
  };

  const triggerAppointmentReminders = async () => {
    if (!activePatient) return;
    try {
      const res = await fetch("/api/v1/notifications/trigger-appointment-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: activePatient.nationalId })
      });
      if (res.ok) {
        await loadNotifications();
        await loadBookedServices();
      }
    } catch (err) {
      console.error("Error triggering appointment reminders:", err);
    }
  };

  useEffect(() => {
    shownPushIdsRef.current = new Set();
    setActivePush(null);
    loadNotifications();
    loadBookedServices();
    if (activePatient) {
      setMockCardName(activePatient.fullName);
      // Auto register for push updates
      registerPushNotifications(activePatient.nationalId, 'patient')
        .then(info => setPushRegistrationInfo(info))
        .catch(err => console.warn("[Push SDK] Auto-reg failed:", err));
    }
  }, [activePatientId, activePatient?.nationalId]);

  useEffect(() => {
    loadNotifications();
    loadBookedServices();
    const interval = setInterval(() => {
      loadNotifications();
      loadBookedServices();
    }, 4500);
    return () => clearInterval(interval);
  }, [activePatientId, activePatient?.nationalId]);

  const removeDependent = (idx: number) => {
    setDependents(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="relative mx-auto w-full max-w-[390px] h-[780px] bg-slate-900 rounded-[50px] shadow-2xl border-[10px] border-slate-800 p-3 overflow-hidden font-sans select-none flex flex-col justify-between">
      {/* Phone Notch/Speaker Header */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[22px] bg-slate-800 rounded-b-xl z-50 flex items-center justify-center">
        <div className="w-12 h-[3px] bg-slate-600 rounded-full"></div>
      </div>

      {/* Internal Phone StatusBar */}
      <div className="flex justify-between items-center text-xs text-white px-5 pt-2 pb-1 z-40 bg-slate-950 font-medium">
        <span>13:49 </span>
        <div className="flex items-center space-x-1.5 direction-ltr">
          <span className="text-[9px] bg-emerald-600 text-white px-1 py-0.2 rounded-sm font-bold scale-90">EGP</span>
          <span className="text-[10px] opacity-80 text-teal-400">● 5G (InfoDocs)</span>
        </div>
      </div>

      {/* Primary Container App Flow */}
      <div className="flex-1 bg-slate-50 overflow-y-auto relative flex flex-col justify-between text-right leading-relaxed" style={{ direction: "rtl" }}>
        
        {/* PHYSICAL SIMULATED PUSH NOTIFICATION ALERT DROPDOWN */}
        {activePush && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 12, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 150 }}
            onClick={() => {
              markNotifAsRead(activePush.id);
              if (activePush.type === 'ReportSigned') {
                setScreen('overview');
              } else if (activePush.type === 'PillReminder') {
                setScreen('pillbox');
              }
              setActivePush(null);
            }}
            className="absolute top-4 left-3 right-3 bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 border border-slate-700/60 shadow-2xl z-50 text-right cursor-pointer flex flex-col space-y-1 font-sans"
          >
            <div className="flex justify-between items-center text-teal-400 font-bold text-[11px] mb-0.5" style={{ direction: "rtl" }}>
              <span className="text-[10px] text-teal-400 font-bold">{activePush.title}</span>
              <span className="flex items-center space-x-1.5 space-x-reverse justify-end font-normal">
                <span className="text-[9px] text-slate-400">الآن • InfoDoctors</span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              </span>
            </div>
            <p className="text-white text-[10.5px] leading-relaxed text-right font-medium">{activePush.body}</p>
          </motion.div>
        )}

        {/* HEADER SECTION */}
        {screen !== 'dashboard' && (
          <div className="bg-teal-700 text-white p-3 pt-4 flex items-center justify-between shadow-md">
            <button onClick={() => setScreen('dashboard')} className="p-1 hover:bg-teal-800 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-teal-100" />
            </button>
            <h2 className="text-md font-bold tracking-tight">
              {screen === 'profile' && "الملف الطبي الصحي الشامل"}
              {screen === 'overview' && "ملف السلامة والتقارير الطبية"}
              {screen === 'otc-book' && "حجز استشارة صيدلانية OTC"}
              {screen === 'rev-book' && "مراجعة الروشتة والأدوية"}
              {screen === 'pillbox' && "علبة الأدوية الرقمية"}
              {screen === 'insights' && "تحليلات وامتثال الأدوية"}
              {screen === 'scanner' && "ماسح الروشتة الضوئي"}
              {screen === 'payment' && "بوابة الدفع الإلكتروني"}
              {screen === 'videocall' && "العيادة الإلكترونية المباشرة"}
              {screen === 'auth' && "حساب المحاكاة الآمن (JWT)"}
              {screen === 'pharmacists' && "دليل الصيدلانيين والشهادات والتقييمات"}
            </h2>
            <button 
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-1.5 hover:bg-teal-800 rounded-full transition-colors focus:outline-none cursor-pointer"
              title="تنبيهات الصيدلية والجرعات"
            >
              <Bell className="w-5 h-5 text-teal-100" />
              {totalAlertCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-600 text-[9px] text-white font-extrabold rounded-full flex items-center justify-center animate-pulse shadow-sm border border-teal-800">
                  {totalAlertCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* SCREEN FLOW ROUTERS */}
        {screen === 'dashboard' && (
          <div className="flex-1 flex flex-col justify-between bg-slate-50 p-4 pt-6 space-y-4">
            
            {/* Top User Profile Ring */}
            <div className="bg-gradient-to-br from-teal-700 to-cyan-800 rounded-3xl p-4 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-[-30px] left-[-30px] w-24 h-24 bg-teal-600 opacity-20 rounded-full"></div>
              <div className="flex items-center space-x-3 space-x-reverse justify-between relative z-10">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="relative group">
                    <button
                      onClick={() => setIsPhotoUploaderOpen(true)}
                      className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-teal-200 font-bold text-xl border border-white/30 overflow-hidden shadow-inner cursor-pointer hover:opacity-90 transition-all"
                      title="التقاط أو تخصيص الصورة الشخصية"
                    >
                      {activePatient?.profilePhotoUrl ? (
                        <img
                          src={activePatient.profilePhotoUrl}
                          alt={activePatient.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        activePatient?.fullName[0] || "م"
                      )}
                    </button>
                    <button
                      onClick={() => setIsPhotoUploaderOpen(true)}
                      className="absolute -bottom-1 -left-1 w-5 h-5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-full flex items-center justify-center border border-white shadow-md cursor-pointer transition-all hover:scale-110"
                      title="التقاط أو تغيير الصورة الشخصية بالكاميرا"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>
                  <div>
                    <p className="text-xs text-teal-100">مرحباً بك في InfoDoctors</p>
                    <h3 className="font-bold text-base text-white">{activePatient?.fullName}</h3>
                  </div>
                </div>
                
                {/* Switch quick dropdown with interactive Bell action button */}
                <div className="flex items-center space-x-1.5 space-x-reverse justify-end font-sans">
                  <select 
                    value={activePatientId} 
                    onChange={(e) => {
                      setActivePatientId(e.target.value);
                    }}
                    className="bg-teal-900/50 text-[11px] text-white border border-teal-500/30 rounded-lg p-1.5 font-bold outline-none cursor-pointer"
                  >
                    {patients.map(p => (
                      <option key={p.nationalId} value={p.nationalId} className="text-slate-800 bg-white">
                        👤 {p.fullName}
                      </option>
                    ))}
                  </select>

                  <button 
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    className="relative p-1.5 bg-teal-900/50 hover:bg-teal-800/80 border border-teal-500/30 rounded-lg cursor-pointer text-white transition-all flex items-center justify-center focus:outline-none"
                    title="تنبيهات الصيدلية والجرعات"
                  >
                    <Bell className="w-3.5 h-3.5 text-teal-200" />
                    {totalAlertCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-600 text-white text-[8px] font-extrabold rounded-full flex items-center justify-center animate-pulse border border-teal-900 shadow-sm">
                        {totalAlertCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Patient Core Summary info banner */}
              <div className="bg-teal-950/40 p-2.5 rounded-xl rounded-t-none mt-3 -mx-4 -mb-4 flex justify-between text-[11px] text-teal-100 border-t border-white/10">
                <span>الرقم القومي: {activePatient?.nationalId.slice(0, 4)}...{activePatient?.nationalId.slice(-4)}</span>
                <span className="bg-teal-500/30 px-2 py-0.5 rounded text-teal-200">
                  فصيلة الدم: {activePatient?.bloodGroup || "A+"}
                </span>
              </div>
            </div>

            {/* Dynamic JWT Authentication Status Indicator */}
            {currentUser ? (
              <div className="bg-emerald-950 border border-emerald-800 p-3 rounded-2xl flex items-center justify-between text-right" style={{ direction: "rtl" }}>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-8 h-8 rounded-xl bg-emerald-900/60 flex items-center justify-center text-emerald-400">
                    <Fingerprint className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[11px] text-white">جلسة مريض معتمدة بطلب JWT</h5>
                    <p className="text-[9.5px] text-emerald-400 leading-tight font-mono">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setScreen('auth')}
                  className="text-[9.5px] bg-emerald-900 border border-emerald-700 hover:bg-emerald-800 px-2.5 py-1.5 rounded-xl text-white font-bold cursor-pointer transition-all focus:outline-none"
                >
                  إدارة الجلسة
                </button>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-center justify-between text-right" style={{ direction: "rtl" }}>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[11px] text-amber-950">بوابة الدخول للحساب الرقمي المؤمّن</h5>
                    <p className="text-[9.5px] text-amber-800 leading-tight">سجل حسابك أو دخولك الآن لتجرّب تفعيل منبهات الأدوية</p>
                  </div>
                </div>
                <button
                  onClick={() => setScreen('auth')}
                  className="text-[9.5px] bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-xl text-white font-bold cursor-pointer transition-all focus:outline-none"
                >
                  دخول / تسجيل
                </button>
              </div>
            )}

            {/* SUMMARY STATISTICS COMPONENT: Prescription count, upcoming consultations, medication adherence % */}
            <PatientPortalSummaryStats
              patient={activePatient}
              bookedServices={bookedServices}
              takenDosesCount={Object.values(pillStatus).filter(Boolean).length || 15}
              skippedDosesCount={Object.values(skippedAlarms).filter(Boolean).length || 1}
              reportsCount={reports.length || 2}
              onNavigateToScreen={(scr) => setScreen(scr as any)}
            />

            {/* MEDICATION ADHERENCE ALERTS & UPCOMING SCHEDULE LIST */}
            <MedicationScheduleAlerts
              patient={activePatient}
              showScheduleOnlyOnDashboard={true}
              onDoseTaken={(doseId) => setPillStatus(prev => ({ ...prev, [doseId]: true }))}
              onDoseSkipped={(doseId) => setSkippedAlarms(prev => ({ ...prev, [doseId]: true }))}
              onDoseSnoozed={(doseId) => setSnoozedAlarms(prev => ({ ...prev, [doseId]: { time: new Date().toISOString(), count: (prev[doseId]?.count || 0) + 1 } }))}
              onAddNotification={(notif) => setNotifications(prev => [{
                id: `notif-${Date.now()}`,
                recipient: 'patient',
                title: notif.title,
                body: notif.body,
                type: notif.type as any,
                read: false,
                createdAt: new Date().toISOString()
              }, ...prev])}
            />

            {/* RECENT NOTIFICATIONS COMPONENT: Reminders for upcoming appointments & prescription audit results */}
            <RecentNotifications
              notifications={notifications}
              patient={activePatient}
              onMarkAsRead={(notifId) => setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n))}
              onMarkAllAsRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
              onNavigateToScreen={(scr) => setScreen(scr as any)}
              onSelectAuditReport={(repId) => {
                const rep = reports.find(r => r.id === repId) || reports[0];
                if (rep) setSelectedReport(rep);
                setScreen('reports');
              }}
            />

            {/* Interactive Patient Overview bento trigger */}
            <button
              onClick={() => {
                setScreen('overview');
              }}
              className="w-full text-right p-3.5 bg-gradient-to-br from-amber-50 to-orange-50/40 hover:from-amber-100 hover:to-orange-100/60 border border-amber-200 rounded-2xl shadow-xs flex items-center justify-between transition-all group hover:border-amber-300"
            >
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center group-hover:bg-amber-600 transition-colors">
                  <HeartPulse className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-[12.5px] text-amber-950 flex items-center space-x-1.5 space-x-reverse">
                    <span>السجل العلاجي والملخص الموحد</span>
                    <span className="flex h-1.5 w-1.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                    </span>
                  </h5>
                  <p className="text-[10px] text-amber-800 leading-tight mt-0.5 font-medium">التحذيرات النشطة، المؤشرات الحيوية والتقارير الصيدلانية</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
            </button>

            {/* PHARMACISTS DIRECTORY & PROFILES TRIGGER CARD */}
            <button
              onClick={() => setScreen('pharmacists')}
              className="w-full text-right p-3.5 bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white rounded-2xl shadow-md border border-teal-500/30 flex items-center justify-between transition-all hover:scale-[1.01] cursor-pointer"
            >
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 bg-teal-500/20 text-teal-300 border border-teal-400/30 rounded-xl flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5 text-teal-300" />
                </div>
                <div>
                  <h5 className="font-black text-[13px] text-white flex items-center gap-1.5">
                    <span>دليل الصيدلانيين والشهادات والتقييمات</span>
                    <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black px-2 py-0.5 rounded-full shadow-2xs">جديد ⭐</span>
                  </h5>
                  <p className="text-[10.5px] text-teal-200">افحص ملفات الصيدلانيين، التراخيص والشهادات وتقييمات المرضى</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-teal-300" />
            </button>

            {/* Premium Services Grid */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-xs px-1">الخدمات السريرية المدفوعة</h4>
              
              {/* Service A: OTC Consultation */}
              <button 
                onClick={() => {
                  setScreen('otc-book');
                }}
                className="w-full text-right p-3.5 bg-white hover:bg-teal-50/50 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between transition-all group hover:border-teal-300"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors duration-200">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[13px] text-slate-900">طلب استشارة صيدلانية OTC</h5>
                    <p className="text-[11px] text-slate-500">حجز موعد فوري وتشخيص آمن مع وصف أدوية</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Service B: Prescription Revision */}
              <button 
                onClick={() => {
                  setScreen('rev-book');
                }}
                className="w-full text-right p-3.5 bg-white hover:bg-cyan-50/50 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between transition-all group hover:border-cyan-300"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-cyan-100 text-cyan-700 rounded-xl flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[13px] text-slate-900">طلب مراجعة وصفة طبية (DUR)</h5>
                    <p className="text-[11px] text-slate-500">رفع صورة الروشتة وتدقيق الأمان والتداخلات الدوائية</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Service C: Pill Box & Medication Management */}
              <button 
                onClick={() => {
                  setScreen('pillbox');
                }}
                className="w-full text-right p-3.5 bg-white hover:bg-indigo-50/50 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between transition-all group hover:border-indigo-300"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[13px] text-slate-900">علبة الأدوية الرقمية المنبهة</h5>
                    <p className="text-[11px] text-slate-500">جدولة أوقات الجرعات والامتثال الدوائي</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Service D: Medication Compliance & Insights */}
              <button 
                onClick={() => {
                  setScreen('insights');
                }}
                className="w-full text-right p-3.5 bg-white hover:bg-teal-50/50 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between transition-all group hover:border-teal-300"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-teal-50 text-teal-700 rounded-xl flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[13px] text-slate-900">تحليلات الالتزام وامتثال الدواء</h5>
                    <p className="text-[11px] text-slate-500">مراقبة الرسوم البيانية للجرعات الملغاة والمأخوذة لآخر ٣٠ يوماً</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Booked Appointments & Real-time Reminders Tracker */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 space-y-3 text-right shadow-xs">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-[10px] bg-sky-50 text-sky-800 px-2 py-0.5 rounded-full font-bold">
                  {allPatientBookings.length} حجوزات ومواعيد
                </span>
                <h5 className="font-extrabold text-slate-800 text-xs flex items-center space-x-1.5 space-x-reverse">
                  <Calendar className="w-4 h-4 text-sky-600 animate-pulse" />
                  <span>أجندة المواعيد والاستشارات النشطة</span>
                </h5>
              </div>

              {allPatientBookings.length === 0 ? (
                <div className="text-center py-4 text-[11px] text-slate-400 space-y-1">
                  <p className="font-medium text-slate-500">لا توجد استشارات أو مراجعات مجدولة حالياً.</p>
                  <p className="text-[9.5px] text-slate-400 leading-normal">احجز استشارة OTC أو ارفع روشتة لجدولة موعد لقاء صيدلاني.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-0.5">
                  {allPatientBookings.map((bk) => {
                    const bkDate = new Date(bk.appointmentTime);
                    const isInvalidDate = isNaN(bkDate.getTime());
                    const readableDate = isInvalidDate ? "اليوم" : bkDate.toLocaleDateString('ar-EG');
                    const readableTime = isInvalidDate ? "فوري" : bkDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <div key={bk.id} className="bg-slate-55 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-right transition-all hover:bg-slate-100/50">
                        <div className="flex space-x-1 shrink-0">
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch("/api/v1/notifications/trigger-appointment-reminders", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ patientId: activePatient.nationalId })
                                });
                                if (res.ok) {
                                  await loadNotifications();
                                  alert(`🛎️ تم إطلاق جرس تذكير موعد اللقاء المتبادل بنجاح للمريض وللصيدلي الإكلينيكي!`);
                                }
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                            className="bg-sky-500 hover:bg-sky-600 p-2 rounded-xl text-white font-bold text-[10px] flex items-center justify-center transition-all cursor-pointer shadow-xs focus:outline-none shrink-0"
                            title="إرسال منبّه الدفع الفوري بالموعد"
                          >
                            <Bell className="w-3.5 h-3.5 text-white animate-bounce" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setScreen('videocall');
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 p-2 rounded-xl text-white font-bold text-[10px] flex items-center justify-center transition-all cursor-pointer shadow-xs focus:outline-none shrink-0"
                            title="انضمام لمكالمة الفيديو المرئية"
                          >
                            <Video className="w-3.5 h-3.5 text-white animate-pulse" />
                          </button>
                        </div>
                        
                        <div className="flex-1 px-3 space-y-0.5 text-right">
                          <div className="flex items-center space-x-1.5 justify-end">
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              bk.status === 'In-Waiting' ? 'bg-amber-100 text-amber-800' :
                              bk.status === 'Ongoing' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-slate-200 text-slate-700'
                            }`}>
                              {bk.status === 'In-Waiting' ? 'مجدول' :
                               bk.status === 'Ongoing' ? 'جاري الآن' : 'مكتمل'}
                            </span>
                            <h6 className="font-bold text-slate-800 text-[11px]">{bk.typeLabel}</h6>
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center justify-end space-x-1.5">
                            <span className="font-mono text-[9px] bg-slate-200/60 px-1 rounded text-slate-600 font-bold">
                              {bk.id}
                            </span>
                            <span className="text-[9.5px] leading-none font-medium">
                              📅 {readableDate} - {readableTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Record Management Panel & Dependents */}
            <div className="bg-slate-100/80 rounded-2xl p-3 border border-slate-200 space-y-2 text-right">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                  {dependents.length} مرافقين
                </span>
                <h5 className="font-bold text-slate-800 text-xs">إدارة ملفات العائلة والتابعين</h5>
              </div>

              {/* Action: edit patient properties */}
              <div className="flex space-x-2 space-x-reverse mt-1">
                <button 
                  onClick={() => {
                    setEditedDrugAllergies(activePatient?.allergies?.drugAllergies || []);
                    setEditedFoodAllergies(activePatient?.allergies?.foodAllergies || []);
                    
                    // Habits & Lifestyle
                    setEditedMealsCount(activePatient?.lifestyle?.meals?.count ?? 3);
                    setEditedMealsTiming(activePatient?.lifestyle?.meals?.timing ?? "");
                    setEditedMealsType(activePatient?.lifestyle?.meals?.type ?? "");
                    setEditedCoffee(activePatient?.lifestyle?.drinks?.coffee ?? false);
                    setEditedTea(activePatient?.lifestyle?.drinks?.tea ?? false);
                    setEditedDrinksDetails(activePatient?.lifestyle?.drinks?.details ?? "");
                    setEditedSmokingType(activePatient?.lifestyle?.smoking?.type ?? "None");
                    setEditedAlcoholLevel(activePatient?.lifestyle?.alcohol?.level ?? "None");
                    setEditedSubstanceAbuse(activePatient?.lifestyle?.substanceAbuse || []);
                    setEditedPhysicalActivity(activePatient?.lifestyle?.physicalActivity ?? "Moderate");
                    setEditedProfession(activePatient?.lifestyle?.profession ?? "");
                    setEditedSleepTiming(activePatient?.lifestyle?.sleep?.timing ?? "");
                    setEditedSleepHours(activePatient?.lifestyle?.sleep?.hours ?? 8);
                    setEditedSleepQuality(activePatient?.lifestyle?.sleep?.quality ?? "Good");
                    
                    // Vision states
                    setEditedWearsGlasses(activePatient?.vision?.wearsGlasses ?? false);
                    setEditedVisionType(activePatient?.vision?.type ?? "None");
                    setEditedHasLasik(activePatient?.vision?.hasLasik ?? false);
                    
                    // Current Medications copy
                    setEditedCurrentMedications(activePatient?.currentMedications || []);
                    setQuickMedName("");
                    setQuickMedIngredient("");
                    setQuickMedDose("");
                    
                    setLifestyleTab('food');
                    setScreen('profile');
                  }}
                  className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-center py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 space-x-reverse"
                >
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span>تعديل ملفي الصحي الشامل</span>
                </button>
              </div>

              {/* Mini quick dependent listing */}
              <div className="space-y-1.5 pt-1.5 border-t border-slate-200 max-h-[85px] overflow-y-auto">
                {dependents.map((dep, index) => (
                  <div key={index} className="bg-white/90 p-1.5 px-2.5 rounded-lg flex items-center justify-between text-[11px] shadow-xs border border-slate-150">
                    <button 
                      onClick={() => removeDependent(index)}
                      className="text-red-500 hover:text-red-700 p-0.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center space-x-1.5 space-x-reverse">
                      <span className="text-slate-400 text-[9px] bg-slate-100 px-1 py-0.2 rounded font-medium">({dep.relation})</span>
                      <span className="font-bold text-slate-800">{dep.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Predefined Educational Health Badge */}
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex items-start space-x-2.5 space-x-reverse text-right">
              <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h6 className="text-[11px] font-bold text-emerald-900">نظام توجيه السلامة التلقائي</h6>
                <p className="text-[10px] text-emerald-700 leading-tight">جميع خدمات الصيدلية بموجب ميثاق الهيئة العامة المصرية للدواء وتدعم التوصية الآمنة لـ DDI.</p>
              </div>
            </div>

          </div>
        )}

        {/* SCREEN: SECURITY AUTHENTICATION INTERFACE */}
        {screen === 'auth' && (
          <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-50 flex flex-col justify-start">
            <AuthInterface 
              role="patient"
              currentUser={currentUser}
              onAuthSuccess={(token, user) => {
                onAuthSuccess(token, user);
                setScreen('dashboard');
              }}
              onLogout={() => {
                onLogout();
                setScreen('dashboard');
              }}
            />
          </div>
        )}

        {/* SCREEN: EDIT MEDICAL PROFILE */}
        {screen === 'profile' && (
          <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-white">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">تعديل ملف الصحة والتحسس الخاص بك</h3>
              <p className="text-[11px] text-slate-500">يحفظ هذا التعديل مباشرة في المستودع المرجعي للمشاركة مع مدققك الصيدلي.</p>
            </div>

            {/* Profile Picture Personalization Banner Card */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 p-3.5 rounded-2xl flex items-center justify-between shadow-2xs">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-xl border-2 border-white shadow-md overflow-hidden">
                    {activePatient?.profilePhotoUrl ? (
                      <img
                        src={activePatient.profilePhotoUrl}
                        alt={activePatient.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      activePatient?.fullName[0] || "م"
                    )}
                  </div>
                  <button
                    onClick={() => setIsPhotoUploaderOpen(true)}
                    className="absolute -bottom-1 -left-1 bg-teal-600 hover:bg-teal-700 text-white p-1 rounded-full border-2 border-white shadow-md transition-all hover:scale-110 cursor-pointer"
                    title="تحديث الصورة الكاميرا"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-800">{activePatient?.fullName}</h4>
                  <p className="text-[10.5px] text-teal-700 font-bold">الصورة الشخصية المعتمدة للملف الطبي</p>
                  <span className="text-[9.5px] text-slate-500 block">يمكنك التقاط صورة مباشرة من الكاميرا 📸</span>
                </div>
              </div>

              <button
                onClick={() => setIsPhotoUploaderOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>تغيير 📸</span>
              </button>
            </div>

            {/* Demographics indicators */}
            <div className="grid grid-cols-2 gap-2 text-right">
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-[10px] text-slate-400 block">العمر المعتمد</span>
                <span className="text-xs font-medium text-slate-800">36 عاماً (ديناميكي)</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-[10px] text-slate-400 block">الرقم القومي</span>
                <span className="text-xs font-mono font-medium text-slate-800">{activePatient?.nationalId}</span>
              </div>
            </div>

            {/* Allergy Modification Block */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-teal-600 font-bold">تعديل الحساسيات الدوائية والغذائية</span>
                <h4 className="font-bold text-slate-700 text-xs text-right">🔴 التحسسات والتفاعلات</h4>
              </div>

              {/* Drug Allergies Checklist */}
              <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 space-y-2">
                <span className="text-[10px] font-bold text-red-800 block">حساسية ضد الأدوية المتداولة:</span>
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {["Aspirin", "Penicillin", "Sulfa", "Ibuprofen"].map((med) => {
                    const active = editedDrugAllergies.includes(med);
                    return (
                      <button
                        key={med}
                        type="button"
                        onClick={() => toggleDrugAllergy(med)}
                        className={`text-[11px] py-1 px-2.5 rounded-full border transition-all ${
                          active 
                            ? "bg-red-600 text-white border-red-600 font-bold" 
                            : "bg-white text-slate-700 border-slate-200"
                        }`}
                      >
                        {med === 'Aspirin' ? 'أسبرين (Aspirin)' : med === 'Penicillin' ? 'بنسلين (Penicillin)' : med === 'Sulfa' ? 'سلفا (Sulfa)' : 'ايبوبروفين'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Food Allergies Checklist */}
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 space-y-2">
                <span className="text-[10px] font-bold text-amber-800 block">حساسية طعام معرقلة للأيض الغذائي:</span>
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {["Chocolate", "Strawberry", "Banana", "Gluten", "Nuts"].map((food) => {
                    const active = editedFoodAllergies.includes(food);
                    return (
                      <button
                        key={food}
                        type="button"
                        onClick={() => toggleFoodAllergy(food)}
                        className={`text-[11px] py-1 px-2.5 rounded-full border transition-all ${
                          active 
                            ? "bg-amber-600 text-white border-amber-600 font-bold" 
                            : "bg-white text-slate-700 border-slate-200"
                        }`}
                      >
                        {food === 'Chocolate' ? 'شوكولاتة' : food === 'Strawberry' ? 'فراولة' : food === 'Banana' ? 'موز' : food === 'Gluten' ? 'جلوتين' : 'مكسرات'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Habits & Lifestyle and Pregnant parameters Section */}
            <div className="space-y-2 border-t border-slate-100 pt-3 text-right">
              <h4 className="font-extrabold text-slate-800 text-xs text-right">⚙️ قسم العادات ونمط الحياة (Habits & Lifestyle)</h4>
              
              {/* Tabs list inside medical profile */}
              <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl gap-1 justify-end">
                {[
                  { key: 'food', label: '🥗 Dietary Habits (بيانات الغذاء)' },
                  { key: 'drinks', label: '☕ Stimulants & Drinks (المنبهات والمشروبات)' },
                  { key: 'activity', label: '🏃 Physical Activity (الجهد والنشاط البني)' },
                  { key: 'sleep', label: '💤 Sleep Quality (جودة وفترة النوم)' },
                  { key: 'profession', label: '💼 المهنة والوظيفة' },
                  { key: 'vision', label: '👓 مقياس النظر' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setLifestyleTab(tab.key as any)}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold text-center transition-all ${
                      lifestyleTab === tab.key 
                        ? "bg-white text-teal-800 shadow-sm font-black border border-teal-200/50" 
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB CONTENT: FOOD */}
              {lifestyleTab === 'food' && (
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl space-y-2 text-right">
                  <div className="border-b border-slate-200/60 pb-2 mb-1">
                    <span className="text-[11px] font-extrabold text-teal-800 block">🥗 Dietary Habits Profile (الملف التغذوي والعادات الغذائية)</span>
                    <p className="text-[9px] text-slate-500">تفاصيل العادات الغذائية لتتبع انتظام الوجبات وتأثيرها الدوائي</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-700 block">🥗 عدد الوجبات اليومية المعتادة:</label>
                    <select
                      value={editedMealsCount}
                      onChange={(e) => setEditedMealsCount(Number(e.target.value))}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>
                          {num === 1 ? 'وجبة واحدة يومياً' : num === 2 ? 'وجبتين يومياً' : `${num} وجبات يومياً`}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-700 block">🕒 مواعيد تناول الوجبات بالتحديد:</label>
                    <input
                      type="text"
                      placeholder="امثلة: الإفطار 9ص، الغداء 4م، العشاء 10م"
                      value={editedMealsTiming}
                      onChange={(e) => setEditedMealsTiming(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white outline-none text-right"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-700 block">🌾 نوعية الوجبات ونظام الغذاء الغالب:</label>
                    <input
                      type="text"
                      placeholder="امثلة: أكل منزلي خضار، وجبات سريعة، كيتو دايت، غني بالكربوهيدرات"
                      value={editedMealsType}
                      onChange={(e) => setEditedMealsType(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white outline-none text-right"
                    />
                  </div>
                </div>
              )}

              {/* TAB CONTENT: DRINK / SMOKING / SUBSTANCE ABUSE */}
              {lifestyleTab === 'drinks' && (
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl space-y-2 text-right">
                  <div className="border-b border-slate-200/60 pb-2 mb-1">
                    <span className="text-[11px] font-extrabold text-amber-800 block">☕ Stimulants & Drinks (سجل المنبهات والمشروبات والتبغ)</span>
                    <p className="text-[9px] text-slate-500">سجل عادات تعاطي الكافيين والتبغ والمؤثرات لسلامة التداخلات الدوائية والسريرية</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-700 block">☕ المشروبات المنبهة (الكافيين):</label>
                    <div className="grid grid-cols-2 gap-2 text-right">
                      <button
                        type="button"
                        onClick={() => setEditedCoffee(!editedCoffee)}
                        className={`p-1.5 rounded-lg text-xs font-bold border transition-all flex items-center justify-center space-x-1 space-x-reverse ${
                          editedCoffee ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-white text-slate-600 border-slate-200"
                        }`}
                      >
                        <span>☕ أتناول القهوة</span>
                        {editedCoffee && <span className="text-amber-805">✓</span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditedTea(!editedTea)}
                        className={`p-1.5 rounded-lg text-xs font-bold border transition-all flex items-center justify-center space-x-1 space-x-reverse ${
                          editedTea ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-white text-slate-600 border-slate-200"
                        }`}
                      >
                        <span>🍵 أتناول الشاي</span>
                        {editedTea && <span className="text-amber-805">✓</span>}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-700 block">🚬 نوع التدخين أو الفيب الملازم:</label>
                    <select
                      value={editedSmokingType}
                      onChange={(e) => setEditedSmokingType(e.target.value as any)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white outline-none"
                    >
                      <option value="None">غير مدخن مطلقاً</option>
                      <option value="Cigarettes">سجائر تقليدية (Cigarettes)</option>
                      <option value="Vape">سجائر إلكترونية / شيشة إلكترونية (Vape)</option>
                      <option value="Shisha">شيشة تقليدية (Shisha)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-700 block">🍹 الكحوليات والمشروبات الروحية:</label>
                    <select
                      value={editedAlcoholLevel}
                      onChange={(e) => setEditedAlcoholLevel(e.target.value as any)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white outline-none"
                    >
                      <option value="None">لا أتناول الكحول مطلقاً</option>
                      <option value="Occasional">مناسبات متباعدة جداً (Occasional)</option>
                      <option value="Weekly">جرعات أسبوعية ترفيهية (Weekly)</option>
                      <option value="Daily">جرعات يومية منتظمة (Daily)</option>
                      <option value="Heavy Daily">إفراط يومي كثيف (Heavy Daily)</option>
                    </select>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="text-[10px] font-black text-slate-700 block">💊 مواد أخرى أو مهدئات حساسة دون وصفة (المخدرات):</label>
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {["ترامادول (Tramadol)", "حشيش/كانابيس", "منشطات عصبية", "مهدئات عصبية", "أخرى"].map((item) => {
                        const active = editedSubstanceAbuse.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              setEditedSubstanceAbuse(prev =>
                                prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
                              );
                            }}
                            className={`text-[9.5px] py-1 px-2.5 rounded-full border transition-all ${
                              active 
                                ? "bg-rose-900 text-white border-rose-950 font-bold" 
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>

                    {/* Comforting and reassuring alert box */}
                    <div className="bg-sky-50 border border-sky-100 p-2.5 rounded-xl text-[10px] text-sky-850 leading-relaxed text-right space-y-1 shadow-xs font-semibold">
                      <div className="flex items-center space-x-1 space-x-reverse text-sky-950 justify-end font-bold">
                        <Lock className="w-3.5 h-3.5 text-sky-600" />
                        <span>🔒 ميثاق خصوصية المريض والسرية الطبية التامة:</span>
                      </div>
                      <p>
                        إن هذه البيانات <strong>سرية للغاية ومحمية تشريعياً بموجب حقوق المريض والسرية المهنية الطبية الصارمة</strong> في جمهورية مصر العربية. <strong>أنت في أمان تام؛ لا يمكن قانوناً للجهات الأمنية أو الجنائية طلبها أو استخدام هذه المعلومات ضدك بأي شكل من الأشكال</strong>.
                      </p>
                      <p className="text-teal-700 font-bold">
                        ⚠️ أهمية التنويه للتخدير والطوارئ: تؤثر هذه المواد الكيميائية بشكل بالغ وحاسم على معدلات الاستجابة العصبية ومثبطات الجهاز العصبي المركزي، ومن الضروري جداً معرفتها بواسطة أطباء التخدير وفريق الطوارئ عند اللزوم لتعديل جرعات المخدرات الطبية والتخدير بدقة متناهية، تفادياً للأعراض الإكلينيكية التي تهدد الحياة.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: PHYSICAL ACTIVITY */}
              {lifestyleTab === 'activity' && (
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl space-y-2 text-right">
                  <div className="border-b border-slate-200/60 pb-2 mb-1">
                    <span className="text-[11px] font-extrabold text-indigo-850 block">🏃 Physical Activity (قياس النشاط والجهد البدني)</span>
                    <p className="text-[9px] text-slate-500">تقييم مستويات الجهد البدني والرياضي لتفادي الإجهاد العضلي والقلبي</p>
                  </div>
                  <span className="text-[10px] font-black text-slate-700 block">🏃 مستوى النشاط البدني والحركي المعتاد:</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { key: 'Athlete', label: '🏋️ رياضي محترف (تمرين دائم ومستمر)' },
                      { key: 'Heavy', label: '🏃 هائل / لياقة مكثفة (تمارين 4-5 مرات أسبوعياً)' },
                      { key: 'Moderate', label: '🚶 متوسط / حركة دورية (مشى وعمل متوسط النشاط)' },
                      { key: 'Light', label: '🛋️ منخفض (حركة مكتبية خفيفة)' },
                      { key: 'Sedentary', label: '🦥 منخفض جداً (خمول ملازم للمكتب والمنزل)' }
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setEditedPhysicalActivity(item.key as any)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-right flex justify-between items-center ${
                          editedPhysicalActivity === item.key 
                            ? "bg-teal-50 text-teal-800 border-teal-300 font-black" 
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <span>{editedPhysicalActivity === item.key ? "✓" : ""}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: PROFESSION */}
              {lifestyleTab === 'profession' && (
                <div className="profession-container p-3 bg-slate-50 border border-slate-150 rounded-2xl space-y-3 text-right">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-705 block">💼 اختر من المهن المصرية الشائعة لتسهيل حفظ البيانات:</label>
                    <select
                      value={[
                        "مهندس موقع وإنشاءات",
                        "سائق حافلة / تاكسي / نقل ثقيل",
                        "مبرمج ومطور برمجيات",
                        "موظف مكتبي ومشتريات",
                        "طبيب / ممرض / ممارس صحي طوارئ",
                        "عامل بناء ومصانع (غبار وأتربة)",
                        "محاسب ومصرفي",
                        "مدرس / أستاذ أكاديمي (وقوف مستمر)",
                        "رائد أعمال أو عمل حر",
                        "عامل صيدليات ومرافق خدمة",
                        "شيف وطهي طعام",
                        "رب منزل / ربة منزل",
                        "طالب دراسي",
                        "متقاعد"
                      ].includes(editedProfession) ? editedProfession : "Other"}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== "Other") {
                          setEditedProfession(val);
                        } else {
                          setEditedProfession("");
                        }
                      }}
                      className="w-full text-xs p-2 border border-slate-205 border-slate-200 rounded-lg bg-white outline-none font-bold text-slate-800"
                    >
                      <option value="">-- اختر من المهن الشائعة --</option>
                      <option value="مهندس موقع وإنشاءات">مهندس موقع وإنشاءات (غبار وأتربة ومجهود بدني)</option>
                      <option value="سائق حافلة / تاكسي / نقل ثقيل">سائق حافلة / تاكسي / نقل ثقيل (جلوس مستمر وتأهب حسي)</option>
                      <option value="مبرمج ومطور برمجيات">مبرمج ومطور برمجيات (ساعات مكتبية طويلة وإجهاد بصري)</option>
                      <option value="موظف مكتبي ومشتريات">موظف مكتبي ومسؤول مشتريات (جلوس مكتبي روتيني)</option>
                      <option value="طبيب / ممرض / ممارس صحي طوارئ">طبيب / ممرض / ممارس صحي طوارئ (ضغط عصبي ونوبات سهر)</option>
                      <option value="عامل بناء ومصانع (غبار وأتربة)">عامل بناء ومصانع (استنشاق غبار وأعمال بدنية شاقة)</option>
                      <option value="محاسب ومصرفي">محاسب ومصرفي (حسابات مكثفة وملازمة للمكتب)</option>
                      <option value="مدرس / أستاذ أكاديمي (وقوف مستمر)">مدرس / أستاذ أكاديمي (وقوف مستمر وبذل صوتي)</option>
                      <option value="رائد أعمال أو عمل حر">رائد أعمال أو عمل حر (أوقات غير منتظمة وضغوط تشغيل)</option>
                      <option value="عامل صيدليات ومرافق خدمة">عامل صيدليات ومرافق خدمة (حركة دورية ووقوف ممتد)</option>
                      <option value="شيف وطهي طعام">شيف وطهي طعام (طاقة حرارية عالية ووقوف مستمر)</option>
                      <option value="رب منزل / ربة منزل">رب منزل / ربة منزل (مجهود رعاية وتواجد منزلي ممتد)</option>
                      <option value="طالب دراسي">طالب دراسي (دراسة مكثفة وإجهاد عيني وبصري)</option>
                      <option value="متقاعد">متقاعد / على المعاش (حالة هادئة ومتابعة دورية)</option>
                      <option value="Other">مهنة أخرى (أو أكتبها يدوياً بالأسفل)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-700 block">✍️ اسم المهنة بالتحديد (لتعديلها أو عند كتابة مهنة مخصصة):</label>
                    <input
                      type="text"
                      placeholder="امثلة: مهندس موقع، مبرمج، سائق حافلة، طبيب طوارئ"
                      value={editedProfession}
                      onChange={(e) => setEditedProfession(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white outline-none text-right font-semibold text-slate-800"
                    />
                  </div>

                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-[10.5px] text-amber-950 leading-relaxed text-right space-y-1.5 shadow-xs">
                    <div className="flex items-center space-x-1 space-x-reverse text-amber-950 justify-end font-bold text-[11px]">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>💡 أهمية تتبع المهنة لتشخيص الأمراض المهنية وتفادي التعارضات الدوائية:</span>
                    </div>
                    <p className="font-semibold text-slate-800">
                      يعد فهم مهنة المريض ركيزة أساسية في الممارسة الطبية والصيدلانية المتقدمة، وذلك لسببين رئيسيين:
                    </p>
                    <ul className="list-disc pr-4 space-y-1.5 text-amber-900 font-medium">
                      <li>
                        <strong>ربط وتحديد الأمراض المرتبطة بالمهنة (Occupational Diseases):</strong> ترتبط العديد من المشاكل المرضية بطبيعة العمل مباشرة. فمثلاً، يعاني عمال البناء والمصانع ومهندسو المواقع من معدلات متزايدة لحساسية الصدر، الربو الشعبي، أو التهابات الجهاز التنفسي بسبب التعرض المستمر للأتربة والإشعاع والملوثات المحتملة. كذلك تزداد آلام العمود الفقري، الانزلاق الغضروفي، وخشونة المفاصل لدى السائقين والمبرمجين بسبب الجلوس الممتد غير الصحي.
                      </li>
                      <li>
                        <strong>تجنب موانع استعمال بعض الأدوية تلاشفياً للخطر (Job-Specific Contraindications):</strong> العديد من مضادات الحساسية والرشح التقليدية (الجيل الأول)، والمهدئات، وبواسطات العضلات، وأدوية الدوار، ومسكنات الألم المركزية تتسبب بشكل قاطع في النعاس، بطء الاستجابة الحركية والذهنية، مما يمثل خطورة فائقة تمنع استعمالها للمرضى من السائقين، مشغلي الآلات الحادة، عمال المرتفعات أو جراحي العمليات الدقيقة، وبالتالي يتم توجيه الصيدلي لصرف بدائل آمنة تماماً.
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: SLEEP STATUS */}
              {lifestyleTab === 'sleep' && (
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl space-y-2 text-right">
                  <div className="border-b border-slate-200/60 pb-2 mb-1">
                    <span className="text-[11px] font-extrabold text-sky-850 block">💤 Sleep Quality (جودة النوم والراحة اليومية)</span>
                    <p className="text-[9px] text-slate-500">سجل عادات ومعدلات ساعات النوم لتحديد الاستقرار الهرموني ومستويات التوتر وعلاقتها بالنشاط والضغط والجرعات الإرشادية لبعض العقاقير</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-700 block">💤 متوسط عدد ساعات النوم اليومية:</label>
                    <select
                      value={editedSleepHours}
                      onChange={(e) => setEditedSleepHours(Number(e.target.value))}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white outline-none"
                    >
                      {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                        <option key={h} value={h}>{h} ساعات من النوم اليومي</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="text-[10px] font-black text-slate-700 block">⚡ جودة النوم والراحة الذاتية:</label>
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      {[
                        { key: 'Poor', label: '🥱 سيء / متقطع' },
                        { key: 'Fair', label: '🩹 مقبول / غير كاف' },
                        { key: 'Good', label: '😴 جيد وعميق' },
                        { key: 'Excellent', label: '🔋 ممتاز ومستقر' }
                      ].map((q) => (
                        <button
                          key={q.key}
                          type="button"
                          onClick={() => setEditedSleepQuality(q.key as any)}
                          className={`p-1.5 rounded-lg text-[10.5px] font-bold border transition-all ${
                            editedSleepQuality === q.key 
                              ? "bg-indigo-600 text-white border-indigo-650 font-black shadow-xs" 
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: VISION AND OPTICAL */}
              {lifestyleTab === 'vision' && (
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl space-y-3.5 text-right">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-700 block">👓 هل ترتدي نظارة طبية حالياً؟</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setEditedWearsGlasses(true);
                          if (editedVisionType === 'None') setEditedVisionType('Myopia');
                        }}
                        className={`p-2 rounded-lg font-bold border transition-all ${
                          editedWearsGlasses ? "bg-teal-605 text-white bg-teal-600 font-extrabold shadow-xs" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        👓 نعم، أرتدي نظارة
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditedWearsGlasses(false);
                          setEditedVisionType('None');
                        }}
                        className={`p-2 rounded-lg font-bold border transition-all ${
                          !editedWearsGlasses ? "bg-slate-350 bg-slate-200 text-slate-800 font-extrabold" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        ❌ لا أرتدي نظارّة
                      </button>
                    </div>
                  </div>

                  {editedWearsGlasses && (
                    <div className="p-2.5 bg-indigo-50/40 border border-indigo-100 rounded-xl space-y-1.5">
                      <label className="text-[9.5px] font-black text-indigo-900 block">🏷️ نوع النظارة الطبية المستعملة:</label>
                      <div className="grid grid-cols-2 gap-1.5 text-xs text-center">
                        {[
                          { key: 'Myopia', label: 'قصر نظر (Myopia)' },
                          { key: 'Hyperopia', label: 'طول نظر (Hyperopia)' },
                          { key: 'Astigmatism', label: 'استجماتيزم (Astigmatism)' },
                          { key: 'Reading', label: 'نظارة قراءة (Reading)' }
                        ].map((v) => (
                          <button
                            key={v.key}
                            type="button"
                            onClick={() => setEditedVisionType(v.key as any)}
                            className={`p-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                              editedVisionType === v.key 
                                ? "bg-indigo-600 text-white border-indigo-600 font-black shadow-xs" 
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-700 block">✨ هل خضعت لعملية تصحيح عيوب إبصار (ليزك LASIK) مسبقاً؟</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setEditedHasLasik(true)}
                        className={`p-2 rounded-lg font-bold border transition-all ${
                          editedHasLasik ? "bg-teal-605 text-white bg-teal-600 font-bold shadow-xs" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        ✨ نعم، قمت بالليزك
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditedHasLasik(false)}
                        className={`p-2 rounded-lg font-bold border transition-all ${
                          !editedHasLasik ? "bg-slate-350 bg-slate-200 text-slate-800 font-bold" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        ❌ لا، لم أقم بالليزك
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PERSONAL MEDICATIONS EDIT SECTION */}
            <div className="space-y-2 border-t border-slate-100 pt-3 text-right">
              <div className="flex justify-between items-center text-right">
                <span className="text-teal-600 text-[9.5px] bg-teal-50 px-2 py-0.5 rounded font-black border border-teal-100">
                  {editedCurrentMedications.length} أدوية شخصية مسجلة
                </span>
                <h4 className="font-extrabold text-slate-800 text-xs text-right">💊 قسم الأدوية الشخصية واليومية غير الوصفية (OTC)</h4>
              </div>
              <p className="text-[10.5px] text-slate-500 leading-normal text-right">
                أضف أدويتك اليومية والشخصية المغلظة كحبوب الحمل، المكملات، فيتامينات الطاقة وعلاجات الرغبة أو مسكنات الصداع المتفرقة، حتى يتسنى الصيدلي الاستشاري مراجعة أي تعارضات (DDU).
              </p>

              {/* Quick Add Presets requested by the user */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1.5 text-right">
                <span className="text-[9.5px] font-bold text-slate-500 block">إضافة سريعة لأقوى الأدوية الشخصية تكراراً:</span>
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {[
                    { label: "🟢 حبوب منع الحمل (Contraceptive)", name: "حبوب منع الحمل (Contraceptive)", active: "Levonorgestrel + Ethinylestradiol", dose: "قرص واحد في ميعاد ثابت من الدورة" },
                    { label: "💊 مكمل فيتامينات ومعادن", name: "مكمل فيتامينات متعددة ومعادن (Multivitamin)", active: "Multivitamins with Zinc", dose: "قرص واحد بعد الإفطار يومياً" },
                    { label: "🧴 أدوية تأخير وعلاج سرعة القذف", name: "حبوب تأخير القذف (Dapoxetine)", active: "Dapoxetine Hydrochloride", dose: "قرص 30mg قبل العلاج بـ 1-3 ساعات" },
                    { label: "⚡ أدوية تنشيط وعلاج الانتصاب", name: "حبوب الانتصاب والقدرة (Sildenafil/Viagra)", active: "Sildenafil Citrate", dose: "نصف قرص 50-100mg عند اللزوم قبل النشاط" },
                    { label: "💆 مسكنات الصداع وآلام المفاصل", name: "بندول مسكن الصداع وأم الجسم (Panadol Extra)", active: "Paracetamol + Caffeine", dose: "قرصان للصداع الشديد عند اللزوم" },
                  ].map((preset, idx) => {
                    const isAlreadyAdded = editedCurrentMedications.some(m => m.brandName === preset.name);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (isAlreadyAdded) {
                            setEditedCurrentMedications(prev => prev.filter(m => m.brandName !== preset.name));
                          } else {
                            const newMed: CurrentMedication = {
                              brandName: preset.name,
                              activeIngredient: preset.active,
                              concentration: "تلقائي",
                              dosageForm: "Tablet",
                              frequency: {
                                units: 1,
                                type: "tablet",
                                timeframe: "يومي"
                              },
                              instructions: preset.dose
                            };
                            setEditedCurrentMedications(prev => [...prev, newMed]);
                          }
                        }}
                        className={`text-[9.5px] py-1 px-2.5 rounded-lg border transition-all ${
                          isAlreadyAdded 
                            ? "bg-teal-600 text-white border-teal-600 font-extrabold shadow-xs" 
                            : "bg-white text-slate-705 text-slate-700 border-slate-250 hover:bg-slate-50"
                        }`}
                      >
                        {preset.label} {isAlreadyAdded ? "✓" : "＋"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic fully-custom Medicine Add Form */}
              <div className="p-3 bg-teal-50/20 border border-teal-100 rounded-xl space-y-2 text-right">
                <span className="text-[10px] font-bold text-teal-950 block">➕ إضافة دواء شخصي آخر مخصص:</span>
                <div className="grid grid-cols-2 gap-2 text-right">
                  <input
                    type="text"
                    placeholder="اسم دواءك الشخصي (التجاري)"
                    value={quickMedName}
                    onChange={(e) => setQuickMedName(e.target.value)}
                    className="text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none text-right placeholder-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="المادة الفعالة أو الفيتامينات"
                    value={quickMedIngredient}
                    onChange={(e) => setQuickMedIngredient(e.target.value)}
                    className="text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none text-right placeholder-slate-400"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="تعليمات الجرعة والمواعيد المخصصة..."
                    value={quickMedDose}
                    onChange={(e) => setQuickMedDose(e.target.value)}
                    className="flex-1 text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none text-right placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!quickMedName || !quickMedIngredient) {
                        alert("يرجى ملء الاسم التجاري للدواء والمادة الفعالة أولاً.");
                        return;
                      }
                      const newMed: CurrentMedication = {
                        brandName: quickMedName,
                        activeIngredient: quickMedIngredient,
                        concentration: "محددة",
                        dosageForm: "Tablet",
                        frequency: {
                          units: 1,
                          type: "tablet",
                          timeframe: "يومي"
                        },
                        instructions: quickMedDose || "قرص عند اللزوم بانتظام"
                      };
                      setEditedCurrentMedications(prev => [...prev, newMed]);
                      setQuickMedName("");
                      setQuickMedIngredient("");
                      setQuickMedDose("");
                    }}
                    className="bg-teal-605 bg-teal-600 hover:bg-teal-750 hover:bg-teal-700 text-white text-[10.5px] px-3.5 rounded-lg font-black transition-all cursor-pointer"
                  >
                    أضف الآن
                  </button>
                </div>
              </div>

              {/* Active Current Medications list */}
              {editedCurrentMedications.length > 0 && (
                <div className="space-y-1.5 pt-1.5 max-h-[170px] overflow-y-auto">
                  <span className="text-[9.5px] text-slate-455 text-slate-500 font-bold block pb-0.5">الملف الدوائي الشخصي الحالي تم حفظه في علبة التطبيق:</span>
                  {editedCurrentMedications.map((med, idx) => (
                    <div key={idx} className="bg-white/90 p-2.5 rounded-xl border border-slate-200 flex justify-between items-center text-right text-[11px] shadow-xs">
                      <button
                        type="button"
                        onClick={() => setEditedCurrentMedications(prev => prev.filter((_, i) => i !== idx))}
                        className="text-rose-600 hover:text-rose-800 text-[10px] font-black p-1 block cursor-pointer"
                      >
                        حذف ✕
                      </button>
                      <div className="text-right">
                        <span className="font-extrabold text-slate-800">{med.brandName}</span>
                        <span className="text-slate-500 font-mono text-[9px] block">({med.activeIngredient})</span>
                        {med.instructions && <span className="text-[10px] text-teal-755 text-teal-650 block font-bold mt-0.5">📌 الجرعة المعتادة: {med.instructions}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Dependents Frame directly in Profile */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-right">
              <h5 className="font-bold text-slate-800 text-xs">إضافة تابع جديد للتطبيق</h5>
              
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="اسم المرافق الثنائي أو الثلاثي"
                  value={newDepName}
                  onChange={(e) => setNewDepName(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none bg-white text-right"
                />
                
                <div className="grid grid-cols-2 gap-2 text-right">
                  <select
                    value={newDepRelation}
                    onChange={(e) => setNewDepRelation(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white outline-none"
                  >
                    <option value="ابن">ابن</option>
                    <option value="ابنة">ابنة</option>
                    <option value="زوجة">زوجة</option>
                    <option value="أم">أم</option>
                    <option value="أب">أب</option>
                  </select>
                  <input
                    type="text"
                    maxLength={14}
                    placeholder="الرقم القومي (14 رقماً)"
                    value={newDepNId}
                    onChange={(e) => setNewDepNId(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none bg-white font-mono text-right"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addDependent}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs py-1.5 font-bold rounded-lg transition-colors flex items-center justify-center space-x-1 space-x-reverse"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة التابع للملف المحمول</span>
              </button>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex space-x-2 space-x-reverse pt-2">
              <button
                onClick={() => setScreen('dashboard')}
                className="flex-1 bg-slate-200 text-slate-700 text-center py-2.5 rounded-xl text-xs font-bold"
              >
                إلغاء الأمر
              </button>
              <button
                onClick={handleSaveProfileHealth}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-center py-2.5 rounded-xl text-xs font-bold"
              >
                حفظ الملف والتحديث
              </button>
            </div>
          </div>
        )}

        {/* SCREEN: OTC CONSULTATION BOOKING SCREEN */}
        {screen === 'otc-book' && (
          <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-white">
            <div className="bg-teal-50 p-3 rounded-2xl border border-teal-100 flex items-start space-x-2 space-x-reverse">
              <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <p className="text-[10.5px] text-teal-800 leading-tight">
                أنت تحجز الآن استشارة سريرية لا وصفية بقيمة <strong>250 ج.م</strong>. سيقوم صيدلي أخصائي معتمد بفتح مكالمة فيديو حية معك خلال الموعد.
              </p>
            </div>

            <div className="space-y-1 text-right">
              <label className="text-xs font-bold text-slate-700 block text-right">👤 المريض المستفيد:</label>
              <div className="bg-slate-100 p-2.5 rounded-xl text-xs font-bold text-slate-800">
                {activePatient?.fullName}
                {activePatient?.pregnancyLactation?.isPregnant && <span className="text-rose-600 text-[10px] block font-normal">(المريضة حامل بالثلث الثاني - يجب تجديد الحيطة الدوائية)</span>}
              </div>
            </div>

            <div className="space-y-1 text-right">
              <label className="text-xs font-bold text-slate-700 block text-right">⚕️ التخصص الصيدلاني المطلوب:</label>
              <select
                value={bookingSpecialty}
                onChange={(e) => setBookingSpecialty(e.target.value as ApprovedSpecialty)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none font-medium"
              >
                {ApprovedSpecialtiesList.map((spec) => (
                  <option key={spec.key} value={spec.key}>
                    {spec.ar} ({spec.key})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 text-right">
              <label className="text-xs font-bold text-slate-700 block text-right">📝 تفاصيل الشكوى المرضية والأعراض الحالية:</label>
              <textarea
                placeholder="يرجى كتابة الشكوى بالتفصيل، الأدوية التي تم تناولها مؤخراً، أو أي تعارضات تشعر بها..."
                value={bookingComplaint}
                onChange={(e) => setBookingComplaint(e.target.value)}
                rows={4}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50 text-right focus:bg-white focus:border-teal-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-right">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">تاريخ الموعد:</label>
                <input
                  type="date"
                  value={bookingDate}
                  min="2026-05-28"
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl outline-none bg-slate-50 font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">توقيت الاستشارة:</label>
                <input
                  type="time"
                  value={bookingTime}
                  min={currentMinTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl outline-none bg-slate-50 font-medium"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setPaymentServiceType('OTC');
                setScreen('payment');
              }}
              disabled={!bookingComplaint.trim()}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 block"
            >
              متابعة الدفع المسبق الآمن (250 ج.م)
            </button>
          </div>
        )}

        {/* SCREEN: REVISION BOOKING SCREEN */}
        {screen === 'rev-book' && (
          <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-white">
            <div className="bg-cyan-50 p-3 rounded-2xl border border-cyan-100/80 flex items-start space-x-2 space-x-reverse text-right">
              <Shield className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
              <div>
                <h6 className="text-[11px] font-bold text-cyan-900">مراجعة الروشتة السريرية (DUR)</h6>
                <p className="text-[10px] text-cyan-700 leading-tight">
                  ارفع صورة الروشتة الحالية وسيقوم صيدلي إكلينيكي بمطابقتها مع حساسيتك ضد الأدوية ومعايير EDA وبحث التعارضات الطبية.
                </p>
              </div>
            </div>

            <div className="space-y-1 text-right">
              <label className="text-xs font-bold text-slate-700 block text-right">🛡️ التخصص الطبي المعني بالروشتة:</label>
              <select
                value={bookingSpecialty}
                onChange={(e) => setBookingSpecialty(e.target.value as ApprovedSpecialty)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none"
              >
                {ApprovedSpecialtiesList.map((spec) => (
                  <option key={spec.key} value={spec.key}>
                    {spec.ar} ({spec.key})
                  </option>
                ))}
              </select>
            </div>

            {/* MOCK SCANNER / UPLOAD BOX */}
            <div className="space-y-1 text-right">
              <label className="text-xs font-bold text-slate-700 block">📸 تحميل صورة الروشتة الطبية:</label>
              
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer hover:bg-slate-100/50 hover:border-cyan-500 transition-all"
                onClick={() => setScreen('scanner')}
              >
                {scannedImage ? (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-300">
                    <img src={scannedImage} alt="Prescription" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-xs text-white font-bold space-x-1">
                      <Camera className="w-4 h-4" />
                      <span>اضغط لتغيير الصورة الممسوحة</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-slate-400 group-hover:text-cyan-600" />
                    <p className="text-[11px] text-slate-500 font-bold">التقط صورة بالكاميرا أو اختر روشتة للاختبار</p>
                    <span className="text-[9px] text-slate-400 bg-slate-200 px-2 py-0.5 rounded">محاكاة ملف رقمي</span>
                  </>
                )}
              </div>
            </div>

            {/* DateTime row */}
            <div className="grid grid-cols-2 gap-2 text-right">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">التاريخ:</label>
                <input
                  type="date"
                  value={bookingDate}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-slate-50"
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">الساعة:</label>
                <input
                  type="time"
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-slate-50"
                  onChange={(e) => setBookingTime(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={() => {
                setPaymentServiceType('REV');
                setScreen('payment');
              }}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition-all"
            >
              متابعة الدفع المسبق الآمن (350 ج.م)
            </button>
          </div>
        )}

        {/* SCREEN: DIGITAL PERSCRIPTION MOCK CAMERA SCANNER */}
        {screen === 'scanner' && (
          <div className="flex-1 p-4 bg-slate-900 text-white flex flex-col justify-between">
            <div className="text-center space-y-1">
              <span className="text-xs text-cyan-400 font-bold">ماسح الروشتة الإكلينيكي</span>
              <p className="text-[10px] text-slate-400">اختر إحدى الروشتات التجريبية لمحاكاتها كأنها ممسوحة بكاميرا الهاتف</p>
            </div>

            {/* MOCK PRESETS FOR TESTING */}
            <div className="space-y-3 my-4">
              <div className="p-2.5 bg-slate-800 rounded-2xl border border-slate-700 hover:border-teal-500 cursor-pointer text-right transition-all"
                onClick={() => {
                  setScannedImage("https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=400&auto=format&fit=crop");
                  setScreen('rev-book');
                }}
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="bg-red-500/20 text-red-300 text-[9px] px-1.5 py-0.5 rounded font-bold">لحالة أحمد علي</span>
                  <p className="text-[11px] font-bold text-slate-200">صورة روشتة العظام (تحتوي أسبرين وأسيتامينوفين)</p>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">تختبر تنبيه التحسس المفرط ضد أدوية الساليسيلات للأسبرين في ملف أحمد علي.</p>
              </div>

              <div className="p-2.5 bg-slate-800 rounded-2xl border border-slate-700 hover:border-teal-500 cursor-pointer text-right transition-all"
                onClick={() => {
                  setScannedImage("https://images.unsplash.com/photo-1550572017-edd951b55104?q=80&w=400&auto=format&fit=crop");
                  setScreen('rev-book');
                }}
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="bg-yellow-500/20 text-yellow-300 text-[9px] px-1.5 py-0.5 rounded font-bold">لحالة سارة ممدوح</span>
                  <p className="text-[11px] font-bold text-slate-200">صورة روشتة علاج البرد (تحتوي ايبوبروفين وكلارينيز)</p>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">تختبر تعارض الأدوية غير الآمنة مع فترة الحمل والضغط المرتفع.</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl text-center text-xs border border-slate-800 text-slate-400">
              أو قم بتحميل أي صورة عشوائية للروشتة لملء النظام تلقائياً ببيانات افتراضية.
            </div>

            <button
              onClick={() => setScreen('rev-book')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-xs py-2 rounded-xl text-white font-bold"
            >
              الرجوع للخلف
            </button>
          </div>
        )}

        {/* SCREEN: PAYMENT GATEWAYS */}
        {screen === 'payment' && (
          <div className="flex-1 p-4 space-y-4 bg-slate-50 text-right overflow-y-auto">
            {/* Header branding */}
            <div className="bg-gradient-to-r from-teal-800 to-sky-900 text-white p-4 -mx-4 -mt-4 rounded-b-2xl shadow-md text-right space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-teal-200 bg-teal-900/50 px-2.5 py-0.5 rounded-full font-bold border border-teal-700/30">EG-GATEWAY v2.1</span>
                <span className="flex items-center space-x-1.5 space-x-reverse text-xs font-bold">
                  <Lock className="w-3.5 h-3.5 text-teal-350" />
                  <span>بوابة السداد الإلكتروني الآمن</span>
                </span>
              </div>
              <h2 className="text-sm font-extrabold tracking-tight">الدفع والتحقق السحابي لخدمات عيادة صيدلاني المشرق</h2>
              <p className="text-[9px] text-slate-300">عضو دائم لدى الهيئة الوطنية لمعايير المدفوعات السريرية والتراخيص الرقمية.</p>
            </div>

            {/* Service & Price Details */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5 text-xs text-right">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">اسم الخدمة المحجوزة</span>
                <span className="font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  {paymentServiceType === 'OTC' ? "استشارة صيدلانية فورية (OTC)" : 
                   paymentServiceType === 'REV' ? "مراجعة الروشتة والأدوية (DUR)" : 
                   "باقة كبار السن وإدارة الأدوية (MMP)"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">المريض المستفيد</span>
                <span className="font-bold text-slate-700 flex items-center space-x-1 space-x-reverse">
                  <span className="font-mono text-[10px] text-slate-500">({activePatient?.nationalId})</span>
                  <span>{activePatient?.fullName}</span>
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 pt-2.5 mt-2">
                <span className="text-slate-600 font-bold">القيمة المستحقة (شاملة ضريبة القيمة المضافة)</span>
                <span className="text-teal-600 font-black text-base">
                  {paymentServiceType === 'OTC' ? "250 ج.م" : 
                   paymentServiceType === 'REV' ? "350 ج.م" : 
                   "400 ج.م"}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">اختر وسيلة الدفع المدفوعة مسبقاً:</span>
              
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentProvider('visa');
                    setPaymentErrorMessage(null);
                  }}
                  className={`py-2.5 px-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all focus:outline-none ${
                    paymentProvider === 'visa' 
                      ? 'border-teal-600 bg-teal-50/50 text-teal-900 font-bold scale-[1.02] shadow-xs' 
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-teal-600 mb-1" />
                  <span className="text-[10px] block">فيزا / ماستر</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentProvider('fawry');
                    setPaymentErrorMessage(null);
                  }}
                  className={`py-2.5 px-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all focus:outline-none ${
                    paymentProvider === 'fawry' 
                      ? 'border-amber-500 bg-amber-50/40 text-amber-900 font-bold scale-[1.02] shadow-xs' 
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-extrabold text-[11px] text-amber-600 mb-1">FAWRY</span>
                  <span className="text-[10px] block">فورى باى</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentProvider('vodafone');
                    setPaymentErrorMessage(null);
                  }}
                  className={`py-2.5 px-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all focus:outline-none ${
                    paymentProvider === 'vodafone' 
                      ? 'border-red-600 bg-red-50/40 text-red-950 font-bold scale-[1.02] shadow-xs' 
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-black text-[11px] text-red-600 mb-1">CASH</span>
                  <span className="text-[10px] block">محفظة ذكية</span>
                </button>
              </div>
            </div>

            {/* Live Interactive Forms or Mock Graphics */}
            {paymentProvider === 'visa' && (
              <div className="space-y-3">
                {/* Visual Card Representation */}
                <div className="bg-gradient-to-br from-slate-800 via-teal-950 to-indigo-950 rounded-2xl p-4 text-white relative overflow-hidden shadow-md space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] tracking-widest text-slate-300 font-bold">INFO-DOCTORS CARD</span>
                    <span className="text-xs font-sans italic font-bold">VISA</span>
                  </div>
                  
                  {/* Holographic Chip & Icon */}
                  <div className="flex justify-between items-center">
                    <div className="w-8 h-6 bg-amber-300/80 rounded-md border border-amber-400 flex items-center justify-center">
                      <div className="grid grid-cols-3 gap-0.5 w-6 h-4 opacity-40">
                        <div className="bg-black/20 rounded"></div>
                        <div className="bg-black/20 rounded"></div>
                        <div className="bg-black/20 rounded"></div>
                      </div>
                    </div>
                    <Fingerprint className="w-6 h-6 text-teal-400 opacity-65" />
                  </div>

                  {/* Card Number display */}
                  <div className="font-mono text-base tracking-wider text-center text-slate-100 py-1 font-bold">
                    {mockCardNo || "**** **** **** ****"}
                  </div>

                  <div className="flex justify-between items-center text-[10px]">
                    <div className="flex flex-col text-left">
                      <span className="text-[7px] text-slate-400">CVV</span>
                      <span className="font-mono font-bold">{mockCardCvv || "***"}</span>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[7px] text-slate-400">EXPIRATION</span>
                      <span className="font-mono font-bold">{mockCardExp || "MM/YY"}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[7px] text-slate-400">CARD HOLDER</span>
                      <span className="font-bold tracking-wide truncate max-w-[120px]">{mockCardName || "PATIENT NAME"}</span>
                    </div>
                  </div>
                </div>

                {/* Form fields */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 block font-bold">تاريخ الانتهاء (الشهر/السنة):</label>
                      <input 
                        type="text" 
                        value={mockCardExp}
                        onChange={(e) => setMockCardExp(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full p-2 border border-slate-200 rounded-lg text-center font-mono focus:border-teal-500 focus:outline-none bg-slate-50 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 block font-bold">رمز الأمان (CVV):</label>
                      <input 
                        type="password" 
                        maxLength={3}
                        value={mockCardCvv}
                        onChange={(e) => setMockCardCvv(e.target.value)}
                        placeholder="***"
                        className="w-full p-2 border border-slate-200 rounded-lg text-center font-mono focus:border-teal-500 focus:outline-none bg-slate-50 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block font-bold">رقم بطاقة الائتمان:</label>
                    <input 
                      type="text" 
                      value={mockCardNo}
                      onChange={(e) => setMockCardNo(e.target.value)}
                      placeholder="4000 1234 5678 9012"
                      className="w-full p-2 border border-slate-200 rounded-lg text-center font-mono focus:border-teal-500 focus:outline-none bg-slate-50 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block font-bold">اسم حامل البطاقة (بالكامل):</label>
                    <input 
                      type="text" 
                      value={mockCardName}
                      onChange={(e) => setMockCardName(e.target.value)}
                      placeholder="أدخل اسمك كما بالبطاقة"
                      className="w-full p-2 border border-slate-200 rounded-lg text-right focus:border-teal-500 focus:outline-none bg-slate-50 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentProvider === 'fawry' && (
              <div className="bg-amber-500/5 rounded-2xl p-4 border border-amber-200 text-right space-y-3.5">
                {/* Fawry Receipt Graphic */}
                <div className="border-4 border-dashed border-amber-400 bg-white rounded-xl p-3.5 space-y-2.5 relative shadow-sm">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-400"></div>
                  
                  <div className="flex justify-between items-center text-[10px] pt-1">
                    <span className="text-amber-600 font-black">FAWRY BILLING</span>
                    <span className="text-slate-400 font-mono">ID: #{Math.floor(1000 + Math.random() * 9000)}</span>
                  </div>

                  <div className="text-center py-2 border-b border-dashed border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-500 block">كود الدفع الفوري الوطني الموحد للخدمة:</span>
                    <div className="flex items-center justify-center space-x-2 space-x-reverse font-mono text-base font-black text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-300/30">
                      <span>81290485</span>
                      <button 
                        type="button"
                        onClick={() => {
                          try {
                            navigator.clipboard.writeText("81290485");
                            alert("✓ تم نسخ كود فوري (81290485) بنجاح!");
                          } catch (e) {
                            alert("كود فوري هو: 81290485");
                          }
                        }}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 p-1 rounded transition-colors text-xs shrink-0"
                        title="نسخ كود الدفع"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-600 space-y-1 pt-1">
                    <p className="font-bold flex items-center space-x-1 space-x-reverse justify-end">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>توجه لأقرب تاجر فوري أو كشك في منطقتك.</span>
                    </p>
                    <p className="font-bold flex items-center space-x-1 space-x-reverse justify-end">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>اطلب سداد تذكرة رقمية برقم الخدمة المرجعي 788.</span>
                    </p>
                    <p className="font-bold flex items-center space-x-1 space-x-reverse justify-end">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>أدخل كود الفاتورة المدون أعلاه للتاجر وقم بالسداد.</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {paymentProvider === 'vodafone' && (
              <div className="bg-red-500/5 rounded-2xl p-4 border border-red-200 text-right space-y-3.5">
                <div className="bg-white p-4 rounded-xl border border-red-200/50 space-y-3">
                  <div className="flex justify-between items-center border-b border-red-100 pb-2">
                    <span className="text-[9px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">Vodafone / InstaPay</span>
                    <h5 className="text-xs font-bold text-slate-800">تفويض المحفظة الإلكترونية اللحظي</h5>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 block font-bold">رقم الهاتف المرتبط بالمحفظة (010, 011, 012):</label>
                    <input 
                      type="text" 
                      value={mockWalletPhone}
                      onChange={(e) => setMockWalletPhone(e.target.value)}
                      placeholder="01077654321"
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-center font-mono focus:border-red-500 focus:outline-none bg-slate-50 text-xs font-extrabold"
                    />
                  </div>

                  <div className="space-y-1.5 bg-red-50/50 p-2.5 rounded-lg border border-red-100/30">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-slate-400 font-mono">شفرة SMS المحاكاة</span>
                      <label className="text-[10px] text-red-900 font-bold block">رمز التأكيد المؤقت (OTP):</label>
                    </div>
                    <input 
                      type="text" 
                      maxLength={4}
                      value={mockWalletOtp}
                      onChange={(e) => setMockWalletOtp(e.target.value)}
                      placeholder="2849"
                      className="w-full p-2 border border-slate-200 rounded-lg text-center font-mono focus:border-red-500 focus:outline-none bg-slate-50 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Simulated Payment Scenario Selector */}
            <div className="bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200 text-right space-y-3">
              <span className="text-[10.5px] font-black text-slate-800 flex items-center space-x-1.5 space-x-reverse justify-end">
                <span>🔬 لوحة اختبار محاكاة بوابة الدفع (بيئة التطوير)</span>
              </span>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentSimulateStatus('Success');
                    setPaymentErrorMessage(null);
                  }}
                  className={`py-2 px-3 rounded-xl border text-center transition-all focus:outline-none ${
                    paymentSimulateStatus === 'Success'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-extrabold shadow-sm scale-102'
                      : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-500 text-xs'
                  }`}
                >
                  <span className="text-xs block">✔️ دفع مقبول (ناجح)</span>
                  <span className="text-[8.5px] opacity-70 block mt-0.5">تفويض وتأكيد المعاملة</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentSimulateStatus('Failed');
                    setPaymentErrorMessage(null);
                  }}
                  className={`py-2 px-3 rounded-xl border text-center transition-all focus:outline-none ${
                    paymentSimulateStatus === 'Failed'
                      ? 'border-rose-500 bg-rose-50 text-rose-900 font-extrabold shadow-sm scale-102'
                      : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-500 text-xs'
                  }`}
                >
                  <span className="text-xs block">❌ دفع مرفوض (فاشل)</span>
                  <span className="text-[8.5px] opacity-70 block mt-0.5 font-normal">اختبار سيناريو الرفض والأخطاء</span>
                </button>
              </div>

              {paymentSimulateStatus === 'Failed' && (
                <div className="space-y-1 pt-1 animate-fadeIn">
                  <label className="text-[10px] text-slate-600 block font-bold">سيناريو الرفض المصرفي المطلوب اختباره:</label>
                  <select
                    value={mockDeclineReason}
                    onChange={(e) => setMockDeclineReason(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white outline-none font-bold text-rose-900"
                  >
                    <option value="INSUFFICIENT_FUNDS">رصيد غير كافٍ بالبطاقة أو المحفظة الإلكترونية</option>
                    <option value="CARD_DECLINED">تم رفض البطاقة بواسطة البنك الأهلي المصري لأسباب أمنية</option>
                    <option value="EXPIRED_CARD">تاريخ صلاحية بطاقة السداد منتهي (Expired Card)</option>
                    <option value="GATEWAY_TIMEOUT">انتهت مهلة استجابة مزود الشبكة السحابية للبنك المركزي</option>
                    <option value="LIMIT_EXCEEDED">تجاوز سقف المعاملات اليومي المسموح به لهذه البطاقة</option>
                  </select>
                </div>
              )}
            </div>

            {/* Error Message Box */}
            {paymentErrorMessage && (
              <div className="bg-rose-50 border border-rose-200/60 rounded-xl p-3 text-right space-y-1 animate-fadeIn">
                <div className="flex items-center space-x-1 space-x-reverse justify-end text-rose-800">
                  <span className="text-[11px] font-bold">فشل تفويض المعاملة المالية:</span>
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                </div>
                <p className="text-[10px] text-rose-700 leading-normal">
                  {paymentErrorMessage} يرجى تغيير الإعداد في "لوحة اختبار محاكاة بوابة الدفع" إلى الوضع السليم (دفع مقبول ناجح) للتمكن من تخطي الخطوة والمتابعة بنجاح.
                </p>
              </div>
            )}

            {/* Success Transaction Popup Block */}
            {paymentSuccessTxnId && (
              <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-4 text-center space-y-2 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">تم السداد الإلكتروني وتأكيد المعاملة!</h4>
                  <p className="text-[10px] text-emerald-800 mt-0.5">رقم تذكرة المعاملة: <span className="font-mono font-bold text-slate-900">{paymentSuccessTxnId}</span></p>
                  <p className="text-[9px] text-emerald-600 mt-1">جاري توليد تذكرة الحجز السريرية وتوجيهك لإنهاء الخدمة بالعيادة...</p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="space-y-2 pt-1 border-t border-slate-200/60">
              {/* Confirm Pay Button */}
              <button
                type="button"
                onClick={handleProcessPayment}
                disabled={isProcessingPayment}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-3 rounded-xl shadow-md flex items-center justify-center space-x-2 space-x-reverse focus:outline-none disabled:opacity-55 cursor-pointer"
              >
                {isProcessingPayment ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري معالجة الدفع السحابي الآمن...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تأكيد الحساب وسداد القيمة الآن ({
                      paymentServiceType === 'OTC' ? '250 ج.م' : 
                      paymentServiceType === 'REV' ? '350 ج.م' : '400 ج.م'
                    })</span>
                  </>
                )}
              </button>

              {/* Back Button */}
              <button
                type="button"
                onClick={() => {
                  if (paymentServiceType === 'OTC') {
                    setScreen('otc-book');
                  } else if (paymentServiceType === 'REV') {
                    setScreen('rev-book');
                  } else {
                    setScreen('pillbox');
                  }
                }}
                disabled={isProcessingPayment}
                className="w-full bg-white hover:bg-slate-100 text-xs py-2 rounded-xl text-slate-700 font-bold border border-slate-200 focus:outline-none transition-colors"
              >
                الرجوع للخلف وإلغاء العملية
              </button>
            </div>
          </div>
        )}

        {/* SCREEN: SIMULATED AND REAL WEBRTC VIDEO CALL */}
        {screen === 'videocall' && (
          <div className="flex-1 bg-slate-950 text-white p-4 flex flex-col justify-between relative overflow-hidden">
            {/* Real WebRTC Remote stream / Local fallback background */}
            <div className="absolute inset-0 w-full h-full bg-slate-900 z-0">
              {peerJoined && callStatus === 'connected' ? (
                <div className="w-full h-full relative">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle remote video metadata */}
                  <div className="absolute bottom-16 right-4 bg-slate-950/70 py-1 px-3 rounded-full text-[10px] text-teal-300 font-bold border border-teal-850/50 z-10 flex items-center space-x-1.5 space-x-reverse">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    <span>🎥 بث مباشر للصيدلي الاستشاري (مؤمن)</span>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 p-6 text-center">
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 blur opacity-40 animate-pulse"></div>
                    <div className="relative bg-slate-950 p-4 rounded-full border border-teal-500/30">
                      <Video className="w-10 h-10 text-teal-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-teal-400 font-bold tracking-wider bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-900">
                      {callStatus === 'connecting' ? 'جاري تأسيس ربط القناة الدوائية...' : 'بانتظار الصيدلي الاستشاري'}
                    </span>
                    <h4 className="text-xs font-extrabold text-slate-200 pt-1">العيادة الصيدلانية الآمنة والمباشرة</h4>
                    <p className="text-[10px] text-slate-400 max-w-[240px] leading-relaxed mx-auto">
                      يرجى البقاء في هذه الشاشة. سيتصل بك الصيدلي في غضون لحظات لمراجعة التحسس وتوجيهات الاستعمال الآمن.
                    </p>
                  </div>

                  {/* Dynamic voice waveform simulator to signify system activity */}
                  <div className="flex justify-center items-end space-x-1 space-x-reverse h-5 pt-3">
                    {[12, 24, 16, 32, 20, 14, 28, 10, 22].map((height, i) => (
                      <div
                        key={i}
                        className="w-1 bg-teal-500 rounded-full animate-pulse"
                        style={{
                          height: `${height}px`,
                          animationDelay: `${i * 0.15}s`,
                          animationDuration: '0.8s'
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Custom Picture-in-Picture Local stream */}
            <div className="absolute top-4 left-4 w-28 h-36 bg-slate-950 rounded-2xl border-2 border-slate-800 shadow-2xl overflow-hidden z-20 flex flex-col justify-end items-center">
              {!isVideoOff ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover z-10"
                />
              ) : null}
              
              <div className="relative z-20 w-full bg-slate-950/70 p-1 text-center font-sans text-[8px] text-slate-300 pointer-events-none">
                {isVideoOff ? "أنت (صوت فقط)" : "كاميرتك الحية"}
              </div>
            </div>

            {/* Upper Call Status Bar */}
            <div className="relative z-10 flex justify-between items-start text-right">
              <div className="bg-slate-950/85 p-2 rounded-xl border border-slate-800 flex items-center space-x-2 space-x-reverse text-right">
                <Shield className="w-4 h-4 text-teal-400" />
                <div className="text-[9.5px]">
                  <span className="font-extrabold text-slate-100 block">🔒 اتصال مشفر بالكامل (P2P Call)</span>
                  <span className="text-slate-400 text-[8.5px]">حماية خصوصية المرضى المعتمدة بمصر</span>
                </div>
              </div>
              <div className="text-right space-y-0.5 pt-1">
                <span className="bg-red-600 text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-wide">
                  {peerJoined ? "مكالمة نشطة" : "بانتظار الصيدلي"}
                </span>
                <h3 className="font-black text-xs text-slate-100">{activePatient?.fullName}</h3>
                <p className="text-[10px] text-emerald-400 font-mono">مدة الانتظار: {Math.floor(callTimer / 60)}:{(callTimer % 60).toString().padStart(2, '0')}</p>
              </div>
            </div>

            {/* Display warning/helpful toast if camera physically absent */}
            {errorMessage && (
              <div className="relative z-10 bg-black/80 border border-slate-800/80 p-2 rounded-xl text-[9px] text-amber-400 text-right">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* Interactive Clinical Advice Display Panel */}
            <div className="relative z-10 bg-slate-950/90 border border-slate-800 p-3 rounded-2xl space-y-1.5 text-right w-full">
              <div className="flex justify-between items-center border-b border-slate-850 pb-1">
                <span className="text-[9.5px] text-slate-400">تحسس دوائي مسجل: <strong className="text-red-400">{activePatient?.allergies?.drugAllergies?.join(" | ") || "لا يوجد"}</strong></span>
                <h4 className="text-[10.5px] font-black text-teal-400 flex items-center space-x-1 space-x-reverse">
                  <span>توجيه صيدلاني مباشر</span>
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
                </h4>
              </div>
              <p className="text-[9.5px] text-slate-300 leading-relaxed font-semibold">
                يقوم الصيدلي الآن بفحص شامل لتاريخك المرضي وموانع الاستعمال المهنية (DDU) المسجلة في ملفك. يرجى إبقائ الميكروفون قيد العمل لإبداء أي ملاحظة للمختص.
              </p>
            </div>

            {/* Real-time Consultation Chat Console */}
            <div className="relative z-10 bg-slate-950/95 border border-slate-800/80 rounded-2xl w-full flex flex-col transition-all duration-300 overflow-hidden" style={{ maxHeight: isChatExpanded ? '200px' : '40px' }}>
              <button 
                type="button"
                onClick={() => setIsChatExpanded(!isChatExpanded)}
                className="w-full flex justify-between items-center px-3.5 py-2 hover:bg-slate-900 border-b border-slate-850 text-right focus:outline-none"
              >
                <span className="text-[9px] text-teal-350 font-bold bg-slate-900 px-2 py-0.5 rounded-full">
                  {isChatExpanded ? "إغلاق ✕" : `فتح الدردشة 💬 (${chatMessages.length})`}
                </span>
                <span className="text-[10px] font-extrabold text-teal-400 flex items-center space-x-1.5 space-x-reverse">
                  <MessageSquare className="w-3.5 h-3.5 text-teal-400 font-bold" />
                  <span>المحادثة الفورية الحية</span>
                </span>
              </button>

              {isChatExpanded && (
                <div className="flex-1 flex flex-col min-h-0 bg-slate-950/60 p-2 space-y-2">
                  {/* Message Streams */}
                  <div className="flex-1 overflow-y-auto px-1 space-y-2 max-h-[100px] flex flex-col">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-4 text-[9px] text-slate-550 italic leading-relaxed">بدء المحادثة السريعة مع الصيدلي لتوضيح الأعراض وموانع الاستعمال الدوائية...</div>
                    ) : (
                      chatMessages.map((msg, idx) => {
                        const isSelf = msg.sender === "patient";
                        return (
                          <div key={idx} className={`flex flex-col text-right ${isSelf ? 'items-start' : 'items-end'}`}>
                            <span className="text-[7.5px] text-slate-500 font-bold mb-0.5 px-1">{msg.senderName}</span>
                            <div className={`p-2 rounded-xl text-[10px] leading-relaxed max-w-[85%] ${isSelf ? 'bg-teal-600 text-white rounded-tl-none' : 'bg-slate-800 text-slate-150 rounded-tr-none'}`}>
                              {msg.text}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Typing input */}
                  <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
                    <button 
                      type="button"
                      onClick={sendChatMessage}
                      disabled={!newMessageText.trim()}
                      className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold p-1.5 rounded-lg text-[10px] transition-all shrink-0"
                    >
                      إرسال
                    </button>
                    <input 
                      type="text"
                      dir="rtl"
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          sendChatMessage();
                        }
                      }}
                      placeholder="اكتب رسالتك أو استفسارك هنا..."
                      className="flex-1 bg-transparent text-xs text-right pr-2 text-white focus:outline-none placeholder-slate-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Google Meet Invitation Toast/Card for Patient */}
            {googleMeetUrl && (
              <div className="relative z-10 bg-teal-950/80 border-2 border-teal-500/50 p-3 rounded-2xl space-y-2 text-right w-full shadow-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1.5 space-x-reverse">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-black text-emerald-400">اتصال Google Meet مفعل الآن 🌐</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold">بوابة Google Workspace</span>
                </div>
                <p className="text-[9.5px] text-slate-200 leading-relaxed font-semibold">
                  قام الصيدلي الاستشاري ببدء جلسة استشارية على Google Meet لضمان اتصال فيديو فائق الدقة وبدون انقطاع. يرجى الانضمام مباشرة لمطابقة الوصفة.
                </p>
                <div className="flex space-x-1 pt-1">
                  <a
                    href={googleMeetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-2 rounded-xl text-[10px] text-center flex items-center justify-center space-x-2 space-x-reverse cursor-pointer shadow-md transition-all active:scale-95"
                  >
                    <span>انضم إلى عيادة Google Meet الحية 🚀</span>
                  </a>
                </div>
              </div>
            )}

            {/* Dynamic Interactive Call Stream Tool Controls */}
            <div className="relative z-10 flex flex-col items-center space-y-3">
              <div className="flex space-x-3 space-x-reverse justify-center bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-full border border-slate-800 shadow-xl">
                {/* Mute toggle button */}
                <button
                  onClick={() => {
                    const next = !isMuted;
                    setIsMuted(next);
                    if (localStreamRef.current) {
                      localStreamRef.current.getAudioTracks().forEach(track => {
                        track.enabled = !next;
                      });
                    }
                  }}
                  className={`p-2.5 rounded-full transition-all ${
                    isMuted ? "bg-red-650 bg-red-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-250"
                  }`}
                  title={isMuted ? "محجوب" : "مفتوح"}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Video camera toggle button */}
                <button
                  onClick={() => {
                    const next = !isVideoOff;
                    setIsVideoOff(next);
                    if (localStreamRef.current) {
                      localStreamRef.current.getVideoTracks().forEach(track => {
                        track.enabled = !next;
                      });
                    }
                  }}
                  className={`p-2.5 rounded-full transition-all ${
                    isVideoOff ? "bg-red-650 bg-red-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-250"
                  }`}
                  title={isVideoOff ? "تشغيل الكاميرا" : "إخفاء الكاميرا"}
                >
                  {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>

                {/* Secure call hangup trigger */}
                <button
                  onClick={() => {
                    if (pcRef.current) {
                      pcRef.current.close();
                    }
                    if (socketRef.current) {
                      socketRef.current.send(JSON.stringify({
                        type: "hangup",
                        roomId: activePatient?.nationalId,
                        userId: activePatient?.nationalId
                      }));
                      socketRef.current.close();
                    }
                    setScreen('dashboard');
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full px-4 py-2 text-xs font-black transition-all flex items-center space-x-1.5 space-x-reverse shadow-lg"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>قطع الاتصال</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN: PATIENT HEALTH OVERVIEW & CLINICAL REPORTS & ACTIVE ALERTS */}
        {screen === 'overview' && (
          <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-50 text-right">
            {/* Header Mini Info Banner */}
            <div className="bg-gradient-to-br from-teal-850 to-emerald-950 text-white rounded-2xl p-4 shadow-sm text-right relative overflow-hidden">
              <div className="absolute right-[-20px] top-[-20px] w-20 h-20 bg-emerald-500 opacity-10 rounded-full"></div>
              <span className="text-[9.5px] bg-teal-500/30 text-teal-200 px-2 py-0.5 rounded-full font-bold">بوابة السلامة والمؤشرات الموحدة</span>
              <h3 className="font-bold text-sm mt-1">الملخص الصحي الشامل: {activePatient?.fullName}</h3>
              <p className="text-[10px] text-teal-100/95 leading-normal mt-1">
                مراجعة حية متكاملة لبياناتك البيولوجية للتأكد من تفادي الأخطاء الدوائية والتحسس ومطابقة الروشتات مع التقييمات.
              </p>
            </div>

            {/* SUMMARY STATISTICS COMPONENT */}
            <PatientPortalSummaryStats
              patient={activePatient}
              bookedServices={bookedServices}
              takenDosesCount={Object.values(pillStatus).filter(Boolean).length || 15}
              skippedDosesCount={Object.values(skippedAlarms).filter(Boolean).length || 1}
              reportsCount={reports.length || 2}
              onNavigateToScreen={(scr) => setScreen(scr as any)}
            />

            {/* PART 1: KEY HEALTH METRICS */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 space-x-reverse border-b border-slate-100 pb-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <h4 className="font-bold text-slate-800 text-[12.5px]">المؤشرات الحيوية والبيولوجية الحالية</h4>
              </div>

              {/* Grid Metrics */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-2.5 text-right font-sans"
              >
                {/* Metric DOB / Age */}
                <motion.div 
                  variants={itemVariants}
                  className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5 hover:shadow-xs transition-all"
                >
                  <span className="text-[10px] text-slate-400 block">العمر الحالي</span>
                  <div className="font-mono font-bold text-slate-850 text-xs">
                    {activePatient?.dob ? `${new Date().getFullYear() - new Date(activePatient.dob).getFullYear()} سنة` : 'غير متوفر'}
                  </div>
                  <span className="text-[8.5px] text-slate-400 block font-mono">الميلاد: {activePatient?.dob}</span>
                </motion.div>

                {/* Metric Blood Group */}
                <motion.div 
                  variants={itemVariants}
                  className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5 hover:shadow-xs transition-all"
                >
                  <span className="text-[10px] text-slate-400 block">فصيلة الدم</span>
                  <div className="font-bold text-rose-600 text-xs flex items-center space-x-1 space-x-reverse justify-end">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                    <span>{activePatient?.bloodGroup || "أ+ (O+)"}</span>
                  </div>
                  <span className="text-[8.5px] text-slate-400 block">متوافقة مخبرياً</span>
                </motion.div>

                {/* Metric Height / Weight */}
                <motion.div 
                  variants={itemVariants}
                  className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5 col-span-2 hover:shadow-xs transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">الطول والوزن ومؤشر كتلة الجسم</span>
                    <span className="text-[9px] text-indigo-600 font-bold">مؤشر BMI</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1">
                    <div className="text-[11px] text-slate-700">
                      <span>الوزن: </span><strong className="font-mono text-slate-900 font-bold">{activePatient?.weight} كجم</strong>
                      <span className="mx-1 text-slate-300">|</span>
                      <span>الطول: </span><strong className="font-mono text-slate-900 font-bold">{activePatient?.height} سم</strong>
                    </div>

                    {/* Calculated BMI Badge */}
                    {(() => {
                      const w = activePatient?.weight || 70;
                      const h = activePatient?.height || 170;
                      const bmiVal = Number((w / Math.pow(h / 100, 2)).toFixed(1));
                      let bmiLabel = "وزن طبيعي";
                      let bgC = "bg-emerald-50 text-emerald-700 border-emerald-150";
                      if (bmiVal < 18.5) {
                        bmiLabel = "نقص وزن";
                        bgC = "bg-blue-50 text-blue-750 border-blue-150";
                      } else if (bmiVal >= 25 && bmiVal < 30) {
                        bmiLabel = "وزن زائد";
                        bgC = "bg-amber-50 text-amber-700 border-amber-150";
                      } else if (bmiVal >= 30) {
                        bmiLabel = "سمنة";
                        bgC = "bg-rose-50 text-rose-700 border-rose-150";
                      }
                      return (
                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${bgC} flex items-center space-x-1 space-x-reverse`}>
                          <span>{bmiVal}</span>
                          <span className="text-[8.5px] font-medium font-sans">({bmiLabel})</span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* BMI Visual Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                    <div className="w-[20%] h-full bg-blue-400" title="نقص وزن"></div>
                    <div className="w-[30%] h-full bg-emerald-500" title="وزن طبيعي"></div>
                    <div className="w-[25%] h-full bg-amber-400" title="وزن زائد"></div>
                    <div className="w-[25%] h-full bg-rose-500" title="سمنة"></div>
                  </div>
                </motion.div>

                {/* Maternity Details if Pregnant */}
                {activePatient?.pregnancyLactation?.isPregnant && (
                  <motion.div 
                    variants={itemVariants}
                    className="bg-pink-50/75 p-2.5 rounded-xl border border-pink-100 col-span-2 text-right hover:shadow-xs transition-all"
                  >
                    <div className="flex items-center space-x-1.5 space-x-reverse text-pink-700 font-bold text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
                      <span>سجل الحمل والرعاية النشط</span>
                    </div>
                    <p className="text-[9.5px] text-pink-900 mt-1 leading-normal font-sans">
                      المريضة حامل في الأسبوع <strong>{activePatient.pregnancyLactation.weeks}</strong>. يمنع صرف مضادات الالتهاب غير الستيروئيدية (مثل الإيبوبروفين وديكلوفيناك الصوديوم) حماية للكلى الجنينية وتجنب القصور الشرياني الجنيني.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* PART 2: ACTIVE ALERT & MEDICATION ALERTS */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 space-x-reverse border-b border-slate-100 pb-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
                <h4 className="font-bold text-slate-800 text-[12.5px]">توجيهات ومحاذير واقي السلامة النشط</h4>
              </div>

              {/* Allergy flags */}
              <div className="space-y-2.5">
                {/* Drug Allergies */}
                <div className="space-y-1 text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">الحساسية الدوائية المسجلة</span>
                  {activePatient?.allergies.drugAllergies && activePatient.allergies.drugAllergies.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {activePatient.allergies.drugAllergies.map((allergy, i) => (
                        <span key={i} className="bg-rose-50 border border-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-lg flex items-center space-x-1 space-x-reverse">
                          <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                          <span>{allergy}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-emerald-600">لا توجد حساسية دوائية معروفة مسجلة</p>
                  )}
                </div>

                {/* Food Allergies */}
                <div className="space-y-1 text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">الحساسية الغذائية المسجلة</span>
                  {activePatient?.allergies.foodAllergies && activePatient.allergies.foodAllergies.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {activePatient.allergies.foodAllergies.map((food, i) => (
                        <span key={i} className="bg-amber-50 border border-amber-100 text-amber-800 text-[9.5px] font-bold px-2 py-0.5 rounded-lg">
                          {food}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500">لا توجد حساسية غذائية معروفة</p>
                  )}
                </div>

                {/* Specific Health Warning Guidelines based on profile */}
                <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3 text-right">
                  <h5 className="text-[10px] font-bold text-amber-900 mb-1 flex items-center space-x-1.5 space-x-reverse">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>تنبيه السلامة الوقائي المخصص:</span>
                  </h5>
                  {activePatient?.nationalId === "29010151234567" ? (
                    <p className="text-[9.5px] text-amber-800 leading-relaxed font-sans">
                      نظراً لتشخيص المريض بـ <strong>ارتفاع ضغط الدم (Hypertension)</strong> وهو حسّاس بشدة تجاه مركب الأسبرين؛ يوصى بتجنب دواء ديكونجستنت (مثل كلارينيز وتل فاست للبرد) وتجنب عائلة مسكنات فولتارين وبروفين لخطورتهم المباشرة على انتظام ضغط الدم. الباراسيتامول هو المسكن الآمن للآلام.
                    </p>
                  ) : activePatient?.pregnancyLactation?.isPregnant ? (
                    <p className="text-[9.5px] text-pink-900 leading-relaxed font-sans">
                      المريضة حامل وتحتاج رعاية صيدلانية مزدوجة. يمنع تناول أي عقاقير مضادة لالتهاب العظام إلا بعد تأكيد صيدلاني بورد لسلامة الجنين. لا يُمسح بصرف تركيبات البرد المحشوة بالسودوإيفيدرين لتلافي الضغط الرحمي الشرياني الحاد.
                    </p>
                  ) : (
                    <p className="text-[9.5px] text-slate-600 leading-relaxed">
                      تأكد دائمًا من مشاركة جميع الأدوية الحالية المتناولة (سواء كانت فيتامينات أو مكملات) مع مستشارك الصيدلاني لتفادي التداخلات الدوائية الضارة.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* PART 3: CLINICAL REPORTS LIST & VIEWER */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 space-x-reverse justify-between border-b border-slate-100 pb-2">
                <button 
                  onClick={fetchReports}
                  className="text-[10px] text-teal-700 font-bold hover:underline flex items-center space-x-1 space-x-reverse"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>تحديث السجل</span>
                </button>
                <div className="flex items-center space-x-1.5 space-x-reverse">
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-bold text-slate-800 text-[12.5px]">السجلات والتقارير الإكلينيكية الموقعة</h4>
                </div>
              </div>

              {isLoadingReports ? (
                <div className="py-6 flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
                  <p className="text-xs text-slate-400 font-sans">جاري قراءة تقارير الصيدلي المعتمدة...</p>
                </div>
              ) : reports.length > 0 ? (
                <div className="space-y-2.5">
                  {reports.map((rep) => (
                    <div 
                      key={rep.id}
                      onClick={() => setSelectedReport(rep)}
                      className="p-3 bg-slate-50 hover:bg-teal-50/20 border border-slate-200 hover:border-teal-200 rounded-xl transition-all cursor-pointer text-right space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold font-mono">
                          {rep.id}
                        </span>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                            rep.serviceType === "OTC_CONSULTATION" ? "bg-teal-100 text-teal-800" : "bg-cyan-100 text-cyan-800"
                          }`}>
                            {rep.serviceType === "OTC_CONSULTATION" ? "استشارة OTC" : "مراجعة روشتة"}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11.5px] font-bold text-slate-700 mt-1 leading-snug">
                        {rep.otcFields?.chiefComplaint || rep.revisionFields?.diagnosis || "مراجعة الأدوية والصيدلة الإكلينيكية"}
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 font-mono">
                        <span>بتاريخ: {new Date(rep.createdAt).toLocaleDateString('ar-EG')}</span>
                        <span className="text-teal-700 font-bold">بإشراف: {rep.pharmacistName.split(" ")[1] || rep.pharmacistName}</span>
                      </div>
                      
                      <div className="text-[9px] text-emerald-700 border-t border-slate-100 pt-1 mt-1 flex items-center justify-end space-x-1 space-x-reverse">
                        <Check className="w-2.5 h-2.5 stroke-[3px]" />
                        <span>معتمد ومطابق لمعايير هيئة الدواء EDA</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-150 text-center space-y-2">
                  <p className="text-[10.5px] text-slate-500 font-medium">لا توجد تقارير إكلينيكية صادرة حالياً لملفك الشخصي.</p>
                  <p className="text-[9.5px] text-slate-400 leading-normal">عقب قيام الصيدلي الإكلينيكي بمراجعة طلبات استشارتك أو روشتتك والتوقيع عليها، سيظهر التقرير التفاعلي المفصل هنا فوراً.</p>
                </div>
              )}
            </div>

            {/* Quick Action to return */}
            <button
              onClick={() => setScreen('dashboard')}
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs py-3 rounded-xl transition-all"
            >
              الرجوع للرئيسية
            </button>
          </div>
        )}

        {/* SELECTED CLINICAL REPORT EXTREMELY HIGH FIDELITY DETAIL DRAWER */}
        {selectedReport && (
          <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-end justify-center p-3 animate-fade-in" style={{ direction: "rtl" }}>
            <div className="bg-white w-full max-w-[360px] rounded-t-3xl shadow-2xl p-4 max-h-[85%] overflow-y-auto space-y-4 text-right">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-150 pb-3">
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full p-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 transform rotate-180" />
                </button>
                <div className="text-right">
                  <span className="text-[9px] bg-emerald-100 text-emerald-850 px-2.5 py-0.5 rounded-full font-bold">مستند طبي رسمي معتمد</span>
                  <h3 className="font-bold text-slate-850 text-sm mt-1">تفاصيل التقرير الصيدلاني المبرم</h3>
                </div>
              </div>

              {/* Meta information */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-[10px] space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">كود المستند التوثيقي:</span>
                  <span className="font-bold text-slate-700">{selectedReport.id}</span>
                </div>
                <div className="flex justify-between text-right">
                  <span className="text-slate-400">نوع الخدمة المراجعة:</span>
                  <span className="font-bold text-teal-700">
                    {selectedReport.serviceType === "OTC_CONSULTATION" ? "استشارة دوائية لا وصفية OTC" : "تدقيق روشتة DUR"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">الصيدلي الإكلينيكي الموقع:</span>
                  <button
                    onClick={() => handleOpenPharmacistProfile("LIC-12345")}
                    className="font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer transition-colors"
                    title="انقر لعرض الملف الشامل والشهادات وتقييمات المرضى"
                  >
                    <span>{selectedReport.pharmacistName}</span>
                    <span className="text-[9px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-sans">ملف الصيدلي 📜</span>
                  </button>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">تاريخ الاعتماد:</span>
                  <span className="font-bold text-slate-700">
                    {new Date(selectedReport.createdAt).toLocaleString('ar-EG')}
                  </span>
                </div>
              </div>

              {/* Content representation */}
              <div className="space-y-3.5 text-xs leading-relaxed text-right">
                {selectedReport.serviceType === "OTC_CONSULTATION" && selectedReport.otcFields && (
                  <>
                    {/* Chief Complaint */}
                    <div className="space-y-1 bg-teal-50/40 p-3 rounded-xl border border-teal-100">
                      <h4 className="font-bold text-teal-900 text-[11px]">الشكوى والبدائل العلاجية</h4>
                      <p className="text-slate-700 text-[10.5px] leading-relaxed">{selectedReport.otcFields.chiefComplaint}</p>
                    </div>

                    {/* Medications Recommended */}
                    {selectedReport.otcFields.therapeuticRecommendations?.otcMedications && (
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-slate-800 text-[11px] block">العلاجات الموصى بها صيدلانياً</h4>
                        <div className="space-y-2">
                          {selectedReport.otcFields.therapeuticRecommendations.otcMedications.map((med: any, i: number) => (
                            <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 text-right">
                              <div className="flex justify-between font-bold text-slate-800 text-[11px]">
                                <span className="text-teal-800">{med.brandName}</span>
                                <span className="text-purple-600 font-mono text-[9px] direction-ltr">({med.activeIngredient})</span>
                              </div>
                              <div className="text-[10px] text-slate-500 space-y-0.5">
                                <div>الجرعة: <strong>{med.dose}</strong></div>
                                <div>التنظيم: <strong>{med.timing}</strong></div>
                                <div>المدة: <strong>{med.duration}</strong></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Behavioral Recommendations */}
                    <div className="space-y-1 p-3 bg-amber-50/40 border border-amber-100 rounded-xl text-right">
                      <h4 className="font-bold text-amber-950 text-[11px]">نصائح سلوكية وتغذوية</h4>
                      <p className="text-amber-900 text-[10.5px] leading-relaxed">{selectedReport.otcFields.behavioralRecommendations}</p>
                    </div>

                    {/* Referral if applicable */}
                    {(selectedReport.otcFields.therapeuticRecommendations?.type === "REFERRAL" || 
                     selectedReport.otcFields.therapeuticRecommendations?.type === "BOTH") && (
                      <div className="p-3 bg-red-50/70 rounded-xl border border-red-200 text-red-900 space-y-1 text-right">
                        <strong className="text-[10.5px] block font-bold">⚠️ توصية إحالة عاجلة لطبيب أخصائي:</strong>
                        <p className="text-[10px] leading-normal font-sans">{selectedReport.otcFields.therapeuticRecommendations.referralDetails}</p>
                      </div>
                    )}
                  </>
                )}

                {selectedReport.serviceType === "PRESCRIPTION_REVISION" && selectedReport.revisionFields && (
                  <>
                    {/* Diagnosis / Match */}
                    <div className="space-y-1 bg-cyan-50/30 p-3 rounded-xl border border-cyan-100 text-right">
                      <h4 className="font-bold text-cyan-950 text-[11px]">تشخيص الطبيب والمطابقة الدوائية</h4>
                      <p className="text-slate-700 text-[10.5px]">
                        <strong>التشخيص الإكلينيكي: </strong> {selectedReport.revisionFields.diagnosis}
                      </p>
                      <p className="text-slate-600 text-[10.5px] mt-1">
                        <strong>نتيجة المطابقة والملائمة: </strong> {selectedReport.revisionFields.drugDiagnosisMatch}
                      </p>
                    </div>

                    {/* Drug Drug Interaction DUR Result */}
                    <div className={`p-3 rounded-xl border text-[11px] text-right ${
                      selectedReport.revisionFields.drugDrugInteractions === 'Red' 
                        ? 'bg-rose-50 border-rose-200 text-rose-900' 
                        : selectedReport.revisionFields.drugDrugInteractions === 'Yellow'
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-emerald-50 border-emerald-250 text-emerald-900'
                    }`}>
                      <h5 className="font-bold text-[11px] mb-1 flex items-center space-x-1.5 space-x-reverse justify-end">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          selectedReport.revisionFields.drugDrugInteractions === 'Red' 
                            ? 'bg-rose-600' 
                            : selectedReport.revisionFields.drugDrugInteractions === 'Yellow'
                            ? 'bg-amber-500'
                            : 'bg-emerald-600'
                        }`}></span>
                        <span>نتائج فحص التعارضات الدوائية (DUR Risk Assessment)</span>
                      </h5>
                      <p className="mt-1 leading-relaxed text-[10px]">{selectedReport.revisionFields.interactionDetails}</p>
                    </div>

                    {/* Outlines of stopped medications or therapeutic duplication */}
                    {selectedReport.revisionFields.unnecessaryMedications && selectedReport.revisionFields.unnecessaryMedications.length > 0 && (
                      <div className="p-3 bg-red-50 text-red-900 rounded-xl border border-red-200 text-[10px]">
                        <strong>⚠️ أدوية يوصي رئيس القسم بإيقافها فورا للإنقاص أو الخطر:</strong>
                        <ul className="list-disc pr-4 mt-1 space-y-0.5">
                          {selectedReport.revisionFields.unnecessaryMedications.map((un, idx) => (
                            <li key={idx} className="font-mono">{un}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Treatment Guidelines */}
                    {selectedReport.revisionFields.administrationGuidelines && (
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-slate-800 text-[11px] block text-right">إرشادات تناول وجرعات الروشتة المدققة</h4>
                        <div className="space-y-2">
                          {selectedReport.revisionFields.administrationGuidelines.map((g: any, i: number) => (
                            <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-right space-y-1">
                              <div className="font-bold text-slate-800 flex justify-between">
                                <span className="text-teal-900">{g.brandName}</span>
                                <span className="text-purple-600 font-mono text-[9px] direction-ltr">({g.activeIngredient})</span>
                              </div>
                              <div className="text-slate-600 text-[9.5px] space-y-0.5 mt-0.5">
                                <div>الجرعة المقررة: {g.dose} • المدة: {g.duration}</div>
                                <div className="text-[10px] text-teal-800 font-medium">علاقة الغذاء: {g.foodRelation}</div>
                                {g.precautions && <div className="text-[9.5px] text-rose-700 bg-rose-50/50 p-1 rounded mt-1">⚠️ تنبيه صيدلاني: {g.precautions}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* PDF report download action */}
              <button
                disabled={isDownloadingPDF}
                onClick={() => handleDownloadPDF(selectedReport)}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 space-x-reverse transition-all border ${
                  isDownloadingPDF 
                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" 
                    : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-sm hover:shadow-md"
                }`}
              >
                {isDownloadingPDF ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                    <span>جاري تصدير التقرير الطبي...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-emerald-100" />
                    <span>تحميل التقرير الصيدلاني المعتمد (PDF)</span>
                  </>
                )}
              </button>

              {/* Close detail button */}
              <button
                onClick={() => setSelectedReport(null)}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-3 rounded-xl transition-all"
              >
                إغلاق التقرير والرجوع
              </button>
            </div>
          </div>
        )}

        {/* SCREEN: OFFLINE DYNAMIC PILL BOX REMINDER */}
        {screen === 'pillbox' && (
          <div className="flex-1 p-3.5 space-y-3.5 overflow-y-auto bg-slate-50 text-right">
            
            {/* Unified Dual-Tab Navigation Bar */}
            <div className="flex bg-slate-250/80 p-0.5 rounded-xl border border-slate-300">
              <button
                onClick={() => setScreen('pillbox')}
                className="flex-1 py-2 rounded-lg text-[11px] font-black transition-all text-center focus:outline-none bg-white text-indigo-700 shadow-xs border border-indigo-200/10"
              >
                💊 منبهات الأدوية النشطة
              </button>
              <button
                onClick={() => setScreen('insights')}
                className="flex-1 py-2 rounded-lg text-[11px] font-bold transition-all text-center focus:outline-none text-slate-505 hover:text-slate-850"
              >
                📊 تحليلات وامتثال العلاج
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-800 to-indigo-950 text-white rounded-2xl p-3.5 shadow-md text-right space-y-1.5 border border-indigo-900/40">
              <span className="text-[9.5px] bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-full font-bold">علبة الأدوية الرقمية وتنبيهات الـ MMP</span>
              <h3 className="font-bold text-[12.5px]">تنسيق الجدول الزمني وإشعارات المتصفح</h3>
              <p className="text-[10px] text-indigo-200 leading-normal">
                الامتثال الإكلينيكي يحمي الكلى والجرعات الطبية. يرجى تعديل وإعداد منبه دواء معين لمعاينة الرنين المباشر والتنبيه الصوتي.
              </p>

              {/* Browser Notification Activator Button */}
              <div className="pt-1.5 border-t border-indigo-800/40 mt-1 flex flex-col space-y-1.5 text-right">
                <div className="flex items-center justify-between">
                  <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                    notificationPermission === "granted" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                  }`}>
                    {notificationPermission === "granted" ? "🔔 إشعارات المتصفح: مفعّلة" : "⚠️ بحاجة لترخيص الإشعارات"}
                  </span>
                  
                  {notificationPermission !== "granted" && (
                    <button
                      onClick={requestBrowserNotificationPermission}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg text-[9.5px] font-bold cursor-pointer transition-colors"
                    >
                      تفعيل إشعارات الويب
                    </button>
                  )}
                </div>

                {/* FCM / Web Push Device Token Details and Simulation Control */}
                <div className="bg-indigo-950/80 p-2 rounded-xl border border-indigo-700/30 text-right space-y-1 mt-1 text-[9px]">
                  <div className="flex items-center justify-between text-indigo-200">
                    <span className="font-bold text-indigo-300">🛰️ حالة خدمة الدفع الفوري (FCM)</span>
                    <span className="font-mono bg-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-200">
                      {pushRegistrationInfo ? pushRegistrationInfo.provider : "تحميل..."}
                    </span>
                  </div>
                  {pushRegistrationInfo?.token ? (
                    <div className="space-y-1.5">
                      <div className="text-slate-400 font-mono text-[7.5px] overflow-hidden text-ellipsis whitespace-nowrap bg-indigo-900/40 p-1 rounded border border-indigo-800/20 select-all" dir="ltr">
                        {pushRegistrationInfo.token}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-emerald-400 font-bold">🟢 مسجل نشط على الخادم</span>
                        <button
                          onClick={triggerTestPush}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded text-[8px] font-bold transition-all"
                        >
                          إرسال تنبيه تجريبي 🚀
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-amber-400">جاري ربط جهازك ببوابة الدفع...</span>
                      <button
                        onClick={handleSetupPushNotifications}
                        disabled={isRegisteringPush}
                        className="bg-indigo-700 hover:bg-indigo-600 text-white px-2 py-0.5 rounded text-[8px] font-bold transition-all disabled:opacity-50"
                      >
                        {isRegisteringPush ? "جاري الربط..." : "إعادة المحاولة 🔄"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MMP Premium Subscription Promo/Status */}
            {patientMmp.length === 0 ? (
              <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/15 p-4 rounded-2xl border border-amber-500/30 text-right space-y-3">
                <div className="flex items-start justify-between space-x-2 space-x-reverse">
                  <div className="bg-amber-500 text-white p-1.5 rounded-xl">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-grow flex-shrink">
                    <h4 className="font-extrabold text-slate-800 text-xs text-right">عضوية باقة إدارة الأدوية السنوية - MMP</h4>
                    <p className="text-[10px] text-slate-650 leading-normal mt-0.5 text-right">
                      اشترك الآن لتفعيل جدولة الجرعات الشخصية والتزامن التلقائي مع تحذيرات EDA والتنبيهات المزدوجة من الصيدلي الاستشاري.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-amber-500/10 pt-2.5">
                  <span className="text-xs font-black text-amber-700">400 ج.م <span className="text-[9px] text-slate-400 font-normal">/ سنوياً</span></span>
                  <button
                    onClick={() => {
                      setPaymentServiceType('MMP');
                      setScreen('payment');
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors shadow-sm flex items-center space-x-1 space-x-reverse focus:outline-none"
                  >
                    <span>اشترك وسدد الآن</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/10 p-3.5 rounded-2xl border border-emerald-500/20 text-right flex items-center justify-between">
                <span className="text-[10px] text-emerald-800 font-bold">✓ خدمة ممتازة مفعلة: خطة إدارة الجرعات MMP نشطة للأسبوع الجاري بسداد كامل</span>
                <span className="text-[10px] bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold">✓ مدفوع</span>
              </div>
            )}

            {/* Direct WebRTC MMP Video consultation lobby trigger */}
            <div className="bg-indigo-900 text-white p-3.5 rounded-2xl text-right space-y-2 border border-indigo-950 flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-[11.5px] flex items-center space-x-1.5 space-x-reverse justify-start">
                  <Video className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                  <span>غرفة الاستشارة السريرية المرئية الفورية (MMP Call)</span>
                </h4>
                <p className="text-[9.5px] text-indigo-200 leading-normal mt-1">
                  انقر هنا للانضمام إلى البث المرئي المباشر الآمن والتحدث مع دكتور الصيدلة المتابع لمراجعة جدول الجرعات وتثبيت المنبهات.
                </p>
              </div>
              <button
                onClick={() => {
                  setScreen('videocall');
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] py-1.5 rounded-xl cursor-pointer transition-colors shadow-sm flex items-center justify-center space-x-1 space-x-reverse focus:outline-none"
              >
                <span>ابدأ مكالمة الفيديو لمراجعة الأدوية حياً</span>
              </button>
            </div>

            {/* Test Alarms Action block */}
            <button
              onClick={triggerMedicationReminders}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10.5px] rounded-xl shadow-xs cursor-pointer transition-all flex items-center justify-center space-x-1.5 space-x-reverse focus:outline-none"
            >
              <Bell className="w-3.5 h-3.5 text-white animate-bounce" />
              <span>إرسال وتجريب منبه فوري بنظام الإشعارات المزدوج الآن</span>
            </button>

            {/* RECENT NOTIFICATIONS COMPONENT */}
            <RecentNotifications
              notifications={notifications}
              patient={activePatient}
              onMarkAsRead={(notifId) => setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n))}
              onMarkAllAsRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
              onNavigateToScreen={(scr) => setScreen(scr as any)}
              onSelectAuditReport={(repId) => {
                const rep = reports.find(r => r.id === repId) || reports[0];
                if (rep) setSelectedReport(rep);
                setScreen('reports');
              }}
            />

            {/* FULL MEDICATION ADHERENCE ALERTS SETTINGS & SCHEDULE */}
            <MedicationScheduleAlerts
              patient={activePatient}
              showScheduleOnlyOnDashboard={false}
              onDoseTaken={(doseId) => setPillStatus(prev => ({ ...prev, [doseId]: true }))}
              onDoseSkipped={(doseId) => setSkippedAlarms(prev => ({ ...prev, [doseId]: true }))}
              onDoseSnoozed={(doseId) => setSnoozedAlarms(prev => ({ ...prev, [doseId]: { time: new Date().toISOString(), count: (prev[doseId]?.count || 0) + 1 } }))}
              onAddNotification={(notif) => setNotifications(prev => [{
                id: `notif-${Date.now()}`,
                recipient: 'patient',
                title: notif.title,
                body: notif.body,
                type: notif.type as any,
                read: false,
                createdAt: new Date().toISOString()
              }, ...prev])}
            />

            {/* List Active Profile Drugs */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-[9.5px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-bold">
                  {finalTimetableItems.length} أدوية مجدولة
                </span>
                <h4 className="font-bold text-slate-700 text-xs text-right">جدول الجرعات والمنبهات لليوم</h4>
              </div>

              <div className="space-y-2.5">
                {finalTimetableItems.map((item) => {
                  const isAlarmEnabled = pillAlarms[item.id] !== false;
                  const isTaken = pillStatus[item.id] === true;
                  const isSkipped = skippedAlarms[item.id] === true;
                  const snoozeInfo = snoozedAlarms[item.id];

                  const timeOfDayStr = item.timeOfDay || "12:00";
                  const formattedDisplayTime = (() => {
                    const [hrs, mins] = timeOfDayStr.split(":");
                    const hNum = parseInt(hrs) || 0;
                    const suffix = hNum >= 12 ? "مساءً" : "صباحاً";
                    const formattedHrs = hNum % 12 === 0 ? 12 : hNum % 12;
                    return `${String(formattedHrs).padStart(2, '0')}:${mins || "00"} ${suffix}`;
                  })();

                  return (
                    <div 
                      key={item.id} 
                      className={`bg-white p-3 rounded-2xl border transition-all text-right space-y-2 flex flex-col justify-between ${
                        isTaken ? "border-emerald-200 bg-emerald-50/5" : 
                        isSkipped ? "border-amber-200 bg-amber-50/10 opacity-80" :
                        snoozeInfo ? "border-indigo-200 bg-indigo-50/5" : "border-slate-200"
                      }`}
                    >
                      {/* Top Bar inside Pill Card */}
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        {/* Alarm Enabled toggle */}
                        <div className="flex items-center space-x-1.5 space-x-reverse">
                          <button
                            onClick={() => {
                              setPillAlarms(prev => ({ ...prev, [item.id]: !isAlarmEnabled }));
                            }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isAlarmEnabled ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-400"
                            }`}
                            title={isAlarmEnabled ? "إيقاف منبه الدواء" : "تفعيل منبه الدواء"}
                          >
                            {isAlarmEnabled ? <Bell className="w-4 h-4 text-indigo-700 animate-pulse" /> : <BellOff className="w-4 h-4" />}
                          </button>

                          {/* Live Time Picker Input */}
                          <div className="flex flex-col text-right">
                            <input
                              type="time"
                              value={timeOfDayStr}
                              onChange={(e) => handleUpdateTimeOfDay(item, e.target.value)}
                              className="text-[10px] p-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 w-[70px] font-bold"
                              title="تعديل زمن المنبه الحي"
                            />
                          </div>
                        </div>

                        {/* Title and Badge */}
                        <div className="text-right">
                          <div className="flex items-center space-x-1 border-slate-200 space-x-reverse justify-end">
                            <span className="bg-indigo-50 text-indigo-805 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                              🕒 {formattedDisplayTime}
                            </span>
                            <h5 className="font-bold text-slate-800 text-xs truncate max-w-[150px]">
                              {item.brandName}
                            </h5>
                          </div>
                        </div>
                      </div>

                      {/* Pill info middle row */}
                      <div className="flex items-start justify-between">
                        {/* Status Checker */}
                        <button
                          onClick={() => setPillStatus(prev => ({ ...prev, [item.id]: !isTaken }))}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5 ${
                            isTaken ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white hover:border-slate-400"
                          }`}
                          title={isTaken ? "تحديث كـ لم يتم أخذها" : "تحديث كـ تم أخذ الجرعة وتناولها"}
                        >
                          {isTaken && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                        </button>

                        <div className="flex-1 pr-3.5 text-right space-y-0.5">
                          <p className="text-[10px] text-slate-400 font-mono text-right truncate">
                            ({item.activeIngredient})
                          </p>
                          <p className="text-[10.5px] text-slate-500 leading-normal">
                            الجرعة: <strong className="text-slate-700">{item.dose || item.dosageForm}</strong>
                          </p>
                          <p className="text-[9.5px] text-teal-600 font-medium">
                            📌 علاقة الغذاء: {
                              item.foodRelation === "Before Food" ? "قبل الأكل" :
                              item.foodRelation === "After Food" ? "بعد الأكل" :
                              item.foodRelation === "With Food" ? "مع الأكل" :
                              item.foodRelation === "Empty Stomach" ? "على معدة فارغة" : "لا يشترط وقت الأكل"
                            }
                          </p>
                          {item.specialInstructions && (
                            <p className="text-[9px] text-slate-500 bg-slate-50/50 p-1.5 rounded-lg border border-slate-100 leading-relaxed text-right">
                              📝 إرشاد: {item.specialInstructions}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Interactive States Badge Row */}
                      {(isSkipped || snoozeInfo) && (
                        <div className="flex flex-wrap gap-1.5 justify-end pt-1">
                          {isSkipped && (
                            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 space-x-reverse border border-amber-200">
                              <span>⚠️ تم تخطي الجرعة المقررة لليوم</span>
                            </span>
                          )}
                          {snoozeInfo && (
                            <span className="bg-indigo-100 text-indigo-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 space-x-reverse border border-indigo-200">
                              <span>🕒 مؤجل للساعة {snoozeInfo.time} (تأجيل {snoozeInfo.count}x)</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Interactive Snooze / Skip Controls */}
                      <div className="flex items-center justify-between border-t border-slate-50 pt-2 mt-1 gap-2">
                        {/* Reset button to clear custom state */}
                        {(isTaken || isSkipped || snoozeInfo) ? (
                          <button
                            onClick={() => resetAlarmStatus(item)}
                            className="text-[10px] px-2.5 py-1 text-slate-600 hover:text-slate-805 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer font-bold transition-all flex items-center space-x-1 space-x-reverse border border-slate-200"
                            title="إعادة ضبط حالة المنبه لليوم"
                          >
                            <RefreshCw className="w-3 h-3 text-slate-500" />
                            <span>إعادة الجرعة للوضع النشط</span>
                          </button>
                        ) : (
                          <span className="text-[9px] text-slate-400 font-medium">التحكم السريع بالمنبه:</span>
                        )}

                        {!isTaken && (
                          <div className="flex items-center space-x-1.5 space-x-reverse">
                            {!isSkipped && (
                              <button
                                onClick={() => snoozeAlarm(item)}
                                className="text-[10px] px-2.5 py-1 text-indigo-700 hover:text-indigo-950 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer font-bold transition-all flex items-center space-x-1 space-x-reverse border border-indigo-200/40"
                                title="تأجيل المنبه لمدة 10 دقائق من الآن"
                              >
                                <Hourglass className="w-3 h-3 text-indigo-600" />
                                <span>غفوة 10د</span>
                              </button>
                            )}
                            
                            {!isSkipped ? (
                              <button
                                onClick={() => skipAlarm(item)}
                                className="text-[10px] px-2.5 py-1 text-amber-750 hover:text-amber-950 bg-amber-50 hover:bg-amber-100/80 rounded-lg cursor-pointer font-bold transition-all flex items-center space-x-1 space-x-reverse border border-amber-200/40"
                                title="تخطي هذه الجرعة لليوم"
                              >
                                <AlertTriangle className="w-3 h-3 text-amber-605" />
                                <span>تخطي اليوم</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-amber-600 font-black">جرعة مستبعدة</span>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-indigo-50/50 rounded-2xl p-3 border border-indigo-150 text-right text-xs">
              <h5 className="font-bold text-indigo-950 text-xs mb-1">💡 نصيحة امتثال إكلينيكي:</h5>
              <p className="text-[10.5px] text-indigo-800 leading-normal">
                دواء الحديد يقل امتصاصه الدوائي بنسبة تفوق 60% في حال تزامنه مع الحليب أو القهوة والشاي الأحمر. ننصح دائماً بفصلهم بمدة لا تقل عن ساعتين لتفادي الفقر الحاد بالدم.
              </p>
            </div>
          </div>
        )}

        {/* SCREEN: MEDICATION COMPLIANCE INSIGHTS GRAPH */}
        {screen === 'insights' && (
          <div className="flex-1 p-3.5 space-y-3.5 overflow-y-auto bg-slate-50 text-right">
            
            {/* Unified Dual-Tab Navigation Bar */}
            <div className="flex bg-slate-250/80 p-0.5 rounded-xl border border-slate-300">
              <button
                onClick={() => setScreen('pillbox')}
                className="flex-1 py-2 rounded-lg text-[11px] font-bold transition-all text-center focus:outline-none text-slate-505 hover:text-slate-850"
              >
                💊 منبهات الأدوية النشطة
              </button>
              <button
                onClick={() => setScreen('insights')}
                className="flex-1 py-2 rounded-lg text-[11px] font-black transition-all text-center focus:outline-none bg-white text-teal-700 shadow-xs border border-teal-200/10"
              >
                📊 تحليلات وامتثال العلاج
              </button>
            </div>

            <MedicationInsights
              activePatient={activePatient}
              finalTimetableItems={finalTimetableItems}
              pillStatus={pillStatus}
              skippedAlarms={skippedAlarms}
              snoozedAlarms={snoozedAlarms}
            />
          </div>
        )}

        {/* SCREEN: PHARMACISTS DIRECTORY & REVIEWS */}
        {screen === 'pharmacists' && (
          <div className="flex-1 p-4 bg-slate-50 space-y-4 overflow-y-auto">
            <button
              onClick={() => setScreen('dashboard')}
              className="flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 cursor-pointer mb-1"
            >
              <ArrowLeft className="w-4 h-4 transform rotate-180" />
              <span>العودة للوحة الرئيسية</span>
            </button>

            <PharmacistsDirectory
              onSelectPharmacist={(pharm) => handleOpenPharmacistProfile(pharm)}
              onBookConsultation={(pharm) => {
                setBookingSpecialty(pharm.specialty);
                setScreen('otc-book');
              }}
            />
          </div>
        )}

        {/* RECENT PHARMACY ALERTS & UPCOMING MEDICATION REMINDERS DROPDOWN POPOVER */}
        {showNotifDropdown && (
          <div className="absolute top-14 left-3 right-3 z-50 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-3.5 text-right font-sans animate-in fade-in zoom-in-95 duration-150" style={{ direction: "rtl" }}>
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="p-1.5 bg-teal-500/20 text-teal-400 rounded-lg relative">
                  <Bell className="w-4 h-4 animate-bounce" />
                  {totalAlertCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <span>مركز التنبيهات والجرعات</span>
                    {totalAlertCount > 0 && (
                      <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] px-1.5 py-0.2 rounded-full font-black">
                        {totalAlertCount} جديد
                      </span>
                    )}
                  </h4>
                  <span className="text-[9.5px] text-slate-400">
                    تنبيهات الأدوية والتقارير الطبية المعتمدة
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 space-x-reverse">
                <button
                  onClick={() => setShowNotifDropdown(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-md bg-slate-800 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Tabs Bar */}
            <div className="flex border-b border-slate-800 mb-3 text-xs font-bold">
              <button
                onClick={() => setNotifDropdownTab('reminders')}
                className={`flex-1 py-1.5 px-2 text-center flex items-center justify-center space-x-1 space-x-reverse transition-all border-b-2 cursor-pointer ${
                  notifDropdownTab === 'reminders'
                    ? 'border-teal-400 text-teal-300 bg-teal-950/40 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>💊 الجرعات القادمة</span>
                {pendingRemindersCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 text-[9px] px-1.5 py-0.2 rounded-full font-extrabold">
                    {pendingRemindersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setNotifDropdownTab('alerts')}
                className={`flex-1 py-1.5 px-2 text-center flex items-center justify-center space-x-1 space-x-reverse transition-all border-b-2 cursor-pointer ${
                  notifDropdownTab === 'alerts'
                    ? 'border-teal-400 text-teal-300 bg-teal-950/40 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🔔 تنبيهات النظام</span>
                {unreadAlertsCount > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-extrabold">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>
            </div>

            {/* TAB CONTENT 1: UPCOMING MEDICATION REMINDERS */}
            {notifDropdownTab === 'reminders' && (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {upcomingReminders.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    لا توجد أدوية أو جرعات مسجلة حالياً في خطتك.
                  </div>
                ) : (
                  upcomingReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`p-2.5 rounded-xl border text-xs transition-all ${
                        reminder.isTaken
                          ? "bg-slate-950/40 border-slate-800 text-slate-400 opacity-75"
                          : "bg-slate-800/90 border-teal-500/40 hover:bg-slate-800 text-white shadow-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[9.5px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                          reminder.isTaken
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                        }`}>
                          {reminder.isTaken ? '✅ تم أخذ الجرعة' : '⏰ جرعة قادمة'}
                        </span>

                        <span className="text-[10px] text-teal-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                          {reminder.time}
                        </span>
                      </div>

                      <h5 className="font-bold text-[11.5px] text-white leading-tight flex items-center gap-1">
                        <span>💊 {reminder.medName}</span>
                      </h5>

                      <div className="text-[10px] text-slate-300 mt-1 space-y-0.5">
                        <p><span className="text-slate-400">الجرعة:</span> <strong className="text-teal-200">{reminder.dose}</strong></p>
                        {reminder.foodRelation && (
                          <p><span className="text-slate-400">التعليمات:</span> {reminder.foodRelation}</p>
                        )}
                        {reminder.instructions && reminder.instructions !== reminder.time && (
                          <p className="text-[9.5px] text-amber-200/90">{reminder.instructions}</p>
                        )}
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-slate-700/60 flex items-center justify-between">
                        {!reminder.isTaken ? (
                          <button
                            onClick={() => handleTakeDoseInDropdown(reminder.id, reminder.medName)}
                            className="bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg transition-all shadow-sm cursor-pointer flex items-center gap-1"
                          >
                            <span>تأكيد أخذ الجرعة 💊</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <span>✓ مكتملة اليوم</span>
                          </span>
                        )}

                        <button
                          onClick={() => {
                            setScreen('pillbox');
                            setShowNotifDropdown(false);
                          }}
                          className="text-[9.5px] text-slate-400 hover:text-teal-300 underline cursor-pointer"
                        >
                          عرض علبة الأدوية 📦
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT 2: PHARMACY ALERTS */}
            {notifDropdownTab === 'alerts' && (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">لا توجد تنبيهات صيدلانية حالياً.</div>
                ) : (
                  <>
                    {notifications.some(n => !n.read) && (
                      <div className="flex justify-end mb-1">
                        <button
                          onClick={() => {
                            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                          }}
                          className="text-[9.5px] text-teal-400 hover:text-teal-300 font-bold bg-teal-950/60 px-2 py-0.5 rounded-lg border border-teal-800/50 cursor-pointer"
                        >
                          قراءة كافة التنبيهات
                        </button>
                      </div>
                    )}
                    {notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotifAsRead(n.id);
                          if (n.type === 'ReportSigned') {
                            setScreen('overview');
                            setShowNotifDropdown(false);
                          } else if (n.type === 'PillReminder') {
                            setScreen('pillbox');
                            setShowNotifDropdown(false);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          !n.read 
                            ? "bg-slate-800/90 border-teal-500/50 hover:bg-slate-800 text-white" 
                            : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[9.5px] px-2 py-0.5 rounded-md font-bold ${
                            n.type === 'PillReminder' 
                              ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                              : n.type === 'ReportSigned'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                              : 'bg-teal-950 text-teal-300 border border-teal-800/50'
                          }`}>
                            {n.type === 'PillReminder' ? '💊 جرعة دواء' : n.type === 'ReportSigned' ? '📋 تقرير معتمد' : '🔔 تنبيه صيدلاني'}
                          </span>

                          <div className="flex items-center space-x-1.5 space-x-reverse text-[9px] text-slate-400">
                            <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {!n.read && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}
                          </div>
                        </div>

                        <h5 className="font-bold text-[11px] text-white leading-tight">{n.title}</h5>
                        <p className="text-[10px] text-slate-300 mt-1 leading-normal">{n.body}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Footer button */}
            <div className="pt-2 mt-2 border-t border-slate-800 flex justify-between items-center text-[10px]">
              <button
                onClick={() => {
                  setShowNotifDropdown(false);
                  setShowNotifCenter(true);
                }}
                className="w-full text-center bg-teal-600 hover:bg-teal-500 text-white font-bold py-1.5 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                عرض كافة التنبيهات والمنبهات المعتمدة ({notifications.length}) ➔
              </button>
            </div>
          </div>
        )}

        {/* IN-APP MOBILE NOTIFICATION CENTER PANEL */}
        {showNotifCenter && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-50 p-4 pt-10 text-right flex flex-col justify-between font-sans">
            <div className="space-y-4 flex-1 overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-3" style={{ direction: "rtl" }}>
                <h3 className="text-sm font-extrabold text-white flex items-center space-x-1.5 space-x-reverse">
                  <Bell className="w-5 h-5 text-teal-400 rotate-12" />
                  <span>مركز التنبيهات والإشعارات والمنبهات</span>
                </h3>
                <button 
                  onClick={() => setShowNotifCenter(false)}
                  className="text-[10px] bg-slate-800 hover:bg-slate-705 text-slate-300 font-bold px-3 py-1 rounded-full cursor-pointer focus:outline-none"
                >
                  إغلاق
                </button>
              </div>

              {/* Warning/Controls */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
                <p className="text-[10px] text-slate-400 font-medium text-center">أدوات تحكّم ومحاكاة التنبيهات المزدوجة والمباشرة</p>
                <div className="flex space-x-2 space-x-reverse justify-between">
                  <button 
                    onClick={triggerMedicationReminders}
                    className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold text-[10px] py-1.5 rounded-xl transition-all cursor-pointer shadow-md focus:outline-none flex items-center justify-center space-x-1.5 space-x-reverse"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>منبهات الأدوية MMP</span>
                  </button>
                  <button 
                    onClick={triggerAppointmentReminders}
                    className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] py-1.5 rounded-xl transition-all cursor-pointer shadow-md focus:outline-none flex items-center justify-center space-x-1.5 space-x-reverse"
                  >
                    <Calendar className="w-3.5 h-3.5 text-white" />
                    <span>تذكير المواعيد النشط</span>
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="space-y-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs text-center">لا توجد إشعارات واردة حتى الآن للهوية النشطة.</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id}
                      onClick={() => {
                        markNotifAsRead(n.id);
                        if (n.type === 'ReportSigned') {
                          setScreen('overview');
                          setShowNotifCenter(false);
                        } else if (n.type === 'PillReminder') {
                          setScreen('pillbox');
                          setShowNotifCenter(false);
                        }
                      }}
                      className={`p-3 rounded-xl border text-right cursor-pointer transition-all ${
                        n.read 
                          ? "bg-slate-950/60 border-slate-900/60 text-slate-400" 
                          : "bg-slate-950 border-teal-900/50 text-white"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] text-slate-500 font-mono">
                          {new Date(n.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className={`text-[11px] font-bold ${n.read ? "text-slate-400" : "text-teal-300"}`}>
                          {n.title}
                        </span>
                      </div>
                      <p className="text-[10.5px] leading-relaxed text-slate-300">{n.body}</p>
                      
                      {!n.read && (
                        <div className="mt-1 text-left">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 text-center">
              <button 
                onClick={async () => {
                  const unread = notifications.filter(n => !n.read);
                  await Promise.all(unread.map(n => markNotifAsRead(n.id)));
                }}
                className="text-xs text-teal-400 hover:text-teal-350 font-bold"
              >
                تحديد الكل كمقروء
              </button>
            </div>
          </div>
        )}

      </div>

      {/* PHARMACIST PROFILE & PATIENT REVIEWS MODAL */}
      <PharmacistProfileModal
        pharmacist={selectedPharmacistProfile}
        isOpen={isPharmacistModalOpen}
        onClose={() => setIsPharmacistModalOpen(false)}
        currentPatientName={activePatient?.fullName}
        onAddReview={handleAddPharmacistReview}
        onBookConsultation={(pharm) => {
          setBookingSpecialty(pharm.specialty);
          setScreen('otc-book');
        }}
      />

      {/* PROFILE PHOTO CAMERA UPLOADER MODAL */}
      <ProfilePhotoUploader
        patient={activePatient}
        isOpen={isPhotoUploaderOpen}
        onClose={() => setIsPhotoUploaderOpen(false)}
        onSavePhoto={handleSaveProfilePhoto}
      />

      {/* Internal Phone Bottom Home Bar Indicator */}
      <div className="w-full flex justify-center py-1">
        <div className="w-32 h-[4px] bg-slate-400 rounded-full"></div>
      </div>
    </div>
  );
}
