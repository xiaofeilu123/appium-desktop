import JsWdFramework from './js-wd';
import JsWdIoFramework from './js-wdio';
import JavaFramework from './java';
import PythonFramework from './python';
import CaseFramework from './case';
import RubyFramework from './ruby';
import RobotFramework from './robot';

const frameworks = {
  jsWd: JsWdFramework,
  jsWdIo: JsWdIoFramework,
  java: JavaFramework,
  python: PythonFramework,
  Case: CaseFramework,
  ruby: RubyFramework,
  robot: RobotFramework,
};

export default frameworks;
