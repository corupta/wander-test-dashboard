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

const MAX_DATA_SET_LENGTH = 2000;

window.createNewChart = (key, type, rawData, timestamp) => {
  const title = `${key}_${type}`;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('id', title);
  canvas.setAttribute('width', 1100);
  canvas.setAttribute('height', 300);
  document.getElementById('charts').appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const datasets = Object.entries(rawData).map(([label, rawValue], i) => ({
    label,
    data: [{x:timestamp, y:rawValue[type]}],
    borderColor: nameToColor[label],
    backgroundColor: nameToColor[label]
  }))
  const config = {
    type: 'line',
    data: {
      datasets
    },
    options: {
      parsing: false,
      normalized: true,
      responsive: false,
      animation: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: title
        }
      },
      scales: {
        x: {
          type: 'timeseries',
          ticks: {
            autoSkip: true,
            maxTicksLimit: 8,
          },
          time: {
            unit: 'second',
            displayFormats: {
              second: 'mm:ss'
            },
          }
        }
      },
      datasets: {
        line: {
          pointRadius: 0, // disable for all `'line'` datasets
          borderWidth: 1,
        }
      },
      elements: {
        point: {
          radius: 0 // default to disabled in all datasets
        }
      }
    },
  };
  const chart = new Chart(ctx, config);
  chartsByTitle[title] = chart;
}

window.updateChart = (key, type, rawData, timestamp) => {
  const title = `${key}_${type}`;
  const chart = window.chartsByTitle[title];
  const data = chart.data;
  data.datasets.forEach((dataset) => {
    const value = rawData[dataset.label][type];
    dataset.data.push({
      x: timestamp,
      y: value
    })
  })
  // chart.update();
}

window.renderAllCharts = () => {
  Object.values(window.chartsByTitle)
    .forEach((c) => {
      c.data.datasets.forEach((dataset) => {
        if (dataset.data.length > MAX_DATA_SET_LENGTH) {
          dataset.data.splice(0, dataset.data.length - MAX_DATA_SET_LENGTH);
        }
      })
      c.update()
    });
  setTimeout(window.renderAllCharts, 1000);
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

window.handleNewData = (data, timestamp = Date.now()) => {
  _createOrUpdateChartsForInputRec(data, timestamp);
}


const _initSocketIO = () => {
  const socket = io("http://192.168.0.21:8080");
  localStorage.debug = 'socket.io-client:socket';
  socket.on('data', window.handleNewData);
  window.renderAllCharts();
}

_initSocketIO();
