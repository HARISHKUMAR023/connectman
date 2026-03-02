type Props = {
  children: React.ReactNode
  type?: "primary" | "secondary" | "danger"
  onClick?: () => void
}

export default function Button({
  children,
  type="primary",
  onClick
}:Props){

let style=""

if(type==="primary")
 style="bg-primary-500 hover:bg-primary-600"

if(type==="secondary")
 style="bg-secondary-500 hover:bg-secondary-600"

if(type==="danger")
 style="bg-danger-500 hover:bg-danger-700"


return(

<button
onClick={onClick}
className={`px-4 py-2 rounded text-white ${style}`}
>

{children}

</button>

)

}