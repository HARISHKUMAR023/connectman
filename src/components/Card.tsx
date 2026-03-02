type Props={
children:React.ReactNode
}

export default function Card({children}:Props){

return(

<div className="bg-card border border-border rounded p-4">

{children}

</div>

)

}