import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { SiShopware } from 'react-icons/si';
import { MdOutlineCancel } from 'react-icons/md';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { useSelector, useDispatch } from 'react-redux';
import {useTranslation} from 'react-i18next'
import { Button } from ".";
import { links } from '../data/dummy';

const Sidebar = () => {
  const {t} = useTranslation();
  const {user, theme} = useSelector((state) => ({
    user: state.auth.user,
    theme: state.item
  }))
  const dispatch = useDispatch()

  const handleCloseSideBar = () => {
    if (theme.sidebarMenu !== undefined && theme.screenSize <= 900) {
      dispatch({
        type: "CLOSE_SIDEBAR",
        sidebarMenu: false
      })
    }
  };

  const activeLink = `flex items-center gap-5 ${theme.direction == 'ltr'?'pl-4':'pr-4'} pt-3 pb-2.5 rounded-lg text-white text-md m-2`;
  const normalLink = `flex items-center gap-5 ${theme.direction == 'ltr'?'pl-4':'pr-4'} pt-3 pb-2.5 rounded-lg text-md text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray m-2`;

  const handleSidebarClose = () => {
    dispatch({
      type: "SHOW_SIDEBAR",
      sidebarMenu: false
    })
  }

  return (
    <div className={`${theme.direction == 'ltr'?'ml-3':'mr-3'} h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-10`}>
      {theme.sidebarMenu && (
        <>
          <div className={`flex justify-between items-center mt-3`}>
            <Link to="/" onClick={handleCloseSideBar} className={`items-center gap-3 ${theme.direction == 'ltr'?'ml-3':'mr-3'} flex text-xl font-extrabold tracking-tight dark:text-white text-slate-900`}>
              <SiShopware /> <span>{t('site_title')}</span>
            </Link>
            <Button
              icon={<MdOutlineCancel />}
              color={theme.colorMode}
              bgHoverColor="light-gray"
              size="2xl"
              borderRadius="50%"
              classN={`${theme.direction == 'ltr'?'mr-3':'ml-3'}`}
              costumFunc={handleSidebarClose}
              fontSize="20px"
            />
          </div>
          <div className="mt-10 ">
            {links.map((item) => (
              (item.access.includes(user?.role) || item.access.length == 0) && (<div key={item.title}>
                <p className="text-gray-400 dark:text-gray-400 m-3 mt-4 uppercase text-md">
                  {t(item.title)}
                </p>
                {item.links.map((link) => {
                  return(
                  <NavLink
                    to={`/${link.link.replace(':username', user?.username)}`}
                    key={link.name}
                    onClick={handleCloseSideBar}
                    style={({ isActive }) => ({
                      backgroundColor: isActive ? theme.colorMode : '',
                    })}
                    className={({ isActive }) => (isActive ? activeLink : normalLink)}
                  >
                    {link.icon}
                    <span className="capitalize text-sm">{t(link.name)}</span>
                  </NavLink>
                )})}
              </div>)
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
