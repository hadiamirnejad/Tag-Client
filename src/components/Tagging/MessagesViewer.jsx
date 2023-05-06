import React, { createRef, useEffect } from 'react'
import { useState } from 'react'
import { useRef } from 'react'
import useKey from '../../hooks/useKey'
import {FiCopy} from 'react-icons/fi'
import { useLinkClickHandler } from 'react-router-dom'
import { useDispatch } from 'react-redux'

function MessagesViewer({messages, boldPhrases='', showMsgCount=9, minHeight=32, showCountPrev, mainViewCoff=2}) {
  const parentElementRef = useRef(null)
  const [eachHeight, setEachHeight] = useState(1)
  const [prevShowCount, setPrevShowCount] = useState(showCountPrev?showCountPrev+1:Math.floor(Math.min(messages.length,showMsgCount)/2))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [startMsgIndex, setStartMsgIndex] = useState(0)
  const dispatch = useDispatch();

  const elementsRef = useRef(messages.map(() => createRef()));
  useEffect(()=>{
    const parentElementHeight = parentElementRef.current.clientHeight
    setEachHeight(Math.max(minHeight,Math.floor(parentElementHeight/(messages.length + 1))))
  },[])

  const getHighlightedText=(text='', highlight)=> {
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return <span> { parts.map((part, i) => 
        <span key={i} className={`${part.toLowerCase() === highlight.toLowerCase() && 'text-red-600 dark:text-amber-500 font-bold'}`}>
            { part }
        </span>)
    } </span>;
  }

  useKey(35, (e)=>{
    //ArrowUp
    setStartMsgIndex(messages.length-Math.min(messages.length,showMsgCount))
    setCurrentIndex(Math.min(messages.length,showMsgCount)-1)
  })

  useKey(36, (e)=>{
    //ArrowUp
    setStartMsgIndex(0)
    setCurrentIndex(0)
  })

  useKey(38, (e)=>{
    //ArrowUp
    ScrollUp(e);
  })
  
  useKey(40, (e)=>{
    //ArrowDown
    ScrollDown(e);
  })

  const ScrollUp = (e)=>{
    let jump =1;
    if(e.shiftKey){
      jump=5;
    }
    if(currentIndex<=0){
      setCurrentIndex(0)
      setStartMsgIndex(0)
      return;
    }
    if(startMsgIndex===0 || (startMsgIndex >= messages.length-Math.min(messages.length,showMsgCount) && currentIndex>showCountPrev)){
      setCurrentIndex(Math.max(currentIndex-jump, 0))
    }
    else{
      setStartMsgIndex(Math.max(startMsgIndex-jump,0))
    }
  }

  const ScrollDown = (e)=>{
    let jump =1;
    if(e.shiftKey){
      jump=5;
    }
    if(currentIndex>=Math.min(messages.length,showMsgCount)-1){
      setCurrentIndex(Math.min(messages.length,showMsgCount)-1)
      setStartMsgIndex(messages.length-Math.min(messages.length,showMsgCount))
      return;
    }
    if((startMsgIndex===0 && currentIndex<showCountPrev ) || startMsgIndex >= messages.length-Math.min(messages.length,showMsgCount)){
      setCurrentIndex(Math.min(currentIndex+jump, Math.min(messages.length,showMsgCount)-1))
    }
    else{
      setStartMsgIndex(Math.min(startMsgIndex+jump,messages.length-Math.min(messages.length,showMsgCount)))
    }
  }
  const clickHandler = (idx)=>{
    setCurrentIndex(idx)
  }
  const [msgs, setMsgs] = useState([]);
  const copyHandler = (text) =>{
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Unable to copy to clipboard', err);
    }
    document.body.removeChild(textArea);

    dispatch({
      type: "ADD_TOAST",
      toast: {
        id: Math.floor(Math.random()*3000),
        title: 'متن کپی شد',
        description: text,
        type: 'success'
      },
    });
  }
  
  return (
    <div onWheel={(e)=>{if(e.deltaY < 0){ScrollUp(e)}else{ScrollDown(e);}}} ref={parentElementRef} id='parent' className='h-full w-full overflow-y-auto flex flex-col gap-1'>
      {[...Array(Math.min(messages.length,showMsgCount))].map((_,idx,self)=><div ref={elementsRef.current[idx]} onClick={()=>clickHandler(idx)} key={idx} style={{height:idx===currentIndex?eachHeight*mainViewCoff:eachHeight}} className={`${idx===currentIndex?'border-4 border-slate-400 bg-slate-200 dark:bg-gray-500 flex items-center text-2xl font-bold':'border border-slate-300 truncate text-md dark:border-gray-500'} cursor-pointer dark:text-gray-200 rounded-md w-full text-md px-2 flex items-center`}><div className='flex-grow'><span className={`${idx===currentIndex?'text-gray-400 dark:text-gray-400':'text-gray-400 dark:text-gray-500'} font-bold`}>{`${startMsgIndex+idx+1}/${messages.length}- `}</span>{getHighlightedText(messages[startMsgIndex+idx],boldPhrases)}</div><FiCopy onClick={()=>copyHandler(messages[startMsgIndex+idx])} className='cursor-pointer hover:text-gray-400'/></div>)}
    </div>
  )
}

export default MessagesViewer