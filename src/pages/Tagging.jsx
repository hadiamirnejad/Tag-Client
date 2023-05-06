import axios from 'axios';
import React, { createRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useScrollDirection } from 'react-use-scroll-direction'
import useToken from '../hooks/useToken';
import { MultiSelect, Tagging1, Tagging2, Tagging3, DropDown} from '../components'
import { DateTime } from '@syncfusion/ej2/charts';
import { useRef } from 'react';
import useKey from '../hooks/useKey';
import {MdOutlineLiveHelp} from 'react-icons/md'
import {TiTick} from 'react-icons/ti'
import {HiOutlineRefresh} from 'react-icons/hi'
import {ImMoveDown} from 'react-icons/im'
import PulseLoader from "react-spinners/PulseLoader";
import io from 'socket.io-client';

const socket = io.connect(`${process.env.REACT_APP_SOCKET_APP_BASE_URL}`);

const Tagging = () => {
  const { user, theme } = useSelector((state) => ({
    theme: state.item,
    user: state.auth.user
  }));

  const [phrases, setPhrases] = useState([])
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(false)
  const [phrasesFilter, setPhrasesFilter] = useState(1)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [userFiles, setUserFiles] = useState([])
  const [currentFile, setCurrentFile] = useState(user.currentFile)
  const dispatch = useDispatch();

  const [accessToken] = useToken();

  const [counts, setCounts] = useState([0,0])

  useEffect(() => {
    setCurrentFile(user.currentFile)
  }, [user]);

  useEffect(() => {
    socket.on("has_rejected_conflicted_response", (data) => {
      setCounts(data)
    });
  }, [socket]);

  useEffect(()=>{
    const interval = setInterval(() => {
      socket.emit('has_rejected_conflicted', {tagTemplateId: user.tagTemplate, userId: user._id})
    }, 1000);

    return () => {
      clearInterval(interval)
    }
  },[])

  const getPhrasesHandler = async (status)=>{
    setLoading(true)
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/getPhrases`,{
        currentFile: currentFile,
        userId: user._id,
        status: status,
        forUsers: user._id
      },{
        headers:{accessToken}
      })

      if(response.data.error){
        return setErrorMsg(response.data.error)
      }

      setPhrases([...new Map(response.data.phrases.map(item => [item.phrase.text, item])).values()])
      // console.log([...new Map([...phrases, ...response.data].map(item => [item.phrase.text, item])).values()].filter(p=>p.status===6).filter((p,idx)=>idx===0))
    } catch (error) {
      
    }
    setLoading(false)
  }

  useKey(9, (e)=>{
    e.preventDefault()
    setPhrasesFilter((phrasesFilter)%4 +1)
  })

  const getUserFiles = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/getUserFiles`,{
        userId: user._id
      },{headers:{accessToken}});

      if(response.data.error){
        return setErrorMsg(response.data.error)
      }

      setUserFiles(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getFields = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/getFields`);

      if(response.data.error){
        return setErrorMsg(response.data.error)
      }

      setFields(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    getUserFiles();
    getFields();
  },[])

  useEffect(()=>{
    getPhrasesHandler(1);
  },[fields])

  useEffect(()=>{
    setTimeout(() => {
      setErrorMsg('');
      setSuccessMsg('');
    }, 7000);
  },[successMsg, errorMsg])

  const changeCurrentFileHandler = async (s) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/users/setUserCurrentFile`,{
        currentFile: s, id: user._id
      },{headers: {accessToken}});

      if(response.data.error){
        throw response.data.error
      }

      dispatch({
        type: "LOG_IN",
        user: response.data.updatedUser,
      });
    } catch (error) {
      console.log(error)
    }
    setCurrentFile(s);
    tabClickedHandler(phrasesFilter);
  }
  const tabClickedHandler = (tabNumber)=>{
    setPhrasesFilter(tabNumber);
    switch (tabNumber) {
      case 1:
        getPhrasesHandler(1);
        break;
      case 2:
        getPhrasesHandler(2);
        break;
      case 3:
        getPhrasesHandler(3);
        break;
      case 4:
        getPhrasesHandler(6);
        break;
    }
  }
  const getCount = (st)=>{
    let sum = 0;
    if(userFiles.filter(uf=>uf.status === st && uf.fileId===currentFile).length>0)
      sum = userFiles.filter(uf=>uf.status === st && uf.fileId===currentFile)[0].count;
    return sum;
  }
  const sumOfArray = ( array, initialValue = 0) =>{
    const sumWithInitial = array.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      initialValue
    );
    return sumWithInitial;
  }
  const progressValues = () =>{
    const sum = sumOfArray(userFiles.filter(uf=>uf.fileId===currentFile).map(uf=>uf.count))
    const fff = userFiles.filter(uf=>uf.fileId===currentFile).sort((a,b)=>b.status-a.status).map((c,idx)=>{return {status: c.status, count: userFiles.filter(uf=>uf.fileId===currentFile).sort((a,b)=>b.status-a.status).map(uf=>uf.count)[idx], percent: Math.round(sumOfArray(userFiles.filter(uf=>uf.fileId===currentFile).sort((a,b)=>b.status-a.status).map(uf=>uf.count).slice(0,idx+1))/sum*1000)/10}})
    return fff.sort((a,b)=>b.percent-a.percent)
  }
  const tabColors = ['blue','purple','orange','rose'];
  const colors = ['#78909c','#42a5f5', '#ce93d8','#ffa726','#26c6da','#8bd346','#fb7185','#10b981']
  const [progress, setProgress] = useState([])
  useEffect(() => {
    setProgress(progressValues())
  }, [userFiles, currentFile])
  const [showToolTip, setShowToolTip] = useState([false, false, false, false, false, false, false, false]);
  return (
    <div
      className={`w-full text-gray-500 dark:text-gray-400 box-border bg-white dark:bg-secondary-dark-bg p-2 md:transition-2 pt-4 mt-[4.5rem]`}
    >
      <div className="sticky top-14 z-50 bg-white dark:bg-secondary-dark-bg h-full">
      <div className="flex justify-between items-center w-full mt-2 gap-3 h-full">
      <div className="flex justify-start items-center w-full gap-3">
        <button onClick={()=>tabClickedHandler(1)} className={`rounded-t pt-2 pb-1 px-3 text-sm text-white ${phrasesFilter===1?'':`hover:bg-blue-300 scale-90 duration-300`} bg-blue-400 h-full`}>{`عبارات خام (${getCount(0) + getCount(1)})`}</button>
        <button onClick={()=>tabClickedHandler(2)} className={`rounded-t pt-2 pb-1 px-3 text-sm text-white ${phrasesFilter===2?'':`hover:bg-purple-300 scale-90 duration-300`} bg-purple-400`}>{`عبارات تگ خورده (${getCount(2)})`}</button>
        <button onClick={()=>tabClickedHandler(3)} className={`relative rounded-t pt-2 pb-1 px-3 text-sm text-white ${phrasesFilter===3?'':`hover:bg-orange-300 scale-90 duration-300`} bg-orange-400`}>
          {`عبارات دارای ابهام (${getCount(3)})`}
          {counts[0]>0 && <span
                      className="absolute inline-flex bg-red-500 rounded-full h-6 w-6 end-0 top-0 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white justify-center items-center"
          >{counts[0]}</span>}
        </button>
        <button onClick={()=>setPhrasesFilter(4)} className={`relative rounded-t pt-2 pb-1 px-3 text-sm text-white ${phrasesFilter===4?'':`hover:bg-rose-300 scale-90 duration-300`} bg-rose-400`}>
          {`عبارات برگشت شده (${getCount(6)})`}
          {counts[1]>0 && <span
                      className="absolute inline-flex bg-red-500 rounded-full h-6 w-6 end-0 top-0 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white justify-center items-center"
          >{counts[1]}</span>}
        </button>
        <HiOutlineRefresh className='cursor-pointer text-xl text-fuchsia-600 hover:text-purple-700 dark:text-orange-600 dark:hover:text-orange-700' onClick={()=>tabClickedHandler(phrasesFilter)}/>
      </div>
      <div className="flex justify-end items-center w-full gap-1 pe-4">
        <p className='text-sm'>تعداد کل عبارات</p>
        <div className="whitespace-pre">
          {userFiles.length > 0 && <DropDown data={[...new Map(userFiles.map(item => [item.file, item])).values()]} fields={{title: 'file', value: 'fileId'}} beginFrom="end" value={currentFile?currentFile:[]} onChange={(s)=>changeCurrentFileHandler(s)}/>}
        </div>
        <p className='text-sm'>: {sumOfArray(userFiles.filter(uf=>uf.fileId._id===currentFile).map(uf=>uf.count))}</p>
        {errorMsg && <p className='text-xs text-red-400'>{errorMsg}</p>}
        {successMsg && <p className='text-xs text-green-400'>{successMsg}</p>}
      </div>
      </div>
      <hr className={`w-full border-8 ${phrasesFilter===1?'rounded-te-lg':'rounded-t-md'}  mb-1 ${phrasesFilter === 1 && 'border-blue-400'} ${phrasesFilter === 2 && 'border-purple-400'} ${phrasesFilter === 3 && 'border-orange-400'} ${phrasesFilter === 4 && 'border-rose-400'}`}/>
      </div>
      {phrasesFilter === 1 && <Tagging1 type='tagging' currentFile={currentFile} refreshStat={()=>getUserFiles()}/>}
      {phrasesFilter === 2 && <Tagging2 type='tagging' fields={fields} currentFile={currentFile} refreshStat={()=>getUserFiles()}/>}
      {phrasesFilter === 3 && <Tagging3 currentFile={currentFile} refreshStat={()=>getUserFiles()}/>}
      {phrasesFilter === 4 && <Tagging1 type='rejected' currentFile={currentFile} refreshStat={()=>getUserFiles()}/>}

      {/* {loading && <div className='w-full h-60 flex justify-center items-center'><p className='text-xl font-bold text-blue-400'>در حال دریافت عبارات جدید....</p></div>} */}
      {/* {!loading && <div className="fixed rounded-md w-[calc(100vw-1rem)] mx-2 bottom-7 end-0 px-3 h-12 bg-stone-300 flex justify-start items-start gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600">
          {phrases.sort((a,b)=>b.order-a.order).map((p,idx)=><div key={idx} className={`flex justify-between items-center gap-1 border-1 rounded p-1 px-2 mt-2 ${phrases.filter(p=>p.status===1).filter((p,idx)=>idx===0)[0]?.phrase.text === p.phrase.text && 'border-4 border-red-600 mt-[0.25rem]'} ${p.status===1?'bg-blue-200':p.status===2?'bg-green-200':'bg-red-200'}`}>{p.status===2 && <TiTick className='text-[#36d7b7] text-md'/>}<p className='text-xs whitespace-pre'>{p.phrase.text}</p></div>)}
        </div>} */}
        <div className="fixed bottom-2 start-0 w-[calc(100vw-1rem)] mx-2">
      <div className="relative w-full h-9 bg-gray-200 my-1 rounded-b-md overflow-hidden dark:bg-gray-600">
        {progress.map((p, idx)=><div key={idx} style={{width: `${Math.round(p.percent)}%`, background: colors[p.status]}} className="absolute start-0 top-0 h-3"></div>)}
        <div className="absolute start-0 top-5 h-3 px-3 w-full flex justify-start items-center gap-4">{progress.map((p, idx)=>
          <div className="relative flex justify-start items-center gap-1" onMouseEnter={()=>setShowToolTip(showToolTip.map((s, index)=>{if(index===p.status){return true}else{false}}))} onMouseLeave={()=>setShowToolTip(showToolTip.map((s, index)=>{if(index===p.status){return false}else{s}}))}>
            <div style={{background: colors[p.status]}} className='w-3 h-3 rounded-full'></div>
            <p className='text-xs'>{['خام','در اختیار کارشناس','تگ خورده','دارای ابهام','در اختیار بازبین','','برگشت شده','تائید شده'][p.status]}</p>
            <div className={`absolute top-0 start-1/2 translate-x-1/3 -translate-y-full px-2 bg-black bg-opacity-50 text-white text-xs ${!showToolTip[p.status] && 'hidden'}`}>{p.count}</div>
          </div>)}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Tagging;
