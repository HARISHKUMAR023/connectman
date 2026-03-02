import { useEffect,useState } from "react"
import Card from "./Card"
import Button from "./Button"

export default function ServerList(){

const [servers,setServers]=useState([])


useEffect(()=>{

load()

},[])


const load=async()=>{

const data=await window.api.loadServers()

setServers(data.servers)

}


return(

<div className="p-4 space-y-4">

{servers.map((s:any,i)=>(
<Card key={i}>

<div className="flex justify-between">

<div>

<div className="font-bold">
{s.name}
</div>

<div className="text-text-secondary">
{s.ip}
</div>

<div className="text-text-muted">
{s.user}
</div>

</div>


<div className="flex gap-2">

<Button>
Connect
</Button>

</div>


</div>

</Card>

))}

</div>

)

}