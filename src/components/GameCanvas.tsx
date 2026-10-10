import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { triggerCelebration } from '../utils/celebration';
import {
  CameraMode,
  Landmark,
  Mission,
  VehicleState,
  WeatherType,
  VehicleModel,
  PlayerMode,
  VehicleCustomization,
  CollectibleArtifact,
  AvatarState,
} from '../types/game';
import { UYO_LANDMARKS, ONLINE_DRIVERS } from '../data/gameData';
import { soundEngine } from '../utils/AudioSynthesizer';

interface GameCanvasProps {
  weather: WeatherType;
  cameraMode: CameraMode;
  playerMode: PlayerMode;
  vehicleModel: VehicleModel;
  customization: VehicleCustomization;
  activeMission: Mission | null;
  artifacts: CollectibleArtifact[];
  onMissionComplete: (missionId: string) => void;
  onLandmarkSelect: (landmark: Landmark) => void;
  onVehicleUpdate: (state: VehicleState) => void;
  onAvatarUpdate: (state: AvatarState) => void;
  onCameraModeChange: (mode: CameraMode) => void;
  onPlayerModeChange: (mode: PlayerMode) => void;
  onCollectArtifact: (id: string) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  weather,
  cameraMode,
  playerMode,
  vehicleModel,
  customization,
  activeMission,
  artifacts,
  onMissionComplete,
  onLandmarkSelect,
  onVehicleUpdate,
  onAvatarUpdate,
  onCameraModeChange,
  onPlayerModeChange,
  onCollectArtifact,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // References across render loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const vehicleGroupRef = useRef<THREE.Group | null>(null);
  const avatarGroupRef = useRef<THREE.Group | null>(null);
  const avatarLimbsRef = useRef<{ leftLeg: THREE.Mesh; rightLeg: THREE.Mesh; leftArm: THREE.Mesh; rightArm: THREE.Mesh } | null>(null);
  const wheelsRef = useRef<THREE.Mesh[]>([]);
  const headlightsRef = useRef<THREE.SpotLight[]>([]);
  const taillightsRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const underglowLightRef = useRef<THREE.PointLight | null>(null);
  const rainSystemRef = useRef<THREE.Points | null>(null);
  const nitroParticlesRef = useRef<THREE.Points | null>(null);
  const fountainParticlesRef = useRef<THREE.Points | null>(null);
  const waypointMeshRef = useRef<THREE.Mesh | null>(null);
  const waypointLightRef = useRef<THREE.PointLight | null>(null);
  const artifactMeshesRef = useRef<{ id: string; mesh: THREE.Group }[]>([]);
  const onlineDriverMeshesRef = useRef<{ id: string; group: THREE.Group; labelCanvas: HTMLCanvasElement; textMesh: THREE.Sprite }[]>([]);

  // Vehicle dynamics ref
  const vehicleStateRef = useRef<{
    pos: THREE.Vector3;
    rotY: number;
    speed: number;
    steering: number;
    targetSteering: number;
    maxSpeed: number;
    accel: number;
    friction: number;
    isBraking: boolean;
    nitro: number;
    isNitroActive: boolean;
    health: number;
  }>({
    pos: new THREE.Vector3(0, 0.4, 75),
    rotY: 0,
    speed: 0,
    steering: 0,
    targetSteering: 0,
    maxSpeed: 42,
    accel: 28,
    friction: 0.965,
    isBraking: false,
    nitro: 100,
    isNitroActive: false,
    health: 100,
  });

  // Avatar dynamics ref
  const avatarStateRef = useRef<{
    pos: THREE.Vector3;
    rotY: number;
    speed: number;
    isWalking: boolean;
    isRunning: boolean;
    isJumping: boolean;
    verticalVelocity: number;
  }>({
    pos: new THREE.Vector3(2, 0, 78),
    rotY: 0,
    speed: 0,
    isWalking: false,
    isRunning: false,
    isJumping: false,
    verticalVelocity: 0,
  });

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const mountTimeRef = useRef<number>(Date.now());

  // Landmark proximity check trigger
  const checkProximity = useCallback(
    (currentPos: THREE.Vector3) => {
      // Prevent premature triggering on initial mount
      const isInitialMount = Date.now() - mountTimeRef.current < 2000;

      // Mission proximity
      if (activeMission && !activeMission.completed && !isInitialMount) {
        const targetLandmark = UYO_LANDMARKS.find((l) => l.id === activeMission.targetLandmarkId);
        if (targetLandmark) {
          const dist = Math.hypot(currentPos.x - targetLandmark.position[0], currentPos.z - targetLandmark.position[2]);
          if (dist < 26) {
            onMissionComplete(activeMission.id);
            soundEngine.playCheckpointSound();
            triggerCelebration('mission');
          }
        }
      }

      // Collectibles proximity
      artifacts.forEach((art) => {
        if (!art.collected && !isInitialMount) {
          const dist = Math.hypot(currentPos.x - art.position[0], currentPos.z - art.position[2]);
          if (dist < 8) {
            onCollectArtifact(art.id);
            soundEngine.playArtifactChime();
            triggerCelebration('relic');
          }
        }
      });

      // Landmark card trigger
      for (const lm of UYO_LANDMARKS) {
        const d = Math.hypot(currentPos.x - lm.position[0], currentPos.z - lm.position[2]);
        if (d < 22) {
          onLandmarkSelect(lm);
          break;
        }
      }
    },
    [activeMission, artifacts, onMissionComplete, onCollectArtifact, onLandmarkSelect]
  );

