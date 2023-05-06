import React, {useRef, useEffect, useState} from 'react';
import { MdOutlineCancel } from 'react-icons/md';

import { Button } from '.';
import useToken from '../hooks/useToken';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {useTranslation} from 'react-i18next'
import { useScroll } from '../hooks/useScroll';
import { BiMessageSquare, BiConfused } from 'react-icons/bi';
import { FaUserCheck } from 'react-icons/fa';
import { HiOutlineDocumentReport } from 'react-icons/hi';
import { RiShutDownLine } from 'react-icons/ri';
import { BsBookmarkHeartFill, BsShield, BsKeyFill, BsFillKeyFill } from 'react-icons/bs';
import useOutsideClicked from '../hooks/useOutsideClick';
import io from 'socket.io-client';

const socket = io.connect(`${process.env.REACT_APP_SOCKET_APP_BASE_URL}`);

const UserProfile = () => {
  const {t} = useTranslation();

  const dispatch = useDispatch();
  const {user, theme} = useSelector((state) => ({
    user: state.auth.user,
    theme: state.item
  }))

  const { y, x, scrollDirection } = useScroll();

  const handleClose = () => {
    dispatch({
      type: "CLOSE_ITEM",
      value: "userProfile"
    })
  }

  const [token, setToken] = useToken();

  const navigate = useNavigate();
  const [userProfileData, setUserProfileData] = useState([
    {
      id: 0,
      icon: <BsFillKeyFill />,
      title: 'تغییر رمز عبور',
      access: ["admin", "checker", "tagger"],
      desc: 'تغییر رمز ورود به سامانه',
      iconColor: '#9A2A2A',
      iconBg: '#F88379',
      link: '/changepassword',
      count: 0,
    },
    {
      id:1,
      icon: <BiMessageSquare />,
      title: 'مدیریت محتوا',
      access: ["admin"],
      desc: 'بارگذاری عبارات و تعریف قالب‌ها',
      iconColor: '#03C9D7',
      iconBg: '#E5FAFB',
      link: '/contentManager',
      count: 0,
    },
    {
      id:2,
      icon: <FaUserCheck />,
      title: 'مدیریت کاربران',
      access: ["admin"],
      desc: 'ایجاد، ویرایش، تغییر دسترسی کاربران',
      iconColor: '#03C9D7',
      iconBg: '#E5FAFB',
      link: '/usersManager',
      count: 0,
    },
    {
      id:3,
      icon: <BsShield />,
      title: 'تگ‌زنی',
      access: ["admin", "checker", "tagger"],
      desc: 'تگ‌زنی عبارات',
      iconColor: 'rgb(0, 194, 146)',
      iconBg: 'rgb(235, 250, 242)',
      link: '/tag',
      count: 0,
    },
    {
      id:4,
      icon: <BiConfused />,
      title: 'عبارات مبهم',
      access: ["admin", "checker"],
      desc: 'بازبینی عبارات مبهم',
      iconColor: 'rgb(3, 156, 79)',
      iconBg: 'rgb(219, 229, 207)',
      link: '/conflict',
      count: 0,
    },
    {
      id:5,
      icon: <BsBookmarkHeartFill />,
      title: 'بازبینی',
      access: ["admin", "checker"],
      desc: 'بازبینی عبارات تگ خورده',
      iconColor: 'rgb(255, 244, 229)',
      iconBg: 'rgb(254, 201, 150)',
      link: '/check',
      count: 0,
    },
    {
      id:6,
      icon: <HiOutlineDocumentReport />,
      title: 'گزارش',
      access: ["admin", "checker"],
      desc: 'دریافت عبارات و گزارش عملکرد',
      iconColor: 'rgb(155, 3, 69)',
      iconBg: 'rgb(200, 176, 176)',
      link: '/report',
      count: 0,
    },
  ]);

  useEffect(() => {
    socket.on("conflict_and_cheching_response", (data) => {
      setUserProfileData(userProfileData.map(u=>{if(u.id===4){return {...u, count: data[0]}}else{if(u.id===5){return {...u, count: data[1]}}else{return u}}}))
    });
  }, [socket]);

  useEffect(()=>{
    const interval = setInterval(() => {
      socket.emit('conflict_and_cheching', user.tagTemplate)
    }, 1000);

    return () => {
      clearInterval(interval)
    }
  },[])

  const logOutHandler = async () => {
    dispatch({
      type: "LOG_IN",
      user: null
    })
    localStorage.removeItem("accessToken");

    dispatch({
      type: "SHOW_ITEM",
      payload: {value: "userProfile", show: false}
    })
    navigate("/signin");
  };

  const userProfileRef = useRef(null);
  useOutsideClicked(userProfileRef, handleClose);

  const [showHint, setShowHint] = useState(false)
  return (
    <>
    {user && (
      <div style={{transition: "top 0.5s"}} ref={userProfileRef} className={`nav-item fixed end-1 ${scrollDirection === "up" ? "top-0":"top-16"} bg-white dark:bg-[#42464D] p-2 rounded-lg w-80`}>
        <div className="flex justify-between items-center">
          <p className="font-semibold text-lg dark:text-gray-200">{t('user_profile')}</p>
          <MdOutlineCancel style={{color: theme.colorMode}} onClick={handleClose} className='text-lg cursor-pointer hover:text-red-500'/>
        </div>
        <div className="flex gap-5 items-center border-color border-b-1 py-3">
          <img
            className="rounded-full h-16 w-16"
            src={`${user.avatar}`}
            alt="user-avatar"
          />
          <div>
            <p className="font-semibold text-md dark:text-gray-200">
              {user.name}
            </p>
            <p className="text-gray-500 text-sm dark:text-gray-400">
              {user.role}
            </p>
            <p className="text-gray-500 text-sm dark:text-gray-400">
              {user.username}
            </p>
            <p className={`${user.active?'text-green-600':'text-red-600'} text-xs font-semibold dark:text-gray-400`}>
              {user.active?'فعال':'غیرفعال'}
            </p>
          </div>
          <div className="relative">
            <RiShutDownLine onMouseEnter={()=>setShowHint(true)} onMouseLeave={()=>setShowHint(false)} onClick={logOutHandler} className='flex-grow text-start text-4xl text-red-600 cursor-pointer hover:text-red-500'/>
            <div className={`absolute start-0 ${!showHint && ' hidden'} text-xs bg-black bg-opacity-60 text-white px-2 rounded-b whitespace-pre`}>خروج از سامانه</div>
          </div>
        </div>
        <div className='overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 max-h-[calc(100vh-10rem)]'>
          {userProfileData.filter(upd=>upd.access.includes(user.role)).map((item, index) => (
            <div
              key={index}
              className="relative flex gap-5 border-b-1 border-color p-2 hover:bg-light-gray cursor-pointer  dark:hover:bg-[#42464D]"
              onClick={() => {navigate(`${item.link}`);handleClose();}}
            >
              <button
                type="button"
                style={{ color: item.iconColor, backgroundColor: item.iconBg }}
                className="relative text-xl rounded-md p-2 hover:bg-light-gray"
              >
                {item.icon}
                {/* {item.count>0 && <span
                    className="absolute inline-flex bg-red-400 rounded-full -translate-x-1/2 -translate-y-1/2 h-5 w-5 end-0 top-0 text-xs font-bold text-white justify-center items-center"
                  >{item.count}</span>} */}
              </button>

              <div>
                <p className="font-semibold text-sm dark:text-gray-200 ">{t(item.title)}</p>
                <p className="text-gray-500 text-xs dark:text-gray-400">
                  {t(item.desc)}
                </p>
              </div>
              {item.count>0 && <div
                    className="absolute inline-flex bg-red-400 rounded-full h-5 w-5 end-0 top-1/2 -translate-y-1/2 text-xs font-bold text-white justify-center items-center"
                  >{item.count}</div>}
            </div>
          ))}
        </div>
      </div>
    )}
    </>
  );
};

export default UserProfile;
