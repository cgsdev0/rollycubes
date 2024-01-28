/* eslint no-loop-func: "off" */
import { DiceType } from 'types/api';
import { store } from '../store';

/// <reference path="babylonjs" />
var BABYLON: any;
const frameRate = 60;

let mouse_x = 0;
let mouse_y = 0;

var signaler: any;
const signalRolled3D = (doubles: boolean) => {
  signaler = undefined;
  setTimeout(() => {
    store.dispatch({ type: 'FINISH_3D_ROLL' });
    if (doubles) {
      store.dispatch({ type: 'DOUBLES' });
    }
  }, 0);
};

var gravityVector: any;

const lookupTable: Record<string, number> = {
  '00': 1,
  '01': 2,
  '02': 6,
  '03': 5,
  '10': 4,
  '11': 4,
  '12': 4,
  '13': 4,
  '30': 3,
  '31': 3,
  '32': 3,
  '33': 3,
};
const quatToRoll = (mesh: any, q: BABYLON.Quaternion) => {
  if (mesh.name.startsWith('d20')) {
    mesh.updateFacetData();
    let upside = 0;
    let maxdot = 0;
    for (let i = 0; i < mesh.facetNb; ++i) {
      const newdot = BABYLON.Vector3.Dot(mesh.getFacetNormal(i), gravityVector);
      if (newdot < maxdot) {
        maxdot = newdot;
        upside = i;
      }
    }
    let colorUV = [];
    for (let i = 0; i < mesh.facetNb; ++i) {
      for (let j = 0; j < 3; ++j)
        // colorUV.push(...[i === upside ? 0 : 1, 1, 1, 1]);
        colorUV.push(...[1, 1, 1, 1]);
    }
    mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colorUV);
    return upside;
  }
  let { x, z } = q.toEulerAngles();
  x = (Math.round((x / Math.PI) * 2) + 4) % 4;
  z = (Math.round((z / Math.PI) * 2) + 4) % 4;
  //console.log(x, z);

  return lookupTable[`${x}${z}`] || 0;
};

// prettier-ignore
const diceUVBuffers = [
[0.75,1,0.5,1,0.5,0.5,0.75,0.5,1,1,0.75,1,0.75,0.5,1,0.5,0.5,1,0.25,1,0.25,0.5,0.5,0.5,0.5,0.5,0.25,0.5,0.25,0,0.5,0,0.25,1,0,1,0,0.5,0.25,0.5,0.75,0.5,0.5,0.5,0.5,0,0.75,0],
[1,1,0.75,1,0.75,0.5,1,0.5,0.5,0.5,0.25,0.5,0.25,0,0.5,0,0.75,1,0.5,1,0.5,0.5,0.75,0.5,0.75,0.5,0.5,0.5,0.5,0,0.75,0,0.5,1,0.25,1,0.25,0.5,0.5,0.5,0.25,1,0,1,0,0.5,0.25,0.5],
[0.5,0.5,0.25,0.5,0.25,0,0.5,0,0.75,0.5,0.5,0.5,0.5,0,0.75,0,1,1,0.75,1,0.75,0.5,1,0.5,0.25,1,0,1,0,0.5,0.25,0.5,0.75,1,0.5,1,0.5,0.5,0.75,0.5,0.5,1,0.25,1,0.25,0.5,0.5,0.5],
[0.75,0.5,0.5,0.5,0.5,0,0.75,0,0.25,1,0,1,0,0.5,0.25,0.5,0.5,0.5,0.25,0.5,0.25,0,0.5,0,0.5,1,0.25,1,0.25,0.5,0.5,0.5,1,1,0.75,1,0.75,0.5,1,0.5,0.75,1,0.5,1,0.5,0.5,0.75,0.5],
[0.25,1,0,1,0,0.5,0.25,0.5,0.5,1,0.25,1,0.25,0.5,0.5,0.5,0.75,0.5,0.5,0.5,0.5,0,0.75,0,0.75,1,0.5,1,0.5,0.5,0.75,0.5,0.5,0.5,0.25,0.5,0.25,0,0.5,0,1,1,0.75,1,0.75,0.5,1,0.5],
[0.5,1,0.25,1,0.25,0.5,0.5,0.5,0.75,1,0.5,1,0.5,0.5,0.75,0.5,0.25,1,0,1,0,0.5,0.25,0.5,1,1,0.75,1,0.75,0.5,1,0.5,0.75,0.5,0.5,0.5,0.5,0,0.75,0,0.5,0.5,0.25,0.5,0.25,0,0.5,0],
];

