module.exports = {
	name: 'API',
	env: process.env.NODE_ENV || 'development',
	port: process.env.PORT || 3000,
	base_url: process.env.BASE_URL || 'http://localhost:3000',
	db: {
		uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/api',
		geocache: 'mongodb://127.0.0.1:27017/geocache',
	},
	geocode_options: {
		provider: 'google',
		httpAdapter: 'https',
		apiKey: 'AIzaSyBRVAaTAP_5lLT0ZuAc7aF1tV_Ag_vNLOg',
		formatter: null
	},
	Jwt_Secret : 'shhhhhhared-secret'
};