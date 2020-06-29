import Framework from './framework';

class PythonFramework extends Framework {

  get language () {
    return 'python';
  }

  getPythonVal (jsonVal) {
    if (typeof jsonVal === 'boolean') {
      return jsonVal ? 'True' : 'False';
    }
    return JSON.stringify(jsonVal);
  }

  wrapWithBoilerplate (code) {
    let capStr = Object.keys(this.caps).map((k) => {
      return `caps[${JSON.stringify(k)}] = ${this.getPythonVal(this.caps[k])}`;
    }).join('\n');
    return `# This sample code uses the Appium python client
# pip install Appium-Python-Client
# Then you can paste this into a file and simply run with Python

from appium import webdriver

caps = {}
${capStr}

driver = webdriver.Remote("${this.serverUrl}", caps)

${code}
driver.quit()`;
  }

  getSaveArr () {
    let str = {
      config: {},
      code: []
    };
    Object.keys(this.caps).forEach((k) => {
      str.config[k] = this.caps[k];
    });
    let isCir = false;
    let code = {};
    for (let {action, params} of this.actions) {
      let genCodeFn = `saveFor_${action}`;
      if (!this[genCodeFn]) {
        throw new Error(`Need to implement 'saveFor_${action}()'`);
      }
      if (action === 'createCirculated') {
        isCir = false;
        str.code.push(code);
        continue;
      }
      if (isCir) {
        code.code.push(this[genCodeFn](...params));
        continue;
      }
      code = this[genCodeFn](...params);
      if (action === 'createCirculate') {
        isCir = true;
        continue;
      }
      if (code) {
        str.code.push(code);
      }
    }
    return JSON.stringify(str);
  }

  codeFor_createCirculate () {
    return `start circulate`;
  }

  saveFor_createCirculate (value) {
    if (value && value !== 0) {
      return {
        methodName: 'for',
        value: [value],
        selIndex: -1,
        type: 0,
        code: []
      };
    } else {
      return {
        methodName: 'while',
        value: [],
        selIndex: -1,
        type: 0,
        code: []
      };
    }
  }

  codeFor_createCirculated () {
    return `stop circulate`;
  }

  saveFor_createCirculated () {
    return {
      methodName: 'stopCirculate',
      value: [],
      selIndex: -1,
      type: 0
    };
  }

  codeFor_createPrint (value) {
    return `print str(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))) + '   ' + '${value}'`;
  }

  saveFor_createPrint (value) {
    return {
      methodName: 'myPrint',
      value: [value],
      selIndex: -1,
      type: 0
    };
  }

  codeFor_createTimeSleep (value) {
    return `time.sleep(${value})`;
  }

