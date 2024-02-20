import Chat from "./Chat";
import RegisterAndLoginForm from "./RegisterAndLoginForm";
import { UserContext} from "./UserContext"
import { useContext } from "react"

export default function Routes() {
    const {username}=useContext(UserContext)
    
    if(username){
        return <Chat/>
    }





    return(
        <RegisterAndLoginForm/>
    )
}