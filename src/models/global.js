import { queryNotices } from '../services/api';
import { queryFloor, queryFloorById } from '../services/floor';
import { queryRoom } from '../services/room';
import { queryArea } from '../services/area';

export default {
  namespace: 'global',

  state: {
    collapsed: false,
    floors: [],
    floor: {},
    rooms: [],
    areas: [],
    notices: [],
  },

  effects: {
    *fetchFloor({ payload, callback }, { call, put }) {
      const response = yield call(queryFloor, payload);
      if(typeof response === 'undefined' || response.code !== 1000) return;
      callback && callback(response.data);
      yield put({
        type: 'saveBase',
        payload: {
          floors: response.data
        }
      })
    },
    *fetchFloorById( { payload }, { call, put } ) {
      const response = yield call(queryFloorById, payload);
      if(typeof response === 'undefined' || response.code !== 1000) return;
      yield put({
        type: 'saveBase',
        payload: {
          floor: response.data
        }
      })
    },
    *fetchRoom({ payload }, { call, put }) {
      const response = yield call(queryRoom, payload);
      if(typeof response === 'undefined' || response.code !== 1000) return;
      yield put({
        type: 'saveBase',
        payload: {
          rooms: response.data
        }
      })
    },
    *fetchArea({ payload }, { call, put }) {
      const response = yield call(queryArea, payload);
      if(typeof response === 'undefined' || response.code !== 1000) return;
      yield put({
        type: 'saveBase',
        payload: {
          areas: response.data.records
        }
      })
    },
    *fetchNotices(_, { call, put }) {
      const data = yield call(queryNotices);
      yield put({
        type: 'saveNotices',
        payload: data,
      });
      yield put({
        type: 'user/changeNotifyCount',
        payload: data.length,
      });
    },
    *clearNotices({ payload }, { put, select }) {
      yield put({
        type: 'saveClearedNotices',
        payload,
      });
      const count = yield select(state => state.global.notices.length);
      yield put({
        type: 'user/changeNotifyCount',
        payload: count,
      });
    },
  },

  reducers: {
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    saveNotices(state, { payload }) {
      return {
        ...state,
        notices: payload,
      };
    },
    saveClearedNotices(state, { payload }) {
      return {
        ...state,
        notices: state.notices.filter(item => item.type !== payload),
      };
    },
    saveBase( state, { payload } ) {
      return {
        ...state,
        ...payload
      }
    }
  },

  subscriptions: {
    setup({ history }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      return history.listen(({ pathname, search }) => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
  },
};
