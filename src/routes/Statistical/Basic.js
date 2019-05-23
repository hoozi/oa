import React, { Component, PureComponent, Fragment } from 'react';
//import PropTypes from 'prop-types';
import {
  DatePicker,
  Table,
  Alert,
  Select,
  Card,
  Row,
  Col
} from 'antd';
import moment from 'moment';
/* import TweenOne from 'rc-tween-one';
import Children from 'rc-tween-one/lib/plugin/ChildrenPlugin'; */

import styles from './index.less';

//TweenOne.plugins.push(Children);
const MonthPicker = DatePicker.MonthPicker;
const Option = Select.Option;

const now = Date.now();
const year = moment(now).year();
const month = moment(now).month()+1;
const disabledMonth = function(current) {
  return current && current > moment().endOf('day');
}

export default areaType => {
  const gridMap = areaType == 'office' ?
  [
    {
      title: 'A幢总用水',
      stats: 'A'
    },
    {
      title: 'A幢客户总用电',
      stats: 'AC'
    },
    {
      title: 'A、B幢总用电',
      stats: 'AB'
    }
  ] : 
  [
    {
      title: '总用水',
      stats: 'WW'
    },
    {
      title: '总用电',
      stats: 'WE'
    }
  ]
  return class extends PureComponent {
    state = {
      year,
      month,
      aTotal: 0,
      acTotal: 0,
      abTotal: 0,
      wwTotal: 0,
      weTotal: 0
    }
    componentWillMount() {
      const { year, month } = this.state
      gridMap.map(grid => {
        const { stats } = grid;
        this.getStatistical({ year, month, stats });
        return { ...grid }
      })
    }
    getStatistical(payload) {
      const { stats, year, month } = payload;
      this.props.dispatch({
        type: 'statistical/fetch',
        stats,
        payload : { year, month },
        callback: (data) => {
          this.setState({
            [`${stats.toLowerCase()}Total`]: data.reduce((total, current)=>{
              return total+current.degree
            },0)
          })
        }
      })
    }
    handleMonthChange = (date, stats) => {
      const year = date.year();
      const month = date.month()+1;
      this.getStatistical({ year, month, stats })
    }
    render() {
      const { statistical: {A, AC, AB, WW, WE}, loading } = this.props;
      const { aTotal, abTotal, acTotal, weTotal, wwTotal, month } = this.state;
      const colResponsiveProps = {
        xs: 24,
        sm: 12,
        md: 12,
        lg: 12,
        xl: areaType == 'warehouse' ? 12 : 8,
        style: { marginBottom: 24 }
      };
      const columns = [
        {
          title: '名称',
          
          dataIndex: 'position'
        },
        {
          title: '度数',
         
          dataIndex: 'degree'
        }
      ]
      const dataMap = {
        A,
        AC,
        AB,
        WW,
        WE
      }
      const totalMap = {
        A: aTotal,
        AC: acTotal,
        AB: abTotal,
        WW: wwTotal,
        WE: weTotal
      }
      const Info = ({ title, value, bordered }) => (
        <div className={styles.headerInfo}>
          <span>{title}</span>
          <p>{value}</p>
          {bordered && <em />}
        </div>
      );
      const monthCover = [
        '一月',
        '二月',
        '三月',
        '四月',
        '五月',
        '六月',
        '七月',
        '八月',
        '九月',
        '十月',
        '十一月',
        '十二月',
      ]
      return (
        <Fragment>
          <Card bordered={false} style={{marginBottom: 24}}>
            <Row>
              {
                gridMap.map((grid, index) => {
                  const { title, stats } = grid;
                  return (
                    <Col key={`${stats}-totalCard`} sm={areaType == 'warehouse' ? 12 : 8} xs={24}>
                      <Info
                        title={title} 
                        value={
                        <span style={{color: '#008dff'}}>
                          {/* <TweenOne
                            style={{display:'inline-block',marginRight: 4}}
                            animation={
                              {
                                Children: { value: totalMap[stats],floatLength:0}, 
                                duration: 1000,
                              }
                            }
                          > */}
                            {totalMap[stats]}
                         {/*  </TweenOne> */}
                          <em style={{fontSize:16,color:'#333', marginLeft:4,fontStyle:'normal'}}>度</em>
                        </span>
                        } 
                        bordered={index!=gridMap.length-1} 
                      />
                    </Col>
                  )
                })
              }
            </Row>
          </Card>
          
          <Row gutter={24}>
            {
              gridMap.map(grid => {
                const { stats, title } = grid
                return (
                  <Col key={stats} {...colResponsiveProps}>
                    <Card
                      bordered={false}
                      title={
                        <div style={{paddingTop:6}}>{title}</div>
                      }
                      extra={
                        <MonthPicker 
                          disabledDate={disabledMonth} 
                          format='YYYY年M月'
                          onChange={date=>this.handleMonthChange(date, stats)} 
                          defaultValue={moment(now)} 
                        />
                      }
                    >
                      <Table
                        size='small'
                        loading={loading}
                        columns={columns}
                        pagination={false}
                        rowKey={(row,index)=>`${stats}-${index}`}
                        dataSource={dataMap[stats]}
                        //scroll={{y:400}}
                      />
                    </Card>
                  </Col>
                )
              })
            }
          </Row>
        </Fragment>
      )
    }
  }
}
