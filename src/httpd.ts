import { OPERATION_SECURITY_SPEC } from '@loopback/authentication-jwt';
import {
  getModelSchemaRef,
  ISpecificationExtension,
  JsonSchemaOptions,
  ReferenceObject,
  SchemaObject,
} from '@loopback/rest';
import _ = require('lodash');

function _generateProperties(properties: { [key: string]: any }) {
  const propertyKeys = Object.keys(properties);
  const outProperties: { [key: string]: any } = {};

  for (const key of propertyKeys) {
    const value = properties[key];
    if (typeof value === 'string') {
      if (
        [
          'nullable',
          'discriminator',
          'readOnly',
          'writeOnly',
          'xml',
          'externalDocs',
          'example',
          'examples',
          'deprecated',
          'type',
          'format',
          'allOf',
          'oneOf',
          'anyOf',
          'not',
          'items',
          'properties',
          'additionalProperties',
          'description',
          'default',
          'title',
          'multipleOf',
          'maximum',
          'exclusiveMaximum',
          'minimum',
          'exclusiveMinimum',
          'maxLength',
          'maxLength',
          'pattern',
          'maxItems',
          'minItems',
          'uniqueItems',
          'maxProperties',
          'minProperties',
          'required',
          'enum',
          '$ref',
        ].includes(key)
      ) {
        outProperties[key] = value;
      } else {
        outProperties[key] = {
          type: value,
        };
      }
    } else if (Array.isArray(value) || typeof value !== 'object') {
      outProperties[key] = value;
    } else {
      outProperties[key] = _generateProperties(value);
    }
  }

  return outProperties;
}

/**
 * generate request schema
 *
 * @export
 * @param {{ [key: string]: any }} properties
 * @param {string} [description='']
 * @return {*}
 * @deprecated use HTTPD.generate
 */
export function generateRequest(
  properties: { [key: string]: any },
  description: string = ''
) {
  const schema: SchemaObject = {
    type: 'object',
    properties: _generateProperties(properties),
  };

  return {
    description: description ?? '',
    required: true,
    content: {
      'application/json': {
        schema,
      },
    },
  };
}

/**
 * generate request schema with array as top-level object
 *
 * @export
 * @param {{ [key: string]: any }} properties
 * @param {string} [description='']
 * @return {*}
 * @deprecated use HTTPD.generate
 */
export function generateArrayRequest(
  properties: { [key: string]: any },
  description: string = ''
) {
  const schema: SchemaObject = {
    type: 'array',
    items: {
      type: 'object',
      properties: _generateProperties(properties),
    },
  };

  return {
    description: description ?? '',
    required: true,
    content: {
      'application/json': {
        schema,
      },
    },
  };
}

/**
 * generate a schema for a simple array request
 *
 * @export
 * @param {('string' | 'number' | 'boolean' | 'integer' | null)} itemsType
 * @param {string} [description='']
 * @return {*}
 * @deprecated use HTTPD.generate
 */
export function generateSimpleArrayRequest(
  itemsType: 'string' | 'number' | 'boolean' | 'integer' | null,
  description: string = ''
) {
  const schema: SchemaObject = {
    type: 'array',
    items: {
      type: itemsType ?? 'string',
    },
  };

  return {
    description: description ?? '',
    required: true,
    content: {
      'application/json': {
        schema,
      },
    },
  };
}

/**
 * generate request schema from model
 *
 * @export
 * @param {Function} model
 * @param {string} [description='']
 * @param {{
 *     relations?: boolean;
 *     partial?: boolean;
 *     exclude?: Array<string>;
 *     optional?: Array<string>;
 *     pick?: Array<string>;
 *   }} [options={
 *     relations: false,
 *     partial: false,
 *     exclude: [],
 *     optional: [],
 *     pick: [],
 *   }]
 * @return {*}
 * @deprecated use HTTPD.generate
 */
