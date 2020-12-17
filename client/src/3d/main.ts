import * as cannon from "cannon";
import { CannonJSPlugin } from "babylonjs";

import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import { store, ReduxState } from "../store";

const frameRate = 60;

var cannonPlugin = new CannonJSPlugin(true, 10, cannon);

function rand<T>(items: T[]): T {
  // "|" for a kinda "int div"
  return items[(items.length * Math.random()) | 0];
}

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
  "32": 3,
  "33": 3,
};
const quatToRoll = (q: BABYLON.Quaternion) => {
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

const diceSize = 0.5;

const makeDieCreator = () => {
  var diceMat: BABYLON.StandardMaterial;
  var i = 0;
  return (scene: BABYLON.Scene) => {
    if (!diceMat) {
      diceMat = new BABYLON.StandardMaterial("diceMat", scene);
      diceMat.diffuseTexture = new BABYLON.Texture("/dice.png", scene);
      diceMat.ambientColor = scene.ambientColor;
    }
    const diceUV = createDiceUVs(0);
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
    die.isPickable = true;
    die.material = diceMat;
    //let buffer = die.getVerticesData(BABYLON.VertexBuffer.UVKind);
    //console.log(buffer);
    die.physicsImpostor = new BABYLON.PhysicsImpostor(
      die,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 2, restitution: 0.9 },
      scene
    );

    // make that shit draggable
    var pointerDragBehavior = new BABYLON.PointerDragBehavior({
      dragPlaneNormal: new BABYLON.Vector3(0, 1, 0),
    });
    // Use drag plane in world space
    pointerDragBehavior.useObjectOrientationForDragging = false;
    //pointerDragBehavior.dragDeltaRatio = 1;
    pointerDragBehavior.onDragStartObservable.add((event) => {
      killAnimation(die);
    });
    die.addBehavior(pointerDragBehavior);
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
  die.rotationQuaternion = lastKeyframe.value;
  die.position.y = diceSize / 2;
};

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
let scene: BABYLON.Scene | undefined;
let engine: BABYLON.Engine | undefined;
let rollListener: any;

export const destroyScene = async () => {
  if (!sceneInit) {
    return;
  }
  sceneInit = false;

  var canvas: any = document.getElementById("renderCanvas");
  canvas.setAttribute("class", "hidden");

  if (scene) {
    scene.dispose();
  }
  if (engine) {
    engine.dispose();
  }
  document.removeEventListener("roll", rollListener);
  rollListener = undefined;
};
export const initScene = async (state: ReduxState) => {
  if (sceneInit) {
    return;
  }
  sceneInit = true;
  // const result = await window.fetch("http://localhost:3000/simulated.txt");
  // const data = await result.text();
  const diceCount = 2;
  const dice: BABYLON.AbstractMesh[] = [];
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
  var canvas: any = document.getElementById("renderCanvas");
  canvas.classList.remove("hidden");
  // Load the 3D engine
  engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
  });
  scene = new BABYLON.Scene(engine);

  scene.ambientColor = new BABYLON.Color3(1, 1, 1);
  const camera = new BABYLON.FreeCamera(
    "camera",
    new BABYLON.Vector3(0, 10, 1),
    scene
  );
  //camera.attachControl(canvas, true);
  camera.setTarget(BABYLON.Vector3.Zero());
  const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(-1, 1, 0),
    scene
  );

  light.intensity = 0.5;

  var gravityVector = new BABYLON.Vector3(0, -9.81, 0);
  scene.enablePhysics(gravityVector, cannonPlugin);

  // make some dice
  //
  const createDie = makeDieCreator();
  for (let i = 0; i < diceCount; ++i) {
    dice[i] = createDie(scene);
    //dice[i].position = new BABYLON.Vector3(1000 + i, 1000, 1000);
  }

  var greenMat = new BABYLON.StandardMaterial("GREENmat", scene);
  greenMat.diffuseColor = new BABYLON.Color3(0, 0.35, 0);

  // Our built-in 'ground' shape. Params: name,width,depth,subdivs,scene
  var ground = BABYLON.Mesh.CreateGround("ground1", 128, 128, 0, scene);
  var ground2 = BABYLON.Mesh.CreateGround("ground2", 128, 128, 20, scene);

  const makePicker = (
    scene: BABYLON.Scene,
    camera: BABYLON.Camera,
    ground: BABYLON.AbstractMesh
  ) => {
    return (x: number, y: number) => {
      const result = scene.pick(
        x,
        y,
        (mesh: BABYLON.AbstractMesh) => mesh == ground,
        false,
        camera
      );
      if (!result) {
        return BABYLON.Vector3.Zero();
      }
      return result.pickedPoint || BABYLON.Vector3.Zero();
    };
  };

  const picker = makePicker(scene, camera, ground);

  var northWall = BABYLON.MeshBuilder.CreateBox(
    "northWall",
    { width: 128, height: 40, depth: 1, updatable: true },
    scene
  );
  var southWall = BABYLON.MeshBuilder.CreateBox(
    "southWall",
    { width: 128, height: 40, depth: 1, updatable: true },
    scene
  );
  var eastWall = BABYLON.MeshBuilder.CreateBox(
    "eastWall",
    { width: 1, depth: 128, height: 40, updatable: true },
    scene
  );
  var westWall = BABYLON.MeshBuilder.CreateBox(
    "westWall",
    { width: 1, depth: 128, height: 40, updatable: true },
    scene
  );

  const walls = [northWall, southWall, eastWall, westWall];

  // const updateWallPhysics = (wall: any) => {
  //   {
  //     const { x, y, z } = wall.scaling;
  //     wall.physicsImpostor.physicsBody.shapes[0].halfExtents.set(
  //       Math.abs(x / 2),
  //       Math.abs(y / 2),
  //       Math.abs(z / 2)
  //     );
  //   }
  //   {
  //     const { x, y, z } = wall.position;
  //     wall.physicsImpostor.physicsBody.position.set(x, y, z);
  //   }
  //   wall.physicsImpostor.physicsBody.computeAABB();
  //   wall.physicsImpostor.physicsBody.shapes[0].updateBoundingSphereRadius();
  //   wall.physicsImpostor.physicsBody.shapes[0].updateConvexPolyhedronRepresentation();
  //   console.log(wall.physicsImpostor.physicsBody);
  // };
  walls.forEach((wall) => {
    wall.physicsImpostor = new BABYLON.PhysicsImpostor(
      wall,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0, restitution: 0.9 },
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
    { mass: 0, restitution: 0.9 },
    scene
  );
  ground2.physicsImpostor = new BABYLON.PhysicsImpostor(
    ground2,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 0, restitution: 0.9 },
    scene
  );

  // TRANSPARENT BG
  // if you're on acid
  //scene.autoClear = false;
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

  const directions = [
    { name: "north", v: new BABYLON.Vector3(0, 0, 1), u: 1 },
    { name: "south", v: new BABYLON.Vector3(0, 0, 1), u: -1 },
    { name: "east", v: new BABYLON.Vector3(1, 0, 0), u: 1 },
    { name: "west", v: new BABYLON.Vector3(1, 0, 0), u: -1 },
  ];
  const roll = (serverRoll: number[]): void => {
    console.log(serverRoll);
    if (serverRoll.length === 0) {
      serverRoll = [3, 4];
    }
    if (!scene) {
      return;
    }
    scene.physicsEnabled = false;
    const direction = rand(directions);
    scene.physicsEnabled = true;
    //console.log(direction);
    const wall = walls[directions.indexOf(direction)];
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
        .executeStep(0.01667, impostors);
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
        dice.every((die, i) => {
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
          console.log("triggering thingy on iteration", i);
          // if (i < 400) {
          //   return roll(serverRoll);
          // }
          setTimeout(() => {
            if (scene) {
              scene.physicsEnabled = true;
            }
            console.log("thingy!");
          }, Math.round(i * 16.66667));
          break;
        }
      }
    }
    if (!hasSignaledDone) {
      hasSignaledDone = true;
      console.log("doing it live");
      setTimeout(() => {
        if (scene) {
          scene.physicsEnabled = true;
        }
        console.log("thingy!");
      }, Math.round(500 * 16.66667));
    }
    wall.position.y = 0;
    scene.physicsEnabled = false;
    dice.forEach((die, i) => {
      if (!scene) {
        return;
      }
      const localRoll = quatToRoll(die.rotationQuaternion!);
      //console.log("locally rolled: ", localRoll);
      die.updateVerticesData(
        BABYLON.VertexBuffer.UVKind,
        diceUVBuffers[(6 + serverRoll[i] - localRoll) % 6]
      );
      const xSlide = new BABYLON.Animation(
        `xSide${i}`,
        "position",
        frameRate,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );
      const xRot = new BABYLON.Animation(
        `xRot${i}`,
        "rotationQuaternion",
        frameRate,
        BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );
      xSlide.setKeys(positions[i]);
      xRot.setKeys(rotations[i]);
      die.animations = [];
      die.animations.push(xSlide);
      die.animations.push(xRot);
      scene.beginAnimation(die, 0, 500, false, 1);
    });
  };

  setTimeout(() => {
    // do a fake roll on init
    state.rolls.forEach((roll, i) => {
      const die = dice[i];
      die.updateVerticesData(
        BABYLON.VertexBuffer.UVKind,
        diceUVBuffers[(6 + roll.value - 1) % 6]
      );
      die.position.y = diceSize / 1.2;
      die.position.x = i;
      die.position.z = Math.random();
      die.physicsImpostor!.setLinearVelocity(BABYLON.Vector3.Zero());
      die.physicsImpostor!.setAngularVelocity(BABYLON.Vector3.Zero());
    });
  }, 10);

  rollListener = (e: any) => {
    roll(e.detail);
  };
  document.addEventListener("roll", rollListener, false);
  scene.onKeyboardObservable.add((kbInfo) => {
    switch (kbInfo.type) {
      case BABYLON.KeyboardEventTypes.KEYDOWN:
        if (kbInfo.event.key === "r") {
          roll([1, 1]);
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
  });
  // BABYLON.SceneLoader.Append(
  //   "http://localhost:3000/",
  //   "level.obj",
  //   scene,
  //   function(scene) {}
  // );
  engine.runRenderLoop(function() {
    if (scene) {
      scene.render();
    }
  });
  window.addEventListener("resize", function() {
    if (engine) {
      engine.resize();
      resizeWalls();
    }
  });
};
