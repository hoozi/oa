import React, { Component } from 'react';
import {
  routerRedux,
  Route,
  Redirect,
  Switch
} from 'dva/router';
import { connect } from 'dva';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { getRoutes } from '../../utils/utils';
import styles from './index.less';
import each from 'lodash/each';
import {
  Card,
  Row,
  Col
} from 'antd';

const areaMap = {
  'officeBuildingA': 11,
  'officeBuildingB': 13,
  'warehouse': 10,
  'supporting': 12,
  'phase2': 14,
}

@connect(({chart, loading}) => ({
  chart,
  fetchCounting: loading.effects['chart/fetchCountData']
}))
export default class Contract extends Component {
    handleTabChange = key => {
        const { dispatch, match } = this.props;
        dispatch(routerRedux.push(`${match.url}/${key}?areaId=${areaMap[key]}`))
    }
    componentDidMount() {
      each(areaMap, areaId => {
        this.props.dispatch({
          type: 'chart/fetchCountData',
          payload:{
            areaId
          }
        })
      });
    }
    render() {
      
        const tabList = [
          {
            key: 'officeBuildingA',
            tab: '写字楼A'
          },
          {
            key: 'officeBuildingB',
            tab: '写字楼B'
          },
          {
            key: 'warehouse',
            tab: '仓库'
          },
          {
            key: 'supporting',
            tab: '配套用房'
          },
          {
            key: 'phase2',
            tab: '二期'
          }
        ];
    
        const { match, routerData, location, chart:{countA, countB, countW, countP, count2}, fetchCounting } = this.props;
        const routes = getRoutes(match.path, routerData);
        const Info = ({ title, value, bordered }) => (
          <div className={styles.headerInfo}>
            <span>{title}</span>
            <p><i>共</i><span>{value}</span><i>份合同</i></p>
            {bordered && <em />}
          </div>
        );
        return (
          
          <PageHeaderLayout
            tabList={tabList}
            content={
              <Card bordered={false} loading={fetchCounting}>
                <Row>
                  <Col sm={5} xs={24}>
                    <Info title="写字楼A" value={`${countA}`} bordered />
                  </Col>
                  <Col sm={5} xs={24}>
                    <Info title="写字楼B" value={`${countB}`} bordered />
                  </Col>
                  <Col sm={5} xs={24}>
                    <Info title="仓库" value={`${countW}`} bordered />
                  </Col>
                  <Col sm={4} xs={24}>
                    <Info title="配套用房" value={`${countP}`} bordered />
                  </Col>
                  <Col sm={5} xs={24}>
                    <Info title="二期" value={`${count2}`} />
                  </Col>
                </Row>
              </Card>
            }
            tabActiveKey={location.pathname.replace(`${match.path}/`, '')}
            onTabChange={this.handleTabChange}
          >
            <Switch>
              <Redirect key={match.path} exact from={match.path} to={`${routes[0].path}?areaId=11`} />
              {routes.map(item => (
                <Route key={item.key} path={item.path} component={item.component} exact={item.exact} />
              ))}
            </Switch>
          </PageHeaderLayout>
        );
      }
}