export function generateRequestFromModel(
  model: Function,
  description: string = '',
  options: {
    relations?: boolean;
    partial?: boolean;
    exclude?: Array<string>;
    optional?: Array<string>;
    pick?: Array<string>;
  } = {
    relations: false,
    partial: false,
    exclude: [],
    optional: [],
    pick: [],
  }
) {
  const modelProperties = Object.keys(
    (model as { [key: string]: any })?.definition?.properties ?? {}
  );
  return {
    description: description ?? '',
    required: true,
    content: {
      'application/json': {
        schema: getModelSchemaRef(model, {
          exclude:
            options.pick && options.pick.length > 0
              ? modelProperties.filter(
                  (v) => options.pick?.indexOf(v) === -1
                ) ?? []
              : options.exclude ?? [],
          optional: options.optional ?? [],
          includeRelations: options.relations ?? false,
          partial: options.partial ?? false,
        }),
      },
    },
  };
}

/**
 * generate response schema
 *
 * @export
 * @param {{ [key: string]: any }} properties
 * @param {string} [description='']
 * @return {*}
 * @deprecated use HTTPD.generate
 */
export function generateResponse(
  properties: { [key: string]: any },
  description: string = ''
) {
  const schema: SchemaObject = {
    type: 'object',
    properties: _generateProperties(properties),
  };

  return {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description,
        content: {
          'application/json': { schema },
        },
      },
    },
  };
}

/**
 * generate response schema with array as top-level object
 *
 * @export
 * @param {{ [key: string]: any }} properties
 * @param {string} [description='']
 * @return {*}
 * @deprecated use HTTPD.generate
 */
export function generateArrayResponse(
  properties: { [key: string]: any },
  description: string = ''
) {
  const schema: SchemaObject = {
    type: 'array',
    items: {
      type: 'object',
      properties: _generateProperties(properties),
    },
  };

  return {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description,
        content: {
          'application/json': { schema },
        },
      },
    },
  };
}

/**
 * generate simple array response
 *
 * @export
 * @param {('string' | 'number' | 'boolean' | 'integer' | null)} itemsType
 * @param {string} [description='']
 * @return {*}
 * @deprecated use HTTPD.generate
 */
export function generateSimpleArrayResponse(
  itemsType: 'string' | 'number' | 'boolean' | 'integer' | null,
  description: string = ''
) {
  const schema: SchemaObject = {
    type: 'array',
    items: {
      type: itemsType ?? 'string',
    },
  };

  return {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description,
        content: {
          'application/json': { schema },
        },
      },
    },
  };
}

/**
 * generate response schema from model
 *
 * @export
 * @param {Function} model
 * @param {string} [description='']
 * @param {{
 *     relations?: boolean;
 *     partial?: boolean;
 *     exclude?: Array<string>;
 *     optional?: Array<string>;
 *     pick?: Array<string>;
 *   }} [options={
 *     relations: false,
 *     partial: false,
 *     exclude: [],
 *     optional: [],
 *     pick: [],
 *   }]
 * @return {*}
 * @deprecated use HTTPD.generate
 */
export function generateResponseFromModel(
  model: Function,
  description: string = '',
  options: {
    relations?: boolean;
    partial?: boolean;
    exclude?: Array<string>;
    optional?: Array<string>;
    pick?: Array<string>;
  } = {
    relations: false,
    partial: false,
    exclude: [],
    optional: [],
    pick: [],
  }
) {
  const modelProperties = Object.keys(
    (model as { [key: string]: any })?.definition?.properties ?? {}
  );
  return {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description,
        content: {
          'application/json': {
            schema: getModelSchemaRef(model, {
              exclude:
                options.pick && options.pick.length > 0
                  ? modelProperties.filter(
                      (v) => options.pick?.indexOf(v) === -1
                    ) ?? []
                  : options.exclude ?? [],
              optional: options.optional ?? [],
              includeRelations: options.relations ?? false,
              partial: options.partial ?? false,
            }),
          },
        },
      },
    },
  };
}

/**
 * generate response array schema from model
 *
 * @export
 * @param {Function} model
 * @param {string} [description='']
 * @param {{
 *     relations?: boolean;
 *     partial?: boolean;
 *     exclude?: Array<string>;
 *     optional?: Array<string>;
 *     pick?: Array<string>;
 *   }} [options={
 *     relations: false,
 *     partial: false,
 *     exclude: [],
 *     optional: [],
 *     pick: [],
 *   }]
 * @return {*}
 * @deprecated use HTTPD.generate
 */
