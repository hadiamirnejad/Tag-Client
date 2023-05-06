import axios from 'axios'
import React, { useEffect, useState } from 'react'
import useToken from '../../hooks/useToken'

function Field({fieldTypes, field, setFields, fields}) {
  const [editMode, setEditMode] = useState(false)
  const [oldParameters, setOldParameters] = useState(field.parameters)
  const [newParameters, setNewParameters] = useState([{title: '', hint: '', value: ''}])
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [accessToken] = useToken();

  // useEffect(()=>{setParameters(field.parameters)},[])
  const editFieldHandler = async () => {
    if(oldParameters.filter(p=> p.title.trim() === '' || p.title.trim() === null).length > 0){
      return setErrorMsg('مقدار گزینه‌های قبلی نباید خالی باشد.');
    }
    try {
      const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/editField`,{
        id: field._id,
        parameters: [...oldParameters, ...newParameters.filter(p=> p.title !== '' && p.title !== null)]
      },{
        headers:{accessToken}
      });
      
      if(response.data.error){
        return setErrorMsg(response.data.error)
      }
      
      setOldParameters([...oldParameters, ...newParameters.filter(p=> p.title !== '' && p.title !== null)]);
      setNewParameters([{title: '', hint: '', value: ''}]);
      setFields(fields.map((f,idx)=>{if(f._id === field._id){return response.data.updatedField}else{return f}}));
      setEditMode(false);
      setSuccessMsg('تغییرات با موفقیت اعمال شد.')
    } catch (error) {
      
    }
  }
  const addParameterHandler = () => {
    setNewParameters([...newParameters, {title:'', hint: '', value: ''}])
  }
  const deleteCategoryHandler = async () => {

  }
  const removeParameterHandler = (idx) => {
    if(newParameters.length === 1){
      setNewParameters([{title:'', hint: '', value: ''}])
    }
    else{
      setNewParameters(newParameters.filter((p, index)=>index !== idx))
    }
  }

  useEffect(() => {
    setTimeout(() => {
      setErrorMsg('')
      setSuccessMsg('')
    }, 3000);
  }, [errorMsg, successMsg])
  
  return (
    <div className={`relative ${editMode?'col-span-3 h-full':'col-span-1 aspect-square'} w-full h-full pb-10 bg-gray-200 dark:bg-gray-500 rounded-md p-2`}>
      <p className='text-sm'><span className='text-gray-500 text-xs'>نوع:</span> {fieldTypes.filter(f=>f.value===field.type)[0].title}</p>
      <hr className='border border-red-300 rounded-lg my-1'/>
      {!editMode && field.parameters.map((cp,index)=>
      <div className='ms-2 text-xs mb-2' key={index}>
        <p className=''>{index+1}: {cp.title}</p>
        <p className='ms-2 text-gray-400 text-xs'>{cp.value}</p>
        <p className='ms-2 text-gray-400 text-xs'>{cp.hint}</p>
      </div>)}
      {editMode && <div className='overflow-y-auto'>
        {oldParameters.map((cp,index)=>
        <div className='text-xs mb-2 flex justify-start items-center gap-2 dark:text-gray-700' key={index}>
          <input className={`rounded px-2 py-1 border-2 ${cp.title===''?'border-red-400 border-dashed':'border-blue-200'}`} placeholder='گزینه' value={cp.title} onChange={(e)=>setOldParameters(oldParameters.map((par, idx)=>{if(index===idx){return {title: e.target.value, hint: cp.hint, value: cp.value}}else{return par}}))}/>
          <input className='rounded px-2 py-1 dark:text-gray-700 text-xs  border-2 border-blue-200' placeholder='مقدار' value={cp?.value} onChange={(e)=>setOldParameters(oldParameters.map((par, idx)=>{if(index===idx){return {title: cp.title, hint: cp.hint, value: e.target.value}}else{return par}}))}/>
          <input className='rounded px-2 py-1 dark:text-gray-700 text-xs w-full  border-2 border-blue-200' placeholder='راهنما' value={cp.hint} onChange={(e)=>setOldParameters(oldParameters.map((par, idx)=>{if(index===idx){return {title: cp.title, hint: e.target.value, value: cp.value}}else{return par}}))}/>
        </div>)}
        {(field.type === 0 || field.type === 1) && newParameters.map((cp,index)=>
        <div className='text-xs mb-2 flex justify-start items-center gap-2 dark:text-gray-700' key={index}>
          <input className='rounded px-2 py-1 dark:text-gray-700' placeholder='گزینه' value={cp.title} onChange={(e)=>setNewParameters(newParameters.map((par, idx)=>{if(index===idx){return {title: e.target.value, hint: cp.hint, value: cp.value}}else{return par}}))}/>
          <input className='rounded px-2 py-1 dark:text-gray-700' placeholder='مقدار' value={cp.value} onChange={(e)=>setNewParameters(newParameters.map((par, idx)=>{if(index===idx){return {title: cp.title, hint: cp.hint, value: e.target.value}}else{return par}}))}/>
          <input className='rounded px-2 py-1 dark:text-gray-700 text-xs w-full' placeholder='راهنما' value={cp.hint} onChange={(e)=>setNewParameters(newParameters.map((par, idx)=>{if(index===idx){return {title: cp.title, hint: e.target.value, value: cp.value}}else{return par}}))}/>
          
          <button className='rounded bg-red-400 text-xs p-1' onClick={()=>removeParameterHandler(index)}>حذف</button>
          {(index +1 === newParameters.length) && <button className='rounded bg-blue-400 text-xs p-1 whitespace-pre' onClick={addParameterHandler}>اضافه کردن</button>}
        </div>)}
        </div>}
      <div className="absolute bottom-2 w-[calc(100%-1rem)] flex justify-between items-center">
        {!editMode && <button onClick={()=>setEditMode(true)} className='rounded bg-blue-400 hover:bg-gray-600 hover:text-white w-full text-xs py-1'>ویرایش</button>}
        {editMode && <button onClick={()=>setEditMode(false)} className='rounded bg-orange-400 hover:bg-gray-600 hover:text-white w-[calc(50%-0.25rem)] text-xs py-1'>انصراف</button>}
        {editMode && <button onClick={editFieldHandler} className='rounded bg-green-400 hover:bg-gray-600 hover:text-white w-[calc(50%-0.25rem)] text-xs py-1'>ثبت</button>}
      </div>
      {errorMsg && <div className="absolute w-[calc(100%-1rem)] top-1/2 start-2 -translate-y-1/2 text-xs text-red-500 dark:text-red-200 bg-gray-200 dark:bg-gray-400 text-center rounded p-4 border-2 border-red-500 dark:border-red-200">{errorMsg}</div>}
      {successMsg && <div className="absolute w-[calc(100%-1rem)] top-1/2 start-2 -translate-y-1/2 text-xs text-green-500 dark:text-green-200 bg-gray-200 dark:bg-gray-400 text-center rounded p-4 border-2 border-graan-500 dark:border-graan-200">{successMsg}</div>}
    </div>
  )
}

export default Field