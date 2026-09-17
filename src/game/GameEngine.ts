import * as THREE from 'three';
import {
  Lane,
  ObstacleType,
  PowerUpType,
  RunStats,
} from '../types';
import { sound } from '../services/audio';
import { triggerHaptic } from '../services/storage';

export interface ActivePowerUpState {
  type: PowerUpType;
  remainingTime: number;
  totalDuration: number;
}

export interface GameEngineCallbacks {
  onScoreUpdate: (stats: {
    score: number;
    coins: number;
    distance: number;
    combo: number;
    speed: number;
    activePowerUps: ActivePowerUpState[];
  }) => void;
  onNearMiss: (scoreBonus: number) => void;
  onGameOver: (stats: RunStats) => void;
}

const LANE_WIDTH = 2.4;
const INITIAL_SPEED = 14;
const MAX_SPEED = 32;
const GRAVITY = -38;
const JUMP_VELOCITY = 14.5;
const SLIDE_DURATION = 0.75; // seconds
const SEGMENT_LENGTH = 40;
const VISIBLE_SEGMENTS = 7;

export class GameEngine {
  private container: HTMLElement;
  private callbacks: GameEngineCallbacks;

  // Three.js Core
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;
  private clock = new THREE.Clock();

  // Player State
  private playerGroup!: THREE.Group;
  private playerMesh!: THREE.Group;
  private shieldMesh!: THREE.Mesh;
  private currentLane: Lane = 0;
  private targetLane: Lane = 0;
  private playerX = 0;
  private playerY = 0;
  private playerZ = 0;
  private verticalVelocity = 0;
  private isGrounded = true;
  private isSliding = false;
  private slideTimer = 0;
  private speed = INITIAL_SPEED;

  // Run Stats
  private isRunning = false;
  private isPaused = false;
  private score = 0;
  private coins = 0;
  private distance = 0;
  private combo = 1;
  private comboTimer = 0;
  private maxCombo = 1;
  private nearMisses = 0;
  private powerUpsCollectedCount = 0;
  private runStartTime = 0;

  // Active Power-ups map
  private activePowerUps = new Map<PowerUpType, { remaining: number; total: number }>();

  // Upgrade bonuses (duration in seconds)
  private upgradeBonus = {
    magnet: 0,
    shield: 0,
    speedBoost: 0,
    doubleCoins: 0,
    scoreMultiplier: 0,
  };

  // Cosmetic Settings
  private characterColor = '#06b6d4';
  private trailColor = '#06b6d4';
  private cameraShakeEnabled = true;
  private motionEffectsEnabled = true;
  private hapticsEnabled = true;

  // Camera Effects
  private cameraShakeIntensity = 0;
  private baseFOV = 65;

  // Object Pools
  private trackSegments: THREE.Group[] = [];
  private nextSegmentZ = 0;
  private activeObstacles: Array<{
    mesh: THREE.Group;
    type: ObstacleType;
    lane: Lane;
    z: number;
    cleared: boolean;
    nearMissChecked: boolean;
    initialLane?: Lane;
    moveDirection?: number;
    moveRange?: number;
    rotationSpeed?: number;
  }> = [];

  private activeCoins: Array<{
    mesh: THREE.Mesh;
    lane: Lane;
    z: number;
    y: number;
    collected: boolean;
  }> = [];

  private activePowerUpItems: Array<{
    mesh: THREE.Group;
    type: PowerUpType;
    lane: Lane;
    z: number;
    y: number;
    collected: boolean;
  }> = [];

  // Environment
  private buildings: THREE.InstancedMesh | null = null;
  private weatherParticles: THREE.Points | null = null;
  private themeColor = new THREE.Color(0x0a0a23);

  // Character limb references for animation
  private leftLeg: THREE.Mesh | null = null;
  private rightLeg: THREE.Mesh | null = null;
  private leftArm: THREE.Mesh | null = null;
  private rightArm: THREE.Mesh | null = null;
  private runAnimPhase = 0;

  // Touch Swipe Handling
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    this.initThree();
    this.createEnvironment();
    this.createPlayer();
    this.initTrack();
    this.bindEvents();

