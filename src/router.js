import React from 'react';
import { routerRedux, Route, Switch } from 'dva/router';
import { LocaleProvider, Spin } from 'antd';
import dynamic from 'dva/dynamic';
import { getRouterData } from './common/router';
import Authorized from './utils/Authorized';
import { getAuthority } from './utils/authority';
import styles from './index.less';
import zhCN from 'antd/lib/locale-provider/zh_CN';


const { ConnectedRouter } = routerRedux;
const { AuthorizedRoute } = Authorized;
dynamic.setDefaultLoadingComponent(() => {
  return <Spin size="large" className={styles.globalSpin} />;
});

function RouterConfig({ history, app }) {
  const routerData = getRouterData(app);
  const UserLayout = routerData['/user'].component;
  const BasicLayout = routerData['/'].component;
  return (
    
      <ConnectedRouter history={history}>
      <LocaleProvider locale={zhCN}>
        <Switch>
          <Route path="/user" component={UserLayout} />
          <AuthorizedRoute
            path="/"
            render={props => <BasicLayout {...props} />}
            authority={() => !!getAuthority()}
            redirectPath="/user/login"
          />
        </Switch>
        </LocaleProvider>
      </ConnectedRouter>
   
  );
}

export default RouterConfig;
