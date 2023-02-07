import React, { useEffect, useState, useMemo } from "react";

export const useWebsocket = (client: string) => {
  const websocket = useMemo(
    () => new WebSocket(`ws://localhost:5001/websockets?client=${client}`),
    [client]
  );

  const [data, setData] = useState<{
    status: "Не подключен" | "Подключен";
    message?: {
      message?: string;
      setTemperature?: string;
      settingStatus?: "setting" | "set";
      currentTemperature?: string;
    };
    clientStatus?: "Не подключен" | "Подключен";
  } | null>({
    status: "Не подключен",
    message: undefined,
    clientStatus: "Не подключен",
  });

  useEffect(() => {
    websocket.onopen = () => {
      console.log("success");
      setData((prev) => ({ ...prev, status: "Подключен" }));

      websocket.send(JSON.stringify({ message: "connected" }));
    };

    websocket.onclose = (message) => {
      console.log("connection closed");
      console.log(message);
      setData((prev) => ({ ...prev, status: "Не подключен" }));
    };

    websocket.onmessage = (message) => {
      const messageJSON = JSON.parse(message.data);
      setData((prev) => ({
        ...prev,
        status: prev?.status ?? "Не подключен",
        message: { ...prev?.message, ...messageJSON.message },
        ...(messageJSON.clientStatus && {
          clientStatus: messageJSON.clientStatus,
        }),
      }));
    };
  }, [websocket]);

  return { data, websocket };
};
