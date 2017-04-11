# HopeResearch GitHub DataSet Challange

Hope Research Code Challange
   
### What is this repository for? ###

* This Project dowloads data from github server, uncompresses the data and exposes the endpoints mentioned below.

### ****** There Is some unnecessary and unused code in repo, need to be cleaned up ******


### Requirements ###

 * Node
 * Express
 * MongoDB
 
### How do I get set up? ###

* Clone Repo.
* Run "npm install" 
* Run "npm run import" (To import Data from the Datasource Provided and save that in database)
* Run "npm start" and server will start on port 3000
* You can change database name and data source in config file.

### If there Are Issuse Check config file for database connection
      
### EndPoints
  *   /events/{repoid}/{event}
      * Method GET
      * Params you need to Pass are RepositoryId and eventType.
      * Return records filtered by the repository id and event type 
  *   /repo/all?offset=vaule&limit=value
      * Method GET
      * Pass offset and limit in query (offset and limit are optional, by default they are set in backend) 
      * Return list of all repositories with their top contributor (actor with most events).
  *   /actor/{login}
      * Method GET 
      * Params you need to Pass is login name.
      * Return actor details and list of contributed repositories by actor login
  *   /repo/highest/{login}
      * Method GET 
      * Parameters you need to Pass is login name.
      * Return repository with the highest number of events from an actor(by login).
  *   /events/{login}
      * Method DELETE 
      * Params you need to Pass is login name.
      * Deletes History of actors events (by login).   


### Who do I talk to? ###

* mail me on mirrayees859@gmail.com

