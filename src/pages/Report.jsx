import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useScrollDirection } from 'react-use-scroll-direction'
import useToken from '../hooks/useToken';
import * as XLSX from 'xlsx'
import moment from 'jalali-moment'
import { MultiSelect, MultiSelectComponent } from '../components';

const Home = () => {
  const { user, theme } = useSelector((state) => ({
    theme: state.item,
    user: state.auth.user
  }));

  const dispatch = useDispatch();
  const [errorMsg, setErrorMsg] = useState('')
  const [withExamples, setWithExamples] = useState()
  const [accessToken] = useToken();
    
  const tabColors = ['blue','purple','orange','rose'];
  const colors = ['#78909c','#42a5f5', '#ce93d8','#ffa726','#26c6da','#8bd346','#fb7185','#10b981']
  const [currentPage, setCurrentPage] = useState(1)
  const [filesStat, setFilesStat] = useState([])
  const [tagTemplates, setTagTemplates] = useState([])
  const [selectedTagTemplates, setSelectedTagTemplates] = useState([])
  const [statusFilter, setStatusFilter] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([])
  const [filterPhrase, setFilterPhrase] = useState('')

  const getData = async(files=[], statuses=[])=>{

    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/getSubmittedPhrases`,{
        fileIds: files,
        status: statuses,
        tagTemplates: selectedTagTemplates,
        withExamples: withExamples,
      },{
        headers:{accessToken}
      })

      if(response.data.error){
        return setErrorMsg(response.data.error)
      }

      convertJsonToExcel(response.data, files)
    } catch (error) {
      console.log(error)
    }
  }
  const getDataAll = async()=>{
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/getSubmittedPhrases`,{
        tagTemplateId: user.tagTemplate,
        withExamples: withExamples,
      },{
        headers:{accessToken}
      })

      if(response.data.error){
        return setErrorMsg(response.data.error)
      }
      convertJsonToExcel(response.data)
    } catch (error) {
      console.log(error)
    }
  }
  const convertJsonToExcel = (data, files)=>{
    const workBook = XLSX.utils.book_new();
    for (const ele in data) {
      const workSheet=XLSX.utils.json_to_sheet(data[ele])
      XLSX.utils.book_append_sheet(workBook, workSheet, ele)
    }
    //Generate buffer
    XLSX.write(workBook, {bookType: 'xlsx', type: 'buffer'});
    //Binary string
    XLSX.write(workBook, {bookType: 'xlsx', type: 'binary'});

    const now = new Date();
    const jdate = moment(now, 'YYYY/MM/DD').locale('fa').format('YYYY-MM-DD')
    XLSX.writeFile(workBook, `${files.length>1?`${files.length} فایل`:files.map(sf=>filesStat.filter(fs=>fs._id===sf)[0].file.replaceAll('/','-').replaceAll(':','-').replaceAll('?','-').replaceAll('*','-').replaceAll('<','-').replaceAll('>','-').replaceAll('|','-').replaceAll('"','-'))}_${jdate}_${now.getHours()}-${now.getMinutes()}.xlsx`)
  }
  
  const getTagTemplates = async()=>{
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/getTagTemplates`,{headers:{accessToken}});

      if(response.data.error){
        return setErrorMsg(response.data.error)
      }

      setTagTemplates(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getTagTemplates()
  }, [])

  const getFilesStat = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/getFilesStat`,{headers:{accessToken}});

      if(response.data.error){
        return setErrorMsg(response.data.error)
      }
      setFilesStat(response.data)
      setStatusFilter([...response.data.map((_,idx)=>[]),[]])
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    getFilesStat();
  }, [])

  return (
    <div
      className={`mx-1 max-w-full box-border bg-white dark:bg-secondary-dark-bg p-2 md:transition-2 pt-4 mt-[4.25rem]`}
    >
      <input type="text" placeholder='جستجوی عبارت' className='w-1/3 rounded border px-3 py-1 my-2 text-sm' value={filterPhrase} onChange={(e)=>setFilterPhrase(e.target.value)}/>
      <div className="flex justify-start items-center gap-3">
        <div className="flex justify-start items-center gap-1">
          <input type="checkbox" id="exampleChk" checked={withExamples} className='cursor-pointer' onChange={(e)=>setWithExamples(e.target.checked)}/>
          <label htmlFor="exampleChk"  className='text-xs whitespace-pre'>دریافت خروجی همراه با مثال‌های هر عبارت</label>
        </div>
        |
        <div className="flex flex-grow justify-start items-center gap-1">
          <label htmlFor="exampleChk"  className='text-xs whitespace-pre'>قالب:</label>
          <MultiSelectComponent className='border rounded' placeholder='انتخاب قالب عبارت' data={tagTemplates} fields={{title: 'title', value:'_id'}} value={selectedTagTemplates} onChange={(s)=>{setSelectedTagTemplates(s)}}/>
        </div>
      </div>
      {/* <button className='col-span-2 text-sm border rounded-md py-1 px-4 font-semibold border-blue-300 hover:bg-blue-100 whitespace-pre' onClick={()=>getData()}>دریافت عبارات تگ خورده</button>
      <button className='col-span-2 text-sm border rounded-md py-1 px-4 font-semibold border-blue-300 hover:bg-blue-100 whitespace-pre' onClick={()=>getDataAll()}>دریافت کل عبارات</button> */}
      {filesStat.filter(f=>f.file.indexOf(filterPhrase)>-1).slice((currentPage-1)*10,(currentPage)*10).map(f=>
        <div className="my-2 rounded-md bg-gray-200 dark:bg-gray-600">
          <div className="grid grid-cols-12 gap-2 w-full px-2 pt-1 pb-3">
            <div className="col-span-3 text-sm flex justify-start items-center gap-2"><input type="checkbox" checked={selectedFiles.includes(f._id)} className='cursor-pointer' onChange={(e)=>{e.target.checked?setSelectedFiles(pre=>[...pre, f._id]):setSelectedFiles(pre=>pre.filter(ff=>ff!==f._id))}}/><p>فایل: {f.file}</p></div>
            
            <div className="col-span-2 text-sm">
              <MultiSelectComponent placeholder='انتخاب وضعیت عبارت' data={f.stats.map(item =>{return{value: item.status, title: ['خام','در اختیار کارشناس','تگ خورده','دارای ابهام','در اختیار بازبین','اصلاح شده','برگشت شده','تائید شده'][item.status]}})} fields={{title: 'title', value:'value'}} value={statusFilter[filesStat.indexOf(f)]} onChange={(s)=>{setStatusFilter(statusFilter.map((sf,idx)=>{if(filesStat.indexOf(f)===idx){return s}else{return sf}}))}}/>
            </div>
            <div className="col-span-2 text-sm"><button onClick={()=>getData([f._id], statusFilter[filesStat.indexOf(f)])} className='rounded bg-blue-400 hover:bg-blue-300 text-xs px-2 py-1'>دریافت عبارات</button></div>
            <div className="col-span-2 text-sm"></div>
            <div className="col-span-2 text-sm"></div>
          </div>
          <div className="relative w-full h-3">
            {f.stats.map((s, idx)=><div key={idx} style={{width: `${Math.round(s.percent)}%`, background: colors[s.status]}} className="absolute opacity-60 start-0 top-0 w-full h-3"></div>)}
          </div>
          <div className="w-full px-3 flex justify-start items-center gap-7">
          {['خام','در اختیار کارشناس','تگ خورده','دارای ابهام','در اختیار بازبین','اصلاح شده','برگشت شده','تائید شده'].map((p, idx)=>
            <div className="relative flex justify-start items-center gap-1 py-1">
              <div style={{background: colors[idx]}} className='w-3 h-3 rounded-full opacity-60'></div>
              <p className='text-[0.7rem]'>{p}</p>
              <div className='text-[0.7rem]'>{`(${f.stats.filter(fs=>fs.status===idx).length>0?f.stats.filter(fs=>fs.status===idx)[0].total:0})`}</div>
            </div>)}
            <div className="relative flex justify-start items-center gap-1 py-1">
              <p className='text-[0.7rem]'>کل:</p>
              <div className='text-[0.7rem]'>({f.stats.reduce((accumulator, currentValue) => accumulator + currentValue.total,0)})</div>
            </div>
          </div>
          <div className="flex justify-start items-center gap-2 px-2 my-2 text-xs">
            {f.categories.map(c=><div className='rounded bg-white px-2'>#{c.title}</div>)}
          </div>
          <div className="gap-2 px-2 my-2 text-sm">
            قالب:{f.tagTemplates.map(t=><div className='flex justify-start items-center px-2'><span className='font-bold text-xs'>{t.tagTemplate.title}</span><span className='text-[0.6rem] ms-3'>اختصاص به: {t.users.map(u=>u.name).join('/')}</span>
            </div>)}
          </div>
        </div>
      )}

      <div className="w-full flex justify-center items-center gap-1">
        {filesStat.length > 0 && <Pagination className='w-1/2' arrayLength={filesStat.length} currentPage={currentPage} perPage={10} showCount={10} onChange={setCurrentPage}/>}
      </div>
      {selectedFiles.length > 0 && 
      <div className="my-2 rounded-md bg-gray-300 dark:bg-gray-600">
        <div className="text-sm font-bold mx-2">دریافت همزمان چند فایل</div>
        <div className="grid grid-cols-12 gap-2 w-full px-2 pt-1 pb-3">
          <div className="col-span-3 text-sm flex justify-start items-start gap-1">
            {selectedFiles.map(f=><p onClick={()=>setFilterPhrase(filesStat.filter(fs=>fs._id===f)[0].file)} className='text-xs px-2 py-1 border border-gray-200 rounded cursor-pointer'>{filesStat.filter(fs=>fs._id===f)[0].file}</p>)}
          </div>
          <div className="col-span-2 text-sm">
            <MultiSelectComponent placeholder='انتخاب وضعیت عبارت' data={['خام','در اختیار کارشناس','تگ خورده','دارای ابهام','در اختیار بازبین','اصلاح شده','برگشت شده','تائید شده'].map((item, index) =>{return{value: index, title: item}})} fields={{title: 'title', value:'value'}} value={statusFilter[filesStat.length]} onChange={(s)=>{setStatusFilter(statusFilter.map((sf,idx)=>{if(filesStat.length===idx){return s}else{return sf}}))}}/>
          </div>
          <div className="col-span-2 text-sm"><button onClick={()=>getData(selectedFiles, statusFilter[filesStat.length])} className='rounded bg-blue-400 hover:bg-blue-300 text-xs px-2 py-1'>دریافت عبارات</button></div>
        </div>
      </div>}
    </div>
  );
};


function Pagination({arrayLength=100, currentPage=1, onChange, className, showCount=10, perPage=10}) {
  let total = Math.ceil(arrayLength/perPage);
  let count = Math.min(showCount, total);
  const [pagesLabel, setPagesLabel] = useState([...Array(Math.min(1,count))].map((_,idx)=>idx+1))
  const detectPage = ()=>{
    switch (true) {
      case total<10:
        setPagesLabel([...Array(Math.min(1,count))].map((_,idx)=>idx+1))
        break;
      case currentPage<count-2 && total>count:
        setPagesLabel([...[...Array(count-2)].map((_,idx)=>idx+1),'...',total.toString()])
        break;
      case currentPage>= total - Math.floor(count/2) && total>count:
        
        setPagesLabel(['1','...',...[...Array(count-2)].map((_,idx)=>total-count+3+idx)])
        break;
    
      default:
        
        setPagesLabel(['1','...',...[...Array(count-4)].map((_,idx)=>currentPage+idx-1),'...',total.toString()])
        break;
    }
  }
  // useEffect(()=>{
  //   total = Math.ceil(arrayLength/perPage);
  //   console.log('perPage',perPage)
  //   console.log('arrayLength',arrayLength)
  //   console.log('total',Math.ceil(arrayLength/perPage))
  //   count = Math.min(showCount, total);
  //   console.log('count',Math.min(showCount, total))
  //   setPagesLabel([...Array(count)].map((_,idx)=>idx+1))
  //   console.log([...Array(Math.min(1,count))].map((_,idx)=>idx+1))
  // },[])
  useEffect(()=>{detectPage()},[currentPage])
  return (
    <div className={`${className} grid grid-cols-10`}>
      {[...Array(Math.min(total, count))].map((_,index)=>
      {return pagesLabel[index]==='...'?(<div key={index} className="felx justify-center items-center w-6 h-6 text-center rounded-full text-sm">{pagesLabel[index]}</div>):(<div key={index} onClick={()=>onChange(pagesLabel[index])} className={`felx justify-center items-center w-6 h-6 text-center rounded-md border hover:bg-gray-300 cursor-pointer text-sm ${parseInt(currentPage)===parseInt(pagesLabel[index]) && 'bg-blue-400 text-white'}`}>{pagesLabel[index]}</div>)}
      )}
    </div>
  )
}

export default Home;
