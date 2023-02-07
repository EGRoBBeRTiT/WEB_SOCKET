import React from "react";
import { Route, Routes } from "react-router-dom";
import { MainPage } from "../pages/MainPage";
import { UserPage } from "../pages/UserPage";
import "./App.scss";

export const App = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/user" element={<UserPage isUser />} />
        <Route path="/conditioner" element={<UserPage isUser={false} />} />
      </Routes>
    </div>
  );
};
