import React, { Component, PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  Select,
  Form,
  Row,
  Table,
  Divider,
  Popconfirm,
  Button,
  Tag,
  Tooltip,
  Icon,
  Input,
  Modal,
  InputNumber,
  Col,
  Card
} from 'antd';
import { connect } from 'dva';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import StandardFormRow from 'components/StandardFormRow';

const FormItem = Form.Item;
const Option = Select.Option;
const InputGroup = Input.Group;
const formItemLayout = {
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
    md: { span: 12 },
  },
};

@connect(({ global, room, loading }) => ({
  global,
  room,
  loading: loading.models.room,
  submitting: loading.effects['room/edit'],
  updating: loading.effects['room/updateBill']
}))
@Form.create()
export default class SetRoom extends PureComponent {
  static contextTypes = {
    getArea: PropTypes.func,
    getFloors: PropTypes.func
  }
  state = {
    areaId: 11,
    floorId: '',
    modalAreaId: 11,
    roomName: '',
    updateType: '',
    isRented: '',
    modalVisible: false,
    updateValues: {}
  }
  componentDidMount() {
    const { areaId, floorId } = this.state;
    this.context.getArea();
    this.context.getFloors(areaId);
    this.getRoomPage({areaId, floorId})
  }
  getRoomPage(payload) {
    this.props.dispatch({
      type: 'room/fetch',
      payload: {
        ...payload
      }
    })
  }
  handleModalAreaChange = modalAreaId => {
    this.setState({
      modalAreaId
    })
  }
  handleAreaChange = (areaId) => {
    this.setState({
      modalAreaId: areaId
    })
    this.context.getFloors(areaId, floors => {
      this.setState({
        floorId: floors[0]['id']
      })
    })
  }
  
  handleFormChange = (value, name) => {
    if(name == 'areaId') {
      this.handleAreaChange(value)
    }
    this.setState({
      [name]: value
    });
  }

  handleUpdateType = ( modalVisible, updateType, updateValues ) => {
    this.setState({ updateType, updateValues });
    this.handleModalVisible(modalVisible);
  }

  handleModalVisible = flag => {
    this.setState({ modalVisible: !!flag })
  }

  handleDelete = id => {
    const areaId = this.state.areaId;
    this.props.dispatch({
      type: 'room/edit',
      oper: 'delete',
      payload: id,
      callback: () => {
        this.getRoomPage({areaId})
      }
    })
  }