const createDiceUVs = (fudge: number) => {
  const sides = [];
  sides.push(new BABYLON.Vector4(0.0, 0.5, 0.25, 1)); // 1
  sides.push(new BABYLON.Vector4(0.25, 0.5, 0.5, 1)); // 2
  sides.push(new BABYLON.Vector4(0.5, 0.5, 0.75, 1)); // 3
  sides.push(new BABYLON.Vector4(0.75, 0.5, 1.0, 1)); // 4
  sides.push(new BABYLON.Vector4(0.25, 0.0, 0.5, 0.5)); // 5
  sides.push(new BABYLON.Vector4(0.5, 0.0, 0.75, 0.5)); // 6
  const diceUV = [];
  diceUV[4] = sides[(0 + fudge) % 6]; // top
  diceUV[2] = sides[(1 + fudge) % 6]; // right
  diceUV[0] = sides[(2 + fudge) % 6]; // back
  diceUV[1] = sides[(3 + fudge) % 6]; // front
  diceUV[3] = sides[(4 + fudge) % 6]; // left
  diceUV[5] = sides[(5 + fudge) % 6]; // bottom
  return diceUV;
};

const diceSize = (type: DiceType) => {
  switch (type) {
    case 'Jumbo':
      return 1.0;
    default:
      return 0.5;
  }
};
var slideIndex = 0;
var rotIndex = 0;

var d20UVs: number[] = [];

const d20UVMap = {
  16: 0,
  17: 1,
  18: 2,
  19: 3,
  20: 4,
  11: 5,
  12: 6,
  13: 7,
  14: 8,
  15: 9,
  6: 10,
  7: 11,
  8: 12,
  9: 13,
  10: 14,
  1: 15,
  2: 16,
  3: 17,
  4: 18,
  5: 19,
};

for (var i = 0; i < 20; i++) {
  var start = i * 6;
  var offset_x = (i % 5) / 5;
  var offset_y = Math.floor(i / 5);
  d20UVs[start] = offset_x; // X1
  d20UVs[start + 1] = offset_y * 0.25 + 0.045; // Y1
  d20UVs[start + 2] = 1 / 5 + offset_x; // X2
  d20UVs[start + 3] = offset_y * 0.25 + 0.045; // Y2
  d20UVs[start + 4] = 1 / 10 + offset_x; // X3
  d20UVs[start + 5] = (offset_y + 1) * 0.25; // Y3
}

const updateUVs = (
  die: BABYLON.Mesh,
  localRoll: number,
  serverRoll: number
) => {
  if (die.id.startsWith('d20')) {
    const index =
      (20 - localRoll + d20UVMap[serverRoll as keyof typeof d20UVMap]) % 20;
    const newUVs = d20UVs.slice(index * 6).concat(d20UVs.slice(0, index * 6));
    die.updateVerticesData(BABYLON.VertexBuffer.UVKind, newUVs);
  } else {
    die.updateVerticesData(
      BABYLON.VertexBuffer.UVKind,
      diceUVBuffers[(6 + serverRoll - localRoll) % 6]
    );
  }
};

const makeD20Creator = (physics: boolean) => {
  var diceMat: BABYLON.StandardMaterial;
  return async (scene: BABYLON.Scene) => {
    if (!diceMat) {
      diceMat = new BABYLON.StandardMaterial('d20mat', scene);
      diceMat.diffuseTexture = new BABYLON.Texture('/Icosphere.png', scene);
      diceMat.ambientColor = scene.ambientColor;
      diceMat.roughness = 1.0;
      diceMat.specularPower = 100;
    }
    const mesh = BABYLON.MeshBuilder.CreateIcoSphere(
      `d20-${idx++}`,
      { subdivisions: 1, updatable: true, radius: 0.45 },
      scene
    );
    // const result = await BABYLON.SceneLoader.ImportMeshAsync(
    //   ['Icosphere'],
    //   '/',
    //   'd20.gltf',
    //   scene
    // )
    // const mesh = result.meshes[0]
    mesh.updateVerticesData(BABYLON.VertexBuffer.UVKind, d20UVs.slice());
    if (physics) {
      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
        mesh,
        BABYLON.PhysicsImpostor.MeshImpostor,
        { mass: 2.5, restitution: 0.75, friction: 1.9 },
        scene
      );
    }
    mesh.material = diceMat;
    return mesh;
  };
};