export function generateArrayResponseFromModel(
  model: Function,
  description: string = '',
  options: {
    relations?: boolean;
    partial?: boolean;
    exclude?: Array<string>;
    optional?: Array<string>;
    pick?: Array<string>;
  } = {
    relations: false,
    partial: false,
    exclude: [],
    optional: [],
    pick: [],
  }
) {
  const modelProperties = Object.keys(
    (model as { [key: string]: any })?.definition?.properties ?? {}
  );
  const schema: SchemaObject = {
    type: 'array',
    items: getModelSchemaRef(model, {
      exclude:
        options.pick && options.pick.length > 0
          ? modelProperties.filter((v) => options.pick?.indexOf(v) === -1) ?? []
          : options.exclude ?? [],
      optional: options.optional ?? [],
      includeRelations: options.relations ?? false,
      partial: options.partial ?? false,
    }),
  };

  return {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description,
        content: {
          'application/json': { schema },
        },
      },
    },
  };
}

/**
 * empty response
 *
 * @export
 * @param {string} [description='empty response']
 * @return {*}
 * @deprecated use HTTPD.generate
 */
export function emptyResponse(description: string = 'empty response') {
  return {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: description,
      },
    },
  };
}

export namespace HTTPD {
  const DEFAULT_SCHEMA_VALUES = [
    'nullable',
    'discriminator',
    'readOnly',
    'writeOnly',
    'xml',
    'externalDocs',
    'example',
    'examples',
    'deprecated',
    'type',
    'format',
    'allOf',
    'oneOf',
    'anyOf',
    'not',
    'items',
    'properties',
    'additionalProperties',
    'description',
    'default',
    'title',
    'multipleOf',
    'maximum',
    'exclusiveMaximum',
    'minimum',
    'exclusiveMinimum',
    'maxLength',
    'maxLength',
    'pattern',
    'maxItems',
    'minItems',
    'uniqueItems',
    'maxProperties',
    'minProperties',
    'required',
    'enum',
    '$ref',
  ];
  export interface HTTPDSourceInner {
    [propertyName: string]: SchemaObject | ReferenceObject;
  }
  export interface HTTPDSource {
    [key: string]: string | Function | SchemaObject | undefined;
  }
  export interface HTTPDOverwriteObject {
    [key: string]: Function | SchemaObject | undefined;
  }
  export type CustomSchemaObject =
    | (SchemaObject & { [key: string]: any })
    | ReferenceObject;

  function _generate(properties: { [key: string]: any }, topLevel = true) {
    // auto fix passed properties to be a valid SchemaObject
    if (topLevel && !properties.hasOwnProperty('properties')) {
      return _generate({ type: 'object', properties }, false);
    }

    const propertyKeys = Object.keys(properties);
    const outProperties: { [key: string]: any } = {};

    for (const key of propertyKeys) {
      const value = properties[key];
      if (typeof value === 'string') {
        if (DEFAULT_SCHEMA_VALUES.includes(key)) {
          // check if is default type or a custom type field
          // set accordingly
          if (
            _.difference(Object.keys(outProperties), DEFAULT_SCHEMA_VALUES)
              .length > 0
          ) {
            outProperties[key] = {
              type: value,
            };
          } else {
            outProperties[key] = value;
          }
        } else {
          outProperties[key] = {
            type: value,
          };
        }
      } else if (Array.isArray(value) || typeof value !== 'object') {
        outProperties[key] = value;
      } else {
        outProperties[key] = _generate(value, false);
      }
    }

    return outProperties;
  }

  export function readModel(
    model: Function,
    options: JsonSchemaOptions<any> = {}
  ): SchemaObject {
    const defs = getModelSchemaRef(model, options).definitions;
    return defs[Object.keys(defs)[0]];
  }

