import React, { useRef } from 'react';
import { MdOutlineCancel } from 'react-icons/md';
import { BsCheck } from 'react-icons/bs';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Widget } from '@syncfusion/ej2/documenteditor';
import {MdDarkMode, MdLightMode, MdFormatTextdirectionLToR, MdFormatTextdirectionRToL, MdLanguage} from 'react-icons/md'
import i18n from '../i18n';
import { Button } from '.';
import { themeColors } from '../data/dummy';
import useOutsideClicked from '../hooks/useOutsideClick';

const ThemeSettings = () => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const { user, theme } = useSelector((state) => ({
    user: state.auth.user,
    theme: state.item,
  }));

  const toggleLang = () => {
    let l = 'en';
    let dir = 'ltr';
    switch (theme.lang) {
      case "fa":
        l = "ar";
        dir = "rtl";
        break;
      case "ar":
        l = "en";
        dir = "ltr";
        break;
      default:
        l = "fa";
        dir = "rtl";
        break;
    }

    dispatch({
      type: "LANG",
      lang: l,
    });
    dispatch({
      type: "CHANGE_DIRECTION",
      dir: dir,
    });
    i18n.changeLanguage(l);
  };

  const toggleDirection = () => {
    let d;
    if (theme.direction == "ltr") d = "rtl";
    else d = "ltr";
    dispatch({
      type: "CHANGE_DIRECTION",
      dir: d,
    });
  };

  const toggleTheme = () => {
    let t;
    if (theme.themeMode == "Dark") t = "Light";
    else t = "Dark";
    dispatch({
      type: "CHANGE_THEME",
      themeMode: t,
    });
  };

  const changeColor = (c, n) => {
    dispatch({
      type: "CHANGE_COLOR",
      payload: {
        colorMode: c,
        colorName: n,
      }
    });
  };

  const handleClose = () => {
    dispatch({
      type: "CLOSE_ITEM",
      value: "themeSetting",
    });
  };
  const themeSettingRef = useRef(null);
  useOutsideClicked(themeSettingRef, ()=>{
    handleClose();
  })
  return (
    <div ref={themeSettingRef} className="bg-half-transparent w-screen fixed nav-item top-0 right-0" dir="ltr">
      <div className="float-right h-screen dark:text-gray-200 bg-white dark:bg-[#484B52] w-400">
        <div className="flex justify-between items-center p-4 ml-4">
          <p className="font-semibold text-lg">{t("settings")}</p>
          <button
            type="button"
            onClick={handleClose}
            style={{ color: theme.colorMode, borderRadius: "50%" }}
            className="text-2xl p-3 hover:drop-shadow-xl hover:bg-light-gray"
          >
            <MdOutlineCancel />
          </button>
        </div>
        <div className="flex-col justify-between border-t-1 border-color p-4 ml-4">
          {/* <p className="font-semibold text-md ">{t("lang_option")}</p> */}

          <div className="flex justify-center items-center gap-3">
            
            <Button
              icon={theme.direction == "ltr" ?<MdFormatTextdirectionRToL/>:<MdFormatTextdirectionLToR/>}
              // text={theme.direction == "ltr" ? t("rtl") : t("ltr")}
              // bgColor={theme.colorMode}
              bgHoverColor="light-gray"
              color={theme.colorMode}
              size="xl"
              costumFunc={toggleDirection}
              borderRadius="50%"
              classN="p-2"
              tooltip={theme.direction == "ltr" ? t("rtl") : t("ltr")}
              fontSize="25px"
            />

            <Button
              icon={theme.themeMode == "Dark" ?<MdLightMode/>:<MdDarkMode/>}
              color={theme.colorMode}
              size="md"
              costumFunc={toggleTheme}
              borderRadius="5px"
              classN="p-1 px-3"
              tooltip={theme.themeMode == "Dark" ?t('light'):t('dark')}
              fontSize="25px"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
