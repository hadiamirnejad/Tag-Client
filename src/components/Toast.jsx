import React, { useEffect, useInsertionEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {BsPin, BsFillPinFill} from 'react-icons/bs'

function Toast({positionX="end-0", positionY="top-2", duration=3}) {
  const { toastList } = useSelector((state) => ({
    toastList: state.toast,
  }));
  const dispatch = useDispatch();
  const removeHandler = (id)=>{
    dispatch({
      type: "REMOVE_TOAST",
      id: id,
    });
  }
  return (
    <div className={`fixed ${positionX} ${positionY} w-72 z-50 flex flex-col gap-2`}>
      {toastList.map((toast, idx)=>(
        <ToastElement key={idx} removeHandler={removeHandler} toast={toast} second={duration}/>
      ))}
    </div>
  )
}

function ToastElement({removeHandler, toast, second}) {
  const { theme } = useSelector((state) => ({
    theme: state.item,
  }));
  const [timer, setTimer] = useState({pause: false, value: second*1000})
  const [backgroundColor, setBackgroundColor] = useState()

  useEffect(()=>{
    switch (toast.type) {
      case 'success':
        setBackgroundColor(`${theme.themeMode==='Dark'?'bg-green-500':'bg-green-200'}`)
        break;
      case 'error':
        setBackgroundColor(`${theme.themeMode==='Dark'?'bg-red-500':'bg-red-200'}`)
        break;
      case 'warning':
        setBackgroundColor(`${theme.themeMode==='Dark'?'bg-amber-500':'bg-amber-200'}`)
        break;
      case 'info':
        setBackgroundColor(`${theme.themeMode==='Dark'?'bg-blue-500':'bg-blue-200'}`)
        break;
    
      default:
        setBackgroundColor(`${theme.themeMode==='Dark'?'bg-green-500':'bg-green-200'}`)
        break;
    }
  },[theme])

  let interval;
  const updateTimer = () => {
    interval = !interval && setInterval(() => {
      setTimer(pre=>{
        if(Math.max(pre.value-100,0)<=0){
          removeHandler(toast.id);
        }
        if(pre.pause) {
          return pre
        }
        else{
          return {...pre, value: Math.max(pre.value-100,0)}
        }
      })
    }, 100)

    if(timer.pause) clearInterval(interval)
  }
  
  useEffect(() => {
    updateTimer();
    return () => {
      // clear timeout when component unmounts
      clearInterval(interval);
    };
  }, [])
  
  return (
    <div className={`${backgroundColor} w-full rounded-s-md p-3 animate-[wiggle_1s_ease-in-out_infinite] transition-all duration-700  dark:text-gray-200`}>
    <div className={`text-sm`}>
      <div className="flex justify-between items-center">
        <button className='cursor-pointer hover:text-gray-600 text-sm font-bold' onClick={()=>removeHandler(toast.id)}>X</button>
        <p>{timer.value/1000}</p>
        {timer.pause?<BsFillPinFill className='cursor-pointer hover:text-gray-600' onClick={()=>{setTimer({...timer, pause: false})}}/>:<BsPin className='cursor-pointer hover:text-gray-600' onClick={()=>{setTimer({...timer, pause: true})}}/>}
      </div>
      
      <hr className={`flex justify-between items-center my-1 ${backgroundColor}`}/>
      <p className='font-bold text-xs my-1'>{toast.title}</p>
      <p className='text-xs'>{toast.description}</p>

      {/* <p>{toast.id}</p> */}
    </div>
  </div>
  )
}

export default Toast