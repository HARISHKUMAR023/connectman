import { useState } from "react"
import Button from "./Button"
import AddServerModal from "./AddServerModal"

export default function Header(){

const [open,setOpen]=useState(false)

return(

<>

<div className="flex justify-between p-4 border-b border-border">

<h2 className="text-xl">

Servers

</h2>


<div className="flex gap-3">

<Button type="secondary">
Import
</Button>

<Button type="secondary">
Export
</Button>


<Button
onClick={()=>setOpen(true)}
>

+ Add Server

</Button>


</div>

</div>


<AddServerModal
isOpen={open}
onClose={()=>setOpen(false)}
/>


</>

)

}