import React, { Component, Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { stringify } from 'qs';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  InputNumber,
  DatePicker,
  Radio,
  message,
  Modal,
  Badge,
  Tag,
  Drawer,
  Table,
  AutoComplete,
  Button,
  Alert
} from 'antd';
import { parse } from 'qs';
import { queryFloor } from '../../services/floor';
import ContractBaseForm from './ContractBaseForm';
import { fixedZero } from '../../utils/utils';
import StandardTable from '../../components/StandardTable';
import styles from './index.less';
import cardStyles from '../../routes/List/BasicList.less';
import flatten from 'lodash/flatten';
import map from 'lodash/map';
import find from 'lodash/find';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');


const MonthPicker = DatePicker.MonthPicker;
const Option = Select.Option;
const AutoOption = AutoComplete.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const RangePicker = DatePicker.RangePicker;
const FormItem = Form.Item;
const setTableTotalWidth = (columns) => {
  return columns.reduce((total, item) => {
    const { width=0 } = item;
    return total + width;
  }, 0);
}

const disabledMonth = function(current) {
  return current && current > moment().subtract(1, 'months').endOf('day');
}

const pStyle = {
  fontSize: 16,
  color: 'rgba(0,0,0,0.85)',
  lineHeight: '24px',
  display: 'block',
  marginBottom: 16,
};

const DescriptionItem = ({ title, content }) => (
  <div
    style={{
      fontSize: 14,
      lineHeight: '22px',
      marginBottom: 7,
      color: 'rgba(0,0,0,0.65)',
    }}
  >
    <p
      style={{
        marginRight: 8,
        display: 'inline-block',
        color: 'rgba(0,0,0,0.85)',
      }}
    >
      {title}:
    </p>
    {content}
  </div>
);

const setMonthRange = (m) => {
  const now = new Date();
  const next = moment(now).add(m, 'month');
  return [
    moment(now),
    next
  ];
}

const genMonthRange = (len) => {
  let dateArr = [];
  for(let i=0; i<len; i++) {
    dateArr.push(setMonthRange(i+1));
  }
  return dateArr;
}

