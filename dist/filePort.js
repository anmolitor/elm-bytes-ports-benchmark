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
    ports.fileFromJS.send(new File([bytes], ""));
  });
}

export default { send };
