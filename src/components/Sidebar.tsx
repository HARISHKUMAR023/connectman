export default function Sidebar(){

return(

<div className="w-64 bg-sidebar h-full p-5">

<h1 className="text-xl font-bold mb-6">

ConnectMan

</h1>


<div className="space-y-3 text-text-secondary">

<div className="hover:text-white cursor-pointer">
Production
</div>

<div className="hover:text-white cursor-pointer">
Staging
</div>

<div className="hover:text-white cursor-pointer">
Development
</div>

<div className="hover:text-white cursor-pointer">
Kubernetes
</div>

</div>

</div>

)

}