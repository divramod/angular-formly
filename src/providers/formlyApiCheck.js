import angular from 'angular-fix';
import apiCheckFactory from 'api-check';

const apiCheck = apiCheckFactory({
  output: {
    prefix: 'angular-formly:',
    docsBaseUrl: require('../other/docsBaseUrl')
  }
});

function shapeRequiredIfNot(otherProps, propChecker) {
  if (!angular.isArray(otherProps)) {
    otherProps = [otherProps];
  }
  const type = `specified if these are not specified: \`${otherProps.join(', ')}\` (otherwise it's optional)`;

  function shapeRequiredIfNotDefinition(prop, propName, location, obj) {
    const propExists = obj && obj.hasOwnProperty(propName);
    const otherPropsExist = otherProps.some(function(otherProp) {
      return obj && obj.hasOwnProperty(otherProp);
    });
    if (!otherPropsExist && !propExists) {
      return apiCheck.utils.getError(propName, location, type);
    } else if (propExists) {
      return propChecker(prop, propName, location, obj);
    }
  }

  shapeRequiredIfNotDefinition.type = type;
  return apiCheck.utils.checkerHelpers.setupChecker(shapeRequiredIfNotDefinition);
}

// TODO in 7.0.0 .nullable is available on all checkers
function nullable(checker) {
  return apiCheck.oneOfType([
    apiCheck.oneOf([null]), checker
  ]);
}

const formlyExpression = apiCheck.oneOfType([apiCheck.string, apiCheck.func]);
const specifyWrapperType = nullable(apiCheck.typeOrArrayOf(apiCheck.string));

const apiCheckProperty = apiCheck.oneOfType([apiCheck.func, apiCheck.objectOf(apiCheck.func)]);

const apiCheckInstanceProperty = apiCheck.shape.onlyIf('apiCheck', apiCheck.func.withProperties({
  warn: apiCheck.func,
  throw: apiCheck.func,
  shape: apiCheck.func
}));

const apiCheckFunctionProperty = apiCheck.shape.onlyIf('apiCheck', apiCheck.oneOf(['throw', 'warn']));

const formlyWrapperType = apiCheck.shape({
  name: shapeRequiredIfNot('types', apiCheck.string).optional,
  template: apiCheck.shape.ifNot('templateUrl', apiCheck.string).optional,
  templateUrl: apiCheck.shape.ifNot('template', apiCheck.string).optional,
  types: apiCheck.typeOrArrayOf(apiCheck.string).optional,
  overwriteOk: apiCheck.bool.optional,
  validateOptions: apiCheck.func.optional,
  apiCheck: apiCheckProperty.optional,
  apiCheckInstance: apiCheckInstanceProperty.optional,
  apiCheckFunction: apiCheckFunctionProperty.optional,
  apiCheckOptions: apiCheck.object.optional
}).strict;

const expressionProperties = apiCheck.objectOf(apiCheck.oneOfType([
  formlyExpression,
  apiCheck.shape({
    expression: formlyExpression,
    message: formlyExpression.optional
  }).strict
]));

const modelChecker = apiCheck.oneOfType([apiCheck.string, apiCheck.object]);

const templateManipulators = nullable(apiCheck.shape({
  preWrapper: nullable(apiCheck.arrayOf(apiCheck.func)).optional,
  postWrapper: nullable(apiCheck.arrayOf(apiCheck.func)).optional
}).strict);

const validatorChecker = apiCheck.objectOf(apiCheck.oneOfType([
  formlyExpression, apiCheck.shape({
    expression: formlyExpression,
    message: formlyExpression.optional
  }).strict
]));

