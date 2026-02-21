// ===============================
// Web Bluetooth Connection
// ===============================

var characteristic = null;

const color_service_uuid =
  "f815e810-456c-6761-746f-4d756e696368";
const color_characteristic_uuid =
  "f815e811-456c-6761-746f-4d756e696368";

async function findLamp() {
  try {
    if (!navigator.bluetooth) {
      alert("Web Bluetooth is not supported in this browser. Use Chrome over HTTPS.");
      return;
    }

    console.log("Searching for Avea device...");
  try {
    console.log("Searching for Avea device...");

    const options = {
      filters: [
        {
          namePrefix: "Avea",
          services: [color_service_uuid]
        }
      ]
    };

    const device = await navigator.bluetooth.requestDevice(options);
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(color_service_uuid);
    characteristic = await service.getCharacteristic(color_characteristic_uuid);

    console.log("Connected to Avea lamp");

    subscribeToBulbNotifications();

    // UI Updates
    const button = document.getElementById("connectbutton");
    button.innerText = "Verbunden ✓";
    button.disabled = true;

    const status = document.getElementById("connectionStatus");
    status.innerText = "Verbunden";
    status.classList.remove("Disconnected");
    status.classList.add("connected");

    await sleep(500);
    await setBrightnessSliderValue();

    // Handle disconnect
    device.addEventListener("gattserverdisconnected", () => {
      console.log("Device disconnected");
      characteristic = null;

      button.innerText = "Reconnect";
      button.disabled = false;

      status.innerText = "Disconnected";
      status.classList.remove("connected");
      status.classList.add("disconnected");
    });

  } catch (error) {
    console.error("Bluetooth error:", error);
    alert("Connection failed: " + error.message);
  }
}

function writeCharacteristic(value) {
  if (!characteristic) {
    console.warn("No characteristic available");
    return;
  }

  try {
    characteristic.writeValue(Uint8Array.from(value));
  } catch (error) {
    console.error("Write failed:", error);
  }
}

