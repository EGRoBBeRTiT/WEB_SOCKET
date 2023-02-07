import React, { useCallback, useEffect, useState } from "react";
import { AiOutlineUser } from "@react-icons/all-files/ai/AiOutlineUser";
import { TfiHarddrive } from "react-icons/tfi";
import { AiOutlineCheck } from "@react-icons/all-files/ai/AiOutlineCheck";

import "./UserPage.style.scss";
import { Link } from "react-router-dom";
import { useWebsocket } from "../../service/useWebsocket";
import { UserPageProps } from "./UserPage.types";
import { generateCurrentTemperature } from "./UserPage.utils";

export const UserPage = React.memo(({ isUser = true }: UserPageProps) => {
  const [isSetting, setIsSetting] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [currentTemperature, setCurrentTemperature] = useState(
    generateCurrentTemperature()
  );
  const [setTemperature, setSetTemperature] = useState("");
  const { data, websocket } = useWebsocket(isUser ? "user" : "conditioner");

  const handleLogoutClick = useCallback(() => {
    websocket?.close(1000, "Пользователь вышел");
  }, [websocket]);

  useEffect(() => {
    const timeId = setTimeout(() => {
      const temp = generateCurrentTemperature();

      if (!data?.message?.setTemperature && !isUser) {
        setCurrentTemperature(temp);
        websocket.send(JSON.stringify({ currentTemperature: temp }));
      }
    }, 2000);

    return () => clearTimeout(timeId);
  });

  const handleChangeInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value);
    },
    []
  );

  const handleTempChange = useCallback(() => {
    websocket.send(JSON.stringify({ setTemperature: inputValue }));
  }, [inputValue, websocket]);

  const handleTempReset = useCallback(() => {
    websocket.send(JSON.stringify({ setTemperature: "" }));
    setInputValue("");
  }, [websocket]);

  useEffect(() => {
    if (data?.message?.setTemperature && !isUser) {
      setSetTemperature(data.message.setTemperature);
      setIsSetting(true);
    }
  }, [data?.message?.setTemperature, isUser]);

  useEffect(() => {
    if (isSetting && !isUser) {
      websocket.send(
        JSON.stringify({
          settingStatus: "setting",
        })
      );

      const sign = Math.sign(
        Number(data?.message?.setTemperature) - +currentTemperature
      );

      const intervalId = setTimeout(() => {
        websocket.send(
          JSON.stringify({
            currentTemperature: (+currentTemperature + sign * 0.2).toFixed(1),
          })
        );
        setCurrentTemperature((prev) =>
          String((+prev + sign * 0.2).toFixed(1))
        );

        if (Math.abs(+currentTemperature - Number(setTemperature)) < 0.2) {
          setCurrentTemperature(setTemperature);

          websocket.send(
            JSON.stringify({
              settingStatus: "set",
              currentTemperature: setTemperature,
            })
          );

          setIsSetting(false);

          clearTimeout(intervalId);
        }
      }, 2000);

      return () => clearTimeout(intervalId);
    }
  }, [
    currentTemperature,
    data?.message?.setTemperature,
    isSetting,
    isUser,
    setTemperature,
    websocket,
  ]);

  useEffect(() => {
    if (isUser) {
      if (data?.message?.settingStatus === "setting") {
        setIsSetting(true);
      }

      if (data?.message?.settingStatus === "set") {
        setIsSetting(false);
      }
    }
  }, [data?.message?.settingStatus, isUser]);

  return (
    <div className="user-page">
      <h1>Взаимодействие</h1>
      <div className="content">
        <div className="container">
          <h3>Моя информация</h3>
          {isUser ? (
            <AiOutlineUser color="white" size={60} />
          ) : (
            <TfiHarddrive color="white" size={60} />
          )}

          <span>
            Статус:
            <p>{data?.status}</p>
            <div
              className="status"
              style={{
                background: data?.status === "Подключен" ? "green" : "red",
              }}
            ></div>
          </span>
          <hr />
          <Link to="/" onClick={handleLogoutClick}>
            Выйти
          </Link>
        </div>
        <div className="container">
          <h3>Текущая температура</h3>
          <p className="temp">
            {!isUser
              ? `${currentTemperature} °C`
              : `${data?.message?.currentTemperature ?? "-"} °C`}
          </p>
          {isUser && (
            <>
              <span>
                Изменить температуру{" "}
                <input
                  maxLength={3}
                  onChange={handleChangeInput}
                  value={inputValue}
                />
                °C
                <button onClick={handleTempChange}>
                  <AiOutlineCheck color="white" size={20} />
                </button>
              </span>
              <button onClick={handleTempReset} className="reset">
                Сбросить
              </button>
            </>
          )}
        </div>
        <div className="container">
          <h3>
            {isUser ? "Информация кондиционера" : "Информация пользователя"}
          </h3>
          {isUser ? (
            <TfiHarddrive color="white" size={60} />
          ) : (
            <AiOutlineUser color="white" size={60} />
          )}
          <span>
            Статус:
            <p>{data?.clientStatus}</p>
            <div
              className="status"
              style={{
                background:
                  data?.clientStatus === "Подключен" ? "green" : "red",
              }}
            ></div>
          </span>
          {isSetting && isUser && (
            <span className="change-temp">Изменяет температуру...</span>
          )}
        </div>
      </div>
    </div>
  );
});
