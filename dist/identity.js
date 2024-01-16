/**
 * Receive the bytes from Elm
 * @returns {Promise<Uint8Array>}
 */
async function receive() {
  return new Promise((resolve) => {
    function callback(val) {
      resolve(val);
      ports.identityToJS.unsubscribe(callback);
    }
    ports.identityToJS.subscribe(callback);
    ports.identityTriggerSend.send(null);
  });
}

/**
 * Send bytes to Elm and returns the length as a sanity check
 * @param {Uint8Array} bytes
 * @returns {Promise<number>}
 */
async function send(bytes) {
  return new Promise((resolve) => {
    function callback() {
      resolve(bytes.length);
      ports.receivedBytes.unsubscribe(callback);
    }
    ports.receivedBytes.subscribe(callback);
    ports.identityFromJS.send(bytes);
  });
}

export default { send, receive };
