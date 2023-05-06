import React, { useState } from 'react'
import {PhraseManagement, FieldManagement, CategoryManagement, TagTemplateManagement} from '../components'

function ContentManegement() {
  const [selectedTab, setSelectedTab] = useState(0)
  return (
    <div className='mt-16'>
      <div className="m-1 p-2 md:p-4 bg-white dark:bg-[#42464D] rounded-md dark:text-white">
        <div className="sticky top-[3.75rem] z-50 grid grid-cols-2 md:grid-cols-4 w-full justify-center items-center text-xs dark:text-white h-8 rounded bg-slate-200 dark:bg-slate-400">
          <div onClick={()=>setSelectedTab(0)} className={`col-span-1 flex justify-around items-center cursor-pointer hover:bg-slate-400 hover:dark:bg-slate-500 font-bold ${selectedTab===0 && 'bg-slate-400 dark:bg-slate-500 text-white'} h-full`}>مدیریت دسته‌ها</div>
          <div onClick={()=>setSelectedTab(1)} className={`col-span-1 flex justify-around items-center cursor-pointer hover:bg-slate-400 hover:dark:bg-slate-500 font-bold ${selectedTab===1 && 'bg-slate-400 dark:bg-slate-500 text-white'} h-full`}>مدیریت گزینه‌ها</div>
          <div onClick={()=>setSelectedTab(2)} className={`col-span-1 flex justify-around items-center cursor-pointer hover:bg-slate-400 hover:dark:bg-slate-500 font-bold ${selectedTab===2 && 'bg-slate-400 dark:bg-slate-500 text-white'} h-full`}>مدیریت قالب‌ها</div>
          <div onClick={()=>setSelectedTab(3)} className={`col-span-1 flex justify-around items-center cursor-pointer hover:bg-slate-400 hover:dark:bg-slate-500 font-bold ${selectedTab===3 && 'bg-slate-400 dark:bg-slate-500 text-white'} h-full`}>مدیریت عبارات</div>
        </div>
        <div className="w-full min-h-590 bg-slate-100 dark:bg-[#50555e] rounded">
          {selectedTab === 0 && <div className='p-2'><CategoryManagement/></div>}
          {selectedTab === 1 && <div className='p-2'><FieldManagement/></div>}
          {selectedTab === 2 && <div className='p-2'><TagTemplateManagement/></div>}
          {selectedTab === 3 && <div className='p-2'><PhraseManagement/></div>}
        </div>
      </div>
    </div>
  )
}

export default ContentManegement