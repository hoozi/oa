import React, { PureComponent } from 'react';
import { 
    Card, 
    Input, 
    Radio, 
    Button, 
    Icon, 
    Upload,
    Modal 
} from 'antd';
import { connect } from 'dva';
import { Link } from 'dva/router';
import CustomList from '../../components/CustomList';
import { BasicForms, RoleForms } from '../../components/CustomForm';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from '../List/BasicList.less';
import map from 'lodash/map';
import Authorized from '../../utils/Authorized';
import indexOf from 'lodash/indexOf';

const { Search, TextArea } = Input;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@connect(({ customs, loading }) => ({ 
    customs, 
    loading: loading.models.customs
}))
class Custom extends PureComponent {
    state = {
        radioValue: '',
        visible: false,
        modalType: 'add',
        validateStatus: '',
        userId: null,
        roleVisible: false,
        targetKeys: [],
        updateArticle: {}
    }
    componentDidMount() {
        this._fetchArticles({})
    }
    _fetchArticles({type='', current=1, username}) {
        const { dispatch } = this.props;
        dispatch({
            type: 'customs/fetch',
            actionType: '',
            payload: {
                _time: +new Date(),
                type,
                username,
                current,
                size: 10
            }
        })
    }
    _dispatchByName(name, param) {
        const { dispatch } = this.props;
        dispatch({
            type: 'customs/editCustom',
            operateName: name,
            payload: param
        })
    }
    _setValidateStatus(status) {
        this.setState({validateStatus: status})
    }
    handleDelete = (id) => {
        this._dispatchByName('deleteCustom', { id })
    }
    handlePageChange = (page) => {
        this._fetchArticles({current: page})
    }
    handleRadioChange = (e) => {
        this._fetchArticles({type: e.target.value});
        this.setState({
            radioValue: e.target.value
        });
    }
    hideModal = () => {
        this.setState({
            visible: false
        })
    }
    hideRoleModal = () => {
        this.setState({
            roleVisible: false
        })
    }
    handleSubmit = (values) => {
        const { modalType } = this.state;
        const operateName = modalType === 'add' ? 'addCustom' : 'editCustom';
        this._dispatchByName(operateName, {...values});
        modalType === 'edit' && this.hideModal();
    }
    handleOpenEditModal = (data) => {
        this.setState({
            updateArticle: data,
            visible: true,
            modalType: 'edit'
        })
    }
    handleRoleModal = (flag, user = {}) => {
        const { userId, sysRoles } = user
        this.setState({
            roleVisible: flag,
            targetKeys: map(sysRoles, 'roleId'),
            userId: userId
        })
    }
    handleOpenAddModal = () => {
        this.setState({
            visible: true,
            modalType: 'add',
            updateArticle: {}
        })
    }
    handleSearch = (value) => {
        let params = value ? {
            username: value
        } : {}
        this._fetchArticles(params);
    }
    handleCheckNameUnique = (value) => {
        if(!value) {
            this._setValidateStatus('');
            return;
        };
        const { dispatch } = this.props;
        const _this = this;
        this._setValidateStatus('validating');
        dispatch({
            type: 'customs/checkNameUnique',
            payload: value,
            callback(valid) {
                _this._setValidateStatus(valid ? 'error' : 'success');
            }
        })
    }
    handleRoleSubmit = (roleId) => {
        const { userId } = this.state;
        this._dispatchByName('editCustom', {
            userId,
            roleId
        });
        this.handleRoleModal()
    }
    renderCardExtraContent() {
        const { radioValue, visible, modalType, updateArticle, roleVisible, userId } = this.state;
        return (<div className={styles.extraContent}>
              <Search
                className={styles.extraContentSearch}
                placeholder="请输入用户名"
                onSearch={this.handleSearch}
              />
              <Modal
                title={modalType==='add' ? '新增用户' : '修改用户'}
                style={{ top: 20 }}
                visible={visible}
                onCancel={this.hideModal}
                footer={null}
                destroyOnClose={true}
              >
                <BasicForms username={this.state.username} validateStatus={this.state.validateStatus} onCheckNameUnique={this.handleCheckNameUnique} updateArticle={updateArticle} onSubmit={this.handleSubmit}/>
             </Modal>
             <Modal
                title='角色设置'
                style={{ top: 20 }}
                visible={roleVisible}
                onCancel={() => {this.handleRoleModal(false)}}
                footer={null}
                destroyOnClose={true}
                >
                <RoleForms userId={userId} targetKeys={this.state.targetKeys} onRoleSubmit={this.handleRoleSubmit}/>
             </Modal>
            </div>)
    }
    render() {
        const { customs, loading } = this.props;
        return (
            <PageHeaderLayout>
                <div className={styles.standardList}>
                    <Card 
                        className={styles.listCard}
                        bordered={false}
                        //title="新闻列表"
                        title={<Button type='primary' onClick={this.handleOpenAddModal}><Icon type="plus" />新增</Button>}
                        style={{ marginTop: 24 }}
                        bodyStyle={{ padding: '0 24px' }}
                        extra={this.renderCardExtraContent()}
                    >
                        <CustomList 
                            data={customs} 
                            loading={loading} 
                            onDelete={this.handleDelete}
                            onPageChange={this.handlePageChange}
                            onOpenEditModal={this.handleOpenEditModal}
                            onRoleModal={this.handleRoleModal}
                        />
                    </Card>
                </div>
            </PageHeaderLayout>
        )   
    }
}

export default Custom