  saveFor_createTimeSleep (value) {
    return {
      methodName: 'sleep',
      value: [value],
      selIndex: -1,
      type: 0
    };
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
      return `${localVar} = driver.find_elements_by_${suffixMap[strategy]}(${JSON.stringify(locator)})`;
    } else {
      return `${localVar} = driver.find_element_by_${suffixMap[strategy]}(${JSON.stringify(locator)})`;
    }
  }

  saveFor_findAndAssign (strategy, locator, localVar, isArray) {
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
      return {
        methodName: `find_elements_by_${suffixMap[strategy]}`,
        value: [locator],
        selIndex: -1,
        type: 1
      };
    } else {
      return {
        methodName: `find_element_by_${suffixMap[strategy]}`,
        value: [locator],
        selIndex: -1,
        type: 1
      };
    }
  }

  codeFor_click (varName, varIndex) {
    return `${this.getVarName(varName, varIndex)}.click()`;
  }

  saveFor_click (varName, varIndex) {
    return {
      methodName: `click`,
      value: [],
      selIndex: varIndex || varIndex === 0 ? varIndex : -1,
      type: 2
    };
  }

  codeFor_clear (varName, varIndex) {
    return `${this.getVarName(varName, varIndex)}.clear()`;
  }

  saveFor_clear (varName, varIndex) {
    return {
      methodName: `clear`,
      value: [],
      selIndex: varIndex || varIndex === 0 ? varIndex : -1,
      type: 2
    };
  }

  codeFor_sendKeys (varName, varIndex, text) {
    return `${this.getVarName(varName, varIndex)}.send_keys(${JSON.stringify(text)})`;
  }

  saveFor_sendKeys (varName, varIndex, text) {
    return {
      methodName: `send_keys`,
      value: [`${JSON.stringify(text)}`],
      selIndex: varIndex || varIndex === 0 ? varIndex : -1,
      type: 2
    };
  }

  codeFor_back () {
    return `driver.back()`;
  }

  saveFor_back () {
    return {
      methodName: `back`,
      value: [],
      selIndex: -1,
      type: 1
    };
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
    return `activity_name = driver.current_activity`;
  }

  saveFor_getCurrentActivity () {
    return {
      methodName: `current_activity`,
      value: [],
      selIndex: -1,
      type: 1
    };
  }

  codeFor_getCurrentPackage () {
    return `package_name = driver.current_package`;
  }

  saveFor_getCurrentPackage () {
    return {
      methodName: `current_package`,
      value: [],
      selIndex: -1,
      type: 1
    };
  }

  codeFor_installAppOnDevice (varNameIgnore, varIndexIgnore, app) {
    return `driver.install_app('${app}');`;
  }

  saveFor_installAppOnDevice (varNameIgnore, varIndexIgnore, app) {
    return {
      methodName: `install_app`,
      value: [`${app}`],
      selIndex: -1,
      type: 1
    };
  }

  codeFor_isAppInstalledOnDevice (varNameIgnore, varIndexIgnore, app) {
    return `is_app_installed = driver.is_app_installed("${app}");`;
  }

  saveFor_isAppInstalledOnDevice (varNameIgnore, varIndexIgnore, app) {
    return {
      methodName: `is_app_installed`,
      value: [`${app}`],
      selIndex: -1,
      type: 1
    };
  }

  codeFor_launchApp () {
    return `driver.launch_app()`;
  }

  saveFor_launchApp () {
    return {
      methodName: `launch_app`,
      value: [],
      selIndex: -1,
      type: 1
    };
  }

  codeFor_backgroundApp (varNameIgnore, varIndexIgnore, timeout) {
    return `driver.background_app(${timeout})`;
  }

  saveFor_backgroundApp (varNameIgnore, varIndexIgnore, timeout) {
    return {
      methodName: `launch_app`,
      value: [parseInt(timeout, 10)],
      selIndex: -1,
      type: 1
    };
  }

  codeFor_closeApp () {
    return `driver.close_app()`;
  }

  saveFor_closeApp () {
    return {
      methodName: `close_app`,
      value: [],
      selIndex: -1,
      type: 1
    };
  }

  codeFor_resetApp () {
    return `driver.reset()`;
  }

  saveFor_resetApp () {
    return {
      methodName: `reset`,
      value: [],
      selIndex: -1,
      type: 1
    };
  }

  codeFor_removeAppFromDevice (varNameIgnore, varIndexIgnore, app) {
    return `driver.remove_app('${app}');`;
  }

  saveFor_removeAppFromDevice (varNameIgnore, varIndexIgnore, app) {
    return {
      methodName: `remove_app`,
      value: [`${app}`],
      selIndex: -1,
      type: 1
    };
  }

  codeFor_getAppStrings (varNameIgnore, varIndexIgnore, language, stringFile) {
    return `appStrings = driver.app_strings(${language ? `${language}, ` : ''}${stringFile ? `"${stringFile}` : ''})`;
  }

  codeFor_getClipboard () {
    return `clipboard_text = driver.get_clipboard_text()`;
  }

  codeFor_setClipboard (varNameIgnore, varIndexIgnore, clipboardText) {
    return `driver.set_clipboard_text('${clipboardText}')`;
  }

  codeFor_pressKeycode (varNameIgnore, varIndexIgnore, keyCode) {
    return `driver.press_keycode(${keyCode});`;
  }

  saveFor_pressKeycode (varNameIgnore, varIndexIgnore, keyCode) {
    return {
      methodName: `press_keycode`,
      value: [keyCode],
      selIndex: -1,
      type: 1
    };
  }

  codeFor_longPressKeycode (varNameIgnore, varIndexIgnore, keyCode) {
    return `driver.long_press_keycode(${keyCode});`;
  }

  saveFor_longPressKeycode (varNameIgnore, varIndexIgnore, keyCode) {
    return {
      methodName: `long_press_keycode`,
      value: [keyCode],
      selIndex: -1,
      type: 1
    };
  }

  codeFor_hideDeviceKeyboard () {
    return `driver.hide_keyboard()`;
  }

  codeFor_isKeyboardShown () {
    return `# isKeyboardShown not supported`;
  }

  codeFor_pushFileToDevice (varNameIgnore, varIndexIgnore, pathToInstallTo, fileContentString) {
    return `driver.push_file('${pathToInstallTo}', '${fileContentString}');`;
  }

  codeFor_pullFile (varNameIgnore, varIndexIgnore, pathToPullFrom) {
    return `file_base64 = driver.pull_file('${pathToPullFrom}');`;
  }

  codeFor_pullFolder (varNameIgnore, varIndexIgnore, folderToPullFrom) {
    return `file_base64 = driver.pull_folder('${folderToPullFrom}');`;
  }

  codeFor_toggleAirplaneMode () {
    return `# Not supported: toggleAirplaneMode`;
  }

  codeFor_toggleData () {
    return `# Not supported: toggleData`;
  }

  codeFor_toggleWiFi () {
    return `# Not supported: toggleWifi`;
  }

  codeFor_toggleLocationServices () {
    return `driver.toggle_location_services();`;
  }

  codeFor_sendSMS () {
    return `# Not supported: sendSMS`;
  }

  codeFor_gsmCall () {
    return `# Not supported: gsmCall`;
  }

  codeFor_gsmSignal () {
    return `# Not supported: gsmSignal`;
  }

  codeFor_gsmVoice () {
    return `# Not supported: gsmVoice`;
  }

  codeFor_shake () {
    return `driver.shake();`;
  }

  codeFor_lock (varNameIgnore, varIndexIgnore, seconds) {
    return `driver.lock(${seconds});`;
  }

  codeFor_unlock () {
    return `driver.unlock();`;
  }

  codeFor_isLocked () {
    return `# Not supported: is device locked`;
  }

  codeFor_rotateDevice () {
    return `# Not supported: rotate device`;
  }

  codeFor_getPerformanceData () {
    return `# Not supported: getPerformanceData`;
  }

  codeFor_getSupportedPerformanceDataTypes () {
    return `# Not supported: getSupportedPerformanceDataTypes`;
  }

  codeFor_performTouchId (varNameIgnore, varIndexIgnore, match) {
    return `driver.touch_id(${match})`;
  }

  codeFor_toggleTouchIdEnrollment (varNameIgnore, varIndexIgnore, enroll) {
    return `driver.toggle_touch_id_enrollment(${enroll})`;
  }

  codeFor_openNotifications () {
    return `driver.open_notifications();`;
  }

  codeFor_getDeviceTime () {
    return `time = driver.device_time()`;
  }

  saveFor_getDeviceTime () {
    return {
      methodName: `device_time`,
      value: [],
      selIndex: -1,
      type: 1
    };
  }

  codeFor_fingerprint (varNameIgnore, varIndexIgnore, fingerprintId) {
    return `driver.finger_print(${fingerprintId})`;
  }

  codeFor_sessionCapabilities () {
    return `desired_caps = driver.desired_capabilities()`;
  }

  codeFor_setPageLoadTimeout (varNameIgnore, varIndexIgnore, ms) {
    return `driver.set_page_load_timeout(${ms})`;
  }

  codeFor_setAsyncScriptTimeout (varNameIgnore, varIndexIgnore, ms) {
    return `driver.timeouts('script', ${ms})`;
  }

  codeFor_setImplicitWaitTimeout (varNameIgnore, varIndexIgnore, ms) {
    return `driver.timeouts('implicit', ${ms})`;
  }

  codeFor_getOrientation () {
    return `orientation = driver.orientation()`;
  }

  codeFor_setOrientation (varNameIgnore, varIndexIgnore, orientation) {
    return `driver.orientation = "${orientation}"`;
  }

  codeFor_getGeoLocation () {
    return `location = driver.location()`;
  }

  codeFor_setGeoLocation (varNameIgnore, varIndexIgnore, latitude, longitude, altitude) {
    return `driver.set_location(${latitude}, ${longitude}, ${altitude})`;
  }

  codeFor_logTypes () {
    return `log_types = driver.log_types();`;
  }

  codeFor_log (varNameIgnore, varIndexIgnore, logType) {
    return `logs = driver.get_log('${logType}');`;
  }

  codeFor_updateSettings (varNameIgnore, varIndexIgnore, settingsJson) {
    return `driver.update_settings(${settingsJson}))`;
  }

  codeFor_settings () {
    return `settings = driver.get_settings`;
  }
}

PythonFramework.readableName = 'Python';

export default PythonFramework;
