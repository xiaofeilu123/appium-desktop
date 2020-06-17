import { clipboard } from 'electron';
import React, { Component } from 'react';
import _ from 'lodash';
import ReactDOM from 'react-dom';
import { Input, Card, Tooltip, Modal, Button, Icon, Row, Col } from 'antd';
import InspectorStyles from './Inspector.css';
import frameworks from '../../lib/client-frameworks';
import { highlight } from 'highlight.js';
import { withTranslation } from '../../util';
// import index from "../../actions/index";

// const Option = Select.Option;
const ButtonGroup = Button.Group;

class RecordedActions extends Component {

  code (raw = true) {
    let {showBoilerplate, sessionDetails, recordedActions, actionFramework
    } = this.props;
    let {host, port, path, https, desiredCapabilities} = sessionDetails;

    let framework = new frameworks[actionFramework](host, port, path,
      https, desiredCapabilities);
    framework.actions = recordedActions;
    let rawCode = framework.getCodeString(showBoilerplate);
    if (raw) {
      return rawCode;
    }
    return highlight(framework.language, rawCode, true).value;
  }

  actionBar () {
    const {
      showBoilerplate,
      recordedActions,
      // setActionFramework,
      toggleShowBoilerplate,
      showSaveCaseModal,
      hideSaveCaseModal,
      clearRecording,
      popAction,
      closeRecorder,
      // actionFramework,
      isRecording,
      isShowSaveModal,
      t,
    } = this.props;

    const saveCaseValue = [
      ['projectName', 'string'],
      ['peojectDes', 'string']
    ];

    // let frameworkOpts = Object.keys(frameworks).map((f) => <Option value={f}>
    //   {frameworks[f].readableName}
    // </Option>);

    let boilerplateType = showBoilerplate ? 'primary' : 'default';

    return <div>
      {/*{!!recordedActions.length &&*/}
      {/*<Select defaultValue={actionFramework} onChange={setActionFramework}*/}
      {/*className={InspectorStyles['framework-dropdown']} size="small">*/}
      {/*{frameworkOpts}*/}
      {/*</Select>*/}
      {/*}*/}
      {(!!recordedActions.length || !isRecording) &&
        <ButtonGroup size="small">
          {!!recordedActions.length &&
          <Tooltip title={t('save test case')}>
            <Button
              onClick={showSaveCaseModal} icon="save"
            />
          </Tooltip>
          }
          {!!recordedActions.length &&
          <Tooltip title={t('Show/Hide Boilerplate Code')}>
            <Button onClick={toggleShowBoilerplate} icon="export"
              type={boilerplateType}
            />
          </Tooltip>
          }
          {!!recordedActions.length &&
          <Tooltip title={t('Copy code to clipboard')}>
            <Button icon="copy"
              onClick={() => clipboard.writeText(this.code())}
            />
          </Tooltip>
          }
          {!!recordedActions.length &&
          <Tooltip title={t('Back Actions')}>
            <Button icon="arrow-left" onClick={() => popAction(recordedActions)}/>
          </Tooltip>
          }
          {!!recordedActions.length &&
          <Tooltip title={t('Clear Actions')}>
            <Button icon="delete" onClick={clearRecording}/>
          </Tooltip>
          }
          {!isRecording &&
          <Tooltip title={t('Close Recorder')}>
            <Button icon="close" onClick={closeRecorder}/>
          </Tooltip>
          }
        </ButtonGroup>
      }
      {!!recordedActions.length &&
        <Modal
          title={t('save test case')}
          visible={isShowSaveModal}
          onOk={() => showSaveCaseModal()}
          onCancel={() => hideSaveCaseModal()}
          okText={t('Execute')}
          cancelText={t('Quit')}
        >
          {_.map(saveCaseValue,
            ([argName, argType], index) => <Row key={index} gutter={16}>
              <Col span={24} className={InspectorStyles['arg-container']}>
                {argType === 'string' && <Input addonBefore={t(argName)}/>}
              </Col>
            </Row>)}
        </Modal>
      }
    </div>;
  }

  render () {
    const {recordedActions, t} = this.props;

    const highlightedCode = this.code(false);

    return <Card title={<span><Icon type="code-o"/> {t('Recorder')}</span>}
      className={InspectorStyles['recorded-actions']}
      extra={this.actionBar()}
    >
      {!recordedActions.length &&
        <div className={InspectorStyles['no-recorded-actions']}>
          {t('Perform some actions to see code show up here')}
        </div>
      }
      {!!recordedActions.length &&
        <div
          className={InspectorStyles['recorded-code']}
          dangerouslySetInnerHTML={{__html: highlightedCode}} />
      }
    </Card>;
  }
}

export default withTranslation(RecordedActions);