const fieldOptionsApiShape = {
  $$hashKey: apiCheck.any.optional,
  type: apiCheck.shape.ifNot(['template', 'templateUrl'], apiCheck.string).optional,
  template: apiCheck.shape.ifNot(
    ['type', 'templateUrl'],
    apiCheck.oneOfType([apiCheck.string, apiCheck.func])
  ).optional,
  templateUrl: apiCheck.shape.ifNot(
    ['type', 'template'],
    apiCheck.oneOfType([apiCheck.string, apiCheck.func])
  ).optional,
  key: apiCheck.oneOfType([apiCheck.string, apiCheck.number]).optional,
  model: modelChecker.optional,
  className: apiCheck.string.optional,
  id: apiCheck.string.optional,
  name: apiCheck.string.optional,
  expressionProperties: expressionProperties.optional,
  extras: apiCheck.shape({
    validateOnModelChange: apiCheck.bool.optional,
    skipNgModelAttrsManipulator: apiCheck.oneOfType([
      apiCheck.string, apiCheck.bool
    ]).optional
  }).strict.optional,
  data: apiCheck.object.optional,
  templateOptions: apiCheck.object.optional,
  wrapper: specifyWrapperType.optional,
  modelOptions: apiCheck.shape({
    updateOn: apiCheck.string.optional,
    debounce: apiCheck.oneOfType([
      apiCheck.objectOf(apiCheck.number), apiCheck.number
    ]).optional,
    allowInvalid: apiCheck.bool.optional,
    getterSetter: apiCheck.bool.optional,
    timezone: apiCheck.string.optional
  }).optional,
  watcher: apiCheck.typeOrArrayOf(
    apiCheck.shape({
      expression: formlyExpression.optional,
      listener: formlyExpression
    })
  ).optional,
  validators: validatorChecker.optional,
  asyncValidators: validatorChecker.optional,
  parsers: apiCheck.arrayOf(formlyExpression).optional,
  formatters: apiCheck.arrayOf(formlyExpression).optional,
  noFormControl: apiCheck.bool.optional,
  hide: apiCheck.bool.optional,
  hideExpression: formlyExpression.optional,
  ngModelAttrs: apiCheck.objectOf(apiCheck.shape({
    expression: apiCheck.shape.ifNot(['value', 'attribute', 'bound'], apiCheck.any).optional,
    value: apiCheck.shape.ifNot('expression', apiCheck.any).optional,
    attribute: apiCheck.shape.ifNot('expression', apiCheck.any).optional,
    bound: apiCheck.shape.ifNot('expression', apiCheck.any).optional
  }).strict).optional,
  elementAttributes: apiCheck.objectOf(apiCheck.string).optional,
  optionsTypes: apiCheck.typeOrArrayOf(apiCheck.string).optional,
  link: apiCheck.func.optional,
  controller: apiCheck.oneOfType([
    apiCheck.string, apiCheck.func, apiCheck.array
  ]).optional,
  validation: apiCheck.shape({
    show: nullable(apiCheck.bool).optional,
    messages: apiCheck.objectOf(formlyExpression).optional,
    errorExistsAndShouldBeVisible: apiCheck.bool.optional
  }).optional,
  formControl: apiCheck.typeOrArrayOf(apiCheck.object).optional,
  value: apiCheck.func.optional,
  runExpressions: apiCheck.func.optional,
  templateManipulators: templateManipulators.optional,
  resetModel: apiCheck.func.optional,
  updateInitialValue: apiCheck.func.optional,
  initialValue: apiCheck.any.optional,
  defaultValue: apiCheck.any.optional
};


const formlyFieldOptions = apiCheck.shape(fieldOptionsApiShape).strict;


const formOptionsApi = apiCheck.shape({
  formState: apiCheck.object.optional,
  resetModel: apiCheck.func.optional,
  updateInitialValue: apiCheck.func.optional,
  removeChromeAutoComplete: apiCheck.bool.optional,
  templateManipulators: templateManipulators.optional,
  wrapper: specifyWrapperType.optional,
  fieldTransform: apiCheck.func.optional,
  data: apiCheck.object.optional
}).strict;


const fieldGroup = apiCheck.shape({
  $$hashKey: apiCheck.any.optional,
  key: apiCheck.oneOfType([apiCheck.string, apiCheck.number]).optional,
  // danger. Nested field groups wont get api-checked...
  fieldGroup: apiCheck.arrayOf(apiCheck.oneOfType([formlyFieldOptions, apiCheck.object])),
  className: apiCheck.string.optional,
  options: formOptionsApi.optional,
  hide: apiCheck.bool.optional,
  hideExpression: formlyExpression.optional,
  data: apiCheck.object.optional,
  model: modelChecker.optional,
  form: apiCheck.object.optional,
  elementAttributes: apiCheck.objectOf(apiCheck.string).optional
}).strict;

const typeOptionsDefaultOptions = angular.copy(fieldOptionsApiShape);
typeOptionsDefaultOptions.key = apiCheck.string.optional;

const formlyTypeOptions = apiCheck.shape({
  name: apiCheck.string,
  template: apiCheck.shape.ifNot('templateUrl', apiCheck.oneOfType([apiCheck.string, apiCheck.func])).optional,
  templateUrl: apiCheck.shape.ifNot('template', apiCheck.oneOfType([apiCheck.string, apiCheck.func])).optional,
  controller: apiCheck.oneOfType([
    apiCheck.func, apiCheck.string, apiCheck.array
  ]).optional,
  link: apiCheck.func.optional,
  defaultOptions: apiCheck.oneOfType([
    apiCheck.func, apiCheck.shape(typeOptionsDefaultOptions)
  ]).optional,
  extends: apiCheck.string.optional,
  wrapper: specifyWrapperType.optional,
  data: apiCheck.object.optional,
  validateOptions: apiCheck.func.optional,
  apiCheck: apiCheckProperty.optional,
  apiCheckInstance: apiCheckInstanceProperty.optional,
  apiCheckFunction: apiCheckFunctionProperty.optional,
  apiCheckOptions: apiCheck.object.optional,
  overwriteOk: apiCheck.bool.optional
}).strict;

angular.extend(apiCheck, {
  formlyTypeOptions, formlyFieldOptions, formlyExpression, formlyWrapperType, fieldGroup, formOptionsApi
});

export default apiCheck;
