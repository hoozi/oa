import React, { Component, PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  DatePicker,
  Table,
  Checkbox,
  Button,
  Alert,
  InputNumber,
  Tag,
  Select,
  Form,
  Card
} from 'antd';
import moment from 'moment';
import find from 'lodash/find';

const MonthPicker = DatePicker.MonthPicker;
const Option = Select.Option;

const now = Date.now();
const nowYear = moment(now).year();
const nowMonth = moment(now).month()+1;
const disabledMonth = function(current) {
  return current && current > moment().endOf('day');
}

const BasicEle = areaType => {
  return class extends PureComponent {
    static contextTypes = {
      getFloors: PropTypes.func
    }
    row=[]
    state = {
      searchValues: {
        areaId: '10',
        year: nowYear,
        month: nowMonth,
        searchType: '1214',
        floorId: ''
      }
    }
    componentDidMount() {
      this.getRecordsPage();
      this.context.getFloors(this.state.searchValues.areaId);
    }

    mergeSearchValues(value) {
      const { searchValues } = this.state;
      const mergeValues = {
        ...searchValues,
        ...value
      }
      this.setState({
        searchValues: mergeValues
      },()=> {
        this.getRecordsPage({...mergeValues});
      })
    }
    saveData(payload) {
      this.props.dispatch({
        type: 'energy/enterEle',
        payload,
        areaType,
        callback: () => {
          this.getRecordsPage();
        }
      })
    }
    getRecordsPage(payload) {
      const { searchValues } = this.state;
      const mergeValues = {
        current: 1,
        size: 15,
        ...searchValues,
        ...payload
      }
      this.props.dispatch({
        type: 'energy/fetchEle',
        areaType,
        payload: mergeValues
      }); 
    }

    handleFloorChange = floorId => {
      this.mergeSearchValues({ floorId });
    }
    handleSearchTypeChange = searchType => {
      this.mergeSearchValues({ searchType });
    }
    handleMonthChange = date => {
      const year = date.year();
      const month = date.month()+1;
      this.mergeSearchValues({ year, month });
    }
    handleTableChange = pagination => {
      const { current, pageSize: size } = pagination;
      this.mergeSearchValues({ current, size })
    }
    handleFieldChange = (value, name, index) => {
      this.row[index][name] = name == 'flag' ? (value ? 1 : 0) : value;
      this.row[index]['year'] = this.state.searchValues.year;
      this.row[index]['month'] = this.state.searchValues.month;
    }
    handleSaveData = (e) => {
      e.preventDefault();
      this.saveData(this.row);
    }
    
    renderSearchForm() {
      const { searchValues: { areaId, searchType } } = this.state;
      const { global: { floors }, floorsFetch } = this.props;
      return (
        <Fragment>
            <span style={{marginRight:24}}>
              选择年月&nbsp;&nbsp;
              <MonthPicker disabledDate={disabledMonth}  defaultValue={moment(now)} onChange={this.handleMonthChange} placeholder='请选择'/>
            </span>
            <Fragment>
              {
                (areaType == 'wCustom' || areaType == 'publicA') &&
                <span>
                  选择楼层&nbsp;&nbsp;
                  <Select 
                    placeholder='不限' 
                    style={{width:100}} 
                    onChange={this.handleFloorChange}
                    notFoundContent={ floorsFetch ? <Spin size='small'/> : null }
                  >
                    <Option value=''>不限</Option>
                    {
                      floors.sort((a, b)=>a.floor-b.floor).map(floor=><Option key={floor.id} value={floor.id}>{floor.name}</Option>)
                    }
                  </Select>
                </span>
              }
              {
                areaType == 'wCommon' &&
                <span style={{marginRight:24}}>
                  类型&nbsp;&nbsp;
                  <Select 
                    value={searchType}
                    style={{width:150}} 
                    onChange={this.handleSearchTypeChange}
                  >
                    <Option value='1001'>消防柜</Option>
                    <Option value='1002'>电源灯柜</Option>
                    <Option value='1210'>经营用房</Option>
                    <Option value='1004'>通信</Option>
                  </Select>
                </span>
              }
            </Fragment>
        </Fragment>
      )
    }

    renderTable() {
      const { searchValues: { searchType } } = this.state;
      const { energy: { records, current, total },  loading, submitting } = this.props;
      this.row = records.map(item=>({...item}));
      const paginationProps = {
        pageSize: 15,
        current,
        total,
        showQuickJumper: true
      }
      const getColumns = () => {
        let columns = []
        if(areaType == 'pCustom') {
          columns = [
            {
              title: '名称',
              dataIndex: 'companyName',
              render: (value,row) => value ? value : row.name
            },
            {
              title: '位置',
              dataIndex: 'position',
              render: (value) => value ? value : '-'
            },
            {
              title: '本月度数',
              dataIndex: 'degree',
              width: '10%',
              render: (value, row, index) => <InputNumber key={Date.now()} onChange={value => this.handleFieldChange(value, 'degree', index)} step='10' min={0} autoFocus={index==0} defaultValue={value} style={{width: '100%'}}/>
            },
            {
              title: '上月度数',
              dataIndex: 'lastDegree'
            },
            {
              title: '倍数',
              dataIndex: 'times'
            },
            {
              title: '实用数(吨)',
              dataIndex: 'useDegree'
            },
            {
              title: '本月未抄',
              dataIndex: 'flag',
              render: (value, row, index) => <Checkbox key={Date.now()} tabIndex='-1'  defaultChecked={value} onChange={e => this.handleFieldChange(e.target.checked, 'flag', index)}/>
            },
            {
              title: '备注',
              dataIndex: 'name'
            }
          ]
        } else {
          if(areaType == 'publicA') {
            columns = [
              {
                title: '楼层',
                width: '15%',
                dataIndex: 'floorName',
                render: (value) => value ? value : '-'
              },
              {
                title: '本月度数',
                dataIndex: 'degree',
                width: '10%',
                render: (value, row, index) => <InputNumber key={Date.now()} onChange={value => this.handleFieldChange(value, 'degree', index)} step='10' min={0} autoFocus={index==0} defaultValue={value} style={{width: '100%'}}/>
              },
              {
                title: '上月度数',
                dataIndex: 'lastDegree'
              },
              {
                title: '实用数(吨)',
                dataIndex: 'useDegree'
              },
              {
                title: '本月未抄',
                dataIndex: 'flag',
                render: (value, row, index) => <Checkbox key={Date.now()} tabIndex='-1'  defaultChecked={value} onChange={e => this.handleFieldChange(e.target.checked, 'flag', index)}/>
              }
            ]
          } else if(areaType=='wCommon') {
            if(searchType == '1001' || searchType == '1002' || searchType == '1004') {
              columns = [
                {
                  title: '名称',
                  width: '15%',
                  dataIndex: 'name',
                  render: (value) => value ? value : '-'
                },
                {
                  title: '本月度数',
                  dataIndex: 'degree',
                  width: '10%',
                  render: (value, row, index) => <InputNumber key={Date.now()} onChange={value => this.handleFieldChange(value, 'degree', index)} step='10' min={0} autoFocus={index==0} defaultValue={value} style={{width: '100%'}}/>
                },
                {
                  title: '上月度数',
                  dataIndex: 'lastDegree'
                },
                {
                  title: '倍数',
                  dataIndex: 'times'
                },
                {
                  title: '实用数(吨)',
                  dataIndex: 'useDegree'
                },
                {
                  title: '本月未抄',
                  dataIndex: 'flag',
                  render: (value, row, index) => <Checkbox key={Date.now()} tabIndex='-1'  defaultChecked={value} onChange={e => this.handleFieldChange(e.target.checked, 'flag', index)}/>
                }
              ]
            } else if(searchType == '1210') {
              columns = [
                {
                  title: '名称',
                  dataIndex: 'companyName',
                  render: (value) => value ? value : '-'
                },
                {
                  title: '位置',
                  dataIndex: 'position',
                  render: (value) => value ? value : '-'
                },
                {
                  title: '本月度数',
                  dataIndex: 'degree',
                  width: '10%',
                  render: (value, row, index) => <InputNumber key={Date.now()} onChange={value => this.handleFieldChange(value, 'degree', index)} step='10' min={0} autoFocus={index==0} defaultValue={value} style={{width: '100%'}}/>
                },
                {
                  title: '上月度数',
                  dataIndex: 'lastDegree'
                },
                {
                  title: '倍数',
                  dataIndex: 'times'
                },
                {
                  title: '实用数(吨)',
                  dataIndex: 'useDegree'
                },
                {
                  title: '本月未抄',
                  dataIndex: 'flag',
                  render: (value, row, index) => <Checkbox key={Date.now()} tabIndex='-1'  defaultChecked={value} onChange={e => this.handleFieldChange(e.target.checked, 'flag', index)}/>
                },
                {
                  title: '备注',
                  dataIndex: 'name'
                }
              ]
            } else if(searchType == '1104') {
              columns = [
                {
                  title: '名称',
                  dataIndex: 'name',
                  render: (value) => value ? value : '-'
                },
                {
                  title: '位置',
                  dataIndex: 'position',
                  render: (value) => value ? value : '-'
                },
                {
                  title: '本月度数',
                  dataIndex: 'degree',
                  width: '10%',
                  render: (value, row, index) => <InputNumber key={Date.now()} onChange={value => this.handleFieldChange(value, 'degree', index)} step='10' min={0} autoFocus={index==0} defaultValue={value} style={{width: '100%'}}/>
                },
                {
                  title: '上月度数',
                  dataIndex: 'lastDegree'
                },
                {
                  title: '倍数',
                  dataIndex: 'times'
                },
                {
                  title: '实用数(吨)',
                  dataIndex: 'useDegree'
                },
                {
                  title: '本月未抄',
                  dataIndex: 'flag',
                  render: (value, row, index) => <Checkbox key={Date.now()} tabIndex='-1'  defaultChecked={value} onChange={e => this.handleFieldChange(e.target.checked, 'flag', index)}/>
                },
                {
                  title: '备注',
                  dataIndex: 'name'
                }
              ]
            }
          }
        }
        return columns;

      }
      const getKey = row => {
        const idMap = {
          pCustom: row.nid,
          wCommon: row.nid
        }
        return idMap[areaType];
      }
      return (
        <Form onSubmit={this.handleSaveData}>
          <Table
            size='middle'
            rowKey={getKey}
            bordered
            loading={loading}
            pagination={paginationProps}
            onChange={this.handleTableChange}
            columns={getColumns()}
            dataSource={this.row}
            footer={() => 
              <div style={{textAlign:'center'}}>
                <Button type='primary' htmlType='submit' onClick={this.handleSaveData} loading={submitting}>保存</Button>
              </div>
            }
          />
        </Form>
      )
    }

    render() {
      
  
      return (
        <Fragment>
          <Card
            bordered={false}
            style={{marginBottom: 24}}
          >
            { this.renderSearchForm() }
          </Card>
          <Card
            bordered={false}
          >
            <Alert message='若本月未抄，则本月度数默认为上月度数' closable type="warning" showIcon style={{marginBottom: 24}}/>
            { this.renderTable() }
          </Card>
        </Fragment>
      )
    }
  }
}

export default BasicEle;