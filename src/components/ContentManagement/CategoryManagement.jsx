import axios from 'axios'
import React, { useEffect, useState } from 'react'
import useToken from '../../hooks/useToken'
import Category from './Category'


function CategoryManagement() {
  const [categories, setCategories] = useState([])
  const [filter, setFilter] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [accessToken] = useToken();

  const getCategories = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/getCategories`);
      
      if(response.data.error){
        return setErrorMsg(response.data.error)
      }

      setCategories(response.data)
    } catch (error) {
      setErrorMsg(error)
    }
  }
  useEffect(() => {
    getCategories();
  }, [])
  
  const addCategoryHandler = async ()=>{
    if(title.trim() === '' || title.trim() === null){
      return setErrorMsg('عنوان نمی‌تواند خالی باشد.')
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/addCategory`,{
        title,
        description
      },{
        headers:{accessToken}
      })

      if(response.data.error){
        return setErrorMsg(response.data.error)
      }

      setCategories([...categories, response.data])
      setTitle('')
      setDescription('')
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
  
  return (
    <div className="">
      <div className="sticky top-12 z-50 w-full rounded border-2 border-opacity-40 mb-2 p-4 bg-slate-100 dark:bg-[#50555e]">
        <p className='text-sm mb-2 font-bold bg-gray-300 rounded-xl p-1 px-3 w-fit text-gray-600'>ثبت دسته جدید</p>
        <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-9">
          <div className="col-span-2 flex items-center">
            <label htmlFor="titleTextBox" className='me-2 text-sm'>عنوان دسته:</label>
            <input id='titleTextBox' type="text" className='text-gray-700 py-1 px-2 rounded text-sm me-4' placeholder='عنوان دسته' onChange={(e)=>setTitle(e.target.value)}/>
          </div>
          <div className="col-span-4 flex items-center">
            <label htmlFor="descTextBox" className='me-2 text-sm whitespace-nowrap'>توضیحات دسته:</label>
            <textarea id='descTextBox' type="text" className='text-gray-700 py-1 px-2 rounded text-sm me-4 w-full' placeholder='توضیحات دسته' onChange={(e)=>setDescription(e.target.value)}/>
          </div>
          <div className="col-span-1 flex items-center">
            <button onClick={addCategoryHandler} className='rounded bg-green-400 hover:bg-gray-600 hover:text-white text-sm py-1 px-10'>ثبت</button>
          </div>
          <div className="col-span-2 flex items-center">
          {errorMsg && <p className='text-xs font-bold text-red-500 w-full text-end'>{errorMsg}</p>}
          {successMsg && <p className='text-xs font-bold text-green-500 w-full text-end'>{successMsg}</p>}
          </div>
        </div>
      </div>
      <hr className='w-full border-8 rounded-md'/>
      <div className="sticky top-40 z-50 flex justify-between items-center bg-slate-100 dark:bg-[#50555e] px-4 py-2 mt-2 mb-2 w-full rounded border-2 border-opacity-40">
        <p className='text-sm font-bold bg-gray-300 rounded-xl p-1 px-3 w-fit text-gray-600 block'>لیست دسته‌های ثبت شده</p>
        <div className="w-1/3 flex justify-end items-center">
          <label htmlFor="filterTextBox" className='me-2 text-sm whitespace-nowrap'>جستجوی دسته:</label>
          <input id='filterTextBox' type="text" className='text-gray-700 py-1 px-2 rounded text-sm whitespace-nowrap w-full' placeholder='برای جستجو در بین دسته‌ها متنی را وارد نمایید...' onChange={(e)=>setFilter(e.target.value)}/>
        </div>
      </div>
      <div className='relative grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-2'>
        {categories.filter(c=> c.title.indexOf(filter) > -1 || c.description.indexOf(filter) > -1).map((c,idx)=><Category key={idx} category={c} setCategories={setCategories} categories={categories}/>)}
      </div>
    </div>
  )
}

export default CategoryManagement