import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useScrollDirection } from 'react-use-scroll-direction'
import { Tagging1 } from '../components';
import useToken from '../hooks/useToken';

const Conflict = () => {
  const { user, theme } = useSelector((state) => ({
    theme: state.item,
    user: state.auth.user
  }));

  const dispatch = useDispatch();

  const {scrollDirection} = useScrollDirection()
  const [showNavbar, setShowNavbar] = useState(true)
  const [accessToken] = useToken();
  const [phrases, setPhrases] = useState([])
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(false)
  const [phrasesFilter, setPhrasesFilter] = useState(1)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [total, setTotal] = useState(0)

  useEffect(()=> {
    if(scrollDirection == 'UP'){
      setShowNavbar(true)
    }
    if(scrollDirection == 'DOWN'){
      setShowNavbar(false)
    }
  },[scrollDirection])

  const getFields = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/getFields`);
      setFields(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getPhrasesHandler = async (status)=>{
    if(status === 0 && phrases.filter(p=>p.status === 1).length > 0){
      return setErrorMsg('ابتدا عبارات جاری را تگ بزنید.')
    }
    setLoading(true)
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/getPhrases`,{
        userId: user._id,
        status: status,
      },{
        headers:{accessToken}
      })

      if(response.data.error){
        return setErrorMsg(response.data.error)
      }

      setPhrases(response.data.phrases)
      setTotal(response.data.phrases.length>0?response.data.phrases[0].total:0)
    } catch (error) {
      
    }
    setLoading(false)
  }

  useEffect(()=>{
    getFields();
  },[])

  useEffect(()=>{
    getPhrasesHandler(3);
  },[fields])

  return (
    <div
      className={`mx-1 max-w-full box-border bg-white dark:bg-secondary-dark-bg p-2 md:transition-2 pt-4 mt-[7.5rem] ${showNavbar?"mt-[4.25rem]":"mt-[0.25rem]"} `}
    >
      <p className='text-sm mb-2'>{`تعداد کل عبارات دارای ابهام: ${total}`}</p>
      {total === 0 && <div className='w-full h-60 flex justify-center items-center text-xs font-bold'>عبارت دارای ابهام یافت نشد</div>}
      <Tagging1 type='conflict'/>
    </div>
  );
};

export default Conflict;
