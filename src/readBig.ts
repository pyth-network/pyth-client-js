// https://github.com/nodejs/node/blob/v14.17.0/lib/internal/errors.js#L758
const ERR_BUFFER_OUT_OF_BOUNDS = () => new Error('Attempt to access memory outside buffer bounds')

// https://github.com/nodejs/node/blob/v14.17.0/lib/internal/errors.js#L968
const ERR_INVALID_ARG_TYPE = (name: string, expected: string, actual: any) =>
  new Error(`The "${name}" argument must be of type ${expected}. Received ${actual}`)

// https://github.com/nodejs/node/blob/v14.17.0/lib/internal/errors.js#L1262
const ERR_OUT_OF_RANGE = (str: string, range: string, received: number) =>
  new Error(`The value of "${str} is out of range. It must be ${range}. Received ${received}`)

// https://github.com/nodejs/node/blob/v14.17.0/lib/internal/validators.js#L127-L130
function validateNumber(value: any, name: string) {
  if (typeof value !== 'number') throw ERR_INVALID_ARG_TYPE(name, 'number', value)
}

// https://github.com/nodejs/node/blob/v14.17.0/lib/internal/buffer.js#L68-L80
function boundsError(value: number, length: number) {
  if (Math.floor(value) !== value) {
    validateNumber(value, 'offset')
    throw ERR_OUT_OF_RANGE('offset', 'an integer', value)
  }

  if (length < 0) throw ERR_BUFFER_OUT_OF_BOUNDS()

  throw ERR_OUT_OF_RANGE('offset', `>= 0 and <= ${length}`, value)
}

// This function works with react-native >= 0.66.1
export function readBigInt64LE(buffer: Buffer, offset = 0): bigint {
  return BigInt(buffer.readIntLE(offset, 8))
}

// This function works with react-native >= 0.66.1
export function readBigUInt64LE(buffer: Buffer, offset = 0): bigint {
  return BigInt(buffer.readUIntLE(offset, 8))
}
