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
  Input,
  Modal,
  Col,
  Card
} from 'antd';
import { connect } from 'dva';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import StandardFormRow from 'components/StandardFormRow';

const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
    md: { span: 12 },
  },
};

@connect(({ global, loading }) => ({
  global,
  loading: loading.models.global,
  submitting: loading.effects['floor/edit']
}))
@Form.create()
export default class SetFloor extends PureComponent {
  static contextTypes = {
    getArea: PropTypes.func,
    getFloors: PropTypes.func
  }
  state = {
    areaId: 11,
    updateType: '',
    modalVisible: false,
    updateValues: {}
  }
  componentDidMount() {
    const { areaId } = this.state;
    this.context.getArea();
    this.context.getFloors(areaId)
  }
  handleAreaChange = (areaId) => {
    this.context.getFloors(areaId)
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
      type: 'floor/edit',
      oper: 'delete',
      payload: id,
      callback: () => {
        this.context.getFloors(areaId)
      }
    })
  }

  handleSubmit = () => {
    const { form } = this.props;
    const { updateType, updateValues, areaId } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const values = updateType == 'edit' ? {
        ...updateValues,
        ...fieldsValue,
        id: updateValues.id,
        areaId
      } : {
        ...fieldsValue,
        areaId
      }
      this.props.dispatch({
        type: 'floor/edit',
        oper: updateType,
        payload: values,
        callback: () => {
          this.setState({
            modalVisible: false
          });
          this.context.getFloors(areaId)
        }
      });
    });
  }

  render() {
    const { loading, form, global: { areas, floors }, submitting } = this.props;
    const { updateValues, updateType, modalVisible } = this.state;
    const { getFieldDecorator } = form
    const columns = [
      {
        title: '楼层名称',
        dataIndex: 'name'
      },
      {
        title: '楼层代码',
        sorter: (a,b) => a.floor-b.floor,
        dataIndex: 'floor'
      },
      {
        title: '操作',
        dataIndex: '',
        render: (text, row, index) => {
          return (
            <Fragment>
              <a href='javascript:;' onClick={() => this.handleUpdateType(true, 'edit', row) }>编辑</a>
              <Divider type='vertical'/> 
              <Popconfirm 
                title={
                    <Fragment>
                      要删除 <b>{row.name}</b> 吗
                    </Fragment>
                  } 
                  onConfirm={() => this.handleDelete(row.id)}
                >
                  <a style={{ color: '#f5222d' }} href='javascript:;'>删除</a>
              </Popconfirm>
            </Fragment>
          )
        }
      }
    ]

    return (
      <PageHeaderLayout>
          <Card bordered={false}>
            <Form layout='inline'>
              <StandardFormRow grid last>
                <Row gutter={16}>
                  <Col xl={8} lg={10} md={12} sm={24} xs={24}>
                    <FormItem {...formItemLayout} label="区块选择">
                      <Select placeholder='请选择' onChange={this.handleAreaChange} style={{ width: 200 }}>
                        {
                          areas.map(area => <Option key={area.id} value={area.id}>{area.area}</Option>)
                        }
                      </Select>
                    </FormItem>
                  </Col>
                </Row>        
              </StandardFormRow>
            </Form>
          </Card>
          <Card bordered={false} style={{marginTop: 24}}>
            <Button type="primary" style={{ marginBottom: 16 }} icon="plus" onClick={() => this.handleUpdateType(true, 'add')}>
              添加楼层
            </Button>
            <Table
              columns={columns}
              size='middle'
              bordered
              rowKey={ row => row.id }
              pagination={false}
              dataSource={floors}
              loading={loading}
              onChange={this.handleTableChange}
            />
            <Modal
              title={ updateType === 'edit' ? '编辑楼层' : '添加楼层' }
              visible={modalVisible}
              onCancel={() => this.handleModalVisible(false)}
              onOk={ this.handleSubmit }
              confirmLoading={submitting}
              destroyOnClose
            >
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label='楼层名称'>
                {
                  getFieldDecorator('name', {
                    rules: [
                      {
                        required: true, message: '请输入楼层名称'
                      }
                    ],
                    initialValue: updateValues ? updateValues.name : ''
                  })(<Input placeholder='请输入楼层名称'/>)
                }
              </FormItem>
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label='楼层代码'>
                {
                  getFieldDecorator('floor', {
                    rules: [
                      {
                        required: true, message: '请输入楼层代码'
                      },
                      { validator: (rule, value, callback) => {
                        if(value && !/^[1-9]\d*$/.test(value)) {
                          callback('请输入数字类型的楼层代码');
                        }
                        callback();
                      } }
                    ],
                    initialValue: updateValues ? updateValues.floor : ''
                  })(<Input placeholder='请输入数字类型的楼层代码'/>)
                }
              </FormItem>
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label='电表设备号'>
                {
                  getFieldDecorator('powerPointId', {
                    initialValue: updateValues ? updateValues.powerPointId : ''
                  })(
                    <Input placeholder='请输入' style={{width: '100%'}}/>
                  )
                }
              </FormItem>
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label='水表设备号'>
                {
                  getFieldDecorator('waterPointId', {
                    initialValue: updateValues ? updateValues.waterPointId : ''
                  })(
                    <Input placeholder='请输入' style={{width: '100%'}}/>
                  )
                }
              </FormItem>
            </Modal>
          </Card>
      </PageHeaderLayout>
    )
  }
}