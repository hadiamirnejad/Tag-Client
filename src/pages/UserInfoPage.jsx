// import * as React from 'react'
import axios from 'axios';
import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  Ref,
  ReactElement,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';

import useToken from '../hooks/useToken';

import { Button } from '../components';

const UserInfoPage = () => {
  const [accessToken, setToken] = useToken();
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const { user, theme } = useSelector((state) => ({
    theme: state.item,
    user: state.auth.user,
  }));

  const navigate = useNavigate();

  const [name, setName] = useState(user.name || '');
  const [alias, setAlias] = useState(user.alias || '');
  const [email, setEmail] = useState(user.email || '');
  const [mobile, setMobile] = useState(user.mobile || '');
  const [country, setCountry] = useState(user.country || '');
  const [city, setCity] = useState(user.city || '');
  const [address, setAddress] = useState(user.address || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  // const [profileImg, setProfileImg] = useState(null);
  const [bio, setBio] = useState(user.bio || '');
  const [file, setFile] = useState();

  const [password, setPassword] = useState('');
  const [confPassword, setConfPassword] = useState('');

  const [showVEModal, setShowVEModal] = useState(false);
  const [emailVCode, setEmailVCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(
    user.verified.email || false
  );

  const [showVMModal, setShowVMModal] = useState(false);
  const [mobileVCode, setMobileVCode] = useState('');
  // const [mobileVerified, setMobileVerified] = useState(
  //   user.verified.mobile || false
  // );
  const mobileVerified = false;
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // This useEffect hook automatically hides the
  // success and error messages after 3 seconds when they're shown.
  // Just a little user interface improvement.
  useEffect(() => {
    if (showSuccessMessage || errorMessage !== '') {
      setTimeout(() => {
        setShowSuccessMessage(false);
        setErrorMessage('');
      }, 5000);
    }
  }, [showSuccessMessage, errorMessage]);

  const uploadHandler = async (oldFile) => {
    let avatarImg = [];
    const formData = new FormData();
    formData.append('userId', user._id);
    formData.append('oldFile', oldFile);
    formData.append('file', file);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/upload/avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            accessToken: accessToken,
          },
        }
      );

      if (response.data.error) {
        avatarImg = [];
      } else if (response.status === 200) {
        avatarImg = [
          {
            type: response.data.mimetype.split('/')[0],
            src: `/images/avatars/${response.data.filename}`,
          },
        ];
      }
    } catch (err) {
    } finally {
      return avatarImg;
    }
  };

  const saveChanges = async () => {
    let uploadedImgs;
    if (file) {
      uploadedImgs = await uploadHandler(avatar);
      if (uploadedImgs.length === 0) {
        return setErrorMessage('avatar_image_is_empty');
      }
    }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/users/${user?._id}`,
        {
          name: name,
          alias: alias,
          avatar: file ? uploadedImgs[0].src : avatar,
        },
        {
          headers: {
            accessToken: accessToken,
          },
        }
      );
      if (response.data.error) {
        throw response.data.error;
      }
      const { user: userD } = response.data;

      dispatch({
        type: 'LOG_IN',
        user: userD,
      });
      setToken(response.data.accessToken);
      setShowSuccessMessage(true);
    } catch (err) {
      if (err.message) {
        setErrorMessage(t('can_not_connect_to_server'));
      } else {
        setErrorMessage(t(err));
      }
    }
  };

  const signOut = () => {
    dispatch({
      type: 'LOG_IN',
      user: null,
    });
    sessionStorage.removeItem('accessToken');
    navigate('/signin');
  };

  const resetValues = () => {
    setName(user.name);
    setAlias(user.alias);
    setEmail(user.email);
    setMobile(user.mobile);
    setCountry(user.country);
    setCity(user.city);
    setAddress(user.address);
    setAvatar(user.avatar);
    setBio(user.bio);
  };

  const verifyMobile = () => {
    try {
      setShowVMModal(true);
    } catch (err) {
      setErrorMessage(err.response.data.message);
    }
  };

  const mobileVCodeHandler = (e) => {
    if (e.target.value < 1001 || e.target.value > 9999) {
      setMobileVCode();
      return;
    }
    setMobileVCode(e.target.value);
  };

  const checkVerifyMobile = () => {};

  const verifyEmail = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/verifyEmail/${user?._id}`,
        {
          email,
        },
        {
          headers: { accessToken },
        }
      );

      if (response.data.error) {
        throw response.data.error;
      }
      if (response.status == 200) {
        setShowVEModal(true);
      }
      // const { token: newToken } = response.data;
      // setToken(newToken);
    } catch (err) {
      if (err.message) {
        setErrorMessage(t('can_not_connect_to_server'));
      } else {
        setErrorMessage(t(err));
      }
    }
  };

  const checkVerifyEmail = async () => {
    try {
      if (!emailVCode) {
        return setShowVEModal(false);
      }
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/verifyEmail/c/${user?._id}`,
        {
          email: email,
          vCode: emailVCode,
        },
        {
          headers: { accessToken },
        }
      );
      if (response.status == 200) {
        setShowVEModal(true);
      }
      if (response.status == 200) {
        const { accessToken } = response.data;
        setToken(accessToken);
        setEmailVerified(true);
        setShowVEModal(false);
      }
    } catch (err) {
      setShowVEModal(false);
      if (err.message) {
        setErrorMessage(t('can_not_connect_to_server'));
      } else {
        setErrorMessage(t(err));
      }
    }
  };

  const emailVCodeHandler = (e) => {
    if (e.target.value < 1001 || e.target.value > 9999) {
      setEmailVCode();
      return;
    }
    setEmailVCode(e.target.value);
  };

  const inputFile = useRef(null);

  const changeAvatar = (e) => {
    inputFile.current.click();
    // setAvatar(e.target.files[0].name)
  };
  const mobileRegex = /^(\+98|0098|98|0)?9\d{9}$/;
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const addFileHandler = (e) => {
    if (
      e.target.files[0] &&
      e.target.files[0].type.substring(0, 5) === 'image'
    ) {
      setFile(e.target.files[0]);
    }
  };
  const changePasswordHandler = async () => {
    if (confPassword.trim() === '') {
      return setErrorMessage(t('password_is_incorrect'));
    }
    if (confPassword.trim() !== password.trim()) {
      return setErrorMessage(t('password_is_incorrect'));
    }
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/users/changePassword/${user._id}`,
        {
          userId: user._id,
          newPassword: password,
          confirmationNewPassword: confPassword,
        },
        {
          headers: {
            accessToken: accessToken,
          },
        }
      );

      if (response.data.error) {
        throw response.data.error;
      }

      setToken(response.data.accessToken);
      setShowSuccessMessage(true);
    } catch (error) {
      setErrorMessage(error);
    }
  };
  return (
    <article
      itemScope
      itemType="http://schema.org/Author"
      className="dark:text-gray-200 text-gray-700 mt-24 w-full flex-col justify-center items-center"
    >
      <div className="flex justify-center items-center">
        <div className="p-2 p-md-5 rounded text-center w-full max-w-6xl">
          <h1 itemProp="author" className="text-center fw-bold fs-4">
            {t('profile_of')} {user?.username}
          </h1>
          <hr className="border-primary border-2 rounded" />
          <div className="flex justify-center items-center w-1/2 md:w-1/4 aspect-square m-3 mx-auto">
            <img
              itemProp="avatar"
              src={file ? URL.createObjectURL(file) : avatar}
              alt="avatar"
              onClick={changeAvatar}
              className="w-full h-full cursor-pointer col-span-4 rounded-full"
            />
            <input
              type="file"
              id="file"
              accept="/images/*"
              onChange={addFileHandler}
              ref={inputFile}
              style={{ display: 'none' }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 w-full">
            <div
              itemProp="name"
              className="grid grid-cols-8 justify-center items-center gap-2 m-3"
            >
              <label htmlFor="nameInput" className="col-span-2">
                {t('p_name')}
              </label>
              <input
                id="nameInput"
                className="form-control text-center rounded text-gray-700 col-span-4"
                aria-describedby="nameHelp"
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder={t('p_name')}
              />
            </div>
            <div
              itemProp="alias"
              className="grid grid-cols-8 justify-center items-center gap-2 m-3"
            >
              <label htmlFor="aliasInput" className="col-span-2">
                {t('p_alias')}
              </label>
              <input
                id="aliasInput"
                className="form-control text-center rounded text-gray-700 col-span-4"
                aria-describedby="aliasHelp"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                type="text"
                placeholder={t('p_alias')}
              />
            </div>

            <div
              itemProp="email"
              className="grid grid-cols-8 justify-center items-center gap-2 m-3 "
            >
              <label htmlFor="emailInput" className="col-span-2">
                {t('p_email')}
              </label>
              <input
                id="emailInput"
                className={`form-control text-center rounded text-gray-700 col-span-4  ${
                  !emailRegex.test(email) && email
                    ? 'border border-3 border-danger border-opacity-50 text-white'
                    : ''
                }`}
                aria-describedby="emailHelp"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={emailVerified}
                type="email"
                placeholder={t('p_email')}
              />
              {emailVerified ? (
                <label className="col-span-2 form-label m-0 text-center bg-green-200 w-100 py-1 text-gray-700 dark:text-white rounded-3xl">
                  {t('verified')}
                </label>
              ) : (
                <Button
                  color="white"
                  disabled={!emailRegex.test(email)}
                  bgColor={theme.colorMode}
                  text={t('verify_email')}
                  classN="col-span-2 p-auto rounded-3xl"
                  width="full"
                  size="sm"
                  costumFunc={verifyEmail}
                />
              )}
            </div>
            <div
              itemProp="mobile"
              className="grid grid-cols-8 justify-center items-center gap-2 m-3 "
            >
              <label className="col-span-2" htmlFor="mobileInput">
                {t('p_mobile')}
              </label>
              <input
                id="mobileInput"
                className={`col-span-4 form-control text-center rounded text-gray-700 ${
                  !mobileRegex.test(mobile) && mobile
                    ? 'border border-3 border-danger border-opacity-50 text-white'
                    : ''
                }`}
                aria-describedby="mobileHelp"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                disabled={mobileVerified}
                type="mobile"
                placeholder={t('p_mobile')}
              />
              {mobileVerified ? (
                <p className="col-span-2 form-label m-0 text-success text-center bg-success w-100 py-1 text-gray-700 dark:text-white rounded-pill">
                  {t('verified')}
                </p>
              ) : (
                <Button
                  color="white"
                  disabled={!mobileRegex.test(mobile)}
                  bgColor={theme.colorMode}
                  text={t('verify_mobile')}
                  classN="col-span-2 p-auto"
                  borderRadius="15px"
                  width="full"
                  size="sm"
                  costumFunc={verifyMobile}
                />
              )}
            </div>
            <div
              itemProp="country"
              className="grid grid-cols-8 justify-center items-center gap-2 m-3"
            >
              <label htmlFor="countryInput" className="col-span-2">
                {t('p_country')}
              </label>
              <input
                id="countryInput"
                className="form-control text-center rounded text-gray-700 col-span-4"
                aria-describedby="countryHelp"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                type="text"
                placeholder={t('p_country')}
              />
            </div>
            <div
              itemProp="city"
              className="grid grid-cols-8 justify-center items-center gap-2 m-3"
            >
              <label htmlFor="cityInput" className="col-span-2">
                {t('p_city')}
              </label>
              <input
                id="cityInput"
                className="form-control text-center rounded text-gray-700 col-span-4"
                aria-describedby="cityHelp"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                type="text"
                placeholder={t('p_city')}
              />
            </div>
            <div
              itemProp="address"
              className="grid grid-cols-8 justify-center items-center gap-2 m-3"
            >
              <label htmlFor="addressInput" className="col-span-2">
                {t('p_address')}
              </label>
              <input
                id="addressInput"
                className="form-control text-center rounded text-gray-700 col-span-4"
                aria-describedby="addressHelp"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                type="text"
                placeholder={t('p_address')}
              />
            </div>
            <div
              itemProp="bio"
              className="grid grid-cols-8 justify-center items-center gap-2 m-3"
            >
              <label htmlFor="bioInput" className="col-span-2">
                {t('p_bio')}
              </label>
              <input
                id="bioInput"
                className="form-control text-center rounded text-gray-700 col-span-4"
                aria-describedby="bioHelp"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                type="text"
                placeholder={t('p_bio')}
              />
            </div>
          </div>
          <hr className="border-primary border-2 rounded w-full mt-3" />
          <div className="flex justify-center">
            <div className="w-full md:w-1/3">
              <Button
                color="white"
                bgColor={theme.colorMode}
                text={t('save_changes')}
                classN="my-3 p-1 px-5"
                borderRadius="10px"
                width="full"
                size="2"
                costumFunc={saveChanges}
              />
              <div className="col-span-12">
                <div className="d-flex flex-column flex-md-row justify-content-end g-2 align-items-center my-2">
                  <Button
                    color="white"
                    bgColor={theme.colorMode}
                    text={t('reset')}
                    classN="my-3 p-1 px-5"
                    borderRadius="10px"
                    width="full"
                    size="2"
                    costumFunc={resetValues}
                  />
                  <Button
                    color="white"
                    bgColor={theme.colorMode}
                    text={t('sign_out')}
                    classN="my-3 p-1 px-5"
                    borderRadius="10px"
                    width="full"
                    size="2"
                    costumFunc={signOut}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Dialog open={showVEModal} TransitionComponent={Transition} keepMounted>
          <DialogContent>
            <label className="text-justify w-full">
              {t('verification_code_sent_to_your_email')}
            </label>
            <input
              id="emailInput"
              className="form-control text-center w-full my-2"
              type="number"
              onChange={emailVCodeHandler}
              placeholder={t('verification_code')}
            />
            <div className="grid grid-cols-2">
              <Button
                color="white"
                bgColor={theme.colorMode}
                text={t('cancel')}
                classN="p-1"
                borderRadius="10px"
                width="full"
                size="2"
                costumFunc={() => {
                  setShowVEModal(false);
                }}
              />
              <Button
                disabled={!emailVCode}
                color="white"
                bgColor={theme.colorMode}
                text={t('submit')}
                classN="p-1"
                borderRadius="10px"
                width="full"
                size="2"
                costumFunc={checkVerifyEmail}
              />
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={showVMModal} TransitionComponent={Transition} keepMounted>
          <DialogContent>
            <p className="text-justify w-full">
              {t('verification_code_sent_to_your_mobile')}
            </p>
            <input
              id="mobileInput"
              className="form-control text-center w-full my-2"
              type="number"
              onChange={mobileVCodeHandler}
              placeholder={t('verification_code')}
            />
            <div className="grid grid-cols-2">
              <Button
                color="white"
                bgColor={theme.colorMode}
                text={t('cancel')}
                classN="p-1"
                borderRadius="10px"
                width="full"
                size="2"
                costumFunc={() => {
                  setShowVMModal(false);
                }}
              />
              <Button
                disabled={!mobileVCode}
                color="white"
                bgColor={theme.colorMode}
                text={t('submit')}
                classN="p-1"
                borderRadius="10px"
                width="full"
                size="2"
                costumFunc={checkVerifyMobile}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div
        itemProp="changePassword"
        className="flex justify-center items-center"
      >
        <div className="p-2 p-md-5 rounded text-center w-full max-w-6xl">
          <div className="grid grid-cols-12 justify-center items-center gap-2 m-3">
            <label htmlFor="cityInput" className="col-span-2">
              {t('p_password')}
            </label>
            <input
              id="cityInput"
              className="form-control text-center rounded text-gray-700 col-span-4"
              aria-describedby="cityHelp"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder={t('p_password')}
            />
            <label htmlFor="cityInput" className="col-span-2">
              {t('p_conf_password')}
            </label>
            <input
              id="cityInput"
              className="form-control text-center rounded text-gray-700 col-span-4"
              aria-describedby="cityHelp"
              value={confPassword}
              onChange={(e) => setConfPassword(e.target.value)}
              type="password"
              placeholder={t('p_conf_password')}
            />
            <div className="col-span-12 flex justify-center items-center">
              <div className="g-2 my-2 w-full md:w-1/3">
                <Button
                  color="white"
                  bgColor={theme.colorMode}
                  text={t('submit')}
                  classN="my-3 p-1 px-5"
                  borderRadius="10px"
                  width="full"
                  size="2"
                  costumFunc={changePasswordHandler}
                />
              </div>
            </div>
            {showSuccessMessage && (
              <div className="text-green-500 w-full fw-bold border border-green-500">
                {t('changes_saved_successfully')}
              </div>
            )}
            {errorMessage !== '' && (
              <div className="text-red-500 w-full fw-bold border fw-bold border-red-500">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<any, any>,
  },
  ref: Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default UserInfoPage;
