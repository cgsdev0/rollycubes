import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import { store } from "../store";

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
    const diceUV = [];
    diceUV[0] = new BABYLON.Vector4(0.5, 0.5, 0.75, 1); // rear face
    diceUV[4] = new BABYLON.Vector4(0.0, 0.5, 0.25, 1); //front face
    diceUV[2] = new BABYLON.Vector4(0.25, 0.5, 0.5, 1); //right side
    diceUV[1] = new BABYLON.Vector4(0.75, 0.5, 1.0, 1); //left side
    diceUV[3] = new BABYLON.Vector4(0.25, 0.0, 0.5, 0.5); //top side
    diceUV[5] = new BABYLON.Vector4(0.5, 0.0, 0.75, 0.5); //bottom side
    const diceSize = 0.05;

    const die = BABYLON.MeshBuilder.CreateBox(
      `die${i++}`,
      { width: diceSize, height: diceSize, depth: diceSize, faceUV: diceUV },
      scene
    );
    die.material = diceMat;
    return die;
  };
})();

export const initScene = () => {
  var canvas: any = document.getElementById("renderCanvas");
  canvas.classList.remove("hidden");
  // Load the 3D engine
  const engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
  });
  const scene = new BABYLON.Scene(engine);
  scene.ambientColor = new BABYLON.Color3(1, 1, 1);
  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 2.5,
    3,
    new BABYLON.Vector3(0, 0, 0),
    scene
  );
  camera.attachControl(canvas, true);
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
  die1.translate(new BABYLON.Vector3(0, 1, 0), 0.6);
  const die2 = createDie(scene);
  die2.translate(new BABYLON.Vector3(0.5, 1, 0), 0.6);

  /*  var greenMat = new BABYLON.StandardMaterial("GREENmat", scene);
  greenMat.diffuseColor = new BABYLON.Color3(0, 0.35, 0);
  const table = [];
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
  BABYLON.SceneLoader.Append(
    "http://localhost:3000/",
    "level.glb",
    scene,
    function(scene) {}
  );
  engine.runRenderLoop(function() {
    scene.render();
    die1.rotate(new BABYLON.Vector3(1, 0.8, 0.5), 0.01);
    console.log(store.getState().players.length);
  });
  window.addEventListener("resize", function() {
    engine.resize();
  });
};
