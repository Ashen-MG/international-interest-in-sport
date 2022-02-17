const ENV = process.env.NODE_ENV.toLowerCase() as "production" | "development";

const config = {
	API_URL: {
		development: "http://localhost:3001/api",
		production: "https://kempelen.dai.fmph.uniba.sk:8765/api"
	}[ENV]
}

export default config;