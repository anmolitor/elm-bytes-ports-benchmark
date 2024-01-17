const xhrProto = window.XMLHttpRequest.prototype;

let regex = /^elm:\/\/(.+)$/;
const registeredFunctions = {};

xhrProto.__open = xhrProto.open;
xhrProto.open = function (method, url, async, user, password) {
  const matches = url && url.match(regex);
  if (matches) {
    const funName = matches[1];
    xhrProto._elm_fun = funName;
    Object.defineProperty(this, "responseType", { writable: true });
    Object.defineProperty(this, "response", { writable: true });
    Object.defineProperty(this, "status", { writable: true });
  }
  return this.__open(method, url, async, user, password);
};

xhrProto.__send = xhrProto.send;
xhrProto.send = async function (body) {
  if (this._elm_fun) {
    const response = await registeredFunctions[this._elm_fun](body);
    this.status = 200;
    this.responseType = "arraybuffer";
    this.response = response;

    this.dispatchEvent(new ProgressEvent("load"));
    return;
  }
  return this.__send(body);
};

function receive() {
  return new Promise((resolve) => {
    registeredFunctions.post = (dataView) => {
      resolve(new Uint8Array(dataView.buffer));
      registeredFunctions.post = undefined;
      return new ArrayBuffer();
    };
    ports.httpTriggerSend.send(null);
  });
}

function send(bytes) {
  return new Promise((resolve) => {
    registeredFunctions.get = () => {
      registeredFunctions.post = undefined;
      return bytes.buffer;
    };
    function callback(bytesLength) {
      resolve(bytesLength);
      ports.receivedBytes.unsubscribe(callback);
    }
    ports.receivedBytes.subscribe(callback);
    ports.httpTriggerGet.send(null);
  });
}

export default { receive, send };
