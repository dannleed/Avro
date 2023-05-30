const { dependencies } = require('./appDependencies');
const { GENERAL_ATTRIBUTES } = require('./constants');

let _;

const META_PROPERTIES = ['avro.java.string', 'java-element', 'java-element-class', 'java-class', 'java-key-class'];
const NAMED_TYPES = ['record', 'fixed', 'enum'];
const TYPE_SPECIFIC_ATTRIBUTES = {
	enum: ['name', 'aliases', 'namespace', 'symbols', 'symbolDefault'],
	array: ['items'],
	map: ['values'],
	record: ['name', 'aliases', 'namespace', 'fields'],
	fixed: ['name', 'aliases', 'namespace', 'size', 'logicalType'],
	string: ['logicalType'],
	bytes: ['logicalType'],
	int: ['logicalType'],
	long: ['logicalType'],
};
const DECIMAL_ATTRIBUTES = ['precision', 'scale'];

const LOGICAL_TYPES_MAP = {
	bytes: ['decimal'],
	int: [
		'date',
		'time-millis'
	],
	long: [
		'time-micros',
		'timestamp-millis',
		'timestamp-micros',
		'local-timestamp-millis',
		'local-timestamp-micros',
	],
	fixed: ['decimal', 'duration'],
	string: ['uuid'],
};

let fieldLevelConfig;
const setFieldLevelConfig = config => fieldLevelConfig = config;

const getCustomAttributes = (type, attributes) => {
	const typeConfig = fieldLevelConfig?.structure?.[type] || [];

	return typeConfig
		.filter(property => {
			if (!property.isTargetProperty) {
				return false;
			}

			if (!property.dependency) {
				return true;
			}

			return attributes[property.dependency.key] === property.dependency.value;
		})
		.map(property => property.fieldKeyword);
};

const isNamedType = type => NAMED_TYPES.includes(type);

const filterAttributes = type => attributes => {
	_ = dependencies.lodash;

	if (!LOGICAL_TYPES_MAP[attributes.type]?.includes(attributes.logicalType)) {
		attributes = _.omit(attributes, 'logicalType');
	}

	return _.pick(attributes, [
		...(TYPE_SPECIFIC_ATTRIBUTES[type] || []),
		...GENERAL_ATTRIBUTES,
		...getLogicalTypeAttributes(type, attributes.logicalType),
		...META_PROPERTIES,
		...getCustomAttributes(type, attributes),
	]);
};

const getLogicalTypeAttributes = (type, logicalType) => ['bytes', 'fixed'].includes(type) && logicalType === 'decimal' ? DECIMAL_ATTRIBUTES : [];

const isMetaProperty = key => META_PROPERTIES.includes(key);

module.exports = {
	isNamedType,
	filterAttributes,
	isMetaProperty,
	setFieldLevelConfig,
};