    // Start passive render loop for menu backdrop
    this.startLoop();
  }

  // --- INITIALIZATION ---
  private initThree() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050512);
    this.scene.fog = new THREE.FogExp2(0x050512, 0.014);

    this.camera = new THREE.PerspectiveCamera(this.baseFOV, width / height, 0.1, 300);
    this.camera.position.set(0, 3.2, 5.5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    this.container.appendChild(this.renderer.domElement);

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0x222244, 1.8);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00ffff, 2.2);
    dirLight.position.set(5, 12, 5);
    this.scene.add(dirLight);

    const backNeonLight = new THREE.DirectionalLight(0xff007f, 1.8);
    backNeonLight.position.set(-5, 8, -15);
    this.scene.add(backNeonLight);
  }

  private createEnvironment() {
    // Cyberpunk Horizon Skyscraper Silhouette (Instanced for high FPS)
    const buildingCount = 80;
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0x08081a,
      roughness: 0.3,
      metalness: 0.8,
    });

    this.buildings = new THREE.InstancedMesh(boxGeo, boxMat, buildingCount);
    const matrix = new THREE.Matrix4();
    const dummy = new THREE.Object3D();

    for (let i = 0; i < buildingCount; i++) {
      const isLeft = i % 2 === 0;
      const x = (isLeft ? -1 : 1) * (18 + Math.random() * 35);
      const z = (Math.random() * 260) - 40;
      const height = 15 + Math.random() * 45;
      const width = 8 + Math.random() * 12;
      const depth = 8 + Math.random() * 12;

      dummy.position.set(x, height / 2 - 2, z);
      dummy.scale.set(width, height, depth);
      dummy.updateMatrix();
      this.buildings.setMatrixAt(i, dummy.matrix);
    }
    this.buildings.instanceMatrix.needsUpdate = true;
    this.scene.add(this.buildings);

    // Floating Cyber Dust & Digital Rain Particles
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 40;
      positions[i + 1] = Math.random() * 20;
      positions[i + 2] = (Math.random() - 0.5) * 120;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.22,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    this.weatherParticles = new THREE.Points(particleGeo, particleMat);
    this.scene.add(this.weatherParticles);
  }

  // --- PLAYER MODEL CREATION ---
  private createPlayer() {
    this.playerGroup = new THREE.Group();
    this.playerMesh = new THREE.Group();

    // Torso / Jetpack Cyber Armor
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.characterColor),
      metalness: 0.9,
      roughness: 0.2,
      emissive: new THREE.Color(this.characterColor),
      emissiveIntensity: 0.35,
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x111122,
      metalness: 0.7,
      roughness: 0.4,
    });
    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.characterColor),
    });

    // Chest Core
    const chestGeo = new THREE.BoxGeometry(0.65, 0.75, 0.45);
    const chest = new THREE.Mesh(chestGeo, bodyMat);
    chest.position.y = 0.95;
    this.playerMesh.add(chest);

    // Glowing Neon Cyber Core Arc Reactor
    const coreGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
    const core = new THREE.Mesh(coreGeo, glowMat);
    core.rotation.x = Math.PI / 2;
    core.position.set(0, 0.98, 0.24);
    this.playerMesh.add(core);

    // Cyber Visor / Helmet
    const headGeo = new THREE.BoxGeometry(0.42, 0.45, 0.45);
    const head = new THREE.Mesh(headGeo, darkMat);
    head.position.y = 1.55;
    this.playerMesh.add(head);

    const visorGeo = new THREE.BoxGeometry(0.38, 0.15, 0.1);
    const visor = new THREE.Mesh(visorGeo, glowMat);
    visor.position.set(0, 1.55, 0.22);
    this.playerMesh.add(visor);

    // Limbs with articulation joints for run cycle
    const limbGeo = new THREE.BoxGeometry(0.2, 0.65, 0.22);

    this.leftLeg = new THREE.Mesh(limbGeo, darkMat);
    this.leftLeg.position.set(-0.22, 0.35, 0);
    this.playerMesh.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(limbGeo, darkMat);
    this.rightLeg.position.set(0.22, 0.35, 0);
    this.playerMesh.add(this.rightLeg);

    const armGeo = new THREE.BoxGeometry(0.18, 0.6, 0.18);

    this.leftArm = new THREE.Mesh(armGeo, bodyMat);
    this.leftArm.position.set(-0.46, 0.95, 0);
    this.playerMesh.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, bodyMat);
    this.rightArm.position.set(0.46, 0.95, 0);
    this.playerMesh.add(this.rightArm);

    // Energy Hover Trail Thrusters on boots
    const thrusterGeo = new THREE.CylinderGeometry(0.06, 0.02, 0.15, 8);
    const thrusterL = new THREE.Mesh(thrusterGeo, glowMat);
    thrusterL.position.set(-0.22, 0.05, -0.05);
    this.playerMesh.add(thrusterL);

    const thrusterR = new THREE.Mesh(thrusterGeo, glowMat);
    thrusterR.position.set(0.22, 0.05, -0.05);
    this.playerMesh.add(thrusterR);

    // Shield Dome Forcefield (invisible until active)
    const shieldGeo = new THREE.SphereGeometry(1.2, 24, 24);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0,
      wireframe: true,
      blending: THREE.AdditiveBlending,
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.y = 0.9;
    this.playerMesh.add(this.shieldMesh);

    this.playerGroup.add(this.playerMesh);
    this.scene.add(this.playerGroup);
  }

  // --- PROCEDURAL TRACK CREATION & POOLING ---
  private initTrack() {
    this.nextSegmentZ = 0;
    for (let i = 0; i < VISIBLE_SEGMENTS; i++) {
      this.spawnTrackSegment();
    }
  }

  private createTrackSegmentMesh(): THREE.Group {
    const group = new THREE.Group();

    // Road Surface
    const roadWidth = LANE_WIDTH * 3 + 1.2;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, SEGMENT_LENGTH);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x070714,
      roughness: 0.25,
      metalness: 0.8,
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0;
    group.add(road);

    // Glowing Neon Lane Dividers
    const dividerGeo = new THREE.PlaneGeometry(0.08, SEGMENT_LENGTH);
    const dividerMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.7,
    });

    const dividerL = new THREE.Mesh(dividerGeo, dividerMat);
    dividerL.rotation.x = -Math.PI / 2;
    dividerL.position.set(-LANE_WIDTH / 2, 0.01, 0);
    group.add(dividerL);

    const dividerR = new THREE.Mesh(dividerGeo, dividerMat);
    dividerR.rotation.x = -Math.PI / 2;
    dividerR.position.set(LANE_WIDTH / 2, 0.01, 0);
    group.add(dividerR);

    // Glowing Outer Shoulders (Neon Curbs)
    const curbGeo = new THREE.BoxGeometry(0.25, 0.25, SEGMENT_LENGTH);
    const curbMat = new THREE.MeshBasicMaterial({ color: 0xff007f });

    const curbL = new THREE.Mesh(curbGeo, curbMat);
    curbL.position.set(-roadWidth / 2, 0.12, 0);
    group.add(curbL);

    const curbR = new THREE.Mesh(curbGeo, curbMat);
    curbR.position.set(roadWidth / 2, 0.12, 0);
    group.add(curbR);

    // Cyber Neon Arch every 2 segments
    if (Math.random() > 0.4) {
      const archGroup = new THREE.Group();
      const archMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });

      const pillarL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5, 0.3), archMat);
      pillarL.position.set(-roadWidth / 2 - 0.2, 2.5, 0);
      archGroup.add(pillarL);

      const pillarR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5, 0.3), archMat);
      pillarR.position.set(roadWidth / 2 + 0.2, 2.5, 0);
      archGroup.add(pillarR);

      const crossbar = new THREE.Mesh(new THREE.BoxGeometry(roadWidth + 0.8, 0.3, 0.3), archMat);
      crossbar.position.set(0, 5, 0);
      archGroup.add(crossbar);

      group.add(archGroup);
    }

    return group;
  }

  private spawnTrackSegment() {
    let segment = this.trackSegments.find((s) => s.position.z > this.playerZ + 50);

    if (!segment) {
      segment = this.createTrackSegmentMesh();
      this.scene.add(segment);
      this.trackSegments.push(segment);
    }

    segment.position.set(0, 0, this.nextSegmentZ - SEGMENT_LENGTH / 2);

    // If game is active, procedurally spawn fair obstacles & collectibles on this segment
    if (this.isRunning && this.nextSegmentZ < -25) {
      this.populateSegment(this.nextSegmentZ);
    }

    this.nextSegmentZ -= SEGMENT_LENGTH;
  }

  // --- PROCEDURAL GENERATION (FAIR LANE ASSIGNMENTS) ---
  private populateSegment(segmentZ: number) {
    const laneOptions: Lane[] = [-1, 0, 1];

    // Difficulty curve based on distance
    const distKm = this.distance / 1000;
    const obstacleCount = distKm > 2 ? 3 : distKm > 0.8 ? 2 : 1;

    for (let i = 0; i < obstacleCount; i++) {
      const zOffset = -10 - i * 14;
      const obstacleZ = segmentZ + zOffset;

      // Select obstacle type
      const rand = Math.random();
      let type: ObstacleType = 'BARRIER';
      if (rand < 0.28) type = 'LOW_BARRIER'; // Jump
      else if (rand < 0.52) type = 'HIGH_BARRIER'; // Slide
      else if (rand < 0.72) type = 'BARRIER'; // Dodge
      else if (rand < 0.84) type = 'MOVING_OBSTACLE'; // Sway
      else if (rand < 0.93) type = 'LASER_GATE'; // Pulsing
      else type = 'ROTATING_OBSTACLE';

      // Fair guarantee: randomly pick 1 or 2 lanes to block, leaving at least 1 lane completely free
      const blockedLanes: Lane[] = [];
      const shuffledLanes = [...laneOptions].sort(() => Math.random() - 0.5);

      if (type === 'HIGH_BARRIER' || type === 'LOW_BARRIER') {
        // Can block 1 or 2 lanes (or full lane span with vertical evasion)
        blockedLanes.push(shuffledLanes[0]);
        if (Math.random() > 0.5 && distKm > 0.5) blockedLanes.push(shuffledLanes[1]);
      } else {
        // Lateral obstacles: block at most 2 lanes, never all 3
        blockedLanes.push(shuffledLanes[0]);
        if (Math.random() > 0.65 && distKm > 1) blockedLanes.push(shuffledLanes[1]);
      }

      for (const lane of blockedLanes) {
        this.spawnObstacle(type, lane, obstacleZ);
      }

      // Coins in the open lane or above low barrier
      const openLane = laneOptions.find((l) => !blockedLanes.includes(l)) ?? 0;
      this.spawnCoinPattern(openLane, obstacleZ + 4, type === 'LOW_BARRIER');
    }

    // Power-up chance on segment
    if (Math.random() < 0.35) {
      const powerTypes: PowerUpType[] = ['SHIELD', 'MAGNET', 'DOUBLE_COINS', 'SPEED_BOOST', 'SCORE_MULTIPLIER'];
      const chosen = powerTypes[Math.floor(Math.random() * powerTypes.length)];
      const lane = laneOptions[Math.floor(Math.random() * 3)];
      this.spawnPowerUp(chosen, lane, segmentZ - 18);
    }
  }

  // --- OBSTACLE FACTORY ---
  private spawnObstacle(type: ObstacleType, lane: Lane, z: number) {
    const group = new THREE.Group();
    const x = lane * LANE_WIDTH;

    let moveDirection = 0;
    let moveRange = 0;
    let rotationSpeed = 0;

    if (type === 'BARRIER') {
      // Tall barrier (must lane change)
      const geo = new THREE.BoxGeometry(LANE_WIDTH * 0.88, 2.4, 0.4);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xff0055,
        emissive: 0x990033,
        emissiveIntensity: 0.6,
        roughness: 0.3,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = 1.2;
      group.add(mesh);

      // Neon warning stripes
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(LANE_WIDTH * 0.9, 0.15, 0.42), stripeMat);
      stripe.position.y = 2.0;
      group.add(stripe);

    } else if (type === 'LOW_BARRIER') {
      // Low neon hurdle (must JUMP)
      const geo = new THREE.BoxGeometry(LANE_WIDTH * 0.92, 0.65, 0.4);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x0099cc,
        emissiveIntensity: 0.8,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = 0.33;
      group.add(mesh);

      // Warning Jump Arrow Hologram
      const arrowMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
      const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.5, 4), arrowMat);
      arrow.position.set(0, 1.1, 0);
      group.add(arrow);

    } else if (type === 'HIGH_BARRIER') {
      // High laser girder (must SLIDE)
      const geo = new THREE.BoxGeometry(LANE_WIDTH * 0.95, 1.4, 0.4);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xff9900,
        emissive: 0xcc6600,
        emissiveIntensity: 0.7,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = 1.9; // Leaves clearance under 1.2 for sliding
      group.add(mesh);

      // Danger electric fringe
      const fringeMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });
      const fringe = new THREE.Mesh(new THREE.BoxGeometry(LANE_WIDTH * 0.96, 0.08, 0.42), fringeMat);
      fringe.position.y = 1.18;
      group.add(fringe);

    } else if (type === 'MOVING_OBSTACLE') {
      // Hover drone swaying horizontally
      const geo = new THREE.BoxGeometry(1.2, 1.5, 0.8);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xaa00ff,
        emissive: 0x7700cc,
        emissiveIntensity: 0.7,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = 0.9;
      group.add(mesh);

      moveDirection = 1;
      moveRange = LANE_WIDTH * 0.85;

    } else if (type === 'LASER_GATE') {
      // Vertical pulsating laser gate
      const frameGeo = new THREE.BoxGeometry(0.18, 3.2, 0.2);
      const frameMat = new THREE.MeshBasicMaterial({ color: 0x333366 });
      const leftPillar = new THREE.Mesh(frameGeo, frameMat);
      leftPillar.position.set(-LANE_WIDTH * 0.45, 1.6, 0);
      const rightPillar = new THREE.Mesh(frameGeo, frameMat);
      rightPillar.position.set(LANE_WIDTH * 0.45, 1.6, 0);
      group.add(leftPillar, rightPillar);

      const beamMat = new THREE.MeshBasicMaterial({
        color: 0xff0044,
        transparent: true,
        opacity: 0.85,
      });
      const beam = new THREE.Mesh(new THREE.BoxGeometry(LANE_WIDTH * 0.9, 2.8, 0.08), beamMat);
      beam.position.y = 1.6;
      group.add(beam);

    } else {
      // Rotating laser blades
      const hubGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.3, 8);
      const hubMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
      const hub = new THREE.Mesh(hubGeo, hubMat);
      hub.position.y = 1.4;
      hub.rotation.x = Math.PI / 2;
      group.add(hub);

      const bladeGeo = new THREE.BoxGeometry(2.2, 0.2, 0.1);
      const bladeMat = new THREE.MeshBasicMaterial({ color: 0xff00aa });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.y = 1.4;
      group.add(blade);

      rotationSpeed = 2.5;
    }

    group.position.set(x, 0, z);
    this.scene.add(group);

    this.activeObstacles.push({
      mesh: group,
      type,
      lane,
      z,
      cleared: false,
      nearMissChecked: false,
      initialLane: lane,
      moveDirection,
      moveRange,
      rotationSpeed,
    });
  }

  // --- COINS FACTORY ---
  private spawnCoinPattern(lane: Lane, startZ: number, isHigh = false) {
    const coinGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.08, 16);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      emissive: 0xffaa00,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.2,
    });

    const count = 4;
    for (let i = 0; i < count; i++) {
      const z = startZ - i * 2.2;
      const y = isHigh ? 1.8 + Math.sin((i / count) * Math.PI) * 0.8 : 0.6;
      const x = lane * LANE_WIDTH;

      const mesh = new THREE.Mesh(coinGeo, coinMat);
      mesh.rotation.x = Math.PI / 2;
      mesh.position.set(x, y, z);
      this.scene.add(mesh);

      this.activeCoins.push({
        mesh,
        lane,
        z,
        y,
        collected: false,
      });
    }
  }

  // --- POWER-UP FACTORY ---
  private spawnPowerUp(type: PowerUpType, lane: Lane, z: number) {
    const group = new THREE.Group();
    const x = lane * LANE_WIDTH;

    let color = 0x00f0ff;
    if (type === 'SHIELD') color = 0x00f0ff;
    else if (type === 'MAGNET') color = 0xff0055;
    else if (type === 'DOUBLE_COINS') color = 0xffd700;
    else if (type === 'SPEED_BOOST') color = 0x00ff66;
    else if (type === 'SCORE_MULTIPLIER') color = 0xa855f7;

    const geo = new THREE.OctahedronGeometry(0.45, 0);
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.9,
      wireframe: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.8;
    group.add(mesh);

    // Orbiting halo ring
    const ringGeo = new THREE.TorusGeometry(0.65, 0.04, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color, wireframe: true });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    ring.position.y = 0.8;
    group.add(ring);

    group.position.set(x, 0, z);
    this.scene.add(group);

    this.activePowerUpItems.push({
      mesh: group,
      type,
      lane,
      z,
      y: 0.8,
      collected: false,
    });
  }

  // --- CONTROLS & EVENT LISTENERS ---
  private bindEvents() {
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKeyDown);

    const el = this.container;
    el.addEventListener('touchstart', this.onTouchStart, { passive: true });
    el.addEventListener('touchend', this.onTouchEnd, { passive: true });
    el.addEventListener('mousedown', this.onMouseDown);
    el.addEventListener('mouseup', this.onMouseUp);
  }

  public unbind() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);

    const el = this.container;
    el.removeEventListener('touchstart', this.onTouchStart);
    el.removeEventListener('touchend', this.onTouchEnd);
    el.removeEventListener('mousedown', this.onMouseDown);
    el.removeEventListener('mouseup', this.onMouseUp);

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    sound.stopMusic();
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (!this.isRunning || this.isPaused) return;

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      this.moveLeft();
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      this.moveRight();
    } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
      this.jump();
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      this.slide();
    }
  };

  private onTouchStart = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.touchStartTime = Date.now();
    }
  };

  private onTouchEnd = (e: TouchEvent) => {
    if (e.changedTouches.length > 0) {
      const dx = e.changedTouches[0].clientX - this.touchStartX;
      const dy = e.changedTouches[0].clientY - this.touchStartY;
      const dt = Date.now() - this.touchStartTime;
      this.handleSwipe(dx, dy, dt);
    }
  };

  private onMouseDown = (e: MouseEvent) => {
    this.touchStartX = e.clientX;
    this.touchStartY = e.clientY;
    this.touchStartTime = Date.now();
  };

  private onMouseUp = (e: MouseEvent) => {
    const dx = e.clientX - this.touchStartX;
    const dy = e.clientY - this.touchStartY;
    const dt = Date.now() - this.touchStartTime;
    this.handleSwipe(dx, dy, dt);
  };

  private handleSwipe(dx: number, dy: number, dt: number) {
    if (!this.isRunning || this.isPaused) return;

    const threshold = 35; // minimum swipe distance
    if (dt > 600) return; // Too slow for swipe

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < -threshold) this.moveLeft();
      else if (dx > threshold) this.moveRight();
    } else {
      if (dy < -threshold) this.jump();
      else if (dy > threshold) this.slide();
    }
  }

  // --- ACTIONS ---
  public moveLeft() {
    if (this.targetLane > -1) {
      this.targetLane = (this.targetLane - 1) as Lane;
      sound.playLaneChange();
      triggerHaptic('light', this.hapticsEnabled);
    }
  }

  public moveRight() {
    if (this.targetLane < 1) {
      this.targetLane = (this.targetLane + 1) as Lane;
      sound.playLaneChange();
      triggerHaptic('light', this.hapticsEnabled);
    }
  }

  public jump() {
    if (this.isGrounded && !this.isSliding) {
      this.verticalVelocity = JUMP_VELOCITY;
      this.isGrounded = false;
      sound.playJump();
      triggerHaptic('medium', this.hapticsEnabled);
    }
  }

  public slide() {
    if (!this.isSliding) {
      this.isSliding = true;
      this.slideTimer = SLIDE_DURATION;
      // Fast drop if jumping
      if (!this.isGrounded) {
        this.verticalVelocity = -22;
      }
      sound.playSlide();
      triggerHaptic('light', this.hapticsEnabled);
    }
  }

  // --- GAMEPLAY LIFECYCLE ---
  public startRun(options: {
    characterColor: string;
    trailColor: string;
    upgradeBonus: {
      magnet: number;
      shield: number;
      speedBoost: number;
      doubleCoins: number;
      scoreMultiplier: number;
    };
    cameraShake: boolean;
    motionEffects: boolean;
    haptics: boolean;
  }) {
    this.characterColor = options.characterColor;
    this.trailColor = options.trailColor;
    this.upgradeBonus = options.upgradeBonus;
    this.cameraShakeEnabled = options.cameraShake;
    this.motionEffectsEnabled = options.motionEffects;
    this.hapticsEnabled = options.haptics;

    // Reset Player
    this.playerX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.targetLane = 0;
    this.currentLane = 0;
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.isSliding = false;
    this.slideTimer = 0;
    this.speed = INITIAL_SPEED;

    // Reset Run Stats
    this.score = 0;
    this.coins = 0;
    this.distance = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.maxCombo = 1;
    this.nearMisses = 0;
    this.powerUpsCollectedCount = 0;
    this.runStartTime = Date.now();
    this.activePowerUps.clear();

    // Clear old spawned entities
    this.clearSpawnedObjects();

    // Realign Track
    this.nextSegmentZ = 0;
    for (let i = 0; i < this.trackSegments.length; i++) {
      this.trackSegments[i].position.z = -i * SEGMENT_LENGTH;
    }
    this.nextSegmentZ = -this.trackSegments.length * SEGMENT_LENGTH;

    this.isRunning = true;
    this.isPaused = false;

    // Apply color to player mesh
    this.applyCosmetics();

    sound.startMusic(1.0);
  }

  private applyCosmetics() {
    this.playerMesh.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if ((child.material as THREE.MeshStandardMaterial).emissive) {
          (child.material as THREE.MeshStandardMaterial).color.set(this.characterColor);
        }
      }
    });
  }

  private clearSpawnedObjects() {
    for (const obs of this.activeObstacles) {
      this.scene.remove(obs.mesh);
    }
    this.activeObstacles = [];

    for (const c of this.activeCoins) {
      this.scene.remove(c.mesh);
    }
    this.activeCoins = [];

    for (const p of this.activePowerUpItems) {
      this.scene.remove(p.mesh);
    }
    this.activePowerUpItems = [];
  }

  public pause() {
    this.isPaused = true;
    sound.stopMusic();
  }

  public resume() {
    this.isPaused = false;
    sound.startMusic(this.speed / INITIAL_SPEED);
  }

  public stop() {
    this.isRunning = false;
    this.isPaused = false;
    sound.stopMusic();
  }

  // --- MAIN ENGINE LOOP ---
  private startLoop() {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(this.clock.getDelta(), 0.1);

      this.update(delta);
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  private update(delta: number) {
    // Passive background rotation in menu
    if (!this.isRunning) {
      if (this.playerGroup) {
        this.playerGroup.rotation.y += delta * 0.8;
      }
      return;
    }

    if (this.isPaused) return;

    // 1. SPEED & DIFFICULTY SCALING
    const isSpeedBoosted = this.activePowerUps.has('SPEED_BOOST');
    const targetSpeed = isSpeedBoosted
      ? MAX_SPEED * 1.35
      : Math.min(INITIAL_SPEED + (this.distance / 120), MAX_SPEED);
    this.speed = THREE.MathUtils.lerp(this.speed, targetSpeed, delta * 3);

    // 2. FORWARD MOVEMENT
    const moveZ = this.speed * delta;
    this.playerZ -= moveZ;
    this.distance += moveZ;

    // Score accumulation
    const scoreRate = 10 * (this.activePowerUps.has('SCORE_MULTIPLIER') ? 2 : 1);
    this.score += Math.floor(moveZ * scoreRate * (this.combo > 1 ? 1 + (this.combo * 0.2) : 1));

    // 3. SMOOTH LANE TRANSITION
    const targetX = this.targetLane * LANE_WIDTH;
    this.playerX = THREE.MathUtils.lerp(this.playerX, targetX, delta * 14);

    // 4. JUMP & GRAVITY PHYSICS
    if (!this.isGrounded) {
      this.verticalVelocity += GRAVITY * delta;
      this.playerY += this.verticalVelocity * delta;

      if (this.playerY <= 0) {
        this.playerY = 0;
        this.verticalVelocity = 0;
        this.isGrounded = true;
      }
    }

    // 5. SLIDE TIMER & STANCE
    if (this.isSliding) {
      this.slideTimer -= delta;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // 6. ANIMATE CHARACTER RUN / SLIDE / JUMP LIMBS
    this.animatePlayer(delta);

    // Apply transformed position to player
    this.playerGroup.position.set(this.playerX, this.playerY, this.playerZ);
    this.playerGroup.rotation.y = 0;
    // Bank/tilt into lane changes for responsive feel
    const tilt = (targetX - this.playerX) * 0.15;
    this.playerGroup.rotation.z = -tilt;

    // 7. POWER-UPS TICKING
    const powerUpsList: ActivePowerUpState[] = [];
    for (const [type, data] of this.activePowerUps.entries()) {
      data.remaining -= delta;
      if (data.remaining <= 0) {
        this.activePowerUps.delete(type);
      } else {
        powerUpsList.push({
          type,
          remainingTime: Math.max(0, data.remaining),
          totalDuration: data.total,
        });
      }
    }

    // Shield Forcefield Visual
    const hasShield = this.activePowerUps.has('SHIELD');
    if (this.shieldMesh) {
      const targetOpacity = hasShield ? 0.6 : 0;
      (this.shieldMesh.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
        (this.shieldMesh.material as THREE.MeshBasicMaterial).opacity,
        targetOpacity,
        delta * 8
      );
      this.shieldMesh.rotation.y += delta * 2;
      this.shieldMesh.rotation.x += delta * 1.5;
    }

    // 8. COMBO DECAY TIMER
    if (this.combo > 1) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.combo = 1;
      }
    }

    // 9. DYNAMIC CAMERA FOLLOW & SHAKE
    this.updateCamera(delta, isSpeedBoosted);

    // 10. PROCEDURAL TRACK RECYCLING
    this.updateTrack();

    // 11. OBSTACLES, COINS & POWERUP INTERACTION / COLLISION
    this.updateEntities(delta);

    // 12. WEATHER / ENVIRONMENT DRIFT
    if (this.weatherParticles) {
      this.weatherParticles.position.z = this.playerZ;
    }

    // Send Realtime Stats back to React HUD
    this.callbacks.onScoreUpdate({
      score: this.score,
      coins: this.coins,
      distance: Math.floor(this.distance),
      combo: this.combo,
      speed: Math.round(this.speed),
      activePowerUps: powerUpsList,
    });
  }

  private animatePlayer(delta: number) {
    if (this.isSliding) {
      // Crouch stance
      this.playerMesh.scale.set(1.1, 0.45, 1.1);
      this.playerMesh.position.y = 0.25;
      this.playerMesh.rotation.x = -0.35;
    } else {
      this.playerMesh.scale.set(1, 1, 1);
      this.playerMesh.position.y = 0;
      this.playerMesh.rotation.x = 0;

      if (this.isGrounded) {
        this.runAnimPhase += delta * this.speed * 1.4;
        const legAngle = Math.sin(this.runAnimPhase) * 0.75;
        if (this.leftLeg) this.leftLeg.rotation.x = legAngle;
        if (this.rightLeg) this.rightLeg.rotation.x = -legAngle;
        if (this.leftArm) this.leftArm.rotation.x = -legAngle * 0.9;
        if (this.rightArm) this.rightArm.rotation.x = legAngle * 0.9;
      } else {
        // Jump pose
        if (this.leftLeg) this.leftLeg.rotation.x = -0.6;
        if (this.rightLeg) this.rightLeg.rotation.x = 0.4;
        if (this.leftArm) this.leftArm.rotation.x = -0.9;
        if (this.rightArm) this.rightArm.rotation.x = -0.9;
      }
    }
  }

  private updateCamera(delta: number, isSpeedBoosted: boolean) {
    const targetZ = this.playerZ + 5.5;
    const targetY = 3.2 + (this.playerY * 0.35);
    const targetX = this.playerX * 0.4;

    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetX, delta * 10);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetY, delta * 12);
    this.camera.position.z = targetZ;

    // FOV stretch on high speed or speed boost
    const targetFOV = isSpeedBoosted
      ? this.baseFOV + 16
      : this.baseFOV + (this.speed - INITIAL_SPEED) * 0.55;
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, delta * 4);
    this.camera.updateProjectionMatrix();

    // Camera Shake
    if (this.cameraShakeIntensity > 0 && this.cameraShakeEnabled) {
      const shakeX = (Math.random() - 0.5) * this.cameraShakeIntensity * 0.3;
      const shakeY = (Math.random() - 0.5) * this.cameraShakeIntensity * 0.3;
      this.camera.position.x += shakeX;
      this.camera.position.y += shakeY;
      this.cameraShakeIntensity = Math.max(0, this.cameraShakeIntensity - delta * 4);
    }

    this.camera.lookAt(this.playerX * 0.25, this.playerY * 0.5 + 1.2, this.playerZ - 8);
  }

  private updateTrack() {
    for (const segment of this.trackSegments) {
      if (segment.position.z > this.playerZ + SEGMENT_LENGTH * 1.5) {
        segment.position.z = this.nextSegmentZ - SEGMENT_LENGTH / 2;
        this.populateSegment(this.nextSegmentZ);
        this.nextSegmentZ -= SEGMENT_LENGTH;
      }
    }
  }

  private updateEntities(delta: number) {
    const hasMagnet = this.activePowerUps.has('MAGNET');
    const isInvulnerable = this.activePowerUps.has('SPEED_BOOST');
    const playerRadius = 0.45;
    const playerHeight = this.isSliding ? 0.6 : 1.7;

    // --- COIN COLLECTION & MAGNET ---
    for (const coin of this.activeCoins) {
      if (coin.collected) continue;

      // Rotation animation
      coin.mesh.rotation.z += delta * 4;

      // Magnet Attraction
      if (hasMagnet) {
        const distToPlayer = coin.mesh.position.distanceTo(
          new THREE.Vector3(this.playerX, this.playerY + 0.5, this.playerZ)
        );
        if (distToPlayer < 16) {
          coin.mesh.position.lerp(
            new THREE.Vector3(this.playerX, this.playerY + 0.6, this.playerZ),
            delta * 12
          );
        }
      }

      // Check Collection
      const dz = Math.abs(coin.mesh.position.z - this.playerZ);
      const dx = Math.abs(coin.mesh.position.x - this.playerX);
      const dy = Math.abs(coin.mesh.position.y - this.playerY);

      if (dz < 1.1 && dx < 0.9 && dy < 1.6) {
        coin.collected = true;
        this.scene.remove(coin.mesh);

        // Coin Values & Combos
        const isDouble = this.activePowerUps.has('DOUBLE_COINS');
        const coinAmount = isDouble ? 2 : 1;
        this.coins += coinAmount;

        // Combo increment
        this.combo = Math.min(this.combo + 1, 10);
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.comboTimer = 3.5; // Reset combo decay

        this.score += 25 * this.combo;
        sound.playCoin(this.combo);
        triggerHaptic('light', this.hapticsEnabled);
      }

      // Clean up behind player
      if (coin.mesh.position.z > this.playerZ + 8) {
        coin.collected = true;
        this.scene.remove(coin.mesh);
      }
    }

    // --- POWER-UP COLLECTION ---
    for (const item of this.activePowerUpItems) {
      if (item.collected) continue;

      item.mesh.rotation.y += delta * 3;

      const dz = Math.abs(item.mesh.position.z - this.playerZ);
      const dx = Math.abs(item.mesh.position.x - this.playerX);

      if (dz < 1.2 && dx < 0.9) {
        item.collected = true;
        this.scene.remove(item.mesh);

        this.activatePowerUp(item.type);
        sound.playPowerUp();
        triggerHaptic('medium', this.hapticsEnabled);
        this.powerUpsCollectedCount++;
      }

      if (item.mesh.position.z > this.playerZ + 8) {
        item.collected = true;
        this.scene.remove(item.mesh);
      }
    }

    // --- OBSTACLE INTERACTION & NEAR MISS ---
    for (const obs of this.activeObstacles) {
      if (obs.cleared) continue;

      // Handle Moving Obstacle Sway
      if (obs.type === 'MOVING_OBSTACLE' && obs.moveDirection && obs.moveRange) {
        obs.mesh.position.x += obs.moveDirection * delta * 2.2;
        const currentCenter = (obs.initialLane ?? 0) * LANE_WIDTH;
        if (Math.abs(obs.mesh.position.x - currentCenter) > obs.moveRange) {
          obs.moveDirection *= -1;
        }
      }

      // Rotating blades
      if (obs.rotationSpeed) {
        obs.mesh.rotation.z += obs.rotationSpeed * delta;
      }

      const dz = obs.mesh.position.z - this.playerZ;
      const dx = Math.abs(obs.mesh.position.x - this.playerX);

      // --- NEAR MISS CHECK (Reward skilled close evasion!) ---
      if (!obs.nearMissChecked && dz > -0.5 && dz < 1.2) {
        // If passing closely on adjacent lane without crashing
        if (dx > 0.8 && dx < 2.0 && !this.activePowerUps.has('SPEED_BOOST')) {
          obs.nearMissChecked = true;
          this.nearMisses++;
          const bonus = 150 * this.combo;
          this.score += bonus;
          this.combo = Math.min(this.combo + 1, 10);
          this.maxCombo = Math.max(this.maxCombo, this.combo);
          this.comboTimer = 3.5;

          sound.playNearMiss();
          triggerHaptic('light', this.hapticsEnabled);
          this.cameraShakeIntensity = 0.25;
          this.callbacks.onNearMiss(bonus);
        }
      }

      // --- COLLISION DETECTION ---
      if (Math.abs(dz) < 1.0) {
        let collides = false;

        if (obs.type === 'BARRIER' || obs.type === 'MOVING_OBSTACLE' || obs.type === 'ROTATING_OBSTACLE') {
          // Standard lane barrier: collides if in same lane column
          if (dx < playerRadius + 0.6) {
            collides = true;
          }
        } else if (obs.type === 'LOW_BARRIER') {
          // Must JUMP over: collides if player Y is not high enough
          if (dx < playerRadius + 0.6 && this.playerY < 0.95) {
            collides = true;
          }
        } else if (obs.type === 'HIGH_BARRIER') {
          // Must SLIDE under: collides if player is NOT sliding
          if (dx < playerRadius + 0.6 && !this.isSliding) {
            collides = true;
          }
        } else if (obs.type === 'LASER_GATE') {
          if (dx < playerRadius + 0.6) {
            collides = true;
          }
        }

        if (collides) {
          obs.cleared = true;
          if (isInvulnerable) {
            // Speed boost smashes through obstacles
            this.scene.remove(obs.mesh);
            sound.playShieldBreak();
            this.cameraShakeIntensity = 0.4;
          } else if (this.activePowerUps.has('SHIELD')) {
            // Consume Shield
            this.activePowerUps.delete('SHIELD');
            this.scene.remove(obs.mesh);
            sound.playShieldBreak();
            this.cameraShakeIntensity = 0.5;
            triggerHaptic('heavy', this.hapticsEnabled);
          } else {
            // CRASH -> GAME OVER
            this.handleCrash();
            return;
          }
        }
      }

      // Cleanup passed obstacles
      if (obs.mesh.position.z > this.playerZ + 12) {
        obs.cleared = true;
        this.scene.remove(obs.mesh);
      }
    }
  }

  private activatePowerUp(type: PowerUpType) {
    let duration = 8;
    if (type === 'SHIELD') duration = 12 + this.upgradeBonus.shield;
    else if (type === 'MAGNET') duration = 8 + this.upgradeBonus.magnet;
    else if (type === 'DOUBLE_COINS') duration = 10 + this.upgradeBonus.doubleCoins;
    else if (type === 'SPEED_BOOST') duration = 6 + this.upgradeBonus.speedBoost;
    else if (type === 'SCORE_MULTIPLIER') duration = 10 + this.upgradeBonus.scoreMultiplier;

    this.activePowerUps.set(type, {
      remaining: duration,
      total: duration,
    });
  }

  private handleCrash() {
    this.isRunning = false;
    sound.stopMusic();
    sound.playHit();
    triggerHaptic('heavy', this.hapticsEnabled);

    this.cameraShakeIntensity = 0.8;

    const runDuration = Math.round((Date.now() - this.runStartTime) / 1000);
    const stats: RunStats = {
      score: this.score,
      coinsCollected: this.coins,
      distance: Math.floor(this.distance),
      nearMisses: this.nearMisses,
      powerUpsUsed: this.powerUpsCollectedCount,
      maxCombo: this.maxCombo,
      duration: runDuration,
    };

    this.callbacks.onGameOver(stats);
  }
}
