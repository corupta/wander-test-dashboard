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

window.nextTraces = {}
const resetNextTraces = () => {
  ['acceleration_int2', 'rotation_int2', 'rotationRate_int2']
    .forEach((k) => {
      nextTraces[k] = [];
    })
}
resetNextTraces();

window.saveNewData = (rawData) => {
  window.nextTraces.acceleration_int2.push({
    x: rawData.acceleration.x.int2,
    y: rawData.acceleration.y.int2,
    z: rawData.acceleration.z.int2,
  });
  window.nextTraces.rotation_int2.push({
    x: rawData.rotation.alpha.int2,
    y: rawData.rotation.beta.int2,
    z: rawData.rotation.gamma.int2,
  });
  window.nextTraces.rotationRate_int2.push({
    x: rawData.rotationRate.alpha.int2,
    y: rawData.rotationRate.beta.int2,
    z: rawData.rotationRate.gamma.int2,
  })
}

window.createPlot = () => {
  const currTraces = {...window.nextTraces};
  resetNextTraces();
  Object.entries(currTraces)
    .forEach(([k, v], i) => {
      const trace = {
        x: v.map((p) => p.x),
        y: v.map((p) => p.x),
        z: v.map((p) => p.x),
        mode: 'markers',
        marker: {
          size: 2,
          color: colors[i],
          symbol: 'circle',
          line: {
            color: colors[i],
            width: 1,
            opacity: 0.8
          },
          opacity: 0.8
        },
        type: 'scatter3d'
      }
      const div = document.createElement('div');
      div.setAttribute('id', k);
      document.getElementById('plots').appendChild(div)
      const layout = {
        autosize: true,
        l: 0, r: 0, b: 0, t: 0, pad: 0,
        showlegend: false,
        margin:{l:0,r:0,b:0,t:0},
        xaxis: {
          uirevision: 'time',
        },
        yaxis: {
          uirevision: 'time',
        },
        zaxis: {
          uirevision: 'time',
        },

      }
      Plotly.newPlot(k, [trace], layout);
    });
}

window.updatePlot = () => {
  const currTraces = {...window.nextTraces};
  resetNextTraces();
  Object.entries(currTraces).forEach(([traceKey, tr]) => {
    const patchData = ['x','y','z'].reduce((acc, k) => ({
      ...acc,
      [k]: [tr.map((x) => x[k])]
    }), {});
    const patchIndexes = [0]
    // Object.values(currTraces).map((tr, i) => i);
    Plotly.extendTraces(traceKey, patchData, patchIndexes);
  })
  /*const patchData = ['x','y','z'].reduce((acc, k) => ({
    ...acc,
    [k]: Object.values(currTraces).map((tr) => tr.map((x) => x[k]))
  }), {});

  Plotly.extendTraces('wanderPlot', patchData, patchIndexes);*/
}


const valueTypes = [
  //'der2', 'der1',
  'raw', 'int1', 'int2'];

const _createOrUpdateChartsForInputRec = (rawInput, timestamp, baseKey='') => {
  if (typeof rawInput === 'number') return 0;
  if (typeof rawInput !== 'object' || !rawInput) {
    console.log('CRITICAL rawInput not obj/num', typeof rawInput, rawInput, baseKey);
  }
  let depth;
  Object.entries(rawInput).forEach(([kEnd, rawData]) => {
    const key = `${baseKey ? `${baseKey}_`:''}${kEnd}`;
    depth = 1 + _createOrUpdateChartsForInputRec(rawData, timestamp, key);
  });
  if (depth !== 2) {
    return depth;
  }
  valueTypes.forEach((type) => {
    const title = `${baseKey ? `${baseKey}_`:''}${type}`;
    if (window.chartsByTitle[title]) {
      window.updateChart(baseKey, type, rawInput, timestamp)
    } else {
      window.createNewChart(baseKey, type, rawInput, timestamp)
    }
  })
}

let plotReady = false;
window.reloadChart = () => {
  if (plotReady) {
    window.updatePlot();
  } else {
    window.createPlot()
    plotReady = true;
  }
  setTimeout(window.reloadChart, 1000);
}
window.handleNewData = (data, timestamp = Date.now()) => {
  window.saveNewData(data);
}

const _initSocketIO = () => {
  const socket = io("http://192.168.0.21:8080");
  localStorage.debug = 'socket.io-client:socket';
  socket.on('data', window.handleNewData);
  setTimeout(window.reloadChart, 1000);
}

_initSocketIO();