let idx = 0;
let matIdx = 0;
const makeD6Creator = (type: Exclude<DiceType, 'D20'>, physics: boolean) => {
  let diceMat: BABYLON.StandardMaterial;
  return async (scene: BABYLON.Scene) => {
    if (!diceMat) {
      diceMat = new BABYLON.StandardMaterial(`die-material${matIdx++}`, scene);
      switch (type) {
        case 'Jumbo':
        case 'Default':
          diceMat.ambientColor = scene.ambientColor;
          diceMat.diffuseTexture = new BABYLON.Texture('/dice.png', scene);
          diceMat.roughness = 1.0;
          diceMat.specularPower = 5000;
          break;
        case 'Hands':
          diceMat.ambientColor = scene.ambientColor;
          diceMat.diffuseTexture = new BABYLON.Texture('/hands.png', scene);
          diceMat.roughness = 1.0;
          diceMat.specularPower = 5000;
          break;
        case 'Golden':
          diceMat.reflectionTexture = new BABYLON.CubeTexture(
            '/skybox/skybox',
            scene
          );
          diceMat.reflectionTexture!.coordinatesMode =
            BABYLON.Texture.CUBIC_MODE;
          diceMat.reflectionTexture!.level = 0.5;
          diceMat.diffuseTexture = new BABYLON.Texture('/gold6.png', scene);
          diceMat.specularColor = new BABYLON.Color3(0, 0, 0);
          diceMat.ambientColor = new BABYLON.Color3(0, 0, 0);
          diceMat.bumpTexture = new BABYLON.Texture('/normal6_2.png', scene);
          // diceGoldMat.ambientColor = scene.ambientColor;
          diceMat.backFaceCulling = true;
          diceMat.roughness = 0.0;
          diceMat.emissiveColor = new BABYLON.Color3(0.05, 0.02, 0);
          diceMat.specularPower = 1000;
          break;
      }
    }
    const diceUV = createDiceUVs(0);
    const die = BABYLON.MeshBuilder.CreateBox(
      `die${idx++}`,
      {
        width: diceSize(type),
        height: diceSize(type),
        depth: diceSize(type),
        faceUV: diceUV,
        updatable: true,
      },
      scene
    );
    die.isPickable = true;
    die.material = diceMat;
    if (physics) {
      switch (type) {
        case 'Golden':
          die.physicsImpostor = new BABYLON.PhysicsImpostor(
            die,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 4.0, restitution: 0.2, friction: 3.0 },
            scene
          );
          break;
        default:
          die.physicsImpostor = new BABYLON.PhysicsImpostor(
            die,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 2.5, restitution: 0.95, friction: 1.8 },
            scene
          );
          break;
      }
    }

    die.rotationQuaternion = new BABYLON.Quaternion(0, 1, 0, 0);
    return die;
  };
};

const killAnimation = (die: BABYLON.AbstractMesh) => {
  if (!scene) {
    return;
  }
  if (die.animations.length < 2) {
    return;
  }
  scene.stopAnimation(die);
  const keys = die.animations[1].getKeys();
  const lastKeyframe = keys[keys.length - 1];
  die.rotationQuaternion! = lastKeyframe.value;
};

let sceneInit = false;
let previewInit = false;
let scene: BABYLON.Scene | undefined;
let previewScene: BABYLON.Scene | undefined;
let engine: BABYLON.Engine | undefined;
let previewEngine: BABYLON.Engine | undefined;
let rollListener: any;
let snapListener: any;

export const destroyPreview = () => {
  if (!previewInit) {
    return;
  }
  previewInit = false;

  if (previewScene) {
    previewScene.dispose();
  }
  if (previewEngine) {
    previewEngine.dispose();
  }
};

export const destroyScene = async () => {
  if (!sceneInit) {
    return;
  }
  sceneInit = false;

  if (scene) {
    scene.dispose();
  }
  if (engine) {
    engine.dispose();
  }

  var canvas: any = document.getElementById('renderCanvas');
  const gl = canvas.getContext('webgl2');
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  document.removeEventListener('roll', rollListener);
  rollListener = undefined;
  document.removeEventListener('snapDice', snapListener);
  snapListener = undefined;
};

const makeDieCreators = (physics: boolean) => {
  return {
    Default: makeD6Creator('Default', physics),
    D20: makeD20Creator(physics),
    Golden: makeD6Creator('Golden', physics),
    Hands: makeD6Creator('Hands', physics),
    Jumbo: makeD6Creator('Jumbo', physics),
  } satisfies Record<DiceType, any>;
};

