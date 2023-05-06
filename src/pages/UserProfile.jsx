// import * as React from 'react'
import axios from 'axios';
import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  Ref,
} from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components';

const UserProfile = () => {
  const { t } = useTranslation();

  const { username } = useParams();
  const [desiredUser, setDesiredUser] = useState();

  const getUserData = () => {
    try {
      const response = axios.post(
        `${process.env.REACT_APP_BASE_URL}/users/getUserByUsername`,
        {
          username: username,
        }
      );

      return response;
    } catch (error) {}
  };
  useEffect(() => {
    getUserData().then((response) => setDesiredUser(response.data.user));
  }, []);

  return (
    <div
      className={`mx-1 max-w-full box-border dark:text-gray-200 h-[100vh] pt-16`}
    >
      <div className="h-full p-2 flex justify-center items-start">
        {!desiredUser ? (
          <p>{t("loading")}</p>
        ) : (
          <div className="w-full md:w-2/3 h-[40vh] grid grid-cols-1 md:grid-cols-12 border border-indigo-100 rounded-md">
            <div className="col-span-1 md:col-span-4 md:ms-auto p-2">
              <img
                src={desiredUser.avatar}
                alt=""
                className="w-full h-[38vh] object-contain rounded-md"
              />
            </div>
            <div className="col-span-1 md:col-span-8 grid p-2 h-full">
                <div className="col-span-1 self-center">
                  {t("name")}: {desiredUser.name}
                </div>
                <div className="col-span-1 self-center">
                  {t("alias")}: {desiredUser.alias}
                </div>
                <div className="col-span-1 self-center">
                  {t("username")}: {desiredUser.username}
                </div>
                <div className="col-span-1 self-center">
                  {t("email")}: {desiredUser.email}
                </div>
                <div className="col-span-1 self-center">
                  {t("mobile")}: {desiredUser.mobile}
                </div>
                <div className="col-span-1 self-center">
                  {t("bio")}: {desiredUser.bio}
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
