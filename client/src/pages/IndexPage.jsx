import axios from "axios";
import { useState,useEffect } from "react";
import { Link } from "react-router-dom";
import Image from "../Image";


export default function IndexPage(){
    const [places,setPlaces]=useState([])
    useEffect(() => {
      axios.get('/places').then(response =>{
        setPlaces(response.data)
      })
    }, [])
    
    return(
        <div className='mt-14 grid gap-x-6 gap-y-8 grid-cols-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6'>
           {places.length > 0 && places.map(place => (
            <Link className="curson-pointer" to={'/place/'+place._id} key={place._id}>
                <div className="br-gray-500 rounded-2xl flex">
                    {place.photos?.[0] &&(
                        <Image className="rounded-2xl object-cover aspect-square" src = {place.photos?.[0]} alt=''/>
                    )} 
                </div>
                <h2 className="font-bold">{place.address}</h2>
                <h3 className="text-sm leading-4 text-gray-500"> {place.title}</h3>
                <div className="mt-1">
                    <span className="font-bold"> ${place.price}</span> per night
                </div>
            </Link>
           ))} 
        </div>
    );
}