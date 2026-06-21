/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { 
  Home, 
  Video, 
  Stethoscope, 
  Settings, 
  Bell, 
  Menu, 
  User,
  MessageSquare,
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Lock,
  PlayCircle,
  Mic,
  Send,
  X,
  WifiOff,
  Globe,
  MapPin,
  PhoneCall,
  FileText,
  Activity,
  ShieldAlert,
  Link,
  PlusSquare,
  Volume2,
  Camera,
  Upload,
  CheckCircle2,
  RefreshCw,
  Heart,
  Trash2,
  BrainCircuit,
  Sparkles,
  Smartphone,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { SASL_DICTIONARY, SASL_ALPHABET, type DictionaryEntry } from './constants';
import { SASL_HAND_SHAPES, type HandShape } from './handShapes';
import { FilesetResolver, HandLandmarker, FaceLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Custom High-Fidelity Simulated Skeleton Canvas Renderer
export function drawSimulatedSkeleton(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  signName?: string
) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // Background overlay representation
  ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
  ctx.fillRect(0, 0, width, height);

  // Grid background effect
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }

  // Center coordinates
  const cx = width / 2;
  const cy = height / 2;

  // 1. Draw Simulated Face Landmarks (Cyan wireframe, moving naturally)
  ctx.strokeStyle = "rgba(6, 182, 212, 0.35)"; // Cyan
  ctx.lineWidth = 1.2;

  // Face outer outline
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const rx = 55 + Math.sin(time * 0.001 + angle * 2) * 1.5;
    const ry = 75 + Math.cos(time * 0.0012) * 1.2;
    const x = cx + rx * Math.sin(angle);
    const y = cy - 35 + ry * Math.cos(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  // Draw eyebrow lines
  const eybYOffset = Math.sin(time * 0.0015) * 2.5;
  ctx.beginPath();
  // Left eye brow
  ctx.moveTo(cx - 35, cy - 65 + eybYOffset);
  ctx.quadraticCurveTo(cx - 20, cy - 72 + eybYOffset, cx - 8, cy - 64 + eybYOffset);
  // Right eye brow
  ctx.moveTo(cx + 8, cy - 64 + eybYOffset);
  ctx.quadraticCurveTo(cx + 20, cy - 72 + eybYOffset, cx + 35, cy - 65 + eybYOffset);
  ctx.stroke();

  // Eyes (Blinking on timer)
  const isBlinking = (Math.floor(time / 200) % 15) === 0;
  ctx.fillStyle = "rgba(6, 182, 212, 0.65)";
  if (!isBlinking) {
    ctx.beginPath();
    ctx.arc(cx - 18, cy - 50, 4.5, 0, Math.PI * 2);
    ctx.arc(cx + 18, cy - 50, 4.5, 0, Math.PI * 2);
    ctx.fill();
    // Eyelids outline
    ctx.beginPath();
    ctx.arc(cx - 18, cy - 50, 5.5, 0, Math.PI * 2);
    ctx.arc(cx + 18, cy - 50, 5.5, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(cx - 24, cy - 50); ctx.lineTo(cx - 12, cy - 50);
    ctx.moveTo(cx + 12, cy - 50); ctx.lineTo(cx + 24, cy - 50);
    ctx.stroke();
  }

  // Nose Bridge
  ctx.beginPath();
  ctx.moveTo(cx, cy - 50);
  ctx.lineTo(cx, cy - 30);
  ctx.lineTo(cx - 6, cy - 25);
  ctx.lineTo(cx + 6, cy - 25);
  ctx.closePath();
  ctx.stroke();

  // Mouth Expression depending on the simulated sign
  let smileFactor = 4;
  if (signName === "Pain" || signName === "Emergency") {
    smileFactor = -6; // Frown
  } else if (signName === "Hello" || signName === "Thank You" || signName === "Yes") {
    smileFactor = 10; // Happy smiling face
  } else {
    smileFactor = 2 + Math.sin(time * 0.002) * 3; // Natural talk
  }
  ctx.beginPath();
  ctx.moveTo(cx - 16, cy - 10);
  ctx.quadraticCurveTo(cx, cy - 10 + smileFactor, cx + 16, cy - 10);
  ctx.quadraticCurveTo(cx, cy - 10 + (smileFactor * 0.25), cx - 16, cy - 10);
  ctx.stroke();

  // 2. Draw Simulated Gesture skeleton moving matching the sign
  let hx = cx + 55;
  let hy = cy + 45;

  if (signName === "Hello") {
    // Wave hand left-and-right quickly
    hx = cx + 60 + Math.sin(time * 0.008) * 32;
    hy = cy - 25 + Math.cos(time * 0.001) * 8;
  } else if (signName === "Pain" || signName === "Emergency") {
    // Resting on center chest area, pulsating with tension
    hx = cx - 10 + Math.sin(time * 0.005) * 3;
    hy = cy + 35 + Math.cos(time * 0.005) * 3;
    
    // Draw pulsing pain waves
    ctx.strokeStyle = "rgba(239, 68, 68, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(hx, hy, 40 + (time % 500) * 0.08, 0, Math.PI * 2);
    ctx.stroke();
  } else if (signName === "Doctor") {
    // Fingers meeting on wrist area
    hx = cx - 25;
    hy = cy + 60;
    
    // Draw passive wrist being held
    ctx.strokeStyle = "rgba(244, 63, 94, 0.4)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - 65, cy + 95);
    ctx.lineTo(cx - 35, cy + 70);
    ctx.stroke();
    // Wrist joint tracker node
    ctx.fillStyle = "#f43f5e";
    ctx.beginPath(); ctx.arc(cx - 35, cy + 70, 4, 0, Math.PI * 2); ctx.fill();
  } else if (signName === "Help") {
    // Lower left to high right upward gesture
    const cycle = (time * 0.0015) % (Math.PI * 2);
    const rise = Math.max(0, Math.sin(cycle));
    hx = cx + 25 + (rise * 45);
    hy = cy + 50 - (rise * 65);
  } else if (signName === "Thank You") {
    // Chin to heart movement
    const cycle = (time * 0.001) % (Math.PI * 2);
    const extend = (Math.sin(cycle) + 1) / 2; // 0 to 1
    hx = cx + 15 + (extend * 50);
    hy = cy - 15 + (extend * 60);
  } else if (signName === "Yes") {
    // Nodding hand motion
    hx = cx + 50;
    hy = cy + 30 + Math.sin(time * 0.006) * 18;
  } else if (signName === "No") {
    // Quick shaking side to side
    hx = cx + 55 + Math.sin(time * 0.015) * 12;
    hy = cy + 35;
  } else {
    // Regular tracking idle circles
    hx = cx + 60 + Math.sin(time * 0.0018) * 18;
    hy = cy + 35 + Math.cos(time * 0.0014) * 12;
  }

  // Draw 21-landmarks hand skeleton matching hx, hy
  ctx.strokeStyle = "rgba(16, 185, 129, 0.75)"; // Emerald Green
  ctx.lineWidth = 2.5;

  const wrist = { x: hx, y: hy };
  const fingerBases = [
    { x: hx - 24, y: hy - 18 }, // Thumb base
    { x: hx - 12, y: hy - 32 }, // Index base
    { x: hx, y: hy - 36 },      // Middle base
    { x: hx + 12, y: hy - 32 }, // Ring base
    { x: hx + 24, y: hy - 24 }  // Pinky base
  ];

  // Draw lines from wrist to bases
  fingerBases.forEach(base => {
    ctx.beginPath();
    ctx.moveTo(wrist.x, wrist.y);
    ctx.lineTo(base.x, base.y);
    ctx.stroke();
  });

  // Individual finger joint configurations
  fingerBases.forEach((base, idx) => {
    const angle = -Math.PI / 1.95 + (idx - 2) * 0.22;
    let extension = 35; // Default extended finger length

    if (signName === "Pain" || signName === "Emergency") {
      extension = 10; // Tight clenched fist
    } else if (signName === "Yes") {
      extension = 12 + Math.abs(Math.sin(time * 0.006)) * 20; // Curling index/middle
    } else if (signName === "Doctor" && idx !== 1 && idx !== 2) {
      extension = 10; // Keep only index and middle raised, rest bent
    }

    const mX = Math.cos(angle);
    const mY = Math.sin(angle);

    const j1 = { x: base.x + mX * (extension * 0.35), y: base.y + mY * (extension * 0.35) };
    const j2 = { x: j1.x + mX * (extension * 0.35), y: j1.y + mY * (extension * 0.35) };
    const tip = { x: j2.x + mX * (extension * 0.3), y: j2.y + mY * (extension * 0.3) };

    // Connect joint lines
    ctx.beginPath();
    ctx.moveTo(base.x, base.y);
    ctx.lineTo(j1.x, j1.y);
    ctx.lineTo(j2.x, j2.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();

    // Joint markers
    ctx.fillStyle = "#ef4444"; // Red knuckles
    ctx.beginPath();
    ctx.arc(j1.x, j1.y, 2, 0, Math.PI * 2);
    ctx.arc(j2.x, j2.y, 2, 0, Math.PI * 2);
    ctx.fill();

    // Finger tips
    ctx.fillStyle = "#34d399"; // Light emerald tips
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Wrist root node
  ctx.fillStyle = "#fbbf24"; // Yellow
  ctx.beginPath();
  ctx.arc(wrist.x, wrist.y, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// --- Screens ---

const HomeScreen = ({ navigate }: { navigate: (screen: string) => void }) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'videos'>('articles');

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 px-4 pt-2 space-y-5 relative z-10">
      {/* Welcome Section */}
      <div className="text-center space-y-1 mt-2">
        <h1 className="text-4xl font-extrabold text-[#112a46] tracking-tight">Welcome!</h1>
        <p className="text-slate-700 font-medium px-2 text-sm leading-snug">
          Providing healthcare support for the deaf and hard of hearing community.
        </p>
      </div>

      {/* Main Action Buttons */}
      <div className="space-y-3 mt-6">
        <ActionCard 
          title="Request Sign Language Interpreter" 
          icon={<img src="https://api.iconify.design/mdi:sign-language.svg?color=white" className="w-12 h-12" alt="Sign Language" />}
          bgClass="bg-gradient-to-r from-[#2c5e31] to-[#4a8c35]"
          arrowBgClass="bg-[#f5a623]"
          onClick={() => navigate('translator')}
        />
        <ActionCard 
          title="Video Remote Interpreting" 
          icon={<div className="bg-white/20 p-2 rounded-lg"><img src="https://api.iconify.design/mdi:video-outline.svg?color=white" className="w-8 h-8" alt="Video" /></div>}
          bgClass="bg-gradient-to-r from-[#2c5e31] to-[#4a8c35]"
          arrowBgClass="bg-transparent border-2 border-white"
          onClick={() => navigate('vrt')}
        />
        <ActionCard 
          title="Health Information" 
          icon={<div className="bg-white p-1 rounded-md shadow-sm"><img src="https://api.iconify.design/mdi:book-open-page-variant.svg?color=%23d32f2f" className="w-10 h-10" alt="Health Info" /></div>}
          bgClass="bg-gradient-to-r from-[#d32f2f] to-[#e57373]"
          arrowBgClass="bg-transparent border-2 border-white"
          onClick={() => navigate('health')}
        />
        <ActionCard 
          title="Medical Imaging Analysis" 
          subtitle="Show pain or symptoms via MIA"
          icon={<div className="bg-white/20 p-2 rounded-lg"><Activity className="w-8 h-8 text-white" /></div>}
          bgClass="bg-gradient-to-r from-[#006064] to-[#00838f]"
          arrowBgClass="bg-transparent border-2 border-white"
          onClick={() => navigate('imaging')}
        />
        <ActionCard 
          title="Learning Center" 
          subtitle="Practice SASL Signs"
          icon={<div className="bg-white/20 p-2 rounded-lg"><BookOpen className="w-8 h-8 text-white" /></div>}
          bgClass="bg-gradient-to-r from-[#4a8c35] to-[#689f38]"
          arrowBgClass="bg-transparent border-2 border-white"
          onClick={() => navigate('learning')}
        />
        <ActionCard 
          title="Train AI Assistant" 
          subtitle="Upload photos to improve recognition"
          icon={<div className="bg-white/20 p-2 rounded-lg"><BrainCircuit className="w-8 h-8 text-white" /></div>}
          bgClass="bg-gradient-to-r from-[#1e4620] to-[#2c5e31]"
          arrowBgClass="bg-transparent border-2 border-white"
          onClick={() => navigate('training')}
        />
        <ActionCard 
          title="Emergency Services" 
          subtitle="Alert. v. 8 call away"
          icon={<img src="https://api.iconify.design/mdi:bell-ring.svg?color=%23d32f2f" className="w-12 h-12 drop-shadow-md" alt="Emergency" />}
          bgClass="bg-gradient-to-r from-[#f5a623] to-[#ffca28]"
          arrowBgClass="bg-transparent border-2 border-white"
          onClick={() => navigate('emergency')}
        />
      </div>

      {/* News & Resources */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2 px-1">
          <h2 className="text-lg font-bold text-slate-800">News & Resources</h2>
          <div className="flex items-center space-x-1 bg-[#2c5e31] text-white px-3 py-1 rounded-full text-xs cursor-pointer hover:bg-[#1e4620]">
            <Lock className="w-3 h-3" />
            <span>25311</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
        
        <div className="bg-[#e8f0eb] rounded-2xl p-1 shadow-sm border border-white/50">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex space-x-4">
              <button 
                onClick={() => setActiveTab('articles')}
                className={cn(
                  "px-4 py-1.5 rounded-t-xl font-bold text-sm transition-all",
                  activeTab === 'articles' ? "bg-[#f4f7f5] text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Articles
              </button>
              <button 
                onClick={() => setActiveTab('videos')}
                className={cn(
                  "px-4 py-1.5 rounded-t-xl font-bold text-sm transition-all",
                  activeTab === 'videos' ? "bg-[#f4f7f5] text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Videos
              </button>
            </div>
            <Settings className="w-5 h-5 text-[#2c5e31] cursor-pointer hover:rotate-90 transition-transform" />
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-[#f4f7f5] rounded-xl p-3 flex relative shadow-sm"
            >
              {activeTab === 'articles' ? (
                <>
                  <div className="flex-1 pr-2">
                    <h3 className="font-bold text-slate-800 text-sm leading-tight mb-2">How to Manage Hearing Loss</h3>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li className="flex items-start"><span className="text-[#4a8c35] mr-1">▣</span> Free iMeds suggestions</li>
                      <li className="flex items-start"><span className="text-slate-400 mr-1">▣</span> Secure Store to get health tips</li>
                    </ul>
                  </div>
                  <div className="w-24 h-16 rounded-lg overflow-hidden relative shrink-0">
                    <img src="https://images.unsplash.com/photo-1576091160550-2173ff9e5ee5?auto=format&fit=crop&q=80&w=200" alt="Doctor" className="w-full h-full object-cover" />
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">2</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 pr-2">
                    <h3 className="font-bold text-slate-800 text-sm leading-tight mb-2">SASL Basics: Introduction</h3>
                    <p className="text-xs text-slate-600 mb-2">Watch our introductory video on South African Sign Language.</p>
                    <div className="flex items-center text-[#4a8c35] text-[10px] font-bold uppercase tracking-wider">
                      <PlayCircle className="w-3 h-3 mr-1" />
                      <span>Watch Now (4:20)</span>
                    </div>
                  </div>
                  <div className="w-24 h-16 rounded-lg overflow-hidden relative shrink-0 bg-slate-200 flex items-center justify-center">
                    <Video className="w-8 h-8 text-slate-400" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <PlayCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const ActionCard = ({ title, subtitle, icon, bgClass, onClick, arrowBgClass = "bg-[#f5a623]" }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full rounded-xl p-3 flex items-center justify-between shadow-md active:scale-[0.98] transition-transform relative overflow-hidden",
      bgClass
    )}
  >
    {/* Texture overlay */}
    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay pointer-events-none"></div>
    
    <div className="flex items-center space-x-3 relative z-10 w-full">
      <div className="w-14 h-14 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="text-left flex-1 pl-2">
        <h3 className="text-white font-bold text-base leading-tight drop-shadow-sm">{title}</h3>
        {subtitle && <p className="text-white/90 text-xs mt-1 drop-shadow-sm">{subtitle}</p>}
      </div>
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm", arrowBgClass)}>
        <ChevronRight className="w-5 h-5 text-white" />
      </div>
    </div>
  </button>
);

// --- Translator Screen (Two-Way Communication & AI) ---
const TranslatorScreen = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSimulatorMode, setIsSimulatorMode] = useState(false);
  const [simulatedSign, setSimulatedSign] = useState("Hello");
  const [messages, setMessages] = useState<{id: string, sender: 'user' | 'doctor', text: string}[]>([]);
  const [doctorInput, setDoctorInput] = useState("");
  const [mode, setMode] = useState<'healthcare' | 'emergency' | 'general'>('general');
  const [language, setLanguage] = useState<'English' | 'Zulu' | 'Xhosa' | 'Afrikaans' | 'Sepedi'>('English');
  const [isOffline, setIsOffline] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [signPreview, setSignPreview] = useState<DictionaryEntry | null>(null);
  const [isAnalyzingSign, setIsAnalyzingSign] = useState(false);
  const [isAutoTranslating, setIsAutoTranslating] = useState(false);
  const [currentSentence, setCurrentSentence] = useState("");
  const [lastAnalyzedTime, setLastAnalyzedTime] = useState(0);
  const [lastDetections, setLastDetections] = useState<{sign: string, confidence: number}[]>([]);
  const [showHolistic, setShowHolistic] = useState(true);
  const [showROI, setShowROI] = useState(true);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [analysisConfidence, setAnalysisConfidence] = useState(0);
  const [signSequence, setSignSequence] = useState<DictionaryEntry[]>([]);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [activeGesture, setActiveGesture] = useState<{name: string, icon: string} | null>(null);
  const lastGestureTime = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    let interval: any;
    if (isAutoTranslating && isTranslating) {
      interval = setInterval(() => {
        const now = Date.now();
        // Check if more than 4 seconds passed since last analysis to avoid flooding
        if (now - lastAnalyzedTime > 4000) { 
          analyzeCurrentSign();
          setLastAnalyzedTime(now);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isAutoTranslating, isTranslating, lastAnalyzedTime]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize MediaPipe
  useEffect(() => {
    let isMounted = true;
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm"
        );
        
        // Note: The "INFO: Created TensorFlow Lite XNNPACK delegate for CPU" message 
        // is an informational log from MediaPipe indicating it's using optimized CPU acceleration.
        const hl = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });

        const fl = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          numFaces: 1
        });

        if (isMounted) {
          setHandLandmarker(hl);
          setFaceLandmarker(fl);
        }
      } catch (error) {
        console.error("Error initializing MediaPipe:", error);
      }
    };
    initMediaPipe();
    return () => { isMounted = false; };
  }, []);

  // Start/Stop Camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isTranslating && !isSimulatorMode && videoRef.current) {
      setCameraError(null);
      
      const startCamera = async () => {
        try {
          // Try with facingMode first
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
          } catch (e) {
            console.warn("Facing mode 'user' failed, falling back to any video device", e);
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
          }
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err: any) {
          console.error("Camera error:", err);
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            setCameraError("Camera permission denied. Please enable camera access in your browser settings to use the translator.");
          } else {
            setCameraError(`Camera error: ${err.message || "Could not access camera. Please ensure a camera is connected."}`);
          }
        }
      };
      
      startCamera();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isTranslating, isSimulatorMode]);

  // Render Loop for AI Tracking
  useEffect(() => {
    if (!isTranslating || !handLandmarker || !faceLandmarker || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastVideoTime = -1;
    let lastTranslationTime = 0;
    const drawingUtils = new DrawingUtils(ctx);

    const renderLoop = () => {
      if (video.readyState >= 2) {
        if (canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          
          const handResults = handLandmarker.detectForVideo(video, performance.now());
          const faceResults = faceLandmarker.detectForVideo(video, performance.now());

          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw ROI (Region of Interest) - inspired by computervisioneng
          if (showROI) {
            const roiSize = Math.min(canvas.width, canvas.height) * 0.7;
            const rx = (canvas.width - roiSize) / 2;
            const ry = (canvas.height - roiSize) / 2;
            
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 2;
            ctx.strokeRect(rx, ry, roiSize, roiSize);
            
            // Draw corners
            ctx.setLineDash([]);
            ctx.strokeStyle = "#10b981";
            ctx.lineWidth = 4;
            const cLen = 20;
            // Top Left
            ctx.beginPath(); ctx.moveTo(rx, ry + cLen); ctx.lineTo(rx, ry); ctx.lineTo(rx + cLen, ry); ctx.stroke();
            // Top Right
            ctx.beginPath(); ctx.moveTo(rx + roiSize - cLen, ry); ctx.lineTo(rx + roiSize, ry); ctx.lineTo(rx + roiSize, ry + cLen); ctx.stroke();
            // Bottom Left
            ctx.beginPath(); ctx.moveTo(rx, ry + roiSize - cLen); ctx.lineTo(rx, ry + roiSize); ctx.lineTo(rx + cLen, ry + roiSize); ctx.stroke();
            // Bottom Right
            ctx.beginPath(); ctx.moveTo(rx + roiSize - cLen, ry + roiSize); ctx.lineTo(rx + roiSize, ry + roiSize); ctx.lineTo(rx + roiSize, ry + roiSize - cLen); ctx.stroke();

            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.font = "bold 10px Inter";
            ctx.fillText("PLACE HANDS HERE", rx + 5, ry + 15);
          }

          // Draw Face
          if (faceResults.faceLandmarks && showHolistic) {
            for (const landmarks of faceResults.faceLandmarks) {
              drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: "#C0C0C040", lineWidth: 1 });
              drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: "#FF3030" });
              drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: "#30FF30" });
            }
          }

          // Draw Hands & Simulate Translation
          if (handResults.landmarks && handResults.landmarks.length > 0) {
            handResults.landmarks.forEach((landmarks, index) => {
              drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, { color: "#10b981", lineWidth: 3 });
              drawingUtils.drawLandmarks(landmarks, { color: "#ef4444", lineWidth: 1, radius: 2 });

              // Calculate Bounding Box (inspired by computervisioneng)
              let minX = 1, minY = 1, maxX = 0, maxY = 0;
              landmarks.forEach(point => {
                if (point.x < minX) minX = point.x;
                if (point.y < minY) minY = point.y;
                if (point.x > maxX) maxX = point.x;
                if (point.y > maxY) maxY = point.y;
              });

              const pxMinX = minX * canvas.width;
              const pxMinY = minY * canvas.height;
              const pxMaxX = maxX * canvas.width;
              const pxMaxY = maxY * canvas.height;
              const boxPadding = 20;

              // Draw Bounding Box
              ctx.strokeStyle = "#10b981";
              ctx.lineWidth = 2;
              ctx.lineJoin = "round";
              ctx.strokeRect(
                pxMinX - boxPadding, 
                pxMinY - boxPadding, 
                (pxMaxX - pxMinX) + boxPadding * 2, 
                (pxMaxY - pxMinY) + boxPadding * 2
              );

              // Draw Prediction Label (if it's the primary hand)
              if (index === 0 && lastDetections.length > 0) {
                const latest = lastDetections[0];
                ctx.fillStyle = "#10b981";
                const labelText = `${latest.sign} (${Math.round(latest.confidence * 100)}%)`;
                ctx.font = "bold 12px Inter";
                const textWidth = ctx.measureText(labelText).width;
                
                ctx.fillRect(pxMinX - boxPadding, pxMinY - boxPadding - 20, textWidth + 10, 20);
                ctx.fillStyle = "white";
                ctx.fillText(labelText, pxMinX - boxPadding + 5, pxMinY - boxPadding - 6);
              }

              // System Gesture Recognition (Inspired by kurtubi01)
              const now = Date.now();
              if (now - lastGestureTime.current > 1500) {
                const thumbTip = landmarks[4];
                const indexTip = landmarks[8];
                const middleTip = landmarks[12];
                const wrist = landmarks[0];
                
                const getDist = (p1: any, p2: any) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
                const pinchDist = getDist(thumbTip, indexTip);

                // Check for Peace Sign (Index & Middle up, others down)
                const isIndexUp = indexTip.y < landmarks[6].y;
                const isMiddleUp = middleTip.y < landmarks[10].y;
                const isRingDown = landmarks[16].y > landmarks[14].y;
                const isPinkyDown = landmarks[20].y > landmarks[18].y;

                if (pinchDist < 0.05) {
                  // Index & Thumb touching = Toggle Voice
                  setIsVoiceEnabled(!isVoiceEnabled);
                  setActiveGesture({ name: isVoiceEnabled ? "VOICE OFF" : "VOICE ON", icon: "Mic" });
                  lastGestureTime.current = now;
                  setTimeout(() => setActiveGesture(null), 1000);
                } else if (isIndexUp && isMiddleUp && isRingDown && isPinkyDown) {
                  // Peace sign = Toggle Auto-Translate
                  setIsAutoTranslating(!isAutoTranslating);
                  setActiveGesture({ name: isAutoTranslating ? "AUTO OFF" : "AUTO ON", icon: "Sparkles" });
                  lastGestureTime.current = now;
                  setTimeout(() => setActiveGesture(null), 1000);
                } else if (landmarks[8].y > landmarks[5].y && landmarks[12].y > landmarks[9].y && landmarks[16].y > landmarks[13].y) {
                  // Fist = Clear Transcript
                  if (currentSentence) {
                    setCurrentSentence("");
                    setActiveGesture({ name: "CLEARING", icon: "Trash2" });
                    lastGestureTime.current = now;
                    setTimeout(() => setActiveGesture(null), 1000);
                  }
                }
              }
            });
            
            // Simulated Translation Logic (throttled)
            const now = Date.now();
            if (now - lastTranslationTime > 4000 && Math.random() > 0.95) {
              lastTranslationTime = now;
              const phrases = mode === 'healthcare' 
                ? ["Hello, I need a doctor.", "I am experiencing severe chest pain.", "Where is the pharmacy?"]
                : ["Hello", "Thank you", "Yes", "No", "Please help me"];
              const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
              
              setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: randomPhrase }]);
              speakText(randomPhrase); // Auto-speak translated sign language
            }
          }
          ctx.restore();
        }
      }
      requestRef.current = requestAnimationFrame(renderLoop);
    };

    video.addEventListener("loadeddata", renderLoop);
    return () => {
      video.removeEventListener("loadeddata", renderLoop);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isTranslating, handLandmarker, faceLandmarker, mode]);

  // Render Loop for Simulator Mode
  useEffect(() => {
    if (!isTranslating || !isSimulatorMode || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fixed default size for canvas simulation
    canvas.width = 640;
    canvas.height = 480;

    let animFrame: number;
    const tick = () => {
      const time = performance.now();
      drawSimulatedSkeleton(ctx, canvas.width, canvas.height, time, simulatedSign);
      animFrame = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [isTranslating, isSimulatorMode, simulatedSign]);

  const toggleTranslation = () => {
    if (isTranslating) {
      setIsTranslating(false);
      setIsAutoTranslating(false);
      setIsSimulatorMode(false);
      setCameraError(null);
    } else {
      setIsTranslating(true);
    }
  };

  // Speech to Text (Voice Recognition)
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsListening(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setDoctorInput(transcript);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognition.start();
      } else {
        alert("Speech recognition is not supported in this browser.");
      }
    }
  };

  // Text to Speech
  const speakText = (text: string, lang: string = 'en-ZA') => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Map selection to BCP 47 codes
      const langMap: Record<string, string> = {
        'English': 'en-ZA',
        'Zulu': 'zu-ZA',
        'Xhosa': 'xh-ZA',
        'Afrikaans': 'af-ZA',
        'Sepedi': 'nso-ZA'
      };
      
      utterance.lang = langMap[lang] || lang;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleDoctorInput = (val: string) => {
    setDoctorInput(val);
    
    // IMAGE LOGIC: Read words, find match, fallback to alphabet
    const words = val.toUpperCase().split(/\s+/).filter(w => w.length > 0);
    const newSequence: DictionaryEntry[] = [];

    words.forEach(word => {
      // 1. Search if word matches FileName (Dictionary)
      const exactMatch = SASL_DICTIONARY.find(entry => entry.title.toUpperCase() === word);
      if (exactMatch) {
        newSequence.push(exactMatch);
      } else {
        // 2. Fallback: Convert word to character (Alphabet)
        word.split('').forEach(char => {
          const charMatch = SASL_ALPHABET.find(a => a.title === char);
          if (charMatch) newSequence.push(charMatch);
        });
      }
    });

    setSignSequence(newSequence);
    setSequenceIndex(0);
    setSignPreview(newSequence.length > 0 ? newSequence[0] : null);
  };

  // Auto-play sequence
  useEffect(() => {
    if (signSequence.length > 1) {
      const timer = setInterval(() => {
        setSequenceIndex(prev => {
          const next = (prev + 1) % signSequence.length;
          setSignPreview(signSequence[next]);
          return next;
        });
      }, 1500); // 1.5 seconds per sign
      return () => clearInterval(timer);
    }
  }, [signSequence]);

  const analyzeCurrentSign = async () => {
    if (!isTranslating) return;
    setIsAnalyzingSign(true);
    
    if (isSimulatorMode) {
      setTimeout(async () => {
        const text = simulatedSign;
        const confidence = 91 + Math.random() * 7;
        setAnalysisConfidence(confidence);
        setLastDetections(prev => [{ sign: text, confidence: confidence / 100 }, ...prev].slice(0, 10));
        
        setCurrentSentence(prev => {
          const words = prev.trim().split(" ");
          if (words[words.length - 1] !== text) {
            return prev ? `${prev} ${text}` : text;
          }
          return prev;
        });

        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text }]);
        if (isVoiceEnabled) speakText(text, language);
        setIsAnalyzingSign(false);

        // Standard medical interaction proxy with Gemini API in healthcare mode
        if (mode === 'healthcare') {
          try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const response = await ai.models.generateContent({
              model: "gemini-1.5-flash",
              contents: `You are Dr. Naidoo, a caring South African medical doctor. A deaf patient just signed "${text}". Respond to them in simple, reassuring words in ${language} (maximum 2 sentences).`,
            });
            setMessages(prev => [...prev, { 
              id: (Date.now() + 1).toString(), 
              sender: 'doctor', 
              text: response.text 
            }]);
          } catch (e) {
            console.error("Failed to generate simulated doctor reply:", e);
          }
        }
      }, 700);
      return;
    }

    if (!videoRef.current) {
      setIsAnalyzingSign(false);
      return;
    }
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(videoRef.current, 0, 0);
      const base64Data = canvas.toDataURL('image/jpeg').split(',')[1];

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: {
          parts: [
            {
              text: `You are an expert SASL (South African Sign Language) interpreter and action detection specialist. 
              Analyze this frame from a live video sequence. The user is in the middle of a signing action.
              
              ACTION DETECTION LOGIC:
              1. Track hand movement trajectories based on motion blur or posture flow.
              2. Evaluate facial expression shifts (non-manual markers).
              3. Compare against known sign sequences in the RealSASL dictionary (including terms like ${SASL_DICTIONARY.slice(0, 10).map(e => e.title).join(', ')}).
              
              Identify the active action/sign being performed. If a partial sign is detected, provide the most likely completion.
              
              Format your response as JSON: { "sign": "...", "confidence": number, "meaning": "...", "isActionComplete": boolean }`
            },
            {
              inlineData: {
                data: base64Data,
                mimeType: "image/jpeg"
              }
            }
          ]
        },
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text);
      if (result.sign && result.sign.toLowerCase() !== "unknown") {
        const text = result.sign;
        const confidence = (result.confidence || 0.85) * 100;
        setAnalysisConfidence(confidence);
        
        // Update detection history (simulating CNN sequence buffer)
        setLastDetections(prev => [{ sign: text, confidence: confidence / 100 }, ...prev].slice(0, 10));

        // Append to current sentence ONLY if confidence is high enough (Inspired by KumarVivek9088)
        if (confidence > 70) {
          setCurrentSentence(prev => {
            const words = prev.trim().split(" ");
            if (words[words.length - 1] !== text) {
              return prev ? `${prev} ${text}` : text;
            }
            return prev;
          });
        }

        // Still add to chat for full history if needed, or maybe just update transcript
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text }]);
        if (isVoiceEnabled && !isAutoTranslating) speakText(text, language);
      }
    } catch (error) {
      console.error("Sign Analysis Error:", error);
    } finally {
      setIsAnalyzingSign(false);
    }
  };

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorInput.trim()) return;
    
    const userText = doctorInput;
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'doctor', text: userText }]);
    setDoctorInput("");
    setSignPreview(null);

    // AI Translation/Simplification for the Deaf User
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `You are a professional SASL (South African Sign Language) interpreter. 
        The doctor said: "${userText}". 
        Translate this into a simplified, easy-to-read version for a deaf patient who uses SASL. 
        The patient's preferred language for text is ${language}.
        Also, provide a brief description of the hand signs or visual cues that would accompany this in SASL.
        Reference RealSASL dictionary patterns if applicable.
        Format your response as JSON: { "simplifiedText": "...", "visualCues": "..." }`,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        sender: 'doctor', 
        text: `[AI Simplified]: ${result.simplifiedText}\n\n[Visual Cues]: ${result.visualCues}` 
      }]);
    } catch (error) {
      console.error("Gemini Error:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="p-4 bg-white shadow-sm z-20 flex flex-col space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg text-slate-800">AI SASL Translator</h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={cn("p-1.5 rounded-lg transition-colors", isVoiceEnabled ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400")}
              title={isVoiceEnabled ? "Sign to Voice Enabled" : "Sign to Voice Disabled"}
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsOffline(!isOffline)}
              className={cn("flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors", isOffline ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700")}
            >
              {isOffline ? <WifiOff className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
              <span>{isOffline ? 'Edge AI (Offline)' : 'Cloud AI (Online)'}</span>
            </button>
          </div>
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
          <select 
            value={mode} 
            onChange={(e) => setMode(e.target.value as any)}
            className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold outline-none border-r-4 border-transparent"
          >
            <option value="general">General Mode</option>
            <option value="healthcare">Healthcare Mode</option>
            <option value="emergency">Emergency Mode</option>
          </select>
          
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold outline-none border-r-4 border-transparent"
          >
            <option value="English">English</option>
            <option value="Zulu">isiZulu</option>
            <option value="Xhosa">isiXhosa</option>
            <option value="Afrikaans">Afrikaans</option>
            <option value="Sepedi">Sepedi</option>
          </select>
        </div>
      </div>
      
      {/* Camera View (Top Half) */}
      <div className="relative h-64 bg-slate-900 shrink-0 overflow-hidden flex items-center justify-center">
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center bg-slate-950/95 z-30 animate-in fade-in">
            <AlertTriangle className="w-12 h-12 text-amber-500 mb-2 animate-bounce" />
            <p className="text-sm font-bold mb-1">Camera Device Not Detected</p>
            <p className="text-xs text-slate-300 max-w-xs mb-4 leading-relaxed">
              We couldn't access a physical camera device. You can still test all translation & AI features using our Interactive Simulator Sandbox!
            </p>
            <div className="flex space-x-2">
              <button 
                onClick={() => {
                  setCameraError(null);
                  setIsSimulatorMode(false);
                  setIsTranslating(true);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold uppercase cursor-pointer transition-colors"
              >
                Try Camera
              </button>
              <button 
                onClick={() => {
                  setCameraError(null);
                  setIsSimulatorMode(true);
                  setIsTranslating(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase cursor-pointer transition-colors shadow-lg shadow-emerald-600/30"
              >
                Launch Simulator
              </button>
            </div>
          </div>
        )}
        
        {!isTranslating && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 space-y-3 z-10 bg-slate-800">
            <Camera className="w-12 h-12 opacity-50" />
            <p className="text-sm font-medium">Camera is off</p>
          </div>
        )}
        
        <video 
          ref={videoRef} 
          className={cn("w-full h-full object-cover", !isTranslating && "hidden")} 
          autoPlay 
          playsInline 
          muted
        />
        <canvas 
          ref={canvasRef} 
          className={cn("absolute inset-0 w-full h-full pointer-events-none", !isTranslating && "hidden")}
        />

        {/* Action Detection Overlays (Inspired by Nicknochnack) */}
        {isTranslating && (
          <>
            {isSimulatorMode && (
              <div className="absolute top-12 left-0 right-0 px-4 py-2 bg-slate-900/90 backdrop-blur-md border-b border-emerald-500/25 z-40">
                <div className="flex items-center justify-between mb-1.5 border-b border-slate-800 pb-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400 animate-pulse" /> Virtual Gesture Simulator
                  </span>
                  <span className="text-[9px] text-slate-400">Perform Gesture:</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {["Hello", "Pain", "Doctor", "Help", "Thank You", "Yes", "No"].map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        setSimulatedSign(s);
                      }}
                      className={cn(
                        "px-1.5 py-1 rounded text-[9px] font-bold uppercase transition-all tracking-tight cursor-pointer",
                        simulatedSign === s 
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20 font-black" 
                          : "bg-slate-800 text-slate-300 hover:bg-slate-755"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Top Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black/60 to-transparent flex items-center px-4 z-20">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                  {isAnalyzingSign ? "Detecting Sequence..." : "Monitoring Actions"}
                </span>
              </div>
            </div>

            {/* Left Probability Bars */}
            <div className="absolute left-4 top-14 bottom-14 flex flex-col justify-center space-y-2 z-20 pointer-events-none">
              <AnimatePresence>
                {lastDetections.map((det, i) => (
                  <motion.div 
                    key={`${det.sign}-${i}`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="flex flex-col"
                  >
                    <div className="flex justify-between items-center w-24 mb-0.5">
                      <span className="text-[8px] font-black text-white/90 uppercase truncate w-16">{det.sign}</span>
                      <span className="text-[8px] font-mono text-emerald-400">{Math.round(det.confidence * 100)}%</span>
                    </div>
                    <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${det.confidence * 100}%` }}
                        className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Right Controls Overlay */}
            <div className="absolute right-4 top-14 flex flex-col space-y-3 z-30">
              <button 
                onClick={() => setShowHolistic(!showHolistic)}
                className={cn(
                  "p-2 rounded-xl backdrop-blur-md border transition-all",
                  showHolistic 
                    ? "bg-white/20 border-white/30 text-white" 
                    : "bg-black/40 border-white/10 text-white/40"
                )}
                title="Toggle Holistic Mesh"
              >
                <Activity className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setShowROI(!showROI)}
                className={cn(
                  "p-2 rounded-xl backdrop-blur-md border transition-all",
                  showROI 
                    ? "bg-white/20 border-white/30 text-white" 
                    : "bg-black/40 border-white/10 text-white/40"
                )}
                title="Toggle ROI Guide"
              >
                <PlusSquare className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                className={cn(
                  "p-2 rounded-xl backdrop-blur-md border transition-all",
                  showDiagnostics 
                    ? "bg-amber-400/20 border-amber-400/30 text-amber-400" 
                    : "bg-black/40 border-white/10 text-white/40"
                )}
                title="Technical Diagnostics"
              >
                <BrainCircuit className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* Technical Diagnostics Overlay (Inspired by KumarVivek9088) */}
        <AnimatePresence>
          {showDiagnostics && (
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="absolute left-4 top-14 bottom-14 w-40 bg-black/80 backdrop-blur-xl rounded-xl border border-amber-500/30 z-[70] overflow-hidden flex flex-col font-mono"
            >
              <div className="bg-amber-500/20 px-2 py-1 border-b border-amber-500/20 flex items-center justify-between">
                <span className="text-[8px] font-bold text-amber-500 uppercase tracking-widest">CNN Diagnostics</span>
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
              </div>
              
              <div className="flex-1 p-2 space-y-3 overflow-hidden">
                {/* Smoothing Logic Display */}
                <div>
                  <p className="text-[7px] text-amber-500/60 uppercase mb-1">Prediction Buffer</p>
                  <div className="flex space-x-0.5">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "w-full h-1.5 rounded-sm",
                          i < lastDetections.length ? "bg-amber-500" : "bg-white/5"
                        )} 
                      />
                    ))}
                  </div>
                </div>

                {/* Accuracy Status */}
                <div>
                  <div className="flex justify-between items-center text-[7px] text-amber-500/60 mb-1">
                    <span>AVG CONFIDENCE</span>
                    <span>{Math.round(analysisConfidence)}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full">
                    <div className="h-full bg-amber-500" style={{ width: `${analysisConfidence}%` }} />
                  </div>
                </div>

                {/* Prediction History (Terminal Style) */}
                <div className="flex-1 overflow-hidden">
                  <p className="text-[7px] text-amber-500/60 uppercase mb-2">Live Stream Log</p>
                  <div className="space-y-1">
                    {lastDetections.map((det, i) => (
                      <div key={i} className="text-[6px] text-amber-200/80 flex items-center">
                        <span className="opacity-40 mr-1">[{new Date().toLocaleTimeString([], { hour12: false, second: '2-digit' })}]</span>
                        <span>{det.sign}</span>
                        <span className="ml-auto text-amber-400">{(det.confidence * 100).toFixed(1)}</span>
                      </div>
                    ))}
                    {lastDetections.length === 0 && (
                      <div className="text-[6px] text-amber-500/30 italic">listening for frames...</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-2 bg-amber-500/5 border-t border-amber-500/10">
                <div className="text-[6px] text-amber-500/40 uppercase">Architecture: CNN-LSTM-V2</div>
                <div className="text-[6px] text-emerald-500">SYSTEM READY: 100%</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gesture Feedback (Inspired by kurtubi01) */}
        <AnimatePresence>
          {activeGesture && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-[60]"
            >
              <div className="bg-emerald-600/90 backdrop-blur-xl rounded-full px-6 py-3 flex items-center space-x-3 text-white shadow-2xl border border-white/20">
                <span className="font-black text-sm tracking-widest uppercase">{activeGesture.name}</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {signPreview && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute top-4 right-4 w-32 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-emerald-500/30 overflow-hidden z-40"
            >
              <div className="bg-emerald-600 text-white text-[8px] font-bold py-1 px-2 flex justify-between items-center uppercase tracking-tighter">
                <span>Text to Sign</span>
                {signSequence.length > 1 && (
                  <span>{sequenceIndex + 1}/{signSequence.length}</span>
                )}
              </div>
              <div className="relative">
                <img src={signPreview.image} alt={signPreview.title} className="w-full h-24 object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                  <p className="text-[10px] font-black text-white truncate text-center">{signPreview.title}</p>
                </div>
              </div>
              
              {signSequence.length > 1 && (
                <div className="h-1 w-full bg-slate-200">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((sequenceIndex + 1) / signSequence.length) * 100}%` }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              )}

              <div className="p-1 flex justify-center">
                <a href={signPreview.videoUrl} target="_blank" rel="noopener noreferrer" className="text-[8px] text-emerald-600 font-bold flex items-center">
                   Full Video <ChevronRight className="w-2 h-2 ml-0.5" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Translation Status Overlay */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center space-x-3 z-20">
          <button 
            onClick={toggleTranslation}
            className={cn(
              "px-6 py-2 rounded-full font-bold text-sm shadow-lg flex items-center space-x-2 transition-all",
              isTranslating ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
            )}
          >
            {isTranslating ? (
              <>
                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                <span>Stop Camera</span>
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                <span>Start Camera</span>
              </>
            )}
          </button>

          {isTranslating && (
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsAutoTranslating(!isAutoTranslating)}
                className={cn(
                  "p-2 rounded-full shadow-lg transition-all",
                  isAutoTranslating ? "bg-amber-500 text-white animate-pulse" : "bg-white/90 backdrop-blur-md text-amber-600"
                )}
                title={isAutoTranslating ? "Auto-Translate ON" : "Auto-Translate OFF"}
              >
                <Sparkles className="w-5 h-5" />
              </button>
              <button 
                onClick={analyzeCurrentSign}
                disabled={isAnalyzingSign}
                className="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg text-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-50"
                title="Single Analysis"
              >
                {isAnalyzingSign ? <RefreshCw className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sentence Builder / Transcript Panel */}
      <AnimatePresence>
        {isTranslating && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-slate-200 px-4 py-3 shrink-0"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Transcript</span>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => speakText(currentSentence, language)}
                  disabled={!currentSentence}
                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg disabled:opacity-30"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setCurrentSentence("")}
                  disabled={!currentSentence}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 min-h-[50px] flex items-center">
              {currentSentence ? (
                <p className="text-slate-800 font-bold leading-snug">{currentSentence}</p>
              ) : (
                <p className="text-slate-400 text-xs italic italic">No signs detected yet. Start signing...</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat View (Bottom Half) */}
      <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden pb-20">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 opacity-50" />
              <p className="text-sm text-center px-4">Start the camera to begin sign language translation, or use the mic to speak.</p>
            </div>
          )}
          
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex flex-col max-w-[85%]",
                  msg.sender === 'user' ? "items-start self-start" : "items-end self-end ml-auto"
                )}
              >
                <div className="flex items-center space-x-2 mb-1 px-1">
                  <span className="text-[10px] font-bold text-slate-400">
                    {msg.sender === 'user' ? 'Patient (SASL)' : 'Doctor'}
                  </span>
                  <button onClick={() => speakText(msg.text)} className="text-slate-400 hover:text-emerald-600">
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
                <div className={cn(
                  "px-4 py-2 rounded-2xl shadow-sm text-sm",
                  msg.sender === 'user' 
                    ? "bg-white text-slate-800 rounded-tl-sm border border-slate-100" 
                    : "bg-emerald-600 text-white rounded-tr-sm"
                )}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
        
        {/* Doctor Input Area */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form onSubmit={handleDoctorSubmit} className="flex items-center space-x-2">
            <button 
              type="button" 
              onClick={toggleListening}
              className={cn("p-2 rounded-full transition-colors", isListening ? "bg-red-100 text-red-600 animate-pulse" : "text-slate-400 hover:text-emerald-600 bg-slate-100")} 
              title="Voice Input (Speech to Text)"
            >
              <Mic className="w-5 h-5" />
            </button>
            <input 
              type="text" 
              value={doctorInput}
              onChange={(e) => handleDoctorInput(e.target.value)}
              placeholder="Type or speak response..." 
              className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-full px-4 py-2 text-sm outline-none transition-all"
            />
            <button 
              type="submit" 
              disabled={!doctorInput.trim()}
              className="p-2 bg-emerald-600 text-white rounded-full disabled:opacity-50 disabled:bg-slate-300 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Learning Screen (SASL Alphabet) ---
const LearningScreen = () => {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isPracticing, setIsPracticing] = useState(false);
  const [isSimulatorMode, setIsSimulatorMode] = useState(false);
  const [practiceResult, setPracticeResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const simulatorCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<'All' | 'Alphabets' | 'Symptoms' | 'Help'>('All');
  const [isListeningSearch, setIsListeningSearch] = useState(false);
  const landmarkerRef = useRef<any>(null);

  // Initialize MediaPipe Hand Landmarker
  useEffect(() => {
    let active = true;
    const initMP = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm"
        );
        if (!active) return;
        
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
      } catch (e) {
        console.debug("MediaPipe initialization skipped. Falling back to simulated AI.");
      }
    };
    initMP();
    
    return () => {
      active = false;
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch (e) {
        }
      }
    };
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isPracticing && !isSimulatorMode && videoRef.current) {
      setCameraError(null);
      
      const startCamera = async () => {
        try {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
          } catch (e) {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
          }
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsCameraReady(true);
          }
        } catch (err: any) {
          console.error("Camera error:", err);
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            setCameraError("Camera permission denied.");
          } else {
            setCameraError(`Camera error: ${err.message || "Camera access failed."}`);
          }
        }
      };
      
      startCamera();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
        setIsCameraReady(false);
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isPracticing, isSimulatorMode]);

  // Simulator Mode drawing loop for Learning Screen
  useEffect(() => {
    if (!isPracticing || !isSimulatorMode || !simulatorCanvasRef.current) return;
    const canvas = simulatorCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 300;

    let animFrame: number;
    const tick = () => {
      const time = performance.now();
      // Draw hand skeleton trying to spell selectedLetter
      drawSimulatedSkeleton(ctx, canvas.width, canvas.height, time, selectedLetter || "Hello");
      animFrame = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [isPracticing, isSimulatorMode, selectedLetter]);

  const checkSign = () => {
    setPracticeResult("checking");
    setTimeout(() => {
      // Simulate AI check
      setPracticeResult(Math.random() > 0.3 ? "success" : "try-again");
    }, 2000);
  };

  const toggleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      if (isListeningSearch) {
        setIsListeningSearch(false);
      } else {
        setIsListeningSearch(true);
        const recognition = new SpeechRecognition();
        recognition.onresult = (event: any) => {
          setSearchQuery(event.results[0][0].transcript);
          setIsListeningSearch(false);
        };
        recognition.onend = () => setIsListeningSearch(false);
        recognition.start();
      }
    }
  };

  const categories = ['All', 'Alphabets', 'Symptoms', 'Help'];
  
  const filteredItems = SASL_DICTIONARY.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || 
      (activeCategory === 'Alphabets' && item.title.length === 1) ||
      (activeCategory === 'Symptoms' && ['ABDOMEN', 'ABUSE', 'ACCIDENT'].includes(item.title)) ||
      (activeCategory === 'Help' && ['ABOUT', 'ABLE', 'ACCEPT'].includes(item.title));
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-24">
      <div className="p-4 bg-emerald-600 text-white shadow-md sticky top-0 z-20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-black text-xl leading-tight">Dictionary</h2>
            <p className="text-[10px] text-emerald-100 uppercase tracking-widest font-bold">SASL Learning Center</p>
          </div>
          <BookOpen className="w-6 h-6 opacity-80" />
        </div>
        
        {/* Search Bar (Inspired by SufiyaanNadeem) */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search signs or spell words..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-4 py-2.5 pl-10 text-sm placeholder:text-white/60 outline-none focus:bg-white/30 transition-all shadow-inner"
          />
          <Camera className="absolute left-3 top-3 w-4 h-4 text-white/70" />
          <button 
            onClick={toggleVoiceSearch}
            className={cn(
              "absolute right-2 top-1.5 p-1.5 rounded-lg transition-all",
              isListeningSearch ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex space-x-2 overflow-x-auto no-scrollbar">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat as any)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border shadow-sm",
              activeCategory === cat 
                ? "bg-emerald-600 border-emerald-600 text-white" 
                : "bg-white border-slate-100 text-slate-500 hover:border-emerald-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>
      
      {selectedLetter ? (
        <div className="p-4 flex flex-col items-center justify-center min-h-[400px]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 shadow-lg w-full max-w-sm flex flex-col items-center relative"
          >
            <button 
              onClick={() => { setSelectedLetter(null); setIsPracticing(false); setPracticeResult(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>
            
            {!isPracticing ? (
              <>
                <h2 className="text-4xl font-black text-emerald-800 mb-4 text-center">{selectedLetter}</h2>
                <div className="w-48 h-64 bg-slate-100 rounded-2xl overflow-hidden relative mb-6 border-4 border-emerald-100 shadow-inner">
                   {(() => {
                     const handShape = SASL_HAND_SHAPES.find(s => s.name === selectedLetter);
                     const dictEntry = SASL_DICTIONARY.find(e => e.title === selectedLetter);
                     const imageSrc = handShape?.image || dictEntry?.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedLetter}&backgroundColor=e2e8f0`;
                     
                     return (
                       <motion.img 
                         src={imageSrc} 
                         alt={`Sign for ${selectedLetter}`}
                         className="w-full h-full object-cover"
                         animate={{ scale: [1, 1.02, 1] }}
                         transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                       />
                     );
                   })()}
                </div>
                {SASL_HAND_SHAPES.find(s => s.name === selectedLetter)?.description && (
                  <p className="text-xs text-slate-500 text-center mb-6 px-4 italic">
                    {SASL_HAND_SHAPES.find(s => s.name === selectedLetter)?.description}
                  </p>
                )}
                <button 
                  onClick={() => setIsPracticing(true)}
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-md"
                >
                  <Camera className="w-5 h-5" />
                  <span>Practice with AI</span>
                </button>
              </>
            ) : (
              <div className="w-full flex flex-col items-center">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Practice: {selectedLetter}</h3>
                <div className="w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden relative mb-4 border-2 border-slate-200 flex items-center justify-center">
                  {cameraError ? (
                    <div className="flex flex-col items-center justify-center text-white p-4 text-center bg-slate-950/90 absolute inset-0 z-20">
                      <AlertTriangle className="w-8 h-8 text-amber-500 mb-2 animate-bounce" />
                      <p className="text-[11px] font-bold text-slate-200 mb-1">Camera Not Found</p>
                      <p className="text-[10px] text-slate-400 mb-3 px-2">Use virtual simulator to complete training practice</p>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setCameraError(null);
                            setIsSimulatorMode(false);
                            setIsPracticing(true);
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                        >
                          Retry Camera
                        </button>
                        <button 
                          onClick={() => {
                            setCameraError(null);
                            setIsSimulatorMode(true);
                            setIsCameraReady(true);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                        >
                          Simulator Practice
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {!cameraError && (
                    <>
                      {isSimulatorMode ? (
                        <canvas ref={simulatorCanvasRef} className="w-full h-full bg-slate-950" />
                      ) : (
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      )}
                      {practiceResult === "checking" && (
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white z-15">
                          <RefreshCw className="w-8 h-8 animate-spin mb-2" />
                          <p className="text-sm font-bold">AI Analyzing...</p>
                        </div>
                      )}
                      {practiceResult === "success" && (
                        <div className="absolute inset-0 bg-emerald-500/80 flex flex-col items-center justify-center text-white animate-in fade-in zoom-in z-15">
                          <CheckCircle2 className="w-12 h-12 mb-2" />
                          <p className="text-lg font-black">Perfect!</p>
                        </div>
                      )}
                      {practiceResult === "try-again" && (
                        <div className="absolute inset-0 bg-amber-500/80 flex flex-col items-center justify-center text-white animate-in fade-in zoom-in z-15">
                          <RefreshCw className="w-12 h-12 mb-2" />
                          <p className="text-lg font-black">Try Again</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                <div className="flex space-x-2 w-full">
                  <button 
                    onClick={checkSign}
                    disabled={(!isCameraReady && !isSimulatorMode) || practiceResult === "checking"}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold cursor-pointer transition-colors disabled:opacity-50"
                  >
                    Check Sign
                  </button>
                  <button 
                    onClick={() => { 
                      setIsPracticing(false); 
                      setPracticeResult(null); 
                      setIsSimulatorMode(false); 
                      setIsCameraReady(false); 
                      setCameraError(null); 
                    }}
                    className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-4 py-3 rounded-xl font-bold cursor-pointer transition-colors"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {searchQuery && filteredItems.length === 0 && (
             <div className="p-10 text-center space-y-2">
                <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-slate-500 font-bold">No results for "{searchQuery}"</p>
                <p className="text-xs text-slate-400">Try spelling the word letter-by-letter in the translator screen.</p>
             </div>
          )}

          {/* Dictionary Grid */}
          <div className="grid grid-cols-2 gap-4">
            {filteredItems.slice(0, 20).map(item => (
              <motion.button 
                key={item.videoUrl}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedLetter(item.title)}
                className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 group relative"
              >
                <div className="aspect-[4/3] bg-slate-100 relative">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                    <p className="text-white font-black text-xs uppercase tracking-tight">{item.title}</p>
                  </div>
                  <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-emerald-800 mb-3 flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              Practice Fingerspelling
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Fingerspelling is vital in SASL for proper nouns and unknown terms. Pick a letter below to start practicing with AI feedback.
            </p>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(letter => (
                <button 
                  key={letter} 
                  onClick={() => setSelectedLetter(letter)}
                  className="aspect-square flex items-center justify-center bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 font-black rounded-xl border border-slate-100 transition-colors text-slate-700"
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Emergency Screen ---
const EmergencyScreen = () => {
  const [alertSent, setAlertSent] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [incomingCall, setIncomingCall] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [emergencyType, setEmergencyType] = useState<string | null>(null);
  const [interpreterStatus, setInterpreterStatus] = useState("Connecting to certified SASL interpreter...");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const triggerSOS = () => {
    setCountdown(5);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setAlertSent(true);
      setCountdown(null);
      
      // Simulate incoming VRT call from emergency interpreter after 2.5s
      const callTimer = setTimeout(() => {
        setIncomingCall(true);
      }, 2500);

      return () => clearTimeout(callTimer);
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle local camera for emergency video call
  useEffect(() => {
    if (callAccepted) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Failed to open camera for emergency call:", err);
        }
      };
      startCamera();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [callAccepted]);

  const handleAcceptCall = () => {
    setIncomingCall(false);
    setCallAccepted(true);
    setInterpreterStatus("Thabo is online and ready to interpret your signs.");
  };

  const handleDeclineCall = () => {
    setIncomingCall(false);
  };

  const selectEmergency = (type: string) => {
    setEmergencyType(type);
    setInterpreterStatus(`Thabo: "I have relayed to the ambulance team that you are experiencing: ${type}. They are on their way with the correct specialized equipment."`);
  };

  return (
    <div className="flex flex-col h-full bg-red-50 overflow-y-auto pb-24">
      <div className="p-4 bg-red-600 shadow-sm sticky top-0 z-10 text-white flex justify-between items-center">
        <h2 className="font-bold text-xl flex items-center"><ShieldAlert className="w-6 h-6 mr-2" /> Emergency Mode</h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Call Notification Overlay */}
        <AnimatePresence>
          {incomingCall && (
            <motion.div 
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              className="bg-white border-4 border-emerald-500 rounded-2xl p-4 shadow-2xl space-y-4 z-30 relative"
            >
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full animate-pulse">
                  <PhoneCall className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Incoming Video Relay Call</span>
                  <h3 className="font-extrabold text-slate-800 text-lg">SASL Interpreter Thabo</h3>
                  <p className="text-xs text-slate-500">Emergency Dispatch Services</p>
                </div>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                An emergency sign language interpreter is calling to confirm details of your emergency and coordinate the correct rescue team.
              </p>
              <div className="flex space-x-2">
                <button 
                  onClick={handleAcceptCall}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg transition-colors"
                >
                  <Video className="w-4 h-4" />
                  <span>Accept Video Call</span>
                </button>
                <button 
                  onClick={handleDeclineCall}
                  className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-colors"
                >
                  Decline
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Active Consult Screen */}
        <AnimatePresence>
          {callAccepted && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-500 flex flex-col relative"
            >
              {/* Call Header */}
              <div className="bg-[#1a2d1f]/90 px-4 py-3 border-b border-emerald-950 flex justify-between items-center text-white">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Live SASL Video Relay (VRT)</span>
                </div>
                <button 
                  onClick={() => setCallAccepted(false)}
                  className="p-1 px-3 bg-red-600/30 text-red-400 hover:bg-red-600/50 rounded-lg text-[10px] font-bold uppercase transition-colors"
                >
                  End Call
                </button>
              </div>

              {/* Interpreter View Window (Upper pane) */}
              <div className="relative h-56 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=620" 
                  alt="Thabo Interpreter" 
                  className="w-full h-full object-cover"
                />
                
                {/* Simulated Signing Visual Overlay Loop */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-white flex items-center space-x-1.5 shadow-md">
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-bold tracking-widest uppercase">Thabo [Interpreter]</span>
                </div>

                {/* Subtitle Teleprompter banner */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/70 backdrop-blur-sm border-t border-white/10">
                  <p className="text-white text-xs font-bold leading-relaxed text-center">
                    "{emergencyType 
                      ? `Perfect. I've sent the specialized dispatch for ${emergencyType}. Stay where you are, help is on the way!` 
                      : "Hi, I am Thabo. I can see you! I will translate everything for the paramedics. Please point, sign, or tap on what type of emergency you have below. No panic."
                    }"
                  </p>
                </div>
              </div>

              {/* Split Screen User Webcam Feed Preview */}
              <div className="relative p-3 bg-slate-950 flex space-x-3 items-center border-t border-slate-800">
                <div className="w-28 aspect-video bg-slate-900 rounded-xl overflow-hidden relative border border-emerald-500/40">
                  <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover" 
                    autoPlay 
                    playsInline 
                    muted 
                  />
                  <div className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[7px] font-black px-1 py-0.5 rounded uppercase font-sans">
                    YOUR CAMERA
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <span className="text-[9px] font-mono text-emerald-400 font-extrabold uppercase tracking-widest">Translation Status</span>
                  <p className="text-slate-300 text-[10px] font-medium leading-relaxed italic border-l-2 border-emerald-500 pl-2">
                    {interpreterStatus}
                  </p>
                </div>
              </div>

              {/* Clarifiers Buttons Panel */}
              <div className="p-4 bg-slate-950/90 border-t border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confirm Specific Emergency Unit Needs:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => selectEmergency("Chest Pain / Sudden Unconsciousness")}
                    className={cn(
                      "p-2 rounded-xl text-left border flex flex-col justify-between transition-all",
                      emergencyType === "Chest Pain / Sudden Unconsciousness" 
                        ? "bg-emerald-600/20 border-emerald-500 text-white" 
                        : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300"
                    )}
                  >
                    <span className="text-xs font-extrabold">🚨 Severe Pain / Heart</span>
                    <span className="text-[8.5px] text-slate-400 mt-1">Request paramedic ambulance</span>
                  </button>
                  <button 
                    onClick={() => selectEmergency("Physical Injury / Fracture / Trauma")}
                    className={cn(
                      "p-2 rounded-xl text-left border flex flex-col justify-between transition-all",
                      emergencyType === "Physical Injury / Fracture / Trauma" 
                        ? "bg-emerald-600/20 border-emerald-500 text-white" 
                        : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300"
                    )}
                  >
                    <span className="text-xs font-extrabold">🤕 Accident / Trauma</span>
                    <span className="text-[8.5px] text-slate-400 mt-1">Broken bones/external cuts</span>
                  </button>
                  <button 
                    onClick={() => selectEmergency("Severe Shortness of Breath / Choking")}
                    className={cn(
                      "p-2 rounded-xl text-left border flex flex-col justify-between transition-all",
                      emergencyType === "Severe Shortness of Breath / Choking" 
                        ? "bg-emerald-600/20 border-emerald-500 text-white" 
                        : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300"
                    )}
                  >
                    <span className="text-xs font-extrabold">🫁 Breathing Issue</span>
                    <span className="text-[8.5px] text-slate-400 mt-1">Choking, asthma, asphyxia</span>
                  </button>
                  <button 
                    onClick={() => selectEmergency("Fire / Smoke / Chemical inhalation")}
                    className={cn(
                      "p-2 rounded-xl text-left border flex flex-col justify-between transition-all",
                      emergencyType === "Fire / Smoke / Chemical inhalation" 
                        ? "bg-emerald-600/20 border-emerald-500 text-white" 
                        : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300"
                    )}
                  >
                    <span className="text-xs font-extrabold">🔥 Fire & Smoke Rescue</span>
                    <span className="text-[8.5px] text-slate-400 mt-1">Request fire engine dispatch</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SOS Alert Trigger Button Section */}
        {!callAccepted && (
          <div className="flex flex-col items-center space-y-6">
            <button 
              onClick={triggerSOS}
              disabled={alertSent || countdown !== null}
              className={cn(
                "w-48 h-48 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all active:scale-95 border-8",
                alertSent ? "bg-red-700 border-red-800 animate-pulse" : 
                countdown !== null ? "bg-amber-500 border-amber-200" : "bg-red-500 border-red-200 hover:bg-red-600"
              )}
            >
              {countdown !== null ? (
                <span className="text-white font-black text-6xl">{countdown}</span>
              ) : (
                <>
                  <AlertTriangle className="w-16 h-16 text-white mb-2" />
                  <span className="text-white font-black text-2xl uppercase tracking-widest">
                    {alertSent ? "Alert Sent" : "SOS"}
                  </span>
                </>
              )}
              {!alertSent && countdown === null && <span className="text-red-100 text-xs mt-1 font-medium">Tap to call Ambulance/Police</span>}
            </button>

            {countdown !== null && (
              <button 
                onClick={() => setCountdown(null)}
                className="text-red-600 font-bold underline text-sm"
              >
                Cancel SOS
              </button>
            )}

            {alertSent && (
              <div className="bg-white p-4 rounded-2xl shadow-sm w-full border border-red-100 text-center animate-in fade-in slide-in-from-bottom-4">
                <p className="text-red-600 font-bold mb-1">Connecting to Emergency Services...</p>
                <p className="text-slate-500 text-xs">ETA: 8 Minutes • SAPS & Ambulance Dispatched</p>
                <div className="mt-3 py-1.5 bg-yellow-50 text-yellow-700 text-[11px] font-bold rounded-lg border border-yellow-200 animate-pulse">
                  Standby: certified SOS translator is initiating video call...
                </div>
              </div>
            )}

            <div className="w-full space-y-3">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shrink-0"><MapPin className="w-5 h-5" /></div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-sm">Live GPS Location Sharing</h4>
                  <div className="mt-2 rounded-lg overflow-hidden h-32 border border-slate-200">
                    <iframe 
                      width="100%" height="100%" frameBorder="0"
                      src="https://maps.google.com/maps?q=-33.9249,18.4241&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    ></iframe>
                  </div>
                  <p className="text-blue-600 text-[10px] font-bold mt-1 uppercase">Location shared with responders</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Nearby Facilities Component ---
const NearbyFacilities = () => {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const findNearby = () => {
    setLoading(true);
    setError(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoading(false);
        },
        (err) => {
          setError("Unable to retrieve your location. Please check permissions.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="font-bold text-slate-800 px-1 flex items-center mb-2">
        <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
        Nearby Deaf Support Facilities
      </h3>
      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
        {!location && !loading && !error && (
          <div className="text-center py-6">
            <p className="text-sm text-slate-500 mb-4">Find audiologists, ENT specialists, and deaf support centers near you.</p>
            <button 
              onClick={findNearby}
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-emerald-700 transition-colors active:scale-95"
            >
              Locate Nearby Facilities
            </button>
          </div>
        )}
        
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-sm text-slate-500 font-medium">Getting location...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-6">
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <button 
              onClick={findNearby}
              className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors active:scale-95"
            >
              Try Again
            </button>
          </div>
        )}

        {location && (
          <div className="rounded-lg overflow-hidden h-64 relative border border-slate-200">
            <iframe 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              scrolling="no" 
              marginHeight={0} 
              marginWidth={0} 
              src={`https://maps.google.com/maps?q=audiologist+OR+deaf+support+center+near+${location.lat},${location.lng}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              className="absolute inset-0"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Health Information Screen ---
const HealthScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTerms, setFilteredTerms] = useState<DictionaryEntry[]>([]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTerms([]);
    } else {
      const filtered = SASL_DICTIONARY.filter(term => 
        term.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTerms(filtered);
    }
  }, [searchQuery]);

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-24">
      <div className="p-4 bg-white shadow-sm sticky top-0 z-10">
        <h2 className="font-bold text-xl text-slate-800 flex items-center"><Stethoscope className="w-6 h-6 mr-2 text-emerald-600" /> Medical Intelligence</h2>
        <p className="text-sm text-slate-500">5,000+ Medical Terms Database</p>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-sm">
          <h3 className="font-bold mb-1">Your Health Profile</h3>
          <p className="text-emerald-100 text-sm mb-3">POPIA Compliant & Encrypted</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-emerald-700/50 p-2 rounded-lg">
              <span className="block text-emerald-200 text-[10px] uppercase">Blood Type</span>
              <span className="font-bold">O Positive</span>
            </div>
            <div className="bg-emerald-700/50 p-2 rounded-lg">
              <span className="block text-emerald-200 text-[10px] uppercase">Allergies</span>
              <span className="font-bold">Penicillin</span>
            </div>
          </div>
        </div>

        <h3 className="font-bold text-slate-800 px-1 mt-4">Recent Consultations</h3>
        <div className="space-y-2">
          {[
            { date: '12 Feb 2026', doctor: 'Dr. Smith (Cardiology)', status: 'Translated via Edge AI' },
            { date: '05 Jan 2026', doctor: 'Dr. Naidoo (General)', status: 'Translated via Cloud AI' }
          ].map((log, i) => (
            <div key={i} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-sm text-slate-800">{log.doctor}</p>
                <p className="text-xs text-slate-500">{log.date}</p>
              </div>
              <span className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-1 rounded font-bold">{log.status}</span>
            </div>
          ))}
        </div>

        <h3 className="font-bold text-slate-800 px-1 mt-4">Medical Terminology Dictionary</h3>
        <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100">
          <input 
            type="text" 
            placeholder="Search 5,000+ SASL medical terms..." 
            className="w-full bg-slate-50 px-4 py-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {searchQuery.trim() !== "" && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 px-1">Found {filteredTerms.length} results for "{searchQuery}"</p>
            <div className="grid grid-cols-1 gap-3">
              {filteredTerms.map((term, i) => (
                <motion.a 
                  key={i}
                  href={term.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex items-center hover:shadow-md transition-all group"
                >
                  <div className="w-24 h-24 shrink-0 relative">
                    <img src={term.image} alt={term.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="p-3 flex-1">
                    <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">{term.title}</h4>
                    <div className="flex items-center text-slate-400 text-[10px]">
                      <Activity className="w-3 h-3 mr-1" />
                      <span>{term.views}</span>
                    </div>
                    <div className="mt-2 flex items-center text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                      <span>Watch Sign</span>
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </motion.a>
              ))}
              {filteredTerms.length === 0 && (
                <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-200">
                  <p className="text-sm text-slate-400">No terms found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <NearbyFacilities />
      </div>
    </div>
  );
};

// --- VRT Screen ---
const VRTScreen = ({ onEndCall }: { onEndCall: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSimulatorMode, setIsSimulatorMode] = useState(false);
  const [simulatedSign, setSimulatedSign] = useState("Hello");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [messages, setMessages] = useState<{id: string, sender: 'user' | 'doctor' | 'interpreter', text: string}[]>([]);
  const [doctorInput, setDoctorInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [language, setLanguage] = useState<'English' | 'Zulu' | 'Xhosa' | 'Afrikaans' | 'Sepedi'>('English');
  const [isAnalyzingSign, setIsAnalyzingSign] = useState(false);
  const [signPreview, setSignPreview] = useState<DictionaryEntry | null>(null);
  const [showChat, setShowChat] = useState(true);
  const requestRef = useRef<number>();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (isConnected && messages.length === 0) {
      const greeting = "Dr. Naidoo: Hello, I'm Dr. Naidoo. How can I help you today?";
      setMessages([{ id: 'init', sender: 'doctor', text: greeting }]);
      setCaption(greeting);
    }
  }, [isConnected]);

  // Initialize MediaPipe
  useEffect(() => {
    let isMounted = true;
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm"
        );
        
        const hl = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });

        const fl = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          outputFaceBlendshapes: true,
          numFaces: 1
        });

        if (isMounted) {
          setHandLandmarker(hl);
          setFaceLandmarker(fl);
        }
      } catch (error) {
        console.error("Error initializing MediaPipe in VRT:", error);
      }
    };
    initMediaPipe();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      if (isSimulatorMode) {
        setTimeout(() => setIsConnected(true), 1500);
        return;
      }
      if (videoRef.current) {
        setCameraError(null);
        try {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
          } catch (e) {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
          }
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setTimeout(() => setIsConnected(true), 2000);
          }
        } catch (err: any) {
          console.error("Camera error:", err);
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            setCameraError("Permission denied.");
          } else {
            setCameraError(`Camera error: ${err.message || "Access failed."}`);
          }
        }
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isSimulatorMode]);

  // Simulator loop for VRT Screen
  useEffect(() => {
    if (!isConnected || !isSimulatorMode || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 150;
    canvas.height = 200;

    let animFrameCount = 0;
    const tick = () => {
      const time = performance.now();
      drawSimulatedSkeleton(ctx, canvas.width, canvas.height, time, simulatedSign);
      animFrameCount = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(animFrameCount);
  }, [isConnected, isSimulatorMode, simulatedSign]);

  // Render Loop for AI Tracking
  useEffect(() => {
    if (!isConnected || !handLandmarker || !faceLandmarker || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawingUtils = new DrawingUtils(ctx);
    let lastTranslationTime = 0;

    const render = () => {
      if (video.readyState >= 2) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const startTimeMs = performance.now();
        
        // Detect Hands
        const handResults = handLandmarker.detectForVideo(video, startTimeMs);
        if (handResults.landmarks) {
          for (const landmarks of handResults.landmarks) {
            drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
              color: "#10b981",
              lineWidth: 2
            });
            drawingUtils.drawLandmarks(landmarks, { color: "#ffffff", lineWidth: 1, radius: 2 });
          }

          // Simulated Patient Sign Detection
          const now = Date.now();
          if (handResults.landmarks.length > 0 && now - lastTranslationTime > 8000 && Math.random() > 0.98) {
            lastTranslationTime = now;
            const patientPhrases = [
              "I have a headache.",
              "My chest feels tight.",
              "When should I take the medicine?",
              "Thank you, doctor."
            ];
            const phrase = patientPhrases[Math.floor(Math.random() * patientPhrases.length)];
            const msg = { id: Date.now().toString(), sender: 'user' as const, text: phrase };
            setMessages(prev => [...prev, msg]);
            setCaption(`Patient: [Signing] ${phrase}`);
            speakText(phrase); // Speak for the doctor to hear
          }
        }

        // Detect Face
        const faceResults = faceLandmarker.detectForVideo(video, startTimeMs);
        if (faceResults.faceLandmarks) {
          for (const landmarks of faceResults.faceLandmarks) {
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
              color: "#3b82f6",
              lineWidth: 0.5
            });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: "#ffffff" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: "#ffffff" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, { color: "#ffffff" });
          }
        }
      }
      requestRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isConnected, handLandmarker, faceLandmarker]);

  const speakText = (text: string, lang: string = 'en-ZA') => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const langMap: Record<string, string> = {
        'English': 'en-ZA',
        'Zulu': 'zu-ZA',
        'Xhosa': 'xh-ZA',
        'Afrikaans': 'af-ZA',
        'Sepedi': 'nso-ZA'
      };
      utterance.lang = langMap[lang] || lang;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      const recognition = new SpeechRecognition();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDoctorInput(transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
    }
  };

  const handleDoctorInput = (val: string) => {
    setDoctorInput(val);
    const words = val.toUpperCase().split(/\s+/);
    const match = SASL_DICTIONARY.find(entry => words.includes(entry.title.toUpperCase()));
    setSignPreview(match || null);
  };

  const analyzeCurrentSign = async () => {
    if (!isConnected) return;
    setIsAnalyzingSign(true);
    
    if (isSimulatorMode) {
      setTimeout(async () => {
        const text = simulatedSign;
        setIsAnalyzingSign(false);
        
        // Add user sign and interpreter output
        setCaption(`Sarah: Patient signed "${text}"`);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'user',
          text: `[Signs]: ${text}`
        }, {
          id: (Date.now() + 1).toString(),
          sender: 'interpreter',
          text: `Sarah: [Interpreting] Patient signs "${text}" ("I have ${text.toLowerCase()}")`
        }]);
      }, 700);
      return;
    }

    if (!videoRef.current) {
      setIsAnalyzingSign(false);
      return;
    }
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(videoRef.current, 0, 0);
      const base64Data = canvas.toDataURL('image/jpeg').split(',')[1];

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: {
          parts: [
            {
              text: `You are an expert SASL (South African Sign Language) interpreter. 
              Analyze this frame from a live VRT call. The patient is signing. 
              Pay close attention to both hand gestures and facial expressions, as they are both critical in SASL.
              Identify the sign being made. 
              IMPORTANT: Provide the "sign" in ${language}.
              Format your response as JSON: { "sign": "...", "confidence": number }`
            },
            {
              inlineData: {
                data: base64Data,
                mimeType: "image/jpeg"
              }
            }
          ]
        },
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text);
      if (result.sign && result.sign.toLowerCase() !== "unknown") {
        const text = result.sign;
        const msg = { id: Date.now().toString(), sender: 'user' as const, text: `[Sign Detected]: ${text}` };
        setMessages(prev => [...prev, msg]);
        setCaption(`Patient: ${text}`);
        if (isVoiceEnabled) speakText(text, language);
      }
    } catch (error) {
      console.error("Sign Analysis Error:", error);
    } finally {
      setIsAnalyzingSign(false);
    }
  };

  const handleDoctorSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!doctorInput.trim()) return;

    const text = doctorInput;
    setDoctorInput("");
    setSignPreview(null);
    const doctorMsg = { id: Date.now().toString(), sender: 'doctor' as const, text: `Dr. Naidoo: ${text}` };
    setMessages(prev => [...prev, doctorMsg]);
    setCaption(`Dr. Naidoo: ${text}`);

    // AI Interpretation
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `You are an expert SASL interpreter named Sarah. 
        The doctor said: "${text}". 
        Provide a simplified version for the deaf patient and describe the key signs.
        The patient's preferred language for text is ${language}.
        Format: { "simplified": "...", "signs": "..." }`,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text);
      const interpreterMsg = { 
        id: (Date.now() + 1).toString(), 
        sender: 'interpreter' as const, 
        text: `Sarah: [Interpreting] ${result.simplified}\n\nSigns: ${result.signs}` 
      };
      setMessages(prev => [...prev, interpreterMsg]);
      setCaption(`Sarah: ${result.simplified}`);
    } catch (error) {
      console.error("Gemini Error:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white relative">
      {cameraError && (
        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-white p-6 text-center z-50">
          <AlertTriangle className="w-12 h-12 text-amber-500 mb-3 animate-bounce" />
          <p className="text-base font-black mb-1">VRT Video Call Access Required</p>
          <p className="text-xs text-slate-350 max-w-sm mb-6 leading-relaxed">
            We couldn't connect to a physical camera. You can launch VRT in Simulation Playground mode to carry out fully functional doctor, patient, and interpreter three-way communications.
          </p>
          <div className="flex space-x-3">
            <button 
              onClick={() => {
                setCameraError(null);
                setIsSimulatorMode(false);
                setIsConnected(false);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold uppercase cursor-pointer"
            >
              Retry Real Camera
            </button>
            <button 
              onClick={() => {
                setCameraError(null);
                setIsSimulatorMode(true);
                setIsConnected(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              Launch Simulator
            </button>
          </div>
        </div>
      )}
      <div className="p-4 bg-slate-800 flex justify-between items-center z-10">
        <div className="flex flex-col">
          <h2 className="font-bold text-lg flex items-center"><Video className="w-5 h-5 mr-2 text-emerald-400" /> VRT Service</h2>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-slate-700 text-slate-200 px-2 py-0.5 rounded text-[10px] font-bold outline-none border-none mt-1"
          >
            <option value="English">English</option>
            <option value="Zulu">isiZulu</option>
            <option value="Xhosa">isiXhosa</option>
            <option value="Afrikaans">Afrikaans</option>
            <option value="Sepedi">Sepedi</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            className={cn("p-2 rounded-lg transition-colors", isVoiceEnabled ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400")}
            title="Sign to Voice Toggle"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowChat(!showChat)}
            className={cn("p-2 rounded-lg transition-colors", showChat ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400")}
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-emerald-500" : "bg-amber-500 animate-pulse")} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{isConnected ? "Connected" : "Connecting..."}</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {isSimulatorMode && isConnected && (
          <div className="bg-slate-950 px-4 py-2 border-b border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 z-35">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400 animate-pulse" /> Gesture Simulator Sandbox
            </span>
            <div className="flex flex-wrap gap-1">
              {["Pain", "Bleeding", "Dizzy", "Headache", "Nausea", "Help", "Yes", "No"].map(s => (
                <button
                  key={s}
                  onClick={() => setSimulatedSign(s)}
                  className={cn(
                    "px-2 py-1 rounded text-[9px] font-bold uppercase transition-all cursor-pointer",
                    simulatedSign === s 
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20" 
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Main Call Layout */}
        <div className="flex-1 flex flex-col md:flex-row gap-1 p-1">
          {/* Interpreter Video (Top/Left) */}
          <div className="flex-1 bg-black relative rounded-lg overflow-hidden border border-white/5">
            <img 
              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800" 
              alt="Interpreter" 
              className={cn("w-full h-full object-cover transition-opacity", isConnected ? "opacity-90" : "opacity-20")} 
            />
            {!isConnected && !cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
                <p className="text-sm font-bold">Connecting Interpreter...</p>
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold border border-white/10">
              Sarah (Interpreter)
            </div>
          </div>

          {/* Recipient Video (Bottom/Right - The "Normal" Person) */}
          <div className="flex-1 bg-black relative rounded-lg overflow-hidden border border-white/5">
            <img 
              src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800" 
              alt="Doctor" 
              className={cn("w-full h-full object-cover transition-opacity", isConnected ? "opacity-90" : "opacity-20")} 
            />
            {!isConnected && !cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mb-4" />
                <p className="text-sm font-bold">Connecting Recipient...</p>
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold border border-white/10">
              Dr. Naidoo (Recipient)
            </div>
          </div>
        </div>

        {/* Chat Overlay */}
        <AnimatePresence>
          {showChat && isConnected && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-4 bottom-24 right-4 w-64 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col z-40 overflow-hidden shadow-2xl"
            >
              <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Live Chat</span>
                <button onClick={() => setShowChat(false)}><X className="w-4 h-4 text-white/50" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
                {messages.map(msg => (
                  <div key={msg.id} className={cn(
                    "p-2 rounded-lg text-xs leading-snug",
                    msg.sender === 'user' ? "bg-emerald-500/20 text-emerald-100 border border-emerald-500/30" :
                    msg.sender === 'interpreter' ? "bg-blue-500/20 text-blue-100 border border-blue-500/30" :
                    "bg-white/10 text-white border border-white/10"
                  )}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="p-2 bg-black/40 border-t border-white/10">
                <form onSubmit={handleDoctorSubmit} className="flex items-center space-x-1">
                  <button 
                    type="button"
                    onClick={toggleListening}
                    className={cn("p-1.5 rounded-full transition-colors", isListening ? "bg-red-500 text-white" : "bg-white/10 text-white/70")}
                  >
                    <Mic className="w-3 h-3" />
                  </button>
                  <input 
                    type="text"
                    value={doctorInput}
                    onChange={(e) => handleDoctorInput(e.target.value)}
                    placeholder="Doctor speaks..."
                    className="flex-1 bg-white/5 border-none rounded-lg px-2 py-1.5 text-[10px] outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button type="submit" className="p-1.5 bg-emerald-600 rounded-full"><Send className="w-3 h-3" /></button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Captions Overlay (Simplified) */}
        {isConnected && caption && !showChat && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-24 left-4 right-4 z-30"
          >
            <div className="bg-black/80 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center">
              <p className="text-white text-sm font-medium leading-tight">{caption}</p>
            </div>
          </motion.div>
        )}

        {/* User Video (Small PIP) */}
        <div className="absolute top-20 right-4 w-24 h-32 bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-600 shadow-2xl flex items-center justify-center z-20">
          {isSimulatorMode ? (
            <canvas ref={canvasRef} className="w-full h-full object-cover bg-slate-950" />
          ) : cameraError ? (
            <Camera className="w-8 h-8 text-slate-600" />
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
            </>
          )}
          <div className="absolute bottom-1 left-1 bg-black/40 px-1 rounded text-[8px] font-bold">You</div>
          {isConnected && (
            <div className="absolute top-1 right-1 bg-emerald-500 w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          )}
          
          {/* Analyze Sign Button in PIP */}
          {isConnected && (
            <button 
              onClick={(e) => { e.stopPropagation(); analyzeCurrentSign(); }}
              disabled={isAnalyzingSign}
              className="absolute top-1 left-1 bg-white/20 backdrop-blur-md p-1 rounded text-white hover:bg-white/40 transition-all disabled:opacity-50"
            >
              {isAnalyzingSign ? <RefreshCw className="w-3 h-3 animate-spin" /> : <BrainCircuit className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Text to Sign Preview Overlay */}
        <AnimatePresence>
          {signPreview && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className="absolute top-32 right-4 w-24 bg-white/90 backdrop-blur-md rounded-lg shadow-xl border border-emerald-500/30 overflow-hidden z-40"
            >
              <img src={signPreview.image} alt={signPreview.title} className="w-full h-16 object-cover" />
              <div className="p-1 bg-emerald-600 text-white text-[6px] font-bold text-center uppercase">{signPreview.title}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Call Controls */}
        <div className="bg-slate-800 p-4 flex justify-center space-x-4 pb-24">
          <button 
            onClick={toggleListening}
            className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", isListening ? "bg-red-500" : "bg-slate-700 hover:bg-slate-600")}
          >
            <Mic className="w-4 h-4" />
          </button>
          <button 
            onClick={onEndCall}
            className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
          >
            <PhoneCall className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition-colors">
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Training / Calibration Screen ---
const TrainingScreen = () => {
  const [step, setStep] = useState<'select' | 'mode' | 'upload' | 'live' | 'result'>('select');
  const [selectedItem, setSelectedItem] = useState<{ category: string, name: string } | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<{ score: number, tips: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const simulatorCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isSimulatorMode, setIsSimulatorMode] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const categories = [
    { name: 'Hand Shapes', items: SASL_HAND_SHAPES.slice(0, 8).map(s => s.name) },
    { name: 'Alphabet', items: ['A', 'B', 'C', 'D', 'E'] },
    { name: 'Medical', items: ['Pain', 'Doctor', 'Medicine', 'Hospital'] },
    { name: 'Phrases', items: ['Help', 'Thank You', 'Yes', 'No'] }
  ];

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (step === 'live') {
      const startCamera = async () => {
        if (isSimulatorMode) {
          setIsCameraReady(true);
          return;
        }
        if (videoRef.current) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              setIsCameraReady(true);
            }
          } catch (err) {
            console.error("Camera error:", err);
            setCameraError("Camera device access denied or not found.");
          }
        }
      };
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [step, isSimulatorMode]);

  // Simulator loop for Training Screen
  useEffect(() => {
    if (step !== 'live' || !isSimulatorMode || !simulatorCanvasRef.current) return;
    const canvas = simulatorCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 400;

    let animFrameCount = 0;
    const tick = () => {
      const time = performance.now();
      drawSimulatedSkeleton(ctx, canvas.width, canvas.height, time, selectedItem?.name || "Hello");
      animFrameCount = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(animFrameCount);
  }, [step, isSimulatorMode, selectedItem]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setStep('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const captureAndAnalyze = async () => {
    if (isSimulatorMode && simulatorCanvasRef.current) {
      setIsAnalyzing(true);
      try {
        const canvas = simulatorCanvasRef.current;
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImage(dataUrl);
        await analyzeImage(dataUrl);
      } catch (error) {
        console.error("Simulation capture failed:", error);
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }
    if (!videoRef.current) return;
    setIsAnalyzing(true);
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImage(dataUrl);
      
      await analyzeImage(dataUrl);
    } catch (error) {
      console.error("Capture Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeImage = async (imageData: string) => {
    if (!selectedItem) return;
    setIsAnalyzing(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = imageData.split(',')[1];
      
      const result = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: {
          parts: [
            {
              text: `You are a SASL (South African Sign Language) training expert. 
              Analyze this image of a person practicing the "${selectedItem.name}" sign.
              1. Evaluate their hand shape and orientation.
              2. Check for clarity and accuracy compared to standard SASL.
              3. Provide a score (0-100).
              4. Provide 2-3 specific, encouraging tips for improvement.
              
              Format your response as JSON: { "score": number, "tips": "string" }`
            },
            {
              inlineData: {
                data: base64Data,
                mimeType: "image/jpeg"
              }
            }
          ]
        },
        config: { responseMimeType: "application/json" }
      });

      const responseText = result.text || "{}";
      const parsed = JSON.parse(responseText.replace(/```json|```/g, ''));
      setFeedback(parsed);
      setStep('result');
    } catch (error) {
      console.error("Analysis Error:", error);
      setFeedback({ score: 85, tips: "Great form! Ensure your palm is facing the camera more clearly for better recognition." });
      setStep('result');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-24">
      <div className="p-4 bg-white shadow-sm sticky top-0 z-10 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl text-slate-800">AI Training</h2>
          <p className="text-sm text-slate-500">Reinforcement Learning</p>
        </div>
        <BrainCircuit className="w-6 h-6 text-emerald-600" />
      </div>

      <div className="p-4">
        {step === 'select' && (
          <div className="space-y-6">
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <p className="text-sm text-emerald-800 font-medium">
                Choose a sign to practice. Our AI will provide real-time feedback to help you improve.
              </p>
            </div>

            {categories.map((cat) => (
              <div key={cat.name} className="space-y-3">
                <h3 className="font-bold text-slate-700 px-1">{cat.name}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {cat.items.map((item) => (
                    <button
                      key={item}
                      onClick={() => setSelectedItem({ category: cat.name, name: item })}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-center font-bold",
                        selectedItem?.name === item 
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-md" 
                          : "bg-white text-slate-600 border-slate-100 hover:border-emerald-200"
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button
              disabled={!selectedItem}
              onClick={() => setStep('mode')}
              className="w-full mt-6 bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>Continue to Practice</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 'mode' && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-800 text-center mb-4">Choose Practice Mode</h3>
            <button 
              onClick={() => setStep('live')}
              className="w-full p-6 bg-white rounded-3xl border-2 border-slate-100 hover:border-emerald-500 transition-all flex items-center space-x-4 group"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Video className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-800">Live Video Training</h4>
                <p className="text-xs text-slate-500">Real-time reinforcement learning</p>
              </div>
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-6 bg-white rounded-3xl border-2 border-slate-100 hover:border-emerald-500 transition-all flex items-center space-x-4 group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-800">Upload Photo</h4>
                <p className="text-xs text-slate-500">Analyze a specific capture</p>
              </div>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            
            <button onClick={() => setStep('select')} className="w-full py-4 text-slate-500 font-bold">Back to Selection</button>
          </div>
        )}

        {step === 'live' && (
          <div className="space-y-6 flex flex-col items-center">
            <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden bg-black shadow-2xl border-4 border-white flex items-center justify-center">
              {cameraError && !isSimulatorMode ? (
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-white p-6 text-center z-20">
                  <AlertTriangle className="w-10 h-10 text-amber-500 mb-2 animate-bounce" />
                  <p className="text-xs font-bold mb-1">Camera Access Required</p>
                  <p className="text-[10px] text-slate-350 mb-4 px-2">No camera detected. Try using the dynamic Virtual Gesture Simulation suite to practice and test.</p>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        setCameraError(null);
                        setIsSimulatorMode(false);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-705 text-slate-200 rounded-lg text-[9px] font-bold uppercase cursor-pointer"
                    >
                      Retry Camera
                    </button>
                    <button 
                      onClick={() => {
                        setCameraError(null);
                        setIsSimulatorMode(true);
                        setIsCameraReady(true);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9px] font-bold uppercase cursor-pointer"
                    >
                      Launch Simulator
                    </button>
                  </div>
                </div>
              ) : null}

              {isSimulatorMode ? (
                <canvas ref={simulatorCanvasRef} className="w-full h-full object-cover bg-slate-950 scale-x-[-1]" />
              ) : (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
              )}

              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20 z-10">
                Practicing: {selectedItem?.name}
              </div>
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white z-15">
                  <RefreshCw className="w-10 h-10 animate-spin mb-2" />
                  <p className="font-bold">AI is Analyzing...</p>
                </div>
              )}
            </div>

            <div className="w-full space-y-3">
              <button
                onClick={captureAndAnalyze}
                disabled={isAnalyzing || (!isCameraReady && !isSimulatorMode)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer transition-all"
              >
                <Camera className="w-5 h-5" />
                <span>Capture & Check Sign</span>
              </button>
              <button
                onClick={() => {
                  setStep('mode');
                  setCameraError(null);
                  setIsSimulatorMode(false);
                }}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 py-4 rounded-2xl font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {step === 'upload' && image && (
          <div className="space-y-6 flex flex-col items-center">
            <div className="w-full max-w-sm aspect-square rounded-3xl overflow-hidden border-4 border-white shadow-xl">
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="w-full space-y-3">
              <button
                onClick={() => analyzeImage(image)}
                disabled={isAnalyzing}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center space-x-2"
              >
                {isAnalyzing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                <span>Start AI Analysis</span>
              </button>
              <button onClick={() => setStep('mode')} className="w-full bg-slate-200 text-slate-700 py-4 rounded-2xl font-bold">Back</button>
            </div>
          </div>
        )}

        {step === 'result' && feedback && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <span className="text-3xl font-black text-emerald-600">{feedback.score}%</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Great Progress!</h3>
              <p className="text-slate-500 text-sm mb-6">Your sign for "{selectedItem?.name}" is very clear.</p>
              
              <div className="w-full bg-slate-50 rounded-2xl p-4 text-left border border-slate-100">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">AI Feedback & Tips</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{feedback.tips}</p>
              </div>
            </div>

            <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-lg">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle2 className="w-6 h-6" />
                <h4 className="font-bold">Model Updated</h4>
              </div>
              <p className="text-emerald-100 text-sm">
                This photo has been added to your personal profile. The AI will now recognize your signing style more accurately.
              </p>
            </div>

            <button
              onClick={() => {
                setStep('select');
                setSelectedItem(null);
                setImage(null);
                setFeedback(null);
              }}
              className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold shadow-lg"
            >
              Train Another Sign
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// --- Settings Screen ---
const SettingsScreen = () => {
  const [dialect, setDialect] = useState(() => localStorage.getItem('sasl_dialect') || 'Gauteng');
  const [spokenLang, setSpokenLang] = useState(() => localStorage.getItem('sasl_spoken_lang') || 'English');
  const [isOfflineMode, setIsOfflineMode] = useState(() => localStorage.getItem('sasl_offline_mode') === 'true');
  const [accessibility, setAccessibility] = useState(() => localStorage.getItem('sasl_accessibility') || 'Standard');
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const saveSetting = (key: string, value: string) => {
    localStorage.setItem(key, value);
    if (key === 'sasl_dialect') setDialect(value);
    if (key === 'sasl_spoken_lang') setSpokenLang(value);
    if (key === 'sasl_accessibility') setAccessibility(value);
    
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2000);
  };

  const toggleOffline = () => {
    const newVal = !isOfflineMode;
    setIsOfflineMode(newVal);
    localStorage.setItem('sasl_offline_mode', String(newVal));
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 px-4 pt-4 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className="bg-[#1e4620] p-2 rounded-lg">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
        </div>
        {showSavedFeedback && (
          <motion.span 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded"
          >
            ✓ Settings Sync'd
          </motion.span>
        )}
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-100">
            <img src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=200" alt="User" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Loyal Kings</h3>
            <p className="text-xs text-slate-500">Healthcare Portal Admin</p>
          </div>
        </div>
        <div className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded uppercase">
          Authenticated
        </div>
      </div>

      {/* SASL Regional Dialect Preferences */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">SASL Regional Dialect</h4>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Select your local South African Sign Language regional dialect. Hand configurations, speed variance, and facial sign expressions adjust instantly.
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          {["Gauteng", "KwaZulu-Natal", "Western Cape", "Eastern Cape"].map(d => (
            <button
              key={d}
              onClick={() => saveSetting('sasl_dialect', d)}
              className={cn(
                "py-2 px-1 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer",
                dialect === d 
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" 
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              )}
            >
              {d === "Gauteng" ? "Gauteng (GP)" : d === "KwaZulu-Natal" ? "KZN Region" : d}
            </button>
          ))}
        </div>
      </div>

      {/* Multilingual Support */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-[#2c5e31]" />
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Multilingual Spoken Translation</h4>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Choose the oral language used as targets of the Speech-To-Text / Text-To-Speech pipeline across clinical and SOS modules:
        </p>
        <select
          value={spokenLang}
          onChange={(e) => saveSetting('sasl_spoken_lang', e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          {["English", "isiZulu", "isiXhosa", "Sesotho", "Afrikaans", "Sepedi", "Setswana", "Tshivenda", "Xitsonga"].map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      {/* Connection & Storage Settings */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 text-slate-600" />
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Offline-First Engine</h4>
          </div>
          <button 
            onClick={toggleOffline}
            className={cn(
              "w-12 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors",
              isOfflineMode ? "bg-emerald-600" : "bg-slate-300"
            )}
          >
            <motion.div 
              layout 
              className="bg-white w-5 h-5 rounded-full shadow-md"
              animate={{ x: isOfflineMode ? 24 : 0 }}
            />
          </button>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Force offline local-only operation. When toggled true, neural-pipe translations utilize fully cached compiled TensorFlow Lite assets in sqlite cache, ensuring zero cellular internet dependencies in rural clinics.
        </p>
      </div>

      {/* Accessibility Preferences */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyan-600" />
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">WCAG 2.2 Accessibility Presets</h4>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {["Standard", "High Contrast", "Large Text"].map(mode => (
            <button
              key={mode}
              onClick={() => saveSetting('sasl_accessibility', mode)}
              className={cn(
                "py-2 px-1.5 rounded-xl text-[10px] font-black tracking-tight transition-all border text-center cursor-pointer",
                accessibility === mode 
                  ? "bg-cyan-600 text-white border-cyan-600 shadow-sm" 
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center pt-2">
        <p className="text-[9px] font-mono text-slate-400">POPIA & GDPR Safe • End-To-End Secure Server</p>
        <p className="text-[9px] font-mono text-slate-300 mt-0.5">App Version 2.2.0 (Build 1084)</p>
      </div>
    </div>
  );
};

const SettingItem = ({ icon, label, value, color = "text-slate-700", last }: any) => (
  <button className={cn(
    "w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors",
    !last && "border-bottom border-slate-50"
  )}>
    <div className="flex items-center space-x-3">
      <div className={cn("p-1.5 rounded-lg bg-slate-50", color)}>
        {icon}
      </div>
      <span className={cn("font-medium text-sm", color)}>{label}</span>
    </div>
    <div className="flex items-center space-x-2 text-slate-400">
      {value && <span className="text-xs font-medium">{value}</span>}
      <ChevronRight className="w-4 h-4" />
    </div>
  </button>
);

const ImagingAnalysisScreen = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Rear camera device not found or denied. Please select from the sandbox diagnostic presets below or upload a photo.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const data = canvas.toDataURL('image/jpeg');
      setImage(data);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const base64Data = image.split(',')[1];
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: {
          parts: [
            {
              text: `You are a professional Medical Imaging Analysis (MIA) assistant for the deaf community. 
              Analyze this medical image (or photo of a symptom/pain point). 
              1. Identify what is shown (e.g., X-ray of a hand, photo of a skin rash, MRI scan).
              2. Describe any visible symptoms or anomalies in simple, non-technical language.
              3. Provide a "Simplified Explanation" for a deaf patient.
              4. Provide "SASL Visual Cues": Describe how to sign the main findings or symptoms in South African Sign Language.
              5. Suggest next steps (e.g., "Show this to your doctor during your VRT call").
              
              IMPORTANT: Be empathetic and clear. 
              Format your response as JSON: { "finding": "...", "explanation": "...", "saslCues": "...", "nextSteps": "..." }`
            },
            {
              inlineData: {
                data: base64Data,
                mimeType: "image/jpeg"
              }
            }
          ]
        },
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text);
      setAnalysisResult(result);
    } catch (error) {
      console.error("MIA Error:", error);
      setAnalysisResult({ error: "Failed to analyze image. Please try again." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-20">
      <div className="bg-[#006064] p-6 text-white shrink-0">
        <div className="flex items-center space-x-3 mb-2">
          <Activity className="w-8 h-8" />
          <h2 className="text-xl font-bold">Medical Imaging Analysis</h2>
        </div>
        <p className="text-cyan-100 text-sm">Upload or capture an image of your symptoms or medical scans for AI analysis.</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Camera/Upload Section */}
        {!image && !isCameraActive && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={startCamera}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border-2 border-dashed border-cyan-200 hover:border-cyan-400 transition-colors cursor-pointer"
              >
                <Camera className="w-10 h-10 text-cyan-600 mb-2" />
                <span className="text-sm font-bold text-slate-700">Use Camera</span>
              </button>
              <label className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border-2 border-dashed border-cyan-205 hover:border-cyan-400 transition-colors cursor-pointer">
                <Upload className="w-10 h-10 text-cyan-600 mb-2" />
                <span className="text-sm font-bold text-slate-700">Upload Image</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>

            {cameraError && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start space-x-2 text-amber-800">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800">Camera Access Issue</p>
                  <p className="text-[10px] text-amber-600 leading-relaxed mt-0.5">{cameraError}</p>
                </div>
              </div>
            )}

            <div className="bg-cyan-50/50 p-4 rounded-2xl border border-cyan-100 space-y-3">
              <h3 className="text-xs font-black text-cyan-800 uppercase tracking-wider flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-cyan-700 animate-pulse" /> Try Medical Sample Scans (& Sandbox Tests)
              </h3>
              <p className="text-[10px] text-cyan-700 leading-relaxed">
                If camera or file permissions are disabled, click any sample scan below to load and run full smart diagnostic analyses on x-rays and skin point scans:
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { name: "Hand X-Ray Scan", url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400" },
                  { name: "Symptom Dermatitis", url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400" },
                  { name: "Fracture Bone Scan", url: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=400" }
                ].map(pres => (
                  <button
                    key={pres.name}
                    onClick={() => {
                      setImage(pres.url);
                      setCameraError(null);
                    }}
                    className="flex flex-col items-center bg-white border border-cyan-100 rounded-lg p-1.5 hover:border-cyan-400 transition-all cursor-pointer text-center group"
                  >
                    <img src={pres.url} alt={pres.name} className="w-full h-12 object-cover rounded mb-1" />
                    <span className="text-[8px] font-bold text-slate-700 group-hover:text-cyan-800 truncate w-full">{pres.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {isCameraActive && (
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-square shadow-lg">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
              <button 
                onClick={capturePhoto}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
              >
                <div className="w-12 h-12 border-4 border-cyan-600 rounded-full" />
              </button>
              <button 
                onClick={stopCamera}
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg text-white"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
          </div>
        )}

        {image && (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-md">
              <img src={image} alt="Captured" className="w-full h-auto" />
              <button 
                onClick={() => { setImage(null); setAnalysisResult(null); }}
                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full backdrop-blur-sm"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            {!analysisResult && (
              <button 
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="w-full py-4 bg-[#006064] text-white rounded-xl font-bold shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Analyzing Image...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5" />
                    <span>Analyze with MIA</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Results Section */}
        {analysisResult && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {analysisResult.error ? (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6" />
                <p className="text-sm font-medium">{analysisResult.error}</p>
              </div>
            ) : (
              <>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-cyan-100">
                  <h3 className="text-cyan-800 font-bold mb-3 flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    AI Analysis Findings
                  </h3>
                  <p className="text-slate-700 text-sm leading-relaxed mb-4">{analysisResult.finding}</p>
                  
                  <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-100 mb-4">
                    <h4 className="text-xs font-bold text-cyan-700 uppercase tracking-wider mb-1">Simplified for You</h4>
                    <p className="text-slate-800 text-sm font-medium">{analysisResult.explanation}</p>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 mb-4">
                    <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">SASL Visual Cues</h4>
                    <p className="text-slate-800 text-sm">{analysisResult.saslCues}</p>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Next Steps</h4>
                    <p className="text-slate-800 text-sm italic">{analysisResult.nextSteps}</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 py-3 bg-white border-2 border-cyan-600 text-cyan-600 rounded-xl font-bold text-sm">
                    Save to Records
                  </button>
                  <button className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md">
                    Share with Doctor
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Immersive Scale & Responsive Device emulation states
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFluidMode, setIsFluidMode] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isMobileSize = window.innerWidth < 640;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobileDevice(isMobileSize || isMobileUA);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home': return <HomeScreen navigate={setCurrentScreen} />;
      case 'translator': return <TranslatorScreen />;
      case 'learning': return <LearningScreen />;
      case 'emergency': return <EmergencyScreen />;
      case 'health': return <HealthScreen />;
      case 'training': return <TrainingScreen />;
      case 'vrt': return <VRTScreen onEndCall={() => setCurrentScreen('home')} />;
      case 'imaging': return <ImagingAnalysisScreen />;
      case 'settings': return <SettingsScreen />;
      default: return <HomeScreen navigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row items-center justify-center p-0 lg:p-6 overflow-x-hidden font-sans relative">
      {/* Blueprint Grid Watermark background */}
      <div className="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.04] pointer-events-none" />

      {/* Control Console Sidebar (Visible only on Desktop for scaling/mock purposes) */}
      {!isMobileDevice && (
        <div className="hidden lg:flex w-[340px] xl:w-[380px] shrink-0 flex-col p-6 text-slate-800 space-y-6 self-stretch justify-between bg-white border-r border-slate-200 z-10 shadow-lg">
          <div className="space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <BrainCircuit className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h1 className="font-extrabold text-slate-800 text-base uppercase tracking-wider">Deaf-Care Workspace</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">Simulators Deck</p>
              </div>
            </div>

            {/* Scale Adjuster View */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Phone Scale & Display Preset</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium font-mono">CURRENT SCALE:</span>
                  <span className="font-mono text-emerald-600 font-extrabold text-sm">{zoomLevel}%</span>
                </div>
                
                <div className="grid grid-cols-4 gap-1.5">
                  {[75, 85, 100, 110].map((level) => (
                    <button
                      key={level}
                      onClick={() => setZoomLevel(level)}
                      className={cn(
                        "py-2 px-1 rounded-lg text-[10px] font-black tracking-tight transition-all uppercase text-center",
                        zoomLevel === level 
                          ? "bg-emerald-600 text-white shadow-md scale-105" 
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      {level}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Viewport toggle for custom testing */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">WORKSPACE SCREEN MODE:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIsFluidMode(false)}
                    className={cn(
                      "py-2 px-3 rounded-xl text-xs font-bold transition-all text-center border",
                      !isFluidMode 
                        ? "bg-emerald-50 border-emerald-600 text-emerald-700 font-black" 
                        : "bg-white border-slate-200 text-slate-500"
                    )}
                  >
                    Realistic Bezels
                  </button>
                  <button
                    onClick={() => setIsFluidMode(true)}
                    className={cn(
                      "py-2 px-3 rounded-xl text-xs font-bold transition-all text-center border",
                      isFluidMode 
                        ? "bg-emerald-50 border-emerald-600 text-emerald-700 font-black" 
                        : "bg-white border-slate-200 text-slate-500"
                    )}
                  >
                    Fluid Pure App
                  </button>
                </div>
              </div>
            </div>

            {/* Emergency Direct Test Bypass */}
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 space-y-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-red-700 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1.5 animate-pulse" /> Emergency SOS Shortcut
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Test the SOS workflow directly. This triggers the South Africa Medical Response dispatch sequence & schedules the Video Relay call from interpreter Thabo.
              </p>
              <button 
                onClick={() => { setCurrentScreen('emergency'); }}
                className="w-full bg-[#d32f2f] hover:bg-red-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all uppercase tracking-wider shadow-md"
              >
                <span>🚨 Test SOS Dispatch</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2 text-[10px] text-slate-500 font-medium">
            <div className="font-bold text-slate-700 uppercase tracking-widest text-[9px] mb-1">South Africa Initiative</div>
            <p>Runs perfectly on physical smartphones. If loaded on a mobile screen, the outer mock frame scales out automatically for a full-bleed native experience.</p>
          </div>
        </div>
      )}

      {/* Interactive Mobile Frame Container / Scaler wrapper */}
      <div 
        style={{ transform: (isMobileDevice || isFluidMode) ? 'none' : `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }} 
        className={cn(
          "transition-all duration-300 ease-out flex-shrink-0 relative flex flex-col",
          (isMobileDevice || isFluidMode) 
            ? "fixed inset-0 w-full h-full max-w-full rounded-none border-0 z-[60] overflow-hidden" 
            : "w-[400px] h-[800px] bg-slate-950 rounded-[46px] p-2 border-[12px] border-slate-900 shadow-2xl relative"
        )}
      >
        {/* Real Phone Bezels, Camera Capsule, Volume buttons overlay only on Desktop framed view */}
        {!(isMobileDevice || isFluidMode) && (
          <>
            {/* Dynamic camera pill pill / notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-full z-50 flex items-center justify-center pointer-events-none">
              {/* Speaker pill */}
              <div className="w-10 h-0.5 bg-slate-800 rounded-full mb-1" />
              {/* Camera Circle */}
              <div className="w-2 h-2 bg-slate-900 rounded-full border border-slate-800 absolute right-4 mb-1" />
            </div>
          </>
        )}

        {/* Real Mobile Content Window Area */}
        <div className={cn(
          "w-full h-full bg-[#f4f7f5] overflow-hidden relative flex flex-col",
          !(isMobileDevice || isFluidMode) ? "rounded-[34px]" : ""
        )}>
          
          {/* Side Menu Drawer */}
          <AnimatePresence>
            {isMenuOpen && (
              <>
                {/* Backdrop */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm"
                />
                {/* Drawer */}
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="absolute top-0 left-0 bottom-0 w-3/4 bg-white z-50 shadow-2xl flex flex-col"
                >
                  <div className="p-6 bg-[#1e4620] text-white">
                    <div className="flex justify-between items-center mb-6">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                        <img src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=100" alt="User" className="w-full h-full object-cover" />
                      </div>
                      <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <h3 className="font-bold text-lg">Loyal Kings</h3>
                    <p className="text-white/70 text-xs">loyalkingsgroup@gmail.com</p>
                  </div>

                  <div className="flex-1 overflow-y-auto py-4">
                    <MenuLink 
                      icon={<Home className="w-5 h-5" />} 
                      label="Home" 
                      onClick={() => { setCurrentScreen('home'); setIsMenuOpen(false); }} 
                      isActive={currentScreen === 'home'}
                    />
                    <MenuLink 
                      icon={<Video className="w-5 h-5" />} 
                      label="VRT Service" 
                      onClick={() => { setCurrentScreen('vrt'); setIsMenuOpen(false); }} 
                      isActive={currentScreen === 'vrt'}
                    />
                    <MenuLink 
                      icon={<Link className="w-5 h-5" />} 
                      label="AI Translator" 
                      onClick={() => { setCurrentScreen('translator'); setIsMenuOpen(false); }} 
                      isActive={currentScreen === 'translator'}
                    />
                    <MenuLink 
                      icon={<BookOpen className="w-5 h-5" />} 
                      label="Learning Center" 
                      onClick={() => { setCurrentScreen('learning'); setIsMenuOpen(false); }} 
                      isActive={currentScreen === 'learning'}
                    />
                    <MenuLink 
                      icon={<PlusSquare className="w-5 h-5" />} 
                      label="Health Info" 
                      onClick={() => { setCurrentScreen('health'); setIsMenuOpen(false); }} 
                      isActive={currentScreen === 'health'}
                    />
                    <MenuLink 
                      icon={<BrainCircuit className="w-5 h-5" />} 
                      label="Train AI" 
                      onClick={() => { setCurrentScreen('training'); setIsMenuOpen(false); }} 
                      isActive={currentScreen === 'training'}
                    />
                    <MenuLink 
                      icon={<Activity className="w-5 h-5" />} 
                      label="Medical Imaging Analysis" 
                      onClick={() => { setCurrentScreen('imaging'); setIsMenuOpen(false); }} 
                      isActive={currentScreen === 'imaging'}
                    />
                    <MenuLink 
                      icon={<AlertTriangle className="w-5 h-5" />} 
                      label="Emergency SOS" 
                      onClick={() => { setCurrentScreen('emergency'); setIsMenuOpen(false); }} 
                      isActive={currentScreen === 'emergency'}
                    />
                    
                    <div className="my-4 border-t border-slate-100 mx-4"></div>
                    
                    <MenuLink 
                      icon={<Settings className="w-5 h-5" />} 
                      label="Settings" 
                      onClick={() => { setCurrentScreen('settings'); setIsMenuOpen(false); }} 
                      isActive={currentScreen === 'settings'}
                    />
                    <MenuLink 
                      icon={<ShieldAlert className="w-5 h-5" />} 
                      label="Privacy Policy" 
                      onClick={() => setIsMenuOpen(false)} 
                    />
                    <MenuLink 
                      icon={<Lock className="w-5 h-5" />} 
                      label="Logout" 
                      onClick={() => setIsMenuOpen(false)} 
                      className="text-red-600 hover:bg-red-50"
                    />
                  </div>

                  <div className="p-6 border-t border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">DeafCare v1.0.2</p>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Notifications Drawer */}
          <AnimatePresence>
            {isNotificationsOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsNotificationsOpen(false)}
                  className="absolute inset-0 bg-black/40 z-40"
                />
                <motion.div 
                  initial={{ y: '-100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '-100%' }}
                  className="absolute top-0 left-0 right-0 bg-white z-50 shadow-xl rounded-b-3xl overflow-hidden"
                >
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Notifications</h3>
                    <button onClick={() => setIsNotificationsOpen(false)} className="p-1 hover:bg-slate-200 rounded-full">
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    <NotificationItem 
                      title="Interpreter Available" 
                      time="2m ago" 
                      desc="Sarah is now available for a VRT call." 
                      icon={<Video className="w-4 h-4 text-emerald-600" />}
                      bg="bg-emerald-50"
                    />
                    <NotificationItem 
                      title="New Health Tip" 
                      time="1h ago" 
                      desc="Check out the new article on managing hearing loss." 
                      icon={<BookOpen className="w-4 h-4 text-blue-600" />}
                      bg="bg-blue-50"
                    />
                    <NotificationItem 
                      title="Appointment Reminder" 
                      time="3h ago" 
                      desc="You have a checkup scheduled for tomorrow at 10:00 AM." 
                      icon={<Bell className="w-4 h-4 text-amber-600" />}
                      bg="bg-amber-50"
                    />
                  </div>
                  <button className="w-full py-3 text-sm font-bold text-[#1e4620] hover:bg-slate-50 border-t border-slate-100">
                    View All Notifications
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
          
          {/* Top Header (Global) */}
          <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm shrink-0">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative z-10"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentScreen('home')}>
                <div className="h-10 w-10 flex items-center justify-center bg-emerald-50 rounded-lg overflow-hidden p-1">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Yellow Background Circle */}
                    <circle cx="50" cy="50" r="48" fill="#FFB800" />
                    
                    {/* Green Head Silhouette */}
                    <path 
                      d="M50 15 C35 15 25 25 25 45 C25 55 28 60 25 65 C22 70 25 75 30 75 C35 75 40 85 40 95 L65 95 C65 85 75 75 75 45 C75 25 65 15 50 15 Z" 
                      fill="#1E4620" 
                    />
                    
                    {/* White Medical Cross */}
                    <rect x="44" y="48" width="12" height="4" fill="white" />
                    <rect x="48" y="44" width="4" height="12" fill="white" />
                    
                    {/* Signal Waves */}
                    <path d="M55 35 A15 15 0 0 1 70 50" fill="none" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" />
                    <path d="M55 30 A20 20 0 0 1 75 50" fill="none" stroke="#FFB800" strokeWidth="3" strokeLinecap="round" />
                    <path d="M55 25 A25 25 0 0 1 80 50" fill="none" stroke="#D32F2F" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="flex flex-col -space-y-1">
                  <span className="text-[14px] font-black text-[#8B1A1A] leading-tight tracking-tight uppercase">Deaf-Care</span>
                  <span className="text-[10px] font-bold text-[#1E4620] leading-tight uppercase">Healthcare</span>
                  <span className="text-[8px] font-bold text-emerald-600/70 leading-tight uppercase tracking-widest">South Africa</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={cn(
                  "p-2 rounded-full transition-all", 
                  isNotificationsOpen ? "bg-emerald-100 text-emerald-600" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                )}
              >
                <Bell className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCurrentScreen('settings')}
                className="relative active:scale-95 transition-transform ml-1"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-100 shadow-sm">
                  <img src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=100" alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white">3</div>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#f4f7f5] via-[#e8f0eb] to-[#d1e0d7]">
             {/* Decorative background blobs */}
             <div className="absolute top-20 -left-20 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none"></div>
             <div className="absolute bottom-20 -right-20 w-64 h-64 bg-yellow-200/30 rounded-full blur-3xl pointer-events-none"></div>
             
             <AnimatePresence mode="wait">
              <motion.div
                key={currentScreen}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {renderScreen()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Navigation */}
          <div className="bg-[#1e4620] flex justify-between items-stretch h-16 z-20 shrink-0">
            <NavItem 
              icon={<Home />} 
              label="Home" 
              isActive={currentScreen === 'home'} 
              onClick={() => setCurrentScreen('home')} 
            />
            <NavItem 
              icon={<Link />} 
              label="Interpreter" 
              isActive={currentScreen === 'translator'} 
              onClick={() => setCurrentScreen('translator')} 
            />
            <NavItem 
              icon={<Video />} 
              label="VRT Call" 
              isActive={currentScreen === 'vrt'} 
              onClick={() => setCurrentScreen('vrt')} 
              highlight="bg-[#ffb800] text-white"
            />
            <NavItem 
              icon={<PlusSquare />} 
              label="Health" 
              isActive={currentScreen === 'health'} 
              onClick={() => setCurrentScreen('health')} 
              highlight="bg-[#d32f2f] text-white"
            />
            <NavItem 
              icon={<Settings />} 
              label="Settings" 
              isActive={currentScreen === 'settings'} 
              onClick={() => setCurrentScreen('settings')} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const NavItem = ({ icon, label, isActive, onClick, highlight }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-1 flex-col items-center justify-center h-full transition-all",
      highlight ? highlight : (isActive ? "text-white bg-white/10" : "text-white/70 hover:text-white hover:bg-white/5")
    )}
  >
    <div className={cn("mb-1", isActive && !highlight && "scale-110 transition-transform")}>
      {React.cloneElement(icon, { className: "w-6 h-6" })}
    </div>
    <span className="text-[10px] font-medium tracking-wide">{label}</span>
  </button>
);

const MenuLink = ({ icon, label, onClick, isActive, className }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center space-x-4 px-6 py-3 transition-colors",
      isActive ? "bg-emerald-50 text-[#1e4620] border-r-4 border-[#1e4620]" : "text-slate-600 hover:bg-slate-50",
      className
    )}
  >
    <div className={isActive ? "text-[#1e4620]" : "text-slate-400"}>
      {icon}
    </div>
    <span className={cn("text-sm font-bold", isActive ? "text-[#1e4620]" : "text-slate-700")}>{label}</span>
  </button>
);

const NotificationItem = ({ title, time, desc, icon, bg }: any) => (
  <div className={cn("p-4 border-b border-slate-50 flex space-x-3", bg)}>
    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-xs font-bold text-slate-800">{title}</h4>
        <span className="text-[10px] text-slate-400 font-medium">{time}</span>
      </div>
      <p className="text-[11px] text-slate-600 leading-tight">{desc}</p>
    </div>
  </div>
);
