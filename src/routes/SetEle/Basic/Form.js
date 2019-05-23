import React, { PureComponent, Component, Fragment } from 'react';
import {
  Form,
  Modal,
  Input,
  InputNumber,
  Select,
  Alert,
  Checkbox,
  Tooltip,
  Icon,
  Row,
  Col,
  Spin
} from 'antd';
import debounce from 'lodash/debounce';
import intersection from 'lodash/intersection';

const FormItem = Form.Item;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;

const BasicForm = WrappedComponent => {
  return class extends PureComponent {
    handleModalOK = () => {
      const { form, onFormSubmit } = this.props;
      form.validateFields((err, fieldsValue) => {
        if(err) return;
        const { roomsId } = fieldsValue;
        const mergerValues = roomsId ? 
        {
          ...fieldsValue,
          roomsId: roomsId.length >1 ? roomsId.sort((a, b) => a-b).join(',') : roomsId.join('')
        } : 
        {
          ...fieldsValue
        }
        onFormSubmit && onFormSubmit(mergerValues)
      })
    }
    render() {
      const { modalVisible, onModalCancel, submitting, modalType} = this.props;
      const mergerProps = {
        ...this.props
      }
      return (
        <Modal
          title={modalType == 'add' ? '添加电表' : '编辑电表'}
          visible={modalVisible}
          onCancel={onModalCancel}
          onOk={this.handleModalOK}
          confirmLoading={submitting}
          width={650}
          destroyOnClose
        >
          <WrappedComponent {...mergerProps}/>
        </Modal>
      )
    }
  }

}

class NameForm extends PureComponent {
  render() {
    const { updateValues } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Fragment>
        <FormItem 
          labelCol={{ span: 5 }} 
          wrapperCol={{ span: 15 }} 
          label='名称'>
          {
            getFieldDecorator('name', {
              rules: [
                {
                  required: true, message: '请输入名称'
                }
              ],
              initialValue: updateValues ? updateValues.name : ''
            })(<Input placeholder='请输入'/>)
          }
        </FormItem>
        <FormItem 
          labelCol={{ span: 5 }} 
          wrapperCol={{ span: 15 }} 
          label='设备号'>
          {
            getFieldDecorator('pointId', {
              initialValue: updateValues ? updateValues.pointId : ''
            })(<Input placeholder='请输入'/>)
          }
        </FormItem>
      </Fragment>    
    )
  }
}

class ContractForm extends PureComponent {
  render() {
    const { contractFetch, contractData, onContractFilter, form: {getFieldDecorator}} = this.props;
    return (
      <Fragment>
        <Alert type='info' message='此电表需要从合同中选取' showIcon style={{marginBottom: 16}}/>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} label='单位名称' style={{marginBottom: 16}}>
          {
            getFieldDecorator('cid', {
              rules: [
                {
                  required: true, message: '请选择单位'
                }
              ]
            })(
              <Select
                showSearch
                placeholder='请选择'
                style={{width: '100%'}}
                notFoundContent={contractFetch? <Spin size='small'/>: null}
                filterOption={false}
                onSearch={debounce(onContractFilter,500)}
              >
                {
                  contractData.map(c => <Option key={c.id} value={c.id}>{c.companyName}</Option>)
                }
              </Select>
            )
          }
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label='电表个数'>
          {
            getFieldDecorator('meterNum', {
              rules: [
                {
                  required: true, message: '请输入电表个数'
                }
              ],
            })(<InputNumber min={0} placeholder='请输入'/>)
          }
        </FormItem>
      </Fragment>
    )
  }
}
class ContractWareCustomForm extends PureComponent {
  state = {
    contract: {}
  }
  componentWillMount() {
    const { updateValues } = this.props;
    this.getContractById(updateValues.cid)
  }
  getContractById(payload) {
    this.props.dispatch({
      type: 'contract/fetchById',
      payload,
      callback: (data) => {
        this.setState({
          contract: data
        })
      }
    })
  }

  handleContractChange = cid => {
    this.getContractById(cid)
  }
  renderRooms(roomsOptions){
    return (
      <CheckboxGroup options={roomsOptions}></CheckboxGroup>
    )
  }
  render() {
    const { contractFetch, contractData, updateValues, onContractFilter, form: {getFieldDecorator}} = this.props;
    const { contract } = this.state;
    
    const roomsOptions = contract.roomList ? 
                          contract.roomList.map(room => ({value: room.id+'', label: room.roomName})) :
                          [];
    const defaultRooms = intersection(roomsOptions.map(room=>room.value), updateValues.id ? updateValues.roomsId.split(','): []);
    
    return (
      <Fragment>
        <Alert type='info' message='此电表需要从合同中选取' showIcon style={{marginBottom: 16}}/>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} label='单位名称' style={{marginBottom: 16}}>
          {
            getFieldDecorator('cid', {
              rules: [
                {
                  required: true, message: '请选择单位'
                }
              ],
              initialValue: updateValues.id && updateValues.cid
            })(
              <Select
                showSearch
                placeholder='请选择'
                style={{width: '100%'}}
                notFoundContent={contractFetch? <Spin size='small'/>: null}
                filterOption={false}
                onChange={this.handleContractChange}
                onSearch={debounce(onContractFilter,500)}
              >
                {
                  contractData.map(c => <Option key={c.id} value={c.id}>{c.companyName}</Option>)
                }
              </Select>
            )
          }
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} 
          style={{marginBottom:16}}
          label={(
            <span>
              房间号&nbsp;
              <Tooltip title="防火区由一组房间组成">
                <Icon type="exclamation-circle-o" />
              </Tooltip>
            </span>
          )}
        >
          {
            getFieldDecorator('roomsId', {
              rules: [
                {
                  required: true, message: '请选择房间号'
                }
              ],
              initialValue: updateValues ? defaultRooms : []
            })( roomsOptions.length >0 ? this.renderRooms(roomsOptions) : <span style={{color: '#999'}}>请先选择单位</span>) 
          }
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} 
          label='倍数'
        >
          {
            getFieldDecorator('times', {
              initialValue: updateValues ? updateValues.times : ''
            })(<InputNumber placeholder='请输入'/>)
          }
        </FormItem>
        {
          getFieldDecorator('fmin', {
            initialValue: updateValues ? updateValues.fmin : (contract ? contract.fmin : '' )
          })
        }
        {
          getFieldDecorator('rmin', {
            initialValue: updateValues ? updateValues.rmin : (contract ? contract.rmin : '' )
          })
        }
        {
          getFieldDecorator('id', {
            initialValue: updateValues && updateValues.id
          })
        }
      </Fragment>
    )
  }
}

export const Name = Form.create()(BasicForm(NameForm));
export const Contract = Form.create()(BasicForm(ContractForm))
export const ContractWareCustom = Form.create()(BasicForm(ContractWareCustomForm))


