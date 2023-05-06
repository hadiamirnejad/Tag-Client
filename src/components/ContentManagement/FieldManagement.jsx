import axios from 'axios'
import React, { useEffect, useState } from 'react'
import useToken from '../../hooks/useToken'
import DropDown from '../DropDown'
import Field from './Field'

function FieldManagement() {
  const [fields, setFields] = useState([])
  const [filter, setFilter] = useState(-1)
  const [parameters, setParameters] = useState([{title: '', hint: '', value: ''}])
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [selectedFieldType, setSelectedFieldType] = useState(null)

  const [accessToken] = useToken();

  const getFields = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/getFields`);

      if(response.data.error){
        return setErrorMsg(response.data.error)
      }

      setFields(response.data)
    } catch (error) {
      setErrorMsg(error)
    }
  }
  useEffect(() => {
    getFields();
  }, [])
  
  const addFieldHandler = async ()=>{
    if(selectedFieldType === 0 && parameters.filter(p=> p.title.trim() !== '' && p.title.trim() !== null).length < 2){
      return setErrorMsg('گزینه‌ها نمی‌تواند خالی باشد.')
    }
    if(selectedFieldType === 1 && parameters.filter(p=> p.title.trim() !== '' && p.title.trim() !== null).length < 2){
      return setErrorMsg('گزینه‌ها نمی‌تواند خالی باشد.')
    }
    if(selectedFieldType === 3 && parameters.filter(p=> p.title.trim() !== '' && p.title.trim() !== null).length < 1){
      return setErrorMsg('گزینه پرسشی نمی‌تواند خالی باشد.')
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/addField`,{
        type: selectedFieldType,
        parameters: selectedFieldType===2?[]:parameters.filter(p=> p.title !== '' && p.title !== null)
      },{
        headers:{accessToken}
      })

      if(response.data.error){
        return setErrorMsg(response.data.error)
      }
      
      setFields([...fields, response.data])
      setSelectedFieldType(null)
      setParameters([{title: '', hint: '', value: ''}])
      setSuccessMsg('دسته با موفقیت ثبت شد.')
    } catch (error) {
      setErrorMsg(error)
    }
  }

  useEffect(() => {
    setTimeout(() => {
      setErrorMsg();
      setSuccessMsg();
    }, 7000);
  }, [successMsg, errorMsg])
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
  const changeFieldTypeHandler =(s)=>{
    setSelectedFieldType(s)
  }
  const addParameterHandler = () => {
    setParameters([...parameters, {title:'', hint: '', value: ''}])
  }
  const removeParameterHandler = (idx) => {
    if(parameters.length === 1){
      setParameters([{title:'', hint: '', value: ''}])
    }
    else{
      setParameters(parameters.filter((p, index)=>index !== idx))
    }
  }
  return (
    <div className="">
      <div className="sticky top-12 z-50 w-full rounded border-2 border-opacity-40 mb-2 p-4 bg-slate-100 dark:bg-[#50555e]">
        <p className='text-sm mb-2 font-bold bg-gray-300 rounded-xl p-1 px-3 w-fit text-gray-600'>ثبت گزینه جدید</p>
        <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-9">
          <div className="col-span-2 flex items-center">
            <label htmlFor="titleTextBox" className='me-2 text-sm whitespace-nowrap'>نوع گزینه:</label>
            <DropDown className='text-xs' onChange={changeFieldTypeHandler} data={fieldTypes} fields={{title: 'title', value: 'value'}} value={selectedFieldType} placeHolder={'انتخاب کنید...'}/>
          </div>
          <div className="col-span-4">
            {(selectedFieldType === 0 || selectedFieldType === 1) && 
            <div className='flex items-center gap-2'>
              <p className='me-2 text-sm whitespace-nowrap'>گزینه‌ها:</p>
              <div className="rounded border px-2 pt-2">
                {parameters.map((p,idx)=>
                <div key={idx} className='flex justify-start items-center gap-2'>
                  <input className='mb-2 text-xs py-1 px-2 rounded' type="text" placeholder='گزینه' value={p.title} onChange={(e)=>setParameters(parameters.map((par, index)=>{if(index===idx){return {title: e.target.value, hint: p.hint, value: p.value}}else{return par}}))}/>
                  <input className='mb-2 text-xs py-1 px-2 rounded' type="text" placeholder='مقدار' value={p.value} onChange={(e)=>setParameters(parameters.map((par, index)=>{if(index===idx){return {title: p.title, hint: p.hint, value: e.target.value}}else{return par}}))}/>
                  <input className='mb-2 text-xs py-1 px-2 rounded' type="text" placeholder='راهنما' value={p.hint} onChange={(e)=>setParameters(parameters.map((par, index)=>{if(index===idx){return {title: p.title, hint: e.target.value, value: p.value}}else{return par}}))}/>
                  <button className='rounded bg-red-400 text-xs p-1 mb-2' onClick={()=>removeParameterHandler(idx)}>حذف</button>
                  {idx === parameters.length-1 && <button className='rounded bg-blue-400 text-xs p-1 mb-2' onClick={addParameterHandler}>اضافه کردن</button>}
                </div>)}
              </div>
            </div>}
            {(selectedFieldType === 3) && 
            <div className='flex items-center gap-2'>
              <p className='me-2 text-sm whitespace-nowrap'>گزینه:</p>
              <input className='text-sm py-1 px-2 rounded w-1/4' type="text" placeholder='گزینه' value={parameters[0].title} onChange={(e)=>setParameters([{title: e.target.value, hint: parameters[0].hint, value: parameters[0].value}])}/>
              <input className='text-sm py-1 px-2 rounded w-1/4' type="text" placeholder='مقدار' value={parameters[0].value} onChange={(e)=>setParameters([{title: parameters[0].title, hint: parameters[0].hint, value: e.target.value}])}/>
              <input className='text-sm py-1 px-2 rounded w-1/4' type="text" placeholder='راهنما' value={parameters[0].hint} onChange={(e)=>setParameters([{title: parameters[0].title, hint: e.target.value, value: parameters[0].value}])}/>
            </div>} 
          </div>
          <div className="col-span-1 flex items-center">
            <button onClick={addFieldHandler} className='rounded bg-green-400 hover:bg-gray-600 hover:text-white text-sm py-1 px-10'>ثبت</button>
          </div>
          <div className="col-span-2 flex items-center">
          {errorMsg && <p className='text-xs font-bold text-red-500 w-full text-end'>{errorMsg}</p>}
          {successMsg && <p className='text-xs font-bold text-green-500 w-full text-end'>{successMsg}</p>}
          </div>
        </div>
      </div>
      <hr className='w-full border-8 rounded-md'/>
      <div className="sticky top-40 z-20 flex justify-between items-center bg-slate-100 dark:bg-[#50555e] px-4 py-2 mt-2 mb-2 w-full rounded border-2 border-opacity-40">
        <p className='text-sm font-bold bg-gray-300 rounded-xl p-1 px-3 w-fit text-gray-600 block'>لیست گزینه‌های ثبت شده</p>
        <div className="w-1/3 flex justify-end items-center">
           <DropDown onChange={(s)=>setFilter(s)} data={[{title: 'همه',value: -1}, ...fieldTypes]} fields={{title: 'title', value: 'value'}} value={filter} beginFrom='end' placeHolder={'انتخاب کنید...'}/>
        </div>
      </div>
      <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-2'>
        {(filter===-1?fields:fields.filter(f=> f.type === filter)).map((f,idx)=>
          <Field key={idx} field={f} fieldTypes={fieldTypes} fields={fields} setFields={setFields} parameters={parameters} setParameters={setParameters}/>
        // <div key={idx} className='w-full aspect-square bg-gray-200 dark:bg-gray-500 rounded-md p-2'>
        //   <p className='text-sm'><span className='text-gray-500 text-xs'>نوع:</span> {fieldTypes.filter(f=>f.value===c.type)[0].title}</p>
        //   <hr className='border border-red-300 rounded-lg my-1'/>
        //   {c.parameters.map((cp,index)=><div className='ms-2 text-xs' key={index}><p className=''>{index+1}: {cp.title}</p><p className='ms-2 text-gray-400 text-xs'>{cp.hint}</p></div>)}
        // </div>
        )}
      </div>
    </div>
  )
}

export default FieldManagement