  handleSubmit = () => {
    const { form } = this.props;
    const { updateType, updateValues, areaId, floorId, roomName, isRented } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const { roomNoa, roomNob, floorGroup} = fieldsValue;
      const _roomName = (areaId != 12 || areaId !=14) ? floorGroup.label+roomNoa+(roomNob ? ('-'+floorGroup.label+roomNob) : '' ) : '';
      const values = updateType == 'edit' ? {
        roomName:_roomName,
        ...updateValues,
        ...fieldsValue,
        id: updateValues.id,
        floorId: floorGroup.key
      } : {
        roomName:_roomName,
        ...fieldsValue,
        floorId: floorGroup.key,
        isRented: 0
      }
      this.props.dispatch({
        type: 'room/edit',
        oper: updateType,
        payload: values,
        callback: () => {
          (updateType == 'edit' && updateValues.isRented === 1) ? 
          this.handleUpdateBill(updateValues.cid, values.userId, values.userWaterId) : 
          this.setState({
            modalVisible: false
          });
          this.getRoomPage({ areaId, floorId, roomName, isRented })
        }
      });
    });
  }

  handleRoomSearch = () => {
    const { areaId, floorId, roomName, isRented } = this.state;
    this.getRoomPage({ areaId, floorId, roomName, isRented, current:1 })
  }

  handleResetSearch = () => {
    this.setState({
      areaId: 11,
      floorId: '',
      roomName: '',
      isRented: ''
    }, () => {
      this.getRoomPage({areaId: this.state.areaId});
      this.context.getFloors(this.state.areaId);
    });
  }

  handleUpdateBill = (cid, userId, userWaterId) => {
    this.props.dispatch({
      type: 'room/updateBill',
      payload: {
        userId,
        cid,
        userWaterId
      },
      callback: () => {
        this.setState({
          modalVisible: false
        });
      }
    })
  }

  handleTableChange = pagination => {
    const { current, pageSize } = pagination;
    const { areaId, floorId, roomName, isRented } = this.state;
    this.getRoomPage({ current, areaId, floorId, roomName, isRented,  size: pageSize})
  }
  checkRoomNo = (rule, value, callback) => {
    const { form } = this.props;
   
    if(!value) {
      callback('房间号1必填');
    }
    callback();
    
  }
  render() {
    const { loading, form, global: { areas, floors }, room: { records, current, total }, submitting, updating } = this.props;
    const { updateValues, updateType, modalVisible, areaId, modalAreaId, floorId, roomName } = this.state;
    const { getFieldDecorator } = form;
    const paginationProps = {
      showQuickJumper: true,
      current,
      total
    }
    const columns = [
      {
        title: '房间号',
        dataIndex: 'roomName'
      },
      {
        title: '电表户号',
        dataIndex: 'userId',
        render: value => value ? value : <Tag color='red'>未设置</Tag>
      },
      {
        title: '水表户号',
        dataIndex: 'userWaterId',
        render: value => value ? value : <Tag color='red'>未设置</Tag>
      },
      {
        title: '面积',
        sorter: (a,b) => a.size-b.size,
        dataIndex: 'size'
      },
      {
        title: '区块',
        dataIndex: 'areaName'
      },
      {
        title: '楼层',
        dataIndex: 'name'
      },
      {
        title: '状态',
        dataIndex: 'isRented',
        render: value => <Tag color={ value==0 ? 'green' : 'orange'}>{value == 1 ? '已出租' : '未出租'}</Tag>
      },
      {
        title: '操作',
        dataIndex: '',
        render: (text, row, index) => {
          return (
            <Fragment>
              <a href='javascript:;' onClick={() => this.handleUpdateType(true, 'edit', row) }>编辑</a>
              {
              row.isRented === 0 && <Fragment>
                <Divider type='vertical'/> 
                <Popconfirm 
                  title={
                      <Fragment>
                        要删除 <b>{row.roomName}</b> 吗
                      </Fragment>
                    } 
                    onConfirm={() => this.handleDelete(row.id)}
                  >
                    <a style={{ color: '#f5222d' }} href='javascript:;'>删除</a>
                </Popconfirm>
              </Fragment>
              }
            </Fragment>
          )
        }
      }
    ]
//<Icon type="loading" style={{color: '#1890ff'}}/>
    return (
      <PageHeaderLayout>
          <Card bordered={false} bodyStyle={{paddingBottom:0}}>
            <Form>
              <StandardFormRow grid last>
                <Row gutter={24}>
                  <Col span={5}>
                    <FormItem {...formItemLayout} label="区块选择">
                      <Select placeholder='请选择' value={areaId} onChange={(value) => this.handleFormChange(value, 'areaId')}>
                        {
                          areas.length > 0 && areas.map(area => <Option key={area.id} value={area.id}>{area.area}</Option>)
                        }
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span={5}>
                    <FormItem {...formItemLayout} label="楼层选择">
                      <Select placeholder='请选择' value={floorId} onChange={(value) => this.handleFormChange(value, 'floorId')}>
                        <Option value=''>全部</Option>
                        {
                          floors.length > 0 && floors.map(floor => <Option key={floor.id} value={floor.id}>{floor.name}</Option>)
                        }
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span={5}>
                    <FormItem {...formItemLayout} label="房间号">
                      <Input placeholder='请输入' value={roomName} onChange={(e) => this.handleFormChange(e.target.value, 'roomName')}/>
                    </FormItem>
                  </Col>
                  <Col span={5}>
                    <FormItem {...formItemLayout} label="出租状态">
                      <Select placeholder='请选择' onChange={(value) => this.handleFormChange(value, 'isRented')}>
                        <Option value='1'>已出租</Option>
                        <Option value='0'>未出租</Option>
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span={4}>
                    <Button style={{marginRight: 8}} type='primary' onClick={this.handleRoomSearch}>查询</Button>
                    <Button onClick={this.handleResetSearch}>重置</Button>
                  </Col>
                </Row>        
              </StandardFormRow>
            </Form>
          </Card>
          <Card bordered={false} style={{marginTop: 24}}>
            <Button type="primary" style={{ marginBottom: 16 }} icon="plus" onClick={() => this.handleUpdateType(true, 'add')}>
              添加房间
            </Button>
            <Table
              columns={columns}
              size='middle'
              bordered
              rowKey={ row => row.id }
              pagination={paginationProps}
              dataSource={records}
              loading={loading}
              onChange={this.handleTableChange}
            />
            <Modal
              title={ updateType === 'edit' ? '编辑房间' : '添加房间' }
              visible={modalVisible}
              onCancel={() => this.handleModalVisible(false)}
              onOk={ this.handleSubmit }
              confirmLoading={submitting || updating}
              destroyOnClose
            >
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} label='区块选择' style={{marginBottom: 12}}>
                {
                  getFieldDecorator('areaId', {
                    rules: [
                      {
                        required: true, message: '请选择区块'
                      }
                    ],
                    initialValue: modalAreaId
                  })(
                    <Select placeholder='请选择' onChange={ this.handleModalAreaChange } style={{ width: '100%' }}>
                      {
                        areas.length > 0 && areas.map(area => <Option key={area.id} value={area.id}>{area.area}</Option>)
                      }
                    </Select>
                  )
                }
              </FormItem>
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} label='楼层' style={{marginBottom: 12}}>
                {
                  getFieldDecorator('floorGroup', {
                    rules: [
                      {
                        required: true, message: '请选择楼层'
                      }
                    ],
                    initialValue: updateValues ? { key: updateValues.floorId, label: '' }  : { key: '', label: '' }
                  })(
                    <Select labelInValue placeholder='请选择' style={{ width: '100%' }}>
                      {
                        floors.length > 0 && floors.map(floor => <Option key={floor.id} value={floor.id}>{floor.name}</Option>)
                      }
                    </Select>
                  )
                }
              </FormItem>
              {
                modalAreaId == 12 || modalAreaId == 14 ? 
                <FormItem 
                  labelCol={{ span: 5 }} 
                  wrapperCol={{ span: 15 }} 
                  label='房间号(位置)' 
                  style={{marginBottom: 12}}
                >
                  {
                    getFieldDecorator('roomName', {
                      initialValue: updateValues ? updateValues.roomName : ''
                    })(
                    <Input placeholder="请输入" />
                    )
                  }         
                </FormItem> :
                <FormItem 
                  labelCol={{ span: 5 }} 
                  wrapperCol={{ span: 19 }} 
                  label={
                    <span>
                      房间号&nbsp;
                      <Tooltip title="按房间号输入,比如01表示A101">
                        <Icon type="exclamation-circle-o" />
                      </Tooltip>
                    </span>
                  } 
                  style={{marginBottom: 12}}
                >
                  {
                    getFieldDecorator('roomNoa', {
                      rules: [
                        {
                          validator: this.checkRoomNo
                        }
                      ],
                      initialValue: updateValues ? updateValues.roomNoa : ''
                    })(
                      <Input style={{ width: '50%', borderTopRightRadius:0, borderBottomRightRadius: 0}} placeholder="房间号1" />
                    )
                  }
                  {
                    getFieldDecorator('roomNob', {
                      initialValue: updateValues ? updateValues.roomNob : ''
                    })(
                    <Input style={{ width: '50%',borderLeft:0, borderTopLeftRadius:0, borderBottomLeftRadius:0}} placeholder="房间号2" />
                    )
                  }         
                </FormItem>
              }
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} label='面积(㎡)'>
                {
                  getFieldDecorator('size', {
                    rules: [
                      {
                        required: true, message: '请输入面积'
                      }
                    ],
                    initialValue: updateValues ? updateValues.size : ''
                  })(
                    <InputNumber placeholder='请输入面积' style={{width: '100%'}}/>
                  )
                }
              </FormItem>
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} label='电表户号'>
                {
                  getFieldDecorator('userId', {
                    initialValue: updateValues ? updateValues.userId : ''
                  })(
                    <Input placeholder='请输入' style={{width: '100%'}}/>
                  )
                }
              </FormItem>
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} label='水表户号'>
                {
                  getFieldDecorator('userWaterId', {
                    initialValue: updateValues ? updateValues.userWaterId : ''
                  })(
                    <Input placeholder='请输入' style={{width: '100%'}}/>
                  )
                }
              </FormItem>
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} label='电表设备号'>
                {
                  getFieldDecorator('powerPointId', {
                    initialValue: updateValues ? updateValues.powerPointId : ''
                  })(
                    <Input placeholder='请输入' style={{width: '100%'}}/>
                  )
                }
              </FormItem>
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} label='水表设备号'>
                {
                  getFieldDecorator('waterPointId', {
                    initialValue: updateValues ? updateValues.waterPointId : ''
                  })(
                    <Input placeholder='请输入' style={{width: '100%'}}/>
                  )
                }
              </FormItem>
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} label='备注'>
                {
                  getFieldDecorator('remark', {
                    initialValue: updateValues ? updateValues.remark : ''
                  })(
                    <Input.TextArea placeholder='请输入备注' autosize={{minRows: 3, maxRows: 6}}/>
                  )
                }
              </FormItem>
            </Modal>
          </Card>
      </PageHeaderLayout>
    )
  }
}