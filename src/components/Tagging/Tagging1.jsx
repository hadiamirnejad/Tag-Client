import React, { createRef, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {RadioButton, MultiSelect} from '../';
import {MdOutlineLiveHelp} from 'react-icons/md'
import {AiFillTwitterCircle} from 'react-icons/ai'
import axios from 'axios';
import useToken from '../../hooks/useToken';
import useKey from '../../hooks/useKey';
import MessagesViewer from './MessagesViewer';
import RotateLoader from 'react-spinners/RotateLoader'

function Tagging1({type='tagging', currentFile, refreshStat}) {
  const { user, theme } = useSelector((state) => ({
    theme: state.item,
    user: state.auth.user
  }));
  const dispatch = useDispatch();
  const [accessToken] = useToken();

  const [phrase, setPhrase] = useState(null)
  const [fields, setFields] = useState([])

  const [loading, setLoading] = useState(false)
  const [tag, setTag] = useState()
  const [activeElement, setActiveElement] = useState()
  const getPhrasesHandler = async (status)=>{
    setLoading(true)
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/getPhrases`,{
        currentFile: currentFile,
        userId: user._id,
        status: status,
        forUsers: type==='tagging'?user._id:null
      },{
        headers:{accessToken}
      })

      if(response.data.error){
        dispatch({
          type: "ADD_TOAST",
          toast: {
            id: Math.floor(Math.random()*3000),
            title: 'خطا',
            description: response.data.error,
            type: 'error'
          },
        });
        return;
      }

      const newPhrase = response.data.phrases.length>0?response.data.phrases[0]:null;

      if(!newPhrase && status===1){
        return getPhrasesHandler(0);
      }
      setPhrase(newPhrase)
      setActiveElement(1)
      const nextElement = document.getElementById('1');
      if(!nextElement) return setLoading(false);
      nextElement.focus();
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }

  useEffect(() => {
    getFields();
  }, [])
  
  useEffect(() => {
    if(type==='tagging'){
      getPhrasesHandler(1);
    }
    if(type==='rejected'){
      getPhrasesHandler(6);
    }
    if(type==='conflict'){
      getPhrasesHandler(3);
    }
  }, [fields, currentFile])

  useEffect(() => {
    if(!phrase) return;
    const values = (phrase && phrase.phraseTags.length>0)?phrase.phraseTags.slice(-1)[0]:null;
    const template = phrase?phrase.tagTemplate.template:null;
    setTag(values?values:{user: user._id, tags:template.map(tt=>{return {text: tt.text, hint: tt.hint, type: tt.field.type, fields: tt.field.parameters, values: tt.default}}), date: (new Date()).getTime()})
  }, [phrase])
  
  
  const getFields = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/getFields`);

      if(response.data.error){
        dispatch({
          type: "ADD_TOAST",
          toast: {
            id: Math.floor(Math.random()*3000),
            title: 'خطا',
            description: response.data.error,
            type: 'error'
          },
        });
        return;
      }

      setFields(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  const sendTagHandler = async(status)=>{
    setLoading(true)
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/editPhrase`,{
        tag: tag,
        id: phrase._id,
        status: (type==='tagging' && phrase.status===6)?4:status,
        checker: type==='tagging'?null:user._id,
        userId: user._id,
        state: type==='tagging'?phrase.status===6?1:0:3,
      },{headers:{accessToken}})

      if(response.data.error){
        dispatch({
          type: "ADD_TOAST",
          toast: {
            id: Math.floor(Math.random()*3000),
            title: 'خطا',
            description: response.data.error,
            type: 'error'
          },
        });
        return;
      }
      dispatch({
        type: "ADD_TOAST",
        toast: {
          id: Math.floor(Math.random()*3000),
          title: 'موفق',
          description: 'عبارت با موفقیت ثبت شد.',
          type: 'success'
        },
      });
      
      if(type==='tagging'){
        getPhrasesHandler(1);
        refreshStat();
      }
      if(type==='rejected'){
        getPhrasesHandler(6);
      }
      if(type==='conflict'){
        getPhrasesHandler(3);
      }
      setLoading(false)
    } catch (error) {
      dispatch({
        type: "ADD_TOAST",
        toast: {
          id: Math.floor(Math.random()*3000),
          title: 'خطا',
          description: error,
          type: 'error'
        },
      });
    }
  }

  const conflictTagHandler = async()=>{
    setLoading(true)
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/conflictPhrase`,{
        tag: tag,
        id: phrase._id
      },{headers:{accessToken}})

      if(response.data.error){
        dispatch({
          type: "ADD_TOAST",
          toast: {
            id: Math.floor(Math.random()*3000),
            title: 'خطا',
            description: response.data.error,
            type: 'error'
          },
        });
        return;
      }
      
      if(type==='tagging'){
        getPhrasesHandler(1);
        refreshStat();
      }
      if(type==='rejected'){
        getPhrasesHandler(6);
      }
      if(type==='conflict'){
        getPhrasesHandler(3);
      }
      setLoading(false)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    try{
      const firstElement = document.getElementById('1')
      firstElement.focus();
    }
    catch(e){}
  }, [phrase])

  useKey(13, (e)=>{
    //Enter
    if(!phrase) return;
    const template = phrase.tagTemplate.template
    let nextElementId;
    if(e.shiftKey){
      if(activeElement > 1){
        nextElementId = activeElement - 1;
      }
      else{
        nextElementId = 1;
      }
    }
    else{
      if(activeElement <= template.length){
        nextElementId = activeElement + 1;
      }
      else{
        return setActiveElement(template.length);
      }
    }
    setActiveElement(nextElementId)
    const nextElement = document.getElementById(nextElementId.toString());
    if(nextElementId) nextElement.focus();
  })

  useKey(111, (e)=>{
    //Shift+/
    if(!phrase) return;
    const template = phrase.tagTemplate.template;
    if(e.shiftKey){
      e.preventDefault();
      if(activeElement <= template.length && template[activeElement-1].field.type === 2){
        setTag(tag=> {return {date: tag.date, user:tag.user, tags:tag.tags.map((tat, tatIdx)=>{if(tatIdx === activeElement - 1){return {text: tat.text, hint: tat.hint, type: tat.type, fields: tat.fields, values:[phrase.phrase.text + '/']}}else{return tat}})}})
      }
    }
  })

  useKey(106, (e)=>{
    //Shift+*
    if(!phrase) return;
    const template = phrase.tagTemplate.template;
    if(e.shiftKey){
      e.preventDefault();
      if(activeElement <= template.length && template[activeElement-1].field.type === 2){
        setTag(tag=> {return {date: tag.date, user:tag.user, tags:tag.tags.map((tat, tatIdx)=>{if(tatIdx === activeElement - 1){return {text: tat.text, hint: tat.hint, type: tat.type, fields: tat.fields, values:[phrase.phrase.text.replaceAll(' ','*')]}}else{return tat}})}})
      }
    }
  })
  
  useKey(109, (e)=>{
    //Shift+-
    if(!phrase) return;
    const template = phrase.tagTemplate.template;
    if(e.shiftKey){
      e.preventDefault();
      if(activeElement <= template.length && template[activeElement-1].field.type === 2){
        setTag(tag=> {return {date: tag.date, user:tag.user, tags:tag.tags.map((tat, tatIdx)=>{if(tatIdx === activeElement - 1){return {text: tat.text, hint: tat.hint, type: tat.type, fields: tat.fields, values:[phrase.phrase.text]}}else{return tat}})}})
      }
    }
  })
  
  useKey(112, (e)=>{
    //F1
    if(!phrase) return;
    const template = phrase.tagTemplate.template;
    e.preventDefault();
  })

  const openInTwitter = (text) => {
    window.open(`https://twitter.com/search?q=lang:fa "${text}"&src=typed_query`, '_blank', 'noopener,noreferrer');
  };
  const openInVirastaran = (text) => {
    window.open(`https://emla.virastaran.net/?q=${text.replaceAll(' ','+')}`, '_blank', 'noopener,noreferrer');
  };

  if(loading) return (<div className='w-full h-60 flex justify-center items-center text-xs font-bold'><RotateLoader color={`${theme.themeMode==='Dark'?'#F59E0B':'#800B0B'}`}/></div>);
  if(!phrase) {
    return <div className='w-full h-60 flex justify-center items-center text-xs font-bold'>{`${type==='tagging'?'عبارتی برای تگ زدن وجود ندارد':type==='conflict'?'عبارت دارای ابهام یافت نشد':'عبارتی برگشت داده نشده است.'}`}</div>
  }
  return (
    <div className={`w-full relative border border-blue-200 dark:border-none bg-gray-200 dark:bg-gray-600 p-2 h-full`}>
      <div className="grid grid-cols-3 gap-2 h-[calc(100vh-13.25rem)]">
        <div className="col-span-1">
          <div className='flex justify-center items-center gap-4 mb-3 font-bold mt-2'>
            <p className='text-red-500 dark:text-yellow-500 text-2xl border-2 border-red-500 dark:border-yellow-500 text-center py-3 flex-grow rounded-md'>{phrase.phrase.text}</p>
            <div className="flex flex-col justify-between items-center h-full gap-2">
              {type==='conflict' && phrase.userTagged && <div className='text-sm text-red-800 dark:text-amber-500'><p>{`ارسال: ${phrase.userTagged?.name}`}</p></div>}
              {type==='rejected' && phrase.userChecked && <div className='text-sm text-red-800 dark:text-amber-500'><p>{`بازبین: ${phrase.userChecked?.name}`}</p></div>}
              <div className="flex justify-center items-center gap-2 w-full">
                <AiFillTwitterCircle className='cursor-pointer hover:text-gray-700 dark:hover:text-white text-xl' onClick={()=>openInTwitter(phrase.phrase.text)}/>
                <div onClick={()=>openInVirastaran(phrase.phrase.text)} className='p-1 bg-gray-500 dark:bg-gray-400 text-gray-200 dark:text-gray-600 rounded hover:bg-gray-700 dark:hover:bg-white cursor-pointer'>
                  <svg fill='currentcolor' xmlns="http://www.w3.org/2000/svg" width="45" height="13" viewBox="0 0 45 13">
                    <path d="M0 2 0 7.5 2.8 7.5 2.8 13 4.7 13 4.7 7.5 7.5 7.5 7.5 11.2 5.7 11.2 5.7 13 9.3 13 9.3 7.5 7.5 7.5 7.5 2 5.7 2 5.7 5.7 4.7 5.7 4.7 3.7 2.8 3.7 2.8 5.7 1.7 5.7 1.7 2ZM2.8 0 2.8 1.9 4.7 1.9 4.7 0ZM10 3.7 10 13 26.7 13 26.7 8.5 24.8 8.5 24.8 11.2 23 11.2 23 9.4 21.1 9.4 21.1 11.2 19.3 11.2 19.3 9.4 17.4 9.4 17.4 11.2 15.6 11.2 15.6 8.5 13.7 8.5 13.7 11.2 11.9 11.2 11.9 3.7ZM13.7 3.7 13.7 6.7 15.6 6.7 15.6 3.7ZM27.7 3.7 27.7 13 29.6 13 29.6 3.7ZM30.5 13 34.3 13 34.3 9.2 38 9.2 38 4.5 36.1 4.5 36.1 7.3 32.4 7.3 32.4 11.1 30.5 11.1ZM38 11.1 35 11.1 35 13 38 13ZM39 3.5 39 9.2 42.8 9.2 42.8 11.1 39 11.1 39 13 44.7 13 44.7 3.5ZM42.8 7.3 40.9 7.3 40.9 5.4 42.8 5.4 42.8 7.3Z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          {tag && tag.tags.map((t, tIdx)=>
            <div key={tIdx} className='mt-4'>
              {t.type !==3 && <div className="flex items-center justify-start"><p className='relative text-sm font-bold text-red-800 dark:text-amber-500 mb-1'><span className='text-gray-400 dark:text-gray-500'>{tIdx+1}- </span>{t.text}</p><Hint hint={t.hint}/></div>}
              {t.type ===3 && <div className="flex items-center justify-start"><div className="text-sm font-bold text-red-800 dark:text-amber-500 flex items-center justify-start"><span className='text-gray-400 dark:text-gray-500'>{tIdx+1}- </span><MultiSelect id={`${tIdx + 1}`} tabIndex={tIdx + 1} onClick={()=>setActiveElement(tIdx + 1)} data={t.fields} fields={{title: 'title', value:'title', hint: 'hint'}} value={t.values[0]?[t.fields[0].title]:[]} onChange={(s)=>setTag({date: tag.date, user:tag.user, tags:tag.tags.map((tat, tatIdx)=>{if(tatIdx === tIdx){return {text: tat.text, hint: tat.hint, type: tat.type, fields: tat.fields, labels:[s[0]===tat.fields[0].title], values:[s[0]===tat.fields[0].title]}}else{return tat}})})}/></div><Hint hint={t.hint}/></div>}
              <div className="border border-md dark:border-0 p-2">
                {t.type ===0 && <RadioButton id={`${tIdx + 1}`} tabIndex={tIdx + 1} onClick={()=>setActiveElement(tIdx + 1)} data={t.fields} fields={{title: 'title', value:'value', hint: 'hint'}} value={t.values} onChange={(s)=>setTag({date: tag.date, user:tag.user, tags:tag.tags.map((tat, tatIdx)=>{if(tatIdx === tIdx){return {text: tat.text, hint: tat.hint, type: tat.type, fields: tat.fields, labels:s.map(sss=>tt.fields.filter(tf=>tf.value===sss)[0]), values:s}}else{return tat}})})}/>}
                {t.type ===1 && <MultiSelect id={`${tIdx + 1}`} tabIndex={tIdx + 1} onClick={()=>setActiveElement(tIdx + 1)} data={t.fields} fields={{title: 'title', value:'value', hint: 'hint'}} value={t.values} onChange={(s)=>setTag({date: tag.date, user:tag.user, tags:tag.tags.map((tat, tatIdx)=>{if(tatIdx === tIdx){return {text: tat.text, hint: tat.hint, type: tat.type, fields: tat.fields, labels:s.map(sss=>tat.fields.filter(tf=>tf.value===sss)[0].title), values: s}}else{return tat}})})} showIndex={true}/>}
                {t.type ===2 && <TextBox id={`${tIdx + 1}`} tabIndex={tIdx + 1} onClick={()=>setActiveElement(tIdx + 1)} value={t.values.length>0?t.values[0]:''} source={phrase.phrase.text} onChange={(s)=>setTag({date: tag.date, user:tag.user, tags:tag.tags.map((tat, tatIdx)=>{if(tatIdx === tIdx){return {text: tat.text, hint: tat.hint, type: tat.type, fields: tat.fields, labels:[s], values:[s]}}else{return tat}})})}/>}
              </div>
            </div>
          )}
          {tag && <button id={`${tag.tags.length + 1}`} onKeyDown={(e)=>{if(e.key === 'Enter'){sendTagHandler(type==='tagging'?2:3)}}} onClick={()=>sendTagHandler(type==='tagging'?2:type==='conflict'?3:4)} className='rounded border w-full bg-green-400 py-1 px-3 my-2 mx-auto text-sm text-white hover:bg-green-300 dark:border-none'>ثبت</button>}
          {type==='tagging' && tag && <button id={`${tag.tags.length + 2}`} onKeyDown={(e)=>{if(e.key === 'Enter'){}}} onClick={()=>conflictTagHandler()} className='rounded border w-full  bg-orange-400 py-1 px-3 my-2 mx-auto text-sm text-white hover:bg-orange-300 dark:border-none'>ارسال برای بازبین (دارای ابهام)</button>}
          {/* {type==='checking' && <button id={`${tag.tags.length + 1}`} onKeyDown={(e)=>{if(e.key === 'Enter'){sendTagHandler(idx, 5)}}} onClick={()=>sendTagHandler(idx, 5)} className='rounded border w-full bg-blue-400 py-1 px-3 my-2 mx-auto text-sm text-white hover:bg-blue-300'>اصلاح</button>}
          {type==='checking' && <button id={`${tag.tags.length + 1}`} onKeyDown={(e)=>{if(e.key === 'Enter'){sendTagHandler(idx, 6)}}} onClick={()=>sendTagHandler(idx, 6)} className='rounded border w-full bg-red-400 dark:bg-orange-600 py-1 px-3 my-2 mx-auto text-sm text-white hover:bg-red-300'>برگشت</button>}
          {type==='checking' && <button id={`${tag.tags.length + 1}`} onKeyDown={(e)=>{if(e.key === 'Enter'){sendTagHandler(idx, 7)}}} onClick={()=>sendTagHandler(idx, 7)} className='rounded border w-full bg-green-400 py-1 px-3 my-2 mx-auto text-sm text-white hover:bg-green-300'>تائید</button>} */}
        </div>
        <div className="col-span-2 h-full overflow-y-auto">
          {/* {phrase.samples.map((ps, psIdx)=><p ref={elementsRef.current[psIdx]} key={psIdx} className={`${sampleIndex===psIdx+1?'border-4 border-slate-400 h-24 flex items-center':'border border-slate-300 h-12'} rounded-md w-full text-md p-2 mt-1`}><span className='text-blue-400 font-bold'>{`${psIdx+1}/${phrase.samples.length}: `}</span>{getHighlightedText(ps,phrase.text)}</p>)} */}
          <MessagesViewer messages={phrase.phrase.samples} boldPhrases={phrase.phrase.text} showMsgCount={12} minHeight={48} showCountPrev={3} mainViewCoff={3}/>
        </div>
      </div>
    </div>
  )
}

