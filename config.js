module.exports={
	dataSource:'http://data.githubarchive.org/2015-01-01-15.json.gz',	
	mongodb:{
		host:"127.0.0.1",
		db:"newgitEvents",
		protocol:"mongodb://"
	},
	getDbString:function() {
		return this.mongodb.protocol+this.mongodb.host+'/'+this.mongodb.db
	}
}