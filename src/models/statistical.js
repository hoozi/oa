import { 
  queryStatsA,
  queryStatsAC,
  queryStatsAB,
  queryStatsWE,
  queryStatsWW
}  from '../services/statistical';


const queryMap = {
  A: {
    query: queryStatsA,
    type: 'saveA'
  },
  AC: {
    query: queryStatsAC,
    type: 'saveAC'
  },
  AB: {
    query: queryStatsAB,
    type: 'saveAB'
  },
  WE: {
    query: queryStatsWE,
    type: 'saveWE'
  },
  WW: {
    query: queryStatsWW,
    type: 'saveWW'
  }
}

export default {
  namespace: 'statistical',
  state: {
    A: [],
    AC: [],
    AB: [],
    WW: [],
    WE: []
  },
  effects: {
    *fetch({ payload, stats, callback }, { call, put, select }) {
      const query = queryMap[stats];
			const { current, size } = yield select(state => state.energy);
			const response = yield call(query['query'], { current, size, ...payload });
      if( typeof response === 'undefined' || response.code !== 1000 ) return;
      callback && callback(response.data)
			yield put({
				type: query['type'],
				payload: response.data
			});
		}
	},
  reducers: {
		saveA(state, { payload }) {
				return {
						...state,
						A: payload
				}
    },
    saveAC(state, { payload }) {
      return {
          ...state,
          AC: payload
      }
    },
    saveAB(state, { payload }) {
      return {
          ...state,
          AB: payload
      }
    },
    saveWW(state, { payload }) {
      return {
          ...state,
          WW: payload
      }
    },
    saveWE(state, { payload }) {
      return {
          ...state,
          WE: payload
      }
    }
	}
}