import React, { useEffect, useState } from 'react'
import { ImMoveDown } from 'react-icons/im'
import { MdOutlineLiveHelp } from 'react-icons/md'
import { TiTick } from 'react-icons/ti'
import { CgMoreVertical } from 'react-icons/cg'
import PulseLoader from 'react-spinners/PulseLoader'
import { RadioButton, MultiSelect, MultiSelectComponent} from '../'
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { useRef } from 'react'
import useOutsideClicked from '../../hooks/useOutsideClick'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import useToken from '../../hooks/useToken'
import { GiConsoleController } from 'react-icons/gi'

function Tagging2({type='tagging', currentFile, refreshStat}) {
  const { user, theme } = useSelector((state) => ({
    theme: state.item,
    user: state.auth.user
  }));

  const dispatch = useDispatch();
  const [showNavbar, setShowNavbar] = useState(true)
  const [accessToken] = useToken();
  const [fields, setFields] = useState([])
  const [phrases, setPhrases] = useState([])
  const [filter, setFilter] = useState()

  const [open, setOpen] = useState(false);


  const [loading, setLoading] = useState(false)
  const [filterdPhrases, setFilterdPhrases] = useState([])
  const [edittingPhrase, setEdittingPhrase] = useState(null)
  const [currentPhrase, setCurrentPhrase] = useState();
  const [template, setTemplate] = useState([]);

  const modalRef = useRef();

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
        return;
      }

      if(response.data.phrases.length > 0){
        setFilter({phraseText:'', users:[], files:[], tags:response.data.phrases[0].tagTemplate.template.map(tt=>[]), tagCheckBox:response.data.phrases[0].tagTemplate.template.map(tt=>false)})
      }
      setPhrases(response.data.phrases)
      setFilterdPhrases(response.data.phrases.map(r=>{if(r.phraseTags.length > 0) {return {...r,phraseTags:r.phraseTags[r.phraseTags.length - 1]}}else{return {...r,phraseTags:{user: user._id, tags:r.tagTemplate.template.map(tt=>{return {text: tt.text, hint: tt.hint, type: tt.field.type, fields: tt.field.parameters, values: tt.default}}), date: (new Date()).getTime()}}}}))
      setTemplate(response.data.phrases[0].tagTemplate.template)
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }
  
  useOutsideClicked(modalRef,()=>{
    setOpen(false)
  })
  
  const getFields = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/getFields`);
      setFields(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    getFields();
  },[])

  useEffect(()=>{
    getFields();
  },[currentFile])
  
  useEffect(()=>{
    if(type==='tagging'){
      getPhrasesHandler(2);
    }
    else{
      getPhrasesHandler(4);
    }
  },[fields, currentFile])

  useEffect(() => {
    filterArray();
  }, [filter])

  const getHighlightedText=(text='مثال', highlight)=> {
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return <span> { parts.map((part, i) => 
        <span key={i} className={`${part.toLowerCase() === highlight.toLowerCase() && 'text-red-600 font-bold'} `}>
            { part }
        </span>)
    } </span>;
  }
  
  const filterArray = ()=>{
    const fff = phrases.map(r=>{if(r.phraseTags.length > 0) {return {...r,phraseTags:r.phraseTags[r.phraseTags.length - 1]}}else{return {...r,phraseTags:{user: user._id, tags:r.tagTemplate.template.map(tt=>{return {text: tt.text, hint: tt.hint, type: tt.field.type, fields: tt.field.parameters, values: tt.default}}), date: (new Date()).getTime()}}}});
    if(phrases.length === 0)return;
    let taggedPhrasesF1 = [...fff.filter(t=>t.phrase.text.indexOf(filter.phraseText) > -1)];
    if(filter.users.length > 0){
      taggedPhrasesF1 = taggedPhrasesF1.filter(p=>filter.users.includes(p.userTagged._id))
    }
    if(filter.files.length > 0){
      taggedPhrasesF1 = taggedPhrasesF1.filter(p=>filter.files.includes(p.fileId._id))
    }
    const taggedPhrasesF2 = taggedPhrasesF1.map(p=>{return {taggedPhrase:p, text:p.phrase.text,types:p.phraseTags.tags.map(pt=>pt.type),phraseTags:p.phraseTags.tags.map(pt=>pt.values)}});
    const result=[];
    for(let i=0;i<taggedPhrasesF2.length;i++){
      let flag = false;
      for(let j=0;j<taggedPhrasesF2[i].types.length;j++){
        switch (taggedPhrasesF2[i].types[j]) {
          case 0:
            if(filter.tags[j] && !filter.tags[j].every(r=> taggedPhrasesF2[i].phraseTags[j].indexOf(r) >= 0)){
              flag=true;
              continue;
            }
            break;
          case 1:
            if(filter.tags[j] && !filter.tags[j].every(r=> taggedPhrasesF2[i].phraseTags[j].indexOf(r) >= 0)){
              flag=true;
            }
            break;
          case 2:
            if(!filter.tagCheckBox[j] && (taggedPhrasesF2[i].phraseTags[j].length>0?taggedPhrasesF2[i].phraseTags[j][0]:'') && (taggedPhrasesF2[i].phraseTags[j].length>0?taggedPhrasesF2[i].phraseTags[j][0]:'').indexOf(filter.tags[j].length>0?filter.tags[j][0]:'')<0){
              flag=true;
            }
            if(filter.tagCheckBox[j] && taggedPhrasesF2[i].phraseTags[j].length === 0){
              flag=true;
            }
            break;
          case 3:
            if(filter.tags[j][0] && !taggedPhrasesF2[i].phraseTags[j].slice(-1)[0]){
              flag=true;
            }
            break;
          }
      }
      if(!flag){
        result.push(taggedPhrasesF2[i])
      }
    }
    setFilterdPhrases(result.map(tf=>tf.taggedPhrase))
  }

  const editPhraseTag = async (id)=>{
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/editPhrase`,{
        tag: edittingPhrase.phraseTags, 
        id: edittingPhrase._id,
        status: edittingPhrase.status, 
        checker: edittingPhrase.status===4?user._id:null,
        state: edittingPhrase.status===4?5:1,
      },{headers:{accessToken}})
      if(response.data.error){
        return setErrorMsg(response.data.error)
      }
      
      setEdittingPhrase(null)
      const newPhrases = phrases.map(p=>{if(p._id===id){return response.data}else{return p}});
      console.log(phrases.map(p=>{if(p._id===id){return response.data}else{return p}}))
      setPhrases(newPhrases)
      setFilterdPhrases(newPhrases.map(r=>{if(r.phraseTags.length > 0) {return {...r,phraseTags:r.phraseTags[r.phraseTags.length - 1]}}else{return {...r,phraseTags:{user: user._id, tags:r.tagTemplate.template.map(tt=>{return {text: tt.text, hint: tt.hint, type: tt.field.type, fields: tt.field.parameters, values: tt.default}}), date: (new Date()).getTime()}}}}))

      // setFilterdPhrases(filterdPhrases.map(p=>{if(p._id===edittingPhrase._id){return {...response.data,phraseTags:response.data.phraseTags[response.data.phraseTags.length - 1]}}else{return p}}))
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
  
  const submitPhraseTags = async (ids)=>{
    if(type === 'tagging'){
      try {
        const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/sendPhrasesTagForCkecker`,{
          ids: ids,
          userId: user._id,
        },{headers:{accessToken}})
  
        if(response.data.error){
          return setErrorMsg(response.data.error)
        }
        dispatch({
          type: "ADD_TOAST",
          toast: {
            id: Math.floor(Math.random()*3000),
            title: 'عملیات موفق',
            description: `${ids.length} تگ برای بازبین ارسال شد`,
            type: 'success'
          },
        });
        setPhrases(pre=>pre.map((p,idx)=>{if(ids.includes(p._id)){return response.data.filter(np=>np._id===p._id)[0]}else{return p}}).filter(p=>p.status<4 || p.status===6))
      } catch (error) {
        console.log(error)
      }
      getPhrasesHandler(2);
      refreshStat();
    }
    else{
      try {
        const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/submitPhrasesTag`,{
          ids: ids,
          tags: ids.map(id=>phrases.filter(p=>p._id===id)[0].phraseTags.slice(-1)),
          checker: user._id
        },{headers:{accessToken}})
    
        if(response.data.error){
          return setErrorMsg(response.data.error)
        }
    
        const newPhrases = phrases.map((p,idx)=>{if(ids.includes(p._id)){return response.data.filter(np=>np._id===p._id)[0]}else{return p}}).filter(p=>p.status===4)
    
        if(newPhrases.length > 0){
          setFilter({phraseText:'', users:[], files:[], tags:newPhrases[0].tagTemplate.template.map(tt=>[]), tagCheckBox:newPhrases[0].tagTemplate.template.map(tt=>false)})
        }
        setFilterdPhrases(newPhrases.map(r=>{if(r.phraseTags.length > 0) {return {...r,phraseTags:r.phraseTags[r.phraseTags.length - 1]}}else{return {...r,phraseTags:{user: user._id, tags:r.tagTemplate.template.map(tt=>{return {text: tt.text, hint: tt.hint, type: fields.filter(f=>f._id===tt.field)[0].type, fields: fields.filter(f=>f._id===tt.field)[0].parameters, values: tt.default}}), date: (new Date()).getTime()}}}}))
        setPhrases(newPhrases)
        dispatch({
          type: "ADD_TOAST",
          toast: {
            id: Math.floor(Math.random()*3000),
            title: 'عملیات موفق',
            description: `${ids.length} تگ تائید شد`,
            type: 'success'
          },
        });
      } catch (error) {
        console.log(error)
      }
      getPhrasesHandler(4);
    }
  }
  
  const rejectPhrasesTag = async (ids)=>{
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/rejectPhrasesTag`,{
        ids: ids,
        tags: ids.map(id=>phrases.filter(p=>p._id===id)[0].phraseTags.slice(-1)),
        checker: user._id
      },{headers:{accessToken}})

      if(response.data.error){
        return setErrorMsg(response.data.error)
      }

      const newPhrases = phrases.map((p,idx)=>{if(ids.includes(p._id)){return response.data.filter(np=>np._id===p._id)[0]}else{return p}}).filter(p=>p.status===4)

      if(newPhrases.length > 0){
        setFilter({phraseText:'', users:[], files:[], tags:newPhrases[0].tagTemplate.template.map(tt=>[]), tagCheckBox:newPhrases[0].tagTemplate.template.map(tt=>false)})
      }
      setFilterdPhrases(newPhrases.map(r=>{if(r.phraseTags.length > 0) {return {...r,phraseTags:r.phraseTags[r.phraseTags.length - 1]}}else{return {...r,phraseTags:{user: user._id, tags:r.tagTemplate.template.map(tt=>{return {text: tt.text, hint: tt.hint, type: fields.filter(f=>f._id===tt.field)[0].type, fields: fields.filter(f=>f._id===tt.field)[0].parameters, values: tt.default}}), date: (new Date()).getTime()}}}}))
      setPhrases(newPhrases)
      dispatch({
        type: "ADD_TOAST",
        toast: {
          id: Math.floor(Math.random()*3000),
          title: 'عملیات موفق',
          description: `${ids.length} عبارت برگشت داده شد.`,
          type: 'success'
        },
      });
    } catch (error) {
      console.log(error)
    }
    getPhrasesHandler(4)
  }

  if(phrases.length === 0) return (
    <div className='w-full h-60 flex justify-center items-center text-xs font-bold'>{`${type==='tagging'?'عبارت تگ خورده‌ای یافت نشد':'عبارتی برای بازبینی یافت نشد'}`}</div>
  )
  else{
    return (
      <div className='w-full bg-stone-100 dark:bg-transparent gap-2'>
        <div className="w-full sticky top-[3.5rem] z-40 bg-white dark:bg-secondary-dark-bg p-2 flex justify-between items-center">
          <div className="flex justify-content items-center gap-2">
            <button onClick={()=>{submitPhraseTags(filterdPhrases.map(f=>f._id));setFilter({phraseText:'', users:[], files:[], tags:phrases[0].tagTemplate.template.map(tt=>[]), tagCheckBox:phrases[0].tagTemplate.template.map(tt=>false)})}} className={`rounded border py-1 px-3 text-sm text-white bg-blue-400 hover:bg-blue-300`}>تائید همه</button>
            {phrases.slice(0,1)[0].status === 4 && <button onClick={()=>{rejectPhrasesTag(filterdPhrases.map(f=>f._id));setFilter({phraseText:'', users:[], files:[], tags:phrases[0].tagTemplate.template.map(tt=>[]), tagCheckBox:phrases[0].tagTemplate.template.map(tt=>false)})}} className={`rounded border py-1 px-3 text-sm text-white bg-red-400 hover:bg-red-300`}>برگشت همه</button>}
          </div>
          <p className='text-sm p-2'>{`تعداد: ${filterdPhrases.length}`}</p>
        </div>
        <div className={`sticky top-[6.5rem] z-40 grid grid-cols-1 md:grid-cols-12 py-1 justify-between items-center border border-blue-200 dark:border-gray-500 rounded-md bg-gray-200 dark:bg-gray-700 px-2 h-full gap-2`}>
          <div className='col-span-1 md:col-span-3 w-full grid grid-cols-2 items-center h-full gap-2'>
            <input className={` ${phrases.slice(0,1)[0].status !== 4?'col-span-2':'col-span-1'} text-gray-700 rounded-md border text-xs py-1 px-2`} placeholder='جستجوی عبارت' value={filter.phraseText} onChange={(e)=>{setFilter({...filter, phraseText:e.target.value})}}/>
            {phrases.length>0 && phrases.slice(0,1)[0].status === 4 && <MultiSelectComponent className='col-span-1' placeholder='انتخاب کارشناس' data={[...new Map(phrases.map(item => [item.userTagged._id, item])).values()].map(p=>{return{value: p.userTagged._id, title: p.userTagged.name}})} fields={{title: 'title', value:'value', hint: 'hint'}} value={filter.users} onChange={(s)=>{setFilter({...filter, users:s})}}/>}
            {phrases.length>0 && phrases.slice(0,1)[0].status === 4 && <MultiSelectComponent className='col-span-1' placeholder='انتخاب فایل' data={[...new Map(phrases.map(item => [item.fileId._id, item])).values()].map(p=>{return{value: p.fileId._id, title: p.fileId.title}})} fields={{title: 'title', value:'value', hint: 'hint'}} value={filter.files} onChange={(s)=>{setFilter({...filter, files:s})}}/>}
          </div>
          <div className="col-span-1 md:col-span-9 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {phrases.length>0 && template.length>0 && template.map((t, tIdx)=>
            <div key={tIdx} className='col-span-1 h-full'>
              <p className='relative whitespace-pre-wrap text-xs'>{t.field.type !== 3?`${t.text}:`:'\n\r'}</p>
              <div className="flex items-start rounded w-full h-full">
                {t.field.type ===0 && <RadioButton data={t.field.parameters} fields={{title: 'title', value:'value', hint: 'hint'}} value={filter.tags[tIdx]} onChange={(s)=>{setFilter({...filter, tags:filter.tags.map((st,index)=>{if(index===tIdx){return s}else{return st}})})}}/>}
                {t.field.type ===1 && <MultiSelectComponent fff={2} placeholder='انتخاب کنید' className='rounded-md border' data={t.field.parameters} fields={{title: 'title', value:'value', hint: 'hint'}} value={filter.tags[tIdx]} onChange={(s)=>{setFilter({...filter, tags:filter.tags.map((st,index)=>{if(index===tIdx){return s}else{return st}})})}}/>}
                {t.field.type ===2 && <div className='flex justify-between items-center gap-1 w-full'><input className='flex-grow rounded-md border text-xs py-1 px-2' placeholder='فیلتر' value={filter.tags[tIdx].length>0?filter.tags[tIdx][0]:''} onChange={(e)=>{setFilter({...filter, tags:filter.tags.map((st,index)=>{if(index===tIdx){return [e.target.value]}else{return st}})})}}/><input onChange={(e)=>{setFilter({...filter, tagCheckBox: filter.tagCheckBox.map((ft, ftIdx)=>{if(ftIdx===tIdx){return e.target.checked}else{return ft}})})}} type='checkbox'/><label className='text-xs'>خالی نباشد</label></div>}
                {t.field.type ===3 && <div className="flex justify-start items-center"><input onChange={(e)=>{setFilter({...filter, tags:filter.tags.map((st,index)=>{if(index===tIdx){return e.target.checked?[true]:[false]}else{return st}})})}} type='checkbox'/><label className='text-sm ms-2'>{t.field.parameters[0].title}</label></div>}
              </div>
            </div>)}
          </div>
        {/* {p.phrase.samples.length > 0 && p.phrase.samples.slice(currentSample[idx] * 3, (currentSample[idx] + 1) * 3).map((ps, psIdx)=><p key={psIdx} onClick={()=>{setCurrentSample(currentSample.map((ele, csIdx)=>csIdx===currentPhrase?(ele+1)%Math.ceil(phrases[currentPhrase].phrase.samples.length/3):ele))}} className='border border-slate-500 rounded-md w-full text-xs p-2 mt-2'><span className='text-blue-400 font-bold'>{`${p.phrase.samples.indexOf(ps)+1}/${p.phrase.samples.length}: `}</span>{getHighlightedText(ps,p.phrase.text)}</p>)} */}
        </div>
        {filterdPhrases.map((p, idx)=><div key={idx} className={`grid grid-cols-2 md:grid-cols-12 justify-between items-center gap-2 relative border border-blue-200 dark:border-gray-500 rounded-md bg-white dark:bg-gray-600 p-2 h-full`}>
          <div className='w-full md:col-span-2 flex justify-start gap-2 items-center h-full'>
            <p className='flex justify-center items-center rounded-md bg-blue-300 text-white py-1 px-2 w-6'>{idx+1}</p>
            <CgMoreVertical onClick={()=>{openSampleModal(p.phrase)}} className='cursor-pointer'/>
            <div className='flex flex-col justify-start items-start gap-1'>
              <p className='text-gray-800 dark:text-gray-100'>{p.phrase.text}</p>
              <p className='md:whitespace-pre-wrap text-xs text-center text-red-700 dark:text-amber-500'>{p.userTagged?.name && `کارشناس: ${p.userTagged?.name}`}</p>
              <p className='md:whitespace-pre-wrap text-xs text-center text-red-700 dark:text-amber-500'>{`فایل: ${p.fileId.title}`}</p>
              <p className='md:whitespace-pre-wrap text-xs text-center text-red-700 dark:text-amber-500'>{`قالب: ${p.tagTemplate.title}`}</p>
            </div>
          </div>
          <div className="w-full md:col-span-1 flex md:flex-col gap-1">
            <button onClick={()=>{setEdittingPhrase(p)}} className='rounded border border-gray-300 dark:border-gray-500 bg-blue-400 py-1 w-full text-xs text-white hover:bg-blue-300'>ویرایش</button>
            {p.status === 4 && <button onClick={()=>rejectPhrasesTag([p._id])} className='rounded border border-gray-300 dark:border-gray-500 bg-red-400 py-1 w-full text-xs text-white hover:bg-red-300'>برگشت</button>}
            <button onClick={()=>submitPhraseTags([p._id])} className='rounded border border-gray-300 dark:border-gray-500 bg-green-500 py-1 w-full text-xs text-white hover:bg-green-400'>تائید</button>
          </div>
          <div className={`col-span-2 md:col-span-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 h-full gap-2`}>
            {p.phraseTags.tags.map((t, tIdx)=>
              <div key={tIdx} className='col-span-1 flex flex-col gap-1 w-full h-full'>
                <p className='relative text-xs md:whitespace-pre-wrap text-gray-400'>{t.text}:</p>
                {(!edittingPhrase || edittingPhrase._id !== p._id)?(
                <div className="border border-md text-sm border-gray-200 dark:border-gray-400 flex items-center rounded-md px-2 w-full py-1 md:h-full">
                  {t.type ===0 && <p className='my-auto text-gray-800 dark:text-gray-100'>{t.labels.join('/')}</p>}
                  {t.type ===1 && <p className='my-auto text-gray-800 dark:text-gray-100'>{t.labels?.join('/')}</p>}
                  {t.type ===2 && <p className='my-auto text-gray-800 dark:text-gray-100'>{t.values.length>0?t.values[0]:''}</p>}
                  {t.type ===3 && <p className='my-auto text-gray-800 dark:text-gray-100'>{t.values[0]===true?'بله':'خیر'}</p>}
                </div>):(
                <div className="flex items-center rounded w-full h-full">
                  {t.type ===0 && <RadioButton data={t.fields} fields={{title: 'title', value:'value', hint: 'hint'}} value={edittingPhrase.phraseTags.tags[tIdx].values} onChange={(s)=>{setEdittingPhrase({...edittingPhrase, phraseTags:{...edittingPhrase.phraseTags, tags: edittingPhrase.phraseTags.tags.map((et,etIdx)=>{if(etIdx===tIdx){return {...et, labels:s.map(sss=>et.fields.filter(tf=>tf.value===sss)[0].title), values:s}}else{return et}})}})}}/>}
                  {t.type ===1 && <MultiSelectComponent fff={1} placeholder='انتخاب کنید' className='rounded-md border' data={edittingPhrase.phraseTags.tags[tIdx].fields} fields={{title: 'title', value:'value', hint: 'hint'}} value={edittingPhrase.phraseTags.tags[tIdx].values} onChange={(s)=>{setEdittingPhrase({...edittingPhrase, phraseTags:{...edittingPhrase.phraseTags, tags: edittingPhrase.phraseTags.tags.map((et,etIdx)=>{if(etIdx===tIdx){return {...et, labels:s.map(sss=>et.fields.filter(tf=>tf.value===sss)[0].title), values:s}}else{return et}})}})}}/>}
                  {t.type ===2 && <div className='flex justify-between items-center gap-1 w-full'><input className='flex-grow rounded-md border dark:text-gray-700 text-xs py-1 px-2' placeholder='فیلتر' value={edittingPhrase.phraseTags.tags[tIdx].values} onChange={(e)=>{setEdittingPhrase({...edittingPhrase, phraseTags:{...edittingPhrase.phraseTags, tags: edittingPhrase.phraseTags.tags.map((et,etIdx)=>{if(etIdx===tIdx){return {...et, labels:[e.target.value], values:[e.target.value]}}else{return et}})}})}}/></div>}
                  {t.type ===3 && <MultiSelect data={t.fields} fields={{title: 'title', value:'title', hint: 'hint'}} value={edittingPhrase.phraseTags.tags[tIdx].values[0]?[edittingPhrase.phraseTags.tags[tIdx].fields[0].title]:[]} onChange={(s)=>{setEdittingPhrase({...edittingPhrase, phraseTags:{...edittingPhrase.phraseTags, tags: edittingPhrase.phraseTags.tags.map((et,etIdx)=>{if(etIdx===tIdx){return {...et, labels:s.length>0?[true]:[false], values:s.length>0?[true]:[false]}}else{return et}})}})}}/>}
                </div>)}
              </div>
            )}
            {edittingPhrase && edittingPhrase._id === p._id && <button onClick={()=>setEdittingPhrase(null)} className=' self-end rounded border border-gray-300 dark:border-gray-500 bg-red-400 py-1 w-full text-xs text-white hover:bg-red-300'>انصراف</button>}
            {edittingPhrase && edittingPhrase._id === p._id && <button onClick={()=>editPhraseTag(p._id)} className=' self-end rounded border border-gray-300 dark:border-gray-500 bg-blue-400 py-1 w-full text-xs text-white hover:bg-blue-300'>ثبت</button>}
          </div>
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

export default Tagging2