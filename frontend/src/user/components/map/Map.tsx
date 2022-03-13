import {MapContainer, TileLayer, GeoJSON, Marker, Popup} from 'react-leaflet'
import {locations} from "./locationProvider";
import data from "./countries.geojson.json";

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

	const max = input.reduce((a, b) => a.value > b.value ? a : b).value;
	const min = input.reduce((a, b) => a.value < b.value ? a : b).value;

	const onEachFeature = (feature: any, layer: any) => {
		layer.on({
			mouseover: () => console.log("over"),  // TODO: toolbar with interconnectedness data
			mouseout: () => console.log("out")
		});
	}

	const mapValueToPolygonColor = (value: number) => {
		const r = (max - min) / 5;
		return value > max - r
				 ? "#a50f15"
				 : value > max - 2 * r
				 ? "#de2d26"
				 : value > max - 3 * r
				 ? "#fb6a4a"
				 : value > max - 4 * r
				 ? "#fc9272"
				 : value > max - 5 * r
				 ? "#fcbba1"
				 : "#fff1ea";
	}

	const style = (feature: any ) => {
		const m = input.find(m => m.code === feature.properties.ISO_A3);
		const v = m === undefined ? 0 : m.value;
		return ({
			fillColor: mapValueToPolygonColor(v),
			weight: 1,
			opacity: 1,
			color: 'white',
			dashArray: '2',
			fillOpacity: .8
		});
	}

	return (
		<div>
			<MapContainer style = {{height:"600px", marginTop: "2rem", marginBottom: "2rem"}} center={[51.505, -0.09]} zoom={2}
			              scrollWheelZoom={true} zoomControl={false} worldCopyJump={true}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				{data && (
					<GeoJSON data={data as any} style={style} onEachFeature={onEachFeature} />
				)}
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
	)
}