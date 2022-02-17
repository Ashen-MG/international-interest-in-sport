import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import {locations} from "./locationProvider";


export type MapType = {
        name: string,
        code: string,
        value: number
}

interface MapProps {
    input: MapType[]
}

/** This is a map module to show the interconnection of countries.
 *  Takes a list of MapType elements as a parameter. */
export const MapShow = ({input}: MapProps) => {
    return (<>

        <div>
            <MapContainer style = {{height:"600px", marginTop: "2rem", marginBottom: "2rem"}} center={[51.505, -0.09]} zoom={2} scrollWheelZoom={true} zoomControl={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {input.map((item, i) => (
                    <Marker position={[ locations.get(item.code)![0],locations.get(item.code)![1] ]} key={`mapShow${i}`}>
                        <Popup>
                            <p><b>Country name:</b> {item.name}</p>
                            <p><b>Country code:</b> {item.code}</p>
                            <p><b>Interconnectedness:</b> {item.value}</p>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    </>)
}