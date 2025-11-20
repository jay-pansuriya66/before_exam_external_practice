import { useEffect,useState } from "react";
import axios from "axios";

function App() 
{
  const [data,setData]=useState(null);

  useEffect(()=>{
    fetch('http://localhost:3000/api/home',{credentials:'include'})
    .then(res=>res.json())
    .then(data=>{setData(data);}) 
    },[]);

    if(!data) return <h1>Loading...</h1>;

    return (
      <div>
          <h1>Welcome, {data.name} from {data.city}!</h1>
      <p>{data.email}</p>
      <p>{data.dob}</p>
      </div>
    
    );
}

export default App;