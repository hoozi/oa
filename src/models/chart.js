import { querySizeStats, queryContarctCountStats, queryContarctRent, queryStatsEA, queryStatsWA } from '../services/charts';

const fillEnergy = (type, data) => {
  return type.map((item, index) => {
    let tmp = 0;
    data.forEach(item => {
      if(item.month-1 === index) {
        tmp = item.totalDegree;
        return;
      }
    });
    return tmp
  })
  
}

const areaMap = {
  '11': 'countA',
  '13': 'countB',
  '10': 'countW',
  '12': 'countP',
  '14': 'count2',
  'total': 'countData'
}

export default {
  namespace: 'chart',

  state: {
    sizeData: {rentSize: 0, unRentSize:0, allSize: 0},
    countData: 0,
    rent: 0,
    rentOA: 0,
    rentOB: 0,
    rentWB: 0,
    power: [0,0,0,0,0,0,0,0,0,0,0,0],
    water: [0,0,0,0,0,0,0,0,0,0,0,0],
    countA: 0,
    countB: 0,
    countW: 0,
    countP: 0,
    count2: 0
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(querySizeStats);
      if( typeof response === 'undefined' || response.code !== 1000 ) return;
      yield put({
        type: 'save',
        payload: {
          sizeData: response.data === '' ? 0 : response.data
        },
      });
    },
    *fetchCountData({payload}, { call, put }) {
      const response = yield call(queryContarctCountStats, payload);
      const { areaId } = payload;
      if( typeof response === 'undefined' || response.code !== 1000 ) return;
      yield put({
        type: 'save',
        payload: {
          [areaMap[areaId]]: response.data === '' ? 0 : response.data
        },
      });
    },
    *fetchRent({payload}, {call, put}) {
      const response = yield call(queryContarctRent, payload);
      if( typeof response === 'undefined' || response.code !== 1000 ) return;
      yield put({
        type: 'save',
        payload: {
          [`rent${payload.code}`]: response.data === '' ? 0 : response.data
        },
      });
    },
    *fetchPower({payload}, {call, put, select}) {
      const { power } = yield select(state => state.chart);
      const response = yield call(queryStatsEA, {year: new Date().getFullYear(),...payload});
      if( typeof response === 'undefined' || response.code !== 1000 ) return;
      
      yield put({
        type: 'save',
        payload: {
          power: fillEnergy(power, response.data)
        },
      });
    },
    *fetchWater({payload}, {call, put, select}) {
      const { water } = yield select(state => state.chart);
      const response = yield call(queryStatsWA, {year: new Date().getFullYear(),...payload});
      if( typeof response === 'undefined' || response.code !== 1000 ) return;
      yield put({
        type: 'save',
        payload: {
          water: fillEnergy(water, response.data)
        },
      });
    }
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    }
  }
};
