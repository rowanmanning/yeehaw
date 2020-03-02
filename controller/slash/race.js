'use strict';

module.exports = function initRaceController(app) {
	const {router} = app;

	router.post('/slash/race', async (request, response) => {
		response.json({
			todo: true
		});
	});

};
