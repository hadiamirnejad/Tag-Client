import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useScrollDirection } from 'react-use-scroll-direction'
import { RadioButton, Tagging2, MultiSelect } from '../components';
import useToken from '../hooks/useToken';

const Checking = () => {
  const { user, theme } = useSelector((state) => ({
    theme: state.item,
    user: state.auth.user
  }));

  const dispatch = useDispatch();

  const {scrollDirection} = useScrollDirection()
  const [showNavbar, setShowNavbar] = useState(true)

  useEffect(()=> {
    if(scrollDirection == 'UP'){
      setShowNavbar(true)
    }
    if(scrollDirection == 'DOWN'){
      setShowNavbar(false)
    }
  },[scrollDirection])

  return (
    <div
      className={`mx-1 max-w-full box-border bg-white dark:bg-secondary-dark-bg p-2 md:transition-2 pt-4 mt-[7.5rem] ${showNavbar?"mt-[4.25rem]":"mt-[0.25rem]"} `}
    >
      <div className="w-full bg-white dark:bg-secondary-dark-bg p-2">
        <Tagging2 type='checking'/>
      </div>
    </div>
  );
};

export default Checking;
