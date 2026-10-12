import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Compass,
  Play,
  RotateCcw,
  X,
  Car,
  Volume2,
  VolumeX,
  ExternalLink,
  MapPin,
  Sparkles,
  Sun,
  CloudRain,
  Wind
} from 'lucide-react';
import { UYO_LANDMARKS } from '../data/gameData';
import { Landmark } from '../types/game';

interface UyoLiveSimulationModalProps {
  isOpen: boolean;
  initialLandmarkId?: string | null;
  onClose: () => void;
  onDriveToLandmark?: (landmark: Landmark) => void;
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const UyoLiveSimulationModal: React.FC<UyoLiveSimulationModalProps> = ({
  isOpen,
  initialLandmarkId,
  onClose,
  onDriveToLandmark,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const labelsLayerRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState(17.5);
  const [weather, setWeather] = useState<'clear' | 'rain' | 'harmattan'>('clear');
  const [simSpeed, setSimSpeed] = useState(1);
  const [autoTour, setAutoTour] = useState(false);
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string | null>(null);

  // HUD Metrics
  const [clockStr, setClockStr] = useState('17:30');
  const [phaseStr, setPhaseStr] = useState('Golden hour');
  const [tempStr, setTempStr] = useState('29°C');
  const [citizensCount, setCitizensCount] = useState('1,218,400');
  const [vehiclesCount, setVehiclesCount] = useState('18,200');

  // Simulation State Refs for requestAnimationFrame loop
  const simStateRef = useRef<{
    timeOfDay: number;
    weather: 'clear' | 'rain' | 'harmattan';
    simSpeed: number;
    autoTour: boolean;
    flyTo?: (id: string) => void;
    resetView?: () => void;
    startTour?: () => void;
    stopTour?: () => void;
  }>({
    timeOfDay: 17.5,
    weather: 'clear',
    simSpeed: 1,
    autoTour: false,
  });

  // Keep state refs in sync
  useEffect(() => {
    simStateRef.current.timeOfDay = timeOfDay;
  }, [timeOfDay]);

  useEffect(() => {
    simStateRef.current.weather = weather;
  }, [weather]);

  useEffect(() => {
    simStateRef.current.simSpeed = simSpeed;
  }, [simSpeed]);

  useEffect(() => {
    simStateRef.current.autoTour = autoTour;
  }, [autoTour]);

  // Main Three.js simulation instance
  useEffect(() => {
    if (!isOpen || !canvasWrapRef.current || !labelsLayerRef.current) return;

    let isDisposed = false;
    const canvasWrap = canvasWrapRef.current;
    const labelLayer = labelsLayerRef.current;

    // Palette (Akwa Ibom green / orange / white)
    const C = {
      green: 0x1fc16b,
      orange: 0xf26522,
      amber: 0xff8c42,
      white: 0xf4f1ea,
      ground: 0x24452e,
      asphalt: 0x23262d,
      lane: 0xe9e2c8,
      water: 0x2a7f9e,
    };

    const rand = mulberry32(20260409);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setSize(canvasWrap.clientWidth, canvasWrap.clientHeight, false);
    canvasWrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x9fc7e0, 260, 820);

    const camera = new THREE.PerspectiveCamera(42, canvasWrap.clientWidth / canvasWrap.clientHeight, 1, 3000);
    camera.position.set(260, 210, 300);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI * 0.46;
    controls.minDistance = 35;
    controls.maxDistance = 720;
    controls.target.set(0, 0, 0);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;

    // Lighting
    const hemi = new THREE.HemisphereLight(0xcfe8ff, 0x2c4a2f, 0.6);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff1d6, 2.2);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera;
    sc.left = -420;
    sc.right = 420;
    sc.top = 420;
    sc.bottom = -420;
    sc.near = 10;
    sc.far = 1400;
    sun.shadow.bias = -0.0006;
    scene.add(sun, sun.target);

    const moon = new THREE.DirectionalLight(0x8fa8ff, 0);
    moon.position.set(-300, 400, -200);
    scene.add(moon);

    // Sky Dome
    const skyUniforms = {
      top: { value: new THREE.Color(0x3d8fd6) },
      bottom: { value: new THREE.Color(0xcfe6f2) },
    };
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(1600, 32, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: skyUniforms,
        vertexShader:
          'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader:
          'uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main(){ float h = clamp(vP.y*1.6+0.15,0.0,1.0); gl_FragColor = vec4(mix(bottom, top, h),1.0); }',
      })
    );
    scene.add(sky);

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starPos: number[] = [];
    for (let i = 0; i < 900; i++) {
      const t = rand() * Math.PI * 2;
      const p = rand() * Math.PI * 0.45;
      starPos.push(1400 * Math.sin(p) * Math.cos(t), 1400 * Math.cos(p), 1400 * Math.sin(p) * Math.sin(t));
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2.2,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0,
      fog: false,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // Ground
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(1200, 64),
      new THREE.MeshStandardMaterial({ color: C.ground, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Arterial Roads
    const ROADS = [
      { name: 'Itu Road', angle: 62, len: 520, width: 14, dir: new THREE.Vector3() },
      { name: 'Nwaniba Road', angle: 8, len: 560, width: 14, dir: new THREE.Vector3() },
      { name: 'Oron Road', angle: -38, len: 540, width: 16, dir: new THREE.Vector3() },
      { name: 'Aka Road', angle: -92, len: 500, width: 12, dir: new THREE.Vector3() },
      { name: 'Abak Road', angle: -145, len: 540, width: 14, dir: new THREE.Vector3() },
      { name: 'Ikot Ekpene Road', angle: 158, len: 540, width: 14, dir: new THREE.Vector3() },
      { name: 'Wellington Bassey Way', angle: 112, len: 360, width: 12, dir: new THREE.Vector3() },
    ];
    const PLAZA_R = 34;
    const RING_R = 300;
    const roadMat = new THREE.MeshStandardMaterial({ color: C.asphalt, roughness: 0.92 });
    const laneMat = new THREE.MeshBasicMaterial({ color: C.lane });
    const roadGroup = new THREE.Group();
    scene.add(roadGroup);

    const dirOf = (deg: number) => {
      const a = THREE.MathUtils.degToRad(deg);
      return new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
    };

    ROADS.forEach((r) => {
      const d = dirOf(r.angle);
      r.dir = d;
      const mid = d.clone().multiplyScalar(PLAZA_R + r.len / 2);
      const road = new THREE.Mesh(new THREE.PlaneGeometry(r.len, r.width), roadMat);
      road.rotation.x = -Math.PI / 2;
      road.rotation.z = THREE.MathUtils.degToRad(r.angle);
      road.position.set(mid.x, 0.05, mid.z);
      road.receiveShadow = true;
      roadGroup.add(road);

      // Center dashed lines
      for (let s = PLAZA_R + 8; s < PLAZA_R + r.len; s += 14) {
        const dash = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.5), laneMat);
        dash.rotation.x = -Math.PI / 2;
        dash.rotation.z = road.rotation.z;
        const p = d.clone().multiplyScalar(s);
        dash.position.set(p.x, 0.08, p.z);
        roadGroup.add(dash);
      }
    });

    // Ring Road
    const ring = new THREE.Mesh(new THREE.RingGeometry(RING_R - 6, RING_R + 6, 128), roadMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.04;
    ring.receiveShadow = true;
    roadGroup.add(ring);

    // Helpers
    const distToRoads = (x: number, z: number) => {
      let min = Infinity;
      const p = new THREE.Vector2(x, z);
      const rr = Math.abs(p.length() - RING_R);
      if (rr < min) min = rr;
      ROADS.forEach((r) => {
        const d = new THREE.Vector2(r.dir.x, r.dir.z);
        const t = THREE.MathUtils.clamp(p.dot(d), 0, PLAZA_R + r.len);
        const dist = p.clone().sub(d.multiplyScalar(t)).length();
        if (dist < min) min = dist;
      });
      return min;
    };

    const landmarks: Array<{
      id: string;
      name: string;
      tag: string;
      desc: string;
      group: THREE.Group;
      pos: THREE.Vector3;
      view: { dist: number; h: number };
      labelY?: number;
      el?: HTMLButtonElement;
    }> = [];

    const reserved: Array<{ x: number; z: number; r: number }> = [];
    const reserve = (x: number, z: number, r: number) => reserved.push({ x, z, r });
    const isReserved = (x: number, z: number, pad = 0) =>
      reserved.some((c) => (x - c.x) ** 2 + (z - c.z) ** 2 < (c.r + pad) ** 2);

    const std = (color: number, opts: THREE.MeshStandardMaterialParameters = {}) =>
      new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.05, ...opts });
    const add = <T extends THREE.Object3D>(parent: THREE.Object3D, mesh: T, shadow = true): T => {
      if (shadow && mesh instanceof THREE.Mesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
      parent.add(mesh);
      return mesh;
    };

    const nightGlowMats: THREE.MeshStandardMaterial[] = [];
    function glowMat(color: number, intensity = 1.6) {
      const m = new THREE.MeshStandardMaterial({
        color: 0x111111,
        emissive: color,
        emissiveIntensity: 0,
        roughness: 0.4,
      });
      m.userData.nightIntensity = intensity;
      nightGlowMats.push(m);
      return m;
    }

    function registerLandmark(
      id: string,
      name: string,
      tag: string,
      desc: string,
      group: THREE.Group,
      pos: { x: number; z: number },
      view: { dist: number; h: number }
    ) {
      group.position.set(pos.x, 0, pos.z);
      scene.add(group);
      landmarks.push({
        id,
        name,
        tag,
        desc,
        group,
        pos: new THREE.Vector3(pos.x, 0, pos.z),
        view,
      });
    }

    // 1. Landmark: Ibom Plaza
    {
      const g = new THREE.Group();
      add(g, new THREE.Mesh(new THREE.CylinderGeometry(PLAZA_R, PLAZA_R, 0.6, 64), roadMat));
      const lawn = add(g, new THREE.Mesh(new THREE.CylinderGeometry(PLAZA_R - 7, PLAZA_R - 7, 0.9, 64), std(0x3f8a4a)));
      lawn.position.y = 0.2;
      const paving = add(g, new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 1.1, 48), std(0xd9d2c3)));
      paving.position.y = 0.3;