export const initPreview = async (diceType: DiceType) => {
  if (previewInit) {
    return;
  }
  previewInit = true;
  if (!BABYLON) {
    BABYLON = await import('babylonjs');
  }
  const diceCount = 1;
  const previewDice: BABYLON.Mesh[] = [];
  var canvas: any = document.getElementById('previewCanvas');
  previewEngine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
  });
  previewScene = new BABYLON.Scene(previewEngine);

  const gl = new BABYLON.GlowLayer('glowPreview', previewScene, {
    mainTextureFixedSize: 1024,
    blurKernelSize: 64,
  });
  const camera = new BABYLON.FreeCamera(
    'cameraPreview',
    new BABYLON.Vector3(0, 5, 0),
    previewScene
  );
  // camera.attachControl(canvas, true);
  camera.setTarget(BABYLON.Vector3.Zero());
  var light = new BABYLON.HemisphericLight(
    'light1Preview',
    new BABYLON.Vector3(0, 5, 0),
    previewScene
  );
  light.intensity = 0.8;

  const createDie = makeDieCreators(false);

  const initDice = async (type: DiceType) => {
    for (let i = 0; i < diceCount; ++i) {
      if (previewDice[i]) {
        previewDice[i].dispose();
      }
      previewDice[i] = await createDie[type](previewScene!);
      previewDice[i].position = new BABYLON.Vector3(0, 3, 0.15);
      previewDice[i].rotation = new BABYLON.Vector3(0, 0, 0);
    }
  };
  initDice(diceType);

  previewScene!.clearColor = new BABYLON.Color4(0, 0, 0, 0);
  window.addEventListener('resize', function () {
    if (previewEngine) {
      previewEngine.resize();
    }
  });
  previewEngine!.runRenderLoop(function () {
    if (previewEngine && previewScene) {
      for (let i = 0; i < diceCount; ++i) {
        previewDice[i].rotation.z += previewEngine.getDeltaTime() * 0.001;
        previewDice[i].rotation.x += previewEngine.getDeltaTime() * 0.0005;
      }
      previewScene.render();
    }
  });
  return initDice;
};
export const initScene = async () => {
  if (sceneInit || !window.hasOwnProperty('Ammo')) {
    return;
  }
  if (!BABYLON) {
    BABYLON = await import('babylonjs');
  }
  gravityVector = new BABYLON.Vector3(0, -9.81, 0);
  if (typeof (window as any).Ammo === 'function') {
    await (window as any).Ammo();
  }
  sceneInit = true;
  // const result = await window.fetch("http://localhost:3000/simulated.txt");
  // const data = await result.text();
  const diceCount = 2;
  const dice: BABYLON.Mesh[] = [];
  // let frame: any = {};
  // const splitted = data
  //   .split("\n")
  //   .filter((a) => a)
  //   .map((d) => d.split(",").filter((a) => a))
  //   .forEach((arr,j) => {
  //     dice[j] = [];
  //     for (let i = 0; i < arr.length; ++i) {
  //       if (i % 20 === 0 && i) {
  //         dice[j].push(frame);
  //         frame = {};
  //       }
  //       frame[dataLabels[i % 20]] = arr[i];
  //     }
  //   });
  var canvas: any = document.getElementById('renderCanvas');
  document.addEventListener('mousemove', (e) => {
    mouse_x = e.pageX;
    mouse_y = e.pageY;
  });
  // Load the 3D engine
  engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
  });
  scene = new BABYLON.Scene(engine);

  const gl = new BABYLON.GlowLayer('glow', scene, {
    mainTextureFixedSize: 1024,
    blurKernelSize: 64,
  });
  // scene.ambientColor = new BABYLON.Color3(1, 1, 1)
  const camera = new BABYLON.FreeCamera(
    'camera',
    new BABYLON.Vector3(0, 10, 1),
    scene
  );
  //camera.attachControl(canvas, true);
  camera.setTarget(BABYLON.Vector3.Zero());
  var light = new BABYLON.HemisphericLight(
    'light1',
    new BABYLON.Vector3(0, 5, 0),
    scene
  );
  light.intensity = 0.8;

  try {
    scene!.enablePhysics(gravityVector, new BABYLON.AmmoJSPlugin());
  } catch (e) {
    scene!.enablePhysics(gravityVector, new BABYLON.AmmoJSPlugin());
  }

  const createDie = makeDieCreators(true);

  const initDice = async (type: DiceType, scene: BABYLON.Scene) => {
    for (let i = 0; i < diceCount; ++i) {
      if (dice[i]) {
        dice[i].dispose();
      }
      dice[i] = await createDie[type](scene);
    }
  };
  initDice('Default', scene!);

  var greenMat = new BABYLON.StandardMaterial('GREENmat', scene);
  greenMat.diffuseColor = new BABYLON.Color3(0, 0.35, 0);

  // Our built-in 'ground' shape. Params: name,width,depth,subdivs,scene
  var ground = BABYLON.Mesh.CreateGround('ground1', 128, 128, 0, scene);
  var ground2 = BABYLON.Mesh.CreateGround('ground2', 128, 128, 20, scene);

  const makePicker = (
    scene: BABYLON.Scene,
    camera: BABYLON.Camera,
    ground: BABYLON.AbstractMesh
  ) => {
    return (x: number, y: number) => {
      const result = scene.pick(
        x,
        y,
        (mesh: BABYLON.AbstractMesh) => mesh === ground,
        false,
        camera
      );
      if (!result) {
        return BABYLON.Vector3.Zero();
      }
      return result.pickedPoint || BABYLON.Vector3.Zero();
    };
  };

  const picker = makePicker(scene!, camera, ground);

  var northWall = BABYLON.MeshBuilder.CreateBox(
    'northWall',
    { width: 128, height: 40, depth: 1, updatable: true },
    scene
  );
  var southWall = BABYLON.MeshBuilder.CreateBox(
    'southWall',
    { width: 128, height: 40, depth: 1, updatable: true },
    scene
  );
  var eastWall = BABYLON.MeshBuilder.CreateBox(
    'eastWall',
    { width: 1, depth: 128, height: 40, updatable: true },
    scene
  );
  var westWall = BABYLON.MeshBuilder.CreateBox(
    'westWall',
    { width: 1, depth: 128, height: 40, updatable: true },
    scene
  );

  const walls = [southWall, westWall, northWall, eastWall];

  walls.forEach((wall) => {
    wall.physicsImpostor = new BABYLON.PhysicsImpostor(
      wall,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0, restitution: 0.49, friction: 2.0 },
      scene
    );
    wall.isPickable = false;
  });
  const resizeWalls = () => {
    if (!scene) {
      return;
    }
    scene.physicsEnabled = true;
    const leftTop = picker(0, 0);
    const rightTop = picker(camera.viewport.width * canvas.width, 0);
    const leftBottom = picker(0, camera.viewport.height * canvas.height);
    const rightBottom = picker(
      camera.viewport.width * canvas.width,
      camera.viewport.height * canvas.height
    );
    northWall.position.z = (rightTop.z + leftTop.z) / 2;
    southWall.position.z = (rightBottom.z + leftBottom.z) / 2;
    eastWall.position.x = (rightTop.x + rightBottom.x) / 2;
    westWall.position.x = (leftTop.x + leftBottom.x) / 2;

    scene.physicsEnabled = false;
  };
  resizeWalls();

  walls.forEach((wall) => {
    wall.material = greenMat;
    wall.visibility = 0;
  });
  ground.visibility = 0;
  ground2.visibility = 0;
  ground.physicsImpostor = new BABYLON.PhysicsImpostor(
    ground,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 0, restitution: 0.49, friction: 0.4 },
    scene
  );
  ground2.physicsImpostor = new BABYLON.PhysicsImpostor(
    ground2,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 0, restitution: 0.49, friction: 0.4 },
    scene
  );

  // TRANSPARENT BG
  // if you're on acid
  // scene!.autoClear = false;
  scene!.clearColor = new BABYLON.Color4(0, 0, 0, 0);

  const directions = {
    2: [
      { name: 'south', v: new BABYLON.Vector3(0, 0, 1), u: -1 },
      { name: 'north', v: new BABYLON.Vector3(0, 0, 1), u: 1 },
    ],
    3: [
      { name: 'south', v: new BABYLON.Vector3(0, 0, 1), u: -1 },
      { name: 'west', v: new BABYLON.Vector3(1, 0, 0), u: -1 },
      { name: 'east', v: new BABYLON.Vector3(1, 0, 0), u: -1 },
    ],
    4: [
      { name: 'south', v: new BABYLON.Vector3(0, 0, 1), u: -1 },
      { name: 'west', v: new BABYLON.Vector3(1, 0, 0), u: -1 },
      { name: 'north', v: new BABYLON.Vector3(0, 0, 1), u: 1 },
      { name: 'east', v: new BABYLON.Vector3(1, 0, 0), u: 1 },
    ],
    5: [
      { name: 'south', v: new BABYLON.Vector3(0, 0, 1), u: -1 },
      { name: 'west', v: new BABYLON.Vector3(1, 0, 0), u: -1 },
      { name: 'north', v: new BABYLON.Vector3(0, 0, 1), u: 1 },
      { name: 'north', v: new BABYLON.Vector3(0, 0, 1), u: 1 },
      { name: 'east', v: new BABYLON.Vector3(1, 0, 0), u: 1 },
    ],
    6: [
      { name: 'south', v: new BABYLON.Vector3(0, 0, 1), u: -1 },
      { name: 'west', v: new BABYLON.Vector3(1, 0, 0), u: -1 },
      { name: 'west', v: new BABYLON.Vector3(1, 0, 0), u: -1 },
      { name: 'north', v: new BABYLON.Vector3(0, 0, 1), u: 1 },
      { name: 'east', v: new BABYLON.Vector3(1, 0, 0), u: 1 },
      { name: 'east', v: new BABYLON.Vector3(1, 0, 0), u: 1 },
    ],
    7: [
      { name: 'south', v: new BABYLON.Vector3(0, 0, 1), u: -1 },
      { name: 'west', v: new BABYLON.Vector3(1, 0, 0), u: -1 },
      { name: 'north', v: new BABYLON.Vector3(0, 0, 1), u: 1 },
      { name: 'east', v: new BABYLON.Vector3(1, 0, 0), u: 1 },
      { name: 'north', v: new BABYLON.Vector3(0, 0, 1), u: 1 },
      { name: 'east', v: new BABYLON.Vector3(1, 0, 0), u: 1 },
    ],
    8: [
      { name: 'south', v: new BABYLON.Vector3(0, 0, 1), u: -1 },
      { name: 'west', v: new BABYLON.Vector3(1, 0, 0), u: -1 },
      { name: 'west', v: new BABYLON.Vector3(1, 0, 0), u: -1 },
      { name: 'north', v: new BABYLON.Vector3(0, 0, 1), u: 1 },
      { name: 'north', v: new BABYLON.Vector3(0, 0, 1), u: 1 },
      { name: 'north', v: new BABYLON.Vector3(0, 0, 1), u: 1 },
      { name: 'east', v: new BABYLON.Vector3(1, 0, 0), u: 1 },
      { name: 'east', v: new BABYLON.Vector3(1, 0, 0), u: 1 },
    ],
  };
  const wallMap = {
    south: 0,
    west: 1,
    north: 2,
    east: 3,
  };
  let lastRollWasDoubles = false;
  const roll = async (
    serverRoll: number[],
    turn_index: number,
    players: number,
    dice_type: DiceType
  ) => {
    turn_index += players;
    const dirs = directions[players as keyof typeof directions];
    lastRollWasDoubles = serverRoll.every((v) => v === serverRoll[0]);
    // console.log(serverRoll);
    if (serverRoll.length === 0) {
      serverRoll = [3, 4];
    }
    if (!scene) {
      return;
    }
    await initDice(dice_type, scene);
    scene.physicsEnabled = false;
    const direction = dirs[turn_index % dirs.length];
    scene.physicsEnabled = true;
    dice.forEach((die) => killAnimation(die));
    //console.log(direction);
    const wall = walls[wallMap[direction.name as keyof typeof wallMap]];
    wall.position.y = -40;
    let wallIsOpen = true;
    const positions: any[][] = [[], []];
    const rotations: any[][] = [[], []];
    dice[0].position.x = 0;
    dice[0].position.y = 3;
    dice[0].position.z = 0;
    dice[1].position.y = 4;
    dice[1].position.x = 0.2;
    dice[1].position.z = 0;

    dice.forEach((die) => {
      die.position.addInPlace(
        wall.position
          .multiply(direction.v)
          .add(direction.v.scale(-direction.u * 2))
      );
      die.physicsImpostor!.setLinearVelocity(BABYLON.Vector3.Zero());
      const force = direction.v.scale(direction.u).scale(20);
      const rotation = ((Math.random() - 0.5) * Math.PI) / 6;
      const matrix = BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, rotation);
      die.physicsImpostor!.applyImpulse(
        BABYLON.Vector3.TransformCoordinates(force, matrix),
        die.getAbsolutePosition()
      );
      die.physicsImpostor!.setAngularVelocity(
        new BABYLON.Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        )
      );
    });
    const impostors = [
      ...dice.map((die) => die.physicsImpostor!),
      ...walls.map((wall) => wall.physicsImpostor!),
    ];
    let hasSignaledDone = false;
    for (let i = 0; i < 600; ++i) {
      scene!
        .getPhysicsEngine()!
        .getPhysicsPlugin()!
        .executeStep(0.01667, impostors as any);
      if (
        wallIsOpen &&
        dice.every((die) => {
          if (
            die.position
              .multiply(direction.v)
              .scale(direction.u)
              .lengthSquared() <
            wall.position
              .multiply(direction.v)
              .scale(direction.u)
              .lengthSquared()
          ) {
            return true;
          }
          return false;
        })
      ) {
        wallIsOpen = false;
        wall.position.y = 0;
      }
      dice.forEach((die, j) => {
        const { x, y, z } = die.position;
        positions[j].push({
          frame: i,
          value: new BABYLON.Vector3(x, y, z),
        });
        const { x: rx, y: ry, z: rz, w: rw } = die.rotationQuaternion!;
        rotations[j].push({
          frame: i,
          value: new BABYLON.Quaternion(rx, ry, rz, rw),
        });
      });
      if (
        dice.every((die, _i) => {
          if (
            die.physicsImpostor!.getLinearVelocity()!.lengthSquared() < 0.05 &&
            die.physicsImpostor!.getAngularVelocity()!.lengthSquared() < 0.05
          ) {
            return true;
          }
          return false;
        })
      ) {
        if (!hasSignaledDone) {
          hasSignaledDone = true;
          // console.log("triggering thingy on iteration", i);
          // if (i < 400) {
          //   return roll(serverRoll);
          // }
          signaler = setTimeout(() => {
            signalRolled3D(lastRollWasDoubles);
            lastRollWasDoubles = false;
          }, Math.round(i * 16.66667));
        }
      }
    }
    if (!hasSignaledDone) {
      // console.log("doing it live");
      signaler = setTimeout(() => {
        signalRolled3D(lastRollWasDoubles);
        lastRollWasDoubles = false;
      }, Math.round(500 * 16.66667));
    }
    wall.position.y = 0;
    scene.physicsEnabled = false;

    const rollGroup = new BABYLON.AnimationGroup('rollGroup', scene);
    dice.forEach((die, i) => {
      if (!scene) {
        return;
      }
      const localRoll = quatToRoll(die, die.rotationQuaternion!);
      // die.updateVerticesData(
      //   BABYLON.VertexBuffer.UVKind,
      //   diceUVBuffers[(6 + serverRoll[i] - localRoll) % 6]
      // )
      updateUVs(die, localRoll, serverRoll[i]);
      const xSlide = new BABYLON.Animation(
        `xSide${slideIndex++}`,
        'position',
        frameRate,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );
      const xRot = new BABYLON.Animation(
        `xRot${rotIndex++}`,
        'rotationQuaternion',
        frameRate,
        BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );
      xSlide.setKeys(positions[i]);
      xRot.setKeys(rotations[i]);
      die.animations = [];
      die.animations.push(xSlide);
      die.animations.push(xRot);
      rollGroup.addTargetedAnimation(xSlide, die);
      rollGroup.addTargetedAnimation(xRot, die);
      // scene.beginAnimation(die, 0, 500, false, 1);
    });
    rollGroup.play(false);
  };

  setTimeout(() => {
    // do a fake roll on init
    (window as any).REDUX_STORE.getState().game.rolls.forEach(
      (roll: any, i: number) => {
        const die = dice[i];
        updateUVs(die, 1, (6 + roll.value - 1) % 6);
        die.position.y = diceSize('Default') / 1.2;
        die.position.x = -i + diceSize('Default');
        die.position.z = Math.random();
        die.physicsImpostor!.setLinearVelocity(BABYLON.Vector3.Zero());
        die.physicsImpostor!.setAngularVelocity(BABYLON.Vector3.Zero());
      }
    );
    signalRolled3D(false);
  }, 10);

  const snap = ({ x, y }: { x: number; y: number }) => {
    if (!scene) {
      return;
    }
    if (signaler) {
      clearTimeout(signaler);
      signaler = undefined;
    }
    signalRolled3D(lastRollWasDoubles);
    var snapGroup = new BABYLON.AnimationGroup('SnapGroup', scene);
    const center = picker(x * canvas.width, y * canvas.height);
    dice.sort((a, b) => a.position.x - b.position.x);
    const midpoint = dice
      .reduce((v, d) => d.position.add(v), BABYLON.Vector3.Zero())
      .scale(1 / dice.length);
    dice.forEach((die, i) => {
      killAnimation(die);
      const firstPosition = new BABYLON.Vector3(
        midpoint.x + i * diceSize('Default') - diceSize('Default') / 2,
        diceSize('Default') / 2,
        midpoint.z
      );
      const finalPosition = new BABYLON.Vector3(
        center.x + i * diceSize('Default'),
        diceSize('Default') / 2,
        center.z
      );
      let target = die.rotationQuaternion!.toEulerAngles();
      target.y = closestPi(target.y);
      const xSlide = new BABYLON.Animation(
        `xSide${slideIndex++}`,
        'position',
        frameRate,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );
      const frames = [];
      let speed = 0.01;
      let accel = 0.02;
      const maxSpeed = 0.5;
      const minSpeed = 0.01;
      let dest = [firstPosition, finalPosition];
      var pos = die.position;
      let j = 0;
      // let clickFrame = -1;
      // let clickStrength = -1;
      while (dest.length) {
        const vec = dest[0].subtract(pos);
        const dist = vec.length();
        if (dist < speed) {
          const next = dest.shift();
          if (dest.length === 1 && i === 0) {
            const potential = next!.subtract(die.position).length();
            if (potential > 0.2) {
              // clickFrame = j;
              // clickStrength = potential;
              // console.log("click!", { clickFrame, clickStrength });
            }
          }
          frames.push({ frame: j, value: next });
          pos = next!;
        } else {
          const next = pos.add(vec.normalize().scale(speed));
          frames.push({ frame: j, value: next });
          pos = next;
        }
        speed += accel;
        if (dest.length === 1) {
          speed = dist / 5;
        }
        speed = Math.max(minSpeed, Math.min(speed, maxSpeed));
        j += 1;
      }
      xSlide.setKeys(frames);
      const xRot = new BABYLON.Animation(
        `xRot${rotIndex++}`,
        'rotationQuaternion',
        frameRate,
        BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );
      xRot.setKeys([
        { frame: 0, value: die.rotationQuaternion! },
        {
          frame: 15,
          value: BABYLON.Quaternion.FromEulerAngles(
            target.x,
            target.y,
            target.z
          ).normalize(),
        },
      ]);
      die.animations = [];
      die.animations.push(xSlide);
      die.animations.push(xRot);
      snapGroup.addTargetedAnimation(xSlide, die);
      snapGroup.addTargetedAnimation(xRot, die);
    });
    snapGroup.play(false);
    scene.physicsEnabled = false;
  };
  rollListener = (e: any) => {
    roll(
      e.detail.rolls,
      e.detail.turn_index,
      e.detail.players,
      e.detail.dice_type
    );
  };
  snapListener = (e: any) => {
    snap(e.detail);
  };
  (window as any).roll_func = roll;
  document.addEventListener('roll', rollListener, false);
  document.addEventListener('snapDice', snapListener, false);
  scene!.onKeyboardObservable.add((kbInfo) => {
    switch (kbInfo.type) {
      case BABYLON.KeyboardEventTypes.KEYDOWN:
        // if (kbInfo.event.key === "r") {
        //   roll([1, 1]);
        // }
        break;
      case BABYLON.KeyboardEventTypes.KEYUP:
        break;
    }
  });
  scene!.registerBeforeRender(() => {
    // scene!
    //   .getPhysicsEngine()!
    //   .getPhysicsPlugin()!
    //   .executeStep(0.02, [die1!.physicsImpostor!]);
  });
  // BABYLON.SceneLoader.Append(
  //   "http://localhost:3000/",
  //   "level.obj",
  //   scene,
  //   function(scene) {}
  // );
  engine!.runRenderLoop(function () {
    if (scene) {
      let ray = scene.createPickingRay(
        mouse_x,
        mouse_y,
        BABYLON.Matrix.Identity(),
        null
      );
      let hit = scene.pickWithRay(ray);
      let picked = hit?.pickedMesh?.id || '';
      if (!picked.startsWith('ground')) {
        canvas.classList.add('faded');
      } else {
        canvas.classList.remove('faded');
      }
      scene.render();
    }
  });
  window.addEventListener('resize', function () {
    if (engine) {
      engine.resize();
      resizeWalls();
    }
  });
};

const closestPi = (a: number): number => {
  let closest = 10000;
  let result = 0;
  for (let i = -2 * Math.PI; i <= 2 * Math.PI; i += Math.PI) {
    const calc = Math.abs(i - a);
    if (calc < closest) {
      closest = calc;
      result = i;
    }
  }
  return result;
};
