const xhrProto = window.XMLHttpRequest.prototype;

xhrProto.__open = xhrProto.open;
xhrProto.open = function (method, url, async, user, password) {
  if (url === "elm://") {
    this._elm_call = true;
    Object.defineProperty(this, "responseType", { writable: true });
    Object.defineProperty(this, "response", { writable: true });
    Object.defineProperty(this, "status", { writable: true });
  }
  return this.__open(method, url, async, user, password);
};

const noCallback = () => console.warn("No Callback set");
let callback = noCallback;

xhrProto.__send = xhrProto.send;
xhrProto.send = function (body) {
  if (this._elm_call) {
    callback(new Uint8Array(body.buffer));
    return;
  }
  return this.__send(body);
};

function receive() {
  return new Promise((resolve) => {
    callback = (bytes) => {
      resolve(bytes);
      callback = noCallback;
    };
    ports.httpTriggerSend.send(null);
  });
}

export default { receive };