      // Greco-Roman colonnade
      const colMat = std(C.white, { roughness: 0.5 });
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const col = add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 9, 12), colMat));
        col.position.set(Math.cos(a) * 12, 5.3, Math.sin(a) * 12);
      }
      const entab = add(g, new THREE.Mesh(new THREE.TorusGeometry(12, 1, 8, 48), colMat));
      entab.rotation.x = Math.PI / 2;
      entab.position.y = 10.2;

      // Fountain
      const basin = add(g, new THREE.Mesh(new THREE.CylinderGeometry(6, 6.5, 1.4, 32), colMat));
      basin.position.y = 1.2;
      const water = add(
        g,
        new THREE.Mesh(new THREE.CylinderGeometry(5.4, 5.4, 0.3, 32), std(C.water, { roughness: 0.1, metalness: 0.3 })),
        false
      );
      water.position.y = 1.85;
      const jet = add(
        g,
        new THREE.Mesh(
          new THREE.ConeGeometry(1.1, 7, 16, 1, true),
          new THREE.MeshStandardMaterial({
            color: 0xbfe9ff,
            transparent: true,
            opacity: 0.55,
            emissive: 0x2a9fd6,
            emissiveIntensity: 0.2,
          })
        ),
        false
      );
      jet.position.y = 5.4;
      g.userData.jet = jet;

      // Uplights
      const lightMat = glowMat(C.amber, 2.4);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + 0.2;
        const l = add(g, new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 8), lightMat), false);
        l.position.set(Math.cos(a) * 17, 1.2, Math.sin(a) * 17);
      }
      registerLandmark(
        'plaza',
        'Ibom Plaza',
        'Civic',
        'The heart of Uyo where the city’s great roads meet — colonnades, fountains and festive nights.',
        g,
        { x: 0, z: 0 },
        { dist: 95, h: 55 }
      );
      reserve(0, 0, PLAZA_R + 6);
    }

    // 2. Landmark: Godswill Akpabio International Stadium (Nest of Champions)
    {
      const g = new THREE.Group();
      const bowlMat = std(0xe8e6e1, { roughness: 0.55 });
      const pitch = add(g, new THREE.Mesh(new THREE.BoxGeometry(56, 0.6, 36), std(0x2f9b4a)));
      pitch.position.y = 0.4;
      const track = add(g, new THREE.Mesh(new THREE.CylinderGeometry(42, 42, 0.4, 64), std(0xb4432b)));
      track.scale.z = 0.72;
      track.position.y = 0.25;

      for (let t = 0; t < 4; t++) {
        const tier = add(
          g,
          new THREE.Mesh(new THREE.CylinderGeometry(48 + t * 5, 46 + t * 5, 5, 64, 1, true), bowlMat)
        );
        tier.scale.z = 0.75;
        tier.position.y = 2.5 + t * 4.5;
        tier.material.side = THREE.DoubleSide;
      }

      const roof = add(
        g,
        new THREE.Mesh(new THREE.TorusGeometry(64, 3.2, 10, 80), std(C.green, { metalness: 0.4, roughness: 0.35 }))
      );
      roof.rotation.x = Math.PI / 2;
      roof.scale.y = 0.75;
      roof.position.y = 22;

      const roofInner = add(
        g,
        new THREE.Mesh(new THREE.TorusGeometry(56, 1.4, 8, 80), std(C.orange, { metalness: 0.4, roughness: 0.35 }))
      );
      roofInner.rotation.x = Math.PI / 2;
      roofInner.scale.y = 0.75;
      roofInner.position.y = 23;

      // Floodlights
      const mastMat = std(0x9aa0a8, { metalness: 0.6 });
      const floodMat = glowMat(0xfff6dc, 3.2);
      [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ].forEach(([sx, sz]) => {
        const m = add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 34, 8), mastMat));
        m.position.set(sx * 66, 17, sz * 48);
        const f = add(g, new THREE.Mesh(new THREE.BoxGeometry(6, 3, 1), floodMat), false);
        f.position.set(sx * 66, 34, sz * 48);
        f.lookAt(0, 0, 0);
      });

      const pos = dirOf(10).multiplyScalar(205).add(new THREE.Vector3(0, 0, 70));
      registerLandmark(
        'stadium',
        'Nest of Champions',
        'Sports',
        'Godswill Akpabio International Stadium — a 30,000-seat bowl, home of the Super Eagles’ electric nights.',
        g,
        pos,
        { dist: 170, h: 95 }
      );
      reserve(pos.x, pos.z, 78);
    }

    // 3. Landmark: Ibom Tropicana
    {
      const g = new THREE.Group();
      const base = add(g, new THREE.Mesh(new THREE.BoxGeometry(46, 8, 30), std(0xece6da)));
      base.position.y = 4;
      const dome = add(
        g,
        new THREE.Mesh(
          new THREE.SphereGeometry(13, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
          std(0x88c7d8, { metalness: 0.5, roughness: 0.2 })
        )
      );
      dome.position.y = 8;
      const crown = add(
        g,
        new THREE.Mesh(new THREE.TorusGeometry(13.2, 0.7, 8, 48), glowMat(C.orange, 2.2)),
        false
      );
      crown.rotation.x = Math.PI / 2;
      crown.position.y = 8.3;

      [-19, 19].forEach((x) => {
        const t = add(g, new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 22, 16), std(0xf3efe6)));
        t.position.set(x, 11, 0);
        const cap = add(g, new THREE.Mesh(new THREE.ConeGeometry(3.6, 6, 16), std(C.green)));
        cap.position.set(x, 25, 0);
      });

      const pool = add(
        g,
        new THREE.Mesh(new THREE.BoxGeometry(30, 0.4, 10), std(C.water, { roughness: 0.1, metalness: 0.4 })),
        false
      );
      pool.position.set(0, 0.3, 24);

      const pos = dirOf(-120).multiplyScalar(150);
      registerLandmark(
        'tropicana',
        'Ibom Tropicana',
        'Leisure',
        'Entertainment centre with its landmark dome — cinema, arcades, dining and Uyo’s nightlife energy.',
        g,
        pos,
        { dist: 110, h: 60 }
      );
      reserve(pos.x, pos.z, 40);
    }

    // 4. Landmark: Dakkada Tower
    {
      const g = new THREE.Group();
      const glass = std(0x3a6f8f, { metalness: 0.7, roughness: 0.15 });
      const shaft = add(g, new THREE.Mesh(new THREE.BoxGeometry(14, 92, 14), glass));
      shaft.position.y = 46;
      const fins = std(C.white, { roughness: 0.4 });
      [
        [-7.2, 0],
        [7.2, 0],
        [0, -7.2],
        [0, 7.2],
      ].forEach(([x, z]) => {
        const f = add(g, new THREE.Mesh(new THREE.BoxGeometry(x ? 0.8 : 15, 94, z ? 0.8 : 15), fins));
        f.position.set(x, 47, z);
      });
      const winMat = glowMat(0xffd59a, 1.4);
      for (let y = 6; y < 90; y += 6) {
        const band = add(g, new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.6, 14.4), winMat), false);
        band.position.y = y;
      }
      const spire = add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.4, 1.2, 22, 8), std(0xcfd4da, { metalness: 0.8 })));
      spire.position.y = 103;
      const beacon = add(g, new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 12), glowMat(0xff3b2f, 4)), false);
      beacon.position.y = 115;
      g.userData.beacon = beacon;

      const pos = dirOf(85).multiplyScalar(70);
      registerLandmark(
        'dakkada',
        'Dakkada Tower',
        'Skyline',
        'Uyo’s rising icon beside Ibom Plaza — the symbol of the Dakkada spirit of Akwa Ibom.',
        g,
        pos,
        { dist: 150, h: 110 }
      );
      reserve(pos.x, pos.z, 18);
    }

    // 5. Landmark: Government House
    {
      const g = new THREE.Group();
      const white = std(C.white, { roughness: 0.45 });
      const main = add(g, new THREE.Mesh(new THREE.BoxGeometry(44, 12, 22), white));
      main.position.y = 6;
      const portico = add(g, new THREE.Mesh(new THREE.BoxGeometry(18, 2, 8), white));
      portico.position.set(0, 13, 14);
      for (let i = 0; i < 6; i++) {
        const c = add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 12, 10), white));
        c.position.set(-7.5 + i * 3, 6, 17);
      }
      const dome = add(
        g,
        new THREE.Mesh(new THREE.SphereGeometry(6, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), std(C.green, { metalness: 0.3 }))
      );
      dome.position.y = 12;
      const pole = add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 10, 6), std(0xcccccc)));
      pole.position.set(0, 23, 0);
      const flag = add(
        g,
        new THREE.Mesh(new THREE.PlaneGeometry(6, 3.5, 6, 1), new THREE.MeshStandardMaterial({ color: C.green, side: THREE.DoubleSide })),
        false
      );
      flag.position.set(3, 26, 0);
      g.userData.flag = flag;

      const lawn = add(g, new THREE.Mesh(new THREE.BoxGeometry(60, 0.3, 48), std(0x4a9a55)), false);
      lawn.position.y = 0.15;
      lawn.receiveShadow = true;

      const pos = dirOf(130).multiplyScalar(215);
      registerLandmark(
        'govhouse',
        'Government House',
        'Civic',
        'Seat of the Akwa Ibom State Government on Wellington Bassey Way.',
        g,
        pos,
        { dist: 110, h: 55 }
      );
      reserve(pos.x, pos.z, 42);
    }

    // 6. Landmark: University of Uyo
    {
      const g = new THREE.Group();
      const brick = std(0xc9a77c);
      const roofM = std(0x7a2f1f);
      [
        [-22, -10, 26, 10],
        [10, -18, 18, 14],
        [18, 14, 28, 10],
        [-18, 18, 20, 12],
      ].forEach(([x, z, w, d]) => {
        const b = add(g, new THREE.Mesh(new THREE.BoxGeometry(w, 9, d), brick));
        b.position.set(x, 4.5, z);
        const r = add(g, new THREE.Mesh(new THREE.BoxGeometry(w + 1, 1, d + 1), roofM));
        r.position.set(x, 9.5, z);
      });
      const clock = add(g, new THREE.Mesh(new THREE.BoxGeometry(5, 26, 5), std(C.white)));
      clock.position.set(-2, 13, 2);
      const face = add(g, new THREE.Mesh(new THREE.CircleGeometry(1.8, 24), glowMat(0xfff2c4, 2)), false);
      face.position.set(-2, 22, 4.6);
      const field = add(g, new THREE.Mesh(new THREE.BoxGeometry(34, 0.3, 22), std(0x3d9b4c)), false);
      field.position.set(40, 0.2, 0);
      field.receiveShadow = true;

      const pos = dirOf(24).multiplyScalar(420);
      registerLandmark(
        'uniuyo',
        'University of Uyo',
        'Education',
        'UNIUYO main campus off Nwaniba Road — lecture halls, hostels and a buzzing student quarter.',
        g,
        pos,
        { dist: 130, h: 70 }
      );
      reserve(pos.x, pos.z, 58);
    }

    // 7. Landmark: Unity Park
    {
      const g = new THREE.Group();
      const lawn = add(g, new THREE.Mesh(new THREE.CylinderGeometry(42, 42, 0.4, 48), std(0x3f9a4e)), false);
      lawn.position.y = 0.2;
      lawn.receiveShadow = true;
      const lake = add(
        g,
        new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 0.5, 32), std(C.water, { roughness: 0.08, metalness: 0.4 })),
        false
      );
      lake.scale.z = 0.6;
      lake.position.set(10, 0.35, 6);
      const obelisk = add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.6, 2.4, 20, 4), std(C.white)));
      obelisk.position.set(-12, 10, -8);

      const pos = dirOf(-75).multiplyScalar(200);
      registerLandmark(
        'park',
        'Unity Park',
        'Nature',
        'Shaded lawns, a calm lake and monuments — Uyo’s reputation as Nigeria’s cleanest green city.',
        g,
        pos,
        { dist: 110, h: 60 }
      );
      reserve(pos.x, pos.z, 46);
    }

    // 8. Landmark: Airport Corridor
    {
      const g = new THREE.Group();
      const runway = add(g, new THREE.Mesh(new THREE.BoxGeometry(220, 0.3, 18), std(0x2b2e34)), false);
      runway.position.y = 0.15;
      runway.receiveShadow = true;
      for (let x = -100; x <= 100; x += 16) {
        const m = add(g, new THREE.Mesh(new THREE.PlaneGeometry(8, 1), laneMat), false);
        m.rotation.x = -Math.PI / 2;
        m.position.set(x, 0.32, 0);
      }
      const term = add(g, new THREE.Mesh(new THREE.BoxGeometry(50, 9, 16), std(0xdfe5ea, { metalness: 0.3 })));
      term.position.set(0, 4.5, 30);
      const tower = add(g, new THREE.Mesh(new THREE.CylinderGeometry(2, 2.6, 26, 12), std(C.white)));
      tower.position.set(38, 13, 32);
      const cab = add(g, new THREE.Mesh(new THREE.CylinderGeometry(4.5, 3.6, 4, 12), glowMat(0x9fe7ff, 1.8)));
      cab.position.set(38, 28, 32);
      g.rotation.y = THREE.MathUtils.degToRad(-38 + 90);

      const pos = dirOf(-60).multiplyScalar(500);
      registerLandmark(
        'airport',
        'Victor Attah Int’l Airport',
        'Transport',
        'Akwa Ibom’s gateway to the world, linked to the capital along the Oron Road corridor.',
        g,
        pos,
        { dist: 190, h: 100 }
      );
      reserve(pos.x, pos.z, 130);
    }

    // Dynamic Registration of All Extended Uyo City Landmarks
    UYO_LANDMARKS.forEach((lm) => {
      if (landmarks.some((existing) => existing.id === lm.id)) return;
      const g = new THREE.Group();
      const colorNum = parseInt(lm.color.replace('#', '0x'), 16) || 0x1fc16b;
      const baseMat = std(colorNum, { roughness: 0.6, metalness: 0.2 });
      const accentMat = glowMat(colorNum, 2.0);

      // Distinctive architectural base
      const baseMesh = add(g, new THREE.Mesh(new THREE.BoxGeometry(26, 3.5, 22), std(0x1e293b, { roughness: 0.8 })));
      baseMesh.position.y = 1.75;

      // Main structural tower / hall
      const mainMesh = add(g, new THREE.Mesh(new THREE.BoxGeometry(18, lm.height, 16), baseMat));
      mainMesh.position.y = lm.height / 2 + 3.5;

      // Architectural roof accent
      const crown = add(g, new THREE.Mesh(new THREE.ConeGeometry(8, 5, 4), accentMat), false);
      crown.rotation.y = Math.PI / 4;
      crown.position.y = lm.height + 6;

      // Glowing landmark night beacon
      const beacon = add(g, new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), accentMat), false);
      beacon.position.y = lm.height + 9;

      registerLandmark(
        lm.id,
        lm.name,
        lm.tag,
        lm.desc,
        g,
        { x: lm.position[0], z: lm.position[2] },
        { dist: 120, h: Math.max(50, lm.height + 30) }
      );
      reserve(lm.position[0], lm.position[2], 24);
    });

    // Procedural Buildings
    const bGeo = new THREE.BoxGeometry(1, 1, 1);
    bGeo.translate(0, 0.5, 0);
    const facadePalette = [0xf2eee6, 0xe9dfcf, 0xd8d3c9, 0xf6e7d0, 0xcfd8dc, 0xe0c9a6, 0xbfd4c4, 0xf1d5c0];
    const bMat = new THREE.MeshStandardMaterial({ roughness: 0.75, metalness: 0.05 });
    const MAX_B = 1400;
    const buildings = new THREE.InstancedMesh(bGeo, bMat, MAX_B);
    buildings.castShadow = true;
    buildings.receiveShadow = true;

    const roofGeo = new THREE.ConeGeometry(0.75, 1, 4);
    roofGeo.rotateY(Math.PI / 4);
    roofGeo.translate(0, 0.5, 0);
    const roofMat = new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.3 });
    const roofs = new THREE.InstancedMesh(roofGeo, roofMat, MAX_B);
    roofs.castShadow = true;

    const winGeo = new THREE.BoxGeometry(1.02, 1, 1.02);
    winGeo.translate(0, 0.5, 0);
    const winMat = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0xffc98a,
      emissiveIntensity: 0,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    });
    winMat.userData.nightIntensity = 1.2;
    nightGlowMats.push(winMat);
    const windows = new THREE.InstancedMesh(winGeo, winMat, MAX_B);

    const dummy = new THREE.Object3D();
    const col = new THREE.Color();
    let bCount = 0;
    let rCount = 0;
    let wCount = 0;
    const treeSpots: Array<[number, number]> = [];

    const nearestRoadYaw = (x: number, z: number) => {
      const p = new THREE.Vector2(x, z);
      let best = Infinity;
      let yaw = 0;
      ROADS.forEach((r) => {
        const d = new THREE.Vector2(r.dir.x, r.dir.z);
        const t = Math.max(0, p.dot(d));
        const dist = p.clone().sub(d.clone().multiplyScalar(t)).length();
        if (dist < best) {
          best = dist;
          yaw = THREE.MathUtils.degToRad(r.angle);
        }
      });
      if (Math.abs(p.length() - RING_R) < best) yaw = -Math.atan2(z, x) + Math.PI / 2;
      return yaw;
    };

    for (let attempt = 0; attempt < 9000 && bCount < MAX_B; attempt++) {
      const rr = Math.sqrt(rand()) * 560;
      const a = rand() * Math.PI * 2;
      const x = Math.cos(a) * rr;
      const z = Math.sin(a) * rr;
      const dRoad = distToRoads(x, z);
      if (dRoad < 13 || isReserved(x, z, 6)) {
        if (dRoad > 9 && !isReserved(x, z)) treeSpots.push([x, z]);
        continue;
      }
      if (dRoad > 70 && rand() < 0.55) {
        treeSpots.push([x, z]);
        continue;
      }

      const centrality = 1 - Math.min(rr / 560, 1);
      const w = 7 + rand() * 9;
      const d = 7 + rand() * 9;
      const tall = rand() < centrality * 0.35;
      const h = tall ? 18 + rand() * 40 * centrality + 10 : 4 + rand() * 7;

      if (isReserved(x, z, Math.max(w, d) * 0.6)) continue;
      reserve(x, z, Math.max(w, d) * 0.62);

      const yaw = nearestRoadYaw(x, z);
      dummy.position.set(x, 0, z);
      dummy.rotation.set(0, yaw, 0);
      dummy.scale.set(w, h, d);
      dummy.updateMatrix();
      buildings.setMatrixAt(bCount, dummy.matrix);
      col.setHex(
        tall
          ? [0xdfe6ea, 0xc5d3dc, 0xe8e3d8, 0x9fb7c4][Math.floor(rand() * 4)]
          : facadePalette[Math.floor(rand() * facadePalette.length)]
      );
      buildings.setColorAt(bCount, col);
      bCount++;

      if (!tall) {
        dummy.position.set(x, h, z);
        dummy.scale.set(w * 1.06, 2.5 + rand() * 2, d * 1.06);
        dummy.updateMatrix();
        roofs.setMatrixAt(rCount, dummy.matrix);
        col.setHex([0x8c2f22, 0xa8432a, 0x2f6f6a, 0x5b6770, 0x7a3b2a][Math.floor(rand() * 5)]);
        roofs.setColorAt(rCount, col);
        rCount++;
      } else {
        dummy.position.set(x, 3, z);
        dummy.scale.set(w, h - 5, d);
        dummy.updateMatrix();
        windows.setMatrixAt(wCount, dummy.matrix);
        wCount++;
      }
    }

    buildings.count = bCount;
    roofs.count = rCount;
    windows.count = wCount;
    scene.add(buildings, roofs, windows);

    // Trees (palms + broadleaf)
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.5, 1, 6);
    trunkGeo.translate(0, 0.5, 0);
    const trunks = new THREE.InstancedMesh(trunkGeo, std(0x6b4a2f), 2200);
    const crownGeo = new THREE.IcosahedronGeometry(1, 0);
    const crowns = new THREE.InstancedMesh(
      crownGeo,
      new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true }),
      2200
    );
    const palmGeo = new THREE.ConeGeometry(1, 0.6, 7, 1, true);
    const palms = new THREE.InstancedMesh(
      palmGeo,
      new THREE.MeshStandardMaterial({ color: 0x2f8a3e, roughness: 0.8, side: THREE.DoubleSide, flatShading: true }),
      2200
    );
    [trunks, crowns, palms].forEach((m) => {
      m.castShadow = true;
    });
    let tCount = 0;
    let cCount = 0;
    let pCount = 0;

    function plantTree(x: number, z: number, palm: boolean) {
      if (tCount >= 2200) return;
      const h = palm ? 9 + rand() * 6 : 4 + rand() * 4;
      dummy.position.set(x, 0, z);
      dummy.rotation.set((rand() - 0.5) * (palm ? 0.25 : 0.05), rand() * 6, 0);
      dummy.scale.set(1, h, 1);
      dummy.updateMatrix();
      trunks.setMatrixAt(tCount++, dummy.matrix);
      if (palm) {
        dummy.position.set(x, h, z);
        dummy.rotation.set(Math.PI, rand() * 6, 0);
        dummy.scale.set(4.2, 2.2, 4.2);
        dummy.updateMatrix();
        palms.setMatrixAt(pCount++, dummy.matrix);
      } else {
        const s = 3 + rand() * 2.5;
        dummy.position.set(x, h + s * 0.5, z);
        dummy.rotation.set(rand(), rand(), rand());
        dummy.scale.set(s, s * 0.9, s);
        dummy.updateMatrix();
        crowns.setMatrixAt(cCount, dummy.matrix);
        col.setHex([0x2e7d3a, 0x3d9447, 0x26662f, 0x4aa652][Math.floor(rand() * 4)]);
        crowns.setColorAt(cCount, col);
        cCount++;
      }
    }

    ROADS.forEach((r) => {
      const n = new THREE.Vector3(-r.dir.z, 0, r.dir.x);
      for (let s = PLAZA_R + 14; s < PLAZA_R + r.len; s += 18) {
        [-1, 1].forEach((side) => {
          const p = r.dir.clone().multiplyScalar(s).add(n.clone().multiplyScalar(side * (r.width / 2 + 3)));
          if (!isReserved(p.x, p.z, -4)) plantTree(p.x, p.z, true);
        });
      }
    });

    const parkLm = landmarks.find((l) => l.id === 'park');
    if (parkLm) {
      for (let i = 0; i < 70; i++) {
        const a = rand() * Math.PI * 2;
        const r = 16 + rand() * 24;
        plantTree(parkLm.pos.x + Math.cos(a) * r, parkLm.pos.z + Math.sin(a) * r, rand() < 0.3);
      }
    }
    treeSpots.forEach(([x, z]) => {
      if (rand() < 0.5) plantTree(x, z, rand() < 0.35);
    });
    trunks.count = tCount;
    crowns.count = cCount;
    palms.count = pCount;
    scene.add(trunks, crowns, palms);

    // Street Lamps
    const lampGeo = new THREE.SphereGeometry(0.9, 6, 6);
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xffd08a, transparent: true, opacity: 0 });
    const lamps = new THREE.InstancedMesh(lampGeo, lampMat, 900);
    let lCount = 0;
    ROADS.forEach((r) => {
      const n = new THREE.Vector3(-r.dir.z, 0, r.dir.x);
      for (let s = PLAZA_R + 6; s < PLAZA_R + r.len && lCount < 900; s += 22) {
        [-1, 1].forEach((side) => {
          const p = r.dir.clone().multiplyScalar(s).add(n.clone().multiplyScalar(side * (r.width / 2 + 1)));
          dummy.position.set(p.x, 7, p.z);
          dummy.rotation.set(0, 0, 0);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          lamps.setMatrixAt(lCount++, dummy.matrix);
        });
      }
    });
    for (let i = 0; i < 120 && lCount < 900; i++) {
      const a = (i / 120) * Math.PI * 2;
      dummy.position.set(Math.cos(a) * (RING_R + 8), 7, Math.sin(a) * (RING_R + 8));
      dummy.updateMatrix();
      lamps.setMatrixAt(lCount++, dummy.matrix);
    }
    lamps.count = lCount;
    scene.add(lamps);

    // Traffic System (Cars, Buses, Keke Napep)
    const lanes: Array<{
      type: 'radial' | 'ring';
      road?: typeof ROADS[0];
      offset?: THREE.Vector3;
      radius?: number;
      dirSign: number;
      len: number;
    }> = [];

    ROADS.forEach((r) => {
      const n = new THREE.Vector3(-r.dir.z, 0, r.dir.x);
      [-1, 1].forEach((side) => {
        lanes.push({
          type: 'radial',
          road: r,
          offset: n.clone().multiplyScalar(side * r.width * 0.25),
          dirSign: side,
          len: r.len + PLAZA_R,
        });
      });
    });
    [-1, 1].forEach((side) =>
      lanes.push({
        type: 'ring',
        radius: RING_R + side * 3,
        dirSign: side,
        len: Math.PI * 2 * RING_R,
      })
    );

    const carGeo = new THREE.BoxGeometry(1, 1, 1);
    carGeo.translate(0, 0.5, 0);
    const carMat = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.5 });
    const VEHICLES = 260;
    const cars = new THREE.InstancedMesh(carGeo, carMat, VEHICLES);
    cars.castShadow = true;
    const headGeo = new THREE.BoxGeometry(1, 1, 1);
    const headMat = new THREE.MeshBasicMaterial({ color: 0xfff3c8, transparent: true, opacity: 0 });
    const heads = new THREE.InstancedMesh(headGeo, headMat, VEHICLES);

    interface Vehicle {
      lane: typeof lanes[0];
      t: number;
      speed: number;
      size: [number, number, number];
      kind: 'keke' | 'bus' | 'car';
    }
    const vehicles: Vehicle[] = [];
    for (let i = 0; i < VEHICLES; i++) {
      const lane = lanes[Math.floor(rand() * lanes.length)];
      const kind = rand();
      const v: Vehicle = {
        lane,
        t: rand() * lane.len,
        speed: 8 + rand() * 10,
        size: kind < 0.3 ? [2.2, 2.2, 3] : kind < 0.38 ? [3, 3.6, 10] : [2.4, 1.7, 4.6],
        kind: kind < 0.3 ? 'keke' : kind < 0.38 ? 'bus' : 'car',
      };
      col.setHex(
        v.kind === 'keke'
          ? 0xffcc00
          : v.kind === 'bus'
          ? [C.green, C.orange, 0xffffff][Math.floor(rand() * 3)]
          : [0xffffff, 0x1b1d22, 0xb3b8bf, 0x8a1c1c, 0x1d4e89, 0x2f6d3a][Math.floor(rand() * 6)]
      );
      cars.setColorAt(i, col);
      vehicles.push(v);
    }
    scene.add(cars, heads);

    const tmpV = new THREE.Vector3();
    function placeVehicle(i: number, v: Vehicle, dt: number, speedMultiplier: number) {
      v.t += v.speed * dt * speedMultiplier;
      if (v.t > v.lane.len) v.t -= v.lane.len;
      let x: number, z: number, yaw: number;
      const L = v.lane;
      if (L.type === 'radial' && L.road && L.offset) {
        const s = L.dirSign > 0 ? v.t : L.len - v.t;
        tmpV.copy(L.road.dir).multiplyScalar(Math.max(s, PLAZA_R)).add(L.offset);
        x = tmpV.x;
        z = tmpV.z;
        yaw = THREE.MathUtils.degToRad(L.road.angle) + (L.dirSign > 0 ? Math.PI / 2 : -Math.PI / 2);
      } else {
        const rad = L.radius || RING_R;
        const ang = (v.t / L.len) * Math.PI * 2 * L.dirSign;
        x = Math.cos(ang) * rad;
        z = Math.sin(ang) * rad;
        yaw = -ang + (L.dirSign > 0 ? 0 : Math.PI);
      }
      dummy.position.set(x, 0.3, z);
      dummy.rotation.set(0, yaw, 0);
      dummy.scale.set(v.size[0], v.size[1], v.size[2]);
      dummy.updateMatrix();
      cars.setMatrixAt(i, dummy.matrix);

      dummy.translateZ(v.size[2] * 0.52);
      dummy.position.y = 0.9;
      dummy.scale.set(v.size[0] * 0.9, 0.35, 0.2);
      dummy.updateMatrix();
      heads.setMatrixAt(i, dummy.matrix);
    }

    // Rain Particles
    const RAIN = 5000;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(RAIN * 3);
    for (let i = 0; i < RAIN; i++) {
      rainPos[i * 3] = (rand() - 0.5) * 900;
      rainPos[i * 3 + 1] = rand() * 300;
      rainPos[i * 3 + 2] = (rand() - 0.5) * 900;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rain = new THREE.Points(
      rainGeo,
      new THREE.PointsMaterial({ color: 0xaecbe0, size: 1.4, transparent: true, opacity: 0.6 })
    );
    rain.visible = false;
    scene.add(rain);

    // Floating Screen Labels
    labelLayer.innerHTML = '';
    landmarks.forEach((l) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'sim-label';
      el.innerHTML = `<span class="sim-label-dot"></span><span class="sim-label-text">${l.name}</span>`;
      el.addEventListener('click', () => flyTo(l.id));
      labelLayer.appendChild(el);
      l.el = el;
      const box = new THREE.Box3().setFromObject(l.group);
      l.labelY = box.max.y + 6;
    });

    const roadLabels = ROADS.map((r) => {
      const el = document.createElement('span');
      el.className = 'sim-road-label';
      el.textContent = r.name;
      labelLayer.appendChild(el);
      return { el, pos: r.dir.clone().multiplyScalar(PLAZA_R + r.len * 0.62).setY(2) };
    });

    // Camera Flight Controller
    interface FlightAnimation {
      fromCam: THREE.Vector3;
      fromTarget: THREE.Vector3;
      toCam: THREE.Vector3;
      toTarget: THREE.Vector3;
      t: number;
      dur: number;
      thenRotate?: boolean;
    }
    let flight: FlightAnimation | null = null;
    let tourIndex = 0;
    let tourTimer = 0;

    function flyTo(id: string) {
      const l = landmarks.find((m) => m.id === id);
      if (!l) return;
      setSelectedLandmarkId(id);

      const fromCam = camera.position.clone();
      const fromTarget = controls.target.clone();
      const toTarget = l.pos.clone().setY(8);
      const offsetDir = fromCam.clone().sub(fromTarget).setY(0).normalize();
      if (offsetDir.lengthSq() < 0.01) offsetDir.set(1, 0, 1).normalize();
      const toCam = toTarget.clone().add(offsetDir.multiplyScalar(l.view.dist)).setY(l.view.h);

      flight = { fromCam, fromTarget, toCam, toTarget, t: 0, dur: 2.4 };
      controls.autoRotate = false;
      landmarks.forEach((m) => m.el?.classList.toggle('is-active', m.id === id));
    }

    function resetView() {
      setSelectedLandmarkId(null);
      flight = {
        fromCam: camera.position.clone(),
        fromTarget: controls.target.clone(),
        toCam: new THREE.Vector3(260, 210, 300),
        toTarget: new THREE.Vector3(0, 0, 0),
        t: 0,
        dur: 2.2,
        thenRotate: true,
      };
      landmarks.forEach((m) => m.el?.classList.remove('is-active'));
    }

    function startTour() {
      setAutoTour(true);
      tourTimer = 0;
      flyTo(landmarks[tourIndex % landmarks.length].id);
    }

    function stopTour() {
      setAutoTour(false);
    }

    controls.addEventListener('start', () => {
      flight = null;
      controls.autoRotate = false;
      if (simStateRef.current.autoTour) stopTour();
    });

    simStateRef.current.flyTo = flyTo;
    simStateRef.current.resetView = resetView;
    simStateRef.current.startTour = startTour;
    simStateRef.current.stopTour = stopTour;

    // Sky keys table
    const skyKeys = [
      { h: 0, top: 0x050a1c, bot: 0x0d1630, fog: 0x0b1226, sun: 0, hemi: 0.12, night: 1 },
      { h: 5.5, top: 0x1a2350, bot: 0x5a4a6a, fog: 0x3a3a55, sun: 0.1, hemi: 0.2, night: 0.8 },
      { h: 6.6, top: 0x5b8fd0, bot: 0xffb27a, fog: 0xf0b48a, sun: 1.0, hemi: 0.4, night: 0.2 },
      { h: 9, top: 0x3d8fd6, bot: 0xcfe6f2, fog: 0xb5d4e6, sun: 2.2, hemi: 0.6, night: 0 },
      { h: 16, top: 0x3d8fd6, bot: 0xd6ebf5, fog: 0xbcd8e8, sun: 2.2, hemi: 0.6, night: 0 },
      { h: 18.2, top: 0x3c4f9a, bot: 0xff8c42, fog: 0xe58a5a, sun: 1.0, hemi: 0.35, night: 0.35 },
      { h: 19.4, top: 0x101a40, bot: 0x5a2f4a, fog: 0x2a2140, sun: 0.1, hemi: 0.2, night: 0.85 },
      { h: 24, top: 0x050a1c, bot: 0x0d1630, fog: 0x0b1226, sun: 0, hemi: 0.12, night: 1 },
    ];
    const cA = new THREE.Color();
    const cB = new THREE.Color();

    function sampleSky(h: number) {
      let i = 0;
      while (i < skyKeys.length - 1 && skyKeys[i + 1].h < h) i++;
      const a = skyKeys[i];
      const b = skyKeys[Math.min(i + 1, skyKeys.length - 1)];
      const t = b.h === a.h ? 0 : (h - a.h) / (b.h - a.h);
      const s = t * t * (3 - 2 * t);
      return {
        top: cA.setHex(a.top).lerp(cB.setHex(b.top), s).clone(),
        bot: cA.setHex(a.bot).lerp(cB.setHex(b.bot), s).clone(),
        fog: cA.setHex(a.fog).lerp(cB.setHex(b.fog), s).clone(),
        sun: THREE.MathUtils.lerp(a.sun, b.sun, s),
        hemi: THREE.MathUtils.lerp(a.hemi, b.hemi, s),
        night: THREE.MathUtils.lerp(a.night, b.night, s),
      };
    }

    const harmattan = new THREE.Color(0xd9b98a);
    const rainGrey = new THREE.Color(0x6f7c88);

    function applyEnvironment(t: number, w: 'clear' | 'rain' | 'harmattan') {
      const s = sampleSky(t);
      const sunAng = ((t - 6.5) / 12.2) * Math.PI;
      sun.position.set(Math.cos(sunAng) * 600, Math.max(Math.sin(sunAng), -0.2) * 520 + 30, -140);
      sun.target.position.set(0, 0, 0);

      let fogNear = 260;
      let fogFar = 820;
      let dim = 1;
      if (w === 'rain') {
        s.top.lerp(rainGrey, 0.65);
        s.bot.lerp(rainGrey, 0.6);
        s.fog.lerp(rainGrey, 0.6);
        fogNear = 120;
        fogFar = 560;
        dim = 0.45;
      } else if (w === 'harmattan') {
        s.top.lerp(harmattan, 0.5);
        s.bot.lerp(harmattan, 0.75);
        s.fog.lerp(harmattan, 0.8);
        fogNear = 40;
        fogFar = 420;
        dim = 0.7;
      }
      skyUniforms.top.value.copy(s.top);
      skyUniforms.bottom.value.copy(s.bot);
      if (scene.fog instanceof THREE.Fog) {
        scene.fog.color.copy(s.fog);
        scene.fog.near = fogNear;
        scene.fog.far = fogFar;
      }
      renderer.setClearColor(s.fog);
      sun.intensity = s.sun * dim;
      sun.color.setHSL(0.09, 0.8, sunAng < 0.35 || sunAng > Math.PI - 0.35 ? 0.65 : 0.9);
      hemi.intensity = s.hemi * (w === 'clear' ? 1 : 1.15);
      moon.intensity = s.night * 0.35;
      starMat.opacity = w === 'clear' ? s.night : s.night * 0.15;

      const n = s.night;
      nightGlowMats.forEach((m) => {
        m.emissiveIntensity = (m.userData.nightIntensity || 1) * (0.12 + n * 0.88);
      });
      winMat.opacity = n * 0.55;
      lampMat.opacity = n;
      headMat.opacity = Math.min(1, n * 1.2 + (w === 'rain' ? 0.5 : 0));

      // Update React State HUD Telemetry
      const hh = Math.floor(t);
      const mm = Math.floor((t % 1) * 60);
      setClockStr(`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
      setPhaseStr(t < 5.5 || t >= 19.4 ? 'Night' : t < 8 ? 'Sunrise' : t < 17.5 ? 'Day' : 'Golden hour');
      const baseTemp = 24 + 7 * Math.max(0, Math.sin(((t - 7) / 14) * Math.PI));
      setTempStr(`${Math.round(baseTemp - (w === 'rain' ? 3 : 0) + (w === 'harmattan' ? 1 : 0))}°C`);
    }

    // Resize Observer
    function handleResize() {
      if (!canvasWrap || isDisposed) return;
      const w = canvasWrap.clientWidth;
      const h = canvasWrap.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvasWrap);
    handleResize();

    // Projected 2D Label Updater
    const proj = new THREE.Vector3();
    function updateLabels() {
      if (!canvasWrap) return;
      const w = canvasWrap.clientWidth;
      const h = canvasWrap.clientHeight;
      landmarks.forEach((l) => {
        if (!l.el || l.labelY === undefined) return;
        proj.set(l.pos.x, l.labelY, l.pos.z).project(camera);
        const on = proj.z < 1 && Math.abs(proj.x) < 1.05 && Math.abs(proj.y) < 1.05;
        const dist = camera.position.distanceTo(l.pos);
        l.el.style.opacity = on ? (dist < 900 ? '1' : '0') : '0';
        l.el.style.pointerEvents = on ? 'auto' : 'none';
        l.el.style.transform = `translate(-50%, -100%) translate(${(proj.x * 0.5 + 0.5) * w}px, ${(
          -proj.y * 0.5 + 0.5
        ) * h}px)`;
      });
      roadLabels.forEach((r) => {
        proj.copy(r.pos).project(camera);
        const on = proj.z < 1 && Math.abs(proj.x) < 1 && Math.abs(proj.y) < 1 && camera.position.y > 120;
        r.el.style.opacity = on ? '0.75' : '0';
        r.el.style.transform = `translate(-50%, -50%) translate(${(proj.x * 0.5 + 0.5) * w}px, ${(
          -proj.y * 0.5 + 0.5
        ) * h}px)`;
      });
    }

    // Animation Loop
    const clock = new THREE.Clock();
    let elapsed = 0;
    let citizens = 1218400;
    let animId: number;
    let firstFrame = true;

    function tick() {
      if (isDisposed) return;
      animId = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      elapsed += dt;

      const state = simStateRef.current;
      // Advance timeOfDay
      const curTime = (state.timeOfDay + (dt / 20) * state.simSpeed) % 24;
      state.timeOfDay = curTime;
      setTimeOfDay(curTime);

      // Camera flight interpolation
      if (flight) {
        flight.t += dt / flight.dur;
        const k = flight.t >= 1 ? 1 : 1 - Math.pow(1 - flight.t, 3);
        camera.position.lerpVectors(flight.fromCam, flight.toCam, k);
        camera.position.y += Math.sin(k * Math.PI) * 60;
        controls.target.lerpVectors(flight.fromTarget, flight.toTarget, k);
        if (flight.t >= 1) {
          if (flight.thenRotate) controls.autoRotate = true;
          else if (state.autoTour) controls.autoRotate = true;
          flight = null;
        }
      }

      // Auto tour sequencer
      if (state.autoTour) {
        tourTimer += dt;
        if (tourTimer > 8) {
          tourTimer = 0;
          tourIndex++;
          flyTo(landmarks[tourIndex % landmarks.length].id);
        }
      }

      // Update vehicles
      for (let i = 0; i < vehicles.length; i++) {
        placeVehicle(i, vehicles[i], dt, state.simSpeed);
      }
      cars.instanceMatrix.needsUpdate = true;
      heads.instanceMatrix.needsUpdate = true;

      // Update rain
      rain.visible = state.weather === 'rain';
      if (rain.visible) {
        const arr = rainGeo.attributes.position.array as Float32Array;
        for (let i = 1; i < arr.length; i += 3) {
          arr[i] -= 220 * dt;
          if (arr[i] < 0) arr[i] += 300;
        }
        rainGeo.attributes.position.needsUpdate = true;
        rain.position.x = controls.target.x;
        rain.position.z = controls.target.z;
      }

      // Living landmark details
      const plazaLm = landmarks[0]?.group;
      if (plazaLm?.userData.jet) {
        plazaLm.userData.jet.scale.y = 1 + Math.sin(elapsed * 3) * 0.12;
      }
      const dakkadaLm = landmarks.find((l) => l.id === 'dakkada')?.group;
      if (dakkadaLm?.userData.beacon) {
        dakkadaLm.userData.beacon.visible = Math.sin(elapsed * 4) > 0;
      }
      const govLm = landmarks.find((l) => l.id === 'govhouse')?.group;
      if (govLm?.userData.flag) {
        govLm.userData.flag.rotation.y = Math.sin(elapsed * 2) * 0.15;
      }

      // Fluctuating population and traffic
      citizens += Math.round((rand() - 0.45) * 6);
      if (Math.floor(elapsed * 4) % 4 === 0) {
        setCitizensCount(citizens.toLocaleString('en-NG'));
        const rush =
          (curTime > 7 && curTime < 10) || (curTime > 16 && curTime < 20)
            ? 1.35
            : curTime < 5
            ? 0.4
            : 1;
        setVehiclesCount(Math.round(18200 * rush + Math.sin(elapsed) * 120).toLocaleString('en-NG'));
      }

      applyEnvironment(curTime, state.weather);
      controls.update();
      renderer.render(scene, camera);
      updateLabels();

      if (firstFrame) {
        firstFrame = false;
        setIsLoading(false);
      }
    }

    tick();

    // Initial Landmark Fly-To if specified
    if (initialLandmarkId) {
      setTimeout(() => {
        flyTo(initialLandmarkId);
      }, 300);
    }

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      scene.clear();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [isOpen, initialLandmarkId]);

  if (!isOpen) return null;

  const currentLandmark = UYO_LANDMARKS.find((lm) => lm.id === selectedLandmarkId) || null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-6xl h-[92vh] max-h-[860px] flex flex-col rounded-3xl overflow-hidden border border-[#1fc16b]/40 bg-[#070a14] shadow-2xl shadow-[#1fc16b]/20 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip with Live Coordinates Badge */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#0a121a]/95 border-b border-white/10 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1fc16b] to-[#0d783f] flex items-center justify-center font-display font-black text-black text-sm shadow-md shadow-[#1fc16b]/30">
              U
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-white text-sm tracking-wider">UYOVERSE DIGITAL TWIN</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1fc16b]/20 text-[#1fc16b] border border-[#1fc16b]/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1fc16b] animate-ping" />
                  LIVE SIMULATION
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                5.03°N 7.93°E • Real-time traffic, sunlight & procedural urban mesh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (simStateRef.current.autoTour) {
                  simStateRef.current.stopTour?.();
                } else {
                  simStateRef.current.startTour?.();
                }
              }}
              className={`sim-btn sim-btn-sm ${autoTour ? 'is-active' : 'sim-btn-primary'}`}
              title="Automated scenic camera flight across all Uyo landmarks"
            >
              <Play className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{autoTour ? 'Stop Tour' : 'Cinematic Tour'}</span>
            </button>

            <button
              onClick={() => simStateRef.current.resetView?.()}
              className="sim-btn sim-btn-sm text-slate-300 hover:text-white"
              title="Reset view to central panorama"
              aria-label="Reset view"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all ml-1"
              aria-label="Close simulation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3D Simulation Root Canvas */}
        <div className="relative flex-1 w-full h-full min-h-0 bg-[#05070f] overflow-hidden">
          {/* Three.js canvas container */}
          <div ref={canvasWrapRef} className="sim-canvas" />

          {/* Floating Projected Landmark / Road Labels Layer */}
          <div ref={labelsLayerRef} className="sim-labels" />

          {/* Vignette Shadow */}
          <div className="sim-vignette" />

          {/* Loading Overlay */}
          {isLoading && (
            <div className="sim-loader">
              <div className="w-12 h-12 border-2 border-[#1fc16b]/30 rounded-full animate-spin border-t-[#1fc16b]" />
              <p className="mt-4 font-display text-[10px] tracking-[0.35em] text-slate-400 uppercase">
                Loading Digital Twin of Uyo...
              </p>
            </div>
          )}

          {/* HUD Top-Left: Live City Telemetry */}
          <div className="sim-hud sim-hud-tl">
            <div className="sim-panel flex items-center gap-4 sm:gap-5 shadow-2xl">
              <div>
                <div className="sim-k">Local time</div>
                <div className="sim-v font-display flex items-baseline gap-1.5">
                  <span>{clockStr}</span>
                  <span className="text-[#1fc16b] text-[10px] font-bold tracking-wider uppercase">{phaseStr}</span>
                </div>
              </div>
              <div className="sim-sep" />
              <div>
                <div className="sim-k">Temp</div>
                <div className="sim-v font-display text-amber-300">{tempStr}</div>
              </div>
              <div className="sim-sep hidden sm:block" />
              <div className="hidden sm:block">
                <div className="sim-k">Citizens</div>
                <div className="sim-v font-display text-emerald-400">{citizensCount}</div>
              </div>
              <div className="sim-sep hidden md:block" />
              <div className="hidden md:block">
                <div className="sim-k">Vehicles</div>
                <div className="sim-v font-display text-sky-400">{vehiclesCount}</div>
              </div>
            </div>
          </div>

          {/* HUD Landmark Info Card (when a landmark is clicked or inspected) */}
          {currentLandmark && (
            <div className="sim-info is-visible animate-in fade-in slide-in-from-top-2">
              <div className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#ff8c42] mb-0.5">
                {currentLandmark.tag}
              </div>
              <div className="font-display text-base font-bold text-white leading-tight">
                {currentLandmark.name}
              </div>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                {currentLandmark.desc}
              </p>
              {onDriveToLandmark && (
                <button
                  onClick={() => {
                    onDriveToLandmark(currentLandmark);
                    onClose();
                  }}
                  className="mt-2.5 w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#1fc16b] to-[#128a4a] text-black font-display font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#1fc16b]/20 hover:brightness-110 transition-all cursor-pointer"
                >
                  <Car className="w-3.5 h-3.5" />
                  Drive Here in 3D Game
                </button>
              )}
            </div>
          )}

          {/* HUD Bottom: Time scrubber, Weather & Simulation Speed Controls */}
          <div className="sim-hud sim-hud-b">
            <div className="sim-panel flex flex-col md:flex-row md:items-center gap-3 md:gap-5 shadow-2xl">
              {/* Time of Day Range Scrubber */}
              <label className="flex items-center gap-3 flex-1 min-w-0">
                <span className="sim-k shrink-0 flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-400" />
                  Time of Day
                </span>
                <input
                  type="range"
                  min="0"
                  max="23.99"
                  step="0.05"
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
                  className="sim-range flex-1 cursor-ew-resize"
                  aria-label="Time of day scrubber"
                />
              </label>

              {/* Weather Modes */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="sim-k mr-1">Weather</span>
                <button
                  type="button"
                  onClick={() => setWeather('clear')}
                  className={`sim-btn sim-btn-sm ${weather === 'clear' ? 'is-active' : ''}`}
                >
                  <Sun className="w-3 h-3" /> Clear
                </button>
                <button
                  type="button"
                  onClick={() => setWeather('rain')}
                  className={`sim-btn sim-btn-sm ${weather === 'rain' ? 'is-active' : ''}`}
                >
                  <CloudRain className="w-3 h-3" /> Rain
                </button>
                <button
                  type="button"
                  onClick={() => setWeather('harmattan')}
                  className={`sim-btn sim-btn-sm ${weather === 'harmattan' ? 'is-active' : ''}`}
                >
                  <Wind className="w-3 h-3" /> Harmattan
                </button>
              </div>

              {/* Simulation Speed */}
              <div className="flex items-center gap-2">
                <span className="sim-k mr-1">Speed</span>
                <button
                  type="button"
                  onClick={() => setSimSpeed(1)}
                  className={`sim-btn sim-btn-sm ${simSpeed === 1 ? 'is-active' : ''}`}
                >
                  1x
                </button>
                <button
                  type="button"
                  onClick={() => setSimSpeed(4)}
                  className={`sim-btn sim-btn-sm ${simSpeed === 4 ? 'is-active' : ''}`}
                >
                  4x
                </button>
                <button
                  type="button"
                  onClick={() => setSimSpeed(12)}
                  className={`sim-btn sim-btn-sm ${simSpeed === 12 ? 'is-active' : ''}`}
                >
                  12x
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Landmark Fly-to Chips Strip */}
        <div className="shrink-0 px-4 py-2.5 bg-[#0a121a]/95 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar mask-fade-edges z-20">
          <span className="sim-k shrink-0 mr-1 text-[#1fc16b] font-bold flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Fly to:
          </span>
          {UYO_LANDMARKS.map((lm) => {
            const isActive = selectedLandmarkId === lm.id;
            return (
              <button
                key={lm.id}
                type="button"
                onClick={() => {
                  setAutoTour(false);
                  simStateRef.current.flyTo?.(lm.id);
                }}
                className={`sim-chip shrink-0 ${isActive ? 'is-active' : ''}`}
              >
                {lm.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
