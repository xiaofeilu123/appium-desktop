import Framework from './framework';

class CaseFramework extends Framework {

  get language () {
    return 'python';
  }

  getCaseVal (jsonVal) {
    if (typeof jsonVal === 'boolean') {
      return jsonVal ? 'True' : 'False';
    }
    return JSON.stringify(jsonVal);
  }

  wrapWithBoilerplate (code) {
    let desStr = Object.keys(this.desAction).map((k) => {
      return `CASE_NAME[${JSON.stringify(k)}] = ${this.getCaseVal(this.desAction[k])}`;
    }).join('\n');
    return `# coding = utf-8
# -*- coding:utf-8 -*-

import sys
import unittest
import time

from appium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from base.BaseTest import ParametrizedTestCase

defaultencoding = 'utf-8'
if sys.getdefaultencoding() != defaultencoding:
    reload(sys)
    sys.setdefaultencoding(defaultencoding)
    
CASE_NAME = {}
${desStr}


${code}
    @staticmethod
    def getSuite(param=None):
        suite = unittest.TestSuite()
        suite.addTest(ParametrizedTestCase.parametrize(LauncherTest, param))
        return suite

    @staticmethod
    def getCaseName(name):
        return CASE_NAME[name]

    @staticmethod
    def isHasChildCase(name):
        return False
`;
  }

  codeFor_findAndAssign (strategy, locator, localVar, isArray) {
    let suffixMap = {
      xpath: 'xpath',
      'accessibility id': 'accessibility_id',
      'id': 'id',
      'name': 'name', // TODO: How does Python use name selector
      'class name': 'class_name',
      '-android uiautomator': 'android_uiautomator',
      '-android datamatcher': 'android_datamatcher',
      '-ios predicate string': 'ios_predicate',
      '-ios class chain': 'ios_uiautomation', // TODO: Could not find iOS UIAutomation
    };
    if (!suffixMap[strategy]) {
      throw new Error(`Strategy ${strategy} can't be code-gened`);
    }
    if (isArray) {
      return `        ${localVar} = self.driver.find_elements_by_${suffixMap[strategy]}(${JSON.stringify(locator)})`;
    } else {
      return `        ${localVar} = self.driver.find_element_by_${suffixMap[strategy]}(${JSON.stringify(locator)})`;
    }
  }

  codeFor_createClass (className, classDes) {
    this.classAction.push(className);
    this.desAction[className] = classDes;
    let capStr = Object.keys(this.caps).map((k) => {
      return `caps[${JSON.stringify(k)}] = ${this.getCaseVal(this.caps[k])}`;
    }).join('\n');
    return `class ${className}(ParametrizedTestCase):
    def __init__(self, methodName='runTest', upKey={}, param=None):
        caps = {}
        ${capStr.split('\n').join('\n        ')}
        super(${className}, self).__init__(methodName, caps, param)
    
    def setUp(self):
        super(${className}, self).setUp()`;
  }

  codeFor_createMethod (methodName, methodDes) {
    if (!methodName.startsWith('test_')) {
      methodName = 'test_' + methodName;
    }
    this.methodAction.push(methodName);
    this.desAction[methodName] = methodDes;
    return `\n    def ${methodName}(self):`;
  }

  codeFor_createPrint (value) {
    return `        print str(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))) + '   ' + '${value}'`;
  }

  codeFor_click (varName, varIndex) {
    return `        ${this.getVarName(varName, varIndex)}.click()`;
  }

  codeFor_clear (varName, varIndex) {
    return `        ${this.getVarName(varName, varIndex)}.clear()`;
  }

  codeFor_sendKeys (varName, varIndex, text) {
    return `        ${this.getVarName(varName, varIndex)}.send_keys(${JSON.stringify(text)})`;
  }

  codeFor_back () {
    return `        self.driver.back()`;
  }

  codeFor_tap (varNameIgnore, varIndexIgnore, x, y) {
    return `TouchAction(driver).tap(x=${x}, y=${y}).perform()`;
  }

  codeFor_swipe (varNameIgnore, varIndexIgnore, x1, y1, x2, y2) {
    return `TouchAction(driver) \
  .press(x=${x1}, y=${y1}) \
  .move_to(x=${x2}, y=${y2}) \
  .release() \
  .perform()
    `;
  }

  codeFor_getCurrentActivity () {
    return `        activity_name = self.driver.current_activity`;
  }

  codeFor_getCurrentPackage () {
    return `        package_name = self.driver.current_package`;
  }

  codeFor_installAppOnDevice (varNameIgnore, varIndexIgnore, app) {
    return `        self.driver.install_app('${app}');`;
  }

  codeFor_isAppInstalledOnDevice (varNameIgnore, varIndexIgnore, app) {
    return `        is_app_installed = self.driver.is_app_installed("${app}");`;
  }

  codeFor_launchApp () {
    return `        self.driver.launch_app()`;
  }

  codeFor_backgroundApp (varNameIgnore, varIndexIgnore, timeout) {
    return `        self.driver.background_app(${timeout})`;
  }

  codeFor_closeApp () {
    return `        self.driver.close_app()`;
  }

  codeFor_resetApp () {
    return `        self.driver.reset()`;
  }

  codeFor_removeAppFromDevice (varNameIgnore, varIndexIgnore, app) {
    return `        self.driver.remove_app('${app}');`;
  }

