var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var config = require('./config').config;
var helper = require('./helper');

module.exports = {
	getPostData: function(file) {
		if (!fs.existsSync(file)) {
			return;
		}

		var fileName = path.basename(file,'.md');
		var fileContent = fs.readFileSync(file,'utf8');
		fileContent = fileContent.replace("\r","\n");

		return {
			url: this.parseUrl(fileName),
			title: this.regexContent(fileContent, 'title'),
			author: this.regexContent(fileContent, 'author'),
			date: this.regexContent(fileContent, 'date'),
			description: this.regexContent(fileContent, 'description'),
			shortDesctiption: this.regexContent(fileContent, 'shortDesctiption'),
			keywords: this.regexContent(fileContent, 'keywords'),
			content: this.regexContent(fileContent, 'content'),
			thumbnail: this.regexContent(fileContent, 'thumbnail')
		}
	},

	getPostsData: function(args) {
		args = args || {};

		var defaults = {
			paged: 1,
			limit: config.posts_per_page,
			nopaging: false
		}

		args = _.assignIn(defaults,args);

		var sortDate = function(a,b) {
			aSplit = _.split(a,'-');
			bSplit = _.split(b,'-');

			aDate = aSplit[0] + '-' + aSplit[1] + '-' + aSplit[2];
			bDate = bSplit[0] + '-' + bSplit[1] + '-' + bSplit[2];
			aDate = Date.parse(aDate);
			bDate = Date.parse(bDate);

			return ( aDate > bDate ) ? -1 : ( aDate < bDate ? 1 : 0 );
		}

		var posts = [];
		var files = fs.readdirSync(config.postsPath);
		files.sort(sortDate)
		var offset, limit;

		if ( !args.nopaging ) {
			offset = (args.paged - 1) * args.limit;
			limit = offset + args.limit;
		} else {
			offset = 0;
			limit = files.length;
		}

		for(var i = offset; i < limit; i++) {
			if ( files[i] && '.md' === path.extname(files[i])) {
				var pathToFile = path.resolve(config.postsPath, files[i] );
				var post = this.getPostData(pathToFile);
				posts.push(post);
			}
		}

		return posts;
	},

	totalPost: function() {
		var files = fs.readdirSync(config.postsPath);
		return files.length;
	},

	regexContent: function(content,type) {
		content = content || '';
		type = type || 'content';

		if ( type !== 'content' ) {
			// get header content
			var pattern = '^[ \t\/*#@]*@'+ type +': (.*)$';
			var regex = new RegExp(pattern, 'mi');
			if (regex.test(content)) {
				var contentParsed = content.match(regex);
				return contentParsed[1];
			} else {
				return '';
			}
		} else {
			// get main content
			return content.replace(/\/\*\*[^>]+\*\//, '');
		}
	},

	parseUrl: function(fileName) {
		var filePath = slicePath = _.split(fileName,'-');
		var y = filePath[0];
		var m = filePath[1];
		var d = filePath[2];

		delete slicePath[0];
		delete slicePath[1];
		delete slicePath[2];

		slicePath = _.remove(slicePath,undefined);

		slicePath = _.join(slicePath, '-');

		var urlPath = _.join([y,m,d,slicePath], '/');

		return helper.home(urlPath);
	}
}