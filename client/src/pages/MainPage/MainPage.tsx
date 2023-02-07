import React from "react";
import { Link } from "react-router-dom";
import "./MainPage.style.scss";
import { AiOutlineUser } from "@react-icons/all-files/ai/AiOutlineUser";

import { TfiHarddrive } from "react-icons/tfi";

export const MainPage = () => {
  return (
    <div className="main-page">
      <h1>Приложение управления кондиционером</h1>
      <h2>Выберете, за кого хотите зайти</h2>
      <div className="container">
        <Link to="/user">
          <div className="card user">
            <AiOutlineUser color="white" size={100} />
            <span>Пользователь</span>
          </div>
        </Link>
        <Link to="/conditioner">
          <div className="card conditioner">
            <TfiHarddrive color="white" size={100} />
            <span>Кондиционер</span>
          </div>
        </Link>
      </div>
    </div>
  );
};
