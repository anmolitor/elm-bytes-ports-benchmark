import base64Port from "./base64Port.js";
import filePort from "./filePort.js";
import "./httpTask.js";
import httpTask from "./httpTask.js";
import identity from "./identity.js";
import intArray from "./intArrayPort.js";

const senders = [
  ["intArray", intArray.send, "rgb(255, 0, 0)"],
  ["base64Port", base64Port.send, "rgb(0, 0, 255)"],
  ["identity", identity.send, "rgb(120, 120, 120)"],
  ["filePort", filePort.send, "rgb(0, 0, 0)"],
  ["httpTask", httpTask.send, "rgb(255, 255, 0)"],
];

const receivers = [
  ["intArray", intArray.receive, "rgb(255, 0, 0)"],
  ["base64Port", base64Port.receive, "rgb(0, 0, 255)"],
  ["identity", identity.receive, "rgb(120, 120, 120)"],
  ["httpTask", httpTask.receive, "rgb(255, 255, 0)"],
];

/**
 * Creates a new Uint8Array with the given length.
 * @param {number} len
 * @returns {Uint8Array}
 */
function fillUint8Array(len) {
  const uint8Array = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    uint8Array[i] = i % 256;
  }

  return uint8Array;
}

/**
 * Checks if two Uint8Arrays are equal
 * @param {Uint8Array} arr1
 * @param {Uint8Array} arr2
 * @returns {boolean}
 */
function areUint8ArraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}

let senderData = Array.from(senders, () => []);
let receiverData = Array.from(receivers, () => []);

const ATTEMPTS = 100;

/**
 *
 * @param {number} len
 * @returns {Promise<void>}
 */
async function runBenchmark(len) {
  const bytes = fillUint8Array(len);
  for (let index = 0; index < senders.length; index++) {
    const [identifier, send] = senders[index];
    let receivedBytesLength;
    let millis = 0;
    for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
      performance.mark("start");
      receivedBytesLength = await send(bytes);
      performance.mark("end");
      millis += performance.measure(identifier, "start", "end").duration;
    }

    senderData[index].push(millis / ATTEMPTS);
    if (receivedBytesLength != len) {
      throw new Error(
        `Implementation ${identifier} is unsound. Send bytes of length ${len} but received ${receivedBytesLength}`
      );
    }
  }

  for (let index = 0; index < receivers.length; index++) {
    const [identifier, receive] = receivers[index];
    let receivedBytes;
    let millis = 0;
    for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
      performance.mark("start");
      receivedBytes = await receive();
      performance.mark("end");
      millis += performance.measure(identifier, "start", "end").duration;
    }

    receiverData[index].push(millis / ATTEMPTS);
    if (!areUint8ArraysEqual(bytes, receivedBytes)) {
      throw new Error(
        `Implementation ${identifier} is unsound. Send bytes ${bytes} but received ${receivedBytes}`
      );
    }
  }
}

const createSenderDataset = ([identifier, , color], index) => ({
  label: identifier,
  data: senderData[index],
  borderColor: color,
});

const createReceiverDataset = ([identifier, , color], index) => ({
  label: identifier,
  data: receiverData[index],
  borderColor: color,
});

const sizes = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];

(async () => {
  for (let size of sizes) {
    await runBenchmark(size);
  }

  const options = {
    scales: {
      x: {
        ticks: {
          callback: function (_, index) {
            return (sizes[index] / 1000).toFixed(2) + "kb";
          },
        },
      },
      y: {
        ticks: {
          callback: function (value) {
            return value + "ms";
          },
        },
      },
    },
  };

  new Chart(document.getElementById("senders"), {
    type: "line",
    data: {
      labels: sizes,
      datasets: senders.map(createSenderDataset),
    },
    options,
  });

  new Chart(document.getElementById("receivers"), {
    type: "line",
    data: {
      labels: sizes,
      datasets: receivers.map(createReceiverDataset),
    },
    options,
  });
})();
