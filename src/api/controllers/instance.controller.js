const {WhatsAppInstance} = require("../class/instance");
const fs = require("fs");
const path = require("path");
const config = require("../../config/config");
const {Session} = require("../class/session");


exports.list = async (req, res) => {
	if (req.query.active) {
		let instance = [];
		const db = mongoClient.db("whatsapp-api");
		const result = await db.listCollections().toArray();
		result.forEach((collection) => {
			instance.push(collection.name);
		});

		return res.json({
			message: "All active instance",
			data: instance,
		});
	}

	let instance = Object.keys(WhatsAppInstances).map(async (key) =>
		WhatsAppInstances[key].getInstanceDetail(key)
	);
	let data = await Promise.all(instance);

	return res.json({
		total: instance.length,
		message: "All instance listed",
		data: data,
	});
};

exports.init = async (req, res) => {
	const key = req.query.key;
	const webhook = !req.query.webhook ? false : req.query.webhook;
	const webhookUrl = !req.query.webhookUrl ? null : req.query.webhookUrl;
	const appUrl = config.appUrl || req.protocol + "://" + req.headers.host;
	const instance = new WhatsAppInstance(key, webhook, webhookUrl);
	const data = await instance.init();
	WhatsAppInstances[data.key] = instance;
	res.json({
		error: false,
		message: "QR Code created, navigate to URL to scan code",
		key: data.key,
		webhook: {
			enabled: webhook,
			webhookUrl: webhookUrl,
		},
		qrcode: {
			url: appUrl + "/instance/qr?key=" + data.key,
		},
		browser: config.browser,
	});
};

exports.qr = async (req, res) => {
	try {
		const qrcode = await WhatsAppInstances[req.query.key]?.instance.qr;
		res.render("qrcode", {
			qrcode: qrcode,
		});
	} catch {
		res.json({
			qrcode: "",
		});
	}
};

exports.qrbase64 = async (req, res) => {
	try {
		const qrcode = await WhatsAppInstances[req.query.key]?.instance.qr;
		res.json({
			error: false,
			message: "QR Base64 fetched successfully",
			qrcode: qrcode,
		});
	} catch {
		res.json({
			qrcode: "",
		});
	}
};

exports.info = async (req, res) => {
	const instance = WhatsAppInstances[req.query.key];
	let data;
	try {
		data = await instance.getInstanceDetail(req.query.key);
	} catch (error) {
		data = {};
	}
	return res.json({
		error: false,
		message: "Instance fetched successfully",
		instance_data: data,
	});
};

exports.restore = async (req, res, next) => {
	try {
		const session = new Session();
		let restoredSessions = await session.restoreSessions();
		return res.json({
			error: false,
			message: "All instances restored",
			data: restoredSessions,
		});
	} catch (error) {
		next(error);
	}
};

exports.logout = async (req, res) => {
	let errormsg;
	try {
		await WhatsAppInstances[req.query.key].instance?.sock?.logout();
	} catch (error) {
		errormsg = error;
	}
	return res.json({
		error: false,
		message: "logout successfull",
		errormsg: errormsg ? errormsg : null,
	});
};

exports.delete = async (req, res) => {
	let errormsg;
	try {
		await WhatsAppInstances[req.query.key].deleteInstance(req.query.key);
		delete WhatsAppInstances[req.query.key];
	} catch (error) {
		errormsg = error;
	}
	return res.json({
		error: false,
		message: "Instance deleted successfully",
		data: errormsg ? errormsg : null,
	});
};



//thiago new start function

exports.start = async (req, res) => {
	console.log("starting qr code new session");
	try {
		const key = req.query.key;
		const webhook = !req.query.webhook ? false : req.query.webhook;
		const webhookUrl = !req.query.webhookUrl ? null : req.query.webhookUrl;
		const appUrl = config.appUrl || req.protocol + "://" + req.headers.host;
		const instance = new WhatsAppInstance(key, webhook, webhookUrl);
		const data = await instance.init();

		// Generate and store the QR code as base64
		const qrCodeBase64 = await instance.instance.qrCodeBase64();

		WhatsAppInstances[data.key] = instance;

		res.json({
			error: false,
			message: "Initializing successfully",
			key: data.key,
			webhook: {
				enabled: webhook,
				webhookUrl: webhookUrl,
			},
			qrcode: {
				url: appUrl + "/instance/qr?key=" + data.key,
				base64: qrCodeBase64,
			},
			browser: config.browser,
		});
	} catch (error) {
		res.status(500).json({
			error: true,
			message: "Failed to initialize the instance",
		});
	}
};