const TextBox = ({value='', source, onChange, id, onClick, onKeyDown, tabIndex, placeholder='متن را وارد نمایید', fontSize='text-xs', hint})=>{
  const [showHint, setShowHint] = useState(false)
  return (
    <div onClick={onClick} className={`flex flex-wrap items-center gap-1`}>
        <div className="flex justify-between items-center gap-1 w-full">
          <input id={id} tabIndex={tabIndex} autoComplete="off" onKeyDown={onKeyDown} className={`dark:text-gray-700 py-1 px-2 w-full rounded ${fontSize}`} value={value} onInput={(e)=>onChange(e.target.value)} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder}/>
          <button onClick={()=>onChange(source.replaceAll(' ', '*'))} className='p-1 w-6 rounded bg-blue-300 hover:bg-blue-200 text-xs dark:text-white dark:border-none'>*</button>
          <button onClick={()=>onChange(source + '/')} className='p-1 w-6 rounded bg-blue-300 hover:bg-blue-200 text-xs dark:text-white dark:border-none'>/</button>
          <button onClick={()=>onChange(source)} className='p-1 w-6 rounded bg-blue-300 hover:bg-blue-200 text-xs dark:text-white dark:border-none'>کل</button>
        </div>
        {showHint && hint && hint !== '' && <div className='absolute -bottom-1 translate-y-full z-50 w-fit text-gray-200 text-xs bg-gray-700 py-1 px-2 rounded-md whitespace-pre'>{d[fields.hint]}</div>}
    </div>
  )
}

const Hint = ({hint})=>{
  const [showHint, setShowHint] = useState(false)
  return (
    <div className="relative">
    <MdOutlineLiveHelp className='cursor-help font-normal' onMouseEnter={()=>setShowHint(true)} onMouseLeave={()=>setShowHint(false)}/>
      {showHint && hint && hint !== '' && <div className='absolute -bottom-1 translate-y-full z-50 w-fit text-gray-200 text-xs bg-gray-700 py-1 px-2 rounded-md whitespace-pre'>{hint}</div>}
    </div>
  )
}

export default Tagging1