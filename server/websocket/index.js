const WebSocket = require("ws");
const queryString = require("query-string");

async function websocket(expressServer) {
  //создаем сервер websocket
  const websocketServer = new WebSocket.Server({
    noServer: true,
    path: "/websockets",
  });

  const clients = new Map();
  let lastCurrentTemperature = "";
  let lastSetTemperature = "";

  expressServer.on("upgrade", (request, socket, head) => {
    websocketServer.handleUpgrade(request, socket, head, (websocket) => {
      websocketServer.emit("connection", websocket, request);
    });
  });

  websocketServer.on(
    "connection",
    function connection(websocketConnection, connectionRequest) {
      const [_path, params] = connectionRequest?.url?.split("?");
      const connectionParams = queryString.parse(params);

      clients.set(connectionParams.client, websocketConnection);

      console.log(`Пользователь ${connectionParams.client} подключился.`);

      if (clients.size > 1) {
        clients?.forEach((client) => {
          client.send(
            JSON.stringify({
              clientStatus: "Подключен",
              client: connectionParams.client,
            })
          );
        });
      }

      websocketConnection.on("message", (message) => {
        const parsedMessage = JSON.parse(message);

        if (parsedMessage?.message === "connected") {
          if (lastCurrentTemperature) {
            websocketConnection.send(
              JSON.stringify({
                message: { currentTemperature: lastCurrentTemperature },
              })
            );
            console.log(
              `send lastCurrentTemperature to ${connectionParams.client}`
            );

            lastCurrentTemperature = "";
          }

          if (lastSetTemperature) {
            websocketConnection.send(
              JSON.stringify({
                message: { setTemperature: lastSetTemperature },
              })
            );
            console.log(
              `send lastSetTemperature to ${connectionParams.client}`
            );

            lastSetTemperature = "";
          }
        }

        console.log(
          `client "${connectionParams.client}" send message ${message}`
        );

        if (parsedMessage?.currentTemperature) {
          lastCurrentTemperature = parsedMessage?.currentTemperature;
        }

        if (parsedMessage?.setTemperature) {
          lastSetTemperature = parsedMessage?.setTemperature;
        }

        clients?.forEach((client, key) => {
          if (key !== connectionParams.client) {
            client?.send(JSON.stringify({ message: parsedMessage }));
          }
        });
      });

      websocketConnection.on("close", () => {
        clients.delete(connectionParams.client);

        console.log(`client "${connectionParams.client}" closed connection`);

        clients?.forEach((client) => {
          client?.send(
            JSON.stringify({
              clientStatus: "Не подключен",
              client: connectionParams.client,
            })
          );
        });
      });
    }
  );

  return websocketServer;
}
module.exports = websocket;
