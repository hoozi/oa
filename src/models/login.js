import { routerRedux } from 'dva/router';
import {
  message
} from 'antd';
import { accountLogin } from '../services/api';
import { setAuthority } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';
import map from 'lodash/map';
import flatten from 'lodash/flatten';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(accountLogin, payload);
      if(typeof response === 'undefined' || response.code!==1000) {
        message.error('登录失败,请稍候重试');
        return;
      };
      const mId = map(flatten(map(response.data.roleList,'menuList')),'menuId')
      yield put({
        type: 'changeLoginStatus',
        payload: {
          ...response,
          currentAuthority: mId
        },
      });
      // Login successfully
      if (response.code === 1000) {
        reloadAuthorized();
        yield put(routerRedux.push('/'));
      }
    },
    *logout(_, { put, select }) {
      if(window.location.href.indexOf('login') >= 0) return;
      try {
        // get location pathname
        const urlParams = new URL(window.location.href);
        const pathname = yield select(state => {
          return state.routing.location.pathname + (state.routing.location.search ? state.routing.location.search : '')
        });
        // add the parameters in the url
        urlParams.searchParams.set('redirect', pathname);
        window.history.replaceState(null, 'login', urlParams.href);
      } finally {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            status: false,
            currentAuthority: [],
          },
        });
        reloadAuthorized();
        yield put(routerRedux.push('/user/login'));
      }
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.currentAuthority);
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
  },
};
