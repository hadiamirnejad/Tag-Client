import { Radio } from '@mui/material';
import axios from 'axios';
import React, { useEffect } from 'react'
import { useState } from 'react';
import {DropDown, RadioButton, MultiSelect, MultiSelectComponent} from '../';
import useToken from '../../hooks/useToken';

function TagTemplate({fields, fieldParams, tagTemplate, tagTemplates, setTagTemplates, }) {
  const [title, setTitle] = useState(tagTemplate.title)
  const [template, setTemplate] = useState(tagTemplate.template)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [accessToken] = useToken()
  const [editMode, setEditMode] = useState(false)

  const pluck = (arr, key) => arr.map(i => i[key]);

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

  const addQHandler = () =>{
    setTemplate([...template, {text: '', field: null, default: [], hint: ''}])
  }

  const editTagTemplateHandler = async()=>{
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/editTagTemplate`,{
        template: template.filter(t=>t.text.trim() !== ''),
        title: title,
        id: tagTemplate._id
      },{headers:{accessToken}});
      
      if(response.data.error){
        return setErrorMsg(response.data.error)
      }

      setTagTemplates(tagTemplates.map(t=>{if(t._id===tagTemplate._id){ return response.data}else{return t}}))
      setEditMode(false)
    } catch (error) {
      
    }
  }
  return (
    <div className='border p-2'>
      <p className='text-sm w-full font-bold bg-gray-300 rounded-xl p-1 px-3 text-center text-gray-600 block'>{title}</p>
      <p className='text-xs mt-2'>سوالات:</p>
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-2 border-2 rounded p-2 overflow-x-auto scrollbar-thin">
        {template.map((t, idx)=>
        <div key={idx} className={`relative col-span-1 w-full h-full pb-10 bg-gray-200 dark:bg-gray-500 rounded-md p-2`}>
          {editMode && <p className='text-xs mt-2 mb-1 text-red-800 font-bold'>صورت سوال:</p>}
          {!editMode && <p className='text-xs mb-2 px-2 py-1 w-full rounded'>{t.text}</p>}
          {editMode && <input className='text-xs mb-2 px-2 py-1 w-full rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100' placeholder='صورت سوال' type="text" value={t.text} onChange={(e)=>setTemplate(template.map((te, index)=>{if(index===idx){return {text: e.target.value, field: te.field, default: te.default, hint: te.hint}}else{return te}}))}/>}
          <p className='text-xs mt-3 mb-1 text-red-800 font-bold'>نوع:</p>
          {!editMode && <p className='text-xs text-start w-full'>{fields.filter(f=>f.id===t.field)[0]?.title}</p>}
          {editMode && <DropDown data={fields} fields={{title: 'title', value: 'id'}} value={t.field} onChange={(s)=>setTemplate(template.map((te, index)=>{if(index===idx){return {text: te.text, field: s, default: te.default, hint: te.hint}}else{return te}}))} placeHolder='نوع را انتخاب کنید...' className='text-xs text-start w-full'/>}
          <p className='text-xs mt-3 mb-1 text-red-800 font-bold'>مقدار پیش فرض:</p>
          {!editMode && fieldParams.filter(f=>f._id===t.field)[0]?.type===0 && <p  className='text-xs text-start '>{t.default[0]}</p>}
          {!editMode && fieldParams.filter(f=>f._id===t.field)[0]?.type===1 && <p  className='text-xs text-start '>{t.default.join('/')}</p>}
          {!editMode && fieldParams.filter(f=>f._id===t.field)[0]?.type===2 && <p  className='text-xs text-start '>{t.default[0]}</p>}
          {!editMode && fieldParams.filter(f=>f._id===t.field)[0]?.type===3 && <p  className='text-xs text-start '>{t.default[0]?'انتخاب شده':'عدم انتخاب'}</p>}
          {editMode && t.field && fieldParams.filter(f=>f._id===t.field)[0].type===0 && <RadioButton data={fieldParams.filter(f=>f._id===t.field)[0].parameters} fields={{title: 'title', value: 'title'}} value={t.default[0]} onChange={(s)=>setTemplate(template.map((te, index)=>{if(index===idx){return {text: te.text, field: te.field, default: [s], hint: te.hint}}else{return te}}))} className='text-xs text-start '/>}
          {editMode && t.field && fieldParams.filter(f=>f._id===t.field)[0].type===1 && 
          fieldParams.filter(f=>f._id===t.field)[0].parameters.map(fp=><MultiSelect data={[fp]} fields={{title: 'title', value: 'title'}} value={t.default || []} onChange={(s)=>setTemplate(template.map((te, index)=>{if(index===idx){return {text: te.text, field: te.field, default: s, hint: te.hint}}else{return te}}))} className='text-xs text-start'/>)}
          {editMode && t.field && fieldParams.filter(f=>f._id===t.field)[0].type===2 && <input className='text-xs p-1 px-2 rounded w-full' placeholder='پیش فرض' value={t.default[0]} onChange={(e)=>setTemplate(template.map((te, index)=>{if(index===idx){return {text: te.text, field: te.field, default: [e.target.value], hint: te.hint}}else{return te}}))}/>}
          {editMode && t.field && fieldParams.filter(f=>f._id===t.field)[0].type===3 && <MultiSelect data={fieldParams.filter(f=>f._id===t.field)[0].parameters} fields={{title: 'title', value: 'title'}} value={t.default[0]?[fieldParams.filter(f=>f._id===t.field)[0].parameters[0].title]:[]} onChange={(s)=>{setTemplate(template.map((te, index)=>{if(index===idx){return {text: te.text, field: te.field, default: [s[0]===fieldParams.filter(f=>f._id===t.field)[0].parameters[0].title], hint: te.hint}}else{return te}}))}} className='text-xs text-start '/>}
          <p className='text-xs mt-3 mb-1'>راهنما:</p>
          {!editMode && <p className='text-xs p-1 px-2 rounded w-full'>{t.hint}</p>}
          {editMode && <input className='text-xs p-1 px-2 rounded w-full shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100' placeholder='راهنما' type="text" value={t.hint} onChange={(e)=>setTemplate(template.map((te, index)=>{if(index===idx){return {text: te.text, field: te.field, default: te.default, hint: e.target.value}}else{return te}}))}/>}
          {t.text.trim() === '' && <div className="absolute top-1 start-1/2 translate-x-1/2 end-100">
            <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 40 40" className='w-[2rem] h-[2rem]'><path fill="#f78f8f" 
            d="M21 24.15L8.857 36.293 4.707 32.143 16.85 20 4.707 7.857 8.857 3.707 21 15.85 33.143 3.707 37.293 7.857 25.15 20 37.293 32.143 33.143 36.293z"/>
              <path fill="#c74343" d="M33.143,4.414l3.443,3.443L25.15,19.293L24.443,20l0.707,0.707l11.436,11.436l-3.443,3.443 L21.707,24.15L21,23.443l-0.707,0.707L8.857,35.586l-3.443-3.443L16.85,20.707L17.557,20l-0.707-0.707L5.414,7.857l3.443-3.443 L20.293,15.85L21,16.557l0.707-0.707L33.143,4.414 M33.143,3L21,15.143L8.857,3L4,7.857L16.143,20L4,32.143L8.857,37L21,24.857 L33.143,37L38,32.143L25.857,20L38,7.857L33.143,3L33.143,3z"/>
            </svg>
          </div>}
        </div>
        )}
        {editMode && <div className={`flex justify-center items-center col-span-1 w-full h-full bg-gray-200 dark:bg-gray-500 rounded-md p-2`}>
          <button onClick={addQHandler} className='w-full h-full border text-9xl text-white m-0 leading-normal'>+</button>
        </div>}
      </div>
      <div className="flex justify-start items-center px-2 py-1 my-2">
        <p className='text-xs me-2'>عنوان قالب:</p>
        {!editMode && <p className='text-sm rounded shadow-sm me-4'>{title}</p>}
        {editMode && <input className='w-1/3 px-4 py-1 text-sm rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100' type="text" value={title} onChange={(e)=> setTitle(e.target.value)} placeholder='عنوان قالب'/>}
        {editMode && <button onClick={()=>setEditMode(false)} className='rounded bg-orange-400 p-1 px-4 text-sm ms-2'>انصراف</button>}
        {editMode && <button onClick={editTagTemplateHandler} className='rounded bg-green-400 p-1 px-4 text-sm ms-2'>تایید</button>}
        {!editMode && <button onClick={()=>setEditMode(true)} className='rounded bg-blue-400 p-1 px-4 text-sm ms-2'>ویرایش</button>}
      </div>
    </div>
  )
}

export default TagTemplate