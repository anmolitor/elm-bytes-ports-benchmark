/**
 * This approach sends Bytes over a port to the Elm application
 * by converting it to an array of numbers as an intermediate representation.
 */

/**
 * Receive the bytes from Elm
 * @returns {Promise<Uint8Array>}
 */
async function receive() {
  return new Promise((resolve) => {
    function callback(arr) {
      resolve(arrToBytes(arr));
      ports.intArrayToJS.unsubscribe(callback);
    }
    ports.intArrayToJS.subscribe(callback);
    ports.intArrayTriggerSend.send(null);
  });
}

/**
 * Send bytes to Elm and returns the length as a sanity check
 * @param {Uint8Array} bytes
 * @returns {Promise<number>}
 */
async function send(bytes) {
  return new Promise((resolve) => {
    function callback(bytesLength) {
      resolve(bytesLength);
      ports.receivedBytes.unsubscribe(callback);
    }
    ports.receivedBytes.subscribe(callback);
    ports.intArrayFromJS.send(bytesToArr(bytes));
  });
}

/**
 * Convert array of (hopefully unsigned 8-bit) numbers to Uint8Array
 * @param {number[]} arr
 * @returns {Uint8Array}
 */
function arrToBytes(arr) {
  const bytes = new Uint8Array(new ArrayBuffer(arr.length));
  for (var i = 0; i < bytes.length; i++) {
    bytes[i] = arr[i];
  }
  return bytes;
}

/**
 * Convert Uint8Array to array of unsigned 8-bit numbers
 * @param {Uint8Array} bytes
 * @returns {number[]}
 */
function bytesToArr(bytes) {
  const arr = new Array(bytes.length);
  for (var i = 0; i < bytes.length; i++) {
    arr[i] = bytes[i];
  }
  return arr;
}

export default { send, receive };