  export function generate(
    source: { [key: string]: any } | Function,
    description: string = '',
    options: {
      array?: boolean;
      partial?: boolean;
      overwriteRequired?: boolean;
      exclude?: string[];
      optional?: string[];
      pick?: string[];
      overwrite?: HTTPDOverwriteObject;
      overwriteArray?: HTTPDOverwriteObject;
      required?: string[];
    } = {}
  ): ISpecificationExtension {
    options = Object.assign(
      {
        array: false,
        partial: false,
        overwriteRequired: false,
        exclude: [],
        optional: [],
        pick: [],
        overwrite: {},
        overwriteArray: {},
        required: [],
      },
      options
    );
    let schema: SchemaObject = {
      type: 'object',
      properties: {},
    };
    if (source instanceof Function) {
      const data = readModel(
        source,
        _.pick(options, [
          'exclude',
          'partial',
          'visited',
          'title',
          'includeRelations',
          'optional',
        ])
      );
      if (data) {
        schema = data;
      } else {
        schema = {
          type: 'array',
          properties: {},
        };
      }
    } else {
      schema = _generate(source);
    }

    if (options.exclude && options.exclude.length > 0) {
      for (const key in schema.properties) {
        if (options.exclude.indexOf(key) !== -1) {
          delete schema.properties[key];
        }
      }
    } else if (options.pick && options.pick.length > 0) {
      for (const key in schema.properties) {
        if (options.pick.indexOf(key) === -1) {
          delete schema.properties[key];
        }
      }
    }

    if (options.optional && options.optional.length > 0) {
      for (const key in schema.properties) {
        if (options.optional.indexOf(key) !== -1) {
          (schema.properties[key] as any).required = false;
        }
      }
    }

    if (schema.properties) {
      if (options.overwrite && Object.keys(options.overwrite).length > 0) {
        for (const key in options.overwrite) {
          if (options.overwrite[key] instanceof Function) {
            schema.properties[key] = _.omit(
              readModel(
                options.overwrite[key] as Function,
                _.pick(options, [
                  'exclude',
                  'partial',
                  'visited',
                  'title',
                  'includeRelations',
                  'optional',
                ])
              ),
              ['x-typescript-type']
            );
          } else {
            schema.properties[key] = _.omit(
              _generate(options.overwrite[key] as HTTPDSourceInner),
              ['x-typescript-type']
            );
          }
        }
      }

      if (
        options.overwriteArray &&
        Object.keys(options.overwriteArray).length > 0
      ) {
        for (const key in options.overwriteArray) {
          if (options.overwriteArray[key] instanceof Function) {
            schema.properties[key] = {
              type: 'array',
              items: _.omit(
                readModel(
                  options.overwriteArray[key] as Function,
                  _.pick(options, [
                    'exclude',
                    'partial',
                    'visited',
                    'title',
                    'includeRelations',
                    'optional',
                  ])
                ),
                ['x-typescript-type']
              ),
            };
          } else {
            schema.properties[key] = {
              type: 'array',
              items: _.omit(
                _generate(options.overwriteArray[key] as HTTPDSourceInner),
                ['x-typescript-type']
              ),
            };
          }
        }
      }
    }

    if (options.required) {
      if (schema.required && !options.overwriteRequired) {
        schema.required = schema.required.concat(options.required);
      } else {
        schema.required = options.required;
      }
    }

    if (schema.required) {
      description = `${description} (required: ${schema.required.join(', ')})`;
    }

    return {
      description,
      content: {
        'application/json': {
          schema: options.array ? { type: 'array', items: schema } : schema,
        },
      },
    };
  }

  export namespace TEMPLATES {
    export const LOGIN = {
      email: {
        type: 'string',
        format: 'email',
      },
      password: 'string',
      remember: 'boolean',
    };
    export const TOKEN = {
      email: {
        type: 'string',
        format: 'email',
      },
      userId: 'string',
      token: 'string',
      expiresIn: 'number',
      type: 'string',
      refresh: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
          },
          expiresIn: {
            type: 'number',
          },
        },
      },
    };
    export const SUCCESS = {
      success: 'boolean',
    };
    export const VALID = {
      valid: 'boolean',
    };
    export const COUNT = {
      count: 'number',
    };
    export const EXISTS = {
      exists: 'boolean',
    };
  }
}
