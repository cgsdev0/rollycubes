import * as cannon from "cannon";
import { CannonJSPlugin } from "babylonjs";

import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import { store } from "../store";

var cannonPlugin = new CannonJSPlugin(true, 10, cannon);

const lookupTable: Record<string, number> = {
  "00": 1,
  "01": 2,
  "02": 6,
  "03": 5,
  "10": 4,
  "11": 4,
  "12": 4,
  "13": 4,
  "30": 3,
  "31": 3,
  "32": 1,
  "33": 6,
};
const quatToRoll = (q: BABYLON.Quaternion) => {
  let { x, z } = q.toEulerAngles();
  x = (Math.round((x / Math.PI) * 2) + 4) % 4;
  z = (Math.round((z / Math.PI) * 2) + 4) % 4;
  console.log(x, z);

  return lookupTable[`${x}${z}`] || 0;
};

// prettier-ignore
const diceUVBuffers = [
[0.75,1,0.5,1,0.5,0.5,0.75,0.5,1,1,0.75,1,0.75,0.5,1,0.5,0.5,1,0.25,1,0.25,0.5,0.5,0.5,0.5,0.5,0.25,0.5,0.25,0,0.5,0,0.25,1,0,1,0,0.5,0.25,0.5,0.75,0.5,0.5,0.5,0.5,0,0.75,0],
[1, 1, 0.75, 1, 0.75, 0.5, 1, 0.5, 0.5, 0.5, 0.25, 0.5, 0.25, 0, 0.5, 0, 0.75, 1, 0.5, 1, 0.5, 0.5, 0.75, 0.5, 0.75, 0.5, 0.5, 0.5, 0.5, 0, 0.75, 0, 0.5, 1, 0.25, 1, 0.25, 0.5, 0.5, 0.5, 0.25, 1, 0, 1, 0, 0.5, 0.25, 0.5],
[0.5, 0.5, 0.25, 0.5, 0.25, 0, 0.5, 0, 0.75, 0.5, 0.5, 0.5, 0.5, 0, 0.75, 0, 1, 1, 0.75, 1, 0.75, 0.5, 1, 0.5, 0.25, 1, 0, 1, 0, 0.5, 0.25, 0.5, 0.75, 1, 0.5, 1, 0.5, 0.5, 0.75, 0.5, 0.5, 1, 0.25, 1, 0.25, 0.5, 0.5, 0.5],
[0.75, 0.5, 0.5, 0.5, 0.5, 0, 0.75, 0, 0.25, 1, 0, 1, 0, 0.5, 0.25, 0.5, 0.5, 0.5, 0.25, 0.5, 0.25, 0, 0.5, 0, 0.5, 1, 0.25, 1, 0.25, 0.5, 0.5, 0.5, 1, 1, 0.75, 1, 0.75, 0.5, 1, 0.5, 0.75, 1, 0.5, 1, 0.5, 0.5, 0.75, 0.5],
[0.25, 1, 0, 1, 0, 0.5, 0.25, 0.5, 0.5, 1, 0.25, 1, 0.25, 0.5, 0.5, 0.5, 0.75, 0.5, 0.5, 0.5, 0.5, 0, 0.75, 0, 0.75, 1, 0.5, 1, 0.5, 0.5, 0.75, 0.5, 0.5, 0.5, 0.25, 0.5, 0.25, 0, 0.5, 0, 1, 1, 0.75, 1, 0.75, 0.5, 1, 0.5],
[0.5, 1, 0.25, 1, 0.25, 0.5, 0.5, 0.5, 0.75, 1, 0.5, 1, 0.5, 0.5, 0.75, 0.5, 0.25, 1, 0, 1, 0, 0.5, 0.25, 0.5, 1, 1, 0.75, 1, 0.75, 0.5, 1, 0.5, 0.75, 0.5, 0.5, 0.5, 0.5, 0, 0.75, 0, 0.5, 0.5, 0.25, 0.5, 0.25, 0, 0.5, 0],
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

const createDie = (() => {
  var diceMat: BABYLON.StandardMaterial;
  var i = 0;
  return (scene: BABYLON.Scene) => {
    if (!diceMat) {
      diceMat = new BABYLON.StandardMaterial("diceMat", scene);
      diceMat.diffuseTexture = new BABYLON.Texture(
        "http://localhost:3000/dice.png",
        scene
      );
      diceMat.ambientColor = scene.ambientColor;
    }
    const diceUV = createDiceUVs(0);
    const diceSize = 0.5;
    const die = BABYLON.MeshBuilder.CreateBox(
      `die${i++}`,
      {
        width: diceSize,
        height: diceSize,
        depth: diceSize,
        faceUV: diceUV,
        updatable: true,
      },
      scene
    );
    die.material = diceMat;
    //let buffer = die.getVerticesData(BABYLON.VertexBuffer.UVKind);
    //console.log(buffer);
    return die;
  };
})();

const dataLabels = [
  "frame",
  "x",
  "y",
  "z",
  "rx",
  "ry",
  "rz",
  "rw",
  "lvx",
  "lvy",
  "lvz",
  "lax",
  "lay",
  "laz",
  "avx",
  "avy",
  "avz",
  "aax",
  "aay",
  "aaz",
];

let sceneInit = false;
export const initScene = async () => {
  if (sceneInit) {
    return;
  }
  sceneInit = true;
  // const result = await window.fetch("http://localhost:3000/simulated.txt");
  // const data = await result.text();
  const dice: any = [[], []];
  // let frame: any = {};
  // const splitted = data
  //   .split("\n")
  //   .filter((a) => a)
  //   .map((d) => d.split(",").filter((a) => a))
  //   .forEach((arr, j) => {
  //     dice[j] = [];
  //     for (let i = 0; i < arr.length; ++i) {
  //       if (i % 20 === 0 && i) {
  //         dice[j].push(frame);
  //         frame = {};
  //       }
  //       frame[dataLabels[i % 20]] = arr[i];
  //     }
  //   });
  var canvas: any = document.getElementById("renderCanvas");
  canvas.classList.remove("hidden");
  // Load the 3D engine
  const engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
  });
  const scene = new BABYLON.Scene(engine);
  scene.ambientColor = new BABYLON.Color3(1, 1, 1);
  const camera = new BABYLON.FreeCamera(
    "camera",
    new BABYLON.Vector3(0, 10, 1),
    scene
  );
  camera.setTarget(BABYLON.Vector3.Zero());
  const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(-1, 1, 0),
    scene
  );
  light.intensity = 0.5;
  // var lensFlareSystem = new BABYLON.LensFlareSystem("lensFlareSystem", light, scene);
  // make some dice
  //
  const die1 = createDie(scene);
  die1.position.y = 3;
  const frameRate = 60;
  // const xSlide2 = new BABYLON.Animation(
  //   "xSlide2",
  //   "position",
  //   frameRate,
  //   BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
  //   BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  // );
  // const xRot2 = new BABYLON.Animation(
  //   "xRot2",
  //   "rotation",
  //   frameRate,
  //   BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
  //   BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  // );
  // console.log(dice[0].map((a: any) => ({ frame: a.frame, value: a.y })));
  // xSlide.setKeys(
  //   dice[0].map((a: any) => ({
  //     frame: Number(a.frame),
  //     value: new BABYLON.Vector3(Number(a.x), Number(a.y), Number(a.z)),
  //   }))
  // );
  // xRot.setKeys(
  //   dice[0].map((a: any) => ({
  //     frame: Number(a.frame),
  //     value: new BABYLON.Quaternion(
  //       Number(a.rx),
  //       Number(a.ry),
  //       Number(a.rz),
  //       Number(a.rw)
  //     ),
  //   }))
  // );
  // xSlide2.setKeys(
  //   dice[1].map((a: any) => ({
  //     frame: Number(a.frame),
  //     value: new BABYLON.Vector3(Number(a.x), Number(a.y), Number(a.z)),
  //   }))
  // );
  // xRot2.setKeys(
  //   dice[1].map((a: any) => ({
  //     frame: Number(a.frame),
  //     value: new BABYLON.Quaternion(
  //       Number(a.rx),
  //       Number(a.ry),
  //       Number(a.rz),
  //       Number(a.rw)
  //     ),
  //   }))
  // );
  const die2 = createDie(scene);
  die2.position.y = 2;
  die2.position.x = 0.2;
  // die2.animations.push(xSlide2);
  // die2.animations.push(xRot2);
  // scene.beginAnimation(die1, 0, 5 * frameRate, true);
  // scene.beginAnimation(die2, 0, 5 * frameRate, true);

  var greenMat = new BABYLON.StandardMaterial("GREENmat", scene);
  greenMat.diffuseColor = new BABYLON.Color3(0, 0.35, 0);
  /*const table = [];
  for (let i = 0; i < 8; ++i) {
    var box = BABYLON.MeshBuilder.CreateBox(`box${i}`, { width: 2 }, scene);
    box.material = greenMat;
    box.rotate(new BABYLON.Vector3(0, 1, 0), (Math.PI / 4) * i);
    box.translate(new BABYLON.Vector3(1, 0, 0), Math.sqrt(2) / 2 - 0.5);
    table.push(box);
  }
  const ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { width: 10, height: 10 },
    scene
  );
  BABYLON.MeshBuilder.CreatePlane("north", { width: 10, height: 10 }).translate(
    new BABYLON.Vector3(0, 1, 1),
    5
  );
  BABYLON.MeshBuilder.CreatePlane("east", { width: 10, height: 10 })
    .translate(new BABYLON.Vector3(1, 1, 0), 5)
    .rotate(new BABYLON.Vector3(0, 1, 0), Math.PI / 2);
  BABYLON.MeshBuilder.CreatePlane("south", { width: 10, height: 10 })
    .translate(new BABYLON.Vector3(0, 1, -1), 5)
    .rotate(new BABYLON.Vector3(0, 1, 0), Math.PI);
  BABYLON.MeshBuilder.CreatePlane("west", { width: 10, height: 10 })
    .translate(new BABYLON.Vector3(-1, 1, 0), 5)
    .rotate(new BABYLON.Vector3(0, 1, 0), Math.PI * 1.5);
    */

  // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
  var ground = BABYLON.Mesh.CreateGround("ground1", 32, 32, 0, scene);
  ground.visibility = 0;
  var gravityVector = new BABYLON.Vector3(0, -9.81, 0);
  scene.enablePhysics(gravityVector, cannonPlugin);
  die1.physicsImpostor = new BABYLON.PhysicsImpostor(
    die1,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 2, restitution: 0.9 },
    scene
  );
  die2.physicsImpostor = new BABYLON.PhysicsImpostor(
    die2,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 2, restitution: 0.9 },
    scene
  );
  ground.physicsImpostor = new BABYLON.PhysicsImpostor(
    ground,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 0, restitution: 0.9 },
    scene
  );

  // die1.physicsImpostor.applyImpulse(
  //   new BABYLON.Vector3(1, 3, 0),
  //   new BABYLON.Vector3(1, 2, 0)
  // );
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

  const roll = (a: number, b: number) => {
    scene.physicsEnabled = false;
    const positions: any[][] = [[], []];
    const rotations: any[][] = [[], []];
    die1.position.x = 0;
    die1.physicsImpostor!.setLinearVelocity(BABYLON.Vector3.Zero());
    die1.physicsImpostor!.setAngularVelocity(BABYLON.Vector3.Zero());
    die2.physicsImpostor!.setLinearVelocity(BABYLON.Vector3.Zero());
    die2.physicsImpostor!.setAngularVelocity(BABYLON.Vector3.Zero());
    die1.position.y = 3;
    die1.position.z = 0;
    die2.position.y = 4;
    die2.position.x = 0.2;
    die2.position.z = 0;
    for (let i = 0; i < 500; ++i) {
      scene!
        .getPhysicsEngine()!
        .getPhysicsPlugin()!
        .executeStep(0.01667, [die1.physicsImpostor!, die2.physicsImpostor!]);
      {
        const { x, y, z } = die1.position;
        positions[0].push({
          frame: i,
          value: new BABYLON.Vector3(x, y, z),
        });
        const { x: rx, y: ry, z: rz, w: rw } = die1.rotationQuaternion!;
        rotations[0].push({
          frame: i,
          value: new BABYLON.Quaternion(rx, ry, rz, rw),
        });
      }
      {
        const { x, y, z } = die2.position;
        positions[1].push({
          frame: i,
          value: new BABYLON.Vector3(x, y, z),
        });
        const { x: rx, y: ry, z: rz, w: rw } = die2.rotationQuaternion!;
        rotations[1].push({
          frame: i,
          value: new BABYLON.Quaternion(rx, ry, rz, rw),
        });
      }
    }
    const r1 = quatToRoll(die1.rotationQuaternion!);
    const r2 = quatToRoll(die2.rotationQuaternion!);
    die1.updateVerticesData(
      BABYLON.VertexBuffer.UVKind,
      diceUVBuffers[(6 + a - r1) % 6]
    );
    die2.updateVerticesData(
      BABYLON.VertexBuffer.UVKind,
      diceUVBuffers[(6 + b - r2) % 6]
    );
    console.log("locally rolled: ", r1, r2);
    const xSlide = new BABYLON.Animation(
      "xSlide",
      "position",
      frameRate,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const xRot = new BABYLON.Animation(
      "xRot",
      "rotationQuaternion",
      frameRate,
      BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const xSlide2 = new BABYLON.Animation(
      "xSlide2",
      "position",
      frameRate,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const xRot2 = new BABYLON.Animation(
      "xRot2",
      "rotationQuaternion",
      frameRate,
      BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    xSlide.setKeys(positions[0]);
    xRot.setKeys(rotations[0]);
    xSlide2.setKeys(positions[1]);
    xRot2.setKeys(rotations[1]);
    die1.animations = [];
    die1.animations.push(xSlide);
    die1.animations.push(xRot);
    die2.animations = [];
    die2.animations.push(xSlide2);
    die2.animations.push(xRot2);
    scene.beginAnimation(die1, 0, 500, false);
    scene.beginAnimation(die2, 0, 500, false);
  };
  document.addEventListener(
    "roll",
    (e: any) => {
      roll(e.detail[0], e.detail[1]);
    },
    false
  );
  scene.onKeyboardObservable.add((kbInfo) => {
    switch (kbInfo.type) {
      case BABYLON.KeyboardEventTypes.KEYDOWN:
        if (kbInfo.event.key === "r") {
          roll(1, 1);
        }
        break;
      case BABYLON.KeyboardEventTypes.KEYUP:
        break;
    }
  });
  scene.registerBeforeRender(() => {
    // scene!
    //   .getPhysicsEngine()!
    //   .getPhysicsPlugin()!
    //   .executeStep(0.02, [die1!.physicsImpostor!]);
    scene.physicsEnabled = false;
  });
  // BABYLON.SceneLoader.Append(
  //   "http://localhost:3000/",
  //   "level.obj",
  //   scene,
  //   function(scene) {}
  // );
  engine.runRenderLoop(function() {
    scene.render();
  });
  window.addEventListener("resize", function() {
    engine.resize();
  });
};
