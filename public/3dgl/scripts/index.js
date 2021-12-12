window.chartsByTitle = {};

const nameToColor = {
  x: '#a61919',
  y: '#199a2c',
  z: '#285ee5',
  phi: '#41a87d',
  theta: '#891cc7',
  alpha: '#bd771c',
  beta: '#979f19',
  gamma: '#8d197c'
}

const colors = ['#891cc7', '#41a87d', '#285ee5'];

const MAX_DATA_SET_LENGTH = 2000;

const CM = 1;
const corners = [[CM,CM],[-CM,-CM]];
const corners3 = [[CM,CM,CM],[-CM,-CM,-CM]];

window.nextTraces = {}
const resetNextTraces = () => {
  /*['acceleration_int2', 'rotation_int2', 'rotationRate_int2']
    .forEach((k) => {
      nextTraces[k] = new ScatterGL.Dataset([...corners3]);
      // nextTraces[k].points = [];
    });*/
  ['acceleration_2d', /*'rotation_2d',*/ 'rotationRate_2d']
    .forEach((k) => {
      nextTraces[k] = new ScatterGL.Dataset([...corners]);
      // nextTraces[k].points = [];
    })
}
window.resetNextTraces = resetNextTraces;
resetNextTraces();

window.saveNewData = (rawData) => {
  /*window.nextTraces.acceleration_int2.points.push([
    rawData.acceleration.x.int2,
    rawData.acceleration.y.int2,
    rawData.acceleration.z.int2,
  ]);*/
  window.nextTraces.acceleration_2d.points.push([
    rawData.acceleration.y.int2,
    rawData.acceleration.z.int2,
  ]);
  /*window.nextTraces.rotation_int2.points.push([
    rawData.rotation.alpha.int2,
    rawData.rotation.beta.int2,
    rawData.rotation.gamma.int2,
  ]);
  window.nextTraces.rotation_2d.points.push([
    rawData.rotation.alpha.int2,
    rawData.rotation.gamma.int2,
  ]);*/
  /*window.nextTraces.rotationRate_int2.points.push([
    rawData.rotationRate.alpha.int2,
    rawData.rotationRate.beta.int2,
    rawData.rotationRate.gamma.int2,
  ]);*/
  window.nextTraces.rotationRate_2d.points.push([
    -rawData.rotationRate.alpha.int2,
    rawData.rotationRate.gamma.int2,
  ]);
}

const plotByKey = {

}

window.createPlot = () => {
  const currTraces = {...window.nextTraces};
  // resetNextTraces();
  Object.entries(currTraces)
    .forEach(([k, v], i) => {
      const dataset = v;
      const div = document.createElement('div');
      div.setAttribute('id', k);
      document.getElementById('plots').appendChild(div)
      const scatterGL = new ScatterGL(div, {
        rotateOnStart: false
      });
      plotByKey[k] = scatterGL;
      scatterGL.render(dataset);
    });
}

window.updatePlot = () => {
  const currTraces = {...window.nextTraces};
  // resetNextTraces();
  Object.entries(currTraces)
    .forEach(([k, v], i) => {
      const dataset = v;
      const scatterGL = plotByKey[k];
      scatterGL.updateDataset(dataset);
    });
}


const valueTypes = [
  //'der2', 'der1',
  'raw', 'int1', 'int2'];

let plotReady = false;
window.reloadChart = () => {
  if (plotReady) {
    window.updatePlot();
  } else {
    window.createPlot()
    plotReady = true;
  }
  setTimeout(window.reloadChart, 100);
}
window.handleNewData = (data, timestamp = Date.now()) => {
  window.saveNewData(data);
}

const _initSocketIO = () => {
  const socket = io("http://192.168.0.21:8080");
  localStorage.debug = 'socket.io-client:socket';
  socket.on('data', window.handleNewData);
  socket.on('reset', window.resetNextTraces);
  setTimeout(window.reloadChart, 100);
}

_initSocketIO();


