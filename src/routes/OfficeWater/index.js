import React, { Component, PureComponent, Fragment } from 'react';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { getRoutes } from '../../utils/utils';
import { connect } from 'dva';
import {
  routerRedux,
  Route,
  Redirect,
  Switch
} from 'dva/router';

@connect()
export default class EnergyWater extends PureComponent {
  handleTabChange = key => {
    const { dispatch, match } = this.props;
    dispatch(routerRedux.push(`${match.url}/${key}`))
  };  
  render() {
    const { match, routerData, location } = this.props;
    const routes = getRoutes(match.path, routerData);

    const tabList = [
      {
        key: 'officeA',
        tab: '写字楼A-水(3、11-24)'
      },
      {
        key: 'office-public',
        tab: '写字楼-公共用水'
      },
      {
        key: 'business',
        tab: '经营用房'
      }
    ];

    return (
      <PageHeaderLayout
        tabList={tabList}
        tabActiveKey={location.pathname.replace(`${match.path}/`, '')}
        onTabChange={this.handleTabChange}
      >
        <Switch>
          <Redirect key={match.path} exact from={match.path} to={`${routes[0].path}`} />
          {routes.map(item => (
            <Route key={item.key} path={item.path} component={item.component} exact={item.exact} />
          ))}
        </Switch>
      </PageHeaderLayout>
    )
  }
}