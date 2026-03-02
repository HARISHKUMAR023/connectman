import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import ServerList from "../components/ServerList"
import Terminal from "../components/Terminal"

export default function Dashboard(){

return(

<div className="flex h-screen bg-background text-text-primary">


<Sidebar/>


<div className="flex-1 flex flex-col">

<Header/>

<div className="flex-1 overflow-auto">

<ServerList/>

</div>

<Terminal/>

</div>


</div>

)

}