const ContractBase = (areaId, defaultProps={}) => WrappedComponent => {
  const { columns } = defaultProps;
  const tableTotalWidth = setTableTotalWidth(columns({}))
  @Form.create()
  class Base extends PureComponent {
    static contextTypes = {
      getFloors: PropTypes.func,
      getFloorById: PropTypes.func,
      getRooms: PropTypes.func
    };
    state = {
      expand: false,
      modalVisible: false,
      searchFormValues: {},
      areaId: '',
      selectedRows: [],
      updateValues: {},
      targetKeys: [],
      row: null,
      updateType: '',
      year: moment().subtract(1, 'months').format('YYYY'),
      month: moment().subtract(1, 'months').format('M'),
      currentData: null
    }
    rows = {
      power: [],
      water: []
    }
    componentWillMount() {
      const { location: { search='' } } = this.props;
      const areaId = search ? parse(search.substring(1))['areaId'] : '';
      this.context.getFloors(areaId);
      //this.context.getRooms({ areaId });
      this.setState({ areaId });
    }
    componentDidMount() {
      const areaId = this.state.areaId;
      this.fetchContract();
    }
    fetchContract(payload = {}) {
      const { dispatch } = this.props;
      dispatch({
        type: 'contract/fetch',
        payload: {
          areaId: this.state.areaId,
          current: 1,
          ...payload
        }
      })
    }
    handleChangeUpdateType = (updateType, values) => {
      this.setState({ updateType });
      this.handleModalVisible(true, values)
    }
    handleUnThrow = (id) => {
      this.props.dispatch({
        type: 'contract/unThrow',
        payload: {
          id
        },
        callback: () => {
          this.fetchContract(this.state.searchFormValues);
        }
      });
    }
    handleContractSubmit = (values) => {
      const { areaId } = this.state
      const { row } = this.state;
      const { rooms } = this.props.global;
      const ins = this;
      const roomsData = row && ('roomList' in row) ? this.props.global.rooms.concat(row.roomList) : this.props.global.rooms;
      const _rooms = (typeof values.roomsId == 'string') || !values.roomsId || values.roomsId.length == 0 ? [] : values.roomsId.map(rid => {
        return roomsData.filter(room => room.id==rid)
      });
      const roomsSize = map(flatten(_rooms), 'size').reduce((total, item) => {return total+item},0) || values.roomsSize;
      const mergeValues = {
        ...this.state.updateValues,
        ...values,
        [this.state.updateValues.id ? 'id' : '']: this.state.updateValues.id,
        [this.state.updateType == 'rented' ? 'id' : ''] : this.state.updateValues.id,
        [this.state.updateType == 'rented' ? 'isRelet' : ''] : 1,
        roomsSize,
        fmin: values['roomsId'] ? find(roomsData, {id: +values['roomsId'][0]})['floorId'] : '',
        rmin: values['roomsId'] ? values['roomsId'][0] : '',
        areaId: this.state.areaId,
        roomsId: values.roomsId ? (typeof values.roomsId == 'string' ? values['roomsId'] : values['roomsId'].join(',')) : '',
        startTime: values['_'][0].format('YYYY-MM-DD'),
        endTime: values['_'][1].format('YYYY-MM-DD')
      }

      delete mergeValues['_'];
      
      this.props.dispatch({
        type: 'contract/edit',
        oper: this.state.updateValues.id ? 'edit' : 'add',
        payload: mergeValues,
        callback: () => {
          this.handleModalVisible()
        }
      });
      
    }
    handleModalVisible = (flag, values) => {
      const { areaId } = this.state;
      this.context.getRooms({ areaId });
      this.state.modalVisible = !!flag;
      this.state.updateValues = values ? values : {};
      
      this.state.targetKeys = values ? values.roomsId.split(',') : [];
      if(values) {
        this.props.dispatch({
          type: 'contract/fetchById',
          payload: values.id,
          callback: (row) => {
            this.setState({row})
          }
        })
      }
      
      this.forceUpdate();
    }
    handleContractThrow = ids => {
      const idsQs = ids ? `ids=${ids}` : this.state.selectedRows.map(row => {
        return `ids=${row.id}`;
      }).join('&');
      this.props.dispatch({
        type: 'contract/edit',
        oper: 'throw',
        payload: idsQs,
        callback: () => {
          this.context.getRooms({ areaId: this.state.areaId });
        }
      });
      this.setState({
        selectedRows: []
      });
    }
    handleExpandToggle = () => {
      this.setState(prevState => {
        return {
          ...prevState,
          expand: !prevState.expand
        }
      })
    }
    handleSearchSubmit = (e) => {
      e.preventDefault(); //阻止默认提交
      const { form, dispatch } = this.props;
      const { searchFormValues } = this.state;
      let startTime = '';
      let endTime = '';
      form.validateFields((err, fieldsValue) => {
        if(err) return;
        const { rangeDate } = fieldsValue;
        if(rangeDate) {
          startTime = rangeDate[0].format('YYYY-MM-DD');
          endTime = rangeDate[1].format('YYYY-MM-DD');
        }
        fieldsValue['rangeDate'] = '';
        this.setState({
          searchFormValues: {
            ...searchFormValues,
            ...fieldsValue,
            startTime,
            endTime
          }
        }, ()=>{
          this.fetchContract(this.state.searchFormValues)
        });
        
      })
    }
    getRoomByContract(name,id) {
      this.props.dispatch({
        type: 'contract/fetchRoomByContract',
        name,
        payload: {
          contractId: id
        },
        callback: (name, data) => {
          this.rows[name] = [...data];
        }
      })
    }
    handleOpenDrawer = (flag, currentData) => {
      this.handleDrawerShow(true);
      this.getRoomByContract('power', currentData.id);
      this.getRoomByContract('water', currentData.id);
      this.setState({
        currentData
      })
    }
    handleDrawerShow = flag => {
      this.setState({
        drawerVisible: !!flag
      })
    }
    handleResetSearch = () => {
      const { form } = this.props;
      form.resetFields();
      this.setState({
        searchFormValues: {}
      });
      this.fetchContract();
    }
    handleChangeFloor = (value) => {
      const { form } = this.props;
      form.resetFields(['roomsId']);
      this.context.getFloorById(value);
    }
    handleRadioChange = (e) => {
      const { value } = e.target;
      const { searchFormValues } = this.state
      const startEnd = value.split('~');
      this.setState({
        searchFormValues: {
          ...searchFormValues,
          validStartTime: startEnd[0],
          validEndTime: startEnd[1]
        }
      }, () => {
        this.fetchContract(this.state.searchFormValues)
      });
    }
    handleChangeTable = (pagination, filters, sorter) => {
      const { current, pageSize } = pagination;
      const { order, field } = sorter;
      const sortDirMap = {
        ascend: 1,
        descend: -1
      }
      const fieldMap = {
        code: 'sortCode',
        archiveNo: 'sortNo',
        roomsName: 'sortRoomName',
        endTime: 'sortEndTime',
        startTime: 'sortStartTime'
      }
      //console.log(sortDirMap[order], fieldMap[field])
      const sortValues = field ? {
        sort: sortDirMap[order], 
        [fieldMap[field]]:'1'
      } : {}
      this.setState({
        searchFormValues: {
          ...this.state.searchFormValues,
          ...sortValues
        }
      }, () => {
        if(!field) {
          delete this.state.searchFormValues['sortCode'];
          delete this.state.searchFormValues['sortNo'];
          delete this.state.searchFormValues['sortRoomName'];
          delete this.state.searchFormValues['sortEndTime'];
          delete this.state.searchFormValues['sortStartTime'];
          delete this.state.searchFormValues['undefined'];
          delete this.state.searchFormValues['sort'];
        }
        this.fetchContract({...this.state.searchFormValues, current, size: pageSize});
      });
    }
    handleSelectRows = (rows) => {
      this.setState({
        selectedRows: rows
      });
    }
    renderSimpleSearchForm() {
      const { getFieldDecorator } = this.props.form;   
      return (
        <Form onSubmit={this.handleSearchSubmit}>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={8} sm={24}>
              <FormItem label='合同编号'>
                {getFieldDecorator('code')(<Input placeholder="请输入合同编号" />)}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="承租单位">
                {getFieldDecorator('companyName')(<Input placeholder="请输入承租单位名称,支持模糊查询" />)}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <span className={styles.submitButtons}>
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleResetSearch}>
                  重置
                </Button>
                <a style={{ marginLeft: 8 }} onClick={this.handleExpandToggle}>
                  展开 <Icon type="down" />
                </a>
              </span>
            </Col>
          </Row>
        </Form>
      );
    }
    renderAdvancedSearchForm() {
      const { floors, floor, rooms } = this.props.global;
      const { getFieldDecorator } = this.props.form;
      const areaId = this.state.areaId;
      return (
        <Form onSubmit={this.handleSearchSubmit}>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={8} sm={24}>
              <FormItem label="合同编号">
                {getFieldDecorator('code')(<Input placeholder="请输入合同编号" />)}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="承租单位">
                {getFieldDecorator('companyName')(<Input placeholder="请输入承租单位名称,支持模糊查询" />)}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="法　　人">
                {getFieldDecorator('renter')(<Input placeholder="请输入法人姓名" />)}
              </FormItem>
            </Col>
          
            { (areaId !== '12' && areaId !== '14') && (<Col md={8} sm={24}>
              <FormItem label="楼　　层">
                {getFieldDecorator('fmin')(
                  <Select placeholder="请选择楼层" onChange={this.handleChangeFloor} style={{ width: '100%' }}>
                    { floors.length ? floors.map(floor => {
                      return <Option key={floor.id} value={floor.floor}>{floor.name}</Option>
                    }) : ''}
                  </Select>
                )}
              </FormItem>
            </Col>)}
            { (areaId !== '12' && areaId !== '14') && (<Col md={8} sm={24} style={{height: 32}}>
              <FormItem label="　房间号">
              {getFieldDecorator('roomsName')(
                  <Input placeholder='请输入'/>
                )}
              </FormItem>
            </Col>)}
            <Col md={8} sm={24}>
              <FormItem label="合同状态">
                {getFieldDecorator('valid', {
                  initialValue: ''
                })(
                  <Select placeholder="请选择合同状态" style={{ width: '100%' }}>
                    <Option value=''>全部</Option>
                    <Option value="1">有效</Option>
                    <Option value="0">无效</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="租金状态">
                {getFieldDecorator('chargeFlag')(
                  <Select placeholder="请选择租金状态" style={{ width: '100%' }}>
                    <Option value="1">已收</Option>
                    <Option value="0">未收</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="有效日期">
                {getFieldDecorator('rangeDate')(
                  <RangePicker/>
                )}
              </FormItem>
            </Col>
          </Row>
          <div style={{ overflow: 'hidden' }}>
            <span style={{ float: 'right', marginBottom: 24 }}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleResetSearch}>
                重置
              </Button>
              <a style={{ marginLeft: 8 }} onClick={this.handleExpandToggle}>
                收起 <Icon type="up" />
              </a>
            </span>
          </div>
        </Form>
      );
    }
    renderSearchForm() {
      return this.state.expand ? this.renderAdvancedSearchForm() : this.renderSimpleSearchForm()
    }
    renderModalForm() {
      const { areaId, targetKeys, updateValues, row } = this.state;
      const { rooms } = this.props.global;
      const roomsData = rooms.map(room=> {
        /* const roomName = room.roomNob ? 
                          (room.name + room.roomNoa) + '-' + (room.name + room.roomNob) :  
                          room.name + room.roomNoa; */
        return {
          //...room,
          key: `${room.id}`,
          label: `${room.roomName}`,
          value: `${room.id}`,
          isRented: room.isRented
        }
      });
      const filteredRooms = roomsData.filter(room => room.isRented == 0);
      const findedRooms = updateValues.id && row ? row.roomList.map(room => {
        return {
          key: `${room.id}`,
          label: `${room.roomName}`,
          value: `${room.id}`,
          isRented: 1
        }
      }) : [];
      const newRooms = [...filteredRooms, ...findedRooms];

      const formItemLayout = {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 7 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 12 },
          md: { span: 10 },
        },
      };

      return (
        <ContractBaseForm 
          submitting={ this.props.submitting } 
          areaId={areaId} 
          onContractSubmit={ this.handleContractSubmit } 
          targetKeys={targetKeys}
          updateValues={updateValues}
          selectedKeys={findedRooms}
          roomsData={newRooms}
          {...formItemLayout}
        /> 
      )
    }
    renderExtraContent() {
      const { searchFormValues } = this.state;
      const { validStartTime = '',validEndTime = '' } = searchFormValues;
      const color = ['#fff1f0','#fff7e6','#feffe6']
      return (
          <Fragment>
            合同到期时间 :&emsp;
            <RadioGroup value={validStartTime+'~'+validEndTime} onChange={ this.handleRadioChange }>
              {
                genMonthRange(3).map((range, index)=>{
                  const monthRange = range[0].format('YYYY-MM-DD')+'~'+range[1].format('YYYY-MM-DD')
                  return <RadioButton key={index} value={monthRange}><Tag color={color[index]} style={{color:'rgba(0, 0, 0, 0.65)'}}>{index+1}月内到期</Tag></RadioButton>
                })
              }
            </RadioGroup>
          </Fragment>
      )
    }
    handleExport() {
      const { searchFormValues, areaId } = this.state;
      const query = stringify({...searchFormValues, areaId});
      console.log(searchFormValues)
      window.open(`/api/contract/excel?${query}`);
    }
    handleChangeField = (name, field, index, value) => {
      this.rows[name][index][field] = value;
    }
    handleSubmitEnergy = () => {
      this.handleDrawerShow(false);
      this.props.dispatch({
        type: 'contract/addEnergy',
        payload: {
          contractId: this.state.currentData.id,
          powerList: this.rows['power'],
          waterList: this.rows['water'],
          year: this.state.year,
          month: this.state.month
        },
        callback: hide => {
          hide();
          message.success('录入成功')
        }
      })
    }
    handleMonthChange = (date, dateStr) => {
      this.setState({
        year: date.format('YYYY'),
        month: date.format('M')
      })
    }
    renderProfile = current => (
      current ? <Fragment>
        <p style={pStyle}>{current.companyName}水电补录</p>
        <MonthPicker disabledDate={disabledMonth} defaultValue={moment().subtract(1, 'months')} placeholder='请选择水电月份' style={{width: '100%', marginBottom: 24}} onChange={this.handleMonthChange}/>
        <p style={pStyle}>用水信息</p>
      <Row>
        <Col span={24}>
          <Table
            loading={this.props.contract.energyLoading}
            dataSource={this.props.contract.water}
            pagination={false}
            rowKey={row => row.pointName}
            size='small'
            columns={[
              {
                title: '名称',
                dataIndex: 'pointName'
              },
              {
                title: '上月用水',
                dataIndex: 'start',
                render:(value, row, index) => <InputNumber defaultValue={value} size='small' placeholder='请输入' onChange={value => this.handleChangeField('water','start', index, value)}/>
              },
              {
                title: '本月用水',
                dataIndex: 'end',
                render:(value, row, index) => <InputNumber defaultValue={value} size='small' placeholder='请输入' onChange={value => this.handleChangeField('water','end', index, value)}/>
              },
              {
                title: '用水合计',
                dataIndex: 'totalPower',
                render:(value, row, index) => <InputNumber defaultValue={value} size='small' placeholder='请输入' onChange={value => this.handleChangeField('water','totalPower', index, value)}/>
              },
              {
                title: '合计水费',
                dataIndex: 'totalMoney',
                render:(value, row, index) => <InputNumber defaultValue={value} size='small' placeholder='请输入' onChange={value => this.handleChangeField('water','totalMoney', index, value)}/>
              }
            ]}
          />
        </Col>
      </Row>
      <p style={{...pStyle, marginTop: 24}}>用电信息</p>
      <Row>
        <Col span={24}>
          <Table
            loading={this.props.energyLoading}
            dataSource={this.props.contract.power}
            pagination={false}
            rowKey={row => row.pointName}
            size='small'
            columns={[
              {
                title: '名称',
                dataIndex: 'pointName'
              },
              {
                title: '上月用电',
                dataIndex: 'zongStart',
                render:(value, row, index) => <InputNumber defaultValue={value} size='small' placeholder='请输入' onChange={value => this.handleChangeField('power','zongStart', index, value)}/>
              },
              {
                title: '本月用电',
                dataIndex: 'zongEnd',
                render:(value, row, index) => <InputNumber defaultValue={value} size='small' placeholder='请输入' onChange={value => this.handleChangeField('power','zongEnd', index, value)}/>
              },
              {
                title: '用电合计',
                dataIndex: 'totalPower',
                render:(value, row, index) => <InputNumber defaultValue={value} size='small' placeholder='请输入' onChange={value => this.handleChangeField('power','totalPower', index, value)}/>
              },
              {
                title: '合计电费',
                dataIndex: 'totalMoney',
                render:(value, row, index) => <InputNumber defaultValue={value} size='small' placeholder='请输入' onChange={value => this.handleChangeField('power','totalMoney', index, value)}/>
              }
            ]}
          />
        </Col>
      </Row>
      </Fragment> : null
    )
    render() {
      
      const { form, loading, contract: { records, total, current } } = this.props;
      const { modalVisible, selectedRows, updateValues, updateType, drawerVisible, currentData } = this.state;
      
      const renderModelTitle = (updateType) => {
        switch(updateType) {
          case 'edit' :
            return '管理合同';
            break;
          case 'throw' :
            return '撤销退租';
            break;
          case 'rented' :
            return '续租合同';
            break;
          default :
            return '添加合同';
            break;
        }
      }
      
      const pagination = {
        total,
        current,
        showSizeChanger: false
      }

      const mergeProps = {
        ...defaultProps,
        ...this.props
      }

      const parentMethods = {
        handleChangeUpdateType: this.handleChangeUpdateType,
        handleContractThrow: this.handleContractThrow,
        handleUnThrow: this.handleUnThrow,
        handleOpenDrawer: this.handleOpenDrawer
      }

      const tableColumns = columns({...parentMethods});
      const list = records.map(item => ({ ...item, disabled: !item.valid }));

      const getRowClassName = row => {
        const { isOut } = row;
        const classMap = {
          '1':'out1',
          '2':'out2',
          '3':'out3'
        }
        return isOut <=0 ? '' : classMap[isOut];
      }

      return (
        <Fragment>
          <Card
            bordered={false}
            bodyStyle={{
              paddingBottom:0
            }}
            style={{marginBottom: 24}}
          >
            <div className={styles.tableListForm}>{ this.renderSearchForm() }</div>
          </Card>
          <div className={cardStyles.standardList}>
            <Card 
              className={cardStyles.listCard}
              title={
                <Fragment>
                  <Button icon="plus" type="primary" style={{marginRight: 8}} onClick={() => this.handleModalVisible(true)}>添加合同</Button>
                  <Button icon="export" style={{marginRight: 8}} onClick={() => this.handleExport()}>导出合同</Button> 
                </Fragment>
              }
              bordered={false} 
              extra={ this.renderExtraContent() } 
              bodyStyle={{ padding: '0 32px 40px 32px' }}
            >
              <StandardTable
                columns={tableColumns}
                bordered
                selectedRows={ selectedRows }
                rowKey={record => record.id}
                onChange={ this.handleChangeTable }
                onSelectRow={ this.handleSelectRows }
                data={{list, pagination}}
                loading={loading}
                rowClassName={getRowClassName}
                size='middle'
              />
            </Card>
          </div>
          <Modal
            title={ renderModelTitle(updateType) }
            visible={modalVisible}
            width='960px'
            style={{ top: 30 }}
            destroyOnClose
            onCancel={() => this.handleModalVisible(false)}
          >
            { this.renderModalForm() }
          </Modal>
          <Drawer
            placement='right'
            width={640}
            closable={false}
            onClose={() => this.handleDrawerShow(false)}
            visible={drawerVisible}
            bodyStyle={{paddingBottom:60}}
            destroyOnCloses
          >
            <Alert message='默认补录上个月的水电账单信息' type='info' showIcon style={{marginBottom: 16}}/>
            {this.renderProfile(currentData)}
            <div
              style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: '100%',
                borderTop: '1px solid #e9e9e9',
                padding: '10px 16px',
                background: '#fff',
                textAlign: 'right',
              }}
            >
              <Button onClick={() => this.handleDrawerShow(false)} style={{ marginRight: 8 }}>
                取消
              </Button>
              <Button onClick={this.handleSubmitEnergy} type="primary">
                提交
              </Button>
            </div>
          </Drawer>
          <WrappedComponent {...mergeProps}/>
        </Fragment>
      )
    }
  }
  return Base
}
export default ContractBase;