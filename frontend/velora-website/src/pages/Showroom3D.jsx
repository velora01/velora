import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Sparkles, Move3d, Compass, RefreshCw, Calendar, 
  Eye, HelpCircle, X, Info, ShieldCheck, Layers, Palette, Columns
} from "lucide-react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const SOFA_COLORS = [
  { 
    id: "cream", 
    label: "Royal Bouclé Cream", 
    hex: "#f5f2eb", 
    roughness: 0.9, 
    metalness: 0.01, 
    clearcoat: 0.0, 
    sheen: 0.45, 
    sheenColor: "#ffffff", 
    sheenRoughness: 0.85 
  },
  { 
    id: "emerald", 
    label: "Minotti Emerald Velvet", 
    hex: "#102f27", 
    roughness: 0.75, 
    metalness: 0.01, 
    clearcoat: 0.0, 
    sheen: 1.0, 
    sheenColor: "#4ca68c", 
    sheenRoughness: 0.35 
  },
  { 
    id: "charcoal", 
    label: "Midnight Linen Charcoal", 
    hex: "#242527", 
    roughness: 0.95, 
    metalness: 0.01, 
    clearcoat: 0.0, 
    sheen: 0.3, 
    sheenColor: "#808080", 
    sheenRoughness: 0.9 
  },
  { 
    id: "cognac", 
    label: "Poliform Cognac Leather", 
    hex: "#753d1c", 
    roughness: 0.32, 
    metalness: 0.02, 
    clearcoat: 0.75, 
    sheen: 0.05, 
    sheenColor: "#ffffff", 
    sheenRoughness: 0.15 
  },
  { 
    id: "burgundy", 
    label: "B&B Burgundy Velvet", 
    hex: "#450f16", 
    roughness: 0.8, 
    metalness: 0.01, 
    clearcoat: 0.0, 
    sheen: 1.0, 
    sheenColor: "#bb606c", 
    sheenRoughness: 0.3 
  },
];

const HOTSPOTS_DATA = [
  {
    title: "Minotti-Inspired Seating Profile",
    materials: "Premium High-Sheen Bouclé & Tan Calfskin Base Trim",
    density: "Multi-Density Ergonomic High-Resilience Foam Structure (42 kg/m³)",
    warranty: "10 Years Structural Frame Warranty",
    customization: "Configurable Modular Layouts & Custom Thread Stitching",
    tier: "Signature Bespoke Tier"
  },
  {
    title: "Solid Walnut Floating Baseboard",
    materials: "Kiln-Dried FSC Walnut / Matte Black Nickel Steel Feet",
    density: "Reinforced Solid Hardwood Tenon-and-Mortise Baseboard Jointing",
    warranty: "5 Years Wood Frame Base Warp Warranty",
    tier: "Master Craftsman Series"
  },
  {
    title: "Tailored Blanket & Accent Layering",
    materials: "Superfine Cashmere Throw / Natural Goose Down Cushion Core",
    density: "70/30 Goose Down/Feather Blended Comfort Wrap Layering",
    warranty: "2 Years Outer Fabric Wear Guarantee",
    tier: "Luxury Accent Line"
  }
];

