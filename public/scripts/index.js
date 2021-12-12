window.chartsByTitle = {};

window.createNewChart = (key, type, rawData, timestamp) => {
  const title = `${key}_${type}`;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('id', title);
  canvas.setAttribute('width', 400);
  canvas.setAttribute('height', 400);
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const datasets = Object.entries(rawData).map(([label, rawValue]) => ({
    label,
    data: [{x:timestamp, y:rawValue[type]}]
    /*borderColor: Utils.CHART_COLORS.red,
    backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),*/
  }))
  const config = {
    type: 'line',
    data: {
      datasets
    },
    options: {
      responsive: true,
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
  chart.update();
}

const valueTypes = ['der2', 'der1', 'raw', 'int1', 'int2'];

const _createOrUpdateChartsForInputRec = (rawInput, timestamp, baseKey='') => {
  if (typeof rawInput === 'number') return 0;
  let depth;
  Object.entries(rawInput).forEach(([kEnd, rawData]) => {
    const key = `${baseKey}_${kEnd}`;
    depth = 1 + _createOrUpdateChartsForInputRec(rawData, timestamp, key);
  });
  if (depth !== 2) {
    return depth;
  }
  valueTypes.forEach((type) => {
    const title = `${baseKey}_${type}`;
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
  const socket = io("http://localhost:8080");
  localStorage.debug = 'socket.io-client:socket';
  socket.on('data', window.handleNewData);
}

_initSocketIO();