  codeFor_getAppStrings (varNameIgnore, varIndexIgnore, language, stringFile) {
    return `        appStrings = self.driver.app_strings(${language ? `${language}, ` : ''}${stringFile ? `"${stringFile}` : ''})`;
  }

  codeFor_getClipboard () {
    return `        clipboard_text = self.driver.get_clipboard_text()`;
  }

  codeFor_setClipboard (varNameIgnore, varIndexIgnore, clipboardText) {
    return `        self.driver.set_clipboard_text('${clipboardText}')`;
  }

  codeFor_pressKeycode (varNameIgnore, varIndexIgnore, keyCode) {
    return `        self.driver.press_keycode(${keyCode})`;
  }

  codeFor_longPressKeycode (varNameIgnore, varIndexIgnore, keyCode) {
    return `        self.driver.long_press_keycode(${keyCode})`;
  }

  codeFor_hideDeviceKeyboard () {
    return `        self.driver.hide_keyboard()`;
  }

  codeFor_isKeyboardShown () {
    return `        # isKeyboardShown not supported`;
  }

  codeFor_pushFileToDevice (varNameIgnore, varIndexIgnore, pathToInstallTo, fileContentString) {
    return `        self.driver.push_file('${pathToInstallTo}', '${fileContentString}');`;
  }

  codeFor_pullFile (varNameIgnore, varIndexIgnore, pathToPullFrom) {
    return `        file_base64 = self.driver.pull_file('${pathToPullFrom}');`;
  }

  codeFor_pullFolder (varNameIgnore, varIndexIgnore, folderToPullFrom) {
    return `        file_base64 = self.driver.pull_folder('${folderToPullFrom}');`;
  }

  codeFor_toggleAirplaneMode () {
    return `        # Not supported: toggleAirplaneMode`;
  }

  codeFor_toggleData () {
    return `        # Not supported: toggleData`;
  }

  codeFor_toggleWiFi () {
    return `        # Not supported: toggleWifi`;
  }

  codeFor_toggleLocationServices () {
    return `        self.driver.toggle_location_services();`;
  }

  codeFor_sendSMS () {
    return `        # Not supported: sendSMS`;
  }

  codeFor_gsmCall () {
    return `        # Not supported: gsmCall`;
  }

  codeFor_gsmSignal () {
    return `        # Not supported: gsmSignal`;
  }

  codeFor_gsmVoice () {
    return `        # Not supported: gsmVoice`;
  }

  codeFor_shake () {
    return `        self.driver.shake();`;
  }

  codeFor_lock (varNameIgnore, varIndexIgnore, seconds) {
    return `        self.driver.lock(${seconds});`;
  }

  codeFor_unlock () {
    return `        self.driver.unlock();`;
  }

  codeFor_isLocked () {
    return `        # Not supported: is device locked`;
  }

  codeFor_rotateDevice () {
    return `        # Not supported: rotate device`;
  }

  codeFor_getPerformanceData () {
    return `        # Not supported: getPerformanceData`;
  }

  codeFor_getSupportedPerformanceDataTypes () {
    return `        # Not supported: getSupportedPerformanceDataTypes`;
  }

  codeFor_performTouchId (varNameIgnore, varIndexIgnore, match) {
    return `        self.driver.touch_id(${match})`;
  }

  codeFor_toggleTouchIdEnrollment (varNameIgnore, varIndexIgnore, enroll) {
    return `        self.driver.toggle_touch_id_enrollment(${enroll})`;
  }

  codeFor_openNotifications () {
    return `        self.driver.open_notifications();`;
  }

  codeFor_getDeviceTime () {
    return `        time = self.driver.device_time()`;
  }

  codeFor_fingerprint (varNameIgnore, varIndexIgnore, fingerprintId) {
    return `        self.driver.finger_print(${fingerprintId})`;
  }

  codeFor_sessionCapabilities () {
    return `        desired_caps = self.driver.desired_capabilities()`;
  }

  codeFor_setPageLoadTimeout (varNameIgnore, varIndexIgnore, ms) {
    return `        self.driver.set_page_load_timeout(${ms})`;
  }

  codeFor_setAsyncScriptTimeout (varNameIgnore, varIndexIgnore, ms) {
    return `        self.driver.timeouts('script', ${ms})`;
  }

  codeFor_setImplicitWaitTimeout (varNameIgnore, varIndexIgnore, ms) {
    return `        self.driver.timeouts('implicit', ${ms})`;
  }

  codeFor_getOrientation () {
    return `        orientation = self.driver.orientation()`;
  }

  codeFor_setOrientation (varNameIgnore, varIndexIgnore, orientation) {
    return `        self.driver.orientation = "${orientation}"`;
  }

  codeFor_getGeoLocation () {
    return `        location = self.driver.location()`;
  }

  codeFor_setGeoLocation (varNameIgnore, varIndexIgnore, latitude, longitude, altitude) {
    return `        self.driver.set_location(${latitude}, ${longitude}, ${altitude})`;
  }

  codeFor_logTypes () {
    return `        log_types = self.driver.log_types();`;
  }

  codeFor_log (varNameIgnore, varIndexIgnore, logType) {
    return `        logs = self.driver.get_log('${logType}');`;
  }

  codeFor_updateSettings (varNameIgnore, varIndexIgnore, settingsJson) {
    return `        self.driver.update_settings(${settingsJson}))`;
  }

  codeFor_settings () {
    return `        settings = self.driver.get_settings`;
  }
}

CaseFramework.readableName = 'Case';

export default CaseFramework;
