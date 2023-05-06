import axios from 'axios';
import React, { useEffect } from 'react'
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components';
import useKey from '../hooks/useKey';
import useToken from '../hooks/useToken';
import useUser from '../hooks/useUser';
import store from '../redux/store';

function SignIn() {
  const { user, theme } = useSelector((state) => ({
    theme: state.item,
    user: state.auth.user,
  }));
  const navigate = useNavigate();

  useEffect(()=>{
    if(user){
      return navigate('/');
    }
  },[])
  
  const [errorMessage, setErrorMessage] = useState("");
  const [usernameValue, setUsernameValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const dispatch = useDispatch();
  
  const [, setToken] = useToken();
  const { t } = useTranslation();
  


  const onLogInClicked = async () => {
    console.log(process.env.REACT_APP_BASE_URL)
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/signin`,
        {
          username: usernameValue,
          password: passwordValue,
        }
      );

      if(response.data.error){
        throw response.data.error
      }
      const { accessToken, user: userD } = response.data;
      setToken(accessToken);
      setParams(userD)
      navigate('/')
    } catch (err) {
      console.log(err)
      if(err.message){
        setErrorMessage(t('can_not_connect_to_server'));
      }
      else{
        setErrorMessage(t(err));
      }
    }
  }
  const setParams = (userD)=>
  {
    new Promise(function(resolve, reject) {
      dispatch({
        type: "LOG_IN",
        user: userD,
      });
      dispatch({
        type: "CHANGE_THEME",
        themeMode: userD.theme,
      });
      dispatch({
        type: "CHANGE_DIRECTION",
        dir: userD.direction,
      });
      if(userD.messenger){
        dispatch({
          type: "SHOW_ITEM",
          payload: {value: 'notification', show: true},
        });
        dispatch({
          type: "CHAT_SIDE",
          pinChat: true,
        });
      }
      else{
        dispatch({
          type: "CHAT_SIDE",
          pinChat: false,
        });
      }
    }).then(()=>
    navigate(`/`)
  )
  };
  useKey(13,(e)=>{
    onLogInClicked();
  })
  return (
    <div className='w-full h-screen flex justify-center items-center'>
      <div
        className="p-2 p-md-5 rounded text-center w-96 bg-gray-200 dark:bg-gray-600"
      >
        <h1 className="text-center font-bold text-lg py-1">{t("signin")}</h1>
        <hr className="border-2 rounded dark:border-gray-400" />
        <div className="grid grid-cols-3 gap-2 items-center my-2">
          <label htmlFor="usernameInput" className='col-span-1 text-sm text-start'>{t("username")}</label>
          <input
            id="usernameInput"
            dir='ltr'
            className="col-span-2 rounded text-gray-700 text-sm px-2 py-1"
            aria-describedby="usernameHelp"
            value={usernameValue}
            onChange={(e) => setUsernameValue(e.target.value)}
            type="text"
            placeholder={t("username")}
          />
          <label htmlFor="passwordInput" className='col-span-1 text-sm text-start'>
            {t("password")}
          </label>
          <input
            id="passwordInput"
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            type="password"
            dir='ltr'
            className="col-span-2 rounded text-gray-700 text-sm px-2 py-1"
            placeholder={t("password")}
          />
        </div>
        <hr className="border-2 rounded dark:border-gray-400" />
        <button className='rounded bg-blue-400 hover:bg-blue-300 px-3 py-1 text-sm text-white w-full my-2' onClick={onLogInClicked}>{t("signin")}</button>
        {/* <a
          type="button"
          className="cursor-pointer border-0 text-sm dark:text-gray-200 text-gray-700"
          onClick={() => navigate("/forgot-password")}
          style={{ textDecoration: "none" }}
        >
          {t("did_you_forget_your_password")}
        </a> */}
        {errorMessage && <div className="text-red-500 text-lg border-1 border-red-500 p-2 mt-4">{errorMessage}</div>}
      </div>
    </div>
  )
}

export default SignIn