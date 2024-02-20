import { useContext, useEffect, useState } from "react"
import Avatar from "./Avatar"
import Logo from "./Logo"
import { UserContext } from "./UserContext"
import {uniqBy} from "lodash"

export default function Chat(){
    const[ws,setWs]=useState(null)
    const[onlinePeople,setOnlinePeople]=useState({})
    const[selectedUserId,setSelectedUserId]=useState(null)
    const {usernname,id}=useContext(UserContext)
    const[newMessageText,setNewMessageText]=useState('')
    const[messages,setMessages]=useState([])
 

    useEffect(()=>{
        const ws= new WebSocket("ws://localhost:4000/")
        setWs(ws)
        ws.addEventListener('message',handleMessage)
    },[])
    function showOnlinePeople(peopleArray){
        const people = {}
        peopleArray.forEach(({userId,username})=>{
            people[userId]=username

        })
        setOnlinePeople(people);
    }
    function handleMessage(e){
        const messageData=JSON.parse(e.data)
       if('online' in messageData){
        showOnlinePeople(messageData.online)
       }else if("text" in messageData){
        setMessages(prev=>[...prev,{...messageData}])
       }
    }
    const onlinePeopleExcludingOurUser={...onlinePeople}
    delete onlinePeopleExcludingOurUser[id]

    const messagesWithoutDupes = uniqBy(messages,'id') ;

    function sendMessage(ev){
        ev.preventDefault()
        ws.send(JSON.stringify({
                recipient:selectedUserId,
                text:newMessageText,
        }));
        setMessages(prev=>([...prev,{text:newMessageText, 
        sender: id,
        recipient:selectedUserId,
        id:Date.now()
        }]))
        setNewMessageText("");
    }

        return(
        <div className="flex h-screen">
            <div className="bg-cyan-300 w-1/3  pt-4 ">
                <Logo/>
                
                 {Object.keys(onlinePeopleExcludingOurUser).map(userId =>(
                    
                    <div onClick={()=>{setSelectedUserId(userId)}} className={"border-b border-gray-100  flex items-center gap-2 cursor-pointer "+(userId===selectedUserId ? 'bg-cyan-50':'')} key={userId}>
                        {userId===selectedUserId &&(
                            <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
                        )}
                        <div className="flex gap-2 py-2 pl-4 items-center">
                        <Avatar username={onlinePeople[userId]} userId={userId}/>
                        <span className="text-gray-600" >{onlinePeople[userId]}</span>
                        </div>
                    
                    </div>

                ))} 
            </div>
            <div className=" flex flex-col bg-cyan-50 w-2/3 p-2">
                <div className="flex-grow">
                    {!selectedUserId &&(
                        <div className="flex h-full items-center justify-center ">
                            
                            <div className="text-gray-400">
                                &larr; Selected a person from the sidebar
                            </div> 
                            </div>
                    )}
                    {selectedUserId &&(
                        <div className="relative h-full">
                             <div className="overflow-y-scroll absolute inset-0">
                            {messagesWithoutDupes.map(message=>(
                                <div className={(message.sender===id ? 'text-right': ' text-left')} key={message._id}>
                                 <div className={" inline-block p-2 my-2 mt-2 rounded-md text-sm"+(message.sender ===id ? ' bg-blue-500 text-white':' bg-white text-gray-500')}>
                                    {id===message.sender ? (
                                        <div >{message.text}
                                             <div className="text-[8px] text-gray-300">send by me</div>  </div>
                                    ): (<div>{message.text}</div>)}
                                    
                                    </div>
                                    </div>

                            ))}
                        </div>
                        </div>
                       
                    )}
                </div>
                {selectedUserId &&(
                    <form className="flex gap-2" onSubmit={sendMessage}>
                    <input type="text" placeholder='Type your message' value={newMessageText}
                    onChange={ev=>setNewMessageText(ev.target.value)}
                    className="bg-white flex-grow border p-2 rounded-xl" />
                    <button type="submit" className="bg-cyan-600 p-2 rounded-xl text-white ">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
</svg>

                    </button>
                </form>
                )}
                
            </div>
        </div>
    )
}