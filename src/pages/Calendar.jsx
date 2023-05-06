import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useToken from '../hooks/useToken';
import iMoment from 'moment-hijri'
import moment from 'moment-jalaali'
import {BsFillCaretLeftFill, BsCircleFill} from 'react-icons/bs'

const Calendar = () => {
  const { user, theme } = useSelector((state) => ({
    theme: state.item,
    user: state.auth.user
  }));

  const dispatch = useDispatch();
  const [accessToken] = useToken();
  const [dates, setDates] = useState([]);
  const [monthSubtract, setMonthSubtract] = useState(0);
  const [hoverDate, setHoverDate] = useState(null)
  const [gregorianDateHover, setGregorianDateHover] = useState(false)
  const [hijriDateHover, setHijriDateHover] = useState(false)
  const [currentHourDeg, setCurrentHourDeg] = useState(90)
  const [currentMinuteDeg, setCurrentMinuteDeg] = useState(90)
  const [currentSecDeg, setCurrentSecDeg] = useState(90)

  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);
  const [milisecond, setMilisecond] = useState(0);
  const [day, setDay] = useState(0);
  const [pm, setPm] = useState(false);
  const [h24, setH24] = useState(false);

  useEffect(() => {
    computeDates()
  }, [])
  useEffect(() => {
    setCurrentHourDeg((90+parseInt((hour+minute/60)/12*360))%360)
    setCurrentMinuteDeg((90+parseInt((minute+(second+milisecond/1000)/60)/60*360))%360)
    setCurrentSecDeg((90+parseInt((second+milisecond/1000)/60*360))%360)
  }, [milisecond])


  useEffect(()=> {
      const update = () => {
          const date = new Date();
          let hour = date.getHours();
          if(!h24) {
              hour = (hour % 12) || 12;
          }
          setHour(hour);
          setMinute(date.getMinutes());
          setSecond(date.getSeconds());
          setMilisecond(date.getMilliseconds());
          setDay(date.getDay());
          setPm(date.getHours() >= 12);
      }

      update();

      const interval = setInterval(()=> {
          update();
      }, 10);

      return ()=>clearInterval(interval);
  }, []);

  useEffect(() => {
    // setInterval(() => {
    //   // setCurrentSec(`rotate-[${45+parseInt(new Date().getSeconds()/60*360)}deg]`)
    //   console.log(`rotate-[${45+parseInt(new Date().getSeconds()/60*360)}deg]`)
    // }, 1000);
  }, [])

  useEffect(() => {
    computeDates()
  }, [monthSubtract])

  const holidays = [{date:'2022-12-27',title:'شهادت حضرت زهرا (سلام الله علیها)', type: 1},{date:'2023-01-16',title:'فرار محمدرضا پهلوی از کشور', type: 0}]
  const computeDates = ()=>{
    // console.log(monthSubtract)
    // console.log(parseInt(moment().subtract(monthSubtract, 'month').format('jYYYY')))
    // console.log(parseInt(moment().subtract(monthSubtract, 'month').format('jMM'))-1)
    const monthLength = moment.jDaysInMonth(parseInt(moment().subtract(monthSubtract, 'month').format('jYYYY')),parseInt(moment().subtract(monthSubtract, 'month').format('jMM'))-1);
    const days= [...Array(monthLength)].map((d, index)=>{return {jalali: moment().subtract(monthSubtract, 'month').endOf('jMonth').subtract(monthLength-index-1, 'day').format('jYYYY-jMM-jDD'), gregorian: moment().subtract(monthSubtract, 'month').endOf('jMonth').subtract(monthLength-index-1, 'day').format('YYYY-MM-DD'), hijri: iMoment(moment().subtract(monthSubtract, 'month').endOf('jMonth').subtract(monthLength-index-1, 'day').format('yyyy-MM-DD').toString(), 'YYYY-MM-DD').format('iYYYY-iMM-iD')}})
    setDates(days)
  }
  return (
    <div
      className={`mx-1 absolute md:inset-0 box-border bg-gray-800 dark:bg-secondary-dark-bg p-2 md:p-10 md:transition-2 mt-[4.25rem] text-sm`}
    >
      <div className="relative w-full h-full md:border-4 md:border-teal-600 rounded-md">
        <div className="w-full h-full flex justify-center items-center my-2">
          <div className="relative w-36 md:w-96 aspect-square rounded-full border-2 border-teal-600 bg-gray-700 p-2">
            <div className="relative w-full aspect-square rounded-full">
              {[...Array(60)].map((_,idx)=>
                <div key={idx} style={{rotate: `${(90+idx*6)%360}deg`}} className={`absolute top-1/2 -translate-y-1/2 w-1/2 ${theme.direction==='rtl'?'origin-[0_calc(100%-0.125rem)]':'origin-[100%_calc(100%-0.125rem)]'}`}>
                  <hr className={`${((90+idx*6)%360)%5===0?'w-4':'w-2'} border rounded-e-full border-teal-600`}></hr>
                </div>
              )}
              <hr style={{rotate: `${currentHourDeg}deg`}} className={`absolute top-1/2 ${theme.direction==='rtl'?'start-1/2 rounded-e-full':'end-1/2 rounded-s-full'} -translate-y-1/2 w-1/4 border-4 origin-[100%_calc(100%-0.5rem)] border-gray-400`}/>
              <hr style={{rotate: `${currentMinuteDeg}deg`}} className={`absolute top-1/2 ${theme.direction==='rtl'?'start-1/2 rounded-e-full':'end-1/2 rounded-s-full'} -translate-y-1/2 w-2/5 border-2 origin-[100%_calc(100%-0.25rem)] border-gray-400`}/>
              <hr style={{rotate: `${currentSecDeg}deg`}} className={`absolute top-1/2 ${theme.direction==='rtl'?'start-1/2 rounded-e-full':'end-1/2 rounded-s-full'} w-1/2 origin-[100%_50%] border-red-500`}/>
              <div className={`absolute top-1/2 ${theme.direction==='rtl'?'start-1/2':'end-1/2'} translate-x-1/2 -translate-y-1/2 w-3 bg-red-600 aspect-square rounded-full`}/>
              {/* <div className="absolute w-1/2 h-full border-e opacity-5"></div>
              <div className="absolute w-full h-1/2 border-b opacity-5"></div> */}
            </div>
          </div>
        </div>
        <ul className={`md:absolute md:bottom-0 md:translate-y-[calc(0.25%+0.5rem)] ${theme.direction==='rtl'?'md:translate-x-1/2':'md:-translate-x-1/2'} md:start-1/2 grid grid-cols-7 md:flex justify-center items-center md:w-full 2xl:w-10/12 rounded-lg md:pe-4 bg-white dark:bg-secondary-dark-bg`}>
          <li className="col-span-7 flex md:flex-col justify-between md:justify-center items-center font-bold gap-2 border-b md:border-b-0 md:border-e py-2 md:py-0 px-4">
            <div className="">{new Intl.DateTimeFormat('fa-IR-u-nu-latn', {month: 'short'}).format(moment().subtract(monthSubtract, 'month'))}</div>
            <div className="">{new Intl.DateTimeFormat('fa-IR-u-nu-latn', {year:'numeric'}).format(moment().subtract(monthSubtract, 'month'))}</div>
            <div className="grid grid-cols-3 items-center gap-2">
              <BsFillCaretLeftFill onClick={()=>setMonthSubtract(pre=>parseInt(pre)+1)} className="text-teal-600 hover:text-teal-400 cursor-pointer rotate-180 text-2xl md:text-lg"/>
              <BsCircleFill onClick={()=>setMonthSubtract(0)} className="text-teal-600 hover:text-teal-400 cursor-pointer text-xl md:text-lg"/>
              <BsFillCaretLeftFill onClick={()=>setMonthSubtract(pre=>parseInt(pre)-1)} className="text-teal-600 hover:text-teal-400 cursor-pointer text-2xl md:text-lg"/>
            </div>
          </li>
          {dates.length>0 && moment(dates[0].gregorian).day() < 6 && [...Array(moment(dates[0].gregorian).day()+1)].map((_,idx)=>
            <li key={idx}></li>
          )}
          {dates.map((d,idx)=>
            <li key={idx} onMouseEnter={()=>setHoverDate(d.gregorian)} onMouseLeave={()=>setHoverDate(null)} className={`relative w-full md:w-[3.5%] bg-white dark:bg-secondary-dark-bg py-1 px-2 ${(moment(d.gregorian).day() === 5 || holidays.filter(h=>h.date===d.gregorian && h.type === 1).length > 0) && 'text-red-500 dark:text-amber-500'} ${moment().format('YYYY-MM-DD')===d.gregorian && 'z-50 bg-red-500 dark:bg-amber-400 rounded-lg scale-110 md:scale-125 mx-1 text-white dark:text-gray-600'} ${idx===0 && 'rounded-s-lg'} ${idx===dates.length-1 && 'rounded-e-lg'}`}>
              {/* hover dates */}
              <div dir='rtl' className={`absolute end-1/2 top-0 -translate-x-1/2 -translate-y-full flex flex-col justify-center items-center md:px-2 bg-black dark:bg-white opacity-70 min-h-full rounded-t-lg ${hoverDate !== d.gregorian && 'hidden'} ${moment().format('YYYY-MM-DD')===d.gregorian && 'scale-[80%] -translate-y-[calc(100%-1.1rem)]'} ${idx===0 && 'rounded-s-lg'} ${idx===dates.length-1 && 'rounded-e-lg'}`}>
                <div className={`text-white dark:text-gray-600 whitespace-pre text-xs`}>{new Intl.DateTimeFormat('fa-IR', {dateStyle: 'long'}).format(new Date(d.gregorian))}</div>
                <div style={{fontFamily: 'ISFont'}} className={`text-white dark:text-gray-600 whitespace-pre text-xs`}>{moment(d.gregorian).format('DD YYYY MMMM')}</div>
                <div className={`text-white dark:text-gray-600 whitespace-pre text-xs`}>{iMoment(d.gregorian, 'YYYY-MM-DD').format('iD iMMMM iYYYY')}</div>
                <hr/>
                {holidays.filter(h=>h.date===d.gregorian).length > 0 && holidays.filter(h=>h.date===d.gregorian).map((h, hIdx)=><div key={hIdx} className={`${h.type===1?'text-red-500 font-bold':'text-white'} dark:text-gray-600 whitespace-pre`}>{h.title}</div>)}
              </div>
              {/* current date */}
              {moment().format('YYYY-MM-DD')===d.gregorian && 
                <>
                <div className={`absolute top-0 start-0 w-full h-full z-50 bg-red-500 dark:bg-amber-400 rounded-lg py-1 px-2 text-white dark:text-gray-600`}>
                  <div className="w-full text-center py-1 text-[0.6rem] font-bold">{['یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه','شنبه'][moment(d.gregorian).day()]}</div>
                  <div className="w-full text-center py-1 text-xl font-bold">{moment(d.gregorian).format('jD')}</div>
                  <div className="flex justify-between items-center w-full text-[0.7rem]">
                    <div style={{fontFamily: 'ISFont'}} className={`${moment().format('YYYY-MM-DD')===d.gregorian?'text-white dark:text-gray-600':[0,1].includes(moment(d.gregorian).day())?'text-red-500 dark:text-amber-500':'text-black dark:text-white'}`}>{moment(d.gregorian).format('D')}</div>
                    <div className={``}>{d.hijri.split('-')[2]}</div>
                  </div>
                </div>
                <BsFillCaretLeftFill className={`absolute bottom-0 translate-y-[calc(100%-0.3rem)] ${theme.direction==='rtl'?'start-1/2':'end-1/2'} translate-x-1/2 z-50 text-red-500 dark:text-amber-400 rotate-90 text-lg`}/>
                </>
              }
              {/* other dates */}
              <div className="w-full text-center py-1 text-[0.6rem] font-bold">{['یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه','شنبه'][moment(d.gregorian).day()]}</div>
              <div className="w-full text-center py-1 text-xl font-bold">{moment(d.gregorian).format('jD')}</div>
              <div className="grid grid-cols-2 gap-2 w-full text-[0.7rem]">
                <div onMouseEnter={()=>setGregorianDateHover(true)} onMouseLeave={()=>setGregorianDateHover(false)} style={{fontFamily: 'ISFont'}} className={`${moment().format('YYYY-MM-DD')===d.gregorian?'text-white dark:text-gray-600':[6,0].includes(moment(d.gregorian).day())?'text-red-500 dark:text-amber-500':'text-black dark:text-white'} ${gregorianDateHover && 'bg-gray-200'} w-full flex justify-center items-center`}>{moment(d.gregorian).format('D')}</div>
                <div onMouseEnter={()=>setHijriDateHover(true)} onMouseLeave={()=>setHijriDateHover(false)} className={`${hijriDateHover && 'bg-gray-200'} w-full flex justify-center items-center`}>{d.hijri.split('-')[2]}</div>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Calendar;