const Showroom3D = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  
  const [selectedColor, setSelectedColor] = useState(SOFA_COLORS[0]);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const mouseRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragRotationRef = useRef({ x: 0, y: 0 });
  const scrollPercentRef = useRef(0);

  const animProxyRef = useRef({
    explode: 0,
    sofaRotY: 0.35,
    roomOpacity: 0.01,
    cameraX: 0.7,
    cameraY: 0.55,
    cameraZ: 4.5,
    lookX: -0.55,
    lookY: 0.05,
    lookZ: 0,
  });

  useEffect(() => {
    // ----------------------------------------------------
    // LENIS SMOOTH MOMENTUM SCROLL
    // ----------------------------------------------------
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    const lenisTick = (time) => {
      lenis.raf(time);
      requestAnimationFrame(lenisTick);
    };
    requestAnimationFrame(lenisTick);

    // ----------------------------------------------------
    // THREE.JS SETUP
    // ----------------------------------------------------
    const container = canvasRef.current.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f2efea");
    scene.fog = new THREE.FogExp2("#f2efea", 0.08);

    const camera = new THREE.PerspectiveCamera(width / height < 1.0 ? 48 : 38, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 4.5);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // ----------------------------------------------------
    // PROCEDURAL ENVIRONMENT MAP FOR REFLECTIONS
    // ----------------------------------------------------
    const createProceduralEnvMap = () => {
      const envCanvas = document.createElement("canvas");
      envCanvas.width = 1024;
      envCanvas.height = 512;
      const envCtx = envCanvas.getContext("2d");

      // Warm sky to cool ground gradient
      const envGrad = envCtx.createLinearGradient(0, 0, 0, 512);
      envGrad.addColorStop(0.0, "#111420"); // Dark sky
      envGrad.addColorStop(0.25, "#1c2135");
      envGrad.addColorStop(0.48, "#eedec7"); // Sunset gold horizon
      envGrad.addColorStop(0.5, "#ffffff");  // Horizon light
      envGrad.addColorStop(0.52, "#e5dec9");
      envGrad.addColorStop(0.75, "#2b2319"); // Deep warm floor glow
      envGrad.addColorStop(1.0, "#0e0906");  // Dark ground
      envCtx.fillStyle = envGrad;
      envCtx.fillRect(0, 0, 1024, 512);

      // Main window light source (simulates architectural window)
      envCtx.fillStyle = "rgba(255, 248, 235, 0.95)";
      envCtx.fillRect(450, 140, 120, 120);
      envCtx.strokeStyle = "rgba(255,255,255,0.4)";
      envCtx.lineWidth = 4;
      envCtx.strokeRect(450, 140, 120, 120);

      // Secondary window light source (blueish skylight fill)
      envCtx.fillStyle = "rgba(220, 235, 255, 0.6)";
      envCtx.fillRect(80, 100, 140, 240);

      const envTex = new THREE.CanvasTexture(envCanvas);
      envTex.mapping = THREE.EquirectangularReflectionMapping;
      envTex.colorSpace = THREE.SRGBColorSpace;
      return envTex;
    };
    const envMap = createProceduralEnvMap();
    scene.environment = envMap;

    // ----------------------------------------------------
    // CINEMATIC LIGHTING
    // ----------------------------------------------------
    const ambientLight = new THREE.AmbientLight("#ffffff", 0.35);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight("#ffe4ca", 2.0);
    sunLight.position.set(6, 12, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0001;
    sunLight.shadow.radius = 4; // Softer shadows
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 28;
    sunLight.shadow.camera.left = -6;
    sunLight.shadow.camera.right = 6;
    sunLight.shadow.camera.top = 6;
    sunLight.shadow.camera.bottom = -6;
    scene.add(sunLight);

    const warmHalo = new THREE.PointLight("#ffb973", 2.2, 9);
    warmHalo.position.set(0, 1.3, -1.9);
    scene.add(warmHalo);

    const softBounce = new THREE.DirectionalLight("#b8d6e6", 0.5);
    softBounce.position.set(-6, 3, -4);
    scene.add(softBounce);

    const lampLight = new THREE.PointLight("#ffd19d", 2.4, 6);
    lampLight.position.set(0.9, 0.75, 0.3);
    scene.add(lampLight);

    // Warm dramatic spotlight focused on sofa
    const spotLight = new THREE.SpotLight("#fff5e6", 3.0, 12, Math.PI / 5, 0.5, 0.8);
    spotLight.position.set(2, 4.5, 2.5);
    spotLight.castShadow = true;
    spotLight.shadow.bias = -0.0001;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    scene.add(spotLight);

    // ----------------------------------------------------
    // PROCEDURAL TEXTURES (PBR Normal & Specular)
    // ----------------------------------------------------
    const createFabricNormalMap = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#8080ff";
      ctx.fillRect(0, 0, 256, 256);
      const imgData = ctx.getImageData(0, 0, 256, 256);
      const data = imgData.data;
      for (let y = 0; y < 256; y++) {
        for (let x = 0; x < 256; x++) {
          const idx = (y * 256 + x) * 4;
          const weaveX = Math.sin(x * 1.8) * 12;
          const weaveY = Math.sin(y * 1.8) * 12;
          const noise = (Math.random() - 0.5) * 6;
          data[idx] = Math.max(0, Math.min(255, 128 + weaveX + noise));
          data[idx + 1] = Math.max(0, Math.min(255, 128 + weaveY + noise));
          data[idx + 2] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(12, 12);
      return texture;
    };
    const fabricNormalMap = createFabricNormalMap();

    const createMarbleTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");
      
      // Luxury warm-white base
      ctx.fillStyle = "#faf9f5";
      ctx.fillRect(0, 0, 1024, 1024);

      // Tile joint lines (light grid)
      ctx.strokeStyle = "rgba(200, 195, 185, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, 1024, 1024);
      ctx.beginPath();
      ctx.moveTo(512, 0); ctx.lineTo(512, 1024);
      ctx.moveTo(0, 512); ctx.lineTo(1024, 512);
      ctx.stroke();

      // Vein generator function
      const drawVein = (color, startX, startY, len, width, complexity) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        let cx = startX;
        let cy = startY;
        ctx.moveTo(cx, cy);
        for (let i = 0; i < len; i += 15) {
          cx += (Math.random() - 0.5) * complexity;
          cy += (Math.random() - 0.45) * 15; // drift downwards
          if (cx < 0 || cx > 1024 || cy < 0 || cy > 1024) break;
          ctx.lineTo(cx, cy);
        }
        ctx.stroke();
      };

      // Draw soft wide smoke-grey veins (underlay)
      for (let k = 0; k < 6; k++) {
        drawVein("rgba(140, 140, 148, 0.03)", Math.random() * 1024, 0, 80, 24, 30);
      }

      // Draw sharp charcoal-grey veins
      for (let k = 0; k < 12; k++) {
        drawVein("rgba(80, 80, 85, 0.08)", Math.random() * 1024, 0, 120, 2.5, 18);
      }

      // Draw elegant luxury gold/bronze veins
      for (let k = 0; k < 8; k++) {
        drawVein("rgba(201, 162, 39, 0.16)", Math.random() * 1024, 0, 100, 1.8, 12);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(2, 2);
      return texture;
    };
    const marbleTexture = createMarbleTexture();

    const createWoodTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");

      // Deep rich walnut base
      ctx.fillStyle = "#3a2517";
      ctx.fillRect(0, 0, 512, 256);

      // Fine organic lines
      for (let y = 0; y < 256; y += 1.5) {
        const offset = Math.sin(y * 0.04) * 20 + Math.sin(y * 0.1) * 8;
        const opacity = 0.04 + Math.abs(Math.sin(y * 0.2)) * 0.08;
        ctx.fillStyle = `rgba(25, 12, 5, ${opacity})`;
        ctx.fillRect(0, y + (offset % 10), 512, 1.5);
      }

      // Knots
      ctx.strokeStyle = "rgba(20, 8, 2, 0.04)";
      ctx.lineWidth = 1.0;
      for (let i = 0; i < 2; i++) {
        const kx = Math.random() * 512;
        const ky = Math.random() * 256;
        for (let r = 8; r < 40; r += 6) {
          ctx.beginPath();
          ctx.ellipse(kx, ky, r * 3, r, Math.PI / 10, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(3, 1);
      return texture;
    };
    const woodTexture = createWoodTexture();

    const createAbstractArtTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#e5e2d9";
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = "rgba(0,0,0,0.03)";
      for (let i = 0; i < 512; i += 6) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
      }
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(256, 280, 130, Math.PI, 0);
      ctx.stroke();
      ctx.strokeStyle = "#2b2c2e";
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.moveTo(80, 440);
      ctx.quadraticCurveTo(256, 160, 432, 400);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.beginPath();
      ctx.arc(360, 180, 50, 0, Math.PI * 2);
      ctx.fill();
      return new THREE.CanvasTexture(canvas);
    };
    const artTexture = createAbstractArtTexture();

    // ----------------------------------------------------
    // GEOMETRY GENERATORS (Crowned organic cushions)
    // ----------------------------------------------------
    const createOrganicCushionGeometry = (w, h, d, crown = 0.045, wrinkle = 0.008) => {
      const geometry = new THREE.BoxGeometry(w, h, d, 18, 18, 18);
      const pos = geometry.attributes.position;
      const hw = w / 2;
      const hh = h / 2;
      const hd = d / 2;

      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);

        // Deform Y faces (crown top and bottom)
        if (Math.abs(y - hh) < 0.005) {
          const fx = Math.cos((x / hw) * (Math.PI / 2));
          const fz = Math.cos((z / hd) * (Math.PI / 2));
          const bulge = fx * fz * crown;
          const wrinkleVal = Math.sin(x * 24) * Math.sin(z * 24) * wrinkle * (1 - fx * fz);
          pos.setY(i, y + bulge + wrinkleVal);
        } else if (Math.abs(y + hh) < 0.005) {
          const fx = Math.cos((x / hw) * (Math.PI / 2));
          const fz = Math.cos((z / hd) * (Math.PI / 2));
          const bulge = fx * fz * (crown * 0.4);
          pos.setY(i, y - bulge);
        }

        // Deform Z faces (front and back)
        if (Math.abs(z - hd) < 0.005) {
          const fx = Math.cos((x / hw) * (Math.PI / 2));
          const fy = Math.cos((y / hh) * (Math.PI / 2));
          pos.setZ(i, z + fx * fy * (crown * 0.5));
        } else if (Math.abs(z + hd) < 0.005) {
          const fx = Math.cos((x / hw) * (Math.PI / 2));
          const fy = Math.cos((y / hh) * (Math.PI / 2));
          pos.setZ(i, z - fx * fy * (crown * 0.5));
        }

        // Deform X faces (sides)
        if (Math.abs(x - hw) < 0.005) {
          const fy = Math.cos((y / hh) * (Math.PI / 2));
          const fz = Math.cos((z / hd) * (Math.PI / 2));
          pos.setX(i, x + fy * fz * (crown * 0.5));
        } else if (Math.abs(x + hw) < 0.005) {
          const fy = Math.cos((y / hh) * (Math.PI / 2));
          const fz = Math.cos((z / hd) * (Math.PI / 2));
          pos.setX(i, x - fy * fz * (crown * 0.5));
        }
      }
      geometry.computeVertexNormals();
      return geometry;
    };

    const createPipingGeometry = (w, d, r = 0.05, pipeRadius = 0.007) => {
      const points = [];
      const segments = 12;
      const hw = w / 2 - r;
      const hd = d / 2 - r;

      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * (Math.PI / 2);
        points.push(new THREE.Vector3(hw + r * Math.cos(theta), 0, hd + r * Math.sin(theta)));
      }
      for (let j = 0; j <= segments; j++) {
        const theta = (Math.PI / 2) + (j / segments) * (Math.PI / 2);
        points.push(new THREE.Vector3(-hw + r * Math.cos(theta), 0, hd + r * Math.sin(theta)));
      }
      for (let j = 0; j <= segments; j++) {
        const theta = Math.PI + (j / segments) * (Math.PI / 2);
        points.push(new THREE.Vector3(-hw + r * Math.cos(theta), 0, -hd + r * Math.sin(theta)));
      }
      for (let j = 0; j <= segments; j++) {
        const theta = (1.5 * Math.PI) + (j / segments) * (Math.PI / 2);
        points.push(new THREE.Vector3(hw + r * Math.cos(theta), 0, -hd + r * Math.sin(theta)));
      }
      points.push(points[0].clone());

      const curve = new THREE.CatmullRomCurve3(points);
      return new THREE.TubeGeometry(curve, 64, pipeRadius, 6, true);
    };

     // ----------------------------------------------------
    // MATERIALS
    // ----------------------------------------------------
    const fabricMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(selectedColor.hex),
      roughness: selectedColor.roughness,
      metalness: selectedColor.metalness,
      clearcoat: selectedColor.clearcoat,
      clearcoatRoughness: 0.35,
      sheen: selectedColor.sheen || 0.8,
      sheenColor: new THREE.Color(selectedColor.sheenColor || "#ffffff"),
      sheenRoughness: selectedColor.sheenRoughness || 0.4,
      normalMap: fabricNormalMap,
      normalScale: new THREE.Vector2(0.35, 0.35),
    });

    const woodMaterial = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.5,
      metalness: 0.02,
    });

    const goldMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#d4af37"),
      metalness: 0.95,
      roughness: 0.15,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
    });

    const blackMetalMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#161618"),
      metalness: 0.85,
      roughness: 0.3,
    });

    const leatherMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#653c23"),
      roughness: 0.28,
      metalness: 0.04,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
    });

    const floorMaterial = new THREE.MeshStandardMaterial({
      map: marbleTexture,
      roughness: 0.08,
      metalness: 0.02,
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#e2f1f8"),
      transparent: true,
      opacity: 0.2,
      transmission: 0.95,
      roughness: 0.05,
      ior: 1.5,
      thickness: 0.15,
    });

    const marbleTableMaterial = new THREE.MeshStandardMaterial({
      map: marbleTexture,
      roughness: 0.12,
      metalness: 0.02,
    });

    const rugMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#dfd9c5"),
      roughness: 0.95,
      sheen: 0.7,
      sheenColor: new THREE.Color("#ffffff"),
      normalMap: fabricNormalMap,
      normalScale: new THREE.Vector2(0.2, 0.2),
    });

    const blanketMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#3c3d42"),
      roughness: 0.9,
      sheen: 0.8,
      sheenColor: new THREE.Color("#ffffff"),
      normalMap: fabricNormalMap,
      normalScale: new THREE.Vector2(0.4, 0.4),
    });

    const creamPillowMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#ebe6db"),
      roughness: 0.85,
      sheen: 0.6,
      normalMap: fabricNormalMap,
      normalScale: new THREE.Vector2(0.25, 0.25),
    });

    const shadowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#0c0c0d"),
      transparent: true,
      opacity: 0.45,
    });

    // ----------------------------------------------------
    // BUILD SOFA GEOMETRIES
    // ----------------------------------------------------
    const sofaGroup = new THREE.Group();

    // Walnut base boards
    const baseLGeo = new THREE.BoxGeometry(2.8, 0.1, 1.4);
    const baseL = new THREE.Mesh(baseLGeo, woodMaterial);
    baseL.position.set(-0.6, -0.4, 0);
    baseL.castShadow = true; baseL.receiveShadow = true;
    sofaGroup.add(baseL);

    const baseRGeo = new THREE.BoxGeometry(1.2, 0.1, 2.0);
    const baseR = new THREE.Mesh(baseRGeo, woodMaterial);
    baseR.position.set(1.2, -0.4, 0.3);
    baseR.castShadow = true; baseR.receiveShadow = true;
    sofaGroup.add(baseR);

    // Slim metal legs
    const legsGroup = new THREE.Group();
    const legGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.25, 12);
    const legCapGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.015, 12);
    const legPositions = [
      [-1.8, -0.525, 0.5], [-1.8, -0.525, -0.5],
      [0.4, -0.525, 0.5], [0.4, -0.525, -0.5],
      [1.6, -0.525, 1.1], [1.6, -0.525, -0.5]
    ];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, blackMetalMaterial);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      const cap = new THREE.Mesh(legCapGeo, goldMaterial);
      cap.position.set(0, -0.12, 0);
      leg.add(cap);
      legsGroup.add(leg);
    });
    sofaGroup.add(legsGroup);

    // Leather accent armrest shells
    const armrestLGeo = new THREE.BoxGeometry(0.14, 0.62, 1.36);
    const armrestL = new THREE.Mesh(armrestLGeo, leatherMaterial);
    armrestL.position.set(-1.96, 0.05, 0.0);
    armrestL.castShadow = true; armrestL.receiveShadow = true;
    sofaGroup.add(armrestL);

    const armrestRGeo = new THREE.BoxGeometry(0.14, 0.62, 1.36);
    const armrestR = new THREE.Mesh(armrestRGeo, leatherMaterial);
    armrestR.position.set(1.86, 0.05, 0.0);
    armrestR.castShadow = true; armrestR.receiveShadow = true;
    sofaGroup.add(armrestR);

    // Backrest supports
    const backFrameGeo = new THREE.BoxGeometry(3.6, 0.62, 0.12);
    const backFrame = new THREE.Mesh(backFrameGeo, fabricMaterial);
    backFrame.position.set(0, 0.22, -0.66);
    backFrame.castShadow = true; backFrame.receiveShadow = true;
    sofaGroup.add(backFrame);

    // Cushions (Organic displacement)
    const seatL1Geo = createOrganicCushionGeometry(1.36, 0.32, 1.28);
    const seatL1 = new THREE.Mesh(seatL1Geo, fabricMaterial);
    seatL1.position.set(-1.25, -0.18, 0.02);
    seatL1.castShadow = true; seatL1.receiveShadow = true;
    sofaGroup.add(seatL1);

    const seatL2Geo = createOrganicCushionGeometry(1.36, 0.32, 1.28);
    const seatL2 = new THREE.Mesh(seatL2Geo, fabricMaterial);
    seatL2.position.set(0.1, -0.18, 0.02);
    seatL2.castShadow = true; seatL2.receiveShadow = true;
    sofaGroup.add(seatL2);

    const seatRGeo = createOrganicCushionGeometry(1.16, 0.32, 1.88);
    const seatR = new THREE.Mesh(seatRGeo, fabricMaterial);
    seatR.position.set(1.2, -0.18, 0.32);
    seatR.castShadow = true; seatR.receiveShadow = true;
    sofaGroup.add(seatR);

    // Adding seam piping details
    const pipeL1 = new THREE.Mesh(createPipingGeometry(1.36, 1.28), leatherMaterial);
    pipeL1.position.y = 0.16;
    seatL1.add(pipeL1);

    const pipeL2 = new THREE.Mesh(createPipingGeometry(1.36, 1.28), leatherMaterial);
    pipeL2.position.y = 0.16;
    seatL2.add(pipeL2);

    const pipeR = new THREE.Mesh(createPipingGeometry(1.16, 1.88, 0.05), leatherMaterial);
    pipeR.position.y = 0.16;
    seatR.add(pipeR);

    // Backrest Cushions
    const backLGeo = createOrganicCushionGeometry(1.36, 0.54, 0.26);
    const backL = new THREE.Mesh(backLGeo, fabricMaterial);
    backL.position.set(-1.25, 0.24, -0.5);
    backL.rotation.x = -0.06;
    backL.castShadow = true; backL.receiveShadow = true;
    sofaGroup.add(backL);

    const backCGeo = createOrganicCushionGeometry(1.36, 0.54, 0.26);
    const backC = new THREE.Mesh(backCGeo, fabricMaterial);
    backC.position.set(0.1, 0.24, -0.5);
    backC.rotation.x = -0.06;
    backC.castShadow = true; backC.receiveShadow = true;
    sofaGroup.add(backC);

    const backRGeo = createOrganicCushionGeometry(1.16, 0.54, 0.26);
    const backR = new THREE.Mesh(backRGeo, fabricMaterial);
    backR.position.set(1.2, 0.24, -0.5);
    backR.rotation.x = -0.06;
    backR.castShadow = true; backR.receiveShadow = true;
    sofaGroup.add(backR);

    // Pillows
    const pillowLGeo = createOrganicCushionGeometry(0.46, 0.46, 0.18, 0.035, 0.005);
    const pillowL = new THREE.Mesh(pillowLGeo, creamPillowMaterial);
    pillowL.position.set(0.1, 0.18, 0.12);
    pillowL.rotation.set(0.1, 0.25, 0.08);
    pillowL.castShadow = true;
    seatL1.add(pillowL);

    const pillowRGeo = createOrganicCushionGeometry(0.48, 0.32, 0.14, 0.03, 0.004);
    const pillowR = new THREE.Mesh(pillowRGeo, blanketMaterial);
    pillowR.position.set(0.0, 0.16, 0.3);
    pillowR.rotation.set(0.15, -0.15, -0.05);
    pillowR.castShadow = true;
    seatR.add(pillowR);

    // Draped Blanket
    const blanketUpperGeo = new THREE.BoxGeometry(0.68, 0.52, 0.02);
    const blanketUpper = new THREE.Mesh(blanketUpperGeo, blanketMaterial);
    blanketUpper.position.set(0.1, 0.26, -0.38);
    blanketUpper.rotation.x = -0.14;
    blanketUpper.castShadow = true;
    sofaGroup.add(blanketUpper);

    const blanketLowerGeo = new THREE.BoxGeometry(0.68, 0.02, 0.42);
    const blanketLower = new THREE.Mesh(blanketLowerGeo, blanketMaterial);
    blanketLower.position.set(0.1, -0.04, -0.16);
    blanketLower.rotation.x = 0.06;
    blanketLower.castShadow = true;
    sofaGroup.add(blanketLower);

    const blanketFrontGeo = new THREE.BoxGeometry(0.68, 0.24, 0.02);
    const blanketFront = new THREE.Mesh(blanketFrontGeo, blanketMaterial);
    blanketFront.position.set(0.1, -0.15, 0.05);
    blanketFront.rotation.x = 0.1;
    blanketFront.castShadow = true;
    sofaGroup.add(blanketFront);

    // Crevice shadow bars
    const shadowL = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.24, 1.2), shadowMaterial);
    shadowL.position.set(-0.6, -0.14, 0.02);
    sofaGroup.add(shadowL);

    const shadowR = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.24, 1.8), shadowMaterial);
    shadowR.position.set(0.6, -0.14, 0.32);
    sofaGroup.add(shadowR);

    scene.add(sofaGroup);

    // ----------------------------------------------------
    // ROOM ENVIRONMENT
    // ----------------------------------------------------
    const roomGroup = new THREE.Group();

    // Marble floor tile
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.85;
    floor.receiveShadow = true;
    scene.add(floor);

    // Wall Panel Structure
    const wallPanelsGroup = new THREE.Group();
    const panelGeo = new THREE.BoxGeometry(0.72, 4.6, 0.06);
    const panelMaterial = new THREE.MeshStandardMaterial({ color: "#e8e5dc", roughness: 0.85 });
    const positions = [-2.4, -1.6, -0.8, 0.0, 0.8, 1.6, 2.4];
    positions.forEach((px) => {
      const panel = new THREE.Mesh(panelGeo, panelMaterial);
      panel.position.set(px, 1.45, -1.8);
      panel.castShadow = true; panel.receiveShadow = true;
      // Add a gold divider strip next to the panel
      const divider = new THREE.Mesh(new THREE.BoxGeometry(0.015, 4.6, 0.02), goldMaterial);
      divider.position.set(px + 0.36, 1.45, -1.78);
      wallPanelsGroup.add(divider);
      wallPanelsGroup.add(panel);
    });
    roomGroup.add(wallPanelsGroup);

    // Modern Rug
    const rug = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.015, 4.0), rugMaterial);
    rug.position.set(0.85, -0.842, 0.4);
    rug.receiveShadow = true;
    roomGroup.add(rug);

    // Abstract Art Frame & Canvas
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 0.04), goldMaterial);
    frame.position.set(0, 1.25, -1.72);
    frame.castShadow = true;
    const canvasMat = new THREE.MeshStandardMaterial({ map: artTexture, roughness: 0.9 });
    const canvasMesh = new THREE.Mesh(new THREE.BoxGeometry(1.54, 1.04, 0.02), canvasMat);
    canvasMesh.position.z = 0.015;
    frame.add(canvasMesh);
    roomGroup.add(frame);

    // Coffee table
    const tableGroup = new THREE.Group();
    tableGroup.position.set(1.4, -0.58, 1.1);

    const tableBase = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.24, 0.48), goldMaterial);
    tableBase.position.y = 0.12;
    tableBase.castShadow = true;
    tableGroup.add(tableBase);

    const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.035, 32), marbleTableMaterial);
    tableTop.position.y = 0.26;
    tableTop.castShadow = true; tableTop.receiveShadow = true;
    tableGroup.add(tableTop);

    // Decor books
    const bookMat = new THREE.MeshStandardMaterial({ color: "#2d2d30", roughness: 0.7 });
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.03, 0.18), bookMat);
    book.position.set(-0.12, 0.295, 0.08);
    book.castShadow = true;
    tableGroup.add(book);

    // Fluted glass vase
    const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.24, 16), glassMaterial);
    vase.position.set(0.16, 0.4, -0.08);
    vase.castShadow = true;
    tableGroup.add(vase);

    // Stem/branches
    const branchCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.06, 0.12, 0.01),
      new THREE.Vector3(0.18, 0.26, -0.04),
      new THREE.Vector3(0.35, 0.38, -0.08)
    ]);
    const branch = new THREE.Mesh(new THREE.TubeGeometry(branchCurve, 12, 0.01, 6, false), woodMaterial);
    branch.position.set(0.16, 0.52, -0.08);
    branch.castShadow = true;
    tableGroup.add(branch);
    roomGroup.add(tableGroup);

    // Floor lamp
    const lampGroup = new THREE.Group();
    lampGroup.position.set(0.2, -0.85, -0.9);
    
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.025, 24), marbleTableMaterial);
    lampBase.position.y = 0.012;
    lampBase.castShadow = true;
    lampGroup.add(lampBase);

    const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.8, 12), goldMaterial);
    lampPole.position.set(0, 0.9, 0);
    lampPole.castShadow = true;
    lampGroup.add(lampPole);

    const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.6, 12), goldMaterial);
    lampArm.rotation.z = Math.PI / 2;
    lampArm.position.set(0.28, 1.8, 0);
    lampArm.castShadow = true;
    lampGroup.add(lampArm);

    const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.14, 24), goldMaterial);
    lampShade.position.set(0.58, 1.68, 0);
    lampShade.castShadow = true;
    
    const lampGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.015, 16), new THREE.MeshBasicMaterial({ color: "#ffe7ba" }));
    lampGlow.position.set(0, -0.07, 0);
    lampShade.add(lampGlow);
    lampGroup.add(lampShade);

    roomGroup.add(lampGroup);
    scene.add(roomGroup);

    // Window shade frame mask casting grid shadow
    const windowFrame = new THREE.Group();
    windowFrame.position.set(5.2, 9.2, 4.8);
    windowFrame.lookAt(0, 0, 0);
    const windowBorderMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const vM = new THREE.Mesh(new THREE.BoxGeometry(0.05, 5.0, 0.05), windowBorderMat);
    const hM = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.05, 0.05), windowBorderMat);
    windowFrame.add(vM); windowFrame.add(hM);
    scene.add(windowFrame);

    // Floating gold glitter dust
    const pCount = 120;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      pPositions[i] = (Math.random() - 0.5) * 10;
      pPositions[i + 1] = (Math.random() - 0.5) * 5 + 1;
      pPositions[i + 2] = (Math.random() - 0.5) * 8;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    
    const pCanvas = document.createElement("canvas");
    pCanvas.width = 16; pCanvas.height = 16;
    const pCtx = pCanvas.getContext("2d");
    const rad = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
    rad.addColorStop(0, "rgba(212,175,55,1)");
    rad.addColorStop(1, "rgba(212,175,55,0)");
    pCtx.fillStyle = rad; pCtx.fillRect(0, 0, 16, 16);
    
    const pMaterial = new THREE.PointsMaterial({
      color: "#ffd700", size: 0.038, transparent: true, opacity: 0.45,
      map: new THREE.CanvasTexture(pCanvas), depthWrite: false,
    });
    const particles = new THREE.Points(pGeo, pMaterial);
    scene.add(particles);

    // ----------------------------------------------------
    // GSAP SCROLL TIMELINE BINDINGS
    // ----------------------------------------------------
    const animProxy = animProxyRef.current;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".showroom-scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
        onUpdate: (self) => setScrollProgress(self.progress),
      }
    });

    tl.to(animProxy, {
      cameraX: 1.1, cameraY: 0.35, cameraZ: 2.3,
      lookX: -0.2, lookY: -0.1, lookZ: 0.1,
      duration: 1.2, ease: "sine.inOut"
    }, 0)
    .to(animProxy, {
      sofaRotY: 0.75,
      cameraX: 0.9, cameraY: 0.5, cameraZ: 2.6,
      lookX: -0.25, lookY: -0.05, lookZ: 0.1,
      duration: 1.2, ease: "sine.inOut"
    }, 1.2)
    .to(animProxy, {
      explode: 1.0,
      cameraX: 0.65, cameraY: 0.95, cameraZ: 3.3,
      lookX: -0.3, lookY: 0.05, lookZ: 0,
      duration: 1.5, ease: "power2.inOut"
    }, 2.4)
    .to(animProxy, {
      explode: 0.0,
      roomOpacity: 1.0,
      cameraX: -0.25, cameraY: 0.75, cameraZ: 4.0,
      lookX: -0.95, lookY: -0.04, lookZ: 0.12,
      duration: 1.5, ease: "power2.inOut"
    }, 3.9)
    .to(animProxy, {
      cameraX: -0.75, cameraY: 1.15, cameraZ: 4.85,
      lookX: -1.35, lookY: -0.1, lookZ: 0.0,
      duration: 1.2, ease: "sine.inOut"
    }, 5.4);

    // ----------------------------------------------------
    // ANIMATED RENDER LOOP
    // ----------------------------------------------------
    let reqId;
    const tempCam = new THREE.Vector3();
    const tempLook = new THREE.Vector3();
    const tempVector = new THREE.Vector3();

    const loop = () => {
      reqId = requestAnimationFrame(loop);
      const time = Date.now();

      // Breathing animation
      sofaGroup.position.y = Math.sin(time * 0.001) * 0.02;

      // Parallax mouse follow
      const pmX = mouseRef.current.x * 0.12;
      const pmY = mouseRef.current.y * 0.08;

      if (scrollPercentRef.current < 0.84) {
        dragRotationRef.current.x += (0 - dragRotationRef.current.x) * 0.06;
        dragRotationRef.current.y += (0 - dragRotationRef.current.y) * 0.06;
      }

      sofaGroup.rotation.y = animProxy.sofaRotY + dragRotationRef.current.y + pmX;
      sofaGroup.rotation.x = dragRotationRef.current.x + pmY;

      // Explode displacement calculation
      const exp = animProxy.explode;
      seatL1.position.set(-1.25, -0.18 + exp * 0.6, 0.02 + exp * 0.3);
      seatL2.position.set(0.1, -0.18 + exp * 0.6, 0.02 + exp * 0.3);
      seatR.position.set(1.2, -0.18 + exp * 0.6, 0.32 + exp * 0.6);
      
      backL.position.set(-1.25, 0.24 + exp * 0.5, -0.5 - exp * 0.4);
      backC.position.set(0.1, 0.24 + exp * 0.5, -0.5 - exp * 0.4);
      backR.position.set(1.2, 0.24 + exp * 0.5, -0.5 - exp * 0.4);

      backFrame.position.set(0, 0.22 - exp * 0.3, -0.66 - exp * 0.5);
      armrestL.position.set(-1.96 - exp * 0.5, 0.05 - exp * 0.2, 0.0);
      armrestR.position.set(1.86 + exp * 0.5, 0.05 - exp * 0.2, 0.0);

      baseL.position.y = -0.4 - exp * 0.25;
      baseR.position.y = -0.4 - exp * 0.25;
      legsGroup.position.y = -exp * 0.35;

      blanketUpper.position.set(0.1, 0.26 + exp * 0.55, -0.38 - exp * 0.35);
      blanketLower.position.set(0.1, -0.04 + exp * 0.6, -0.16 - exp * 0.08);
      blanketFront.position.set(0.1, -0.15 + exp * 0.6, 0.05 + exp * 0.08);

      pillowL.position.y = 0.18 + Math.sin(time * 0.0014) * 0.012;
      pillowR.position.y = 0.16 + Math.sin(time * 0.0012) * 0.014;

      // Animate Room opacity slide in
      roomGroup.position.y = (1.0 - animProxy.roomOpacity) * -1.8;
      rug.material.opacity = animProxy.roomOpacity;
      rug.material.transparent = true;

      // Subtle breeze on plants & sway on lamp shade
      branch.rotation.z = Math.sin(time * 0.0012) * 0.025;
      lampShade.rotation.z = Math.sin(time * 0.0006) * 0.02;

      // Particles float with organic rising and sway
      const posArr = particles.geometry.attributes.position.array;
      for (let i = 0; i < pCount; i++) {
        const idx = i * 3;
        posArr[idx + 1] += 0.0018; // rise
        if (posArr[idx + 1] > 4) {
          posArr[idx + 1] = -1.5;
          posArr[idx] = (Math.random() - 0.5) * 10;
          posArr[idx + 2] = (Math.random() - 0.5) * 8;
        }
        posArr[idx] += Math.sin(time * 0.0008 + i) * 0.0012; // sway
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y = time * 0.000015;

      // Lerp color Configurator with physical attributes
      const targetC = new THREE.Color(selectedColor.hex);
      fabricMaterial.color.lerp(targetC, 0.055);
      fabricMaterial.roughness = THREE.MathUtils.lerp(fabricMaterial.roughness, selectedColor.roughness, 0.055);
      fabricMaterial.metalness = THREE.MathUtils.lerp(fabricMaterial.metalness, selectedColor.metalness, 0.055);
      fabricMaterial.clearcoat = THREE.MathUtils.lerp(fabricMaterial.clearcoat, selectedColor.clearcoat, 0.055);
      fabricMaterial.sheen = THREE.MathUtils.lerp(fabricMaterial.sheen, selectedColor.sheen || 0.8, 0.055);
      const targetSheenC = new THREE.Color(selectedColor.sheenColor || "#ffffff");
      fabricMaterial.sheenColor.lerp(targetSheenC, 0.055);
      fabricMaterial.sheenRoughness = THREE.MathUtils.lerp(fabricMaterial.sheenRoughness, selectedColor.sheenRoughness || 0.4, 0.055);

      // Camera position update
      tempCam.set(animProxy.cameraX, animProxy.cameraY, animProxy.cameraZ);
      tempLook.set(animProxy.lookX, animProxy.lookY, animProxy.lookZ);
      camera.position.copy(tempCam);
      camera.lookAt(tempLook);

      renderer.render(scene, camera);

      // Hotspots matrix projection onto right section coordinates
      const w = container.clientWidth;
      const h = container.clientHeight;
      const targets = [
        { mesh: seatL2, offset: new THREE.Vector3(0.0, 0.2, 0.2) },
        { mesh: legsGroup, offset: new THREE.Vector3(1.6, -0.525, 1.1) },
        { mesh: backR, offset: new THREE.Vector3(0.0, 0.3, 0.1) }
      ];
      targets.forEach((target, idx) => {
        const el = document.getElementById(`hotspot-studio-${idx}`);
        if (el) {
          tempVector.copy(target.offset).applyMatrix4(target.mesh.matrixWorld);
          tempVector.project(camera);
          const sx = (tempVector.x * 0.5 + 0.5) * w;
          const sy = (-(tempVector.y * 0.5) + 0.5) * h;
          el.style.transform = `translate(-50%, -50%) translate(${sx}px, ${sy}px)`;
          const shown = tempVector.z <= 1 && scrollProgress >= 0.38 && scrollProgress <= 1.0;
          el.style.opacity = shown ? 1 : 0;
          el.style.pointerEvents = shown ? "auto" : "none";
        }
      });
    };
    loop();

    // ----------------------------------------------------
    // RESIZE & INTERACTION EVENT LISTENERS
    // ----------------------------------------------------
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      if (w / h < 1.0) {
        camera.fov = 48; // Pull back slightly on mobile
      } else {
        camera.fov = 38;
      }
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const onMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      if (isDraggingRef.current && scrollPercentRef.current > 0.84) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        dragRotationRef.current.y += dx * 0.006;
        dragRotationRef.current.x = Math.max(-0.4, Math.min(0.5, dragRotationRef.current.x + dy * 0.006));
        dragStartRef.current.x = e.clientX;
        dragStartRef.current.y = e.clientY;
      }
    };

    const onMouseDown = (e) => {
      if (scrollPercentRef.current > 0.84) {
        isDraggingRef.current = true;
        dragStartRef.current.x = e.clientX;
        dragStartRef.current.y = e.clientY;
      }
    };

    const onMouseUp = () => { isDraggingRef.current = false; };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(reqId);

      ScrollTrigger.getAll().forEach(t => t.kill());
      scene.traverse((obj) => {
        if (!obj.isMesh) return;
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      fabricNormalMap.dispose();
      marbleTexture.dispose();
      woodTexture.dispose();
      envMap.dispose();
      artTexture.dispose();
      renderer.dispose();
    };
  }, [selectedColor]);

  useEffect(() => {
    const onScroll = () => {
      const sh = document.documentElement.scrollHeight - window.innerHeight;
      if (sh > 0) scrollPercentRef.current = window.scrollY / sh;
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getCardStyle = (center) => {
    const dist = scrollProgress - center;
    let opacity = 0;
    if (center === 0) opacity = Math.max(0, 1 - scrollProgress * 4.5);
    else if (center === 0.25 || center === 0.5 || center === 0.75) {
      opacity = Math.max(0, 1 - Math.abs(dist) * 4.8);
    } else if (center === 1) opacity = Math.max(0, 1 + dist * 4.5);
    
    const ty = dist * -110;
    const shown = opacity > 0.01;
    return {
      opacity,
      transform: `translate3d(0, ${ty}px, 0)`,
      pointerEvents: shown ? "auto" : "none",
      display: shown ? "block" : "none",
    };
  };

  return (
    <div className="relative min-h-[500vh] bg-[#f2efea] text-zinc-900 selection:bg-[#c9a227]/30 font-sans overflow-x-hidden">
      
      {/* 3D CANVAS VIEWPORT */}
      <div 
        className="fixed inset-0 w-full h-full z-0"
        style={{ pointerEvents: scrollProgress >= 0.8 && scrollProgress <= 1.0 ? "auto" : "none" }}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_35%,rgba(242,239,234,0.8)_100%)] pointer-events-none" />
      </div>

      {/* FLOATING PULSING GOLD HOTSPOTS */}
      <div className="fixed inset-0 pointer-events-none z-20">
        {[0, 1, 2].map((idx) => (
          <div
            key={idx}
            id={`hotspot-studio-${idx}`}
            className="absolute transition-opacity duration-300 pointer-events-auto"
            style={{ opacity: 0 }}
          >
            <button
              onClick={() => setSelectedSpec(HOTSPOTS_DATA[idx])}
              onMouseEnter={() => setActiveHotspot(idx)}
              onMouseLeave={() => setActiveHotspot(null)}
              className="w-7 h-7 rounded-full bg-white/90 border border-[#c9a227]/50 flex items-center justify-center shadow-xl cursor-pointer transform hover:scale-125 transition-transform duration-300 backdrop-blur-md relative"
              aria-label="View specs details"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[#c9a227]" />
              <div className="absolute inset-0 rounded-full border-2 border-[#c9a227] animate-ping opacity-60 pointer-events-none" />
            </button>
          </div>
        ))}
      </div>

      {/* TECH SPECS DETAIL GLASSMODAL */}
      <AnimatePresence>
        {selectedSpec && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-white/70 border border-white/60 p-8 rounded-3xl shadow-2xl backdrop-blur-2xl relative text-left"
            >
              <button 
                onClick={() => setSelectedSpec(null)} 
                className="absolute right-5 top-5 p-1.5 rounded-full bg-zinc-200/50 hover:bg-zinc-200 text-zinc-600 transition"
              >
                <X size={15} />
              </button>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a227]/10 text-[9px] font-bold uppercase tracking-widest text-[#c9a227] mb-5">
                <Info size={11} />
                Technical Specification
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-4">{selectedSpec.title}</h3>
              
              <div className="flex flex-col gap-4 text-xs text-zinc-700 font-medium">
                <div className="flex items-start gap-3 border-b border-zinc-200/50 pb-3">
                  <Layers className="text-[#c9a227] shrink-0" size={15} />
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Materials & Texture</span>
                    <span>{selectedSpec.materials}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-b border-zinc-200/50 pb-3">
                  <Columns className="text-[#c9a227] shrink-0" size={15} />
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Inner Core Comfort</span>
                    <span>{selectedSpec.density}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pb-1">
                  <ShieldCheck className="text-[#c9a227] shrink-0" size={15} />
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Guarantee</span>
                    <span>{selectedSpec.warranty}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-zinc-200/80 flex items-center justify-between">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Collection Tier</span>
                  <span className="text-base font-bold text-[#c9a227]">{selectedSpec.tier}</span>
                </div>
                <button 
                  onClick={() => {
                    setSelectedSpec(null);
                    navigate("/consultation", { state: { customizedFurniture: selectedSpec.title } });
                  }}
                  className="bg-[#c9a227] hover:bg-[#b08c1e] text-white text-[10px] uppercase tracking-widest font-bold py-2.5 px-4 rounded-xl transition shadow-md hover:shadow-[#c9a227]/20"
                >
                  Acquire Design
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEFT-SIDE VERTICAL PROGRESS DOTS */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-6 z-40">
        {[0, 1, 2, 3, 4].map((idx) => {
          const centers = [0.0, 0.25, 0.5, 0.75, 1.0];
          const labels = ["Overview", "Craftsmanship", "Bespoke Details", "Harmony Setup", "Interactive Studio"];
          const isActive = scrollProgress >= centers[idx] - 0.12 && scrollProgress < (centers[idx + 1] || 1.1) - 0.12;
          return (
            <div 
              key={idx} 
              className="flex items-center gap-3.5 group cursor-pointer" 
              onClick={() => {
                const targetScroll = centers[idx] * (document.documentElement.scrollHeight - window.innerHeight);
                window.scrollTo({ top: targetScroll, behavior: "smooth" });
              }}
            >
              <div className={`h-2 rounded-full transition-all duration-500 ${
                isActive ? "w-8 bg-[#c9a227]" : "w-2.5 bg-zinc-400 group-hover:bg-zinc-600"
              }`} />
              <span className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-300 ${
                isActive ? "text-[#c9a227] translate-x-1" : "text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
              }`}>
                {labels[idx]}
              </span>
            </div>
          );
        })}
      </div>

      {/* SCROLL CONTAINER SPAWN OVERLAYS (LEFT ALIGNED) */}
      <div className="showroom-scroll-container absolute inset-x-0 top-0 h-[500vh] pointer-events-none z-10 w-full">
        
        {/* SECTION 0: OVERVIEW */}
        <section className="h-screen w-full flex items-center justify-start px-6 md:px-24">
          <div style={getCardStyle(0.0)} className="w-full max-w-md md:max-w-xl mx-auto md:mx-0 text-left bg-white/70 border border-white/60 p-6 md:p-10 rounded-3xl shadow-xl backdrop-blur-xl pointer-events-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-zinc-200 text-[10px] font-bold uppercase tracking-[0.25em] text-[#c9a227] mb-6 shadow-sm backdrop-blur-md">
              <Move3d size={13} className="animate-pulse text-[#c9a227]" />
              Luxury Crafted Interiors
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.1]">
              Designed For <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-[#c9a227] to-amber-700">
                Timeless Living
              </span>
            </h1>

            <p className="text-zinc-600 text-sm sm:text-base mb-8 leading-relaxed max-w-lg font-medium">
              Experience handcrafted furniture and bespoke interiors with immersive 3D visualization before you build.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-12">
              <button 
                onClick={() => {
                  const targetScroll = 0.25 * (document.documentElement.scrollHeight - window.innerHeight);
                  window.scrollTo({ top: targetScroll, behavior: "smooth" });
                }}
                className="bg-[#c9a227] hover:bg-[#b08c1e] text-white font-bold py-3.5 px-7 rounded-xl flex items-center justify-center gap-2 transition duration-300 text-[11px] uppercase tracking-widest shadow-md"
              >
                Explore Collection
                <ArrowRight size={14} />
              </button>
              <button 
                onClick={() => navigate("/consultation")}
                className="bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 font-bold py-3.5 px-7 rounded-xl flex items-center justify-center gap-2 transition duration-300 text-[11px] uppercase tracking-widest shadow-sm"
              >
                Book Design Consultation
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-zinc-200/80 pt-6">
              <div>
                <span className="block text-2xl font-bold text-zinc-900">2500+</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Projects Done</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-zinc-900">15 Years</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Of Craftsmanship</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-zinc-900">98%</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Happy Clients</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-zinc-900">50+</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Lead Designers</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: CRAFTSMANSHIP */}
        <section className="h-screen w-full flex items-center justify-start px-6 md:px-24">
          <div style={getCardStyle(0.25)} className="w-full max-w-md md:max-w-xl mx-auto md:mx-0 text-left bg-white/70 border border-white/60 p-6 md:p-8 rounded-3xl shadow-xl backdrop-blur-xl pointer-events-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a227]/10 text-[10px] font-bold uppercase tracking-widest text-[#c9a227] mb-5">
              <Sparkles size={11} />
              Material Craftsmanship
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-5 leading-tight">
              Premium Texture, Refined Finishes
            </h2>
            
            <p className="text-zinc-600 text-xs sm:text-sm mb-6 leading-relaxed font-medium">
              Every detail is meticulously refined. Explore organic crowned cushions, cognac leather details, and solid walnut wooden baseboards.
            </p>

            <div className="grid grid-cols-2 gap-4 border-t border-zinc-200/80 pt-6">
              <div>
                <h4 className="text-[10px] uppercase tracking-wider text-[#c9a227] font-bold mb-1">Cushion Crown</h4>
                <p className="text-xs text-zinc-500 font-medium">Procedural vertex displacements bulge the cushions outwards for a plush feel.</p>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-wider text-[#c9a227] font-bold mb-1">Fine Piping</h4>
                <p className="text-xs text-zinc-500 font-medium">Detailed leather trim lining runs along all seams to define luxury borders.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: DECONSTRUCTED DETAILS */}
        <section className="h-screen w-full flex items-center justify-start px-6 md:px-24">
          <div style={getCardStyle(0.5)} className="w-full max-w-md md:max-w-xl mx-auto md:mx-0 text-left bg-white/70 border border-white/60 p-6 md:p-8 rounded-3xl shadow-xl backdrop-blur-xl pointer-events-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a227]/10 text-[10px] font-bold uppercase tracking-widest text-[#c9a227] mb-5">
              <Compass size={11} />
              Structural Integrity
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-5 leading-tight">
              Bespoke Engineering
            </h2>
            
            <p className="text-zinc-600 text-xs sm:text-sm mb-6 leading-relaxed font-medium">
              Deconstruct modular luxury. Cushion segments, throw pillows, wood baseboards, armrests, and steel columns separate to reveal the internal framework.
            </p>

            <div className="flex flex-col gap-3.5 border-t border-zinc-200/80 pt-5 text-xs text-zinc-600 font-medium">
              <div className="flex justify-between items-center py-1 border-b border-zinc-100">
                <span>Cushion Displacement</span>
                <span className="font-bold text-zinc-800">Vertical Offset 60cm</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-100">
                <span>Hardwood Baseboard</span>
                <span className="font-bold text-zinc-800">FSC Solid Walnut Board</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Support Connectors</span>
                <span className="font-bold text-[#c9a227]">Brushed Gold Steel Caps</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: HARMONY SETUP */}
        <section className="h-screen w-full flex items-center justify-start px-6 md:px-24">
          <div style={getCardStyle(0.75)} className="w-full max-w-md md:max-w-xl mx-auto md:mx-0 text-left bg-white/70 border border-white/60 p-6 md:p-8 rounded-3xl shadow-xl backdrop-blur-xl pointer-events-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a227]/10 text-[10px] font-bold uppercase tracking-widest text-[#c9a227] mb-5">
              <RefreshCw size={11} />
              Cohesive Harmony
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-5 leading-tight">
              The Complete Room
            </h2>
            
            <p className="text-zinc-600 text-xs sm:text-sm mb-6 leading-relaxed font-medium">
              Our elements co-exist in perfect unity. Watch the showroom fill as the Calacatta marble table, custom lounge chair, and arched brass floor lamp slide into place.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-[10px] tracking-widest uppercase font-bold text-[#c9a227] border-t border-zinc-200/80 pt-5">
              <span>Sectional</span>
              <span>•</span>
              <span>Marble Table</span>
              <span>•</span>
              <span>Wall Panel</span>
              <span>•</span>
              <span>Floor Lamp</span>
            </div>
          </div>
        </section>

        {/* SECTION 4: INTERACTIVE CONFIGURATOR */}
        <section className="h-screen w-full flex items-center justify-start px-6 md:px-24 relative">
          <div style={getCardStyle(1.0)} className="w-full max-w-md md:max-w-lg mx-auto md:mx-0 text-left bg-white/80 border border-[#c9a227]/25 p-6 md:p-8 rounded-3xl shadow-xl backdrop-blur-2xl pointer-events-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a227]/10 text-[10px] font-bold uppercase tracking-widest text-[#c9a227] mb-5">
              <Eye size={11} />
              Studio Configurator
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-2">
              Configure Your Design
            </h2>
            
            <p className="text-zinc-500 text-xs mb-6 leading-relaxed font-medium flex items-center gap-1.5">
              <HelpCircle size={13} className="text-[#c9a227]" />
              Click color swatches to update the sofa. Click and drag anywhere on the screen to rotate the 3D room.
            </p>

            {/* COLOR PICKER SWATCHES */}
            <div className="mb-8">
              <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-3 block">
                Fabric Material Color
              </label>
              <div className="flex flex-wrap gap-3">
                {SOFA_COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color.hex }}
                    aria-label={`Select ${color.label}`}
                    className={`w-9 h-9 rounded-full border-2 transition-all duration-300 relative ${
                      selectedColor.id === color.id
                        ? "border-[#c9a227] scale-110 shadow-[0_0_12px_rgba(201,162,39,0.3)]"
                        : "border-transparent hover:scale-105 hover:border-zinc-400"
                    }`}
                  >
                    {selectedColor.id === color.id && (
                      <span className="absolute inset-0.5 rounded-full border border-white pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-3 text-[10px] text-[#c9a227] font-bold tracking-widest uppercase">
                Selected Fabric: {selectedColor.label}
              </div>
            </div>

            <div className="flex flex-col gap-3.5 pt-4 border-t border-zinc-200/80">
              <button 
                onClick={() => navigate("/consultation", { state: { customizedFurniture: `Sectional Sofa in ${selectedColor.label}` } })}
                className="w-full bg-[#c9a227] hover:bg-[#b08c1e] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition duration-300 text-xs uppercase tracking-widest group shadow-md hover:shadow-[#c9a227]/20"
              >
                <Calendar size={15} />
                Book Consultation with this design
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </section>

      </div>
      
    </div>
  );
};

export default Showroom3D;
