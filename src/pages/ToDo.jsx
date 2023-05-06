import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useToken from '../hooks/useToken';
import {BsFillCaretLeftFill, BsCircleFill} from 'react-icons/bs'
import {MdOutlineDragIndicator} from 'react-icons/md'
import {FiEdit} from 'react-icons/fi'
import {TiTick, TiTickOutline} from 'react-icons/ti'
import Draggable from 'react-draggable';
import {DropDown} from '../components';
import { FaTrashAlt } from 'react-icons/fa';
import useKey from '../hooks/useKey';

const ToDo = () => {
  const { user, theme } = useSelector((state) => ({
    theme: state.item,
    user: state.auth.user
  }));

  const dispatch = useDispatch();
  const [accessToken] = useToken();
  const [data, setData] = useState([]);

  useEffect(() => {
    getData();
  }, [])

  const getData = async()=>{
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/getToDo`,{
        user: user._id,
      },{accessToken})
      if(response.data.error){
        return;
      }
      setData(response.data.data)
    } catch (error) {
      
    }
  }

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const dragParent = useRef(null);
  const dragOverParent = useRef(null);
  const [colsCount, setColsCount] = useState(`grid-cols-${Math.max(1,Math.min(6, data.length+1))}`)
  const [edittingCategory, setEdittingCategory] = useState(null)
  const [edittingItem, setEdittingItem] = useState(null)
  const [deletingCategory, setDeletingCategory] = useState(null)
  const [deletingItem, setDeletingItem] = useState(null)
  const [filterItem, setFilterItem] = useState('')
  const [newItemsTitle, setNewItemsTitle] = useState([])
  const [colorPallete, setColorPallete] = useState(null)
  const colors = ['#78909c','#42a5f5', '#ce93d8','#ffa726','#26c6da','#8bd346','#fb7185','#10b981'];

  const onDragStart = (e, parentIndex, index) => {
    dragItem.current = index;
    dragParent.current = parentIndex;
  };

  const onDragEnter = (e, parentIndex, index) => {
    dragOverItem.current = index;
    dragOverParent.current = parentIndex;
  };

  const onDragEnd = (e, parentIndex, index) => {
    handleSort();
  };

  const handleSort = ()=>{
    let _data = [...data[dragParent.current].items];
    let _dataOver = [...data[dragOverParent.current].items];
    const draggedItemContent = _data.splice(dragItem.current, 1)[0];
    if(dragParent.current===dragOverParent.current)
    _dataOver=_data;
    _dataOver.splice(dragOverItem.current, 0, draggedItemContent)

    const result = data.map((d, index)=>{if(index===dragParent.current){return {category: data[dragParent.current].category, color: data[dragParent.current].color ,items: _data}}else{if(index===dragOverParent.current){return {category: data[dragOverParent.current].category, color: data[dragOverParent.current].color,items: _dataOver}}else{return d}}});
    setData(result)

    dragItem.current = null;
    dragOverItem.current = null;
    dragParent.current = null;
    dragOverParent.current = null;
    updateData(result);
  }

  const addCategoryHandler = ()=>{
    setData([...data,{category: 'دسته جدید', color:'', items:[]}])
    updateData([...data,{category: 'دسته جدید', color:'', items:[]}]);
  }

  useEffect(() => {
    setColsCount(`grid-cols-${Math.max(1,Math.min(6, data.length+1))}`)
    setNewItemsTitle([...Array(data.length)].map(d=>''))
  }, [data])

  const updateData = async(newData)=>{
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/addOrEditToDo`,{
        user: user._id,
        data: newData,
      },{accessToken})
    } catch (error) {
      
    }
  }

  const addItemToCategoryHandler = (idx)=>{
    if(newItemsTitle[idx].trim()==='')return;
    const newData = data.map((dd,ddIdx)=>{if(ddIdx===idx){return {category: dd.category, items: [...dd.items, {title: newItemsTitle[idx].trim(), priority: 1}], color: dd.color}}else{return dd}});
    setData(newData);
    setNewItemsTitle(newItemsTitle.map((nit, nitIdx)=>{if(nitIdx===idx){return ''}else{return nit}}))
    updateData(newData);
  }

  const changePriorityHandler = (idx, itemIdx, newPriority)=>{
    const newData = data.map((da,daIndex)=>{if(daIndex===idx){return {category: da.category, color: da.color, items: da.items.map((daItem, daIIndex)=>{if(daIIndex===itemIdx){return {title: daItem.title, priority: newPriority}}else{return daItem}})}}else{return da}});
    setData(newData);
    updateData(newData);
  }

  const [edittingCategoryTitle, setEdittingCategoryTitle] = useState('');
  
  const changeCategoryTitleHandler = (idx)=>{
    const newData = data.map((d,dIndex)=>{if(idx===dIndex){return {category: edittingCategoryTitle, color: colorPallete?colorPallete:d.color, items: d.items}}else{return d}});
    setData(newData);
    updateData(newData);

    setEdittingCategory(null);
    setEdittingCategoryTitle('');
    setColorPallete(null);
  }
  
  const [edittingCategoryItemTitle, setEdittingCategoryItemTitle] = useState('');

  const changeItemTitleHandler = (idx, itemIdx)=>{
    const newData = data.map((da,daIndex)=>{if(daIndex===idx){return {category: da.category, color: da.color, items: da.items.map((daItem, daIIndex)=>{if(daIIndex===itemIdx){return {title: edittingCategoryItemTitle, priority: daItem.priority}}else{return daItem}})}}else{return da}});
    setData(newData);
    updateData(newData);

    setEdittingCategoryItemTitle('');
    setEdittingItem(null);
  }

  const deleteCategoryHandler = (idx)=>{
    const newData = data.filter((d,index)=>index!==idx);
    setData(newData);
    updateData(newData);
    setDeletingCategory(null);
  }

  const deleteCategoryItemHandler = (idx, itemIdx)=>{
    const newData = data.map((da,daIndex)=>{if(daIndex===idx){return {category: da.category, color: da.color, items: da.items.filter((daItem, daIIndex)=>daIIndex!==itemIdx)}}else{return da}});
    setData(newData);
    updateData(newData);
    setDeletingItem(null);
  }

  useKey(13,()=>{
    if(edittingCategory !== null){
      changeCategoryTitleHandler(edittingCategory);
    }
    else if(edittingItem !== null){
      changeItemTitleHandler(edittingItem[0],edittingItem[1]);
    }
    else{
      if(document.activeElement.name === 'addItem'){
        console.log(document.activeElement.id)
        addItemToCategoryHandler(parseInt(document.activeElement.id));
      }
    }
  })

  useKey(27,()=>{
    if(edittingCategory !== null){
      setEdittingCategory(null);
      setEdittingCategoryTitle('');
      setColorPallete(null);
    }
    else if(edittingItem !== null){
      setEdittingCategoryItemTitle('');
      setEdittingItem(null);
    }
  })
  return (
    <div
      className={`mx-1 box-border bg-white dark:bg-secondary-dark-bg p-2 md:p-10 md:transition-2 mt-[4.25rem] text-sm`}
    >
      <input autoComplete='off' className='px-2 rounded border w-full md:w-1/4 mb-2 py-1 bg-transparent' placeholder='جستجوی پروژه' type="text" value={filterItem} onChange={(e)=>setFilterItem(e.target.value)}/>
      <hr className='w-full my-2'/>
      <div className={`h-full w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`}>
        {data && data.map((d,idx)=>
        <div key={idx} style={{border: `2px solid ${(colorPallete && idx===edittingCategory)?colorPallete:d.color}`}} className="flex flex-col h-full w-full rounded-lg">
          <div style={{background: (colorPallete && idx===edittingCategory)?colorPallete:d.color}} className="w-full px-2 flex justify-between items-center gap-2 py-1">
            {edittingCategory!==idx && deletingCategory!==idx && <p className='w-full py-1 px-2'>{d.category}</p>}
            {edittingCategory===idx && <input autoComplete='off' className='w-full border bg-transparent outline-0 py-1 px-2 rounded' value={edittingCategoryTitle} onChange={(e)=>setEdittingCategoryTitle(e.target.value)}/>}
            {edittingCategory!==idx && deletingCategory!==idx && <FiEdit className='cursor-pointer' onClick={()=>{setDeletingCategory(null);setEdittingCategory(idx); setEdittingCategoryTitle(d.category)}}/>}
            {edittingCategory!==idx && deletingCategory!==idx && <FaTrashAlt className='cursor-pointer text-red-500' onClick={()=>{setDeletingCategory(idx);setEdittingCategory(null)}}/>}
            {/* {edittingCategory===idx && <div style={{background: d.color}} className='cursor-pointer h-full aspect-square border rounded-full p-1' onClick={()=>{setColorPallete(idx)}}/>} */}
            {edittingCategory===idx && <TiTick className='cursor-pointer text-lg' onClick={()=>{changeCategoryTitleHandler(idx)}}/>}
            {deletingCategory===idx && <div className='w-full flex justify-between items-center gap-1 py-1'>
              <p>کلیه اطلاعات این دسته حذف شود؟</p>
              <div className='grid grid-cols-2 flex-grow gap-1'>
                <button className='rounded bg-red-400 hover:bg-red-300' onClick={()=>deleteCategoryHandler(idx)}>بله</button>
                <button className='rounded bg-teal-500 hover:bg-teal-400' onClick={()=>setDeletingCategory(null)}>خیر</button>
              </div>
            </div>}
          </div>
          {edittingCategory===idx && <div style={{background: (colorPallete && idx===edittingCategory)?colorPallete:d.color}} className="w-full grid grid-cols-8 justify-start items-center gap-2 h-26 px-2 pb-1">
              {colors.map((c,index)=><div key={index} style={{background: c}} className='cursor-pointer w-full aspect-square border text-lg rounded-full flex justify-center items-center' onClick={()=>{setColorPallete(c)}}>{c===d.color && <TiTick/>}</div>)}
          </div>}
          {/* <hr className='my-2 border-2 rounded border-gray-400'/> */}
          <div style={{border: `1px solid ${(colorPallete && idx===edittingCategory)?colorPallete:d.color}`}} onDragEnter={(e)=>{if(d.items.length === 0){onDragEnter(e, idx, d.items.length)}}} className="flex-grow h-full w-[calc(100%-0.5rem)] border rounded-t-lg p-2 bg-white dark:bg-secondary-dark-bg mx-1 mt-1">
            {d.items.filter(item=>item.title.indexOf(filterItem)>-1).map((item, itemIdx)=>
            <>
            <div key={itemIdx} draggable onDragStart={(e)=>onDragStart(e, idx, itemIdx)} onDragEnter={(e)=>onDragEnter(e, idx, itemIdx)} onDragEnd={(e)=>onDragEnd(e, idx, itemIdx)} className={`flex justify-between items-center gap-1 w-full ${item.priority===3?'bg-gray-300 dark:bg-gray-600':item.priority===2?'bg-gray-200 dark:bg-gray-500':'bg-gray-100 dark:bg-gray-400'} mb-2 p-1 px-2 rounded-md`}>
              <div className="flex justify-start gap-1 items-center">
                <p><MdOutlineDragIndicator className='cursor-grab'/></p>
                {!((deletingItem && deletingItem[0]===idx && deletingItem[1]===itemIdx) || (edittingItem && edittingItem[0]===idx && edittingItem[1]===itemIdx)) && <p className='py-1'>{item.title}</p>}
                {edittingItem && edittingItem[0]===idx && edittingItem[1]===itemIdx && <input autoComplete='off' type="text" className='w-full border rounded  bg-transparent outline-0 px-1 pb-1' value={edittingCategoryItemTitle} onChange={(e)=>{setEdittingCategoryItemTitle(e.target.value)}}/>}
              </div>
              <div className="flex justify-end gap-1 items-center">
                {edittingItem && edittingItem[0]===idx && edittingItem[1]===itemIdx && <DropDown paddingY='py-0' className='w-full' data={[{title:'عادی', value: 1},{title:'متوسط', value: 2},{title:'زیاد', value: 3}]} value={item.priority} onChange={(s)=>changePriorityHandler(idx, itemIdx, s)}/>}
                {!((deletingItem && deletingItem[0]===idx && deletingItem[1]===itemIdx) || (edittingItem && edittingItem[0]===idx && edittingItem[1]===itemIdx)) && <FiEdit className='cursor-pointer text-md' onClick={()=>{setEdittingItem([idx, itemIdx]);setEdittingCategoryItemTitle(item.title)}}/>}
                {!((deletingItem && deletingItem[0]===idx && deletingItem[1]===itemIdx) || (edittingItem && edittingItem[0]===idx && edittingItem[1]===itemIdx)) && <FaTrashAlt className='cursor-pointer text-md text-red-500 hover:text-red-400' onClick={()=>setDeletingItem([idx, itemIdx])}/>}
                {edittingItem && edittingItem[0]===idx && edittingItem[1]===itemIdx && <TiTick className='cursor-pointer text-md' onClick={()=>{changeItemTitleHandler(idx, itemIdx)}}/>}
                {/* {deletingItem && deletingItem[0]===idx && deletingItem[1]===itemIdx && <TiTick className='cursor-pointer' onClick={()=>setDeletingItem(null)}/>} */}
                {deletingItem && deletingItem[0]===idx && deletingItem[1]===itemIdx && <div className='w-full flex justify-between items-center gap-1 py-1'>
                  <p>حذف شود؟</p>
                  <div className='grid grid-cols-2 flex-grow gap-1'>
                    <button className='rounded bg-red-400 hover:bg-red-300 px-2 text-xs' onClick={()=>deleteCategoryItemHandler(idx, itemIdx)}>بله</button>
                    <button className='rounded bg-teal-500 hover:bg-teal-400 px-2 text-xs' onClick={()=>setDeletingItem(null)}>خیر</button>
                  </div>
                </div>}
              </div>
            </div>
            {dragOverParent.current===idx && dragOverItem.current===itemIdx && <hr className='my-2'/>}
            </>
            )}
          </div>
          <div style={{border: `1px solid ${(colorPallete && idx===edittingCategory)?colorPallete:d.color}`, borderTop: 'none'}} className="w-[calc(100%-0.5rem)] mx-1 mb-1 py-1 flex justify-start items-center gap-1 p-2 rounded-b-lg border-b border-x bg-white dark:bg-secondary-dark-bg">
            <input name='addItem' id={idx} autoComplete='off' placeholder='عنوان پروژه جدید' type="text" className='flex-grow px-2 w-full rounded  bg-transparent outline-0' value={newItemsTitle[idx]} onChange={(e)=>{setNewItemsTitle(newItemsTitle.map((nit, nitIdx)=>{if(nitIdx===idx){return e.target.value}else{return nit}}))}}/>
            <TiTick className='cursor-pointer text-lg' onClick={()=>addItemToCategoryHandler(idx)}/>
          </div>
        </div>
        )}
        <div onClick={addCategoryHandler} className="w-full h-full text-9xl font-bold flex justify-center items-center cursor-pointer rounded-lg text-gray-700 hover:text-gray-200 hover:bg-gray-500 dark:text-gray-300 dark:hover:text-gray-200">+</div>
      </div>
    </div>
  );
};

export default ToDo;
