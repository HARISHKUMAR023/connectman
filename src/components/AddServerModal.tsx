import { useState } from "react"
import Button from "./Button"

type Props={
 isOpen:boolean
 onClose:()=>void
}

export default function AddServerModal({isOpen,onClose}:Props){

const [name,setName]=useState("")
const [ip,setIp]=useState("")
const [user,setUser]=useState("")
const [port,setPort]=useState("22")
const [collection,setCollection]=useState("Production")


if(!isOpen) return null

const saveServer=async()=>{

const server={

name,
ip,
user,
port,
collection

}

await window.api.saveServer(server)

onClose()

}
return(

<div className="fixed inset-0 bg-black/50 flex justify-center items-center">

<div className="bg-card p-6 rounded w-96 border border-border">


<h2 className="text-xl mb-4">

Add Server

</h2>



<div className="space-y-3">


<input
placeholder="Server Name"
className="w-full p-2 bg-background border border-border rounded"
value={name}
onChange={(e)=>setName(e.target.value)}
/>


<input
placeholder="IP Address"
className="w-full p-2 bg-background border border-border rounded"
value={ip}
onChange={(e)=>setIp(e.target.value)}
/>


<input
placeholder="Username"
className="w-full p-2 bg-background border border-border rounded"
value={user}
onChange={(e)=>setUser(e.target.value)}
/>


<input
placeholder="Port"
className="w-full p-2 bg-background border border-border rounded"
value={port}
onChange={(e)=>setPort(e.target.value)}
/>


<select
className="w-full p-2 bg-background border border-border rounded"
value={collection}
onChange={(e)=>setCollection(e.target.value)}
>

<option>Production</option>
<option>Staging</option>
<option>Development</option>

</select>


<input type="file"
className="w-full text-sm"
/>


</div>



<div className="flex justify-end gap-3 mt-5">


<Button
type="secondary"
onClick={onClose}
>

Cancel

</Button>


<Button onClick={saveServer}>

Save Server

</Button>


</div>



</div>

</div>

)

}