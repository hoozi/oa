import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {
  Row,
  Col,
  Icon,
  Card,
  Radio,
  Tooltip,
  Divider,
  Select,
  Dropdown,
  Menu,
  Spin,
  Tag,
  Alert,
  Tabs,
  Popover
} from 'antd';
import numeral from 'numeral';
import {
  ChartCard,
  yuan,
  Pie
} from 'components/Charts';

import {
  Chart,
  Geom,
  Axis,
  Tooltip as Tp
} from "bizcharts";

import styles from './Analysis.less';
import moment from 'moment';

const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;

const Yuan = ({ children }) => (
  <span
    dangerouslySetInnerHTML={{ __html: yuan(children) }} /* eslint-disable-line react/no-danger */
  />
);

let nowYear = moment().format('YYYY');

const years = [];
for(let i=0; i<10; i++) {
  years.push(nowYear--);
}

@connect(({ chart, room, global, loading }) => ({
  global,
  chart,
  room,
  loadingStats: loading.effects['chart/fetch'],
  loadingCount: loading.effects['chart/fetchCountData'],
  loadingRent: loading.effects['chart/fetchRent'],
  loadingPower: loading.effects['chart/fetchPower'],
  loadingWater: loading.effects['chart/fetchWater'],
  floorFetch: loading.effects['global/fetchFloor'],
  loadingRoom: loading.effects['room/fetchRoomInfo']
}))
export default class Analysis extends PureComponent {
  static contextTypes = {
    getFloors: PropTypes.func
  }
  state = {
    areaId: '11',
    floorId: '',
    year: moment().format('YYYY')
  };
  componentDidMount() {
    const { year } = this.state
    this.props.dispatch({
      type: 'chart/fetch'
    });
    this.props.dispatch({
      type: 'chart/fetchCountData',
      payload: {
        areaId: 'total'
      }
    });
    this.getFloorsAndGetStats();
    this.getRent({code: 'OA'});
    this.getRent({code: 'OB'});
    this.getRent({code: 'WB'});
    
    this.getPowerByMonth({year});
    this.getWaterByMonth({year});
    
  }
  getRent(payload) {
    this.props.dispatch({
      type: 'chart/fetchRent',
      payload
    })
  }
  getWaterByMonth(payload) {
    this.props.dispatch({
      type: 'chart/fetchWater',
      payload
    })
  }
  getPowerByMonth(payload) {
    this.props.dispatch({
      type: 'chart/fetchPower',
      payload
    })
  }
  getFloorsAndGetStats() {
    this.context.getFloors(this.state.areaId, floors => {
      const { id } = floors[0];
      this.setState({
        floorId: id
      });
      this.getStatsByFid(id);
    });
  }
  getStatsByFid(floorId) {
    this.props.dispatch({
      type: 'room/fetchRoomInfo',
      payload: { floorId }
    })
  }
  handleAreaChange = areaId => {
    this.setState({ areaId }, () => {
      this.getFloorsAndGetStats();
    });
    this.context.getFloors(areaId);
  }
  handleFloorChange = floorId => {
    this.setState({floorId});
    this.getStatsByFid(floorId);
  }
  handleYearClick = ({key}) => {
    this.setState({
      year: key
    });
    this.getPowerByMonth({year: key});
    this.getWaterByMonth({year: key});
  }
  renderMenu = () => (
    <Menu onClick={this.handleYearClick} selectedKeys={[this.state.year]}>
      { 
        years.map(item => (
          <Menu.Item key={item}>{item}年</Menu.Item>
        ))
      }
    </Menu>
  )
  render() {
    const { year } = this.state
    const { 
      chart: {sizeData, countData, rent, rentOA, rentOB, rentWB, power, water}, 
      global:{floors}, 
      room: {roomInfo}, 
      loadingStats, 
      loadingCount, 
      loadingRoom,
      loadingWater,
      loadingPower,
      loadingRent,
      floorFetch
    } = this.props;
    const rentData = [
      {
        x: 'A幢租金',
        y: rentOA
      },
      {
        x: 'B幢租金',
        y: rentOB
      },
      {
        x: '仓库租金',
        y: rentWB
      }
    ];
    const rentSize = [
      {
        x: '已租面积',
        y: sizeData.rentSize
      },
      {
        x: '未租面积',
        y: sizeData.unRentSize
      }
    ]
    const topColResponsiveProps = {
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 8,
      style: { marginBottom: 24 },
    };
    const gridColResponsiveProps = {
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 6,
      style: { marginBottom: 8 },
    };
    const powerData = power.map((item, index) => {
      return {
        x: `${index+1}月`,
        y: item
      }
    });
    const powerSorted = powerData.map(item => ({...item})).sort((a,b)=>(b.y-a.y));
    const waterData = water.map((item, index) => {
      return {
        x: `${index+1}月`,
        y: item
      }
    });
    const waterSorted = waterData.map(item => ({...item})).sort((a,b)=>(b.y-a.y));
    const gridStyle = grid => {
      return {
        width: '100%',
        position: 'relative',
        borderRadius: 4,
        borderSize: 'content',
        padding: 8,
        height: 100,
        overflow: 'hiddle',
        backgroundColor: grid.isRented ? (grid.isOut >0 ? '#faad14' : '#65b157') : '#c2c5d4',
        color: '#fff'
      }
    }
    const extraContent = (
      <div className={styles.extraContent}>
        <RadioGroup value={this.state.areaId} onChange={e => this.handleAreaChange(e.target.value)} >
          <RadioButton value="11">写字楼A</RadioButton>
          <RadioButton value="13">写字楼B</RadioButton>
          <RadioButton value="10">仓库</RadioButton>
        </RadioGroup>
        
        <Select 
          value={this.state.floorId}
          className={styles.extraContentSearch}
          notFoundContent={floorFetch?<Spin size='small'/>:null}
          onChange={this.handleFloorChange}
        >
          {
            floors.map(f=><Option key={f.id} value={f.id}>{f.name}</Option>)
          }
        </Select>
        
      </div>
    );
    const cols = {
      x: {
        min: 0
      },
      y: {
        range: [0, 1]
      }
    };
    return (
      <Fragment>
        <Alert showIcon type='info' 
          message={
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <b>水电用量可以查询近十年的统计数据</b>
              <Dropdown overlay={this.renderMenu()}>
                <a>{year}年<Icon type="down" /></a>
              </Dropdown>
            </div>
          } 
        style={{marginBottom: 24}}/>
        <Row gutter={24}>
          <Col {...topColResponsiveProps}>
            <ChartCard
              bordered={false}
              loading={loadingStats}
              title={`${year}年总用电量(kWh)`}
              action={
                <Tooltip title="总的用电量">
                  <Icon type="info-circle-o" />
                </Tooltip>
              }
              total={ 
                () => <span style={{color:''}}>{numeral(power.reduce((sum, cur)=>(sum+cur),0)).format('0,0')}</span>
              }
            >
            </ChartCard>
          </Col>
          <Col {...topColResponsiveProps}>
            <ChartCard
              bordered={false}
              loading={loadingStats}
              title={`${year}年总用水量(吨)`}
              action={
                <Tooltip title="总的用水量">
                  <Icon type="info-circle-o" />
                </Tooltip>
              }
              total={
                () => <span style={{color:''}}>{numeral(water.reduce((sum, cur)=>(sum+cur),0)).format('0,0')}</span>
              }
            >
            </ChartCard>
          </Col>
          <Col {...topColResponsiveProps}>
            <ChartCard
              bordered={false}
              loading={loadingCount}
              title="合同数量(份)"
              action={
                <Tooltip title="签订的有效合同数">
                  <Icon type="info-circle-o" />
                </Tooltip>
              }
              total={
                () => <span style={{color:''}}>{countData}</span>
              }
            >
            </ChartCard>
          </Col>
        </Row>
        <Row gutter={24} style={{marginBottom: 24}}>
          <Col xl={12} lg={24} md={24} sm={24} xs={24}>
            <Card
              loading={loadingStats}
              bordered={false}
              title="租用面积(m²)"
            >
              <Pie
                hasLegend
                subTitle="总面积"
                total={() => rentSize.reduce((pre, now) => now.y + pre, 0)}
                data={rentSize}
                valueFormat={value => value}
                height={248}
                lineWidth={4}
              />
            </Card>
          </Col>
          <Col xl={12} lg={24} md={24} sm={24} xs={24}>
            <Card
              loading={loadingRent}
              className={styles.salesCard}
              bordered={false}
              title="租金(元)"
              bodyStyle={{ padding: 24 }}
            >
              <Pie
                hasLegend
                subTitle="总租金"
                total={() => <Yuan>{rentData.reduce((pre, now) => now.y + pre, 0)}</Yuan>}
                data={rentData}
                valueFormat={value => <Yuan>{value}</Yuan>}
                height={248}
                lineWidth={4}
              />
            </Card>
          </Col>
        </Row>
        <Card
          loading={loadingPower && loadingWater}
          bordered={false}
          bodyStyle={{padding: 0}}
          style={{ marginTop: 24, marginBottom: 24 }}
        >
          <div className={styles.salesCard}>
            <Tabs size="large" tabBarStyle={{ marginBottom: 24 }}>
              <TabPane tab={`${year}年用电量(kWh)`} key="power">
                <Row>
                  <Col xl={16} lg={12} md={12} sm={24} xs={24}>
                    <div className={styles.salesBar}>
                      <Chart height={395} data={powerData} scale={cols} forceFit>
                        <Axis name="x" />
                        <Axis name="y" />
                        <Tp
                          crosshairs={{
                            type: "y"
                          }}
                          itemTpl='<li data-index={index}><span style="background-color:{color};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>用电量: {value}</li>'
                        />
                        <Geom type="line" position="x*y" size={2} />
                        <Geom
                          type="point"
                          position="x*y"
                          size={4}
                          shape={"circle"}
                          style={{
                            stroke: "#fff",
                            lineWidth: 1
                          }}
                        />
                      </Chart>
                    </div>
                  </Col>
                  <Col xl={8} lg={12} md={12} sm={24} xs={24}>
                    <div className={styles.salesRank}>
                      <h4 className={styles.rankingTitle}>月度用电量排名</h4>
                      <ul className={styles.rankingList}>
                        {powerSorted.map((item, i) => (
                          <li key={i}>
                            <span className={i < 3 ? styles.active : ''}>{i + 1}</span>
                            <span>{item.x}</span>
                            <span>{`${item.y} kWh`}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tab={`${year}年用水量(吨)`} key="water">
                <Row>
                  <Col xl={16} lg={12} md={12} sm={24} xs={24}>
                    <div className={styles.salesBar}>
                    <Chart height={395} data={waterData} scale={cols} forceFit>
                        <Axis name="x" />
                        <Axis name="y" />
                        <Tp
                          crosshairs={{
                            type: "y"
                          }}
                          itemTpl='<li data-index={index}><span style="background-color:{color};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>用水量: {value}</li>'
                        />
                        <Geom type="line" position="x*y" size={2} />
                        <Geom
                          type="point"
                          position="x*y"
                          size={4}
                          shape={"circle"}
                          style={{
                            stroke: "#fff",
                            lineWidth: 1
                          }}
                        />
                      </Chart>
                    </div>
                  </Col>
                  <Col xl={8} lg={12} md={12} sm={24} xs={24}>
                    <div className={styles.salesRank}>
                      <h4 className={styles.rankingTitle}>月度用水量排名</h4>
                      <ul className={styles.rankingList}>
                        {waterSorted.map((item, i) => (
                          <li key={i}>
                            <span className={i < 3 ? styles.active : ''}>{i + 1}</span>
                            <span>{item.x}</span>
                            <span>{`${item.y} 吨`}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </div>     
        </Card>
        <div className={styles.standardList}>
          <Card
            className={styles.listCard}
            bordered={false}
            title={
              <div style={{lineHeight: '22px'}}>
                <b style={{marginRight: 16, display:'inline-block'}}>租用详情</b>
                <Tag color="#65b157">已出租</Tag>
                <Tag color="#faad14">即将到期</Tag>
                <Tag color="#c2c5d4">未出租</Tag> 
              </div>
            }
            bodyStyle={{ padding: '0 32px 40px 32px' }}
            extra={extraContent}
            loading={loadingRoom}
          >
            <Row gutter={8}>
              {
                roomInfo.map(item => {
                  return (
                    <Col {...gridColResponsiveProps} key={item.id}>
                      <div style={{...gridStyle(item)}}>
                        {
                          item.isRented ?
                          <div style={{position: 'absolute', right: 8, top: 8}}>
                          <Popover placement="topLeft" title='其他信息' arrowPointAtCenter content={
                            <Fragment>
                              <div style={{marginBottom:4}}><Icon type="user" /> {item.renter}</div>
                              <div style={{marginBottom:4}}><Icon type="phone" /> {item.tel}</div>
                              <div><Icon type="calendar" /> {moment(item.startTime).format('YYYY-MM-DD')} <span style={{color: '#999'}}>~</span> {moment(item.endTime).format('YYYY-MM-DD')}</div>
                            </Fragment>
                          } trigger="hover">
                            <Icon type="info-circle" />
                          </Popover>
                          </div> : ''
                        }
                        <ul style={{listStyle:'none',margin:0,padding:0}}>
                          <li>{item.roomName}<Divider type='vertical'/>{item.size}m²</li>
                          {
                            item.isRented ? 
                            <Fragment>
                              <li>{item.companyName}</li>
                              <li>¥{item.rent}元</li>
                            </Fragment> : <li>未出租</li>
                          }
                        </ul>
                      </div>
                    </Col>
                  )
                })
              }
            </Row>
          </Card>
        </div>
      </Fragment>
    );
  }
}
