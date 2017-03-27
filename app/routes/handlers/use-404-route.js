'use strict';
module.exports = function use404RouteFactory(){

    function use404Route(expressApp){
		
		expressApp.use((req, res, next) => {

			// 404: not found
			res.status(404);

			// Browsers get a nice HTML page
			if (req.accepts('html'))
				//return res.render('404', { url: req.url });		// Pug template (formerly Jade)
				return res.redirect('/404.html');					// Static page

			// JSON is expected (header "Accept: application/json")
			if(req.accepts('json')) return res.send({ error: 'resource not found' });

			// Default plain text answer (header "Accept: text/plain")
			res.type('txt').send('Not found');
		});
	}
	
	return use404Route;
}