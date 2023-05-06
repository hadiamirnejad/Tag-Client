import React, { useEffect, useState } from 'react'
import { ImMoveDown } from 'react-icons/im'
import { MdOutlineLiveHelp } from 'react-icons/md'
import { TiTick } from 'react-icons/ti'
import { CgMoreVertical } from 'react-icons/cg'
import PulseLoader from 'react-spinners/PulseLoader'
import { RadioButton, MultiSelect, MultiSelectComponent} from '..'
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { useRef } from 'react'
import useOutsideClicked from '../../hooks/useOutsideClick'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import useToken from '../../hooks/useToken'

function Tagging3({currentFile, refreshStat}) {
  const { user, theme } = useSelector((state) => ({
    theme: state.item,
    user: state.auth.user
  }));
  const [showNavbar, setShowNavbar] = useState(true)
  const [fields, setFields] = useState([])
  const [phrases, setPhrases] = useState([])
  const [currentPhrase, setCurrentPhrase] = useState();
  const dispatch = useDispatch();

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
    getFields();
  },[])

  const getPhrasesHandler = async (status)=>{
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

      const newPhrases = response.data.phrases;

      setPhrases(newPhrases.map(r=>{if(r.phraseTags.length > 0) {return {...r,phraseTags:r.phraseTags[r.phraseTags.length - 1]}}else{return {...r,phraseTags:{user: user._id, tags:r.tagTemplate.template.map(tt=>{return {text: tt.text, hint: tt.hint, type: fields.filter(f=>f._id===tt.field)[0].type, fields: fields.filter(f=>f._id===tt.field)[0].parameters, values: tt.default}}), date: (new Date()).getTime()}}}}))
      
    } catch (error) {
      
    }
  }

  useEffect(()=>{
    getPhrasesHandler(3);
  },[fields, currentFile])

  const [open, setOpen] = useState(false);
  
  const [accessToken] = useToken();

  const modalRef = useRef();

  useOutsideClicked(modalRef,()=>{
    setOpen(false)
  })

  const getHighlightedText=(text='مثال', highlight)=> {
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return <span> { parts.map((part, i) => 
        <span key={i} className={`${part.toLowerCase() === highlight.toLowerCase() && 'text-red-600 font-bold'} `}>
            { part }
        </span>)
    } </span>;
  }

  const submitPhraseTag = async (id)=>{
    console.log(phrases.filter(p=>p._id===id)[0])
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/submitPhrasesTag`,{
        ids: [id],
        tags: [phrases.filter(p=>p._id===id)[0].phraseTags],
        userId: user._id
      },{headers:{accessToken}})

      if(response.data.error){
        return setErrorMsg(response.data.error)
      }
      
      getPhrasesHandler(3);
      refreshStat();
      dispatch({
        type: "ADD_TOAST",
        toast: {
          id: Math.floor(Math.random()*3000),
          title: 'موفق',
          description: 'عبارت با موفقیت ثبت شد.',
          type: 'success'
        },
      });
    } catch (error) {
      console.log(error)
    }
  }

  const openSampleModal = (p) => {
    setCurrentPhrase(p);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  if(phrases.length === 0){
    return <div className='w-full h-60 flex justify-center items-center text-xs font-bold'>عبارت دارای ابهام یافت نشد</div>
  }
  return (
    <div className='grid grid-cols-2 gap-2 items-center justify-start w-full'>

      {phrases.map((p, idx)=>
      <div key={idx} className={`col-span-1 relative border border-blue-200 dark:border-gray-400 rounded-md bg-white dark:bg-gray-500 p-2 h-full`}>
        <div className='flex justify-between items-center gap-2'>
          <div className="flex justify-start items-center gap-2">
            <p className='flex justify-center items-center rounded-md bg-blue-300 text-white py-1 px-2 w-6'>{idx+1}</p>
            <div className='flex justify-start items-center gap-4'><p className='text-gray-800 dark:text-gray-100'>{p.phrase.text}</p><CgMoreVertical onClick={()=>{console.log(p.phrase);openSampleModal(p.phrase)}} className='cursor-pointer'/></div>
            <p className='text-xs text-center text-red-700 dark:text-amber-300 font-bold'>{p.userChecked?.name && `بازبین: (${p.userChecked?.name})`}</p>
          </div>
        {p.userChecked?.name && <button onClick={()=>submitPhraseTag(p._id)} className='rounded border border-gray-300 dark:border-gray-400 bg-blue-400 py-1 px-3 text-sm text-white hover:bg-blue-300'>تائید نهایی</button>}
        </div>
      {p.phraseTags.tags.map((t, tIdx)=>
        <div key={tIdx} className='my-3 w-full'>
          <p className='relative text-sm whitespace-pre text-red-700 dark:text-amber-400 mb-1'>{t.text}:</p>
          <div className="flex items-center rounded text-sm w-full">
            {t.type ===0 && <p className='my-auto text-gray-800 dark:text-gray-100'>{t.values.join('|')}</p>}
            {t.type ===1 && <p className='my-auto text-gray-800 dark:text-gray-100'>{t.values.join('|')}</p>}
            {t.type ===2 && <p className='my-auto text-gray-800 dark:text-gray-100'>{t.values.length>0?t.values[0]:''}</p>}
            {t.type ===3 && <p className='my-auto text-gray-800 dark:text-gray-100'>{t.values[0]===true?'بله':'خیر'}</p>}
          </div>
        </div>
      )}
      {/* {p.phrase.samples.length > 0 && p.phrase.samples.slice(currentSample[idx] * 3, (currentSample[idx] + 1) * 3).map((ps, psIdx)=><p key={psIdx} onClick={()=>{setCurrentSample(currentSample.map((ele, csIdx)=>csIdx===currentPhrase?(ele+1)%Math.ceil(phrases[currentPhrase].phrase.samples.length/3):ele))}} className='border border-slate-500 rounded-md w-full text-xs p-2 mt-2'><span className='text-blue-400 font-bold'>{`${p.phrase.samples.indexOf(ps)+1}/${p.phrase.samples.length}: `}</span>{getHighlightedText(ps,p.phrase.text)}</p>)} */}
      </div>)}
      <Modal
        open={open}
        onClose={handleClose}
      >
        <div dir={theme.direction} className='w-full h-screen flex justify-center items-center'>
          <div ref={modalRef} className={`w-3/4 h-3/4 bg-white ${theme.themeMode==='Dark' && 'text-white bg-secondary-dark-bg'} rounded overflow-y-auto`}>
            <h2 className='w-full font-bold text-xl text-center'>{currentPhrase && currentPhrase.text}</h2>
            {currentPhrase && currentPhrase.samples.map((ps, psIdx)=><p key={psIdx} className='border border-slate-300 rounded-md w-full text-md p-2 mt-1'><span className='text-blue-400 font-bold'>{`${psIdx+1}/${currentPhrase.samples.length}: `}</span>{getHighlightedText(ps,currentPhrase.text)}</p>)}
          </div>
        </div>
      </Modal>
    </div>
  )
}

const TextBox = ({value='', source, onChange, id, onClick, tabIndex, placeholder='متن را وارد نمایید', fontSize='text-xs', hint})=>{
  const [showHint, setShowHint] = useState(false)
  return (
    <div onClick={onClick} className={`flex flex-wrap items-center gap-1`}>
        <div className="flex justify-between items-center gap-1 w-full">
          <input id={id} tabIndex={tabIndex} className={`py-1 px-2 w-full rounded ${fontSize}`} value={value} onInput={(e)=>onChange(e.target.value)} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder}/>
          <button onClick={()=>onChange(source.replaceAll(' ', '*'))} className='p-1 w-6 rounded bg-blue-300 hover:bg-blue-200 text-xs'>*</button>
          <button onClick={()=>onChange(source.replaceAll(' ', '/'))} className='p-1 w-6 rounded bg-blue-300 hover:bg-blue-200 text-xs'>/</button>
          <button onClick={()=>onChange(source)} className='p-1 w-6 rounded bg-blue-300 hover:bg-blue-200 text-xs'>کل</button>
        </div>
        {showHint && hint && hint !== '' && <div className='absolute -bottom-1 translate-y-full z-50 w-fit text-gray-200 text-xs bg-gray-700 py-1 px-2 rounded-md whitespace-pre'>{d[fields.hint]}</div>}
    </div>
  )
}

const Hint = ({hint})=>{
  const [showHint, setShowHint] = useState(false)
  return (
    <div className="relative">
    <MdOutlineLiveHelp className='cursor-help' onMouseEnter={()=>setShowHint(true)} onMouseLeave={()=>setShowHint(false)}/>
      {showHint && hint && hint !== '' && <div className='absolute -bottom-1 translate-y-full z-50 w-fit text-gray-200 text-xs bg-gray-700 py-1 px-2 rounded-md whitespace-pre'>{hint}</div>}
    </div>
  )
}

export default Tagging3