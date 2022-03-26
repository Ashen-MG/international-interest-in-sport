import {MapContainer, TileLayer, GeoJSON, Marker, Popup} from 'react-leaflet';
import {Feature, Geometry} from "geojson";
import {locations} from "./locationProvider";
import data from "./countries.geojson.json";
import {useEffect, useState} from "react";
import styles from "./map.module.scss";
import {generateRandomString} from "../../../helpers/random";

export type MapType = {
	name: string,
	code: string,
	value: number
}

interface MapProps {
	input: MapType[]
}

const COLORS = ["#a50f15", "#de2d26", "#fb6a4a", "#fc9272", "#fcbba1", "#ffe5d8"];

/** This is a map module to show the interconnection of countries.
 *  Takes a list of MapType elements as a parameter. */
export const MapShow = ({input}: MapProps) => {

	const [selectedCountry, setSelectedCountry] = useState<MapType>();

	// workaround to update colors and feature values in the map on when `input` changes
	const [geoJsonLayerKey, setGeoJsonLayerKey] = useState<string>();

	useEffect(() => {
		setGeoJsonLayerKey(generateRandomString(16));
	}, [input]);

	const max = input.reduce((a, b) => a.value > b.value ? a : b).value;
	const min = input.reduce((a, b) => a.value < b.value ? a : b).value;
	const d = (max - min) / COLORS.length;

	const onEachFeature = (feature: Feature<Geometry, any>, layer: any) => {
		layer.on({
			mouseover: () => setSelectedCountry(input.find(c => c.code === feature?.properties.ISO_A3)),
			mouseout: () =>  setSelectedCountry(undefined)
		});
	}

	const mapValueToPolygonColor = (value: number) => {
		for (let i = 0; i < COLORS.length; i++) {
			if (value > max - (i + 1) * d) return COLORS[i];
		}
		return COLORS[COLORS.length - 1];
	}

	const style = (feature?: Feature<Geometry, any>) => {
		const featureByCountry = input.find(c => c.code === feature?.properties.ISO_A3);
		const interconnectedness = featureByCountry === undefined ? 0 : featureByCountry.value;
		return ({
			fillColor: mapValueToPolygonColor(interconnectedness),
			weight: 1,
			opacity: 1,
			color: "white",
			dashArray: "2",
			fillOpacity: interconnectedness === 0 ? 0 : .8
		});
	}

	return (
		<div className="position-relative">
			{selectedCountry !== undefined && (
				<ul className={styles.mapCountryInfo}>
					<li><b>{selectedCountry.name}</b></li>
					<li>Interconnectedness: {selectedCountry.value}</li>
				</ul>
			)}
			<MapContainer style = {{height:"600px", marginTop: "2rem", marginBottom: "2rem"}} center={[51.505, -0.09]} zoom={2}
			              scrollWheelZoom={true} zoomControl={false} worldCopyJump={true}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				{data && (
					<GeoJSON key={geoJsonLayerKey} data={data as any} style={style} onEachFeature={onEachFeature} />
				)}
			</MapContainer>
		</div>
	)
}