import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {
  Form, 
  Input,
  Select, 
  Button,
  Icon,
  Transfer,
} from 'antd';
import { checkNameUnique } from '../../services/api';
import findIndex from "lodash/findIndex";
import uniqBy from "lodash/uniqBy";
import 'antd/lib/upload/style/index.less';
import 'antd/lib/form/style/index.less';
import styles from './style.less';
import { getRoleList } from '../../services/api'

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
const getSafeContent = (content) => {
  return content
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;")
}

@connect(({ loading }) => ({
  submitting: loading.effects['customs/editCustom'],
}))
@Form.create({
  mapPropsToFields(props) {
    const retFields = {};
    const { updateArticle } = props;
    if(updateArticle.id) {
        Object.keys(updateArticle).forEach((key) => {
          retFields[key] = Form.createFormField({
            value: updateArticle[key]
          })
        });
    } else {
      retFields['password'] = Form.createFormField({
        value: ''
      });
    }
    return retFields;
  }
})
export class BasicForms extends Component {
  state = {
    view: false,
    validateStatus: '',
    username: '',
    roleList: []
  }
  _setValidateStatus(status) {
    this.setState({validateStatus: status})
  }
  componentWillMount(){
    const { updateArticle } = this.props;
    const { username } = updateArticle;
    this.setState({ username });
  }
  async componentDidMount() {
    const response = await getRoleList();
    //const targetKeys = []
    if(typeof response === 'undefined') return;
    if(response.code === 1000) {
      const roleList = response.data.map(role => {
        //targetKeys.push(role.roleId)
        return {
          id: role.roleId+'',
          title: role.roleName
        }
      })
      this.setState({ roleList });
    }
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err && this.state.validateStatus!=='error' && this.state.validateStatus!=='validating') {
        if(this.props.onSubmit) {
          const roleId = this.props.updateArticle.userId ? this.props.updateArticle.sysRoles.map(item => item.roleId) : null
          this.props.onSubmit({...this.props.updateArticle, roleId,  ...values, ...this.state});
          this.props.form.resetFields();
          this.setState({
            username: ''
          })
        }
      }
    });
  }
  async checkNameUnique(){
    let value = this.state.username;
    let response = await checkNameUnique(value)
    if(!value) {
      this._setValidateStatus('');
      return;
    };
    const _this = this;
    this._setValidateStatus('validating');
    this._setValidateStatus( response.code === 1000 ? 'error' : 'success' )
  }
  getView = () => {
    return (
      <span style={{cursor: 'pointer',color: 'rgba(0,0,0,.25)' }} onClick={() => {
        this.setState((preState) => {
          return {
            view: !preState.view
          }
        })
      }}>
        {
          this.state.view ? <Icon type="eye-invisible" /> : <Icon type="eye" />
        }
      </span>
    )
  }
  handleusernameChange = (e) => {
    this.setState({
      username: e.target.value
    })
  }
  render() {
    const { submitting, updateArticle } = this.props;
    const { roleList } = this.state
    const { getFieldDecorator } = this.props.form;
    const { userId, sysRoles } = updateArticle;
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 }
    }
    const submitFormLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13, offset: 7 }
    };
    return (
      
          <Form
            onSubmit={this.handleSubmit}
            style={{ marginTop: 8 }}
          >
            <FormItem
              {...formItemLayout}
              label="用户名"
              hasFeedback
              validateStatus={this.state.validateStatus}
              help= {this.state.validateStatus === 'error' && '用户名已存在'}
            >
              <Input placeholder="请输入用户名" value={this.state.username} onChange={this.handleusernameChange} onBlur={this.checkNameUnique.bind(this)}/>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="密码"
            >
              {getFieldDecorator('password')(
                <Input type={this.state.view ? 'text' : 'password'} placeholder={ userId && '请输入新密码'} suffix={this.getView()}/>
              )}
              
            </FormItem>
            <FormItem
              {...formItemLayout}
              label='角色'
            >
              {getFieldDecorator('roleId', {
                initialValue: userId  ? sysRoles.map(item => item.roleId+'') : []
              })(
                <Select 
                  mode='tags'
                >
                 {roleList.length ? roleList.map(item => <Option key={item.id} value={item.id}>{item.title}</Option>) : null}
                </Select>
              )}
              
            </FormItem>
            {/* <FormItem
              {...formItemLayout}
              label="所属公司"
            >
              {getFieldDecorator('company', {
                rules: [{
                  required: true, message: '请输入所属公司名称',
                }]
              })(
                <Input key="company" placeholder="请输入所属公司名称"/>
              )}
            </FormItem> */}
            <FormItem {...submitFormLayout} style={{ marginTop: 0 }}>
              <Button type="primary" htmlType="submit" loading={submitting}>
                提交
              </Button>
            </FormItem>
          </Form>
        
    );
  }
}


export class RoleForms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roleList: [],
      targetKeys: props.targetKeys || []
    }
  }
  async componentDidMount() {
    const response = await getRoleList();
    //const targetKeys = []
    if(typeof response === 'undefined') return;
    if(response.code === 1000) {
      const roleList = response.data.map(role => {
        //targetKeys.push(role.roleId)
        return {
          key: role.roleId,
          title: role.roleName,
          description: role.roleDesc,
          chose: role.roleId
        }
      })
      this.setState({ roleList });
    }
  }
  handleChange = (targetKeys, direction, moveKeys) => {
    this.setState({ targetKeys });
  }
  handleSubmit = () => {
    if(this.props.onRoleSubmit) {
      this.props.onRoleSubmit(this.state.targetKeys);
    }
  }
  render() {
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 }
    }
    const submitFormLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13, offset: 7 }
    };
    
    return (
            <Fragment>
              <Transfer
                dataSource={this.state.roleList}
                showSearch
                listStyle={{
                  width: 206,
                  height: 300,
                }}
                titles={['可选角色', '当前角色']}
                //operations={['-', '+']}
                targetKeys={this.state.targetKeys}
                onChange={this.handleChange}
                render={item => `${item.title}`}
                /* footer={this.renderFooter} */
              />
              <Button type="primary" onClick={ this.handleSubmit } style={{marginTop:16}}>提交</Button>
           </Fragment>
    )
  }
}