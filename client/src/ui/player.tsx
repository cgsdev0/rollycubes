import React from 'react';
import {connect} from 'react-redux';
import '../App.css';
import {selectSelfIndex, selectTurnIndex} from '../selectors/game_selectors';
import {Player, ReduxState} from '../store';
import {ThemeContext} from '../themes';
import * as BABYLON from "babylonjs";

interface Props {
  player: Player;
  n: number;
  self_index: number;
  turn_index: number;
  socket?: WebSocket;
}

const PlayerComponent = (props: Props) => {
  const changeName = () => {
    const e = window.prompt('Enter a name: ', props.player.name);
    if (e === null) return;
    if (props.socket) {
      props.socket.send(JSON.stringify({type: 'update_name', name: e}));
      localStorage.setItem('name', e);
    }
  };

  const doSome3Dstuff = () => {
      var canvas: any = document.getElementById('renderCanvas');
    canvas.classList.remove("hidden")
      // Load the 3D engine
      const engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
      const scene = new BABYLON.Scene(engine);
    scene.ambientColor = new BABYLON.Color3(1, 1, 1);
      const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0), scene);
      camera.attachControl(canvas, true);
      const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(-1, 1, 0), scene);
    light.intensity = 0.5;
    // var lensFlareSystem = new BABYLON.LensFlareSystem("lensFlareSystem", light, scene);
    // make some dice
    //
    const diceMat = new BABYLON.StandardMaterial("diceMat", scene);
    diceMat.diffuseTexture = new BABYLON.Texture("http://localhost:3000/dice.png",scene);
    const diceUV = [];
    diceUV[0] = new BABYLON.Vector4(0.5, 0.5, 0.75, 1) // rear face
    diceUV[4] = new BABYLON.Vector4(0.0, 0.5, 0.25, 1); //front face
    diceUV[2] = new BABYLON.Vector4(0.25, 0.5, 0.5, 1); //right side
    diceUV[1] = new BABYLON.Vector4(0.75, 0.5, 1.0, 1); //left side
    diceUV[3] = new BABYLON.Vector4(0.25, 0.0, 0.5, 0.5); //top side
    diceUV[5] = new BABYLON.Vector4(0.5, 0.0, 0.75, 0.5); //bottom side
    const diceSize = 0.05;
    const die1 = BABYLON.MeshBuilder.CreateBox("die1", {width: diceSize, height: diceSize, depth: diceSize, faceUV: diceUV}, scene)
    diceMat.ambientColor = scene.ambientColor;
    die1.translate(new BABYLON.Vector3(0, 1, 0), 0.6);
    die1.material = diceMat
      var greenMat = new BABYLON.StandardMaterial("GREENmat", scene);
      greenMat.diffuseColor = new BABYLON.Color3(0, 0.35, 0);
      const table = []
    for(let i = 0; i < 8; ++i) {
      console.log(i);
      var box = BABYLON.MeshBuilder.CreateBox(`box${i}`, {width: 2}, scene);
    box.material = greenMat;
      box.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI / 4 * i);
      box.translate(new BABYLON.Vector3(1, 0, 0), Math.sqrt(2) / 2 - 0.5)
      table.push(box);
    }
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width:10, height:10}, scene);
    BABYLON.MeshBuilder.CreatePlane("north", {width: 10, height: 10}).translate(new BABYLON.Vector3(0, 1, 1), 5);
    BABYLON.MeshBuilder.CreatePlane("east", {width: 10, height: 10}).translate(new BABYLON.Vector3(1, 1, 0), 5).rotate(new BABYLON.Vector3(0, 1, 0), Math.PI / 2);
    BABYLON.MeshBuilder.CreatePlane("south", {width: 10, height: 10}).translate(new BABYLON.Vector3(0, 1, -1), 5).rotate(new BABYLON.Vector3(0, 1, 0), Math.PI );
    BABYLON.MeshBuilder.CreatePlane("west", {width: 10, height: 10}).translate(new BABYLON.Vector3(-1, 1, 0), 5).rotate(new BABYLON.Vector3(0, 1, 0), Math.PI * 1.5);
      engine.runRenderLoop(function(){
            scene.render();
            die1.rotate(new BABYLON.Vector3(1,0.8,0.5), 0.01)
      });
      window.addEventListener('resize', function(){
            engine.resize();
      });
  }

  const onKick = () => {
    const {player, n} = props;
    const e = window.confirm(`Are you sure you want to kick ${player.name}?`);
    if (e && props.socket) {
      props.socket.send(JSON.stringify({type: 'kick', id: n}));
    }
  };

  React.useEffect(() => doSome3Dstuff(), []);
  const {n, player, self_index, turn_index} = props;
  const theme = React.useContext(ThemeContext);
  return (
    <div
      className={`Player${!player.connected ? ' Disconnected' : ''}`}
      style={turn_index === n ? theme.turnHighlight : undefined}
      onClick={
        self_index === n ? doSome3Dstuff : player.connected ? undefined : onKick
      }>
      <div className="Name">
        {player.name || `User${n + 1}`}
        <div className="You">{self_index === n ? ' (You)' : null}</div>
      </div>
      <div className="Score">{JSON.stringify(player.score)}</div>
    </div>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    self_index: selectSelfIndex(state),
    turn_index: selectTurnIndex(state),
    socket: state.socket,
  };
};

export default connect(mapStateToProps)(PlayerComponent);
