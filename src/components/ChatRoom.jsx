import axios from 'axios';
import React, { createRef, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { BiEdit, BiSend, BiTrash } from 'react-icons/bi';
import { CgClose, CgPocket, CgRemove } from 'react-icons/cg';
import { FaReply, FaShare } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import TextareaAutosize from 'react-textarea-autosize';
import useToken from '../hooks/useToken';
import io from 'socket.io-client'
import moment from 'jalali-moment'

function ChatRoom({roomId, className, filterTxt}) {
  const {t} = useTranslation();

  const {user, theme} = useSelector((state) => ({
    user: state.auth.user,
    theme: state.item
  }))

  const [accessToken, setToken] = useToken()
  const [showMenu,setShowMenu] = useState(null)
  const [messageTxt,setMessageTxt] = useState('')
  const [messages, setMessages] = useState([]);
  const [chatRoom, setChatRoom] = useState();
  const [edittingMessageId, setEdittingMessageId] = useState(null);
  const [replyMessageId, setReplyMessageId] = useState(null);
  const [forwardMessageId, setForwardMessageId] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);

  const textareaRef = useRef(null)  

  const socketRef = useRef();
  let elementsRef = useRef([]);

  useEffect(()=>{
    socketRef.current = io.connect(process.env.REACT_APP_SOCKET_APP_BASE_URL)
    socketRef.current.emit("join_room", roomId);
    socketRef.current.emit("get_messages", roomId);
    scrollToBottom();
  },[])

  useEffect(()=>{
    socketRef.current.on("receive_message", ({chats, chatRoom})=>{
      setMessages(chats);
      setChatRoom(chatRoom)
      scrollToBottom();
    })
    return () => {
      socketRef.current.off("receive_message", ({chats})=>{
        setMessages(chats);
        scrollToBottom();
      });
    }
  },[messages])

  useEffect(() => {
    try {
      textareaRef.current.focus()
    } catch (error) {
      
    }
  }, [chatRoom])

  const scrollToBottom = () => {
    if(messages.length > 0)
      elementsRef.current[messages.length-1].scrollIntoView({ behavior: "smooth" })
  }

  const sendMessageHanler = async()=>{
    if(messageTxt.trim() === '') return;
    if(!edittingMessageId){
      socketRef.current.emit("send_message",{
        userId: user._id,
        roomId: roomId,
        message: messageTxt,
        type: 1,
        replyTo: replyMessageId,
        forwardFrom:null,
      })
    }
    else{
      socketRef.current.emit("edit_message",{
        messageId: edittingMessageId,
        message: messageTxt,
        roomId: roomId
      })
    }
    setEdittingMessageId(null);
    setReplyMessageId(null);
    setMessageTxt('');
  }

  const deleteMessageHanler = async(id)=>{
    socketRef.current.emit("delete_message",{
      messageId: id,
      roomId: roomId
    })
  }

  const toJalai = (stringDate)=>{
    return {date: moment(stringDate).locale('fa').format('jYYYY/jMM/jDD'), time: moment(stringDate).locale('fa').format('HH:mm:ss'), datetime: moment(stringDate).locale('fa').format('jYYYY/jMM/jDD HH:mm:ss')}
  }

  useEffect(() => {
    setTimeout(()=>{

      scrollToBottom();
    },1000)
  }, [])
  

  return (
    <div className={`${className} text-xs border dark:border-gray-500 rounded-md dark:text-gray-700 overflow-y-auto flex-grow flex flex-col justify-between `}>
      <div className="overflow-y-auto scrollbar-thin h-full scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-800">
        {/* باکس پیام */}
        {messages.filter(m=>m.message.indexOf(filterTxt) > -1).map((m, index)=>
        <div key={index} onMouseEnter={()=>setShowMenu(m._id)} onMouseLeave={()=>setShowMenu(null)} className={`w-[calc(100%-1rem)] grid justify-items-stretch py-1 mx-2 hover:bg-yellow-100 dark:hover:bg-blue-100 ${(edittingMessageId===m._id || selectedMessages.includes(m._id)) && 'bg-amber-100 dark:bg-red-100'}`}>
          <div key={index} dir={theme.direction === 'ltr'?m.user._id===user._id?'rtl':'ltr':m.user._id===user._id?'ltr':'rtl'} className={`flex justify-between items-end gap-1 text-start w-full ${m.user._id===user._id?'justify-self-start':'justify-self-end'}`}>
            {/* منوی پیام */}
            <div dir='ltr' className="flex justify-start items-center gap-1 dark:text-gray-400">
              {m.user._id===user._id && showMenu===m._id && <BiEdit onClick={()=>{setEdittingMessageId(m._id);setMessageTxt(m.message);textareaRef.current.focus()}} className='cursor-pointer hover:text-blue-400'/>}
              {m.user._id===user._id && showMenu===m._id && <BiTrash onClick={()=>deleteMessageHanler(m._id)} className='cursor-pointer hover:text-red-400'/>}
              {showMenu===m._id && <FaShare onClick={()=>{setReplyMessageId(m._id);textareaRef.current.focus()}} className='rotate-180 cursor-pointer hover:text-red-400'/>}
              {showMenu===m._id && <FaShare onClick={()=>{setForwardMessageId(m._id)}} className='cursor-pointer hover:text-red-400'/>}
            </div>
            {/* محتوای پیام */}
            <div ref={ref=>{elementsRef.current[index]=ref}} dir={theme.direction} className="flex justify-start items-end gap-1">
              <div onClick={()=>{setSelectedMessages([m.replyTo._id]);elementsRef.current[messages.findIndex(f=>f._id===m.replyTo._id)].scrollIntoView({ behavior: "smooth" })}} className={`w-calc[(100%-4rem)] text-start rounded-t-md ${m.user._id===user._id?'bg-green-300 rounded-e-md me-3':'bg-blue-300 ms-3 rounded-s-md'} overflow-hidden`}>
              {m.replyTo && 
              <div onClick={()=>elementsRef.current[index].scrollIntoView({ behavior: "smooth" })} className={`flex justify-sart items-center gap-1 px-2 text-gray-500 text-[0.6rem] ${m.user._id===user._id?'bg-green-200':'bg-blue-200'} rounded-t-md mb-1 cursor-pointer ${selectedMessages.includes(m._id) && 'border-4'}`}>
                <FaShare className='rotate-180'/>
                <p className='w-full text-end'>{m.replyTo.message.substring(0,30)}...</p>
              </div>}
                {m.user._id!==user._id && <p className='text-[0.7rem] font-bold mb-2 px-2'>{m.user.name}</p>}
                <p className={`mt-1 ${m.user._id===user._id?'text-end':'text-start'} whitespace-pre-wrap px-2 ${selectedMessages.includes(m._id) && 'font-semibold'}`}>{m.message}</p>
                <p className={`w-full text-gray-600 text-[0.7rem] mt-1 text-start px-1`}>{toJalai(m.createdAt).datetime}<span className='text-[0.5rem] italic'>{m.createdAt !== m.updatedAt && ` (ویرایش شده در ${toJalai(m.updatedAt).datetime})`}</span></p>
              </div>
              {m.user._id!==user._id && <img className="h-8 w-8 p-[0.1rem] rounded-full border border-600" src={m.user.avatar}/>}
            </div>
          </div>
        </div>
        )}
      </div>
      <div className="">
        {edittingMessageId && <div className='w-full flex justify-between items-center border-t bg-gray-300 p-1 text-[0.7rem]'><p className='text-[0.4rem] whitespace-pre text-gray-500'>{'در حال ویرایش: '}</p><p className='truncate'>{messages.filter(m=>m._id===edittingMessageId)[0].message}</p><CgClose className='cursor-pointer text-lg text-gray-500' onClick={()=>{setEdittingMessageId(null);setMessageTxt('')}}/></div>}
        {replyMessageId && <div className='w-full flex justify-between items-center border-t bg-gray-300 p-1 text-[0.7rem]'><p className='text-[0.4rem] whitespace-pre text-gray-500'>{'پاسخ به: '}</p><p className='truncate'>{messages.filter(m=>m._id===replyMessageId)[0].message}</p><CgClose className='cursor-pointer text-lg text-gray-500' onClick={()=>{setReplyMessageId(null);setMessageTxt('')}}/></div>}
        {chatRoom && (chatRoom.type < 3 || (chatRoom.type===3 && (['admin','owner'].includes(chatRoom.members.filter(m=>m.user._id === user._id)[0].role)))) && <div className="border-t flex justify-between gap-1 items-end">
          <TextareaAutosize ref={textareaRef} onKeyDown={(e)=>{if(e.keyCode===13){e.preventDefault();e.ctrlKey?setMessageTxt(messageTxt+'\n'):sendMessageHanler()}}} style={{resize: 'none'}} placeholder='متن پیام ...' maxRows={5} wrap={true} type="text" value={messageTxt} className='bg-transparent px-2 py-1 felx-grow w-full focus:outline-0 dark:text-gray-300 text-sm scrollbar-thin' onChange={(e)=>setMessageTxt(e.target.value)}/>
          <BiSend onClick={()=>sendMessageHanler()} className={`text-blue-500 hover:text-blue-400 m-1 text-2xl ${theme.direction === 'rtl' && 'rotate-180'} cursor-pointer`}/>
        </div>}
      </div>
    </div>
  )
}

export default ChatRoom