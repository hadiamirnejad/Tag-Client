import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useScrollDirection } from 'react-use-scroll-direction'
import { MultiSelectComponent } from '../components';
import useToken from '../hooks/useToken';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import gregorian from "react-date-object/calendars/gregorian";
import persian_fa from "react-date-object/locales/persian_fa";


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'left',
    },
  },
};

const Home = () => {
  const { user, theme } = useSelector((state) => ({
    theme: state.item,
    user: state.auth.user
  }));

  const dispatch = useDispatch();

  const {scrollDirection} = useScrollDirection()
  const [showNavbar, setShowNavbar] = useState(true)
  const [users, setUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [tagTemplates, setTagTemplates] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [userStatistics, setUserStatistics] = useState()
  const [statistics, setStatistics] = useState()
  const [chartData, setChartData] = useState();
  const [fromDate, setFromDate] = useState(new DateObject({
    date: new Date(),
    calendar: persian,
  }).subtract(30, "d"))
  const [toDate, setToDate] = useState(new DateObject({
    date: new Date(),
    calendar: persian,
  }))

  const [accessToken] = useToken();
  useEffect(()=> {
    if(scrollDirection == 'UP'){
      setShowNavbar(true)
    }
    if(scrollDirection == 'DOWN'){
      setShowNavbar(false)
    }
  },[scrollDirection])

  useEffect(()=> {
    const date1 = new DateObject({
      date: new Date(),
      calendar: persian,
    })
    const date2 = new DateObject({
      date: new Date(),
      calendar: persian,
    })
    setFromDate(date1.subtract(30, "d"))
    setToDate(date2)
  },[])

  const getCategories = async()=>{
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/getCategories`,{accessToken})

      if(response.data.error){
        return;
      }
      setCategories(response.data)

    } catch (error) {
      
    }
  }

  const getUsers = async()=>{
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/getUsers`,{},{accessToken})

      if(response.data.error){
        return;
      }

      setUsers(response.data.users)
      
    } catch (error) {
      console.log(error)
    }
  }

  const getTagTemplates = async()=>{
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/getTagTemplates`,{accessToken})

      if(response.data.error){
        return;
      }
      setTagTemplates(response.data)
    } catch (error) {
      console.log(response.data.error)
    }
  }

  const getUserStatistics = async()=>{
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/getUserStatistics`,{
        users: (user.role==='admin')?selectedUsers.length>0?selectedUsers:users.map(u=>u._id):[user._id],
        fromDate: fromDate,
        toDate: toDate
      },{accessToken})

      if(response.data.error){
        return;
      }
      setUserStatistics(response.data)
      setChartData(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getPhrasesStatistics = async()=>{
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/getPhrasesStatistics`,{
        categories: selectedCategories,
        users: user.role==='admin'?selectedUsers:[user._id],
        fromDate: fromDate,
        toDate: toDate
      },{accessToken})

      if(response.data.error){
        return;
      }
      
      setStatistics(response.data)
    } catch (error) {
      
    }
  }

  useEffect(() => {
    getCategories();
    getUsers();
  }, [])

  useEffect(() => {
    getTagTemplates();
  }, [categories])

  useEffect(() => {
    getUserStatistics();
  }, [users, selectedUsers, fromDate, toDate])

  useEffect(() => {
    getPhrasesStatistics();
  }, [selectedCategories, selectedUsers])
  
  const statuses = [
    {status: 0, title: 'خام'},
    {status: 1, title: 'دریافت توسط کارشناس'},
    {status: 2, title: 'تگ خورده'},
    {status: 3, title: 'دارای ابهام'},
    {status: 4, title: 'بازبینی'},
    {status: 6, title: 'رد شده'},
    {status: 7, title: 'تائید شده'},
  ]

  return (
    <div
      className={`mx-1 max-w-full box-border bg-white dark:bg-secondary-dark-bg p-2 md:transition-2 pt-4 mt-[4.25rem] text-sm`}
    >
      <div className="flex justify-content items-center gap-2">
        {categories && <MultiSelectComponent placeholder='همه دسته‌ها' className='rounded-md border my-2' data={categories} fields={{title: 'title', value:'_id', hint: 'description'}} value={selectedCategories} onChange={(s)=>{setSelectedCategories(s)}}/>}
        {user.role === 'admin' && <MultiSelectComponent placeholder='همه کاربران' itemsCount={20} className='rounded-md border my-2' data={users} fields={{title: 'name', value:'_id', hint: 'role'}} value={selectedUsers} onChange={(s)=>{setSelectedUsers(s)}}/>}
        <p className='text-sm whitespace-pre'>از تاریخ:</p>
        <DatePicker inputClass='text-sm border rounded-md pt-1 px-2 dark:text-gray-500' value={fromDate}  showOtherDays calendar={persian} locale={persian_fa} onChange={setFromDate}/>
        <p className='text-sm whitespace-pre'>تا تاریخ:</p>
        <DatePicker inputClass='text-sm border rounded-md pt-1 px-2 dark:text-gray-500' value={toDate}  showOtherDays calendar={persian} locale={persian_fa} onChange={setToDate}/>
      </div>
      <table className='w-full text-center text-sm rounded-md border dark:border-gray-500'>
        <thead className='bg-gray-200 dark:bg-gray-500 py-1'>
          <tr>
            <th>#</th>
            <th>قالب</th>
            {statuses.map((s, cIdx)=><th className='py-1' key={cIdx}>{s.title}</th>)}
          </tr>
        </thead>
        <tbody className=''>
          {statistics && tagTemplates.map((t,rIdx)=>
          <tr key={rIdx} className='border-b'>
            <td className='font-bold bg-gray-200 dark:bg-gray-500'>{rIdx+1}</td>
            <td className='font-bold bg-gray-200 dark:bg-gray-500'>{t.title}</td>
            {statuses.map((s, cIdx)=><td className='py-1' key={cIdx}>{statistics.filter(sf=>sf._id.tagTemplate===t.title && sf._id.status===s.status).length>0?statistics.filter(sf=>sf._id.tagTemplate===t.title && sf._id.status===s.status)[0]?.count:'-'}</td>)}
          </tr>)}
        </tbody>
      </table>
      <div className="flex justify-center items-center w-full">
        <div className="w-1/2 py-4">
          <p className='w-full text-center text-sm font-bold'>وضعیت تگ‌زن 30 روز اخیر</p>
          {chartData && <Line options={options} data={chartData} />}
        </div>
      </div>
    </div>
  );
};

export default Home;
