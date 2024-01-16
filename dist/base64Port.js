/**
 * This approach sends Bytes over a port to the Elm application
 * by converting it to a base64 string as an intermediate representation.
 */

/**
 * Receive the bytes from Elm
 * @returns {Promise<Uint8Array>}
 */
async function receive() {
  return new Promise((resolve) => {
    function callback(arr) {
      resolve(stringToBytes(arr));
      ports.base64ToJS.unsubscribe(callback);
    }
    ports.base64ToJS.subscribe(callback);
    ports.base64TriggerSend.send(null);
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
    ports.base64FromJS.send(bytesToString(bytes));
  });
}

/**
 * Convert string (in base64 format) to bytes
 * @param {string} str
 * @returns {Uint8Array}
 */
function stringToBytes(str) {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (var i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Convert Uint8Array to base64 string
 * @param {Uint8Array} bytes
 * @returns {number[]}
 */
function bytesToString(bytes) {
  let binaryString = "";
  bytes.forEach((byte) => {
    binaryString += String.fromCharCode(byte);
  });

  return btoa(binaryString);
}

export default { send, receive };
