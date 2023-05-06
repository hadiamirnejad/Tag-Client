import { Radio } from '@mui/material';
import axios from 'axios';
import React, { useEffect } from 'react'
import { useState } from 'react';
import {DropDown, RadioButton, MultiSelect} from '../';
import useToken from '../../hooks/useToken';
import TagTemplate from './TagTemplate';

function TagTemplateManagement() {
  const [fields, setFields] = useState([])
  const [fieldParams, setFieldParams] = useState([])
  const [tagTemplates, setTagTemplates] = useState([])
  const [title, setTitle] = useState('')
  const [template, setTemplate] = useState([])
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [accessToken] = useToken()
  useEffect(()=>{
    getFields();
    getTagTemplates();
  },[])

  const pluck = (arr, key) => arr.map(i => i[key]);
  const getFields = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/getFields`);

      if(response.data.error){
        return setErrorMsg(response.data.error)
      }

      setFields(response.data.map((f, idx)=> {return {id: f._id ,type: f.type, title: `${fieldTypes.filter(ft=>ft.value === f.type)[0].title} ( ${pluck(f.parameters,'title').join("/")})`}}))
      setFieldParams(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  const submitQHandler = async () => {
    if(title.trim() === null || title.trim() === ''){
      return setErrorMsg('عنوان قالب را تعیین نمایید.')
    }
    if(template.filter(t=> t.text.trim() !== null && t.text.trim() !== '').length === 0){
      return setErrorMsg('حداقل یک سوال برای این قالب تعیین نمایید.')
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/addTagTemplate`,{
        title,
        template: template.filter(t=> t.text.trim() !== null && t.text.trim() !== '')
      },{
        headers:{
          accessToken
        }
      });

      if(response.data.error){
        return setErrorMsg(response.data.error)
      }

      setTagTemplates([...tagTemplates, response.data])
      setTitle('')
      setTemplate([])
      setSuccessMsg('قالب با موفقیت ثبت شد.')
      // setFields(response.data.map((f, idx)=> {return {id: f._id ,type: f.type, title: `${fieldTypes.filter(ft=>ft.value === f.type)[0].title} ( ${pluck(f.parameters,'title').join("/")})`}}))
      // setFieldParams(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  const fieldTypes=[{
    title: 'چند گزینه‌ای',
    value: 0
  },
  {
    title: 'چند انتخابی',
    value: 1
  },
  {
    title: 'متنی',
    value: 2
  },
  {
    title: 'تائید/عدم تائید',
    value: 3
  }]

  const getTagTemplates = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/getTagTemplates`);

      if(response.data.error){
        return setErrorMsg(response.data.error)
      }
      
      setTagTemplates(response.data)
    } catch (error) {
      
    }
  }
  const addQHandler = () =>{
    setTemplate([...template, {text: '', field: null, default: [], hint: ''}])
  }
  return (
    <div className=''>
      <p className='text-sm w-full font-bold bg-gray-300 rounded-xl p-1 px-3 text-center text-gray-600 block'>ثبت قالب جدید</p>

      <div className="bg-slate-100 pb-3">
        <p className='text-xs mt-2'>سوالات:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-2 border-2 rounded p-2">
          {template.map((t, idx)=>
          <div key={idx} className={`relative col-span-1 w-full h-full pb-10 bg-gray-200 dark:bg-gray-500 rounded-md p-2`}>
            <p className='text-xs mt-2 mb-1'>صورت سوال:</p>
            <input className='text-xs mb-2 px-2 py-1 w-full rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100' placeholder='صورت سوال' type="text" value={t.text} onChange={(e)=>setTemplate(template.map((te, index)=>{if(index===idx){return {text: e.target.value, field: te.field, default: te.default, hint: te.hint}}else{return te}}))}/>
            <DropDown data={fields} fields={{title: 'title', value: 'id'}} value={t.field} onChange={(s)=>setTemplate(template.map((te, index)=>{if(index===idx){return {text: te.text, field: s, default: te.default, hint: te.hint}}else{return te}}))} placeHolder='نوع را انتخاب کنید...' className='text-xs text-start w-full'/>
            <p className='text-xs mt-2 mb-1'>مقدار پیش فرض:</p>
            {t.field && fieldParams.filter(f=>f._id===t.field)[0].type===0 && <RadioButton data={fieldParams.filter(f=>f._id===t.field)[0].parameters} fields={{title: 'title', value: 'title'}} value={t.default[0]} onChange={(s)=>setTemplate(template.map((te, index)=>{if(index===idx){return {text: te.text, field: te.field, default: [s], hint: te.hint}}else{return te}}))} className='text-xs text-start '/>}
            {t.field && fieldParams.filter(f=>f._id===t.field)[0].type===1 && 
            fieldParams.filter(f=>f._id===t.field)[0].parameters.map(fp=><MultiSelect data={[fp]} fields={{title: 'title', value: 'title'}} value={t.default} onChange={(s)=>setTemplate(template.map((te, index)=>{if(index===idx){return {text: te.text, field: te.field, default: s, hint: te.hint}}else{return te}}))} className='text-xs text-start'/>)}
            {t.field && fieldParams.filter(f=>f._id===t.field)[0].type===2 && <input className='text-xs p-1 px-2 rounded w-full' placeholder='پیش فرض' onChange={(e)=>setTemplate(template.map((te, index)=>{if(index===idx){return {text: te.text, field: te.field, default: [e.target.value], hint: te.hint}}else{return te}}))}/>}
            {t.field && fieldParams.filter(f=>f._id===t.field)[0].type===3 && <RadioButton data={fieldParams.filter(f=>f._id===t.field)[0].parameters} fields={{title: 'title', value: 'title'}} value={t.default} onChange={(s)=>setTemplate(template.map((te, index)=>{if(index===idx){return {text: te.text, field: te.field, default: [s], hint: te.hint}}else{return te}}))} className='text-xs text-start '/>}
            <p className='text-xs mt-2'>راهنما:</p>
            <input className='text-xs p-1 px-2 mt-1 rounded w-full shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100' placeholder='راهنما' type="text" value={t.hint} onChange={(e)=>setTemplate(template.map((te, index)=>{if(index===idx){return {text: te.text, field: te.field, default: te.default, hint: e.target.value}}else{return te}}))}/>
          </div>
          )}
          <div className={`flex justify-center items-center col-span-1 w-full h-full bg-gray-200 dark:bg-gray-500 rounded-md p-2`}>
            <button onClick={addQHandler} className='w-full h-full border text-9xl text-white m-0 leading-normal'>+</button>
          </div>
        </div>
        <p className='text-xs mt-2'>عنوان قالب:</p>
        <input className='w-1/3 mb-3 px-2 py-1 text-sm rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100' type="text" value={title} onChange={(e)=> setTitle(e.target.value)} placeholder='عنوان قالب'/>
        <button onClick={submitQHandler} className='rounded bg-green-400 p-1 px-4 text-sm ms-2'>ثبت</button>
        <hr className='border-4 rounded-md border-red-300 mt-3'/>
      </div>
      {/* <p className='text-sm font-bold bg-gray-300 rounded-xl p-1 px-3 w-fit text-gray-600 block'>لیست قالبهای ثبت شده</p> */}
      {fields && tagTemplates.map((t, idx)=><TagTemplate key={idx} tagTemplate={t} tagTemplates={tagTemplates} fields={fields} fieldParams={fieldParams} setTagTemplates={setTagTemplates}/>)}
    </div>
  )
}

export default TagTemplateManagement