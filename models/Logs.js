const mongoose = require('mongoose');
const mongooseStringQuery = require('mongoose-string-query');
const timestamps = require('mongoose-timestamp');

const LogSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		response: {
			type: String,
			required: true,
			default: '201',
		},
		createdAt: {
			type: Date,
			required: true,
			default: Date.now
		},
	},
);

LogSchema.plugin(mongooseStringQuery);

const Logs = mongoose.model('Logs', LogSchema);
module.exports = Logs;