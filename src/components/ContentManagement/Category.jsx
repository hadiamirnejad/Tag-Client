import axios from 'axios'
import React, { useEffect, useState } from 'react'
import useToken from '../../hooks/useToken'

function Category({category, setCategories, categories}) {
  const [mode, setMode] = useState('')
  const [title, setTitle] = useState(category.title)
  const [description, setDescription] = useState(category.description)
  const [errorMsg, setErrorMsg] = useState('')

  const [accessToken] = useToken();

  const editCategoryHandler = async () => {
    if(title.trim() === null || title.trim() === ''){
      return;
    }
    try {
      const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/editCategory`,{
        id: category._id,
        title,
        description
      },{
        headers:{accessToken}
      });
      
      if(response.data.error){
        return setErrorMsg(response.data.error)
      }

      setCategories(categories.map((c,idx)=>{if(c._id === category._id){return response.data.updatedCategory}else{return c}}))
      setMode('')
    } catch (error) {
      
    }
  }

  const deleteCategoryHandler = async () => {

  }
  
  return (
    <div className='relative col-span-1 w-full aspect-square bg-gray-200 dark:bg-gray-500 rounded-md p-2'>
      <div className="flex justify-between items-center">
        {mode !== 'delete' && <p className='text-xs text-gray-500 dark:text-gray-300'>عنوان:</p>}
        {mode === 'edit' && <input className='w-full rounded text-gray-500 text-center text-sm ' type="text" value={title} onChange={(e)=>setTitle(e.target.value)}/>}
        {mode === '' && <p className='text-sm'>{category.title}</p>}
        {mode === 'delete' && <p className='text-xs w-full text-center p-2'>آیا از حذف دسته «${category.title}» مطمئن هستید؟</p>}
        
      </div>
      {mode !== 'delete' && <hr className='border border-red-300 rounded-lg my-1'/>}
      {mode !== 'delete' && <p className='text-xs text-gray-500 dark:text-gray-300 mt-1'>توضیحات:</p>}
      {mode === 'edit' && <textarea className='w-full rounded text-gray-500 text-center p-1 text-xs h-1/2' type="text" value={description} onChange={(e)=>setDescription(e.target.value)}/>}
      {mode === '' && <p className='text-xs w-full h-2/5 whitespace-pre-wrap overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-900'>{category.description}</p>}
      <div className="absolute bottom-2 w-[calc(100%-1rem)] flex justify-between items-center">
        {mode==='' && <button onClick={()=>setMode('edit')} className='rounded bg-blue-400 hover:bg-gray-600 hover:text-white w-[calc(50%-0.25rem)] text-xs py-1'>ویرایش</button>}
        {mode === '' && <button onClick={()=>setMode('delete')} className='rounded bg-red-400 hover:bg-gray-600 hover:text-white w-[calc(50%-0.25rem)] text-xs py-1'>حذف</button>}
        {mode === 'edit' && <button onClick={()=>setMode('')} className='rounded bg-orange-400 hover:bg-gray-600 hover:text-white w-[calc(50%-0.25rem)] text-xs py-1'>انصراف</button>}
        {mode === 'edit' && <button onClick={editCategoryHandler} className='rounded bg-green-400 hover:bg-gray-600 hover:text-white w-[calc(50%-0.25rem)] text-xs py-1'>ثبت</button>}
        {mode === 'delete' && <button onClick={()=>setMode('')} className='rounded bg-blue-400 hover:bg-gray-600 hover:text-white w-[calc(50%-0.25rem)] text-xs py-1'>خیر</button>}
        {mode === 'delete' && <button onClick={deleteCategoryHandler} className='rounded bg-red-400 hover:bg-gray-600 hover:text-white w-[calc(50%-0.25rem)] text-xs py-1'>بله</button>}
      </div>
    </div>
  )
}

export default Category