  // Setup Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060e0a);
    scene.fog = new THREE.FogExp2(0x0a1c12, 0.0028);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.5, 2000);
    camera.position.set(0, 15, 35);
    cameraRef.current = camera;

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xbadfc8, 0x14281a, 0.7);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff7e6, 1.8);
    sunLight.position.set(180, 260, 140);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.left = -320;
    sunLight.shadow.camera.right = 320;
    sunLight.shadow.camera.top = 320;
    sunLight.shadow.camera.bottom = -320;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 800;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    // ---------------- Terrain & Ground ----------------
    const groundGeo = new THREE.PlaneGeometry(1600, 1600, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x163820,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(1600, 80, 0x1fc16b, 0x0c2514);
    grid.position.y = 0.02;
    scene.add(grid);

    // ---------------- Road Network ----------------
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1f232b, roughness: 0.85 });
    const curbMat = new THREE.MeshStandardMaterial({ color: 0xf26522, roughness: 0.6 });
    const laneMat = new THREE.MeshBasicMaterial({ color: 0xf4eedb });

    const roadGroup = new THREE.Group();
    scene.add(roadGroup);

    const PLAZA_RADIUS = 32;
    const plazaRoad = new THREE.Mesh(new THREE.RingGeometry(PLAZA_RADIUS - 8, PLAZA_RADIUS + 8, 64), roadMat);
    plazaRoad.rotation.x = -Math.PI / 2;
    plazaRoad.position.y = 0.05;
    plazaRoad.receiveShadow = true;
    roadGroup.add(plazaRoad);

    const ROADS = [
      { name: 'Itu Road', angle: 60, len: 480, width: 14 },
      { name: 'Nwaniba Road', angle: 10, len: 520, width: 14 },
      { name: 'Oron Road', angle: -38, len: 540, width: 16 },
      { name: 'Aka Road', angle: -92, len: 480, width: 13 },
      { name: 'Abak Road', angle: -145, len: 510, width: 14 },
      { name: 'Ikot Ekpene Road', angle: 156, len: 520, width: 14 },
      { name: 'Wellington Bassey Way', angle: 110, len: 380, width: 13 },
    ];

    // Streetlight poles along roads
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
    const lightBulbMat = new THREE.MeshBasicMaterial({ color: 0xfffae0 });

    ROADS.forEach((r) => {
      const rad = THREE.MathUtils.degToRad(r.angle);
      const dirX = Math.cos(rad);
      const dirZ = -Math.sin(rad);

      const midX = dirX * (PLAZA_RADIUS + r.len / 2);
      const midZ = dirZ * (PLAZA_RADIUS + r.len / 2);

      const roadMesh = new THREE.Mesh(new THREE.PlaneGeometry(r.len, r.width), roadMat);
      roadMesh.rotation.x = -Math.PI / 2;
      roadMesh.rotation.z = rad;
      roadMesh.position.set(midX, 0.06, midZ);
      roadMesh.receiveShadow = true;
      roadGroup.add(roadMesh);

      // Yellow curbs
      const curbLeft = new THREE.Mesh(new THREE.PlaneGeometry(r.len, 0.5), curbMat);
      curbLeft.rotation.x = -Math.PI / 2;
      curbLeft.rotation.z = rad;
      const perpX = -dirZ;
      const perpZ = dirX;
      curbLeft.position.set(midX + perpX * (r.width / 2), 0.08, midZ + perpZ * (r.width / 2));
      roadGroup.add(curbLeft);

      const curbRight = new THREE.Mesh(new THREE.PlaneGeometry(r.len, 0.5), curbMat);
      curbRight.rotation.x = -Math.PI / 2;
      curbRight.rotation.z = rad;
      curbRight.position.set(midX - perpX * (r.width / 2), 0.08, midZ - perpZ * (r.width / 2));
      roadGroup.add(curbRight);

      // Dashed lane lines
      for (let s = PLAZA_RADIUS + 12; s < PLAZA_RADIUS + r.len; s += 16) {
        const dash = new THREE.Mesh(new THREE.PlaneGeometry(7, 0.45), laneMat);
        dash.rotation.x = -Math.PI / 2;
        dash.rotation.z = rad;
        dash.position.set(dirX * s, 0.09, dirZ * s);
        roadGroup.add(dash);
      }

      // Add solar streetlights at intervals
      for (let s = PLAZA_RADIUS + 30; s < PLAZA_RADIUS + r.len; s += 70) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 9, 8), poleMat);
        pole.position.set(dirX * s + perpX * (r.width / 2 + 1.2), 4.5, dirZ * s + perpZ * (r.width / 2 + 1.2));
        pole.castShadow = true;
        scene.add(pole);

        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), lightBulbMat);
        bulb.position.set(pole.position.x - perpX * 0.8, 9, pole.position.z - perpZ * 0.8);
        scene.add(bulb);
      }
    });

    // Outer Ring Road
    const RING_RADIUS = 280;
    const ringMesh = new THREE.Mesh(new THREE.RingGeometry(RING_RADIUS - 7, RING_RADIUS + 7, 96), roadMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.06;
    ringMesh.receiveShadow = true;
    roadGroup.add(ringMesh);

    // ---------------- Build Signature Landmarks ----------------
    // 1. Ibom Plaza (Center)
    const plazaGroup = new THREE.Group();
    const plazaLawn = new THREE.Mesh(
      new THREE.CylinderGeometry(PLAZA_RADIUS - 8, PLAZA_RADIUS - 8, 0.9, 48),
      new THREE.MeshStandardMaterial({ color: 0x1fc16b, roughness: 0.8 })
    );
    plazaLawn.position.y = 0.45;
    plazaLawn.receiveShadow = true;
    plazaGroup.add(plazaLawn);

    const archMat = new THREE.MeshStandardMaterial({ color: 0xf4eedb, roughness: 0.4 });
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 5) {
      const colX = Math.cos(a) * (PLAZA_RADIUS - 14);
      const colZ = Math.sin(a) * (PLAZA_RADIUS - 14);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 12, 16), archMat);
      col.position.set(colX, 6, colZ);
      col.castShadow = true;
      plazaGroup.add(col);
    }
    const crown = new THREE.Mesh(new THREE.TorusGeometry(PLAZA_RADIUS - 14, 0.8, 12, 48), archMat);
    crown.rotation.x = Math.PI / 2;
    crown.position.y = 12;
    crown.castShadow = true;
    plazaGroup.add(crown);

    const pool = new THREE.Mesh(
      new THREE.CylinderGeometry(7, 7, 1.2, 32),
      new THREE.MeshStandardMaterial({ color: 0x1b709e, roughness: 0.1, metalness: 0.3 })
    );
    pool.position.y = 0.6;
    plazaGroup.add(pool);

    const monument = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 1.4, 16, 8),
      new THREE.MeshStandardMaterial({ color: 0xf26522, roughness: 0.3, metalness: 0.8 })
    );
    monument.position.y = 8;
    monument.castShadow = true;
    plazaGroup.add(monument);

    // Animated Fountain Spray Particles at Ibom Plaza
    const fCount = 180;
    const fGeo = new THREE.BufferGeometry();
    const fPos = new Float32Array(fCount * 3);
    for (let i = 0; i < fCount * 3; i += 3) {
      fPos[i] = (Math.random() - 0.5) * 4;
      fPos[i + 1] = 1 + Math.random() * 7;
      fPos[i + 2] = (Math.random() - 0.5) * 4;
    }
    fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
    const fMat = new THREE.PointsMaterial({ color: 0xbae6fd, size: 0.3, transparent: true, opacity: 0.8 });
    const fPoints = new THREE.Points(fGeo, fMat);
    plazaGroup.add(fPoints);
    fountainParticlesRef.current = fPoints;

    scene.add(plazaGroup);

    // 2. Dakkada Tower (21-story smart glass building at [110, 0, -85])
    const dakkadaGroup = new THREE.Group();
    dakkadaGroup.position.set(110, 0, -85);

    const dakkadaBase = new THREE.Mesh(
      new THREE.BoxGeometry(32, 4, 32),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 })
    );
    dakkadaBase.position.y = 2;
    dakkadaGroup.add(dakkadaBase);

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      metalness: 0.85,
      roughness: 0.15,
      transparent: true,
      opacity: 0.92,
    });
    const dakkadaTower = new THREE.Mesh(new THREE.BoxGeometry(18, 76, 18), glassMat);
    dakkadaTower.position.y = 42;
    dakkadaTower.castShadow = true;
    dakkadaGroup.add(dakkadaTower);

    const finMat = new THREE.MeshStandardMaterial({ color: 0xf26522, metalness: 0.4, roughness: 0.4 });
    const fin1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 82, 19), finMat);
    fin1.position.y = 45;
    dakkadaGroup.add(fin1);

    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.6, 16, 8), finMat);
    mast.position.y = 86;
    dakkadaGroup.add(mast);

    const beacon = new THREE.PointLight(0xf26522, 2.5, 90);
    beacon.position.y = 94;
    dakkadaGroup.add(beacon);

    scene.add(dakkadaGroup);

    // 3. Godswill Akpabio International Stadium ("Nest of Champions" at [-160, 0, -140])
    const stadiumGroup = new THREE.Group();
    stadiumGroup.position.set(-160, 0, -140);

    const bowlGeo = new THREE.CylinderGeometry(46, 38, 22, 48, 1, true);
    const bowlMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.4,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });
    const stadiumBowl = new THREE.Mesh(bowlGeo, bowlMat);
    stadiumBowl.position.y = 11;
    stadiumBowl.castShadow = true;
    stadiumGroup.add(stadiumBowl);

    const pitch = new THREE.Mesh(
      new THREE.BoxGeometry(48, 1, 30),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 })
    );
    pitch.position.y = 1.5;
    stadiumGroup.add(pitch);

    // Goalposts on pitch
    const postMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const goal1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.5, 6), postMat);
    goal1.position.set(-22, 2.5, 0);
    stadiumGroup.add(goal1);
    const goal2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.5, 6), postMat);
    goal2.position.set(22, 2.5, 0);
    stadiumGroup.add(goal2);

    const towerCoords = [
      [-42, -32],
      [42, -32],
      [-42, 32],
      [42, 32],
    ];
    towerCoords.forEach(([tx, tz]) => {
      const floodMast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 1.2, 34, 8),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7 })
      );
      floodMast.position.set(tx, 17, tz);
      stadiumGroup.add(floodMast);

      const lightBox = new THREE.Mesh(
        new THREE.BoxGeometry(4, 2, 2),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      lightBox.position.set(tx, 34, tz);
      stadiumGroup.add(lightBox);
    });

    scene.add(stadiumGroup);

    // 4. Ibom Tropicana Dome at [130, 0, 95]
    const tropicanaGroup = new THREE.Group();
    tropicanaGroup.position.set(130, 0, 95);
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(24, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.25 })
    );
    dome.castShadow = true;
    tropicanaGroup.add(dome);

    const arcadeBase = new THREE.Mesh(
      new THREE.BoxGeometry(68, 6, 44),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 })
    );
    arcadeBase.position.y = 3;
    tropicanaGroup.add(arcadeBase);
    scene.add(tropicanaGroup);

    // 5. University of Uyo at [45, 0, 160]
    const uniuyoGroup = new THREE.Group();
    uniuyoGroup.position.set(45, 0, 160);
    const uniMain = new THREE.Mesh(
      new THREE.BoxGeometry(50, 14, 24),
      new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.7 })
    );
    uniMain.position.y = 7;
    uniMain.castShadow = true;
    uniuyoGroup.add(uniMain);

    const clockTower = new THREE.Mesh(
      new THREE.BoxGeometry(10, 28, 10),
      new THREE.MeshStandardMaterial({ color: 0xf4eedb, roughness: 0.5 })
    );
    clockTower.position.set(0, 14, 0);
    clockTower.castShadow = true;
    uniuyoGroup.add(clockTower);
    scene.add(uniuyoGroup);

    // 6. Unity Park Lake at [-60, 0, 140]
    const parkGroup = new THREE.Group();
    parkGroup.position.set(-60, 0, 140);
    const parkLake = new THREE.Mesh(
      new THREE.CylinderGeometry(28, 28, 0.4, 32),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.4 })
    );
    parkLake.position.y = 0.2;
    parkGroup.add(parkLake);

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
    for (let p = 0; p < 12; p++) {
      const angle = (p / 12) * Math.PI * 2;
      const px = Math.cos(angle) * 36;
      const pz = Math.sin(angle) * 36;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 9, 8), trunkMat);
      trunk.position.set(px, 4.5, pz);
      parkGroup.add(trunk);

      const crownTree = new THREE.Mesh(new THREE.ConeGeometry(3.5, 5, 8), leafMat);
      crownTree.position.set(px, 9.5, pz);
      parkGroup.add(crownTree);
    }
    scene.add(parkGroup);

    // 7. Billboard signs across arterial junctions
    const billboardMat = new THREE.MeshBasicMaterial({ color: 0xf26522 });
    const boardPositions = [
      { x: 30, z: -35, rot: 0.4, text: 'DAKKADA' },
      { x: -38, z: -25, rot: -0.6, text: 'SUPER EAGLES' },
      { x: -20, z: 42, rot: 1.8, text: 'IBOM AIR' },
    ];
    boardPositions.forEach((bp) => {
      const boardGroup = new THREE.Group();
      boardGroup.position.set(bp.x, 0, bp.z);
      boardGroup.rotation.y = bp.rot;

      const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 10), poleMat);
      p1.position.set(-3.5, 5, 0);
      boardGroup.add(p1);
      const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 10), poleMat);
      p2.position.set(3.5, 5, 0);
      boardGroup.add(p2);

      const panel = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 0.3), billboardMat);
      panel.position.set(0, 8, 0);
      boardGroup.add(panel);
      scene.add(boardGroup);
    });

    // ---------------- Playable Vehicle Setup ----------------
    const vehicleGroup = new THREE.Group();
    vehicleGroup.position.copy(vehicleStateRef.current.pos);

    // Dynamic vehicle geometry builder based on model
    const buildVehicleMesh = (model: VehicleModel, colorHex: string) => {
      // Clear previous child meshes
      while (vehicleGroup.children.length > 0) {
        vehicleGroup.remove(vehicleGroup.children[0]);
      }
      wheelsRef.current = [];
      headlightsRef.current = [];

      const vMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        roughness: 0.35,
        metalness: 0.65,
      });

      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
      const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.36, 16);
      wheelGeo.rotateZ(Math.PI / 2);

      if (model === 'keke') {
        // --- KEKE NAPEP (Tricycle) ---
        // Lower body
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, 2.8), vMat);
        cabin.position.y = 0.8;
        cabin.castShadow = true;
        vehicleGroup.add(cabin);

        // Open canopy roof
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
        const roof = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.1, 2.5), roofMat);
        roof.position.set(0, 1.85, -0.15);
        vehicleGroup.add(roof);

        // Canopy support pillars
        const pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.95);
        const pMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
        [-0.85, 0.85].forEach((px) => {
          [-1.2, 1.1].forEach((pz) => {
            const pillar = new THREE.Mesh(pillarGeo, pMat);
            pillar.position.set(px, 1.35, pz);
            vehicleGroup.add(pillar);
          });
        });

        // 3 Wheels: 1 front, 2 rear
        const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
        frontWheel.position.set(0, 0.48, 1.4);
        frontWheel.castShadow = true;
        vehicleGroup.add(frontWheel);

        const rearLeft = new THREE.Mesh(wheelGeo, wheelMat);
        rearLeft.position.set(-0.95, 0.48, -1.0);
        rearLeft.castShadow = true;
        vehicleGroup.add(rearLeft);

        const rearRight = new THREE.Mesh(wheelGeo, wheelMat);
        rearRight.position.set(0.95, 0.48, -1.0);
        rearRight.castShadow = true;
        vehicleGroup.add(rearRight);

        wheelsRef.current = [frontWheel, frontWheel, rearLeft, rearRight];
      } else if (model === 'coupe') {
        // --- DAKKADA GT TURBO COUPE ---
        const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.7, 4.9), vMat);
        bodyMesh.position.y = 0.65;
        bodyMesh.castShadow = true;
        vehicleGroup.add(bodyMesh);

        // Slanted cockpit
        const cabinMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.95 });
        const cabinMesh = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.65, 2.5), cabinMat);
        cabinMesh.position.set(0, 1.25, -0.3);
        cabinMesh.castShadow = true;
        vehicleGroup.add(cabinMesh);

        // Rear Wing Spoiler
        const wing = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 0.5), vMat);
        wing.position.set(0, 1.25, -2.2);
        vehicleGroup.add(wing);

        // 4 Low-profile Wheels
        const wheelOffsets = [
          [-1.22, 0.45, 1.5],
          [1.22, 0.45, 1.5],
          [-1.22, 0.45, -1.5],
          [1.22, 0.45, -1.5],
        ];
        wheelOffsets.forEach(([wx, wy, wz]) => {
          const wheel = new THREE.Mesh(wheelGeo, wheelMat);
          wheel.position.set(wx, wy, wz);
          wheel.castShadow = true;
          vehicleGroup.add(wheel);
          wheelsRef.current.push(wheel);
        });
      } else if (model === 'bus') {
        // --- AKTC INTERSTATE BUS ---
        const busBody = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.2, 7.5), vMat);
        busBody.position.y = 1.6;
        busBody.castShadow = true;
        vehicleGroup.add(busBody);

        const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.8 });
        const windows = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.8, 6.5), glassMat);
        windows.position.set(0, 2.1, 0);
        vehicleGroup.add(windows);

        // 4 heavy wheels
        const wheelOffsets = [
          [-1.35, 0.55, 2.4],
          [1.35, 0.55, 2.4],
          [-1.35, 0.55, -2.4],
          [1.35, 0.55, -2.4],
        ];
        wheelOffsets.forEach(([wx, wy, wz]) => {
          const wheel = new THREE.Mesh(wheelGeo, wheelMat);
          wheel.position.set(wx, wy, wz);
          wheel.castShadow = true;
          vehicleGroup.add(wheel);
          wheelsRef.current.push(wheel);
        });
      } else {
        // --- DEFAULT UYO TAXI ---
        const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 4.8), vMat);
        bodyMesh.position.y = 0.75;
        bodyMesh.castShadow = true;
        vehicleGroup.add(bodyMesh);

        const cabinMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 });
        const cabinMesh = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.75, 2.6), cabinMat);
        cabinMesh.position.set(0, 1.45, -0.2);
        cabinMesh.castShadow = true;
        vehicleGroup.add(cabinMesh);

        const decalMat = new THREE.MeshStandardMaterial({ color: 0x1fc16b, roughness: 0.5 });
        const decalStripe = new THREE.Mesh(new THREE.BoxGeometry(2.12, 0.1, 0.6), decalMat);
        decalStripe.position.set(0, 1.85, -0.2);
        vehicleGroup.add(decalStripe);

        const wheelOffsets = [
          [-1.25, 0.48, 1.4],
          [1.25, 0.48, 1.4],
          [-1.25, 0.48, -1.4],
          [1.25, 0.48, -1.4],
        ];
        wheelOffsets.forEach(([wx, wy, wz]) => {
          const wheel = new THREE.Mesh(wheelGeo, wheelMat);
          wheel.position.set(wx, wy, wz);
          wheel.castShadow = true;
          vehicleGroup.add(wheel);
          wheelsRef.current.push(wheel);
        });
      }

      // Twin headlights
      const spotLeft = new THREE.SpotLight(0xfffaed, 3.5, 75, Math.PI / 6, 0.4, 1);
      spotLeft.position.set(-0.8, 0.8, 2.4);
      spotLeft.target.position.set(-0.8, 0.2, 20);
      vehicleGroup.add(spotLeft);
      vehicleGroup.add(spotLeft.target);

      const spotRight = new THREE.SpotLight(0xfffaed, 3.5, 75, Math.PI / 6, 0.4, 1);
      spotRight.position.set(0.8, 0.8, 2.4);
      spotRight.target.position.set(0.8, 0.2, 20);
      vehicleGroup.add(spotRight);
      vehicleGroup.add(spotRight.target);
      headlightsRef.current = [spotLeft, spotRight];

      // Taillights
      const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const tailLeft = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.1), tailMat);
      tailLeft.position.set(-0.85, 0.8, -2.42);
      vehicleGroup.add(tailLeft);

      const tailRight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.1), tailMat);
      tailRight.position.set(0.85, 0.8, -2.42);
      vehicleGroup.add(tailRight);
      taillightsRef.current = tailMat;

      // Neon Underglow
      if (customization.neonUnderglow !== 'none') {
        const underglow = new THREE.PointLight(new THREE.Color(customization.neonUnderglow), 2.2, 14);
        underglow.position.set(0, 0.2, 0);
        vehicleGroup.add(underglow);
        underglowLightRef.current = underglow;
      }
    };

    buildVehicleMesh(vehicleModel, customization.color);
    scene.add(vehicleGroup);
    vehicleGroupRef.current = vehicleGroup;

    // ---------------- Playable On-Foot Avatar ----------------
    const avatarGroup = new THREE.Group();
    avatarGroup.position.copy(avatarStateRef.current.pos);

    // Torso
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x0e4b25, roughness: 0.6 });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.4), torsoMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    avatarGroup.add(torso);

    // Head
    const headMat = new THREE.MeshStandardMaterial({ color: 0x8d5b4c, roughness: 0.8 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), headMat);
    head.position.y = 2.05;
    head.castShadow = true;
    avatarGroup.add(head);

    // Cap with orange visor
    const capMat = new THREE.MeshStandardMaterial({ color: 0xf26522 });
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.26, 0.14, 12), capMat);
    cap.position.y = 2.22;
    avatarGroup.add(cap);

    // Legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.85, 0.24), legMat);
    leftLeg.position.set(-0.2, 0.45, 0);
    avatarGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.85, 0.24), legMat);
    rightLeg.position.set(0.2, 0.45, 0);
    avatarGroup.add(rightLeg);

    // Arms
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.8, 0.18), torsoMat);
    leftArm.position.set(-0.48, 1.35, 0);
    avatarGroup.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.8, 0.18), torsoMat);
    rightArm.position.set(0.48, 1.35, 0);
    avatarGroup.add(rightArm);

    avatarLimbsRef.current = { leftLeg, rightLeg, leftArm, rightArm };
    avatarGroup.visible = playerMode === 'walking';
    scene.add(avatarGroup);
    avatarGroupRef.current = avatarGroup;

    // ---------------- Mission Waypoint Beacon ----------------
    const waypointGeo = new THREE.CylinderGeometry(0.1, 8, 48, 32, 1, true);
    const waypointMat = new THREE.MeshBasicMaterial({
      color: 0x1fc16b,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const waypointMesh = new THREE.Mesh(waypointGeo, waypointMat);
    waypointMesh.position.set(0, 24, 0);
    scene.add(waypointMesh);
    waypointMeshRef.current = waypointMesh;

    const waypointLight = new THREE.PointLight(0x1fc16b, 3, 60);
    waypointLight.position.set(0, 10, 0);
    scene.add(waypointLight);
    waypointLightRef.current = waypointLight;

    // ---------------- Tropical Rain System ----------------
    const rainCount = 1800;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPositions[i] = (Math.random() - 0.5) * 350;
      rainPositions[i + 1] = Math.random() * 120;
      rainPositions[i + 2] = (Math.random() - 0.5) * 350;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.45,
      transparent: true,
      opacity: 0.65,
    });
    const rainSystem = new THREE.Points(rainGeo, rainMat);
    rainSystem.visible = false;
    scene.add(rainSystem);
    rainSystemRef.current = rainSystem;

    // ---------------- Nitrous Boost Flame Particles ----------------
    const nitroCount = 120;
    const nitroGeo = new THREE.BufferGeometry();
    const nitroPos = new Float32Array(nitroCount * 3);
    for (let i = 0; i < nitroCount * 3; i += 3) {
      nitroPos[i] = (Math.random() - 0.5) * 0.4;
      nitroPos[i + 1] = (Math.random() - 0.5) * 0.4;
      nitroPos[i + 2] = -Math.random() * 3.5;
    }
    nitroGeo.setAttribute('position', new THREE.BufferAttribute(nitroPos, 3));
    const nitroMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.35,
      transparent: true,
      opacity: 0.9,
    });
    const nitroSystem = new THREE.Points(nitroGeo, nitroMat);
    nitroSystem.visible = false;
    vehicleGroup.add(nitroSystem);
    nitroParticlesRef.current = nitroSystem;

    // ---------------- Cultural Collectibles 3D Medallions ----------------
    const artList: { id: string; mesh: THREE.Group }[] = [];
    artifacts.forEach((art) => {
      const artGroup = new THREE.Group();
      artGroup.position.set(art.position[0], art.position[1], art.position[2]);

      const gem = new THREE.Mesh(
        new THREE.OctahedronGeometry(1.2, 0),
        new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xf59e0b,
          emissiveIntensity: 0.4,
          roughness: 0.2,
          metalness: 0.8,
        })
      );
      artGroup.add(gem);

      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(1.8, 0.1, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0x1fc16b })
      );
      halo.rotation.x = Math.PI / 2;
      artGroup.add(halo);

      artGroup.visible = !art.collected;
      scene.add(artGroup);
      artList.push({ id: art.id, mesh: artGroup });
    });
    artifactMeshesRef.current = artList;

    // ---------------- Simulated Online Drivers ----------------
    const onlineList: { id: string; group: THREE.Group; labelCanvas: HTMLCanvasElement; textMesh: THREE.Sprite }[] = [];
    ONLINE_DRIVERS.forEach((dr) => {
      const grp = new THREE.Group();
      grp.position.set(dr.x, 0.4, dr.z);
      grp.rotation.y = dr.rot;

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.8, 4.2),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(dr.color), roughness: 0.4 })
      );
      body.position.y = 0.7;
      body.castShadow = true;
      grp.add(body);

      // Overhead name tag sprite
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(6, 20, 11, 0.85)';
        ctx.roundRect(0, 0, 256, 64, 16);
        ctx.fill();
        ctx.fillStyle = '#1fc16b';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(dr.name, 128, 28);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px sans-serif';
        ctx.fillText(dr.statusMessage?.slice(0, 24) || 'Cruising Uyo', 128, 50);
      }
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(0, 3.2, 0);
      sprite.scale.set(6, 1.5, 1);
      grp.add(sprite);

      scene.add(grp);
      onlineList.push({ id: dr.id, group: grp, labelCanvas: canvas, textMesh: sprite });
    });
    onlineDriverMeshesRef.current = onlineList;

    // ---------------- Keyboard Event Listeners ----------------
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
      }

      soundEngine.startEngine(vehicleModel);

      if (e.key.toLowerCase() === 'h') {
        soundEngine.playHorn();
      } else if (e.key.toLowerCase() === 'c') {
        const modes: CameraMode[] = ['chase', 'hood', 'orbit', 'flyover'];
        const nextIdx = (modes.indexOf(cameraMode) + 1) % modes.length;
        onCameraModeChange(modes[nextIdx]);
      } else if (e.key.toLowerCase() === 'e') {
        // Toggle Driving / Walking
        if (playerMode === 'driving') {
          // Exit car
          const v = vehicleStateRef.current;
          avatarStateRef.current.pos.set(v.pos.x + 2.5, 0, v.pos.z);
          avatarStateRef.current.rotY = v.rotY;
          onPlayerModeChange('walking');
        } else {
          // Re-enter car if close
          const v = vehicleStateRef.current;
          const a = avatarStateRef.current;
          const dist = Math.hypot(a.pos.x - v.pos.x, a.pos.z - v.pos.z);
          if (dist < 12) {
            onPlayerModeChange('driving');
          }
        }
      } else if (e.key.toLowerCase() === 'r') {
        vehicleStateRef.current.pos.set(0, 0.4, 75);
        vehicleStateRef.current.rotY = 0;
        vehicleStateRef.current.speed = 0;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // ---------------- Main Render & Physics Loop ----------------
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const keys = keysPressed.current;
      const isUp = keys['w'] || keys['arrowup'];
      const isDown = keys['s'] || keys['arrowdown'];
      const isLeft = keys['a'] || keys['arrowleft'];
      const isRight = keys['d'] || keys['arrowright'];
      const isSpace = keys[' '];
      const isShift = keys['shift'];

      // ---------- DRIVING SIMULATION ----------
      const v = vehicleStateRef.current;

      // Model adjustments
      let speedMultiplier = 1.0;
      let accelMultiplier = 1.0;
      let turnMultiplier = 1.0;
      if (vehicleModel === 'keke') {
        speedMultiplier = 0.72;
        accelMultiplier = 1.15;
        turnMultiplier = 1.45;
      } else if (vehicleModel === 'coupe') {
        speedMultiplier = 1.55;
        accelMultiplier = 1.4;
        turnMultiplier = 1.1;
      } else if (vehicleModel === 'bus') {
        speedMultiplier = 0.85;
        accelMultiplier = 0.75;
        turnMultiplier = 0.7;
      }

      // Nitro boost
      let isBoosting = false;
      if (playerMode === 'driving' && isShift && v.nitro > 0 && Math.abs(v.speed) > 5) {
        isBoosting = true;
        v.nitro = Math.max(0, v.nitro - delta * 30);
        soundEngine.playNitroSound(true);
      } else {
        v.nitro = Math.min(100, v.nitro + delta * 12);
        soundEngine.playNitroSound(false);
      }
      v.isNitroActive = isBoosting;

      if (nitroParticlesRef.current) {
        nitroParticlesRef.current.visible = isBoosting;
      }

      if (playerMode === 'driving') {
        const currentAccel = (v.accel * accelMultiplier + (isBoosting ? 26 : 0)) * (1 + customization.engineStage * 0.15);
        const topLimit = (v.maxSpeed * speedMultiplier + (isBoosting ? 22 : 0)) * (1 + customization.engineStage * 0.12);

        if (isUp) {
          v.speed += currentAccel * delta;
          if (v.speed > topLimit) v.speed = topLimit;
        } else if (isDown) {
          if (v.speed > 2) {
            v.speed -= v.accel * 1.6 * delta;
            v.isBraking = true;
          } else {
            v.speed -= v.accel * 0.7 * delta;
            if (v.speed < -topLimit * 0.45) v.speed = -topLimit * 0.45;
            v.isBraking = false;
          }
        } else {
          v.speed *= Math.pow(v.friction, delta * 60);
          if (Math.abs(v.speed) < 0.05) v.speed = 0;
          v.isBraking = false;
        }

        if (isSpace) {
          v.speed *= 0.92;
          v.isBraking = true;
        }

        // Steering
        if (isLeft) {
          v.targetSteering = 0.55 * turnMultiplier;
        } else if (isRight) {
          v.targetSteering = -0.55 * turnMultiplier;
        } else {
          v.targetSteering = 0;
        }
        v.steering += (v.targetSteering - v.steering) * delta * 8;

        if (Math.abs(v.speed) > 0.1) {
          const turnDirection = v.speed > 0 ? 1 : -1;
          v.rotY += v.steering * turnDirection * (Math.abs(v.speed) / topLimit + 0.3) * delta * 2.2;
        }

        const forwardX = Math.sin(v.rotY);
        const forwardZ = Math.cos(v.rotY);
        v.pos.x += forwardX * v.speed * delta;
        v.pos.z += forwardZ * v.speed * delta;

        v.pos.x = THREE.MathUtils.clamp(v.pos.x, -700, 700);
        v.pos.z = THREE.MathUtils.clamp(v.pos.z, -700, 700);

        soundEngine.updateEnginePitch(v.speed / topLimit, isUp, isBoosting);
      } else {
        // Coasting when out of vehicle
        v.speed *= 0.95;
        v.isBraking = true;
      }

      // Update vehicle mesh transform
      if (vehicleGroupRef.current) {
        vehicleGroupRef.current.position.set(v.pos.x, 0.4, v.pos.z);
        vehicleGroupRef.current.rotation.y = v.rotY;

        const rollTilt = -v.steering * (Math.abs(v.speed) / 42) * 0.08;
        vehicleGroupRef.current.rotation.z = rollTilt;

        wheelsRef.current.forEach((wheel, index) => {
          wheel.rotation.x += (v.speed / 1.5) * delta;
          if (index < 2) wheel.rotation.y = v.steering * 0.7;
        });

        if (taillightsRef.current) {
          taillightsRef.current.color.setHex(v.isBraking ? 0xff0000 : 0x7f1d1d);
        }
      }

      // Notify parent about telemetry
      onVehicleUpdate({
        x: v.pos.x,
        z: v.pos.z,
        speed: Math.round(Math.abs(v.speed) * 3.6),
        rotation: v.rotY,
        steering: v.steering,
        isBraking: v.isBraking,
        nitroRemaining: Math.round(v.nitro),
        isNitroActive: v.isNitroActive,
        health: Math.round(v.health),
        gear: Math.max(1, Math.min(6, Math.ceil((Math.abs(v.speed) / 45) * 6))),
        model: vehicleModel,
      });

      // ---------- ON-FOOT AVATAR SIMULATION ----------
      const a = avatarStateRef.current;
      if (playerMode === 'walking') {
        const moveSpeed = isShift ? 14 : 7;
        let moving = false;

        if (isUp || isDown || isLeft || isRight) {
          moving = true;
          let moveDir = 0;
          if (isUp) moveDir = 0;
          if (isDown) moveDir = Math.PI;
          if (isLeft) moveDir = Math.PI / 2;
          if (isRight) moveDir = -Math.PI / 2;
          if (isUp && isLeft) moveDir = Math.PI / 4;
          if (isUp && isRight) moveDir = -Math.PI / 4;
          if (isDown && isLeft) moveDir = (3 * Math.PI) / 4;
          if (isDown && isRight) moveDir = (-3 * Math.PI) / 4;

          a.rotY = moveDir;
          a.pos.x += Math.sin(a.rotY) * moveSpeed * delta;
          a.pos.z += Math.cos(a.rotY) * moveSpeed * delta;
        }

        // Jump physics
        if (isSpace && !a.isJumping) {
          a.isJumping = true;
          a.verticalVelocity = 9;
        }
        if (a.isJumping) {
          a.pos.y += a.verticalVelocity * delta;
          a.verticalVelocity -= 22 * delta; // gravity
          if (a.pos.y <= 0) {
            a.pos.y = 0;
            a.isJumping = false;
            a.verticalVelocity = 0;
          }
        }

        a.isWalking = moving && !isShift;
        a.isRunning = moving && isShift;

        // Limb swinging animation
        if (avatarLimbsRef.current) {
          const swing = moving ? Math.sin(time * 0.012) * 0.6 : 0;
          avatarLimbsRef.current.leftLeg.rotation.x = swing;
          avatarLimbsRef.current.rightLeg.rotation.x = -swing;
          avatarLimbsRef.current.leftArm.rotation.x = -swing;
          avatarLimbsRef.current.rightArm.rotation.x = swing;
        }

        if (avatarGroupRef.current) {
          avatarGroupRef.current.position.set(a.pos.x, a.pos.y, a.pos.z);
          avatarGroupRef.current.rotation.y = a.rotY;
        }

        onAvatarUpdate({
          x: a.pos.x,
          z: a.pos.z,
          rotation: a.rotY,
          speed: moving ? (isShift ? 20 : 10) : 0,
          isWalking: a.isWalking,
          isRunning: a.isRunning,
          isJumping: a.isJumping,
        });

        checkProximity(a.pos);
      } else {
        checkProximity(v.pos);
      }

      if (avatarGroupRef.current) {
        avatarGroupRef.current.visible = playerMode === 'walking';
      }

      // Camera follow target (Vehicle or Avatar)
      const targetPos = playerMode === 'walking' ? a.pos : v.pos;
      const forwardX = playerMode === 'walking' ? Math.sin(a.rotY) : Math.sin(v.rotY);
      const forwardZ = playerMode === 'walking' ? Math.cos(a.rotY) : Math.cos(v.rotY);

      if (cameraRef.current) {
        if (cameraMode === 'chase') {
          const camDist = playerMode === 'walking' ? 8 : isBoosting ? 22 : 18;
          const camHeight = playerMode === 'walking' ? 4 : 7.5;
          const targetCamX = targetPos.x - forwardX * camDist;
          const targetCamZ = targetPos.z - forwardZ * camDist;
          cameraRef.current.position.lerp(new THREE.Vector3(targetCamX, targetPos.y + camHeight, targetCamZ), 0.12);
          cameraRef.current.lookAt(targetPos.x + forwardX * 6, targetPos.y + 2, targetPos.z + forwardZ * 6);
        } else if (cameraMode === 'hood') {
          const hoodCamX = targetPos.x + forwardX * 1.5;
          const hoodCamZ = targetPos.z + forwardZ * 1.5;
          cameraRef.current.position.set(hoodCamX, targetPos.y + 1.6, hoodCamZ);
          cameraRef.current.lookAt(targetPos.x + forwardX * 30, targetPos.y + 1.2, targetPos.z + forwardZ * 30);
        } else if (cameraMode === 'orbit') {
          const orbitRadius = 65;
          const orbitAngle = time * 0.0003;
          cameraRef.current.position.set(
            targetPos.x + Math.sin(orbitAngle) * orbitRadius,
            targetPos.y + 42,
            targetPos.z + Math.cos(orbitAngle) * orbitRadius
          );
          cameraRef.current.lookAt(targetPos.x, targetPos.y + 2, targetPos.z);
        } else if (cameraMode === 'flyover') {
          cameraRef.current.position.set(0, 360, 420);
          cameraRef.current.lookAt(0, 0, 0);
        }
      }

      // Animated Collectibles
      artifactMeshesRef.current.forEach(({ mesh }) => {
        mesh.rotation.y += delta * 2;
        mesh.position.y = 1.2 + Math.sin(time * 0.004) * 0.3;
      });

      // Animated Plaza Fountain mist
      if (fountainParticlesRef.current) {
        const pos = fountainParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < pos.length; i += 3) {
          pos[i] += delta * 6;
          if (pos[i] > 8) pos[i] = 1;
        }
        fountainParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Rain Particles
      if (rainSystemRef.current && rainSystemRef.current.visible) {
        const positions = rainSystemRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= 180 * delta;
          if (positions[i] < 0) positions[i] = 120;
        }
        rainSystemRef.current.geometry.attributes.position.needsUpdate = true;
        rainSystemRef.current.position.set(targetPos.x, 0, targetPos.z);
      }

      // Waypoint Pulse
      if (waypointMeshRef.current) {
        waypointMeshRef.current.rotation.y += delta * 1.5;
        const pulse = 1 + Math.sin(time * 0.005) * 0.15;
        waypointMeshRef.current.scale.set(pulse, 1, pulse);
      }

      // Online Drivers AI Patrol
      onlineDriverMeshesRef.current.forEach((od, idx) => {
        od.group.position.x += Math.cos(time * 0.0005 + idx) * delta * 8;
        od.group.position.z += Math.sin(time * 0.0005 + idx) * delta * 8;
      });

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    checkProximity,
    cameraMode,
    playerMode,
    vehicleModel,
    customization,
    onCameraModeChange,
    onPlayerModeChange,
    onVehicleUpdate,
    onAvatarUpdate,
  ]);

  // Weather atmosphere
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (weather === 'tropical_rain') {
      scene.background = new THREE.Color(0x040906);
      scene.fog = new THREE.FogExp2(0x08150d, 0.007);
      if (rainSystemRef.current) rainSystemRef.current.visible = true;
      headlightsRef.current.forEach((l) => (l.intensity = 4.5));
    } else if (weather === 'night_neon') {
      scene.background = new THREE.Color(0x030605);
      scene.fog = new THREE.FogExp2(0x061109, 0.0035);
      if (rainSystemRef.current) rainSystemRef.current.visible = false;
      headlightsRef.current.forEach((l) => (l.intensity = 5.0));
    } else if (weather === 'golden_hour') {
      scene.background = new THREE.Color(0x2d1306);
      scene.fog = new THREE.FogExp2(0x3a190a, 0.0025);
      if (rainSystemRef.current) rainSystemRef.current.visible = false;
      headlightsRef.current.forEach((l) => (l.intensity = 2.0));
    } else if (weather === 'harmattan') {
      scene.background = new THREE.Color(0x261e14);
      scene.fog = new THREE.FogExp2(0x382c1e, 0.006);
      if (rainSystemRef.current) rainSystemRef.current.visible = false;
      headlightsRef.current.forEach((l) => (l.intensity = 3.0));
    } else {
      scene.background = new THREE.Color(0x0e2417);
      scene.fog = new THREE.FogExp2(0x13301f, 0.0022);
      if (rainSystemRef.current) rainSystemRef.current.visible = false;
      headlightsRef.current.forEach((l) => (l.intensity = 1.0));
    }
  }, [weather]);

  // Waypoint position
  useEffect(() => {
    if (!waypointMeshRef.current || !waypointLightRef.current) return;
    if (activeMission && !activeMission.completed) {
      const target = UYO_LANDMARKS.find((l) => l.id === activeMission.targetLandmarkId);
      if (target) {
        waypointMeshRef.current.visible = true;
        waypointLightRef.current.visible = true;
        waypointMeshRef.current.position.set(target.position[0], 24, target.position[2]);
        waypointLightRef.current.position.set(target.position[0], 12, target.position[2]);
      }
    } else {
      waypointMeshRef.current.visible = false;
      waypointLightRef.current.visible = false;
    }
  }, [activeMission]);

  // Collectibles visibility
  useEffect(() => {
    artifactMeshesRef.current.forEach(({ id, mesh }) => {
      const art = artifacts.find((a) => a.id === id);
      if (art) mesh.visible = !art.collected;
    });
  }, [artifacts]);

  // Mobile virtual buttons
  const handleVirtualControl = (key: string, isPressed: boolean) => {
    soundEngine.startEngine(vehicleModel);
    keysPressed.current[key] = isPressed;
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Touch Screen Virtual Controls (Mobile / Tablet / Responsive) */}
      <div
        className="md:hidden absolute bottom-24 left-3 z-20 flex gap-2 select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        <button
          onTouchStart={(e) => { e.preventDefault(); handleVirtualControl('a', true); }}
          onTouchEnd={(e) => { e.preventDefault(); handleVirtualControl('a', false); }}
          onMouseDown={() => handleVirtualControl('a', true)}
          onMouseUp={() => handleVirtualControl('a', false)}
          className="w-14 h-14 rounded-2xl bg-black/80 backdrop-blur-md border border-[#1fc16b]/50 text-white font-bold text-xl active:bg-[#1fc16b] active:text-black flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
          aria-label="Steer Left"
        >
          ◀
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); handleVirtualControl('d', true); }}
          onTouchEnd={(e) => { e.preventDefault(); handleVirtualControl('d', false); }}
          onMouseDown={() => handleVirtualControl('d', true)}
          onMouseUp={() => handleVirtualControl('d', false)}
          className="w-14 h-14 rounded-2xl bg-black/80 backdrop-blur-md border border-[#1fc16b]/50 text-white font-bold text-xl active:bg-[#1fc16b] active:text-black flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
          aria-label="Steer Right"
        >
          ▶
        </button>
      </div>

      <div
        className="md:hidden absolute bottom-24 right-3 z-20 flex flex-col gap-2 select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        <button
          onTouchStart={(e) => { e.preventDefault(); handleVirtualControl('w', true); }}
          onTouchEnd={(e) => { e.preventDefault(); handleVirtualControl('w', false); }}
          onMouseDown={() => handleVirtualControl('w', true)}
          onMouseUp={() => handleVirtualControl('w', false)}
          className="w-20 h-14 rounded-2xl bg-[#1fc16b] text-black font-orbitron font-black text-sm active:bg-[#179a55] flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
          aria-label="Accelerate"
        >
          {playerMode === 'walking' ? 'WALK' : 'GAS ⚡'}
        </button>
        <div className="flex gap-2 justify-end">
          <button
            onTouchStart={(e) => { e.preventDefault(); handleVirtualControl('shift', true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleVirtualControl('shift', false); }}
            onMouseDown={() => handleVirtualControl('shift', true)}
            onMouseUp={() => handleVirtualControl('shift', false)}
            className="w-9 h-12 rounded-xl bg-sky-500 text-white font-orbitron font-bold text-[10px] active:bg-sky-400 flex items-center justify-center shadow-xl active:scale-95 transition-transform"
            aria-label="Nitro Boost"
          >
            NOS
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); handleVirtualControl('s', true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleVirtualControl('s', false)} }
            onMouseDown={() => handleVirtualControl('s', true)}
            onMouseUp={() => handleVirtualControl('s', false)}
            className="w-10 h-12 rounded-xl bg-red-500 text-white font-orbitron font-bold text-[10px] active:bg-red-400 flex items-center justify-center shadow-xl active:scale-95 transition-transform"
            aria-label="Reverse Brake"
          >
            BRAKE
          </button>
        </div>
      </div>
    </div>
  );
};
