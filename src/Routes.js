import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useUser from "./hooks/useUser";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { FiSettings } from "react-icons/fi";
import { ThemeSettings, Layout } from "./components";
import { AdminRoute, ProtectedRoute, ChekerRoute } from "./customRoutes/PrivateRoute";
import {
  Home,
  SignIn,
  UserManegement,
  ContentManegement,
  Tagging,
  Conflict,
  Checking,
  Report,
  ChangePassword,
  Page404,
  Calendar,
  ToDo
} from "./pages";
import "./App.css";
import useToken from "./hooks/useToken";
import axios from "axios";
import RotateLoader from 'react-spinners/RotateLoader'

function SiteRoutes() {
  const [accessToken] = useToken();
  const [loading, setLoading] = useState(true)

  const getUserFromToken = async () => {
    if(accessToken){
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/checkToken`,{
            accessToken
          }
        );

        dispatch({
          type: "LOG_IN",
          user: response.data.user,
        })
      }
        catch (err) {
          console.log(err)
      }
    }
    setLoading(false)
  }

  useEffect(()=>{
    getUserFromToken();
  },[])

  const { user, theme } = useSelector((state) => ({
    theme: state.item,
    user: state.auth.user
  }));
  const dispatch = useDispatch();
  const handleTheme = () => {
    dispatch({
      type: "SHOW_ITEM",
      payload:{value: "themeSetting", show: true}
    })
  }

if(loading){return (<div className="w-full h-screen flex justify-center items-center"><RotateLoader color="#36d7b7"/></div>)}
else{return (
      <BrowserRouter>
        <div className="flex relative dark:bg-main-dark-bg">
          <div
            className="bg-main-bg dark:bg-main-dark-bg w-full min-h-screen"
          >
            <Layout>
              <div>
                {theme.themeSetting && <ThemeSettings />}
                <Routes>
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <div className={`${(theme.pinChat && theme.notification)?'w-[calc(100vw-24.25rem)] ms-97':'w-screen'}`}><Home/></div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tag"
                    element={
                      <ProtectedRoute>
                        <div className={`${(theme.pinChat && theme.notification)?'w-[calc(100vw-24.25rem)] ms-97':'w-screen'}`}><Tagging/></div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/changepassword"
                    element={
                      <ProtectedRoute>
                        <div className={`${(theme.pinChat && theme.notification)?'w-[calc(100vw-24.25rem)] ms-97':'w-screen'}`}><ChangePassword/></div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/conflict"
                    element={
                      <ChekerRoute>
                        <div className={`${(theme.pinChat && theme.notification)?'w-[calc(100vw-24.25rem)] ms-97':'w-screen'}`}><Conflict/></div>
                      </ChekerRoute>
                    }
                  />
                  <Route
                    path="/check"
                    element={
                      <ChekerRoute>
                        <div className={`${(theme.pinChat && theme.notification)?'w-[calc(100vw-24.25rem)] ms-97':'w-screen'}`}><Checking/></div>
                      </ChekerRoute>
                    }
                  />
                  <Route
                    path="/usersManager"
                    element={
                      <AdminRoute>
                        <div className={`${(theme.pinChat && theme.notification)?'w-[calc(100vw-24.25rem)] ms-97':'w-screen'}`}><UserManegement/></div>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/contentManager"
                    element={
                      <AdminRoute>
                        <div className={`${(theme.pinChat && theme.notification)?'w-[calc(100vw-24.25rem)] ms-97':'w-screen'}`}><ContentManegement/></div>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/report"
                    element={
                      <AdminRoute>
                        <div className={`${(theme.pinChat && theme.notification)?'w-[calc(100vw-24.25rem)] ms-97':'w-screen'}`}><Report/></div>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/ToDo"
                    element={
                      <ProtectedRoute>
                        <div className={`${(theme.pinChat && theme.notification)?'w-[calc(100vw-24.25rem)] ms-97':'w-screen'}`}><ToDo/></div>
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/signin" element={<SignIn/>} />
                  <Route path="/Calendar" element={<Calendar/>} />
                  <Route path="*" element={<div className={`${(theme.pinChat && theme.notification)?'w-[calc(100vw-24.25rem)] ms-97':'w-screen'}`}><Page404/></div>} />
                </Routes>
              </div>
            </Layout>
          </div>
        </div>
      </BrowserRouter>
    )}
                  }

export default SiteRoutes;
