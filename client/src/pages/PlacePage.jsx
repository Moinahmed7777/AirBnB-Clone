import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import AddressLink from "../AddressLink";
import BookingWidget from "../BookingWidget";
import PlaceGallery from "../PlaceGallery";
import useMediaQuery from "../hooks/useMediaQuery";

export default function PlacePage(){
    const {id} = useParams();
    const [place,setPlace] = useState(null)

    const isAboveLargeScreens = useMediaQuery("(min-width: 1470px)");
    const isAboveMegaScreens = useMediaQuery("(min-width: 1790px)");

    useEffect(() => {
        if (!id){
            return;
        }
        axios.get(`/places/${id}`).then(response =>{
            setPlace(response.data)
        });
    }, [id]);
    if (!place) return "";

    
    return (
        <div className="">
        { isAboveMegaScreens && isAboveLargeScreens
            ? (
            <div className="mt-4 bg-gray-100 mx-auto px-140 pt-8">
            <h1 className="text-3xl">{place.title}</h1>
            <AddressLink>{place.address}</AddressLink>
            <PlaceGallery place={place}/>
            
            <div className="mt-8 mb-8 grid gap-8 grid-cols-1 md:grid-cols-[2fr_1fr]">
                <div>
                    <div className="my-4">
                        <h2 className="font-semibold text-2xl">Description</h2>
                        {place.description}
                    </div>
                    Check-in: {place.checkIn} <br /> 
                    Check-out: {place.checkOut} <br />
                    Max number of guests : {place.maxGuests} <br />
                </div>
                <div>
                    < BookingWidget place={place} />
                </div>                
            </div>
            <div className="bg-white -mx-8 px-8 py-8 border-t">
                <div>
                    <h2 className="font-semibold text-2xl">Extra info</h2>
                </div>
                <div className="mb-4 mt-2 text-sm text-gray-700 leading-5">
                    {place.extraInfo}
                </div> 
            </div>
                
        </div>
            )
        : isAboveLargeScreens 
            ? (
            <div className="mt-4 bg-gray-100 mx-auto px-80 pt-8">
            <h1 className="text-3xl">{place.title}</h1>
            <AddressLink>{place.address}</AddressLink>
            <PlaceGallery place={place}/>
            
            <div className="mt-8 mb-8 grid gap-8 grid-cols-1 lg:grid-cols-[2fr_1fr]">
                <div>
                    <div className="my-4">
                        <h2 className="font-semibold text-2xl">Description</h2>
                        {place.description}
                    </div>
                    Check-in: {place.checkIn} <br /> 
                    Check-out: {place.checkOut} <br />
                    Max number of guests : {place.maxGuests} <br />
                </div>
                <div>
                    < BookingWidget place={place} />
                </div>                
            </div>
            <div className="bg-white -mx-8 px-8 py-8 border-t">
                <div>
                    <h2 className="font-semibold text-2xl">Extra info</h2>
                </div>
                <div className="mb-4 mt-2 text-sm text-gray-700 leading-5">
                    {place.extraInfo}
                </div> 
            </div>
                
        </div>
            )
            :(
            <div className="mt-4 bg-gray-100 mx-auto px-40 pt-8">
            <h1 className="text-3xl">{place.title}</h1>
            <AddressLink>{place.address}</AddressLink>
            <PlaceGallery place={place}/>
            
            <div className="mt-8 mb-8 grid gap-8 grid-cols-1 md:grid-cols-[2fr_1fr]">
                <div>
                    <div className="my-4">
                        <h2 className="font-semibold text-2xl">Description</h2>
                        {place.description}
                    </div>
                    Check-in: {place.checkIn} <br /> 
                    Check-out: {place.checkOut} <br />
                    Max number of guests : {place.maxGuests} <br />
                </div>
                <div>
                    < BookingWidget place={place} />
                </div>                
            </div>
            <div className="bg-white -mx-8 px-8 py-8 border-t">
                <div>
                    <h2 className="font-semibold text-2xl">Extra info</h2>
                </div>
                <div className="mb-4 mt-2 text-sm text-gray-700 leading-5">
                    {place.extraInfo}
                </div> 
            </div>
                
        </div>
            )}
        
    </div>
    );
}