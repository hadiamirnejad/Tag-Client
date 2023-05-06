import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useRef } from 'react'
import { useSelector } from 'react-redux'
import * as XLSX from 'xlsx'
import useToken from '../../hooks/useToken'
import {MultiSelectComponent} from '../'
import PulseLoader from "react-spinners/PulseLoader";
import { logBase } from '@syncfusion/ej2/charts'
import moment from 'jalali-moment'

function PhraseManagement() {


  const {user} = useSelector((state) => ({
    user: state.auth.user
  }));

  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [tagTemplates, setTagTemplates] = useState([])
  const [title, setTitle] = useState('')
  const [selectedTagTemplate, setSelectedTagTemplate] = useState([])
  const [phrases, setPhrases] = useState([])
  const [file, setFile] = useState([])
  const [response, setResponse] = useState()
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState([])
  const [logsCount, setLogsCount] = useState(10)
  const [edittingUsersTemplateId, setEdittingUsersTemplateId] = useState(null)
  const [deletingFile, setDeletingFile] = useState(null)
  const [edittingUsersTemplate, setEdittingUsersTemplate] = useState([])

  const [accessToken] = useToken()

  const fileLoadhandler = (e) =>{
    const f = e.target.files[0]
    setFile(f)
    const getDataFromExcel = new Promise((resolve, reject)=>{
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(f)

      fileReader.onload = (e) =>{
        const bufferArray = e.target.result;

        const wb = XLSX.read(bufferArray, {type: 'buffer'})
        const wsname1 = wb.SheetNames[0];
        const wsname2 = wb.SheetNames[1];

        const ws1 = wb.Sheets[wsname1];
        const ws2 = wb.Sheets[wsname2];
        const data = XLSX.utils.sheet_to_json(ws1)
        const data2 = XLSX.utils.sheet_to_json(ws2)

        resolve(data.map((d,idx)=>{return {order: d.__rowNum__,text: d[Object.keys(d)[0]], samples: Object.values(data2[idx] || {})}}))
      };
      fileReader.onerror = (error)=>{
        reject(error)
      }
    })

    getDataFromExcel.then((d, error)=>{
      if(error)
      {
        return console.log(error)
      }
      setPhrases(d)
    })
    
  }
  const inputFile = useRef()

  const getUsers = async()=>{
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/getUsers`,{},{
        headers: {
          accessToken
        }
      })

      if(response.data.error){
        return setErrorMsg(response.data.error)
      }
      setUsers(response.data.users)
    } catch (error) {
      console.log(error)
    }
  }

  const uploadPhrasesHandler = async () => {
    if(phrases.length === 0){
      return setErrorMsg('فایلی برای آپلود انتخاب نمایید.')
    }
    if(selectedCategories.length === 0 || selectedTagTemplate.length === 0){
      return setErrorMsg('دسته و قالب نمی‌تواند خالی باشد.')
    }
    if(title.trim() === ''){
      return setErrorMsg('عنوان نمی‌تواند خالی باشد.')
    }
    setLoading(true)
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/addPhrase`,{
        phrases: phrases,
        tagTemplates: selectedTagTemplate,
        user: user._id,
        categories: selectedCategories,
        forUsers: selectedUsers,
        filename: file.name,
        title: title
      },{
        headers:{accessToken}
      })

      if(response.data.error){
        console.log(response.data.error)
        return setErrorMsg('خطایی در هنگام بارگذاری رخ داده است.')
      }

      setResponse(response.data)
      setFiles(response.data.files)
      setSuccessMsg('عبارات با موفقیت بارگذاری شدند.')
    } catch (error) {
      console.log(error)
      setErrorMsg('خطایی در نگام بارگذاری رخ داده است.')
    }
    setLoading(false)
  }

  const getFiles = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/getPhrasesUploadFiles`);

      if(response.data.error){
        return setErrorMsg(response.data.error)
      }

      setFiles(response.data)
    } catch (error) {
      setErrorMsg(error)
    }
  }

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

  const getTagTemplates = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/getTagTemplates`);

      if(response.data.error){
        return setErrorMsg(response.data.error)
      }
      
      setTagTemplates(response.data)
    } catch (error) {
      setErrorMsg(error)
    }
  }

  useEffect(() => {
    getUsers();
    getCategories();
    getTagTemplates();
    getFiles();
  }, [])

  useEffect(() => {
    setTimeout(() => {
      setErrorMsg();
      setSuccessMsg();
    }, 7000);
  }, [successMsg, errorMsg])
  
  const editUsersHandler =async(fileId, tagTemplateId)=>{
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/changeFileUsers`,{
        fileId: fileId,
        tagTemplate: tagTemplateId,
        users: edittingUsersTemplate
      },{headers: {accessToken}});

      if(response.data.error){
        return setErrorMsg(response.data.error)
      }

      setFiles(response.data)
      setEdittingUsersTemplate([]);
      setEdittingUsersTemplateId(null);
    } catch (error) {
      setErrorMsg(error)
    }
  }
  const deleteFileHandler = async(id)=>{

    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/deleteFile`,{
        fileId: id,
      },{headers: {accessToken}});

      if(response.data.error){
        return setErrorMsg(response.data.error)
      }
      setFiles(response.data)
      setDeletingFile(null)
    } catch (error) {
      
    }
  }
  return (
    <div className='w-full min-h-[30rem]'>
      <div className="grid grid-cols-5 md:grid-cols-8 my-3 items-center gap-2">
        <button className='col-span-2 text-sm border rounded-md py-1 px-4 font-semibold border-blue-300 hover:bg-blue-100 whitespace-pre' onClick={()=>inputFile.current.click()}>انتخاب فایل<span className='text-xs'>(فرمت قابل قبول: xlsx/xls)</span></button>
        <input ref={inputFile} onChange={fileLoadhandler} className="hidden" aria-describedby="file_input_help" id="file_input" type="file" placeholder='انتخاب کنید' title='انتخاب'/>
        <p className="col-span-2 text-center text-xs text-gray-500 dark:text-gray-300 whitespace-pre" id="file_input_help">{file.name?file.name:'فایل انتخاب نشده است.'}<span className='text-xs'>{file.name && ` (${Math.floor(file.size / 1024)} کیلوبایت)`}</span></p>
        <p className="col-span-4 text-center text-xs text-gray-500 dark:text-gray-300 whitespace-pre" id="file_input_help">{file.name && `تعداد رکورد: ${phrases.length}`}</p>
        <p className="col-span-2 hidden md:block"><div className='flex justify-between items-center'><label className='text-xs' htmlFor='fileTitle'>عنوان:</label><input placeholder='عنوان' className='rounded w-full border dark:border-none px-2 py-1 text-xs' id='fileTitle' value={title} onChange={(e)=>setTitle(e.target.value)}></input></div></p>
        <div className="col-span-3 self-end flex justify-start items-center"><span className='text-xs'>دسته:</span><MultiSelectComponent itemsCount='10' placeholder='جستجوی دسته' className='text-xs text-start rounded border dark:border-none' data={categories} fields={{title: 'title', value: '_id'}} value={selectedCategories} onChange={(s)=>setSelectedCategories(s)}/></div>
        <div className="col-span-3 self-end flex justify-start items-center"><span className='text-xs'>قالب:</span><MultiSelectComponent itemsCount='10' placeholder='جستجوی قالب' className='text-xs text-start rounded border dark:border-none' data={tagTemplates} fields={{title: 'title', value: '_id'}} value={selectedTagTemplate.map(st=>st.tagTemplate)} onChange={(ss)=>setSelectedTagTemplate(ss.map(s=>{if(selectedTagTemplate.filter(st=>st.tagTemplate===s).length>0){return {tagTemplate: s, users: selectedTagTemplate.filter(st=>st.tagTemplate===s)[0].users}}else{return {tagTemplate: s, users:[]}}}))}/></div>
        {/* <div className="col-span-3 self-end flex-col justify-start items-end"> */}
        {selectedTagTemplate.map((t,idx)=>
          <div className="col-span-4 flex justify-between items-center"><span className='text-xs whitespace-pre'>قالب {tagTemplates.filter(tm=>tm._id===t.tagTemplate)[0].title}:</span><MultiSelectComponent itemsCount='10' placeholder={`اختصاص به کاربران ... (پیش فرض: همه)`} className='text-xs text-start rounded border dark:border-none' data={users} fields={{title: 'name', value: '_id', hint: 'role'}} value={selectedTagTemplate.filter(st=>st.tagTemplate===t.tagTemplate).length>0?selectedTagTemplate.filter(st=>st.tagTemplate===t.tagTemplate)[0].users:[]} onChange={(s)=>setSelectedTagTemplate(selectedTagTemplate.map(st=>{if(st.tagTemplate===t.tagTemplate){return {tagTemplate: st.tagTemplate, users: s}}else{return st}}))}/></div>
        )}
        {/* </div> */}
        <button className='self-end text-sm border rounded-md py-1 px-4 font-semibold bg-green-300 hover:bg-green-200 whitespace-pre' onClick={uploadPhrasesHandler}>بارگذاری</button>
      </div>
      {loading && <div className='w-full h-72 flex justify-center items-center'><PulseLoader/></div>}
      {response?.newPhrases && <p className='text-sm w-full text-center'>جدول عبارات: <span>{` (جدید: ${response.newPhrases.nInserted + response.newPhrases.nUpserted}, ویرایش شده: ${response.newPhrases.nModified})`}</span></p>}
      {response?.newPhraseTags && <p className='text-sm w-full text-center'>جدول قالب-عبارت: <span>{` (جدید: ${response.newPhraseTags.nInserted + response.newPhraseTags.nUpserted}, ویرایش شده: ${response.newPhraseTags.nModified})`}</span></p>}
      {errorMsg && <p className='text-sm w-full text-center font-bold text-red-500'>{errorMsg}</p>}
      {successMsg && <p className='text-sm w-full text-center font-bold text-green-500'>{successMsg}</p>}
      <p className='text-sm w-full text-center font-bold mt-7'>آخرین بارگذاری‌ها:</p>
      <table className='w-full text-sm text-center rounded-md self-end'>
        <thead className='w-full rounded-lg bg-gray-300 dark:bg-gray-400'>
          <tr className='py-1'>
            <th className='py-1 flex-wrap'>#</th>
            <th className='py-1 flex-wrap'>عنوان</th>
            <th className='py-1 flex-wrap'>کاربر بارگذار</th>
            <th className='py-1 flex-wrap'>دسته</th>
            <th className='py-1 flex-wrap'>قالب</th>
            <th className='py-1 flex-wrap'>کاربران مجاز تگ زننده</th>
            <th className='py-1 flex-wrap'>نام فایل</th>
            <th className='py-1 flex-wrap'>تعداد</th>
            <th className='py-1 flex-wrap'>تاریخ</th>
            <th className='py-1 flex-wrap'></th>
          </tr>
        </thead>
        <tbody className='w-full'>
          {files && files.slice(0,logsCount).map((l,idx)=> 
          <tr className='w-full'>
            <td className='py-1 flex-wrap border p-1'>{idx+1}</td>
            <td className='py-1 flex-wrap border p-1'>{l.title}</td>
            <td className='py-1 flex-wrap border p-1'>{l.user.name}</td>
            <td className='py-1 flex-wrap border p-1'>{l.categories.map(c=>c.title).join('/')}</td>
            {/* <td className='py-1 flex-wrap border p-1 whitespace-pre text-start text-xs'>{l.tagTemplates.map(tt=>
              tt.tagTemplate.title+':\n\t'+ tt.users.map(u=>u.name).join('/')).join("\r\n")}</td> */}
            {/* <td className='py-1 flex-wrap border p-1 whitespace-pre text-start text-xs'>{l.tagTemplates.map(tt=>(<tr ><td colSpan={2} className='h-full flex justify-center items-center'>{tt.tagTemplate.title}</td></tr>))}</td> */}
            <td className='border whitespace-pre text-start text-xs h-full'>
              {l.tagTemplates.map((tt, ttIdx)=>
              <tr className='w-full h-full'>
                <td className={`${ttIdx>0 && 'border-t'} w-full p-1`}>{tt.users.map((u,index, self)=><tr>{index===0?tt.tagTemplate.title:'\u00A0'}</tr>)}</td>
              </tr>)}
            </td>
            <td className='border whitespace-pre text-start text-xs h-full'>
              {l.tagTemplates.map((tt, ttIdx)=>
              <tr className='w-full h-full'>
                <td className={`${ttIdx>0 && 'border-t'} w-full p-1`}>
                  {edittingUsersTemplateId !== l._id+tt.tagTemplate._id && tt.users.map((u,index, self)=><tr>{self.length>1?`${index+1}- ${u.name}`:u.name}</tr>)}
                  {edittingUsersTemplateId === l._id+tt.tagTemplate._id && <MultiSelectComponent itemsCount='10' placeholder={`اختصاص به کاربران ... (پیش فرض: همه)`} className='text-xs text-start rounded border dark:border-none' data={users} fields={{title: 'name', value: '_id', hint: 'role'}} value={edittingUsersTemplate} onChange={(s)=>setEdittingUsersTemplate(s)}/>}
                </td>
                <td>
              {edittingUsersTemplateId !== l._id+tt.tagTemplate._id && <button onClick={()=>{setEdittingUsersTemplateId(l._id+tt.tagTemplate._id); setEdittingUsersTemplate(tt.users.map(u=>u._id))}} className='block w-full text-xs border rounded bg-blue-400 hover:bg-blue-300 py-1 px-2'>تغییر کاربران</button>}
              {edittingUsersTemplateId === l._id+tt.tagTemplate._id && <button onClick={()=>{setEdittingUsersTemplateId(null);setEdittingUsersTemplate([])}} className='block w-full text-xs border rounded bg-orange-400 hover:bg-orange-300 py-1 px-2'>انصراف</button>}
              {edittingUsersTemplateId === l._id+tt.tagTemplate._id && <button onClick={()=>editUsersHandler(l._id, tt.tagTemplate._id)} className='block w-full text-xs border rounded bg-teal-400 hover:bg-teal-300 py-1 px-2'>ثبت</button>}
                </td>
              </tr>)}
            </td>
            <td dir='ltr' className='py-1 flex-wrap border p-1'>{l.filename}</td>
            <td className='py-1 flex-wrap border p-1'>{l.count}</td>
            <td dir='ltr' className='py-1 flex-wrap border p-1'>{moment(l.createdAt, "YYYY/MM/DD hh:mm:ss").local('fa').format('jYYYY/jMM/jDD hh:mm:ss')}</td>
            <td dir='ltr' className='py-1 border p-1'>
              {deletingFile !== l._id && <button onClick={()=>setDeletingFile(l._id)} className='block w-full text-xs border rounded bg-red-400 hover:bg-red-300 py-1 px-2'>حذف</button>}
              {deletingFile === l._id && <button onClick={()=>setDeletingFile(null)} className='block w-full text-xs border rounded bg-orange-400 hover:bg-orange-300 py-1 px-2'>انصراف</button>}
              {deletingFile === l._id && <button onClick={()=>deleteFileHandler(l._id)} className='block w-full text-xs border rounded bg-red-400 hover:bg-red-300 py-1 px-1'>تائید حذف</button>}
            </td>
          </tr>)}
        </tbody>
      </table>
      <div className='w-full flex justify-center items-center'>
        {files.length > logsCount && <button onClick={()=>setLogsCount(l=>l+10)} className="rounded bg-blue-400 py-1 px-4 hover:bg-blue-300 cursor-pointer mt-2 text-xs">نمایش بیشتر</button>}
      </div>
    </div>
  )
}

export default PhraseManagement